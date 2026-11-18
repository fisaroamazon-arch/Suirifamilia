-- Somente leitura. Não use a diferença para criar lançamentos automaticamente.
-- Os valores de transacoes_financeiras podem duplicar ou divergir do extrato.
select m.familia_id,m.id as membro_id,m.nome,
 coalesce(e.saldo,0) as saldo_extrato_oficial,
 m.saldo_carteira as saldo_cache_antigo,
 coalesce(m.saldo_carteira,0)-coalesce(e.saldo,0) as diferenca_cache_menos_extrato,
 coalesce(e.invalidos,0) as lancamentos_invalidos
from public.membros m
left join lateral(
 select
  sum(case t.tipo when 'entrada' then t.valor when 'saida' then -t.valor else 0 end) as saldo,
  count(*)filter(where t.tipo is null or t.tipo not in('entrada','saida') or t.valor is null
   or t.valor::text in('NaN','Infinity','-Infinity') or t.valor<0 or t.valor<>round(t.valor,2)) as invalidos
 from public.transacoes t where t.familia_id=m.familia_id and t.membro_id=m.id
) e on true
order by m.familia_id,m.nome;
