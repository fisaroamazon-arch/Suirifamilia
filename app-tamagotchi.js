// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-TAMAGOTCHI.JS (100% COMPLETO E INTEGRAL)
// Mascote Tamagotchi: Gatinho Laranja Animado, Casinha Ampla Multicômodos,
// Mini-Jogo da Memória, Banho, Quarto, Cozinha, Sala e Áudios por Pastas MP3.
// =========================================================================

window.TamagotchiKids = {
    // 1. CONFIGURAÇÃO DAS PASTAS E QUANTIDADES DE ÁUDIOS MP3
    CONFIG_PASTAS_AUDIO: {
        saudacao: { pasta: 'audios/saudacao', total: 3 },
        parabens: { pasta: 'audios/parabens', total: 3 },
        falha:    { pasta: 'audios/consolo',  total: 3 },
        comida:   { pasta: 'audios/delicia',  total: 3 },
        roupa:    { pasta: 'audios/estilo',   total: 3 },
        toque:    { pasta: 'audios/amigo',    total: 10 }
    },

    // 2. CATÁLOGOS COM ITENS EM MOEDAS MÁGICAS (100% VETORES SVG - ZERO EMOJIS)
    CATALOGO_COMIDAS: [
        { id: 'maca', nome: 'Maçã Vermelhinha', custo: 2, nutricao: 25, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#ef4444;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>` },
        { id: 'leite', nome: 'Mamadeira Doce', custo: 3, nutricao: 35, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#38bdf8;" viewBox="0 0 24 24"><path d="M8 2h8v4H8z"/><path d="M6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z"/><line x1="10" y1="11" x2="14" y2="11"/><line x1="10" y1="15" x2="14" y2="15"/></svg>` },
        { id: 'banana', nome: 'Banana Feliz', custo: 2, nutricao: 20, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#f59e0b;" viewBox="0 0 24 24"><path d="M4 13c3.5-2 8-2 11.5 1 2 1.8 3.5 4.5 4.5 7-2-.5-4.5-1-6.5-2C9.5 17 6.5 15.5 4 13Z"/><path d="M5 11c1-3 3.5-6 6.5-7.5"/></svg>` },
        { id: 'suco', nome: 'Suco Mágico', custo: 4, nutricao: 40, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#10b981;" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 0 0 2-2L21 7H3l2 12a2 2 0 0 0 2 2Z"/><path d="m16 2-3 5"/><path d="M6 12h12"/></svg>` },
        { id: 'cookie', nome: 'Biscoito Estrela', custo: 5, nutricao: 50, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#d97706;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/></svg>` }
    ],

    CATALOGO_LOJA: [
        { id: 'bone', nome: 'Boné Vermelho Radical', tipo: 'roupa', custo: 6, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#ef4444;" viewBox="0 0 24 24"><path d="M4 15c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M2 15h20l-4 3H6z"/></svg>` },
        { id: 'oculos', nome: 'Óculos Estilosos', tipo: 'roupa', custo: 8, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#0f172a;" viewBox="0 0 24 24"><circle cx="6" cy="14" r="4"/><circle cx="18" cy="14" r="4"/><line x1="10" y1="14" x2="14" y2="14"/><path d="M2 12l2-4h4"/><path d="M22 12l-2-4h-4"/></svg>` },
        { id: 'coroa', nome: 'Coroa Imperial', tipo: 'roupa', custo: 12, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#f59e0b;" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>` },
        { id: 'laco', nome: 'Laço Mágico Rosa', tipo: 'roupa', custo: 7, svg: `<svg class="icone-svg" style="width:22px; height:22px; color:#ec4899;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M9 12 3 6v12l6-6Z"/><path d="m15 12 6-6v12l-6-6Z"/></svg>` }
    ],

    // 3. ESTADO DO CHUÍRI NO LOCALSTORAGE
    obterEstado: function() {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        const chave = `suiri_monstrinho_${idMembro}`;
        const salvo = localStorage.getItem(chave);

        if (salvo) {
            try {
                const obj = JSON.parse(salvo);
                if (!obj.nome || obj.nome === 'Tutu') obj.nome = 'Chuíri';
                if (typeof obj.moedas !== 'number') obj.moedas = 50;
                if (typeof obj.higiene !== 'number') obj.higiene = 90;
                if (typeof obj.energia !== 'number') obj.energia = 85;
                if (!Array.isArray(obj.inventario)) obj.inventario = [];
                return obj;
            } catch (e) {}
        }

        const estadoInicial = { nome: 'Chuíri', fome: 80, felicidade: 85, higiene: 90, energia: 85, roupaAtual: null, moedas: 50, inventario: ['bone'] };
        this.salvarEstado(estadoInicial);
        return estadoInicial;
    },

    salvarEstado: function(estado) {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        localStorage.setItem(`suiri_monstrinho_${idMembro}`, JSON.stringify(estado));
    },

    // 4. CONTROLADOR DINÂMICO DE HORÁRIO E CLIMA
    atualizarCicloHorarioClima: function() {
        if (!window.modoKidsAtivo) return;

        const agora = new Date();
        const hora = agora.getHours();
        const minutos = agora.getMinutes();
        const tempoDecimal = hora + (minutos / 60);

        const body = document.body;
        body.classList.remove('cenario-dia', 'cenario-tarde', 'cenario-noite');

        let periodo = 'dia';
        if (tempoDecimal >= 16.0 && tempoDecimal < 18.5) {
            periodo = 'tarde';
            body.classList.add('cenario-tarde');
        } else if (tempoDecimal >= 18.5 || tempoDecimal < 6.0) {
            periodo = 'noite';
            body.classList.add('cenario-noite');
        } else {
            periodo = 'dia';
            body.classList.add('cenario-dia');
        }

        this._periodoAtual = periodo;

        const janela = document.getElementById('janela-casinha-chuiri-svg');
        if (janela) {
            janela.setAttribute('fill', periodo === 'noite' ? '#fde047' : '#93c5fd');
            janela.style.filter = periodo === 'noite' ? 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))' : 'none';
        }
    },

    iniciarTemporizadorCiclo: function() {
        this.atualizarCicloHorarioClima();
        if (this._intervaloHorario) clearInterval(this._intervaloHorario);
        this._intervaloHorario = setInterval(() => { this.atualizarCicloHorarioClima(); }, 60000);
    },

    // 5. MOTOR DE ÁUDIO COM SORTEIO POR PASTAS
    obterAudioCtx: function() {
        if (!this._audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this._audioCtx = new AudioCtx();
        }
        if (this._audioCtx && this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    sortearArquivoDeAudio: function(tipoAudio) {
        const cfg = this.CONFIG_PASTAS_AUDIO[tipoAudio];
        if (!cfg) return null;
        const totalArquivos = cfg.total || 1;
        const numeroSorteado = Math.floor(Math.random() * totalArquivos) + 1;
        return `${cfg.pasta}/${numeroSorteado}.mp3`;
    },

    tocarAudio: function(tipoAudio) {
        if (this._instanciaAudioAtual) {
            try { this._instanciaAudioAtual.pause(); this._instanciaAudioAtual.currentTime = 0; } catch (e) {}
        }

        const arquivoSorteado = this.sortearArquivoDeAudio(tipoAudio);
        if (arquivoSorteado) {
            const audio = new Audio(arquivoSorteado);
            this._instanciaAudioAtual = audio;
            audio.play().catch(() => { this.tocarMelodiaMascote(); });
        } else {
            this.tocarMelodiaMascote();
        }
    },

    tocarMelodiaMascote: function() {
        try {
            const ctx = this.obterAudioCtx();
            if (!ctx) return;
            const notas = [523.25, 659.25, 783.99, 1046.50];
            notas.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
                gain.gain.setValueAtTime(0.08, ctx.currentTime + (idx * 0.08));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.08) + 0.07);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + (idx * 0.08));
                osc.stop(ctx.currentTime + (idx * 0.08) + 0.075);
            });
        } catch (e) {}
    },

    // 6. RENDERIZADOR DO GATINHO (100% SVG)
    gerarSvgMonstrinho: function(expressao, acessorio) {
        let bocaSvg = '<path d="M 45 68 Q 50 72 55 68" stroke="#78350f" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
        let olhosSvg = `
            <ellipse cx="38" cy="50" rx="4" ry="5" fill="#0f172a"/>
            <circle cx="39" cy="48" r="1.5" fill="#ffffff"/>
            <ellipse cx="62" cy="50" rx="4" ry="5" fill="#0f172a"/>
            <circle cx="63" cy="48" r="1.5" fill="#ffffff"/>
        `;

        if (expressao === 'comemorando') {
            bocaSvg = '<path d="M 44 68 Q 50 78 56 68 Z" fill="#f43f5e" stroke="#9f1239" stroke-width="1.5"/>';
            olhosSvg = `
                <path d="M 34 52 Q 38 46 42 52" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M 58 52 Q 62 46 66 52" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
            `;
        } else if (expressao === 'triste') {
            bocaSvg = '<path d="M 45 72 Q 50 68 55 72" stroke="#78350f" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
            olhosSvg = `
                <ellipse cx="38" cy="52" rx="4" ry="3" fill="#0f172a"/>
                <ellipse cx="62" cy="52" rx="4" ry="3" fill="#0f172a"/>
                <circle cx="38" cy="55" r="2" fill="#38bdf8"/>
                <circle cx="62" cy="55" r="2" fill="#38bdf8"/>
            `;
        } else if (expressao === 'dormindo') {
            bocaSvg = '<ellipse cx="50" cy="70" rx="3" ry="2" fill="#78350f"/>';
            olhosSvg = `
                <path d="M 34 52 Q 38 56 42 52" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <path d="M 58 52 Q 62 56 66 52" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            `;
        }

        let camadaAcessorio = '';
        if (acessorio === 'bone') {
            camadaAcessorio = '<path d="M 24 28 Q 50 12 76 28 L 90 32 L 76 34 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2.5"/>';
        } else if (acessorio === 'oculos') {
            camadaAcessorio = `
                <rect x="28" y="44" width="18" height="13" rx="4" fill="rgba(15,23,42,0.85)" stroke="#0f172a" stroke-width="2"/>
                <rect x="54" y="44" width="18" height="13" rx="4" fill="rgba(15,23,42,0.85)" stroke="#0f172a" stroke-width="2"/>
                <line x1="46" y1="50" x2="54" y2="50" stroke="#0f172a" stroke-width="3"/>
            `;
        } else if (acessorio === 'coroa') {
            camadaAcessorio = `
                <polygon points="32,28 38,14 50,22 62,14 68,28" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/>
                <circle cx="50" cy="18" r="2.5" fill="#ef4444"/>
            `;
        } else if (acessorio === 'laco') {
            camadaAcessorio = `
                <polygon points="40,20 48,28 40,36" fill="#ec4899"/>
                <polygon points="60,20 52,28 60,36" fill="#ec4899"/>
                <circle cx="50" cy="28" r="4.5" fill="#f43f5e"/>
            `;
        }

        return `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25));">
                <!-- Rabinho -->
                <path d="M 70 80 Q 90 80 85 55" fill="none" stroke="#ea580c" stroke-width="6" stroke-linecap="round"/>
                
                <!-- Orelhas -->
                <polygon points="25,45 18,15 45,35" fill="#ea580c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round"/>
                <polygon points="75,45 82,15 55,35" fill="#ea580c" stroke="#c2410c" stroke-width="2" stroke-linejoin="round"/>
                <polygon points="26,42 21,22 41,36" fill="#fef3c7" />
                <polygon points="74,42 79,22 59,36" fill="#fef3c7" />

                <!-- Corpo Gatinho -->
                <rect x="22" y="30" width="56" height="60" rx="28" fill="#fb923c" stroke="#c2410c" stroke-width="2.5"/>
                <ellipse cx="50" cy="72" rx="18" ry="14" fill="#fef3c7"/>
                
                <!-- Focinho e Bigodes -->
                <polygon points="48,60 52,60 50,63" fill="#f43f5e" />
                <line x1="12" y1="56" x2="26" y2="58" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="12" y1="62" x2="26" y2="62" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="88" y1="56" x2="74" y2="58" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="88" y1="62" x2="74" y2="62" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
                
                ${olhosSvg}
                ${bocaSvg}
                ${camadaAcessorio}
            </svg>
        `;
    },

    // 7. CASINHA CHALÉ EXTERNA (100% SVG)
    gerarSvgCasinha: function() {
        return `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 8px 15px rgba(0,0,0,0.3));">
                <!-- Chaminé -->
                <rect x="68" y="15" width="14" height="28" fill="#991b1b" rx="2"/>
                <path d="M 65 15 h 20 v 5 h -20 z" fill="#7f1d1d" rx="1"/>
                <circle cx="75" cy="5" r="4.5" fill="#ffffff" opacity="0.65"/>
                
                <!-- Corpo de Madeira -->
                <rect x="15" y="45" width="70" height="45" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
                <line x1="15" y1="60" x2="85" y2="60" stroke="#fde68a" stroke-width="1.5"/>
                <line x1="15" y1="75" x2="85" y2="75" stroke="#fde68a" stroke-width="1.5"/>
                
                <!-- Porta Detalhada -->
                <path d="M 40 90 v -25 a 10 10 0 0 1 20 0 v 25 z" fill="#8b5cf6" stroke="#5b21b6" stroke-width="2"/>
                <circle cx="56" cy="76" r="2.5" fill="#fbbf24"/>
                
                <!-- Telhado Chalé -->
                <polygon points="50,15 5,50 95,50" fill="#ea580c" stroke="#9a3412" stroke-width="3" stroke-linejoin="round"/>
                
                <!-- Janela Redonda Mágica -->
                <circle cx="50" cy="38" r="9" fill="#b45309" />
                <circle id="janela-casinha-chuiri-svg" cx="50" cy="38" r="6" fill="#93c5fd" />
                <line x1="44" y1="38" x2="56" y2="38" stroke="#b45309" stroke-width="2"/>
                <line x1="50" y1="32" x2="50" y2="44" stroke="#b45309" stroke-width="2"/>
            </svg>
        `;
    },

    // 8. INJETAR WIDGET DO CHUÍRI NO CANTO DA TELA
    montarWidgetNaTela: function() {
        if (!window.modoKidsAtivo) {
            document.getElementById('container-tamagotchi-kids')?.remove();
            return;
        }

        if (document.getElementById('container-tamagotchi-kids')) return;

        const widget = document.createElement('div');
        widget.id = 'container-tamagotchi-kids';
        widget.style.cssText = `
            position: fixed; bottom: 18px; right: 14px;
            display: flex; align-items: flex-end; gap: 12px;
            z-index: 999; user-select: none; -webkit-tap-highlight-color: transparent;
        `;

        widget.innerHTML = `
            <!-- ESTILOS DAS ANIMAÇÕES DOS ANIMAIS -->
            <style>
                @keyframes vooPassaro {
                    0% { transform: translateX(120vw) translateY(0) scale(0.6); }
                    50% { transform: translateX(50vw) translateY(-20px) scale(0.6); }
                    100% { transform: translateX(-20vw) translateY(0) scale(0.6); }
                }
                @keyframes puloCoelho {
                    0% { transform: translateX(110vw) translateY(0) scale(0.6); }
                    15% { transform: translateX(90vw) translateY(-15px) scale(0.6); }
                    30% { transform: translateX(70vw) translateY(0) scale(0.6); }
                    45% { transform: translateX(50vw) translateY(-15px) scale(0.6); }
                    60% { transform: translateX(30vw) translateY(0) scale(0.6); }
                    75% { transform: translateX(10vw) translateY(-15px) scale(0.6); }
                    100% { transform: translateX(-20vw) translateY(0) scale(0.6); }
                }
                .passaro-animado {
                    position: fixed; top: 25vh; right: -50px; opacity: 0.8;
                    animation: vooPassaro 18s linear infinite; pointer-events: none;
                }
                .coelho-animado {
                    position: fixed; bottom: 15vh; right: -50px;
                    animation: puloCoelho 22s linear infinite; pointer-events: none;
                }
            </style>

            <!-- ANIMAIS DO CENÁRIO -->
            <svg class="passaro-animado" width="30" height="20" viewBox="0 0 24 24" fill="#334155"><path d="M22 6s-4 4-10 4-10-4-10-4 4 6 10 6 10-6 10-6z"/></svg>
            <svg class="coelho-animado" width="35" height="35" viewBox="0 0 24 24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"><path d="M12 22a8 8 0 0 1-8-8c0-3 3-5 5-8 1-2 2-3 4-3s3 1 4 3c2 3 5 5 5 8a8 8 0 0 1-8 8Z"/><circle cx="10" cy="12" r="1" fill="#475569"/><circle cx="16" cy="12" r="1" fill="#475569"/></svg>

            <!-- CASINHA CHALÉ (160px) -->
            <div id="btn-casinha-tamagotchi" title="Casinha do Chuíri" style="width: 160px; height: 160px; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
                ${this.gerarSvgCasinha()}
            </div>

            <!-- MASCOTE GATINHO (80px) -->
            <div id="btn-chuiri-tamagotchi" title="Falar com o Chuíri" style="width: 80px; height: 80px; cursor: pointer; position: relative; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div id="wrapper-corpo-tamagotchi" style="width:100%; height:100%; animation: floatMascote 2.8s infinite ease-in-out;"></div>
            </div>
        `;

        document.body.appendChild(widget);

        document.getElementById('btn-chuiri-tamagotchi').onclick = (e) => { e.stopPropagation(); this.interagirComToque(); };
        document.getElementById('btn-casinha-tamagotchi').onclick = (e) => { e.stopPropagation(); this.abrirCasinha(); };

        this.atualizarVisual('neutro');
        this.iniciarTemporizadorCiclo();
        setTimeout(() => { this.saudarCrianca(); }, 1200);
    },

    saudarCrianca: function() {
        if (!window.modoKidsAtivo) return;
        this.tocarAudio('saudacao');
    },

    atualizarVisual: function(expressao = 'neutro') {
        const wrapper = document.getElementById('wrapper-corpo-tamagotchi');
        if (!wrapper) return;
        const estado = this.obterEstado();
        wrapper.innerHTML = this.gerarSvgMonstrinho(expressao, estado.roupaAtual);
    },

    // 9. INTERAÇÃO AO TOCAR
    interagirComToque: function() {
        const btnMascote = document.getElementById('btn-chuiri-tamagotchi');
        if (btnMascote) { 
            btnMascote.style.transform = 'scale(1.18)'; 
            setTimeout(() => { btnMascote.style.transform = 'scale(1)'; }, 200); 
        }
        this.tocarAudio('toque');
    },

    // 10. CELEBRAÇÃO OU CONSOLO
    aoCompletarMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado);
        this.atualizarVisual('comemorando');
        this.tocarAudio('parabens');
        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    aoFalharMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado);
        this.atualizarVisual('triste');
        this.tocarAudio('falha');
        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    // 11. NOVA CASINHA DINÂMICA AMPLA COM 5 CÔMODOS
    comodoAtual: 'quarto',
    luzApagadaQuarto: false,

    abrirCasinha: function() {
        const btnCasinha = document.getElementById('btn-casinha-tamagotchi');
        if (btnCasinha) { 
            btnCasinha.style.transform = 'scale(1.15) rotate(-5deg)'; 
            setTimeout(() => { btnCasinha.style.transform = 'scale(1)'; }, 220); 
        }

        let modal = document.getElementById('modal-casinha-chuiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-casinha-chuiri';
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed !important; top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: rgba(15, 23, 42, 0.78) !important; backdrop-filter: blur(8px) !important;
                z-index: 9999999 !important; display: flex !important; align-items: center !important;
                justify-content: center !important; padding: 12px !important; box-sizing: border-box !important;
            `;

            modal.innerHTML = `
                <div style="width: 100%; max-width: 440px; height: 92vh; max-height: 680px; background: #ffffff; border: 3.5px solid #f59e0b; border-radius: 30px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.35); box-sizing: border-box; animation: animacaoTransicaoJanelaSuave 0.25s ease-out;">
                    
                    <!-- CABEÇALHO DA CASINHA -->
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; background: #fffbeb; border-bottom: 2px solid #fef3c7;">
                        <div>
                            <h3 id="titulo-comodo-topo" style="margin:0; font-size:16px; font-weight:800; color:#b45309; display:flex; align-items:center; gap:6px;">
                                <svg class="icone-svg" style="width:18px; height:18px; color:#d97706;" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Casinha do Chuíri
                            </h3>
                            <span id="subtitulo-comodo-topo" style="font-size:11px; color:#64748b; font-weight:700;">Quarto do Gatinho</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="background:#fef3c7; border:1.5px solid #fde68a; padding:4px 10px; border-radius:14px; font-size:12px; font-weight:900; color:#b45309; display:flex; align-items:center; gap:4px;">
                                <svg class="icone-svg" style="width:13px; height:13px; color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                                <span id="txt-saldo-moedas-chuiri">0</span>
                            </div>
                            <button type="button" class="btn-secundario" style="padding:4px 9px; border-radius:12px; font-weight:900; font-size:13px;" onclick="window.TamagotchiKids.fecharCasinha()">✕</button>
                        </div>
                    </div>

                    <!-- BARRAS DE STATUS DO MASCOTE -->
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; background:#fffbeb; padding: 6px 14px 10px 14px; border-bottom: 1.5px solid #fef3c7;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#b45309;">
                                <span>Fome</span><span id="txt-barra-fome">80%</span>
                            </div>
                            <div style="height:5px; background:#fde68a; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-fome" style="height:100%; width:80%; background:#f59e0b; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#047857;">
                                <span>Alegria</span><span id="txt-barra-felicidade">85%</span>
                            </div>
                            <div style="height:5px; background:#a7f3d0; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-felicidade" style="height:100%; width:85%; background:#10b981; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#0284c7;">
                                <span>Banho</span><span id="txt-barra-higiene">90%</span>
                            </div>
                            <div style="height:5px; background:#bae6fd; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-higiene" style="height:100%; width:90%; background:#38bdf8; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#7c3aed;">
                                <span>Soneca</span><span id="txt-barra-energia">85%</span>
                            </div>
                            <div style="height:5px; background:#ddd6fe; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-energia" style="height:100%; width:85%; background:#8b5cf6; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- ÁREA PRINCIPAL DO CÔMODO COM O CHUÍRI -->
                    <div id="cenario-comodo-chuiri" style="flex: 1.1; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 8px; overflow: hidden; background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 60%, #cbd5e1 100%);">
                        <div id="decoracao-cenario-fundo" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></div>
                        <div id="chuiri-palco-casa" style="width: 140px; height: 140px; z-index: 10; cursor: pointer; transition: transform 0.2s ease;"></div>
                    </div>

                    <!-- PAINEL INTERATIVO DO CÔMODO (AÇÕES, ITENS, JOGO) -->
                    <div id="painel-acoes-comodo" style="flex: 1; background: #ffffff; padding: 10px 14px; overflow-y: auto; border-top: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;"></div>

                    <!-- BARRA DE NAVEGAÇÃO DOS 5 CÔMODOS -->
                    <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:4px; padding: 8px 10px; background:#f8fafc; border-top: 1.5px solid #e2e8f0;">
                        <button type="button" id="tab-comodo-quarto" class="btn-comodo" style="padding:6px 2px; border:none; border-radius:12px; font-size:10px; font-weight:800; cursor:pointer; background:#fef3c7; color:#b45309; display:flex; flex-direction:column; align-items:center; gap:2px;" onclick="window.TamagotchiKids.mudarComodo('quarto')">
                            <svg class="icone-svg" style="width:16px; height:16px;" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                            Quarto
                        </button>
                        <button type="button" id="tab-comodo-sala" class="btn-comodo" style="padding:6px 2px; border:none; border-radius:12px; font-size:10px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#64748b; display:flex; flex-direction:column; align-items:center; gap:2px;" onclick="window.TamagotchiKids.mudarComodo('sala')">
                            <svg class="icone-svg" style="width:16px; height:16px;" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                            Sala
                        </button>
                        <button type="button" id="tab-comodo-cozinha" class="btn-comodo" style="padding:6px 2px; border:none; border-radius:12px; font-size:10px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#64748b; display:flex; flex-direction:column; align-items:center; gap:2px;" onclick="window.TamagotchiKids.mudarComodo('cozinha')">
                            <svg class="icone-svg" style="width:16px; height:16px;" viewBox="0 0 24 24"><path d="M18 2v20"/><path d="M18 8a3 3 0 0 0 0-6"/><path d="M6 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2"/><path d="M9 12v10"/></svg>
                            Cozinha
                        </button>
                        <button type="button" id="tab-comodo-banheiro" class="btn-comodo" style="padding:6px 2px; border:none; border-radius:12px; font-size:10px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#64748b; display:flex; flex-direction:column; align-items:center; gap:2px;" onclick="window.TamagotchiKids.mudarComodo('banheiro')">
                            <svg class="icone-svg" style="width:16px; height:16px;" viewBox="0 0 24 24"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.67 3 4 3.67 4 4.5v15a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V13a2 2 0 0 0-2-2h-7Z"/></svg>
                            Banho
                        </button>
                        <button type="button" id="tab-comodo-loja" class="btn-comodo" style="padding:6px 2px; border:none; border-radius:12px; font-size:10px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#64748b; display:flex; flex-direction:column; align-items:center; gap:2px;" onclick="window.TamagotchiKids.mudarComodo('loja')">
                            <svg class="icone-svg" style="width:16px; height:16px;" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                            Loja
                        </button>
                    </div>

                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('chuiri-palco-casa').onclick = () => {
                const el = document.getElementById('chuiri-palco-casa');
                if (el) { el.style.transform = 'scale(1.2)'; setTimeout(() => { el.style.transform = 'scale(1)'; }, 200); }
                this.tocarAudio('toque');
            };
        }

        this.mudarComodo(this.comodoAtual || 'quarto');
        modal.style.display = 'flex';
    },

    fecharCasinha: function() { 
        const modal = document.getElementById('modal-casinha-chuiri'); 
        if (modal) modal.style.display = 'none'; 
    },

    mudarComodo: function(novoComodo) {
        this.comodoAtual = novoComodo;
        ['quarto', 'sala', 'cozinha', 'banheiro', 'loja'].forEach(comodo => {
            const btn = document.getElementById(`tab-comodo-${comodo}`);
            if (btn) {
                if (comodo === novoComodo) {
                    btn.style.background = '#fef3c7'; btn.style.color = '#b45309'; btn.style.border = '1.5px solid #fde68a';
                } else {
                    btn.style.background = '#f1f5f9'; btn.style.color = '#64748b'; btn.style.border = 'none';
                }
            }
        });

        const subTitulos = {
            quarto: 'Quarto & Guarda-Roupa',
            sala: 'Sala de Mini-Jogos (Memória)',
            cozinha: 'Cozinha & Geladeira Mágica',
            banheiro: 'Banheiro & Chuveirinho',
            loja: 'Lojinha de Novidades'
        };

        const elSub = document.getElementById('subtitulo-comodo-topo');
        if (elSub) elSub.textContent = subTitulos[novoComodo] || 'Casinha';

        this.renderizarCenarioComodo();
        this.renderizarPainelAcoes();
    },

    atualizarBarrasStatus: function() {
        const estado = this.obterEstado();
        const txtMoedas = document.getElementById('txt-saldo-moedas-chuiri');
        const bFome = document.getElementById('preenchimento-fome');
        const bFeliz = document.getElementById('preenchimento-felicidade');
        const bHigiene = document.getElementById('preenchimento-higiene');
        const bEnergia = document.getElementById('preenchimento-energia');

        if (txtMoedas) txtMoedas.textContent = estado.moedas || 0;
        if (bFome) { bFome.style.width = `${estado.fome}%`; document.getElementById('txt-barra-fome').textContent = `${estado.fome}%`; }
        if (bFeliz) { bFeliz.style.width = `${estado.felicidade}%`; document.getElementById('txt-barra-felicidade').textContent = `${estado.felicidade}%`; }
        if (bHigiene) { bHigiene.style.width = `${estado.higiene}%`; document.getElementById('txt-barra-higiene').textContent = `${estado.higiene}%`; }
        if (bEnergia) { bEnergia.style.width = `${estado.energia}%`; document.getElementById('txt-barra-energia').textContent = `${estado.energia}%`; }
    },

    renderizarCenarioComodo: function() {
        this.atualizarBarrasStatus();
        const palco = document.getElementById('chuiri-palco-casa');
        const cenario = document.getElementById('cenario-comodo-chuiri');
        const decor = document.getElementById('decoracao-cenario-fundo');
        const estado = this.obterEstado();

        if (palco) {
            const expr = (this.comodoAtual === 'quarto' && this.luzApagadaQuarto) ? 'dormindo' : 'neutro';
            palco.innerHTML = this.gerarSvgMonstrinho(expr, estado.roupaAtual);
        }

        if (!cenario || !decor) return;

        if (this.comodoAtual === 'quarto') {
            cenario.style.background = this.luzApagadaQuarto ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 70%, #0f172a 100%)' : 'linear-gradient(180deg, #fbcfe8 0%, #f472b6 60%, #e2e8f0 100%)';
            decor.innerHTML = `
                <!-- Cama de Madeira com Travesseiro -->
                <div style="position:absolute; bottom:0; left:10px; width:120px; height:50px; background:#fef3c7; border:3px solid #b45309; border-radius:12px 12px 0 0;">
                    <div style="width:30px; height:18px; background:#ffffff; border-radius:6px; margin:6px 0 0 8px; border:1.5px solid #cbd5e1;"></div>
                    <div style="position:absolute; bottom:0; width:100%; height:25px; background:#ec4899; border-top:2px solid #be185d;"></div>
                </div>
                <!-- Janela do Quarto -->
                <div style="position:absolute; top:20px; right:20px; width:55px; height:55px; border-radius:50%; background:${this.luzApagadaQuarto ? '#1e293b' : '#fef08a'}; border:3px solid #b45309; box-shadow:0 0 12px rgba(253,224,71,0.5);"></div>
            `;
        } else if (this.comodoAtual === 'sala') {
            cenario.style.background = 'linear-gradient(180deg, #fed7aa 0%, #fb923c 60%, #e2e8f0 100%)';
            decor.innerHTML = `
                <!-- Sofá e Quadro de Jogos -->
                <div style="position:absolute; bottom:0; right:15px; width:110px; height:50px; background:#38bdf8; border:3px solid #0284c7; border-radius:14px 14px 0 0;"></div>
                <div style="position:absolute; top:18px; left:25px; width:65px; height:45px; background:#ffffff; border:3px solid #b45309; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                    <svg class="icone-svg" style="width:24px; height:24px; color:#f59e0b;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
            `;
        } else if (this.comodoAtual === 'cozinha') {
            cenario.style.background = 'linear-gradient(180deg, #bbf7d0 0%, #86efac 60%, #cbd5e1 100%)';
            decor.innerHTML = `
                <!-- Geladeira Branca Elegante -->
                <div style="position:absolute; bottom:0; left:18px; width:75px; height:120px; background:#ffffff; border:3px solid #94a3b8; border-radius:14px 14px 0 0; padding:6px; box-sizing:border-box;">
                    <div style="width:6px; height:22px; background:#64748b; border-radius:3px; position:absolute; right:8px; top:35px;"></div>
                    <div style="width:6px; height:26px; background:#64748b; border-radius:3px; position:absolute; right:8px; top:65px;"></div>
                    <div style="width:100%; height:2px; background:#e2e8f0; position:absolute; top:55px; left:0;"></div>
                </div>
            `;
        } else if (this.comodoAtual === 'banheiro') {
            cenario.style.background = 'linear-gradient(180deg, #bae6fd 0%, #7dd3fc 60%, #e2e8f0 100%)';
            decor.innerHTML = `
                <!-- Banheira com Espuma -->
                <div style="position:absolute; bottom:0; width:170px; height:55px; background:#ffffff; border:3.5px solid #0284c7; border-radius: 0 0 28px 28px;">
                    <div style="position:absolute; top:-12px; left:15px; display:flex; gap:6px;">
                        <div style="width:22px; height:22px; border-radius:50%; background:#e0f2fe; border:2px solid #bae6fd;"></div>
                        <div style="width:18px; height:18px; border-radius:50%; background:#e0f2fe; border:2px solid #bae6fd;"></div>
                        <div style="width:25px; height:25px; border-radius:50%; background:#e0f2fe; border:2px solid #bae6fd;"></div>
                    </div>
                </div>
                <!-- Chuveiro Superior -->
                <div style="position:absolute; top:12px; right:25px;">
                    <svg class="icone-svg" style="width:34px; height:34px; color:#0284c7;" viewBox="0 0 24 24"><path d="M4 4h7a4 4 0 0 1 4 4v12"/><path d="M12 14l6 6"/><circle cx="15" cy="8" r="2"/></svg>
                </div>
            `;
        } else if (this.comodoAtual === 'loja') {
            cenario.style.background = 'linear-gradient(180deg, #fef08a 0%, #fde047 60%, #cbd5e1 100%)';
            decor.innerHTML = `
                <!-- Prateleiras da Loja -->
                <div style="position:absolute; top:25px; width:80%; height:6px; background:#b45309; border-radius:3px;"></div>
                <div style="position:absolute; top:65px; width:80%; height:6px; background:#b45309; border-radius:3px;"></div>
            `;
        }
    },

    renderizarPainelAcoes: function() {
        const container = document.getElementById('painel-acoes-comodo');
        if (!container) return;
        container.innerHTML = '';
        const estado = this.obterEstado();

        // 1. QUARTO: ABAJUR & ARMARIO DE ROUPAS
        if (this.comodoAtual === 'quarto') {
            const barraAcao = document.createElement('div');
            barraAcao.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#fffbeb; padding:8px 12px; border-radius:14px; border:1.5px solid #fde68a; margin-bottom:6px;';
            barraAcao.innerHTML = `
                <div>
                    <strong style="font-size:12.5px; color:#b45309; display:block;">Abajur do Quarto</strong>
                    <span style="font-size:10.5px; color:#64748b;">${this.luzApagadaQuarto ? 'O Chuíri está dormindo zZz...' : 'Apague a luz para ele descansar'}</span>
                </div>
                <button type="button" class="btn-principal" style="width:auto; padding:6px 14px; font-size:11px;" onclick="window.TamagotchiKids.alternarLuzQuarto()">
                    ${this.luzApagadaQuarto ? 'Acender Luz ☀️' : 'Dormir 🌙'}
                </button>
            `;
            container.appendChild(barraAcao);

            const cabecalhoArmario = document.createElement('div');
            cabecalhoArmario.innerHTML = `<span style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase;">Guarda-Roupa do Chuíri</span>`;
            container.appendChild(cabecalhoArmario);

            if (!estado.inventario || estado.inventario.length === 0) {
                container.innerHTML += `<div style="text-align:center; padding:15px; color:#94a3b8;"><strong style="font-size:12px;">Seu armário está vazio! Visite a Lojinha.</strong></div>`;
                return;
            }

            estado.inventario.forEach(idItem => {
                const item = this.CATALOGO_LOJA.find(x => x.id === idItem) || { nome: idItem, svg: `<svg></svg>` };
                const emUso = estado.roupaAtual === idItem;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:6px 10px; border-radius:12px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:#ffffff;">${item.svg}</div>
                        <div><strong style="font-size:12px; color:#1e293b;">${item.nome}</strong></div>
                    </div>
                    <button type="button" class="${emUso ? 'btn-secundario' : 'btn-sucesso'}" style="padding:5px 12px; font-size:10.5px; font-weight:900; border-radius:8px;" onclick="window.TamagotchiKids.vestir('${idItem}')">${emUso ? 'Tirar' : 'Vestir'}</button>
                `;
                container.appendChild(card);
            });
        }

        // 2. SALA: MINI-JOGO DA MEMÓRIA
        else if (this.comodoAtual === 'sala') {
            const cardJogo = document.createElement('div');
            cardJogo.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div>
                        <strong style="font-size:13px; color:#b45309; display:block;">Jogo da Memória Divertido</strong>
                        <span style="font-size:10.5px; color:#64748b;">Encontre os pares para ganhar moedas!</span>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px;" onclick="window.TamagotchiKids.iniciarJogoMemoria()">Reiniciar</button>
                </div>
                <div id="grade-jogo-memoria" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px;"></div>
            `;
            container.appendChild(cardJogo);
            this.iniciarJogoMemoria();
        }

        // 3. COZINHA: GELADEIRA
        else if (this.comodoAtual === 'cozinha') {
            this.CATALOGO_COMIDAS.forEach(c => {
                const podeComprar = (estado.moedas || 0) >= c.custo;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:6px 10px; border-radius:12px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:#ffffff;">${c.svg}</div>
                        <div>
                            <strong style="font-size:12px; color:#1e293b; display:block;">${c.nome}</strong>
                            <span style="font-size:10px; color:#059669; font-weight:700;">+${c.nutricao}% Alimentação</span>
                        </div>
                    </div>
                    <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:10.5px; font-weight:900; border-radius:10px; opacity:${podeComprar ? '1' : '0.4'};" ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.alimentar('${c.id}', ${c.custo}, ${c.nutricao})">Comer (${c.custo})</button>
                `;
                container.appendChild(card);
            });
        }

        // 4. BANHEIRO: SABONETE E CHUVEIRINHO
        else if (this.comodoAtual === 'banheiro') {
            const cardBanho = document.createElement('div');
            cardBanho.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
            cardBanho.innerHTML = `
                <div style="background:#f0fdf4; border:1.5px solid #bbf7d0; padding:10px 12px; border-radius:14px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:32px; height:32px; border-radius:8px; background:#ffffff; display:flex; align-items:center; justify-content:center;">
                            <svg class="icone-svg" style="width:20px; height:20px; color:#10b981;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
                        </div>
                        <div>
                            <strong style="font-size:12.5px; color:#15803d; display:block;">Esponjinha & Sabão</strong>
                            <span style="font-size:10px; color:#64748b;">Ensaboe o Chuíri para tirar a sujeira</span>
                        </div>
                    </div>
                    <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11px;" onclick="window.TamagotchiKids.darBanho('sabonete')">Ensaboar</button>
                </div>

                <div style="background:#f0f9ff; border:1.5px solid #bae6fd; padding:10px 12px; border-radius:14px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:32px; height:32px; border-radius:8px; background:#ffffff; display:flex; align-items:center; justify-content:center;">
                            <svg class="icone-svg" style="width:20px; height:20px; color:#0284c7;" viewBox="0 0 24 24"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/></svg>
                        </div>
                        <div>
                            <strong style="font-size:12.5px; color:#0369a1; display:block;">Chuveirinho Refrescante</strong>
                            <span style="font-size:10px; color:#64748b;">Enxague para deixá-lo perfumado</span>
                        </div>
                    </div>
                    <button type="button" class="btn-principal" style="padding:6px 12px; font-size:11px; width:auto;" onclick="window.TamagotchiKids.darBanho('enxague')">Enxaguar</button>
                </div>
            `;
            container.appendChild(cardBanho);
        }

        // 5. LOJINHA: COMPRA DE ACESSÓRIOS
        else if (this.comodoAtual === 'loja') {
            this.CATALOGO_LOJA.forEach(item => {
                const comprou = estado.inventario.includes(item.id);
                const podeComprar = (estado.moedas || 0) >= item.custo;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:6px 10px; border-radius:12px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:#ffffff;">${item.svg}</div>
                        <div><strong style="font-size:12px; color:#1e293b;">${item.nome}</strong></div>
                    </div>
                    ${comprou ? `<span style="font-size:10.5px; font-weight:800; color:#059669; background:#dcfce7; padding:4px 8px; border-radius:8px;">No Armário</span>` : `<button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:10.5px; font-weight:900; border-radius:10px;" ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.comprarItem('${item.id}', ${item.custo})">Comprar (${item.custo})</button>`}
                `;
                container.appendChild(card);
            });
        }
    },

    // 12. AÇÕES DO QUARTO & BANHO
    alternarLuzQuarto: function() {
        this.luzApagadaQuarto = !this.luzApagadaQuarto;
        const estado = this.obterEstado();
        if (this.luzApagadaQuarto) {
            estado.energia = Math.min(100, estado.energia + 25);
            this.salvarEstado(estado);
        }
        this.renderizarCenarioComodo();
        this.renderizarPainelAcoes();
    },

    darBanho: function(tipo) {
        const estado = this.obterEstado();
        if (tipo === 'sabonete') {
            estado.higiene = Math.min(100, estado.higiene + 10);
            this.salvarEstado(estado);
            const palco = document.getElementById('chuiri-palco-casa');
            if (palco) {
                palco.style.transform = 'scale(1.15) rotate(4deg)';
                setTimeout(() => { palco.style.transform = 'scale(1)'; }, 200);
            }
        } else {
            estado.higiene = 100;
            estado.felicidade = Math.min(100, estado.felicidade + 5);
            this.salvarEstado(estado);
            this.tocarAudio('parabens');
        }
        this.atualizarBarrasStatus();
        this.renderizarCenarioComodo();
    },

    // 13. MINI-JOGO DA MEMÓRIA
    _cartasMemoria: [],
    _cartasViradas: [],
    _paresEncontrados: 0,

    iniciarJogoMemoria: function() {
        const grade = document.getElementById('grade-jogo-memoria');
        if (!grade) return;
        grade.innerHTML = '';
        this._cartasViradas = [];
        this._paresEncontrados = 0;

        // 4 pares de ícones SVG do Suiri
        const icones = [
            { id: 'estrela', svg: `<svg class="icone-svg" style="color:#f59e0b;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
            { id: 'maca', svg: `<svg class="icone-svg" style="color:#ef4444;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>` },
            { id: 'coroa', svg: `<svg class="icone-svg" style="color:#d97706;" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>` },
            { id: 'coracao', svg: `<svg class="icone-svg" style="color:#ec4899;" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>` }
        ];

        let baralho = [...icones, ...icones];
        baralho.sort(() => Math.random() - 0.5);
        this._cartasMemoria = baralho;

        baralho.forEach((carta, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `carta-memoria-${index}`;
            btn.style.cssText = 'height: 52px; background:#f1f5f9; border:2px solid #cbd5e1; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform 0.2s;';
            btn.innerHTML = `<span style="font-size:16px; color:#94a3b8; font-weight:800;">?</span>`;
            btn.onclick = () => this.virarCarta(index);
            grade.appendChild(btn);
        });
    },

    virarCarta: function(index) {
        if (this._cartasViradas.length >= 2) return;
        const btn = document.getElementById(`carta-memoria-${index}`);
        if (!btn || btn.getAttribute('data-revelada') === 'true') return;

        const carta = this._cartasMemoria[index];
        btn.innerHTML = carta.svg;
        btn.style.background = '#ffffff';
        btn.style.borderColor = '#38bdf8';
        btn.setAttribute('data-revelada', 'true');
        this._cartasViradas.push({ index, id: carta.id });

        if (this._cartasViradas.length === 2) {
            const [c1, c2] = this._cartasViradas;
            if (c1.id === c2.id) {
                this._paresEncontrados++;
                this._cartasViradas = [];
                if (this._paresEncontrados === 4) {
                    setTimeout(() => {
                        const estado = this.obterEstado();
                        estado.moedas = (estado.moedas || 0) + 10;
                        estado.felicidade = Math.min(100, estado.felicidade + 15);
                        this.salvarEstado(estado);
                        this.atualizarBarrasStatus();
                        this.tocarAudio('parabens');
                        window.mostrarToast("Sensacional! Você ganhou +10 Moedas!", "sucesso");
                    }, 400);
                }
            } else {
                setTimeout(() => {
                    const btn1 = document.getElementById(`carta-memoria-${c1.index}`);
                    const btn2 = document.getElementById(`carta-memoria-${c2.index}`);
                    if (btn1) { btn1.innerHTML = `<span style="font-size:16px; color:#94a3b8; font-weight:800;">?</span>`; btn1.style.background = '#f1f5f9'; btn1.style.borderColor = '#cbd5e1'; btn1.removeAttribute('data-revelada'); }
                    if (btn2) { btn2.innerHTML = `<span style="font-size:16px; color:#94a3b8; font-weight:800;">?</span>`; btn2.style.background = '#f1f5f9'; btn2.style.borderColor = '#cbd5e1'; btn2.removeAttribute('data-revelada'); }
                    this._cartasViradas = [];
                }, 800);
            }
        }
    },

    // 14. AÇÕES DE ALIMENTAÇÃO E COMPRA
    alimentar: function(idItem, custo, nutricao) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) return window.mostrarToast("Você precisa de mais moedas mágicas!", "erro");
        estado.moedas -= custo;
        estado.fome = Math.min(100, estado.fome + nutricao);
        estado.felicidade = Math.min(100, estado.felicidade + 8);
        this.salvarEstado(estado);
        if (window.SonsSuiri && typeof window.SonsSuiri.moedaXP === 'function') window.SonsSuiri.moedaXP();
        this.renderizarCenarioComodo();
        this.renderizarPainelAcoes();
        this.tocarAudio('comida');
    },

    comprarItem: function(idItem, custo) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) return window.mostrarToast("Moedas insuficientes!", "erro");
        estado.moedas -= custo;
        if (!estado.inventario.includes(idItem)) estado.inventario.push(idItem);
        estado.roupaAtual = idItem;
        this.salvarEstado(estado);
        if (window.SonsSuiri && typeof window.SonsSuiri.moedaXP === 'function') window.SonsSuiri.moedaXP();
        this.renderizarCenarioComodo();
        this.renderizarPainelAcoes();
        this.tocarAudio('roupa');
    },

    vestir: function(idItem) {
        const estado = this.obterEstado();
        estado.roupaAtual = (estado.roupaAtual === idItem) ? null : idItem;
        this.salvarEstado(estado);
        this.renderizarCenarioComodo();
        this.renderizarPainelAcoes();
        this.tocarAudio('roupa');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.modoKidsAtivo) window.TamagotchiKids.montarWidgetNaTela(); }, 600);
});
