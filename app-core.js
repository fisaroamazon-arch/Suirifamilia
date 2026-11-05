// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-CORE.JS (100% COMPLETO E INTEGRAL)
// Núcleo de Sessão, Autenticação, Trocar Membro (Tela Cheia & Avatares Grandes),
// Modo Kids Isolado, Integração Mascote Tamagotchi, Gestão de Avatar, Fila Offline,
// Splash de Vídeo, Autoexclusão Definitiva de Conta, Navegação & Zero Emojis (SVG)
// =========================================================================

// Configuração do Supabase
const SUPABASE_URL = 'https://apbqjbrqwulgohcjkxae.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5hbnJj3KsCaxsfzjuGy0Xg_2io0kWPR';

// Inicialização segura e disponibilização global para todos os módulos
var cliente = (typeof window.supabase !== 'undefined' && window.supabase.createClient && SUPABASE_URL.startsWith('http'))
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

window.cliente = cliente;
window.clienteSupabase = cliente;

var esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
window.esc = esc;

// =========================================================================
// CATÁLOGO UNIVERSAL DE ÍCONES SVG (ZERO EMOJIS - ALTA DEFINIÇÃO)
// =========================================================================
window.IconesSuiri = {
    check: `<svg class="icone-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    fogo: `<svg class="icone-svg icone-fogo" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    escudo: `<svg class="icone-svg icone-escudo" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    coroa: `<svg class="icone-svg icone-coroa" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/></svg>`,
    heroi: `<svg class="icone-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    trofeu: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34c3.27-.79 5-3.24 5-6.66H6c0 3.42 1.73 5.87 5 6.66z"/></svg>`,
    medalha: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    broto: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    moeda: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>`,
    presente: `<svg class="icone-svg" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
    louca: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/></svg>`,
    filme: `<svg class="icone-svg" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="5" rx="2"/><polyline points="8 2 12 5 16 2"/></svg>`,
    refeicao: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M6 2v20"/><path d="M9 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/></svg>`,
    editar: `<svg class="icone-svg" viewBox="0 0 24 24" style="width:13px; height:13px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    excluir: `<svg class="icone-svg" viewBox="0 0 24 24" style="width:13px; height:13px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    mic: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
    carrinho: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    casa: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    carteira: `<svg class="icone-svg" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    agenda: `<svg class="icone-svg" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    familia: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    alvo: `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    trocarMembro: `<svg class="icone-svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    cadeado: `<svg class="icone-svg" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
};

// =========================================================================
// 1. UTILITÁRIOS: CPF E FORMATAÇÃO DE MOEDA
// =========================================================================
window.validarCPF = function(cpf) {
    cpf = String(cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
};

window.limparCPF = function(cpf) {
    return String(cpf || '').replace(/\D/g, '');
};

window.formatarCPF = function(v) {
    const s = String(v || '').replace(/\D/g, '');
    if (s.length !== 11) return s;
    return s.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

window.formatarMoedaBRL = function(valor) {
    const v = Number(valor) || 0;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// =========================================================================
// 2. ESTADO GLOBAL DA SESSÃO, MODO KIDS & CONTROLO DE MEMBROS
// =========================================================================
window.usuarioAtual = null;
window.perfilAtual = null;
window.familiaAtualId = null;
window.dadosFamiliaAtual = null;
window.listaMembrosFamilia = [];
window.telaAtualVisivel = 'inicio';
window.modoKidsAtivo = false;

window.mostrarToast = function(msg, tipo = 'sucesso') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.prepend(container);
    }
    const t = document.createElement('div');
    t.className = `toast-msg toast-${tipo}`;
    t.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px;">
            ${tipo === 'sucesso' ? window.IconesSuiri.check : ''}
            ${esc(msg)}
        </span>
        <span style="cursor:pointer;opacity:0.8;padding:2px 6px;" onclick="this.parentElement.remove()">✕</span>
    `;
    container.appendChild(t);
    setTimeout(() => { if (t.parentElement) t.remove(); }, 4000);
};

window.alternarAbaLoginCadastro = function(aba) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    const formLogin = document.getElementById('bloco-form-login');
    const formCad = document.getElementById('bloco-form-cadastro');
    if (aba === 'cadastro') {
        formLogin?.classList.add('oculto');
        formCad?.classList.remove('oculto');
    } else {
        formCad?.classList.add('oculto');
        formLogin?.classList.remove('oculto');
    }
};

// =========================================================================
// 3. MOTOR DE APRESENTAÇÃO DO VÍDEO SPLASH (TELA CHEIA, 2X, ÁUDIO SEGURO)
// =========================================================================
window.gerenciarApresentacaoVideoSplash = function() {
    const CHAVE_SPLASH = 'suiri_splash_visto_sessao';
    const splashEl = document.getElementById('splash-screen-apresentacao');
    const videoEl = document.getElementById('video-intro-splash');

    if (!splashEl || !videoEl) return;

    if (sessionStorage.getItem(CHAVE_SPLASH)) {
        splashEl.remove();
        return;
    }

    splashEl.classList.remove('oculto');

    let finalizado = false;
    const encerrarSplash = () => {
        if (finalizado) return;
        finalizado = true;
        sessionStorage.setItem(CHAVE_SPLASH, 'true');
        splashEl.classList.add('fade-out');
        setTimeout(() => splashEl.remove(), 500);
    };

    videoEl.playbackRate = 2.0;
    videoEl.muted = false;
    const promessaPlay = videoEl.play();

    if (promessaPlay !== undefined) {
        promessaPlay.then(() => {
            videoEl.playbackRate = 2.0;
        }).catch(() => {
            console.warn("Autoplay com áudio restrito pelo navegador. Reproduzindo mudo.");
            videoEl.muted = true;
            videoEl.play();
            videoEl.playbackRate = 2.0;
        });
    }

    videoEl.addEventListener('ended', encerrarSplash);
    setTimeout(encerrarSplash, 5200);
};

// =========================================================================
// 4. AUTENTICAÇÃO REAL POR E-MAIL E CADASTRO DA FAMÍLIA (COM RESGUARDO)
// =========================================================================
window.fazerLoginEmail = async function(email, senha) {
    if (!cliente) return window.mostrarToast("Configure a ligação ao Supabase no app-core.js!", "erro");

    const emailLimpo = String(email || '').trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes('@')) {
        return window.mostrarToast("Introduza um e-mail válido.", "erro");
    }
    if (!senha || senha.length < 6) {
        return window.mostrarToast("A palavra-passe deve conter pelo menos 6 dígitos.", "erro");
    }

    const { data, error } = await cliente.auth.signInWithPassword({
        email: emailLimpo,
        password: senha
    });

    if (error) {
        return window.mostrarToast("E-mail ou palavra-passe incorretos: " + error.message, "erro");
    }

    window.usuarioAtual = data.user;
    await window.iniciarAppFamilia();
    return true;
};

window.cadastrarNovaFamiliaADM = async function({ nomeFamilia, nomeAdm, emailAdm, cpfAdm, senha }) {
    if (!cliente) {
        return window.mostrarToast("Configure a ligação ao Supabase no app-core.js!", "erro");
    }

    const emailLimpo = String(emailAdm || '').trim().toLowerCase();
    const cpfLimpo = window.limparCPF(cpfAdm);

    if (!nomeFamilia || nomeFamilia.trim().length < 2) {
        return window.mostrarToast("Indique o nome da Família / Lar.", "erro");
    }
    if (!nomeAdm || nomeAdm.trim().length < 2) {
        return window.mostrarToast("Indique o seu nome completo.", "erro");
    }
    if (!emailLimpo || !emailLimpo.includes('@')) {
        return window.mostrarToast("Indique um e-mail válido para o início de sessão.", "erro");
    }
    if (!window.validarCPF(cpfLimpo)) {
        return window.mostrarToast("CPF inválido. Verifique os números.", "erro");
    }
    if (!senha || senha.length < 6) {
        return window.mostrarToast("A palavra-passe deve ter no mínimo 6 dígitos.", "erro");
    }

    window.mostrarToast("A registar o Lar da família...", "info");

    const { data: authData, error: authError } = await cliente.auth.signUp({
        email: emailLimpo,
        password: senha,
        options: {
            data: { nome: nomeAdm.trim() }
        }
    });

    if (authError || !authData?.user) {
        console.error("Erro Auth signUp:", authError);
        const msgAuth = authError?.message || "falha na resposta";
        if (msgAuth.includes("already registered") || msgAuth.includes("User already exists")) {
            return window.mostrarToast("Este e-mail já está cadastrado. Tente entrar pelo login.", "erro");
        }
        return window.mostrarToast("Erro ao criar utilizador: " + msgAuth, "erro");
    }

    const userId = authData.user.id;

    if (!authData.session) {
        const { data: loginData } = await cliente.auth.signInWithPassword({
            email: emailLimpo,
            password: senha
        });
        if (loginData?.user) {
            window.usuarioAtual = loginData.user;
        }
    }

    let { data: novaFamilia, error: errFam } = await cliente.from('familias').insert([{
        nome_familia: nomeFamilia.trim(),
        cpf_adm_principal: cpfLimpo,
        orcamento_mercado_mensal: 1200.00
    }]).select().maybeSingle();

    if (errFam && (errFam.message.includes('unique') || errFam.message.includes('duplicate') || errFam.code === '23505')) {
        const { data: famExistente } = await cliente.from('familias')
            .select('*')
            .eq('cpf_adm_principal', cpfLimpo)
            .maybeSingle();
        if (famExistente) {
            novaFamilia = famExistente;
            errFam = null;
        }
    }

    if (errFam || !novaFamilia) {
        console.error("Erro insert familias:", errFam);
        const detalhe = errFam?.message || "falha na tabela familias";
        if (detalhe.includes('row-level security') || detalhe.includes('policy')) {
            return window.mostrarToast("Permissão de criação bloqueada. Execute o SQL de liberação.", "erro");
        }
        return window.mostrarToast("Erro ao criar família: " + detalhe, "erro");
    }

    const { error: errMembro } = await cliente.from('membros').upsert([{
        id: userId,
        familia_id: novaFamilia.id,
        nome: nomeAdm.trim(),
        cpf: cpfLimpo,
        papel: 'adm',
        parentesco: 'Chefe do Lar',
        possui_cartao: true,
        eh_kids: false,
        permissoes: { mercado: true, gastos: true, missoes: true, financeiro_adm: true },
        saldo_carteira: 0,
        ofensiva_atual: 1,
        xp_total: 50,
        ultimo_checkin_data: new Date().toISOString().split('T')[0]
    }], { onConflict: 'id' });

    if (errMembro) {
        console.error("Erro upsert membros:", errMembro);
        return window.mostrarToast("Erro ao criar membro ADM: " + (errMembro?.message || "falha na tabela"), "erro");
    }

    window.mostrarToast("Lar registado com sucesso!");
    window.usuarioAtual = authData.user;
    await window.iniciarAppFamilia();
    return true;
};

// =========================================================================
// 5. GESTÃO DE FOTO DE PERFIL (AVATAR)
// =========================================================================
window.abrirSeletorFotoPerfil = function() {
    document.getElementById('input-upload-avatar-membro')?.click();
};

window.processarUploadAvatar = function(evento) {
    const file = evento.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        return window.mostrarToast("Selecione um ficheiro de imagem válido.", "erro");
    }

    const leitor = new FileReader();
    leitor.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 240;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_DIM) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                }
            } else {
                if (height > MAX_DIM) {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const base64Data = canvas.toDataURL('image/jpeg', 0.8);
            await window.guardarFotoPerfil(base64Data);
        };
        img.src = e.target.result;
    };
    leitor.readAsDataURL(file);
};

window.guardarFotoPerfil = async function(base64Data) {
    if (!window.perfilAtual || !cliente) return;

    window.mostrarToast("A atualizar foto...", "info");

    const { error } = await cliente.from('membros')
        .update({ avatar_url: base64Data })
        .eq('id', window.perfilAtual.id);

    if (error) {
        return window.mostrarToast("Falha ao guardar foto: " + error.message, "erro");
    }

    window.perfilAtual.avatar_url = base64Data;
    
    const imgEl = document.getElementById('img-avatar-topo');
    if (imgEl) imgEl.src = base64Data;

    const imgKids = document.getElementById('img-avatar-kids');
    if (imgKids) imgKids.src = base64Data;

    if (typeof window.renderizarMembrosFamiliaPainel === 'function') {
        window.renderizarMembrosFamiliaPainel();
    }

    window.mostrarToast("Foto de perfil atualizada!");
};

// =========================================================================
// 6. MODAL DE SENHA / PIN DE ADULTO
// =========================================================================
window.abrirModalSenhaAdulto = function(membro) {
    if (!membro) return;

    let modal = document.getElementById('modal-pin-acesso-adulto');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-pin-acesso-adulto';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '1000002';
        modal.innerHTML = `
            <div class="modal-conteudo" style="max-width: 320px; text-align: center; padding: 22px 18px; border-radius: 20px; border: 1.5px solid var(--borda-delicada, rgba(217, 119, 6, 0.25)); background: #ffffff;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; color: var(--cor-primaria, #d97706); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                    ${window.IconesSuiri?.cadeado || ''}
                </div>
                <h3 style="margin: 0 0 4px 0; font-size: 16px; color: var(--texto-principal);">Acesso Restrito</h3>
                <p id="subtitulo-pin-adulto" style="font-size: 12.5px; color: var(--texto-suave); line-height: 1.4; margin: 0 0 14px 0;"></p>
                <input type="password" id="input-pin-acesso-adulto" placeholder="Digite seu PIN ou senha" style="text-align: center; font-size: 15px; letter-spacing: 2px; margin-bottom: 14px;">
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-secundario" style="flex: 1;" onclick="document.getElementById('modal-pin-acesso-adulto').classList.add('oculto')">Cancelar</button>
                    <button type="button" id="btn-confirmar-pin-adulto" class="btn-principal" style="flex: 1;">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const primeiroNome = String(membro.nome || 'Usuário').split(' ')[0];
    const sub = document.getElementById('subtitulo-pin-adulto');
    const input = document.getElementById('input-pin-acesso-adulto');
    const btnConfirmar = document.getElementById('btn-confirmar-pin-adulto');

    if (sub) sub.textContent = `Acesso restrito para ${primeiroNome}. Digite sua senha:`;
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 200);
    }

    if (btnConfirmar) {
        btnConfirmar.onclick = () => {
            const pin = input?.value ? input.value.trim() : '';
            if (pin.length >= 4) {
                modal.classList.add('oculto');
                window.perfilAtual = membro;
                window.fecharJanelaPrincipalQuiosque();
                window.aplicarRegrasPerfilKidsOuAdulto();
                window.mostrarToast(`Sessão ativa para ${primeiroNome}!`);
            } else {
                window.mostrarToast("PIN ou senha deve conter ao menos 4 dígitos.", "erro");
            }
        };
    }

    modal.classList.remove('oculto');
};

// =========================================================================
// 7. MOTOR "TROCAR MEMBRO" (TELA CHEIA & AVATARES GRANDES)
// =========================================================================
window.abrirJanelaPrincipalQuiosque = function() {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    let modal = document.getElementById('modal-janela-quiosque');
    if (!modal) {
        window.criarModalQuiosqueDinamico();
    } else {
        modal.classList.remove('oculto');
    }
    window.renderizarAvataresQuiosque();
};

window.fecharJanelaPrincipalQuiosque = function() {
    document.getElementById('modal-janela-quiosque')?.classList.add('oculto');
};

window.criarModalQuiosqueDinamico = function() {
    let modal = document.getElementById('modal-janela-quiosque');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'modal-janela-quiosque';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '99999';
    modal.innerHTML = `
        <div class="modal-conteudo modal-quiosque-tela-cheia">
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="display:inline-flex; width:26px; height:26px; color:var(--cor-primaria);">${window.IconesSuiri?.trocarMembro || ''}</span>
                        <h2 style="font-size:22px; color:var(--texto-principal); margin:0; font-weight:800;">Quem é você?</h2>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; font-size:14px; border-radius:12px;" onclick="window.fecharJanelaPrincipalQuiosque()">✕</button>
                </div>
                <p class="status-texto" style="font-size:13px; margin:0 0 10px 0; text-align:left;">Toque na sua foto para abrir a sua rotina:</p>
            </div>
            
            <div id="grade-avatares-quiosque" class="grade-avatares-expandida"></div>

            <div style="border-top:1px solid var(--borda-delicada); padding-top:12px;">
                <button type="button" class="btn-secundario" style="width:100%; font-size:13px; font-weight:700; border-radius:14px; padding:12px;" onclick="window.fecharJanelaPrincipalQuiosque()">
                    Voltar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.renderizarAvataresQuiosque = function() {
    const container = document.getElementById('grade-avatares-quiosque');
    if (!container) return;

    container.innerHTML = '';
    const membros = window.listaMembrosFamilia || [];

    membros.forEach(m => {
        const ehKids = m.eh_kids === true || m.papel === 'dependente';
        const card = document.createElement('div');
        card.className = `card-usuario-quiosque ${ehKids ? 'card-usuario-kids-destaque' : ''}`;
        
        card.onclick = () => window.selecionarUsuarioQuiosque(m.id);

        const avatarSrc = m.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
        const nomeCurto = String(m.nome || 'Membro').split(' ')[0];

        card.innerHTML = `
            <img src="${avatarSrc}" class="avatar-quiosque-grande" style="border: 3px solid ${ehKids ? '#10b981' : 'var(--cor-primaria)'};">
            <strong style="font-size:14px; color:var(--texto-principal); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; margin-top:2px;">
                ${esc(nomeCurto)}
            </strong>
            <span style="font-size:11px; color:${ehKids ? '#15803d' : 'var(--texto-suave)'}; font-weight:800; margin-top:3px; background:${ehKids ? '#dcfce7' : '#f1f5f9'}; padding:2px 8px; border-radius:999px;">
                ${ehKids ? 'Kids' : (m.parentesco || 'Adulto')}
            </span>
        `;
        container.appendChild(card);
    });
};

window.selecionarUsuarioQuiosque = function(membroId) {
    const membro = (window.listaMembrosFamilia || []).find(m => m.id === membroId);
    if (!membro) return;

    const ehKids = membro.eh_kids === true || membro.papel === 'dependente';
    const primeiroNome = String(membro.nome || 'Usuário').split(' ')[0];

    if (ehKids) {
        window.perfilAtual = membro;
        window.fecharJanelaPrincipalQuiosque();
        window.aplicarRegrasPerfilKidsOuAdulto();
        if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
            window.SonsSuiri.sucessoMissao();
        }
        window.mostrarToast(`Olá, ${primeiroNome}! As tuas missões estão prontas!`);
    } else {
        if (typeof window.abrirModalSenhaAdulto === 'function') {
            window.abrirModalSenhaAdulto(membro);
        } else {
            window.perfilAtual = membro;
            window.fecharJanelaPrincipalQuiosque();
            window.aplicarRegrasPerfilKidsOuAdulto();
            window.mostrarToast(`Sessão ativa para ${primeiroNome}!`);
        }
    }
};

window.aplicarRegrasPerfilKidsOuAdulto = function() {
    if (!window.perfilAtual) return;

    const ehKids = window.perfilAtual.eh_kids === true || window.perfilAtual.papel === 'dependente';
    window.modoKidsAtivo = ehKids;

    const telaKids = document.getElementById('tela-kids-exclusiva');
    const painelAdulto = document.getElementById('painel-adulto-container');
    const barraNav = document.getElementById('barra-navegacao-principal');

    if (ehKids) {
        document.body.classList.add('modo-kids-ativo');
        telaKids?.classList.remove('oculto');
        painelAdulto?.classList.add('oculto');
        barraNav?.classList.add('oculto');

        const elNomeKids = document.getElementById('nome-membro-kids');
        if (elNomeKids) elNomeKids.textContent = window.perfilAtual.nome;

        const elXpKids = document.getElementById('contador-xp-kids');
        if (elXpKids) elXpKids.textContent = `${window.perfilAtual.xp_total || 0} XP`;

        const imgKids = document.getElementById('img-avatar-kids');
        if (imgKids && window.perfilAtual.avatar_url) {
            imgKids.src = window.perfilAtual.avatar_url;
        }

        if (window.TamagotchiKids && typeof window.TamagotchiKids.montarWidgetNaTela === 'function') {
            window.TamagotchiKids.montarWidgetNaTela();
        }

        if (typeof window.carregarMissoesKidsExclusiva === 'function') {
            window.carregarMissoesKidsExclusiva();
        } else if (typeof window.carregarMissoesDoDia === 'function') {
            window.carregarMissoesDoDia();
        }
    } else {
        document.body.classList.remove('modo-kids-ativo');
        telaKids?.classList.add('oculto');
        painelAdulto?.classList.remove('oculto');
        barraNav?.classList.remove('oculto');

        document.getElementById('container-tamagotchi-kids')?.remove();
        document.getElementById('modal-tamagotchi-cuidados')?.classList.add('oculto');

        const elNomeMembro = document.getElementById('nome-membro-topo');
        if (elNomeMembro) elNomeMembro.textContent = window.perfilAtual.nome;

        const elOfensiva = document.getElementById('contador-ofensiva-topo');
        if (elOfensiva) elOfensiva.textContent = window.perfilAtual.ofensiva_atual || 0;

        const imgAvatar = document.getElementById('img-avatar-topo');
        if (imgAvatar && window.perfilAtual.avatar_url) {
            imgAvatar.src = window.perfilAtual.avatar_url;
        }

        const navMercado = document.querySelector('.bottom-nav-item[data-tela="mercado"]');
        if (window.perfilAtual.permissoes && window.perfilAtual.permissoes.mercado === false) {
            navMercado?.classList.add('oculto');
        } else {
            navMercado?.classList.remove('oculto');
        }

        if (typeof window.carregarMetasAnuais === 'function') {
            window.carregarMetasAnuais();
        }

        window.navegarParaTela(window.telaAtualVisivel || 'inicio');
    }
};

// =========================================================================
// 8. INICIALIZAÇÃO DA SESSÃO E DADOS FAMILIARES
// =========================================================================
window.iniciarAppFamilia = async function() {
    if (!window.usuarioAtual || !cliente) return;

    const { data: membro, error: errMembro } = await cliente.from('membros')
        .select('*')
        .eq('id', window.usuarioAtual.id)
        .maybeSingle();

    if (errMembro || !membro) {
        window.mostrarToast("Perfil de membro não encontrado.", "erro");
        return;
    }

    window.perfilAtual = membro;
    window.familiaAtualId = membro.familia_id;

    const { data: familia } = await cliente.from('familias')
        .select('*')
        .eq('id', window.familiaAtualId)
        .single();
    window.dadosFamiliaAtual = familia;

    const { data: membros } = await cliente.from('membros')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('nome');
    window.listaMembrosFamilia = membros || [];

    const selRelatorio = document.getElementById('filtro-membro-relatorio');
    if (selRelatorio) {
        selRelatorio.innerHTML = '<option value="todos">Todos os Membros (Casa)</option>';
        window.listaMembrosFamilia
            .filter(m => m.possui_cartao !== false)
            .forEach(m => {
                selRelatorio.innerHTML += `<option value="${m.id}">${esc(m.nome)}</option>`;
            });
    }

    const elNomeFamilia = document.getElementById('nome-familia-topo');
    if (elNomeFamilia) elNomeFamilia.textContent = window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar';

    document.getElementById('tela-login')?.classList.add('oculto');
    document.getElementById('tela-app')?.classList.remove('oculto');

    window.aplicarRegrasPerfilKidsOuAdulto();

    if (typeof window.carregarListaMembrosPainel === 'function') {
        await window.carregarListaMembrosPainel();
    } else if (typeof window.atualizarTodosSeletoresMembros === 'function') {
        window.atualizarTodosSeletoresMembros();
    }

    if (typeof window.iniciarModuloMissoes === 'function') await window.iniciarModuloMissoes();
    
    if (typeof window.carregarMetasAnuais === 'function') {
        await window.carregarMetasAnuais();
    }

    if (typeof window.carregarItensMercado === 'function') await window.carregarItensMercado();
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.carregarCofresCompartilhados === 'function') await window.carregarCofresCompartilhados();
    if (typeof window.carregarDadosCalendarioMes === 'function') await window.carregarDadosCalendarioMes();
    if (typeof window.iniciarEscutaRealtimeFamilia === 'function') window.iniciarEscutaRealtimeFamilia();
};

window.fazerLogoff = async function() {
    if (cliente) await cliente.auth.signOut();
    window.usuarioAtual = null;
    window.perfilAtual = null;
    window.familiaAtualId = null;
    window.location.reload();
};

window.verificarSessao = async function() {
    if (!cliente) {
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
        return;
    }
    const { data: { session } } = await cliente.auth.getSession();
    if (session && session.user) {
        window.usuarioAtual = session.user;
        await window.iniciarAppFamilia();
    } else {
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
    }
};

// =========================================================================
// 9. NAVEGAÇÃO REATIVA ENTRE TELAS (COM GATILHOS DIRETOS DE DADOS)
// =========================================================================
window.navegarParaTela = function(nomeTela) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }

    if (window.modoKidsAtivo) {
        return;
    }

    window.telaAtualVisivel = nomeTela;
    const secoes = document.querySelectorAll('.secao-conteudo-app');
    secoes.forEach(sec => sec.classList.add('oculto'));

    const telaAlvo = document.getElementById(`secao-${nomeTela}`);
    if (telaAlvo) telaAlvo.classList.remove('oculto');

    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.getAttribute('data-tela') === nomeTela) {
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });

    if (nomeTela === 'mercado') {
        if (typeof window.carregarItensMercado === 'function') {
            window.carregarItensMercado();
        }
    } else if (nomeTela === 'financeiro') {
        if (typeof window.carregarCarteiraIndividual === 'function') {
            window.carregarCarteiraIndividual();
        }
        if (typeof window.carregarExtratoPeriodo === 'function') {
            window.carregarExtratoPeriodo();
        }
        if (typeof window.carregarCofresCompartilhados === 'function') {
            window.carregarCofresCompartilhados();
        }
    } else if (nomeTela === 'calendario') {
        if (typeof window.carregarDadosCalendarioMes === 'function') {
            window.carregarDadosCalendarioMes();
        }
    } else if (nomeTela === 'familia') {
        if (typeof window.carregarListaMembrosPainel === 'function') {
            window.carregarListaMembrosPainel();
        }
    } else if (nomeTela === 'inicio') {
        if (typeof window.carregarMissoesDoDia === 'function') window.carregarMissoesDoDia();
        if (typeof window.carregarRecadosLar === 'function') window.carregarRecadosLar();
        if (typeof window.carregarMetasAnuais === 'function') window.carregarMetasAnuais();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// =========================================================================
// 10. ELIMINAÇÃO TOTAL DA PRÓPRIA CONTA (RPC DEFENSIVA + PURGAÇÃO DE DADOS)
// =========================================================================
window.solicitarExclusaoPropriaConta = async function() {
    if (!cliente || !window.usuarioAtual) {
        return window.mostrarToast("Sessão não identificada para exclusão.", "erro");
    }

    const primeiroAviso = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Tem a certeza absoluta de que pretende eliminar a sua conta? Todos os seus dados, tarefas e registos serão eliminados de forma irreversível.", "Eliminar Conta")
        : confirm("Tem a certeza absoluta de que pretende eliminar a sua conta? Todos os seus dados serão eliminados.");

    if (!primeiroAviso) return;

    const segundoAviso = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Esta é uma ação definitiva e sem retorno. Deseja confirmar agora a remoção completa?", "Confirmação Final")
        : confirm("Esta é uma ação definitiva e sem retorno. Deseja confirmar agora?");

    if (!segundoAviso) return;

    window.mostrarToast("A eliminar a sua conta e registos...", "info");

    try {
        const { error } = await cliente.rpc('excluir_minha_propria_conta');

        if (error) {
            console.error("Falha ao executar exclusão:", error);
            return window.mostrarToast("Erro ao processar eliminação: " + error.message, "erro");
        }

        await cliente.auth.signOut();
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}

        window.usuarioAtual = null;
        window.perfilAtual = null;
        window.familiaAtualId = null;

        window.mostrarToast("Conta e dados eliminados com sucesso.");
        setTimeout(() => {
            window.location.reload();
        }, 1200);

    } catch (err) {
        console.error("Exceção na eliminação:", err);
        window.mostrarToast("Falha de comunicação ao eliminar conta.", "erro");
    }
};

// =========================================================================
// 11. FILA OFFLINE
// =========================================================================
const CHAVE_FILA_OFFLINE = 'suiri_fila_offline_acoes';

window.adicionarAFilaOffline = function(acao) {
    try {
        const fila = JSON.parse(localStorage.getItem(CHAVE_FILA_OFFLINE) || '[]');
        fila.push({ ...acao, timestamp: Date.now() });
        localStorage.setItem(CHAVE_FILA_OFFLINE, JSON.stringify(fila));
        window.mostrarToast("Ação guardada localmente (Modo Offline).", "info");
    } catch (e) {
        console.error("Erro na fila offline:", e);
    }
};

window.processarFilaOffline = async function() {
    if (!navigator.onLine || !cliente || !window.familiaAtualId) return;
    const fila = JSON.parse(localStorage.getItem(CHAVE_FILA_OFFLINE) || '[]');
    if (fila.length === 0) return;

    const filaRestante = [];
    for (const item of fila) {
        try {
            if (item.tabela && item.dados) {
                if (item.tipoOperacao === 'insert') {
                    await cliente.from(item.tabela).insert(item.dados);
                } else if (item.tipoOperacao === 'update' && item.condicao) {
                    await cliente.from(item.tabela).update(item.dados).match(item.condicao);
                }
            }
        } catch (err) {
            filaRestante.push(item);
        }
    }
    localStorage.setItem(CHAVE_FILA_OFFLINE, JSON.stringify(filaRestante));
    if (filaRestante.length === 0 && fila.length > 0) {
        window.mostrarToast("Ações offline sincronizadas com sucesso!");
    }
};

window.addEventListener('online', () => window.processarFilaOffline());

document.addEventListener("DOMContentLoaded", () => {
    window.gerenciarApresentacaoVideoSplash();
    window.verificarSessao();
});
