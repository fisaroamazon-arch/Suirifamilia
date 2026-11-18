// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-CORE.JS (CACHE BUSTER V3 & WARM TECH)
// Núcleo de Sessão, Autenticação, Trocar Membro (Tela Cheia & Avatares Grandes),
// Login Real Oficial para Troca de Adultos com Senha de Acesso,
// Modal Nativo "Concordo / Cancelar", Transições Direcionais Inteligentes,
// Modo Kids Isolado, Ciclo Horário Automático do Cenário (Manhã / Tarde / Noite),
// Integração Mascote Tamagotchi, Gestão de Avatar, Fila Offline (IndexedDB)
// =========================================================================

// Configuração do Supabase
const SUPABASE_URL = window.SuiriConfig.supabaseUrl;
const SUPABASE_KEY = window.SuiriConfig.supabasePublishableKey;

// Inicialização segura e disponibilização global para todos os módulos
var cliente = (typeof window.supabase !== 'undefined' && window.supabase.createClient && SUPABASE_URL.startsWith('http'))
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
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
// DESTRUIDOR DE CACHE PARA FORÇAR O NOVO DESIGN WARM TECH E RECURSOS SVG
// =========================================================================
window.limparCachePWAForcado = async function() {
    const registros = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : [];
    await Promise.all(registros.filter(r => r.scope === new URL('./', location.href).href).map(r => r.update()));
    window.mostrarToast('Atualização verificada. Reabra o aplicativo para usar a nova versão.', 'info');
};

// =========================================================================
// CATÁLOGO DE EMOJIS CATEGORIZADOS PARA MISSÕES E ATIVIDADES (SEM SVGS)
// =========================================================================
window.CatalogoEmojisSuiri = [
    { emoji: '🧹', tags: 'vassoura varrer limpeza faxina po' },
    { emoji: '🛏️', tags: 'cama quarto dormir sono descansar arrumar' },
    { emoji: '🧺', tags: 'roupa lavanderia cesto lavar' },
    { emoji: '🧼', tags: 'sabao lavar banho espuma higiene limpeza' },
    { emoji: '🧽', tags: 'esponja louca pia lavar' },
    { emoji: '🗑️', tags: 'lixo lixeira descartar' },
    { emoji: '🪴', tags: 'planta regar vaso flor regador' },
    { emoji: '🚿', tags: 'chuveiro banho agua lavar' },
    { emoji: '🪣', tags: 'balde esfregão agua faxina' },
    { emoji: '🪟', tags: 'janela vidro limpar abrir' },
    { emoji: '📦', tags: 'caixa guardar organizar mudanca pacote' },
    { emoji: '🔑', tags: 'chave trancar porta casa fechar' },
    { emoji: '🧘', tags: 'ioga yoga meditar zen relaxar respirar' },
    { emoji: '🏃', tags: 'correr corrida exercicio cardio esteira treino' },
    { emoji: '🏋️', tags: 'musculacao peso academia treino forca' },
    { emoji: '🚴', tags: 'bicicleta pedalar bike pedal esporte' },
    { emoji: '🚶', tags: 'caminhar caminhada passos ar livre' },
    { emoji: '💊', tags: 'remedio comprimido pilula vitamina farmacia' },
    { emoji: '🦷', tags: 'dente escovar escova dentista bucal' },
    { emoji: '💧', tags: 'agua hidratar beber copo sede' },
    { emoji: '🥗', tags: 'salada dieta saudavel comida vegetais' },
    { emoji: '🍎', tags: 'maca fruta lanche comida saudavel' },
    { emoji: '😴', tags: 'dormir sono descanso soneca cama' },
    { emoji: '🛒', tags: 'carrinho mercado compras supermercado feira' },
    { emoji: '🍳', tags: 'cozinhar fritar ovo cafe comida cafe' },
    { emoji: '🍲', tags: 'sopa panela almoço jantar comida refeicao' },
    { emoji: '🥩', tags: 'carne churrasco acougue bife' },
    { emoji: '🍞', tags: 'pao padaria cafe cafe torrada' },
    { emoji: '🥛', tags: 'leite copo laticinios beber' },
    { emoji: '☕', tags: 'cafe xicara acordar manha pause quente' },
    { emoji: '🍕', tags: 'pizza lanche jantar delivery festa' },
    { emoji: '📚', tags: 'livro livros estudar estudo leitura aula licao' },
    { emoji: '✏️', tags: 'lapis escrever desenhar anotar licao' },
    { emoji: '💻', tags: 'computador notebook trabalho home office programar' },
    { emoji: '📝', tags: 'caderno anotaçao lista notas tarefas' },
    { emoji: '🎒', tags: 'mochila escola aula material guardar' },
    { emoji: '📅', tags: 'calendario agenda data dia marcar' },
    { emoji: '⏰', tags: 'relogio alarme despertar tempo hora prazo' },
    { emoji: '💰', tags: 'dinheiro saco moeda riqueza pagar' },
    { emoji: '💵', tags: 'nota cedula real dinheiro pagamento' },
    { emoji: '💳', tags: 'cartao credito debito pagar banco' },
    { emoji: '🪙', tags: 'moeda centavos mesada trocado' },
    { emoji: '🧾', tags: 'recibo cupom fiscal nota comprovante conta' },
    { emoji: '🐷', tags: 'porquinho cofre cofrinho poupar guardar' },
    { emoji: '🐶', tags: 'cachorro cao pet passear latir bicho' },
    { emoji: '🐱', tags: 'gato felino pet miau bicho' },
    { emoji: '🎮', tags: 'videogame controle jogo play gamer' },
    { emoji: '⚽', tags: 'bola futebol jogar esporte partida' },
    { emoji: '🎬', tags: 'filme cinema tela video serie pipoca' },
    { emoji: '🎧', tags: 'fone musica ouvir som podcast' },
    { emoji: '🎨', tags: 'paleta pintura arte desenhar pintar quadro' },
    { emoji: '🚗', tags: 'carro transito viagem dirigir abastecer' },
    { emoji: '⭐', tags: 'estrela destaque especial favorito nota dez' },
    { emoji: '🏆', tags: 'trofeu premio campeao vitoria primeiro' },
    { emoji: '🔥', tags: 'fogo chama ofensiva quente meta foco' }
];

// =========================================================================
// 1. UTILITÁRIOS: CPF, FORMATAÇÃO DE MOEDA & DIÁLOGO PERSONALIZADO
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

window.confirmarAcaoSuiri = function(mensagem, titulo = 'Confirmação') {
    return new Promise((resolve) => {
        let modal = document.getElementById('modal-confirmacao-nativo-suiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmacao-nativo-suiri';
            modal.className = 'modal-overlay';
            modal.style.zIndex = '1000005';
            modal.innerHTML = `
                <div class="modal-conteudo" style="max-width: 340px; text-align: center; padding: 24px 20px; border-radius: var(--raio-xl, 24px); border: 1px solid rgba(226, 232, 240, 0.9); background: #ffffff; box-shadow: var(--sombra-flutuante, 0 16px 38px rgba(15, 23, 42, 0.1));">
                    <div style="width: 46px; height: 46px; border-radius: 50%; background: #fff7ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 4px 12px rgba(249,115,22,0.14);">
                        <img src="assets/icons-modern/icone-escudo.svg" alt="Segurança" style="width: 24px; height: 24px; object-fit: contain;">
                    </div>
                    <h3 id="titulo-confirmacao-suiri" style="margin: 0 0 6px 0; font-size: 16.5px; color: var(--texto-principal, #0f172a); font-weight: 800;"></h3>
                    <p id="texto-confirmacao-suiri" style="font-size: 13px; color: var(--texto-suave, #64748b); line-height: 1.45; margin: 0 0 18px 0;"></p>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="btn-cancelar-confirmacao-suiri" class="btn-secundario" style="flex: 1; padding: 11px; border-radius: 12px; font-weight: 700;">Cancelar</button>
                        <button type="button" id="btn-concordo-confirmacao-suiri" class="btn-principal" style="flex: 1; padding: 11px; border-radius: 12px; font-weight: 800;">Concordo</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const elTit = document.getElementById('titulo-confirmacao-suiri');
        const elTxt = document.getElementById('texto-confirmacao-suiri');
        const btnCanc = document.getElementById('btn-cancelar-confirmacao-suiri');
        const btnConc = document.getElementById('btn-concordo-confirmacao-suiri');

        if (elTit) elTit.textContent = titulo;
        if (elTxt) elTxt.textContent = mensagem;

        modal.classList.remove('oculto');

        const fechar = (decisao) => {
            modal.classList.add('oculto');
            resolve(decisao);
        };

        if (btnCanc) btnCanc.onclick = () => fechar(false);
        if (btnConc) btnConc.onclick = () => fechar(true);
    });
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
            ${tipo === 'sucesso' ? '✓' : ''}
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

window.solicitarPermissaoPush = async function() {
    if (!("Notification" in window)) {
        return window.mostrarToast("Este navegador não suporta notificações Push.", "erro");
    }
    
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            window.mostrarToast("Permissão concedida. Alertas com o app fechado dependem da configuração do serviço de envio.");
        } else {
            window.mostrarToast("Permissão de Push negada ou ignorada.", "alerta");
        }
    } catch (e) {
        console.error("Erro ao solicitar Push:", e);
        window.mostrarToast("Não foi possível solicitar as notificações.", "erro");
    }
};

// =========================================================================
// 3. AUTENTICAÇÃO REAL E CADASTRO DA FAMÍLIA COM NACIONALIDADE & GÊNERO
// =========================================================================
window.fazerLoginEmail = async function(email, senha) {
    return Suiri.once('login', async () => {
        try {
            if (!cliente) throw new Error('Não foi possível carregar a conexão. Verifique sua internet.');
            const emailLimpo=String(email||'').trim().toLowerCase();
            if(!emailLimpo.includes('@') || !senha) throw new Error('Informe seu e-mail e senha.');
            const { data, error } = await cliente.auth.signInWithPassword({email:emailLimpo,password:senha});
            if(error)throw error;
            window.usuarioAtual=data.user;
            await window.iniciarAppFamilia();return true;
        } catch(error) { Suiri.notifyError(error); return false; }
    });
};

window.cadastrarNovaFamiliaADM = async function({nomeFamilia,nomeAdm,emailAdm,cpfAdm,senha,nacionalidade,genero}) {
    return Suiri.once('signup', async () => {
        try {
            if(!cliente)throw new Error('Conexão indisponível.');
            if(!nomeFamilia?.trim()||!nomeAdm?.trim())throw new Error('Preencha o nome do lar e seu nome.');
            if(!window.validarCPF(cpfAdm))throw new Error('Confira o CPF informado.');
            if(!emailAdm?.includes('@')||!senha||senha.length<8)throw new Error('Informe e-mail e senha com pelo menos 8 caracteres.');
            const cadastro={nome_familia:nomeFamilia.trim(),nome:nomeAdm.trim(),cpf:window.limparCPF(cpfAdm),nacionalidade:nacionalidade||'BR',genero:genero||''};
            const {data,error}=await cliente.auth.signUp({email:emailAdm.trim().toLowerCase(),password:senha,options:{emailRedirectTo:new URL('index.html',location.href).href,data:{nome:cadastro.nome,suiri_cadastro:cadastro,suiri_mostrar_aviso_privacidade:true}}});
            if(error)throw error;
            if(!data?.user)throw new Error('Cadastro não confirmado pelo serviço.');
            if(!data.session){window.mostrarToast('Confira seu e-mail para confirmar o cadastro. Depois entre com sua senha.', 'info');window.alternarAbaLoginCadastro('login');return false;}
            window.usuarioAtual=data.user;await window.iniciarAppFamilia();return true;
        }catch(error){Suiri.notifyError(error);return false;}
    });
};

// =========================================================================
// 4. GESTÃO DE FOTO DE PERFIL (AVATAR) E FERRAMENTA DE CROP COM CANVAS
// =========================================================================
// O recorte e a gravação de fotos são implementados em src/ui/photo-crop-v75.js.

// =========================================================================
// 5. TROCA DE PERFIL COM LOGIN OFICIAL VIA SUPABASE AUTH PARA ADULTOS
// =========================================================================
window.abrirModalSenhaAdulto = function(membro) {
    if (!membro) {
        membro = (window.listaMembrosFamilia || []).find(m => m.papel === 'adm') || 
                 (window.listaMembrosFamilia || []).find(m => !(m.eh_kids === true || m.papel === 'dependente'));
    }
    if (!membro) return;

    let modal = document.getElementById('modal-senha-adulto-suiri');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-senha-adulto-suiri';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '1000002';
        modal.innerHTML = `
            <div class="modal-conteudo" style="max-width: 340px; text-align: center; padding: 24px 20px; border-radius: var(--raio-xl, 24px); border: 1px solid rgba(226, 232, 240, 0.9); background: #ffffff; box-shadow: var(--sombra-flutuante, 0 16px 40px rgba(15, 23, 42, 0.12));">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: #fff7ed; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 4px 12px rgba(249,115,22,0.14);">
                    <img src="assets/icons-modern/icone-porta-sair.svg" alt="Acesso" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                <h3 id="titulo-modal-senha-membro" style="margin: 0 0 6px 0; font-size: 16.5px; color: var(--texto-principal, #0f172a); font-weight: 800;">Acesso Restrito</h3>
                <p id="subtitulo-modal-senha-membro" style="font-size: 13px; color: var(--texto-suave, #64748b); line-height: 1.45; margin: 0 0 16px 0;"></p>
                <input type="password" id="input-senha-membro-quiosque" placeholder="Digite sua senha de login" style="text-align: center; font-size: 15px; margin-bottom: 16px; width: 100%; box-sizing: border-box; padding: 11px 14px; border-radius: 12px; border: 1px solid #cbd5e1; outline: none;">
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-secundario" style="flex: 1; padding: 11px; border-radius: 12px; font-weight: 700;" onclick="document.getElementById('modal-senha-adulto-suiri').classList.add('oculto')">Cancelar</button>
                    <button type="button" id="btn-confirmar-senha-membro" class="btn-principal" style="flex: 1.2; padding: 11px; border-radius: 12px; font-weight: 800;">Entrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const sub = document.getElementById('subtitulo-modal-senha-membro');
    const input = document.getElementById('input-senha-membro-quiosque');
    const btnConfirmar = document.getElementById('btn-confirmar-senha-membro');

    const primeiroNome = (membro.nome || 'Adulto').split(' ')[0];
    if (sub) sub.textContent = `Acesso para ${primeiroNome}. Digite a palavra-passe do Lar:`;
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 200);
    }

    const submeterLogin = async () => {
        const senha = input.value;
        if (!senha) {
            return window.mostrarToast("Digite a sua senha de acesso.", "erro");
        }

        const emailMembro = (membro.email ? membro.email.toLowerCase().trim() : '') || 
                            (window.usuarioAtual?.email ? window.usuarioAtual.email.toLowerCase().trim() : '');

        if (!emailMembro) {
            return window.mostrarToast("E-mail de autenticação não identificado.", "erro");
        }

        const cli = window.cliente || window.clienteSupabase;
        if (!cli) {
            return window.mostrarToast("Erro de conexão com o banco.", "erro");
        }

        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "Validando...";

        try {
            const { data, error } = await cli.auth.signInWithPassword({
                email: emailMembro,
                password: senha
            });

            if (error) {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = "Entrar";
                if (window.SonsSuiri && typeof window.SonsSuiri.somFalhaAcolhedor === 'function') {
                    window.SonsSuiri.somFalhaAcolhedor();
                }
                return window.mostrarToast("Senha incorreta. Acesso não permitido.", "erro");
            }

            if(data.user.id !== membro.id) {
                await cli.auth.signOut();
                throw new Error('O e-mail de login não corresponde ao perfil escolhido. Entre novamente.');
            }
            window.usuarioAtual = data.user;
            window.perfilAtual = membro;
            localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));

            modal.classList.add('oculto');
            window.fecharJanelaPrincipalQuiosque();
            Suiri.reloadPersonal?.();
            window.aplicarRegrasPerfilKidsOuAdulto();

            window.mostrarToast(`Sessão ativa para ${primeiroNome}!`);
        } catch (e) {
            console.error("Erro na autenticação de troca de adulto:", e);
            window.mostrarToast("Falha na autenticação do utilizador.", "erro");
        } finally {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = "Entrar";
        }
    };

    btnConfirmar.onclick = submeterLogin;

    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submeterLogin();
            }
        };
    }

    modal.classList.remove('oculto');
};

window.solicitarSaidaModoKids = function() {
    const adulto = (window.listaMembrosFamilia || []).find(m => m.papel === 'adm') || 
                   (window.listaMembrosFamilia || []).find(m => !(m.eh_kids === true || m.papel === 'dependente')) ||
                   window.usuarioAtual;
    window.abrirModalSenhaAdulto(adulto);
};

// =========================================================================
// 6. MOTOR "TROCAR MEMBRO & LOGOUT" COM SEPARAÇÃO ADULTOS / KIDS
// =========================================================================
window.acionarBotaoSessaoTopo = function() {
    if (window.modoKidsAtivo) {
        const totalMembros = (window.listaMembrosFamilia || []).length;
        if (totalMembros > 1) {
            window.abrirJanelaPrincipalQuiosque();
        } else {
            window.solicitarSaidaModoKids();
        }
        return;
    }

    const totalMembros = (window.listaMembrosFamilia || []).length;
    if (totalMembros > 1) {
        window.abrirJanelaPrincipalQuiosque();
    } else {
        window.fazerLogoff();
    }
};

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
        <div class="modal-conteudo modal-quiosque-tela-cheia" style="display:flex; flex-direction:column; max-height:88vh; overflow-y:auto; padding:22px 20px; border-radius: var(--raio-xl, 28px); border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: var(--sombra-flutuante, 0 18px 44px rgba(15, 23, 42, 0.12));">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(226, 232, 240, 0.7); padding-bottom:10px;">
                <div style="display:flex; align-items:center; gap:9px;">
                    <img src="assets/icons-modern/icone-familia.svg" alt="Família" style="width:24px; height:24px; object-fit:contain;">
                    <h2 style="font-size:18px; color:var(--texto-principal, #0f172a); margin:0; font-weight:800; letter-spacing:-0.2px;">Trocar Perfil</h2>
                </div>
                <button type="button" class="btn-secundario" style="padding:6px 12px; font-size:13px; border-radius:10px;" onclick="window.fecharJanelaPrincipalQuiosque()">✕</button>
            </div>
            
            <!-- BLOCO 1: PERFIS ADULTOS -->
            <div id="secao-quiosque-adultos" style="margin-bottom:18px;">
                <span style="font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:var(--texto-suave, #64748b); display:block; margin-bottom:10px;">
                    👑 Perfis Adultos (Requer Senha)
                </span>
                <div id="grade-avatares-adultos" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(95px, 1fr)); gap:12px;"></div>
            </div>

            <!-- BLOCO 2: PERFIS KIDS -->
            <div id="secao-quiosque-kids" style="margin-bottom:20px;">
                <span style="font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#10b981; display:block; margin-bottom:10px;">
                    ⭐ Perfis Kids
                </span>
                <div id="grade-avatares-kids" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(95px, 1fr)); gap:12px;"></div>
            </div>

            <!-- RODAPÉ: BOTÃO SAIR DA CONTA -->
            <div style="border-top:1px solid rgba(226, 232, 240, 0.85); padding-top:14px; margin-top:auto; display:flex; flex-direction:column; gap:9px;">
                <button type="button" class="btn-erro" style="width:100%; font-size:13.5px; font-weight:800; border-radius:14px; padding:12px; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#fff1f2; color:#e11d48; border:1px solid #fecdd3;" onclick="window.fecharJanelaPrincipalQuiosque(); window.fazerLogoff();">
                    <img src="assets/icons-modern/icone-porta-sair.svg" alt="Sair" style="width:16px; height:16px; object-fit:contain;">
                    Sair da Conta
                </button>
                <button type="button" class="btn-secundario" style="width:100%; font-size:13px; font-weight:700; border-radius:14px; padding:11px;" onclick="window.fecharJanelaPrincipalQuiosque()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.renderizarAvataresQuiosque = function() {
    const containerAdultos = document.getElementById('grade-avatares-adultos');
    const containerKids = document.getElementById('grade-avatares-kids');
    const secaoKids = document.getElementById('secao-quiosque-kids');
    const secaoAdultos = document.getElementById('secao-quiosque-adultos');

    if (!containerAdultos || !containerKids) return;

    containerAdultos.innerHTML = '';
    containerKids.innerHTML = '';

    const membros = window.listaMembrosFamilia || [];
    const adultos = membros.filter(m => !(m.eh_kids === true || m.papel === 'dependente'));
    const kids = membros.filter(m => (m.eh_kids === true || m.papel === 'dependente'));

    if (adultos.length === 0 && secaoAdultos) secaoAdultos.classList.add('oculto');
    else if (secaoAdultos) secaoAdultos.classList.remove('oculto');

    if (kids.length === 0 && secaoKids) secaoKids.classList.add('oculto');
    else if (secaoKids) secaoKids.classList.remove('oculto');

    const montarCardMembro = (m, ehKids) => {
        const card = document.createElement('div');
        card.className = `card-usuario-quiosque ${ehKids ? 'card-usuario-kids-destaque' : ''}`;
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.onclick = () => window.selecionarUsuarioQuiosque(m.id);

        const avatarPadrao = (m.genero && m.genero.toLowerCase() === 'feminino') ? 'assets/icons-modern/icone-mulher.svg' : 'assets/icons-modern/icone-escudo.svg';
        const avatarSrc = m.avatar_url || avatarPadrao;
        const nomeCurto = String(m.nome || 'Membro').split(' ')[0];
        const bandeirinha = (typeof window.obterMiniBandeiraNacionalidade === 'function')
            ? window.obterMiniBandeiraNacionalidade(m.nacionalidade || 'BR')
            : '';

        card.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${avatarSrc}" class="avatar-quiosque-grande" style="width:68px; height:68px; border-radius:20px; object-fit:cover; border: 3px solid ${ehKids ? '#10b981' : 'var(--cor-primaria, #f97316)'}; box-shadow: 0 4px 12px rgba(15,23,42,0.06);">
                <span style="position: absolute; bottom: 4px; right: 4px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
                    ${bandeirinha}
                </span>
            </div>
            <strong style="font-size:13px; font-weight:800; color:var(--texto-principal, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; margin-top:5px;">
                ${esc(nomeCurto)}
            </strong>
            <span style="font-size:10.5px; color:${ehKids ? '#15803d' : 'var(--texto-suave, #64748b)'}; font-weight:800; margin-top:2px; background:${ehKids ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${ehKids ? 'rgba(16,185,129,0.25)' : 'rgba(100,116,139,0.18)'}; padding:2px 8px; border-radius:999px;">
                ${ehKids ? 'Kids' : (m.parentesco || 'Adulto')}
            </span>
        `;
        return card;
    };

    adultos.forEach(m => containerAdultos.appendChild(montarCardMembro(m, false)));
    kids.forEach(m => containerKids.appendChild(montarCardMembro(m, true)));
};

window.selecionarUsuarioQuiosque = function(membroId) {
    const membro = (window.listaMembrosFamilia || []).find(m => m.id === membroId);
    if (!membro) return;

    const ehKids = membro.eh_kids === true || membro.papel === 'dependente';
    const primeiroNome = String(membro.nome || 'Usuário').split(' ')[0];

    if (ehKids) {
        window.perfilAtual = membro;
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));
        window.fecharJanelaPrincipalQuiosque();
        Suiri.reloadPersonal?.();
        window.aplicarRegrasPerfilKidsOuAdulto();
        window.carregarMissoesDoDia?.();
        if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
            window.SonsSuiri.sucessoMissao();
        }
        window.mostrarToast(`Olá, ${primeiroNome}! Suas missões estão prontas!`);
    } else {
        window.abrirModalSenhaAdulto(membro);
    }
};

window.atualizarCartaoEspacoPessoal = function() {
    window.atualizarCartoesGeneroMeuEspaco?.();
};

// =========================================================================
// ATUALIZAÇÃO DA BOLINHA DO SININHO DO CABEÇALHO HERO
// =========================================================================
window.verificarNotificacoesPendentesTopo = async function() {
    if (!window.familiaAtualId) return;
    
    const bolinha = document.getElementById('indicador-notificacao-ponto');
    if (!bolinha) return;

    const supabase = obterClienteSupabase();
    if (!supabase) return;

    const hoje = Suiri.today();

    const { data: contas } = await supabase
        .from('agenda_financeira')
        .select('id')
        .eq('familia_id', window.familiaAtualId)
        .eq('data_vencimento', hoje)
        .eq('status', 'pendente');

    if (contas && contas.length > 0) {
        bolinha.classList.remove('oculto');
    } else {
        bolinha.classList.add('oculto');
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

        const horaAtual = new Date().getHours();
        document.body.classList.remove('cenario-dia', 'cenario-tarde', 'cenario-noite');
        if (horaAtual >= 6 && horaAtual < 16) {
            document.body.classList.add('cenario-dia');
        } else if (horaAtual >= 16 && horaAtual < 18.5) {
            document.body.classList.add('cenario-tarde');
        } else {
            document.body.classList.add('cenario-noite');
        }

        telaKids?.classList.remove('oculto');
        painelAdulto?.classList.add('oculto');
        barraNav?.classList.add('oculto');

        const elNomeKids = document.getElementById('nome-membro-kids');
        if (elNomeKids) elNomeKids.textContent = window.perfilAtual.nome;

        const elXpKids = document.getElementById('contador-xp-kids');
        if (elXpKids) elXpKids.textContent = `${window.perfilAtual.xp_total || 0} XP`;

        const imgKids = document.getElementById('img-avatar-kids');
        if (imgKids) {
            imgKids.src = window.perfilAtual.avatar_url || 'assets/icons-modern/icone-casa-escopo.svg';
        }

        const btnSairKids = document.getElementById('btn-sair-kids') || 
                            document.getElementById('btn-sair-modo-kids') || 
                            document.getElementById('btn-trocar-perfil-kids');
        if (btnSairKids) {
            btnSairKids.onclick = () => {
                const totalMembros = (window.listaMembrosFamilia || []).length;
                if (totalMembros > 1) {
                    window.abrirJanelaPrincipalQuiosque();
                } else {
                    window.solicitarSaidaModoKids();
                }
            };
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
        document.body.classList.remove('modo-kids-ativo', 'cenario-dia', 'cenario-tarde', 'cenario-noite');
        telaKids?.classList.add('oculto');
        painelAdulto?.classList.remove('oculto');
        barraNav?.classList.remove('oculto');

        window.TamagotchiKids?.montarWidgetNaTela();
        document.getElementById('modal-tamagotchi-cuidados')?.classList.add('oculto');

        const elNomeMembro = document.getElementById('nome-membro-topo');
        if (elNomeMembro) elNomeMembro.textContent = window.perfilAtual.nome;

        const elOfensiva = document.getElementById('contador-ofensiva-topo');
        if (elOfensiva) elOfensiva.textContent = window.perfilAtual.ofensiva_atual || 0;

        const imgAvatar = document.getElementById('img-avatar-topo');
        if (imgAvatar) {
            const avatarPadrao = (window.perfilAtual.genero && window.perfilAtual.genero.toLowerCase() === 'feminino') ? 'assets/icons-modern/icone-mulher.svg' : 'assets/icons-modern/icone-escudo.svg';
            imgAvatar.src = window.perfilAtual.avatar_url || avatarPadrao;
        }

        if (typeof window.atualizarBandeiraPerfilTopo === 'function') {
            window.atualizarBandeiraPerfilTopo();
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

        window.atualizarCartaoEspacoPessoal();
        window.navegarParaTela(window.telaAtualVisivel || 'inicio');
    }
};

// =========================================================================
// 7. INICIALIZAÇÃO DA SESSÃO E DADOS FAMILIARES (ASSÍNCRONO OTIMIZADO)
// =========================================================================
window.iniciarAppFamilia = async function() {
    return Suiri.once('bootstrap-family',async()=>{
        if(!window.usuarioAtual||!cliente)return false;
        const {data:membro,error}=await cliente.from('membros').select('*').eq('id',window.usuarioAtual.id).maybeSingle();
        if(error)throw error;
        let membroAuth=membro;
        if(!membroAuth){
            const cadastro=window.usuarioAtual.user_metadata?.suiri_cadastro;
            if(!cadastro)throw new Error('Seu acesso ainda não possui um perfil familiar. Solicite o vínculo ao administrador do lar.');
            const r=await cliente.rpc('suiri_criar_familia_v7',{p_payload:cadastro});
            if(r.error){if(['42883','PGRST202'].includes(r.error.code))throw new Error('Execute supabase/02_ATUALIZAR_V7.sql para concluir o cadastro.');throw r.error;}
            membroAuth=Suiri.check(await cliente.from('membros').select('*').eq('id',window.usuarioAtual.id).single());
        }
        const familiaId=membroAuth.familia_id;
        const [familiaResult,membrosResult]=await Promise.all([
            cliente.from('familias').select('*').eq('id',familiaId).single(),
            cliente.from('membros').select('*').eq('familia_id',familiaId).order('nome')
        ]);
        window.dadosFamiliaAtual=Suiri.check(familiaResult);
        window.listaMembrosFamilia=Suiri.check(membrosResult)||[];
        window.familiaAtualId=familiaId;
        const cache=Suiri.cachedProfile();
        const selected=window.listaMembrosFamilia.find(m=>m.id===cache.id);
        // Apenas o próprio adulto ou um dependente do mesmo lar pode ser restaurado.
        window.perfilAtual=selected&&(selected.id===window.usuarioAtual.id||selected.eh_kids||selected.papel==='dependente')?selected:membroAuth;
        const minimal=m=>({id:m.id,familia_id:m.familia_id,nome:m.nome,genero:m.genero,sexo:m.sexo,papel:m.papel,eh_kids:m.eh_kids,avatar_url:m.avatar_url});
        localStorage.setItem('suiri_perfil_ativo',JSON.stringify(minimal(window.perfilAtual)));
        localStorage.setItem('suiri_membros_ativos',JSON.stringify(window.listaMembrosFamilia.map(minimal)));
        localStorage.setItem('suiri_familia_ativa',JSON.stringify({id:familiaId,nome_familia:window.dadosFamiliaAtual?.nome_familia}));
        Suiri.reloadPersonal?.();
        document.getElementById('tela-login')?.classList.add('oculto');
        document.getElementById('tela-app')?.classList.remove('oculto');
        const title=document.getElementById('nome-familia-topo');if(title)title.textContent=window.dadosFamiliaAtual?.nome_familia||'Meu Lar';
        if(Suiri.isHome){
            window.aplicarRegrasPerfilKidsOuAdulto();
            window.atualizarTodosSeletoresMembros?.();
            window.renderizarMembrosFamiliaPainel?.();
            await window.iniciarModuloMissoes?.();
            await Promise.allSettled([window.carregarItensMercado?.(),window.carregarCarteiraIndividual?.(),window.carregarDadosCalendarioMes?.()]);
            window.iniciarEscutaRealtimeFamilia?.();
        }
        await window.processarFilaOffline?.();
        const contaNova = !membro || window.usuarioAtual.user_metadata?.suiri_mostrar_aviso_privacidade === true;
        if (Suiri.isHome && contaNova && window.perfilAtual.id === window.usuarioAtual.id && !window.modoKidsAtivo) {
            const chaveAviso = 'suiri:privacidade:v1:' + window.usuarioAtual.id;
            if (!localStorage.getItem(chaveAviso)) {
                window.abrirAvisoPrivacidade();
                localStorage.setItem(chaveAviso, 'exibido');
            }
        }
        document.dispatchEvent(new CustomEvent('suiri:session-ready',{detail:{memberId:window.perfilAtual.id}}));
        return true;
    });
};

window.fazerLogoff = async function() {
    try{if(cliente)Suiri.check(await cliente.auth.signOut());}
    catch(error){Suiri.notifyError(error);return;}
    window.usuarioAtual=null;window.perfilAtual=null;window.familiaAtualId=null;
    for(const k of ['suiri_perfil_ativo','suiri_familia_ativa','suiri_membros_ativos','suiri_ultimo_perfil','suiri_usuario_id'])localStorage.removeItem(k);
    // Dados pessoais e filas pertencem ao usuário e não são reenviados por outra conta.
    window.location.replace('index.html');
};

// =========================================================================
// 8. VERIFICAÇÃO ULTRA-RÁPIDA (FAST-PATH LOCALSTORAGE / SAFARI E IOS SAFE)
// =========================================================================
window.executarFastPathVisual = function() { return false; };

window.verificarSessao = async function() {
    try{
        if(!cliente)throw new Error('Não foi possível carregar a conexão. Verifique sua internet.');
        const {data,error}=await cliente.auth.getSession();
        if(error)throw error;
        if(!data?.session?.user){
            window.usuarioAtual=null;window.perfilAtual=null;window.familiaAtualId=null;
            document.getElementById('tela-app')?.classList.add('oculto');
            document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
            document.getElementById('tela-login')?.classList.remove('oculto');
            if(!Suiri.isHome)location.replace('index.html');
            return false;
        }
        window.usuarioAtual=data.session.user;
        return await window.iniciarAppFamilia();
    }catch(error){
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
        Suiri.notifyError(error);return false;
    }
};

// =========================================================================
// 9. NAVEGAÇÃO REATIVA ENTRE TELAS (COM DIREÇÃO E SWIPE)
// =========================================================================
window.navegarParaTela = function(nomeTela) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }

    if (window.modoKidsAtivo) return;

    const ordemTelas = ['meuespaco', 'inicio', 'mercado', 'financeiro', 'calendario', 'familia'];
    const indexAtual = ordemTelas.indexOf(window.telaAtualVisivel || 'inicio');
    const indexDestino = ordemTelas.indexOf(nomeTela);
    let direcaoClasse = '';

    if (indexDestino > indexAtual) {
        direcaoClasse = 'animar-entrada-direita';
    } else if (indexDestino < indexAtual) {
        direcaoClasse = 'animar-entrada-esquerda';
    }

    window.telaAtualVisivel = nomeTela;
    
    const secoes = document.querySelectorAll('.secao-conteudo-app');
    secoes.forEach(sec => {
        sec.classList.add('oculto');
        sec.classList.remove('animar-entrada-direita', 'animar-entrada-esquerda');
    });

    const telaAlvo = document.getElementById(`secao-${nomeTela}`);
    if (telaAlvo) {
        if (direcaoClasse) {
            telaAlvo.classList.add(direcaoClasse);
        }
        telaAlvo.classList.remove('oculto');
    }

    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.getAttribute('data-tela') === nomeTela) {
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });

    if (nomeTela === 'meuespaco') {
        window.atualizarCartaoEspacoPessoal();
    } else if (nomeTela === 'mercado') {
        if (typeof window.carregarItensMercado === 'function') window.carregarItensMercado();
    } else if (nomeTela === 'financeiro') {
        if (typeof window.carregarCarteiraIndividual === 'function') window.carregarCarteiraIndividual();
        if (typeof window.carregarExtratoPeriodo === 'function') window.carregarExtratoPeriodo();
        if (typeof window.carregarCofresCompartilhados === 'function') window.carregarCofresCompartilhados();
    } else if (nomeTela === 'calendario') {
        if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    } else if (nomeTela === 'familia') {
        if (typeof window.carregarListaMembrosPainel === 'function') window.carregarListaMembrosPainel();
    } else if (nomeTela === 'inicio') {
        if (typeof window.carregarMissoesDoDia === 'function') window.carregarMissoesDoDia();
        if (typeof window.carregarRecadosLar === 'function') window.carregarRecadosLar();
        if (typeof window.carregarMetasAnuais === 'function') window.carregarMetasAnuais();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// =========================================================================
// 10. ELIMINAÇÃO TOTAL DA PRÓPRIA CONTA
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

        const id=window.usuarioAtual?.id;
        const memberId=window.perfilAtual?.id;
        await cliente.auth.signOut();
        try {
            await window.limparFilaOfflinePropria?.(id);
            const prefix=`suiri:v7:member:${memberId}:`;
            Object.keys(localStorage).filter(k=>k.startsWith(prefix)||['suiri_perfil_ativo','suiri_familia_ativa','suiri_membros_ativos'].includes(k)).forEach(k=>localStorage.removeItem(k));
        } catch (e) { console.warn('Limpeza local pendente',e); }
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
// 11. FILA OFFLINE (ROBUSTEZ COM INDEXED-DB)
// =========================================================================
window.suiriSessaoPronta = new Promise(resolve => { window._suiriResolveSession = resolve; });
document.addEventListener('DOMContentLoaded', async () => {
    const ready=await window.verificarSessao();window._suiriResolveSession(ready);
});
if(cliente?.auth?.onAuthStateChange)cliente.auth.onAuthStateChange((event,session)=>{
    // Não aguardar chamadas Auth dentro do callback (evita deadlock do SDK).
    if(event==='PASSWORD_RECOVERY')setTimeout(()=>Suiri.openModal('modal-suiri-nova-senha'),0);
    if(event==='SIGNED_IN'&&window.usuarioAtual?.id&&session?.user?.id!==window.usuarioAtual.id)setTimeout(()=>location.reload(),0);
    if(event==='SIGNED_OUT'){
        window.usuarioAtual=null;window.perfilAtual=null;window.familiaAtualId=null;
        for(const k of ['suiri_perfil_ativo','suiri_familia_ativa','suiri_membros_ativos'])localStorage.removeItem(k);
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
        document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
        if(!Suiri.isHome)location.replace('index.html');
    }
});
