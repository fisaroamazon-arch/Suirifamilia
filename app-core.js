// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-CORE.JS (100% COMPLETO E INTEGRAL)
// Núcleo de Sessão, Autenticação, Trocar Membro (Tela Cheia & Avatares Grandes),
// Login Real Oficial para Troca de Adultos com Senha de Acesso,
// Modal Nativo "Concordo / Cancelar", Transições Direcionais Inteligentes,
// Modo Kids Isolado, Ciclo Horário Automático do Cenário (Manhã / Tarde / Noite),
// Integração Mascote Tamagotchi, Gestão de Avatar, Fila Offline (IndexedDB)
// OTIMIZAÇÃO: Fast-Path LocalStorage (0 ms), Suporte iOS/Safari e Limpeza de SVGs
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
                <div class="modal-conteudo" style="max-width: 340px; text-align: center; padding: 22px 18px; border-radius: 22px; border: 1.5px solid var(--borda-delicada, rgba(217, 119, 6, 0.25)); background: #ffffff;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                        <img src="./icone/icone-escudo.png" alt="Segurança" style="width: 24px; height: 24px; object-fit: contain;">
                    </div>
                    <h3 id="titulo-confirmacao-suiri" style="margin: 0 0 6px 0; font-size: 16px; color: var(--texto-principal, #1e293b); font-weight: 800;"></h3>
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
            window.mostrarToast("Notificações Push ativadas com sucesso!");
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

window.cadastrarNovaFamiliaADM = async function({ nomeFamilia, nomeAdm, emailAdm, cpfAdm, senha, nacionalidade, genero }) {
    if (!cliente) {
        return window.mostrarToast("Configure a ligação ao Supabase no app-core.js!", "erro");
    }

    const emailLimpo = String(emailAdm || '').trim().toLowerCase();
    const cpfLimpo = window.limparCPF(cpfAdm);
    const nac = nacionalidade || 'BR';
    const gen = genero || 'Masculino';

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
        nacionalidade: nac,
        genero: gen,
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
// 4. GESTÃO DE FOTO DE PERFIL (AVATAR) E FERRAMENTA DE CROP COM CANVAS
// =========================================================================
let imagemOriginalCrop = null;
let coordsCrop = { x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false };
const MAX_DIM = 240;

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
        imagemOriginalCrop = new Image();
        imagemOriginalCrop.onload = function() {
            coordsCrop = { x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false };
            const container = document.querySelector('.crop-container');
            if (container) {
                 const rect = container.getBoundingClientRect();
                 const imgRatio = imagemOriginalCrop.width / imagemOriginalCrop.height;
                 
                 if (imgRatio > 1) {
                     coordsCrop.scale = 200 / imagemOriginalCrop.height;
                 } else {
                     coordsCrop.scale = 200 / imagemOriginalCrop.width;
                 }
                 
                 coordsCrop.x = ((rect.width || 300) - (imagemOriginalCrop.width * coordsCrop.scale)) / 2;
                 coordsCrop.y = ((rect.height || 300) - (imagemOriginalCrop.height * coordsCrop.scale)) / 2;
            }
            
            document.getElementById('modal-crop-imagem')?.classList.remove('oculto');
            desenharCanvasCrop();
        };
        imagemOriginalCrop.src = e.target.result;
    };
    leitor.readAsDataURL(file);
    evento.target.value = '';
};

function desenharCanvasCrop() {
    const canvas = document.getElementById('canvas-crop');
    if (!canvas || !imagemOriginalCrop) return;
    
    const container = document.querySelector('.crop-container') || canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 300;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaledW = imagemOriginalCrop.width * coordsCrop.scale;
    const scaledH = imagemOriginalCrop.height * coordsCrop.scale;
    
    ctx.drawImage(imagemOriginalCrop, coordsCrop.x, coordsCrop.y, scaledW, scaledH);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const maskSize = 200;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, maskSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, maskSize / 2, 0, Math.PI * 2);
    ctx.stroke();
}

function inicializarArrastoCrop() {
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;

    const startDrag = (e) => {
        coordsCrop.dragging = true;
        const pointer = e.touches ? e.touches[0] : e;
        coordsCrop.startX = pointer.clientX - coordsCrop.x;
        coordsCrop.startY = pointer.clientY - coordsCrop.y;
    };

    const drag = (e) => {
        if (!coordsCrop.dragging) return;
        e.preventDefault();
        const pointer = e.touches ? e.touches[0] : e;
        coordsCrop.x = pointer.clientX - coordsCrop.startX;
        coordsCrop.y = pointer.clientY - coordsCrop.startY;
        desenharCanvasCrop();
    };

    const endDrag = () => {
        coordsCrop.dragging = false;
    };

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
    
    canvas.addEventListener('touchstart', startDrag, { passive: false });
    canvas.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', endDrag);
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarArrastoCrop();
});

window.ajustarZoomCrop = function(delta) {
    if (!imagemOriginalCrop) return;
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;
    
    const novaScale = Math.max(0.1, coordsCrop.scale + delta);
    const centerOffsetX = (canvas.width / 2) - coordsCrop.x;
    const centerOffsetY = (canvas.height / 2) - coordsCrop.y;
    const ratio = novaScale / coordsCrop.scale;
    
    coordsCrop.x = (canvas.width / 2) - (centerOffsetX * ratio);
    coordsCrop.y = (canvas.height / 2) - (centerOffsetY * ratio);
    coordsCrop.scale = novaScale;
    desenharCanvasCrop();
};

window.fecharModalCrop = function() {
    document.getElementById('modal-crop-imagem')?.classList.add('oculto');
    imagemOriginalCrop = null;
};

window.confirmarCropImagem = async function() {
    if (!imagemOriginalCrop) return;
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;
    
    const maskSize = 200;
    const outputSize = 240; 
    
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = outputSize;
    finalCanvas.height = outputSize;
    const fCtx = finalCanvas.getContext('2d');
    
    const maskX = (canvas.width - maskSize) / 2;
    const maskY = (canvas.height - maskSize) / 2;
    const scaleRatio = outputSize / maskSize;
    
    fCtx.fillStyle = '#ffffff'; 
    fCtx.fillRect(0, 0, outputSize, outputSize);
    
    fCtx.save();
    fCtx.scale(scaleRatio, scaleRatio);
    fCtx.translate(-maskX, -maskY);
    
    const scaledW = imagemOriginalCrop.width * coordsCrop.scale;
    const scaledH = imagemOriginalCrop.height * coordsCrop.scale;
    
    fCtx.drawImage(imagemOriginalCrop, coordsCrop.x, coordsCrop.y, scaledW, scaledH);
    fCtx.restore();

    const base64Data = finalCanvas.toDataURL('image/jpeg', 0.85);
    window.fecharModalCrop();
    await window.guardarFotoPerfil(base64Data);
};

window.guardarFotoPerfil = async function(base64Data) {
    if (!window.perfilAtual || !cliente) return;

    window.mostrarToast("A atualizar foto...", "info");

    const { error } = await cliente.from('membros')
        .update({ avatar_url: base64Data })
        .eq('id', window.perfilAtual.id);

    if (error) {
        window.adicionarAFilaOffline({
            tabela: 'membros',
            tipoOperacao: 'update',
            dados: { avatar_url: base64Data },
            condicao: { id: window.perfilAtual.id }
        });
        window.mostrarToast("Sem rede. Foto guardada na Fila Offline com sucesso!", "info");
    }

    window.perfilAtual.avatar_url = base64Data;
    try {
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(window.perfilAtual));
    } catch(e) {}
    
    const imgEl = document.getElementById('img-avatar-topo');
    if (imgEl) imgEl.src = base64Data;

    const imgKids = document.getElementById('img-avatar-kids');
    if (imgKids) imgKids.src = base64Data;

    if (typeof window.renderizarMembrosFamiliaPainel === 'function') {
        window.renderizarMembrosFamiliaPainel();
    }

    if (!error) window.mostrarToast("Foto de perfil cortada e atualizada!");
};

// =========================================================================
// 5. TROCA DE PERFIL COM LOGIN OFICIAL VIA SUPABASE AUTH PARA ADULTOS
// =========================================================================
window.abrirModalSenhaAdulto = function(membro) {
    if (!membro) return;

    let modal = document.getElementById('modal-senha-adulto-suiri');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-senha-adulto-suiri';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '1000002';
        modal.innerHTML = `
            <div class="modal-conteudo" style="max-width: 320px; text-align: center; padding: 22px 18px; border-radius: 20px; border: 1.5px solid rgba(217, 119, 6, 0.25); background: #ffffff;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                    <img src="./icone/icone-porta-sair.png" alt="Acesso" style="width: 22px; height: 22px; object-fit: contain;">
                </div>
                <h3 id="titulo-modal-senha-membro" style="margin: 0 0 4px 0; font-size: 16px; color: var(--texto-principal, #1e293b); font-weight: 800;">Acesso Restrito</h3>
                <p id="subtitulo-modal-senha-membro" style="font-size: 12.5px; color: var(--texto-suave, #64748b); line-height: 1.4; margin: 0 0 14px 0;"></p>
                <input type="password" id="input-senha-membro-quiosque" placeholder="Digite sua senha de login" style="text-align: center; font-size: 15px; margin-bottom: 14px; width: 100%; box-sizing: border-box; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1;">
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-secundario" style="flex: 1; padding: 10px;" onclick="document.getElementById('modal-senha-adulto-suiri').classList.add('oculto')">Cancelar</button>
                    <button type="button" id="btn-confirmar-senha-membro" class="btn-principal" style="flex: 1; padding: 10px;">Entrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const sub = document.getElementById('subtitulo-modal-senha-membro');
    const input = document.getElementById('input-senha-membro-quiosque');
    const btnConfirmar = document.getElementById('btn-confirmar-senha-membro');

    const primeiroNome = (membro.nome || 'Adulto').split(' ')[0];
    if (sub) sub.textContent = `Acesso para ${primeiroNome}. Digite sua senha de acesso:`;
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 200);
    }

    const submeterLogin = async () => {
        const senha = input.value.trim();
        if (!senha) {
            return window.mostrarToast("Digite a sua senha de acesso.", "erro");
        }

        const emailMembro = membro.email ? membro.email.toLowerCase().trim() : '';
        if (!emailMembro) {
            return window.mostrarToast("Este perfil não possui e-mail de login cadastrado.", "erro");
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

            window.usuarioAtual = data.user;
            window.perfilAtual = membro;
            localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));

            modal.classList.add('oculto');
            window.fecharJanelaPrincipalQuiosque();
            window.aplicarRegrasPerfilKidsOuAdulto();

            if (typeof window.atualizarIconeBotaoSessao === 'function') {
                window.atualizarIconeBotaoSessao();
            }

            window.mostrarToast(`Sessão ativa para ${primeiroNome}!`);
        } catch (e) {
            console.error("Erro na autenticação de troca de adulto:", e);
            window.mostrarToast("Falha na autenticação do usuário.", "erro");
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

// =========================================================================
// 6. MOTOR "TROCAR MEMBRO & LOGOUT" COM SEPARAÇÃO ADULTOS / KIDS
// =========================================================================
window.atualizarIconeBotaoSessao = function() {
    const btnSair = document.getElementById('btn-sair-topo-app');
    const imgIcone = document.getElementById('img-icone-sessao-topo');
    if (!btnSair) return;

    const totalMembros = (window.listaMembrosFamilia || []).length;

    if (totalMembros > 1) {
        if (imgIcone) {
            imgIcone.src = './icone/trocar.png';
            imgIcone.alt = 'Trocar Perfil';
        }
        btnSair.title = 'Trocar Perfil';
    } else {
        if (imgIcone) {
            imgIcone.src = './icone/icone-porta-sair.png';
            imgIcone.alt = 'Sair do Lar';
        }
        btnSair.title = 'Sair do Lar';
    }
};

window.acionarBotaoSessaoTopo = function() {
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
        <div class="modal-conteudo modal-quiosque-tela-cheia" style="display:flex; flex-direction:column; max-height:90vh; overflow-y:auto; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--borda-delicada, #f1f5f9); padding-bottom:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="./icone/icone-familia.png" alt="Família" style="width:24px; height:24px; object-fit:contain;">
                    <h2 style="font-size:20px; color:var(--texto-principal, #1e293b); margin:0; font-weight:800;">Trocar Perfil</h2>
                </div>
                <button type="button" class="btn-secundario" style="padding:6px 12px; font-size:14px; border-radius:12px;" onclick="window.fecharJanelaPrincipalQuiosque()">✕</button>
            </div>
            
            <!-- BLOCO 1: PERFIS ADULTOS -->
            <div id="secao-quiosque-adultos" style="margin-bottom:16px;">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:var(--texto-suave, #64748b); display:block; margin-bottom:8px;">
                    👑 Perfis Adultos
                </span>
                <div id="grade-avatares-adultos" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:12px;"></div>
            </div>

            <!-- BLOCO 2: PERFIS KIDS -->
            <div id="secao-quiosque-kids" style="margin-bottom:18px;">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#10b981; display:block; margin-bottom:8px;">
                    ⭐ Perfis Kids
                </span>
                <div id="grade-avatares-kids" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:12px;"></div>
            </div>

            <!-- RODAPÉ: BOTÃO SAIR DA CONTA -->
            <div style="border-top:1.5px solid var(--borda-delicada, #f1f5f9); padding-top:14px; margin-top:auto; display:flex; flex-direction:column; gap:8px;">
                <button type="button" class="btn-erro" style="width:100%; font-size:13.5px; font-weight:800; border-radius:14px; padding:12px; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#fff1f2; color:#e11d48; border:1.5px solid #fecdd3;" onclick="window.fecharJanelaPrincipalQuiosque(); window.fazerLogoff();">
                    <img src="./icone/icone-porta-sair.png" alt="Sair" style="width:16px; height:16px; object-fit:contain;">
                    Sair da Conta
                </button>
                <button type="button" class="btn-secundario" style="width:100%; font-size:13px; font-weight:700; border-radius:14px; padding:10px;" onclick="window.fecharJanelaPrincipalQuiosque()">
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

        const avatarPadrao = (m.genero && m.genero.toLowerCase() === 'feminino') ? './icone/icone-mulher.png' : './icone/icone-escudo.png';
        const avatarSrc = m.avatar_url || avatarPadrao;
        const nomeCurto = String(m.nome || 'Membro').split(' ')[0];
        const bandeirinha = (typeof window.obterMiniBandeiraNacionalidade === 'function')
            ? window.obterMiniBandeiraNacionalidade(m.nacionalidade || 'BR')
            : '';

        card.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${avatarSrc}" class="avatar-quiosque-grande" style="width:68px; height:68px; border-radius:18px; object-fit:cover; border: 3px solid ${ehKids ? '#10b981' : 'var(--cor-primaria, #f97316)'};">
                <span style="position: absolute; bottom: 4px; right: 4px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
                    ${bandeirinha}
                </span>
            </div>
            <strong style="font-size:13px; color:var(--texto-principal, #1e293b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; margin-top:4px;">
                ${esc(nomeCurto)}
            </strong>
            <span style="font-size:10.5px; color:${ehKids ? '#15803d' : 'var(--texto-suave, #64748b)'}; font-weight:800; margin-top:2px; background:${ehKids ? '#dcfce7' : '#f1f5f9'}; padding:2px 8px; border-radius:999px;">
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
        window.aplicarRegrasPerfilKidsOuAdulto();
        if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
            window.SonsSuiri.sucessoMissao();
        }
        window.mostrarToast(`Olá, ${primeiroNome}! Suas missões estão prontas!`);
    } else {
        window.abrirModalSenhaAdulto(membro);
    }
};

window.atualizarCartaoEspacoPessoal = function() {
    const cardIntimo = document.getElementById('card-acesso-espaco-intimo');
    if (!cardIntimo) return;

    const genero = String(window.perfilAtual?.genero || '').toLowerCase();
    const titulo = document.getElementById('lbl-titulo-espaco-intimo');
    const desc = document.getElementById('lbl-desc-espaco-intimo');
    const iconeContainer = cardIntimo.querySelector('div > div');

    if (genero === 'masculino') {
        cardIntimo.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
        cardIntimo.style.border = '1.5px solid #7dd3fc';
        cardIntimo.style.boxShadow = '0 4px 12px rgba(125, 211, 252, 0.25)';
        if (iconeContainer) {
            iconeContainer.style.background = '#bae6fd';
            iconeContainer.textContent = '🔥';
        }
        if (titulo) {
            titulo.style.color = '#0369a1';
            titulo.textContent = 'Espaço Masculino';
        }
        if (desc) {
            desc.style.color = '#0284c7';
            desc.textContent = 'Performance, estoicismo, treino e garagem';
        }
        cardIntimo.onclick = function() {
            if (typeof window.abrirEspacoMasculino === 'function') {
                window.abrirEspacoMasculino();
            } else {
                window.mostrarToast("Espaço Masculino a carregar...", "info");
            }
        };
    } else {
        cardIntimo.style.background = 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)';
        cardIntimo.style.border = '1.5px solid #f0abfc';
        cardIntimo.style.boxShadow = '0 4px 12px rgba(240, 171, 252, 0.2)';
        if (iconeContainer) {
            iconeContainer.style.background = '#f5d0fe';
            iconeContainer.textContent = '🌸';
        }
        if (titulo) {
            titulo.style.color = '#86198f';
            titulo.textContent = 'Espaço Mulher';
        }
        if (desc) {
            desc.style.color = '#a21caf';
            desc.textContent = 'Ciclo, fertilidade, dicas e bem-estar';
        }
        cardIntimo.onclick = function() {
            if (typeof window.abrirEspacoMulher === 'function') {
                window.abrirEspacoMulher();
            }
        };
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
            imgKids.src = window.perfilAtual.avatar_url || './icone/icone-casa-escopo.png';
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

        document.getElementById('container-tamagotchi-kids')?.remove();
        document.getElementById('modal-tamagotchi-cuidados')?.classList.add('oculto');

        const elNomeMembro = document.getElementById('nome-membro-topo');
        if (elNomeMembro) elNomeMembro.textContent = window.perfilAtual.nome;

        const elOfensiva = document.getElementById('contador-ofensiva-topo');
        if (elOfensiva) elOfensiva.textContent = window.perfilAtual.ofensiva_atual || 0;

        const imgAvatar = document.getElementById('img-avatar-topo');
        if (imgAvatar) {
            const avatarPadrao = (window.perfilAtual.genero && window.perfilAtual.genero.toLowerCase() === 'feminino') ? './icone/icone-mulher.png' : './icone/icone-escudo.png';
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
    
    window.atualizarIconeBotaoSessao();
};

// =========================================================================
// 7. INICIALIZAÇÃO DA SESSÃO E DADOS FAMILIARES (ASSÍNCRONO OTIMIZADO)
// =========================================================================
window.iniciarAppFamilia = async function() {
    if (!window.usuarioAtual || !cliente) return;

    // 1. Liberação visual imediata: oculta login e exibe o app de pronto
    document.getElementById('tela-login')?.classList.add('oculto');
    document.getElementById('tela-app')?.classList.remove('oculto');

    // 2. Busca do membro atual
    const { data: membro, error: errMembro } = await cliente.from('membros')
        .select('*')
        .eq('id', window.usuarioAtual.id)
        .maybeSingle();

    if (errMembro || !membro) {
        window.mostrarToast("Perfil de membro não encontrado.", "erro");
        return;
    }

    if (!membro.genero) {
        membro.genero = 'Masculino';
    }

    window.perfilAtual = membro;
    window.familiaAtualId = membro.familia_id;
    try {
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));
    } catch(e) {}

    window.aplicarRegrasPerfilKidsOuAdulto();

    // 3. Consultas da família e dos membros em paralelo
    const [resFamilia, resMembros] = await Promise.all([
        cliente.from('familias').select('*').eq('id', window.familiaAtualId).single(),
        cliente.from('membros').select('*').eq('familia_id', window.familiaAtualId).order('nome')
    ]);

    window.dadosFamiliaAtual = resFamilia?.data || null;
    window.listaMembrosFamilia = resMembros?.data || [];

    try {
        if (window.dadosFamiliaAtual) {
            localStorage.setItem('suiri_familia_ativa', JSON.stringify(window.dadosFamiliaAtual));
        }
        if (window.listaMembrosFamilia.length > 0) {
            localStorage.setItem('suiri_membros_ativos', JSON.stringify(window.listaMembrosFamilia));
        }
    } catch(e) {}

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

    window.atualizarIconeBotaoSessao();

    // 4. Inicializações assíncronas dos submódulos em background
    if (typeof window.carregarListaMembrosPainel === 'function') {
        window.carregarListaMembrosPainel();
    } else if (typeof window.atualizarTodosSeletoresMembros === 'function') {
        window.atualizarTodosSeletoresMembros();
    }

    if (typeof window.iniciarModuloMissoes === 'function') window.iniciarModuloMissoes();
    if (typeof window.carregarMetasAnuais === 'function') window.carregarMetasAnuais();
    if (typeof window.carregarItensMercado === 'function') window.carregarItensMercado();
    if (typeof window.carregarCarteiraIndividual === 'function') window.carregarCarteiraIndividual();
    if (typeof window.carregarCofresCompartilhados === 'function') window.carregarCofresCompartilhados();
    if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    if (typeof window.iniciarEscutaRealtimeFamilia === 'function') window.iniciarEscutaRealtimeFamilia();
};

window.fazerLogoff = async function() {
    if (cliente) await cliente.auth.signOut();
    try {
        localStorage.removeItem('suiri_perfil_ativo');
        localStorage.removeItem('suiri_familia_ativa');
        localStorage.removeItem('suiri_membros_ativos');
    } catch(e) {}
    window.usuarioAtual = null;
    window.perfilAtual = null;
    window.familiaAtualId = null;
    window.location.reload();
};

// =========================================================================
// 8. VERIFICAÇÃO ULTRA-RÁPIDA (FAST-PATH LOCALSTORAGE / SAFARI E IOS SAFE)
// =========================================================================
window.executarFastPathVisual = function() {
    let temSessaoLocal = false;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('-auth-token') !== -1) {
                temSessaoLocal = true;
                break;
            }
        }
    } catch(e) {}

    let perfil = null;
    try {
        const perfilCache = localStorage.getItem('suiri_perfil_ativo');
        if (perfilCache) perfil = JSON.parse(perfilCache);
    } catch(e) {}

    if (temSessaoLocal && perfil) {
        window.perfilAtual = perfil;
        window.familiaAtualId = perfil.familia_id;

        try {
            const familiaCache = localStorage.getItem('suiri_familia_ativa');
            if (familiaCache) window.dadosFamiliaAtual = JSON.parse(familiaCache);

            const membrosCache = localStorage.getItem('suiri_membros_ativos');
            if (membrosCache) window.listaMembrosFamilia = JSON.parse(membrosCache);
        } catch(e) {}

        const telaLogin = document.getElementById('tela-login');
        const telaApp = document.getElementById('tela-app');
        if (telaLogin) telaLogin.classList.add('oculto');
        if (telaApp) telaApp.classList.remove('oculto');

        const elNomeFamilia = document.getElementById('nome-familia-topo');
        if (elNomeFamilia && window.dadosFamiliaAtual?.nome_familia) {
            elNomeFamilia.textContent = window.dadosFamiliaAtual.nome_familia;
        }

        window.aplicarRegrasPerfilKidsOuAdulto();
        window.atualizarIconeBotaoSessao();
        return true;
    }
    return false;
};

window.verificarSessao = async function() {
    if (!cliente) {
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
        return;
    }

    // 1. Executa restauração imediata do cache para zerar qualquer delay de interface
    window.executarFastPathVisual();

    // 2. Validação oficial na API do Supabase em background
    try {
        const { data: { session }, error } = await cliente.auth.getSession();
        if (session && session.user && !error) {
            window.usuarioAtual = session.user;
            await window.iniciarAppFamilia();
        } else {
            try {
                localStorage.removeItem('suiri_perfil_ativo');
                localStorage.removeItem('suiri_familia_ativa');
                localStorage.removeItem('suiri_membros_ativos');
            } catch(e) {}
            document.getElementById('tela-app')?.classList.add('oculto');
            document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
            document.getElementById('tela-login')?.classList.remove('oculto');
        }
    } catch (err) {
        // Se estiver offline no iPhone mas tiver perfil em cache, preserva a navegação
        if (!window.perfilAtual) {
            document.getElementById('tela-app')?.classList.add('oculto');
            document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
            document.getElementById('tela-login')?.classList.remove('oculto');
        }
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
// 11. FILA OFFLINE (ROBUSTEZ COM INDEXED-DB)
// =========================================================================
const DB_NAME = 'SuiriOfflineDB';
const STORE_NAME = 'FilaAcoes';

const idbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

window.adicionarAFilaOffline = async function(acao) {
    try {
        const db = await idbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.add({ ...acao, timestamp: Date.now() });
        window.mostrarToast("Ação guardada localmente (Modo Offline).", "info");
    } catch (e) {
        console.error("Erro na fila offline IndexedDB:", e);
    }
};

window.processarFilaOffline = async function() {
    if (!navigator.onLine || !cliente || !window.familiaAtualId) return;
    
    try {
        const db = await idbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = async () => {
            const fila = request.result;
            if (fila.length === 0) return;

            let sucessoCount = 0;
            for (const item of fila) {
                try {
                    if (item.tabela && item.dados) {
                        if (item.tipoOperacao === 'insert') {
                            await cliente.from(item.tabela).insert(item.dados);
                        } else if (item.tipoOperacao === 'update' && item.condicao) {
                            await cliente.from(item.tabela).update(item.dados).match(item.condicao);
                        }
                    }
                    const delTx = db.transaction(STORE_NAME, 'readwrite');
                    delTx.objectStore(STORE_NAME).delete(item.id);
                    sucessoCount++;
                } catch (err) {
                    console.error("Falha ao sincronizar item offline", err);
                }
            }
            if (sucessoCount > 0) {
                window.mostrarToast("Ações offline sincronizadas com sucesso!");
            }
        };
    } catch (err) {
        console.error("Erro ao processar IndexedDB offline", err);
    }
};

window.addEventListener('online', () => window.processarFilaOffline());

// Execução no primeiro milissegundo de carregamento
window.executarFastPathVisual();

document.addEventListener("DOMContentLoaded", () => {
    window.verificarSessao();
});
