/* Suiri Família 7.0 · domínio extraído de app-painel.js. */
// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-PAINEL.JS (100% COMPLETO E INTEGRAL)
// Gestão de Membros com Nacionalidade/Bandeiras, Gênero/Sexo, Adaptação Solo,
// Roteador de Visibilidade do Espaço Mulher/Masculino, Calendário e Notificações.
// Integrado com o Catálogo Oficial de Ícones PNG Transparentes (./icone/)
// Design System Warm Tech: Linho Orgânico, Elevações Suaves e Luz Solar
// =========================================================================

window.listaMembrosFamilia = [];
window.dataCalendarioAtual = new Date();
window.eventosCalendarioAtual = [];
window.contasCalendarioAtual = [];
window.filtroCalendarioAtivo = 'todos';
window._contasEmProcessamentoDeBaixa = new Set();



function decodificarTextoSeguro(str) {
    if (!str) return '';
    try {
        return decodeURIComponent(str);
    } catch (e) {
        try {
            return decodeURIComponent(escape(str));
        } catch (err) {
            return String(str);
        }
    }
}

// =========================================================================
// RENDERIZADOR VETORIAL DE BANDEIRAS DE PAÍSES (FORMATO RETANGULAR)
// =========================================================================
window.obterMiniBandeiraNacionalidade = function(cod) {
    const c = String(cod || 'BR').toUpperCase();
    const estilo = 'width:20px; height:14px; border-radius:3px; object-fit:cover; border:1px solid rgba(0,0,0,0.12); display:inline-block; vertical-align:middle; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.06);';

    switch (c) {
        case 'BR':
            return `<svg style="${estilo}" viewBox="0 0 720 480"><rect width="720" height="480" fill="#009b3a"/><polygon points="360,36 676,240 360,444 44,240" fill="#fedf00"/><circle cx="360" cy="240" r="120" fill="#002776"/><path d="M243 240 A120 120 0 0 1 477 240" stroke="#ffffff" stroke-width="15" fill="none"/></svg>`;
        case 'US':
            return `<svg style="${estilo}" viewBox="0 0 7410 3900"><rect width="7410" height="3900" fill="#b22234"/><path d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" stroke="#fff" stroke-width="300"/><rect width="2964" height="2100" fill="#3c3b6e"/></svg>`;
        case 'ES':
            return `<svg style="${estilo}" viewBox="0 0 750 500"><rect width="750" height="500" fill="#c60b1e"/><rect y="125" width="750" height="250" fill="#ffc400"/></svg>`;
        case 'PT':
            return `<svg style="${estilo}" viewBox="0 0 600 400"><rect width="240" height="400" fill="#046a38"/><rect x="240" width="360" height="400" fill="#da291c"/><circle cx="240" cy="200" r="80" fill="#ffdd00"/></svg>`;
        case 'AR':
            return `<svg style="${estilo}" viewBox="0 0 800 500"><rect width="800" height="500" fill="#74acdf"/><rect y="166" width="800" height="168" fill="#ffffff"/><circle cx="400" cy="250" r="35" fill="#f6b40e"/></svg>`;
        case 'UY':
            return `<svg style="${estilo}" viewBox="0 0 900 600"><rect width="900" height="600" fill="#ffffff"/><path d="M0,66.6H900M0,200H900M0,333.3H900M0,466.6H900" stroke="#0038a8" stroke-width="66.6"/><rect width="300" height="300" fill="#ffffff"/><circle cx="150" cy="150" r="45" fill="#fcd116"/></svg>`;
        case 'PY':
            return `<svg style="${estilo}" viewBox="0 0 750 450"><rect width="750" height="150" fill="#d52b1e"/><rect y="150" width="750" height="150" fill="#ffffff"/><rect y="300" width="750" height="150" fill="#0038a8"/></svg>`;
        case 'CL':
            return `<svg style="${estilo}" viewBox="0 0 900 600"><rect width="900" height="600" fill="#d52b1e"/><rect width="900" height="300" fill="#ffffff"/><rect width="300" height="300" fill="#0039a6"/></svg>`;
        case 'IT':
            return `<svg style="${estilo}" viewBox="0 0 1500 1000"><rect width="500" height="1000" fill="#009246"/><rect x="500" width="500" height="1000" fill="#ffffff"/><rect x="1000" width="500" height="1000" fill="#ce2b37"/></svg>`;
        case 'FR':
            return `<svg style="${estilo}" viewBox="0 0 900 600"><rect width="300" height="600" fill="#002654"/><rect x="300" width="300" height="600" fill="#ffffff"/><rect x="600" width="300" height="600" fill="#ce1126"/></svg>`;
        case 'DE':
            return `<svg style="${estilo}" viewBox="0 0 1000 600"><rect width="1000" height="200" fill="#000000"/><rect y="200" width="1000" height="200" fill="#dd0000"/><rect y="400" width="1000" height="200" fill="#ffce00"/></svg>`;
        default:
            return `<span style="font-size:12px; display:inline-block; vertical-align:middle;">🌐</span>`;
    }
};

// =========================================================================
// ROTEADOR DE GÊNERO: ALTERNÂNCIA VISUAL ENTRE ESPAÇO MULHER E MASCULINO
// =========================================================================
window.aplicarVisibilidadeEspacoGenero = function() {
    window.atualizarCartaoEspacoPessoal?.();window.atualizarCartoesGeneroMeuEspaco?.();
};

// =========================================================================
// 1. GESTÃO DE MEMBROS E ADAPTAÇÃO DINÂMICA (INDIVIDUAL VS FAMÍLIA)
// =========================================================================

window.carregarListaMembrosPainel = async function() {
    const cli = obterClienteSupabase();
    if (!cli) return;

    const familiaId = window.familiaAtualId || window.perfilAtual?.familia_id;
    if (!familiaId) {
        if (window.perfilAtual) {
            window.listaMembrosFamilia = [window.perfilAtual];
            window.aplicarAdaptacaoSoloOuFamilia();
            window.renderizarMembrosFamiliaPainel();
            window.atualizarTodosSeletoresMembros();
            window.atualizarBandeiraPerfilTopo();
            window.aplicarVisibilidadeEspacoGenero();
        }
        return;
    }

    try {
        let { data, error } = await cli.from('membros')
            .select('*')
            .eq('familia_id', familiaId)
            .order('nome');

        // Tentativa de fallback caso a ordenação por 'nome' falhe
        if (error) {
            const fallback = await cli.from('membros')
                .select('*')
                .eq('familia_id', familiaId);
            if (!fallback.error) {
                data = fallback.data;
                error = null;
            }
        }

        if (error) {
            const msgErro = error.message || error.details || JSON.stringify(error);
            console.warn("Aviso detalhado ao carregar membros do Supabase:", msgErro);

            // Resgate por cache local defensivo para não quebrar a tela
            const cacheMembros = localStorage.getItem('suiri_cache_membros_' + familiaId);
            if (cacheMembros) {
                try {
                    window.listaMembrosFamilia = JSON.parse(cacheMembros);
                } catch (e) {}
            } else if (window.perfilAtual) {
                window.listaMembrosFamilia = [window.perfilAtual];
            }
        } else {
            window.listaMembrosFamilia = data || [];
            try {
                localStorage.setItem('suiri_cache_membros_' + familiaId, JSON.stringify(window.listaMembrosFamilia));
            } catch (e) {}
        }

        const meuId = obterUsuarioId();
        if (meuId && window.perfilAtual) {
            const meuPerfilAtualizado = window.listaMembrosFamilia.find(m => m.id === meuId);
            if (meuPerfilAtualizado) {
                Object.assign(window.perfilAtual, meuPerfilAtualizado);
            }
        }

        window.aplicarAdaptacaoSoloOuFamilia();
        window.renderizarMembrosFamiliaPainel();
        window.atualizarTodosSeletoresMembros();
        window.atualizarBandeiraPerfilTopo();
        window.aplicarVisibilidadeEspacoGenero();
    } catch (errGeral) {
        console.warn("Falha controlada em carregarListaMembrosPainel:", errGeral);
        if (window.perfilAtual && window.listaMembrosFamilia.length === 0) {
            window.listaMembrosFamilia = [window.perfilAtual];
            window.renderizarMembrosFamiliaPainel();
        }
    }
};

window.atualizarBandeiraPerfilTopo = function() {
    const elBandeira = document.getElementById('bandeira-topo-usuario');
    if (!elBandeira) return;

    const meuPerfil = window.listaMembrosFamilia.find(m => m.id === obterUsuarioId()) || window.perfilAtual;
    const nacionalidade = meuPerfil?.nacionalidade || 'BR';
    elBandeira.innerHTML = window.obterMiniBandeiraNacionalidade(nacionalidade);
};

window.aplicarAdaptacaoSoloOuFamilia = function() {
    const totalMembros = window.listaMembrosFamilia.length;
    const ehSolo = totalMembros <= 1;

    const navFam = document.getElementById('nav-item-lbl-familia');
    if (navFam) navFam.textContent = ehSolo ? 'Meu Lar' : 'Família';

    const navMissoes = document.getElementById('nav-item-lbl-missoes');
    if (navMissoes) navMissoes.textContent = ehSolo ? 'Minhas Tarefas' : 'Missões';

    const lblNovaMissao = document.getElementById('lbl-btn-nova-missao-expansivel');
    if (lblNovaMissao) lblNovaMissao.textContent = ehSolo ? '+ Nova Tarefa Pessoal' : '+ Nova Missão para a Casa';

    const lblMural = document.getElementById('lbl-titulo-mural-recados');
    if (lblMural) lblMural.textContent = ehSolo ? 'Minhas Notas & Lembretes' : 'Mural de Recados da Casa';

    const inputRecado = document.getElementById('input-novo-recado');
    if (inputRecado) {
        inputRecado.placeholder = ehSolo ? 'Anotar um lembrete pessoal rápido...' : 'Deixar um aviso ou lembrete rápido...';
    }

    const lblFiltroCasa = document.getElementById('lbl-texto-filtro-casa-toda');
    if (lblFiltroCasa) lblFiltroCasa.textContent = ehSolo ? 'Todas' : 'Casa Toda';

    const lblMontante = document.getElementById('lbl-titulo-montante-coletivo');
    if (lblMontante) lblMontante.textContent = ehSolo ? 'Saldo Geral Consolidado' : 'Montante da Família';

    const lblCofres = document.getElementById('lbl-titulo-cofres');
    const lblSubCofres = document.getElementById('lbl-subtitulo-cofres');
    if (lblCofres) lblCofres.textContent = ehSolo ? 'Meus Cofres' : 'Cofres do Lar';
    if (lblSubCofres) lblSubCofres.textContent = ehSolo ? 'Reserva Pessoal' : 'Reserva da Família';

    const lblListaMembros = document.getElementById('lbl-titulo-lista-membros');
    if (lblListaMembros) lblListaMembros.textContent = ehSolo ? 'Configuração do Meu Espaço' : 'Membros da Família';

    const btnNovoMembro = document.getElementById('btn-novo-membro-familia');
    if (btnNovoMembro) {
        btnNovoMembro.textContent = ehSolo ? '+ Convidar Parceiro(a)' : '+ Novo Membro';
    }

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
        card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:13px 16px; margin-bottom:10px; border-radius:var(--raio-md, 16px); border:1px solid rgba(226, 232, 240, 0.9); box-shadow:0 2px 8px rgba(15, 23, 42, 0.03); transition:transform 0.16s ease;';

        const parentesco = ehSolo 
            ? 'Gestor do Espaço' 
            : (m.parentesco || (m.papel === 'adm' ? 'Administrador' : 'Familiar'));
            
        const ehKids = m.eh_kids === true || m.papel === 'dependente';
        const bandeiraNacionalidade = window.obterMiniBandeiraNacionalidade(m.nacionalidade || 'BR');

        const badgeCartao = m.possui_cartao 
            ? `<span style="font-size:10px; background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.25); padding:2px 7px; border-radius:6px; margin-left:4px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">
                <img src="assets/icons-modern/icone-carteira.svg" alt="Cartão" style="width:11px; height:11px; object-fit:contain;"> Cartão
               </span>` 
            : '';

        const badgeKids = ehKids
            ? `<span style="font-size:10px; background:rgba(240,253,244,0.9); color:#10b981; border:1.5px solid rgba(16,185,129,0.4); padding:2px 7px; border-radius:6px; margin-left:4px; font-weight:800; display:inline-flex; align-items:center; gap:3px;">
                <img src="assets/icons-modern/icones-missao.svg" alt="Kids" style="width:11px; height:11px; object-fit:contain;"> Kids
               </span>`
            : '';

        const perms = m.permissoes || {};
        const iconesAcesso = [];

        if (perms.mercado) {
            iconesAcesso.push(`<img src="assets/icons-modern/icone-mercado.svg" title="Mercado" style="width:14px; height:14px; object-fit:contain;">`);
        }
        if (perms.gastos) {
            iconesAcesso.push(`<img src="assets/icons-modern/icone-financas.svg" title="Finanças" style="width:14px; height:14px; object-fit:contain;">`);
        }
        if (perms.missoes) {
            iconesAcesso.push(`<img src="assets/icons-modern/icones-missao.svg" title="Missões" style="width:14px; height:14px; object-fit:contain;">`);
        }

        let tagAcessos = '';
        if (iconesAcesso.length > 0 && !ehSolo) {
            tagAcessos = `<div style="font-size:11.5px; color:var(--cor-primaria, #f97316); margin-top:4px; display:flex; align-items:center; gap:6px;">
                <span style="font-size:10px; font-weight:700; color:var(--texto-suave);">Acessos:</span> ${iconesAcesso.join('')}
            </div>`;
        }

        const ehMeuPerfil = m.id === meuId;
        const bordaAvatar = ehKids 
            ? 'border:2.5px solid #10b981; box-shadow:0 2px 8px rgba(16,185,129,0.2);' 
            : 'border:2px solid var(--cor-primaria, #f97316); box-shadow:0 2px 8px rgba(249,115,22,0.14);';
            
        const elementoAvatar = m.avatar_url 
            ? `<img src="${esc(Suiri.imageUrl(m.avatar_url))}" alt="${window.esc ? window.esc(m.nome) : m.nome}" style="width:46px; height:46px; border-radius:14px; object-fit:cover; ${bordaAvatar} flex-shrink:0;">`
            : `<div style="width:46px; height:46px; border-radius:14px; background:var(--suiri-surface-secondary-light, #fffbeb); ${bordaAvatar} display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; color:${ehKids ? '#10b981' : 'var(--cor-primaria, #f97316)'}; flex-shrink:0;">
                ${(m.nome || 'F').charAt(0).toUpperCase()}
               </div>`;

        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; min-width:0; flex:1;">
                ${elementoAvatar}
                <div style="min-width:0;">
                    <h4 style="margin:0; font-size:14.5px; font-weight:800; color:var(--texto-principal, #0f172a); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span>${window.esc ? window.esc(m.nome) : m.nome}</span>
                        ${bandeiraNacionalidade}
                        ${badgeCartao}
                        ${badgeKids}
                    </h4>
                    <div style="font-size:11.5px; color:var(--texto-suave, #64748b); margin-top:2px; display:flex; align-items:center; gap:5px;">
                        <span>${esc(parentesco)}</span>
                        <span>•</span>
                        <span style="display:inline-flex; align-items:center; gap:3px; font-weight:700; color:#ea580c;">
                            <img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:12px; height:12px; object-fit:contain;">
                            ${m.ofensiva_atual || 0}d
                        </span>
                    </div>
                    ${tagAcessos}
                </div>
            </div>
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                <div style="text-align:right; margin-right:6px;">
                    <div style="font-size:9.5px; color:var(--texto-suave, #64748b); font-weight:800; text-transform:uppercase;">XP</div>
                    <strong style="color:var(--cor-sucesso, #10b981); font-size:14px; font-variant-numeric:tabular-nums;">${m.xp_total || 0}</strong>
                </div>
                <button type="button" class="btn-secundario" style="padding:7px 9px; font-size:11px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.abrirModalEditarFamiliar('${m.id}')" title="Editar">
                    <img src="assets/icons-modern/icone-editar.svg" alt="Editar" style="width:14px; height:14px; object-fit:contain;">
                </button>
                ${!ehMeuPerfil ? `
                    <button type="button" class="btn-erro" style="padding:7px 9px; font-size:11px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.excluirFamiliar('${m.id}')" title="Excluir">
                        <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:14px; height:14px; object-fit:contain;">
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    if (ehSolo) {
        const dicaSolo = document.createElement('div');
        dicaSolo.style.cssText = 'padding:12px 14px; background:var(--suiri-surface-secondary-light, #fffbeb); border:1px dashed var(--borda-delicada, rgba(249, 115, 22, 0.25)); border-radius:14px; font-size:12px; color:var(--texto-suave, #64748b); text-align:center; margin-top:10px; line-height:1.45;';
        dicaSolo.innerHTML = `
            <span style="display:flex; align-items:center; justify-content:center; gap:6px;">
                <img src="assets/icons-modern/icone-lampada-pense.svg" alt="Dica" style="width:16px; height:16px; object-fit:contain;">
                Este espaço está otimizado para a sua organização pessoal. Para partilhar rotinas ou compras, adicione outro membro a qualquer momento.
            </span>
        `;
        container.appendChild(dicaSolo);
    }
};

window.atualizarTodosSeletoresMembros = function() {
    const membros = window.listaMembrosFamilia || [];
    const ehSolo = membros.length <= 1;

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

    const selMissao = document.getElementById('select-nova-missao-responsavel');
    if (selMissao) {
        if (ehSolo) {
            selMissao.innerHTML = '<option value="individual">Minha Tarefa</option>';
        } else {
            selMissao.innerHTML = '<option value="todos">Casa (Todos)</option><option value="todos_kids">Todos Kids (Quem fizer 1º)</option><option value="individual">Individual (Minha)</option>';
            membros.forEach(m => {
                selMissao.innerHTML += `<option value="${m.id}">${window.esc ? window.esc(m.nome.split(' ')[0]) : m.nome.split(' ')[0]}</option>`;
            });
        }
    }

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
    const chkCartao = document.getElementById('cad-familiar-cartao');
    if (chkCartao) chkCartao.checked = false;
    const selNac = document.getElementById('cad-familiar-nacionalidade');
    if (selNac) selNac.value = 'BR';
    
    const selGen = document.getElementById('cad-familiar-genero') || document.getElementById('cad-familiar-sexo');
    if (selGen) selGen.value = 'feminino';
    
    document.getElementById('modal-cadastro-familiar')?.classList.remove('oculto');
};

window.fecharModalNovoMembro = function() {
    document.getElementById('modal-cadastro-familiar')?.classList.add('oculto');
};

window.fecharModalEditarFamiliar = function() {
    document.getElementById('modal-editar-familiar')?.classList.add('oculto');
};

// =========================================================================
// CRIAÇÃO DE FAMILIAR COM AUTENTICAÇÃO OFICIAL E PERSISTÊNCIA COMPLETA
// =========================================================================
window.salvarNovoFamiliar = async function() {
    const nome = document.getElementById('cad-familiar-nome')?.value.trim();
    let email = document.getElementById('cad-familiar-email')?.value.trim().toLowerCase() || '';
    const cpf = document.getElementById('cad-familiar-cpf')?.value.trim();
    let senha = document.getElementById('cad-familiar-senha')?.value || '';
    const parentesco = document.getElementById('cad-familiar-parentesco')?.value.trim() || 'Familiar';
    const papel = document.getElementById('cad-familiar-papel')?.value || 'adulto';
    const nacionalidade = document.getElementById('cad-familiar-nacionalidade')?.value || 'BR';
    
    const selGeneroEl = document.getElementById('cad-familiar-genero') || document.getElementById('cad-familiar-sexo');
    let generoBruto = selGeneroEl ? selGeneroEl.value : '';
    let genero = '';

    if (generoBruto.toLowerCase().includes('masc')) {
        genero = 'masculino';
    } else if (generoBruto.toLowerCase().includes('fem')) {
        genero = 'feminino';
    } else {
        const pLower = parentesco.toLowerCase();
        if (pLower.includes('esposa') || pLower.includes('mãe') || pLower.includes('mae') || pLower.includes('mulher') || pLower.includes('irmã') || pLower.includes('filha')) {
            genero = 'feminino';
        } else {
            genero = 'masculino';
        }
    }

    const possuiCartao = document.getElementById('cad-familiar-cartao')?.checked || false;
    const ehKids = document.getElementById('cad-familiar-modo-kids')?.checked || (papel === 'dependente');

    const perms = {
        mercado: document.getElementById('perm-acesso-mercado')?.checked ?? true,
        gastos: document.getElementById('perm-cadastro-gastos')?.checked ?? true,
        missoes: document.getElementById('perm-acesso-missoes')?.checked ?? true
    };

    if (!nome) return window.mostrarToast("Informe o nome do familiar.", "erro");

    if (!ehKids) {
        if (!email || !email.includes('@')) return window.mostrarToast("Informe um e-mail válido para acesso do familiar.", "erro");
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
    if (!cli) return window.mostrarToast("Erro de ligação ao Supabase.", "erro");

    try {
        let authUserId = null;
        const supabaseUrl = window.SUPABASE_URL || cli.supabaseUrl || window.supabaseUrl;
        const supabaseKey = window.SUPABASE_KEY || cli.supabaseKey || window.supabaseKey;

        if (supabaseUrl && supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                const memStorage = {};
                const authTempClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false,
                        storageKey: 'suiri_temp_member_auth',
                        storage: {
                            getItem: (k) => memStorage[k] || null,
                            setItem: (k, v) => { memStorage[k] = v; },
                            removeItem: (k) => { delete memStorage[k]; }
                        }
                    }
                });

                const { data: authData, error: authError } = await authTempClient.auth.signUp({
                    email: email,
                    password: senha,
                    options: {
                        data: {
                            nome: nome,
                            familia_id: window.familiaAtualId,
                            suiri_mostrar_aviso_privacidade: true
                        }
                    }
                });

                if (authData?.user?.id) {
                    authUserId = authData.user.id;
                } else if (authError) {
                    console.warn("Aviso ao registar na Auth:", authError.message);
                }
            } catch (errAuth) {
                console.warn("Falha no registo oficial GoTrue:", errAuth);
            }
        }

        if(!authUserId && !ehKids) throw new Error('O serviço não criou o acesso do adulto. Nenhum perfil ativo foi criado; confirme o e-mail ou use outro endereço.');
        const idFinalMembro = authUserId || ((typeof crypto !== 'undefined' && crypto.randomUUID) 
            ? crypto.randomUUID() 
            : 'membro_' + Date.now());

        const { error: errInsert } = await cli.from('membros').upsert([{
            id: idFinalMembro,
            familia_id: window.familiaAtualId,
            nome: nome,
            email: email,
            cpf: cpfLimpo,
            parentesco: parentesco,
            papel: papel,
            genero: genero,
            sexo: genero,
            nacionalidade: nacionalidade,
            possui_cartao: possuiCartao,
            eh_kids: ehKids,
            permissoes: perms,
            saldo_carteira: 0,
            ofensiva_atual: 1,
            xp_total: 0
        }], { onConflict: 'id' });

        if (errInsert) {
            return window.mostrarToast("Erro ao gravar membro: " + errInsert.message, "erro");
        }

        window.mostrarToast(ehKids ? `${nome} cadastrado(a) no lar.` : `${nome} cadastrado(a). Se necessário, confirme o e-mail antes de entrar.`);
        window.fecharModalNovoMembro();

        ['cad-familiar-nome', 'cad-familiar-email', 'cad-familiar-cpf', 'cad-familiar-senha', 'cad-familiar-parentesco'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const chkKids = document.getElementById('cad-familiar-modo-kids');
        if (chkKids) chkKids.checked = false;

        await window.carregarListaMembrosPainel();
    } catch (e) {
        console.error("Falha no cadastro:", e);
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

    let genMembro = String(m.genero || m.sexo || '').toLowerCase();
    if (genMembro.includes('masc')) genMembro = 'masculino';
    else if (genMembro.includes('fem')) genMembro = 'feminino';
    else genMembro = 'feminino';

    setEl('edit-familiar-genero', genMembro);
    setEl('edit-familiar-sexo', genMembro);

    setEl('edit-familiar-nacionalidade', m.nacionalidade || 'BR');
    setChk('edit-familiar-cartao', m.possui_cartao);
    setChk('edit-familiar-modo-kids', m.eh_kids === true || m.papel === 'dependente');

    const perms = m.permissoes || {};
    setChk('edit-perm-mercado', perms.mercado);
    setChk('edit-perm-gastos', perms.gastos);
    setChk('edit-perm-missoes', String(perms.missoes).toLowerCase() !== 'false');

    document.getElementById('modal-editar-familiar')?.classList.remove('oculto');
};

window.salvarEdicaoFamiliar = async function() {
    const id = document.getElementById('edit-familiar-id')?.value;
    const nome = document.getElementById('edit-familiar-nome')?.value.trim();
    let email = document.getElementById('edit-familiar-email')?.value.trim().toLowerCase();
    const parentesco = document.getElementById('edit-familiar-parentesco')?.value.trim();
    const papel = document.getElementById('edit-familiar-papel')?.value;

    const selGenEl = document.getElementById('edit-familiar-genero') || document.getElementById('edit-familiar-sexo');
    let generoBruto = selGenEl ? selGenEl.value : '';
    let genero = 'feminino';

    if (generoBruto.toLowerCase().includes('masc')) {
        genero = 'masculino';
    } else if (generoBruto.toLowerCase().includes('fem')) {
        genero = 'feminino';
    }

    const nacionalidade = document.getElementById('edit-familiar-nacionalidade')?.value || 'BR';
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
        genero: genero,
        sexo: genero,
        nacionalidade: nacionalidade,
        possui_cartao: possuiCartao,
        eh_kids: ehKids,
        permissoes: perms
    };

    const original=window.listaMembrosFamilia.find(m=>m.id===id);
    if(email && original?.email && email!==original.email){
        return window.mostrarToast('O e-mail de login deve ser alterado pelo próprio titular nas configurações de acesso.', 'erro');
    }
    if(email)dadosAtualizar.email=email;

    let { error } = await cli.from('membros').update(dadosAtualizar).eq('id', id);

    if (error && error.message && error.message.includes('sexo')) {
        delete dadosAtualizar.sexo;
        const resSec = await cli.from('membros').update(dadosAtualizar).eq('id', id);
        error = resSec.error;
    }

    if (error) return window.mostrarToast("Erro ao atualizar familiar: " + error.message, "erro");

    if (window.perfilAtual && (window.perfilAtual.id === id || obterUsuarioId() === id)) {
        window.perfilAtual.nome = nome;
        window.perfilAtual.parentesco = parentesco;
        window.perfilAtual.papel = papel;
        window.perfilAtual.genero = genero;
        window.perfilAtual.sexo = genero;
        window.perfilAtual.nacionalidade = nacionalidade;
        window.perfilAtual.possui_cartao = possuiCartao;
        window.perfilAtual.eh_kids = ehKids;
        window.perfilAtual.permissoes = perms;

        if (typeof window.aplicarRegrasPerfilKidsOuAdulto === 'function') {
            window.aplicarRegrasPerfilKidsOuAdulto();
        }
    }

    window.aplicarVisibilidadeEspacoGenero();

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

