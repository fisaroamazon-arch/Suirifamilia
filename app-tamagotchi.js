// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-TAMAGOTCHI.JS (100% COMPLETO E INTEGRAL)
// Mascote Tamagotchi Chuíri: Leitura Real de Missões Pendentes e Nome,
// Elogio Exclusivo ao Concluir Tarefas, Silêncio Inteligente ao Entrar,
// Controlador de Clima & Horário (Dia, Tarde e Noite) no Cenário Vivo,
// Voz Gemini TTS + Pitch Cartum e Casinha em Destaque com Moedas Mágicas
// =========================================================================

window.TamagotchiKids = {
    // 1. SUA CHAVE OFICIAL DO GOOGLE AI STUDIO
    GEMINI_API_KEY: 'AQ.Ab8RN6KnLr3mPnGZTeyFo1T1vP2WYNxOpvi1xHRIzwqwA7QcUA',

    // Ajuste de afinação de personagem (1.0 = voz normal, 1.15 a 1.22 = voz fofa de desenho animado)
    TOM_PERSONAGEM_INFANTIL: 1.16,

    // 2. DICAS EDUCATIVAS E CONSELHOS EXTRAS
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

    // 3. CATÁLOGOS COM ITENS BARATINHOS (EM MOEDAS MÁGICAS, NÃO GASTA XP)
    CATALOGO_COMIDAS: [
        { id: 'maca', nome: 'Maçã Vermelhinha', custo: 2, nutricao: 25, icone: '🍎' },
        { id: 'leite', nome: 'Mamadeira Doce', custo: 3, nutricao: 35, icone: '🥛' },
        { id: 'banana', nome: 'Banadinha Feliz', custo: 2, nutricao: 20, icone: '🍌' },
        { id: 'suco', nome: 'Suco Mágico', custo: 4, nutricao: 40, icone: '🧃' },
        { id: 'cookie', nome: 'Biscoito Estrela', custo: 5, nutricao: 50, icone: '🍪' }
    ],

    CATALOGO_LOJA: [
        { id: 'bone', nome: 'Boné Vermelho Radical', tipo: 'roupa', custo: 6, icone: '🧢' },
        { id: 'oculos', nome: 'Óculos Estilosos', tipo: 'roupa', custo: 8, icone: '🕶️' },
        { id: 'coroa', nome: 'Coroa Real Imperial', tipo: 'roupa', custo: 12, icone: '👑' },
        { id: 'laco', nome: 'Laço Mágico Rosa', tipo: 'roupa', custo: 7, icone: '🎀' }
    ],

    // 4. RECUPERAR OU INICIALIZAR ESTADO DO CHUÍRI
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

        const estadoInicial = {
            nome: 'Chuíri',
            fome: 80,
            felicidade: 85,
            roupaAtual: null,
            moedas: 50,
            inventario: ['bone']
        };
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
        // Fim de Tarde / Pôr do Sol: das 16:00 às 18:29
        if (tempoDecimal >= 16.0 && tempoDecimal < 18.5) {
            periodo = 'tarde';
            body.classList.add('cenario-tarde');
        } 
        // Noite estrelada com luar: das 18:30 às 05:59
        else if (tempoDecimal >= 18.5 || tempoDecimal < 6.0) {
            periodo = 'noite';
            body.classList.add('cenario-noite');
        } 
        // Dia ensolarado com céu azul: das 06:00 às 15:59
        else {
            periodo = 'dia';
            body.classList.add('cenario-dia');
        }

        this._periodoAtual = periodo;

        // Atualiza a janelinha da casinha (acende à noite)
        const janela = document.getElementById('janela-casinha-chuiri-svg');
        if (janela) {
            janela.setAttribute('fill', periodo === 'noite' ? '#fde047' : '#60a5fa');
            janela.style.filter = periodo === 'noite' ? 'drop-shadow(0 0 6px rgba(253, 224, 71, 0.9))' : 'none';
        }
    },

    iniciarTemporizadorCiclo: function() {
        this.atualizarCicloHorarioClima();
        if (this._intervaloHorario) clearInterval(this._intervaloHorario);
        this._intervaloHorario = setInterval(() => {
            this.atualizarCicloHorarioClima();
        }, 60000); // Reavalia a cada 1 minuto
    },

    // 6. IDENTIFICAR NOME DA CRIANÇA E LOCALIZAR AS TAREFAS QUE FALTAM FAZER
    obterNomeCrianca: function() {
        if (window.perfilAtual && window.perfilAtual.nome) {
            return window.perfilAtual.nome.trim().split(' ')[0];
        }
        const elNome = document.getElementById('nome-kids-topo') || document.getElementById('nome-usuario-logado');
        if (elNome && elNome.textContent.trim()) {
            return elNome.textContent.trim().split(' ')[0];
        }
        return 'amiguinho';
    },

    obterTarefasPendentes: async function() {
        const titulos = [];

        // 1º Tenta ler dos cartões da tela Kids (Container oficial: #lista-missoes-kids-container)
        const containerKids = document.getElementById('lista-missoes-kids-container') || document.getElementById('lista-missoes-kids');
        if (containerKids) {
            const cards = containerKids.querySelectorAll('.cartao-geral, .card-missao-kids');
            cards.forEach(card => {
                const textoCard = card.textContent || '';
                // Ignora tarefas concluídas, falhadas ou cumpridas por outra criança
                if (textoCard.includes('Concluída') || textoCard.includes('Não feita') || textoCard.includes('Feita primeiro por')) {
                    return;
                }

                const elTitulo = card.querySelector('strong');
                if (elTitulo && elTitulo.textContent.trim()) {
                    const txt = elTitulo.textContent.trim();
                    if (!titulos.includes(txt)) titulos.push(txt);
                }
            });
        }

        if (titulos.length > 0) return titulos;

        // 2º Se a tela ainda estiver carregando, consulta a tabela oficial "missoes" no Supabase
        const supabase = window.clienteSupabase || window.cliente;
        const meuId = window.perfilAtual?.id || window.usuarioAtual?.id;

        if (supabase && window.familiaAtualId) {
            try {
                const { data: missoes } = await supabase
                    .from('missoes')
                    .select('titulo, status, atribuido_a, destinatario_kids')
                    .eq('familia_id', window.familiaAtualId)
                    .neq('status', 'concluida')
                    .neq('status', 'falhou');

                if (missoes && missoes.length > 0) {
                    missoes.forEach(m => {
                        const ehParaMim = m.atribuido_a === meuId;
                        const ehTodosKids = m.destinatario_kids === 'todos_kids' || m.atribuido_a === 'todos_kids';
                        if ((ehParaMim || ehTodosKids) && m.titulo) {
                            if (!titulos.includes(m.titulo.trim())) {
                                titulos.push(m.titulo.trim());
                            }
                        }
                    });
                }
            } catch (e) {
                console.warn("Aviso ao ler missões no banco para o Chuíri:", e);
            }
        }

        return titulos;
    },

    // Monta a frase identificando exatamente o que falta (nunca cita tarefas já concluídas)
    montarFalaDeTarefas: async function() {
        const nomeCrianca = this.obterNomeCrianca();
        const tarefas = await this.obterTarefasPendentes();

        if (tarefas.length === 0) {
            return `Uau ${nomeCrianca}! Aqui é o Chuíri! Você já concluiu todas as tarefas de hoje! Você é sensacional!`;
        }

        if (tarefas.length === 1) {
            return `Oi ${nomeCrianca}! Aqui é o Chuíri! Hoje falta só uma tarefa para você fazer: ${tarefas[0]}. Vamos lá?`;
        }

        const listaFormatada = tarefas.join(', ').replace(/, ([^,]*)$/, ' e $1');
        return `Oi ${nomeCrianca}! Aqui é o Chuíri! Ah, hoje falta: ${listaFormatada}. Vamos fazer juntos?`;
    },

    // 7. CONTEXTO DE ÁUDIO WEB AUDIO API
    obterAudioCtx: function() {
        if (!this._audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this._audioCtx = new AudioCtx({ sampleRate: 24000 });
        }
        if (this._audioCtx && this._audioCtx.state === 'suspended') {
            this._audioCtx.resume();
        }
        return this._audioCtx;
    },

    // 8. GERAÇÃO DINÂMICA DE FRASES PERSONALIZADAS COM GEMINI 2.5 FLASH
    gerarFalaComIA: async function(situacao) {
        const nomeCrianca = this.obterNomeCrianca();
        const estado = this.obterEstado();
        const nomeMascote = estado.nome || 'Chuíri';
        const tarefas = await this.obterTarefasPendentes();

        const contextoTarefas = tarefas.length > 0
            ? `A criança ainda tem estas tarefas pendentes hoje: ${tarefas.join(', ')}.`
            : `A criança já concluiu todas as tarefas de hoje!`;

        if (!this.GEMINI_API_KEY || !navigator.onLine) {
            return await this.montarFalaDeTarefas();
        }

        const prompt = `Você é o ${nomeMascote}, um monstrinho mascote infantil super alegre e melhor amigo do(a) ${nomeCrianca}.
Contexto de tarefas pendentes: ${contextoTarefas}
Situação atual: ${situacao}.
Gere uma fala curta em português do Brasil (máximo 24 palavras), carinhosa e animada, chamando o(a) ${nomeCrianca} pelo nome e citando exatamente as tarefas que faltam fazer (exemplo: "Oi Yeshua, hoje falta..."). Não use emojis nem asteriscos.`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const textoGerado = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textoGerado) return textoGerado.trim().replace(/^["']|["']$/g, '');
            }
        } catch (e) {
            console.warn("Erro ao gerar frase com Gemini:", e);
        }

        return await this.montarFalaDeTarefas();
    },

    // 9. MOTOR DE VOZ: O BALÃO SÓ APARECE QUANDO O SOM COMEÇA A TOCAR
    exibirBalaoFala: function(texto, duracaoSegundos = 6) {
        const balao = document.getElementById('balao-fala-tamagotchi');
        if (!balao) return;

        balao.textContent = texto;
        balao.style.display = 'block';

        if (this._timeoutBalao) clearTimeout(this._timeoutBalao);
        this._timeoutBalao = setTimeout(() => {
            balao.style.display = 'none';
        }, (duracaoSegundos + 1.2) * 1000);
    },

    falar: async function(texto) {
        if (!texto) return;

        this.obterAudioCtx();

        // Oculta balão anterior enquanto o som é gerado
        const balao = document.getElementById('balao-fala-tamagotchi');
        if (balao) balao.style.display = 'none';

        if (this.GEMINI_API_KEY && navigator.onLine) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.GEMINI_API_KEY}`;

                const payload = {
                    contents: [{
                        parts: [{
                            text: `Atue como o Chuíri, um mascote de desenho animado infantil super fofo, sorridente, agudo, saltitante e cheio de energia positiva! Fale exatamente este texto em português do Brasil com muita emoção infantil: "${texto}"`
                        }]
                    }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: "Leda"
                                }
                            }
                        }
                    }
                };

                const resposta = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': this.GEMINI_API_KEY
                    },
                    body: JSON.stringify(payload)
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    const part = dados?.candidates?.[0]?.content?.parts?.[0];
                    const audioBase64 = part?.inlineData?.data;

                    if (audioBase64) {
                        this.tocarPCM24kBase64(audioBase64, texto);
                        return;
                    }
                } else {
                    const erroTxt = await resposta.text();
                    console.warn("Detalhe da resposta Gemini TTS:", erroTxt);
                }
            } catch (err) {
                console.warn("Falha de conexão com Gemini TTS:", err);
            }
        }

        this.tocarMelodiaMascote(texto);
    },

    tocarPCM24kBase64: function(base64Data, textoOriginal) {
        try {
            const ctx = this.obterAudioCtx();
            if (!ctx) return;

            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const int16Data = new Int16Array(bytes.buffer);
            const float32Data = new Float32Array(int16Data.length);

            for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
            }

            const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            if (this._fonteAtual) {
                try { this._fonteAtual.stop(); } catch (e) {}
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;

            const taxaVelocidade = this.TOM_PERSONAGEM_INFANTIL || 1.16;
            source.playbackRate.value = taxaVelocidade;

            const filtroBrilho = ctx.createBiquadFilter();
            filtroBrilho.type = 'highshelf';
            filtroBrilho.frequency.value = 3200;
            filtroBrilho.gain.value = 3.5;

            source.connect(filtroBrilho);
            filtroBrilho.connect(ctx.destination);

            // Inicia a voz
            source.start(0);
            this._fonteAtual = source;

            // O BALÃO APARECE NO MOMENTO EXATO EM QUE A VOZ COMEÇA
            const duracaoReal = audioBuffer.duration / taxaVelocidade;
            this.exibirBalaoFala(textoOriginal, duracaoReal);

        } catch (e) {
            console.error("Erro ao reproduzir PCM 24kHz do Gemini:", e);
            this.tocarMelodiaMascote(textoOriginal);
        }
    },

    tocarMelodiaMascote: function(texto) {
        try {
            const ctx = this.obterAudioCtx();
            if (!ctx) return;

            const numNotas = Math.min(12, Math.max(4, Math.floor(texto.length / 5)));
            const notas = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

            this.exibirBalaoFala(texto, (numNotas * 0.08) + 3);

            for (let i = 0; i < numNotas; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(notas[Math.floor(Math.random() * notas.length)], ctx.currentTime + i * 0.075);

                gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.075);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.075 + 0.065);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + i * 0.075);
                osc.stop(ctx.currentTime + i * 0.075 + 0.07);
            }
        } catch (e) {}
    },

    // 10. RENDERIZADOR DO CHUÍRI EM VETOR SVG PURO (GRANDE E VIVO)
    gerarSvgMonstrinho: function(expressao, acessorio) {
        let bocaSvg = '<path d="M 40 70 Q 50 82 60 70" stroke="#064e3b" stroke-width="4" stroke-linecap="round" fill="#047857"/>';
        let olhosSvg = `
            <ellipse cx="38" cy="46" rx="6.5" ry="8" fill="#ffffff"/>
            <circle cx="39" cy="46" r="4.2" fill="#0f172a"/>
            <circle cx="41" cy="43" r="1.8" fill="#ffffff"/>
            <ellipse cx="62" cy="46" rx="6.5" ry="8" fill="#ffffff"/>
            <circle cx="63" cy="46" r="4.2" fill="#0f172a"/>
            <circle cx="65" cy="43" r="1.8" fill="#ffffff"/>
        `;

        if (expressao === 'comemorando') {
            bocaSvg = '<path d="M 37 68 Q 50 88 63 68 Z" fill="#b91c1c" stroke="#064e3b" stroke-width="3.5"/>';
            olhosSvg = `
                <path d="M 32 48 Q 38 40 44 48" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
                <path d="M 56 48 Q 62 40 68 48" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
            `;
        } else if (expressao === 'triste') {
            bocaSvg = '<path d="M 42 75 Q 50 67 58 75" stroke="#064e3b" stroke-width="4" stroke-linecap="round" fill="none"/>';
            olhosSvg = `
                <circle cx="38" cy="48" r="4.5" fill="#0f172a"/>
                <circle cx="62" cy="48" r="4.5" fill="#0f172a"/>
                <path d="M 64 54 C 64 58 60 61 60 63 C 60 65 62 67 64 67 C 66 67 68 65 68 63 C 68 61 64 58 64 54 Z" fill="#38bdf8"/>
            `;
        }

        let camadaAcessorio = '';
        if (acessorio === 'bone') {
            camadaAcessorio = '<path d="M 24 24 Q 50 8 76 24 L 90 28 L 76 30 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2.5"/>';
        } else if (acessorio === 'oculos') {
            camadaAcessorio = `
                <rect x="28" y="40" width="18" height="13" rx="4" fill="rgba(15,23,42,0.85)" stroke="#0f172a" stroke-width="2"/>
                <rect x="54" y="40" width="18" height="13" rx="4" fill="rgba(15,23,42,0.85)" stroke="#0f172a" stroke-width="2"/>
                <line x1="46" y1="46" x2="54" y2="46" stroke="#0f172a" stroke-width="3"/>
            `;
        } else if (acessorio === 'coroa') {
            camadaAcessorio = `
                <polygon points="32,24 38,10 50,18 62,10 68,24" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/>
                <circle cx="50" cy="14" r="2.5" fill="#ef4444"/>
            `;
        } else if (acessorio === 'laco') {
            camadaAcessorio = `
                <polygon points="40,16 48,24 40,32" fill="#ec4899"/>
                <polygon points="60,16 52,24 60,32" fill="#ec4899"/>
                <circle cx="50" cy="24" r="4.5" fill="#f43f5e"/>
            `;
        }

        return `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 6px 14px rgba(16,185,129,0.4));">
                <defs>
                    <linearGradient id="gradMonstrinhoChuiri" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#34d399"/>
                        <stop offset="100%" stop-color="#059669"/>
                    </linearGradient>
                </defs>
                <polygon points="30,28 35,10 42,24" fill="#fbbf24" stroke="#d97706" stroke-width="2.5" stroke-linejoin="round"/>
                <polygon points="70,28 65,10 58,24" fill="#fbbf24" stroke="#d97706" stroke-width="2.5" stroke-linejoin="round"/>
                <rect x="20" y="22" width="60" height="66" rx="30" fill="url(#gradMonstrinhoChuiri)" stroke="#047857" stroke-width="3"/>
                <ellipse cx="50" cy="62" rx="20" ry="18" fill="#a7f3d0"/>
                <circle cx="28" cy="54" r="5" fill="#f472b6" opacity="0.65"/>
                <circle cx="72" cy="54" r="5" fill="#f472b6" opacity="0.65"/>
                ${olhosSvg}
                ${bocaSvg}
                ${camadaAcessorio}
            </svg>
        `;
    },

    // 11. SVG DA CASINHA GRANDE COM CHAMINÉ E JANELINHA DINÂMICA
    gerarSvgCasinha: function() {
        return `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 8px 18px rgba(245, 158, 11, 0.45));">
                <rect x="22" y="16" width="11" height="20" fill="#d97706" rx="2"/>
                <circle cx="27" cy="11" r="3.5" fill="#ffffff" opacity="0.8"/>
                <circle cx="29" cy="5" r="4.5" fill="#ffffff" opacity="0.6"/>
                <polygon points="50,12 8,48 92,48" fill="#f59e0b" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/>
                <rect x="18" y="46" width="64" height="48" rx="10" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
                <rect x="37" y="58" width="26" height="36" rx="6" fill="#b45309"/>
                <circle cx="43" cy="76" r="2.5" fill="#fbbf24"/>
                <circle id="janela-casinha-chuiri-svg" cx="50" cy="32" r="7.5" fill="#60a5fa" stroke="#ffffff" stroke-width="2.5"/>
            </svg>
        `;
    },

    // 12. INJETAR O CONTAINER FLUTUANTE NA TELA KIDS
    montarWidgetNaTela: function() {
        if (!window.modoKidsAtivo) {
            document.getElementById('container-tamagotchi-kids')?.remove();
            return;
        }

        if (document.getElementById('container-tamagotchi-kids')) return;

        const widget = document.createElement('div');
        widget.id = 'container-tamagotchi-kids';
        widget.style.cssText = `
            position: fixed;
            bottom: 18px;
            right: 14px;
            display: flex;
            align-items: flex-end;
            gap: 12px;
            z-index: 999;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        `;

        widget.innerHTML = `
            <!-- BOTÃO DA CASINHA GRANDE DO CHUÍRI -->
            <div id="btn-casinha-tamagotchi" title="Casinha do Chuíri" style="
                width: 78px;
                height: 78px;
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                ${this.gerarSvgCasinha()}
            </div>

            <!-- MASCOTE CHUÍRI GRANDE -->
            <div id="btn-chuiri-tamagotchi" title="Falar com o Chuíri" style="
                width: 86px;
                height: 86px;
                cursor: pointer;
                position: relative;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <div id="wrapper-corpo-tamagotchi" style="width:100%; height:100%; animation: floatMascote 2.8s infinite ease-in-out;"></div>
            </div>

            <!-- BALÃO DE FALA -->
            <div id="balao-fala-tamagotchi" style="
                display: none;
                position: absolute;
                bottom: 96px;
                right: 0;
                width: 230px;
                background: #ffffff;
                color: #0f172a;
                font-size: 12px;
                font-weight: 700;
                line-height: 1.4;
                padding: 12px 14px;
                border-radius: 18px;
                box-shadow: 0 10px 28px rgba(0,0,0,0.22);
                border: 2.5px solid #10b981;
                pointer-events: none;
            "></div>
        `;

        document.body.appendChild(widget);

        document.getElementById('btn-chuiri-tamagotchi').onclick = (e) => {
            e.stopPropagation();
            this.interagirComToque();
        };

        document.getElementById('btn-casinha-tamagotchi').onclick = (e) => {
            e.stopPropagation();
            this.abrirCasinha();
        };

        this.atualizarVisual('neutro');
        this.iniciarTemporizadorCiclo();

        // Saudação inteligente ao entrar: SÓ FALA SE TIVER TAREFAS PENDENTES
        setTimeout(() => {
            this.saudarCriancaComTarefas();
        }, 1200);
    },

    // SILÊNCIO INTELIGENTE AO ENTRAR: NÃO FALA SE AS TAREFAS JÁ ESTIVEREM FEITAS!
    saudarCriancaComTarefas: async function() {
        if (!window.modoKidsAtivo) return;
        const pendentes = await this.obterTarefasPendentes();
        if (pendentes.length > 0) {
            const falaTarefas = await this.montarFalaDeTarefas();
            this.falar(falaTarefas);
        }
    },

    atualizarVisual: function(expressao = 'neutro') {
        const wrapper = document.getElementById('wrapper-corpo-tamagotchi');
        if (!wrapper) return;

        const estado = this.obterEstado();
        wrapper.innerHTML = this.gerarSvgMonstrinho(expressao, estado.roupaAtual);
    },

    // 13. INTERAÇÃO AO TOCAR NO CHUÍRI (LÊ AS TAREFAS QUE FALTAM OU DÁ DICAS)
    interagirComToque: async function() {
        this.obterAudioCtx();

        const btnMascote = document.getElementById('btn-chuiri-tamagotchi');
        if (btnMascote) {
            btnMascote.style.transform = 'scale(1.18)';
            setTimeout(() => { btnMascote.style.transform = 'scale(1)'; }, 200);
        }

        this._contadorToques = (this._contadorToques || 0) + 1;

        let falaParaDizer = '';
        if (this._contadorToques % 2 === 1) {
            falaParaDizer = await this.montarFalaDeTarefas();
        } else {
            falaParaDizer = await this.gerarFalaComIA("A criança tocou em você! Lembre com carinho o que falta fazer hoje.");
        }

        this.falar(falaParaDizer);
    },

    // 14. RECONHECIMENTO ESPECÍFICO E ELOGIO DE TAREFA CONCLUÍDA
    aoCompletarMissao: async function(tituloTarefa) {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado);

        this.atualizarVisual('comemorando');

        const nomeCrianca = this.obterNomeCrianca();
        let nomeMissao = '';

        if (typeof tituloTarefa === 'string' && tituloTarefa.trim()) {
            nomeMissao = tituloTarefa.trim();
        } else {
            nomeMissao = 'uma tarefa incrível';
        }

        const elogio = `Nossa ${nomeCrianca}, você acabou de concluir ${nomeMissao}! Parabéns, estou muito orgulhoso!`;
        this.falar(elogio);

        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    aoFalharMissao: async function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado);

        this.atualizarVisual('triste');
        const nomeCrianca = this.obterNomeCrianca();
        const fala = `Oh ${nomeCrianca}, não fique triste! O Chuíri sabe que amanhã você vai conseguir fazer essa tarefa!`;
        this.falar(fala);

        setTimeout(() => this.atualizarVisual('neutro'), 3800);
    },

    // 15. A CASINHA DO CHUÍRI (GELADEIRA, ARMÁRIO E LOJINHA)
    abaAtualCasinha: 'geladeira',

    abrirCasinha: function() {
        this.obterAudioCtx();
        const btnCasinha = document.getElementById('btn-casinha-tamagotchi');
        if (btnCasinha) {
            btnCasinha.style.transform = 'scale(1.2) rotate(-6deg)';
            setTimeout(() => { btnCasinha.style.transform = 'scale(1)'; }, 220);
        }

        let modal = document.getElementById('modal-casinha-chuiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-casinha-chuiri';
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(15, 23, 42, 0.65) !important;
                backdrop-filter: blur(5px) !important;
                z-index: 9999999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 16px !important;
                box-sizing: border-box !important;
            `;

            modal.innerHTML = `
                <div style="
                    width: 100%;
                    max-width: 350px;
                    background: #ffffff;
                    border: 3.5px solid #f59e0b;
                    border-radius: 28px;
                    padding: 18px 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
                    box-sizing: border-box;
                    animation: animacaoTransicaoJanelaSuave 0.25s ease-out;
                ">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <h3 style="margin:0; font-size:16.5px; font-weight:800; color:#b45309;">🏠 Casinha do Chuíri</h3>
                            <span style="font-size:11px; color:#64748b; font-weight:700;">Seu cantinho de cuidados</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="background:#fef3c7; border:1.5px solid #fde68a; padding:4px 10px; border-radius:14px; font-size:12.5px; font-weight:900; color:#b45309;">
                                🟡 <span id="txt-saldo-moedas-chuiri">0</span>
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
                        <button id="tab-geladeira" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:12px; font-weight:800; cursor:pointer; background:#fef3c7; color:#b45309;" onclick="window.TamagotchiKids.mudarAbaCasinha('geladeira')">
                            🧊 Geladeira
                        </button>
                        <button id="tab-armario" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:12px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#475569;" onclick="window.TamagotchiKids.mudarAbaCasinha('armario')">
                            🚪 Armário
                        </button>
                        <button id="tab-loja" type="button" style="flex:1; padding:8px 4px; border:none; border-radius:14px; font-size:12px; font-weight:800; cursor:pointer; background:#f1f5f9; color:#475569;" onclick="window.TamagotchiKids.mudarAbaCasinha('loja')">
                            🛍️ Lojinha
                        </button>
                    </div>

                    <div id="corpo-conteudo-casinha" style="display:flex; flex-direction:column; gap:8px; max-height:210px; overflow-y:auto; padding-right:2px;"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.renderizarConteudoAba();
        modal.style.display = 'flex';
    },

    fecharCasinha: function() {
        const modal = document.getElementById('modal-casinha-chuiri');
        if (modal) modal.style.display = 'none';
    },

    mudarAbaCasinha: function(novaAba) {
        this.abaAtualCasinha = novaAba;
        ['geladeira', 'armario', 'loja'].forEach(aba => {
            const btn = document.getElementById(`tab-${aba}`);
            if (btn) {
                if (aba === novaAba) {
                    btn.style.background = '#fef3c7';
                    btn.style.color = '#b45309';
                    btn.style.border = '1.5px solid #fde68a';
                } else {
                    btn.style.background = '#f1f5f9';
                    btn.style.color = '#64748b';
                    btn.style.border = 'none';
                }
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
        const txtFome = document.getElementById('txt-barra-fome');
        const txtFelicidade = document.getElementById('txt-barra-felicidade');

        if (txtMoedas) txtMoedas.textContent = estado.moedas || 0;
        if (barraFome) barraFome.style.width = `${estado.fome}%`;
        if (barraFelicidade) barraFelicidade.style.width = `${estado.felicidade}%`;
        if (txtFome) txtFome.textContent = `${estado.fome}%`;
        if (txtFelicidade) txtFelicidade.textContent = `${estado.felicidade}%`;

        if (!container) return;
        container.innerHTML = '';

        if (this.abaAtualCasinha === 'geladeira') {
            this.CATALOGO_COMIDAS.forEach(c => {
                const podeComprar = (estado.moedas || 0) >= c.custo;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:8px 12px; border-radius:14px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px;">${c.icone}</span>
                        <div>
                            <strong style="font-size:12.5px; color:#1e293b; display:block;">${c.nome}</strong>
                            <span style="font-size:10.5px; color:#059669; font-weight:700;">+${c.nutricao}% Alimentação</span>
                        </div>
                    </div>
                    <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px; opacity:${podeComprar ? '1' : '0.4'};"
                        ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.alimentar('${c.id}', ${c.custo}, ${c.nutricao})">
                        Comer (🟡${c.custo})
                    </button>
                `;
                container.appendChild(card);
            });
        } else if (this.abaAtualCasinha === 'armario') {
            if (!estado.inventario || estado.inventario.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:22px 10px; color:#94a3b8;">
                        <span style="font-size:32px; display:block; margin-bottom:6px;">🚪</span>
                        <strong style="font-size:13px; color:#475569;">Guarda-roupa vazio!</strong>
                        <p style="font-size:11px; margin:4px 0 0;">Vá até a Lojinha comprar roupinhas fofas para o Chuíri!</p>
                    </div>
                `;
                return;
            }

            estado.inventario.forEach(idItem => {
                const item = this.CATALOGO_LOJA.find(x => x.id === idItem) || { nome: idItem, icone: '✨' };
                const emUso = estado.roupaAtual === idItem;
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; padding:8px 12px; border-radius:14px;';
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px;">${item.icone}</span>
                        <div>
                            <strong style="font-size:12.5px; color:#1e293b; display:block;">${item.nome}</strong>
                            <span style="font-size:10.5px; color:${emUso ? '#10b981' : '#64748b'}; font-weight:700;">${emUso ? 'Vestido no Chuíri' : 'Guardado'}</span>
                        </div>
                    </div>
                    <button type="button" class="${emUso ? 'btn-secundario' : 'btn-sucesso'}" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px;"
                        onclick="window.TamagotchiKids.vestir('${idItem}')">
                        ${emUso ? 'Tirar' : 'Vestir'}
                    </button>
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
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px;">${item.icone}</span>
                        <div>
                            <strong style="font-size:12.5px; color:#1e293b; display:block;">${item.nome}</strong>
                            <span style="font-size:10.5px; color:#64748b; font-weight:700;">Acessório Especial</span>
                        </div>
                    </div>
                    ${comprou ? `
                        <span style="font-size:11px; font-weight:800; color:#059669; background:#dcfce7; padding:4px 8px; border-radius:8px;">No Armário</span>
                    ` : `
                        <button type="button" class="btn-sucesso" style="padding:6px 12px; font-size:11px; font-weight:900; border-radius:10px; opacity:${podeComprar ? '1' : '0.4'};"
                            ${!podeComprar ? 'disabled' : ''} onclick="window.TamagotchiKids.comprarItem('${item.id}', ${item.custo})">
                            Comprar (🟡${item.custo})
                        </button>
                    `}
                `;
                container.appendChild(card);
            });
        }
    },

    // 16. AÇÕES DA CASINHA: ALIMENTAR, COMPRAR E VESTIR
    alimentar: function(idItem, custo, nutricao) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) {
            return window.mostrarToast("Você precisa de mais Moedas Mágicas! Cumpra tarefinhas!", "erro");
        }

        estado.moedas -= custo;
        estado.fome = Math.min(100, estado.fome + nutricao);
        estado.felicidade = Math.min(100, estado.felicidade + 8);
        this.salvarEstado(estado);

        if (window.SonsSuiri) window.SonsSuiri.moedaXP();
        this.renderizarConteudoAba();
        this.atualizarVisual('comemorando');

        const nome = this.obterNomeCrianca();
        this.falar(`Nham nham! Que delícia ${nome}! Minha barriguinha agradece!`);
        setTimeout(() => this.atualizarVisual('neutro'), 2500);
    },

    comprarItem: function(idItem, custo) {
        const estado = this.obterEstado();
        if ((estado.moedas || 0) < custo) {
            return window.mostrarToast("Moedas Mágicas insuficientes!", "erro");
        }

        estado.moedas -= custo;
        if (!estado.inventario.includes(idItem)) estado.inventario.push(idItem);
        estado.roupaAtual = idItem;
        this.salvarEstado(estado);

        if (window.SonsSuiri) window.SonsSuiri.moedaXP();
        this.renderizarConteudoAba();
        this.atualizarVisual('comemorando');

        const nome = this.obterNomeCrianca();
        this.falar(`Uau ${nome}! Olha como fiquei lindo com esse presente da loja!`);
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
    setTimeout(() => {
        if (window.modoKidsAtivo) {
            window.TamagotchiKids.montarWidgetNaTela();
        }
    }, 600);
});
