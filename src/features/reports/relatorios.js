/* Balanço familiar, extrato por dia e exportação do relatório. */
let versaoRelatorio = 0;
let escopoRelatorio = null;

document.addEventListener('suiri:session-ready', () => {
    const escopo = JSON.stringify([window.familiaAtualId, obterUsuarioId()]);
    if (escopo === escopoRelatorio) return;
    ++versaoRelatorio;
    escopoRelatorio = escopo;
    window.ultimoResumoRelatorio = null;
    document.getElementById('relatorio-status').hidden = true;
    document.getElementById('relatorio-pdf-container').classList.add('oculto');
    document.getElementById('acoes-botoes-relatorio').classList.add('oculto');
    document.getElementById('area-resultados-relatorio').replaceChildren();
});

function resumoRecolhivel(titulo, html, classe = '') {
    return `<details class="cartao-geral fin-painel ${classe}" data-fin-exportar-aberto>
        <summary class="fin-resumo"><span>${titulo}</span><span class="fin-ver-mais" aria-hidden="true"></span></summary>
        <div class="fin-painel-corpo">${html}</div>
    </details>`;
}

function compararMembrosRelatorio(transacoes) {
    const membros = new Map((window.listaMembrosFamilia || []).map(membro =>
        [membro.id, { nome: membro.nome, entrada: 0, saida: 0 }]));
    for (const t of transacoes) {
        if (t.transferencia_interna || t.categoria === 'Transferência' || !['entrada', 'saida'].includes(t.tipo)) continue;
        if (!membros.has(t.membro_id)) {
            membros.set(t.membro_id, { nome: obterNomeMembroPorId(t.membro_id), entrada: 0, saida: 0 });
        }
        const valor = Math.round(Number(t.valor) * 100);
        if (Number.isFinite(valor) && valor > 0) membros.get(t.membro_id)[t.tipo] += valor;
    }
    const conjunto = [...membros.values()];
    const maior = Math.max(1, ...conjunto.flatMap(membro => [membro.entrada, membro.saida]));
    const total = tipo => conjunto.reduce((soma, m) => soma + m[tipo], 0);
    const percentual = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
    const barra = (titulo, valor, totalTipo, classe) => `<div class="fin-comparacao-linha ${classe}">
        <span>${titulo}</span><strong>${Suiri.money(valor / 100)} · ${percentual.format(totalTipo ? valor / totalTipo : 0)}</strong>
        <span class="fin-comparacao-trilho" aria-hidden="true"><i style="width:${valor / maior * 100}%"></i></span>
    </div>`;
    const totalEntrada = total('entrada');
    const totalSaida = total('saida');
    const paineis = conjunto.map(membro => `<li>
        <h4>${esc(membro.nome || 'Familiar')}</h4>
        ${barra('Receitas', membro.entrada, totalEntrada, 'fin-entrada')}
        ${barra('Despesas', membro.saida, totalSaida, 'fin-saida')}
    </li>`).join('');
    return paineis ? `<section class="cartao-geral fin-visualizacao">
        <h3>Comparação entre membros</h3>
        <p class="fin-mensagem">As barras usam a mesma escala em reais. O percentual mostra a parcela de cada membro no total da casa.</p>
        <ul class="fin-comparacao">${paineis}</ul>
    </section>` : '';
}

function agrupamentoCategoriasRelatorio(transacoes, membroId) {
    const movimento = { entrada: new Map(), saida: new Map() };
    const nomes = { entrada: new Map(), saida: new Map() };
    for (const t of transacoes) {
        if (t.transferencia_interna || chaveFinanceira(t.categoria || '') === 'transferencia' || !Object.hasOwn(movimento, t.tipo)) continue;
        const privado = (t.escopo === 'pessoal' || t.eh_privado) && t.membro_id !== membroId;
        const categoria = privado ? 'Privativo' : normalizarNomeFinanceiro(t.categoria || '') || 'Geral';
        const subcategoria = privado ? '' : normalizarNomeFinanceiro(t.subcategoria || '');
        const valor = Math.round(Number(t.valor || 0) * 100);
        if (!Number.isFinite(valor) || valor <= 0) continue;
        const grupos = movimento[t.tipo];
        const chaves = nomes[t.tipo];
        const chave = chaveFinanceira(categoria);
        if (!chaves.has(chave)) chaves.set(chave, categoria);
        const nome = chaves.get(chave);
        if (!grupos.has(nome)) grupos.set(nome, { total: 0, subcategorias: new Map() });
        const grupo = grupos.get(nome);
        const sub = nomeFinanceiroExistente(grupo.subcategorias.keys(), subcategoria);
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
            ${linhas ? `<table class="fin-tabela-categorias"><thead><tr><th>Categoria</th><th>Total</th><th>Subcategorias</th></tr></thead>
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
window.gerarRelatorio = async function(mostrarGrafico = false) {
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
    const aviso = document.getElementById('relatorio-status');
    aviso.hidden = false;
    aviso.textContent = 'Carregando o balanço…';
    containerPdf?.classList.add('oculto');

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
    const [anterior, periodo] = await Promise.all([queryAnt, query]).catch(error => [{ error }, {}]);
    if (versao !== versaoRelatorio || familia !== window.familiaAtualId || meuId !== obterUsuarioId()) return;
    if (anterior.error || periodo.error) {
        aviso.textContent = 'Não foi possível carregar este relatório.';
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
    const nomeFamilia = window.dadosFamiliaAtual?.nome_familia || 'Suíri Família';
    document.getElementById('periodo-grafico-balanco').textContent = `${nomeFamilia} · ${dataInicioFmt} a ${dataFimFmt}`;

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

    const dias = [...datasOrdem].reverse().map(data => {
        const dia = diasAgrupados[data];
        const linhas = [...dia.transacoes].reverse().map(t => {
            const privado = (t.escopo === 'pessoal' || t.eh_privado) && t.membro_id !== meuId;
            const entrada = t.tipo === 'entrada';
            const descricao = privado ? (entrada ? 'Entrada Privada' : 'Gasto Privado') : t.descricao || 'Movimentação';
            const categoria = privado ? 'Privativo' : t.categoria || 'Geral';
            const subcategoria = !privado && t.subcategoria ? ' › ' + t.subcategoria : '';
            return `<li class="fin-extrato-item">
                <span class="fin-extrato-texto" title="${esc(descricao)}">${esc(descricao)}</span>
                <strong class="fin-extrato-valor ${entrada ? 'fin-entrada' : 'fin-saida'}">${entrada ? '+' : '−'} ${Suiri.money(Number(t.valor || 0))}</strong>
                <small class="fin-extrato-texto">${esc(obterNomeMembroPorId(t.membro_id))} · ${esc(categoria + subcategoria)}</small>
            </li>`;
        }).join('');
        return `<section class="fin-extrato-dia">
            <h4>${esc(data.split('-').reverse().join('/'))}</h4>
            <ul class="fin-extrato-lista">${linhas}</ul>
            <p class="fin-extrato-rodape">Débitos do dia <strong>${Suiri.money(dia.saidas)}</strong>
                <span>Saldo acumulado <strong>${Suiri.money(dia.saldoFinal)}</strong></span></p>
        </section>`;
    }).join('');

    const indicadores = `<dl class="fin-totais">
        <div><dt>Receitas</dt><dd class="fin-entrada">${Suiri.money(totalEntradas)}</dd></div>
        <div><dt>Despesas</dt><dd class="fin-saida">${Suiri.money(totalSaidasGeral)}</dd></div>
        <div><dt>Saldo do período</dt><dd>${Suiri.money(saldoLiquidoPeriodo)}</dd></div>
    </dl>`;
    const totais = `<dl class="fin-totais">
        <div><dt>Despesas da casa</dt><dd>${Suiri.money(totalGastosCasa)}</dd></div>
        <div><dt>Supermercado</dt><dd>${Suiri.money(totalSupermercado)}</dd></div>
        <div><dt>Gastos pessoais</dt><dd>${Suiri.money(totalGastosPessoais)}</dd></div>
        <div><dt>Transferências internas</dt><dd>${Suiri.money(totalTransferenciasInternas)}</dd></div>
    </dl>`;
    areaResultados.innerHTML = `
        ${filtroMembro === 'todos' ? compararMembrosRelatorio(transacoes) : ''}
        ${resumoRecolhivel('Extrato do balanço', dias || '<p>Nenhuma movimentação registrada no período.</p>', 'fin-extrato-balanco')}
        ${resumoRecolhivel('Totais e categorias', indicadores + totais + tabelaCategoriasRelatorio(categorias))}
    `;

    aviso.hidden = true;
    containerPdf?.classList.remove('oculto');
    blocoBotoes?.classList.remove('oculto');
    window.renderizarGraficoCategorias();
    if (mostrarGrafico) {
        document.getElementById('titulo-grafico-categorias').focus({ preventScroll: true });
        document.getElementById('bloco-grafico-categorias').scrollIntoView({ block: 'start' });
    }
};

window.renderizarGraficoCategorias = function() {
    const resumo = window.ultimoResumoRelatorio;
    if (!resumo) return;
    const formato = document.getElementById('relatorio-formato-grafico').value;
    const tipo = document.getElementById('relatorio-tipo-grafico').value;
    const detalhes = document.getElementById('relatorio-grupo-grafico').value === 'subcategoria';
    document.getElementById('titulo-grafico-categorias').textContent =
        `${tipo === 'entrada' ? 'Receitas' : 'Despesas'} por ${detalhes ? 'subcategoria' : 'categoria'}`;
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
    Suiri.graficosFinanceiros.desenhar(document.getElementById('grafico-barras-renda-gastos'),
        document.getElementById('legenda-grafico-categorias'), series, formato);
};
new MutationObserver(() => window.renderizarGraficoCategorias()).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
});

// =========================================================================
// 3. EXPORTAÇÃO EM PDF (ROBUSTA, TOTALMENTE COMPATÍVEL COM CELULAR)
// =========================================================================
function prepararCoresDoPDF(documento) {
    const visualizacao = documento.defaultView;
    const relatorio = documento.querySelector('.html2pdf__container');
    const pixel = documento.createElement('canvas');
    pixel.width = pixel.height = 1;
    const contexto = pixel.getContext('2d', { willReadFrequently: true });
    if (!relatorio || !contexto) return;

    const modernas = /(?:color|oklch|oklab|lch|lab|hwb)\([^()]+\)/gi;
    const propriedades = [
        'color', 'background-color', 'background-image', 'border-top-color', 'border-right-color',
        'border-bottom-color', 'border-left-color', 'box-shadow', 'text-shadow',
        'text-decoration-color', 'outline-color'
    ];
    const convertidas = new Map();
    const rgba = cor => {
        if (!convertidas.has(cor)) {
            contexto.clearRect(0, 0, 1, 1);
            contexto.fillStyle = cor;
            contexto.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = contexto.getImageData(0, 0, 1, 1).data;
            convertidas.set(cor, `rgba(${r}, ${g}, ${b}, ${a / 255})`);
        }
        return convertidas.get(cor);
    };
    for (const elemento of [documento.documentElement, documento.body, relatorio, ...relatorio.querySelectorAll('*')]) {
        const estilo = visualizacao.getComputedStyle(elemento);
        for (const propriedade of propriedades) {
            const original = estilo.getPropertyValue(propriedade);
            const segura = original.replace(modernas, rgba);
            if (segura !== original) elemento.style.setProperty(propriedade, segura, 'important');
        }
    }
}

window.imprimirPDF = () => Suiri.once('exportar-pdf', async () => {
    const elemento = document.getElementById('relatorio-pdf-container');
    if (!elemento || typeof html2pdf === 'undefined') {
        return window.mostrarToast("Biblioteca de PDF indisponível ou em carregamento.", "info");
    }

    window.mostrarToast("A preparar documento PDF...", "info");

    const canvas = document.getElementById('grafico-barras-renda-gastos');
    let imgSubstituta = null;
    const exibicaoCanvas = canvas?.style.display;

    const grafico = Suiri.graficosFinanceiros.obter(canvas);
    if (canvas && grafico) {
        grafico.stop?.();
        grafico.update?.('none');
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
            scrollY: 0,
            onclone: prepararCoresDoPDF
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        const copia = elemento.cloneNode(true);
        copia.querySelectorAll('[data-fin-exportar-aberto]').forEach(painel => { painel.open = true; });
        copia.querySelectorAll('[data-fin-controles]').forEach(controle => controle.remove());
        copia.classList.add('fin-copia-pdf');
        const pdf = html2pdf().set(opt).from(copia);
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
        window.mostrarToast(err?.name === 'Error' && /^(Atualize o APK|Relatório grande)/.test(err.message)
            ? err.message : 'Não foi possível gerar o PDF.', 'erro');
    } finally {
        if (imgSubstituta) {
            imgSubstituta.remove();
        }
        if (canvas) {
            canvas.style.display = exibicaoCanvas;
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
