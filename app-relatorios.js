// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-RELATORIOS.JS (100% COMPLETO E INTEGRAL)
// Balanço Financeiro Familiar com 4 Dimensões:
// 1. Renda | 2. Despesas da Casa | 3. Gastos Próprios | 4. Transferências Enviadas
// Membros sem cartão/Kids excluídos. Neutralidade patrimonial na família.
// Padrão de Diálogos e Ações: Confirmar / Cancelar (Zero Emojis)
// =========================================================================

let instanciaGraficoRendaGastos = null;

// =========================================================================
// 1. COMPILAÇÃO DO BALANÇO FINANCEIRO FAMILIAR
// =========================================================================
window.gerarRelatorio = async function() {
    const supabase = window.clienteSupabase || window.cliente;
    if (!window.familiaAtualId || !supabase) {
        return window.mostrarToast("Sessão da família não identificada.", "erro");
    }

    const containerPdf = document.getElementById('relatorio-pdf-container');
    const areaResultados = document.getElementById('area-resultados-relatorio');
    const btnPdf = document.getElementById('btn-imprimir-pdf');
    const btnWhats = document.getElementById('btn-whatsapp-fechamento');

    let dtInicio = document.getElementById('data-inicio')?.value;
    let dtFim = document.getElementById('data-fim')?.value;
    const filtroMembro = document.getElementById('filtro-membro-relatorio')?.value || 'todos';

    const hoje = new Date();
    if (!dtInicio) {
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        dtInicio = `${ano}-${mes}-01`;
        if (document.getElementById('data-inicio')) document.getElementById('data-inicio').value = dtInicio;
    }
    if (!dtFim) {
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        dtFim = `${ano}-${mes}-${dia}`;
        if (document.getElementById('data-fim')) document.getElementById('data-fim').value = dtFim;
    }

    if (areaResultados) {
        areaResultados.innerHTML = '<p class="status-texto" style="text-align:center; padding:12px 0;">A processar métricas e balanço familiar...</p>';
    }
    containerPdf?.classList.remove('oculto');

    // 1. Consulta transações financeiras do período
    let query = supabase.from('transacoes')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_transacao', dtInicio)
        .lte('data_transacao', dtFim);

    if (filtroMembro !== 'todos') {
        query = query.eq('membro_id', filtroMembro);
    }

    let { data: transacoes, error } = await query;

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        let fallbackQuery = supabase.from('transacoes_financeiras')
            .select('*')
            .eq('familia_id', window.familiaAtualId)
            .gte('data_transacao', dtInicio)
            .lte('data_transacao', dtFim);

        if (filtroMembro !== 'todos') {
            fallbackQuery = fallbackQuery.eq('membro_id', filtroMembro);
        }

        const resFallback = await fallbackQuery;
        transacoes = resFallback.data;
        error = resFallback.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao carregar dados do balanço: " + error.message, "erro");
    }

    // 2. Consulta compras concluídas de supermercado
    const { data: itensMercado } = await supabase.from('itens_mercado')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .eq('comprado', true);

    // 3. Processamento detalhado em 4 linhas
    let totalEntradas = 0;
    let totalGastosCasa = 0;
    let totalGastosPessoais = 0;
    let totalTransferenciasInternas = 0;

    (transacoes || []).forEach(t => {
        const val = Number(t.valor || 0);
        const ehTransferencia = (t.categoria === 'Transferência') || 
                                (typeof t.descricao === 'string' && t.descricao.toLowerCase().includes('transferência'));

        if (ehTransferencia) {
            // Soma o montante transferido apenas uma vez (quando é saída/envio)
            if (t.tipo === 'saida') {
                totalTransferenciasInternas += val;
            }
            return;
        }

        if (t.tipo === 'entrada') {
            totalEntradas += val;
        } else {
            if (t.escopo === 'casa') totalGastosCasa += val;
            else totalGastosPessoais += val;
        }
    });

    let totalSupermercado = 0;
    (itensMercado || []).forEach(item => {
        totalSupermercado += (parseFloat(item.quantidade) || 0) * (parseFloat(item.valor_unitario) || 0);
    });

    // Despesas operacionais reais da família (sem contar transferências que não saíram de casa)
    const totalSaidasGeral = totalGastosCasa + totalGastosPessoais + totalSupermercado;
    const saldoLiquidoPeriodo = totalEntradas - totalSaidasGeral;

    window.ultimoResumoRelatorio = {
        dtInicio,
        dtFim,
        totalEntradas,
        totalGastosCasa,
        totalGastosPessoais,
        totalSupermercado,
        totalTransferenciasInternas,
        totalSaidasGeral,
        saldoLiquidoPeriodo
    };

    // 4. Renderização com a 4ª linha de Transferência destacada
    const corSaldo = saldoLiquidoPeriodo >= 0 ? 'var(--cor-sucesso, #10b981)' : 'var(--cor-erro, #f43f5e)';
    const dataInicioFmt = dtInicio.split('-').reverse().join('/');
    const dataFimFmt = dtFim.split('-').reverse().join('/');

    if (areaResultados) {
        areaResultados.innerHTML = `
            <div style="background:var(--pastel-card, #ffffff); border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:16px; padding:16px; box-shadow:var(--sombra-elegante);">
                <div style="text-align:center; border-bottom:1px solid #f3f4f6; padding-bottom:10px; margin-bottom:12px;">
                    <h3 style="margin:0; font-size:16px; color:var(--cor-primaria, #d97706);">${window.esc ? window.esc(window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar') : 'Suiri Gestão Familiar'}</h3>
                    <span style="font-size:11px; color:var(--texto-suave, #64748b);">Período: ${dataInicioFmt} até ${dataFimFmt}</span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
                    <div style="background:var(--suiri-surface-secondary-light, #fef9ea); padding:10px; border-radius:10px; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16));">
                        <span style="font-size:11px; color:var(--texto-suave, #64748b); display:block;">Total Receitas</span>
                        <strong style="color:var(--cor-sucesso, #10b981); font-size:14px;">+ R$ ${totalEntradas.toFixed(2)}</strong>
                    </div>
                    <div style="background:var(--suiri-surface-secondary-light, #fef9ea); padding:10px; border-radius:10px; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16));">
                        <span style="font-size:11px; color:var(--texto-suave, #64748b); display:block;">Total Despesas</span>
                        <strong style="color:var(--cor-erro, #f43f5e); font-size:14px;">- R$ ${totalSaidasGeral.toFixed(2)}</strong>
                    </div>
                </div>

                <div style="font-size:12px; line-height:1.7; border-bottom:1px solid #f3f4f6; padding-bottom:10px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="display:flex; align-items:center; gap:5px;">
                            ${window.IconesSuiri?.casa || ''} Contas e Despesas da Casa:
                        </span>
                        <strong>R$ ${totalGastosCasa.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="display:flex; align-items:center; gap:5px;">
                            ${window.IconesSuiri?.carrinho || ''} Supermercado (Carrinho):
                        </span>
                        <strong>R$ ${totalSupermercado.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="display:flex; align-items:center; gap:5px;">
                            ${window.IconesSuiri?.carteira || ''} Gastos Individuais dos Membros:
                        </span>
                        <strong>R$ ${totalGastosPessoais.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; color:#7c3aed; background:rgba(124, 58, 237, 0.05); padding:2px 6px; border-radius:6px; margin-top:2px;">
                        <span style="display:flex; align-items:center; gap:5px; font-weight:600;">
                            💸 Transferências entre Carteiras:
                        </span>
                        <strong>R$ ${totalTransferenciasInternas.toFixed(2)}</strong>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; font-size:13px; color:var(--texto-principal, #334155);">Resultado do Período:</span>
                    <strong style="font-size:16px; color:${corSaldo};">R$ ${saldoLiquidoPeriodo.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }

    btnPdf?.classList.remove('oculto');
    btnWhats?.classList.remove('oculto');

    // 5. Renderiza o Gráfico com 4 Barras
    await window.renderizarGraficoQuatroBarrasMembros(transacoes || []);
};

// =========================================================================
// 2. GRÁFICO COMPARATIVO DE QUATRO BARRAS POR MEMBRO
// =========================================================================
window.renderizarGraficoQuatroBarrasMembros = async function(transacoes) {
    const canvas = document.getElementById('grafico-barras-renda-gastos');
    if (!canvas || typeof Chart === 'undefined') return;

    // Filtra membros excluindo quem tem perfil Kids ou está sem cartão
    const membrosElegiveis = (window.listaMembrosFamilia || []).filter(m => {
        const ehKids = m.eh_kids === true || m.papel === 'dependente';
        const temCartao = m.possui_cartao !== false;
        return !ehKids && temCartao;
    });

    if (membrosElegiveis.length === 0) return;

    const rotulosMembros = [];
    const dadosRenda = [];
    const dadosDespesasCasa = [];
    const dadosGastosIndividuais = [];
    const dadosTransferenciasEnviadas = [];

    membrosElegiveis.forEach(m => {
        rotulosMembros.push(m.nome.split(' ')[0]);

        let rendaMembro = 0;
        let casaMembro = 0;
        let pessoalMembro = 0;
        let transferidoMembro = 0;

        transacoes.forEach(t => {
            if (t.membro_id === m.id) {
                const valor = Number(t.valor || 0);
                const ehTransferencia = (t.categoria === 'Transferência') || 
                                        (typeof t.descricao === 'string' && t.descricao.toLowerCase().includes('transferência'));

                if (t.tipo === 'entrada') {
                    // Soma como recurso que entrou para a pessoa (salários ou transferências recebidas)
                    rendaMembro += valor;
                } else if (t.tipo === 'saida') {
                    if (ehTransferencia) {
                        // 4ª Barra: Quanto este membro transferiu para outro
                        transferidoMembro += valor;
                    } else if (t.escopo === 'casa') {
                        casaMembro += valor;
                    } else if (t.escopo === 'pessoal') {
                        pessoalMembro += valor;
                    }
                }
            }
        });

        dadosRenda.push(rendaMembro);
        dadosDespesasCasa.push(casaMembro);
        dadosGastosIndividuais.push(pessoalMembro);
        dadosTransferenciasEnviadas.push(transferidoMembro);
    });

    if (instanciaGraficoRendaGastos) {
        instanciaGraficoRendaGastos.destroy();
    }

    const ctx = canvas.getContext('2d');
    instanciaGraficoRendaGastos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rotulosMembros,
            datasets: [
                {
                    label: 'Renda / Entradas (R$)',
                    data: dadosRenda,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Despesas com a Casa (R$)',
                    data: dadosDespesasCasa,
                    backgroundColor: '#0284c7',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Gastos Próprios (R$)',
                    data: dadosGastosIndividuais,
                    backgroundColor: '#f43f5e',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Transferências Enviadas (R$)',
                    data: dadosTransferenciasEnviadas,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 8,
                        font: { size: 9.5, weight: '700' },
                        color: '#334155'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: R$ ${parseFloat(context.raw).toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 10 },
                        color: '#64748b',
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    },
                    grid: {
                        color: '#f1f5f9'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11, weight: '700' },
                        color: '#334155'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
};

// =========================================================================
// 3. EXPORTAÇÃO EM PDF
// =========================================================================
window.imprimirPDF = function() {
    const elemento = document.getElementById('relatorio-pdf-container');
    if (!elemento || typeof html2pdf === 'undefined') {
        return window.mostrarToast("Biblioteca de PDF em carregamento.", "info");
    }

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Balanco_SuiriFamiliar_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elemento).save()
        .then(() => window.mostrarToast("Exportação em PDF confirmada com sucesso!"))
        .catch(() => window.mostrarToast("Falha ao exportar PDF.", "erro"));
};

// =========================================================================
// 4. PARTILHA FORMATADA NO WHATSAPP
// =========================================================================
window.enviarResumoFechamentoWhatsApp = function() {
    const res = window.ultimoResumoRelatorio;
    if (!res) return window.mostrarToast("Confirme a geração do balanço primeiro.", "erro");

    const nomeFam = window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar';
    const msg = 
`*Balanço Financeiro - ${nomeFam}*
Período: ${res.dtInicio.split('-').reverse().join('/')} até ${res.dtFim.split('-').reverse().join('/')}

[+] Entradas Totais: R$ ${res.totalEntradas.toFixed(2)}
[-] Saídas Totais: R$ ${res.totalSaidasGeral.toFixed(2)}
  • Despesas da Casa: R$ ${res.totalGastosCasa.toFixed(2)}
  • Supermercado: R$ ${res.totalSupermercado.toFixed(2)}
  • Gastos Individuais: R$ ${res.totalGastosPessoais.toFixed(2)}
  • Transferências Internas: R$ ${res.totalTransferenciasInternas.toFixed(2)}

Resultado Líquido: R$ ${res.saldoLiquidoPeriodo.toFixed(2)}
_Gerado via Suiri Gestão Familiar_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
};
