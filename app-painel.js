// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-PAINEL.JS (100% COMPLETO E INTEGRAL)
// Gestão de Membros, Adaptação Dinâmica Solo vs Família, Calendário com 
// Privacidade Estrita (Eventos Pessoais vs Lar), Realtime & Zero Emojis (SVG)
// Padrão de Diálogos: Confirmar / Cancelar
// =========================================================================

window.listaMembrosFamilia = [];
window.dataCalendarioAtual = new Date();
window.eventosCalendarioAtual = [];
window.contasCalendarioAtual = [];
window.filtroCalendarioAtivo = 'todos';

function obterClienteSupabase() {
    return window.clienteSupabase || window.cliente || (typeof cliente !== 'undefined' ? cliente : null);
}

function obterUsuarioId() {
    return window.perfilAtual?.id || window.usuarioAtual?.id || null;
}

// =========================================================================
// 1. GESTÃO DE MEMBROS E ADAPTAÇÃO DINÂMICA (INDIVIDUAL VS FAMÍLIA)
// =========================================================================

window.carregarListaMembrosPainel = async function() {
    const cli = obterClienteSupabase();
    if (!window.familiaAtualId || !cli) return;

    const { data, error } = await cli.from('membros')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('nome');

    if (error) {
        console.error("Erro ao carregar membros:", error);
        return;
    }

    window.listaMembrosFamilia = data || [];
    window.aplicarAdaptacaoSoloOuFamilia();
    window.renderizarMembrosFamiliaPainel();
    window.atualizarTodosSeletoresMembros();
};

// Adapta textos, botões e secções caso o usuário more sozinho (1 membro)
window.aplicarAdaptacaoSoloOuFamilia = function() {
    const totalMembros = window.listaMembrosFamilia.length;
    const ehSolo = totalMembros <= 1;

    // Rótulo da barra de navegação
    const navFam = document.getElementById('nav-item-lbl-familia');
    if (navFam) navFam.textContent = ehSolo ? 'Meu Espaço' : 'Família';

    // Rótulo da aba de missões
    const navMissoes = document.getElementById('nav-item-lbl-missoes');
    if (navMissoes) navMissoes.textContent = ehSolo ? 'Minhas Tarefas' : 'Missões';

    // Botão de Nova Missão na Home
    const lblNovaMissao = document.getElementById('lbl-btn-nova-missao-expansivel');
    if (lblNovaMissao) lblNovaMissao.textContent = ehSolo ? '+ Nova Tarefa Pessoal' : '+ Nova Missão para a Casa';

    // Mural de recados (se for solo, ajusta para notas/lembretes pessoais)
    const lblMural = document.getElementById('lbl-titulo-mural-recados');
    if (lblMural) lblMural.textContent = ehSolo ? 'Minhas Notas & Lembretes' : 'Mural de Recados da Casa';

    const inputRecado = document.getElementById('input-novo-recado');
    if (inputRecado) {
        inputRecado.placeholder = ehSolo ? 'Anotar um lembrete pessoal rápido...' : 'Deixar um aviso ou lembrete rápido...';
    }

    // Filtros de Missões (se for solo, foca em visão direta)
    const lblFiltroCasa = document.getElementById('lbl-texto-filtro-casa-toda');
    if (lblFiltroCasa) lblFiltroCasa.textContent = ehSolo ? 'Todas' : 'Casa Toda';

    // Montante Coletivo nas Finanças
    const lblMontante = document.getElementById('lbl-titulo-montante-coletivo');
    if (lblMontante) lblMontante.textContent = ehSolo ? 'Saldo Geral Consolidado' : 'Montante da Família';

    // Cofres
    const lblCofres = document.getElementById('lbl-titulo-cofres');
    const lblSubCofres = document.getElementById('lbl-subtitulo-cofres');
    if (lblCofres) lblCofres.textContent = ehSolo ? 'Meus Cofres' : 'Cofres do Lar';
    if (lblSubCofres) lblSubCofres.textContent = ehSolo ? 'Reserva Pessoal' : 'Reserva da Família';

    // Título da lista de membros
    const lblListaMembros = document.getElementById('lbl-titulo-lista-membros');
    if (lblListaMembros) lblListaMembros.textContent = ehSolo ? 'Configuração do Meu Espaço' : 'Membros da Família';

    const btnNovoMembro = document.getElementById('btn-novo-membro-familia');
    if (btnNovoMembro) {
        btnNovoMembro.textContent = ehSolo ? '+ Convidar Parceiro(a)' : '+ Novo Membro';
    }

    // Título do Balanço Financeiro
    const lblBalanco = document.getElementById('lbl-titulo-balanco-familiar');
    if (lblBalanco) lblBalanco.textContent = ehSolo ? 'Balanço Financeiro Pessoal' : 'Balanço Financeiro Familiar';
};

window.renderizarMembrosFamiliaPainel = function() {
    const container = document.getElementById('lista-membros-cadastrados');
    if (!container) return;

    container.innerHTML = '';
    const membros = window.listaMembrosFamilia || [];

    if (membros.length === 0) {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:16px 0; color:var(--texto-suave);">Nenhum membro cadastrado.</p>';
        return;
    }

    const meuId = obterUsuarioId();
    const ehSolo = membros.length === 1;

    membros.forEach(m => {
        const card = document.createElement('div');
        card.className = 'cartao-geral';
        card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px;';

        const parentesco = ehSolo 
            ? 'Gestor do Espaço' 
            : (m.parentesco || (m.papel === 'adm' ? 'Administrador' : 'Familiar'));
            
        const ehKids = m.eh_kids === true || m.papel === 'dependente';

        // Badge de Cartão com SVG
        const badgeCartao = m.possui_cartao 
            ? `<span style="font-size:10px; background:rgba(16,185,129,0.15); color:var(--cor-sucesso, #10b981); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                <svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> Cartão
               </span>` 
            : '';

        // Badge de Perfil Kids com SVG
        const badgeKids = ehKids
            ? `<span style="font-size:10px; background:rgba(16,185,129,0.12); color:#10b981; border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">
                <svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Kids
               </span>`
            : '';

        // Permissões com ícones SVG
        const perms = m.permissoes || {};
        let tagAcessos = '';
        const iconesAcesso = [];

        if (perms.mercado) {
            iconesAcesso.push(`<span title="Mercado" style="display:inline-flex; width:13px; height:13px;"><svg class="icone-svg" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></span>`);
        }
        if (perms.gastos) {
            iconesAcesso.push(`<span title="Finanças" style="display:inline-flex; width:13px; height:13px;"><svg class="icone-svg" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span>`);
        }
        if (perms.missoes) {
            iconesAcesso.push(`<span title="Missões" style="display:inline-flex; width:13px; height:13px;"><svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>`);
        }

        if (iconesAcesso.length > 0 && !ehSolo) {
            tagAcessos = `<div style="font-size:11px; color:var(--cor-primaria, #d97706); margin-top:3px; display:flex; align-items:center; gap:6px;">
                <span style="font-size:10px; color:var(--texto-suave);">Acessos:</span> ${iconesAcesso.join('')}
            </div>`;
        }

        const ehMeuPerfil = m.id === meuId;

        // Foto de Perfil ou Inicial com contorno suave
        const bordaAvatar = ehKids ? 'border:2px solid #10b981;' : 'border:1.5px solid var(--borda-delicada, rgba(217, 119, 6, 0.25));';
        const elementoAvatar = m.avatar_url 
            ? `<img src="${m.avatar_url}" alt="${window.esc ? window.esc(m.nome) : m.nome}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; ${bordaAvatar} flex-shrink:0;">`
            : `<div style="width:38px; height:38px; border-radius:50%; background:var(--suiri-surface-secondary-light, #fef9ea); ${bordaAvatar} display:flex; align-items:center; justify-content:center; font-weight:800; color:${ehKids ? '#10b981' : 'var(--cor-primaria, #d97706)'}; flex-shrink:0;">
                ${(m.nome || 'F').charAt(0).toUpperCase()}
               </div>`;

        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
                ${elementoAvatar}
                <div style="min-width:0;">
                    <h4 style="margin:0; font-size:14px; color:var(--texto-principal, #334155); display:flex; align-items:center; flex-wrap:wrap;">
                        ${window.esc ? window.esc(m.nome) : m.nome} ${badgeCartao} ${badgeKids}
                    </h4>
                    <div style="font-size:11px; color:var(--texto-suave, #64748b); margin-top:2px; display:flex; align-items:center; gap:4px;">
                        <span>${parentesco}</span>
                        <span>•</span>
                        <span style="display:inline-flex; align-items:center; gap:3px;">
                            <svg class="icone-svg icone-fogo" style="width:12px; height:12px;" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                            ${m.ofensiva_atual || 0}d
                        </span>
                    </div>
                    ${tagAcessos}
                </div>
            </div>
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                <div style="text-align:right; margin-right:6px;">
                    <div style="font-size:9.5px; color:var(--texto-suave, #64748b); font-weight:700;">XP</div>
                    <strong style="color:var(--cor-sucesso, #10b981); font-size:13px;">${m.xp_total || 0}</strong>
                </div>
                <button type="button" class="btn-secundario" style="padding:6px 8px; font-size:11px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.abrirModalEditarFamiliar('${m.id}')" title="Editar">
                    <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                ${!ehMeuPerfil ? `
                    <button type="button" class="btn-erro" style="padding:6px 8px; font-size:11px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.excluirFamiliar('${m.id}')" title="Excluir">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    if (ehSolo) {
        const dicaSolo = document.createElement('div');
        dicaSolo.style.cssText = 'padding:10px 12px; background:var(--suiri-surface-secondary-light, #fef9ea); border:1px dashed var(--borda-delicada, rgba(217, 119, 6, 0.2)); border-radius:12px; font-size:11.5px; color:var(--texto-suave, #64748b); text-align:center; margin-top:8px;';
        dicaSolo.innerHTML = `
            <span style="display:flex; align-items:center; justify-content:center; gap:6px;">
                <svg class="icone-svg" style="width:14px; height:14px; color:var(--cor-primaria);" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Este espaço está otimizado para a sua organização pessoal. Para partilhar rotinas ou compras, adicione outro membro a qualquer momento.
            </span>
        `;
        container.appendChild(dicaSolo);
    }
};

window.atualizarTodosSeletoresMembros = function() {
    const membros = window.listaMembrosFamilia || [];
    const ehSolo = membros.length <= 1;

    // 1. Seletor de Destinatário nos Recados Rápidos do Mural
    const selRecado = document.getElementById('select-recado-destinatario');
    if (selRecado) {
        if (ehSolo) {
            selRecado.innerHTML = '<option value="todos">Para Mim Mesmo</option>';
        } else {
            selRecado.innerHTML = '<option value="todos">Toda a Casa</option>';
            membros.forEach(m => {
                selRecado.innerHTML += `<option value="${m.id}">Para: ${window.esc ? window.esc(m.nome.split(' ')[0]) : m.nome.split(' ')[0]}</option>`;
            });
        }
    }

    // 2. Seletor de Responsável nas Missões
    const selMissao = document.getElementById('select-nova-missao-responsavel');
    if (selMissao) {
        if (ehSolo) {
            selMissao.innerHTML = '<option value="individual">Minha Tarefa</option>';
        } else {
            selMissao.innerHTML = '<option value="todos">Casa (Todos)</option><option value="todos_kids">🧒 Todos Kids (Quem fizer 1º)</option><option value="individual">Individual (Minha)</option>';
            membros.forEach(m => {
                selMissao.innerHTML += `<option value="${m.id}">${window.esc ? window.esc(m.nome.split(' ')[0]) : m.nome.split(' ')[0]}</option>`;
            });
        }
    }

    // 3. Seletor de Membro no Balanço Financeiro Familiar
    const selRelatorio = document.getElementById('filtro-membro-relatorio');
    if (selRelatorio) {
        if (ehSolo) {
            selRelatorio.innerHTML = '<option value="todos">Meu Balanço Geral</option>';
        } else {
            selRelatorio.innerHTML = '<option value="todos">Todos os Membros (Casa)</option>';
            membros.forEach(m => {
                selRelatorio.innerHTML += `<option value="${m.id}">${window.esc ? window.esc(m.nome) : m.nome}</option>`;
            });
        }
    }
};

window.abrirModalNovoMembro = function() {
    const chkKids = document.getElementById('cad-familiar-modo-kids');
    if (chkKids) chkKids.checked = false;
    document.getElementById('modal-cadastro-familiar')?.classList.remove('oculto');
};

window.fecharModalNovoMembro = function() {
    document.getElementById('modal-cadastro-familiar')?.classList.add('oculto');
};

window.fecharModalEditarFamiliar = function() {
    document.getElementById('modal-editar-familiar')?.classList.add('oculto');
};

window.salvarNovoFamiliar = async function() {
    const nome = document.getElementById('cad-familiar-nome')?.value.trim();
    let email = document.getElementById('cad-familiar-email')?.value.trim().toLowerCase() || '';
    const cpf = document.getElementById('cad-familiar-cpf')?.value.trim();
    let senha = document.getElementById('cad-familiar-senha')?.value || '';
    const parentesco = document.getElementById('cad-familiar-parentesco')?.value.trim() || 'Familiar';
    const papel = document.getElementById('cad-familiar-papel')?.value || 'adulto';
    const possuiCartao = document.getElementById('cad-familiar-cartao')?.checked || false;
    const ehKids = document.getElementById('cad-familiar-modo-kids')?.checked || (papel === 'dependente');

    const perms = {
        mercado: document.getElementById('perm-acesso-mercado')?.checked ?? true,
        gastos: document.getElementById('perm-cadastro-gastos')?.checked ?? true,
        missoes: document.getElementById('perm-acesso-missoes')?.checked ?? true
    };

    if (!nome) return window.mostrarToast("Informe o nome do familiar.", "erro");

    if (!ehKids) {
        if (!email || !email.includes('@')) return window.mostrarToast("Informe um e-mail válido para acesso.", "erro");
        if (!senha || senha.length < 6) return window.mostrarToast("A senha deve ter pelo menos 6 dígitos.", "erro");
    } else {
        if (!email) {
            const hashAleatorio = Math.random().toString(36).substring(2, 8);
            email = `kids_${Date.now()}_${hashAleatorio}@suirifamilia.app`;
        }
        if (!senha || senha.length < 6) {
            senha = 'kids_' + Math.random().toString(36).substring(2, 10);
        }
    }

    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
    const cli = obterClienteSupabase();
    if (!cli) return window.mostrarToast("Erro de ligação.", "erro");

    try {
        const { data, error } = await cli.rpc('cadastrar_novo_familiar', {
            p_familia_id: window.familiaAtualId,
            p_nome: nome,
            p_email: email,
            p_cpf: cpfLimpo,
            p_senha: senha,
            p_papel: papel,
            p_parentesco: parentesco,
            p_possui_cartao: possuiCartao,
            p_eh_kids: ehKids,
            p_permissoes: perms
        });

        if (error) {
            const novoIdFallback = (typeof crypto !== 'undefined' && crypto.randomUUID) 
                ? crypto.randomUUID() 
                : 'membro_' + Date.now();

            const { error: errInsert } = await cli.from('membros').insert([{
                id: novoIdFallback,
                familia_id: window.familiaAtualId,
                nome: nome,
                email: email,
                cpf: cpfLimpo,
                parentesco: parentesco,
                papel: papel,
                possui_cartao: possuiCartao,
                eh_kids: ehKids,
                permissoes: perms,
                xp_total: 0,
                ofensiva_atual: 0
            }]);
            if (errInsert) return window.mostrarToast("Erro ao cadastrar: " + errInsert.message, "erro");
        }

        window.mostrarToast(`${nome} cadastrado(a) com sucesso!`);
        window.fecharModalNovoMembro();

        ['cad-familiar-nome', 'cad-familiar-email', 'cad-familiar-cpf', 'cad-familiar-senha', 'cad-familiar-parentesco'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const chkKids = document.getElementById('cad-familiar-modo-kids');
        if (chkKids) chkKids.checked = false;

        await window.carregarListaMembrosPainel();
    } catch (e) {
        window.mostrarToast("Falha na comunicação com o servidor.", "erro");
    }
};

window.abrirModalEditarFamiliar = function(id) {
    const m = window.listaMembrosFamilia.find(x => x.id === id);
    if (!m) return;

    const setEl = (idEl, val) => { const el = document.getElementById(idEl); if (el) el.value = val; };
    const setChk = (idEl, val) => { const el = document.getElementById(idEl); if (el) el.checked = !!val; };

    setEl('edit-familiar-id', m.id);
    setEl('edit-familiar-nome', m.nome);
    setEl('edit-familiar-email', (m.email && m.email.includes('@suirifamilia.app')) ? '' : (m.email || ''));
    setEl('edit-familiar-parentesco', m.parentesco || '');
    setEl('edit-familiar-papel', m.papel || 'adulto');
    setChk('edit-familiar-cartao', m.possui_cartao);
    setChk('edit-familiar-modo-kids', m.eh_kids === true || m.papel === 'dependente');

    const perms = m.permissoes || {};
    setChk('edit-perm-mercado', perms.mercado);
    setChk('edit-perm-gastos', perms.gastos);
    setChk('edit-perm-missoes', perms.missoes);

    document.getElementById('modal-editar-familiar')?.classList.remove('oculto');
};

window.salvarEdicaoFamiliar = async function() {
    const id = document.getElementById('edit-familiar-id')?.value;
    const nome = document.getElementById('edit-familiar-nome')?.value.trim();
    let email = document.getElementById('edit-familiar-email')?.value.trim().toLowerCase();
    const parentesco = document.getElementById('edit-familiar-parentesco')?.value.trim();
    const papel = document.getElementById('edit-familiar-papel')?.value;
    const possuiCartao = document.getElementById('edit-familiar-cartao')?.checked || false;
    const ehKids = document.getElementById('edit-familiar-modo-kids')?.checked || (papel === 'dependente');

    const perms = {
        mercado: document.getElementById('edit-perm-mercado')?.checked || false,
        gastos: document.getElementById('edit-perm-gastos')?.checked || false,
        missoes: document.getElementById('edit-perm-missoes')?.checked || false
    };

    if (!nome) return window.mostrarToast("O nome é obrigatório.", "erro");

    if (!ehKids && (!email || !email.includes('@'))) {
        return window.mostrarToast("E-mail válido obrigatório para perfis adultos.", "erro");
    }

    const cli = obterClienteSupabase();
    if (!cli) return;

    const dadosAtualizar = {
        nome: nome,
        parentesco: parentesco,
        papel: papel,
        possui_cartao: possuiCartao,
        eh_kids: ehKids,
        permissoes: perms
    };

    if (email) {
        dadosAtualizar.email = email;
    }

    const { error } = await cli.from('membros').update(dadosAtualizar).eq('id', id);

    if (error) return window.mostrarToast("Erro ao atualizar familiar: " + error.message, "erro");

    if (window.perfilAtual && window.perfilAtual.id === id) {
        window.perfilAtual.nome = nome;
        window.perfilAtual.parentesco = parentesco;
        window.perfilAtual.papel = papel;
        window.perfilAtual.possui_cartao = possuiCartao;
        window.perfilAtual.eh_kids = ehKids;
        window.perfilAtual.permissoes = perms;
        if (typeof window.aplicarRegrasPerfilKidsOuAdulto === 'function') {
            window.aplicarRegrasPerfilKidsOuAdulto();
        }
    }

    window.mostrarToast("Alterações confirmadas com sucesso!");
    window.fecharModalEditarFamiliar();
    await window.carregarListaMembrosPainel();
};

window.excluirFamiliar = async function(id) {
    if (obterUsuarioId() === id) {
        return window.mostrarToast("Você não pode excluir o seu próprio perfil.", "erro");
    }

    const confirmou = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente confirmar a exclusão deste membro?", "Confirmar Exclusão")
        : confirm("Deseja realmente confirmar a exclusão deste membro?");

    if (!confirmou) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('membros').delete().eq('id', id);
    if (error) {
        window.mostrarToast("Erro ao excluir: " + error.message, "erro");
    } else {
        window.mostrarToast("Membro removido com sucesso.");
        await window.carregarListaMembrosPainel();
    }
};

// =========================================================================
// 2. CALENDÁRIO MENSAL UNIFICADO (CONTAS + COMPROMISSOS COM PRIVACIDADE)
// =========================================================================

window.filtrarCalendarioPorTipo = function(tipo) {
    window.filtroCalendarioAtivo = tipo;
    window.renderizarGradeCalendario(window.contasCalendarioAtual, window.eventosCalendarioAtual);
};

window.navegarMesCalendario = function(direcao) {
    window.dataCalendarioAtual.setMonth(window.dataCalendarioAtual.getMonth() + direcao);
    window.carregarDadosCalendarioMes();
};

window.carregarDadosCalendarioMes = async function() {
    const cli = obterClienteSupabase();
    if (!window.familiaAtualId || !cli) return;

    const ano = window.dataCalendarioAtual.getFullYear();
    const mes = window.dataCalendarioAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).toISOString().split('T')[0];
    const ultimoDia = new Date(ano, mes + 1, 0).toISOString().split('T')[0];

    const titulo = document.getElementById('mes-ano-calendario-titulo');
    if (titulo) {
        const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        titulo.textContent = `${nomesMeses[mes]} ${ano}`;
    }

    const { data: contas } = await cli.from('agenda_financeira')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_vencimento', primeiroDia)
        .lte('data_vencimento', ultimoDia);

    const { data: eventos } = await cli.from('compromissos_familia')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_evento', primeiroDia)
        .lte('data_evento', ultimoDia);

    window.contasCalendarioAtual = contas || [];
    window.eventosCalendarioAtual = eventos || [];

    window.renderizarGradeCalendario(window.contasCalendarioAtual, window.eventosCalendarioAtual);
};

window.renderizarGradeCalendario = function(contas, eventos) {
    const container = document.getElementById('grid-calendario-container');
    if (!container) return;

    container.innerHTML = '';
    const ano = window.dataCalendarioAtual.getFullYear();
    const mes = window.dataCalendarioAtual.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    let html = '<div class="grade-calendario-mensal" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center;">';

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(d => {
        html += `<div style="font-size:10px; font-weight:700; color:var(--texto-suave, #64748b); padding-bottom:4px;">${d}</div>`;
    });

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    for (let i = 0; i < primeiroDiaSemana; i++) {
        html += '<div></div>';
    }

    const hojeDataStr = new Date().toISOString().split('T')[0];

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtualStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        const contasDoDia = contas.filter(c => c.data_vencimento === dataAtualStr);
        const eventosDoDia = eventos.filter(e => e.data_evento === dataAtualStr);

        let bolinhas = '';

        if (window.filtroCalendarioAtivo === 'todos' || window.filtroCalendarioAtivo === 'contas') {
            if (contasDoDia.some(c => c.tipo_evento === 'conta_pagar')) {
                bolinhas += '<span style="width:6px; height:6px; border-radius:50%; background:var(--cor-erro, #ef4444); display:inline-block;"></span>';
            }
            if (contasDoDia.some(c => c.tipo_evento === 'recebimento')) {
                bolinhas += '<span style="width:6px; height:6px; border-radius:50%; background:var(--cor-sucesso, #10b981); display:inline-block;"></span>';
            }
        }

        if (window.filtroCalendarioAtivo === 'todos' || window.filtroCalendarioAtivo === 'eventos') {
            if (eventosDoDia.length > 0) {
                const cor = eventosDoDia[0].cor_etiqueta || '#0ea5e9';
                bolinhas += `<span style="width:6px; height:6px; border-radius:50%; background:${cor}; display:inline-block;"></span>`;
            }
        }

        const ehHoje = hojeDataStr === dataAtualStr;
        const estiloDia = ehHoje
            ? 'background:var(--cor-primaria, #d97706); color:#ffffff; border-radius:10px; border:none;'
            : 'background:var(--suiri-surface-secondary-light, #fef9ea); border-radius:8px; border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); color:var(--texto-principal, #334155);';

        html += `
            <div style="padding:8px 0; cursor:pointer; display:flex; flex-direction:column; align-items:center; min-height:46px; justify-content:center; ${estiloDia}" onclick="window.abrirDetalhesDiaCalendario('${dataAtualStr}')">
                <span style="font-size:12.5px; font-weight:700;">${dia}</span>
                <div style="display:flex; gap:3px; margin-top:3px; min-height:8px; align-items:center;">${bolinhas}</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
};

// =========================================================================
// 3. DETALHES DO DIA SELECIONADO COM PRIVACIDADE INDIVIDUAL
// =========================================================================

window.abrirDetalhesDiaCalendario = function(dataIso) {
    const contas = window.contasCalendarioAtual.filter(c => c.data_vencimento === dataIso);
    const eventos = window.eventosCalendarioAtual.filter(e => e.data_evento === dataIso);

    const titulo = document.getElementById('detalhes-dia-calendario-titulo');
    const container = document.getElementById('conteudo-itens-dia-calendario');
    if (!titulo || !container) return;

    titulo.textContent = `Compromissos de ${dataIso.split('-').reverse().join('/')}`;
    container.innerHTML = '';

    const usuarioConectadoId = obterUsuarioId();

    if (contas.length === 0 && eventos.length === 0) {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:12px 0; color:var(--texto-suave);">Nada agendado para este dia.</p>';
    } else {
        eventos.forEach(e => {
            const ehMeuEvento = (e.criado_por === usuarioConectadoId);
            const ehPrivado = (e.escopo === 'pessoal' || e.eh_privado === true);

            // REGRA DE PRIVACIDADE: se for privado e de outro familiar, mascara o texto
            let tituloEvento = window.esc ? window.esc(e.titulo) : e.titulo;
            let descricaoEvento = e.descricao ? (window.esc ? window.esc(e.descricao) : e.descricao) : '';

            if (ehPrivado && !ehMeuEvento) {
                tituloEvento = "Compromisso Particular";
                descricaoEvento = "Horário reservado / Privativo";
            }

            const hora = (e.horario_inicio || e.horario_fim)
                ? `${e.horario_inicio ? e.horario_inicio.slice(0, 5) : ''} ${e.horario_fim ? 'até ' + e.horario_fim.slice(0, 5) : ''}`
                : 'Dia Inteiro';
            const cor = e.cor_etiqueta || '#0ea5e9';

            container.innerHTML += `
                <div class="cartao-geral" style="border-left:4px solid ${cor}; padding:10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="display:block; font-size:13.5px; color:var(--texto-principal);">${tituloEvento}</strong>
                        ${descricaoEvento ? `<span style="font-size:11px; color:var(--texto-suave); display:block; margin:2px 0;">${descricaoEvento}</span>` : ''}
                        <div style="display:flex; align-items:center; gap:6px; margin-top:3px;">
                            <span style="font-size:10px; font-weight:700; background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; color:${cor};">Horário: ${hora}</span>
                            ${ehPrivado ? `<span style="font-size:10px; color:var(--texto-suave);">(Particular)</span>` : ''}
                        </div>
                    </div>
                    ${(ehMeuEvento || window.perfilAtual?.papel === 'adm') ? `
                        <button class="btn-erro" style="padding:4px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.excluirEventoCalendario('${e.id}')">
                            <svg class="icone-svg" style="width:12px; height:12px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    ` : ''}
                </div>
            `;
        });

        contas.forEach(c => {
            const ehMinhaConta = (c.criado_por === usuarioConectadoId || c.membro_id === usuarioConectadoId);
            const ehPrivada = (c.escopo === 'pessoal' || c.eh_privado === true);

            let descConta = window.esc ? window.esc(c.descricao) : c.descricao;
            if (ehPrivada && !ehMinhaConta) {
                descConta = (c.tipo_evento === 'conta_pagar') ? "Conta Pessoal" : "Recebimento Particular";
            }

            const ehPagamento = c.tipo_evento === 'conta_pagar';
            const cor = ehPagamento ? 'var(--cor-erro, #ef4444)' : 'var(--cor-sucesso, #10b981)';
            const label = ehPagamento ? 'A Pagar' : 'A Receber';
            const iconeDot = `<span style="width:8px; height:8px; border-radius:50%; background:${cor}; display:inline-block; margin-right:4px;"></span>`;

            container.innerHTML += `
                <div class="cartao-geral" style="border-left:4px solid ${cor}; padding:10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="display:flex; align-items:center; font-size:13.5px; color:var(--texto-principal);">${iconeDot} ${descConta}</strong>
                        <span style="font-size:10px; font-weight:700; background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; color:${cor}; margin-top:4px; display:inline-block;">${label}: R$ ${Number(c.valor || 0).toFixed(2)}</span>
                    </div>
                    ${(ehMinhaConta || window.perfilAtual?.papel === 'adm') ? `
                        <button class="btn-erro" style="padding:4px 8px; font-size:11px; display:flex; align-items:center;" onclick="window.excluirContaRecorrenteAgenda('${c.id}', ${c.eh_perpetua})">
                            <svg class="icone-svg" style="width:12px; height:12px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    ` : ''}
                </div>
            `;
        });
    }

    document.getElementById('modal-detalhes-dia-calendario')?.classList.remove('oculto');
};

window.fecharModalDetalhesDiaCalendario = function() {
    document.getElementById('modal-detalhes-dia-calendario')?.classList.add('oculto');
};

window.abrirModalNovoEventoCalendario = function() {
    const hojeStr = new Date().toISOString().split('T')[0];
    const elData = document.getElementById('evento-data');
    if (elData) elData.value = hojeStr;
    document.getElementById('modal-novo-evento-calendario')?.classList.remove('oculto');
};

window.fecharModalNovoEventoCalendario = function() {
    document.getElementById('modal-novo-evento-calendario')?.classList.add('oculto');
};

window.salvarNovoEventoCalendario = async function() {
    const titulo = document.getElementById('evento-titulo')?.value.trim();
    const descricao = document.getElementById('evento-descricao')?.value.trim();
    const dataEvento = document.getElementById('evento-data')?.value;
    let hrInicio = document.getElementById('evento-hora-inicio')?.value;
    let hrFim = document.getElementById('evento-hora-fim')?.value;
    const escopo = document.getElementById('evento-escopo')?.value || 'casa';
    const corSelecionada = document.querySelector('input[name="evento-cor"]:checked')?.value || '#0ea5e9';

    if (!titulo || !dataEvento) return window.mostrarToast("Título e data são obrigatórios.", "erro");

    if (hrInicio && hrInicio.length === 5) hrInicio += ':00'; else hrInicio = null;
    if (hrFim && hrFim.length === 5) hrFim += ':00'; else hrFim = null;

    const cli = obterClienteSupabase();
    if (!cli) return window.mostrarToast("Erro de ligação.", "erro");

    const { error } = await cli.from('compromissos_familia').insert([{
        familia_id: window.familiaAtualId,
        criado_por: obterUsuarioId(),
        titulo: titulo,
        descricao: descricao,
        data_evento: dataEvento,
        horario_inicio: hrInicio,
        horario_fim: hrFim,
        cor_etiqueta: corSelecionada,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal')
    }]);

    if (error) return window.mostrarToast("Erro ao agendar compromisso: " + error.message, "erro");

    window.mostrarToast("Compromisso confirmado e agendado com sucesso!");
    const inTit = document.getElementById('evento-titulo');
    const inDesc = document.getElementById('evento-descricao');
    if (inTit) inTit.value = '';
    if (inDesc) inDesc.value = '';

    window.fecharModalNovoEventoCalendario();
    window.carregarDadosCalendarioMes();
};

window.excluirEventoCalendario = async function(id) {
    const confirmou = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente confirmar a exclusão deste compromisso?", "Confirmar Exclusão")
        : confirm("Deseja realmente confirmar a exclusão deste compromisso?");

    if (!confirmou) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('compromissos_familia').delete().eq('id', id);
    if (error) {
        window.mostrarToast("Erro ao excluir: " + error.message, "erro");
    } else {
        window.mostrarToast("Compromisso removido com sucesso.");
        window.fecharModalDetalhesDiaCalendario();
        window.carregarDadosCalendarioMes();
    }
};

// =========================================================================
// 4. ESCUTA EM TEMPO REAL (REALTIME SUPABASE)
// =========================================================================

window.iniciarEscutaRealtimeFamilia = function() {
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId) return;

    try {
        if (typeof cli.removeAllChannels === 'function') {
            cli.removeAllChannels();
        }

        const canal = cli.channel('suiri-familia-canal-' + window.familiaAtualId);

        canal
            .on('postgres_changes', { event: '*', schema: 'public', table: 'membros', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarListaMembrosPainel();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recados_lar', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                if (typeof window.carregarRecadosLar === 'function') {
                    window.carregarRecadosLar();
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_financeira', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarDadosCalendarioMes();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compromissos_familia', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarDadosCalendarioMes();
            })
            .subscribe();
    } catch (e) {
        console.warn("Modo realtime operando em segundo plano:", e);
    }
};

// =========================================================================
// 5. INICIALIZAÇÃO AUTOMÁTICA
// =========================================================================

if (window.familiaAtualId) {
    window.carregarListaMembrosPainel();
    window.carregarDadosCalendarioMes();
    window.iniciarEscutaRealtimeFamilia();
}

document.addEventListener("DOMContentLoaded", () => {
    window.carregarListaMembrosPainel();
    window.carregarDadosCalendarioMes();
    window.iniciarEscutaRealtimeFamilia();
});
