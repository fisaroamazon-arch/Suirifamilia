// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-OPERACIONAL.JS (100% COMPLETO E INTEGRAL)
// Missões com Ordenação Inteligente (Cumpridas descem para o fim da lista),
// Subitens Despoluídos, Isolamento Kids vs Adultos, Realtime,
// Integração Mascote Tamagotchi Monstrinho, Carregamento Imediato de Cofres,
// Filtro de Membros Sem Cartão, Reconhecimento de Voz Inteligente com Parser
// Financeiro (Entradas / Saídas / Valores / Categorias), Metas Anuais, Zero Emojis,
// Menu Dropdown com Z-Index Soberano, Leitura de Cupom Fiscal IA
// e Exibição Automática do Balanço Financeiro do Mês (Dia 01 até Hoje).
// =========================================================================

let cacheMissoes = [];
let filtroMissoesAtivo = 'todas';
let reconhecimentoVoz = null;
let canalRealtimeMissoes = null;
let canalRealtimeRecados = null;
let instanciaGraficoMesAnterior = null;
window.cofresCompartilhadosLista = [];
window.recadosLarLista = [];

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
            opt.textContent = `${m.nome.split(' ')[0]} ${ehKids ? '(Kids)' : ''}`;
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
// 2. RENDERIZADOR EXCLUSIVO DA TELA KIDS (COM ORDENAÇÃO: CUMPRIDAS DESCEM)
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

    const pendentes = missoesKids.filter(m => m.status === 'pendente');
    if (lblContador) {
        lblContador.textContent = `${pendentes.length} tarefa${pendentes.length === 1 ? '' : 's'}`;
    }

    if (missoesKids.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 16px; background:#ffffff; border-radius:24px; border:2px dashed #fde68a;">
                <div style="margin-bottom:8px; color:#f59e0b;">
                    <svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <strong style="font-size:16px; color:#1e293b; display:block;">Tudo pronto por aqui!</strong>
                <p style="font-size:13px; color:#64748b; margin-top:4px;">Nenhuma tarefa pendente para você agora.</p>
            </div>
        `;
        return;
    }

    const missoesKidsOrdenadas = [...missoesKids].sort((a, b) => {
        const aPendente = (a.status === 'pendente');
        const bPendente = (b.status === 'pendente');
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        return (a.prioridade || 2) - (b.prioridade || 2);
    });

    missoesKidsOrdenadas.forEach(missao => {
        const card = document.createElement('div');
        const concluida = missao.status === 'concluida';
        const falhada = missao.status === 'falhou';
        const feitaPorMim = missao.concluido_por === meuId;
        const feitaPorOutro = concluida && !feitaPorMim && missao.concluido_por;

        card.className = `card-missao-kids ${concluida ? 'concluida' : ''}`;
        if (falhada) {
            card.style.background = '#fff5f5';
            card.style.borderColor = '#fca5a5';
        }
        if (concluida) {
            card.style.opacity = '0.75';
        }

        const xpRecompensa = missao.xp_recompensa || 20;

        let nomeQuemFez = '';
        if (feitaPorOutro && window.listaMembrosFamilia) {
            const membroFez = window.listaMembrosFamilia.find(x => x.id === missao.concluido_por);
            nomeQuemFez = membroFez ? membroFez.nome.split(' ')[0] : 'Outro participante';
        }

        const subitens = Array.isArray(missao.subitens) ? missao.subitens : [];
        let subitensHtml = '';
        if (subitens.length > 0) {
            subitensHtml = '<div style="margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0; display:flex; flex-direction:column; gap:6px;">';
            subitens.forEach(s => {
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; color:#334155; cursor:pointer;">
                        <input type="checkbox" style="width:16px; height:16px; accent-color:#10b981;" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.6;' : 'font-weight:600;'}">${window.esc ? window.esc(s.texto) : s.texto}</span>
                    </label>
                `;
            });
            subitensHtml += '</div>';
        }

        card.innerHTML = `
            <div style="flex:1; padding-right:12px;">
                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                    <span style="font-size:11px; font-weight:800; background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:999px; display:inline-flex; align-items:center; gap:4px;">
                        <svg class="icone-svg" style="width:13px; height:13px; color:#d97706;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg> +${xpRecompensa} XP
                    </span>
                    ${missao.destinatario_kids === 'todos_kids' ? `
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
                <strong style="font-size:15px; color:#1e293b; line-height:1.3; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#64748b;' : ''}">
                    ${window.esc ? window.esc(missao.titulo) : missao.titulo}
                </strong>

                ${feitaPorOutro ? `
                    <div style="margin-top:6px; font-size:12px; font-weight:800; color:#15803d; display:flex; align-items:center; gap:4px;">
                        Concluída primeiro por ${window.esc ? window.esc(nomeQuemFez) : nomeQuemFez}!
                    </div>
                ` : ''}

                ${feitaPorMim ? `
                    <div style="margin-top:6px; font-size:12px; font-weight:800; color:#15803d;">
                        Você completou esta missão!
                    </div>
                ` : ''}

                ${subitensHtml}
            </div>

            <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end; flex-shrink:0;">
                ${(!concluida && !falhada) ? `
                    <button type="button" class="btn-concluir-missao-kids" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border: none; border-radius: 14px; padding: 8px 14px; font-size: 12.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35); cursor: pointer; transition: transform 0.15s ease;" onclick="window.concluirMissaoDomestica('${missao.id}')">
                        <svg class="icone-svg" style="width:15px; height:15px; stroke-width:3;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Fiz!
                    </button>
                    <button type="button" class="btn-erro" style="padding:8px 12px; font-size:12px; font-weight:800; border-radius:14px;" onclick="window.falharMissaoDomestica('${missao.id}')">
                        Não fiz
                    </button>
                ` : (falhada ? `
                    <button type="button" class="btn-secundario" style="padding:6px 10px; font-size:11.5px; font-weight:800; border-radius:12px; border:1px solid #f59e0b; color:#b45309;" onclick="window.reabrirMissaoDomestica('${missao.id}')">
                        Tentar Novamente
                    </button>
                ` : `
                    <span style="font-size:11px; font-weight:800; padding:6px 12px; border-radius:12px; background:#dcfce7; color:#15803d;">
                        Cumprida
                    </span>
                `)}
            </div>
        `;
        container.appendChild(card);
    });
};

// =========================================================================
// 3. SUBITENS OPCIONAIS (CHECKLIST DAS MISSÕES)
// =========================================================================

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
        <input type="text" class="input-subitem-item" placeholder="Sub-etapa (ex: Guardar sapatos, Arrumar cama)" style="flex:1; padding:7px 10px; font-size:12px;">
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
            if (membro) nomeAlvo = membro.nome.split(' ')[0];
        }

        let feitoPor = '';
        if (concluida && m.concluido_por && window.listaMembrosFamilia) {
            const quemFez = window.listaMembrosFamilia.find(x => x.id === m.concluido_por);
            if (quemFez) feitoPor = ` - Feito por: ${quemFez.nome.split(' ')[0]}`;
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
// 7. CICLOS DE RECORRÊNCIA E REATIVAÇÃO AUTOMÁTICA ÀS 04:00
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
                    
                    if (Array.isArray(missao.subitens)) {
                        missao.subitens.forEach(s => s.concluido = false);
                    }

                    await supabase.from('missoes').update({
                        status: 'pendente',
                        concluido_em: null,
                        concluido_por: null,
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
        escopo: escopo,
        prioridade: prio,
        status: 'pendente',
        xp_recompensa: xpPadrao,
        recorrencia_tipo: recorrenciaTipo,
        horario_limite: horaLimite,
        horario_reinicio: horaReinicio.length === 5 ? horaReinicio + ':00' : horaReinicio,
        atribuido_a: atribuidoA,
        destinatario_kids: destinatarioKids,
        subitens: subitens,
        criado_por: obterUsuarioId(),
        concluido_por: null
    };

    const { data, error } = await supabase.from('missoes').insert([payload]).select().single();
    if (error) {
        return window.mostrarToast("Erro ao criar missão: " + error.message, "erro");
    }

    if (inTitulo) inTitulo.value = '';
    if (inHoraLimite) inHoraLimite.value = '';
    
    const containerSub = document.getElementById('container-inputs-subitens-criacao');
    if (containerSub) containerSub.innerHTML = '';

    if (data) cacheMissoes.unshift(data);

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Nova missão confirmada com sucesso!");
};

// =========================================================================
// 8. RENDERIZAÇÃO: ORDENAÇÃO INTELIGENTE (CUMPRIDAS DESCEM PARA O FIM)
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

        let badgeHorario = '';
        if (missao.horario_limite) {
            const partes = missao.horario_limite.split(':');
            const limiteMin = (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
            const atrasada = !concluida && !falhada && horaAtualMinutos > limiteMin;
            badgeHorario = `
                <span style="font-size:10.5px; font-weight:700; color:${atrasada ? '#dc2626' : '#64748b'}; display:inline-flex; align-items:center; gap:3px;">
                    <svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
            const nomeAutor = autor ? autor.nome.split(' ')[0] : 'Concluída';
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
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#475569; cursor:pointer;">
                        <input type="checkbox" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.6;' : ''}">${window.esc ? window.esc(s.texto) : s.texto}</span>
                    </label>
                `;
            });
            subitensHtml += `</div></div>`;
        }

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
                    <strong style="font-size:13.5px; line-height:1.35; color:#1e293b; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#64748b;' : ''}">
                        ${window.esc ? window.esc(missao.titulo) : missao.titulo}
                    </strong>
                    ${subitensHtml}
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    ${(!concluida && !falhada) ? `
                        <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11.5px; border-radius:10px; font-weight:800; display:inline-flex; align-items:center; gap:4px;" onclick="window.concluirMissaoDomestica('${missao.id}')">
                            <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Fiz
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
                                    Falhou
                                </button>
                            ` : ''}
                            <button type="button" style="width:100%; border:none; background:none; padding:8px 10px; font-size:11.5px; text-align:left; color:#334155; cursor:pointer; display:flex; align-items:center; gap:6px; border-top:1px solid #f1f5f9;" onclick="window.iniciarEdicaoMissao('${missao.id}')">
                                <svg class="icone-svg" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar
                            </button>
                            <button type="button" style="width:100%; border:none; background:none; padding:8px 10px; font-size:11.5px; text-align:left; color:var(--cor-erro, #f43f5e); border-top:1px solid #f1f5f9; cursor:pointer; display:flex; align-items:center; gap:6px;" onclick="window.excluirMissao('${missao.id}')">
                                <svg class="icone-svg" style="width:12px; height:12px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};

// =========================================================================
// 9. MENU DE AÇÕES SOBERANO COM ELEVAÇÃO DE Z-INDEX DO CARD PAI
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
                opt.textContent = m.nome.split(' ')[0];
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

    const { error } = await supabase.from('missoes').update({
        titulo: titulo,
        escopo: escopo,
        atribuido_a: atribuidoA,
        destinatario_kids: destinatarioKids,
        prioridade: prio,
        xp_recompensa: xp,
        recorrencia_tipo: recorrenciaTipo,
        horario_limite: horaLimite,
        horario_reinicio: horaReinicio.length === 5 ? horaReinicio + ':00' : horaReinicio
    }).eq('id', id);

    if (error) return window.mostrarToast("Erro ao atualizar: " + error.message, "erro");

    window.fecharModalEditarMissao();
    window.mostrarToast("Missão confirmada e atualizada com sucesso!");
    await window.carregarMissoesDoDia();
};

// =========================================================================
// 10. CONCLUSÃO, CÁLCULO DE PRÓXIMA EXECUÇÃO E MASCOTE ANIMADO
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

    await supabase.from('missoes').update({
        status: 'concluida',
        concluido_em: agoraIso,
        concluido_por: usuarioId,
        proxima_execucao: proximaExec,
        subitens: missao.subitens
    }).eq('id', id);

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
                    window.IconesSuiri?.trofeu || ''
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

    const confirmado = await window.confirmarAcaoSuiri(`Deseja confirmar a marcação de falha nesta missão? Você perderá ${penalidadeXP} XP.`);
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
        proxima_execucao: null,
        subitens: missao ? missao.subitens : []
    }).eq('id', id);

    if (missao) {
        missao.status = 'pendente';
        missao.concluido_em = null;
        missao.concluido_por = null;
        missao.proxima_execucao = null;
    }

    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Missão reaberta para nova tentativa.");
};

window.excluirMissao = async function(id) {
    const confirmado = await window.confirmarAcaoSuiri("Tem certeza de que deseja confirmar a exclusão desta missão?");
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
// 11. MOTOR DE RECONHECIMENTO DE VOZ INTELIGENTE & PARSER AUTOMÁTICO REFINADO
// =========================================================================

window.inicializarMotorVoz = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    reconhecimentoVoz = new SpeechRecognition();
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

    // 1. Deteção do Valor Numérico
    let valorDetectado = 0;
    const matchNumero = texto.match(/(\d+[\d.,]*)/);
    if (matchNumero) {
        let numStr = matchNumero[0].replace(/\.(?=\d{3})/g, '').replace(',', '.');
        valorDetectado = parseFloat(numStr) || 0;
    }

    // 2. Deteção de Fluxo (Entrada vs Saída)
    const padroesEntrada = /recebi|recebido|recebimento|ganhei|sal[aá]rio|caiu|entrou|pix\s+de|renda|dep[oó]sito|vendi|venda|reembolso|lucro|comiss[aã]o|bonifica[cç][aã]o/i;
    const ehReceita = padroesEntrada.test(texto);
    const tipoTransacao = ehReceita ? 'entrada' : 'saida';

    // 3. Deteção de Escopo
    let escopo = 'pessoal';
    if (/casa|fam[ií]lia|lar|mercado|supermercado|condom[ií]nio|energia|luz|água|agua|internet|feira|aluguel|coletivo/i.test(texto)) {
        escopo = 'casa';
    }

    // 4. Inferência Semântica de Categoria
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

    // 5. Higienização Cirúrgica do Item
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
    const selTipo = document.getElementById('select-fin-tipo');
    const selEscopo = document.getElementById('select-fin-escopo');
    const selCat = document.getElementById('select-fin-categoria');

    if (inDesc) inDesc.value = itemLimpo;
    if (inVal && valorDetectado > 0) inVal.value = valorDetectado.toFixed(2);
    if (selTipo) selTipo.value = tipoTransacao;
    if (selEscopo) selEscopo.value = escopo;
    if (selCat) selCat.value = categoria;

    const rotuloTipo = ehReceita ? 'Entrada' : 'Saída';
    window.mostrarToast(`Voz identificada: ${rotuloTipo} • R$ ${valorDetectado.toFixed(2)} (${itemLimpo})`);
};

// =========================================================================
// 11B. MOTOR DE VISÃO COMPUTACIONAL (CUPÃO FISCAL COM IA GEMINI)
// =========================================================================

window.processarCupomFiscalIA = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    let apiKey = localStorage.getItem('suiri_gemini_api_key');
    if (!apiKey) {
        apiKey = prompt("Para a IA ler o cupom, insira a sua chave API do Google Gemini (Google AI Studio):");
        if (!apiKey) {
            window.mostrarToast("Chave da IA não fornecida.", "erro");
            return;
        }
        localStorage.setItem('suiri_gemini_api_key', apiKey.trim());
    }

    window.mostrarToast("A IA está a analisar o seu cupom fiscal... Aguarde um momento.", "info");

    try {
        const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const promptText = `Analise este cupom fiscal ou nota fiscal. Identifique o nome principal do estabelecimento e o valor total exato pago. 
        Classifique a compra numa destas categorias exatas: Supermercado, Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Geral.
        Responda EXATAMENTE e APENAS com um objeto JSON válido, sem crases, blocos de código ou formatação markdown, estritamente com esta estrutura:
        {"estabelecimento": "Nome", "total": 0.00, "categoria": "Categoria"}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inline_data: { mime_type: file.type || "image/jpeg", data: base64String } }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const respostaIA = data.candidates[0].content.parts[0].text;
        const jsonLimpo = respostaIA.replace(/```json/g, '').replace(/```/g, '').trim();
        const dadosCupom = JSON.parse(jsonLimpo);

        const inDesc = document.getElementById('input-fin-descricao');
        const inVal = document.getElementById('input-fin-valor');
        const selCat = document.getElementById('select-fin-categoria');
        const selTipo = document.getElementById('select-fin-tipo');
        const selEscopo = document.getElementById('select-fin-escopo');

        if (inDesc) inDesc.value = dadosCupom.estabelecimento || '';
        if (inVal) inVal.value = (dadosCupom.total || 0).toFixed(2);
        if (selCat) {
            const catValida = Array.from(selCat.options).map(o => o.value).includes(dadosCupom.categoria);
            selCat.value = catValida ? dadosCupom.categoria : 'Geral';
        }
        if (selTipo) selTipo.value = 'saida';
        if (selEscopo) selEscopo.value = 'casa';

        window.mostrarToast(`Cupom lido! R$ ${(dadosCupom.total || 0).toFixed(2)} em ${dadosCupom.estabelecimento}. Confirme os dados e lance na carteira.`);
    } catch (error) {
        console.error("Erro na leitura IA:", error);
        if (error.message && error.message.includes('API key not valid')) {
            localStorage.removeItem('suiri_gemini_api_key');
            window.mostrarToast("A sua chave API é inválida. Tente novamente.", "erro");
        } else {
            window.mostrarToast("Não foi possível processar o cupom. A imagem está nítida?", "erro");
        }
    } finally {
        event.target.value = '';
    }
};

// =========================================================================
// 12. CARTEIRAS, MONTANTE & FILTRAGEM DE MEMBROS SEM CARTÃO
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
        
        // Atualiza o balanço automático caso esteja na tela de Finanças
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
// 13. GRÁFICO EM BARRAS: GASTOS DO MÊS ANTERIOR POR SETOR (CHART.JS)
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
// 14. METAS: POUPANÇA INDIVIDUAL & RESERVA DA FAMÍLIA (COFRES)
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
// 15. MURAL DE RECADOS RÁPIDOS DO LAR
// =========================================================================

window.carregarRecadosLar = async function() {
    const cli = obterClienteSupabase();
    const container = document.getElementById('lista-recados-lar');
    const lblContador = document.getElementById('contador-recados-pendentes');
    if (!cli || !window.familiaAtualId || !container) return;

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome')
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
            if (m) autorNome = m.nome.split(' ')[0];
        }

        const lidosArray = Array.isArray(r.lido_por) ? r.lido_por : [];
        const jaLi = lidosArray.includes(meuId);
        const souAutor = r.autor_id === meuId;

        const dataFmt = r.criado_em ? new Date(r.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        return `
            <div style="background:#ffffff; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:10px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <span style="font-size:10.5px; font-weight:800; color:var(--cor-primaria, #d97706);">${autorNome}</span>
                        <span style="font-size:9.5px; color:var(--texto-suave);">${dataFmt}</span>
                    </div>
                    <div style="font-size:12px; color:var(--texto-principal, #334155); word-break:break-word;">
                        ${window.esc ? window.esc(r.mensagem) : r.mensagem}
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
                            <svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/></svg>
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
    const confirmado = await window.confirmarAcaoSuiri("Tem certeza de que deseja retirar este recado do mural?");
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
// 16. GESTOR DE PLANOS & METAS ANUAIS
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
    const confirmado = await window.confirmarAcaoSuiri("Deseja realmente excluir este objetivo anual?");
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

        itemEl.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                    <span style="font-size:10px; font-weight:800; background:#fef3c7; color:#b45309; padding:1px 6px; border-radius:4px;">
                        ${meta.ano || 2026}
                    </span>
                    <span style="font-size:10px; font-weight:700; color:var(--texto-suave);">
                        ${window.esc ? window.esc(meta.categoria || 'Geral') : (meta.categoria || 'Geral')}
                    </span>
                </div>
                <strong style="font-size:13.5px; color:var(--texto-principal); line-height:1.3; display:block; ${concluida ? 'text-decoration:line-through; color:#64748b;' : ''}">
                    ${window.esc ? window.esc(meta.titulo) : meta.titulo}
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
// 17. GATILHO MATINAL DAS 07:00 AM (PENSE - UMA VEZ AO DIA)
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
// 18. GATILHO DE NAVEGAÇÃO ENTRE TELAS COM BALANÇO AUTOMÁTICO EM FINANÇAS
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
// 19. INICIALIZAÇÃO AUTOMÁTICA SEGURA DO SWIPE & LISTENERS
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
