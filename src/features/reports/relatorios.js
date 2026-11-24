// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-RELATORIOS.JS (100% COMPLETO E INTEGRAL)
// 1. Relatório em PDF com tabela completa (Mais recentes no topo).
// 2. Agrupamento por Dia com Total de Débitos e Saldo Acumulado (Rolagem Real).
// 3. Máscara de Privacidade: Gasto Privado para terceiros, real para o dono.
// 4. Renderização Estática do Canvas para eliminar falhas do html2pdf.
// 5. Balanço Familiar Consolidado em 4 Dimensões.
// Design System Warm Tech: Linho Orgânico, Números Tabulares e Elevações
// =========================================================================

let instanciaGraficoRendaGastos = null;
let versaoRelatorio = 0;

function agrupamentoCategoriasRelatorio(transacoes, membroId) {
    const movimento = { entrada: new Map(), saida: new Map() };
    for (const t of transacoes) {
        if (t.transferencia_interna || t.categoria === 'Transferência' || !movimento[t.tipo]) continue;
        const privado = (t.escopo === 'pessoal' || t.eh_privado) && t.membro_id !== membroId;
        const nome = privado ? 'Privativo' : t.categoria || 'Geral';
        const sub = privado ? '' : t.subcategoria || '';
        const valor = Math.round(Number(t.valor || 0) * 100);
        if (!Number.isFinite(valor) || valor <= 0) continue;
        const grupos = movimento[t.tipo];
        if (!grupos.has(nome)) grupos.set(nome, { total: 0, subcategorias: new Map() });
        const grupo = grupos.get(nome);
        grupo.total += valor;
        grupo.subcategorias.set(sub, (grupo.subcategorias.get(sub) || 0) + valor);
    }
    return movimento;
}

function tabelaCategoriasRelatorio(agrupamento) {
    return Object.entries(agrupamento).map(([tipo, categorias]) => {
        const titulo = tipo === 'entrada' ? 'Receitas por categoria' : 'Despesas por categoria';
        const linhas = [...categorias].sort((a, b) => b[1].total - a[1].total).map(([nome, grupo]) => {
            const subcategorias = [...grupo.subcategorias].map(([sub, valor]) =>
                `<li>${esc(sub || 'Sem subcategoria')} · ${Suiri.money(valor / 100)}</li>`).join('');
            return `<tr><th scope="row" style="text-align:left; vertical-align:top;">${esc(nome)}</th>
                <td>${Suiri.money(grupo.total / 100)}</td><td><ul>${subcategorias}</ul></td></tr>`;
        }).join('');
        return `<h3>${titulo}</h3>
            ${linhas ? `<table style="width:100%; text-align:left;"><thead><tr><th>Categoria</th><th>Total</th><th>Subcategorias</th></tr></thead>
               <tbody>${linhas}</tbody></table>` : '<p>Sem movimentações neste período.</p>'}`;
    }).join('');
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

    const familia = window.familiaAtualId;
    const meuId = obterUsuarioId();
    const versao = ++versaoRelatorio;
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

    if (dtInicio > dtFim) return window.mostrarToast('A data inicial deve ser anterior ou igual à final.', 'erro');
    if (areaResultados) {
        areaResultados.innerHTML = '<p class="status-texto" style="text-align:center; padding:18px 0; color:#ea580c; font-size:12.5px; font-weight:800;">A compilar métricas e extrato detalhado...</p>';
    }
    if (containerPdf) containerPdf.classList.remove('oculto');

    let queryAnt = Suiri.transactionQuery().select('tipo, valor').eq('familia_id', familia).lt('data_transacao', dtInicio);
    let query = Suiri.transactionQuery().select('*').eq('familia_id', familia)
        .gte('data_transacao', dtInicio).lte('data_transacao', dtFim)
        .order('data_transacao', { ascending: true }).order('criado_em', { ascending: true });
    if (filtroMembro !== 'todos') {
        queryAnt = queryAnt.eq('membro_id', filtroMembro);
        query = query.eq('membro_id', filtroMembro);
    }
    blocoBotoes?.classList.add('oculto');
    window.ultimoResumoRelatorio = null;
    const [anterior, periodo] = await Promise.all([queryAnt, query]);
    if (versao !== versaoRelatorio || familia !== window.familiaAtualId || meuId !== obterUsuarioId()) return;
    if (anterior.error || periodo.error) {
        if (areaResultados) areaResultados.textContent = 'Não foi possível carregar este relatório.';
        return Suiri.notifyError(anterior.error || periodo.error);
    }

    let saldoAcumulado = (anterior.data || []).reduce((saldo, t) =>
        saldo + (t.tipo === 'entrada' ? 1 : -1) * Number(t.valor || 0), 0);
    const transacoes = periodo.data || [];
    const categorias = agrupamentoCategoriasRelatorio(transacoes, meuId);

    // 4. Processamento das 4 Linhas Contábeis Globais
    let totalEntradas = 0;
    let totalGastosCasa = 0;
    let totalGastosPessoais = 0;
    let totalTransferenciasInternas = 0;
    let totalSupermercado = 0;

    (transacoes || []).forEach(t => {
        const val = Number(t.valor || 0);
        const ehTransferencia = t.transferencia_interna || t.categoria === 'Transferência';

        if (ehTransferencia) {
            if (t.tipo === 'saida') {
                totalTransferenciasInternas += val;
            }
            return;
        }

        if (t.tipo === 'entrada') {
            totalEntradas += val;
        } else {
            if (t.compra_mercado || t.categoria === 'Supermercado') totalSupermercado += val;
            if (t.escopo === 'casa') totalGastosCasa += val;
            else totalGastosPessoais += val;
        }
    });

    const totalSaidasGeral = totalGastosCasa + totalGastosPessoais;
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
        categorias
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

    datasOrdem.forEach(d => {
        saldoAcumulado += diasAgrupados[d].entradas;
        saldoAcumulado -= diasAgrupados[d].saidas;
        diasAgrupados[d].saldoFinal = saldoAcumulado;
    });

    // 6. Montagem da Tabela (Mais recente ao mais antigo)
    let linhasTabelaExtrato = '';
    const datasDecrescentes = [...datasOrdem].reverse();

    datasDecrescentes.forEach(d => {
        const diaDados = diasAgrupados[d];
        const dataExtenso = d !== '--' ? d.split('-').reverse().join('/') : '--/--/----';
        
        linhasTabelaExtrato += `
            <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <td colspan="5" style="padding: 7px 10px; font-weight: 800; color: #0f172a; text-align: left; font-size: 11px; letter-spacing: 0.5px;">
                    🗓️ MOVIMENTAÇÕES DE ${dataExtenso}
                </td>
            </tr>
        `;

        const transDiaDecrescente = [...diaDados.transacoes].reverse();
        
        transDiaDecrescente.forEach(t => {
            const ehMeu = t.membro_id === meuId;
            const ehPrivado = (t.escopo === 'pessoal' || t.eh_privado === true);
            const nomeMembro = obterNomeMembroPorId(t.membro_id);
            
            let descricaoExibida = t.descricao || 'Despesa';
            let categoriaExibida = t.categoria || 'Geral';
            let subcategoriaExibida = t.subcategoria || '';

            if (ehPrivado && !ehMeu) {
                descricaoExibida = 'Gasto Privado';
                categoriaExibida = 'Privativo';
                subcategoriaExibida = '';
            }

            const val = Number(t.valor || 0);
            const ehEntrada = t.tipo === 'entrada';
            const corValor = ehEntrada ? '#10b981' : '#f43f5e';
            const sinal = ehEntrada ? '+' : '-';
            const dataApenasDiaMes = d !== '--' ? d.split('-').reverse().slice(0, 2).join('/') : '--/--';

            linhasTabelaExtrato += `
                <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11.5px;">
                    <td style="padding: 7px 6px; color: #64748b; white-space: nowrap; font-variant-numeric: tabular-nums;">${dataApenasDiaMes}</td>
                    <td style="padding: 7px 6px; font-weight: 800; color: #0f172a;">${esc(nomeMembro)}</td>
                    <td style="padding: 7px 6px; color: #334155; font-weight: 600;">${window.esc ? window.esc(descricaoExibida) : descricaoExibida}</td>
                    <td style="padding: 7px 6px; color: #64748b;">${esc(categoriaExibida)}${subcategoriaExibida ? ' › ' + esc(subcategoriaExibida) : ''}</td>
                    <td style="padding: 7px 6px; text-align: right; font-weight: 800; color: ${corValor}; white-space: nowrap; font-variant-numeric: tabular-nums;">
                        ${sinal} R$ ${val.toFixed(2)}
                    </td>
                </tr>
            `;
        });

        // Rodapé do Dia com Rolagem Real
        const corSaldo = diaDados.saldoFinal >= 0 ? '#10b981' : '#f43f5e';
        const sinalSaldo = diaDados.saldoFinal >= 0 ? '' : '-';
        
        linhasTabelaExtrato += `
            <tr style="background-color: #faf8f5; border-bottom: 2px solid #cbd5e1;">
                <td colspan="4" style="padding: 7px 8px; font-weight: 700; text-align: right; color: #475569; font-size: 11px;">
                    TOTAL DÉBITOS DO DIA: <strong style="color: #f43f5e; font-variant-numeric: tabular-nums;">R$ ${diaDados.saidas.toFixed(2)}</strong> &nbsp;|&nbsp; 
                    SALDO ACUMULADO:
                </td>
                <td style="padding: 7px 6px; font-weight: 800; text-align: right; color: ${corSaldo}; font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums;">
                    ${sinalSaldo} R$ ${Math.abs(diaDados.saldoFinal).toFixed(2)}
                </td>
            </tr>
        `;
    });

    if (datasDecrescentes.length === 0) {
        linhasTabelaExtrato = `<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b; font-size:12px;">Nenhuma movimentação registrada no período.</td></tr>`;
    }

    // 7. Renderização Estruturada no DOM
    if (areaResultados) {
        areaResultados.innerHTML = `
            <div style="background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 18px; padding: 18px; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);">
                
                <!-- Cabeçalho Oficial do Relatório -->
                <div style="text-align: center; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
                    <h2 style="margin: 0; font-size: 19px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 900;">${esc(nomeFamilia)}</h2>
                    <span style="font-size: 12px; font-weight: 700; color: #64748b; display: block; margin-top: 4px;">
                        Balanço & Extrato Consolidado • ${dataInicioFmt} até ${dataFimFmt}
                    </span>
                </div>

                <!-- Resumo dos Totais em Cards -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                    <div style="background: #ecfdf5; padding: 12px; border-radius: 14px; border: 1px solid #a7f3d0;">
                        <span style="font-size: 11px; color: #065f46; font-weight: 800; text-transform: uppercase; display: block;">Total Receitas</span>
                        <strong style="color: #059669; font-size: 16px; font-variant-numeric: tabular-nums;">+ R$ ${totalEntradas.toFixed(2)}</strong>
                    </div>
                    <div style="background: #fff1f2; padding: 12px; border-radius: 14px; border: 1px solid #fecdd3;">
                        <span style="font-size: 11px; color: #9f1239; font-weight: 800; text-transform: uppercase; display: block;">Total Despesas</span>
                        <strong style="color: #e11d48; font-size: 16px; font-variant-numeric: tabular-nums;">- R$ ${totalSaidasGeral.toFixed(2)}</strong>
                    </div>
                </div>

                <!-- Quadro Detalhado dos 4 Eixos -->
                <div style="background: #f8fafc; border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 14px; padding: 12px 14px; margin-bottom: 16px; font-size: 12.5px; line-height: 1.85;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #475569;">Despesas da Casa:</span>
                        <strong style="color: #0f172a; font-variant-numeric: tabular-nums;">R$ ${totalGastosCasa.toFixed(2)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #475569;">Dos gastos acima, supermercado:</span>
                        <strong style="color: #0f172a; font-variant-numeric: tabular-nums;">R$ ${totalSupermercado.toFixed(2)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #475569;">Gastos Próprios dos Membros:</span>
                        <strong style="color: #0f172a; font-variant-numeric: tabular-nums;">R$ ${totalGastosPessoais.toFixed(2)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 5px; margin-top: 5px; color: #7c3aed;">
                        <span style="font-weight: 800;">Transferências entre Carteiras:</span>
                        <strong style="color: #7c3aed; font-variant-numeric: tabular-nums;">R$ ${totalTransferenciasInternas.toFixed(2)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 13.5px;">
                        <span style="font-weight: 800; color: #0f172a;">Resultado Líquido do Período:</span>
                        <strong style="color: ${corSaldoHex}; font-size: 16px; font-variant-numeric: tabular-nums;">R$ ${saldoLiquidoPeriodo.toFixed(2)}</strong>
                    </div>
                </div>

                ${tabelaCategoriasRelatorio(categorias)}

                <!-- Tabela com Extrato Completo e Detalhado dos Gastos -->
                <div style="margin-top: 16px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 13.5px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px; font-weight: 800;">
                        Extrato Detalhado de Movimentações
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #cbd5e1; font-size: 11px; color: #475569; text-transform: uppercase;">
                                <th style="padding: 6px;">Data</th>
                                <th style="padding: 6px;">Membro</th>
                                <th style="padding: 6px;">Descrição</th>
                                <th style="padding: 6px;">Categoria</th>
                                <th style="padding: 6px; text-align: right;">Valor</th>
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
    window.renderizarGraficoCategorias();
};

// =========================================================================
// 2. RENDERIZAÇÃO DO GRÁFICO (Chart.js)
// =========================================================================
window.renderizarGraficoCategorias = function() {
    const canvas = document.getElementById('grafico-barras-renda-gastos');
    const resumo = window.ultimoResumoRelatorio;
    if (!canvas || !resumo || typeof Chart === 'undefined') return;
    const escuro = document.documentElement.dataset.theme === 'dark';
    const rotulo = escuro ? '#eef4f8' : '#0f172a';
    const formato = document.getElementById('relatorio-formato-grafico').value;
    const tipo = document.getElementById('relatorio-tipo-grafico').value;
    const detalhes = document.getElementById('relatorio-grupo-grafico').value === 'subcategoria';
    const titulo = `${tipo === 'entrada' ? 'Receitas' : 'Despesas'} por ${detalhes ? 'subcategoria' : 'categoria'}`;
    document.getElementById('titulo-grafico-categorias').textContent = titulo;
    const series = [];
    for (const [nome, grupo] of resumo.categorias[tipo]) {
        if (detalhes) {
            for (const [sub, valor] of grupo.subcategorias) {
                series.push([`${nome} › ${sub || 'Sem subcategoria'}`, valor]);
            }
        } else {
            series.push([nome, grupo.total]);
        }
    }
    series.sort((a, b) => b[1] - a[1]);
    instanciaGraficoRendaGastos?.destroy();
    instanciaGraficoRendaGastos = null;
    const desenhar = series.length > 0;
    canvas.parentElement.hidden = !desenhar;
    document.getElementById('titulo-grafico-categorias').textContent = desenhar ? titulo : titulo + ' · Sem dados';
    if (!desenhar) return;
    canvas.parentElement.style.height = formato === 'barras' ? `${Math.max(250, series.length * 28)}px` : '270px';
    instanciaGraficoRendaGastos = new Chart(canvas.getContext('2d'), {
        type: formato === 'pizza' ? 'pie' : 'bar',
        data: {
            labels: series.map(([nome]) => nome),
            datasets: [{
                label: titulo,
                data: series.map(([, valor]) => valor / 100),
                backgroundColor: series.map((_, i) => `hsl(${i * 137.508 % 360} 63% 45%)`)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            indexAxis: formato === 'barras' ? 'y' : 'x',
            plugins: { legend: { display: formato === 'pizza', position: 'bottom', labels: { color: rotulo } } },
            ...(formato === 'pizza' ? {} : {
                scales: Object.fromEntries(['x', 'y'].map(eixo => [eixo, {
                    ticks: { color: rotulo }, grid: { color: escuro ? '#3b4a59' : '#e2e8f0' }
                }]))
            })
        }
    });
};

// =========================================================================
// 3. EXPORTAÇÃO EM PDF (ROBUSTA, TOTALMENTE COMPATÍVEL COM CELULAR)
// =========================================================================
window.imprimirPDF = () => Suiri.once('exportar-pdf', async () => {
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

    const dataHojeIso = Suiri.today();
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
        const pdf = html2pdf().set(opt).from(elemento);
        if (window.SuiriAndroid) {
            if (!navigator.userAgent.includes('SuiriFamiliaPDF/1')) {
                throw new Error('Atualize o APK para salvar PDF pelo Android.');
            }
            const data = await pdf.outputPdf('datauristring');
            const base64 = data.slice(data.indexOf(',') + 1);
            if (base64.length > 16_000_000) throw new Error('Relatório grande demais. Selecione um período menor.');
            window.SuiriPdfAndroid = base64;
            window.SuiriAndroid('save-pdf');
        } else {
            await pdf.save();
            window.mostrarToast('Download do PDF iniciado.');
        }
    } catch (err) {
        console.error("Falha ao gerar PDF:", err);
        window.mostrarToast(err?.message || 'Não foi possível gerar o PDF.', 'erro');
    } finally {
        if (imgSubstituta) {
            imgSubstituta.remove();
        }
        if (canvas) {
            canvas.style.display = 'block';
        }
    }
});

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
  • Dos gastos acima, supermercado: R$ ${res.totalSupermercado.toFixed(2)}
  • Gastos Próprios: R$ ${res.totalGastosPessoais.toFixed(2)}
  • Transferências Internas: R$ ${res.totalTransferenciasInternas.toFixed(2)}

Resultado Líquido: R$ ${res.saldoLiquidoPeriodo.toFixed(2)}
_Gerado via Suiri Gestão Familiar_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
};
