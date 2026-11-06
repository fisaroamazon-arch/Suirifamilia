// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-OPERACIONAL.JS (100% COMPLETO E REVISADO)
// Missões com Ordenação Inteligente (Cumpridas Recolhíveis),
// Subitens Despoluídos, Isolamento Kids vs Adultos, Realtime,
// Integração Mascote Tamagotchi Monstrinho, Carregamento Imediato de Cofres,
// Filtro de Membros Sem Cartão, Reconhecimento de Voz Inteligente com Parser
// Financeiro, Metas Anuais, Zero Emojis (Botões de Joinha Kids e X/V Adultos),
// Seletor de SVGs para Missões e "Tinder" de Sugestões de Tarefas + FOTINHAS DINÂMICAS KIDS.
// =========================================================================

let cacheMissoes = [];
let filtroMissoesAtivo = 'todas';
let reconhecimentoVoz = null;
let canalRealtimeMissoes = null;
let canalRealtimeRecados = null;
let instanciaGraficoMesAnterior = null;
window.cofresCompartilhadosLista = [];
window.recadosLarLista = [];

// Extensão e Fallback de Segurança para o Catálogo de Ícones SVG
const ICONES_OPERACIONAIS_EXTRAS = {
    joinha: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`,
    joinhaInvertido: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`,
    xis: `<svg class="icone-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    relogio: `<svg class="icone-svg" style="width:12px;height:12px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    estrela: `<svg class="icone-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    urso: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="13" r="8"/><circle cx="9.5" cy="11.5" r="1"/><circle cx="14.5" cy="11.5" r="1"/><path d="M10 15.5a3.5 3.5 0 0 0 4 0"/></svg>`,
    escovaDente: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M3 21L21 3"/><path d="M15 3l6 6"/><path d="M12 6l4 4"/></svg>`,
    cama: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
    banheira: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2"/></svg>`,
    gota: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    livro: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    patinha: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`,
    flor: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/></svg>`,
    bicicleta: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`,
    sol: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    bola: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M11.9 6.7l-3.9 2.8 1.5 4.6h4.8l1.5-4.6-3.9-2.8z"/></svg>`,
    lua: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    musica: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    cenoura: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z"/><path d="M15.39 9.61L19 6"/><path d="M16 14l4-1"/><path d="M10 8L9 4"/></svg>`
};

if (typeof window.IconesSuiri === 'object' && window.IconesSuiri !== null) {
    Object.assign(window.IconesSuiri, ICONES_OPERACIONAIS_EXTRAS);
} else {
    window.IconesSuiri = { ...ICONES_OPERACIONAIS_EXTRAS };
}

const ICONE_FALLBACK = `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;

function obterIconeSeguro(chave) {
    if (!chave) return ICONE_FALLBACK;
    if (window.IconesSuiri && window.IconesSuiri[chave]) {
        return window.IconesSuiri[chave];
    }
    // Suporte Universal a Emojis (Fallback Inteligente)
    if (String(chave).length <= 5) {
        return `<div style="font-size: inherit; line-height: 1; display:flex; align-items:center; justify-content:center;">${chave}</div>`;
    }
    return ICONE_FALLBACK;
}

function obterPrimeiroNomeSeguro(nomeCompleto, padrao = 'Familiar') {
    const str = String(nomeCompleto || '').trim();
    if (!str) return padrao;
    return str.split(' ')[0] || padrao;
}

function obterClienteSupabase() {
    return window.clienteSupabase || window.cliente || (typeof cliente !== 'undefined' ? cliente : null);
}

function obterUsuarioId() {
    return window.perfilAtual?.id || window.usuarioAtual?.id || null;
}

function ehAdministrador() {
    return window.perfilAtual?.papel === 'adm' || window.perfilAtual?.papel === 'admin_familia';
}

// =========================================================================
// 1. INICIALIZAÇÃO E ESCUTA EM TEMPO REAL (SUPABASE REALTIME)
// =========================================================================

window.iniciarModuloMissoes = async function() {
    await window.preencherSelectResponsaveisMissoes();
    await window.carregarMissoesDoDia();
    await window.carregarRecadosLar();
    await window.carregarCofresCompartilhados();
    await window.carregarMetasAnuais();
    window.iniciarRealtimeMissoes();
    window.iniciarRealtimeRecados();
    window.inicializarMotorVoz();
    window.verificarGatilhoPenseSeteManha();
    window.inicializarNavegacaoSwipe();
};

window.iniciarRealtimeMissoes = function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return;

    if (canalRealtimeMissoes && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(canalRealtimeMissoes);
    }

    try {
        canalRealtimeMissoes = supabase
            .channel('realtime_missoes_familia_' + window.familiaAtualId)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'missoes',
                filter: `familia_id=eq.${window.familiaAtualId}`
            }, async () => {
                await window.carregarMissoesDoDia();
            })
            .subscribe();
    } catch (e) {
        console.warn("Modo realtime operando defensivamente em segundo plano:", e);
    }
};

window.iniciarRealtimeRecados = function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return;

    if (canalRealtimeRecados && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(canalRealtimeRecados);
    }

    try {
        canalRealtimeRecados = supabase
            .channel('realtime_recados_familia_' + window.familiaAtualId)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'recados_lar',
                filter: `familia_id=eq.${window.familiaAtualId}`
            }, async () => {
                await window.carregarRecadosLar();
            })
            .subscribe();
    } catch (e) {
        console.warn("Modo realtime de recados ativo defensivamente:", e);
    }
};

window.preencherSelectResponsaveisMissoes = async function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return;

    let membros = window.listaMembrosFamilia;
    if (!membros || membros.length === 0) {
        const { data } = await supabase
            .from('membros')
            .select('id, nome, papel, eh_kids, possui_cartao')
            .eq('familia_id', window.familiaAtualId)
            .order('nome');
        membros = data || [];
        window.listaMembrosFamilia = membros;
    }

    const selCriacao = document.getElementById('select-nova-missao-responsavel');
    if (selCriacao) {
        selCriacao.innerHTML = `
            <option value="todos">Casa (Todos)</option>
            <option value="todos_kids">Todos Kids (Quem fizer 1º)</option>
            <option value="individual">Individual (Minha)</option>
        `;
        membros.forEach(m => {
            const ehKids = m.eh_kids === true || m.papel === 'dependente';
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${obterPrimeiroNomeSeguro(m.nome)} ${ehKids ? '(Kids)' : ''}`;
            selCriacao.appendChild(opt);
        });
    }
};

window.carregarMissoesDoDia = async function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return;

    const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('prioridade', { ascending: true })
        .order('criado_em', { ascending: false });

    if (!error) {
        cacheMissoes = data || [];
        window.verificarReativacaoAutomaticaMissoes();
        window.renderizarMissoesTela();
        window.carregarMissoesKidsExclusiva();
        window.renderizarHistoricoMissoesKidsADM();
    }
};

// =========================================================================
// 2. RENDERIZADOR EXCLUSIVO DA TELA KIDS (COM ÍCONES, JOINHAS E FOTINHAS)
// =========================================================================

window.carregarMissoesKidsExclusiva = function() {
    const container = document.getElementById('lista-missoes-kids-container');
    const lblContador = document.getElementById('contador-missoes-kids-pendentes');
    if (!container) return;

    container.innerHTML = '';
    const meuId = obterUsuarioId();

    const missoesKids = cacheMissoes.filter(m => {
        const ehParaMim = m.atribuido_a === meuId;
        const ehTodosKids = m.destinatario_kids === 'todos_kids' || m.atribuido_a === 'todos_kids';
        return ehParaMim || ehTodosKids;
    });

    const pendentes = missoesKids.filter(m => {
        // Se a tarefa é 'todos_kids' e possui uma lista de concluídos, verifico se EU já fiz
        if (m.destinatario_kids === 'todos_kids' && Array.isArray(m.concluidos_por_array)) {
            return !m.concluidos_por_array.includes(meuId);
        }
        return m.status === 'pendente';
    });

    if (lblContador) {
        lblContador.textContent = `${pendentes.length} tarefa${pendentes.length === 1 ? '' : 's'}`;
    }

    if (missoesKids.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 16px; background:#ffffff; border-radius:24px; border:2px dashed #fde68a;">
                <div style="margin-bottom:8px; color:#f59e0b;">
                    ${obterIconeSeguro('estrela')}
                </div>
                <strong style="font-size:16px; color:#1e293b; display:block;">Tudo pronto por aqui!</strong>
                <p style="font-size:13px; color:#64748b; margin-top:4px;">Nenhuma tarefa pendente para você agora.</p>
            </div>
        `;
        return;
    }

    const missoesKidsOrdenadas = [...missoesKids].sort((a, b) => {
        const aPendente = (a.destinatario_kids === 'todos_kids' && Array.isArray(a.concluidos_por_array)) ? !a.concluidos_por_array.includes(meuId) : (a.status === 'pendente');
        const bPendente = (b.destinatario_kids === 'todos_kids' && Array.isArray(b.concluidos_por_array)) ? !b.concluidos_por_array.includes(meuId) : (b.status === 'pendente');
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        return (a.prioridade || 2) - (b.prioridade || 2);
    });

    const wrapperPendentes = document.createElement('div');
    const wrapperConcluidas = document.createElement('div');
    wrapperConcluidas.id = 'container-concluidas-kids';
    wrapperConcluidas.className = 'oculto';

    missoesKidsOrdenadas.forEach(missao => {
        const card = document.createElement('div');
        const ehTodosKids = missao.destinatario_kids === 'todos_kids';
        
        let concluidosArray = Array.isArray(missao.concluidos_por_array) ? missao.concluidos_por_array : [];
        if (missao.status === 'concluida' && missao.concluido_por && !ehTodosKids) {
            concluidosArray = [missao.concluido_por];
        }

        const euJaFiz = concluidosArray.includes(meuId);
        const algumIrmaoJaFez = ehTodosKids && concluidosArray.length > 0 && !euJaFiz;
        const concluida = euJaFiz || (missao.status === 'concluida' && !ehTodosKids);
        const falhada = missao.status === 'falhou';

        card.className = `card-missao-kids ${concluida ? 'concluida' : ''}`;
        card.style.flexDirection = 'column';
        if (falhada) {
            card.style.background = '#fff5f5';
            card.style.borderColor = '#fca5a5';
        }
        if (concluida) {
            card.style.opacity = '0.75';
        }

        const xpRecompensa = missao.xp_recompensa || 20;

        let grupoAvataresHtml = '';
        let mensagemIrmaoFezHtml = '';

        // Construção Dinâmica dos Avatares para missões Todos Kids
        if (ehTodosKids && window.listaMembrosFamilia) {
            const todasCriancas = window.listaMembrosFamilia.filter(m => m.eh_kids || m.papel === 'dependente');
            
            if (todasCriancas.length > 0) {
                grupoAvataresHtml = `<div class="grupo-avatares-kids" style="margin-top: 8px;">`;
                todasCriancas.forEach(crianca => {
                    const criancaFez = concluidosArray.includes(crianca.id);
                    const fotoSrc = crianca.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                    
                    // A classe aplicada é 'fez-missao' para acender a borda verde
                    grupoAvataresHtml += `<img src="${fotoSrc}" class="avatar-kids-mini ${criancaFez ? 'fez-missao' : ''}" title="${esc(crianca.nome)}">`;
                });
                grupoAvataresHtml += `</div>`;

                if (algumIrmaoJaFez) {
                    const idPrimeiroFez = concluidosArray[0];
                    const irmao = todasCriancas.find(c => c.id === idPrimeiroFez);
                    if (irmao) {
                        mensagemIrmaoFezHtml = `
                            <div style="margin-top:6px; font-size:12px; font-weight:800; color:#b45309; display:flex; align-items:center; gap:4px; background:#fef3c7; padding:4px 8px; border-radius:8px;">
                                ${obterPrimeiroNomeSeguro(irmao.nome)} concluiu a missão. Falta você!
                            </div>
                        `;
                    }
                }
            }
        }

        const iconeChave = missao.icone || 'estrela';
        let iconeVisual = '';
        
        if (String(iconeChave).length <= 5 && !window.IconesSuiri[iconeChave]) {
            iconeVisual = `<div style="font-size: 34px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">${iconeChave}</div>`;
        } else {
            iconeVisual = obterIconeSeguro(iconeChave);
        }

        const subitens = Array.isArray(missao.subitens) ? missao.subitens : [];
        let subitensHtml = '';
        if (subitens.length > 0) {
            subitensHtml = '<div style="margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0; display:flex; flex-direction:column; gap:6px;">';
            subitens.forEach(s => {
                const textoSub = window.esc ? window.esc(s.texto) : s.texto;
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; color:#334155; cursor:pointer;">
                        <input type="checkbox" style="width:16px; height:16px; accent-color:#10b981;" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.6;' : 'font-weight:600;'}">${textoSub}</span>
                    </label>
                `;
            });
            subitensHtml += '</div>';
        }

        const tituloMissaoSeguro = window.esc ? window.esc(missao.titulo) : missao.titulo;

        card.innerHTML = `
            <div style="display:flex; gap:12px; align-items:flex-start;">
                <div style="width: 54px; height: 54px; border-radius: 16px; background: ${concluida ? '#dcfce7' : (falhada ? '#fee2e2' : '#fef3c7')}; color: ${concluida ? '#10b981' : (falhada ? '#ef4444' : '#d97706')}; border: 2px solid ${concluida ? '#86efac' : (falhada ? '#fca5a5' : '#fde68a')}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    ${iconeVisual}
                </div>

                <div style="flex:1; min-width:0; padding-right:4px;">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:800; background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:999px; display:inline-flex; align-items:center; gap:4px;">
                            ${obterIconeSeguro('moeda')} +${xpRecompensa} XP
                        </span>
                        ${ehTodosKids ? `
                            <span style="font-size:10px; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:999px;">
                                Todos Kids
                            </span>
                        ` : ''}
                        ${missao.horario_limite ? `
                            <span style="font-size:10px; font-weight:700; color:#0369a1; background:#e0f2fe; padding:2px 6px; border-radius:999px;">
                                até ${missao.horario_limite.slice(0, 5)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <strong style="font-size:16px; color:#1e293b; line-height:1.2; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#64748b;' : ''}">
                        ${tituloMissaoSeguro}
                    </strong>
                    
                    ${grupoAvataresHtml}
                    ${mensagemIrmaoFezHtml}

                    ${(concluida && !ehTodosKids) ? `
                        <div style="margin-top:6px; font-size:12px; font-weight:800; color:#15803d;">
                            Você completou esta missão!
                        </div>
                    ` : ''}

                    ${subitensHtml}
                </div>
            </div>

            <div style="display:flex; justify-content:center; gap:10px; margin-top:14px; padding-top:12px; border-top: 1.5px dashed ${concluida || falhada ? 'transparent' : 'rgba(217, 119, 6, 0.2)'};">
                ${(!concluida && !falhada) ? `
                    <button type="button" style="flex:1; background: #ef4444; color: #ffffff; border: none; padding: 12px; font-size: 14px; font-weight: 800; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35); cursor: pointer; transition: transform 0.15s ease;" onclick="window.falharMissaoDomestica('${missao.id}')">
                        ${obterIconeSeguro('joinhaInvertido')} Não fiz
                    </button>
                    <button type="button" style="flex:1; background: ${algumIrmaoJaFez ? '#f59e0b' : '#10b981'}; color: #ffffff; border: none; padding: 12px; font-size: 14px; font-weight: 800; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 6px 16px ${algumIrmaoJaFez ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}; cursor: pointer; transition: transform 0.15s ease;" onclick="window.concluirMissaoDomestica('${missao.id}')">
                        ${obterIconeSeguro('joinha')} Fiz!
                    </button>
                ` : (falhada ? `
                    <button type="button" style="padding:10px 16px; background:#ffffff; font-size:13px; font-weight:800; border-radius:14px; border:2px solid #f59e0b; color:#b45309; width:100%; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" onclick="window.reabrirMissaoDomestica('${missao.id}')">
                        Tentar Novamente
                    </button>
                ` : `
                    <span style="font-size:13px; font-weight:800; padding:10px 16px; width:100%; text-align:center; border-radius:14px; background:#dcfce7; color:#15803d; border: 2px solid #86efac;">
                        Missão Cumprida!
                    </span>
                `)}
            </div>
        `;
        
        if (concluida) {
            wrapperConcluidas.appendChild(card);
        } else {
            wrapperPendentes.appendChild(card);
        }
    });

    container.appendChild(wrapperPendentes);

    if (wrapperConcluidas.children.length > 0) {
        const divToggle = document.createElement('div');
        divToggle.style.cssText = 'text-align: center; margin: 16px 0 8px 0;';
        divToggle.innerHTML = `
            <button type="button" class="btn-secundario" style="padding: 8px 16px; font-size: 12px; font-weight: 800; border-radius: 14px; border: 1.5px dashed rgba(16, 185, 129, 0.4); color: #15803d; background: #f0fdf4; cursor: pointer;" onclick="window.alternarMissoesConcluidas('kids', ${wrapperConcluidas.children.length})">
                <span id="txt-btn-concluidas-kids">Ver ${wrapperConcluidas.children.length} missões concluídas ▼</span>
            </button>
        `;
        container.appendChild(divToggle);
        container.appendChild(wrapperConcluidas);
    }
};

// =========================================================================
// 3. SUBITENS OPCIONAIS E ALTERNÂNCIA DE MISSÕES CONCLUÍDAS
// =========================================================================

window.alternarMissoesConcluidas = function(tipo, qtd) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    const container = document.getElementById(`container-concluidas-${tipo}`);
    const spanTxt = document.getElementById(`txt-btn-concluidas-${tipo}`);
    if (!container || !spanTxt) return;

    if (container.classList.contains('oculto')) {
        container.classList.remove('oculto');
        spanTxt.textContent = `Ocultar tarefas concluídas ▲`;
    } else {
        container.classList.add('oculto');
        const termo = tipo === 'kids' ? 'missões' : 'tarefas';
        spanTxt.textContent = `Ver ${qtd} ${termo} concluídas ▼`;
    }
};

window.toggleSubitemMissao = async function(missaoId, subitemId) {
    const supabase = obterClienteSupabase();
    const missao = cacheMissoes.find(m => m.id === missaoId);
    if (!missao || !Array.isArray(missao.subitens) || !supabase) return;

    const sub = missao.subitens.find(s => s.id === subitemId);
    if (!sub) return;

    sub.concluido = !sub.concluido;

    await supabase.from('missoes')
        .update({ subitens: missao.subitens })
        .eq('id', missaoId);

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
};

window.alternarVisualizacaoSubitensCard = function(missaoId) {
    const box = document.getElementById(`box-subitens-missao-${missaoId}`);
    const seta = document.getElementById(`seta-subitens-${missaoId}`);
    if (!box) return;
    const oculto = box.classList.toggle('oculto');
    if (seta) {
        seta.style.transform = oculto ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

window.adicionarLinhaSubitemCriacao = function() {
    const container = document.getElementById('container-inputs-subitens-criacao');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'linha-input-subitem';
    div.style.cssText = 'display:flex; gap:6px; margin-top:6px;';
    div.innerHTML = `
        <input type="text" class="input-subitem-item" placeholder="Sub-etapa (ex: Guardar sapatos)" style="flex:1; padding:7px 10px; font-size:12px;">
        <button type="button" class="btn-erro" style="padding:4px 8px; font-size:12px; border-radius:8px;" onclick="this.parentElement.remove()">remover</button>
    `;
    container.appendChild(div);
};

// =========================================================================
// 4. HISTÓRICO DE MISSÕES KIDS PARA O ADMINISTRADOR
// =========================================================================

window.renderizarHistoricoMissoesKidsADM = function() {
    const container = document.getElementById('painel-historico-missoes-kids-adm');
    if (!container) return;

    if (!ehAdministrador()) {
        container.classList.add('oculto');
        return;
    }

    container.classList.remove('oculto');
    const corpoLista = document.getElementById('lista-historico-kids-adm');
    if (!corpoLista) return;

    corpoLista.innerHTML = '';

    const missoesKidsGeral = cacheMissoes.filter(m => {
        const ehDestinoKids = m.destinatario_kids === 'todos_kids';
        let membroRespKids = false;
        if (m.atribuido_a && window.listaMembrosFamilia) {
            const membro = window.listaMembrosFamilia.find(x => x.id === m.atribuido_a);
            if (membro && (membro.eh_kids || membro.papel === 'dependente')) membroRespKids = true;
        }
        return ehDestinoKids || membroRespKids;
    });

    if (missoesKidsGeral.length === 0) {
        corpoLista.innerHTML = '<span style="font-size:12px; color:var(--texto-suave); text-align:center; display:block; padding:8px;">Nenhuma atividade infantil registrada.</span>';
        return;
    }

    missoesKidsGeral.forEach(m => {
        const concluida = m.status === 'concluida';
        const falhou = m.status === 'falhou';

        let nomeAlvo = 'Todos Kids';
        if (m.atribuido_a && window.listaMembrosFamilia) {
            const membro = window.listaMembrosFamilia.find(x => x.id === m.atribuido_a);
            if (membro) nomeAlvo = obterPrimeiroNomeSeguro(membro.nome);
        }

        let feitoPor = '';
        if (concluida && m.concluido_por && window.listaMembrosFamilia) {
            const quemFez = window.listaMembrosFamilia.find(x => x.id === m.concluido_por);
            if (quemFez) feitoPor = ` - Feito por: ${obterPrimeiroNomeSeguro(quemFez.nome)}`;
        }

        const linha = document.createElement('div');
        linha.style.cssText = `
            background:#ffffff; 
            border:1px solid var(--borda-delicada); 
            border-left:4px solid ${concluida ? '#10b981' : (falhou ? '#ef4444' : '#f59e0b')}; 
            border-radius:10px; 
            padding:8px 10px; 
            margin-bottom:6px; 
            display:flex; 
            justify-content:space-between; 
            align-items:center;
            gap:8px;
        `;

        linha.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                    <span style="font-size:10px; font-weight:800; background:#fef3c7; color:#b45309; padding:1px 6px; border-radius:4px;">
                        ${nomeAlvo}
                    </span>
                    <span style="font-size:10.5px; font-weight:700; color:${concluida ? '#15803d' : (falhou ? '#ef4444' : '#d97706')};">
                        ${concluida ? 'Concluída' : (falhou ? 'Fracassada' : 'Pendente')} ${feitoPor}
                    </span>
                </div>
                <strong style="font-size:13px; color:var(--texto-principal);">${window.esc ? window.esc(m.titulo) : m.titulo}</strong>
            </div>

            <div style="display:flex; gap:6px; flex-shrink:0;">
                <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px;" onclick="window.iniciarEdicaoMissao('${m.id}')" title="Editar">
                    Editar
                </button>
                <button type="button" class="btn-erro" style="padding:4px 8px; font-size:11px;" onclick="window.excluirMissao('${m.id}')" title="Excluir do Histórico">
                    Excluir
                </button>
            </div>
        `;

        corpoLista.appendChild(linha);
    });
};

// =========================================================================
// 5. FILTRAGEM DE MISSÕES (TELA TRADICIONAL DE ADULTOS)
// =========================================================================

window.filtrarMissoesPorAba = function(tipo) {
    window.filtrarMissoesExibicao(tipo);
};

window.filtrarMissoesExibicao = function(tipo) {
    filtroMissoesAtivo = tipo;
    
    const btnTodas = document.getElementById('btn-filtro-missao-todas') || document.getElementById('btn-filtro-todas-casa');
    const btnMinhas = document.getElementById('btn-filtro-missao-minhas') || document.getElementById('btn-filtro-minhas-pessoais');

    if (btnTodas && btnMinhas) {
        if (tipo === 'todas' || tipo === 'casa') {
            btnTodas.className = 'btn-principal';
            btnMinhas.className = 'btn-secundario';
        } else {
            btnMinhas.className = 'btn-principal';
            btnTodas.className = 'btn-secundario';
        }
    }

    window.renderizarMissoesTela();
};

// =========================================================================
// 6. NAVEGAÇÃO POR DESLIZE DE DEDOS (SWIPE GESTURES)
// =========================================================================

window.inicializarNavegacaoSwipe = function() {
    if (window._swipeJaInicializado) return;
    window._swipeJaInicializado = true;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const telasOrdem = ['inicio', 'mercado', 'financeiro', 'calendario', 'familia'];

    window.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 50) {
            return;
        }

        const elementoFocado = document.activeElement;
        if (elementoFocado && (elementoFocado.tagName === 'INPUT' || elementoFocado.tagName === 'TEXTAREA' || elementoFocado.tagName === 'SELECT')) {
            return;
        }

        const algumModalAberto = document.querySelector('.modal-overlay:not(.oculto)');
        if (algumModalAberto) return;

        if (window.modoKidsAtivo) return;

        let telaAtual = window.telaAtualVisivel;
        if (!telaAtual) {
            const abaAtivaNav = document.querySelector('.bottom-nav-item.ativo');
            telaAtual = abaAtivaNav ? abaAtivaNav.getAttribute('data-tela') : 'inicio';
        }

        const indexAtual = telasOrdem.indexOf(telaAtual);
        if (indexAtual === -1) return;

        if (deltaX < 0) {
            const proximoIndex = (indexAtual + 1) % telasOrdem.length;
            if (typeof window.navegarParaTela === 'function') {
                window.navegarParaTela(telasOrdem[proximoIndex]);
            }
        } else {
            const anteriorIndex = (indexAtual - 1 + telasOrdem.length) % telasOrdem.length;
            if (typeof window.navegarParaTela === 'function') {
                window.navegarParaTela(telasOrdem[anteriorIndex]);
            }
        }
    }, { passive: true });
};

// =========================================================================
// 7. CRIAÇÃO DE MISSÕES (INTEGRANDO O ÍCONE SVG E EMOJI) E REATIVAÇÃO
// =========================================================================

function calcularProximaDataExecucao(recorrenciaTipo, horarioReinicio) {
    const agora = new Date();
    let diasSomar = 1;

    if (recorrenciaTipo === 'semanal_7d') diasSomar = 7;
    else if (recorrenciaTipo === 'quinzenal_15d') diasSomar = 15;
    else if (recorrenciaTipo === 'mensal_30d') diasSomar = 30;
    else if (recorrenciaTipo === 'diaria_24h') diasSomar = 1;
    else return null;

    const proximaData = new Date(agora);
    proximaData.setDate(proximaData.getDate() + diasSomar);

    const partesHora = (horarioReinicio || '04:00').split(':');
    const horas = parseInt(partesHora[0], 10) || 4;
    const minutos = parseInt(partesHora[1], 10) || 0;

    proximaData.setHours(horas, minutos, 0, 0);
    return proximaData.toISOString();
}

window.verificarReativacaoAutomaticaMissoes = async function() {
    const supabase = obterClienteSupabase();
    if (!supabase || cacheMissoes.length === 0) return;

    const agora = new Date();

    for (const missao of cacheMissoes) {
        if (missao.status === 'concluida' && missao.recorrencia_tipo && missao.recorrencia_tipo !== 'nenhuma') {
            if (missao.proxima_execucao) {
                const dataLiberacao = new Date(missao.proxima_execucao);
                if (agora >= dataLiberacao) {
                    missao.status = 'pendente';
                    missao.concluido_em = null;
                    missao.concluido_por = null;
                    missao.concluidos_por_array = [];
                    
                    if (Array.isArray(missao.subitens)) {
                        missao.subitens.forEach(s => s.concluido = false);
                    }

                    await supabase.from('missoes').update({
                        status: 'pendente',
                        concluido_em: null,
                        concluido_por: null,
                        concluidos_por_array: [],
                        subitens: missao.subitens
                    }).eq('id', missao.id);
                }
            }
        }
    }
};

window.adicionarNovaMissao = async function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) {
        return window.mostrarToast("Sessão não identificada.", "erro");
    }

    const inTitulo = document.getElementById('input-nova-missao-titulo');
    const selPrio = document.getElementById('select-nova-missao-prioridade');
    const selRecorrencia = document.getElementById('select-nova-missao-recorrencia');
    const selResp = document.getElementById('select-nova-missao-responsavel');
    const inHoraLimite = document.getElementById('input-nova-missao-horario-limite');
    const inHoraReinicio = document.getElementById('input-nova-missao-horario-reinicio');
    
    // Captura Opcional de Emoji ou Ícone
    const inputIcone = document.getElementById('input-nova-missao-icone');
    const inputEmoji = document.getElementById('input-nova-missao-emoji');
    const emojiVal = inputEmoji ? inputEmoji.value.trim() : '';
    const iconeSimbolo = emojiVal || (inputIcone?.value || 'alvo');
    
    const titulo = inTitulo?.value?.trim();
    const prio = parseInt(selPrio?.value || '2', 10);
    const recorrenciaTipo = selRecorrencia?.value || 'diaria_24h';
    const horaReinicio = inHoraReinicio?.value || '04:00';
    
    let respValor = selResp?.value || 'todos';
    let escopo = 'casa';
    let atribuidoA = null;
    let destinatarioKids = 'individual';

    if (respValor === 'individual') {
        escopo = 'pessoal';
        atribuidoA = obterUsuarioId();
    } else if (respValor === 'todos') {
        escopo = 'casa';
        atribuidoA = null;
    } else if (respValor === 'todos_kids') {
        escopo = 'kids';
        atribuidoA = null;
        destinatarioKids = 'todos_kids';
    } else {
        escopo = 'casa';
        atribuidoA = respValor;
    }

    let horaLimite = inHoraLimite?.value?.trim() || null;
    if (horaLimite && horaLimite.length === 5) horaLimite += ':00';

    if (!titulo) return window.mostrarToast("Digite o título da missão!", "erro");

    const subitens = [];
    document.querySelectorAll('.input-subitem-item').forEach(inp => {
        const val = inp.value.trim();
        if (val) {
            subitens.push({
                id: 'sub_' + Math.random().toString(36).substring(2, 9),
                texto: val,
                concluido: false
            });
        }
    });

    const xpPadrao = prio === 1 ? 40 : (prio === 2 ? 25 : 15);
    const payload = {
        familia_id: window.familiaAtualId,
        titulo: titulo,
        icone: iconeSimbolo,
        escopo: escopo,
        prioridade: prio,
        status: 'pendente',
        xp_recompensa: xpPadrao,
        recorrencia_tipo: recorrenciaTipo,
        horario_limite: horaLimite,
        horario_reinicio: horaReinicio.length === 5 ? horaReinicio + ':00' : horaReinicio,
        atribuido_a: atribuidoA,
        destinatario_kids: destinatarioKids,
        concluidos_por_array: [],
        subitens: subitens,
        criado_por: obterUsuarioId(),
        concluido_por: null
    };

    let { data, error } = await supabase.from('missoes').insert([payload]).select().single();
    
    if (error && error.message && error.message.includes('icone')) {
        const payloadSemIcone = { ...payload };
        delete payloadSemIcone.icone;
        const resFallback = await supabase.from('missoes').insert([payloadSemIcone]).select().single();
        data = resFallback.data;
        error = resFallback.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao criar missão: " + error.message, "erro");
    }

    if (inTitulo) inTitulo.value = '';
    if (inHoraLimite) inHoraLimite.value = '';
    if (inputEmoji) inputEmoji.value = '';
    
    const containerSub = document.getElementById('container-inputs-subitens-criacao');
    if (containerSub) containerSub.innerHTML = '';

    if (data) cacheMissoes.unshift(data);

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Nova missão confirmada com sucesso!");
};

// =========================================================================
// 8. RENDERIZAÇÃO ADULTOS: (BOTÃO V VERDE E X VERMELHO)
// =========================================================================

window.renderizarMissoesTela = function() {
    const container = document.getElementById('lista-missoes-dia');
    if (!container) return;

    container.innerHTML = '';
    const meuId = obterUsuarioId();

    const missoesAutorizadas = cacheMissoes.filter(m => {
        if (m.destinatario_kids === 'todos_kids' || m.escopo === 'kids') {
            return false;
        }

        const ehColetiva = (m.escopo === 'casa' || !m.escopo) && !m.atribuido_a;
        const ehMinhaPessoal = m.escopo === 'pessoal' && m.criado_por === meuId;
        const ehAtribuidaAMim = m.atribuido_a === meuId;

        return ehColetiva || ehMinhaPessoal || ehAtribuidaAMim;
    });

    let listaExibicao = missoesAutorizadas;
    if (filtroMissoesAtivo === 'minhas') {
        listaExibicao = missoesAutorizadas.filter(m => m.atribuido_a === meuId || (m.escopo === 'pessoal' && m.criado_por === meuId));
    } else if (filtroMissoesAtivo === 'casa') {
        listaExibicao = missoesAutorizadas.filter(m => (m.escopo === 'casa' || !m.escopo) && !m.atribuido_a);
    }

    if (listaExibicao.length === 0) {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:18px 0;">Nenhuma missão pendente para este filtro.</p>';
        return;
    }

    listaExibicao.sort((a, b) => {
        const aPendente = (a.status === 'pendente');
        const bPendente = (b.status === 'pendente');
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        return (a.prioridade || 2) - (b.prioridade || 2);
    });

    const agora = new Date();
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();

    const wrapperPendentes = document.createElement('div');
    const wrapperConcluidas = document.createElement('div');
    wrapperConcluidas.id = 'container-concluidas-adulto';
    wrapperConcluidas.className = 'oculto';

    listaExibicao.forEach(missao => {
        const card = document.createElement('div');
        const concluida = missao.status === 'concluida';
        const falhada = missao.status === 'falhou';

        card.id = `card-missao-bloco-${missao.id}`;
        card.className = `cartao-geral ${concluida ? 'missao-concluida' : ''}`;
        card.style.cssText = `
            margin-bottom: 8px;
            padding: 12px 14px;
            position: relative;
            background: ${concluida ? 'rgba(240, 253, 244, 0.65)' : (falhada ? '#fff5f5' : '#ffffff')};
            border: 1px solid ${concluida ? '#bbf7d0' : (falhada ? '#fecaca' : 'rgba(217, 119, 6, 0.14)')};
            border-left: 3.5px solid ${missao.prioridade === 1 ? '#ef4444' : (missao.prioridade === 2 ? '#d97706' : '#10b981')};
            border-radius: 12px;
            z-index: 1;
            transition: all 0.25s ease;
            ${concluida ? 'opacity: 0.72;' : ''}
        `;

        const prioCor = missao.prioridade === 1 ? '#ef4444' : (missao.prioridade === 2 ? '#d97706' : '#10b981');
        const prioTexto = missao.prioridade === 1 ? 'Urgente' : (missao.prioridade === 2 ? 'Importante' : 'Tranquilo');

        const iconeChave = missao.icone || 'alvo';
        let svgIcone = '';
        if (String(iconeChave).length <= 5 && !window.IconesSuiri[iconeChave]) {
            svgIcone = `<div style="font-size: 20px; line-height: 1;">${iconeChave}</div>`;
        } else {
            svgIcone = obterIconeSeguro(iconeChave);
        }

        let badgeHorario = '';
        if (missao.horario_limite) {
            const partes = missao.horario_limite.split(':');
            const limiteMin = (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
            const atrasada = !concluida && !falhada && horaAtualMinutos > limiteMin;
            badgeHorario = `
                <span style="font-size:10.5px; font-weight:700; color:${atrasada ? '#dc2626' : '#64748b'}; display:inline-flex; align-items:center; gap:3px;">
                    ${obterIconeSeguro('relogio')}
                    ${missao.horario_limite.slice(0, 5)} ${atrasada ? '(atrasada)' : ''}
                </span>
            `;
        }

        const tagEscopo = missao.escopo === 'pessoal'
            ? `<span style="font-size:10px; font-weight:700; color:#8b5cf6;">Pessoal</span>`
            : `<span style="font-size:10px; font-weight:700; color:#64748b;">Casa</span>`;

        let badgeCumprido = '';
        if (concluida && missao.concluido_por && window.listaMembrosFamilia) {
            const autor = window.listaMembrosFamilia.find(m => m.id === missao.concluido_por);
            const nomeAutor = autor ? obterPrimeiroNomeSeguro(autor.nome, 'Concluída') : 'Concluída';
            badgeCumprido = `<span style="font-size:10.5px; font-weight:700; color:#15803d;">• Feito por ${nomeAutor}</span>`;
        } else if (falhada) {
            badgeCumprido = `<span style="font-size:10.5px; font-weight:700; color:#ef4444;">• Não cumprida</span>`;
        }

        const subitens = Array.isArray(missao.subitens) ? missao.subitens : [];
        let subitensHtml = '';
        if (subitens.length > 0) {
            const concluidos = subitens.filter(s => s.concluido).length;
            subitensHtml = `
                <div style="margin-top:6px;">
                    <button type="button" onclick="window.alternarVisualizacaoSubitensCard('${missao.id}')" style="background:none; border:none; padding:0; font-size:11px; font-weight:700; color:#64748b; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                        <span>Etapas (${concluidos}/${subitens.length})</span>
                        <span id="seta-subitens-${missao.id}" style="transition:transform 0.2s ease; display:inline-block;">▼</span>
                    </button>
                    <div id="box-subitens-missao-${missao.id}" class="oculto" style="margin-top:6px; padding:6px 8px; background:#f8fafc; border-radius:8px; display:flex; flex-direction:column; gap:4px;">
            `;
            subitens.forEach(s => {
                const textoSub = window.esc ? window.esc(s.texto) : s.texto;
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#475569; cursor:pointer;">
                        <input type="checkbox" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.6;' : ''}">${textoSub}</span>
                    </label>
                `;
            });
            subitensHtml += `</div></div>`;
        }

        const tituloMissaoSeguro = window.esc ? window.esc(missao.titulo) : missao.titulo;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:3px; flex-wrap:wrap;">
                        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${prioCor};" title="${prioTexto}"></span>
                        ${tagEscopo}
                        <span style="font-size:10.5px; color:#b45309; font-weight:700;">+${missao.xp_recompensa || 20} XP</span>
                        ${badgeHorario}
                        ${badgeCumprido}
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="color:${concluida ? '#10b981' : (falhada ? '#ef4444' : '#d97706')}; display:flex; align-items:center;">
                            ${svgIcone}
                        </span>
                        <strong style="font-size:13.5px; line-height:1.35; color:#1e293b; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#64748b;' : ''}">
                            ${tituloMissaoSeguro}
                        </strong>
                    </div>
                    ${subitensHtml}
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    ${(!concluida && !falhada) ? `
                        <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11.5px; border-radius:10px; font-weight:800; display:inline-flex; align-items:center; gap:4px;" onclick="window.concluirMissaoDomestica('${missao.id}')">
                            ${obterIconeSeguro('check')} Fiz
                        </button>
                    ` : (falhada ? `
                        <button type="button" class="btn-secundario" style="padding:5px 8px; font-size:11px; font-weight:700; color:#b45309;" onclick="window.reabrirMissaoDomestica('${missao.id}')">
                            Tentar
                        </button>
                    ` : `
                        <button type="button" class="btn-secundario" style="padding:5px 8px; font-size:11px; color:#64748b;" onclick="window.reabrirMissaoDomestica('${missao.id}')" title="Refazer">
                            Refazer
                        </button>
                    `)}

                    <div style="position:relative;">
                        <button type="button" class="btn-secundario" style="padding:5px 7px; font-size:13px; line-height:1; font-weight:800; border-radius:8px;" onclick="event.stopPropagation(); window.alternarMenuAcoesMissao('${missao.id}')">
                            ⋮
                        </button>
                        <div id="menu-drop-missao-${missao.id}" class="oculto" style="position:absolute; right:0; top:30px; background:#ffffff; border:1px solid rgba(217, 119, 6, 0.22); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.18); z-index:10000; min-width:115px; overflow:hidden;">
                            ${(!concluida && !falhada) ? `
                                <button type="button" style="width:100%; border:none; background:none; padding:8px 10px; font-size:11.5px; text-align:left; color:#ef4444; cursor:pointer; display:flex; align-items:center; gap:6px;" onclick="window.falharMissaoDomestica('${missao.id}')">
                                    ${obterIconeSeguro('xis')} Falhou
                                </button>
                            ` : ''}
                            <button type="button" style="width:100%; border:none; background:none; padding:8px 10px; font-size:11.5px; text-align:left; color:#334155; cursor:pointer; display:flex; align-items:center; gap:6px; border-top:1px solid #f1f5f9;" onclick="window.iniciarEdicaoMissao('${missao.id}')">
                                ${obterIconeSeguro('editar')} Editar
                            </button>
                            <button type="button" style="width:100%; border:none; background:none; padding:8px 10px; font-size:11.5px; text-align:left; color:var(--cor-erro, #f43f5e); border-top:1px solid #f1f5f9; cursor:pointer; display:flex; align-items:center; gap:6px;" onclick="window.excluirMissao('${missao.id}')">
                                ${obterIconeSeguro('excluir')} Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (concluida) {
            wrapperConcluidas.appendChild(card);
        } else {
            wrapperPendentes.appendChild(card);
        }
    });

    container.appendChild(wrapperPendentes);

    if (wrapperConcluidas.children.length > 0) {
        const divToggle = document.createElement('div');
        divToggle.style.cssText = 'text-align: center; margin: 16px 0 8px 0;';
        divToggle.innerHTML = `
            <button type="button" class="btn-secundario" style="padding: 6px 14px; font-size: 12px; font-weight: 700; border-radius: 12px; border: 1px dashed var(--borda-delicada); color: var(--texto-suave); cursor: pointer;" onclick="window.alternarMissoesConcluidas('adulto', ${wrapperConcluidas.children.length})">
                <span id="txt-btn-concluidas-adulto">Ver ${wrapperConcluidas.children.length} tarefas concluídas ▼</span>
            </button>
        `;
        container.appendChild(divToggle);
        container.appendChild(wrapperConcluidas);
    }
};

// =========================================================================
// 9. MENU DE AÇÕES SOBERANO E EDIÇÃO (COM RECUPERAÇÃO DO ÍCONE/EMOJI)
// =========================================================================

window.alternarMenuAcoesMissao = function(id) {
    const menu = document.getElementById(`menu-drop-missao-${id}`);
    const cardPai = document.getElementById(`card-missao-bloco-${id}`);
    if (!menu) return;

    const estaOculto = menu.classList.contains('oculto');

    document.querySelectorAll('[id^="menu-drop-missao-"]').forEach(m => m.classList.add('oculto'));
    document.querySelectorAll('[id^="card-missao-bloco-"]').forEach(c => c.style.zIndex = '1');

    if (estaOculto) {
        menu.classList.remove('oculto');
        if (cardPai) cardPai.style.zIndex = '999';
    }
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('[id^="menu-drop-missao-"]') && !e.target.closest('button[onclick*="alternarMenuAcoesMissao"]')) {
        document.querySelectorAll('[id^="menu-drop-missao-"]').forEach(m => m.classList.add('oculto'));
        document.querySelectorAll('[id^="card-missao-bloco-"]').forEach(c => c.style.zIndex = '1');
    }
});

window.iniciarEdicaoMissao = function(id) {
    const missao = cacheMissoes.find(m => m.id === id);
    if (!missao) return;

    document.getElementById(`menu-drop-missao-${id}`)?.classList.add('oculto');
    const cardPai = document.getElementById(`card-missao-bloco-${id}`);
    if (cardPai) cardPai.style.zIndex = '1';

    const selModal = document.getElementById('edit-missao-responsavel');
    if (selModal) {
        selModal.innerHTML = `
            <option value="todos">Casa (Todos)</option>
            <option value="todos_kids">Todos Kids</option>
            <option value="individual">Individual (Minha)</option>
        `;
        if (window.listaMembrosFamilia) {
            window.listaMembrosFamilia.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = obterPrimeiroNomeSeguro(m.nome);
                selModal.appendChild(opt);
            });
        }
    }

    const setVal = (campo, val) => {
        const el = document.getElementById(campo);
        if (el) el.value = val;
    };

    setVal('edit-missao-id', missao.id);
    setVal('edit-missao-titulo', missao.titulo || '');
    setVal('edit-missao-prioridade', missao.prioridade || '2');
    setVal('edit-missao-recorrencia', missao.recorrencia_tipo || 'diaria_24h');
    
    const iconeChave = missao.icone || 'alvo';
    const inputEmoji = document.getElementById('edit-missao-emoji');
    const inputIcone = document.getElementById('edit-missao-icone');
    
    // Distribui o valor para o emoji ou para o SVG dependendo do formato
    if (inputEmoji) {
        if (String(iconeChave).length <= 5 && !window.IconesSuiri[iconeChave]) {
            inputEmoji.value = iconeChave;
            if (inputIcone) inputIcone.value = 'alvo';
        } else {
            inputEmoji.value = '';
            if (inputIcone) inputIcone.value = iconeChave;
        }
    }
    
    const btnEditIcone = document.getElementById('btn-seletor-icone-edit');
    if (btnEditIcone) {
        btnEditIcone.innerHTML = obterIconeSeguro(iconeChave);
    }
    
    let respSel = 'todos';
    if (missao.destinatario_kids === 'todos_kids') respSel = 'todos_kids';
    else if (missao.escopo === 'pessoal') respSel = 'individual';
    else if (missao.atribuido_a) respSel = missao.atribuido_a;
    setVal('edit-missao-responsavel', respSel);

    setVal('edit-missao-horario-limite', missao.horario_limite ? missao.horario_limite.slice(0, 5) : '');
    setVal('edit-missao-horario-reinicio', missao.horario_reinicio ? missao.horario_reinicio.slice(0, 5) : '04:00');

    document.getElementById('modal-editar-missao')?.classList.remove('oculto');
};

window.fecharModalEditarMissao = function() {
    document.getElementById('modal-editar-missao')?.classList.add('oculto');
};

window.salvarEdicaoMissao = async function() {
    const supabase = obterClienteSupabase();
    const id = document.getElementById('edit-missao-id')?.value;
    const titulo = document.getElementById('edit-missao-titulo')?.value?.trim();
    const prio = parseInt(document.getElementById('edit-missao-prioridade')?.value || '2', 10);
    const recorrenciaTipo = document.getElementById('edit-missao-recorrencia')?.value || 'diaria_24h';
    const respValor = document.getElementById('edit-missao-responsavel')?.value || 'todos';
    let horaLimite = document.getElementById('edit-missao-horario-limite')?.value?.trim() || null;
    const horaReinicio = document.getElementById('edit-missao-horario-reinicio')?.value || '04:00';
    
    // Captura o Emoji (Prioridade) ou o Ícone SVG
    const inputEmoji = document.getElementById('edit-missao-emoji');
    const emojiVal = inputEmoji ? inputEmoji.value.trim() : '';
    const iconeSimbolo = emojiVal || (document.getElementById('edit-missao-icone')?.value || 'alvo');

    if (!titulo) return window.mostrarToast("O título não pode estar vazio.", "erro");

    let escopo = 'casa';
    let atribuidoA = null;
    let destinatarioKids = 'individual';

    if (respValor === 'individual') {
        escopo = 'pessoal';
        atribuidoA = obterUsuarioId();
    } else if (respValor === 'todos') {
        escopo = 'casa';
        atribuidoA = null;
    } else if (respValor === 'todos_kids') {
        escopo = 'kids';
        atribuidoA = null;
        destinatarioKids = 'todos_kids';
    } else {
        escopo = 'casa';
        atribuidoA = respValor;
    }

    if (horaLimite && horaLimite.length === 5) horaLimite += ':00';

    const xp = prio === 1 ? 40 : (prio === 2 ? 25 : 15);

    const payloadUpdate = {
        titulo: titulo,
        icone: iconeSimbolo,
        escopo: escopo,
        atribuido_a: atribuidoA,
        destinatario_kids: destinatarioKids,
        prioridade: prio,
        xp_recompensa: xp,
        recorrencia_tipo: recorrenciaTipo,
        horario_limite: horaLimite,
        horario_reinicio: horaReinicio.length === 5 ? horaReinicio + ':00' : horaReinicio
    };

    let { error } = await supabase.from('missoes').update(payloadUpdate).eq('id', id);

    if (error && error.message && error.message.includes('icone')) {
        delete payloadUpdate.icone;
        const resFallback = await supabase.from('missoes').update(payloadUpdate).eq('id', id);
        error = resFallback.error;
    }

    if (error) return window.mostrarToast("Erro ao atualizar: " + error.message, "erro");

    window.fecharModalEditarMissao();
    window.mostrarToast("Missão confirmada e atualizada com sucesso!");
    await window.carregarMissoesDoDia();
};

// =========================================================================
// 10. CONCLUSÃO E PENALIZAÇÃO (COM ATUALIZAÇÃO DO ARRAY DE TODOS KIDS)
// =========================================================================

window.concluirMissaoDomestica = async function(id) {
    const supabase = obterClienteSupabase();
    const missao = cacheMissoes.find(m => m.id === id);
    const usuarioId = obterUsuarioId();
    if (!missao || !usuarioId || !supabase) return;

    const agora = new Date();
    const agoraIso = agora.toISOString();
    const hojeStr = agoraIso.split('T')[0];

    let pontosGanhos = Number(missao.xp_recompensa || 20);
    let foiComAtraso = false;

    if (missao.horario_limite) {
        const partes = missao.horario_limite.split(':');
        const h = parseInt(partes[0], 10);
        const m = parseInt(partes[1], 10);
        const limiteMinutos = h * 60 + m;
        const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();

        if (agoraMinutos > limiteMinutos) {
            foiComAtraso = true;
            pontosGanhos = Math.max(5, Math.floor(pontosGanhos / 2));
        }
    }

    const proximaExec = calcularProximaDataExecucao(missao.recorrencia_tipo, missao.horario_reinicio);

    if (Array.isArray(missao.subitens)) {
        missao.subitens.forEach(s => s.concluido = true);
    }

    // Tratamento Especial para o Array de Crianças (todos_kids)
    let payloadAtualizacao = {
        status: 'concluida',
        concluido_em: agoraIso,
        concluido_por: usuarioId,
        proxima_execucao: proximaExec,
        subitens: missao.subitens
    };

    if (missao.destinatario_kids === 'todos_kids') {
        const concluidosJaExistentes = Array.isArray(missao.concluidos_por_array) ? missao.concluidos_por_array : [];
        if (!concluidosJaExistentes.includes(usuarioId)) {
            concluidosJaExistentes.push(usuarioId);
        }
        
        missao.concluidos_por_array = concluidosJaExistentes;
        payloadAtualizacao.concluidos_por_array = concluidosJaExistentes;
    }

    await supabase.from('missoes').update(payloadAtualizacao).eq('id', id);

    missao.status = 'concluida';
    missao.concluido_em = agoraIso;
    missao.concluido_por = usuarioId;
    missao.proxima_execucao = proximaExec;

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();

    let ofensivaNova = (window.perfilAtual?.ofensiva_atual || 0);
    if (window.perfilAtual && window.perfilAtual.ultimo_checkin_data !== hojeStr) {
        ofensivaNova += 1;
    }

    const xpAnterior = Number(window.perfilAtual?.xp_total || 0);
    const novoXpTotal = xpAnterior + pontosGanhos;

    if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
        window.SonsSuiri.sucessoMissao();
    }

    if (window.TamagotchiKids && typeof window.TamagotchiKids.aoCompletarMissao === 'function') {
        window.TamagotchiKids.aoCompletarMissao();
    } else if (window.modoKidsAtivo && typeof window.dispararMascoteKids === 'function') {
        window.dispararMascoteKids('feliz', `Muito bem! Você ganhou +${pontosGanhos} XP!`);
    } else if (window.MotorGamificacao && typeof window.MotorGamificacao.obterPatamar === 'function') {
        const patamarAntes = window.MotorGamificacao.obterPatamar(xpAnterior);
        const patamarDepois = window.MotorGamificacao.obterPatamar(novoXpTotal);

        if (patamarDepois.min > patamarAntes.min) {
            if (typeof window.dispararModalCelebracao === 'function') {
                window.dispararModalCelebracao(
                    "SUBIU DE NÍVEL!",
                    `Parabéns! Você alcançou o nível ${patamarDepois.nome} com ${novoXpTotal} XP!`,
                    obterIconeSeguro('trofeu')
                );
            }
        }
    }

    await supabase.from('membros').update({
        xp_total: novoXpTotal,
        ofensiva_atual: ofensivaNova,
        ultimo_checkin_data: hojeStr
    }).eq('id', usuarioId);

    if (window.perfilAtual) {
        window.perfilAtual.xp_total = novoXpTotal;
        window.perfilAtual.ofensiva_atual = ofensivaNova;
        window.perfilAtual.ultimo_checkin_data = hojeStr;
    }

    const elOfensiva = document.getElementById('contador-ofensiva-topo');
    if (elOfensiva) elOfensiva.textContent = ofensivaNova;

    const elXpKids = document.getElementById('contador-xp-kids');
    if (elXpKids) elXpKids.textContent = `${novoXpTotal} XP`;

    if (foiComAtraso) {
        window.mostrarToast(`Cumprida com atraso! Ganhou metade dos pontos: +${pontosGanhos} XP.`);
    } else {
        window.mostrarToast(`Missão cumprida no prazo! +${pontosGanhos} XP confirmados!`);
    }
};

window.falharMissaoDomestica = async function(id) {
    const missao = cacheMissoes.find(m => m.id === id);
    const usuarioId = obterUsuarioId();
    if (!missao || !usuarioId) return;

    const xpBase = Number(missao.xp_recompensa || 20);
    const penalidadeXP = Math.floor(xpBase / 2);

    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri(`Deseja confirmar a marcação de falha nesta missão? Você perderá ${penalidadeXP} XP.`)
        : confirm(`Deseja confirmar a marcação de falha nesta missão? Você perderá ${penalidadeXP} XP.`);
    if (!confirmado) return;

    const supabase = obterClienteSupabase();
    if (!supabase) return;

    const agora = new Date().toISOString();
    const proximaExec = calcularProximaDataExecucao(missao.recorrencia_tipo, missao.horario_reinicio);

    await supabase.from('missoes').update({
        status: 'falhou',
        concluido_em: agora,
        concluido_por: usuarioId,
        proxima_execucao: proximaExec
    }).eq('id', id);

    missao.status = 'falhou';
    missao.concluido_em = agora;
    missao.concluido_por = usuarioId;
    missao.proxima_execucao = proximaExec;

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();

    const xpAtual = window.perfilAtual?.xp_total || 0;
    const novoXpTotal = Math.max(0, xpAtual - penalidadeXP);

    await supabase.from('membros').update({
        xp_total: novoXpTotal
    }).eq('id', usuarioId);

    if (window.perfilAtual) {
        window.perfilAtual.xp_total = novoXpTotal;
    }

    const elXpKids = document.getElementById('contador-xp-kids');
    if (elXpKids) elXpKids.textContent = `${novoXpTotal} XP`;

    if (window.TamagotchiKids && typeof window.TamagotchiKids.aoFalharMissao === 'function') {
        window.TamagotchiKids.aoFalharMissao();
    } else if (window.modoKidsAtivo && typeof window.dispararMascoteKids === 'function') {
        window.dispararMascoteKids('triste', `Você perdeu ${penalidadeXP} XP. Toque em 'Tentar Novamente' para refazer!`);
    } else {
        window.mostrarToast(`Missão marcada como falhada. -${penalidadeXP} XP descontados.`, "erro");
    }
};

window.reabrirMissaoDomestica = async function(id) {
    const supabase = obterClienteSupabase();
    if (!supabase) return;

    const missao = cacheMissoes.find(x => x.id === id);
    if (missao && Array.isArray(missao.subitens)) {
        missao.subitens.forEach(s => s.concluido = false);
    }

    await supabase.from('missoes').update({ 
        status: 'pendente', 
        concluido_em: null,
        concluido_por: null,
        concluidos_por_array: [],
        proxima_execucao: null,
        subitens: missao ? missao.subitens : []
    }).eq('id', id);

    if (missao) {
        missao.status = 'pendente';
        missao.concluido_em = null;
        missao.concluido_por = null;
        missao.concluidos_por_array = [];
        missao.proxima_execucao = null;
    }

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Missão reaberta para nova tentativa.");
};

window.excluirMissao = async function(id) {
    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Tem certeza de que deseja confirmar a exclusão desta missão?")
        : confirm("Tem certeza de que deseja confirmar a exclusão desta missão?");
    if (!confirmado) return;

    const supabase = obterClienteSupabase();
    if (!supabase) return;

    await supabase.from('missoes').delete().eq('id', id);
    cacheMissoes = cacheMissoes.filter(m => m.id !== id);
    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Missão removida com sucesso.");
};

// =========================================================================
// 11. SISTEMA "TINDER" DE SUGESTÕES DA IA
// =========================================================================

window.sugestoesCacheKids = [
    { titulo: "Guardar os brinquedos", icone: "urso", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: "20:00:00" },
    { titulo: "Escovar os dentes", icone: "escovaDente", recorrencia_tipo: "diaria_24h", prioridade: 1, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null },
    { titulo: "Arrumar a cama", icone: "cama", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: "10:00:00" },
    { titulo: "Lavar as mãos antes de comer", icone: "banheira", recorrencia_tipo: "diaria_24h", prioridade: 1, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null },
    { titulo: "Tomar banho", icone: "gota", recorrencia_tipo: "diaria_24h", prioridade: 1, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: "19:00:00" },
    { titulo: "Fazer a lição de casa", icone: "livro", recorrencia_tipo: "semanal_7d", prioridade: 1, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: "17:00:00" },
    { titulo: "Tirar o próprio prato da mesa", icone: "refeicao", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null },
    { titulo: "Beber água", icone: "gota", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null },
    { titulo: "Ler um livrinho", icone: "livro", recorrencia_tipo: "diaria_24h", prioridade: 3, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null },
    { titulo: "Ajudar a cuidar do pet", icone: "patinha", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "kids", destinatario_kids: "todos_kids", horario_limite: null }
];

window.sugestoesCacheAdultos = [
    { titulo: "Meditar ou respirar fundo por 10 min", icone: "flor", recorrencia_tipo: "diaria_24h", prioridade: 3, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null },
    { titulo: "Fazer 30 minutos de exercício físico", icone: "bicicleta", recorrencia_tipo: "semanal_7d", prioridade: 1, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null },
    { titulo: "Acordar cedo (antes das 7h)", icone: "sol", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "pessoal", destinatario_kids: "individual", horario_limite: "07:00:00" },
    { titulo: "Beber 2 litros de água no dia", icone: "gota", recorrencia_tipo: "diaria_24h", prioridade: 1, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null },
    { titulo: "Ler 15 páginas de um livro", icone: "livro", recorrencia_tipo: "diaria_24h", prioridade: 3, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null },
    { titulo: "Fazer alongamento ao acordar", icone: "bola", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "pessoal", destinatario_kids: "individual", horario_limite: "09:00:00" },
    { titulo: "Desligar telas 1 hora antes de dormir", icone: "lua", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "pessoal", destinatario_kids: "individual", horario_limite: "22:00:00" },
    { titulo: "Planejar as tarefas do dia seguinte", icone: "agenda", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "pessoal", destinatario_kids: "individual", horario_limite: "21:00:00" },
    { titulo: "Tirar 15 min para um hobby", icone: "musica", recorrencia_tipo: "diaria_24h", prioridade: 3, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null },
    { titulo: "Fazer uma refeição 100% saudável", icone: "cenoura", recorrencia_tipo: "diaria_24h", prioridade: 2, escopo: "pessoal", destinatario_kids: "individual", horario_limite: null }
];

window.sugestoesFilaAtual = [];

window.abrirModalSugestoes = function() {
    document.getElementById('modal-sugestoes-missoes')?.classList.remove('oculto');
    window.carregarSugestoes('kids');
};

window.fecharModalSugestoes = function() {
    document.getElementById('modal-sugestoes-missoes')?.classList.add('oculto');
};

window.carregarSugestoes = function(tipo) {
    const btnKids = document.getElementById('btn-sugestao-kids');
    const btnAdultos = document.getElementById('btn-sugestao-adultos');

    if (btnKids && btnAdultos) {
        if (tipo === 'kids') {
            btnKids.className = 'btn-principal';
            btnAdultos.className = 'btn-secundario';
            window.sugestoesFilaAtual = [...window.sugestoesCacheKids];
        } else {
            btnAdultos.className = 'btn-principal';
            btnKids.className = 'btn-secundario';
            window.sugestoesFilaAtual = [...window.sugestoesCacheAdultos];
        }
    }

    window.sugestoesFilaAtual.sort(() => Math.random() - 0.5);
    window.renderizarCartaoSugestao();
};

window.renderizarCartaoSugestao = function() {
    const cardAtual = document.getElementById('cartao-sugestao-atual');
    const tituloEl = document.getElementById('titulo-sugestao-atual');
    const iconeEl = document.getElementById('icone-sugestao-atual');
    const freqEl = document.getElementById('frequencia-sugestao-atual');

    if (!cardAtual || !tituloEl || !iconeEl || !freqEl) return;

    if (window.sugestoesFilaAtual.length === 0) {
        tituloEl.textContent = "Fim das ideias!";
        iconeEl.innerHTML = obterIconeSeguro('check');
        freqEl.textContent = "Volte mais tarde para novas sugestões.";
        cardAtual.style.transform = 'scale(0.95)';
        return;
    }

    cardAtual.style.transform = 'scale(1)';
    const sugestao = window.sugestoesFilaAtual[0];

    tituloEl.textContent = sugestao.titulo;
    iconeEl.innerHTML = obterIconeSeguro(sugestao.icone);

    let frequenciaTxt = "Diária";
    if (sugestao.recorrencia_tipo === 'semanal_7d') frequenciaTxt = "Semanal";
    
    freqEl.textContent = `Sugestão ${frequenciaTxt}`;
};

window.recusarSugestao = function() {
    if (window.sugestoesFilaAtual.length === 0) return;
    const cardAtual = document.getElementById('cartao-sugestao-atual');
    
    if (cardAtual) {
        cardAtual.style.transform = 'translateX(-30px) rotate(-5deg) scale(0.95)';
        cardAtual.style.opacity = '0';
    }

    setTimeout(() => {
        window.sugestoesFilaAtual.shift();
        window.renderizarCartaoSugestao();
        if (cardAtual) {
            cardAtual.style.transform = 'translateX(0) rotate(0deg) scale(1)';
            cardAtual.style.opacity = '1';
        }
    }, 200);
};

window.aceitarSugestao = async function() {
    if (window.sugestoesFilaAtual.length === 0) return;
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return window.mostrarToast("Erro de sessão.", "erro");

    const sugestao = window.sugestoesFilaAtual[0];
    const meuId = obterUsuarioId();
    
    const xpPadrao = sugestao.prioridade === 1 ? 40 : (sugestao.prioridade === 2 ? 25 : 15);
    let atribuido = null;
    if (sugestao.escopo === 'pessoal') atribuido = meuId;

    const payload = {
        familia_id: window.familiaAtualId,
        titulo: sugestao.titulo,
        icone: sugestao.icone,
        escopo: sugestao.escopo,
        prioridade: sugestao.prioridade,
        status: 'pendente',
        xp_recompensa: xpPadrao,
        recorrencia_tipo: sugestao.recorrencia_tipo,
        horario_limite: sugestao.horario_limite,
        horario_reinicio: '04:00:00',
        atribuido_a: atribuido,
        destinatario_kids: sugestao.destinatario_kids,
        criado_por: meuId,
        concluido_por: null
    };

    const cardAtual = document.getElementById('cartao-sugestao-atual');
    
    if (cardAtual) {
        cardAtual.style.transform = 'translateX(30px) rotate(5deg) scale(0.95)';
        cardAtual.style.opacity = '0';
    }

    supabase.from('missoes').insert([payload]).select().single().then(({ data, error }) => {
        if (!error && data) {
            cacheMissoes.unshift(data);
            window.renderizarMissoesTela();
            window.carregarMissoesKidsExclusiva();
        }
    });

    setTimeout(() => {
        window.sugestoesFilaAtual.shift();
        window.renderizarCartaoSugestao();
        window.mostrarToast(`Missão "${sugestao.titulo}" adicionada com sucesso!`);
        if (cardAtual) {
            cardAtual.style.transform = 'translateX(0) rotate(0deg) scale(1)';
            cardAtual.style.opacity = '1';
        }
    }, 200);
};

// =========================================================================
// 12. SELETOR DE ÍCONES (GRELHA SVG PARA MISSÕES)
// =========================================================================

window.contextoIconeAtual = 'nova';

window.abrirSeletorIcone = function(contexto) {
    window.contextoIconeAtual = contexto;
    const modal = document.getElementById('modal-seletor-icone');
    const grade = document.getElementById('grid-icones-seletor');
    if (!modal || !grade) return;

    if (grade.innerHTML === '') {
        let html = '';
        if (window.IconesSuiri) {
            for (const [chave, svgCode] of Object.entries(window.IconesSuiri)) {
                if (['check', 'xis', 'joinha', 'joinhaInvertido'].includes(chave)) continue;
                
                html += `
                    <button type="button" 
                            style="width: 100%; aspect-ratio: 1/1; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #d97706; transition: border-color 0.15s ease;"
                            onclick="window.selecionarIcone('${chave}')"
                            title="${chave}">
                        ${svgCode}
                    </button>
                `;
            }
        }
        grade.innerHTML = html;
    }

    modal.classList.remove('oculto');
};

window.fecharSeletorIcone = function() {
    document.getElementById('modal-seletor-icone')?.classList.add('oculto');
};

window.selecionarIcone = function(chaveIcone) {
    const inputOculto = document.getElementById(`input-${window.contextoIconeAtual}-missao-icone`) || document.getElementById(`${window.contextoIconeAtual}-missao-icone`);
    const btnPreview = document.getElementById(`btn-seletor-icone-${window.contextoIconeAtual}`);
    
    if (inputOculto) {
        inputOculto.value = chaveIcone;
    }
    
    if (btnPreview) {
        btnPreview.innerHTML = obterIconeSeguro(chaveIcone);
    }
    
    window.fecharSeletorIcone();
};

// =========================================================================
// 13. MOTOR DE RECONHECIMENTO DE VOZ INTELIGENTE & PARSER FINANCEIRO
// =========================================================================

window.inicializarMotorVoz = function() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

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

    reconhecimentoVoz.onerror = function() {
        document.getElementById('btn-mic-gastos')?.classList.remove('ouvindo');
        window.mostrarToast("Não foi possível captar a voz. Tente novamente.", "erro");
    };

    reconhecimentoVoz.onresult = function(evento) {
        const textoTranscrito = evento.results[0][0].transcript;
        window.processarTextoTranscrito(textoTranscrito);
    };
};

window.ouvirComandoVoz = function() {
    if (!reconhecimentoVoz) {
        return window.mostrarToast("Reconhecimento de voz não suportado neste navegador.", "erro");
    }
    try { reconhecimentoVoz.start(); } catch (e) { reconhecimentoVoz.stop(); }
};

window.processarTextoTranscrito = function(frase) {
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

    const inDesc = document.getElementById('input-fin-descricao');
    const inVal = document.getElementById('input-fin-valor');
    const selCat = document.getElementById('select-fin-categoria');
    const selTipo = document.getElementById('select-fin-tipo');
    const selEscopo = document.getElementById('select-fin-escopo');

    if (inDesc) inDesc.value = itemLimpo;
    if (inVal && valorDetectado > 0) inVal.value = valorDetectado.toFixed(2);
    if (selCat) selCat.value = categoria;
    if (selTipo) selTipo.value = tipoTransacao;
    if (selEscopo) selEscopo.value = escopo;

    const rotuloTipo = ehReceita ? 'Entrada' : 'Saída';
    window.mostrarToast(`Voz identificada: ${rotuloTipo} • R$ ${valorDetectado.toFixed(2)} (${itemLimpo})`);
};

// =========================================================================
// 14. CARTEIRAS, MONTANTE & FILTRAGEM DE MEMBROS SEM CARTÃO
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
    const categoria = selCat?.value || 'Geral';

    if (!desc || isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe a descrição e o valor da transação.", "erro");
    }

    const hojeStr = new Date().toISOString().split('T')[0];

    const payload = {
        familia_id: window.familiaAtualId,
        membro_id: usuarioId,
        tipo: tipo,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal'),
        descricao: desc,
        categoria: categoria,
        valor: valor,
        data_transacao: hojeStr,
        via_voz: false
    };

    let { error } = await supabase.from('transacoes').insert([payload]);

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const res = await supabase.from('transacoes_financeiras').insert([payload]);
        error = res.error;
    }

    if (error) {
        window.mostrarToast("Erro ao gravar movimentação: " + error.message, "erro");
    } else {
        window.mostrarToast(tipo === 'entrada' ? "Receita confirmada na carteira!" : "Gasto confirmado com sucesso!");
        if (inDesc) inDesc.value = '';
        if (inVal) inVal.value = '';
        await window.carregarCarteiraIndividual();
        if (typeof window.carregarExtratoPeriodo === 'function') window.carregarExtratoPeriodo();
        await window.renderizarGraficoBarrasMesAnterior();
        
        if (typeof window.gerarRelatorio === 'function') window.gerarRelatorio();
    }
};

window.carregarCarteiraIndividual = async function() {
    const supabase = obterClienteSupabase();
    const usuarioId = obterUsuarioId();
    if (!window.familiaAtualId || !usuarioId || !supabase) return;

    if (window.perfilAtual && window.perfilAtual.possui_cartao === false) {
        const elSaldoPessoal = document.getElementById('lbl-saldo-carteira-membro');
        if (elSaldoPessoal) elSaldoPessoal.textContent = 'Sem Cartão';
    } else {
        let { data: transacoesPessoais } = await supabase
            .from('transacoes')
            .select('tipo, valor')
            .eq('membro_id', usuarioId);

        if (!transacoesPessoais) {
            const res = await supabase.from('transacoes_financeiras').select('tipo, valor').eq('membro_id', usuarioId);
            transacoesPessoais = res.data || [];
        }

        let saldoPessoal = 0;
        (transacoesPessoais || []).forEach(t => {
            if (t.tipo === 'entrada') saldoPessoal += Number(t.valor || 0);
            else saldoPessoal -= Number(t.valor || 0);
        });

        const elSaldoPessoal = document.getElementById('lbl-saldo-carteira-membro');
        if (elSaldoPessoal) elSaldoPessoal.textContent = `R$ ${saldoPessoal.toFixed(2)}`;
    }

    let idsMembrosComCartao = [];
    if (window.listaMembrosFamilia && window.listaMembrosFamilia.length > 0) {
        idsMembrosComCartao = window.listaMembrosFamilia
            .filter(m => m.possui_cartao !== false)
            .map(m => m.id);
    }

    let queryMontante = supabase.from('transacoes').select('tipo, valor, membro_id').eq('familia_id', window.familiaAtualId);
    let { data: todasTransacoes, error: errMontante } = await queryMontante;

    if (errMontante && errMontante.message && errMontante.message.includes('relation "public.transacoes" does not exist')) {
        const res = await supabase.from('transacoes_financeiras').select('tipo, valor, membro_id').eq('familia_id', window.familiaAtualId);
        todasTransacoes = res.data || [];
    }

    let montanteFamilia = 0;
    (todasTransacoes || []).forEach(t => {
        if (idsMembrosComCartao.length > 0 && t.membro_id && !idsMembrosComCartao.includes(t.membro_id)) {
            return;
        }
        if (t.tipo === 'entrada') montanteFamilia += Number(t.valor || 0);
        else montanteFamilia -= Number(t.valor || 0);
    });

    const elMontante = document.getElementById('lbl-saldo-total-familia-montante');
    if (elMontante) elMontante.textContent = `R$ ${montanteFamilia.toFixed(2)}`;

    await window.carregarCofresCompartilhados();
    await window.atualizarVisualizacaoMetaEconomia();
    await window.renderizarGraficoBarrasMesAnterior();
};

// =========================================================================
// 15. GRÁFICO EM BARRAS: GASTOS DO MÊS ANTERIOR POR SETOR (CHART.JS)
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

    let { data: transacoesMesAnt } = await supabase
        .from('transacoes')
        .select('categoria, valor, tipo')
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
                backgroundColor: '#d97706',
                borderRadius: 6,
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
                    grid: { color: 'rgba(217, 119, 6, 0.08)' },
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
                        color: '#334155'
                    }
                }
            }
        }
    });
};

// =========================================================================
// 16. METAS: POUPANÇA INDIVIDUAL & RESERVA DA FAMÍLIA (COFRES)
// =========================================================================

window.abrirModalDefinirMetaEconomia = function() {
    const usuarioId = obterUsuarioId();
    const chave = `suiri_meta_pessoal_${usuarioId || 'padrao'}`;
    const metaAtual = parseFloat(localStorage.getItem(chave) || '500');
    
    const inputMeta = document.getElementById('input-novo-valor-meta-economia');
    if (inputMeta) inputMeta.value = metaAtual;
    document.getElementById('modal-definir-meta-economia')?.classList.remove('oculto');
};

window.fecharModalDefinirMetaEconomia = function() {
    document.getElementById('modal-definir-meta-economia')?.classList.add('oculto');
};

window.salvarNovaMetaEconomia = function() {
    const inputMeta = document.getElementById('input-novo-valor-meta-economia');
    const valor = parseFloat(inputMeta?.value);
    const usuarioId = obterUsuarioId();

    if (isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe um valor válido para a meta.", "erro");
    }

    const chave = `suiri_meta_pessoal_${usuarioId || 'padrao'}`;
    localStorage.setItem(chave, valor.toString());
    window.fecharModalDefinirMetaEconomia();
    window.mostrarToast(`Meta pessoal confirmada: R$ ${valor.toFixed(2)}!`);
    window.atualizarVisualizacaoMetaEconomia();
};

window.atualizarVisualizacaoMetaEconomia = async function() {
    const supabase = obterClienteSupabase();
    const usuarioId = obterUsuarioId();
    if (!usuarioId || !supabase) return;

    const chave = `suiri_meta_pessoal_${usuarioId}`;
    const metaMensal = parseFloat(localStorage.getItem(chave) || '500');
    
    const elMeta = document.getElementById('lbl-valor-meta-mensal');
    if (elMeta) elMeta.textContent = `R$ ${metaMensal.toFixed(2)}`;

    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

    let { data: transacoesMes } = await supabase
        .from('transacoes')
        .select('tipo, valor')
        .eq('membro_id', usuarioId)
        .gte('data_transacao', primeiroDia);

    if (!transacoesMes) {
        const res = await supabase.from('transacoes_financeiras')
            .select('tipo, valor')
            .eq('membro_id', usuarioId)
            .gte('data_transacao', primeiroDia);
        transacoesMes = res.data || [];
    }

    let entradasMes = 0;
    let saidasMes = 0;

    (transacoesMes || []).forEach(t => {
        if (t.tipo === 'entrada') entradasMes += Number(t.valor || 0);
        else saidasMes += Number(t.valor || 0);
    });

    const poupadoMes = Math.max(0, entradasMes - saidasMes);
    const porcentagem = Math.min(100, Math.round((poupadoMes / metaMensal) * 100));

    const elAcumulado = document.getElementById('lbl-status-acumulado-economia');
    const elPorcentagem = document.getElementById('lbl-porcentagem-meta-economia');
    const elFill = document.getElementById('barra-progresso-economia-fill');

    if (elAcumulado) elAcumulado.textContent = `R$ ${poupadoMes.toFixed(2)} guardados`;
    if (elPorcentagem) elPorcentagem.textContent = `${porcentagem}%`;
    if (elFill) elFill.style.width = `${porcentagem}%`;
};

window.carregarCofresCompartilhados = async function() {
    const cli = obterClienteSupabase();
    const container = document.getElementById('lista-cofres-compartilhados');
    if (!cli || !window.familiaAtualId || !container) return;

    const { data, error } = await cli.from('metas_compartilhadas')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .eq('ativa', true)
        .order('criado_em', { ascending: false });

    window.cofresCompartilhadosLista = (!error && data) ? data : [];
    window.renderizarCofresNaTela();
};

window.renderizarCofresNaTela = function() {
    const container = document.getElementById('lista-cofres-compartilhados');
    if (!container) return;

    if (window.cofresCompartilhadosLista.length === 0) {
        container.innerHTML = '<span style="font-size:11px; color:var(--texto-suave); text-align:center; display:block; padding:8px 0;">Nenhum cofre criado. Toque em "+ Novo Cofre" para começar.</span>';
        return;
    }

    container.innerHTML = window.cofresCompartilhadosLista.map(cofre => {
        const alvo = Number(cofre.valor_alvo || 0);
        const guardado = Number(cofre.valor_acumulado || 0);
        const pct = alvo > 0 ? Math.min(100, (guardado / alvo) * 100) : 0;

        return `
            <div style="background:var(--suiri-surface-secondary-light, #fef9ea); border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:12px; padding:10px 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:13.5px; color:var(--texto-principal, #334155);">${cofre.titulo}</strong>
                        <div style="font-size:11px; color:var(--texto-suave, #64748b);">
                            Guardado: <strong style="color:var(--cor-sucesso, #10b981);">R$ ${guardado.toFixed(2)}</strong> de R$ ${alvo.toFixed(2)}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:11px; font-weight:800; color:var(--cor-sucesso, #10b981);">${pct.toFixed(0)}%</span>
                        <button type="button" class="btn-secundario" style="padding:3px 6px; font-size:10.5px;" onclick="window.abrirModalEditarCofre('${cofre.id}')">Ajustar</button>
                    </div>
                </div>

                <div style="background:#e2e8f0; border-radius:6px; height:8px; width:100%; overflow:hidden; position:relative; margin-top:6px;">
                    <div style="background:var(--cor-sucesso, #10b981); height:100%; width:${pct.toFixed(1)}%; transition:width 0.4s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
};

window.abrirModalDefinirMeta = function() {
    document.getElementById('titulo-modal-cofre').textContent = 'Novo Cofre Compartilhado';
    document.getElementById('input-meta-id').value = '';
    document.getElementById('input-meta-titulo').value = '';
    document.getElementById('input-meta-alvo').value = '';
    document.getElementById('modal-definir-meta')?.classList.remove('oculto');
};

window.abrirModalEditarCofre = function(id) {
    const cofre = window.cofresCompartilhadosLista.find(c => c.id === id);
    if (!cofre) return;

    document.getElementById('titulo-modal-cofre').textContent = 'Editar Cofre Compartilhado';
    document.getElementById('input-meta-id').value = cofre.id;
    document.getElementById('input-meta-titulo').value = cofre.titulo || '';
    document.getElementById('input-meta-alvo').value = cofre.valor_alvo || '';
    document.getElementById('modal-definir-meta')?.classList.remove('oculto');
};

window.fecharModalDefinirMeta = function() {
    document.getElementById('modal-definir-meta')?.classList.add('oculto');
};

window.salvarMetaEstavel = async function() {
    const cofreId = document.getElementById('input-meta-id')?.value;
    const titulo = document.getElementById('input-meta-titulo')?.value.trim();
    const alvo = parseFloat(document.getElementById('input-meta-alvo')?.value);
    const cli = obterClienteSupabase();

    if (!titulo || isNaN(alvo) || alvo <= 0) {
        return window.mostrarToast("Indique o objetivo e o valor alvo.", "erro");
    }
    if (!cli) return window.mostrarToast("Erro de ligação.", "erro");

    if (cofreId) {
        await cli.from('metas_compartilhadas').update({
            titulo: titulo,
            valor_alvo: alvo
        }).eq('id', cofreId);
    } else {
        await cli.from('metas_compartilhadas').insert([{
            familia_id: window.familiaAtualId,
            titulo: titulo,
            valor_alvo: alvo,
            valor_acumulado: 0,
            ativa: true
        }]);
    }

    window.mostrarToast("Cofre confirmado com sucesso!");
    window.fecharModalDefinirMeta();
    await window.carregarCofresCompartilhados();
};

window.abrirModalAporteMeta = function() {
    const selDestino = document.getElementById('select-destino-aporte');
    if (selDestino) {
        selDestino.innerHTML = '<option value="pessoal">Minha Poupança Individual</option>';
        window.cofresCompartilhadosLista.forEach(cofre => {
            selDestino.innerHTML += `<option value="${cofre.id}">Cofre: ${cofre.titulo}</option>`;
        });
    }

    const inVal = document.getElementById('input-valor-aporte');
    if (inVal) inVal.value = '';
    document.getElementById('modal-aporte-meta')?.classList.remove('oculto');
};

window.fecharModalAporteMeta = function() {
    document.getElementById('modal-aporte-meta')?.classList.add('oculto');
};

window.confirmarAporteMeta = async function() {
    const valorAporte = parseFloat(document.getElementById('input-valor-aporte')?.value);
    const destino = document.getElementById('select-destino-aporte')?.value || 'pessoal';
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();

    if (isNaN(valorAporte) || valorAporte <= 0) {
        return window.mostrarToast("Digite um valor válido para guardar.", "erro");
    }
    if (!cli || !meuId) return window.mostrarToast("Erro de ligação.", "erro");

    const hojeStr = new Date().toISOString().split('T')[0];

    if (destino === 'pessoal') {
        await cli.from('transacoes').insert([{
            familia_id: window.familiaAtualId,
            membro_id: meuId,
            tipo: 'saida',
            escopo: 'pessoal',
            eh_privado: true,
            descricao: 'Poupança Pessoal Guardada',
            categoria: 'Geral',
            valor: valorAporte,
            data_transacao: hojeStr
        }]);
        window.mostrarToast(`R$ ${valorAporte.toFixed(2)} confirmados na sua poupança pessoal!`);
    } else {
        const cofre = window.cofresCompartilhadosLista.find(c => c.id === destino);
        if (!cofre) return window.mostrarToast("Cofre não encontrado.", "erro");

        const novoAcumulado = Number(cofre.valor_acumulado || 0) + valorAporte;

        await cli.from('metas_compartilhadas')
            .update({ valor_acumulado: novoAcumulado })
            .eq('id', cofre.id);

        await cli.from('transacoes').insert([{
            familia_id: window.familiaAtualId,
            membro_id: meuId,
            tipo: 'saida',
            escopo: 'casa',
            eh_privado: false,
            descricao: `Aporte Cofre: ${cofre.titulo}`,
            categoria: 'Geral',
            valor: valorAporte,
            data_transacao: hojeStr
        }]);

        window.mostrarToast(`R$ ${valorAporte.toFixed(2)} confirmados no cofre "${cofre.titulo}"!`);
    }

    window.fecharModalAporteMeta();
    await window.carregarCarteiraIndividual();
    if (typeof window.carregarExtratoPeriodo === 'function') window.carregarExtratoPeriodo();
};

// =========================================================================
// 17. MURAL DE RECADOS RÁPIDOS DO LAR
// =========================================================================

window.carregarRecadosLar = async function() {
    const cli = obterClienteSupabase();
    const container = document.getElementById('lista-recados-lar');
    const lblContador = document.getElementById('contador-recados-pendentes');
    if (!cli || !window.familiaAtualId || !container) return;

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome, eh_kids, papel')
            .eq('familia_id', window.familiaAtualId);
        window.listaMembrosFamilia = membros || [];
    }

    const { data, error } = await cli.from('recados_lar')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('fixado', { ascending: false })
        .order('criado_em', { ascending: false })
        .limit(10);

    window.recadosLarLista = (!error && data) ? data : [];
    
    if (lblContador) {
        lblContador.textContent = `${window.recadosLarLista.length} aviso${window.recadosLarLista.length === 1 ? '' : 's'}`;
    }

    window.renderizarRecadosLar();
};

window.renderizarRecadosLar = function() {
    const container = document.getElementById('lista-recados-lar');
    if (!container) return;

    const meuId = obterUsuarioId();

    if (window.recadosLarLista.length === 0) {
        container.innerHTML = '<span style="font-size:11px; color:var(--texto-suave); text-align:center; display:block; padding:6px 0;">Nenhum recado no mural hoje.</span>';
        return;
    }

    container.innerHTML = window.recadosLarLista.map(r => {
        let autorNome = 'Familiar';
        if (window.listaMembrosFamilia) {
            const m = window.listaMembrosFamilia.find(x => x.id === r.autor_id);
            if (m) autorNome = obterPrimeiroNomeSeguro(m.nome);
        }

        const lidosArray = Array.isArray(r.lido_por) ? r.lido_por : [];
        const jaLi = lidosArray.includes(meuId);
        const souAutor = r.autor_id === meuId;

        const dataFmt = r.criado_em ? new Date(r.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const msgSegura = window.esc ? window.esc(r.mensagem) : r.mensagem;

        return `
            <div style="background:#ffffff; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:10px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <span style="font-size:10.5px; font-weight:800; color:var(--cor-primaria, #d97706);">${autorNome}</span>
                        <span style="font-size:9.5px; color:var(--texto-suave);">${dataFmt}</span>
                    </div>
                    <div style="font-size:12px; color:var(--texto-principal, #334155); word-break:break-word;">
                        ${msgSegura}
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    ${!jaLi ? `
                        <button type="button" class="btn-secundario" style="padding:4px 6px; font-size:10px;" onclick="window.marcarRecadoLido('${r.id}')" title="Marcar como lido">
                            Lido
                        </button>
                    ` : `
                        <span style="font-size:10px; font-weight:700; color:var(--cor-sucesso, #10b981);">Lido</span>
                    `}
                    ${souAutor ? `
                        <button type="button" class="btn-erro" style="padding:4px 6px; font-size:10px; display:inline-flex; align-items:center;" onclick="window.excluirRecadoLar('${r.id}')" title="Eliminar recado">
                            ${obterIconeSeguro('excluir')}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

window.publicarRecadoLar = async function() {
    const input = document.getElementById('input-novo-recado');
    const msg = input?.value?.trim();
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();

    if (!msg) return window.mostrarToast("Escreva o recado antes de enviar.", "erro");
    if (!cli || !meuId) return window.mostrarToast("Erro de sessão.", "erro");

    const payload = {
        familia_id: window.familiaAtualId,
        autor_id: meuId,
        mensagem: msg,
        fixado: false,
        lido_por: [meuId]
    };

    const { error } = await cli.from('recados_lar').insert([payload]);

    if (!error) {
        if (input) input.value = '';
        window.mostrarToast("Recado afixado no mural!");
        await window.carregarRecadosLar();
    } else {
        window.mostrarToast("Erro ao publicar: " + error.message, "erro");
    }
};

window.marcarRecadoLido = async function(recadoId) {
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();
    if (!cli || !meuId) return;

    const recado = window.recadosLarLista.find(r => r.id === recadoId);
    if (!recado) return;

    const lidosArray = Array.isArray(recado.lido_por) ? [...recado.lido_por] : [];
    if (!lidosArray.includes(meuId)) {
        lidosArray.push(meuId);
        await cli.from('recados_lar').update({ lido_por: lidosArray }).eq('id', recadoId);
        recado.lido_por = lidosArray;
        window.renderizarRecadosLar();
    }
};

window.excluirRecadoLar = async function(recadoId) {
    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Tem certeza de que deseja retirar este recado do mural?")
        : confirm("Tem certeza de que deseja retirar este recado do mural?");
    if (!confirmado) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('recados_lar').delete().eq('id', recadoId);
    if (!error) {
        window.mostrarToast("Recado removido.");
        window.recadosLarLista = window.recadosLarLista.filter(r => r.id !== recadoId);
        window.renderizarRecadosLar();
    }
};

// =========================================================================
// 18. GESTOR DE PLANOS & METAS ANUAIS
// =========================================================================

window.carregarMetasAnuais = async function() {
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId) return;

    const { data, error } = await cli.from('planos_anuais')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('criado_em', { ascending: false });

    if (!error) {
        window.metasAnuaisLista = data || [];
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
    }
};

window.atualizarResumoMiniPainelMetas = function() {
    const lblResumo = document.getElementById('lbl-metas-ano-resumo');
    const lblPct = document.getElementById('lbl-metas-ano-porcentagem');
    const barraFill = document.getElementById('barra-metas-ano-fill');
    const meuId = obterUsuarioId();

    const metasVisiveis = (window.metasAnuaisLista || []).filter(m => {
        return m.escopo === 'casa' || (m.escopo === 'pessoal' && m.criado_por === meuId);
    });

    const total = metasVisiveis.length;
    const concluidas = metasVisiveis.filter(m => m.concluida === true).length;
    const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    if (lblResumo) {
        lblResumo.textContent = total > 0 
            ? `${concluidas} de ${total} objetivos concluídos`
            : "Nenhum plano anual cadastrado ainda";
    }

    if (lblPct) {
        lblPct.textContent = `${pct}%`;
    }

    if (barraFill) {
        barraFill.style.width = `${pct}%`;
    }
};

window.abrirModalMetasAnuais = function() {
    document.getElementById('modal-metas-anuais')?.classList.remove('oculto');
    window.alternarAbaMetasAnuais(window.abaMetasAnuaisAtiva || 'casa');
};

window.fecharModalMetasAnuais = function() {
    document.getElementById('modal-metas-anuais')?.classList.add('oculto');
    window.fecharFormularioNovaMetaAnual();
};

window.alternarAbaMetasAnuais = function(aba) {
    window.abaMetasAnuaisAtiva = aba;
    const btnCasa = document.getElementById('btn-tab-metas-casa');
    const btnPessoal = document.getElementById('btn-tab-metas-pessoal');

    if (btnCasa && btnPessoal) {
        if (aba === 'casa') {
            btnCasa.className = 'btn-principal';
            btnPessoal.className = 'btn-secundario';
        } else {
            btnPessoal.className = 'btn-principal';
            btnCasa.className = 'btn-secundario';
        }
    }

    window.renderizarMetasAnuaisModal();
};

window.abrirFormularioNovaMetaAnual = function() {
    const bloco = document.getElementById('bloco-form-nova-meta-anual');
    if (bloco) {
        bloco.classList.remove('oculto');
        const inTitulo = document.getElementById('input-meta-anual-titulo');
        if (inTitulo) inTitulo.focus();
    }
};

window.fecharFormularioNovaMetaAnual = function() {
    const bloco = document.getElementById('bloco-form-nova-meta-anual');
    if (bloco) bloco.classList.add('oculto');
    const inTitulo = document.getElementById('input-meta-anual-titulo');
    if (inTitulo) inTitulo.value = '';
};

window.salvarNovaMetaAnual = async function() {
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();
    if (!cli || !window.familiaAtualId || !meuId) return;

    const inTitulo = document.getElementById('input-meta-anual-titulo');
    const selAno = document.getElementById('select-meta-anual-ano');
    const selCat = document.getElementById('select-meta-anual-categoria');

    const titulo = inTitulo?.value?.trim();
    const ano = parseInt(selAno?.value || '2026', 10);
    const categoria = selCat?.value || 'Geral';
    const escopo = window.abaMetasAnuaisAtiva || 'casa';

    if (!titulo) {
        return window.mostrarToast("Informe o objetivo da meta anual.", "erro");
    }

    const payload = {
        familia_id: window.familiaAtualId,
        criado_por: meuId,
        titulo: titulo,
        ano: ano,
        categoria: categoria,
        escopo: escopo,
        concluida: false
    };

    const { error } = await cli.from('planos_anuais').insert([payload]);

    if (!error) {
        window.mostrarToast(`Plano "${titulo}" adicionado com sucesso!`);
        window.fecharFormularioNovaMetaAnual();
        await window.carregarMetasAnuais();
    } else {
        window.mostrarToast("Erro ao cadastrar plano: " + error.message, "erro");
    }
};

window.alternarStatusMetaAnual = async function(id, statusAtual) {
    const cli = obterClienteSupabase();
    if (!cli) return;

    const novoStatus = !statusAtual;

    const { error } = await cli.from('planos_anuais')
        .update({ concluida: novoStatus })
        .eq('id', id);

    if (!error) {
        const item = window.metasAnuaisLista.find(m => m.id === id);
        if (item) item.concluida = novoStatus;
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
        if (novoStatus && window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
            window.SonsSuiri.sucessoMissao();
        }
    }
};

window.excluirMetaAnual = async function(id) {
    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente excluir este objetivo anual?")
        : confirm("Deseja realmente excluir este objetivo anual?");
    if (!confirmado) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('planos_anuais').delete().eq('id', id);
    if (!error) {
        window.mostrarToast("Objetivo removido.");
        window.metasAnuaisLista = window.metasAnuaisLista.filter(m => m.id !== id);
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
    }
};

window.renderizarMetasAnuaisModal = function() {
    const container = document.getElementById('lista-metas-anuais-container');
    if (!container) return;

    container.innerHTML = '';
    const meuId = obterUsuarioId();
    const abaAtiva = window.abaMetasAnuaisAtiva || 'casa';

    const listaFiltrada = (window.metasAnuaisLista || []).filter(m => {
        if (abaAtiva === 'casa') return m.escopo === 'casa';
        else return m.escopo === 'pessoal' && m.criado_por === meuId;
    });

    if (listaFiltrada.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px 8px; color:var(--texto-suave); font-size:12.5px;">
                Nenhum objetivo ${abaAtiva === 'casa' ? 'da família' : 'pessoal'} cadastrado para este ano.<br>
                Toque no botão acima para adicionar o primeiro!
            </div>
        `;
        return;
    }

    listaFiltrada.forEach(meta => {
        const itemEl = document.createElement('div');
        const concluida = meta.concluida === true;

        itemEl.style.cssText = `
            background: #ffffff;
            border: 1px solid ${concluida ? '#86efac' : 'var(--borda-delicada)'};
            border-left: 5px solid ${concluida ? 'var(--cor-sucesso, #10b981)' : 'var(--cor-primaria, #d97706)'};
            border-radius: 12px;
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            ${concluida ? 'opacity: 0.85; background: #f0fdf4;' : ''}
        `;

        const catSegura = window.esc ? window.esc(meta.categoria || 'Geral') : (meta.categoria || 'Geral');
        const titSeguro = window.esc ? window.esc(meta.titulo) : meta.titulo;

        itemEl.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                    <span style="font-size:10px; font-weight:800; background:#fef3c7; color:#b45309; padding:1px 6px; border-radius:4px;">
                        ${meta.ano || 2026}
                    </span>
                    <span style="font-size:10px; font-weight:700; color:var(--texto-suave);">
                        ${catSegura}
                    </span>
                </div>
                <strong style="font-size:13.5px; color:var(--texto-principal); line-height:1.3; display:block; ${concluida ? 'text-decoration:line-through; color:#64748b;' : ''}">
                    ${titSeguro}
                </strong>
            </div>

            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" class="${concluida ? 'btn-secundario' : 'btn-sucesso'}" style="padding:6px 10px; font-size:11px; border-radius:8px;" onclick="window.alternarStatusMetaAnual('${meta.id}', ${concluida})">
                    ${concluida ? 'Feito' : 'Concluir'}
                </button>
                <button type="button" class="btn-erro" style="padding:6px 8px; font-size:11px; border-radius:8px;" onclick="window.excluirMetaAnual('${meta.id}')" title="Excluir">
                    Excluir
                </button>
            </div>
        `;

        container.appendChild(itemEl);
    });
};

// =========================================================================
// 19. GATILHO MATINAL DAS 07:00 AM (PENSE - UMA VEZ AO DIA)
// =========================================================================

window.verificarGatilhoPenseSeteManha = function() {
    const uid = obterUsuarioId();
    if (!uid) return;

    const agora = new Date();
    const hora = agora.getHours();
    const dataHoje = agora.toISOString().split('T')[0];
    const chave = `suiri_pense_visto_${uid}_${dataHoje}`;

    if (hora >= 7 && !localStorage.getItem(chave)) {
        if (typeof window.abrirModalPilulaDia === 'function') {
            setTimeout(() => {
                window.abrirModalPilulaDia();
                localStorage.setItem(chave, 'true');
            }, 800);
        }
    }
};

// =========================================================================
// 20. GATILHO DE NAVEGAÇÃO ENTRE TELAS COM BALANÇO AUTOMÁTICO EM FINANÇAS
// =========================================================================

const navegarOriginal = window.navegarParaTela;
window.navegarParaTela = function(nomeTela) {
    if (typeof navegarOriginal === 'function') {
        navegarOriginal(nomeTela);
    }

    if (nomeTela === 'financeiro') {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');

        const dtInicio = `${ano}-${mes}-01`;
        const dtFim = `${ano}-${mes}-${dia}`;

        const inInicio = document.getElementById('data-inicio');
        const inFim = document.getElementById('data-fim');

        if (inInicio && !inInicio.value) inInicio.value = dtInicio;
        if (inFim && !inFim.value) inFim.value = dtFim;

        document.getElementById('relatorio-pdf-container')?.classList.remove('oculto');

        setTimeout(() => {
            if (typeof window.gerarRelatorio === 'function') {
                window.gerarRelatorio();
            }
        }, 150);
    }
};

// =========================================================================
// 21. INICIALIZAÇÃO AUTOMÁTICA SEGURA DO SWIPE & LISTENERS
// =========================================================================

window.inicializarNavegacaoSwipe();

document.addEventListener("DOMContentLoaded", () => {
    window.inicializarNavegacaoSwipe();
    if (window.familiaAtualId) {
        window.carregarCofresCompartilhados();
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
        window.verificarGatilhoPenseSeteManha();
    }
});
