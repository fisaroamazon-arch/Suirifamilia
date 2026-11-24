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

window.processarTextoTranscrito = function(frase) {
    if (!frase?.trim()) return;
    const textoOriginal = frase.trim();
    const texto = textoOriginal.toLowerCase();

    let valorDetectado = 0;
    const matchNumero = texto.match(/r\$\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*(?:reais?|contos?)\b/i)
        || texto.match(/\b(?:recebi|ganhei|gastei|paguei|por|custou)\s+(\d+(?:[.,]\d+)*)\b/i);
    
    if (matchNumero) {
        let numStr = matchNumero[1] || matchNumero[2];
        numStr = numStr.replace(/\.(?=\d{3})/g, '').replace(',', '.');
        valorDetectado = parseFloat(numStr) || 0;
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
    } else if (ehReceita) {
        categoria = 'Salário';
    }

    let itemLimpo = textoOriginal.replace(/\s+e\s+\d{1,2}\s+centavos?\b/i, "");

    itemLimpo = itemLimpo.replace(/^(eu\s+)?(gastei|comprei|paguei|recebi|ganhei|entrou|caiu|depositei|lancei|coloquei)\s+/i, '');

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
        itemLimpo = ehReceita ? 'Salário' : (categoria !== 'Geral' ? categoria : 'Compra avulsa');
    }

    itemLimpo = itemLimpo.charAt(0).toUpperCase() + itemLimpo.slice(1);

    const inDesc = document.getElementById('input-fin-descricao');
    const inVal = document.getElementById('input-fin-valor');
    const selEscopo = document.getElementById('select-fin-escopo');

    if (inDesc) inDesc.value = itemLimpo;
    if (inVal) inVal.value = valorDetectado > 0 ? valorDetectado.toFixed(2) : "";
    if (inDesc) inDesc.dataset.viaVoz = "true";
    window.selecionarTipoRegistroRapido(tipoTransacao);
    window.preencherCategoriasFinanceiras(ehReceita ? 'Salário' : categoria, '');
    if (selEscopo) selEscopo.value = escopo;

    const rotuloTipo = ehReceita ? 'Entrada' : 'Saída';
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
    const valor = parseFloat(inVal?.value);
    const tipo = selTipo?.value || 'saida';
    const escopo = selEscopo?.value || 'pessoal';
    const familia = window.familiaAtualId;
    const subInput = document.getElementById('select-fin-subcategoria');
    const opcoes = opcoesCategoriasFinanceiras(tipo);
    const categoriaDigitada = normalizarNomeFinanceiro(selCat?.value) || 'Geral';
    const categoria = nomeFinanceiroExistente(opcoes.keys(), categoriaDigitada);
    const subcategoria = nomeFinanceiroExistente(opcoes.get(categoria) || [], normalizarNomeFinanceiro(subInput?.value));

    if (!desc || isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe a descrição e o valor da transação.", "erro");
    }

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

    let { error } = await supabase.from('transacoes').insert([payload]);

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const res = await supabase.from('transacoes_financeiras').insert([payload]);
        error = res.error;
    }

    if (error) {
        window.mostrarToast("Erro ao gravar movimentação: " + error.message, "erro");
    } else {
        if (familia !== window.familiaAtualId || usuarioId !== obterUsuarioId()) return true;
        lembrarCategoriaFinanceira({ tipo, categoria, subcategoria });
        if (selCat) selCat.value = '';
        if (subInput) subInput.value = '';
        window.mostrarToast(tipo === 'entrada' ? "Receita confirmada na carteira!" : "Gasto confirmado com sucesso!");
        if (inDesc) {
            inDesc.value = '';
            delete inDesc.dataset.viaVoz;
        }
        if (inVal) inVal.value = '';
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
    entrada: ['Geral', 'Salário']
};
let versaoCategoriasFinanceiras = 0;
let categoriasFinanceirasSuiri = { familia: null, usuario: null, dados: [] };

function normalizarNomeFinanceiro(nome = '') {
    return nome.trim().replace(/\s+/g, ' ').normalize('NFC');
}

function nomeFinanceiroExistente(nomes, nome) {
    return Array.from(nomes).find(item => item.localeCompare(nome, 'pt-BR', { sensitivity: 'accent' }) === 0) || nome;
}

function opcoesCategoriasFinanceiras(tipo) {
    const mapa = new Map((categoriasPadraoSuiri[tipo] || []).map(nome => [nome, []]));
    const { familia, usuario, dados } = categoriasFinanceirasSuiri;
    if (familia === window.familiaAtualId && usuario === obterUsuarioId()) {
        for (const linha of dados) {
            if (linha.tipo !== tipo || !linha.categoria || linha.categoria === 'Privativo' || linha.transferencia_interna || linha.categoria === 'Transferência') continue;
            const nome = nomeFinanceiroExistente(mapa.keys(), normalizarNomeFinanceiro(linha.categoria));
            const subcategorias = mapa.get(nome) || [];
            for (const sub of linha.subcategorias || [linha.subcategoria]) {
                if (sub && !subcategorias.includes(nomeFinanceiroExistente(subcategorias, sub))) subcategorias.push(sub);
            }
            mapa.set(nome, subcategorias);
        }
    }
    return mapa;
}

function unirSugestoesFinanceiras(linhas) {
    const unicas = new Map();
    for (const linha of linhas) {
        const { tipo, categoria, transferencia_interna } = linha;
        if (!categoria || categoria === 'Privativo' || transferencia_interna || categoria === 'Transferência') continue;
        const nome = normalizarNomeFinanceiro(categoria);
        if (!nome) continue;
        const chave = JSON.stringify([tipo, nome.toLocaleLowerCase('pt-BR')]);
        if (!unicas.has(chave)) unicas.set(chave, { tipo, categoria: nome, subcategorias: [] });
        const grupo = unicas.get(chave);
        for (const valor of linha.subcategorias || [linha.subcategoria]) {
            const sub = normalizarNomeFinanceiro(valor || '');
            if (sub && !grupo.subcategorias.includes(nomeFinanceiroExistente(grupo.subcategorias, sub))) grupo.subcategorias.push(sub);
        }
    }
    return [...unicas.values()];
}

function lembrarCategoriaFinanceira(linha) {
    const familia = window.familiaAtualId;
    const usuario = obterUsuarioId();
    const cache = categoriasFinanceirasSuiri;
    const dados = cache.familia === familia && cache.usuario === usuario ? cache.dados : [];
    categoriasFinanceirasSuiri = { familia, usuario, dados: unirSugestoesFinanceiras([...dados, linha]) };
}

function mostrarSugestoesFinanceiras(campo, lista, nomes, escolher) {
    const texto = campo.value.trim().toLocaleLowerCase('pt-BR');
    const opcoes = nomes.filter(nome => nome !== campo.value && nome.toLocaleLowerCase('pt-BR').includes(texto)).slice(0, 8);
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

window.preencherCategoriasFinanceiras = function(selecionada, subcategoria) {
    const tipo = document.getElementById('select-fin-tipo').value;
    const campo = document.getElementById('select-fin-categoria');
    if (selecionada !== undefined) campo.value = selecionada;
    mostrarSugestoesFinanceiras(campo, document.getElementById('fin-sugestoes-categoria'),
        [...opcoesCategoriasFinanceiras(tipo).keys()], () => window.preencherCategoriasFinanceiras(campo.value, ''));
    window.atualizarSubcategoriasFinanceiras(subcategoria);
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

    // O extrato já mascara os lançamentos pessoais de outros perfis no servidor.
    const [catalogo, historico] = await Promise.allSettled([
        cliente.from('suiri_categorias_financeiras').select('tipo,nome,subcategorias').eq('familia_id', familia).order('nome'),
        Suiri.transactionQuery().select('tipo,categoria,subcategoria,transferencia_interna').eq('familia_id', familia)
    ]);
    if (versao !== versaoCategoriasFinanceiras || familia !== window.familiaAtualId || usuario !== obterUsuarioId()) return;
    const cache = categoriasFinanceirasSuiri;
    const dados = cache.familia === familia && cache.usuario === usuario ? cache.dados : [];
    const valor = resposta => resposta.status === 'fulfilled' && !resposta.value.error ? resposta.value.data || [] : [];
    const catalogoAnterior = valor(catalogo).map(linha => ({ ...linha, categoria: linha.nome }));
    categoriasFinanceirasSuiri = { familia, usuario, dados: unirSugestoesFinanceiras([...catalogoAnterior, ...valor(historico), ...dados]) };
    window.preencherCategoriasFinanceiras();
};

document.addEventListener('suiri:session-ready', () => {
    if (categoriasFinanceirasSuiri.familia === window.familiaAtualId && categoriasFinanceirasSuiri.usuario === obterUsuarioId()) return;
    const categoria = document.getElementById('select-fin-categoria');
    if (categoria) window.preencherCategoriasFinanceiras('', '');
});
