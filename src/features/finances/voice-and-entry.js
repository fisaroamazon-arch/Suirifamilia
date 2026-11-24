/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.inicializarMotorVoz = function() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || reconhecimentoVoz) return;

    reconhecimentoVoz = new SpeechRec();
    reconhecimentoVoz.lang = 'pt-BR';
    reconhecimentoVoz.continuous = false;
    reconhecimentoVoz.interimResults = false;

    reconhecimentoVoz.onstart = function() {
        document.getElementById('btn-mic-gastos')?.classList.add('ouvindo');
        window.mostrarToast("A ouvir... Diga por exemplo: 'Comprei arroz por 25 reais' ou 'Recebi 1200 de salário'", "info");
    };

    reconhecimentoVoz.onend = function() {
        document.getElementById('btn-mic-gastos')?.classList.remove('ouvindo');
    };

    reconhecimentoVoz.onerror = function(evento) {
        document.getElementById('btn-mic-gastos')?.classList.remove('ouvindo');
        window.mostrarToast(evento.error === "not-allowed" ? "Autorize o microfone nas configurações do navegador." : "Não foi possível captar a voz. Tente novamente.", "erro");
    };

    reconhecimentoVoz.onresult = function(evento) {
        const textoTranscrito = evento.results[0][0].transcript;
        window.processarTextoTranscrito(textoTranscrito);
    };
};

window.ouvirComandoVoz = function() {
    if (window.SuiriAndroid) return window.SuiriAndroid("voice");
    window.inicializarMotorVoz();
    if (!reconhecimentoVoz) {
        return window.mostrarToast("Use o ditado do teclado ou preencha os campos manualmente neste navegador.", "erro");
    }
    try { reconhecimentoVoz.start(); } catch { window.mostrarToast("Aguarde o ditado atual e tente novamente.", "info"); }
};

function interpretarLancamentoPorVoz(frase) {
    if (!frase?.trim()) return;
    const textoOriginal = frase.trim();
    const texto = textoOriginal.toLowerCase();

    let valorDetectado = 0;
    const matchNumero = texto.match(/r\$\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*(?:reais?|contos?)\b/i)
        || texto.match(/\b(?:recebi|ganhei|vendi|gastei|paguei|por|custou|de)\s+(\d+(?:[.,]\d+)*)\b/i);

    if (matchNumero) {
        valorDetectado = parseValorFinanceiro(matchNumero[1] || matchNumero[2]) || 0;
        const centavos = texto.slice(matchNumero.index + matchNumero[0].length).match(/^\s+e\s+(\d{1,2})\s+centavos?\b/);
        if (centavos && Number.isInteger(valorDetectado)) valorDetectado += Number(centavos[1]) / 100;
    }

    const padroesEntrada = /recebi|recebido|recebimento|ganhei|sal[aá]rio|caiu|entrou|pix\s+de|renda|dep[oó]sito|vendi|venda|reembolso|lucro|comiss[aã]o|bonifica[cç][aã]o/i;
    const movimento = texto.match(/\b(recebi|ganhei|vendi|gastei|comprei|paguei|enviei|mandei)\b/)?.[1];
    const ehReceita = movimento ? /^(recebi|ganhei|vendi)$/.test(movimento) : padroesEntrada.test(texto);
    const tipoTransacao = ehReceita ? 'entrada' : 'saida';

    let escopo = 'pessoal';
    if (/casa|fam[ií]lia|lar|mercado|supermercado|condom[ií]nio|energia|luz|água|agua|internet|feira|aluguel|coletivo/i.test(texto)) {
        escopo = 'casa';
    }

    let categoria = 'Geral';
    if (/supermercado|mercado|a[cç]ougue|padaria|hortifr[uú]ti|feira|despensa|arroz|feij[aã]o|leite|caf[eé]|carne/i.test(texto)) {
        categoria = 'Supermercado';
    } else if (/almo[cç]o|jantar|lanche|pizza|restaurante|comida|ifood|hamb[uú]rguer|a[cç]a[ií]/i.test(texto)) {
        categoria = 'Alimentação';
    } else if (/uber|combust[ií]vel|gasolina|etanol|abasteci|posto|passagem|t[aá]xi|estacionamento|ped[aá]gio|mecanico|pneu/i.test(texto)) {
        categoria = 'Transporte';
    } else if (/aluguel|condom[ií]nio|energia|luz|água|agua|internet|iptu|manuten[cç][aã]o|g[aá]s/i.test(texto)) {
        categoria = 'Moradia';
    } else if (/rem[eé]dio|farm[aá]cia|drogaria|consulta|m[eé]dico|dentista|exame|hospital|vacina/i.test(texto)) {
        categoria = 'Saúde';
    } else if (/cinema|passeio|viagem|festa|jogo|praia|futebol|show|bar|churrasco/i.test(texto)) {
        categoria = 'Lazer';
    } else if (/escola|livro|curso|faculdade|mensalidade|material|uniforme/i.test(texto)) {
        categoria = 'Educação';
    }
    if (ehReceita) {
        if (/sal[aá]rio|folha de pagamento|holerite/i.test(texto)) categoria = 'Salário';
        else if (/reembolso|estorno/i.test(texto)) categoria = 'Reembolsos';
        else if (/vendi|venda/i.test(texto)) categoria = 'Vendas';
        else if (/freela|servi[cç]o|cliente/i.test(texto)) categoria = 'Serviços';
        else categoria = '';
    }

    let itemLimpo = textoOriginal.replace(/\s+e\s+\d{1,2}\s+centavos?\b/i, "");

    itemLimpo = itemLimpo.replace(/^(eu\s+)?(gastei|comprei|paguei|recebi|ganhei|vendi|entrou|caiu|depositei|lancei|coloquei)\s+/i, '');

    itemLimpo = itemLimpo
        .replace(/(no|na|de|do|da|com|em)\s+valor\s+de\s+/gi, '')
        .replace(/\b(por|de|custou|foi)\s+(r\$\s*)?\d+[\d.,]*(\s*(reais|real|conto|mangos|centavos))?/gi, '')
        .replace(/(r\$\s*)?\d+[\d.,]*\s*(reais|real|conto|mangos|centavos)?/gi, '')
        .replace(/\b(reais|real|r\$)\b/gi, '')
        .trim();

    itemLimpo = itemLimpo
        .replace(/^(um|uma|uns|umas|de|do|da|no|na|o|a|os|as|por)\s+/i, '')
        .replace(/\s+(por|de|no|na|em|com)$/i, '')
        .replace(/^[,.\s-]+|[,.\s-]+$/g, '')
        .trim();

    if (!itemLimpo || itemLimpo.length < 2) {
        itemLimpo = ehReceita ? categoria || 'Receita' : (categoria !== 'Geral' ? categoria : 'Compra avulsa');
    }

    itemLimpo = itemLimpo.charAt(0).toUpperCase() + itemLimpo.slice(1);

    return { descricao: itemLimpo, valor: valorDetectado, tipo: tipoTransacao, categoria, escopo };
}

window.processarTextoTranscrito = function(frase) {
    const dados = interpretarLancamentoPorVoz(frase);
    if (!dados) return;
    const { descricao: itemLimpo, valor: valorDetectado, tipo: tipoTransacao, categoria, escopo } = dados;
    const inDesc = document.getElementById('input-fin-descricao');
    const inVal = document.getElementById('input-fin-valor');
    const selEscopo = document.getElementById('select-fin-escopo');

    if (inDesc) inDesc.value = itemLimpo;
    if (inVal) inVal.value = valorDetectado > 0 ? valorDetectado.toFixed(2) : "";
    if (inDesc) inDesc.dataset.viaVoz = "true";
    window.selecionarTipoRegistroRapido(tipoTransacao);
    window.preencherCategoriasFinanceiras(categoria, '');
    if (selEscopo) selEscopo.value = escopo;

    const rotuloTipo = tipoTransacao === 'entrada' ? 'Entrada' : 'Saída';
    if (!(valorDetectado > 0)) return window.mostrarToast("Confira a descrição e informe o valor.", "info");
    window.mostrarToast(`Voz identificada: ${rotuloTipo} • R$ ${valorDetectado.toFixed(2)} (${itemLimpo})`);
};

// =========================================================================
// 13. CARTEIRAS, MONTANTE & FILTRAGEM DE MEMBROS SEM CARTÃO
// =========================================================================

window.salvarTransacaoManual = async function() {
    const supabase = obterClienteSupabase();
    const usuarioId = obterUsuarioId();
    if (!window.familiaAtualId || !usuarioId || !supabase) {
        return window.mostrarToast("Sessão não identificada.", "erro");
    }

    const inDesc = document.getElementById('input-fin-descricao');
    const inVal = document.getElementById('input-fin-valor');
    const selTipo = document.getElementById('select-fin-tipo');
    const selEscopo = document.getElementById('select-fin-escopo');
    const selCat = document.getElementById('select-fin-categoria');

    const desc = inDesc?.value.trim();
    const valor = parseValorFinanceiro(inVal?.value);
    const tipo = selTipo?.value || 'saida';
    const escopo = selEscopo?.value || 'pessoal';
    if (!['entrada', 'saida'].includes(tipo) || !['casa', 'pessoal'].includes(escopo)) {
        return window.mostrarToast('Confira o tipo e a visibilidade do lançamento.', 'erro');
    }
    const familia = window.familiaAtualId;
    const subInput = document.getElementById('select-fin-subcategoria');
    const opcoes = opcoesCategoriasFinanceiras(tipo);
    const categoriaDigitada = normalizarNomeFinanceiro(selCat?.value) || 'Geral';
    if (['transferencia', 'privativo'].includes(chaveFinanceira(categoriaDigitada))) {
        selCat?.focus();
        return window.mostrarToast('Escolha uma categoria específica, como Pix recebido ou Pagamento bancário.', 'erro');
    }
    const categoria = nomeFinanceiroExistente(opcoes.keys(), categoriaDigitada);
    const subcategoria = nomeFinanceiroExistente(opcoes.get(categoria) || [], normalizarNomeFinanceiro(subInput?.value));

    if (!desc) {
        inDesc?.focus();
        return window.mostrarToast('Informe uma descrição para o lançamento.', 'erro');
    }
    if (!Number.isFinite(valor) || valor <= 0) {
        inVal?.setAttribute('aria-invalid', 'true');
        inVal?.focus();
        return window.mostrarToast('Informe um valor maior que zero. Exemplo: 25,50.', 'erro');
    }
    inVal?.removeAttribute('aria-invalid');

    if (categoria.length > 60 || subcategoria.length > 60) {
        return window.mostrarToast('Use até 60 caracteres na categoria e na subcategoria.', 'erro');
    }

    const hojeStr = Suiri.today();

    const payload = {
        familia_id: window.familiaAtualId,
        membro_id: usuarioId,
        tipo: tipo,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal'),
        descricao: desc,
        categoria: categoria,
        ...(subcategoria ? { subcategoria } : {}),
        valor: valor,
        data_transacao: hojeStr,
        via_voz: inDesc?.dataset.viaVoz === "true"
    };

    let resultado = await supabase.from('transacoes').insert(payload).select('id').single();
    if (resultado.error?.code === '42P01' || resultado.error?.code === 'PGRST205') {
        resultado = await supabase.from('transacoes_financeiras').insert(payload).select('id').single();
    }

    if (resultado.error || !resultado.data?.id) {
        const mensagem = resultado.error?.message || 'O servidor não confirmou o registro.';
        window.mostrarToast(`Não foi possível registrar o lançamento. ${mensagem}`, 'erro');
    } else {
        if (familia !== window.familiaAtualId || usuarioId !== obterUsuarioId()) return true;
        lembrarCategoriaFinanceira({ ...payload, id: resultado.data.id });
        if (selCat) selCat.value = '';
        if (subInput) subInput.value = '';
        window.mostrarToast(tipo === 'entrada' ? "Receita confirmada na carteira!" : "Gasto confirmado com sucesso!");
        if (inDesc) {
            inDesc.value = '';
            delete inDesc.dataset.viaVoz;
        }
        if (inVal) inVal.value = '';
        window.atualizarSugestaoFinanceira();
        const atualizar = [
            window.carregarCarteiraIndividual,
            window.carregarExtratoPeriodo,
            window.ultimoResumoRelatorio && window.gerarRelatorio
        ];
        Promise.allSettled(atualizar.map(renderizar => Promise.resolve().then(() => renderizar?.())));
        return true;
    }
};


window.selecionarTipoRegistroRapido = function(tipo) {
    const seletor = document.getElementById('select-fin-tipo');
    const mudou = seletor.value !== tipo;
    seletor.value = tipo;
    const confirmar = document.getElementById('fin-confirmar-registro');
    if (confirmar) confirmar.textContent = tipo === 'entrada' ? 'Registrar receita' : 'Registrar despesa';
    window.preencherCategoriasFinanceiras(mudou ? '' : undefined, mudou ? '' : undefined);
    for (const [id, ativo, cor] of [
        ['btn-toggle-tipo-despesa', tipo === 'saida', '#f43f5e'],
        ['btn-toggle-tipo-receita', tipo === 'entrada', '#10b981']
    ]) {
        const botao = document.getElementById(id);
        if (!botao) continue;
        botao.setAttribute('aria-pressed', String(ativo));
        botao.style.background = ativo ? cor : 'transparent';
        botao.style.color = ativo ? '#fff' : '#0f172a';
    }
};

window.confirmarRegistroRapido = async function(botao) {
    if (botao.disabled) return;
    botao.disabled = true;
    try {
        if (await window.salvarTransacaoManual()) Suiri.closeModal('modal-registro-rapido-financas');
    } catch (error) {
        Suiri.notifyError(error);
    } finally {
        botao.disabled = false;
    }
};

const categoriasPadraoSuiri = {
    saida: ['Geral', 'Supermercado', 'Moradia', 'Lazer', 'Alimentação', 'Transporte', 'Saúde', 'Educação'],
    entrada: ['Salário', 'Vendas', 'Serviços', 'Reembolsos', 'Outras receitas', 'Geral']
};
let versaoCategoriasFinanceiras = 0;
let categoriasFinanceirasSuiri = { familia: null, usuario: null, catalogo: [], historico: [], opcoes: null };

function parseValorFinanceiro(entrada) {
    const texto = String(entrada ?? '').trim().replace(/^R\$\s*/i, '');
    let decimal;
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(texto)) {
        decimal = texto.replace(/\./g, '').replace(',', '.');
    } else if (/^\d+([.,]\d{1,2})?$|^[.,]\d{1,2}$/.test(texto)) {
        decimal = texto.replace(',', '.');
    } else {
        return NaN;
    }
    const valor = Number(decimal);
    return Number.isSafeInteger(Math.round(valor * 100)) ? valor : NaN;
}

function normalizarNomeFinanceiro(nome = '') {
    return nome.trim().replace(/\s+/g, ' ').normalize('NFC');
}

function chaveFinanceira(nome = '') {
    return normalizarNomeFinanceiro(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function nomeFinanceiroExistente(nomes, nome) {
    const chave = chaveFinanceira(nome);
    return Array.from(nomes).find(item => chaveFinanceira(item) === chave) || nome;
}

function cacheFinanceiroAtual() {
    const cache = categoriasFinanceirasSuiri;
    return cache.familia === window.familiaAtualId && cache.usuario === window.obterUsuarioId?.() ? cache : null;
}

function transacaoAprendivel(t) {
    const categoria = chaveFinanceira(t.categoria || '');
    return categoriasPadraoSuiri[t.tipo] && categoria && categoria !== 'privativo' && categoria !== 'transferencia'
        && !t.transferencia_interna
        && (!(t.eh_privado || t.escopo === 'pessoal') || t.membro_id === window.obterUsuarioId?.());
}

function compilarOpcoesFinanceiras(tipo, catalogo, historico) {
    const grupos = new Map();
    function grupo(nome) {
        const chave = chaveFinanceira(nome);
        if (!grupos.has(chave)) grupos.set(chave, { nome: normalizarNomeFinanceiro(nome), usos: 0, subs: new Map() });
        return grupos.get(chave);
    }
    function subcategoria(grupo, nome, uso) {
        const chave = chaveFinanceira(nome || '');
        if (!chave) return;
        if (!grupo.subs.has(chave)) grupo.subs.set(chave, { nome: normalizarNomeFinanceiro(nome), usos: 0 });
        grupo.subs.get(chave).usos += uso;
    }
    for (const nome of categoriasPadraoSuiri[tipo]) grupo(nome);
    for (const linha of catalogo) {
        if (linha.tipo !== tipo || !chaveFinanceira(linha.nome || '')) continue;
        const item = grupo(linha.nome);
        for (const sub of linha.subcategorias || []) subcategoria(item, sub, 0);
    }
    for (const linha of historico) {
        if (linha.tipo !== tipo) continue;
        const item = grupo(linha.categoria);
        item.usos++;
        subcategoria(item, linha.subcategoria, 1);
    }
    const ordenar = (a, b) => b.usos - a.usos;
    return new Map([...grupos.values()].sort(ordenar).map(item => [
        item.nome, [...item.subs.values()].sort(ordenar).map(sub => sub.nome)
    ]));
}

function gravarCacheFinanceiro(familia, usuario, catalogo, historico) {
    categoriasFinanceirasSuiri = {
        familia, usuario, catalogo, historico,
        opcoes: {
            entrada: compilarOpcoesFinanceiras('entrada', catalogo, historico),
            saida: compilarOpcoesFinanceiras('saida', catalogo, historico)
        }
    };
}

function opcoesCategoriasFinanceiras(tipo) {
    return cacheFinanceiroAtual()?.opcoes[tipo] || new Map((categoriasPadraoSuiri[tipo] || []).map(nome => [nome, []]));
}

function lembrarCategoriaFinanceira(linha) {
    if (!transacaoAprendivel(linha)) return;
    const cache = cacheFinanceiroAtual();
    const historico = (cache?.historico || []).filter(t => t.id !== linha.id);
    gravarCacheFinanceiro(window.familiaAtualId, obterUsuarioId(), cache?.catalogo || [], [linha, ...historico]);
}

function mostrarSugestoesFinanceiras(campo, lista, nomes, escolher) {
    const texto = chaveFinanceira(campo.value);
    const opcoes = nomes.filter(nome => nome !== campo.value && chaveFinanceira(nome).includes(texto)).slice(0, 8);
    lista.replaceChildren(...opcoes.map(nome => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.textContent = nome;
        botao.addEventListener('click', () => {
            campo.value = nome;
            campo.focus();
            escolher();
        });
        return botao;
    }));
    lista.hidden = !opcoes.length;
}

const palavrasComunsFinanceiras = new Set([
    'comprei', 'paguei', 'recebi', 'ganhei', 'despesa', 'compra', 'receita', 'gasto', 'gastei', 'valor', 'reais', 'para', 'pelo', 'pela', 'com', 'sem', 'uma', 'conta', 'pix', 'projeto', 'trabalho', 'servico', 'projetos', 'trabalhos', 'servicos'
]);

function termosFinanceiros(desc) {
    return new Set(chaveFinanceira(desc).split(/[^a-z]+/g)
        .filter(palavra => palavra.length >= 4 && !palavrasComunsFinanceiras.has(palavra)));
}

function sugerirPeloHistorico(tipo, descricao) {
    const termos = termosFinanceiros(descricao);
    if (!termos.size) return null;
    const opcoes = opcoesCategoriasFinanceiras(tipo);
    let melhor = null;
    let pontosMelhor = 0;
    let lidas = 0;
    for (const t of cacheFinanceiroAtual()?.historico || []) {
        if (t.tipo !== tipo || !t.descricao || (chaveFinanceira(t.categoria) === 'geral' && !t.subcategoria)) continue;
        if (++lidas > 240) break;
        const anteriores = termosFinanceiros(t.descricao);
        const emComum = [...termos].filter(termo => anteriores.has(termo)).length;
        if (!emComum) continue;
        const pontos = 2 * emComum / (termos.size + anteriores.size);
        if (pontos < .6 || pontos <= pontosMelhor) continue;
        const categoria = nomeFinanceiroExistente(opcoes.keys(), t.categoria);
        const subcategoria = nomeFinanceiroExistente(opcoes.get(categoria) || [], t.subcategoria || '');
        melhor = { categoria, subcategoria };
        pontosMelhor = pontos;
    }
    return melhor;
}

window.atualizarSugestaoFinanceira = function() {
    const painel = document.getElementById('fin-sugestao-contexto');
    if (!painel) return;
    const categoria = document.getElementById('select-fin-categoria').value.trim();
    const botao = document.getElementById('fin-aplicar-sugestao');
    const tipo = document.getElementById('select-fin-tipo').value;
    const descricao = document.getElementById('input-fin-descricao').value;
    const sugestao = !categoria && sugerirPeloHistorico(tipo, descricao);
    painel.hidden = !sugestao;
    if (!sugestao) return;
    botao.textContent = [sugestao.categoria, sugestao.subcategoria].filter(Boolean).join(' › ');
    botao.onclick = () => {
        window.preencherCategoriasFinanceiras(sugestao.categoria, sugestao.subcategoria);
        document.getElementById('select-fin-categoria').focus({ preventScroll: true });
    };
};

window.preencherCategoriasFinanceiras = function(selecionada, subcategoria) {
    const tipo = document.getElementById('select-fin-tipo').value;
    const campo = document.getElementById('select-fin-categoria');
    if (selecionada !== undefined) campo.value = selecionada;
    mostrarSugestoesFinanceiras(campo, document.getElementById('fin-sugestoes-categoria'),
        [...opcoesCategoriasFinanceiras(tipo).keys()], () => window.preencherCategoriasFinanceiras(campo.value, ''));
    window.atualizarSubcategoriasFinanceiras(subcategoria);
    window.atualizarSugestaoFinanceira();
};

window.atualizarSubcategoriasFinanceiras = function(selecionada) {
    const tipo = document.getElementById('select-fin-tipo').value;
    const categoria = normalizarNomeFinanceiro(document.getElementById('select-fin-categoria').value) || 'Geral';
    const campo = document.getElementById('select-fin-subcategoria');
    const opcoes = opcoesCategoriasFinanceiras(tipo);
    const nomes = opcoes.get(nomeFinanceiroExistente(opcoes.keys(), categoria)) || [];
    if (selecionada !== undefined) campo.value = selecionada;
    mostrarSugestoesFinanceiras(campo, document.getElementById('fin-sugestoes-subcategoria'), nomes, () => window.atualizarSubcategoriasFinanceiras());
};

window.abrirRegistroRapido = async function() {
    const familia = window.familiaAtualId;
    const usuario = obterUsuarioId();
    const cliente = obterClienteSupabase();
    const versao = ++versaoCategoriasFinanceiras;
    window.preencherCategoriasFinanceiras();
    Suiri.openModal('modal-registro-rapido-financas');
    if (!familia || !usuario || !cliente) return;

    // Mantém apenas categorias do catálogo e movimentações que este perfil pode conhecer.
    const [catalogo, historico] = await Promise.allSettled([
        cliente.from('suiri_categorias_financeiras').select('tipo,nome,subcategorias').eq('familia_id', familia).order('nome'),
        Suiri.transactionQuery().select('id,tipo,descricao,categoria,subcategoria,transferencia_interna,membro_id,escopo,eh_privado')
            .eq('familia_id', familia).order('data_transacao', { ascending: false }).order('criado_em', { ascending: false })
    ]);
    if (versao !== versaoCategoriasFinanceiras || familia !== window.familiaAtualId || usuario !== obterUsuarioId()) return;
    const cache = cacheFinanceiroAtual();
    const valor = (resposta, anterior) => resposta.status === 'fulfilled' && !resposta.value.error ? resposta.value.data || [] : anterior;
    const linhas = valor(historico, cache?.historico || []).filter(transacaoAprendivel);
    gravarCacheFinanceiro(familia, usuario, valor(catalogo, cache?.catalogo || []), linhas);
    window.preencherCategoriasFinanceiras();
};

document.addEventListener('suiri:session-ready', () => {
    if (cacheFinanceiroAtual()) return;
    const categoria = document.getElementById('select-fin-categoria');
    if (categoria) window.preencherCategoriasFinanceiras('', '');
});
