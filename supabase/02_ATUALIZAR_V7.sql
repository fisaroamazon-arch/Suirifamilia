-- Suiri Família 7.0. Migração transacional e não destrutiva.
-- Revisão 17/11/2026: políticas aceitam IDs UUID ou texto, sem converter dados.
-- Faça backup. Execute primeiro em um projeto de homologação.
-- Não substitui a revisão das políticas de acesso das tabelas já existentes.
begin;

-- Recusa esquema incompatível antes de qualquer alteração.
do $$
declare spec record; col text;
begin
 for spec in select * from (values
 ('familias',array['id','nome_familia','cpf_adm_principal','orcamento_mercado_mensal']),
 ('membros',array['id','familia_id','nome','email','cpf','papel','parentesco','nacionalidade','genero','sexo','possui_cartao','eh_kids','permissoes','saldo_carteira','xp_total','ofensiva_atual','ultimo_checkin_data']),
 ('transacoes',array['id','familia_id','membro_id','tipo','valor','descricao','categoria','data_transacao','escopo','eh_privado']),
 ('itens_mercado',array['id','familia_id','quantidade','valor_unitario','valor_total','segmento_categoria','comprado','no_carrinho']),
 ('agenda_financeira',array['id','familia_id','status','pago','valor','descricao','tipo_evento','escopo','membro_id','criado_por']),
 ('missoes',array['id','familia_id','titulo','status','escopo','atribuido_a','criado_por','destinatario_kids','xp_recompensa','recorrencia_tipo','horario_limite','horario_reinicio','concluido_em','concluido_por','proxima_execucao','concluidos_por_array','falhados_por_array','subitens']),
 ('metas_compartilhadas',array['id','familia_id','titulo','valor_acumulado']),
 ('beneficios_loja',array['id','familia_id','titulo','custo','para_kids'])
 ) as requirements(table_name,columns_required)
 loop
  if to_regclass('public.'||spec.table_name) is null then raise exception 'V7: falta a tabela %. A migração foi cancelada; adapte o esquema usando o diagnóstico.',spec.table_name;end if;
  foreach col in array spec.columns_required loop
   if not exists(select 1 from information_schema.columns c where c.table_schema='public' and c.table_name=spec.table_name and c.column_name=col) then raise exception 'V7: falta a coluna %.%. Nenhuma alteração foi aplicada.',spec.table_name,col;end if;
  end loop;
 end loop;
 for spec in select * from(values('familias'),('membros'),('transacoes'),('itens_mercado'),('agenda_financeira'),('missoes'),('metas_compartilhadas'))x(table_name)loop
  if not exists(select 1 from information_schema.columns c where c.table_schema='public'and c.table_name=spec.table_name and c.column_name='id'and c.data_type='uuid')then raise exception 'V7: %.id precisa ser UUID para esta migração. O esquema legado precisa de adaptação; nenhuma alteração foi aplicada.',spec.table_name;end if;
 end loop;
end $$;

alter table public.missoes add column if not exists suiri_ocorrencia integer not null default 0;
alter table public.itens_mercado add column if not exists suiri_finalizada boolean not null default false;
alter table public.itens_mercado add column if not exists suiri_compra_id uuid;
alter table public.transacoes add column if not exists suiri_compra_id uuid;

create table if not exists public.suiri_operacoes_v7 (
 operation_id uuid primary key,
 auth_user_id uuid not null references auth.users(id) on delete cascade,
 familia_id uuid not null,
 membro_id uuid not null,
 kind text not null,
 effect_key text not null unique,
 result jsonb not null,
 criado_em timestamptz not null default now()
);
alter table public.suiri_operacoes_v7 enable row level security;
revoke all on public.suiri_operacoes_v7 from anon,authenticated;
grant select on public.suiri_operacoes_v7 to authenticated;
drop policy if exists suiri_operacoes_proprias_v7 on public.suiri_operacoes_v7;
create policy suiri_operacoes_proprias_v7 on public.suiri_operacoes_v7 for select to authenticated using(auth_user_id=auth.uid());

-- Helper privado à execução das funções; não é chamado pelo navegador.
create or replace function public.suiri_transacao_interna_v7(p jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare r public.transacoes%rowtype; result_id uuid;
begin
 r:=jsonb_populate_record(null::public.transacoes,p);
 if r.valor is null or r.valor<=0 then raise exception 'Valor inválido';end if;
 insert into public.transacoes(familia_id,membro_id,tipo,valor,descricao,categoria,data_transacao,escopo,eh_privado,suiri_compra_id)
 values(r.familia_id,r.membro_id,r.tipo,round(r.valor::numeric,2),r.descricao,r.categoria,r.data_transacao,r.escopo,r.eh_privado,r.suiri_compra_id) returning id into result_id;
 return result_id;
end $$;
revoke all on function public.suiri_transacao_interna_v7(jsonb) from public,anon,authenticated;

create or replace function public.suiri_criar_familia_v7(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); fam uuid; cpf text; nome text; lar text; genero text;
begin
 if uid is null then raise exception 'Autenticação necessária';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text),hashtext('suiri:provision:v7'));
 select familia_id into fam from public.membros where id=uid;
 if found then return jsonb_build_object('ok',true,'familia_id',fam);end if;
 nome:=btrim(p_payload->>'nome');lar:=btrim(p_payload->>'nome_familia');cpf:=regexp_replace(coalesce(p_payload->>'cpf',''),'\D','','g');genero:=lower(coalesce(p_payload->>'genero',''));
 if length(nome)<2 or length(lar)<2 or length(nome)>200 or length(lar)>200 or length(cpf)<>11 then raise exception 'Confira nome, lar e CPF';end if;
 if genero not in ('','feminino','masculino') then raise exception 'Preferência de espaço inválida';end if;
 -- Um CPF de outra família nunca é usado para associar automaticamente um novo usuário.
 if exists(select 1 from public.familias where cpf_adm_principal=cpf) then raise exception 'Este CPF já está vinculado a um lar. Recupere seu acesso; nenhum vínculo foi alterado.';end if;
 insert into public.familias(nome_familia,cpf_adm_principal,orcamento_mercado_mensal)values(lar,cpf,1200) returning id into fam;
 insert into public.membros(id,familia_id,nome,email,cpf,papel,parentesco,nacionalidade,genero,sexo,possui_cartao,eh_kids,permissoes,saldo_carteira,xp_total,ofensiva_atual)
 values(uid,fam,nome,auth.jwt()->>'email',cpf,'adm','Responsável',coalesce(p_payload->>'nacionalidade','BR'),genero,genero,true,false,'{"mercado":true,"gastos":true,"missoes":true,"financeiro_adm":true}',0,0,0);
 return jsonb_build_object('ok',true,'familia_id',fam);
end $$;
revoke all on function public.suiri_criar_familia_v7(jsonb) from public,anon;
grant execute on function public.suiri_criar_familia_v7(jsonb) to authenticated;

create or replace function public.suiri_operacao_v7(p_operation_id uuid,p_kind text,p_member_id uuid,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); owner public.membros%rowtype; actor public.membros%rowtype;
 bill public.agenda_financeira%rowtype; item public.itens_mercado%rowtype; task public.missoes%rowtype; updated_task public.missoes%rowtype;
 reward public.beneficios_loja%rowtype; safe public.metas_compartilhadas%rowtype; child public.membros%rowtype;
 previous jsonb; result jsonb; effect text; total numeric:=0; amount numeric; count_items int:=0; ids uuid[]; tid uuid; purchase uuid;
 segments jsonb:='{}'; segment text; data_local date:=(now() at time zone 'America/Sao_Paulo')::date;
 payload jsonb; done jsonb; failed jsonb; subitems jsonb; delta integer:=0; old_delta integer:=0; action text; collective boolean; repeated boolean:=false;
 recurrence_days integer; next_run timestamptz; last_seen date; rate_q integer; rate_value numeric; blocks integer; conversions integer:=0;
begin
 if uid is null or p_operation_id is null then raise exception 'Autenticação e identificador de operação necessários';end if;
 select * into owner from public.membros where id=uid;
 if not found then raise exception 'Perfil autenticado não encontrado';end if;
 select * into actor from public.membros where id=p_member_id and familia_id=owner.familia_id;
 if not found then raise exception 'Perfil fora do seu lar';end if;
 if actor.id<>uid and not ((actor.eh_kids or actor.papel='dependente') and not(owner.eh_kids or owner.papel='dependente')) then raise exception 'Você não pode agir por este adulto';end if;
 perform pg_advisory_xact_lock(hashtext(owner.familia_id::text),hashtext('suiri:v7:finance'));
 select log.result into previous from public.suiri_operacoes_v7 log where operation_id=p_operation_id and auth_user_id=uid and kind=p_kind and membro_id=actor.id;
 if found then return previous||'{"repeated":true}'::jsonb;end if;
 if exists(select 1 from public.suiri_operacoes_v7 where operation_id=p_operation_id)then raise exception 'Identificador já utilizado por outra operação';end if;
 effect:='operation:'||p_operation_id::text;
 if p_kind in ('checkout','bill','contribution') and (actor.id<>uid or actor.eh_kids or actor.papel='dependente' or coalesce((to_jsonb(actor)->'permissoes'->>'gastos')::boolean,true)=false) then raise exception 'Operação financeira não permitida a este perfil';end if;

 if p_kind='checkout' then
  if coalesce((to_jsonb(actor)->'permissoes'->>'mercado')::boolean,true)=false then raise exception 'Mercado não permitido';end if;
  select array_agg(distinct x::uuid) into ids from jsonb_array_elements_text(p_payload->'ids')x;
  if ids is null or cardinality(ids)=0 or cardinality(ids)>1000 then raise exception 'Lista de compra inválida';end if;
  effect:='checkout:'||owner.familia_id::text||':'||array_to_string(array(select unnest(ids) order by 1),',');
  select log.result into previous from public.suiri_operacoes_v7 log where effect_key=effect;
  if found then return previous||'{"repeated":true}'::jsonb;end if;
  purchase:=gen_random_uuid();
  for item in select * from public.itens_mercado where id=any(ids) and familia_id=owner.familia_id for update loop
   if item.suiri_finalizada or not(coalesce(item.comprado,false)or coalesce(item.no_carrinho,false)) then raise exception 'Produto já finalizado ou fora do carrinho. Atualize a lista.';end if;
   if item.quantidade is null or item.quantidade<=0 or item.valor_unitario is null or item.valor_unitario<0 then raise exception 'Produto com quantidade ou preço inválido';end if;
   amount:=round(item.quantidade::numeric*item.valor_unitario::numeric,2);total:=total+amount;count_items:=count_items+1;
   segment:=coalesce(item.segmento_categoria,'Mercearia');segments:=jsonb_set(segments,array[segment],to_jsonb(coalesce((segments->>segment)::numeric,0)+amount),true);
  end loop;
  if count_items<>cardinality(ids) or total<=0 then raise exception 'Compra não confirmada: itens ausentes ou total inválido';end if;
  tid:=public.suiri_transacao_interna_v7(jsonb_build_object('familia_id',owner.familia_id,'membro_id',actor.id,'tipo','saida','valor',total,'descricao','Compra no Supermercado','categoria','Supermercado','data_transacao',data_local,'escopo','casa','eh_privado',false,'suiri_compra_id',purchase));
  update public.itens_mercado set suiri_finalizada=true,suiri_compra_id=purchase,no_carrinho=false where id=any(ids) and familia_id=owner.familia_id;
  result:=jsonb_build_object('ok',true,'total',total,'purchase_id',purchase,'transaction_id',tid,'segments',segments);

 elsif p_kind='bill' then
  select * into bill from public.agenda_financeira where id=(p_payload->>'id')::uuid and familia_id=owner.familia_id for update;
  if not found then raise exception 'Conta não encontrada';end if;
  if bill.escopo='pessoal' and coalesce(bill.membro_id,bill.criado_por) is distinct from actor.id then raise exception 'Conta pessoal de outro membro';end if;
  effect:='bill:'||bill.id::text;
  if bill.status='liquidado' or bill.pago then return jsonb_build_object('ok',true,'repeated',true);end if;
  tid:=public.suiri_transacao_interna_v7(jsonb_build_object('familia_id',owner.familia_id,'membro_id',actor.id,'tipo',case when bill.tipo_evento='conta_pagar' then 'saida' else 'entrada' end,'valor',bill.valor,'descricao',bill.descricao,'categoria',coalesce(to_jsonb(bill)->>'categoria','Geral'),'data_transacao',data_local,'escopo',coalesce(bill.escopo,'casa'),'eh_privado',bill.escopo='pessoal'));
  update public.agenda_financeira set status='liquidado',pago=true where id=bill.id;
  result:=jsonb_build_object('ok',true,'transaction_id',tid);

 elsif p_kind='contribution' then
  amount:=round((p_payload->>'amount')::numeric,2);if amount is null or amount<=0 then raise exception 'Valor inválido';end if;
  if p_payload->>'destination'='pessoal' then
   tid:=public.suiri_transacao_interna_v7(jsonb_build_object('familia_id',owner.familia_id,'membro_id',actor.id,'tipo','saida','valor',amount,'descricao','Poupança Pessoal Guardada','categoria','Reserva','data_transacao',data_local,'escopo','pessoal','eh_privado',true));
  else
   select * into safe from public.metas_compartilhadas where id=(p_payload->>'destination')::uuid and familia_id=owner.familia_id for update;
   if not found then raise exception 'Cofre não encontrado';end if;
   tid:=public.suiri_transacao_interna_v7(jsonb_build_object('familia_id',owner.familia_id,'membro_id',actor.id,'tipo','saida','valor',amount,'descricao','Aporte Cofre: '||safe.titulo,'categoria','Reserva','data_transacao',data_local,'escopo','casa','eh_privado',false));
   update public.metas_compartilhadas set valor_acumulado=coalesce(valor_acumulado,0)+amount where id=safe.id;
  end if;
  result:=jsonb_build_object('ok',true,'transaction_id',tid);

 elsif p_kind='allowance' then
  if actor.id<>uid or owner.papel not in ('adm','admin_familia') then raise exception 'Somente administradores podem converter XP';end if;
  rate_q:=(p_payload->'rate'->>'qtd')::int;rate_value:=round((p_payload->'rate'->>'valor')::numeric,2);
  if rate_q is null or rate_q<=0 or rate_value is null or rate_value<=0 or rate_value>10000 then raise exception 'Taxa inválida';end if;
  for child in select * from public.membros where familia_id=owner.familia_id and (eh_kids or papel='dependente') and xp_total>=rate_q order by id for update loop
   blocks:=floor(child.xp_total/rate_q);amount:=blocks*rate_value;
   tid:=public.suiri_transacao_interna_v7(jsonb_build_object('familia_id',owner.familia_id,'membro_id',child.id,'tipo','entrada','valor',amount,'descricao','Conversão de '||(blocks*rate_q)::text||' XP em mesada','categoria','Salário','data_transacao',data_local,'escopo','pessoal','eh_privado',true));
   update public.membros set xp_total=xp_total-blocks*rate_q where id=child.id;conversions:=conversions+1;
  end loop;
  result:=jsonb_build_object('ok',true,'count',conversions);

 elsif p_kind='reward' then
  select * into reward from public.beneficios_loja where id::text=p_payload->>'id' and familia_id=owner.familia_id;
  if not found then
   select x.title,x.cost,x.kids into reward.titulo,reward.custo,reward.para_kids from (values
   ('game_time','1h de Videogame / Tablet',200,true),('escolher_desenho','Escolher o Filme ou Desenho',250,true),('sobremesa_chef','Sobremesa Especial / Sorvete',300,true),('dormir_tarde','30 Minutos Mais Tarde na Cama',350,true),('passeio_parque','Passeio Divertido ao Ar Livre',500,true),
   ('folga_louca','Folga da Louça do Dia',250,false),('massagem_ombros','Massagem Relaxante nos Ombros',300,false),('escolha_cardapio','Escolher o Cardápio do Jantar',350,false),('dia_livre_casa','Passe Livre de Tarefas Domésticas',600,false)
   )x(id,title,cost,kids)where x.id=p_payload->>'id';
   if not found then raise exception 'Recompensa não encontrada';end if;
  end if;
  if (actor.eh_kids or actor.papel='dependente') and not reward.para_kids then raise exception 'Recompensa de adulto';end if;
  select * into actor from public.membros where id=actor.id for update;
  if reward.custo is null or reward.custo<0 or actor.xp_total<reward.custo then raise exception 'XP insuficiente ou custo inválido';end if;
  update public.membros set xp_total=xp_total-reward.custo where id=actor.id returning * into actor;
  result:=jsonb_build_object('ok',true,'xp',actor.xp_total,'title',reward.titulo);

 elsif p_kind='mission' then
  if coalesce((to_jsonb(actor)->'permissoes'->>'missoes')::boolean,true)=false then raise exception 'Missões não permitidas';end if;
  select * into task from public.missoes where id=(p_payload->>'id')::uuid and familia_id=owner.familia_id for update;
  if not found then raise exception 'Missão não encontrada';end if;
  if task.atribuido_a is not null and task.atribuido_a<>actor.id then raise exception 'Missão atribuída a outra pessoa';end if;
  if task.escopo='pessoal' and coalesce(task.atribuido_a,task.criado_por)<>actor.id then raise exception 'Missão pessoal';end if;
  if (actor.eh_kids or actor.papel='dependente') and task.atribuido_a is null and coalesce(task.destinatario_kids,'')<>'todos_kids' then raise exception 'Esta missão não foi atribuída à criança';end if;
  select * into actor from public.membros where id=actor.id for update;
  done:=coalesce(to_jsonb(task)->'concluidos_por_array','[]');failed:=coalesce(to_jsonb(task)->'falhados_por_array','[]');
  if done='null'::jsonb then done:='[]';end if;if failed='null'::jsonb then failed:='[]';end if;
  collective:=task.atribuido_a is null and (task.escopo='casa' or task.destinatario_kids='todos_kids');
  action:=p_payload->>'action';
  payload:=to_jsonb(task);
  if action='reset' then
   if task.proxima_execucao is null or task.proxima_execucao>now() or task.recorrencia_tipo='nenhuma' then raise exception 'Missão ainda não pode reiniciar';end if;
   payload:=payload||jsonb_build_object('status','pendente','suiri_ocorrencia',task.suiri_ocorrencia+1,'concluido_em',null,'concluido_por',null,'proxima_execucao',null,'concluidos_por_array','[]'::jsonb,'falhados_por_array','[]'::jsonb);
  elsif action='reopen' then
   payload:=payload||jsonb_build_object('status','pendente','concluido_em',null,'concluido_por',null,'concluidos_por_array',done-actor.id::text,'falhados_por_array',failed-actor.id::text);
  elsif action in ('complete','fail') then
   effect:='mission:'||task.id::text||':'||actor.id::text||':'||task.suiri_ocorrencia::text||':'||action;
   select log.result into previous from public.suiri_operacoes_v7 log where effect_key=effect;
   if found then
    if action='complete' and (task.status='pendente' or (collective and not(done?actor.id::text))) then
     if collective then done:=(done-actor.id::text)||jsonb_build_array(actor.id::text);end if;
     subitems:=coalesce(to_jsonb(task)->'subitens','[]');
     if jsonb_typeof(subitems)='array'and jsonb_array_length(subitems)>0 then select jsonb_agg(x||jsonb_build_object('concluido',true))into subitems from jsonb_array_elements(subitems)x;end if;
     updated_task:=jsonb_populate_record(task,jsonb_build_object('status',case when collective then task.status else 'concluida' end,'concluido_em',now(),'concluido_por',actor.id,'concluidos_por_array',done,'subitens',subitems));
     update public.missoes set status=updated_task.status,concluido_em=updated_task.concluido_em,concluido_por=updated_task.concluido_por,concluidos_por_array=updated_task.concluidos_por_array,subitens=updated_task.subitens where id=task.id returning * into task;
    end if;
    return previous||jsonb_build_object('xp',actor.xp_total,'mission',to_jsonb(task),'repeated',true);
   end if;
   if (collective and (done?actor.id::text or failed?actor.id::text))or(not collective and task.status in ('concluida','falhou'))then return jsonb_build_object('ok',true,'xp',actor.xp_total,'mission',to_jsonb(task),'repeated',true);end if;
   delta:=case when action='complete' then coalesce(task.xp_recompensa,20) else -floor(coalesce(task.xp_recompensa,20)/2.0)::int end;
   if action='complete' and task.horario_limite is not null and (now() at time zone 'America/Sao_Paulo')::time>task.horario_limite::time then delta:=greatest(5,floor(delta/2.0)::int);end if;
   delta:=greatest(delta,-coalesce(actor.xp_total,0));
   recurrence_days:=case task.recorrencia_tipo when 'diaria_24h' then 1 when 'semanal_7d' then 7 when 'quinzenal_15d' then 15 when 'mensal_30d' then 30 else null end;
   next_run:=case when recurrence_days is not null then ((data_local+recurrence_days)+coalesce(task.horario_reinicio::time,'04:00'::time)) at time zone 'America/Sao_Paulo' else null end;
   if collective then
    if action='complete' then done:=(done-actor.id::text)||jsonb_build_array(actor.id::text);else failed:=(failed-actor.id::text)||jsonb_build_array(actor.id::text);end if;
   end if;
   payload:=payload||jsonb_build_object('status',case when collective then task.status when action='complete' then 'concluida' else 'falhou' end,'concluido_em',now(),'concluido_por',actor.id,'proxima_execucao',coalesce(task.proxima_execucao,next_run),'concluidos_por_array',done,'falhados_por_array',failed);
   last_seen:=actor.ultimo_checkin_data::date;
   update public.membros set xp_total=coalesce(xp_total,0)+delta,
    ofensiva_atual=case when action<>'complete' or last_seen=data_local then coalesce(ofensiva_atual,0) when last_seen=data_local-1 then coalesce(ofensiva_atual,0)+1 else 1 end,
    ultimo_checkin_data=case when action='complete' then data_local else ultimo_checkin_data end
   where id=actor.id returning * into actor;
  else raise exception 'Ação de missão inválida';end if;
  subitems:=coalesce(payload->'subitens','[]');
  if jsonb_typeof(subitems)='array' and jsonb_array_length(subitems)>0 then
   select jsonb_agg(x||jsonb_build_object('concluido',action='complete'))into subitems from jsonb_array_elements(subitems)x;
   payload:=payload||jsonb_build_object('subitens',subitems);
  end if;
  updated_task:=jsonb_populate_record(null::public.missoes,payload);
  update public.missoes set status=updated_task.status,concluido_em=updated_task.concluido_em,concluido_por=updated_task.concluido_por,proxima_execucao=updated_task.proxima_execucao,concluidos_por_array=updated_task.concluidos_por_array,falhados_por_array=updated_task.falhados_por_array,subitens=updated_task.subitens,suiri_ocorrencia=updated_task.suiri_ocorrencia where id=task.id returning * into task;
  result:=jsonb_build_object('ok',true,'xp',actor.xp_total,'delta',delta,'streak',actor.ofensiva_atual,'mission',to_jsonb(task));
 else raise exception 'Operação não reconhecida';end if;
 insert into public.suiri_operacoes_v7(operation_id,auth_user_id,familia_id,membro_id,kind,effect_key,result)values(p_operation_id,uid,owner.familia_id,actor.id,p_kind,effect,result);
 return result;
end $$;
revoke all on function public.suiri_operacao_v7(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.suiri_operacao_v7(uuid,text,uuid,jsonb) to authenticated;
-- A consulta financeira retorna apenas os campos necessários e mascara os
-- detalhes privados no servidor, antes de chegarem ao navegador.
create or replace function public.suiri_extrato_v7(p_inicio date default null,p_fim date default null,p_antes date default null,p_membro uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare owner public.membros%rowtype; data jsonb;
begin
 select * into owner from public.membros where id=auth.uid();
 if not found or coalesce(owner.eh_kids,false) or owner.papel='dependente' then raise exception 'Extrato disponível apenas ao perfil adulto autenticado';end if;
 if p_membro is not null and not exists(select 1 from public.membros where id=p_membro and familia_id=owner.familia_id)then raise exception 'Membro fora do lar';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',t.id,'familia_id',t.familia_id,'membro_id',t.membro_id,'tipo',t.tipo,'valor',t.valor,
  'data_transacao',t.data_transacao,'criado_em',to_jsonb(t)->>'criado_em',
  'escopo',t.escopo,'eh_privado',t.eh_privado,
  'descricao',case when (t.escopo='pessoal' or t.eh_privado) and t.membro_id is distinct from owner.id then case when t.tipo='entrada' then 'Entrada Privada' else 'Gasto Privado' end else t.descricao end,
  'categoria',case when (t.escopo='pessoal' or t.eh_privado) and t.membro_id is distinct from owner.id then 'Privativo' else t.categoria end
 )order by t.data_transacao,t.id),'[]')into data
 from public.transacoes t where t.familia_id=owner.familia_id
 and(p_inicio is null or t.data_transacao>=p_inicio)and(p_fim is null or t.data_transacao<=p_fim)and(p_antes is null or t.data_transacao<p_antes)and(p_membro is null or t.membro_id=p_membro);
 return data;
end $$;
revoke all on function public.suiri_extrato_v7(date,date,date,uuid) from public,anon;
grant execute on function public.suiri_extrato_v7(date,date,date,uuid) to authenticated;

-- Helpers sem argumentos: somente o vínculo do solicitante autenticado.
create or replace function public.suiri_familia_atual_v7()returns uuid
language sql stable security definer set search_path='' as $$ select familia_id from public.membros where id=auth.uid() $$;
revoke all on function public.suiri_familia_atual_v7()from public,anon;
grant execute on function public.suiri_familia_atual_v7()to authenticated;

-- Políticas RESTRITIVAS: só estreitam políticas permissivas já existentes.
-- Não criam acesso que as políticas atuais negam. Não desativam RLS.
do $$
declare n text; col text; col_type text; predicate text;
begin
 foreach n in array array['familias','membros','transacoes','itens_mercado','agenda_financeira','missoes','metas_compartilhadas','beneficios_loja','recados_lar','planos_anuais','compromissos_familia']loop
  if to_regclass('public.'||n)is not null then
   col:=case when n='familias' then 'id' else 'familia_id' end;
   if exists(select 1 from information_schema.columns where table_schema='public' and table_name=n and column_name=col)then
    select udt_name into col_type from information_schema.columns where table_schema='public' and table_name=n and column_name=col;
    if col_type='uuid' then
     predicate:=format('%I=public.suiri_familia_atual_v7()',col);
    elsif col_type in('text','varchar','bpchar') then
     predicate:=format('%I=public.suiri_familia_atual_v7()::text',col);
    else
     raise exception 'V7: %.% tem tipo %; esperado UUID ou texto. Nenhum tipo de coluna foi alterado.',n,col,col_type;
    end if;
    execute format('alter table public.%I enable row level security',n);
    execute format('drop policy if exists suiri_limite_familia_v7 on public.%I',n);
    execute format('create policy suiri_limite_familia_v7 on public.%I as restrictive for all to authenticated using (%s) with check (%s)',n,predicate,predicate);
   end if;
  end if;
 end loop;
 foreach n in array array['saude_ciclos','saude_sintomas','saude_diario','espaco_fem_radar','espaco_fem_checkins','espaco_masc_radar','espaco_masc_listas']loop
  col:=case when n like 'espaco_masc_%%' then 'membro_id' else 'usuario_id' end;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name=n and column_name=col)then
   select udt_name into col_type from information_schema.columns where table_schema='public' and table_name=n and column_name=col;
   if col_type='uuid' then
    predicate:=format('%I=auth.uid()',col);
   elsif col_type in('text','varchar','bpchar') then
    predicate:=format('%I=auth.uid()::text',col);
   else
    raise exception 'V7: %.% tem tipo %; esperado UUID ou texto. Nenhum tipo de coluna foi alterado.',n,col,col_type;
   end if;
   execute format('alter table public.%I enable row level security',n);
   execute format('drop policy if exists suiri_dono_pessoal_v7 on public.%I',n);
   execute format('create policy suiri_dono_pessoal_v7 on public.%I as restrictive for all to authenticated using (%s) with check (%s)',n,predicate,predicate);
  end if;
 end loop;
end $$;
drop policy if exists suiri_detalhes_privados_v7 on public.transacoes;
create policy suiri_detalhes_privados_v7 on public.transacoes as restrictive for select to authenticated
 using(membro_id=auth.uid()or(coalesce(escopo,'casa')<>'pessoal' and not coalesce(eh_privado,false)));
-- A tabela alternativa, se existir, recebe a mesma barreira de leitura.
do $$begin
 if to_regclass('public.transacoes_financeiras')is not null then
  execute 'alter table public.transacoes_financeiras enable row level security';
  execute 'drop policy if exists suiri_detalhes_privados_v7 on public.transacoes_financeiras';
  execute 'create policy suiri_detalhes_privados_v7 on public.transacoes_financeiras as restrictive for select to authenticated using(familia_id=public.suiri_familia_atual_v7()and(membro_id=auth.uid()or(coalesce(escopo,''casa'')<>''pessoal'' and not coalesce(eh_privado,false))))';
 end if;
end $$;
create table if not exists public.suiri_ia_uso_v7(id bigint generated always as identity primary key,usuario_id uuid not null references auth.users(id)on delete cascade,criado_em timestamptz not null default now());
alter table public.suiri_ia_uso_v7 enable row level security;
revoke all on public.suiri_ia_uso_v7 from public,anon,authenticated;
create index if not exists suiri_ia_uso_usuario_data_v7 on public.suiri_ia_uso_v7(usuario_id,criado_em);
create or replace function public.suiri_reservar_cota_ia_v7()returns boolean
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); n int;
begin
 if uid is null or not exists(select 1 from public.membros where id=uid and not coalesce(eh_kids,false)and papel<>'dependente')then raise exception 'Perfil não autorizado';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text),hashtext('suiri:ia:quota'));
 select count(*)into n from public.suiri_ia_uso_v7 where usuario_id=uid and criado_em>now()-interval '1 hour';
 if n>=20 then raise exception 'Limite de 20 leituras por hora atingido';end if;
 insert into public.suiri_ia_uso_v7(usuario_id)values(uid);return true;
end $$;
revoke all on function public.suiri_reservar_cota_ia_v7()from public,anon;
grant execute on function public.suiri_reservar_cota_ia_v7()to authenticated;
-- A área familiar não deve ter leitura ou gravação anônima, mesmo se uma
-- política permissiva antiga tiver sido deixada aberta.
do $$declare n text;begin
 foreach n in array array['familias','membros','transacoes','transacoes_financeiras','itens_mercado','agenda_financeira','missoes','metas_compartilhadas','beneficios_loja','recados_lar','planos_anuais','compromissos_familia','saude_ciclos','saude_sintomas','saude_diario','espaco_fem_radar','espaco_fem_checkins','espaco_masc_radar','espaco_masc_listas']loop
  if exists(select 1 from pg_class c join pg_namespace ns on ns.oid=c.relnamespace where ns.nspname='public'and c.relname=n and c.relkind='r')then
   execute format('alter table public.%I enable row level security',n);
   execute format('drop policy if exists suiri_sem_anon_v7 on public.%I',n);
   execute format('create policy suiri_sem_anon_v7 on public.%I as restrictive for all to anon using(false) with check(false)',n);
  end if;
 end loop;
end $$;
notify pgrst,'reload schema';
commit;
