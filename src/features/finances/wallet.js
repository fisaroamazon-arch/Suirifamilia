/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.carregarCarteiraIndividual = async function() {
    if(!window.familiaAtualId||!window.perfilAtual)return;
    try{
        const [personalResult,familyResult]=await Promise.all([
            Suiri.transactionQuery().select('tipo,valor').eq('membro_id',window.perfilAtual.id),
            Suiri.transactionQuery().select('tipo,valor,membro_id').eq('familia_id',window.familiaAtualId)
        ]);
        const personal=Suiri.check(personalResult)||[],all=Suiri.check(familyResult)||[];
        const sum=rows=>rows.reduce((total,t)=>total+(t.tipo==='entrada'?1:-1)*Math.round(Number(t.valor||0)*100),0)/100;
        window.saldoCarteiraNumerico=window.perfilAtual.possui_cartao===false?null:sum(personal);
        const balance=document.getElementById('lbl-saldo-carteira-membro');if(balance)balance.textContent=window.saldoCarteiraNumerico===null?'Sem Cartão':Suiri.money(window.saldoCarteiraNumerico);
        const valid=(window.listaMembrosFamilia||[]).filter(m=>m.possui_cartao!==false).map(m=>m.id);
        const total=document.getElementById('lbl-saldo-total-familia-montante');if(total)total.textContent=Suiri.money(sum(all.filter(t=>!valid.length||valid.includes(t.membro_id))));
        await Promise.allSettled([window.carregarCofresCompartilhados(),window.atualizarVisualizacaoMetaEconomia(),window.renderizarGraficoBarrasMesAnterior()]);
    }catch(error){window.saldoCarteiraNumerico=null;const balance=document.getElementById('lbl-saldo-carteira-membro');if(balance)balance.textContent='Saldo indisponível';Suiri.notifyError(error);}
};

// =========================================================================
// 14. GRÁFICO EM BARRAS: GASTOS DO MÊS ANTERIOR (COR LARANJA SOLAR REFINADA)
// =========================================================================

window.renderizarGraficoBarrasMesAnterior = async function() {
    const canvas = document.getElementById('grafico-barras-mes-anterior');
    const lblMes = document.getElementById('lbl-nome-mes-anterior');
    const supabase = obterClienteSupabase();
    if (!canvas || !supabase || !window.familiaAtualId || typeof Chart === 'undefined') return;

    const agora = new Date();
    const primeiroDiaMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

    const dtInicioStr = primeiroDiaMesAnterior.toISOString().split('T')[0];
    const dtFimStr = ultimoDiaMesAnterior.toISOString().split('T')[0];

    if (lblMes) {
        const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        lblMes.textContent = `${nomesMeses[primeiroDiaMesAnterior.getMonth()]}/${primeiroDiaMesAnterior.getFullYear()}`;
    }

    let { data: transacoesMesAnt } = await Suiri.transactionQuery().select('categoria, valor, tipo')
        .eq('familia_id', window.familiaAtualId)
        .eq('tipo', 'saida')
        .gte('data_transacao', dtInicioStr)
        .lte('data_transacao', dtFimStr);

    if (!transacoesMesAnt) {
        const res = await supabase.from('transacoes_financeiras')
            .select('categoria, valor, tipo')
            .eq('familia_id', window.familiaAtualId)
            .eq('tipo', 'saida')
            .gte('data_transacao', dtInicioStr)
            .lte('data_transacao', dtFimStr);
        transacoesMesAnt = res.data || [];
    }

    const totaisPorSetor = {};
    (transacoesMesAnt || []).forEach(t => {
        const cat = t.categoria || 'Geral';
        totaisPorSetor[cat] = (totaisPorSetor[cat] || 0) + Number(t.valor || 0);
    });

    const labels = Object.keys(totaisPorSetor);
    const valores = Object.values(totaisPorSetor);

    if (labels.length === 0) {
        labels.push("Sem Registros");
        valores.push(0);
    }

    if (instanciaGraficoMesAnterior) {
        instanciaGraficoMesAnterior.destroy();
    }

    const ctx = canvas.getContext('2d');
    instanciaGraficoMesAnterior = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gasto no Mês Anterior (R$)',
                data: valores,
                backgroundColor: '#f97316',
                borderRadius: 8,
                barPercentage: 0.65
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` R$ ${Number(ctx.raw || 0).toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: {
                        font: { size: 10 },
                        color: '#64748b',
                        callback: function(v) { return 'R$ ' + v; }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, weight: '700' },
                        color: '#0f172a'
                    }
                }
            }
        }
    });
};

// =========================================================================
// 15. METAS: POUPANÇA INDIVIDUAL & RESERVA DA FAMÍLIA (COFRES)
// =========================================================================

