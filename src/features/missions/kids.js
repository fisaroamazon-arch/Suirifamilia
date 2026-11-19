/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
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
    
    setTimeout(window.injetarPinosNosModais, 500);
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
        console.warn("Realtime de missoes restrito", e);
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
        console.warn("Realtime de recados restrito", e);
    }
};

window.preencherSelectResponsaveisMissoes = async function() {
    const supabase = obterClienteSupabase();
    if (!window.familiaAtualId || !supabase) return;

    let membros = window.listaMembrosFamilia;
    if (!membros || membros.length === 0) {
        const { data } = await supabase
            .from('membros')
            .select('id, nome, papel, eh_kids, possui_cartao, avatar_url, ofensiva_atual')
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

    const familiaConsultada = window.familiaAtualId;
    const perfilConsultado = obterUsuarioId();
    const consulta = ++versaoCarregamentoMissoes;
    const consultaAtiva = () => consulta === versaoCarregamentoMissoes &&
        familiaConsultada === window.familiaAtualId && perfilConsultado === obterUsuarioId();
    try {
        const { data, error } = await supabase
            .from('missoes')
            .select('*')
            .eq('familia_id', familiaConsultada)
            .order('prioridade', { ascending: true })
            .order('criado_em', { ascending: false });
        if (!consultaAtiva()) return;
        if (error) throw error;
        cacheMissoes = (data || []).map(window.normalizarMissaoColetivaSuiri)
            .filter(m => !ehMissaoPessoalSuiri(m) || responsavelMissaoSuiri(m) === perfilConsultado);
    } catch (erro) {
        if (!consultaAtiva()) return;
        if (window.modoKidsAtivo) {
            const container = document.getElementById('lista-missoes-kids-container');
            if (container) {
                container.innerHTML = '<p role="status">Não foi possível carregar suas missões.</p><button type="button" class="btn-secundario">Tentar de novo</button>';
                container.querySelector('button').onclick = window.carregarMissoesDoDia;
            }
            const contador = document.getElementById('contador-missoes-kids-pendentes');
            if (contador) contador.textContent = '—';
        }
        console.warn('Falha ao carregar missões', erro);
        return;
    }

    window.verificarReativacaoAutomaticaMissoes();
    window.carregarMissoesKidsExclusiva();
    window.renderizarMissoesTela();
    window.renderizarHistoricoMissoesKidsADM();
};

// =========================================================================
// 2. RENDERIZADOR EXCLUSIVO DA TELA KIDS (WARM TECH)
// =========================================================================

window.carregarMissoesKidsExclusiva = function() {
    const container = document.getElementById('lista-missoes-kids-container');
    const lblContador = document.getElementById('contador-missoes-kids-pendentes');
    if (!container) return;

    container.innerHTML = '';
    const meuId = obterUsuarioId();

    if (String(window.perfilAtual?.permissoes?.missoes).toLowerCase() === 'false') {
        if (lblContador) lblContador.textContent = '—';
        container.textContent = 'As missões estão desativadas para este perfil.';
        return;
    }
    const missoesKids = cacheMissoes.filter(m => missaoVisivelNoPainelKids(m, meuId));

    const estaPendente = m => m.destinatario_kids === 'todos_kids'
        ? !m.concluidos_por_array?.includes(meuId) && !m.falhados_por_array?.includes(meuId)
        : m.status === 'pendente';
    const pendentes = missoesKids.filter(estaPendente);

    if (lblContador) {
        lblContador.textContent = `${pendentes.length} tarefa${pendentes.length === 1 ? '' : 's'}`;
    }

    if (missoesKids.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 18px; background:rgba(255,255,255,0.92); border-radius:24px; border:2px dashed #fed7aa; box-shadow:0 4px 14px rgba(15,23,42,0.03);">
                <div style="font-size:40px; margin-bottom:8px;">🌟</div>
                <strong style="font-size:16.5px; color:#0f172a; display:block;">Tudo pronto por aqui!</strong>
                <p style="font-size:13px; color:#64748b; margin-top:4px; line-height:1.4;">Nenhuma tarefa pendente para você agora.</p>
            </div>
        `;
        return;
    }

    const missoesKidsOrdenadas = [...missoesKids].sort((a, b) => {
        const ordemEstado = Number(estaPendente(b)) - Number(estaPendente(a));
        if (ordemEstado) return ordemEstado;
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
        let falhadosArray = Array.isArray(missao.falhados_por_array) ? missao.falhados_por_array : [];

        if (missao.status === 'concluida' && missao.concluido_por && !ehTodosKids) {
            concluidosArray = [missao.concluido_por];
        }

        const euJaFiz = concluidosArray.includes(meuId);
        const euFalhei = falhadosArray.includes(meuId) || (missao.status === 'falhou' && !ehTodosKids);
        const algumIrmaoJaFez = ehTodosKids && concluidosArray.length > 0 && !euJaFiz;
        const concluida = euJaFiz || (missao.status === 'concluida' && !ehTodosKids);
        const falhada = euFalhei;
        const parciais = missao.parcial_por_array;
        const parcial = concluida && Array.isArray(parciais) && parciais.includes(meuId);

        card.className = `card-missao-kids ${concluida ? 'concluida' : ''}`;
        card.style.flexDirection = 'column';
        if (falhada) {
            card.style.background = '#fff1f2';
            card.style.borderColor = '#fecdd3';
        }
        if (concluida) {
            card.style.opacity = '0.78';
        }

        const xpRecompensa = missao.xp_recompensa ?? 20;

        let grupoAvataresHtml = '';
        let mensagemIrmaoFezHtml = '';

        if (ehTodosKids && window.listaMembrosFamilia) {
            const todasCriancas = window.listaMembrosFamilia.filter(m => m.eh_kids || m.papel === 'dependente');
            
            if (todasCriancas.length > 0) {
                grupoAvataresHtml = `<div class="grupo-avatares-kids" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">`;
                todasCriancas.forEach(crianca => {
                    const criancaFez = concluidosArray.includes(crianca.id);
                    const criancaFalhou = falhadosArray.includes(crianca.id);

                    let corBorda = '#f97316';
                    let sombra = 'none';

                    if (criancaFez) {
                        corBorda = '#10b981';
                        sombra = '0 0 10px rgba(16, 185, 129, 0.65)';
                    } else if (criancaFalhou) {
                        corBorda = '#f43f5e';
                        sombra = '0 0 8px rgba(244, 63, 94, 0.55)';
                    }

                    const fotoSrc = crianca.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
                    const nomeCurto = window.esc ? window.esc(crianca.nome) : crianca.nome;
                    grupoAvataresHtml += `<img src="${fotoSrc}" style="width: 42px; height: 42px; border-radius: 50%; border: 3px solid ${corBorda}; box-shadow: ${sombra}; object-fit: cover; background: #fff; transition: transform 0.2s ease;" title="${nomeCurto}">`;
                });
                grupoAvataresHtml += `</div>`;

                if (algumIrmaoJaFez) {
                    const idPrimeiroFez = concluidosArray[0];
                    const irmao = todasCriancas.find(c => c.id === idPrimeiroFez);
                    if (irmao) {
                        mensagemIrmaoFezHtml = `
                            <div style="margin-top:6px; font-size:12px; font-weight:800; color:#c2410c; display:flex; align-items:center; gap:5px; background:#fff7ed; padding:5px 9px; border-radius:8px; border:1px solid #fed7aa;">
                                ${obterPrimeiroNomeSeguro(irmao.nome)} já completou a tarefa, falta você!
                            </div>
                        `;
                    }
                }
            }
        }

        const iconeVisual = `<div style="font-size: 34px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); user-select: none;">${missao.icone || '⭐'}</div>`;

        const subitens = Array.isArray(missao.subitens) ? missao.subitens : [];
        let subitensHtml = '';
        if (subitens.length > 0) {
            subitensHtml = '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(226, 232, 240, 0.9); display:flex; flex-direction:column; gap:6px;">';
            subitens.forEach(s => {
                const textoSub = window.esc ? window.esc(s.texto) : s.texto;
                subitensHtml += `
                    <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; color:#334155; cursor:pointer;">
                        <input type="checkbox" style="width:17px; height:17px; accent-color:#10b981;" ${s.concluido ? 'checked' : ''} ${concluida || falhada ? 'disabled' : ''} 
                               onchange="window.toggleSubitemMissao('${missao.id}', '${s.id}')">
                        <span style="${s.concluido ? 'text-decoration:line-through; opacity:0.55;' : 'font-weight:600;'}">${textoSub}</span>
                    </label>
                `;
            });
            subitensHtml += '</div>';
        }

        const tituloMissaoSeguro = window.esc ? window.esc(missao.titulo) : missao.titulo;

        card.innerHTML = `
            <div style="display:flex; gap:12px; align-items:flex-start;">
                <div style="width: 58px; height: 58px; border-radius: 18px; background: ${concluida ? '#dcfce7' : (falhada ? '#ffe4e6' : '#fff7ed')}; border: 2px solid ${concluida ? '#86efac' : (falhada ? '#fecdd3' : '#fed7aa')}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(15,23,42,0.04);">
                    ${iconeVisual}
                </div>

                <div style="flex:1; min-width:0; padding-right:4px;">
                    <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                        <span style="font-size:11.5px; font-weight:800; background:#fff7ed; color:#ea580c; border:1px solid #ffedd5; padding:2px 8px; border-radius:999px; display:inline-flex; align-items:center; gap:4px;">
                            ${obterIconeSeguro('moeda')} ${parcial ? '50% do XP' : `+${xpRecompensa} XP`}
                        </span>
                        ${ehTodosKids ? `
                            <span style="font-size:10.5px; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:999px; border:1px solid rgba(2,132,199,0.2);">
                                Todos Kids
                            </span>
                        ` : ''}
                        ${missao.horario_limite ? `
                            <span style="font-size:10.5px; font-weight:700; color:#0369a1; background:#e0f2fe; padding:2px 7px; border-radius:999px; display:inline-flex; align-items:center; gap:3px;">
                                ${obterIconeSeguro('relogio')} até ${missao.horario_limite.slice(0, 5)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <strong style="font-size:16.5px; color:#0f172a; line-height:1.3; display:block; ${concluida || falhada ? 'text-decoration:line-through; color:#64748b;' : ''}">
                        ${tituloMissaoSeguro}
                    </strong>
                    
                    ${grupoAvataresHtml}
                    ${mensagemIrmaoFezHtml}

                    ${(concluida && !ehTodosKids && !parcial) ? `
                        <div style="margin-top:6px; font-size:12px; font-weight:800; color:#15803d;">
                            Você completou esta missão!
                        </div>
                    ` : ''}

                    ${subitensHtml}
                </div>
            </div>

            <div class="acoes-missao-kids" style="border-top: 1.5px dashed ${concluida || falhada ? 'transparent' : 'rgba(249, 115, 22, 0.2)'};">
                ${(!concluida && !falhada) ? `
                    <button type="button" class="btn-erro" data-missao-acao="fail" data-missao-id="${esc(missao.id)}">
                        ${obterIconeSeguro('joinhaInvertido')} Não fiz
                    </button>
                    ${Array.isArray(parciais) ? `
                        <button type="button" class="btn-parcial-kids" data-missao-acao="partial" data-missao-id="${esc(missao.id)}">
                            <svg class="kids-icon" aria-hidden="true"><use href="assets/icons-modern/kids.svg#partial"></use></svg> Fiz em partes
                            <small>Metade do XP</small>
                        </button>
                    ` : ''}
                    <button type="button" class="btn-sucesso" data-missao-acao="complete" data-missao-id="${esc(missao.id)}">
                        ${obterIconeSeguro('joinha')} Fiz!
                    </button>
                ` : (falhada ? `
                    <button type="button" class="btn-secundario" style="padding:10px 16px; font-size:13px; font-weight:800; border-radius:14px; border:1.5px solid #f97316; color:#ea580c; width:100%; box-shadow: 0 2px 6px rgba(0,0,0,0.03);" data-missao-acao="reopen" data-missao-id="${esc(missao.id)}">
                        Tentar Novamente
                    </button>
                ` : `
                    <span style="font-size:13px; font-weight:800; padding:10px 16px; width:100%; text-align:center; border-radius:14px; background:#ecfdf5; color:#065f46; border: 1.5px solid #a7f3d0;">
                        ${parcial ? 'Missão feita em partes' : 'Missão cumprida!'}
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
            <button type="button" class="btn-secundario" style="padding: 9px 18px; font-size: 12px; font-weight: 800; border-radius: 14px; border: 1.5px dashed rgba(16, 185, 129, 0.45); color: #065f46; background: #ecfdf5; cursor: pointer;" onclick="window.alternarMissoesConcluidas('kids', ${wrapperConcluidas.children.length})">
                <span id="txt-btn-concluidas-kids">Ver ${wrapperConcluidas.children.length} missões concluídas ▼</span>
            </button>
        `;
        container.appendChild(divToggle);
        container.appendChild(wrapperConcluidas);
    }
};

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
    if (!missao || !podeOperarMissaoSuiri(missao) || !Array.isArray(missao.subitens) || !supabase) return;

    const sub = missao.subitens.find(s => s.id === subitemId);
    if (!sub) return;

    const familiaId = window.familiaAtualId;
    const perfilId = obterUsuarioId();
    const subitens = missao.subitens.map(item => item === sub ? { ...item, concluido: !item.concluido } : item);
    try {
        Suiri.check(await supabase.from('missoes').update({ subitens })
            .eq('id', missaoId).eq('familia_id', familiaId).select('id'), 1);
    } catch (erro) {
        if (obterUsuarioId() === perfilId) {
            Suiri.notifyError(erro);
            window.renderizarMissoesTela();
            window.carregarMissoesKidsExclusiva();
        }
        return;
    }
    if (obterUsuarioId() !== perfilId || window.familiaAtualId !== familiaId) return;
    missao.subitens = subitens;

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
        <input type="text" class="input-subitem-item" placeholder="Sub-etapa (ex: Guardar sapatos)" style="flex:1; padding:8px 11px; font-size:12.5px; border-radius:10px; border:1px solid #cbd5e1;">
        <button type="button" class="btn-erro" style="padding:6px 10px; font-size:12px; border-radius:10px; display:inline-flex; align-items:center; gap:3px;" onclick="this.parentElement.remove()">
            ${obterIconeSeguro('excluir')}
        </button>
    `;
    container.appendChild(div);
};

// =========================================================================
// 4. HISTÓRICO DE MISSÕES KIDS PARA O ADMINISTRADOR & CONVERSÃO EM MESADA
// =========================================================================

window.renderizarHistoricoMissoesKidsADM = function() {
    const container = document.getElementById('painel-historico-missoes-kids-adm');
    if (!container) return;

    if (!ehAdministrador()) {
        container.classList.add('oculto');
        return;
    }

    container.classList.remove('oculto');
    
    let totalXPKids = 0;
    if (window.listaMembrosFamilia) {
        window.listaMembrosFamilia.forEach(m => {
            if (m.eh_kids || m.papel === 'dependente') {
                totalXPKids += Number(m.xp_total || 0);
            }
        });
    }
    const lblXPDisp = document.getElementById('lbl-xp-disponivel-conversao');
    if (lblXPDisp) lblXPDisp.textContent = `${totalXPKids} XP`;

    const taxa = JSON.parse(localStorage.getItem(`suiri_taxa_xp_${window.familiaAtualId}`) || '{"qtd": 100, "valor": 5.00}');
    const lblTaxa = document.getElementById('lbl-taxa-conversao-xp');
    if (lblTaxa) lblTaxa.textContent = `${taxa.qtd} XP = R$ ${Number(taxa.valor).toFixed(2)}`;
    
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
        corpoLista.innerHTML = '<span style="font-size:12px; color:var(--texto-suave); text-align:center; display:block; padding:10px;">Nenhuma atividade infantil registrada.</span>';
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

        const parcial = m.parcial_por_array?.includes?.(m.concluido_por) === true;
        let feitoPor = '';
        if ((concluida || parcial) && m.concluido_por && window.listaMembrosFamilia) {
            const quemFez = window.listaMembrosFamilia.find(x => x.id === m.concluido_por);
            if (quemFez) feitoPor = ` - Feito por: ${obterPrimeiroNomeSeguro(quemFez.nome)}`;
        }

        const linha = document.createElement('div');
        linha.style.cssText = `
            background:#ffffff; 
            border:1px solid rgba(226, 232, 240, 0.9); 
            border-left:4px solid ${concluida ? '#10b981' : (falhou ? '#f43f5e' : '#f97316')}; 
            border-radius:12px; 
            padding:10px 12px; 
            margin-bottom:7px; 
            display:flex; 
            justify-content:space-between; 
            align-items:center;
            gap:8px;
            box-shadow: 0 1px 3px rgba(15,23,42,0.02);
        `;

        linha.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                    <span style="font-size:10px; font-weight:800; background:#fff7ed; color:#ea580c; padding:2px 7px; border-radius:6px; border:1px solid rgba(249,115,22,0.18);">
                        ${nomeAlvo}
                    </span>
                    <span style="font-size:11px; font-weight:800; color:${concluida ? '#15803d' : (falhou ? '#e11d48' : '#ea580c')};">
                        ${parcial ? 'Feita em partes' : concluida ? 'Concluída' : falhou ? 'Fracassada' : 'Pendente'} ${feitoPor}
                    </span>
                </div>
                <strong style="font-size:13.5px; color:var(--texto-principal, #0f172a);">${window.esc ? window.esc(m.titulo) : m.titulo}</strong>
            </div>

            <div style="display:flex; gap:6px; flex-shrink:0;">
                <button type="button" class="btn-secundario" style="padding:6px 9px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center; gap:4px;" onclick="window.iniciarEdicaoMissao('${m.id}')" title="Editar">
                    ${obterIconeSeguro('editar')} Editar
                </button>
                <button type="button" class="btn-erro" style="padding:6px 9px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center; gap:4px;" onclick="window.excluirMissao('${m.id}')" title="Excluir do Histórico">
                    ${obterIconeSeguro('excluir')} Excluir
                </button>
            </div>
        `;

        corpoLista.appendChild(linha);
    });
};

window.abrirModalConfigurarTaxaXP = function() {
    const taxa = JSON.parse(localStorage.getItem(`suiri_taxa_xp_${window.familiaAtualId}`) || '{"qtd": 100, "valor": 5.00}');
    const inQtd = document.getElementById('input-taxa-xp-quantidade');
    const inVal = document.getElementById('input-taxa-xp-valor');
    if(inQtd) inQtd.value = taxa.qtd;
    if(inVal) inVal.value = Number(taxa.valor).toFixed(2);
    document.getElementById('modal-configurar-taxa-xp')?.classList.remove('oculto');
};

window.fecharModalConfigurarTaxaXP = function() {
    document.getElementById('modal-configurar-taxa-xp')?.classList.add('oculto');
};

window.salvarTaxaConversaoXP = function() {
    const qtd = parseInt(document.getElementById('input-taxa-xp-quantidade')?.value, 10);
    const val = parseFloat(document.getElementById('input-taxa-xp-valor')?.value);
    
    if(isNaN(qtd) || isNaN(val) || qtd <= 0 || val <= 0) {
        return window.mostrarToast("Valores inválidos para a taxa.", "erro");
    }
    
    localStorage.setItem(`suiri_taxa_xp_${window.familiaAtualId}`, JSON.stringify({qtd, valor: val}));
    window.fecharModalConfigurarTaxaXP();
    window.renderizarHistoricoMissoesKidsADM();
    window.mostrarToast("Taxa de câmbio salva com sucesso!");
};

// converterXPParaMesada está em src/services/operations.js.

// =========================================================================
// 5. FILTRAGEM DE MISSÕES (TELA TRADICIONAL DE ADULTOS)
// =========================================================================

window.filtrarMissoesPorAba = function(tipo) {
    window.filtrarMissoesExibicao(tipo);
};

window.filtrarMissoesExibicao = function(tipo) {
    if(!['todas','minhas','casa'].includes(tipo))return;
    filtroMissoesAtivo = tipo;
    
    const btnTodas = document.getElementById('btn-filtro-missao-todas') || document.getElementById('btn-filtro-todas-casa');
    const btnMinhas = document.getElementById('btn-filtro-missao-minhas') || document.getElementById('btn-filtro-minhas-pessoais');

    if (btnTodas && btnMinhas) {
        if (tipo === 'todas' || tipo === 'casa') {
            btnTodas.className = 'btn-filtro-missao ativo';
            btnMinhas.className = 'btn-filtro-missao';
        } else {
            btnMinhas.className = 'btn-filtro-missao ativo';
            btnTodas.className = 'btn-filtro-missao';
        }
    }

    window.renderizarMissoesTela();
};

// =========================================================================
// 6. NAVEGAÇÃO POR DESLIZE DE DEDOS (SWIPE GESTURES)
// =========================================================================

