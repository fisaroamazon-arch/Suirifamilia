/* Suiri Família 7.0 · domínio extraído de app-gestao.js. */
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
// 2B. MICROFONE INTELIGENTE NO MERCADO (GEMINI 2.5 FLASH + PARSER LOCAL)
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
    await window.processarItemMercadoLocalFallback(frase);
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
        const regExtenso = new RegExp(`\b${palavra}\b`, 'i');
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
        .replace(/ (unidades|unidade|pct|pacotes|kg|quilos|latas|garrafas|caixas) /gi, '')
        .replace(/ (por|custou|de|valor|cada|r\$|reais|real|conto|peguei|comprei|coloquei) /gi, '')
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
// 2C. MOTOR DE IA: LEITURA DE CUPOM FISCAL (GEMINI 2.5 FLASH VISION)
// =========================================================================

window.processarCupomFiscalIA = async function(evento) {
    const arquivo = evento.target?.files?.[0];
    if (evento.target) evento.target.value = '';
    return window.lerFotoCupomFiscal(arquivo);
};

window.lerFotoCupomFiscal = async function(arquivo) {
    if (!arquivo) return;
    return Suiri.once('ler-cupom', async () => {
      try {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 8 * 1024 * 1024) {
            throw new Error('Use uma foto JPEG, PNG ou WebP de até 8 MB.');
        }
        const cliente = obterClienteSupabase();
        const usuario = obterUsuarioId();
        if (!cliente || !usuario) throw new Error('Entre na sua conta para ler o cupom.');
        const autoriza = await window.confirmarAcaoSuiri(
            'A foto será enviada ao Google Gemini para leitura. O cupom pode conter CPF, valores e itens comprados. Deseja enviar esta foto?',
            'Enviar foto ao Google Gemini?'
        );
        if (!autoriza || usuario !== obterUsuarioId()) return;
        const raw = await new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(String(leitor.result).split(',')[1]);
            leitor.onerror = () => reject(new Error('Não foi possível abrir a foto.'));
            leitor.readAsDataURL(arquivo);
        });
        if (usuario !== obterUsuarioId()) return;
        window.mostrarToast('Lendo cupom…', 'info');
        const { data, error } = await cliente.functions.invoke(window.SuiriConfig.aiFunction, {
            body: { action: 'receipt', consent: true, mimeType: arquivo.type, image: raw }
        });
        if (error) {
            const status = error.context?.status;
            const mensagens = {
                401: 'Entre novamente na sua conta para ler o cupom.',
                403: 'A leitura de cupom está disponível para perfis autorizados da família.',
                404: 'O leitor de cupom está indisponível.',
                422: 'O cupom está ilegível. Tente outra foto.',
                429: 'Limite de leitura atingido. Tente mais tarde.',
                503: 'O leitor de cupom está aguardando configuração.'
            };
            throw new Error(mensagens[status] || 'Não foi possível ler o cupom. Confira a conexão e tente outra foto.');
        }
        if (usuario !== obterUsuarioId()) return;
        const cupom=data?.receipt;if(!cupom||!Array.isArray(cupom.itens))throw new Error('Resposta de cupom inválida.');
        const total=Number(cupom.total);if(!Number.isFinite(total)||total<=0)throw new Error('Total inválido no cupom.');
        const revisar=await window.confirmarAcaoSuiri(`Revisar o lançamento de ${Suiri.money(total)} em ${cupom.estabelecimento||'estabelecimento'}? A despesa só será gravada quando você confirmar o formulário.`,'Cupom lido');
        if (!revisar || usuario !== obterUsuarioId()) return;
        document.getElementById('input-fin-descricao').value=String(cupom.estabelecimento||'Cupom Fiscal').slice(0,200);
        delete document.getElementById('input-fin-descricao').dataset.viaVoz;
        document.getElementById('input-fin-valor').value=total.toFixed(2);
        window.selecionarTipoRegistroRapido('saida');
        document.getElementById('select-fin-escopo').value = 'pessoal';
        window.preencherCategoriasFinanceiras('Supermercado');
        // Não insere itens no carrinho: evita contabilizar novamente a compra ao finalizá-lo.
        await window.abrirRegistroRapido();
        window.mostrarToast('Confira descrição e total antes de salvar. Os itens não foram enviados ao carrinho.','info');
      } catch (error) { Suiri.notifyError(error); }
    });
};

window.fotografarCupomAndroid = async function() {
    const dialogo = document.getElementById('camera-cupom-android');
    if (dialogo.open) return;
    return Suiri.once('camera-cupom', async () => {
        const video = dialogo.querySelector('video');
        const [tirarFoto, cancelar] = dialogo.querySelectorAll('button');
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
                audio: false
            });
            dialogo.addEventListener('close', () => {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }, { once: true });
            video.srcObject = stream;
            cancelar.onclick = () => dialogo.close();
            tirarFoto.onclick = () => {
                if (!video.videoWidth) return;
                const quadro = document.createElement('canvas');
                quadro.width = video.videoWidth;
                quadro.height = video.videoHeight;
                quadro.getContext('2d').drawImage(video, 0, 0);
                dialogo.close();
                quadro.toBlob(foto => window.lerFotoCupomFiscal(foto), 'image/jpeg', 0.9);
            };
            dialogo.showModal();
        } catch {
            stream?.getTracks().forEach(track => track.stop());
            window.mostrarToast('Autorize a câmera no Android ou escolha uma imagem da galeria.', 'erro');
        }
    });
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
                ? `<span style="font-size:10.5px; color:var(--cor-sucesso, #10b981); font-weight:700; font-variant-numeric:tabular-nums;">Último: R$ ${uPreco.toFixed(2)} | Médio: R$ ${mPreco.toFixed(2)}</span>`
                : '';

            return `
                <div style="padding:10px 14px; border-bottom:1px solid #f8fafc; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;" 
                     onclick="window.selecionarAutocomplete(${Suiri.jsArg(i.nome_produto)}, ${Suiri.jsArg(i.categoria || 'Mercearia')}, ${uPreco})">
                    <div>
                        <div style="font-weight:700; font-size:13px; color:var(--texto-principal, #0f172a);">${esc(i.nome_produto)}</div>
                        ${tagPreco}
                    </div>
                    <span style="font-size:10.5px; color:var(--texto-suave); font-weight:800; background:var(--pastel-ouro, #fef3c7); padding:3px 7px; border-radius:6px; border:1px solid rgba(249,115,22,0.18);">${i.categoria || 'Mercearia'}</span>
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
    const qtd = Suiri.number(inpQtd?.value || '1');
    const unit = Suiri.number(inpUnit?.value || '0');
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

    if(!Number.isFinite(qtd)||qtd<=0||!Number.isFinite(unit)||unit<0)return window.mostrarToast('Confira quantidade e preço.','erro');
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
    
    const { data: itens, error: erroItens } = await cli.from('itens_mercado')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('criado_em', { ascending: false });

    if(erroItens){Suiri.notifyError(erroItens);return;}
    let catalogo = [];
    let { data: catData, error: catErr } = await cli.from('catalogo_produtos_compra')
        .select('nome_produto, ultimo_preco, preco_medio')
        .eq('familia_id', window.familiaAtualId);

    if (catErr) {
        const { data: catDataFallback } = await cli.from('catalogo_produtos')
            .select('nome_produto, segmento_categoria, ultimo_preco, preco_medio')
            .eq('familia_id', window.familiaAtualId);
        catalogo = catDataFallback || [];
    } else {
        catalogo = catData || [];
    }

    window.itensMercadoAtual = (itens || []).filter(it => !it.suiri_finalizada).map(it => {
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
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:24px 0;">Sua lista de planejamento está vazia.</p>';
        return;
    }

    container.innerHTML = pendentes.map(i => {
        const badgePreco = i.ref_preco_medio > 0 
            ? `<div style="font-size:10.5px; color:var(--cor-sucesso, #10b981); margin-top:2px; font-variant-numeric:tabular-nums; font-weight:700;">Preço Médio: R$ ${i.ref_preco_medio.toFixed(2)}</div>`
            : '';

        return `
            <div class="cartao-geral" style="display:flex; justify-content:space-between; align-items:center; padding:11px 16px; margin-bottom:8px; border-radius:14px; border:1px solid rgba(226, 232, 240, 0.85); box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                <div>
                    <strong style="font-size:14px; color:var(--texto-principal, #0f172a);">${esc(i.nome_item)}</strong>
                    <div style="font-size:11.5px; color:var(--texto-suave, #64748b); margin-top:2px;">${i.segmento_categoria}</div>
                    ${badgePreco}
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn-secundario" style="padding:6px 9px; font-size:11px; border-radius:9px; display:inline-flex; align-items:center;" onclick="window.abrirModalEditarMercado('${i.id}')" title="Editar">
                        <img src="assets/icons-modern/icone-editar.svg" alt="Editar" style="width:13px; height:13px; object-fit:contain;">
                    </button>
                    <button class="btn-erro" style="padding:6px 9px; font-size:11px; border-radius:9px; display:inline-flex; align-items:center;" onclick="window.removerItemMercado('${i.id}')" title="Excluir">
                        <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--texto-suave);">Nenhum item na lista ou no carrinho</td></tr>';
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
            ? `<div style="font-size:10px; color:var(--cor-primaria, #f97316); font-weight:700; font-variant-numeric:tabular-nums;">Médio: R$ ${i.ref_preco_medio.toFixed(2)}</div>`
            : '';

        const unitAtual = Number(i.valor_unitario) || 0;
        const precoMedio = Number(i.ref_preco_medio) || 0;
        let estiloBordaPreco = 'width:100%; padding:5px 6px; font-variant-numeric:tabular-nums; border-radius:8px; border:1px solid #cbd5e1;';
        let tooltipPreco = '';
        
        if (unitAtual > 0 && precoMedio > 0) {
            if (unitAtual > precoMedio * 1.10) {
                estiloBordaPreco += ' border: 1.5px solid #ef4444; background: #fef2f2; color: #b91c1c; font-weight: 800;';
                tooltipPreco = `title="Inflação! 10% acima da média de R$ ${precoMedio.toFixed(2)}"`;
            } else if (unitAtual < precoMedio) {
                estiloBordaPreco += ' border: 1.5px solid #10b981; background: #f0fdf4; color: #047857; font-weight: 800;';
                tooltipPreco = `title="Promoção! Abaixo da média de R$ ${precoMedio.toFixed(2)}"`;
            }
        }
        
        return `
            <tr style="${estMarcado ? 'background:rgba(16, 185, 129, 0.04);' : ''}">
                <td style="text-align:center;">
                    <input type="checkbox" style="accent-color:var(--cor-primaria, #f97316); width:18px; height:18px;" ${estMarcado ? 'checked' : ''} onchange="window.atualizarItemMercado('${i.id}', 'no_carrinho', this.checked)">
                </td>
                <td style="font-size:12.5px; font-weight:700; ${estMarcado ? 'color:var(--cor-sucesso, #10b981); text-decoration:line-through; opacity:0.8;' : 'color:#0f172a;'}">
                    ${esc(i.nome_item)}
                    <div style="font-size:10.5px; color:var(--texto-suave); font-weight:normal;">${i.segmento_categoria}</div>
                    ${tagHistorico}
                </td>
                <td>
                    <input type="number" step="0.1" value="${i.quantidade || 1}" style="width:100%; padding:5px 4px; font-variant-numeric:tabular-nums; border-radius:8px; border:1px solid #cbd5e1; text-align:center;" onchange="window.atualizarQtdOuValorMercado('${i.id}', 'quantidade', this.value)">
                </td>
                <td>
                    <input type="number" step="0.01" value="${i.valor_unitario || 0}" style="${estiloBordaPreco}" ${tooltipPreco} onchange="window.atualizarQtdOuValorMercado('${i.id}', 'valor_unitario', this.value)">
                </td>
                <td style="text-align:right; font-weight:800; font-size:12.5px; white-space:nowrap; font-variant-numeric:tabular-nums; color:#0f172a;">
                    R$ ${subtotal.toFixed(2)}
                </td>
                <td style="text-align:center;">
                    <button class="btn-erro" style="padding:5px 7px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center;" onclick="window.removerItemMercado('${i.id}')">
                        <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:12px; height:12px; object-fit:contain;">
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
        container.style.cssText = 'margin:12px 0; padding:14px; background:var(--pastel-card, #ffffff); border:1px solid rgba(226, 232, 240, 0.9); border-radius:16px; box-shadow:0 1px 3px rgba(15,23,42,0.02);';
        
        const tabelaContainer = blocoPlanilha.querySelector('.tabela-mercado-container');
        if (tabelaContainer) {
            tabelaContainer.parentNode.insertBefore(container, tabelaContainer.nextSibling);
        } else {
            blocoPlanilha.appendChild(container);
        }
    }

    const segmentos = Object.keys(totaisSegmentos);
    if (segmentos.length === 0) {
        container.innerHTML = '<span style="font-size:12px; color:var(--texto-suave);">Marque os itens no carrinho para ver o total por segmento.</span>';
        return;
    }

    let html = '<div style="font-size:11px; font-weight:800; color:var(--cor-primaria, #f97316); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Subtotais por Segmento:</div>';
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:7px;">';
    
    segmentos.forEach(seg => {
        const valor = totaisSegmentos[seg];
        html += `
            <div style="background:var(--suiri-surface-secondary-light, #fffbeb); padding:8px 12px; border-radius:10px; border:1px solid rgba(249, 115, 22, 0.2); display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:700; color:var(--texto-principal, #0f172a);">${seg}:</span>
                <strong style="font-size:12px; color:var(--cor-sucesso, #10b981); font-variant-numeric:tabular-nums;">R$ ${valor.toFixed(2)}</strong>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

window.atualizarQtdOuValorMercado = async function(id,campo,valor) {
    if(!['quantidade','valor_unitario'].includes(campo))return;
    const item=window.itensMercadoAtual.find(i=>i.id===id);if(!item)return;
    const numero=Suiri.number(valor);
    if(!Number.isFinite(numero)||(campo==='quantidade'?numero<=0:numero<0))return window.mostrarToast('Confira o valor informado.','erro');
    try{
        const next={...item,[campo]:numero};const total=Math.round(Number(next.quantidade)*Number(next.valor_unitario)*100)/100;
        Suiri.check(await window.cliente.from('itens_mercado').update({[campo]:numero,valor_total:total}).eq('id',id).eq('familia_id',window.familiaAtualId).select('id'),1);
        Object.assign(item,{[campo]:numero,valor_total:total});window.renderizarPlanilhaMercado();
        if(campo==='valor_unitario'&&numero>0)await window.atualizarEstatisticasPrecoCatalogo(item.nome_item,item.segmento_categoria,numero);
    }catch(error){Suiri.notifyError(error);window.renderizarPlanilhaMercado();}
};

window.atualizarItemMercado = async function(id,campo,valor) {
    if(campo!=='no_carrinho')return;
    const item=window.itensMercadoAtual.find(i=>i.id===id);if(!item)return;
    try{
        Suiri.check(await window.cliente.from('itens_mercado').update({no_carrinho:!!valor,comprado:!!valor}).eq('id',id).eq('familia_id',window.familiaAtualId).select('id'),1);
        item.no_carrinho=!!valor;item.comprado=!!valor;window.renderizarPlanilhaMercado();
    }catch(error){Suiri.notifyError(error);window.renderizarPlanilhaMercado();}
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
    const saved=await cli.from('itens_mercado').update({
        nome_item: nome,
        segmento_categoria: categoria,
        quantidade: qtd,
        valor_unitario: unit,
        valor_total: subtotal
    }).eq('id', id).eq('familia_id',window.familiaAtualId).select('id');
    try{Suiri.check(saved,1);}catch(error){return Suiri.notifyError(error);}

    if (unit > 0) {
        await window.atualizarEstatisticasPrecoCatalogo(nome, categoria, unit);
    }

    window.mostrarToast("Produto confirmado e atualizado!");
    window.fecharModalEditarMercado();
    window.carregarItensMercado();
};

window.removerItemMercado = async function(id) {
    try{Suiri.check(await window.cliente.from('itens_mercado').delete().eq('id',id).eq('familia_id',window.familiaAtualId).select('id'),1);await window.carregarItensMercado();}catch(error){Suiri.notifyError(error);}
};

// =========================================================================
// 3. FINALIZAR COMPRA, GRÁFICOS & GATILHO DE CARDÁPIO
// =========================================================================

// finalizarCompraMercado está em src/services/operations.js.

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
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10.5 } } } 
            } 
        }
    });
};

window.fecharModalGraficosMercado = function() { 
    document.getElementById('modal-fechamento-mercado')?.classList.add('oculto'); 
};

// =========================================================================
// 3B. SUGESTÕES DE CARDÁPIO DO MÊS (GEMINI 2.5 FLASH + FALLBACK LOCAL)
// =========================================================================

window.gerarSugestoesCardapioMesIA = async function() {
    const container = document.getElementById('lista-sugestoes-cardapio-mes');
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId || !container) return;

    container.innerHTML = '<span style="font-size:11.5px; color:var(--texto-suave); text-align:center; display:block; padding:10px;">A IA está a criar o cardápio do mês com base na despensa...</span>';

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
        container.innerHTML = '<span style="font-size:11.5px; color:var(--texto-suave); text-align:center; display:block; padding:10px;">Registe produtos de alimentação no mercado para gerar sugestões de refeições.</span>';
        return;
    }

    const geradoComSucesso = false;
    if (!geradoComSucesso) {
        const baseAlimentos = alimentos.slice(0, 3).join(', ');
        container.innerHTML = `
            <div style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-left:4px solid #10b981; border-radius:12px; padding:9px 12px; margin-bottom:6px; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                <span style="font-size:10px; font-weight:800; background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:6px; border:1px solid rgba(16,185,129,0.2);">Almoço Prático</span>
                <strong style="font-size:13px; font-weight:800; color:#0f172a; display:block; margin-top:3px;">Refogado Especial do Lar</strong>
                <span style="font-size:11px; color:#64748b;">Aproveitamento inteligente de: ${esc(baseAlimentos || 'ingredientes da despensa')}.</span>
            </div>
            <div style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-left:4px solid #0284c7; border-radius:12px; padding:9px 12px; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                <span style="font-size:10px; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:6px; border:1px solid rgba(2,132,199,0.2);">Jantar Leve</span>
                <strong style="font-size:13px; font-weight:800; color:#0f172a; display:block; margin-top:3px;">Arroz de Forno Reconfortante</strong>
                <span style="font-size:11px; color:#64748b;">Combinação dos itens de mercearia e laticínios do mês.</span>
            </div>
        `;
    }
};

// =========================================================================
// 4. AGENDAMENTO DE CONTAS E RECORRÊNCIA NA AGENDA (COM PRIVACIDADE)
// =========================================================================

