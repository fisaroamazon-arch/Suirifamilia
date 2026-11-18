-- Somente leitura. Útil se a transferência for recusada por erro de trigger.
-- Não inclui registros pessoais das tabelas.
select c.relname as tabela,t.tgname as gatilho,
 pg_get_triggerdef(t.oid,true) as definicao_gatilho,
 pg_get_functiondef(t.tgfoid) as definicao_funcao
from pg_trigger t
join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in('membros','transacoes')
 and not t.tgisinternal
order by c.relname,t.tgname;
