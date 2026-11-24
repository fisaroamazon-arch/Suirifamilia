begin;

create table if not exists public.suiri_taxas_xp_kids (
    membro_id uuid primary key references public.membros(id) on delete cascade,
    quantidade integer not null check (quantidade > 0),
    valor numeric(7,2) not null check (valor between 0.01 and 10000)
);
alter table public.suiri_taxas_xp_kids enable row level security;
revoke all on public.suiri_taxas_xp_kids from public, anon, authenticated;
grant select on public.suiri_taxas_xp_kids to authenticated;
drop policy if exists suiri_taxa_admin on public.suiri_taxas_xp_kids;
create policy suiri_taxa_admin on public.suiri_taxas_xp_kids for select to authenticated using (
    exists (
        select 1 from public.membros solicitante
        join public.membros crianca on crianca.familia_id = solicitante.familia_id
        where solicitante.id = (select auth.uid())
          and solicitante.papel in ('adm', 'admin_familia')
          and not coalesce(solicitante.eh_kids, false)
          and crianca.id = suiri_taxas_xp_kids.membro_id
          and (crianca.eh_kids or crianca.papel = 'dependente')
    )
);

create table if not exists public.suiri_categorias_financeiras (
    familia_id uuid not null references public.familias(id) on delete cascade,
    tipo text not null check (tipo in ('entrada', 'saida')),
    nome text not null check (nome = btrim(nome) and char_length(nome) between 1 and 60
                             and lower(nome) not in ('transferência', 'privativo')),
    chave text generated always as (lower(nome)) stored,
    subcategorias text[] not null default '{}',
    primary key (familia_id, tipo, chave)
);
alter table public.suiri_categorias_financeiras enable row level security;
revoke all on public.suiri_categorias_financeiras from public, anon, authenticated;
grant select on public.suiri_categorias_financeiras to authenticated;
drop policy if exists suiri_catalogo_adultos on public.suiri_categorias_financeiras;
create policy suiri_catalogo_adultos on public.suiri_categorias_financeiras for select to authenticated using (
    exists (
        select 1 from public.membros solicitante
        where solicitante.id = (select auth.uid())
          and solicitante.familia_id = suiri_categorias_financeiras.familia_id
          and not coalesce(solicitante.eh_kids, false)
          and solicitante.papel <> 'dependente'
          and coalesce(to_jsonb(solicitante)->'permissoes'->>'gastos', 'true') <> 'false'
    )
);

create or replace function public.suiri_criar_categoria_financeira(p_tipo text, p_nome text, p_subcategoria text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
    solicitante public.membros%rowtype;
    registro public.suiri_categorias_financeiras%rowtype;
    nome_limpo text := btrim(p_nome);
    sub_limpa text := btrim(p_subcategoria);
begin
    select * into solicitante from public.membros where id = auth.uid();
    if not found or solicitante.familia_id is null or coalesce(solicitante.eh_kids, false)
       or solicitante.papel = 'dependente'
       or coalesce(to_jsonb(solicitante)->'permissoes'->>'gastos', 'true') = 'false' then
        raise exception 'Perfil sem permissão para criar categorias';
    end if;
    if p_tipo is null or p_tipo not in ('entrada', 'saida') or nome_limpo is null
       or char_length(nome_limpo) not between 1 and 60
       or lower(nome_limpo) in ('transferência', 'privativo')
       or (sub_limpa is not null and char_length(sub_limpa) not between 1 and 60) then
        raise exception 'Informe um tipo e um nome de categoria válidos';
    end if;
    insert into public.suiri_categorias_financeiras as catalogo (familia_id, tipo, nome, subcategorias)
    values (solicitante.familia_id, p_tipo, nome_limpo, case when sub_limpa is null then '{}' else array[sub_limpa] end)
    on conflict (familia_id, tipo, chave) do update
    set subcategorias = case
        when sub_limpa is null or exists (
            select 1 from unnest(catalogo.subcategorias) as nome_sub where lower(nome_sub) = lower(sub_limpa)
        ) then catalogo.subcategorias
        else array_append(catalogo.subcategorias, sub_limpa) end
    returning * into registro;

    return jsonb_build_object('tipo', registro.tipo, 'nome', registro.nome, 'subcategorias', registro.subcategorias);
end;
$$;
revoke all on function public.suiri_criar_categoria_financeira(text, text, text) from public, anon, authenticated;
grant execute on function public.suiri_criar_categoria_financeira(text, text, text) to authenticated;

alter table public.transacoes add column if not exists subcategoria text;
alter table if exists public.transacoes_financeiras add column if not exists subcategoria text;

-- Atualiza apenas a ramificação de mesada na RPC instalada, preservando as versões
-- das outras operações, inclusive as alterações posteriores da missão parcial.
do $$
declare
    definicao text := pg_get_functiondef('public.suiri_operacao_v7(uuid,text,uuid,jsonb)'::regprocedure);
    inicio integer := strpos(definicao, 'elsif p_kind=''allowance'' then');
    fim integer := strpos(definicao, 'elsif p_kind=''reward'' then');
    ramo text := $allowance$
elsif p_kind in ('allowance','allowance_rate') then
  if actor.id <> uid or owner.papel not in ('adm','admin_familia') or coalesce(owner.eh_kids,false) then
   raise exception 'Somente administradores podem converter XP ou ajustar a taxa';
  end if;
  select * into child from public.membros where id::text = p_payload->>'kid'
    and familia_id = owner.familia_id and (eh_kids or papel = 'dependente') for update;
  if not found then raise exception 'Selecione uma criança deste lar'; end if;

  rate_q := (p_payload->'rate'->>'qtd')::integer;
  rate_value := round((p_payload->'rate'->>'valor')::numeric, 2);
  if p_kind = 'allowance_rate' then
   if rate_q is null or rate_q <= 0 or rate_value is null or rate_value not between 0.01 and 10000 then
    raise exception 'Taxa inválida';
   end if;
   insert into public.suiri_taxas_xp_kids (membro_id, quantidade, valor)
    values (child.id, rate_q, rate_value)
    on conflict (membro_id) do update set quantidade = excluded.quantidade, valor = excluded.valor;
   result := jsonb_build_object('ok',true);
  else
   if (coalesce(rate_q,0), coalesce(rate_value,0)) is distinct from (
    coalesce((select quantidade from public.suiri_taxas_xp_kids where membro_id = child.id),100),
    coalesce((select valor from public.suiri_taxas_xp_kids where membro_id = child.id),5)
   ) then raise exception 'A taxa mudou. Atualize a seleção e confirme novamente'; end if;
   blocks := floor(coalesce(child.xp_total,0) / rate_q);
   if blocks < 1 then raise exception 'Esta criança não tem XP suficiente'; end if;
   amount := blocks * rate_value;
   tid := public.suiri_transacao_interna_v7(jsonb_build_object(
    'familia_id',owner.familia_id,'membro_id',child.id,'tipo','entrada','valor',amount,
    'descricao','Conversão de '||(blocks*rate_q)::text||' XP em mesada','categoria','Mesada',
    'data_transacao',data_local,'escopo','pessoal','eh_privado',true
   ));
   update public.membros set xp_total = xp_total - blocks*rate_q where id = child.id;
   result := jsonb_build_object('ok',true,'count',1,'xp',blocks*rate_q,'amount',amount,'transaction_id',tid);
  end if;

 $allowance$;
begin
    if strpos(definicao, 'p_kind in (''allowance'',''allowance_rate'')') = 0 then
        if inicio = 0 or fim <= inicio or strpos(definicao, 'and xp_total>=rate_q order by id for update loop') = 0 then
            raise exception 'Versão inesperada da operação V7. Nenhuma mudança foi aplicada.';
        end if;
        execute substr(definicao, 1, inicio-1) || ramo || substr(definicao, fim);
    end if;
end;
$$;

do $$
declare
    definicao text := pg_get_functiondef('public.suiri_extrato_v7(date,date,date,uuid)'::regprocedure);
    marcador text := 'else t.categoria end';
begin
    if strpos(definicao, '''subcategoria''') = 0 then
        if strpos(definicao, marcador) = 0 then raise exception 'Versão inesperada do extrato V7'; end if;
        execute replace(definicao, marcador, marcador || $projection$,
         'subcategoria', case when (t.escopo='pessoal' or t.eh_privado)
            and t.membro_id is distinct from owner.id then null else t.subcategoria end,
         'transferencia_interna', coalesce(t.categoria = 'Transferência', false),
         'compra_mercado', to_jsonb(t)->>'suiri_compra_id' is not null
         $projection$);
    end if;
end;
$$;

commit;
