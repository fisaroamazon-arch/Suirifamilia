// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-TAMAGOTCHI.JS (100% COMPLETO E INTEGRAL)
// Mascote Tamagotchi: Gatinho Laranja Animado, Casinha Chalé,
// Pássaros e Animais no Cenário, Áudios Locais em MP3.
// =========================================================================

window.TamagotchiKids = {
    // 1. ÁUDIOS LOCAIS PRÉ-GRAVADOS DO CHUÍRI (100% OFFLINE)
    AUDIOS_LOCAIS: {
        saudacao: 'chuiri_saudacao.mp3',
        parabens: 'chuiri_parabens.mp3',
        falha: 'chuiri_consolo.mp3',
        comida: 'chuiri_delicia.mp3',
        roupa: 'chuiri_estilo.mp3',
        toque: 'chuiri_amigo.mp3'
    },

    // 2. DICAS EDUCATIVAS E CONSELHOS LOCAIS
    DICAS_VIDA: [
        "Lavar as mãos antes de comer espanta todos os monstrinhos invisíveis!",
        "Arrumar os brinquedos depois de brincar deixa o seu quarto super agradável!",
        "Quando sentir raiva ou tristeza, respirar bem fundo três vezes ajuda muito!",
        "Ajudar a mamãe e o papai em casa é a marca de um verdadeiro super-herói!",
        "Beber água mantém nossa mente brilhante e nosso corpo cheio de energia!",
        "Dizer por favor e muito obrigado abre portas mágicas pelo caminho!",
        "Escovar os dentes após cada refeição faz seu sorriso brilhar mais que uma estrela!",
        "Ler um livrinho antes de dormir traz sonhos incríveis de montão!"
    ],

    // 3. CATÁLOGOS COM ITENS EM MOEDAS MÁGICAS (100% VETORES SVG - ZERO EMOJIS)
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

    // 4. ESTADO DO CHUÍRI NO LOCALSTORAGE
    obterEstado: function() {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        const chave = `suiri_monstrinho_${idMembro}`;
        const salvo = localStorage.getItem(chave);

        if (salvo) {
            try {
                const obj = JSON.parse(salvo);
                if (!obj.nome || obj.nome === 'Tutu') obj.nome = 'Chuíri';
                if (typeof obj.moedas !== 'number') obj.moedas = 50;
                if (!Array.isArray(obj.inventario)) obj.inventario = [];
                return obj;
            } catch (e) {}
        }

        const estadoInicial = { nome: 'Chuíri', fome: 80, felicidade: 85, roupaAtual: null, moedas: 50, inventario: ['bone'] };
        this.salvarEstado(estadoInicial);
        return estadoInicial;
    },

    salvarEstado: function(estado) {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        localStorage.setItem(`suiri_monstrinho_${idMembro}`, JSON.stringify(estado));
    },

    // 5. CONTROLADOR DINÂMICO DE HORÁRIO E CLIMA (DIA, TARDE E NOITE)
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

    // 6. IDENTIFICAÇÃO DO NOME E TAREFAS PENDENTES
    obterNomeCrianca: function() {
        if (window.perfilAtual && window.perfilAtual.nome) return window.perfilAtual.nome.trim().split(' ')[0];
        const elNome = document.getElementById('nome-kids-topo') || document.getElementById('nome-membro-kids') || document.getElementById('nome-usuario-logado');
        if (elNome && elNome.textContent.trim()) return elNome.textContent.trim().split(' ')[0];
        return 'amiguinho';
    },

    obterTarefasPendentes: async function() {
        const titulos = [];
        const containerKids = document.getElementById('lista-missoes-kids-container') || document.getElementById('lista-missoes-kids');
        if (containerKids) {
            const cards = containerKids.querySelectorAll('.cartao-geral, .card-missao-kids');
            cards.forEach(card => {
                const textoCard = card.textContent || '';
                if (textoCard.includes('Concluída') || textoCard.includes('Cumprida') || textoCard.includes('Não fiz') || textoCard.includes('Feito por')) return;
                const elTitulo = card.querySelector('strong');
                if (elTitulo && elTitulo.textContent.trim()) {
                    const txt = elTitulo.textContent.trim();
                    if (!titulos.includes(txt)) titulos.push(txt);
                }
            });
        }

        if (titulos.length > 0) return titulos;
        const supabase = window.clienteSupabase || window.cliente;
        const meuId = window.perfilAtual?.id || window.usuarioAtual?.id;

        if (supabase && window.familiaAtualId) {
            try {
                const { data: missoes } = await supabase.from('missoes').select('titulo, status, atribuido_a, destinatario_kids').eq('familia_id', window.familiaAtualId).neq('status', 'concluida').neq('status', 'falhou');
                if (missoes && missoes.length > 0) {
                    missoes.forEach(m => {
                        const ehParaMim = m.atribuido_a === meuId;
                        const ehTodosKids = m.destinatario_kids === 'todos_kids' || m.atribuido_a === 'todos_kids';
                        if ((ehParaMim || ehTodosKids) && m.titulo && !titulos.includes(m.titulo.trim())) titulos.push(m.titulo.trim());
                    });
                }
            } catch (e) { console.warn("Aviso ao ler missões:", e); }
        }
        return titulos;
    },

    montarFalaDeTarefas: async function() {
        const nomeCrianca = this.obterNomeCrianca();
        const tarefas = await this.obterTarefasPendentes();
        if (tarefas.length === 0) return `Uau, ${nomeCrianca}! Aqui é o Chuíri! Você já concluiu todas as tarefas de hoje! Parabéns!`;
        if (tarefas.length === 1) return `Oi, ${nomeCrianca}! Falta só uma tarefa para você fazer hoje: ${tarefas[0]}. Vamos lá?`;
        const listaFormatada = tarefas.join(', ').replace(/, ([^,]*)$/, ' e $1');
        return `Oi, ${nomeCrianca}! Hoje ainda falta: ${listaFormatada}. Vamos fazer juntos?`;
    },

    // 7. MOTOR DE ÁUDIO
    obterAudioCtx: function() {
        if (!this._audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this._audioCtx = new AudioCtx();
        }
        if (this._audioCtx && this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    exibirBalaoFala: function(texto, duracaoSegundos = 4.5) {
        const balao = document.getElementById('balao-fala-tamagotchi');
        if (!balao) return;
        balao.textContent = texto;
        balao.style.display = 'block';
        if (this._timeoutBalao) clearTimeout(this._timeoutBalao);
        this._timeoutBalao = setTimeout(() => { balao.style.display = 'none'; }, duracaoSegundos * 1000);
    },

    tocarSomOuFala: function(tipoAudio, textoVisual) {
        this.exibirBalaoFala(textoVisual);
        if (this._instanciaAudioAtual) {
            try { this._instanciaAudioAtual.pause(); this._instanciaAudioAtual.currentTime = 0; } catch (e) {}
        }
        const arquivo = this.AUDIOS_LOCAIS[tipoAudio];
        if (arquivo) {
            const audio = new Audio(arquivo);
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

    // 8. O NOVO GATINHO (Substitui o Monstrinho)
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

    // 9. NOVA CASINHA CHALÉ
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

    // 10. INJETAR WIDGET (COM PASSARINHO E COELHO VIA CSS INLINE)
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

            <!-- BALÃO DE FALA -->
            <div id="balao-fala-tamagotchi" style="display: none; position: absolute; bottom: 110px; right: 0; width: 235px; background: #ffffff; color: #0f172a; font-size: 12px; font-weight: 700; line-height: 1.4; padding: 12px 14px; border-radius: 18px; box-shadow: 0 10px 28px rgba(0,0,0,0.22); border: 2.5px solid #10b981; pointer-events: none;"></div>
        `;

        document.body.appendChild(widget);

        document.getElementById('btn-chuiri-tamagotchi').onclick = (e) => { e.stopPropagation(); this.interagirComToque(); };
        document.getElementById('btn-casinha-tamagotchi').onclick = (e) => { e.stopPropagation(); this.abrirCasinha(); };

        this.atualizarVisual('neutro');
        this.iniciarTemporizadorCiclo();
        setTimeout(() => { this.saudarCriancaComTarefas(); }, 1200);
    },

    saudarCriancaComTarefas: async function() {
        if (!window.modoKidsAtivo) return;
        const pendentes = await this.obterTarefasPendentes();
        if (pendentes.length > 0) {
            const falaTarefas = await this.montarFalaDeTarefas();
            this.tocarSomOuFala('saudacao', falaTarefas);
        }
    },

    atualizarVisual: function(expressao = 'neutro') {
        const wrapper = document.getElementById('wrapper-corpo-tamagotchi');
        if (!wrapper) return;
        const estado = this.obterEstado();
        wrapper.innerHTML = this.gerarSvgMonstrinho(expressao, estado.roupaAtual);
    },

    // 11. INTERAÇÃO AO TOCAR
    interagirComToque: async function() {
        const btnMascote = document.getElementById('btn-chuiri-tamagotchi');
        if (btnMascote) { btnMascote.style.transform = 'scale(1.18)'; setTimeout(() => { btnMascote.style.transform = 'scale(1)'; }, 200); }
        this._contadorToques = (this._contadorToques || 0) + 1;
        let falaParaDizer = '';
        if (this._contadorToques % 2 === 1) {
            falaParaDizer = await this.montarFalaDeTarefas();
        } else {
            falaParaDizer = `Dica do Chuíri: ${this.DICAS_VIDA[Math.floor(Math.random() * this.DICAS_VIDA.length)]}`;
        }
        this.tocarSomOuFala('toque', falaParaDizer);
    },

    // 12. CELEBRAÇÃO OU CONSOLO
    aoCompletarMissao: async function(tituloTarefa) {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado);
        this.atualizarVisual('comemorando');
        const nomeCrianca = this.obterNomeCrianca();
        const nomeMissao = (typeof tituloTarefa === 'string' && tituloTarefa.trim()) ? tituloTarefa.trim() : 'uma tarefa importante';
        this.tocarSomOuFala('parabens', `Muito bem, ${nomeCrianca}! Concluiu ${nomeMissao}! Parabéns!`);
        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    aoFalharMissao: async function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado);
        this.atualizarVisual('triste');
        const nomeCrianca = this.obterNomeCrianca();
        this.tocarSomOuFala('falha', `Não fique triste, ${nomeCrianca}! O Chuíri sabe que amanhã você vai conseguir!`);
        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    // 13. CASINHA DO CHUÍRI
    abaAtualCasinha: 'geladeira',

    abrirCasinha: function() {
        const btnCasinha = document.getElementById('btn-casinha-tamagotchi');
        if (btnCasinha) { btnCasinha.style.transform = 'scale(1.2) rotate(-6deg)'; setTimeout(() => { btnCasinha.style.transform = 'scale(1)'; }, 220); }

        let modal = document.getElementById('modal-casinha-chuiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-casinha-chuiri';
            modal.className = 'modal-overlay';
            modal.style.cssText = `position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(15, 23, 42, 0.65) !important; backdrop-filter: blur(5px) !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 16px !important; box-sizing: border-box !important;`;

            modal.innerHTML = `
                <div style="width: 100%; max-width: 350px; background: #ffffff; border: 3.5px solid #f59e0b; border-radius: 28px; padding: 18px 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.25); box-sizing: border-box; animation: animacaoTransicaoJanelaSuave 0.25s ease-out;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <h3 style="margin:0; font-size:16.5px; font-weight:800; color:#b45309; display:flex; align-items:center; gap:6px;">
                                <svg class="icone-svg" style="width:18px; height:18px; color:#d97706;" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Casinha do Gatinho
                            </h3>
                            <span style="font-size:11px; color:#64748b; font-weight:700;">Seu cantinho de cuidados</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="background:#fef3c7; border:1.5px solid #fde68a; padding:4px 10px; border-radius:14px; font-size:12px; font-weight:900; color:#b45309; display:flex; align-items:center; gap:4px;">
                                <svg class="icone-svg" style="width:13px; height:13px; color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                                <span id="txt-saldo-moedas-chuiri">0</span>
                            </div>
                            <button type="button" class="btn-secundario" style="padding:4px 9px; border-radius:12px; font-weight:900; font-size:13px;" onclick="window.TamagotchiKids.fecharCasinha()">✕</button>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; background:#fffbeb; border:1.5px solid #fef3c7; padding:8px 12px; border-radius:16px; margin-bottom:12px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:10.5px; font-weight:800; color:#b45309;">
                                <span>Alimentação</span><span id="txt-barra-fome">80%</span>
                            </div>
                            <div style="height:7px; background:#fde68a; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-fome" style="height:100%; width:80%; background:#f59e0b; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:10.5px; font-weight:800; color:#047857;">
                                <span>Felicidade</span><span id="txt-barra-felicidade">85%</span>
                            </div>
                            <div style="height:7px; background:#a7f3d0; border-radius:4px; overflow:hidden; margin-top:2px;">
                                <div id="preenchimento-felicidade" style="height:100%; width:85%; background:#10b981; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; margin-bottom:14px;">
                        <button id="tab-geladeira" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:11.5px; font-weight:800; cursor:pointer; background:#fef3c7; color:#b45309; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.TamagotchiKids.mudarAbaCasinha('geladeira')">Geladeira</button>
                        <button id="tab-armario" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:11.5px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#475569; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.TamagotchiKids.mudarAbaCasinha('armario')">Armário</button>
                        <button id="tab-loja" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:11.5px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#475569; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.TamagotchiKids.mudarAbaCasinha('loja')">Lojinha</button>
                    </div>
                    <div id="corpo-conteudo-casinha" style="display:flex; flex-direction:column; gap:8px; max-height:210px; overflow-y:auto; padding-right:2px;"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        this.renderizarConteudoAba();
        modal.style.display = 'flex';
    },

    fecharCasinha: function() { const modal = document.getElementById('modal-casinha-chuiri'); if (modal) modal.style.display = 'none'; },
    
    mudarAbaCasinha: function(novaAba) {
        this.abaAtualCasinha = novaAba;
        ['geladeira', 'armario', 'loja'].forEach(aba => {
            const btn = document.getElementById(`tab-${aba}`);
            if (btn) {
                if (aba === novaAba) { btn.style.background = '#fef3c7'; btn.style.color = '#b45309'; btn.style.border = '1.5px solid #fde68a'; } 
                else { btn.style.background = '#f1f5f9'; btn.style.color = '#64748b'; btn.style.border = 'none'; }
            }
        });
        this.renderizarConteudoAba();
    },

    renderizarConteudoAba: function() {
        const estado = this.obterEstado();
        const container = document.getElementById('corpo-conteudo-casinha');
        const txtMoedas = document.getElementById('txt-saldo-moedas-chuiri');
        const barraFome = document.getElementById('preenchimento-fome');
        const barraFelicidade = document.getElementById('preenchimento-felicidade');
        
        if (txtMoedas) txtMoedas.textContent = estado.moedas || 0;
        if (barraFome) barraFome.style.width = `${estado.fome}%`;
        if (barraFelicidade) barraFelicidade.style.width = `${estado.felicidade}%`;
        
        if (!container) return;
        container.innerHTML = '';

        if (this.abaAtualCasinha === 'geladeira') {
            this.CATALOGO_COMIDAS.forEach(c => {
                const podeComprar = (estado.moedas || 0) >= c.custo;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:8px 12px; border-radius:14px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; background:#ffffff;">${c.svg}</div>
                        <div><strong style="font-size:12.5px; color:#1e293b; display:block;">${c.nome}</strong><span style="font-size:10.5px; color:#059669; font-weight:700;">+${c.nutricao}% Alimentação</span></div>
                    </div>
                    <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px; opacity:${podeComprar ? '1' : '0.4'};" ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.alimentar('${c.id}', ${c.custo}, ${c.nutricao})">Comer (${c.custo})</button>
                `;
                container.appendChild(card);
            });
        } else if (this.abaAtualCasinha === 'armario') {
            if (!estado.inventario || estado.inventario.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:22px 10px; color:#94a3b8;"><strong style="font-size:13px; color:#475569; display:block;">Guarda-roupa vazio!</strong></div>`;
                return;
            }
            estado.inventario.forEach(idItem => {
                const item = this.CATALOGO_LOJA.find(x => x.id === idItem) || { nome: idItem, svg: `<svg></svg>` };
                const emUso = estado.roupaAtual === idItem;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:8px 12px; border-radius:14px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; background:#ffffff;">${item.svg}</div>
                        <div><strong style="font-size:12.5px; color:#1e293b; display:block;">${item.nome}</strong><span style="font-size:10.5px; color:${emUso ? '#10b981' : '#64748b'}; font-weight:700;">${emUso ? 'Vestido' : 'Guardado'}</span></div>
                    </div>
                    <button type="button" class="${emUso ? 'btn-secundario' : 'btn-sucesso'}" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px;" onclick="window.TamagotchiKids.vestir('${idItem}')">${emUso ? 'Tirar' : 'Vestir'}</button>
                `;
                container.appendChild(card);
            });
        } else if (this.abaAtualCasinha === 'loja') {
            this.CATALOGO_LOJA.forEach(item => {
                const comprou = estado.inventario.includes(item.id);
                const podeComprar = (estado.moedas || 0) >= item.custo;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:8px 12px; border-radius:14px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; background:#ffffff;">${item.svg}</div>
                        <div><strong style="font-size:12.5px; color:#1e293b; display:block;">${item.nome}</strong></div>
                    </div>
                    ${comprou ? `<span style="font-size:11px; font-weight:800; color:#059669; background:#dcfce7; padding:4px 8px; border-radius:8px;">No Armário</span>` : `<button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px;" ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.comprarItem('${item.id}', ${item.custo})">Comprar (${item.custo})</button>`}
                `;
                container.appendChild(card);
            });
        }
    },

    // 14. AÇÕES DA CASINHA
    alimentar: function(idItem, custo, nutricao) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) return window.mostrarToast("Você precisa de mais moedas mágicas!", "erro");
        estado.moedas -= custo;
        estado.fome = Math.min(100, estado.fome + nutricao);
        estado.felicidade = Math.min(100, estado.felicidade + 8);
        this.salvarEstado(estado);
        if (window.SonsSuiri && typeof window.SonsSuiri.moedaXP === 'function') window.SonsSuiri.moedaXP();
        this.renderizarConteudoAba();
        this.atualizarVisual('comemorando');
        this.tocarSomOuFala('comida', `Que delícia, ${this.obterNomeCrianca()}! Minha barriguinha agradece!`);
        setTimeout(() => this.atualizarVisual('neutro'), 2500);
    },

    comprarItem: function(idItem, custo) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) return window.mostrarToast("Moedas insuficientes!", "erro");
        estado.moedas -= custo;
        if (!estado.inventario.includes(idItem)) estado.inventario.push(idItem);
        estado.roupaAtual = idItem;
        this.salvarEstado(estado);
        if (window.SonsSuiri && typeof window.SonsSuiri.moedaXP === 'function') window.SonsSuiri.moedaXP();
        this.renderizarConteudoAba();
        this.atualizarVisual('comemorando');
        this.tocarSomOuFala('roupa', `Olha como fiquei bonito, ${this.obterNomeCrianca()}! Obrigado!`);
        setTimeout(() => this.atualizarVisual('neutro'), 2500);
    },

    vestir: function(idItem) {
        const estado = this.obterEstado();
        estado.roupaAtual = (estado.roupaAtual === idItem) ? null : idItem;
        this.salvarEstado(estado);
        this.atualizarVisual('neutro');
        this.renderizarConteudoAba();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.modoKidsAtivo) window.TamagotchiKids.montarWidgetNaTela(); }, 600);
});
