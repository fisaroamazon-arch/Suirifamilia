/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.carregarCarteiraIndividual = async function() {
    if(!window.familiaAtualId||!window.perfilAtual)return;
    const familia = window.familiaAtualId;
    const membro = window.perfilAtual.id;
    try{
        const [personalResult,familyResult]=await Promise.all([
            Suiri.transactionQuery().select('tipo,valor').eq('membro_id',membro),
            Suiri.transactionQuery().select('tipo,valor,membro_id').eq('familia_id',familia)
        ]);
        if (familia !== window.familiaAtualId || membro !== obterUsuarioId()) return;
        const personal=Suiri.check(personalResult)||[],all=Suiri.check(familyResult)||[];
        const sum=rows=>rows.reduce((total,t)=>total+(t.tipo==='entrada'?1:-1)*Math.round(Number(t.valor||0)*100),0)/100;
        window.saldoCarteiraNumerico=window.perfilAtual.possui_cartao===false?null:sum(personal);
        const balance=document.getElementById('lbl-saldo-carteira-membro');if(balance)balance.textContent=window.saldoCarteiraNumerico===null?'Sem Cartão':Suiri.money(window.saldoCarteiraNumerico);
        const valid=(window.listaMembrosFamilia||[]).filter(m=>m.possui_cartao!==false).map(m=>m.id);
        const total=document.getElementById('lbl-saldo-total-familia-montante');if(total)total.textContent=Suiri.money(sum(all.filter(t=>!valid.length||valid.includes(t.membro_id))));
        await Promise.allSettled([window.carregarCofresCompartilhados(),window.atualizarVisualizacaoMetaEconomia(),window.renderizarGraficoBarrasMesAnterior(), Suiri.planejamentoFinanceiro.atualizar()]);
    }catch(error){if (familia !== window.familiaAtualId || membro !== obterUsuarioId()) return;window.saldoCarteiraNumerico=null;const balance=document.getElementById('lbl-saldo-carteira-membro');if(balance)balance.textContent='Saldo indisponível';Suiri.notifyError(error);}
};

// =========================================================================
// 14. GRÁFICO EM BARRAS: GASTOS DO MÊS ANTERIOR (COR LARANJA SOLAR REFINADA)
// =========================================================================

let mesAnteriorFinanceiro = null;
let versaoMesAnteriorFinanceiro = 0;

function desenharMesAnterior() {
    const painel = document.getElementById('painel-gastos-mes-anterior');
    if (!painel?.open || mesAnteriorFinanceiro?.familia !== window.familiaAtualId || mesAnteriorFinanceiro?.membro !== obterUsuarioId()) return;
    Suiri.graficosFinanceiros.desenhar(document.getElementById('grafico-barras-mes-anterior'),
        document.getElementById('legenda-grafico-mes-anterior'), mesAnteriorFinanceiro.series, 'barras');
}

window.renderizarGraficoBarrasMesAnterior = async function() {
    const painel = document.getElementById('painel-gastos-mes-anterior');
    const familia = window.familiaAtualId;
    const membro = obterUsuarioId();
    if (!painel || !familia || !membro) return;

    const pedido = ++versaoMesAnteriorFinanceiro;
    const agora = new Date();
    const inicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fim = new Date(agora.getFullYear(), agora.getMonth(), 0);
    document.getElementById('lbl-nome-mes-anterior').textContent = inicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    const { data, error } = await Suiri.transactionQuery().select('categoria,valor,transferencia_interna')
        .eq('familia_id', familia).eq('tipo', 'saida').gte('data_transacao', Suiri.today(inicio)).lte('data_transacao', Suiri.today(fim));
    if (pedido !== versaoMesAnteriorFinanceiro || familia !== window.familiaAtualId || membro !== obterUsuarioId()) return;
    if (error) {
        document.getElementById('grafico-barras-mes-anterior').parentElement.hidden = true;
        document.getElementById('legenda-grafico-mes-anterior').textContent = 'Não foi possível carregar os gastos deste mês.';
        mesAnteriorFinanceiro = null;
        return;
    }
    const totais = new Map();
    for (const t of data || []) {
        if (t.transferencia_interna || t.categoria === 'Transferência') continue;
        const nome = t.categoria || 'Geral';
        const centavos = Math.round(Number(t.valor) * 100);
        if (Number.isFinite(centavos) && centavos > 0) totais.set(nome, (totais.get(nome) || 0) + centavos);
    }
    mesAnteriorFinanceiro = { familia, membro, series: [...totais].sort((a, b) => b[1] - a[1]) };
    desenharMesAnterior();
};

document.getElementById('painel-gastos-mes-anterior')?.addEventListener('toggle', desenharMesAnterior);
new MutationObserver(desenharMesAnterior).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// =========================================================================
// 15. METAS: POUPANÇA INDIVIDUAL & RESERVA DA FAMÍLIA (COFRES)
// =========================================================================

