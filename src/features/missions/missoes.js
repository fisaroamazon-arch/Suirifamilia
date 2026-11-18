/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
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
    const horaNumerica = parseInt(partesHora[0],10);
    const horas = Number.isFinite(horaNumerica) ? Math.min(23,Math.max(0,horaNumerica)) : 4;
    const minutos = parseInt(partesHora[1], 10) || 0;

    proximaData.setHours(horas, minutos, 0, 0);
    return proximaData.toISOString();
}

// verificarReativacaoAutomaticaMissoes está em src/services/operations.js.

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
    
    const inputIcone = document.getElementById('input-nova-missao-icone');
    const inputEmoji = document.getElementById('input-nova-missao-emoji');
    const emojiVal = inputEmoji ? inputEmoji.value.trim() : '';
    let iconeSimbolo = emojiVal || (inputIcone?.value || '⭐');
    
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

    if (!titulo) return window.mostrarToast("Digite o título da missão!", "erro");

    const membroAlvo = (window.listaMembrosFamilia || []).find(m => m.id === atribuidoA);
    const ehParaCrianca = (destinatarioKids === 'todos_kids') || (membroAlvo && (membroAlvo.eh_kids || membroAlvo.papel === 'dependente'));
    if (ehParaCrianca && typeof window.obterEmojiConcordanteKids === 'function') {
        iconeSimbolo = window.obterEmojiConcordanteKids(titulo, emojiVal || iconeSimbolo);
    }

    let horaLimite = inHoraLimite?.value?.trim() || null;
    if (horaLimite && horaLimite.length === 5) horaLimite += ':00';

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
        falhados_por_array: [],
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
    if(window._suiriSugestaoPendente){window.SugestoesMissoes?.registrarAceitaDoUsuario(window._suiriSugestaoPendente);window._suiriSugestaoPendente=null;}

    document.getElementById('modal-nova-missao')?.classList.add('oculto');
    window.renderizarMissoesTela();
    window.carregarMissoesKidsExclusiva();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Nova missão confirmada com sucesso!");
};

// =========================================================================
// 8. RENDERIZAÇÃO ADULTOS: LISTA DIRETA (SEM JANELAS DUPLAS) E ÍCONES EMPILHADOS
// =========================================================================

window.renderizarMissoesTela = function() {
    const container = document.getElementById('lista-missoes-dia');
    if (!container) return;

    container.innerHTML = '';
    if(window.modoKidsAtivo||window.perfilAtual?.eh_kids||window.perfilAtual?.papel==='dependente')return;
    const meuId = obterUsuarioId();

    const missoesAutorizadas = cacheMissoes.map(window.normalizarMissaoColetivaSuiri).filter(m => {
        const audiencia=window.audienciaMissaoSuiri(m);
        if(audiencia.startsWith('kids'))return false;
        const ehColetiva=audiencia==='adultos';
        const ehMinhaPessoal=m.escopo==='pessoal'&&m.criado_por===meuId;
        const publicaDaCasa=m.escopo!=='pessoal';
        return ehColetiva||publicaDaCasa||ehMinhaPessoal||m.atribuido_a===meuId;
    });

    let listaExibicao = missoesAutorizadas;
    if (filtroMissoesAtivo === 'minhas') {
        listaExibicao = missoesAutorizadas.filter(m => m.atribuido_a === meuId || (m.escopo === 'pessoal' && m.criado_por === meuId));
    } else if (filtroMissoesAtivo === 'casa') {
        listaExibicao = missoesAutorizadas.filter(m => (m.escopo === 'casa' || !m.escopo) && !m.atribuido_a);
    }

    const totalTodas=missoesAutorizadas.length;
    const totalMinhas=missoesAutorizadas.filter(m=>m.atribuido_a===meuId||(m.escopo==='pessoal'&&m.criado_por===meuId)).length;
    for(const [id,tipo,nome,total] of [['btn-filtro-missao-todas','todas','Todas',totalTodas],['btn-filtro-missao-minhas','minhas','Minhas',totalMinhas]]){
        const btn=document.getElementById(id);if(!btn)continue;
        btn.textContent=`${nome} (${total})`;btn.setAttribute('aria-pressed',String(filtroMissoesAtivo===tipo));
        btn.setAttribute('aria-controls','lista-missoes-dia');
    }
    const explicacao=document.getElementById('descricao-filtro-missoes');
    if(explicacao)explicacao.textContent=filtroMissoesAtivo==='minhas'?'Tarefas atribuídas a você e suas missões pessoais.':'Missões coletivas e tarefas da casa. Missões Kids ficam no espaço infantil.';

    if (listaExibicao.length === 0) {
        container.innerHTML = `<p class="status-texto" style="text-align:center; padding:20px 0; font-weight:600;">${filtroMissoesAtivo==='minhas'?'Você não tem missões individuais neste momento. Confira as coletivas em Todas.':'Nenhuma missão para este filtro.'}</p>`;
        return;
    }

    listaExibicao.sort((a, b) => {
        const aColetiva = (a.escopo === 'casa' || !a.escopo) && !a.atribuido_a;
        const bColetiva = (b.escopo === 'casa' || !b.escopo) && !b.atribuido_a;
        
        const aConcluidos = Array.isArray(a.concluidos_por_array) ? a.concluidos_por_array : [];
        const bConcluidos = Array.isArray(b.concluidos_por_array) ? b.concluidos_por_array : [];

        const aPendente = aColetiva ? !aConcluidos.includes(meuId) : (a.status === 'pendente');
        const bPendente = bColetiva ? !bConcluidos.includes(meuId) : (b.status === 'pendente');

        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;
        return (a.prioridade || 2) - (b.prioridade || 2);
    });

    const agora = new Date();
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();

    // Contêineres diretos
    const wrapperPendentes = document.createElement('div');
    wrapperPendentes.className = 'container-missoes-pendentes-fluxo';

    const wrapperConcluidas = document.createElement('div');
    wrapperConcluidas.id = 'container-concluidas-adulto';
    wrapperConcluidas.className = 'oculto';

    let totalPendentes = 0;
    let totalConcluidas = 0;

    listaExibicao.forEach(missao => {
        const ehColetiva = (missao.escopo === 'casa' || !missao.escopo) && !missao.atribuido_a;
        
        let concluidosArray = Array.isArray(missao.concluidos_por_array) ? missao.concluidos_por_array : [];
        let falhadosArray = Array.isArray(missao.falhados_por_array) ? missao.falhados_por_array : [];

        if (missao.status === 'concluida' && missao.concluido_por && !ehColetiva) {
            concluidosArray = [missao.concluido_por];
        }

        const euJaFiz = concluidosArray.includes(meuId);
        const euFalhei = falhadosArray.includes(meuId) || (missao.status === 'falhou' && !ehColetiva);
        const concluida = euJaFiz || (missao.status === 'concluida' && !ehColetiva);
        const falhada = euFalhei;

        const prioCor = missao.prioridade === 1 ? '#f43f5e' : (missao.prioridade === 2 ? '#f97316' : '#10b981');
        const prioTexto = missao.prioridade === 1 ? 'Urgente' : (missao.prioridade === 2 ? 'Importante' : 'Tranquilo');

        const iconeChave = missao.icone || '⭐';
        let svgIcone = `<div style="font-size: 22px; line-height: 1;">${iconeChave}</div>`;

        let badgeHorario = '';
        if (missao.horario_limite) {
            const partes = missao.horario_limite.split(':');
            const limiteMin = (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
            const atrasada = !concluida && !falhada && horaAtualMinutos > limiteMin;
            badgeHorario = `
                <span style="font-size:10.5px; font-weight:700; color:${atrasada ? '#e11d48' : '#64748b'}; display:inline-flex; align-items:center; gap:3px;">
                    ${obterIconeSeguro('relogio')}
                    ${missao.horario_limite.slice(0, 5)} ${atrasada ? '(atrasada)' : ''}
                </span>
            `;
        }

        const ehIndividual = missao.escopo === 'pessoal' || (missao.atribuido_a && missao.atribuido_a !== 'todos');
        
        let tagEscopo = '';
        let ofensivaResponsavel = 0;

        if (ehIndividual) {
            tagEscopo = `<span style="font-size:10px; font-weight:800; color:#7c3aed; background:#f3e8ff; padding:2px 7px; border-radius:6px; border:1px solid rgba(124,58,237,0.18);">Individual</span>`;
            if (missao.atribuido_a === meuId) ofensivaResponsavel = window.perfilAtual?.ofensiva_atual || 0;
            else {
                const dono = window.listaMembrosFamilia?.find(x => x.id === missao.atribuido_a);
                if (dono) ofensivaResponsavel = dono.ofensiva_atual || 0;
            }
        } else {
            tagEscopo = `<span style="font-size:10px; font-weight:800; color:#475569; background:#f1f5f9; padding:2px 7px; border-radius:6px; border:1px solid rgba(100,116,139,0.18);">Casa</span>`;
            ofensivaResponsavel = window.perfilAtual?.ofensiva_atual || 0;
        }

        const tagOfensiva = `<span style="font-size:10px; font-weight:800; color:#f43f5e; background:#ffe4e6; padding:2px 7px; border-radius:6px; margin-left:4px; display:inline-flex; align-items:center; gap:2px;"><img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:11px; height:11px; object-fit:contain;"> ${ofensivaResponsavel}d</span>`;

        let badgeCumprido = '';
        if (concluida && missao.concluido_por && window.listaMembrosFamilia && !ehColetiva) {
            const autor = window.listaMembrosFamilia.find(m => m.id === missao.concluido_por);
            const nomeAutor = autor ? obterPrimeiroNomeSeguro(autor.nome, 'Concluída') : 'Concluída';
            badgeCumprido = `<span style="font-size:10.5px; font-weight:700; color:#15803d;">• Feito por ${nomeAutor}</span>`;
        } else if (falhada) {
            badgeCumprido = `<span style="font-size:10.5px; font-weight:700; color:#e11d48;">• Não cumprida</span>`;
        }

        let grupoAvataresHtml = '';
        if (ehColetiva && window.listaMembrosFamilia) {
            const adultos = window.listaMembrosFamilia.filter(m => !m.eh_kids && m.papel !== 'dependente');
            if (adultos.length > 0) {
                grupoAvataresHtml = `<div class="grupo-avatares-adultos" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">`;
                adultos.forEach(adulto => {
                    const adultoFez = concluidosArray.includes(adulto.id);
                    const adultoFalhou = falhadosArray.includes(adulto.id);

                    let corBorda = '#f97316';
                    let sombra = 'none';

                    if (adultoFez) {
                        corBorda = '#10b981';
                        sombra = '0 0 10px rgba(16, 185, 129, 0.65)';
                    } else if (adultoFalhou) {
                        corBorda = '#f43f5e';
                        sombra = '0 0 8px rgba(244, 63, 94, 0.55)';
                    }

                    const fotoSrc = adulto.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                    const nomeCurto = window.esc ? window.esc(adulto.nome) : adulto.nome;
                    
                    grupoAvataresHtml += `<img src="${fotoSrc}" style="width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid ${corBorda}; box-shadow: ${sombra}; object-fit: cover; background: #fff; transition: transform 0.2s ease;" title="${nomeCurto}">`;
                });
                grupoAvataresHtml += `</div>`;
            }
        }

        const subitens = Array.isArray(missao.subitens) ? missao.subitens : [];
        let subitensHtml = '';
        if (subitens.length > 0) {
            const concluidos = subitens.filter(s => s.concluido).length;
            subitensHtml = `
                <div style="margin-top:6px;">
                    <button type="button" onclick="window.alternarVisualizacaoSubitensCard('${missao.id}')" style="background:none; border:none; padding:0; font-size:11.5px; font-weight:700; color:#64748b; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                        <span>Etapas (${concluidos}/${subitens.length})</span>
                        <span id="seta-subitens-${missao.id}" style="transition:transform 0.2s ease; display:inline-block;">▼</span>
                    </button>
                    <div id="box-subitens-missao-${missao.id}" class="oculto" style="margin-top:6px; padding:8px 10px; background:#f8fafc; border-radius:10px; border:1px solid rgba(226,232,240,0.85); display:flex; flex-direction:column; gap:5px;">
            `;
            subitens.forEach(s => {
                const textoSub = window.esc ? window.esc(s.texto) : s.texto;
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#334155; cursor:pointer;">
                        <input type="checkbox" style="accent-color:#10b981;" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.55;' : ''}">${textoSub}</span>
                    </label>
                `;
            });
            subitensHtml += `</div></div>`;
        }

        const tituloMissaoSeguro = window.esc ? window.esc(missao.titulo) : missao.titulo;

        const itemLinha = document.createElement('div');
        itemLinha.id = `card-missao-bloco-${missao.id}`;
        itemLinha.className = `item-missao-linha-sutil ${concluida ? 'concluida' : ''}`;

        itemLinha.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; width:100%;">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">
                        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${prioCor};" title="${prioTexto}"></span>
                        ${tagEscopo}
                        ${tagOfensiva}
                        <span style="font-size:10.5px; color:#ea580c; background:#fff7ed; padding:2px 7px; border-radius:6px; font-weight:800; border:1px solid rgba(249,115,22,0.18);">+${missao.xp_recompensa || 20} XP</span>
                        ${badgeHorario}
                        ${badgeCumprido}
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:flex; align-items:center;">
                            ${svgIcone}
                        </span>
                        <strong style="font-size:13.5px; line-height:1.35; color:#0f172a; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#94a3b8;' : ''}">
                            ${tituloMissaoSeguro}
                        </strong>
                    </div>
                    ${grupoAvataresHtml}
                    ${subitensHtml}
                </div>

                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                        ${(!concluida && !falhada) ? `
                            <button type="button" onclick="window.concluirMissaoDomestica('${missao.id}')" title="Aprovar / Fiz" style="background:none; border:none; padding:3px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease;">
                                ${obterIconeSeguro('check')}
                            </button>
                            <button type="button" onclick="window.falharMissaoDomestica('${missao.id}')" title="Desaprovar / Não fiz" style="background:none; border:none; padding:3px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease;">
                                ${obterIconeSeguro('xis')}
                            </button>
                        ` : (falhada ? `
                            <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px; font-weight:700; color:#ea580c; border-radius:8px;" onclick="window.reabrirMissaoDomestica('${missao.id}')">
                                Tentar
                            </button>
                        ` : `
                            <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px; color:#64748b; border-radius:8px;" onclick="window.reabrirMissaoDomestica('${missao.id}')" title="Refazer">
                                Refazer
                            </button>
                        `)}
                    </div>

                    <div style="position:relative;">
                        <button type="button" class="btn-secundario" style="width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; font-size:13px; line-height:1; font-weight:800; border-radius:8px;" onclick="event.stopPropagation(); window.alternarMenuAcoesMissao('${missao.id}')">
                            ⋮
                        </button>
                        <div id="menu-drop-missao-${missao.id}" class="oculto" style="position:absolute; right:0; top:32px; background:#ffffff; border:1px solid rgba(226, 232, 240, 0.95); border-radius:14px; box-shadow:0 10px 28px rgba(15, 23, 42, 0.12); z-index:10000; min-width:150px; overflow:hidden;">
                            <button type="button" style="width:100%; border:none; background:none; padding:9px 12px; font-size:12px; text-align:left; color:#334155; cursor:pointer; display:flex; align-items:center; gap:7px;" onclick="window.iniciarEdicaoMissao('${missao.id}')">
                                ${obterIconeSeguro('editar')} Editar
                            </button>
                            <button type="button" style="width:100%; border:none; background:none; padding:9px 12px; font-size:12px; text-align:left; color:#334155; cursor:pointer; display:flex; align-items:center; gap:7px;" onclick="if(window.alfinetarItemEspecifico) window.alfinetarItemEspecifico('missao', '${missao.id}')">
                                <img src="assets/icons-modern/icone-alfinete.svg" alt="Fixar" style="width:14px; height:14px; object-fit:contain;"> Fixar no Espaço
                            </button>
                            <button type="button" style="width:100%; border:none; background:none; padding:9px 12px; font-size:12px; text-align:left; color:var(--cor-erro, #f43f5e); border-top:1px solid #f1f5f9; cursor:pointer; display:flex; align-items:center; gap:7px;" onclick="window.excluirMissao('${missao.id}')">
                                ${obterIconeSeguro('excluir')} Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if(missao.atribuido_a && missao.atribuido_a!==meuId){
            itemLinha.querySelectorAll('button[onclick*="concluirMissaoDomestica"],button[onclick*="falharMissaoDomestica"],button[onclick*="reabrirMissaoDomestica"]').forEach(b=>{b.disabled=true;b.title='Tarefa atribuída a outro membro';b.setAttribute('aria-label','Tarefa atribuída a outro membro');});
        }

        if (concluida) {
            wrapperConcluidas.appendChild(itemLinha);
            totalConcluidas++;
        } else {
            wrapperPendentes.appendChild(itemLinha);
            totalPendentes++;
        }
    });

    if (totalPendentes > 0) {
        container.appendChild(wrapperPendentes);
    } else {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:20px 0; font-weight:600;">Todas as tarefas do dia foram concluídas! 🌟</p>';
    }

    if (totalConcluidas > 0) {
        const divToggle = document.createElement('div');
        divToggle.style.cssText = 'text-align: center; margin: 16px 0 8px 0;';
        divToggle.innerHTML = `
            <button type="button" class="btn-secundario" style="padding: 7px 16px; font-size: 12px; font-weight: 700; border-radius: 12px; border: 1px dashed rgba(226, 232, 240, 0.95); color: var(--texto-suave); cursor: pointer;" onclick="window.alternarMissoesConcluidas('adulto', ${totalConcluidas})">
                <span id="txt-btn-concluidas-adulto">Ver ${totalConcluidas} tarefas concluídas ▼</span>
            </button>
        `;
        container.appendChild(divToggle);
        container.appendChild(wrapperConcluidas);
    }
};

// =========================================================================
// 9. MENU DE AÇÕES SOBERANO E EDIÇÃO
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
    
    const iconeChave = missao.icone || '⭐';
    const inputEmoji = document.getElementById('edit-missao-emoji');
    const inputIcone = document.getElementById('input-edit-missao-icone');
    
    if (inputEmoji) {
        inputEmoji.value = iconeChave;
    }
    if (inputIcone) {
        inputIcone.value = iconeChave;
    }
    
    const btnEditIcone = document.getElementById('btn-icone-edit-missao');
    if (btnEditIcone) {
        btnEditIcone.innerHTML = `<span id="svg-preview-edit-missao" style="display:flex; align-items:center; justify-content:center; width:34px; height:34px; font-size:32px; line-height:1; user-select:none;">${iconeChave}</span>`;
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
    
    const inputEmoji = document.getElementById('edit-missao-emoji');
    const emojiVal = inputEmoji ? inputEmoji.value.trim() : '';
    const iconeSimbolo = emojiVal || (document.getElementById('input-edit-missao-icone')?.value || '⭐');

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
// 10. CONCLUSÃO E PENALIZAÇÃO (FOTINHAS COOPERATIVAS APLICADAS - TRICOLOR)
// =========================================================================

// concluirMissaoDomestica está em src/services/operations.js.

// falharMissaoDomestica está em src/services/operations.js.

// reabrirMissaoDomestica está em src/services/operations.js.

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
// 11. SELETOR VISUAL DE EMOJIS PUROS (SEM DEPENDÊNCIA DE SVGS)
// =========================================================================

