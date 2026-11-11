// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-MEUESPACO.JS (100% INTEGRAL E COMPLETO)
// Módulo exclusivo da aba "Meu Espaço" (Widgets Vivos, Microfone & Ícones PNG)
// Integrado com o Catálogo Oficial de Ícones PNG Transparentes (./icone/)
// =========================================================================

window.meusAlfinetes = [];
let reconhecimentoVozMeuEspaco = null;

// 1. ATUALIZAÇÃO DO AVATAR NO MENU INFERIOR
window.atualizarAvatarNavMeuEspaco = function() {
    const imgNav = document.getElementById('img-avatar-nav');
    if (!imgNav) return;
    
    let avatarSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
    
    if (window.perfilAtual && window.perfilAtual.avatar_url) {
        avatarSrc = window.perfilAtual.avatar_url;
    } else if (window.listaMembrosFamilia && typeof window.obterUsuarioId === 'function') {
        const meuId = window.obterUsuarioId();
        const eu = window.listaMembrosFamilia.find(m => m.id === meuId);
        if (eu && eu.avatar_url) {
            avatarSrc = eu.avatar_url;
        }
    }
    
    imgNav.src = avatarSrc;
};

// 1.1. ATUALIZAÇÃO DOS CARTÕES DE GÉNERO (ESPAÇO MULHER / ESPAÇO MASCULINO)
window.atualizarCartoesGeneroMeuEspaco = function() {
    const cardMulher = document.getElementById('card-acesso-espaco-mulher');
    const cardMasc = document.getElementById('card-acesso-espaco-masculino');
    
    if (!cardMulher && !cardMasc) return;

    // Resgata o sexo/género do perfil ativo ou da lista de membros
    let sexoDetectado = null;
    if (window.perfilAtual) {
        sexoDetectado = window.perfilAtual.sexo || window.perfilAtual.genero || null;
    }
    
    if (!sexoDetectado && window.listaMembrosFamilia && typeof window.obterUsuarioId === 'function') {
        const meuId = window.obterUsuarioId();
        const membro = window.listaMembrosFamilia.find(m => m.id === meuId);
        if (membro) {
            sexoDetectado = membro.sexo || membro.genero || null;
        }
    }

    const val = String(sexoDetectado || '').trim().toLowerCase();

    if (val === 'feminino') {
        if (cardMulher) cardMulher.classList.remove('oculto');
        if (cardMasc) cardMasc.classList.add('oculto');
    } else if (val === 'masculino') {
        if (cardMasc) cardMasc.classList.remove('oculto');
        if (cardMulher) cardMulher.classList.add('oculto');
    } else {
        // Fallback: se não estiver preenchido, revela o espaço masculino por defeito
        if (cardMasc) cardMasc.classList.remove('oculto');
        if (cardMulher) cardMulher.classList.add('oculto');
    }
};

// 2. GESTÃO DE PERSISTÊNCIA (LOCALSTORAGE)
window.carregarAlfinetesMeuEspaco = function() {
    if (typeof window.obterUsuarioId !== 'function') return;
    const meuId = window.obterUsuarioId();
    if (!meuId) return;

    const chave = 'suiri_alfinetes_' + meuId;
    const salvos = localStorage.getItem(chave);
    if (salvos) {
        try {
            window.meusAlfinetes = JSON.parse(salvos);
        } catch (e) {
            window.meusAlfinetes = [];
        }
    } else {
        window.meusAlfinetes = [];
    }
    
    window.renderizarMeuEspaco();
    window.atualizarCartoesGeneroMeuEspaco();
};

window.salvarAlfinetesMeuEspaco = function() {
    if (typeof window.obterUsuarioId !== 'function') return;
    const meuId = window.obterUsuarioId();
    if (!meuId) return;
    localStorage.setItem('suiri_alfinetes_' + meuId, JSON.stringify(window.meusAlfinetes));
};

// 3. AÇÕES DE FIXAÇÃO (ALFINETAR 📌)
window.alfinetarWidgetArea = function(idOrigem, titulo) {
    if (window.meusAlfinetes.find(a => a.tipo === 'area' && a.origem === idOrigem)) {
        if (typeof window.mostrarToast === 'function') window.mostrarToast("Este bloco já está fixado no seu espaço!", "info");
        return;
    }

    window.meusAlfinetes.push({
        id: 'pin_' + Math.random().toString(36).substr(2, 9),
        tipo: 'area',
        origem: idOrigem,
        titulo: titulo,
        data: new Date().toISOString()
    });

    window.salvarAlfinetesMeuEspaco();
    window.renderizarMeuEspaco();
    if (typeof window.mostrarToast === 'function') window.mostrarToast(`"${titulo}" fixado no Meu Espaço! 📌`);
};

window.alfinetarItemEspecifico = function(categoriaDado, idDado) {
    if (window.meusAlfinetes.find(a => a.tipo === 'item' && a.referencia === idDado)) {
        if (typeof window.mostrarToast === 'function') window.mostrarToast("Este item já está fixado!", "info");
        return;
    }

    window.meusAlfinetes.push({
        id: 'pin_' + Math.random().toString(36).substr(2, 9),
        tipo: 'item',
        categoria: categoriaDado,
        referencia: idDado,
        data: new Date().toISOString()
    });

    window.salvarAlfinetesMeuEspaco();
    window.renderizarMeuEspaco();
    if (typeof window.mostrarToast === 'function') window.mostrarToast("Item fixado no Meu Espaço! 📌");
};

window.limparMeuEspaco = async function() {
    if (window.meusAlfinetes.length === 0) return;

    const confirmado = typeof window.confirmarAcaoSuiri === 'function' 
        ? await window.confirmarAcaoSuiri("Deseja remover todas as janelas do seu espaço?")
        : confirm("Deseja remover todas as janelas do seu espaço?");
        
    if (!confirmado) return;

    window.meusAlfinetes = [];
    window.salvarAlfinetesMeuEspaco();
    window.renderizarMeuEspaco();
    if (typeof window.mostrarToast === 'function') window.mostrarToast("Meu Espaço foi limpo!");
};

window.removerAlfineteUnico = function(idPin) {
    window.meusAlfinetes = window.meusAlfinetes.filter(a => a.id !== idPin);
    window.salvarAlfinetesMeuEspaco();
    window.renderizarMeuEspaco();
};

// 4. MICROFONE INTELIGENTE NO MEU ESPAÇO
window.ouvirComandoVozMeuEspaco = function() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        return window.mostrarToast("Reconhecimento de voz não suportado neste navegador.", "erro");
    }

    if (!reconhecimentoVozMeuEspaco) {
        reconhecimentoVozMeuEspaco = new SpeechRec();
        reconhecimentoVozMeuEspaco.lang = 'pt-BR';
        reconhecimentoVozMeuEspaco.continuous = false;
        reconhecimentoVozMeuEspaco.interimResults = false;

        reconhecimentoVozMeuEspaco.onstart = function() {
            document.getElementById('btn-mic-meuespaco')?.classList.add('ouvindo');
            window.mostrarToast("A ouvir... Diga: 'Comprei almoço por 35 reais' ou 'Recebi 1200 de salário'", "info");
        };

        reconhecimentoVozMeuEspaco.onend = function() {
            document.getElementById('btn-mic-meuespaco')?.classList.remove('ouvindo');
        };

        reconhecimentoVozMeuEspaco.onerror = function() {
            document.getElementById('btn-mic-meuespaco')?.classList.remove('ouvindo');
            window.mostrarToast("Não foi possível captar a voz. Tente novamente.", "erro");
        };

        reconhecimentoVozMeuEspaco.onresult = function(evento) {
            const frase = evento.results[0][0].transcript;
            window.processarTextoTranscritoMeuEspaco(frase);
        };
    }

    try { reconhecimentoVozMeuEspaco.start(); } catch (e) { reconhecimentoVozMeuEspaco.stop(); }
};

window.processarTextoTranscritoMeuEspaco = function(frase) {
    if (!frase) return;
    const textoOriginal = frase.trim();
    const texto = textoOriginal.toLowerCase();

    let valorDetectado = 0;
    const matchNumero = texto.match(/(\d+[\d.,]*)/);
    if (matchNumero) {
        let numStr = matchNumero[0].replace(/\.(?=\d{3})/g, '').replace(',', '.');
        valorDetectado = parseFloat(numStr) || 0;
    }

    const padroesEntrada = /recebi|recebido|recebimento|ganhei|sal[aá]rio|caiu|entrou|pix\s+de|renda|dep[oó]sito|vendi|venda|reembolso|lucro|comiss[aã]o|bonifica[cç][aã]o/i;
    const ehReceita = padroesEntrada.test(texto);
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

    let itemLimpo = textoOriginal;
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

    const inDesc = document.getElementById('meuespaco-fin-desc');
    const inVal = document.getElementById('meuespaco-fin-val');
    const selCat = document.getElementById('meuespaco-fin-cat');
    const selTipo = document.getElementById('meuespaco-fin-tipo');
    const selEscopo = document.getElementById('meuespaco-fin-escopo');

    if (inDesc) inDesc.value = itemLimpo;
    if (inVal && valorDetectado > 0) inVal.value = valorDetectado.toFixed(2);
    if (selCat) selCat.value = categoria;
    if (selTipo) selTipo.value = tipoTransacao;
    if (selEscopo) selEscopo.value = escopo;

    const rotuloTipo = ehReceita ? 'Entrada' : 'Saída';
    window.mostrarToast(`Voz identificada: ${rotuloTipo} • R$ ${valorDetectado.toFixed(2)} (${itemLimpo})`);
};

// 5. RENDERIZAÇÃO DOS WIDGETS COMPLETOS E ATIVOS
window.renderizarMeuEspaco = function() {
    // Garante que o cartão de acesso esteja visível para o perfil atual
    window.atualizarCartoesGeneroMeuEspaco();

    const container = document.getElementById('container-widgets-meuespaco');
    const placeholder = document.getElementById('placeholder-meuespaco');
    if (!container) return;

    Array.from(container.children).forEach(child => {
        if (child.id !== 'placeholder-meuespaco') {
            child.remove();
        }
    });

    if (window.meusAlfinetes.length === 0) {
        if (placeholder) placeholder.style.display = 'flex';
        return;
    }

    if (placeholder) placeholder.style.display = 'none';

    const alfinetesOrdenados = [...window.meusAlfinetes].reverse();

    alfinetesOrdenados.forEach(pin => {
        const wrapper = document.createElement('div');
        wrapper.className = 'cartao-geral';
        wrapper.style.cssText = 'position: relative; padding: 14px; margin: 0; border: 1.5px solid rgba(217,119,6,0.3); border-left: 4.5px solid #d97706; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.04);';

        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1.5px dashed var(--borda-delicada, #f1f5f9); padding-bottom: 8px;';
        
        let tituloRender = pin.titulo || 'Janela Fixada';

        header.innerHTML = `
            <div>
                <strong style="font-size:13.5px; color:var(--cor-primaria, #d97706); display:flex; align-items:center; gap:6px;">
                    <img src="./icone/icone-alfinete.png" alt="Fixado" style="width:16px; height:16px; object-fit:contain;"> ${tituloRender}
                </strong>
            </div>
            <button type="button" style="background:#fee2e2; border:none; width:26px; height:26px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="window.removerAlfineteUnico('${pin.id}')" title="Desafixar">
                <img src="./icone/icone-lixo.png" alt="Remover" style="width:14px; height:14px; object-fit:contain;">
            </button>
        `;
        wrapper.appendChild(header);

        const content = document.createElement('div');

        if (pin.tipo === 'area') {
            // Widget: Carteira / Saldos
            if (pin.origem === 'box-carteira-topo') {
                const saldoMembro = document.getElementById('lbl-saldo-carteira-membro')?.textContent || 'R$ 0,00';
                const saldoFamilia = document.getElementById('lbl-saldo-total-familia-montante')?.textContent || 'R$ 0,00';
                content.innerHTML = `
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                        <div style="background:#fef9ea; padding:10px; border-radius:12px; border:1px solid #fed7aa; text-align:center;">
                            <span style="font-size:10.5px; font-weight:700; color:#b45309; display:block;">Minha Carteira</span>
                            <strong style="font-size:16px; color:#334155;">${saldoMembro}</strong>
                        </div>
                        <div style="background:#f8fafc; padding:10px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                            <span style="font-size:10.5px; font-weight:700; color:#64748b; display:block;">Montante Família</span>
                            <strong style="font-size:16px; color:#334155;">${saldoFamilia}</strong>
                        </div>
                    </div>
                    <button type="button" class="btn-principal" style="width:100%; margin-top:10px; font-size:12px; padding:9px;" onclick="window.abrirModalTransferirSaldo()">💸 Fazer Transferência</button>
                `;
            }
            // Widget: Registo Rápido de Movimentação (COM MICROFONE INTELIGENTE PNG)
            else if (pin.origem === 'card-registro-rapido-financas') {
                content.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <div class="campo-com-voz">
                            <input type="text" id="meuespaco-fin-desc" placeholder="Descrição ou toque no microfone..." style="width:100%; box-sizing:border-box; font-size:13px; padding:10px 42px 10px 10px;">
                            <button type="button" id="btn-mic-meuespaco" class="btn-microfone" onclick="window.ouvirComandoVozMeuEspaco()" title="Falar">
                                <img src="./icone/icone-microfone.png" alt="Microfone" style="width:16px; height:16px; object-fit:contain;">
                            </button>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                            <input type="number" step="0.01" id="meuespaco-fin-val" placeholder="R$ 0,00" style="font-size:13px; padding:9px;">
                            <select id="meuespaco-fin-cat" style="font-size:12px; padding:9px;">
                                <option value="Geral">Geral</option>
                                <option value="Alimentação">Alimentação</option>
                                <option value="Supermercado">Supermercado</option>
                                <option value="Moradia">Moradia</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Saúde">Saúde</option>
                                <option value="Lazer">Lazer</option>
                                <option value="Salário">Salário</option>
                            </select>
                        </div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                            <select id="meuespaco-fin-tipo" style="font-size:12px; padding:9px;">
                                <option value="saida">Saída (Gasto)</option>
                                <option value="entrada">Entrada (Ganho)</option>
                            </select>
                            <select id="meuespaco-fin-escopo" style="font-size:12px; padding:9px;">
                                <option value="pessoal">Privativo</option>
                                <option value="casa">Família</option>
                            </select>
                        </div>
                        <button type="button" class="btn-sucesso" style="width:100%; font-size:13px; padding:10px; font-weight:800;" onclick="window.salvarGastoPeloMeuEspaco()">Confirmar Lançamento</button>
                    </div>
                `;
            }
            // Widget: Lista de Missões
            else if (pin.origem === 'secao-inicio') {
                const pendentes = (typeof cacheMissoes !== 'undefined') ? cacheMissoes.filter(m => m.status === 'pendente') : [];
                if (pendentes.length === 0) {
                    content.innerHTML = `<span style="font-size:12px; color:#15803d; text-align:center; display:block; padding:8px;">Todas as missões da casa estão cumpridas! 🌟</span>`;
                } else {
                    let htmlMissoes = '<div style="display:flex; flex-direction:column; gap:8px;">';
                    pendentes.slice(0, 5).forEach(m => {
                        htmlMissoes += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 10px; border-radius:10px; border:1px solid #e2e8f0;">
                                <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                                    <span style="font-size:18px;">${m.icone || '⭐'}</span>
                                    <strong style="font-size:12.5px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.titulo}</strong>
                                </div>
                                <div style="display:flex; gap:4px; flex-shrink:0;">
                                    <button type="button" class="btn-sucesso" style="padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px;" onclick="window.concluirMissaoDomestica('${m.id}')">
                                        <img src="./icone/icone-check.png" alt="Fiz" style="width:12px; height:12px; object-fit:contain;"> Fiz
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                    htmlMissoes += '</div>';
                    content.innerHTML = htmlMissoes;
                }
            }
            // Widget: Mural de Recados
            else if (pin.origem === 'bloco-card-mural-recados') {
                const recados = window.recadosLarLista || [];
                let htmlRecados = `
                    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
                        <input type="text" id="meuespaco-input-recado" placeholder="Novo recado no mural..." style="font-size:12.5px; padding:8px 10px; width:100%; box-sizing:border-box;">
                        <button type="button" class="btn-principal" style="padding:7px; font-size:12px;" onclick="window.publicarRecadoPeloMeuEspaco()">Afixar Recado</button>
                    </div>
                `;
                if (recados.length === 0) {
                    htmlRecados += `<span style="font-size:11.5px; color:#64748b; text-align:center; display:block;">Nenhum recado hoje.</span>`;
                } else {
                    htmlRecados += '<div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">';
                    recados.slice(0, 4).forEach(r => {
                        htmlRecados += `
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 8px; font-size:11.5px; color:#334155;">
                                "${r.mensagem}"
                            </div>
                        `;
                    });
                    htmlRecados += '</div>';
                }
                content.innerHTML = htmlRecados;
            }
            // Widget: Calendário / Agenda
            else if (pin.origem === 'secao-calendario') {
                content.innerHTML = `
                    <div style="text-align:center; padding:12px 8px; background:#f0f9ff; border-radius:12px; border:1.5px dashed #0284c7;">
                        <div style="margin-bottom:4px;">
                            <img src="./icone/icone-calendario.png" alt="Calendário" style="width:28px; height:28px; object-fit:contain;">
                        </div>
                        <strong style="font-size:13px; color:#0369a1; display:block;">Calendário Operacional</strong>
                        <button type="button" class="btn-principal" style="margin-top:8px; font-size:12px; padding:8px 14px; width:auto;" onclick="window.navegarParaTela('calendario')">Ver Calendário Completo</button>
                    </div>
                `;
            }
            // Widget: Supermercado
            else if (pin.origem === 'secao-mercado') {
                content.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <div class="campo-com-voz">
                            <input type="text" id="meuespaco-mercado-produto" placeholder="Produto para a lista..." style="font-size:13px; padding:9px;">
                        </div>
                        <button type="button" class="btn-principal" style="font-size:12px; padding:8px;" onclick="window.adicionarItemMercadoPeloMeuEspaco()">+ Adicionar à Lista do Mês</button>
                    </div>
                `;
            }
            // Widget: Metas do Ano
            else if (pin.origem === 'modal-metas-anuais') {
                const totalMetas = window.metasAnuaisLista?.length || 0;
                const concluidas = window.metasAnuaisLista?.filter(m => m.concluida)?.length || 0;
                const pct = totalMetas > 0 ? Math.round((concluidas / totalMetas) * 100) : 0;
                content.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:6px;">
                        <span>Progresso Anual</span>
                        <strong style="color:var(--cor-sucesso, #10b981);">${pct}% (${concluidas}/${totalMetas})</strong>
                    </div>
                    <div style="background:#e2e8f0; border-radius:6px; height:8px; width:100%; overflow:hidden; margin-bottom:10px;">
                        <div style="background:var(--cor-sucesso, #10b981); height:100%; width:${pct}%;"></div>
                    </div>
                    <button type="button" class="btn-secundario" style="width:100%; font-size:12px; padding:8px;" onclick="window.abrirModalMetasAnuais()">Aceder aos Planos do Ano</button>
                `;
            }
        } 
        else if (pin.tipo === 'item') {
            if (pin.categoria === 'missao' && typeof cacheMissoes !== 'undefined') {
                const missao = cacheMissoes.find(m => m.id === pin.referencia);
                if (missao) {
                    const concluida = missao.status === 'concluida';
                    content.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:22px;">${missao.icone || '⭐'}</span>
                                <strong style="font-size:13.5px; color:#334155; ${concluida ? 'text-decoration:line-through; opacity:0.6;' : ''}">${missao.titulo}</strong>
                            </div>
                            ${!concluida ? `
                                <button type="button" class="btn-sucesso" style="padding:6px 10px; font-size:11px; display:inline-flex; align-items:center; gap:4px;" onclick="window.concluirMissaoDomestica('${missao.id}')">
                                    <img src="./icone/icone-check.png" alt="Concluir" style="width:12px; height:12px; object-fit:contain;"> Concluir
                                </button>
                            ` : `<span style="font-size:11px; font-weight:800; color:#15803d;">Concluída</span>`}
                        </div>
                    `;
                } else {
                    content.innerHTML = `<div style="font-size:11px; color:#ef4444; padding:6px; background:#fee2e2; border-radius:6px; text-align:center;">Missão removida.</div>`;
                }
            }
            else if (pin.categoria === 'recado' && typeof window.recadosLarLista !== 'undefined') {
                const recado = window.recadosLarLista.find(r => r.id === pin.referencia);
                if (recado) {
                    content.innerHTML = `
                        <div style="font-size:13px; color:#334155; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0;">
                            "${recado.mensagem}"
                        </div>
                    `;
                } else {
                    content.innerHTML = `<div style="font-size:11px; color:#ef4444; padding:6px; background:#fee2e2; border-radius:6px; text-align:center;">Aviso removido.</div>`;
                }
            }
            else if (pin.categoria === 'cofre' && typeof window.cofresCompartilhadosLista !== 'undefined') {
                const cofre = window.cofresCompartilhadosLista.find(c => c.id === pin.referencia);
                if (cofre) {
                    const pct = cofre.valor_alvo > 0 ? ((cofre.valor_acumulado || 0) / cofre.valor_alvo) * 100 : 0;
                    content.innerHTML = `
                        <div style="font-size:13.5px; font-weight:800; color:#334155; margin-bottom:4px;">${cofre.titulo}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#64748b;">
                            <span>R$ ${(cofre.valor_acumulado||0).toFixed(2)} / R$ ${Number(cofre.valor_alvo||0).toFixed(2)}</span>
                            <strong style="color:var(--cor-sucesso, #10b981);">${pct.toFixed(0)}%</strong>
                        </div>
                        <div style="background:#e2e8f0; border-radius:6px; height:8px; width:100%; margin-top:6px; overflow:hidden;">
                            <div style="background:var(--cor-sucesso, #10b981); height:100%; width:${Math.min(100, pct)}%;"></div>
                        </div>
                    `;
                } else {
                    content.innerHTML = `<div style="font-size:11px; color:#ef4444; padding:6px; background:#fee2e2; border-radius:6px; text-align:center;">Cofre removido.</div>`;
                }
            }
        }

        wrapper.appendChild(content);
        container.appendChild(wrapper);
    });
};

// 6. PONTE OPERACIONAL (EXECUTAR DIRETAMENTE PELO MEU ESPAÇO)
window.salvarGastoPeloMeuEspaco = function() {
    const desc = document.getElementById('meuespaco-fin-desc')?.value.trim();
    const val = document.getElementById('meuespaco-fin-val')?.value;
    const cat = document.getElementById('meuespaco-fin-cat')?.value;
    const tipo = document.getElementById('meuespaco-fin-tipo')?.value;
    const escopo = document.getElementById('meuespaco-fin-escopo')?.value;

    const inOrigDesc = document.getElementById('input-fin-descricao');
    const inOrigVal = document.getElementById('input-fin-valor');
    const selOrigCat = document.getElementById('select-fin-categoria');
    const selOrigTipo = document.getElementById('select-fin-tipo');
    const selOrigEscopo = document.getElementById('select-fin-escopo');

    if (inOrigDesc) inOrigDesc.value = desc;
    if (inOrigVal) inOrigVal.value = val;
    if (selOrigCat) selOrigCat.value = cat;
    if (selTipo) selOrigTipo.value = tipo;
    if (selOrigEscopo) selOrigEscopo.value = escopo;

    if (typeof window.salvarTransacaoManual === 'function') {
        window.salvarTransacaoManual();
        setTimeout(window.renderizarMeuEspaco, 500);
    }
};

window.publicarRecadoPeloMeuEspaco = function() {
    const inputRecado = document.getElementById('meuespaco-input-recado');
    const inputOrig = document.getElementById('input-novo-recado');
    if (!inputRecado || !inputRecado.value.trim()) return;

    if (inputOrig) inputOrig.value = inputRecado.value.trim();
    if (typeof window.publicarRecadoLar === 'function') {
        window.publicarRecadoLar();
        setTimeout(window.renderizarMeuEspaco, 500);
    }
};

window.adicionarItemMercadoPeloMeuEspaco = function() {
    const inputProd = document.getElementById('meuespaco-mercado-produto');
    const inputOrig = document.getElementById('input-novo-item-mercado');
    if (!inputProd || !inputProd.value.trim()) return;

    if (inputOrig) inputOrig.value = inputProd.value.trim();
    if (typeof window.adicionarItemMercado === 'function') {
        window.adicionarItemMercado();
        inputProd.value = '';
    }
};

// 7. INICIALIZAÇÃO SEGURA
window.inicializarMeuEspacoSeguro = function() {
    window.atualizarCartoesGeneroMeuEspaco();
    if (typeof window.obterUsuarioId === 'function' && window.obterUsuarioId()) {
        window.atualizarAvatarNavMeuEspaco();
        window.carregarAlfinetesMeuEspaco();
        return true;
    }
    return false;
};

document.addEventListener("DOMContentLoaded", () => {
    window.atualizarCartoesGeneroMeuEspaco();
    setTimeout(() => {
        if (!window.inicializarMeuEspacoSeguro()) {
            let tentativas = 0;
            const intervalo = setInterval(() => {
                tentativas++;
                if (window.inicializarMeuEspacoSeguro() || tentativas > 15) {
                    clearInterval(intervalo);
                }
            }, 1000);
        }
    }, 800);
});
