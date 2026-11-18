-- Suiri Família V7.16.3 — conclusão parcial das missões Kids.
-- A migração é atômica e mantém o restante da função instalada.
begin;

alter table public.missoes
  add column if not exists parcial_por_array jsonb not null default '[]'::jsonb;

do $migracao$
declare
  f oid := to_regprocedure('public.suiri_operacao_v7(uuid,text,uuid,jsonb)');
  corpo text;
  atual text;
  novo text;
  marcador text := $marcador$elsif p_kind='mission' then$marcador$;
  encerramento text := $encerramento$else raise exception 'Operação não reconhecida';end if;$encerramento$;
  inicio int;
  fim int;
  assinatura text;
begin
  select prosrc into corpo from pg_catalog.pg_proc where oid=f;
  inicio := strpos(corpo,marcador)+length(marcador);
  fim := strpos(corpo,encerramento);
  if strpos(corpo,marcador) is null or strpos(corpo,marcador)=0 or fim<=inicio then
    raise exception 'A função de missões instalada não corresponde à versão esperada.';
  end if;
  atual:=substring(corpo from inicio for fim-inicio);
  assinatura:=md5(regexp_replace(atual,'[[:space:]]+','','g'));
  if assinatura='bb9e5e8a7c5838def23ed02b891442e2' then return;end if;
  if assinatura not in ('84034138a9487278f3d90cb122ec288a','25306f128087a45e8d9763f5eb81627a','a93a5fed5514078a641a5d51f391c8ec') then
    raise exception 'O bloco de missões foi alterado. Nenhuma mudança foi aplicada.';
  end if;
  novo:=left(corpo,inicio-1)||$missoes$
  declare
   kids_collective boolean;
   parciais jsonb;
  begin
  if coalesce((to_jsonb(actor)->'permissoes'->>'missoes')::boolean,true)=false then raise exception 'Missões não permitidas';end if;
  select * into task from public.missoes where id=(p_payload->>'id')::uuid and familia_id=owner.familia_id for update;
  if not found then raise exception 'Missão não encontrada';end if;
  kids_collective:=(task.atribuido_a is null or lower(btrim(task.atribuido_a::text))='todos_kids')
    and (lower(btrim(coalesce(task.escopo,''))) in ('kids','todos_kids')
         or coalesce(task.destinatario_kids,'')='todos_kids'
         or coalesce(lower(btrim(task.atribuido_a::text))='todos_kids',false));
  if lower(btrim(coalesce(task.escopo,''))) in ('pessoal','individual') then
   kids_collective:=false;
   if coalesce(task.criado_por::text,task.atribuido_a::text) is distinct from actor.id::text or actor.id<>uid then raise exception 'Missão pessoal';end if;
  else
   if not kids_collective and task.atribuido_a is not null and task.atribuido_a::text<>actor.id::text then raise exception 'Missão atribuída a outra pessoa';end if;
   if (coalesce(actor.eh_kids,false) or actor.papel='dependente') and task.atribuido_a is null and not kids_collective then raise exception 'Esta missão não foi atribuída à criança';end if;
   if not (coalesce(actor.eh_kids,false) or actor.papel='dependente') and (kids_collective or lower(btrim(coalesce(task.escopo,''))) in ('kids','todos_kids') or task.destinatario_kids='todos_kids') then raise exception 'Missão do Espaço Kids';end if;
  end if;
  select * into actor from public.membros where id=actor.id for update;
  done:=coalesce(to_jsonb(task)->'concluidos_por_array','[]');failed:=coalesce(to_jsonb(task)->'falhados_por_array','[]');
  if done='null'::jsonb then done:='[]';end if;if failed='null'::jsonb then failed:='[]';end if;
  parciais:=coalesce(nullif(to_jsonb(task)->'parcial_por_array','null'::jsonb),'[]'::jsonb);
  collective:=kids_collective or (task.atribuido_a is null and lower(btrim(coalesce(task.escopo,''))) in ('','casa','todos','todos_adultos','familia'));
  action:=p_payload->>'action';
  if action='partial' and not (coalesce(actor.eh_kids,false) or coalesce(actor.papel,'')='dependente') then
   raise exception 'A conclusão parcial está disponível somente no Espaço Kids';
  end if;
  payload:=to_jsonb(task);
  if action='reset' then
   if task.proxima_execucao is null or task.proxima_execucao>now() or task.recorrencia_tipo='nenhuma' then raise exception 'Missão ainda não pode reiniciar';end if;
   payload:=payload||jsonb_build_object('status','pendente','suiri_ocorrencia',task.suiri_ocorrencia+1,'concluido_em',null,'concluido_por',null,'proxima_execucao',null,'concluidos_por_array','[]'::jsonb,'falhados_por_array','[]'::jsonb,'parcial_por_array','[]'::jsonb);
  elsif action='reopen' then
   payload:=payload||jsonb_build_object('status','pendente','concluido_em',null,'concluido_por',null,'concluidos_por_array',done-actor.id::text,'falhados_por_array',failed-actor.id::text,'parcial_por_array',parciais-actor.id::text);
  elsif action in ('complete','partial','fail') then
   effect:='mission:'||task.id::text||':'||actor.id::text||':'||task.suiri_ocorrencia::text||':'||
    case when action='partial' then 'complete' else action end;
   select log.result into previous from public.suiri_operacoes_v7 log where effect_key=effect;
   if found then
    -- A primeira conclusão define o resultado e o XP desta ocorrência.
    if action in ('complete','partial') then
     action:=case when previous->>'resultado_missao'='partial' then 'partial' else 'complete' end;
    end if;
    if (collective and not(done?actor.id::text or failed?actor.id::text)) or (not collective and task.status='pendente') then
     if collective and action in ('complete','partial') then done:=done||jsonb_build_array(actor.id::text);end if;
     if collective and action='fail' then failed:=failed||jsonb_build_array(actor.id::text);end if;
     if action='partial' then parciais:=(parciais-actor.id::text)||jsonb_build_array(actor.id::text);end if;
     subitems:=coalesce(to_jsonb(task)->'subitens','[]');
     if action<>'partial' and jsonb_typeof(subitems)='array' and jsonb_array_length(subitems)>0 then
      select jsonb_agg(x||jsonb_build_object('concluido',action='complete')) into subitems from jsonb_array_elements(subitems)x;
     end if;
     updated_task:=jsonb_populate_record(task,jsonb_build_object(
      'status',case when collective then task.status when action in ('complete','partial') then 'concluida' else 'falhou' end,
      'concluido_em',now(),'concluido_por',actor.id,'concluidos_por_array',done,'falhados_por_array',failed,
      'parcial_por_array',parciais,'subitens',subitems));
     update public.missoes set status=updated_task.status,concluido_em=updated_task.concluido_em,concluido_por=updated_task.concluido_por,
      concluidos_por_array=updated_task.concluidos_por_array,falhados_por_array=updated_task.falhados_por_array,
      parcial_por_array=updated_task.parcial_por_array,subitens=updated_task.subitens
     where id=task.id returning * into task;
    end if;
    return previous||jsonb_build_object('xp',actor.xp_total,'mission',to_jsonb(task),'repeated',true);
   end if;
   if (collective and (done?actor.id::text or failed?actor.id::text))or(not collective and task.status in ('concluida','falhou'))then return jsonb_build_object('ok',true,'xp',actor.xp_total,'mission',to_jsonb(task),'repeated',true);end if;
   delta:=case when action in ('complete','partial') then coalesce(task.xp_recompensa,20) else -floor(coalesce(task.xp_recompensa,20)/2.0)::int end;
   if action in ('complete','partial') and task.horario_limite is not null and (now() at time zone 'America/Sao_Paulo')::time>task.horario_limite::time then delta:=greatest(5,floor(delta/2.0)::int);end if;
   if action='partial' then delta:=floor(delta/2.0)::int;end if;
   delta:=greatest(delta,-coalesce(actor.xp_total,0));
   recurrence_days:=case task.recorrencia_tipo when 'diaria_24h' then 1 when 'semanal_7d' then 7 when 'quinzenal_15d' then 15 when 'mensal_30d' then 30 else null end;
   next_run:=case when recurrence_days is not null then ((data_local+recurrence_days)+coalesce(task.horario_reinicio::time,'04:00'::time)) at time zone 'America/Sao_Paulo' else null end;
   if collective then
    if action in ('complete','partial') then done:=(done-actor.id::text)||jsonb_build_array(actor.id::text);else failed:=(failed-actor.id::text)||jsonb_build_array(actor.id::text);end if;
   end if;
   if action='partial' then parciais:=(parciais-actor.id::text)||jsonb_build_array(actor.id::text);end if;
   payload:=payload||jsonb_build_object('status',case when collective then task.status when action in ('complete','partial') then 'concluida' else 'falhou' end,'concluido_em',now(),'concluido_por',actor.id,'proxima_execucao',coalesce(task.proxima_execucao,next_run),'concluidos_por_array',done,'falhados_por_array',failed,'parcial_por_array',parciais);
   last_seen:=actor.ultimo_checkin_data::date;
   update public.membros set xp_total=coalesce(xp_total,0)+delta,
    ofensiva_atual=case when action<>'complete' or last_seen=data_local then coalesce(ofensiva_atual,0) when last_seen=data_local-1 then coalesce(ofensiva_atual,0)+1 else 1 end,
    ultimo_checkin_data=case when action='complete' then data_local else ultimo_checkin_data end
   where id=actor.id returning * into actor;
  else raise exception 'Ação de missão inválida';end if;
  subitems:=coalesce(payload->'subitens','[]');
  if action<>'partial' and jsonb_typeof(subitems)='array' and jsonb_array_length(subitems)>0 then
   select jsonb_agg(x||jsonb_build_object('concluido',action='complete'))into subitems from jsonb_array_elements(subitems)x;
   payload:=payload||jsonb_build_object('subitens',subitems);
  end if;
  updated_task:=jsonb_populate_record(null::public.missoes,payload);
  update public.missoes set status=updated_task.status,concluido_em=updated_task.concluido_em,concluido_por=updated_task.concluido_por,proxima_execucao=updated_task.proxima_execucao,concluidos_por_array=updated_task.concluidos_por_array,falhados_por_array=updated_task.falhados_por_array,parcial_por_array=updated_task.parcial_por_array,subitens=updated_task.subitens,suiri_ocorrencia=updated_task.suiri_ocorrencia where id=task.id returning * into task;
  result:=jsonb_build_object('ok',true,'xp',actor.xp_total,'delta',delta,'streak',actor.ofensiva_atual,'resultado_missao',action,'mission',to_jsonb(task));
  end;
$missoes$||substring(corpo from fim);
  execute replace(pg_get_functiondef(f),corpo,novo);
end
$migracao$;

select 'Missões parciais Kids ativadas.' as resultado;
commit;
