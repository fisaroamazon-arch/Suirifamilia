// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-GESTAO.JS (100% COMPLETO E INTEGRAL)
// Mercado com Reconhecimento de Voz Inteligente & Fallback Robusto,
// Leitura de Cupom Fiscal, Sugestões de Cardápio Mensal no Quadro de Avisos,
// Histórico de Preço Médio/Último, Extrato e Agendamentos Recorrentes.
// Padrão de Diálogos: Confirmar / Cancelar (Zero Emojis - 100% SVG)
// =========================================================================

window.itensMercadoAtual = [];
let itemParaExcluirAgendaId = null;
let reconhecimentoVozMercado = null;

// Dicionário local para classificar termos não cadastrados
const DICIONARIO_SEGMENTOS_MERCADO = {
    'Açougue': ['carne', 'frango', 'alcatra', 'picanha', 'patinho', 'linguiça', 'peixe', 'tilapia', 'bisteca', 'coxa', 'moída', 'bacon', 'costela', 'bife'],
    'Hortifrúti': ['tomate', 'cebola', 'batata', 'banana', 'maçã', 'alface', 'laranja', 'cenoura', 'alho', 'limão', 'abacate', 'mamão', 'couve', 'fruta', 'verdura'],
    'Limpeza': ['detergente', 'amaciante', 'sabão', 'desinfetante', 'água sanitária', 'esponja', 'multiuso', 'cloro', 'saco de lixo', 'vassoura', 'sabao'],
    'Higiene': ['sabonete', 'shampoo', 'condicionador', 'pasta de dente', 'creme dental', 'fio dental', 'papel higiênico', 'desodorante', 'cotonete'],
    'Laticínios': ['leite', 'queijo', 'requeijão', 'iogurte', 'manteiga', 'creme de leite', 'leite condensado', 'parmesão'],
    'Padaria': ['pão', 'bolo', 'torrada', 'biscoito', 'bolacha', 'croissant', 'pao'],
    'Bebidas': ['café', 'chá', 'suco', 'refrigerante', 'cerveja', 'água mineral', 'vinho', 'cafe'],
    'Mercearia': ['arroz', 'feijão', 'macarrão', 'óleo', 'azeite', 'açúcar', 'sal', 'farinha', 'molho de tomate', 'milho', 'ervilha', 'aveia', 'feijao', 'oleo']
};

function gerarUUIDSeguro() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try { return crypto.randomUUID(); } catch (e) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function obterClienteSupabase() {
    return window.clienteSupabase || window.cliente || (typeof cliente !== 'undefined' ? cliente : null);
}

function obterUsuarioId() {
    return window.perfilAtual?.id || window.usuarioAtual?.id || null;
}

function obterChaveGemini() {
    return localStorage.getItem('suiri_gemini_api_key') || "";
}

window.identificarSegmentoItem = function(nomeItem) {
    if (!nomeItem) return 'Mercearia';
    const termo = nomeItem.toLowerCase();
    for (const [segmento, palavras] of Object.entries(DICIONARIO_SEGMENTOS_MERCADO)) {
        if (palavras.some(p => termo.includes(p))) {
            return segmento;
        }
    }
    return 'Mercearia';
};

// =========================================================================
// 1. CHECAGEM DE EXTRATO NOMINAL COM PRIVACIDADE INDIVIDUAL
// =========================================================================

window.carregarExtratoPeriodo = async function() {
    const container = document.getElementById('lista-extrato-carteira');
    const cli = obterClienteSupabase();
    if (!container || !window.familiaAtualId || !cli) return;

    let dtInicio = document.getElementById('extrato-filtro-inicio')?.value;
    let dtFim = document.getElementById('extrato-filtro-fim')?.value;

    const hoje = new Date();
    if (!dtInicio) {
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dtInicio = primeiroDia.toISOString().split('T')[0];
        const elIn = document.getElementById('extrato-filtro-inicio');
        if (elIn) elIn.value = dtInicio;
    }
    if (!dtFim) {
        dtFim = hoje.toISOString().split('T')[0];
        const elFim = document.getElementById('extrato-filtro-fim');
        if (elFim) elFim.value = dtFim;
    }

    container.innerHTML = '<span class="status-texto" style="font-size:11px; text-align:center; display:block; padding:8px 0;">Carregando extrato...</span>';

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome, papel')
            .eq('familia_id', window.familiaAtualId);
        window.listaMembrosFamilia = membros || [];
    }

    let { data: transacoes, error } = await cli.from('transacoes')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_transacao', dtInicio)
        .lte('data_transacao', dtFim)
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false });

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const resFallback = await cli.from('transacoes_financeiras')
            .select('*')
            .eq('familia_id', window.familiaAtualId)
            .gte('data_transacao', dtInicio)
            .lte('data_transacao', dtFim)
            .order('data_transacao', { ascending: false });
        transacoes = resFallback.data;
        error = resFallback.error;
    }

    container.innerHTML = '';
    const lista = (!error && transacoes) ? transacoes : [];

    if (lista.length === 0) {
        container.innerHTML = '<span class="status-texto" style="font-size:11px; text-align:center; display:block; padding:12px 0;">Nenhuma movimentação registrada no período.</span>';
        return;
    }

    const usuarioConectadoId = obterUsuarioId();

    lista.forEach(t => {
        const item = document.createElement('div');
        item.className = 'cartao-geral';
        item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 14px; margin-bottom:8px; border-radius:14px;';

        const ehEntrada = t.tipo === 'entrada';
        const cor = ehEntrada ? 'var(--cor-sucesso, #10b981)' : 'var(--cor-erro, #f43f5e)';
        const sinal = ehEntrada ? '+' : '-';
        const dataFmt = t.data_transacao ? t.data_transacao.split('-').reverse().slice(0, 2).join('/') : '--/--';
        const tCodificado = encodeURIComponent(JSON.stringify(t));

        let nomeResponsavel = 'Familiar';
        if (window.listaMembrosFamilia) {
            const membro = window.listaMembrosFamilia.find(m => m.id === t.membro_id);
            if (membro && membro.nome) {
                nomeResponsavel = membro.nome.split(' ')[0];
            } else if (t.membro_id === usuarioConectadoId && window.perfilAtual?.nome) {
                nomeResponsavel = window.perfilAtual.nome.split(' ')[0];
            }
        }

        const ehMeuLancamento = (t.membro_id === usuarioConectadoId);
        const ehPrivativo = (t.escopo === 'pessoal' || t.eh_privado === true);

        let descricaoVisivel = t.descricao || 'Sem descrição';
        let categoriaVisivel = t.categoria || 'Geral';

        if (ehPrivativo && !ehMeuLancamento) {
            descricaoVisivel = ehEntrada ? 'Entrada Particular' : 'Gasto Pessoal';
            categoriaVisivel = 'Privativo';
        }

        const verboTipo = ehEntrada ? 'recebeu' : 'gastou';
        const linhaNominalDestaque = `${nomeResponsavel} ${verboTipo} ${categoriaVisivel.toLowerCase()} R$ ${Number(t.valor || 0).toFixed(2)}`;
        const marcadorDot = `<span style="width:8px; height:8px; border-radius:50%; background:${cor}; display:inline-block; margin-right:6px; flex-shrink:0;"></span>`;

        const tagEscopoSvg = ehPrivativo
            ? `<span style="display:inline-flex; align-items:center; gap:3px; font-size:10px; color:var(--texto-suave);"><svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Pessoal</span>`
            : `<span style="display:inline-flex; align-items:center; gap:3px; font-size:10px; color:var(--texto-suave);"><svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Casa</span>`;

        item.innerHTML = `
            <div style="flex:1; min-width:0; padding-right:8px;">
                <div style="font-size:13.5px; font-weight:700; color:var(--texto-principal, #334155); display:flex; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${marcadorDot}
                    <span style="overflow:hidden; text-overflow:ellipsis;">${linhaNominalDestaque}</span>
                </div>
                <div style="font-size:11px; color:var(--texto-suave, #64748b); margin-top:2px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span>${dataFmt}</span>
                    <span>•</span>
                    <span>Ref: <em>${descricaoVisivel}</em></span>
                    <span>•</span>
                    ${tagEscopoSvg}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <strong style="color:${cor}; font-size:13px; white-space:nowrap;">${sinal} R$ ${Number(t.valor || 0).toFixed(2)}</strong>
                ${(ehMeuLancamento || window.perfilAtual?.papel === 'adm') ? `
                    <button type="button" class="btn-secundario" style="padding:6px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.abrirModalEditarTransacao('${tCodificado}')" title="Editar">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button type="button" class="btn-erro" style="padding:6px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.excluirTransacaoCarteira('${t.id}')" title="Excluir">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(item);
    });
};

window.abrirModalEditarTransacao = function(tJson) {
    const t = typeof tJson === 'string' ? JSON.parse(decodeURIComponent(tJson)) : tJson;
    if (!t) return;

    const elId = document.getElementById('edit-transacao-id');
    const elDesc = document.getElementById('edit-transacao-descricao');
    const elVal = document.getElementById('edit-transacao-valor');
    const elTipo = document.getElementById('edit-transacao-tipo');
    const elEscopo = document.getElementById('edit-transacao-escopo');
    const elCat = document.getElementById('edit-transacao-categoria');
    const elData = document.getElementById('edit-transacao-data');

    if (elId) elId.value = t.id || '';
    if (elDesc) elDesc.value = t.descricao || '';
    if (elVal) elVal.value = t.valor || '';
    if (elTipo) elTipo.value = t.tipo || 'saida';
    if (elEscopo) elEscopo.value = t.escopo || 'pessoal';
    if (elCat) elCat.value = t.categoria || 'Geral';
    if (elData) elData.value = t.data_transacao || '';

    document.getElementById('modal-editar-transacao')?.classList.remove('oculto');
};

window.fecharModalEditarTransacao = function() {
    document.getElementById('modal-editar-transacao')?.classList.add('oculto');
};

window.salvarEdicaoTransacao = async function() {
    const id = document.getElementById('edit-transacao-id')?.value;
    const descricao = document.getElementById('edit-transacao-descricao')?.value.trim();
    const valor = parseFloat(document.getElementById('edit-transacao-valor')?.value);
    const tipo = document.getElementById('edit-transacao-tipo')?.value || 'saida';
    const escopo = document.getElementById('edit-transacao-escopo')?.value || 'pessoal';
    const categoria = document.getElementById('edit-transacao-categoria')?.value || 'Geral';
    const data_transacao = document.getElementById('edit-transacao-data')?.value;
    const cli = obterClienteSupabase();

    if (!descricao || isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe descrição e valor válidos.", "erro");
    }
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const payload = {
        descricao: descricao,
        valor: valor,
        tipo: tipo,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal'),
        categoria: categoria,
        data_transacao: data_transacao
    };

    let { error } = await cli.from('transacoes').update(payload).eq('id', id);

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const res = await cli.from('transacoes_financeiras').update(payload).eq('id', id);
        error = res.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao salvar: " + error.message, "erro");
    }

    window.fecharModalEditarTransacao();
    window.mostrarToast("Lançamento confirmado e atualizado!");
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

window.excluirTransacaoCarteira = async function(id) {
    const confirmou = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente remover este lançamento da sua carteira?", "Confirmar Exclusão")
        : confirm("Deseja realmente remover este lançamento da sua carteira?");

    if (!confirmou) return;
    const cli = obterClienteSupabase();
    if (!cli) return;

    let { error } = await cli.from('transacoes').delete().eq('id', id);

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const res = await cli.from('transacoes_financeiras').delete().eq('id', id);
        error = res.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao excluir: " + error.message, "erro");
    }

    window.mostrarToast("Lançamento removido com sucesso!");
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

window.abrirModalCorrecaoCarteira = function() {
    document.getElementById('modal-correcao-carteira')?.classList.remove('oculto');
};

window.fecharModalCorrecaoCarteira = function() {
    document.getElementById('modal-correcao-carteira')?.classList.add('oculto');
};

window.salvarAjusteCarteira = async function() {
    const inputReal = document.getElementById('input-saldo-real-banco');
    const saldoBanco = parseFloat(inputReal?.value);
    const cli = obterClienteSupabase();
    if (isNaN(saldoBanco)) return window.mostrarToast("Digite um valor válido.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const saldoSistema = parseFloat(document.getElementById('lbl-saldo-carteira-membro')?.textContent.replace(/[^\d.-]/g, '')) || 0;
    const diferenca = saldoBanco - saldoSistema;

    if (diferenca === 0) return window.mostrarToast("O saldo já se encontra alinhado!", "info");

    const tipoAj = diferenca > 0 ? 'entrada' : 'saida';
    const valorAj = Math.abs(diferenca);

    await cli.from('transacoes').insert([{
        familia_id: window.familiaAtualId,
        membro_id: obterUsuarioId(),
        tipo: tipoAj,
        escopo: 'pessoal',
        eh_privado: true,
        descricao: 'Ajuste de Conciliação Bancária',
        categoria: 'Geral',
        valor: valorAj,
        data_transacao: new Date().toISOString().split('T')[0]
    }]);

    window.mostrarToast("Saldo retificado e confirmado com sucesso!");
    if (inputReal) inputReal.value = '';
    window.fecharModalCorrecaoCarteira();
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

// =========================================================================
// 2. MÓDULO DE MERCADO COM HISTÓRICO, IA POR VOZ & VISÃO COMPUTACIONAL
// =========================================================================

window.atualizarEstatisticasPrecoCatalogo = async function(nomeProduto, categoria, precoPago) {
    const cli = obterClienteSupabase();
    if (!cli || !nomeProduto || !precoPago || precoPago <= 0) return;

    let tabela = 'catalogo_produtos_compra';
    let { data: catItem, error } = await cli.from('catalogo_produtos_compra')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .ilike('nome_produto', nomeProduto.trim())
        .maybeSingle();

    if (error && error.message && error.message.includes('catalogo_produtos_compra')) {
        tabela = 'catalogo_produtos';
        const resFallback = await cli.from('catalogo_produtos')
            .select('*')
            .eq('familia_id', window.familiaAtualId)
            .ilike('nome_produto', nomeProduto.trim())
            .maybeSingle();
        catItem = resFallback.data;
    }

    let totalCompras = Number(catItem?.total_compras_registradas || 0);
    let precoMedioAtual = Number(catItem?.preco_medio || 0);
    
    let novoPrecoMedio = totalCompras > 0 ? ((precoMedioAtual * totalCompras) + precoPago) / (totalCompras + 1) : precoPago;
    let novoTotalCompras = totalCompras + 1;

    const payload = {
        familia_id: window.familiaAtualId,
        nome_produto: nomeProduto.trim(),
        ultimo_preco: precoPago,
        preco_medio: Number(novoPrecoMedio.toFixed(2)),
        total_compras_registradas: novoTotalCompras
    };

    if (tabela === 'catalogo_produtos_compra') {
        payload.categoria = categoria || 'Mercearia';
    } else {
        payload.segmento_categoria = categoria || 'Mercearia';
    }

    await cli.from(tabela).upsert([payload], { onConflict: 'familia_id,nome_produto' });
};

// =========================================================================
// 2B. MICROFONE INTELIGENTE NO MERCADO COM PARSER SEMÂNTICO PRECISO
// =========================================================================

window.ouvirComandoVozMercado = function() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        return window.mostrarToast("Reconhecimento de voz não suportado neste navegador.", "erro");
    }

    if (!reconhecimentoVozMercado) {
        reconhecimentoVozMercado = new SpeechRec();
        reconhecimentoVozMercado.lang = 'pt-BR';
        reconhecimentoVozMercado.continuous = false;
        reconhecimentoVozMercado.interimResults = false;

        reconhecimentoVozMercado.onstart = function() {
            document.getElementById('btn-mic-mercado')?.classList.add('ouvindo');
            window.mostrarToast("A ouvir... Diga: '3 óleos por 10 reais' ou 'Café, 2 unidades, 15 reais cada'", "info");
        };

        reconhecimentoVozMercado.onend = function() {
            document.getElementById('btn-mic-mercado')?.classList.remove('ouvindo');
        };

        reconhecimentoVozMercado.onerror = function() {
            document.getElementById('btn-mic-mercado')?.classList.remove('ouvindo');
            window.mostrarToast("Não foi possível captar o produto. Tente novamente.", "erro");
        };

        reconhecimentoVozMercado.onresult = function(evento) {
            const frase = evento.results[0][0].transcript;
            window.processarItemMercadoPorVozIA(frase);
        };
    }

    try { reconhecimentoVozMercado.start(); } catch (e) { reconhecimentoVozMercado.stop(); }
};

window.processarItemMercadoPorVozIA = async function(frase) {
    if (!frase) return;
    const apiKey = obterChaveGemini();
    let sucessoIA = false;

    if (apiKey && apiKey.length > 20 && !apiKey.startsWith("AQ.") && navigator.onLine) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const promptText = `Analise a seguinte frase dita para adicionar um item de supermercado: "${frase}".
            Identifique o produto no singular, a quantidade e o valor unitário.
            Responda EXATAMENTE e APENAS com um JSON válido:
            {"nome": "Nome no Singular", "quantidade": 1.0, "valor_unitario": 0.0}`;

            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                let texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();
                const obj = JSON.parse(texto);

                if (obj && obj.nome) {
                    await window.aplicarValoresDetectadosMercado(obj.nome, obj.quantidade, obj.valor_unitario);
                    sucessoIA = true;
                }
            }
        } catch (err) {
            console.warn("API de voz indisponível, aplicando motor semântico local:", err);
        }
    }

    if (!sucessoIA) {
        window.processarItemMercadoLocalFallback(frase);
    }
};

window.processarItemMercadoLocalFallback = async function(fraseOriginal) {
    let frase = fraseOriginal.toLowerCase().trim();

    const numerosExtenso = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
        'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
    };

    let unit = 0;
    const padraoValor = /(?:por|custou|de|valor de|a|r\$)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais|real|cada)?/i;
    const matchValor = frase.match(padraoValor);

    if (matchValor) {
        unit = parseFloat(matchValor[1].replace(',', '.')) || 0;
        frase = frase.replace(matchValor[0], ' ');
    } else {
        const matchValorSimples = frase.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:reais|real)/i);
        if (matchValorSimples) {
            unit = parseFloat(matchValorSimples[1].replace(',', '.')) || 0;
            frase = frase.replace(matchValorSimples[0], ' ');
        }
    }

    let qtd = 1;
    let achouQtd = false;

    for (const [palavra, valorNum] of Object.entries(numerosExtenso)) {
        const regExtenso = new RegExp(`\\b${palavra}\\b`, 'i');
        if (regExtenso.test(frase)) {
            qtd = valorNum;
            achouQtd = true;
            frase = frase.replace(regExtenso, ' ');
            break;
        }
    }

    if (!achouQtd) {
        const matchQtd = frase.match(/(\d+(?:[.,]\d+)?)\s*(?:unidades|unidade|pct|pacotes|kg|latas|garrafas)?/i);
        if (matchQtd) {
            qtd = parseFloat(matchQtd[1].replace(',', '.')) || 1;
            frase = frase.replace(matchQtd[0], ' ');
        }
    }

    let nomeLimpo = frase
        .replace(/\b(unidades|unidade|pct|pacotes|kg|quilos|latas|garrafas|caixas)\b/gi, '')
        .replace(/\b(por|custou|de|valor|cada|r\$|reais|real|conto|peguei|comprei|coloquei)\b/gi, '')
        .replace(/[^a-zà-ú\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (nomeLimpo === 'olhos' || nomeLimpo === 'oleos' || nomeLimpo === 'oleo' || nomeLimpo === 'óleo' || nomeLimpo === 'óleos') {
        nomeLimpo = 'Óleo';
    } else if (nomeLimpo === 'leites' || nomeLimpo === 'leite') {
        nomeLimpo = 'Leite';
    } else if (nomeLimpo === 'arroz') {
        nomeLimpo = 'Arroz';
    } else if (nomeLimpo === 'feijoes' || nomeLimpo === 'feijões' || nomeLimpo === 'feijao') {
        nomeLimpo = 'Feijão';
    } else if (nomeLimpo.endsWith('s') && nomeLimpo.length > 3) {
        nomeLimpo = nomeLimpo.slice(0, -1);
        nomeLimpo = nomeLimpo.charAt(0).toUpperCase() + nomeLimpo.slice(1);
    } else if (nomeLimpo.length >= 2) {
        nomeLimpo = nomeLimpo.charAt(0).toUpperCase() + nomeLimpo.slice(1);
    } else {
        nomeLimpo = 'Produto';
    }

    await window.aplicarValoresDetectadosMercado(nomeLimpo, qtd, unit);
};

window.aplicarValoresDetectadosMercado = async function(nome, qtd, unit) {
    const inpNome = document.getElementById('input-novo-item-mercado');
    const inpQtd = document.getElementById('input-novo-item-qtd');
    const inpUnit = document.getElementById('input-novo-item-unit');
    const selCat = document.getElementById('select-novo-item-categoria');

    const qtdFinal = parseFloat(qtd) || 1;
    const unitFinal = parseFloat(unit) || 0;

    if (inpNome) inpNome.value = nome;
    if (inpQtd) inpQtd.value = qtdFinal.toString();
    if (inpUnit) inpUnit.value = unitFinal > 0 ? unitFinal.toFixed(2) : '';

    const cli = obterClienteSupabase();
    if (cli && window.familiaAtualId && nome) {
        const { data: catItem } = await cli.from('catalogo_produtos_compra')
            .select('categoria')
            .eq('familia_id', window.familiaAtualId)
            .ilike('nome_produto', nome)
            .maybeSingle();

        if (selCat) {
            if (catItem?.categoria) selCat.value = catItem.categoria;
            else selCat.value = window.identificarSegmentoItem(nome);
        }
    }

    window.mostrarToast(`Produto: ${nome} • Qtd: ${qtdFinal} • Unit: R$ ${unitFinal.toFixed(2)}`);
};

// =========================================================================
// 2C. MOTOR DE IA: LEITURA DE CUPOM FISCAL (GEMINI VISION)
// =========================================================================

window.processarCupomFiscalIA = async function(evento) {
    const arquivo = evento.target?.files?.[0];
    if (!arquivo) return;

    const cli = obterClienteSupabase();
    const usuarioId = obterUsuarioId();

    if (!cli || !window.familiaAtualId) {
        return window.mostrarToast("Sessão não identificada. Recarregue a página.", "erro");
    }

    const apiKey = obterChaveGemini();
    if (!apiKey) {
        const chaveInformada = prompt("Insira a sua chave Google Gemini API (Google AI Studio):");
        if (chaveInformada) {
            localStorage.setItem('suiri_gemini_api_key', chaveInformada.trim());
        } else {
            return window.mostrarToast("Chave da IA não informada.", "erro");
        }
    }

    window.mostrarToast("Analisando cupom com IA... Aguarde.", "info");

    try {
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(arquivo);
            reader.onload = () => {
                const res = reader.result;
                resolve(res.includes(',') ? res.split(',')[1] : res);
            };
            reader.onerror = erro => reject(erro);
        });

        const chaveAtiva = obterChaveGemini();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${chaveAtiva}`;

        const payload = {
            contents: [{
                parts: [
                    {
                        text: "Analise a imagem deste cupom fiscal ou nota fiscal. Extraia o nome do estabelecimento, o valor total da compra e os produtos. Classifique em: Mercearia, Açougue, Hortifrúti, Limpeza, Higiene, Laticínios, Padaria, Bebidas, Geral. Responda EXATAMENTE com um JSON: {\"estabelecimento\": \"Nome\", \"total\": 0.00, \"categoria\": \"Categoria\", \"itens\": [{\"nome\": \"Item\", \"quantidade\": 1, \"valor_unitario\": 0.00, \"categoria\": \"Categoria\"}]}"
                    },
                    {
                        inlineData: {
                            mimeType: arquivo.type || 'image/jpeg',
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        const resposta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
            throw new Error(`Erro na API Gemini (${resposta.status})`);
        }

        const dados = await resposta.json();
        let textoResposta = dados?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        textoResposta = textoResposta.replace(/```json/g, '').replace(/```/g, '').trim();

        if (!textoResposta) throw new Error("Resposta da IA vazia.");

        const cupomExtraido = JSON.parse(textoResposta);

        // Preenche o formulário de Lançamento Rápido em Finanças
        const inDesc = document.getElementById('input-fin-descricao');
        const inVal = document.getElementById('input-fin-valor');
        const selCat = document.getElementById('select-fin-categoria');
        const selTipo = document.getElementById('select-fin-tipo');
        const selEscopo = document.getElementById('select-fin-escopo');

        if (inDesc) inDesc.value = cupomExtraido.estabelecimento || 'Cupom Fiscal';
        if (inVal && cupomExtraido.total) inVal.value = Number(cupomExtraido.total).toFixed(2);
        if (selCat && cupomExtraido.categoria) selCat.value = cupomExtraido.categoria;
        if (selTipo) selTipo.value = 'saida';
        if (selEscopo) selEscopo.value = 'casa';

        // Se houver itens detalhados, cadastra também no módulo de mercado
        if (Array.isArray(cupomExtraido.itens) && cupomExtraido.itens.length > 0) {
            const registros = cupomExtraido.itens.map(item => {
                const qtd = parseFloat(item.quantidade) || 1;
                const unit = parseFloat(item.valor_unitario) || 0;
                const subtotal = qtd * unit;
                const cat = item.categoria || window.identificarSegmentoItem(item.nome);

                return {
                    familia_id: window.familiaAtualId,
                    nome_item: String(item.nome || 'Produto').trim(),
                    segmento_categoria: cat,
                    criado_por: usuarioId,
                    status: 'comprado',
                    quantidade: qtd,
                    valor_unitario: unit,
                    valor_total: subtotal,
                    comprado: true,
                    no_carrinho: true
                };
            });

            await cli.from('itens_mercado').insert(registros);
            for (const r of registros) {
                if (r.valor_unitario > 0) {
                    await window.atualizarEstatisticasPrecoCatalogo(r.nome_item, r.segmento_categoria, r.valor_unitario);
                }
            }
        }

        window.mostrarToast(`Cupom processado! R$ ${Number(cupomExtraido.total || 0).toFixed(2)} preenchidos em Finanças.`);
    } catch (erro) {
        console.error("Erro no cupom fiscal:", erro);
        window.mostrarToast("Falha ao ler o cupom. Verifique a chave ou tire foto mais nítida.", "erro");
    } finally {
        evento.target.value = '';
    }
};

window.alternarVisualizacaoMercado = function(modo) {
    const blocoLista = document.getElementById('bloco-lista-planejamento-mercado');
    const blocoPlanilha = document.getElementById('bloco-planilha-modo-mercado');
    const btnLista = document.getElementById('btn-aba-lista-mes');
    const btnPlanilha = document.getElementById('btn-aba-modo-mercado');

    if (modo === 'lista') {
        blocoLista?.classList.remove('oculto');
        blocoPlanilha?.classList.add('oculto');
        if (btnLista) btnLista.className = 'btn-principal';
        if (btnPlanilha) btnPlanilha.className = 'btn-secundario';
    } else {
        blocoLista?.classList.add('oculto');
        blocoPlanilha?.classList.remove('oculto');
        if (btnLista) btnLista.className = 'btn-secundario';
        if (btnPlanilha) btnPlanilha.className = 'btn-principal';
    }
    window.carregarItensMercado();
};

window.filtrarAutocompleteMercado = async function(termo) {
    const dropdown = document.getElementById('dropdown-autocomplete-mercado');
    const cli = obterClienteSupabase();
    if (!termo || termo.length < 2 || !cli) {
        dropdown?.classList.add('oculto');
        return;
    }
    
    let { data, error } = await cli.from('catalogo_produtos_compra')
        .select('nome_produto, categoria, ultimo_preco, preco_medio')
        .eq('familia_id', window.familiaAtualId)
        .ilike('nome_produto', `%${termo}%`)
        .limit(6);

    if (error && error.message && error.message.includes('catalogo_produtos_compra')) {
        const resFallback = await cli.from('catalogo_produtos')
            .select('nome_produto, segmento_categoria, ultimo_preco, preco_medio')
            .eq('familia_id', window.familiaAtualId)
            .ilike('nome_produto', `%${termo}%`)
            .limit(6);
        data = (resFallback.data || []).map(d => ({ ...d, categoria: d.segmento_categoria }));
    }
        
    if (data && data.length > 0) {
        dropdown.innerHTML = data.map(i => {
            const uPreco = Number(i.ultimo_preco || 0);
            const mPreco = Number(i.preco_medio || 0);
            const tagPreco = uPreco > 0 
                ? `<span style="font-size:10px; color:var(--cor-sucesso, #10b981); font-weight:700;">Último: R$ ${uPreco.toFixed(2)} | Médio: R$ ${mPreco.toFixed(2)}</span>`
                : '';

            return `
                <div style="padding:10px 12px; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" 
                     onclick="window.selecionarAutocomplete('${i.nome_produto}', '${i.categoria || 'Mercearia'}', ${uPreco})">
                    <div>
                        <div style="font-weight:600; color:var(--texto-principal);">${i.nome_produto}</div>
                        ${tagPreco}
                    </div>
                    <span style="font-size:10px; color:var(--texto-suave); font-weight:700; background:var(--pastel-ouro, #fef3c7); padding:2px 6px; border-radius:4px;">${i.categoria || 'Mercearia'}</span>
                </div>
            `;
        }).join('');
        dropdown.classList.remove('oculto');
    } else {
        dropdown.classList.add('oculto');
    }
};

window.selecionarAutocomplete = function(nome, categoria, ultimoPreco) {
    const inp = document.getElementById('input-novo-item-mercado');
    const sel = document.getElementById('select-novo-item-categoria');
    const inpUnit = document.getElementById('input-novo-item-unit');
    const drop = document.getElementById('dropdown-autocomplete-mercado');

    if (inp) inp.value = nome;
    if (sel && categoria) sel.value = categoria;
    if (inpUnit && ultimoPreco > 0) {
        inpUnit.placeholder = `Último: R$ ${ultimoPreco.toFixed(2)}`;
    }
    if (drop) drop.classList.add('oculto');
};

window.adicionarItemMercado = async function() {
    const inpNome = document.getElementById('input-novo-item-mercado');
    const selCat = document.getElementById('select-novo-item-categoria');
    const inpQtd = document.getElementById('input-novo-item-qtd');
    const inpUnit = document.getElementById('input-novo-item-unit');

    const nome = inpNome?.value?.trim();
    let categoria = selCat?.value || 'auto';
    const qtd = parseFloat(inpQtd?.value) || 1;
    const unit = parseFloat(inpUnit?.value) || 0;
    const cli = obterClienteSupabase();
    
    if (!nome) return window.mostrarToast("Digite o nome do produto.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    if (categoria === 'auto' || !categoria) {
        const { data: itemCatalogo } = await cli.from('catalogo_produtos_compra')
            .select('categoria')
            .eq('familia_id', window.familiaAtualId)
            .ilike('nome_produto', nome)
            .maybeSingle();

        if (itemCatalogo && itemCatalogo.categoria) {
            categoria = itemCatalogo.categoria;
        } else {
            categoria = window.identificarSegmentoItem(nome);
        }
    }

    const foiComprado = unit > 0;
    const subtotal = qtd * unit;

    const payload = {
        familia_id: window.familiaAtualId,
        nome_item: nome,
        segmento_categoria: categoria,
        criado_por: obterUsuarioId(),
        status: foiComprado ? 'comprado' : 'pendente',
        quantidade: qtd,
        valor_unitario: unit,
        valor_total: subtotal,
        comprado: foiComprado,
        no_carrinho: foiComprado
    };

    const { error } = await cli.from('itens_mercado').insert([payload]);

    if (!error) {
        if (foiComprado) {
            await window.atualizarEstatisticasPrecoCatalogo(nome, categoria, unit);
        }

        if (inpNome) inpNome.value = '';
        if (inpQtd) inpQtd.value = '1';
        if (inpUnit) {
            inpUnit.value = '';
            inpUnit.placeholder = 'Valor (R$)';
        }
        
        window.carregarItensMercado();
        window.mostrarToast(foiComprado ? "Item confirmado no carrinho!" : "Item confirmado na lista!");
    } else {
        window.mostrarToast("Erro ao adicionar produto: " + error.message, "erro");
    }
};

window.carregarItensMercado = async function() {
    const cli = obterClienteSupabase();
    if (!window.familiaAtualId || !cli) return;
    
    const { data: itens } = await cli.from('itens_mercado')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('criado_em', { ascending: false });

    let catalogo = [];
    let { data: catData, error: catErr } = await cli.from('catalogo_produtos_compra')
        .select('nome_produto, ultimo_preco, preco_medio')
        .eq('familia_id', window.familiaAtualId);

    if (catErr) {
        const { data: catDataFallback } = await cli.from('catalogo_produtos')
            .select('nome_produto, ultimo_preco, preco_medio')
            .eq('familia_id', window.familiaAtualId);
        catalogo = catDataFallback || [];
    } else {
        catalogo = catData || [];
    }

    window.itensMercadoAtual = (itens || []).map(it => {
        const ref = catalogo.find(c => c.nome_produto?.toLowerCase() === it.nome_item?.toLowerCase());
        return {
            ...it,
            ref_ultimo_preco: Number(ref?.ultimo_preco || 0),
            ref_preco_medio: Number(ref?.preco_medio || 0)
        };
    });
        
    window.renderizarListaMercado();
    window.renderizarPlanilhaMercado();
};

window.renderizarListaMercado = function() {
    const container = document.getElementById('container-itens-lista-mes');
    if (!container) return;
    
    const pendentes = window.itensMercadoAtual.filter(i => !i.comprado && !i.no_carrinho);

    if (pendentes.length === 0) {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:20px 0;">Sua lista de planejamento está vazia.</p>';
        return;
    }

    container.innerHTML = pendentes.map(i => {
        const badgePreco = i.ref_preco_medio > 0 
            ? `<div style="font-size:10px; color:var(--cor-sucesso, #10b981); margin-top:1px;">Preço Médio: R$ ${i.ref_preco_medio.toFixed(2)}</div>`
            : '';

        return `
            <div class="cartao-geral" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; margin-bottom:6px;">
                <div>
                    <strong style="font-size:14px; color:var(--texto-principal);">${i.nome_item}</strong>
                    <div style="font-size:11px; color:var(--texto-suave); margin-top:2px;">${i.segmento_categoria}</div>
                    ${badgePreco}
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn-secundario" style="padding:6px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.abrirModalEditarMercado('${i.id}')" title="Editar">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-erro" style="padding:6px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.removerItemMercado('${i.id}')" title="Excluir">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.renderizarPlanilhaMercado = function() {
    const tbody = document.getElementById('corpo-tabela-planilha-mercado');
    const lblTotal = document.getElementById('valor-total-carrinho-mercado');
    if (!tbody || !lblTotal) return;
    
    let totalCarrinho = 0;
    const totaisPorSegmento = {};

    if (window.itensMercadoAtual.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--texto-suave);">Nenhum item na lista ou no carrinho</td></tr>';
        lblTotal.textContent = 'R$ 0,00';
        window.renderizarPainelSegmentosMercado({});
        return;
    }
    
    tbody.innerHTML = window.itensMercadoAtual.map(i => {
        const estMarcado = i.no_carrinho || i.comprado;
        const subtotal = (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0);
        
        if (estMarcado) {
            totalCarrinho += subtotal;
            const seg = i.segmento_categoria || 'Mercearia';
            totaisPorSegmento[seg] = (totaisPorSegmento[seg] || 0) + subtotal;
        }

        const tagHistorico = i.ref_preco_medio > 0 
            ? `<div style="font-size:9.5px; color:var(--cor-primaria, #d97706); font-weight:normal;">Médio: R$ ${i.ref_preco_medio.toFixed(2)}</div>`
            : '';
        
        return `
            <tr style="${estMarcado ? 'background:rgba(16, 185, 129, 0.05);' : ''}">
                <td style="text-align:center;">
                    <input type="checkbox" ${estMarcado ? 'checked' : ''} onchange="window.atualizarItemMercado('${i.id}', 'no_carrinho', this.checked)">
                </td>
                <td style="font-size:12px; font-weight:700; ${estMarcado ? 'color:var(--cor-sucesso, #10b981); text-decoration:line-through;' : ''}">
                    ${i.nome_item}
                    <div style="font-size:10px; color:var(--texto-suave); font-weight:normal;">${i.segmento_categoria}</div>
                    ${tagHistorico}
                </td>
                <td>
                    <input type="number" step="0.1" value="${i.quantidade || 1}" style="width:100%; padding:4px;" onchange="window.atualizarQtdOuValorMercado('${i.id}', 'quantidade', this.value)">
                </td>
                <td>
                    <input type="number" step="0.01" value="${i.valor_unitario || 0}" style="width:100%; padding:4px;" onchange="window.atualizarQtdOuValorMercado('${i.id}', 'valor_unitario', this.value)">
                </td>
                <td style="text-align:right; font-weight:700; font-size:12px; white-space:nowrap;">
                    R$ ${subtotal.toFixed(2)}
                </td>
                <td style="text-align:center;">
                    <button class="btn-erro" style="padding:4px 6px; font-size:11px; display:inline-flex; align-items:center;" onclick="window.removerItemMercado('${i.id}')">
                        <svg class="icone-svg" style="width:12px; height:12px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    lblTotal.textContent = `R$ ${totalCarrinho.toFixed(2)}`;
    window.renderizarPainelSegmentosMercado(totaisPorSegmento);
};

window.renderizarPainelSegmentosMercado = function(totaisSegmentos) {
    let container = document.getElementById('painel-totais-segmentos-mercado');
    if (!container) {
        const blocoPlanilha = document.getElementById('bloco-planilha-modo-mercado');
        if (!blocoPlanilha) return;
        
        container = document.createElement('div');
        container.id = 'painel-totais-segmentos-mercado';
        container.style.cssText = 'margin:12px 0; padding:12px; background:var(--pastel-card, #ffffff); border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:14px;';
        
        const tabelaContainer = blocoPlanilha.querySelector('.tabela-mercado-container');
        if (tabelaContainer) {
            tabelaContainer.parentNode.insertBefore(container, tabelaContainer.nextSibling);
        } else {
            blocoPlanilha.appendChild(container);
        }
    }

    const segmentos = Object.keys(totaisSegmentos);
    if (segmentos.length === 0) {
        container.innerHTML = '<span style="font-size:11px; color:var(--texto-suave);">Marque os itens no carrinho para ver o total por segmento.</span>';
        return;
    }

    let html = '<div style="font-size:11px; font-weight:800; color:var(--cor-primaria, #d97706); margin-bottom:8px; text-transform:uppercase;">Subtotais por Segmento:</div>';
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:6px;">';
    
    segmentos.forEach(seg => {
        const valor = totaisSegmentos[seg];
        html += `
            <div style="background:var(--suiri-surface-secondary-light, #fef9ea); padding:6px 10px; border-radius:8px; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; font-weight:600; color:var(--texto-principal);">${seg}:</span>
                <strong style="font-size:11.5px; color:var(--cor-sucesso, #10b981);">R$ ${valor.toFixed(2)}</strong>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

window.atualizarQtdOuValorMercado = async function(id, campo, valor) {
    const cli = obterClienteSupabase();
    if (!cli) return;

    const valNum = parseFloat(valor) || 0;
    const item = window.itensMercadoAtual.find(i => i.id === id);
    if (item) {
        item[campo] = valNum;
        const total = (Number(item.quantidade) || 0) * (Number(item.valor_unitario) || 0);
        item.valor_total = total;
        
        window.renderizarPlanilhaMercado();
        await cli.from('itens_mercado').update({ [campo]: valNum, valor_total: total }).eq('id', id);

        if (campo === 'valor_unitario' && valNum > 0) {
            await window.atualizarEstatisticasPrecoCatalogo(item.nome_item, item.segmento_categoria, valNum);
        }
    }
};

window.atualizarItemMercado = async function(id, campo, valor) {
    const cli = obterClienteSupabase();
    if (!cli) return;

    const item = window.itensMercadoAtual.find(i => i.id === id);
    if (item) {
        item[campo] = valor;
        if (campo === 'no_carrinho') item.comprado = valor;
        window.renderizarPlanilhaMercado();
        await cli.from('itens_mercado').update({ [campo]: valor, comprado: item.comprado }).eq('id', id);

        if (campo === 'no_carrinho' && valor === true && Number(item.valor_unitario) > 0) {
            await window.atualizarEstatisticasPrecoCatalogo(item.nome_item, item.segmento_categoria, Number(item.valor_unitario));
        }
    }
};

window.abrirModalEditarMercado = function(id) {
    const item = window.itensMercadoAtual.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-mercado-id').value = item.id;
    document.getElementById('edit-mercado-nome').value = item.nome_item;
    document.getElementById('edit-mercado-categoria').value = item.segmento_categoria || 'Mercearia';
    document.getElementById('edit-mercado-qtd').value = item.quantidade || 1;
    document.getElementById('edit-mercado-unit').value = item.valor_unitario || 0;

    document.getElementById('modal-editar-mercado')?.classList.remove('oculto');
};

window.fecharModalEditarMercado = function() {
    document.getElementById('modal-editar-mercado')?.classList.add('oculto');
};

window.salvarEdicaoItemMercado = async function() {
    const id = document.getElementById('edit-mercado-id').value;
    const nome = document.getElementById('edit-mercado-nome').value.trim();
    const categoria = document.getElementById('edit-mercado-categoria').value;
    const qtd = parseFloat(document.getElementById('edit-mercado-qtd').value) || 1;
    const unit = parseFloat(document.getElementById('edit-mercado-unit').value) || 0;
    const cli = obterClienteSupabase();

    if (!nome) return window.mostrarToast("O nome do produto é obrigatório.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const subtotal = qtd * unit;
    await cli.from('itens_mercado').update({
        nome_item: nome,
        segmento_categoria: categoria,
        quantidade: qtd,
        valor_unitario: unit,
        valor_total: subtotal
    }).eq('id', id);

    if (unit > 0) {
        await window.atualizarEstatisticasPrecoCatalogo(nome, categoria, unit);
    }

    window.mostrarToast("Produto confirmado e atualizado!");
    window.fecharModalEditarMercado();
    window.carregarItensMercado();
};

window.removerItemMercado = async function(id) {
    const cli = obterClienteSupabase();
    if (!cli) return;
    await cli.from('itens_mercado').delete().eq('id', id);
    window.carregarItensMercado();
};

// =========================================================================
// 3. FINALIZAR COMPRA, GRÁFICOS & GATILHO DE CARDÁPIO
// =========================================================================

window.finalizarCompraMercado = async function() {
    const itensNoCarrinho = window.itensMercadoAtual.filter(i => (i.no_carrinho || i.comprado) && (Number(i.valor_total) > 0));
    if (itensNoCarrinho.length === 0) return window.mostrarToast("Nenhum item com valor marcado no carrinho.", "erro");
    const cli = obterClienteSupabase();
    if (!cli) return;
    
    let total = 0;
    const segmentos = {};
    
    for (const i of itensNoCarrinho) {
        const sub = (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0);
        total += sub;
        const seg = i.segmento_categoria || 'Mercearia';
        segmentos[seg] = (segmentos[seg] || 0) + sub;

        if (Number(i.valor_unitario) > 0) {
            await window.atualizarEstatisticasPrecoCatalogo(i.nome_item, i.segmento_categoria, Number(i.valor_unitario));
        }
    }
    
    const ids = itensNoCarrinho.map(i => i.id);
    await cli.from('itens_mercado').delete().in('id', ids);
    
    const hojeStr = new Date().toISOString().split('T')[0];
    await cli.from('transacoes').insert([{
        familia_id: window.familiaAtualId,
        membro_id: obterUsuarioId(),
        tipo: 'saida',
        escopo: 'casa',
        eh_privado: false,
        descricao: 'Compra no Supermercado',
        categoria: 'Supermercado',
        valor: total,
        data_transacao: hojeStr
    }]);

    const resTotal = document.getElementById('resumo-total-gasto-mercado');
    if (resTotal) resTotal.textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('modal-fechamento-mercado')?.classList.remove('oculto');
    
    window.gerarGraficosFechamentoMercado(segmentos);
    window.carregarItensMercado();
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();

    window.gerarSugestoesCardapioMesIA();
};

window.gerarGraficosFechamentoMercado = function(segmentos) {
    const ctxPizza = document.getElementById('grafico-pizza-segmentos')?.getContext('2d');
    if (!ctxPizza || typeof Chart === 'undefined') return;
    
    const labels = Object.keys(segmentos);
    const data = Object.values(segmentos);
    
    if (window.chartPizzaMercado) window.chartPizzaMercado.destroy();
    
    window.chartPizzaMercado = new Chart(ctxPizza, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6']
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } 
            } 
        }
    });
};

window.fecharModalGraficosMercado = function() { 
    document.getElementById('modal-fechamento-mercado')?.classList.add('oculto'); 
};

// =========================================================================
// 3B. SUGESTÕES DE CARDÁPIO DO MÊS (IA COM FALLBACK LOCAL INTELIGENTE)
// =========================================================================

window.gerarSugestoesCardapioMesIA = async function() {
    const container = document.getElementById('lista-sugestoes-cardapio-mes');
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId || !container) return;

    container.innerHTML = '<span style="font-size:11px; color:var(--texto-suave); text-align:center; display:block; padding:8px;">A IA está a criar o cardápio do mês com base na despensa...</span>';

    let { data: itensComprados } = await cli.from('catalogo_produtos_compra')
        .select('nome_produto, categoria')
        .eq('familia_id', window.familiaAtualId)
        .limit(20);

    if (!itensComprados || itensComprados.length === 0) {
        const { data: itensFallback } = await cli.from('catalogo_produtos')
            .select('nome_produto, segmento_categoria')
            .eq('familia_id', window.familiaAtualId)
            .limit(20);
        itensComprados = (itensFallback || []).map(i => ({ nome_produto: i.nome_produto, categoria: i.segmento_categoria }));
    }

    const alimentos = (itensComprados || []).filter(i => {
        const c = (i.categoria || '').toLowerCase();
        return c.includes('mercearia') || c.includes('açougue') || c.includes('hortifrúti') || c.includes('laticínios') || c.includes('padaria');
    }).map(i => i.nome_produto);

    if (alimentos.length === 0) {
        container.innerHTML = '<span style="font-size:11px; color:var(--texto-suave); text-align:center; display:block; padding:8px;">Registe produtos de alimentação no mercado para gerar sugestões de refeições.</span>';
        return;
    }

    let geradoComSucesso = false;
    const apiKey = obterChaveGemini();

    if (apiKey && apiKey.length > 20 && !apiKey.startsWith("AQ.") && navigator.onLine) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const promptText = `Com base nestes alimentos comprados para a família: ${alimentos.join(', ')}.
            Sugira exatamente 3 refeições práticas, nutritivas e económicas para o mês.
            Responda EXATAMENTE com um array JSON válido sem markdown, sem crases:
            [{"prato": "Nome do Prato", "ingredientes": "Ingredientes chave utilizados", "tipo": "Almoço / Jantar"}]`;

            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                let texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();
                const listaCardapio = JSON.parse(texto);

                if (Array.isArray(listaCardapio) && listaCardapio.length > 0) {
                    container.innerHTML = listaCardapio.map(p => `
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3.5px solid #10b981; border-radius:10px; padding:7px 10px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="flex:1; min-width:0;">
                                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                                    <span style="font-size:9.5px; font-weight:800; background:#dcfce7; color:#15803d; padding:1px 6px; border-radius:4px;">${p.tipo || 'Refeição'}</span>
                                </div>
                                <strong style="font-size:12px; color:#1e293b; display:block;">${p.prato}</strong>
                                <span style="font-size:10.5px; color:#64748b; display:block; margin-top:1px;">Usa: ${p.ingredientes}</span>
                            </div>
                        </div>
                    `).join('');
                    geradoComSucesso = true;
                    window.mostrarToast("Sugestões de cardápio do mês atualizadas!");
                }
            }
        } catch (e) {
            console.warn("API de cardápio em fallback local:", e);
        }
    }

    if (!geradoComSucesso) {
        const baseAlimentos = alimentos.slice(0, 3).join(', ');
        container.innerHTML = `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3.5px solid #10b981; border-radius:10px; padding:7px 10px; margin-bottom:4px;">
                <span style="font-size:9.5px; font-weight:800; background:#dcfce7; color:#15803d; padding:1px 6px; border-radius:4px;">Almoço Prático</span>
                <strong style="font-size:12px; color:#1e293b; display:block; margin-top:2px;">Refogado Especial do Lar</strong>
                <span style="font-size:10.5px; color:#64748b;">Aproveitamento inteligente de: ${baseAlimentos || 'ingredientes da despensa'}.</span>
            </div>
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3.5px solid #0284c7; border-radius:10px; padding:7px 10px;">
                <span style="font-size:9.5px; font-weight:800; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px;">Jantar Leve</span>
                <strong style="font-size:12px; color:#1e293b; display:block; margin-top:2px;">Arroz de Forno Reconfortante</strong>
                <span style="font-size:10.5px; color:#64748b;">Combinação dos itens de mercearia e laticínios do mês.</span>
            </div>
        `;
    }
};

// =========================================================================
// 4. AGENDAMENTO DE CONTAS E RECORRÊNCIA NA AGENDA (COM PRIVACIDADE)
// =========================================================================

window.adicionarItemAgendaFinanceira = async function() {
    const descricao = document.getElementById('input-agenda-descricao')?.value.trim();
    const valor = parseFloat(document.getElementById('input-agenda-valor')?.value);
    const vencimentoStr = document.getElementById('input-agenda-vencimento')?.value;
    const tipo = document.getElementById('select-agenda-tipo')?.value || 'conta_pagar';
    const recorrencia = document.getElementById('select-agenda-recorrencia')?.value || 'unica';
    const escopo = document.getElementById('select-agenda-escopo')?.value || 'casa';
    const categoria = document.getElementById('select-agenda-categoria')?.value || 'Geral';
    const cli = obterClienteSupabase();
    const usuarioId = obterUsuarioId();

    if (!descricao || isNaN(valor) || !vencimentoStr) return window.mostrarToast("Preencha descrição, valor e vencimento.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const datasGeradas = [];
    const dataInicial = new Date(vencimentoStr + 'T12:00:00'); 
    let qtdParcelas = 1;
    let ehPerpetua = false;
    let grupoId = gerarUUIDSeguro();

    if (recorrencia === 'mensal_12x') {
        qtdParcelas = 12;
    } else if (recorrencia === 'perpetua') {
        qtdParcelas = 36;
        ehPerpetua = true;
    }

    for (let i = 0; i < qtdParcelas; i++) {
        const dtCopy = new Date(dataInicial);
        dtCopy.setMonth(dtCopy.getMonth() + i);
        datasGeradas.push({
            data_vencimento: dtCopy.toISOString().split('T')[0],
            parcela_num: i + 1
        });
    }

    const payloadBatch = datasGeradas.map(d => {
        const obj = {
            familia_id: window.familiaAtualId,
            tipo_evento: tipo,
            escopo: escopo,
            eh_privado: (escopo === 'pessoal'),
            categoria: categoria,
            descricao: qtdParcelas > 1 && !ehPerpetua ? `${descricao} (${d.parcela_num}/${qtdParcelas})` : descricao,
            valor: valor,
            data_vencimento: d.data_vencimento,
            recorrencia_grupo_id: qtdParcelas > 1 ? grupoId : null,
            numero_parcela: d.parcela_num,
            total_parcelas: qtdParcelas,
            eh_perpetua: ehPerpetua,
            status: 'pendente',
            pago: false
        };
        if (usuarioId) {
            obj.criado_por = usuarioId;
            obj.membro_id = usuarioId;
        }
        return obj;
    });

    let { error } = await cli.from('agenda_financeira').insert(payloadBatch);

    if (error && error.message && error.message.includes('criado_por')) {
        const payloadFallback = payloadBatch.map(p => {
            const copia = { ...p };
            delete copia.criado_por;
            return copia;
        });
        const res = await cli.from('agenda_financeira').insert(payloadFallback);
        error = res.error;
    }

    if (!error) {
        window.mostrarToast(qtdParcelas > 1 ? "Agendamentos recorrentes confirmados!" : "Agendamento confirmado no calendário!");
        const inDesc = document.getElementById('input-agenda-descricao');
        const inVal = document.getElementById('input-agenda-valor');
        if (inDesc) inDesc.value = '';
        if (inVal) inVal.value = '';
        if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
        if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
        if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
    } else {
        window.mostrarToast("Erro ao agendar: " + error.message, "erro");
    }
};

window.excluirContaRecorrenteAgenda = async function(id, ehPerpetua) {
    if (ehPerpetua || typeof ehPerpetua === 'undefined' || ehPerpetua === 'true' || ehPerpetua === true) {
        itemParaExcluirAgendaId = id;
        document.getElementById('modal-confirmar-exclusao-agenda')?.classList.remove('oculto');
    } else {
        const confirmou = window.confirmarAcaoSuiri
            ? await window.confirmarAcaoSuiri("Deseja confirmar a exclusão deste agendamento do calendário?", "Confirmar Exclusão")
            : confirm("Deseja confirmar a exclusão deste agendamento do calendário?");

        if (confirmou) {
            const cli = obterClienteSupabase();
            if (!cli) return;
            const { error } = await cli.from('agenda_financeira').delete().eq('id', id);
            if (!error) {
                window.mostrarToast("Conta removida com sucesso!");
                window.fecharModalDetalhesDiaCalendario();
                if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
                if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
                if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
            }
        }
    }
};

window.fecharModalConfirmarExclusaoAgenda = function() {
    document.getElementById('modal-confirmar-exclusao-agenda')?.classList.add('oculto');
    itemParaExcluirAgendaId = null;
};

window.executarExclusaoAgenda = async function(modo) {
    if (!itemParaExcluirAgendaId) return;
    const cli = obterClienteSupabase();
    if (!cli) return;

    const { data: item } = await cli.from('agenda_financeira').select('*').eq('id', itemParaExcluirAgendaId).single();
    if (!item) return;

    if (modo === 'apenas_esta') {
        await cli.from('agenda_financeira').delete().eq('id', itemParaExcluirAgendaId);
    } else if (modo === 'proximas') {
        if (item.recorrencia_grupo_id) {
            await cli.from('agenda_financeira')
                .delete()
                .eq('recorrencia_grupo_id', item.recorrencia_grupo_id)
                .gte('data_vencimento', item.data_vencimento);
        } else {
            await cli.from('agenda_financeira').delete().eq('id', itemParaExcluirAgendaId);
        }
    }

    window.mostrarToast("Agendamentos removidos com sucesso!");
    window.fecharModalConfirmarExclusaoAgenda();
    window.fecharModalDetalhesDiaCalendario();
    if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
    if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
};
