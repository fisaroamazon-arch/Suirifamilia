// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-PIANO.JS (100% COMPLETO E INTEGRAL)
// Módulo: Sintetizador Acústico, Teclados e Esteiras Synthesia (Solo e Dueto)
// Design System Warm Tech: Suporte Retina/HiDPI, Partículas e Gradientes
// =========================================================================

// 1. MOTOR ACÚSTICO AUTÓNOMO (PIANO, CORDAS E XILOFONE)
window.AudioMotor = window.AudioMotor || {
    ctx: null,
    masterGain: null,
    compressor: null,
    ondaCordas: null,
    ruidoMartelo: null,
    vozesAtivas: {},
    instrumento: 'piano',
    amostras: {
        piano: {duracao: 6, soltura: .23},
        cordas: {duracao: 12, soltura: .16},
        xilofone: {duracao: 3, soltura: .28}
    },

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

    obterOndaCordas: function(ctx) {
        if (!this.ondaCordas) {
            const corpo = [0, 1, .46, .56, .32, .18, .22, .14, .12, .08, .07, .05];
            this.ondaCordas = ctx.createPeriodicWave(new Float32Array(corpo.length), new Float32Array(corpo));
        }
        return this.ondaCordas;
    },

    obterRuidoMartelo: function(ctx) {
        if (!this.ruidoMartelo) {
            this.ruidoMartelo = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .024), ctx.sampleRate);
            const amostras = this.ruidoMartelo.getChannelData(0);
            for (let i = 0; i < amostras.length; i++) {
                amostras[i] = (Math.random() * 2 - 1) * (1 - i / amostras.length) ** 3;
            }
        }
        return this.ruidoMartelo;
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

    carregarAmostra: function(tipo) {
        const amostra = this.amostras[tipo];
        const ctx = this.obterCtx();
        if (!amostra || !ctx) return Promise.resolve(null);
        if (!amostra.carregando) {
            amostra.carregando = fetch(`assets/audio/piano/${tipo}.mp3`)
                .then(resposta => {
                    if (!resposta.ok) throw new Error('Amostra indisponível');
                    return resposta.arrayBuffer();
                })
                .then(bytes => ctx.decodeAudioData(bytes))
                .then(buffer => { amostra.buffer = buffer; })
                .catch(() => { amostra.carregando = null; });
        }
        return amostra.carregando;
    },

    iniciarAmostra: function(chave, freq, volume, amostra) {
        const ctx = this.ctx;
        const midi = 69 + 12 * Math.log2(freq / 440);
        const indice = Math.max(0, Math.min(8, Math.round((midi - 36) / 6)));
        const fonte = ctx.createBufferSource();
        const saida = ctx.createGain();
        const voz = {fontes: [fonte], saida, soltura: amostra.soltura};
        fonte.buffer = amostra.buffer;
        fonte.playbackRate.value = 2 ** ((midi - 36 - indice * 6) / 12);
        saida.gain.value = Math.min(volume, 1) * .88;
        fonte.connect(saida).connect(this.obterSaida());
        fonte.onended = () => {
            if (this.vozesAtivas[chave] === voz) delete this.vozesAtivas[chave];
            fonte.disconnect();
            saida.disconnect();
        };
        this.vozesAtivas[chave] = voz;
        fonte.start(0, indice * amostra.duracao, amostra.duracao);
    },

    iniciarVozPiano: function(chave, freq, fatorVolume = 1.0, tipoInstrumento = null) {
        const ctx = this.obterCtx();
        if (!ctx || !Number.isFinite(freq) || freq <= 0 || freq >= ctx.sampleRate * .46 || !Number.isFinite(fatorVolume) || fatorVolume <= 0) return;
        this.soltarVozPiano(chave);

        const agora = ctx.currentTime;
        const tipo = tipoInstrumento || this.instrumento;
        const amostra = this.amostras[tipo];
        if (amostra?.buffer) {
            this.iniciarAmostra(chave, freq, fatorVolume, amostra);
            return;
        }
        this.carregarAmostra(tipo);
        const saida = ctx.createGain();
        saida.connect(this.obterSaida());
        const fontes = [];
        const nos = [saida];
        let duracao = 0;
        let soltura = .16;

        const parcial = (multiplo, volume, ataque, decaimento) => {
            if (freq * multiplo >= ctx.sampleRate * .46) return;
            const oscilador = ctx.createOscillator();
            const envelope = ctx.createGain();
            oscilador.frequency.value = freq * multiplo;
            envelope.gain.setValueAtTime(.00001, agora);
            envelope.gain.exponentialRampToValueAtTime(volume, agora + ataque);
            envelope.gain.exponentialRampToValueAtTime(.00001, agora + decaimento);
            oscilador.connect(envelope).connect(saida);
            fontes.push(oscilador);
            nos.push(envelope);
        };

        if (tipo === 'xilofone') {
            // A lâmina de madeira ressoa primeiro na fundamental e em modos não harmônicos.
            const cauda = Math.min(1.25, Math.max(.48, .84 * (440 / freq) ** .22));
            parcial(1, .55, .0025, cauda);
            parcial(3.0, .22, .0015, cauda * .48);
            parcial(6.27, .075, .001, cauda * .22);
            parcial(9.1, .035, .001, cauda * .12);
            duracao = cauda;
            soltura = .13;
        } else if (tipo === 'cordas') {
            // O arco entra gradualmente e o corpo do instrumento colore os harmônicos.
            const corda = ctx.createOscillator();
            const vibrato = ctx.createOscillator();
            const larguraVibrato = ctx.createGain();
            const corpo = ctx.createBiquadFilter();
            corda.setPeriodicWave(this.obterOndaCordas(ctx));
            corda.frequency.value = freq;
            corpo.type = 'peaking';
            corpo.frequency.value = Math.max(900, Math.min(2350, freq * 2.6));
            corpo.Q.value = 1.15;
            corpo.gain.value = 4;
            vibrato.frequency.value = 5.3;
            larguraVibrato.gain.setValueAtTime(0, agora);
            larguraVibrato.gain.linearRampToValueAtTime(13, agora + .46);
            vibrato.connect(larguraVibrato).connect(corda.detune);
            corda.connect(corpo).connect(saida);
            fontes.push(corda, vibrato);
            nos.push(larguraVibrato, corpo);
            soltura = .20;
        } else {
            // O martelo realça os parciais agudos, que decaem antes do corpo da nota.
            const cauda = Math.min(9, Math.max(3.1, 6.4 * (440 / freq) ** .25));
            parcial(1, .43, .007, cauda);
            parcial(1.0015, .13, .013, cauda * .78);
            parcial(2.001, .21, .005, cauda * .54);
            parcial(3.006, .12, .004, cauda * .36);
            parcial(4.014, .072, .0035, cauda * .22);
            parcial(5.029, .035, .003, cauda * .15);
            parcial(7.067, .018, .0025, cauda * .095);
            const martelo = ctx.createBufferSource();
            const filtro = ctx.createBiquadFilter();
            const volumeMartelo = ctx.createGain();
            martelo.buffer = this.obterRuidoMartelo(ctx);
            filtro.type = 'bandpass';
            filtro.frequency.value = Math.min(4500, Math.max(900, freq * 4));
            volumeMartelo.gain.value = .14;
            martelo.connect(filtro).connect(volumeMartelo).connect(saida);
            fontes.push(martelo);
            nos.push(filtro, volumeMartelo);
            duracao = cauda;
        }

        const volume = Math.min(fatorVolume, 1) * (tipo === 'cordas' ? .35 : .58);
        if (tipo === 'cordas') {
            saida.gain.setValueAtTime(.00001, agora);
            saida.gain.linearRampToValueAtTime(volume, agora + .075);
            saida.gain.linearRampToValueAtTime(volume * .82, agora + .22);
        } else {
            saida.gain.setValueAtTime(volume, agora);
        }

        const voz = { fontes, nos, saida, soltura };
        this.vozesAtivas[chave] = voz;
        fontes[0].onended = () => {
            if (this.vozesAtivas[chave] === voz) delete this.vozesAtivas[chave];
            fontes.forEach(fonte => fonte.disconnect());
            nos.forEach(no => no.disconnect());
        };
        fontes.forEach(fonte => {
            fonte.start(agora);
            if (duracao) fonte.stop(agora + duracao + .025);
        });
    },

    soltarVozPiano: function(chave) {
        const voz = this.vozesAtivas[chave];
        if (!voz) return;
        delete this.vozesAtivas[chave];

        const agora = this.ctx.currentTime;
        const envelope = voz.saida.gain;
        if (envelope.cancelAndHoldAtTime) {
            envelope.cancelAndHoldAtTime(agora);
        } else {
            const amplitude = envelope.value;
            envelope.cancelScheduledValues(agora);
            envelope.setValueAtTime(amplitude, agora);
        }
        const fim = agora + voz.soltura;
        envelope.linearRampToValueAtTime(0, fim);
        voz.fontes.forEach(fonte => fonte.stop(fim + .015));
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

            osc1.frequency.setValueAtTime(138.59, t);
            osc2.frequency.setValueAtTime(196.00, t);
            osc3.frequency.setValueAtTime(92.50, t);

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
    estiloMusica: 'infantil',
    comBanda: false,
    eventosBanda: [],
    indiceBanda: 0,
    vidas: 3,
    acertosParaVida: 0,
    encerrada: false,
    notasDoAcorde: new Set(),
    acertosVisuais: new Set(),
    efeitosEsteira: [],
    animVisualId: null,
    deslizarTeclas: true,
    desafioLivre: false,
    proximaNotaLivre: null,
    eventosConfigurados: false,
    teclasAtivasPorPointer: {},
    contagemDedosPorNota: {},

    timbreSolo: 'piano',
    timbreDuetoJ1: 'piano',
    timbreDuetoJ2: 'piano',
    timbresLivres: {
        2: 'piano',
        3: 'piano',
        4: 'piano',
        5: 'piano'
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

    tabelaFrequencias: {
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
        if (!this.observadorEsteiras && typeof ResizeObserver !== 'undefined') {
            this.observadorEsteiras = new ResizeObserver(entradas => {
                if (!entradas.some(entrada => entrada.contentRect.width && entrada.contentRect.height)) return;
                this.inicializarCanvasEsteiras();
                this.renderizarTodasEsteiras();
            });
            [this.cvSolo, this.cvDuetoMelodia, this.cvDuetoHarmonia].forEach(canvas => {
                if (canvas?.parentElement) this.observadorEsteiras.observe(canvas.parentElement);
            });
        }
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

    ajustarCanvasDpi: function(canvas, larguraCss, alturaCss) {
        if (!canvas) return null;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(larguraCss * dpr);
        canvas.height = Math.round(alturaCss * dpr);
        canvas.style.width = larguraCss + 'px';
        canvas.style.height = alturaCss + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return ctx;
    },

    inicializarCanvasEsteiras: function() {
        this.cvSolo = document.getElementById('cv-esteira-piano');
        if (this.cvSolo && this.cvSolo.parentElement) {
            const rS = this.cvSolo.parentElement.getBoundingClientRect();
            const w = rS.width || 390;
            const h = rS.height || 160;
            this.ctxSolo = this.ajustarCanvasDpi(this.cvSolo, w, h);
            this.cvSolo._cssWidth = w;
            this.cvSolo._cssHeight = h;
        }

        this.cvDuetoMelodia = document.getElementById('cv-esteira-dueto-melodia');
        if (this.cvDuetoMelodia && this.cvDuetoMelodia.parentElement) {
            const rM = this.cvDuetoMelodia.parentElement.getBoundingClientRect();
            const w = rM.width || 390;
            const h = rM.height || 180;
            this.ctxDuetoMelodia = this.ajustarCanvasDpi(this.cvDuetoMelodia, w, h);
            this.cvDuetoMelodia._cssWidth = w;
            this.cvDuetoMelodia._cssHeight = h;
        }

        this.cvDuetoHarmonia = document.getElementById('cv-esteira-dueto-harmonia');
        if (this.cvDuetoHarmonia && this.cvDuetoHarmonia.parentElement) {
            const rH = this.cvDuetoHarmonia.parentElement.getBoundingClientRect();
            const w = rH.width || 390;
            const h = rH.height || 180;
            this.ctxDuetoHarmonia = this.ajustarCanvasDpi(this.cvDuetoHarmonia, w, h);
            this.cvDuetoHarmonia._cssWidth = w;
            this.cvDuetoHarmonia._cssHeight = h;
        }
    },

    popularSeletoresMusica: function() {
        document.querySelectorAll('[data-estilo-piano]').forEach(select => { select.value = this.estiloMusica; });
        const opcoes = this.catalogoMusicas.map((musica, idx) => ({musica,idx}))
            .filter(({musica}) => (musica.estilo || 'infantil') === this.estiloMusica);
        for (const id of ['seletor-musica-alvo','seletor-musica-dueto']) {
            const select = document.getElementById(id);
            if (!select) continue;
            const itens = opcoes.map(({musica,idx}) => {
                const item = document.createElement('option');
                item.value = idx;
                const segundos = Math.round(musica.melodia.reduce((total, nota) => total + nota.d, 0) * 60 / (musica.bpm || 90));
                const duracao = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
                item.textContent = `${musica.titulo} · ${duracao}`;
                return item;
            });
            select.replaceChildren(...itens);
            select.value = this.musicaIndex;
        }
    },

    selecionarEstilo: function(estilo) {
        const indice = this.catalogoMusicas.findIndex(m => (m.estilo || 'infantil') === estilo);
        if (indice >= 0) this.selecionarMusica(indice);
    },

    tempoParaAcertar: function() {
        return (60 / (this.catalogoMusicas[this.musicaIndex]?.bpm || 90)) * .62;
    },

    desenharFaixaAcerto: function(ctx, largura, altura, pps) {
        const margem = this.tempoParaAcertar() * pps;
        const centro = altura - margem - 3;
        ctx.save();
        ctx.fillStyle = '#ffd5ae13';
        ctx.fillRect(0, centro - margem, largura, margem * 2);
        ctx.setLineDash([4,5]);
        ctx.strokeStyle = '#ffd6a67a';
        for (const borda of [centro - margem, centro + margem]) {
            ctx.beginPath();
            ctx.moveTo(0, borda);
            ctx.lineTo(largura, borda);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        const alvo = ctx.createLinearGradient(0, centro, largura, centro);
        alvo.addColorStop(0, '#d98552');
        alvo.addColorStop(.5, '#ffcb84');
        alvo.addColorStop(1, '#d98552');
        ctx.shadowColor = '#f4aa62';
        ctx.shadowBlur = 7;
        ctx.fillStyle = alvo;
        ctx.fillRect(0, centro - 2, largura, 4);
        ctx.restore();
        return centro;
    },

    emFaixa: function(nota) {
        const margem = this.tempoParaAcertar();
        return Math.abs(this.tempoMusicaSegundos - nota.tInicio) <= margem;
    },

    alterarBanda: function(ligada) {
        this.comBanda = ligada;
        if (!ligada) window.BandaPiano?.parar();
        document.querySelectorAll('[data-banda]').forEach(botao => {
            botao.setAttribute('aria-pressed', String(botao.dataset.banda === (ligada ? 'com' : 'sem')));
        });
    },

    tocarBandaAte: function(tempoSegundos) {
        const musica = this.catalogoMusicas[this.musicaIndex];
        const batidas = tempoSegundos * (musica.bpm || 90) / 60;
        while (this.eventosBanda[this.indiceBanda]?.tempo <= batidas + .001) {
            const evento = this.eventosBanda[this.indiceBanda++];
            if (this.comBanda) window.BandaPiano?.tocar(evento, this.obterBpmEfetivo());
        }
    },

    baixarBanda: function() {
        const musica = this.catalogoMusicas[this.musicaIndex];
        if (musica) window.BandaPiano?.baixar(musica, this.eventosBanda, this.obterBpmEfetivo());
    },

    registrarErro: function() {
        if (this.encerrada) return true;
        this.vidas--;
        this.atualizarDisplays();
        if (this.vidas > 0) return false;
        this.encerrada = true;
        this.pararMusicaEContadores();
        this.mostrarResultado(false);
        return true;
    },

    registrarAcerto: function() {
        this.acertosParaVida++;
        if (this.acertosParaVida === 10) {
            this.acertosParaVida = 0;
            this.vidas++;
        }
    },

    conferirAtrasos: function() {
        const margem = this.tempoParaAcertar();
        const trilhas = [[this.notasNaEsteira, 'passoNota']];
        if (this.modo === 'dueto') trilhas.push([this.acordesNaEsteira, 'passoAcorde']);
        for (const [trilha, campo] of trilhas) {
            while (trilha[this[campo]] && this.tempoMusicaSegundos > trilha[this[campo]].tInicio + margem) {
                this[campo]++;
                if (campo === 'passoAcorde') this.notasDoAcorde.clear();
                if (this.registrarErro()) return false;
            }
        }
        return true;
    },

    alterarDeslize: function(ligado) {
        this.deslizarTeclas = ligado;
        document.querySelectorAll('[data-deslize-piano]').forEach(campo => { campo.checked = ligado; });
    },

    alterarDesafioLivre: function(ligado) {
        this.desafioLivre = ligado;
        this.reiniciarMusica();
    },

    sortearNotaLivre: function() {
        const notas = Object.keys(this.layoutOitava4).filter(nota => nota !== this.proximaNotaLivre);
        this.proximaNotaLivre = notas[Math.floor(Math.random() * notas.length)];
    },

    marcarNotaErrada: function(tecla) {
        tecla?.classList.add('nota-errada');
        if (tecla) setTimeout(() => tecla.classList.remove('nota-errada'), 250);
        this.registrarErro();
    },

    avaliarNota: function(codigo, origem, tecla, ponteiro) {
        if (this.modo === 'livre') {
            if (!this.desafioLivre || this.encerrada || !this.proximaNotaLivre) return;
            if (codigo !== this.proximaNotaLivre) {
                this.marcarNotaErrada(tecla);
            } else {
                this.registrarAcerto();
                this.sortearNotaLivre();
                this.atualizarDisplays();
            }
            return;
        }
        if (!this.tocandoMusica) return;
        if (this.fatorVelocidade !== 'toque' && !this.conferirAtrasos()) return;
        const harmonia = origem === 'dueto-j2';
        const trilha = harmonia ? this.acordesNaEsteira : this.notasNaEsteira;
        const campo = harmonia ? 'passoAcorde' : 'passoNota';
        const item = trilha[this[campo]];
        if (!item) return;

        const modoToque = this.fatorVelocidade === 'toque';
        if (!modoToque && !this.emFaixa(item)) return;
        const acertou = harmonia ? item.notas.includes(codigo) : item.nota === codigo;
        if (!acertou) {
            if (!modoToque) {
                this[campo]++;
                if (harmonia) this.notasDoAcorde.clear();
            }
            this.marcarNotaErrada(tecla);
            return;
        }

        if (harmonia && this.notasDoAcorde.has(codigo)) return;
        this.registrarAcertoVisual(harmonia, item, codigo, ponteiro);
        this.registrarAcerto();
        if (harmonia) {
            this.notasDoAcorde.add(codigo);
            if (!item.notas.every(nota => this.notasDoAcorde.has(nota))) {
                this.atualizarDisplays();
                return;
            }
            this.notasDoAcorde.clear();
        }
        this[campo]++;
        if (modoToque) {
            this.tocarBandaAte(item.tInicio);
            const proxima = trilha[this[campo]];
            if (proxima) this.tempoMusicaSegundos = proxima.tInicio;
            if (!proxima) {
                this.concluirMusica(this.catalogoMusicas[this.musicaIndex].titulo);
                return;
            }
            this.renderizarTodasEsteiras();
        }
        this.atualizarDisplays();
    },

    mudarFatorVelocidade: function(fator, botaoClicado) {
        const mudandoModo = (fator === 'toque') !== (this.fatorVelocidade === 'toque');
        this.fatorVelocidade = fator;
        if (mudandoModo) this.reiniciarMusica();
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
        const bpm = this.catalogoMusicas[this.musicaIndex]?.bpm || 90;
        const fatorEscala = alturaPista < 130 ? 60 : 78;
        return (bpm / 60) * fatorEscala;
    },

    togglePlay: function() {
        window.AudioMotor?.carregarAmostra(this.timbreSolo);
        if (this.modo === 'dueto') {
            window.AudioMotor?.carregarAmostra(this.timbreDuetoJ1);
            window.AudioMotor?.carregarAmostra(this.timbreDuetoJ2);
        }
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) return;
        if (this.encerrada) this.reiniciarMusica();

        if (!this.tocandoMusica || this.fatorVelocidade === 'toque') {
            const painel = this.modo === 'dueto' ? '.piano-painel-dueto' : '#painel-aprendizado-box';
            const ajustes = document.querySelector(`${painel} .piano-ajustes`);
            if (ajustes) ajustes.open = false;
        }
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
        window.BandaPiano?.parar();
        this.tocandoMusica = false;
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        this.atualizarBotoesPlayVisual(false, "Continuar");
        if (this.efeitosEsteira.length) this.animarEfeitosEsteira();
    },

    pararMusicaEContadores: function() {
        window.BandaPiano?.parar();
        if (this.animVisualId) cancelAnimationFrame(this.animVisualId);
        this.animVisualId = null;
        this.acertosVisuais.clear();
        this.efeitosEsteira = [];
        this.tocandoMusica = false;
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        if (window.AudioMotor && typeof window.AudioMotor.soltarTodasVozesPiano === 'function') {
            window.AudioMotor.soltarTodasVozesPiano();
        }
        this.tempoMusicaSegundos = 0;
        this.atualizarBotoesPlayVisual(false, "Jogar");
    },

    reiniciarMusica: function() {
        this.pararMusicaEContadores();
        this.pararTodasNotas();
        const resultado = document.getElementById('over-simon');
        if (resultado) resultado.style.display = 'none';
        this.passoNota = 0;
        this.passoAcorde = 0;
        this.vidas = 3;
        this.acertosParaVida = 0;
        this.encerrada = false;
        if (this.modo === 'livre' && this.desafioLivre) this.sortearNotaLivre();
        this.indiceBanda = 0;
        this.notasDoAcorde.clear();
        this.tempoMusicaSegundos = this.fatorVelocidade === 'toque' ? 0 : -this.tempoParaAcertar() * 3;
        this.atualizarDisplays();
        this.renderizarTodasEsteiras();
        if (this.fatorVelocidade === 'toque') {
            this.tocandoMusica = true;
            this.atualizarBotoesPlayVisual(true, "Modo Toque Ativo");
        } else {
            this.atualizarBotoesPlayVisual(false, "Jogar");
        }
    },

    atualizarBotoesPlayVisual: function(tocando, texto) {
        const icone = (tocando && this.fatorVelocidade !== 'toque') ? 'pause' : 'play';
        const iconeS = document.querySelector('#icone-play-solo use');
        const txtS = document.getElementById('txt-play-solo');
        const iconeD = document.querySelector('#icone-play-dueto use');
        const txtD = document.getElementById('txt-play-dueto');

        if (iconeS) iconeS.setAttribute('href', `assets/icons-modern/kids.svg#${icone}`);
        if (txtS) txtS.textContent = texto;
        if (iconeD) iconeD.setAttribute('href', `assets/icons-modern/kids.svg#${icone}`);
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
                if (tempoAtualHarmonia >= tempoAtualMelodia) return;
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

                this.tocarBandaAte(this.tempoMusicaSegundos);
                if (!this.conferirAtrasos()) return;
                const ultimaNota = this.notasNaEsteira.at(-1);
                const melodiaPronta = this.passoNota >= this.notasNaEsteira.length;
                const harmoniaPronta = this.modo !== 'dueto' || this.passoAcorde >= this.acordesNaEsteira.length;
                if (ultimaNota && melodiaPronta && harmoniaPronta && this.tempoMusicaSegundos >= ultimaNota.tFim) {
                    this.concluirMusica(mus.titulo);
                    return;
                }
            }

            this.renderizarTodasEsteiras();
            this.animEsteiraId = requestAnimationFrame(loop);
        };

        this.animEsteiraId = requestAnimationFrame(loop);
    },

    chaveVisual: function(harmonia, item, nota) {
        return `${harmonia ? 'h' : 'm'}:${item.idx}:${nota}`;
    },

    registrarAcertoVisual: function(harmonia, item, nota, ponteiro) {
        const chave = this.chaveVisual(harmonia, item, nota);
        if (this.acertosVisuais.has(chave)) return;
        const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const duracao = item.durTempos * 60000 / this.obterBpmEfetivo();
        this.acertosVisuais.add(chave);
        this.efeitosEsteira.push({
            harmonia, nota, ponteiro, inicio: performance.now(), soltura: null,
            duracao: Math.max(80, duracao), durSegundos: item.durSegundos, reduzido,
            faiscas: reduzido ? [] : Array.from({length: 10}, (_, i) => ({
                vx: (i - 4.5) * 12, vy: -21 - Math.random() * 42, raio: 1 + Math.random() * 2
            }))
        });
        this.animarEfeitosEsteira();
    },

    liberarEfeitoNota: function(ponteiro) {
        const efeito = this.efeitosEsteira.find(efeito =>
            efeito.ponteiro === ponteiro && efeito.soltura === null);
        if (efeito) efeito.soltura = performance.now();
    },

    progressoDoEfeito: function(efeito, agora) {
        const idade = Math.max(0, agora - efeito.inicio);
        if (efeito.reduzido) return {preenchido: 1, opacidade: idade < 160 ? 1 : 0};
        const sustentacao = efeito.soltura === null ? efeito.duracao :
            Math.min(efeito.duracao, Math.max(0, efeito.soltura - efeito.inicio));
        const base = Math.min(1, idade / efeito.duracao);
        if (idade <= sustentacao) return {preenchido: base, opacidade: 1};
        const impulso = sustentacao < efeito.duracao ? 135 : 0;
        const apos = idade - sustentacao;
        const preenchido = impulso ? Math.min(1, sustentacao / efeito.duracao + apos / impulso) : 1;
        return {preenchido, opacidade: Math.max(0, 1 - Math.max(0, apos - impulso) / 135)};
    },

    animarEfeitosEsteira: function() {
        if (this.animVisualId || this.animEsteiraId) return;
        this.animVisualId = requestAnimationFrame(() => {
            this.animVisualId = null;
            if (this.animEsteiraId) return;
            this.renderizarTodasEsteiras();
            if (this.efeitosEsteira.length) this.animarEfeitosEsteira();
        });
    },

    renderizarTodasEsteiras: function() {
        const agora = performance.now();
        this.efeitosEsteira = this.efeitosEsteira.filter(efeito => this.progressoDoEfeito(efeito, agora).opacidade > 0);
        if (this.modo === 'livre') return;
        const dueto = this.modo === 'dueto';
        const tela = dueto ? this.cvDuetoMelodia : this.cvSolo;
        const ctx = dueto ? this.ctxDuetoMelodia : this.ctxSolo;
        if (tela && ctx) this.desenharPista(ctx, tela, false, agora);
        if (dueto && this.cvDuetoHarmonia && this.ctxDuetoHarmonia) {
            this.desenharPista(this.ctxDuetoHarmonia, this.cvDuetoHarmonia, true, agora);
        }
    },

    desenharPista: function(ctx, canvas, harmonia, agora) {
        const W = canvas._cssWidth || 390;
        const H = canvas._cssHeight || 160;
        const layout = harmonia ? this.layoutOitava3 : this.layoutOitava4;
        const notas = harmonia ? this.acordesNaEsteira : this.notasNaEsteira;
        const passo = harmonia ? this.passoAcorde : this.passoNota;
        const pps = this.obterPixelsPorSegundo(H);
        ctx.clearRect(0, 0, W, H);

        for (const col of Object.values(layout)) {
            ctx.fillStyle = col.ehPreta ? '#05071948' : '#a3b9ff08';
            ctx.fillRect(col.xPct * W, 0, col.wPct * W, H);
            if (!col.ehPreta) {
                ctx.fillStyle = '#b0bcff25';
                ctx.fillRect(col.xPct * W, 0, 1, H);
            }
        }
        for (let y = 20; y < H; y += 24) {
            ctx.fillStyle = '#c9cbff12';
            ctx.fillRect(0, y, W, 1);
        }
        const centro = this.desenharFaixaAcerto(ctx, W, H, pps);

        for (const efeito of this.efeitosEsteira) {
            if (efeito.harmonia !== harmonia) continue;
            const col = layout[efeito.nota];
            if (!col) continue;
            this.desenharAcerto(ctx, efeito, col, W, centro, pps, agora);
        }
        for (const item of notas) {
            const base = centro + (this.tempoMusicaSegundos - item.tInicio) * pps;
            const altura = Math.max(19, item.durSegundos * pps - 3);
            const topo = base - altura;
            if (base < -4) break;
            if (topo > H + 4) continue;
            const codigos = harmonia ? item.notas : [item.nota];
            for (const nota of codigos) {
                const col = layout[nota];
                if (!col || this.acertosVisuais.has(this.chaveVisual(harmonia, item, nota))) continue;
                this.desenharBlocoNota(ctx, col, W, topo, altura, nota, item.idx === passo && this.emFaixa(item));
            }
        }
    },

    desenharBlocoNota: function(ctx, col, largura, topo, altura, nota, naFaixa) {
        const x = col.xPct * largura + 3;
        const w = col.wPct * largura - 6;
        ctx.save();
        const grad = ctx.createLinearGradient(x, topo, x, topo + altura);
        grad.addColorStop(0, '#18284a');
        grad.addColorStop(.72, '#263d63');
        grad.addColorStop(1, col.cor);
        ctx.fillStyle = grad;
        ctx.strokeStyle = naFaixa ? '#fff1cc' : col.cor;
        ctx.lineWidth = naFaixa ? 2 : 1;
        if (naFaixa) {
            ctx.shadowColor = col.cor;
            ctx.shadowBlur = 9;
        }
        ctx.beginPath();
        ctx.roundRect(x, topo, w, altura, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.tabelaFrequencias[nota].nome, x + w / 2, topo + altura - 6);
        ctx.restore();
    },

    desenharAcerto: function(ctx, efeito, col, largura, centro, pps, agora) {
        const {preenchido, opacidade} = this.progressoDoEfeito(efeito, agora);
        const x = col.xPct * largura + 3;
        const w = col.wPct * largura - 6;
        const altura = Math.min(centro - 3, Math.max(19, efeito.durSegundos * pps - 3));
        const alturaTinta = Math.min(altura, Math.max(4, altura * preenchido));
        ctx.save();
        ctx.globalAlpha = opacidade;
        ctx.beginPath();
        ctx.roundRect(x, centro - altura, w, altura, 6);
        ctx.clip();
        ctx.fillStyle = '#08172edc';
        ctx.fillRect(x, centro - altura, w, altura);
        const brilho = ctx.createLinearGradient(x, centro - alturaTinta, x, centro);
        brilho.addColorStop(0, '#f3fbff');
        brilho.addColorStop(.16, col.cor);
        brilho.addColorStop(1, '#233a70');
        ctx.fillStyle = brilho;
        ctx.fillRect(x, centro - alturaTinta, w, alturaTinta);
        ctx.restore();

        const idade = Math.max(0, (agora - efeito.inicio) / 1000);
        if (idade >= .44 || efeito.reduzido) return;
        const meio = x + w / 2;
        ctx.save();
        ctx.globalAlpha = 1 - idade / .44;
        ctx.strokeStyle = col.cor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(meio, centro, 3 + idade * 56, 2 + idade * 17, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (const faisca of efeito.faiscas) {
            const px = meio + faisca.vx * idade;
            const py = centro + faisca.vy * idade - 8;
            ctx.fillStyle = faisca.raio > 2.2 ? '#fff5dc' : col.cor;
            ctx.beginPath();
            ctx.arc(px, py, faisca.raio * (1 - idade), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },

    configurarEventosMultitoque: function() {
        if (this.eventosConfigurados) return;
        this.eventosConfigurados = true;

        const associarTeclasDeContainer = (container, fatorVol = 1, origem = 'solo') => {
            if (!container) return;
            const dedos = new Map();
            const obterTecla = alvo => {
                const tecla = alvo?.closest?.('[data-nota]');
                return tecla && container.contains(tecla) ? tecla : null;
            };
            const trocarTecla = (id, proxima) => {
                const anterior = dedos.get(id);
                if (anterior === proxima) return;
                if (anterior) this.soltarNota(anterior.dataset.nota, id, anterior);
                dedos.set(id, proxima);
                if (proxima) this.pressionarNota(proxima.dataset.nota, id, proxima, fatorVol, origem);
            };
            container.addEventListener('pointerdown', evento => {
                const tecla = obterTecla(evento.target);
                if (!tecla || evento.button !== 0) return;
                evento.preventDefault();
                container.setPointerCapture(evento.pointerId);
                trocarTecla(evento.pointerId, tecla);
            });
            container.addEventListener('pointermove', evento => {
                if (!this.deslizarTeclas || !dedos.has(evento.pointerId)) return;
                const coalescidos = evento.getCoalescedEvents?.() || [];
                for (const ponto of coalescidos.length ? coalescidos : [evento]) {
                    const tecla = obterTecla(document.elementFromPoint(ponto.clientX, ponto.clientY));
                    trocarTecla(evento.pointerId, tecla);
                }
            });
            for (const nome of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                container.addEventListener(nome, evento => {
                    if (!dedos.has(evento.pointerId)) return;
                    trocarTecla(evento.pointerId, null);
                    dedos.delete(evento.pointerId);
                });
            }
        };

        associarTeclasDeContainer(document.getElementById('teclado-piano-completo'), 1.0, 'solo');
        associarTeclasDeContainer(document.getElementById('teclado-dueto-melodia'), 1.0, 'dueto-j1');
        associarTeclasDeContainer(document.getElementById('teclado-dueto-harmonia'), 0.85, 'dueto-j2');

        associarTeclasDeContainer(document.getElementById('teclado-livre-subgrave'), 1.0, 'livre-2');
        associarTeclasDeContainer(document.getElementById('teclado-livre-grave'), 1.0, 'livre-3');
        associarTeclasDeContainer(document.getElementById('teclado-livre-medio'), 1.0, 'livre-4');
        associarTeclasDeContainer(document.getElementById('teclado-livre-agudo'), 1.0, 'livre-5');

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
            if (!this.tocandoMusica || this.modo === 'livre') this.soltarNotaFlutuante(elTecla);
        }

        this.avaliarNota(codigoNota, seletorOrigem, elTecla, pointerId);
    },

    soltarNota: function(codigoNota, pointerId, elTecla) {
        this.liberarEfeitoNota(pointerId);
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

    trocarTimbreSolo: function(timbre) {
        this.timbreSolo = timbre;
        ['piano', 'cordas', 'xilofone'].forEach(t => {
            const btn = document.getElementById(`btn-timbre-solo-${t}`);
            if (btn) {
                btn.classList.toggle('ativo', t === timbre);
                btn.setAttribute('aria-pressed', String(t === timbre));
            }
        });
        const motor = window.AudioMotor;
        motor?.soltarVozPiano('previa');
        motor?.carregarAmostra(timbre).then(() => {
            if (this.timbreSolo !== timbre || this.modo !== 'aprendizado' ||
                (this.tocandoMusica && this.fatorVelocidade !== 'toque')) return;
            motor.iniciarVozPiano('previa', 392, .8, timbre);
            clearTimeout(this.temporizadorPrevia);
            this.temporizadorPrevia = setTimeout(() => motor.soltarVozPiano('previa'), 450);
        });
    },

    trocarTimbreDueto: function(jogador, timbre, btnClicado) {
        if (jogador === 'j1') this.timbreDuetoJ1 = timbre;
        if (jogador === 'j2') this.timbreDuetoJ2 = timbre;
        window.AudioMotor?.carregarAmostra(timbre);

        const container = document.getElementById(`timbre-dueto-${jogador}`);
        if (container) {
            container.querySelectorAll('.btn-mini-timbre').forEach(b => b.classList.remove('ativo'));
            if (btnClicado) btnClicado.classList.add('ativo');
        }
    },

    trocarTimbreOitava: function(oitavaNum, timbre, btnClicado) {
        this.timbresLivres[oitavaNum] = timbre;
        window.AudioMotor?.carregarAmostra(timbre);
        const container = document.getElementById(`timbre-oitava-${oitavaNum}`);
        if (container) {
            container.querySelectorAll('.btn-mini-timbre').forEach(b => b.classList.remove('ativo'));
            if (btnClicado) btnClicado.classList.add('ativo');
        }
    },

    trocarModo: function(novoModo) {
        this.pararMusicaEContadores();
        this.modo = novoModo;
        if (novoModo === 'dueto' && this.fatorVelocidade === 'toque') this.fatorVelocidade = 1;
        document.querySelectorAll('.btn-velocidade-bichinho').forEach(botao => {
            botao.classList.toggle('ativo', botao.dataset.fator === String(this.fatorVelocidade));
        });

        const rotuloVoltar = document.getElementById('rotulo-voltar-arcade');
        if (rotuloVoltar) rotuloVoltar.textContent = novoModo === 'dueto' ? 'Sair do Dueto' : 'Arcade';

        const telaSimon = document.getElementById('tela-simon');
        if (telaSimon) {
            telaSimon.dataset.modoPiano = novoModo;
            telaSimon.scrollTop = 0;
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
            if (containerDueto) {
                containerDueto.style.display = 'flex';
                containerDueto.scrollTop = 0;
            }
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
        const musica = this.catalogoMusicas[Number(idx)];
        if (!musica) return;
        this.musicaIndex = Number(idx);
        this.estiloMusica = musica.estilo || 'infantil';
        this.eventosBanda = window.BandaPiano?.montar(musica) || [];
        this.popularSeletoresMusica();
        this.construirTrilhasMelodiaEHarmonia();
        this.reiniciarMusica();
    },

    atualizarDisplays: function() {
        const desafioLivre = document.getElementById('piano-desafio-livre-status');
        if (desafioLivre) desafioLivre.hidden = this.modo !== 'livre' || !this.desafioLivre;
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) return;
        const mus = this.catalogoMusicas[this.musicaIndex] || this.catalogoMusicas[0];
        const alvoLivre = document.getElementById('alvo-desafio-livre');
        if (alvoLivre) {
            alvoLivre.hidden = !this.desafioLivre;
            alvoLivre.textContent = this.encerrada ? 'Fim da tentativa' :
                `Toque ${this.tabelaFrequencias[this.proximaNotaLivre]?.nome || '—'} na oitava 4`;
        }
        const placarLivre = document.getElementById('erros-livre-piano');
        if (placarLivre) placarLivre.hidden = !this.desafioLivre;
        const notaItem = mus.melodia?.[this.passoNota];
        const infoNota = notaItem ? this.tabelaFrequencias[notaItem.n] : null;
        const acordeItem = this.acordesNaEsteira[this.passoAcorde];

        const elNotaTxt = document.getElementById('txt-nota-alvo-aprendizado');
        if (elNotaTxt) elNotaTxt.textContent = infoNota?.nome || '—';

        const elMelodiaDueto = document.getElementById('badge-melodia-alvo-dueto');
        if (elMelodiaDueto) elMelodiaDueto.textContent = `Nota: ${infoNota?.nome || '—'}`;

        const elAcordeDueto = document.getElementById('badge-acorde-alvo-dueto');
        if (elAcordeDueto) elAcordeDueto.textContent = `Acorde: ${acordeItem?.nome || '—'}`;

        const progresso = document.getElementById('progresso-piano');
        if (progresso) {
            progresso.max = mus.melodia.length;
            progresso.value = this.passoNota;
        }
        document.querySelectorAll('[data-vidas-piano]').forEach(placar => {
            const coracoes = placar.querySelector('.piano-coracoes');
            for (const [indice, icone] of Array.from(coracoes.children).entries()) {
                icone.classList.toggle('cheio', indice < this.vidas);
            }
            const total = placar.querySelector('.piano-total-vidas');
            if (total.textContent !== String(this.vidas)) total.textContent = this.vidas;
            placar.querySelector('.piano-acertos').textContent = `${this.acertosParaVida}/10`;
        });

        this.limparBrilhosTeclas();

        if (this.modo === 'livre' && this.desafioLivre && !this.encerrada) {
            document.getElementById('teclado-livre-medio')
                ?.querySelector(`[data-nota="${this.proximaNotaLivre}"]`)?.classList.add('alvo-brilhando');
        }

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

    concluirMusica: function() {
        if (this.encerrada) return;
        this.encerrada = true;
        this.pararMusicaEContadores();
        if (this.modo !== 'dueto' && typeof GerenciadorArcade !== 'undefined') {
            GerenciadorArcade.adicionarMoedas(5);
        }
        window.AudioMotor?.tocarTom(880, .3);
        this.mostrarResultado(true);
    },

    mostrarResultado: function(ganhou) {
        const titulo = document.getElementById('titulo-resultado-piano');
        const mensagem = document.getElementById('txt-msg-conclusao-musica');
        const proxima = document.getElementById('btn-proxima-piano');
        const repetir = document.getElementById('btn-repetir-piano');
        const overlay = document.getElementById('over-simon');
        const musica = this.catalogoMusicas[this.musicaIndex];
        if (titulo) titulo.textContent = ganhou ? 'Música concluída!' : 'Fim da tentativa';
        if (mensagem) mensagem.textContent = ganhou
            ? `${musica.titulo}${this.modo === 'dueto' ? '' : ' · +5 moedas'}`
            : (this.modo === 'livre' ? 'As vidas acabaram. Tente outra sequência.' :
                'As vidas acabaram. Tente de novo ou reduza a velocidade.');
        if (proxima) proxima.hidden = !ganhou;
        if (repetir) repetir.textContent = ganhou ? 'Tocar novamente' : 'Tentar de novo';
        if (overlay) overlay.style.display = 'flex';
    },

    avancarProximaMusica: function() {
        this.fecharModalConclusao();
        const lista = this.catalogoMusicas.map((musica,idx) => ({musica,idx}))
            .filter(({musica}) => (musica.estilo || 'infantil') === this.estiloMusica);
        const atual = lista.findIndex(({idx}) => idx === this.musicaIndex);
        if (lista.length) this.selecionarMusica(lista[(atual+1) % lista.length].idx);
    },

    repetirPartida: function() {
        this.fecharModalConclusao();
        this.reiniciarMusica();
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
