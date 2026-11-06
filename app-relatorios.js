// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-RELATORIOS.JS (100% COMPLETO E INTEGRAL)
// 1. Relatório em PDF com tabela completa (Mais recentes no topo).
// 2. Agrupamento por Dia com Total de Débitos e Saldo Acumulado (Rolagem Real).
// 3. Máscara de Privacidade: Gasto Privado para terceiros, real para o dono.
// 4. Renderização Estática do Canvas para eliminar falhas do html2pdf.
// 5. Balanço Familiar Consolidado em 4 Dimensões.
// =========================================================================

let instanciaGraficoRendaGastos = null;

function obterUsuarioId() {
    return window.perfilAtual?.id || window.usuarioAtual?.id || null;
}

function obterNomeMembroPorId(membroId) {
    if (!membroId) return 'Casa';
    const membro = (window.listaMembrosFamilia || []).find(m => m.id === membroId);
    return membro ? membro.nome.split(' ')[0] : 'Familiar';
}

// =========================================================================
// 1. COMPILAÇÃO DO BALANÇO FINANCEIRO E DO EXTRATO DETALHADO
// =========================================================================
window.gerarRelatorio = async function() {
    const supabase = window.clienteSupabase || window.cliente;
    if (!window.familiaAtualId || !supabase) {
        return window.mostrarToast("Sessão da família não identificada.", "erro");
    }

    const containerPdf = document.getElementById('relatorio-pdf-container');
    const areaResultados = document.getElementById('area-resultados-relatorio');
    const blocoBotoes = document.getElementById('acoes-botoes-relatorio');

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
        areaResultados.innerHTML = '<p class="status-texto" style="text-align:center; padding:16px 0; color:#d97706; font-size:12px; font-weight:700;">A compilar métricas e extrato detalhado...</p>';
    }
    if (containerPdf) containerPdf.classList.remove('oculto');

    // 1. Busca do Saldo Anterior (Tudo antes da data de início para o cálculo de rolagem)
    let queryAnt = supabase.from('transacoes')
        .select('tipo, valor')
        .eq('familia_id', window.familiaAtualId)
        .lt('data_transacao', dtInicio);
    
    if (filtroMembro !== 'todos') queryAnt = queryAnt.eq('membro_id', filtroMembro);
    
    let { data: transacoesAnt, error: errAnt } = await queryAnt;

    if (errAnt && errAnt.message && errAnt.message.includes('relation "public.transacoes" does not exist')) {
        let fallbackQueryAnt = supabase.from('transacoes_financeiras')
            .select('tipo, valor')
            .eq('familia_id', window.familiaAtualId)
            .lt('data_transacao', dtInicio);
        if (filtroMembro !== 'todos') fallbackQueryAnt = fallbackQueryAnt.eq('membro_id', filtroMembro);
        const resAnt = await fallbackQueryAnt;
        transacoesAnt = resAnt.data;
    }

    let saldoAcumulado = 0;
    (transacoesAnt || []).forEach(t => {
        if (t.tipo === 'entrada') saldoAcumulado += Number(t.valor || 0);
        else saldoAcumulado -= Number(t.valor || 0);
    });

    // 2. Busca de Transações no Período (Ordem Crescente para acumular o saldo corretamente)
    let query = supabase.from('transacoes')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_transacao', dtInicio)
        .lte('data_transacao', dtFim)
        .order('data_transacao', { ascending: true })
        .order('criado_em', { ascending: true });

    if (filtroMembro !== 'todos') {
        query = query.eq('membro_id', filtroMembro);
    }

    let { data: transacoes, error } = await query;

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        let fallbackQuery = supabase.from('transacoes_financeiras')
            .select('*')
            .eq('familia_id', window.familiaAtualId)
            .gte('data_transacao', dtInicio)
            .lte('data_transacao', dtFim)
            .order('data_transacao', { ascending: true })
            .order('criado_em', { ascending: true });

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

    // 3. Consulta itens de supermercado concluídos
    const { data: itensMercado } = await supabase.from('itens_mercado')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .eq('comprado', true);

    const meuId = obterUsuarioId();

    // 4. Processamento das 4 Linhas Contábeis Globais
    let totalEntradas = 0;
    let totalGastosCasa = 0;
    let totalGastosPessoais = 0;
    let totalTransferenciasInternas = 0;

    (transacoes || []).forEach(t => {
        const val = Number(t.valor || 0);
        const ehTransferencia = (t.categoria === 'Transferência') || 
                                (typeof t.descricao === 'string' && t.descricao.toLowerCase().includes('transferência'));

        if (ehTransferencia) {
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
        saldoLiquidoPeriodo,
        transacoes: transacoes || []
    };

    const dataInicioFmt = dtInicio.split('-').reverse().join('/');
    const dataFimFmt = dtFim.split('-').reverse().join('/');
    const corSaldoHex = saldoLiquidoPeriodo >= 0 ? '#10b981' : '#f43f5e';
    const nomeFamilia = window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar';

    // 5. Agrupamento por Dia e Cálculo do Saldo Acumulado (Rolagem Real)
    const diasAgrupados = {};
    const datasOrdem = [];

    (transacoes || []).forEach(t => {
        const d = t.data_transacao || '--';
        if (!diasAgrupados[d]) {
            diasAgrupados[d] = { transacoes: [], entradas: 0, saidas: 0, saldoFinal: 0 };
            datasOrdem.push(d);
        }
        diasAgrupados[d].transacoes.push(t);
        const val = Number(t.valor || 0);
        if (t.tipo === 'entrada') {
            diasAgrupados[d].entradas += val;
        } else {
            diasAgrupados[d].saidas += val;
        }
    });

    // Calcula o saldo sequencial progressivo
    datasOrdem.forEach(d => {
        saldoAcumulado += diasAgrupados[d].entradas;
        saldoAcumulado -= diasAgrupados[d].saidas;
        diasAgrupados[d].saldoFinal = saldoAcumulado;
    });

    // 6. Montagem da Tabela (Invertendo para mostrar do mais recente ao mais antigo)
    let linhasTabelaExtrato = '';
    const datasDecrescentes = [...datasOrdem].reverse();

    datasDecrescentes.forEach(d => {
        const diaDados = diasAgrupados[d];
        const dataExtenso = d !== '--' ? d.split('-').reverse().join('/') : '--/--/----';
        
        linhasTabelaExtrato += `
            <tr style="background-color: #e2e8f0;">
                <td colspan="5" style="padding: 6px 8px; font-weight: 800; color: #334155; text-align: center; font-size: 11px; letter-spacing: 0.5px;">
                    🗓️ MOVIMENTAÇÕES DE ${dataExtenso}
                </td>
            </tr>
        `;

        // As transações dentro do dia também são invertidas para manter a leitura consistente
        const transDiaDecrescente = [...diaDados.transacoes].reverse();
        
        transDiaDecrescente.forEach(t => {
            const ehMeu = t.membro_id === meuId;
            const ehPrivado = (t.escopo === 'pessoal' || t.eh_privado === true);
            const nomeMembro = obterNomeMembroPorId(t.membro_id);
            
            let descricaoExibida = t.descricao || 'Despesa';
            let categoriaExibida = t.categoria || 'Geral';

            if (ehPrivado && !ehMeu) {
                descricaoExibida = 'Gasto Privado';
                categoriaExibida = 'Privativo';
            }

            const val = Number(t.valor || 0);
            const ehEntrada = t.tipo === 'entrada';
            const corValor = ehEntrada ? '#10b981' : '#f43f5e';
            const sinal = ehEntrada ? '+' : '-';
            const dataApenasDiaMes = d !== '--' ? d.split('-').reverse().slice(0, 2).join('/') : '--/--';

            linhasTabelaExtrato += `
                <tr style="border-bottom:1px solid #f1f5f9; font-size:11px;">
                    <td style="padding:6px 4px; color:#64748b; white-space:nowrap;">${dataApenasDiaMes}</td>
                    <td style="padding:6px 4px; font-weight:700; color:#334155;">${nomeMembro}</td>
                    <td style="padding:6px 4px; color:#1e293b; font-weight:600;">${window.esc ? window.esc(descricaoExibida) : descricaoExibida}</td>
                    <td style="padding:6px 4px; color:#64748b;">${categoriaExibida}</td>
                    <td style="padding:6px 4px; text-align:right; font-weight:800; color:${corValor}; white-space:nowrap;">
                        ${sinal} R$ ${val.toFixed(2)}
                    </td>
                </tr>
            `;
        });

        // Rodapé do Dia: Total de Débitos e Saldo Acumulado (Rolagem Real)
        const corSaldo = diaDados.saldoFinal >= 0 ? '#10b981' : '#f43f5e';
        const sinalSaldo = diaDados.saldoFinal >= 0 ? '' : '-';
        
        linhasTabelaExtrato += `
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <td colspan="4" style="padding:6px 4px; font-weight:700; text-align:right; color:#475569; font-size:10.5px;">
                    TOTAL DÉBITOS DO DIA: <strong style="color:#f43f5e;">R$ ${diaDados.saidas.toFixed(2)}</strong> &nbsp;|&nbsp; 
                    SALDO ACUMULADO:
                </td>
                <td style="padding:6px 4px; font-weight:800; text-align:right; color:${corSaldo}; font-size:11.5px; white-space:nowrap;">
                    ${sinalSaldo} R$ ${Math.abs(diaDados.saldoFinal).toFixed(2)}
                </td>
            </tr>
        `;
    });

    if (datasDecrescentes.length === 0) {
        linhasTabelaExtrato = `<tr><td colspan="5" style="text-align:center; padding:12px; color:#64748b; font-size:11px;">Nenhuma movimentação registrada no período.</td></tr>`;
    }

    // 7. Renderização do Relatório Estruturado (Compatível com html2pdf)
    if (areaResultados) {
        areaResultados.innerHTML = `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:16px; margin-bottom:10px;">
                
                <!-- Cabeçalho Oficial do Relatório -->
                <div style="text-align:center; border-bottom:2px solid #f1f5f9; padding-bottom:10px; margin-bottom:12px;">
                    <h2 style="margin:0; font-size:18px; color:#d97706; text-transform:uppercase; letter-spacing:0.5px;">${nomeFamilia}</h2>
                    <span style="font-size:11.5px; font-weight:700; color:#64748b; display:block; margin-top:3px;">
                        Balanço & Extrato Consolidado • ${dataInicioFmt} até ${dataFimFmt}
                    </span>
                </div>

                <!-- Resumo dos Totais em Cards -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
                    <div style="background:#fef9ea; padding:10px; border-radius:10px; border:1px solid #fde68a;">
                        <span style="font-size:11px; color:#64748b; font-weight:700; display:block;">Total Receitas</span>
                        <strong style="color:#10b981; font-size:15px;">+ R$ ${totalEntradas.toFixed(2)}</strong>
                    </div>
                    <div style="background:#fef9ea; padding:10px; border-radius:10px; border:1px solid #fde68a;">
                        <span style="font-size:11px; color:#64748b; font-weight:700; display:block;">Total Despesas</span>
                        <strong style="color:#f43f5e; font-size:15px;">- R$ ${totalSaidasGeral.toFixed(2)}</strong>
                    </div>
                </div>

                <!-- Quadro Detalhado dos 4 Eixos -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:12px; line-height:1.8;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#475569;">Despesas da Casa:</span>
                        <strong style="color:#1e293b;">R$ ${totalGastosCasa.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#475569;">Supermercado (Carrinho):</span>
                        <strong style="color:#1e293b;">R$ ${totalSupermercado.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#475569;">Gastos Próprios dos Membros:</span>
                        <strong style="color:#1e293b;">R$ ${totalGastosPessoais.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:4px; color:#7c3aed;">
                        <span style="font-weight:700;">Transferências entre Carteiras:</span>
                        <strong style="color:#7c3aed;">R$ ${totalTransferenciasInternas.toFixed(2)}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1.5px solid #e2e8f0; padding-top:6px; margin-top:6px; font-size:13px;">
                        <span style="font-weight:800; color:#1e293b;">Resultado Líquido do Período:</span>
                        <strong style="color:${corSaldoHex}; font-size:15px;">R$ ${saldoLiquidoPeriodo.toFixed(2)}</strong>
                    </div>
                </div>

                <!-- Tabela com Extrato Completo e Detalhado dos Gastos -->
                <div style="margin-top:16px;">
                    <h3 style="margin:0 0 8px 0; font-size:13px; color:#334155; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">
                        Extrato Detalhado de Movimentações
                    </h3>
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="border-bottom:2px solid #cbd5e1; font-size:10.5px; color:#475569; text-transform:uppercase;">
                                <th style="padding:4px;">Data</th>
                                <th style="padding:4px;">Membro</th>
                                <th style="padding:4px;">Descrição</th>
                                <th style="padding:4px;">Categoria</th>
                                <th style="padding:4px; text-align:right;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasTabelaExtrato}
                        </tbody>
                    </table>
                </div>

            </div>
        `;
    }

    if (blocoBotoes) blocoBotoes.classList.remove('oculto');
    await window.renderizarGraficoQuatroBarrasMembros(transacoes || []);
};

// =========================================================================
// 2. RENDERIZAÇÃO DO GRÁFICO (Chart.js)
// =========================================================================
window.renderizarGraficoQuatroBarrasMembros = async function(transacoes) {
    const canvas = document.getElementById('grafico-barras-renda-gastos');
    if (!canvas || typeof Chart === 'undefined') return;

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
                    rendaMembro += valor;
                } else if (t.tipo === 'saida') {
                    if (ehTransferencia) {
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
                    label: 'Renda (R$)',
                    data: dadosRenda,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Casa (R$)',
                    data: dadosDespesasCasa,
                    backgroundColor: '#0284c7',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Pessoal (R$)',
                    data: dadosGastosIndividuais,
                    backgroundColor: '#f43f5e',
                    borderRadius: 4,
                    barPercentage: 0.85,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Transferido (R$)',
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
            animation: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 8,
                        font: { size: 9.5, weight: '700' },
                        color: '#334155'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 9.5 },
                        color: '#64748b',
                        callback: function(v) { return 'R$ ' + v; }
                    },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { size: 10.5, weight: '700' }, color: '#334155' },
                    grid: { display: false }
                }
            }
        }
    });
};

// =========================================================================
// 3. EXPORTAÇÃO EM PDF (ROBUSTA, TOTALMENTE COMPATÍVEL COM CELULAR)
// =========================================================================
window.imprimirPDF = async function() {
    const elemento = document.getElementById('relatorio-pdf-container');
    if (!elemento || typeof html2pdf === 'undefined') {
        return window.mostrarToast("Biblioteca de PDF indisponível ou em carregamento.", "info");
    }

    window.mostrarToast("A preparar documento PDF...", "info");

    const canvas = document.getElementById('grafico-barras-renda-gastos');
    let imgSubstituta = null;

    if (canvas && instanciaGraficoRendaGastos) {
        try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            imgSubstituta = document.createElement('img');
            imgSubstituta.src = dataUrl;
            imgSubstituta.style.width = '100%';
            imgSubstituta.style.height = 'auto';
            imgSubstituta.style.display = 'block';
            canvas.style.display = 'none';
            canvas.parentNode.insertBefore(imgSubstituta, canvas);
        } catch (e) {
            console.warn("Aviso ao rasterizar gráfico para PDF:", e);
        }
    }

    const dataHojeIso = new Date().toISOString().split('T')[0];
    const opt = {
        margin: [8, 8, 8, 8],
        filename: `Extrato_Balanco_Suiri_${dataHojeIso}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(elemento).save();
        window.mostrarToast("PDF gerado e descarregado com sucesso!");
    } catch (err) {
        console.error("Falha ao gerar PDF:", err);
        window.mostrarToast("Não foi possível gerar o PDF. Verifique as permissões de download.", "erro");
    } finally {
        if (imgSubstituta) {
            imgSubstituta.remove();
        }
        if (canvas) {
            canvas.style.display = 'block';
        }
    }
};

// =========================================================================
// 4. PARTILHA FORMATADA NO WHATSAPP
// =========================================================================
window.enviarResumoFechamentoWhatsApp = function() {
    const res = window.ultimoResumoRelatorio;
    if (!res) return window.mostrarToast("Gere o balanço antes de partilhar.", "erro");

    const nomeFam = window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar';
    const msg = 
`*Balanço Financeiro - ${nomeFam}*
Período: ${res.dtInicio.split('-').reverse().join('/')} até ${res.dtFim.split('-').reverse().join('/')}

[+] Total Receitas: R$ ${res.totalEntradas.toFixed(2)}
[-] Total Despesas: R$ ${res.totalSaidasGeral.toFixed(2)}
  • Contas da Casa: R$ ${res.totalGastosCasa.toFixed(2)}
  • Supermercado: R$ ${res.totalSupermercado.toFixed(2)}
  • Gastos Próprios: R$ ${res.totalGastosPessoais.toFixed(2)}
  • Transferências Internas: R$ ${res.totalTransferenciasInternas.toFixed(2)}

Resultado Líquido: R$ ${res.saldoLiquidoPeriodo.toFixed(2)}
_Gerado via Suiri Gestão Familiar_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
};
