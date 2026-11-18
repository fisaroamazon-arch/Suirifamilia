-- Suiri Família 7.1: substituição da transferência antiga.
-- Executar como proprietário das tabelas no SQL Editor do projeto correto.
-- Não migra dinheiro entre tabelas e não altera saldos durante a instalação.
-- No site V7.1, a RPC usada é transferir_saldo_familiar_v71, com 5 parâmetros.
begin;

do $$
declare spec record; col text;
begin
 for spec in select * from (values
  ('membros',array['id','familia_id','nome','papel','eh_kids','permissoes','saldo_carteira']),
  ('transacoes',array['id','familia_id','membro_id','tipo','valor','descricao','categoria','data_transacao','escopo','eh_privado'])
 ) as requirements(tabela,colunas) loop
  if to_regclass('public.'||spec.tabela) is null then
   raise exception 'V7.1: tabela % ausente. Instalação cancelada.',spec.tabela;
  end if;
  foreach col in array spec.colunas loop
   if not exists(select 1 from information_schema.columns c where c.table_schema='public' and c.table_name=spec.tabela and c.column_name=col) then
    raise exception 'V7.1: coluna %.% ausente. Instalação cancelada.',spec.tabela,col;
   end if;
  end loop;
 end loop;
end $$;

create table if not exists public.suiri_transferencias_v71 (
 operacao_id uuid primary key,
 auth_user_id uuid not null,
 familia_id uuid not null,
 remetente_id uuid not null,
 destinatario_id uuid not null,
 valor numeric not null check(valor>0 and valor::text not in ('NaN','Infinity','-Infinity') and valor=round(valor,2)),
 resultado jsonb not null,
 criado_em timestamptz not null default now()
);
alter table public.suiri_transferencias_v71 enable row level security;
revoke all on public.suiri_transferencias_v71 from public,anon,authenticated;
grant select on public.suiri_transferencias_v71 to authenticated;
drop policy if exists suiri_transferencias_proprias_v71 on public.suiri_transferencias_v71;
create policy suiri_transferencias_proprias_v71 on public.suiri_transferencias_v71
 for select to authenticated using(auth_user_id=auth.uid());

create index if not exists suiri_transacoes_carteira_v71
 on public.transacoes(familia_id,membro_id);

-- Faz também lançamentos diretos em transacoes respeitarem o mesmo bloqueio
-- usado pela transferência e pelas operações financeiras da V7.
-- Não substitui permissões/RLS nem impede despesas que admitam saldo negativo.
create or replace function public.suiri_bloquear_extrato_v71()
returns trigger language plpgsql security definer set search_path='' as $$
declare familias uuid[]; familia uuid;
begin
 if tg_op='INSERT' then familias:=array[new.familia_id];
 elsif tg_op='DELETE' then familias:=array[old.familia_id];
 else familias:=array[old.familia_id,new.familia_id];end if;
 for familia in select distinct x from unnest(familias) as f(x) where x is not null order by x loop
  perform pg_advisory_xact_lock(hashtext(familia::text),hashtext('suiri:v7:finance'));
 end loop;
 if tg_op='DELETE' then return old;end if;
 return new;
end $$;
revoke all on function public.suiri_bloquear_extrato_v71() from public,anon,authenticated;
drop trigger if exists suiri_bloquear_extrato_v71 on public.transacoes;
create trigger suiri_bloquear_extrato_v71 before insert or update or delete
 on public.transacoes for each row execute function public.suiri_bloquear_extrato_v71();

create or replace function public.transferir_saldo_familiar_v71(
 p_operacao_id uuid,p_familia_id uuid,p_remetente_id uuid,
 p_destinatario_id uuid,p_valor numeric
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); remetente public.membros%rowtype;
 destinatario public.membros%rowtype; anterior public.suiri_transferencias_v71%rowtype;
 saldo numeric; saldo_destinatario numeric;
 saida_id uuid:=gen_random_uuid(); entrada_id uuid:=gen_random_uuid(); resultado jsonb;
 hoje date:=(now() at time zone 'America/Sao_Paulo')::date;
begin
 if uid is null or p_remetente_id is distinct from uid then
  return jsonb_build_object('sucesso',false,'codigo','NAO_AUTORIZADO','mensagem','Entre com a conta do remetente para transferir.');
 end if;
 if p_operacao_id is null or p_familia_id is null or p_destinatario_id is null then
  return jsonb_build_object('sucesso',false,'codigo','DADOS_INVALIDOS','mensagem','Informe a operação, a família e o destinatário.');
 end if;
 if p_valor is null or p_valor::text in ('NaN','Infinity','-Infinity') then
  return jsonb_build_object('sucesso',false,'codigo','VALOR_INVALIDO','mensagem','Informe um valor monetário válido.');
 end if;
 if p_valor<=0 or p_valor<>round(p_valor,2) then
  return jsonb_build_object('sucesso',false,'codigo','VALOR_INVALIDO','mensagem','Use um valor maior que zero, com até duas casas decimais.');
 end if;
 if p_remetente_id=p_destinatario_id then
  return jsonb_build_object('sucesso',false,'codigo','MESMO_MEMBRO','mensagem','Não é possível transferir para si próprio.');
 end if;
 -- As leituras após aguardar o bloqueio precisam de uma visão atualizada.
 if current_setting('transaction_isolation')<>'read committed' then
  raise exception 'Transferências exigem isolamento READ COMMITTED.' using errcode='25000';
 end if;
 if not exists(select 1 from public.membros where id=uid and familia_id=p_familia_id) then
  return jsonb_build_object('sucesso',false,'codigo','NAO_AUTORIZADO','mensagem','O remetente não pertence à família informada.');
 end if;
 perform pg_advisory_xact_lock(hashtext(p_operacao_id::text),hashtext('suiri:v71:transfer-id'));
 perform pg_advisory_xact_lock(hashtext(p_familia_id::text),hashtext('suiri:v7:finance'));
 -- Ordem estável entre remetente e destinatário.
 perform m.id from public.membros m
 where m.familia_id=p_familia_id and m.id in(p_remetente_id,p_destinatario_id)
 order by m.id for update;
 select * into remetente from public.membros where id=uid and familia_id=p_familia_id;
 if not found then
  return jsonb_build_object('sucesso',false,'codigo','NAO_AUTORIZADO','mensagem','O remetente não pertence à família informada.');
 end if;
 select * into destinatario from public.membros where id=p_destinatario_id and familia_id=p_familia_id;
 if not found then
  return jsonb_build_object('sucesso',false,'codigo','DESTINATARIO_INVALIDO','mensagem','Destinatário não encontrado nesta família.');
 end if;
 -- Uma resposta já confirmada pode ser consultada mesmo se a permissão de
 -- fazer novas transferências tiver sido revogada depois da operação.
 select * into anterior from public.suiri_transferencias_v71 where operacao_id=p_operacao_id;
 if found then
  if anterior.auth_user_id=uid and anterior.familia_id=p_familia_id
   and anterior.remetente_id=p_remetente_id and anterior.destinatario_id=p_destinatario_id
   and anterior.valor=p_valor then
   return anterior.resultado||jsonb_build_object('repetida',true);
  end if;
  return jsonb_build_object('sucesso',false,'codigo','OPERACAO_DIVERGENTE','mensagem','Este identificador já pertence a outra transferência.');
 end if;
 if coalesce(remetente.eh_kids,false) or remetente.papel='dependente'
  or coalesce((remetente.permissoes->>'gastos')::boolean,true)=false then
  return jsonb_build_object('sucesso',false,'codigo','SEM_PERMISSAO','mensagem','Este perfil não tem permissão para transferir.');
 end if;
 if exists(select 1 from public.transacoes t
  where t.familia_id=p_familia_id and t.membro_id in(p_remetente_id,p_destinatario_id)
  and(t.tipo is null or t.tipo not in('entrada','saida') or t.valor is null
   or t.valor::text in('NaN','Infinity','-Infinity') or t.valor<0 or t.valor<>round(t.valor,2))) then
  return jsonb_build_object('sucesso',false,'codigo','EXTRATO_INCONSISTENTE','mensagem','Há lançamentos inválidos no extrato. Revise-os antes de transferir.');
 end if;
 -- Fonte única: a mesma tabela lida pela carteira da V7. Sem fallback por zero
 -- e sem aproveitar um cache maior que o saldo registrado no extrato.
 select coalesce(sum(case t.tipo when 'entrada' then t.valor else -t.valor end),0)
 into saldo from public.transacoes t where t.familia_id=p_familia_id and t.membro_id=p_remetente_id;
 if saldo<p_valor then
  return jsonb_build_object('sucesso',false,'codigo','SALDO_INSUFICIENTE','saldo_disponivel',saldo,
   'mensagem','Saldo insuficiente. Consulte o saldo disponível na carteira.');
 end if;
 insert into public.transacoes(id,familia_id,membro_id,tipo,escopo,eh_privado,descricao,categoria,valor,data_transacao)
 values(saida_id,p_familia_id,p_remetente_id,'saida','pessoal',true,
  'Transferência para '||coalesce(destinatario.nome,'familiar'),'Transferência',p_valor,hoje);
 insert into public.transacoes(id,familia_id,membro_id,tipo,escopo,eh_privado,descricao,categoria,valor,data_transacao)
 values(entrada_id,p_familia_id,p_destinatario_id,'entrada','pessoal',true,
  'Transferência de '||coalesce(remetente.nome,'familiar'),'Transferência',p_valor,hoje);
 -- Recalcula os caches a partir do extrato já gravado. Evita novo débito/crédito
 -- se um trigger preexistente também atualizar saldo_carteira.
 select coalesce(sum(case t.tipo when 'entrada' then t.valor else -t.valor end),0)
 into saldo from public.transacoes t where t.familia_id=p_familia_id and t.membro_id=p_remetente_id;
 select coalesce(sum(case t.tipo when 'entrada' then t.valor else -t.valor end),0)
 into saldo_destinatario from public.transacoes t where t.familia_id=p_familia_id and t.membro_id=p_destinatario_id;
 update public.membros set saldo_carteira=saldo where id=p_remetente_id and familia_id=p_familia_id;
 update public.membros set saldo_carteira=saldo_destinatario where id=p_destinatario_id and familia_id=p_familia_id;
 resultado:=jsonb_build_object('sucesso',true,'operacao_id',p_operacao_id,'valor',p_valor,
  'saldo_remetente',saldo,'transacao_saida_id',saida_id,'transacao_entrada_id',entrada_id,
  'mensagem','Transferência confirmada.');
 insert into public.suiri_transferencias_v71(operacao_id,auth_user_id,familia_id,remetente_id,destinatario_id,valor,resultado)
 values(p_operacao_id,uid,p_familia_id,p_remetente_id,p_destinatario_id,p_valor,resultado);
 return resultado;
 -- Erros inesperados não são silenciados: os lançamentos e caches são revertidos.
end $$;
revoke all on function public.transferir_saldo_familiar_v71(uuid,uuid,uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.transferir_saldo_familiar_v71(uuid,uuid,uuid,uuid,numeric) to authenticated;

-- A interface antiga não fornece um identificador para impedir duplicidade.
-- Mantém o nome e os parâmetros, mas recusa a operação até atualizar o site.
create or replace function public.transferir_saldo_familiar(
 p_familia_id uuid,p_remetente_id uuid,p_destinatario_id uuid,p_valor numeric
) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 return jsonb_build_object('sucesso',false,'codigo','ATUALIZE_O_SITE',
  'mensagem','Atualize o site para a versão 7.1 para realizar transferências.');
end $$;
revoke all on function public.transferir_saldo_familiar(uuid,uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.transferir_saldo_familiar(uuid,uuid,uuid,numeric) to authenticated;
notify pgrst,'reload schema';
commit;
