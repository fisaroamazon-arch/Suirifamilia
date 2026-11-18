-- Somente leitura. Execute antes da migração e guarde o resultado.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema='public'
and table_name in ('familias','membros','missoes','transacoes','transacoes_financeiras','itens_mercado','agenda_financeira','metas_compartilhadas','beneficios_loja')
order by table_name,ordinal_position;
select tablename, policyname, roles, cmd, qual, with_check from pg_policies where schemaname='public' order by tablename,policyname;
select c.relname as tabela,c.relrowsecurity as rls_ativa from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';
select proname,pg_get_function_identity_arguments(oid) as argumentos from pg_proc where pronamespace='public'::regnamespace and proname in ('excluir_minha_propria_conta','transferir_saldo_familiar','suiri_operacao_v7');
