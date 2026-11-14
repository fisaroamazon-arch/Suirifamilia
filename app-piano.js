// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-PIANO.JS
// Módulo: Sintetizador Acústico, Teclados e Esteiras Synthesia (Solo e Dueto)
// =========================================================================

// 1. MOTOR ACÚSTICO AUTÔNOMO (PIANO, CORDAS E XILOFONE)
window.AudioMotor = window.AudioMotor || {
    ctx: null,
    masterGain: null,
    compressor: null,
    ondaPiano: null,
    vozesAtivas: {},
    instrumento: 'piano',

    obterCtx: function() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },

    trocarInstrumento: function(tipo) {
        this.soltarTodasVozesPiano();
        this.instrumento = tipo;
    },

    obterOndaPiano: function(ctx) {
        if (this.ondaPiano) return this.ondaPiano;
        const nHarmonics = 12;
        const real = new Float32Array(nHarmonics);
        const imag = new Float32Array(nHarmonics);
        const coefs = [0, 1.0, 0.65, 0.38, 0.24, 0.15, 0.09, 0.05, 0.03, 0.02, 0.015, 0.01];
        for (let i = 1; i < coefs.length; i++) imag[i] = coefs[i];
        this.ondaPiano = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
        return this.ondaPiano;
    },

    obterSaida: function() {
        const ctx = this.obterCtx();
        if (!ctx) return null;

        if (!this.masterGain) {
            this.masterGain = ctx.createGain();
            this.masterGain.gain.setValueAtTime(1.5, ctx.currentTime);

            this.compressor = ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-14, ctx.currentTime);
            this.compressor.knee.setValueAtTime(20, ctx.currentTime);
            this.compressor.ratio.setValueAtTime(6, ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
            this.compressor.release.setValueAtTime(0.15, ctx.currentTime);

            this.masterGain.connect(this.compressor);
            this.compressor.connect(ctx.destination);
        }
        return this.masterGain;
    },

    iniciarVozPiano: function(chave, freq, fatorVolume = 1.0, tipoInstrumento = null) {
        try {
            const ctx = this.obterCtx();
            if (!ctx) return;
            this.soltarVozPiano(chave);

            const saida = this.obterSaida();
            const now = ctx.currentTime;
            const instrumentoAtual = tipoInstrumento || this.instrumento || 'piano';

            if (instrumentoAtual === 'xilofone') {
                // SÍNTESE DE XILOFONE: ATAQUE PERCUSSIVO BRILHANTE E DECAIMENTO RÁPIDO
                const gNota = ctx.createGain();
                gNota.gain.setValueAtTime(0.0001, now);
                gNota.gain.linearRampToValueAtTime(0.85 * fatorVolume, now + 0.002);
                gNota.gain.exponentialRampToValueAtTime(0.12 * fatorVolume, now + 0.18);
                gNota.gain.exponentialRampToValueAtTime(0.0001 * fatorVolume, now + 0.85);

                const filtro = ctx.createBiquadFilter();
                filtro.type = 'bandpass';
                filtro.Q.setValueAtTime(3.5, now);
                filtro.frequency.setValueAtTime(freq * 2.0, now);

                // Fundamental
                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(freq, now);

                // Harmónico de lâmina de madeira (3x freq)
                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(freq * 3.0, now);

                const gOsc2 = ctx.createGain();
                gOsc2.gain.setValueAtTime(0.35, now);
                gOsc2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc1.connect(filtro);
                osc2.connect(gOsc2);
                gOsc2.connect(filtro);
                filtro.connect(gNota);
                gNota.connect(saida);

                osc1.start(now);
                osc2.start(now);

                this.vozesAtivas[chave] = { tipo: 'xilofone', osc1, osc2, filtro, gain: gNota };
            } else if (instrumentoAtual === 'cordas') {
                // SÍNTESE DE CORDAS: ATAQUE SUAVE E SUSTAIN PROLONGADO
                const gNota = ctx.createGain();
                gNota.gain.setValueAtTime(0.0001, now);
                gNota.gain.linearRampToValueAtTime(0.55 * fatorVolume, now + 0.16);
                gNota.gain.linearRampToValueAtTime(0.48 * fatorVolume, now + 0.42);
                gNota.gain.exponentialRampToValueAtTime(0.06 * fatorVolume, now + 10.0);

                const filtro = ctx.createBiquadFilter();
                filtro.type = 'lowpass';
                filtro.Q.setValueAtTime(1.1, now);
                filtro.frequency.setValueAtTime(Math.min(3200, freq * 3.4), now);

                const osc1 = ctx.createOscillator();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq, now);
                osc1.detune.setValueAtTime(-5.5, now);

                const osc2 = ctx.createOscillator();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(freq, now);
                osc2.detune.setValueAtTime(5.5, now);

                osc1.connect(filtro);
                osc2.connect(filtro);
                filtro.connect(gNota);
                gNota.connect(saida);

                osc1.start(now);
                osc2.start(now);

                this.vozesAtivas[chave] = { tipo: 'cordas', osc1, osc2, filtro, gain: gNota };
            } else {
                // SÍNTESE DE PIANO CLÁSSICO COM 12 HARMÓNICOS
                const onda = this.obterOndaPiano(ctx);

                const gNota = ctx.createGain();
                gNota.gain.setValueAtTime(0.0001, now);
                gNota.gain.linearRampToValueAtTime(0.78 * fatorVolume, now + 0.006);
                gNota.gain.exponentialRampToValueAtTime(0.42 * fatorVolume, now + 0.28);
                gNota.gain.exponentialRampToValueAtTime(0.025 * fatorVolume, now + 8.5);

                const filtro = ctx.createBiquadFilter();
                filtro.type = 'lowpass';
                filtro.Q.setValueAtTime(1.8, now);
                filtro.frequency.setValueAtTime(Math.min(7200, freq * 5.8), now);
                filtro.frequency.exponentialRampToValueAtTime(Math.max(480, freq * 1.9), now + 0.32);

                const osc1 = ctx.createOscillator();
                osc1.setPeriodicWave(onda);
                osc1.frequency.setValueAtTime(freq, now);

                const osc2 = ctx.createOscillator();
                osc2.setPeriodicWave(onda);
                osc2.frequency.setValueAtTime(freq, now);
                osc2.detune.setValueAtTime(2.8, now);

                osc1.connect(filtro);
                osc2.connect(filtro);
                filtro.connect(gNota);
                gNota.connect(saida);

                osc1.start(now);
                osc2.start(now);

                this.vozesAtivas[chave] = { tipo: 'piano', osc1, osc2, filtro, gain: gNota };
            }
        } catch(e) {}
    },

    soltarVozPiano: function(chave) {
        try {
            const voz = this.vozesAtivas[chave];
            if (!voz) return;
            delete this.vozesAtivas[chave];

            const ctx = this.obterCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            const valAtual = Math.max(0.001, voz.gain.gain.value || 0.1);
            voz.gain.gain.cancelScheduledValues(now);
            voz.gain.gain.setValueAtTime(valAtual, now);

            const tempoDecaimento = voz.tipo === 'cordas' ? 0.32 : (voz.tipo === 'xilofone' ? 0.08 : 0.12);
            voz.gain.gain.exponentialRampToValueAtTime(0.0001, now + tempoDecaimento);
            voz.osc1.stop(now + tempoDecaimento + 0.03);
            if (voz.osc2) voz.osc2.stop(now + tempoDecaimento + 0.03);

            setTimeout(() => {
                try {
                    voz.osc1.disconnect();
                    if (voz.osc2) voz.osc2.disconnect();
                    voz.filtro.disconnect();
                    voz.gain.disconnect();
                } catch(e) {}
            }, (tempoDecaimento + 0.06) * 1000);
        } catch(e) {}
    },

    soltarTodasVozesPiano: function() {
        for (let k in this.vozesAtivas) this.soltarVozPiano(k);
    },

    tocarTom: function(freq, dur = 0.28, tipo = 'triangle') {
        try {
            const ctx = this.obterCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = tipo;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(0.35, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.connect(g);
            g.connect(this.obterSaida() || ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + dur);
        } catch(e) {}
    },

    // SÍNTESE DE SOM CACOFÔNICO PARA NOTA ERRADA (DISSONÂNCIA ÁSPERA)
    tocarSomCacofonico: function() {
        try {
            const ctx = this.obterCtx();
            if (!ctx) return;
            const t = ctx.currentTime;

            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const osc3 = ctx.createOscillator();
            const g = ctx.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc3.type = 'square';

            // Trítono dissonante e atrito tonal
            osc1.frequency.setValueAtTime(138.59, t); // Dó# grave
            osc2.frequency.setValueAtTime(196.00, t); // Sol grave (Trítono áspero)
            osc3.frequency.setValueAtTime(92.50, t);  // Fá# sub-grave

            // Desafinação abrupta descendente (efeito clássico de erro sonoro)
            osc1.frequency.linearRampToValueAtTime(105.0, t + 0.28);
            osc2.frequency.linearRampToValueAtTime(150.0, t + 0.28);
            osc3.frequency.linearRampToValueAtTime(70.0, t + 0.28);

            g.gain.setValueAtTime(0.38, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            const dest = this.obterSaida() || ctx.destination;
            osc1.connect(g);
            osc2.connect(g);
            osc3.connect(g);
            g.connect(dest);

            osc1.start(t);
            osc2.start(t);
            osc3.start(t);
            osc1.stop(t + 0.29);
            osc2.stop(t + 0.29);
            osc3.stop(t + 0.29);
        } catch(e) {}
    }
};

// 2. CONTROLADOR DO PIANO E RENDERIZAÇÃO DAS ESTEIRAS
window.MotorMusica = {
    modo: 'aprendizado',
    musicaIndex: 0,
    passoNota: 0,
    passoAcorde: 0,
    tocandoMusica: false,
    fatorVelocidade: 1.0,
    eventosConfigurados: false,
    teclasAtivasPorPointer: {},
    contagemDedosPorNota: {},

    // GESTÃO INDEPENDENTE DE TIMBRES
    timbreSolo: 'piano',
    timbreDuetoJ1: 'piano',
    timbreDuetoJ2: 'piano',
    timbresLivres: {
        2: 'piano', // Sub-grave (Oitava 2)
        3: 'piano', // Grave (Oitava 3)
        4: 'piano', // Médio (Oitava 4)
        5: 'piano'  // Agudo (Oitava 5)
    },

    catalogoMusicas: window.CATALOGO_MUSICAS || [],

    cvSolo: null, ctxSolo: null,
    cvDuetoMelodia: null, ctxDuetoMelodia: null,
    cvDuetoHarmonia: null, ctxDuetoHarmonia: null,
    animEsteiraId: null,
    tempoMusicaSegundos: 0,
    ultimoTimestamp: 0,
    notasNaEsteira: [],
    acordesNaEsteira: [],

    layoutOitava4: {
        'C4':  { ehPreta: false, xPct: 0.000, wPct: 0.125, cor: '#38bdf8' },
        'D4':  { ehPreta: false, xPct: 0.125, wPct: 0.125, cor: '#06b6d4' },
        'E4':  { ehPreta: false, xPct: 0.250, wPct: 0.125, cor: '#10b981' },
        'F4':  { ehPreta: false, xPct: 0.375, wPct: 0.125, cor: '#84cc16' },
        'G4':  { ehPreta: false, xPct: 0.500, wPct: 0.125, cor: '#f59e0b' },
        'A4':  { ehPreta: false, xPct: 0.625, wPct: 0.125, cor: '#f97316' },
        'B4':  { ehPreta: false, xPct: 0.750, wPct: 0.125, cor: '#ec4899' },
        'C5':  { ehPreta: false, xPct: 0.875, wPct: 0.125, cor: '#8b5cf6' },

        'C#4': { ehPreta: true, xPct: 0.085, wPct: 0.088, cor: '#6366f1' },
        'D#4': { ehPreta: true, xPct: 0.210, wPct: 0.088, cor: '#14b8a6' },
        'F#4': { ehPreta: true, xPct: 0.458, wPct: 0.088, cor: '#eab308' },
        'G#4': { ehPreta: true, xPct: 0.582, wPct: 0.088, cor: '#f43f5e' },
        'A#4': { ehPreta: true, xPct: 0.708, wPct: 0.088, cor: '#a855f7' }
    },

    layoutOitava3: {
        'C3':  { ehPreta: false, xPct: 0.000, wPct: 0.125, cor: '#f59e0b' },
        'D3':  { ehPreta: false, xPct: 0.125, wPct: 0.125, cor: '#f97316' },
        'E3':  { ehPreta: false, xPct: 0.250, wPct: 0.125, cor: '#ef4444' },
        'F3':  { ehPreta: false, xPct: 0.375, wPct: 0.125, cor: '#ec4899' },
        'G3':  { ehPreta: false, xPct: 0.500, wPct: 0.125, cor: '#d97706' },
        'A3':  { ehPreta: false, xPct: 0.625, wPct: 0.125, cor: '#b45309' },
        'B3':  { ehPreta: false, xPct: 0.750, wPct: 0.125, cor: '#92400e' },
        'C4':  { ehPreta: false, xPct: 0.875, wPct: 0.125, cor: '#ea580c' },

        'C#3': { ehPreta: true, xPct: 0.085, wPct: 0.088, cor: '#b91c1c' },
        'D#3': { ehPreta: true, xPct: 0.210, wPct: 0.088, cor: '#c2410c' },
        'F#3': { ehPreta: true, xPct: 0.458, wPct: 0.088, cor: '#a16207' },
        'G#3': { ehPreta: true, xPct: 0.582, wPct: 0.088, cor: '#9a3412' },
        'A#3': { ehPreta: true, xPct: 0.708, wPct: 0.088, cor: '#7c2d12' }
    },

    // TABELA EXPANDIDA DE FREQUÊNCIAS (C2 ATÉ C6)
    tabelaFrequencias: {
        // Oitava 2: Sub-Grave
        'C2':  { freq: 65.41,  nome: 'Dó' },
        'C#2': { freq: 69.30,  nome: 'Dó#' },
        'D2':  { freq: 73.42,  nome: 'Ré' },
        'D#2': { freq: 77.78,  nome: 'Ré#' },
        'E2':  { freq: 82.41,  nome: 'Mi' },
        'F2':  { freq: 87.31,  nome: 'Fá' },
        'F#2': { freq: 92.50,  nome: 'Fá#' },
        'G2':  { freq: 98.00,  nome: 'Sol' },
        'G#2': { freq: 103.83, nome: 'Sol#' },
        'A2':  { freq: 110.00, nome: 'Lá' },
        'A#2': { freq: 116.54, nome: 'Lá#' },
        'B2':  { freq: 123.47, nome: 'Si' },

        // Oitava 3: Grave
        'C3':  { freq: 130.81, nome: 'Dó' },
        'C#3': { freq: 138.59, nome: 'Dó#' },
        'D3':  { freq: 146.83, nome: 'Ré' },
        'D#3': { freq: 155.56, nome: 'Ré#' },
        'E3':  { freq: 164.81, nome: 'Mi' },
        'F3':  { freq: 174.61, nome: 'Fá' },
        'F#3': { freq: 185.00, nome: 'Fá#' },
        'G3':  { freq: 196.00, nome: 'Sol' },
        'G#3': { freq: 207.65, nome: 'Sol#' },
        'A3':  { freq: 220.00, nome: 'Lá' },
        'A#3': { freq: 233.08, nome: 'Lá#' },
        'B3':  { freq: 246.94, nome: 'Si' },

        // Oitava 4: Médio
        'C4':  { freq: 261.63, nome: 'Dó' },
        'C#4': { freq: 277.18, nome: 'Dó#' },
        'D4':  { freq: 293.66, nome: 'Ré' },
        'D#4': { freq: 311.13, nome: 'Ré#' },
        'E4':  { freq: 329.63, nome: 'Mi' },
        'F4':  { freq: 349.23, nome: 'Fá' },
        'F#4': { freq: 369.99, nome: 'Fá#' },
        'G4':  { freq: 392.00, nome: 'Sol' },
        'G#4': { freq: 415.30, nome: 'Sol#' },
        'A4':  { freq: 440.00, nome: 'Lá' },
        'A#4': { freq: 466.16, nome: 'Lá#' },
        'B4':  { freq: 493.88, nome: 'Si' },

        // Oitava 5: Agudo
        'C5':  { freq: 523.25, nome: 'Dó+' },
        'C#5': { freq: 554.37, nome: 'Dó#+' },
        'D5':  { freq: 587.33, nome: 'Ré+' },
        'D#5': { freq: 622.25, nome: 'Ré#+' },
        'E5':  { freq: 659.25, nome: 'Mi+' },
        'F5':  { freq: 698.46, nome: 'Fá+' },
        'F#5': { freq: 739.99, nome: 'Fá#+' },
        'G5':  { freq: 783.99, nome: 'Sol+' },
        'G#5': { freq: 830.61, nome: 'Sol#+' },
        'A5':  { freq: 880.00, nome: 'Lá+' },
        'A#5': { freq: 932.33, nome: 'Lá#+' },
        'B5':  { freq: 987.77, nome: 'Si+' },
        'C6':  { freq: 1046.50, nome: 'Dó++' }
    },

    montar: function() {
        this.sincronizarCatalogo();
        this.configurarEventosMultitoque();
        this.inicializarCanvasEsteiras();
        this.popularSeletoresMusica();
        if (this.catalogoMusicas.length > 0) {
            this.selecionarMusica(this.musicaIndex || 0);
        }
    },

    sincronizarCatalogo: function() {
        if (window.CATALOGO_MUSICAS && Array.isArray(window.CATALOGO_MUSICAS)) {
            this.catalogoMusicas = window.CATALOGO_MUSICAS;
        }
    },

    carregarCatalogo: function(lista) {
        if (Array.isArray(lista)) {
            this.catalogoMusicas = lista;
            window.CATALOGO_MUSICAS = lista;
            this.popularSeletoresMusica();
            this.selecionarMusica(0);
        }
    },

    inicializarCanvasEsteiras: function() {
        this.cvSolo = document.getElementById('cv-esteira-piano');
        if (this.cvSolo && this.cvSolo.parentElement) {
            this.ctxSolo = this.cvSolo.getContext('2d');
            const rS = this.cvSolo.parentElement.getBoundingClientRect();
            this.cvSolo.width = rS.width || 390;
            this.cvSolo.height = rS.height || 160;
        }

        this.cvDuetoMelodia = document.getElementById('cv-esteira-dueto-melodia');
        if (this.cvDuetoMelodia && this.cvDuetoMelodia.parentElement) {
            this.ctxDuetoMelodia = this.cvDuetoMelodia.getContext('2d');
            const rM = this.cvDuetoMelodia.parentElement.getBoundingClientRect();
            this.cvDuetoMelodia.width = rM.width || 390;
            this.cvDuetoMelodia.height = rM.height || 180;
        }

        this.cvDuetoHarmonia = document.getElementById('cv-esteira-dueto-harmonia');
        if (this.cvDuetoHarmonia && this.cvDuetoHarmonia.parentElement) {
            this.ctxDuetoHarmonia = this.cvDuetoHarmonia.getContext('2d');
            const rH = this.cvDuetoHarmonia.parentElement.getBoundingClientRect();
            this.cvDuetoHarmonia.width = rH.width || 390;
            this.cvDuetoHarmonia.height = rH.height || 180;
        }
    },

    popularSeletoresMusica: function() {
        const s1 = document.getElementById('seletor-musica-alvo');
        const s2 = document.getElementById('seletor-musica-dueto');
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) {
            const aviso = '<option value="">Aguardando músicas...</option>';
            if (s1) s1.innerHTML = aviso;
            if (s2) s2.innerHTML = aviso;
            return;
        }
        const optionsHtml = this.catalogoMusicas.map((m, idx) => `<option value="${idx}">${idx + 1}. ${m.titulo} (${m.bpm} BPM)</option>`).join('');
        if (s1) s1.innerHTML = optionsHtml;
        if (s2) s2.innerHTML = optionsHtml;
    },

    mudarFatorVelocidade: function(fator, botaoClicado) {
        this.fatorVelocidade = fator;
        if (navigator.vibrate) try { navigator.vibrate(20); } catch(e) {}

        document.querySelectorAll('#botoes-velocidade-solo .btn-velocidade-bichinho, #botoes-velocidade-dueto .btn-velocidade-bichinho').forEach(b => {
            const bFator = b.getAttribute('data-fator');
            if (fator === 'toque') {
                b.classList.toggle('ativo', bFator === 'toque');
            } else {
                b.classList.toggle('ativo', parseFloat(bFator) === fator);
            }
        });

        if (fator === 'toque') {
            this.tocandoMusica = true;
            this.atualizarBotoesPlayVisual(true, "Modo Toque Ativo");
        } else if (this.tocandoMusica) {
            this.iniciarAnimacaoEsteira();
        }

        this.atualizarDisplays();
    },

    obterBpmEfetivo: function() {
        const mus = this.catalogoMusicas[this.musicaIndex] || { bpm: 90 };
        if (this.fatorVelocidade === 'toque') return mus.bpm || 90;
        return Math.max(30, Math.round((mus.bpm || 90) * this.fatorVelocidade));
    },

    obterPixelsPorSegundo: function(alturaPista = 160) {
        const bpm = this.obterBpmEfetivo();
        const fatorEscala = alturaPista < 130 ? 46 : (alturaPista > 200 ? 85 : 68);
        return (bpm / 60) * fatorEscala;
    },

    togglePlay: function() {
        if (window.AudioMotor) window.AudioMotor.obterCtx();
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) return;

        if (this.fatorVelocidade === 'toque') {
            this.tocandoMusica = true;
            this.atualizarBotoesPlayVisual(true, "Modo Toque Ativo");
            this.atualizarDisplays();
            this.renderizarTodasEsteiras();
            return;
        }

        if (this.tocandoMusica) {
            this.pausarMusica();
        } else {
            this.iniciarMusica();
        }
    },

    iniciarMusica: function() {
        this.tocandoMusica = true;
        this.atualizarBotoesPlayVisual(true, "Pausar");
        this.ultimoTimestamp = performance.now();
        this.iniciarAnimacaoEsteira();
    },

    pausarMusica: function() {
        this.tocandoMusica = false;
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        this.atualizarBotoesPlayVisual(false, "Continuar");
    },

    pararMusicaEContadores: function() {
        this.tocandoMusica = false;
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        if (window.AudioMotor && typeof window.AudioMotor.soltarTodasVozesPiano === 'function') {
            window.AudioMotor.soltarTodasVozesPiano();
        }
        this.tempoMusicaSegundos = 0;
        this.atualizarBotoesPlayVisual(false, "Iniciar");
    },

    reiniciarMusica: function() {
        this.pararMusicaEContadores();
        this.pararTodasNotas();
        this.passoNota = 0;
        this.passoAcorde = 0;
        this.tempoMusicaSegundos = 0;
        this.atualizarDisplays();
        this.renderizarTodasEsteiras();
        if (this.fatorVelocidade === 'toque') {
            this.tocandoMusica = true;
            this.atualizarBotoesPlayVisual(true, "Modo Toque Ativo");
        } else {
            this.atualizarBotoesPlayVisual(false, "Iniciar");
        }
    },

    atualizarBotoesPlayVisual: function(tocando, texto) {
        const icone = (tocando && this.fatorVelocidade !== 'toque') ? "⏸" : "▶";
        const iconeS = document.getElementById('icone-play-solo');
        const txtS = document.getElementById('txt-play-solo');
        const iconeD = document.getElementById('icone-play-dueto');
        const txtD = document.getElementById('txt-play-dueto');

        if (iconeS) iconeS.textContent = icone;
        if (txtS) txtS.textContent = texto;
        if (iconeD) iconeD.textContent = icone;
        if (txtD) txtD.textContent = texto;
    },

    construirTrilhasMelodiaEHarmonia: function() {
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) {
            this.notasNaEsteira = [];
            this.acordesNaEsteira = [];
            return;
        }
        const mus = this.catalogoMusicas[this.musicaIndex] || this.catalogoMusicas[0];
        const bpm = mus.bpm || 90;
        const segundosPorTempo = 60 / bpm;

        this.notasNaEsteira = [];
        let tempoAtualMelodia = 0;
        if (mus.melodia) {
            mus.melodia.forEach((item, idx) => {
                const durSegundos = item.d * segundosPorTempo;
                this.notasNaEsteira.push({
                    idx: idx,
                    nota: item.n,
                    durTempos: item.d,
                    tInicio: tempoAtualMelodia,
                    tFim: tempoAtualMelodia + durSegundos,
                    durSegundos: durSegundos
                });
                tempoAtualMelodia += durSegundos;
            });
        }

        this.acordesNaEsteira = [];
        let tempoAtualHarmonia = 0;
        if (mus.harmonia) {
            mus.harmonia.forEach((item, idx) => {
                const durSegundos = item.d * segundosPorTempo;
                this.acordesNaEsteira.push({
                    idx: idx,
                    nome: item.nome,
                    notas: item.notas || [],
                    durTempos: item.d,
                    tInicio: tempoAtualHarmonia,
                    tFim: tempoAtualHarmonia + durSegundos,
                    durSegundos: durSegundos
                });
                tempoAtualHarmonia += durSegundos;
            });
        }
    },

    iniciarAnimacaoEsteira: function() {
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.ultimoTimestamp = performance.now();

        const loop = (agora) => {
            if (!this.tocandoMusica && this.fatorVelocidade !== 'toque') return;
            
            const deltaSegundos = Math.min(0.08, (agora - this.ultimoTimestamp) / 1000);
            this.ultimoTimestamp = agora;

            if (this.fatorVelocidade !== 'toque' && this.catalogoMusicas.length > 0) {
                const bpmEfetivo = this.obterBpmEfetivo();
                const mus = this.catalogoMusicas[this.musicaIndex];
                const multiplicadorTempo = bpmEfetivo / (mus.bpm || 90);
                this.tempoMusicaSegundos += deltaSegundos * multiplicadorTempo;

                const notaAtual = this.notasNaEsteira.find(n => this.tempoMusicaSegundos >= n.tInicio && this.tempoMusicaSegundos < n.tFim);
                if (notaAtual && notaAtual.idx !== this.passoNota) {
                    this.passoNota = notaAtual.idx;
                    this.atualizarDisplays();
                }

                const acordeAtual = this.acordesNaEsteira.find(a => this.tempoMusicaSegundos >= a.tInicio && this.tempoMusicaSegundos < a.tFim);
                if (acordeAtual && acordeAtual.idx !== this.passoAcorde) {
                    this.passoAcorde = acordeAtual.idx;
                    this.atualizarDisplays();
                }

                const ultimaNota = this.notasNaEsteira[this.notasNaEsteira.length - 1];
                if (ultimaNota && this.tempoMusicaSegundos > ultimaNota.tFim + 0.6) {
                    this.concluirMusica(mus.titulo);
                    return;
                }
            }

            this.renderizarTodasEsteiras();
            this.animEsteiraId = requestAnimationFrame(loop);
        };

        this.animEsteiraId = requestAnimationFrame(loop);
    },

    renderizarTodasEsteiras: function() {
        if (this.modo === 'aprendizado') {
            if (this.ctxSolo && this.cvSolo) {
                this.desenharEsteiraGenerica(this.ctxSolo, this.cvSolo.width, this.cvSolo.height, this.notasNaEsteira, this.layoutOitava4, '#38bdf8');
            }
        } else if (this.modo === 'dueto') {
            if (this.ctxDuetoMelodia && this.cvDuetoMelodia) {
                this.desenharEsteiraGenerica(this.ctxDuetoMelodia, this.cvDuetoMelodia.width, this.cvDuetoMelodia.height, this.notasNaEsteira, this.layoutOitava4, '#38bdf8');
            }
            if (this.ctxDuetoHarmonia && this.cvDuetoHarmonia) {
                this.desenharEsteiraHarmoniaJ2(this.ctxDuetoHarmonia, this.cvDuetoHarmonia.width, this.cvDuetoHarmonia.height);
            }
        }
    },

    desenharEsteiraGenerica: function(ctx, W, H, listaNotas, layout, corLinhaImpacto) {
        if (!W || W <= 0) W = 390;
        if (!H || H <= 0) H = 160;
        const linhaImpactoY = H - 8;
        const pps = this.obterPixelsPorSegundo(H);
        ctx.clearRect(0, 0, W, H);

        ctx.save();
        for (let k in layout) {
            const col = layout[k];
            const colX = col.xPct * W;
            const colW = col.wPct * W;

            if (!col.ehPreta) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(colX, 0, colW, H);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.strokeRect(colX, 0, colW, H);
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                ctx.fillRect(colX, 0, colW, H);
            }
        }
        ctx.restore();

        ctx.save();
        ctx.shadowColor = corLinhaImpacto;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = corLinhaImpacto;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, linhaImpactoY);
        ctx.lineTo(W, linhaImpactoY);
        ctx.stroke();
        ctx.restore();

        if (!listaNotas || listaNotas.length === 0) return;

        listaNotas.forEach(item => {
            const col = layout[item.nota];
            if (!col) return;

            const colX = col.xPct * W;
            const colW = col.wPct * W;
            const distTempo = item.tInicio - this.tempoMusicaSegundos;
            const yBase = linhaImpactoY - (distTempo * pps);
            const alturaBloco = Math.max(16, item.durSegundos * pps);
            const yTopo = yBase - alturaBloco;

            if (yBase < -20 || yTopo > H + 20) return;

            ctx.save();
            const estaNoImpacto = this.tempoMusicaSegundos >= item.tInicio && this.tempoMusicaSegundos <= item.tFim;
            if (estaNoImpacto) {
                ctx.shadowColor = col.cor;
                ctx.shadowBlur = 12;
            }

            const grad = ctx.createLinearGradient(colX, yTopo, colX + colW, yBase);
            grad.addColorStop(0, col.cor);
            grad.addColorStop(1, '#ffffff');

            ctx.fillStyle = grad;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.6;

            ctx.beginPath();
            ctx.roundRect(colX + 2, yTopo, colW - 4, alturaBloco, item.durTempos >= 2 ? 6 : 4);
            ctx.fill();
            ctx.stroke();

            const infoF = this.tabelaFrequencias[item.nota];
            if (infoF && alturaBloco >= 24) {
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 9.5px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(infoF.nome, colX + colW / 2, yBase - 5);
            }
            ctx.restore();
        });
    },

    desenharEsteiraHarmoniaJ2: function(ctx, W, H) {
        if (!W || W <= 0) W = 390;
        if (!H || H <= 0) H = 160;
        const linhaImpactoY = H - 8;
        const pps = this.obterPixelsPorSegundo(H);
        ctx.clearRect(0, 0, W, H);

        ctx.save();
        for (let k in this.layoutOitava3) {
            const col = this.layoutOitava3[k];
            const colX = col.xPct * W;
            const colW = col.wPct * W;

            if (!col.ehPreta) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(colX, 0, colW, H);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.strokeRect(colX, 0, colW, H);
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                ctx.fillRect(colX, 0, colW, H);
            }
        }
        ctx.restore();

        ctx.save();
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, linhaImpactoY);
        ctx.lineTo(W, linhaImpactoY);
        ctx.stroke();
        ctx.restore();

        if (!this.acordesNaEsteira || this.acordesNaEsteira.length === 0) return;

        this.acordesNaEsteira.forEach(acorde => {
            const distTempo = acorde.tInicio - this.tempoMusicaSegundos;
            const yBase = linhaImpactoY - (distTempo * pps);
            const alturaBloco = Math.max(18, acorde.durSegundos * pps);
            const yTopo = yBase - alturaBloco;

            if (yBase < -20 || yTopo > H + 20) return;

            acorde.notas.forEach(notaCod => {
                const col = this.layoutOitava3[notaCod];
                if (!col) return;

                const colX = col.xPct * W;
                const colW = col.wPct * W;

                ctx.save();
                const estaNoImpacto = this.tempoMusicaSegundos >= acorde.tInicio && this.tempoMusicaSegundos <= acorde.tFim;
                if (estaNoImpacto) {
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 12;
                }

                const grad = ctx.createLinearGradient(colX, yTopo, colX + colW, yBase);
                grad.addColorStop(0, '#f59e0b');
                grad.addColorStop(1, '#fed7aa');

                ctx.fillStyle = grad;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.6;

                ctx.beginPath();
                ctx.roundRect(colX + 2, yTopo, colW - 4, alturaBloco, 6);
                ctx.fill();
                ctx.stroke();

                const infoF = this.tabelaFrequencias[notaCod];
                if (infoF && alturaBloco >= 24) {
                    ctx.fillStyle = '#7c2d12';
                    ctx.font = 'bold 9.5px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(infoF.nome, colX + colW / 2, yBase - 5);
                }
                ctx.restore();
            });
        });
    },

    configurarEventosMultitoque: function() {
        if (this.eventosConfigurados) return;
        this.eventosConfigurados = true;

        const associarTeclasDeContainer = (container, fatorVol = 1.0, seletorOrigem = 'solo') => {
            if (!container) return;
            const teclas = container.querySelectorAll('.tecla-branca-piano, .tecla-preta-piano');
            teclas.forEach(tecla => {
                const nota = tecla.getAttribute('data-nota');

                tecla.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    try { tecla.setPointerCapture(e.pointerId); } catch(err) {}
                    this.pressionarNota(nota, e.pointerId, tecla, fatorVol, seletorOrigem);
                }, { passive: false });

                tecla.addEventListener('pointerup', (e) => {
                    e.preventDefault();
                    try { tecla.releasePointerCapture(e.pointerId); } catch(err) {}
                    this.soltarNota(nota, e.pointerId, tecla);
                }, { passive: false });

                tecla.addEventListener('pointercancel', (e) => {
                    e.preventDefault();
                    try { tecla.releasePointerCapture(e.pointerId); } catch(err) {}
                    this.soltarNota(nota, e.pointerId, tecla);
                }, { passive: false });

                tecla.addEventListener('pointerleave', (e) => {
                    if (!tecla.hasPointerCapture || !tecla.hasPointerCapture(e.pointerId)) {
                        if (this.teclasAtivasPorPointer[e.pointerId] === nota) {
                            this.soltarNota(nota, e.pointerId, tecla);
                        }
                    }
                }, { passive: false });
            });
        };

        // Teclados e suas origens de timbre
        associarTeclasDeContainer(document.getElementById('teclado-piano-completo'), 1.0, 'solo');
        associarTeclasDeContainer(document.getElementById('teclado-dueto-melodia'), 1.0, 'dueto-j1');
        associarTeclasDeContainer(document.getElementById('teclado-dueto-harmonia'), 0.85, 'dueto-j2');

        // Modo Livre: cada oitava com sua identificação
        associarTeclasDeContainer(document.getElementById('teclado-livre-subgrave'), 1.0, 'livre-2');
        associarTeclasDeContainer(document.getElementById('teclado-livre-grave'), 1.0, 'livre-3');
        associarTeclasDeContainer(document.getElementById('teclado-livre-medio'), 1.0, 'livre-4');
        associarTeclasDeContainer(document.getElementById('teclado-livre-agudo'), 1.0, 'livre-5');

        window.addEventListener('pointerup', (e) => {
            if (this.teclasAtivasPorPointer[e.pointerId]) {
                this.soltarNota(this.teclasAtivasPorPointer[e.pointerId], e.pointerId);
            }
        });

        window.addEventListener('pointercancel', (e) => {
            if (this.teclasAtivasPorPointer[e.pointerId]) {
                this.soltarNota(this.teclasAtivasPorPointer[e.pointerId], e.pointerId);
            }
        });

        window.addEventListener('touchend', (e) => {
            if (e.touches && e.touches.length === 0) this.pararTodasNotas();
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pararMusicaEContadores();
        });
    },

    obterInstrumentoPorOrigem: function(seletorOrigem) {
        if (seletorOrigem === 'solo') return this.timbreSolo;
        if (seletorOrigem === 'dueto-j1') return this.timbreDuetoJ1;
        if (seletorOrigem === 'dueto-j2') return this.timbreDuetoJ2;
        if (seletorOrigem === 'livre-2') return this.timbresLivres[2] || 'piano';
        if (seletorOrigem === 'livre-3') return this.timbresLivres[3] || 'piano';
        if (seletorOrigem === 'livre-4') return this.timbresLivres[4] || 'piano';
        if (seletorOrigem === 'livre-5') return this.timbresLivres[5] || 'piano';
        return 'piano';
    },

    pressionarNota: function(codigoNota, pointerId, elTecla, fatorVol = 1.0, seletorOrigem = 'solo') {
        // 1. REGRA: MODO INDIVIDUAL (APRENDIZADO)
        // Dispara nota cacofônica se errar a nota esperada
        if (this.modo === 'aprendizado') {
            const mus = this.catalogoMusicas[this.musicaIndex];
            const notaEsperada = (mus && mus.melodia && mus.melodia[this.passoNota]) ? mus.melodia[this.passoNota].n : null;

            if (notaEsperada && codigoNota !== notaEsperada) {
                if (window.AudioMotor && typeof window.AudioMotor.tocarSomCacofonico === 'function') {
                    window.AudioMotor.tocarSomCacofonico();
                }
                if (navigator.vibrate) try { navigator.vibrate([40, 30, 40]); } catch(e) {}
                if (elTecla) {
                    elTecla.classList.add('nota-errada');
                    setTimeout(() => elTecla.classList.remove('nota-errada'), 250);
                }
                return; // Bloqueia o som convencional da nota e não avança a melodia
            }
        }

        // 2. TOQUE PERMITIDO (Modo Livre, Dueto ou Nota Correta no Individual)
        const info = this.tabelaFrequencias[codigoNota];
        if (!info) return;

        const chaveVoz = `${codigoNota}_${pointerId}`;
        this.teclasAtivasPorPointer[pointerId] = codigoNota;
        this.contagemDedosPorNota[codigoNota] = (this.contagemDedosPorNota[codigoNota] || 0) + 1;

        const instrumentoEscolhido = this.obterInstrumentoPorOrigem(seletorOrigem);

        if (window.AudioMotor && typeof window.AudioMotor.iniciarVozPiano === 'function') {
            window.AudioMotor.iniciarVozPiano(chaveVoz, info.freq, fatorVol, instrumentoEscolhido);
        }
        if (navigator.vibrate) try { navigator.vibrate(22); } catch(e) {}

        if (elTecla) {
            elTecla.classList.add('tocando');
            this.soltarNotaFlutuante(elTecla);
        }

        if (this.modo === 'aprendizado' && this.fatorVelocidade === 'toque') {
            const mus = this.catalogoMusicas[this.musicaIndex];
            if (mus && mus.melodia && mus.melodia[this.passoNota]) {
                if (codigoNota === mus.melodia[this.passoNota].n) {
                    this.passoNota++;
                    if (this.passoNota >= mus.melodia.length) {
                        this.concluirMusica(mus.titulo);
                    } else {
                        const prox = this.notasNaEsteira[this.passoNota];
                        if (prox) this.tempoMusicaSegundos = prox.tInicio;
                        this.atualizarDisplays();
                        this.renderizarTodasEsteiras();
                    }
                }
            }
        }
    },

    soltarNota: function(codigoNota, pointerId, elTecla) {
        const chaveVoz = `${codigoNota}_${pointerId}`;
        if (window.AudioMotor && typeof window.AudioMotor.soltarVozPiano === 'function') {
            window.AudioMotor.soltarVozPiano(chaveVoz);
        }
        delete this.teclasAtivasPorPointer[pointerId];

        if (this.contagemDedosPorNota[codigoNota]) {
            this.contagemDedosPorNota[codigoNota]--;
            if (this.contagemDedosPorNota[codigoNota] <= 0) {
                delete this.contagemDedosPorNota[codigoNota];
                if (elTecla) elTecla.classList.remove('tocando');
            }
        } else {
            if (elTecla) elTecla.classList.remove('tocando');
        }
    },

    pararTodasNotas: function() {
        if (window.AudioMotor && typeof window.AudioMotor.soltarTodasVozesPiano === 'function') {
            window.AudioMotor.soltarTodasVozesPiano();
        }
        this.teclasAtivasPorPointer = {};
        this.contagemDedosPorNota = {};
        document.querySelectorAll('.tecla-branca-piano, .tecla-preta-piano').forEach(el => {
            el.classList.remove('tocando');
        });
    },

    // MÉTODOS DE CONTROLO DE TIMBRES INDEPENDENTES
    trocarTimbreSolo: function(timbre) {
        this.timbreSolo = timbre;
        ['piano', 'cordas', 'xilofone'].forEach(t => {
            const btn = document.getElementById(`btn-timbre-solo-${t}`);
            if (btn) btn.classList.toggle('ativo', t === timbre);
        });
    },

    trocarTimbreDueto: function(jogador, timbre, btnClicado) {
        if (jogador === 'j1') this.timbreDuetoJ1 = timbre;
        if (jogador === 'j2') this.timbreDuetoJ2 = timbre;

        const container = document.getElementById(`timbre-dueto-${jogador}`);
        if (container) {
            container.querySelectorAll('.btn-mini-timbre').forEach(b => b.classList.remove('ativo'));
            if (btnClicado) btnClicado.classList.add('ativo');
        }
    },

    trocarTimbreOitava: function(oitavaNum, timbre, btnClicado) {
        this.timbresLivres[oitavaNum] = timbre;
        const container = document.getElementById(`timbre-oitava-${oitavaNum}`);
        if (container) {
            container.querySelectorAll('.btn-mini-timbre').forEach(b => b.classList.remove('ativo'));
            if (btnClicado) btnClicado.classList.add('ativo');
        }
    },

    trocarModo: function(novoModo) {
        this.pararMusicaEContadores();
        this.modo = novoModo;

        const barraTopo = document.getElementById('barra-topo-arcade');
        if (barraTopo) {
            barraTopo.style.display = novoModo === 'dueto' ? 'none' : 'flex';
        }

        const telaSimon = document.getElementById('tela-simon');
        if (telaSimon) {
            if (novoModo === 'dueto') {
                telaSimon.style.padding = '0';
                telaSimon.style.overflow = 'hidden';
            } else {
                telaSimon.style.padding = '6px 10px';
                telaSimon.style.overflowY = 'auto';
            }
        }

        const tabA = document.getElementById('tab-piano-aprendizado');
        const tabL = document.getElementById('tab-piano-livre');
        const tabD = document.getElementById('tab-piano-dueto');
        if (tabA) tabA.classList.toggle('ativo', novoModo === 'aprendizado');
        if (tabL) tabL.classList.toggle('ativo', novoModo === 'livre');
        if (tabD) tabD.classList.toggle('ativo', novoModo === 'dueto');

        const tabsSeletor = document.getElementById('tabs-piano-seletor-modos');
        const boxAprendizado = document.getElementById('painel-aprendizado-box');
        const boxLivre = document.getElementById('painel-livre-box');
        const pistaSolo = document.getElementById('pista-esteira-box');
        const tecladoSolo = document.getElementById('teclado-piano-completo');
        const containerLivre = document.getElementById('container-teclados-livre');
        const containerDueto = document.getElementById('container-dueto-piano-2p');

        if (novoModo === 'dueto') {
            if (tabsSeletor) tabsSeletor.style.display = 'none';
            if (boxAprendizado) boxAprendizado.style.display = 'none';
            if (boxLivre) boxLivre.style.display = 'none';
            if (pistaSolo) pistaSolo.style.display = 'none';
            if (tecladoSolo) tecladoSolo.style.display = 'none';
            if (containerLivre) containerLivre.style.display = 'none';
            if (containerDueto) containerDueto.style.display = 'flex';
        } else if (novoModo === 'livre') {
            if (tabsSeletor) tabsSeletor.style.display = 'flex';
            if (boxAprendizado) boxAprendizado.style.display = 'none';
            if (boxLivre) boxLivre.style.display = 'block';
            if (pistaSolo) pistaSolo.style.display = 'none';
            if (tecladoSolo) tecladoSolo.style.display = 'none';
            if (containerLivre) containerLivre.style.display = 'flex';
            if (containerDueto) containerDueto.style.display = 'none';
            this.limparBrilhosTeclas();
        } else {
            if (tabsSeletor) tabsSeletor.style.display = 'flex';
            if (boxAprendizado) boxAprendizado.style.display = 'block';
            if (boxLivre) boxLivre.style.display = 'none';
            if (pistaSolo) pistaSolo.style.display = 'block';
            if (tecladoSolo) tecladoSolo.style.display = 'flex';
            if (containerLivre) containerLivre.style.display = 'none';
            if (containerDueto) containerDueto.style.display = 'none';
        }

        this.passoNota = 0;
        this.passoAcorde = 0;
        this.popularSeletoresMusica();
        if (this.catalogoMusicas.length > 0) {
            this.selecionarMusica(this.musicaIndex || 0);
        }

        setTimeout(() => {
            this.inicializarCanvasEsteiras();
            this.renderizarTodasEsteiras();
        }, 100);
    },

    selecionarMusica: function(idx) {
        this.pararMusicaEContadores();
        this.musicaIndex = parseInt(idx, 10) || 0;
        this.passoNota = 0;
        this.passoAcorde = 0;
        this.tempoMusicaSegundos = 0;

        const s1 = document.getElementById('seletor-musica-alvo');
        const s2 = document.getElementById('seletor-musica-dueto');
        if (s1) s1.value = this.musicaIndex;
        if (s2) s2.value = this.musicaIndex;

        this.construirTrilhasMelodiaEHarmonia();
        this.atualizarDisplays();
        this.renderizarTodasEsteiras();
    },

    atualizarDisplays: function() {
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) return;
        const mus = this.catalogoMusicas[this.musicaIndex] || this.catalogoMusicas[0];
        const notaItem = (mus.melodia && mus.melodia[this.passoNota]) ? mus.melodia[this.passoNota] : (mus.melodia ? mus.melodia[0] : null);
        const infoNota = notaItem ? this.tabelaFrequencias[notaItem.n] : null;
        const acordeItem = (mus.harmonia && mus.harmonia[this.passoAcorde]) ? mus.harmonia[this.passoAcorde] : (mus.harmonia ? mus.harmonia[0] : null);

        const elNotaTxt = document.getElementById('txt-nota-alvo-aprendizado');
        if (elNotaTxt && infoNota) elNotaTxt.textContent = infoNota.nome;

        const elMelodiaDueto = document.getElementById('badge-melodia-alvo-dueto');
        if (elMelodiaDueto && infoNota) elMelodiaDueto.textContent = `Nota: ${infoNota.nome}`;

        const elAcordeDueto = document.getElementById('badge-acorde-alvo-dueto');
        if (elAcordeDueto && acordeItem) elAcordeDueto.textContent = `Acorde: ${acordeItem.nome}`;

        const containerDots = document.getElementById('dots-progresso-musica');
        if (containerDots && mus.melodia) {
            containerDots.innerHTML = mus.melodia.map((_, i) => {
                let classe = 'dot-nota';
                if (i < this.passoNota) classe += ' concluido';
                else if (i === this.passoNota) classe += ' atual';
                return `<div class="${classe}"></div>`;
            }).join('');
        }

        this.limparBrilhosTeclas();

        const tecladoSolo = document.getElementById('teclado-piano-completo');
        if (tecladoSolo && notaItem) {
            const tecla = tecladoSolo.querySelector(`[data-nota="${notaItem.n}"]`);
            if (tecla) tecla.classList.add('alvo-brilhando');
        }

        const tecladoMelodiaDueto = document.getElementById('teclado-dueto-melodia');
        if (tecladoMelodiaDueto && notaItem) {
            const tecla = tecladoMelodiaDueto.querySelector(`[data-nota="${notaItem.n}"]`);
            if (tecla) tecla.classList.add('alvo-brilhando');
        }

        const tecladoHarmoniaDueto = document.getElementById('teclado-dueto-harmonia');
        if (tecladoHarmoniaDueto && acordeItem && acordeItem.notas) {
            acordeItem.notas.forEach(n => {
                const tecla = tecladoHarmoniaDueto.querySelector(`[data-nota="${n}"]`);
                if (tecla) tecla.classList.add('harmonia-brilhando');
            });
        }
    },

    limparBrilhosTeclas: function() {
        document.querySelectorAll('.tecla-branca-piano, .tecla-preta-piano').forEach(el => {
            el.classList.remove('alvo-brilhando', 'harmonia-brilhando');
        });
    },

    soltarNotaFlutuante: function(el) {
        const rect = el.getBoundingClientRect();
        const container = document.getElementById('tela-simon');
        if (!container) return;
        const nota = document.createElement('div');
        nota.className = 'nota-musical-voando';
        nota.textContent = Math.random() < 0.5 ? '♪' : '♫';
        nota.style.left = `${rect.left + rect.width / 2 - 8}px`;
        nota.style.top = `${rect.top - 12}px`;
        container.appendChild(nota);
        setTimeout(() => nota.remove(), 800);
    },

    concluirMusica: function(nomeMusica) {
        this.pararMusicaEContadores();

        // No modo DUETO, não credita moedas
        const ehDueto = (this.modo === 'dueto');
        if (!ehDueto) {
            if (window.GerenciadorArcade && typeof window.GerenciadorArcade.adicionarMoedas === 'function') {
                window.GerenciadorArcade.adicionarMoedas(5);
            }
        }

        if (window.AudioMotor && typeof window.AudioMotor.tocarTom === 'function') {
            window.AudioMotor.tocarTom(880, 0.3);
            setTimeout(() => window.AudioMotor.tocarTom(1046.5, 0.4), 160);
        }

        const txtAlvo = document.getElementById('txt-nota-alvo-aprendizado');
        if (txtAlvo) txtAlvo.innerHTML = "<span style='color:#10b981;'>PARABÉNS!</span>";

        const msgEl = document.getElementById('txt-msg-conclusao-musica');
        if (msgEl) {
            if (ehDueto) {
                msgEl.innerHTML = `Dueto concluído com sucesso em <strong>"${nomeMusica}"</strong>! 🎵`;
            } else {
                msgEl.innerHTML = `Incrível! Concluiu <strong>"${nomeMusica}"</strong> e faturou <strong>+5 Moedas! 🪙</strong>`;
            }
        }

        const overEl = document.getElementById('over-simon');
        if (overEl) overEl.style.display = 'flex';
    },

    avancarProximaMusica: function() {
        this.fecharModalConclusao();
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) return;
        this.musicaIndex = (this.musicaIndex + 1) % this.catalogoMusicas.length;
        this.passoNota = 0;
        this.passoAcorde = 0;
        this.selecionarMusica(this.musicaIndex);
    },

    fecharModalConclusao: function() {
        this.pararMusicaEContadores();
        const overEl = document.getElementById('over-simon');
        if (overEl) overEl.style.display = 'none';
    }
};

// 3. INICIALIZAÇÃO AUTOMÁTICA
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MotorMusica.montar());
} else {
    window.MotorMusica.montar();
}
