// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-TAMAGOTCHI.JS (100% COMPLETO E INTEGRAL)
// Casinha Dobro do Tamanho (220px), Imagem Interna Alinhada (interna.jpg),
// Decaimento Real por Tempo, 4 Barras de Status Visuais Coloridas,
// Mini-Cardápio na Geladeira com Moedas e Animações nos Cômodos.
// Redirecionamento Direto para o Arcade (jogos.html). Zero Emojis (SVG Puro).
// =========================================================================

window.TamagotchiKids = {
    // 1. MÍDIAS DA CASA E DO CHUÍRI
    MIDIAS_CASA: {
        externa: 'casa.gif',
        internaFoto: 'interna.jpg'
    },

    GIFS_CHUIRI: {
        padrao:   'padrao.gif',
        dormir:   'dormir.gif',
        dormindo: 'dormindo.gif',
        banho:    'banho.gif',
        comendo:  'comendo.gif',
        feliz:    'feliz.gif',
        triste:   'triste.gif'
    },

    // 2. CARDÁPIO DA GELADEIRA (USANDO AS MOEDAS DO CHUÍRI)
    CARDAPIO_COZINHA: [
        { id: 'maca',    nome: 'Maçã Crocante',    custo: 0,  fome: 15, felicidade: 5,  cor: '#ef4444', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>` },
        { id: 'cenoura', nome: 'Suco de Laranja',  custo: 5,  fome: 25, felicidade: 10, cor: '#f97316', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>` },
        { id: 'pizza',   nome: 'Refeição Completa',custo: 12, fome: 45, felicidade: 18, cor: '#eab308', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M6 2v20"/><path d="M9 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/></svg>` },
        { id: 'festa',   nome: 'Banquete Real',    custo: 20, fome: 100,felicidade: 30, cor: '#ec4899', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` }
    ],

    // 3. CONFIGURAÇÃO DE ÁUDIOS MP3
    CONFIG_PASTAS_AUDIO: {
        saudacao: { pasta: 'audios/saudacao', total: 3 },
        parabens: { pasta: 'audios/parabens', total: 3 },
        falha:    { pasta: 'audios/consolo',  total: 3 },
        comida:   { pasta: 'audios/delicia',  total: 3 },
        toque:    { pasta: 'audios/amigo',    total: 10 }
    },

    // 4. ESTADO NO LOCALSTORAGE COM DECAIMENTO REAL PELO TEMPO
    obterEstado: function() {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        const chave = `suiri_monstrinho_${idMembro}`;
        const salvo = localStorage.getItem(chave);
        const agora = Date.now();

        if (salvo) {
            try {
                const obj = JSON.parse(salvo);
                if (!obj.nome || obj.nome === 'Tutu') obj.nome = 'Chuíri';
                if (typeof obj.moedas !== 'number') obj.moedas = 50;
                if (typeof obj.fome !== 'number') obj.fome = 80;
                if (typeof obj.felicidade !== 'number') obj.felicidade = 85;
                if (typeof obj.higiene !== 'number') obj.higiene = 90;
                if (typeof obj.energia !== 'number') obj.energia = 85;

                // Calcula quantas horas passaram desde a última visita
                const ultimoTimestamp = obj.ultimo_timestamp || agora;
                const horasPassadas = Math.floor((agora - ultimoTimestamp) / (1000 * 60 * 60));

                if (horasPassadas >= 1) {
                    const perdaFome = Math.min(50, horasPassadas * 4);
                    const perdaHigiene = Math.min(40, horasPassadas * 3);
                    const perdaEnergia = this.dormindoNaCama ? 0 : Math.min(40, horasPassadas * 3);
                    const perdaFelicidade = Math.min(35, horasPassadas * 2);

                    obj.fome = Math.max(15, obj.fome - perdaFome);
                    obj.higiene = Math.max(15, obj.higiene - perdaHigiene);
                    obj.energia = this.dormindoNaCama ? Math.min(100, obj.energia + (horasPassadas * 10)) : Math.max(15, obj.energia - perdaEnergia);
                    obj.felicidade = Math.max(20, obj.felicidade - perdaFelicidade);
                    obj.ultimo_timestamp = agora;
                    this.salvarEstado(obj);
                }
                return obj;
            } catch (e) {}
        }

        const estadoInicial = {
            nome: 'Chuíri',
            fome: 80,
            felicidade: 85,
            higiene: 90,
            energia: 85,
            moedas: 50,
            ultimo_timestamp: agora
        };
        this.salvarEstado(estadoInicial);
        return estadoInicial;
    },

    salvarEstado: function(estado) {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        estado.ultimo_timestamp = Date.now();
        localStorage.setItem(`suiri_monstrinho_${idMembro}`, JSON.stringify(estado));
    },

    preCarregarMidias: function() {
        this._cacheImagens = {};
        const midiasImagens = { ...this.GIFS_CHUIRI, externa: this.MIDIAS_CASA.externa, internaFoto: this.MIDIAS_CASA.internaFoto };
        Object.entries(midiasImagens).forEach(([chave, url]) => {
            const img = new Image();
            img.src = url;
            this._cacheImagens[chave] = img;
        });
    },

    // 5. MOTOR DE ANIMAÇÃO DO CHUÍRI
    dormindoNaCama: false,

    definirEstadoAnimacao: function(estadoNome, duracaoTemporariaMs = 0) {
        const imgs = [
            document.getElementById('img-chuiri-animado-widget'),
            document.getElementById('img-chuiri-animado-palco')
        ].filter(Boolean);

        if (imgs.length === 0) return;

        if (this._timeoutAnimacao) {
            clearTimeout(this._timeoutAnimacao);
            this._timeoutAnimacao = null;
        }

        if (estadoNome === 'dormir') {
            imgs.forEach(img => { img.src = this.GIFS_CHUIRI.dormir; });
            this._timeoutAnimacao = setTimeout(() => {
                imgs.forEach(img => { img.src = this.GIFS_CHUIRI.dormindo; });
            }, 9500);
            return;
        }

        const baseUrl = this.GIFS_CHUIRI[estadoNome] || this.GIFS_CHUIRI.padrao;
        // Se for uma ação especial (banho, comendo), força reinício do GIF do quadro 1
        const srcEscolhido = (['banho', 'comendo', 'feliz', 'triste'].includes(estadoNome))
            ? `${baseUrl}?t=${Date.now()}`
            : baseUrl;

        imgs.forEach(img => { img.src = srcEscolhido; });

        if (duracaoTemporariaMs > 0) {
            this._timeoutAnimacao = setTimeout(() => {
                const estado = this.obterEstado();
                let voltaPara = this.dormindoNaCama ? 'dormindo' : 'padrao';
                if (!this.dormindoNaCama && (estado.fome < 30 || estado.higiene < 30)) {
                    voltaPara = 'triste';
                }
                imgs.forEach(img => { img.src = this.GIFS_CHUIRI[voltaPara]; });
            }, duracaoTemporariaMs);
        }
    },

    // 6. MOTOR DE ÁUDIO ESTRITAMENTE NO MODO KIDS
    obterAudioCtx: function() {
        if (!window.modoKidsAtivo) return null;
        if (!this._audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this._audioCtx = new AudioCtx();
        }
        if (this._audioCtx && this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    tocarAudio: function(tipoAudio) {
        if (!window.modoKidsAtivo) return;

        if (this._instanciaAudioAtual) {
            try { this._instanciaAudioAtual.pause(); this._instanciaAudioAtual.currentTime = 0; } catch (e) {}
        }

        const cfg = this.CONFIG_PASTAS_AUDIO[tipoAudio];
        if (cfg) {
            const sorteado = Math.floor(Math.random() * (cfg.total || 1)) + 1;
            const audio = new Audio(`${cfg.pasta}/${sorteado}.mp3`);
            this._instanciaAudioAtual = audio;
            audio.play().catch(() => { this.tocarMelodiaMascote(); });
        } else {
            this.tocarMelodiaMascote();
        }
    },

    tocarMelodiaMascote: function() {
        if (!window.modoKidsAtivo) return;
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

    // 7. WIDGET DA CASINHA E CHUÍRI NO RODAPÉ
    montarWidgetNaTela: function() {
        if (!window.modoKidsAtivo) {
            document.getElementById('container-tamagotchi-kids')?.remove();
            return;
        }

        if (document.getElementById('container-tamagotchi-kids')) return;

        this.preCarregarMidias();

        const widget = document.createElement('div');
        widget.id = 'container-tamagotchi-kids';
        widget.className = 'palco-flutuante-chuiri-kids';

        widget.innerHTML = `
            <!-- CASINHA (220px x 260px, ajustável em telas pequenas pelo CSS) -->
            <div id="btn-casinha-tamagotchi" title="Entrar na Casinha" style="width: 220px; height: 260px; cursor: pointer; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: flex-end; justify-content: center; position: relative;">
                <img src="${this.MIDIAS_CASA.externa}" alt="Casinha do Chuíri" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));" />
            </div>

            <!-- CHUÍRI AO LADO -->
            <div id="btn-chuiri-tamagotchi" title="Falar com o Chuíri" style="width: 130px; height: 130px; cursor: pointer; position: relative; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 6px;">
                <img id="img-chuiri-animado-widget" src="${this.GIFS_CHUIRI.padrao}" alt="Chuíri" style="width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));" />
            </div>
        `;

        document.body.appendChild(widget);

        document.getElementById('btn-chuiri-tamagotchi').onclick = (e) => { e.stopPropagation(); this.interagirComToque(); };
        document.getElementById('btn-casinha-tamagotchi').onclick = (e) => { e.stopPropagation(); this.abrirCasinha(); };

        const estadoAtual = this.obterEstado();
        if (estadoAtual.fome < 30 || estadoAtual.higiene < 30) {
            this.definirEstadoAnimacao('triste');
        } else {
            this.definirEstadoAnimacao('padrao');
        }

        setTimeout(() => { if (window.modoKidsAtivo) this.tocarAudio('saudacao'); }, 1200);
    },

    interagirComToque: function() {
        const btnMascote = document.getElementById('btn-chuiri-tamagotchi');
        if (btnMascote) { 
            btnMascote.style.transform = 'scale(1.1)'; 
            setTimeout(() => { btnMascote.style.transform = 'scale(1)'; }, 200); 
        }
        this.definirEstadoAnimacao('feliz', 9000);
        this.tocarAudio('toque');
    },

    aoCompletarMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao('feliz', 10000);
        this.tocarAudio('parabens');
    },

    aoFalharMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao('triste', 10000);
        this.tocarAudio('falha');
    },

    // 8. MODAL INTERNO - FOTO INTERNA.JPG + 4 BARRAS VISUAIS + CARDÁPIO GELADEIRA
    abrirCasinha: function() {
        const btnCasinha = document.getElementById('btn-casinha-tamagotchi');
        if (btnCasinha) { 
            btnCasinha.style.transform = 'scale(1.08) rotate(-2deg)'; 
            setTimeout(() => { btnCasinha.style.transform = 'scale(1)'; }, 200); 
        }

        let modal = document.getElementById('modal-casinha-chuiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-casinha-chuiri';
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed !important; top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: rgba(10, 15, 29, 0.94) !important; backdrop-filter: blur(8px) !important;
                z-index: 9999999 !important; display: flex !important; align-items: center !important;
                justify-content: center !important; padding: 4px !important; box-sizing: border-box !important;
            `;

            modal.innerHTML = `
                <div style="width: 100%; max-width: 440px; height: 98vh; max-height: 840px; background: #000000; border: 3px solid #f59e0b; border-radius: 26px; display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.6); box-sizing: border-box;">
                    
                    <!-- HUD SUPERIOR COM MOEDAS E 4 BARRINHAS VISUAIS DE STATUS -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; z-index: 50; padding: 10px 12px 14px 12px; background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0) 100%); pointer-events: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="display:inline-flex; align-items:center; gap:6px; background: rgba(254, 243, 199, 0.95); padding: 4px 12px; border-radius: 999px; border: 2px solid #f59e0b; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                                <svg class="icone-svg" style="width:15px;height:15px;color:#d97706;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>
                                <span id="txt-saldo-moedas-chuiri" style="font-size: 13px; font-weight: 800; color: #b45309;">50</span>
                                <span style="font-size: 10px; font-weight: 800; color: #d97706;">Moedas</span>
                            </div>

                            <button type="button" style="width: 34px; height: 34px; border-radius: 50%; border: 2px solid #ffffff; background: rgba(239, 68, 68, 0.9); color: #ffffff; font-size: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);" onclick="window.TamagotchiKids.fecharCasinha()">✕</button>
                        </div>

                        <!-- GRADE DAS 4 BARRINHAS COLORIDAS -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; background: rgba(15, 23, 42, 0.78); padding: 7px 9px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.18);">
                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#fde047; margin-bottom:3px;">
                                    <span>Fome</span>
                                    <span id="txt-barra-fome">80%</span>
                                </div>
                                <div style="width:100%; height:6px; background:rgba(255,255,255,0.2); border-radius:999px; overflow:hidden;">
                                    <div id="fill-barra-fome" style="width:80%; height:100%; background:#10b981; border-radius:999px; transition:width 0.35s ease, background-color 0.35s ease;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#7dd3fc; margin-bottom:3px;">
                                    <span>Banho</span>
                                    <span id="txt-barra-higiene">90%</span>
                                </div>
                                <div style="width:100%; height:6px; background:rgba(255,255,255,0.2); border-radius:999px; overflow:hidden;">
                                    <div id="fill-barra-higiene" style="width:90%; height:100%; background:#0ea5e9; border-radius:999px; transition:width 0.35s ease, background-color 0.35s ease;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#c4b5fd; margin-bottom:3px;">
                                    <span>Sono</span>
                                    <span id="txt-barra-energia">85%</span>
                                </div>
                                <div style="width:100%; height:6px; background:rgba(255,255,255,0.2); border-radius:999px; overflow:hidden;">
                                    <div id="fill-barra-energia" style="width:85%; height:100%; background:#8b5cf6; border-radius:999px; transition:width 0.35s ease, background-color 0.35s ease;"></div>
                                </div>
                            </div>

                            <div>
                                <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#f9a8d4; margin-bottom:3px;">
                                    <span>Alegria</span>
                                    <span id="txt-barra-felicidade">85%</span>
                                </div>
                                <div style="width:100%; height:6px; background:rgba(255,255,255,0.2); border-radius:999px; overflow:hidden;">
                                    <div id="fill-barra-felicidade" style="width:85%; height:100%; background:#ec4899; border-radius:999px; transition:width 0.35s ease, background-color 0.35s ease;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FOTO INTERNA (interna.jpg) EM TELA TOTAL -->
                    <div style="flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden; background: #000000; display: flex; align-items: center; justify-content: center;">
                        <img id="img-cenario-interna" src="${this.MIDIAS_CASA.internaFoto}" alt="Interior da Casa" style="width: 100%; height: 100%; object-fit: cover; display: block;" />

                        <!-- CAMADA DE ÍCONES DE CÔMODOS -->
                        <div id="camada-icones-comodos" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; transition: opacity 0.3s ease;">
                            
                            <!-- 1. QUARTO (CAMA) -->
                            <div id="btn-acao-cama" title="Dormir na Cama" onclick="window.TamagotchiKids.acaoDormirCama()" style="position: absolute; top: 31%; left: 52%; width: 46px; height: 46px; border-radius: 50%; background: rgba(124, 58, 237, 0.92); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:21px;height:21px;color:#ffffff;" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                            </div>

                            <!-- 2. COZINHA (GELADEIRA - ABRE MINI CARDÁPIO) -->
                            <div id="btn-acao-geladeira" title="Abrir Geladeira" onclick="window.TamagotchiKids.acaoTocarGeladeira()" style="position: absolute; top: 52%; left: 22%; width: 46px; height: 46px; border-radius: 50%; background: rgba(245, 158, 11, 0.95); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:21px;height:21px;color:#ffffff;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                            </div>

                            <!-- 3. BANHEIRO (BANHO) -->
                            <div id="btn-acao-banho" title="Tomar Banho" onclick="window.TamagotchiKids.acaoTomarBanho()" style="position: absolute; top: 57%; left: 65%; width: 46px; height: 46px; border-radius: 50%; background: rgba(2, 132, 199, 0.95); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:21px;height:21px;color:#ffffff;" viewBox="0 0 24 24"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2"/><line x1="4" y1="21" x2="5" y2="19"/><line x1="20" y1="21" x2="19" y2="19"/></svg>
                            </div>

                            <!-- 4. SALA (JOGOS NO SOFÁ) -->
                            <div id="btn-acao-sala" title="Abrir Arcade de Jogos" onclick="window.TamagotchiKids.acaoTocarSala()" style="position: absolute; bottom: 12%; left: 26%; width: 46px; height: 46px; border-radius: 50%; background: rgba(16, 185, 129, 0.95); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:21px;height:21px;color:#ffffff;" viewBox="0 0 24 24"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>
                            </div>
                        </div>

                        <!-- MENU RÁPIDO DA GELADEIRA (SOBREPOSTO QUANDO CLICA NA GELADEIRA) -->
                        <div id="menu-geladeira-chuiri" class="oculto" style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); width: 92%; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(10px); border: 2.5px solid #f59e0b; border-radius: 22px; padding: 14px; z-index: 60; box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <strong style="font-size:14px; color:#1e293b;">Geladeira do Chuíri (Escolha o Lanche):</strong>
                                <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:12px; border-radius:10px;" onclick="window.TamagotchiKids.fecharMenuGeladeira()">Fechar</button>
                            </div>
                            <div id="grade-cardapio-geladeira" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"></div>
                        </div>

                        <!-- CHUÍRI (RENDERIZADO EXATAMENTE NO CÔMODO ATUAL) -->
                        <div id="container-chuiri-ativo" style="position: absolute; bottom: 8%; left: 34%; width: 95px; height: 95px; z-index: 35; pointer-events: none; transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);">
                            <img id="img-chuiri-animado-palco" src="${this.GIFS_CHUIRI.padrao}" alt="Chuíri" style="width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.55));" />
                        </div>

                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.fecharMenuGeladeira();
        this.atualizarStatusCompacto();
        this.posicionarChuiriNoComodo('sala');
        modal.style.display = 'flex';
    },

    fecharCasinha: function() { 
        const modal = document.getElementById('modal-casinha-chuiri'); 
        if (modal) modal.style.display = 'none'; 
    },

    atualizarStatusCompacto: function() {
        const estado = this.obterEstado();
        const elMoedas = document.getElementById('txt-saldo-moedas-chuiri');
        if (elMoedas) elMoedas.textContent = estado.moedas || 0;

        const atualizarBarra = (idTxt, idFill, valor, corPadrao) => {
            const v = Math.max(0, Math.min(100, Math.round(Number(valor) || 0)));
            const elT = document.getElementById(idTxt);
            const elF = document.getElementById(idFill);
            if (elT) elT.textContent = `${v}%`;
            if (elF) {
                elF.style.width = `${v}%`;
                elF.style.backgroundColor = v < 30 ? '#ef4444' : (v < 55 ? '#f59e0b' : corPadrao);
            }
        };

        atualizarBarra('txt-barra-fome', 'fill-barra-fome', estado.fome, '#10b981');
        atualizarBarra('txt-barra-higiene', 'fill-barra-higiene', estado.higiene, '#0ea5e9');
        atualizarBarra('txt-barra-energia', 'fill-barra-energia', estado.energia, '#8b5cf6');
        atualizarBarra('txt-barra-felicidade', 'fill-barra-felicidade', estado.felicidade, '#ec4899');
    },

    // 9. POSICIONAMENTO E ANIMAÇÃO DO CHUÍRI NO PRÓPRIO CÔMODO
    posicionarChuiriNoComodo: function(comodo) {
        const box = document.getElementById('container-chuiri-ativo');
        if (!box) return;

        box.style.transform = 'none';
        box.style.top = 'auto';
        box.style.right = 'auto';

        if (comodo === 'quarto') {
            box.style.bottom = '64%';
            box.style.left = '46%';
            box.style.width = '84px';
            box.style.height = '84px';
        } else if (comodo === 'cozinha') {
            box.style.bottom = '36%';
            box.style.left = '28%';
            box.style.width = '90px';
            box.style.height = '90px';
        } else if (comodo === 'banheiro') {
            box.style.bottom = '36%';
            box.style.left = '60%';
            box.style.width = '90px';
            box.style.height = '90px';
        } else if (comodo === 'sala') {
            box.style.bottom = '8%';
            box.style.left = '34%';
            box.style.width = '95px';
            box.style.height = '95px';
        }
    },

    executarAcaoNoComodo: function(comodo, estadoAnimacao, tipoAudio, duracaoMs = 8000) {
        this.posicionarChuiriNoComodo(comodo);
        this.definirEstadoAnimacao(estadoAnimacao, duracaoMs);
        if (tipoAudio) this.tocarAudio(tipoAudio);
    },

    // 10. AÇÕES DOS CÔMODOS + CARDÁPIO DA GELADEIRA
    acaoDormirCama: function() {
        this.fecharMenuGeladeira();
        this.dormindoNaCama = !this.dormindoNaCama;
        const estado = this.obterEstado();

        if (this.dormindoNaCama) {
            estado.energia = Math.min(100, estado.energia + 40);
            this.salvarEstado(estado);
            this.atualizarStatusCompacto();
            this.posicionarChuiriNoComodo('quarto');
            this.definirEstadoAnimacao('dormir');
            this.tocarAudio('saudacao');
        } else {
            this.posicionarChuiriNoComodo('quarto');
            this.definirEstadoAnimacao('padrao');
        }
    },

    acaoTocarGeladeira: function() {
        this.dormindoNaCama = false;
        this.posicionarChuiriNoComodo('cozinha');
        this.abrirMenuGeladeira();
    },

    abrirMenuGeladeira: function() {
        const menu = document.getElementById('menu-geladeira-chuiri');
        const grade = document.getElementById('grade-cardapio-geladeira');
        if (!menu || !grade) return;

        const estado = this.obterEstado();
        const saldoMoedas = estado.moedas || 0;

        grade.innerHTML = this.CARDAPIO_COZINHA.map(item => {
            const podeComprar = saldoMoedas >= item.custo;
            const labelPreco = item.custo === 0 ? 'Grátis' : `${item.custo} Moedas`;

            return `
                <button type="button" 
                        style="display:flex; align-items:center; gap:8px; padding:10px; border-radius:14px; border:2px solid ${podeComprar ? item.cor : '#cbd5e1'}; background:#ffffff; cursor:${podeComprar ? 'pointer' : 'not-allowed'}; opacity:${podeComprar ? '1' : '0.5'}; text-align:left;"
                        onclick="window.TamagotchiKids.servirAlimentoGeladeira('${item.id}')">
                    <div style="width:36px; height:36px; border-radius:10px; background:${item.cor}18; color:${item.cor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${item.icone}
                    </div>
                    <div style="min-width:0; flex:1;">
                        <strong style="font-size:12px; color:#1e293b; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.nome}</strong>
                        <span style="font-size:10.5px; font-weight:800; color:${item.custo === 0 ? '#10b981' : '#d97706'}; display:block;">${labelPreco} • +${item.fome}%</span>
                    </div>
                </button>
            `;
        }).join('');

        menu.classList.remove('oculto');
    },

    fecharMenuGeladeira: function() {
        document.getElementById('menu-geladeira-chuiri')?.classList.add('oculto');
    },

    servirAlimentoGeladeira: function(idAlimento) {
        const item = this.CARDAPIO_COZINHA.find(x => x.id === idAlimento);
        if (!item) return;

        const estado = this.obterEstado();
        if ((estado.moedas || 0) < item.custo) {
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast(`Faltam moedas para ${item.nome}! Jogue no Arcade ou cumpra missões!`, 'erro');
            }
            return;
        }

        estado.moedas = Math.max(0, (estado.moedas || 0) - item.custo);
        estado.fome = Math.min(100, (estado.fome || 0) + item.fome);
        estado.felicidade = Math.min(100, (estado.felicidade || 0) + item.felicidade);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();
        this.fecharMenuGeladeira();

        this.executarAcaoNoComodo('cozinha', 'comendo', 'comida', 8000);
    },

    acaoTomarBanho: function() {
        this.fecharMenuGeladeira();
        this.dormindoNaCama = false;
        const estado = this.obterEstado();
        estado.higiene = 100;
        estado.felicidade = Math.min(100, estado.felicidade + 12);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();

        this.executarAcaoNoComodo('banheiro', 'banho', 'parabens', 8500);
    },

    acaoTocarSala: function() {
        this.fecharMenuGeladeira();
        this.dormindoNaCama = false;
        this.posicionarChuiriNoComodo('sala');
        this.definirEstadoAnimacao('feliz', 3000);
        this.tocarAudio('toque');
        
        setTimeout(() => {
            window.location.href = 'jogos.html';
        }, 350);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.modoKidsAtivo) window.TamagotchiKids.montarWidgetNaTela(); }, 600);
});
