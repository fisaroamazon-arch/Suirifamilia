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
        cordas: {
            arquivo: 'violino-solo', duracao: 7, soltura: .22, repeticao: [1.5, 6.3],
            notas: [55, 60, 64, 67, 72, 76, 81, 84, 88, 93, 96]
        },
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
            amostra.carregando = fetch(`assets/audio/piano/${amostra.arquivo || tipo}.mp3`)
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
        const notas = amostra.notas || [36, 42, 48, 54, 60, 66, 72, 78, 84];
        const indice = notas.reduce((melhor, nota, i) =>
            Math.abs(nota - midi) < Math.abs(notas[melhor] - midi) ? i : melhor, 0);
        const fonte = ctx.createBufferSource();
        const saida = ctx.createGain();
        const voz = {fontes: [fonte], saida, soltura: amostra.soltura};
        fonte.buffer = amostra.buffer;
        fonte.playbackRate.value = 2 ** ((midi - notas[indice]) / 12);
        saida.gain.value = Math.min(volume, 1) * .88;
        fonte.connect(saida).connect(this.obterSaida());
        fonte.onended = () => {
            if (this.vozesAtivas[chave] === voz) delete this.vozesAtivas[chave];
            fonte.disconnect();
            saida.disconnect();
        };
        this.vozesAtivas[chave] = voz;
        const posicao = indice * amostra.duracao;
        if (amostra.repeticao) {
            const [inicio, fim] = amostra.repeticao;
            fonte.loop = true;
            fonte.loopStart = posicao + inicio;
            fonte.loopEnd = posicao + fim;
            fonte.start(0, posicao);
        } else {
            fonte.start(0, posicao, amostra.duracao);
        }
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

    tocarMetronomo: function(acento) {
        const ctx = this.obterCtx();
        if (!ctx) return;
        const agora = ctx.currentTime;
        const pulso = ctx.createOscillator();
        const volume = ctx.createGain();
        pulso.frequency.value = acento ? 1560 : 1060;
        volume.gain.setValueAtTime(.0001, agora);
        volume.gain.linearRampToValueAtTime(acento ? .17 : .105, agora + .003);
        volume.gain.exponentialRampToValueAtTime(.0001, agora + .051);
        pulso.connect(volume).connect(this.obterSaida());
        pulso.start(agora);
        pulso.stop(agora + .055);
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
    figuras: [
        { batidas: 4, nome: 'Semibreve', cor: '#b89bff' },
        { batidas: 2, nome: 'Mínima', cor: '#66d8ff' },
        { batidas: 1, nome: 'Semínima', cor: '#75e0a2' },
        { batidas: .5, nome: 'Colcheia', cor: '#f9db6d' },
        { batidas: .25, nome: 'Semicolcheia', cor: '#ffae73' },
        { batidas: .125, nome: 'Fusa', cor: '#fd8baf' },
        { batidas: .0625, nome: 'Semifusa', cor: '#f3eca9' }
    ],
    niveis: { amador: 'Amador', moderado: 'Moderado', avancado: 'Avançado' },
    metronomoLigado: true,
    vidasInfinitas: false,
    repetirErros: true,
    dificuldade: 'amador',
    alcancePreferido: 2,
    acertosTotais: 0,
    errosTotais: 0,
    ultimoPulso: -1,
    modo: 'aprendizado',
    parteSolo: 'melodia',
    parteDueto: 'ambas',
    musicaIndex: 0,
    passoNota: 0,
    passoAcorde: 0,
    tocandoMusica: false,
    fatorVelocidade: 'toque',
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

    infoNota: function(codigo) {
        const partes = /^([A-G]#?)(-?\d+)$/.exec(codigo || '');
        if (!partes) return null;
        const nomes = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
        const semitom = [0, 2, 4, 5, 7, 9, 11]['CDEFGAB'.indexOf(partes[1][0])] + Number(partes[1].endsWith('#'));
        const oitava = Number(partes[2]);
        const midi = (oitava + 1) * 12 + semitom;
        if (midi < 0 || midi > 127) return null;
        return {
            nome: nomes['CDEFGAB'.indexOf(partes[1][0])] + (partes[1].endsWith('#') ? '♯' : ''),
            freq: 440 * 2 ** ((midi - 69) / 12),
            altura: partes[1],
            oitava
        };
    },

    mapearNota: function(codigo, harmonia = false) {
        const nota = this.infoNota(codigo);
        if (!nota) return null;
        const alcance = this.alcancePreferido;
        const base = this.usaPainelDuplo() ?
            (harmonia && !this.tecladoCompartilhado() ? 2 : 3) : alcance === 3 ? 3 : 4;
        const teto = base + alcance - Number(nota.altura !== 'C');
        const oitavaTecla = Math.max(base, Math.min(teto, nota.oitava));
        const diferenca = nota.oitava - oitavaTecla;
        return {
            tecla: nota.altura + oitavaTecla,
            simbolo: diferenca ? (diferenca > 0 ? '↑' : '↓') + Math.abs(diferenca) : '',
            cor: diferenca > 0 ? '#d6abff' : diferenca < 0 ? '#8be7ed' : '',
            etiqueta: `${nota.nome}${nota.oitava}`
        };
    },

    usaPainelDuplo: function() {
        return this.modo === 'dueto' || (this.modo === 'aprendizado' && this.parteSolo === 'ambas');
    },

    pistasAtivas: function() {
        const parte = this.modo === 'dueto' ? this.parteDueto : this.parteSolo;
        return { melodia: parte !== 'base', base: parte !== 'melodia' };
    },

    tecladoCompartilhado: function() {
        const pistas = this.pistasAtivas();
        return this.usaPainelDuplo() && pistas.base && pistas.melodia;
    },

    figuraDaNota: function(duracao) {
        return this.figuras.find(figura => duracao >= figura.batidas * .90) || this.figuras.at(-1);
    },

    partidaCompleta: function() {
        const pistas = this.pistasAtivas();
        return (!pistas.melodia || this.passoNota >= this.notasNaEsteira.length) &&
            (!pistas.base || this.passoAcorde >= this.acordesNaEsteira.length);
    },

    alvoDaPista: function(origem) {
        return origem === 'dueto-j2' ? this.acordesNaEsteira[this.passoAcorde] : this.notasNaEsteira[this.passoNota];
    },

    notasDaTecla: function(codigo, origem) {
        const harmonia = origem === 'dueto-j2';
        const item = this.alvoDaPista(origem);
        const notas = harmonia ? item?.notas : [item?.nota];
        return (notas || []).filter(nota => this.mapearNota(nota, harmonia)?.tecla === codigo);
    },

    origensDaTecla: function(codigo, origem) {
        if (origem !== 'dueto-j1' || !this.tecladoCompartilhado() || !this.tocandoMusica) return [origem];
        const pistas = ['dueto-j1', 'dueto-j2'].filter(pista => {
            const item = this.alvoDaPista(pista);
            return item && (this.fatorVelocidade === 'toque' || this.emFaixa(item));
        });
        const correspondentes = pistas.filter(pista => this.notasDaTecla(codigo, pista).length);
        if (correspondentes.length) return correspondentes;
        return pistas.sort((a,b) => this.alvoDaPista(a).tInicio - this.alvoDaPista(b).tInicio).slice(0, 1);
    },

    notasDoToque: function(codigo, origem, pistas = this.origensDaTecla(codigo, origem)) {
        if (this.modo === 'livre' || !this.tocandoMusica) return [codigo];
        const correspondentes = [...new Set(pistas.flatMap(pista => this.notasDaTecla(codigo, pista)))];
        return correspondentes.length ? correspondentes : [codigo];
    },

    montar: function() {
        this.sincronizarCatalogo();
        this.configurarEventosMultitoque();
        this.configurarPainelPiano();
        const legenda = document.getElementById('piano-figuras');
        if (legenda && !legenda.childElementCount) {
            this.figuras.forEach(figura => {
                const item = document.createElement('li');
                item.style.setProperty('--figura-cor', figura.cor);
                item.textContent = figura.nome;
                legenda.append(item);
            });
        }
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

    configurarPainelPiano: function() {
        const dialogo = document.getElementById('piano-configuracoes');
        if (!dialogo || this.painelPianoConfigurado) return;
        this.painelPianoConfigurado = true;
        const dificuldade = document.getElementById('piano-dificuldade');
        const treino = document.getElementById('piano-repetir-erros');
        if (dificuldade) dificuldade.value = this.dificuldade;
        if (treino) treino.checked = this.repetirErros;
        this.orientacaoAmpla = matchMedia('(orientation: landscape)');
        const atualizar = () => this.atualizarOrientacao();
        if (this.orientacaoAmpla.addEventListener) this.orientacaoAmpla.addEventListener('change', atualizar);
        else this.orientacaoAmpla.addListener?.(atualizar);
        this.atualizarAlcance();
        this.atualizarOrientacao();
        document.addEventListener('fullscreenchange', () => this.atualizarBotaoTelaInteira());
        dialogo.addEventListener('close', () => {
            const retomar = this.retomarAposConfiguracao;
            this.retomarAposConfiguracao = false;
            if (retomar && !this.tocandoMusica && this.modo !== 'livre' && document.body.dataset.arcadeTela === 'simon') {
                this.togglePlay();
            }
        });
        const alca = dialogo.querySelector('.piano-config-cabecalho');
        let inicio;
        alca.addEventListener('pointerdown', evento => {
            inicio = {id: evento.pointerId, x: evento.clientX, y: evento.clientY};
            const alvo = evento.target.closest('button') || alca;
            alvo.setPointerCapture(evento.pointerId);
        });
        alca.addEventListener('pointerup', evento => {
            if (!inicio || evento.pointerId !== inicio.id) return;
            const deslocamento = evento.clientY - inicio.y;
            if (deslocamento >= 48 && deslocamento > Math.abs(evento.clientX - inicio.x)) dialogo.close();
            inicio = null;
        });
        alca.addEventListener('pointercancel', () => { inicio = null; });
    },

    atualizarOrientacao: function() {
        const painel = document.getElementById('tela-simon');
        if (!painel || !this.orientacaoAmpla) return;
        const vertical = !this.orientacaoAmpla.matches;
        painel.toggleAttribute('data-piano-vertical', vertical);
        if (document.body.dataset.arcadeTela !== 'simon') return;

        if (vertical) {
            this.retomarAposConfiguracao = false;
            document.getElementById('piano-configuracoes')?.close();
            document.getElementById('arcade-recordes')?.close();
            const emRede = this.modo === 'dueto' && window.DuetoPiano?.pausarPartida();
            if (this.tocandoMusica && !emRede) this.pausarMusica();
            this.pararTodasNotas();
        } else {
            this.inicializarCanvasEsteiras();
            this.renderizarTodasEsteiras();
        }
        const foco = vertical ? 'piano-voltar-vertical' : 'piano-abrir-config';
        document.getElementById(foco)?.focus({ preventScroll: true });
    },

    abrirConfiguracoes: function() {
        const dialogo = document.getElementById('piano-configuracoes');
        if (!dialogo || dialogo.open || this.orientacaoAmpla?.matches === false) return;
        window.AudioMotor?.obterCtx();
        const emRede = this.modo === 'dueto' && window.DuetoPiano?.pausarPartida();
        this.retomarAposConfiguracao = !emRede && this.tocandoMusica;
        if (this.tocandoMusica) this.pausarMusica();
        this.pararTodasNotas();
        this.atualizarMenuPiano();
        this.atualizarBotaoTelaInteira();
        dialogo.showModal();
        dialogo.querySelector('.piano-config-corpo').scrollTop = 0;
    },

    atualizarMenuPiano: function() {
        const dialogo = document.getElementById('piano-configuracoes');
        if (!dialogo) return;
        dialogo.querySelectorAll('[data-config-piano]').forEach(secao => {
            secao.hidden = !secao.dataset.configPiano.split(' ').includes(this.modo);
        });
        const livre = this.modo === 'livre';
        const sala = this.modo === 'dueto' ? window.DuetoPiano?.estadoMenu() : null;
        const toque = dialogo.querySelector('[data-fator="toque"]');
        if (toque) toque.hidden = Boolean(sala?.emSala);
        const jogar = document.getElementById('piano-jogar');
        jogar.textContent = livre || sala?.convidado ? 'Voltar às teclas' : this.rotuloPartida === 'Continuar' ? 'Continuar' : 'Jogar';
        document.getElementById('piano-reiniciar').hidden = Boolean(sala?.emSala || (livre && !this.desafioLivre));
        document.getElementById('piano-treino-opcao').hidden = Boolean(livre || sala?.emSala);
    },

    jogarPeloMenu: function() {
        const dialogo = document.getElementById('piano-configuracoes');
        const sala = this.modo === 'dueto' ? window.DuetoPiano?.estadoMenu() : null;
        if (sala?.aguardando && !sala.convidado) {
            window.DuetoPiano.controlarPartida();
            return;
        }
        this.retomarAposConfiguracao = this.modo !== 'livre' && !sala?.convidado;
        dialogo?.close();
    },

    reiniciarPeloMenu: function() {
        this.retomarAposConfiguracao = false;
        this.reiniciarMusica();
    },

    telaInteiraNativa: function() {
        return navigator.userAgent.includes('SuiriFamiliaPiano/1');
    },

    atualizarBotaoTelaInteira: function() {
        const botao = document.getElementById('piano-tela-inteira');
        if (!botao) return;
        botao.hidden = !this.telaInteiraNativa() && !document.fullscreenEnabled;
        botao.textContent = this.emTelaInteiraNativa || document.fullscreenElement ? 'Sair da tela inteira' : 'Tela inteira';
    },

    ativarTelaInteira: function(ligada) {
        if (this.telaInteiraNativa()) {
            if (Boolean(this.emTelaInteiraNativa) !== ligada) {
                this.emTelaInteiraNativa = ligada;
                location.href = 'suiri-native://' + (ligada ? 'piano-fullscreen' : 'piano-exit-fullscreen');
            }
            this.atualizarBotaoTelaInteira();
        } else if (ligada && document.fullscreenEnabled && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                if (document.body.dataset.arcadeTela !== 'simon') this.ativarTelaInteira(false);
            }).catch(() => {});
        } else if (!ligada && document.fullscreenElement === document.documentElement) {
            document.exitFullscreen().catch(() => {});
        }
    },

    alternarTelaInteira: function() {
        this.ativarTelaInteira(!this.emTelaInteiraNativa && !document.fullscreenElement);
    },

    fecharPiano: function() {
        this.registrarRecordeLivre();
        this.retomarAposConfiguracao = false;
        document.getElementById('piano-configuracoes')?.close();
        if (this.modo === 'dueto') window.DuetoPiano?.sair();
        this.ativarTelaInteira(false);
    },

    alterarAlcance: function(valor) {
        this.alcancePreferido = Math.min(3, Math.max(1, Number(valor) || 1));
        this.atualizarAlcance();
    },

    atualizarAlcance: function() {
        const seletor = document.getElementById('piano-alcance');
        const teclado = document.getElementById('teclado-piano-completo');
        if (!seletor || !teclado) return;
        const alcance = this.alcancePreferido;
        seletor.value = String(alcance);
        if (alcance === this.alcanceSolo) return;
        if (!this.teclasSoloOriginais) this.teclasSoloOriginais = [...teclado.children];
        this.pararTodasNotas();
        this.alcanceSolo = alcance;
        teclado.dataset.alcance = String(alcance);
        this.layoutSolo = alcance === 1 ? null : this.montarTecladoAmpliado(teclado, alcance, alcance === 3 ? 3 : 4);
        if (alcance === 1) teclado.replaceChildren(...this.teclasSoloOriginais);
        const melodia = document.getElementById('teclado-dueto-melodia');
        const base = document.getElementById('teclado-dueto-harmonia');
        if (melodia) this.layoutDuetoMelodia = this.montarTecladoAmpliado(melodia, alcance, 3);
        if (base) this.layoutDuetoBase = this.montarTecladoAmpliado(base, alcance, 2);
        if (this.partituraAtual) this.atualizarDisplays();
        this.renderizarTodasEsteiras();
    },

    montarTecladoAmpliado: function(teclado, alcance, base) {
        const brancas = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const pretas = [['C#', 1], ['D#', 2], ['F#', 4], ['G#', 5], ['A#', 6]];
        const larguraBranca = 1 / (alcance * brancas.length + 1);
        const larguraPreta = larguraBranca * .69;
        const layout = {};
        const teclas = document.createDocumentFragment();
        const adicionar = (altura, oitava, xPct, wPct, ehPreta) => {
            const codigo = altura + oitava;
            const nota = this.infoNota(codigo);
            layout[codigo] = {xPct, wPct, ehPreta, cor: this.layoutOitava4[altura + '4'].cor};
            const tecla = document.createElement('div');
            tecla.className = ehPreta ? 'tecla-preta-piano' : 'tecla-branca-piano';
            tecla.dataset.nota = codigo;
            const rotulo = document.createElement('span');
            rotulo.className = ehPreta ? 'rotulo-nota-preta' : 'rotulo-nota-branca';
            rotulo.textContent = altura === 'C' ? `${nota.nome}${oitava}` : nota.nome;
            if (ehPreta) {
                tecla.style.left = `${xPct * 100}%`;
                tecla.style.width = `${wPct * 100}%`;
            }
            tecla.append(rotulo);
            this.prepararTecla(tecla);
            teclas.append(tecla);
        };
        for (let oitava = 0; oitava < alcance; oitava++) {
            const inicio = oitava * brancas.length;
            brancas.forEach((altura, indice) => adicionar(altura, base + oitava, (inicio + indice) * larguraBranca, larguraBranca, false));
            pretas.forEach(([altura, limite]) => adicionar(altura, base + oitava, (inicio + limite) * larguraBranca - larguraPreta / 2, larguraPreta, true));
        }
        adicionar('C', base + alcance, (1 - larguraBranca), larguraBranca, false);
        teclado.replaceChildren(teclas);
        return layout;
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
        const select = document.getElementById('seletor-musica-alvo');
        if (select) {
            const itens = opcoes.map(({musica,idx}) => {
                const item = document.createElement('option');
                item.value = idx;
                const segundos = Math.round(musica.duracao || musica.melodia.reduce((total, nota) => total + nota.d, 0) * 60 / (musica.bpm || 90));
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

    tempoParaAcertar: function(atraso = true) {
        return (60 / (this.partituraAtual?.bpm || 90)) * (atraso ? .88 : .62);
    },

    desenharFaixaAcerto: function(ctx, largura, altura, pps) {
        const base = altura - 3;
        const centro = base - this.tempoParaAcertar() * pps;
        const topo = centro - this.tempoParaAcertar(false) * pps;
        ctx.save();
        const faixa = ctx.createLinearGradient(0, topo, 0, base);
        faixa.addColorStop(0, '#e895472e');
        faixa.addColorStop(.42, '#ffb66a60');
        faixa.addColorStop(1, '#df864d36');
        ctx.fillStyle = faixa;
        ctx.fillRect(0, topo, largura, base - topo);
        ctx.setLineDash([4,5]);
        ctx.strokeStyle = '#ffcf969c';
        for (const borda of [topo, base]) {
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
        ctx.fillRect(0, centro - 3, largura, 6);
        ctx.restore();
        return centro;
    },

    emFaixa: function(nota) {
        const diferenca = this.tempoMusicaSegundos - nota.tInicio;
        return diferenca >= -this.tempoParaAcertar(false) && diferenca <= this.tempoParaAcertar();
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
            if (this.comBanda && batidas - evento.tempo < Math.max(.18, evento.duracao)) {
                window.BandaPiano?.tocar(evento, this.obterBpmEfetivo());
            }
        }
    },

    baixarBanda: function() {
        const musica = this.partituraAtual;
        if (musica) window.BandaPiano?.baixar(musica, this.eventosBanda, this.obterBpmEfetivo());
    },

    alterarVidas: function(valor) {
        this.vidasInfinitas = valor === 'infinitas';
        this.atualizarDisplays();
    },

    alterarTreino: function(ligado) {
        this.repetirErros = ligado;
    },

    alterarDificuldade: function(nivel) {
        if (!Object.hasOwn(this.niveis, nivel) || nivel === this.dificuldade) return;
        this.dificuldade = nivel;
        const campo = document.getElementById('piano-dificuldade');
        if (campo) campo.value = nivel;
        this.retomarAposConfiguracao = false;
        this.construirTrilhasMelodiaEHarmonia();
        this.reiniciarMusica();
    },

    treinoLocal: function() {
        return this.modo !== 'livre' && !(this.modo === 'dueto' && window.DuetoPiano?.estadoMenu()?.emSala);
    },

    deveRepetirNota: function() {
        return this.treinoLocal() && (this.repetirErros || this.metronomoLigado);
    },

    registrarErro: function(item, harmonia = false) {
        if (this.encerrada) return true;
        this.errosTotais++;
        const treino = this.treinoLocal() && this.repetirErros;
        if (!treino && !this.vidasInfinitas) this.vidas--;
        this.atualizarDisplays();
        if (this.vidas <= 0 && !treino && !this.vidasInfinitas) {
            this.encerrada = true;
            this.registrarRecordeLivre();
            this.pararMusicaEContadores();
            this.mostrarResultado(false);
            return true;
        }
        if (item && this.deveRepetirNota()) {
            if (harmonia) this.notasDoAcorde.clear();
            this.prepararContagem(item.tInicio, true, this.metronomoLigado);
            if (this.fatorVelocidade === 'toque') this.iniciarAnimacaoEsteira();
            return true;
        }
        return false;
    },

    registrarAcerto: function() {
        this.acertosTotais++;
        this.acertosParaVida++;
        if (this.acertosParaVida === 10) {
            this.acertosParaVida = 0;
            this.vidas++;
        }
    },

    conferirAtrasos: function() {
        const margem = this.tempoParaAcertar();
        const pistas = this.pistasAtivas();
        const trilhas = [];
        if (pistas.melodia) trilhas.push([this.notasNaEsteira, 'passoNota']);
        if (pistas.base) trilhas.push([this.acordesNaEsteira, 'passoAcorde']);
        if (this.deveRepetirNota()) {
            const atrasos = trilhas.map(([trilha, campo]) => ({item: trilha[this[campo]], harmonia: campo === 'passoAcorde'}))
                .filter(({item}) => item && this.tempoMusicaSegundos > item.tInicio + margem)
                .sort((a, b) => a.item.tInicio - b.item.tInicio);
            return !atrasos.length || !this.registrarErro(atrasos[0].item, atrasos[0].harmonia);
        }
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
        this.registrarRecordeLivre();
        this.desafioLivre = ligado;
        this.reiniciarMusica();
    },

    sortearNotaLivre: function() {
        const notas = Object.keys(this.layoutOitava4).filter(nota => nota !== this.proximaNotaLivre);
        this.proximaNotaLivre = notas[Math.floor(Math.random() * notas.length)];
    },

    marcarNotaErrada: function(tecla, item, harmonia) {
        tecla?.classList.add('nota-errada');
        if (tecla) setTimeout(() => tecla.classList.remove('nota-errada'), 250);
        this.registrarErro(item, harmonia);
    },

    avaliarNota: function(codigo, origem, tecla, ponteiro, alturas = [codigo]) {
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
        if (!this.tocandoMusica || this.contagem) return;
        if (this.fatorVelocidade !== 'toque' && !this.conferirAtrasos()) return;
        const harmonia = origem === 'dueto-j2';
        const trilha = harmonia ? this.acordesNaEsteira : this.notasNaEsteira;
        const campo = harmonia ? 'passoAcorde' : 'passoNota';
        const item = trilha[this[campo]];
        if (!item) return;

        const modoToque = this.fatorVelocidade === 'toque';
        if (!modoToque && !this.emFaixa(item)) return;
        const acertos = alturas.filter(nota => harmonia ? item.notas.includes(nota) : item.nota === nota);
        if (!acertos.length) {
            if (!modoToque && !this.deveRepetirNota()) {
                this[campo]++;
                if (harmonia) this.notasDoAcorde.clear();
            }
            this.marcarNotaErrada(tecla, item, harmonia);
            return;
        }

        const novos = harmonia ? acertos.filter(nota => !this.notasDoAcorde.has(nota)) : acertos;
        if (!novos.length) return;
        for (const nota of novos) {
            this.registrarAcertoVisual(harmonia, item, nota, ponteiro);
            this.registrarAcerto();
            if (harmonia) this.notasDoAcorde.add(nota);
        }
        if (harmonia) {
            if (!item.notas.every(nota => this.notasDoAcorde.has(nota))) {
                this.atualizarDisplays();
                return;
            }
            this.notasDoAcorde.clear();
        }
        this[campo]++;
        if (modoToque) {
            this.tocarBandaAte(item.tInicio);
            this.posicionarModoToque();
            if (this.partidaCompleta()) {
                this.concluirMusica();
                return;
            }
            this.renderizarTodasEsteiras();
        }
        this.atualizarDisplays();
    },

    mudarFatorVelocidade: function(fator) {
        const mudandoModo = (fator === 'toque') !== (this.fatorVelocidade === 'toque');
        this.fatorVelocidade = fator;
        if (mudandoModo && fator === 'toque') {
            if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
            this.animEsteiraId = null;
            this.posicionarModoToque();
        }
        if (navigator.vibrate) try { navigator.vibrate(20); } catch(e) {}

        document.querySelectorAll('#botoes-velocidade-solo .btn-velocidade-bichinho').forEach(b => {
            const ativo = fator === 'toque' ? b.dataset.fator === fator : Number(b.dataset.fator) === fator;
            b.classList.toggle('ativo', ativo);
            b.setAttribute('aria-pressed', String(ativo));
        });

        if (this.tocandoMusica) this.iniciarAnimacaoEsteira();
        else this.renderizarTodasEsteiras();

        this.sincronizarMetronomoSemRelogio();
        this.atualizarDisplays();
    },

    alternarMetronomo: function() {
        this.metronomoLigado = !this.metronomoLigado;
        const botao = document.getElementById('piano-metronomo');
        botao?.setAttribute('aria-pressed', String(this.metronomoLigado));
        this.ultimoPulso = this.pulsoAtual();
        this.sincronizarMetronomoSemRelogio();
    },

    sincronizarMetronomoSemRelogio: function() {
        clearInterval(this.timerMetronomoSemRelogio);
        this.timerMetronomoSemRelogio = null;
        if (!this.tocandoMusica || this.modo === 'livre' || this.fatorVelocidade !== 'toque' ||
            !this.metronomoLigado || this.contagem) return;
        const batidas = Number(this.partituraAtual?.compasso) || 4;
        let pulso = 0;
        const marcar = () => window.AudioMotor?.tocarMetronomo?.(pulso++ % batidas === 0);
        marcar();
        this.timerMetronomoSemRelogio = setInterval(marcar, 60000 / this.obterBpmEfetivo());
    },

    pulsoAtual: function() {
        return Math.floor(this.tempoMusicaSegundos * (this.partituraAtual?.bpm || 90) / 60);
    },

    marcarPulso: function() {
        const pulso = this.pulsoAtual();
        if (pulso === this.ultimoPulso) return;
        this.ultimoPulso = pulso;
        if (this.metronomoLigado && pulso >= 0) {
            window.AudioMotor?.tocarMetronomo?.(pulso % (this.partituraAtual?.compasso || 4) === 0);
        }
    },

    posicionarModoToque: function() {
        const pistas = this.pistasAtivas();
        const melodia = pistas.melodia ? this.notasNaEsteira[this.passoNota]?.tInicio ?? Infinity : Infinity;
        const base = pistas.base ? this.acordesNaEsteira[this.passoAcorde]?.tInicio ?? Infinity : Infinity;
        const inicio = Math.min(melodia, base);
        if (Number.isFinite(inicio)) this.tempoMusicaSegundos = inicio;
    },

    obterBpmEfetivo: function() {
        const mus = this.catalogoMusicas[this.musicaIndex] || { bpm: 90 };
        if (this.fatorVelocidade === 'toque') return mus.bpm || 90;
        return Math.max(30, Math.round((mus.bpm || 90) * this.fatorVelocidade));
    },

    obterPixelsPorSegundo: function(alturaPista = 160) {
        const bpm = this.catalogoMusicas[this.musicaIndex]?.bpm || 90;
        const fatorEscala = Math.max(1, Math.min(78, (alturaPista - 6) / 2.05));
        return (bpm / 60) * fatorEscala;
    },

    prepararContagem: function(destino, erro, comCompasso, inicio = performance.now()) {
        const batidas = Math.max(1, Number(this.partituraAtual?.compasso) || 4);
        const intervalo = 60000 / this.obterBpmEfetivo();
        const duracao = comCompasso ? batidas * intervalo : 950;
        const mensagem = erro ? 'Errou, tente novamente' : 'Prepare-se para tocar';
        this.contagem = {destino, erro, comCompasso, inicio, duracao, intervalo, batidas, pulso: -1};
        this.sincronizarMetronomoSemRelogio();
        const aviso = document.getElementById('piano-contagem');
        if (aviso) {
            aviso.hidden = false;
            aviso.dataset.erro = String(erro);
            document.getElementById('piano-contagem-texto').textContent = mensagem;
            document.getElementById('piano-contagem-pulso').textContent = comCompasso ? batidas : '';
        }

        const bpm = this.partituraAtual?.bpm || 90;
        this.tempoMusicaSegundos = destino - (comCompasso ? batidas * 60 / bpm : .5);
        this.ultimoPulso = this.pulsoAtual();
        window.BandaPiano?.parar();
        const batidaAlvo = destino * bpm / 60;
        const proximoEvento = this.eventosBanda.findIndex(evento => evento.tempo >= batidaAlvo - .001);
        this.indiceBanda = proximoEvento === -1 ? this.eventosBanda.length : proximoEvento;
        return duracao;
    },

    limparContagem: function() {
        this.contagem = null;
        const aviso = document.getElementById('piano-contagem');
        if (aviso) aviso.hidden = true;
    },

    atualizarContagem: function(agora) {
        const contagem = this.contagem;
        const decorrido = Math.max(0, agora - contagem.inicio);
        if (agora >= contagem.inicio + contagem.duracao) {
            this.tempoMusicaSegundos = contagem.destino;
            this.ultimoPulso = this.pulsoAtual() - 1;
            this.limparContagem();
            this.sincronizarMetronomoSemRelogio();
            return false;
        }
        if (contagem.comCompasso) {
            const pulso = Math.floor(decorrido / contagem.intervalo);
            if (pulso !== contagem.pulso) {
                contagem.pulso = pulso;
                if (this.metronomoLigado) window.AudioMotor?.tocarMetronomo?.(pulso === 0);
                const contador = document.getElementById('piano-contagem-pulso');
                if (contador) contador.textContent = contagem.batidas - pulso;
            }
        }
        const intervalo = contagem.comCompasso ? contagem.batidas * 60 / (this.partituraAtual?.bpm || 90) : .5;
        this.tempoMusicaSegundos = contagem.destino - intervalo * (1 - decorrido / contagem.duracao);
        return true;
    },

    togglePlay: function(local = false) {
        if (this.orientacaoAmpla?.matches === false || document.getElementById('piano-configuracoes')?.open) return;
        if (!local && this.modo === 'dueto' && window.DuetoPiano?.controlarPartida()) return;
        window.AudioMotor?.carregarAmostra(this.timbreSolo);
        if (this.modo === 'dueto') {
            window.AudioMotor?.carregarAmostra(this.timbreDuetoJ1);
            window.AudioMotor?.carregarAmostra(this.timbreDuetoJ2);
        }
        if (!this.catalogoMusicas?.length) return;
        if (this.encerrada) this.reiniciarMusica();
        if (this.tocandoMusica) {
            this.pausarMusica();
            return;
        }
        if (!local && this.contagemPendente) {
            const {destino, erro} = this.contagemPendente;
            this.contagemPendente = null;
            if (this.metronomoLigado || erro) this.prepararContagem(destino, erro, this.metronomoLigado);
            else this.tempoMusicaSegundos = destino;
        } else if (!local && this.rotuloPartida === 'Jogar' && this.metronomoLigado) {
            this.prepararContagem(Math.max(0, this.tempoMusicaSegundos), false, true);
        }
        this.iniciarMusica();
    },

    iniciarMusica: function() {
        this.tocandoMusica = true;
        this.sincronizarMetronomoSemRelogio();
        this.atualizarRotuloPartida('Pausar');
        this.atualizarDisplays();
        if (this.fatorVelocidade !== 'toque' || this.contagem) this.iniciarAnimacaoEsteira();
        else this.renderizarTodasEsteiras();
    },

    pausarMusica: function() {
        if (this.contagem) {
            this.contagemPendente = this.contagem;
            this.limparContagem();
        }
        window.BandaPiano?.parar();
        this.tocandoMusica = false;
        this.sincronizarMetronomoSemRelogio();
        this.relogioCompartilhado = null;
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        this.atualizarRotuloPartida('Continuar');
        if (this.efeitosEsteira.length) this.animarEfeitosEsteira();
    },

    pararMusicaEContadores: function() {
        this.contagemPendente = null;
        this.limparContagem();
        window.BandaPiano?.parar();
        this.relogioCompartilhado = null;
        if (this.animVisualId) cancelAnimationFrame(this.animVisualId);
        this.animVisualId = null;
        this.acertosVisuais.clear();
        this.efeitosEsteira = [];
        this.tocandoMusica = false;
        this.sincronizarMetronomoSemRelogio();
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.animEsteiraId = null;
        this.pararTodasNotas();
        this.tempoMusicaSegundos = 0;
        this.atualizarRotuloPartida('Jogar');
    },

    reiniciarMusica: function() {
        this.registrarRecordeLivre();
        this.pararMusicaEContadores();
        const resultado = document.getElementById('over-simon');
        if (resultado) resultado.style.display = 'none';
        this.passoNota = 0;
        this.passoAcorde = 0;
        this.ultimoPulso = -1;
        this.vidas = 3;
        this.acertosParaVida = 0;
        this.acertosTotais = 0;
        this.errosTotais = 0;
        this.recordeLivreGuardado = false;
        this.encerrada = false;
        if (this.modo === 'livre' && this.desafioLivre) this.sortearNotaLivre();
        this.indiceBanda = 0;
        this.notasDoAcorde.clear();
        if (this.fatorVelocidade === 'toque') this.posicionarModoToque();
        else this.tempoMusicaSegundos = -this.tempoParaAcertar() * 3;
        this.atualizarDisplays();
        this.renderizarTodasEsteiras();
        this.atualizarRotuloPartida('Jogar');
    },

    atualizarRotuloPartida: function(texto) {
        this.rotuloPartida = texto;
        this.atualizarMenuPiano();
    },

    construirTrilhasMelodiaEHarmonia: function() {
        if (!this.catalogoMusicas || this.catalogoMusicas.length === 0) {
            this.notasNaEsteira = [];
            this.acordesNaEsteira = [];
            return;
        }
        const mus = this.partituraAtual;
        const bpm = mus.bpm || 90;
        const segundosPorTempo = 60 / bpm;

        this.notasNaEsteira = [];
        let tempoAtualMelodia = 0;
        if (mus.melodia) {
            mus.melodia.forEach((item, idx) => {
                const durSegundos = item.d * segundosPorTempo;
                const inicio = item.t === undefined ? tempoAtualMelodia : item.t * segundosPorTempo;
                this.notasNaEsteira.push({
                    idx: idx,
                    nota: item.n,
                    durTempos: item.d,
                    tInicio: inicio,
                    tFim: inicio + durSegundos,
                    durSegundos: durSegundos
                });
                tempoAtualMelodia = inicio + durSegundos;
            });
        }

        this.acordesNaEsteira = [];
        let tempoAtualHarmonia = 0;
        if (mus.harmonia) {
            mus.harmonia.forEach((item, idx) => {
                const durSegundos = item.d * segundosPorTempo;
                const inicio = item.t === undefined ? tempoAtualHarmonia : item.t * segundosPorTempo;
                if (inicio >= (mus.duracao || tempoAtualMelodia)) return;
                this.acordesNaEsteira.push({
                    idx: idx,
                    nome: item.nome,
                    notas: item.notas || [],
                    durTempos: item.d,
                    tInicio: inicio,
                    tFim: inicio + durSegundos,
                    durSegundos: durSegundos
                });
                tempoAtualHarmonia = inicio + durSegundos;
            });
        }
        if (this.dificuldade !== 'avancado') {
            this.notasNaEsteira = this.reduzirTrilha(this.notasNaEsteira);
            const limite = this.dificuldade === 'amador' ? 1 : 2;
            this.acordesNaEsteira = this.reduzirTrilha(this.acordesNaEsteira).map(item => {
                const notas = item.notas.slice(0, limite);
                return { ...item, notas, nome: notas.join(' + ') };
            });
        }
    },

    reduzirTrilha: function(itens) {
        if (itens.length <= 2) return itens;
        const porGrupo = this.dificuldade === 'amador' ? 2 : 3;
        const fim = itens.length - 1;
        const selecionadas = new Set([itens[0], itens[fim]]);
        for (let i = 1; i < fim; i += 4) {
            const grupo = itens.slice(i, Math.min(i + 4, fim));
            grupo.sort((a, b) => b.durTempos - a.durTempos);
            const quantidade = Math.ceil(grupo.length * porGrupo / 4);
            for (const nota of grupo.slice(0, quantidade)) selecionadas.add(nota);
        }
        return itens.filter(nota => selecionadas.has(nota)).map((item, idx) => ({ ...item, idx }));
    },

    iniciarAnimacaoEsteira: function() {
        if (this.animEsteiraId) cancelAnimationFrame(this.animEsteiraId);
        this.ultimoTimestamp = performance.now();

        const loop = (agora) => {
            if (!this.tocandoMusica) return;
            if (this.contagem) {
                const contando = this.atualizarContagem(agora);
                this.ultimoTimestamp = agora;
                this.renderizarTodasEsteiras();
                if (contando || this.fatorVelocidade !== 'toque') this.animEsteiraId = requestAnimationFrame(loop);
                else this.animEsteiraId = null;
                return;
            }
            
            const deltaSegundos = Math.min(0.08, (agora - this.ultimoTimestamp) / 1000);
            this.ultimoTimestamp = agora;

            if (this.fatorVelocidade !== 'toque' && this.catalogoMusicas.length > 0) {
                const bpmEfetivo = this.obterBpmEfetivo();
                const mus = this.partituraAtual;
                const multiplicadorTempo = bpmEfetivo / (mus.bpm || 90);
                const relogio = this.relogioCompartilhado;
                if (relogio) {
                    this.tempoMusicaSegundos = relogio.posicao + Math.max(0, (agora - relogio.inicio) / 1000) * multiplicadorTempo;
                } else {
                    this.tempoMusicaSegundos += deltaSegundos * multiplicadorTempo;
                }

                this.tocarBandaAte(this.tempoMusicaSegundos);
                this.marcarPulso();
                if (!this.conferirAtrasos()) {
                    if (this.contagem) this.animEsteiraId = requestAnimationFrame(loop);
                    return;
                }
                const ultimaNota = this.notasNaEsteira.at(-1);
                if (ultimaNota && this.partidaCompleta() && this.tempoMusicaSegundos >= (mus.duracao || ultimaNota.tFim)) {
                    this.concluirMusica();
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
        for (const efeito of this.efeitosEsteira) {
            if (efeito.ponteiro === ponteiro && efeito.soltura === null) efeito.soltura = performance.now();
        }
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
        const dueto = this.usaPainelDuplo();
        const pistas = this.pistasAtivas();
        const tela = dueto ? this.cvDuetoMelodia : this.cvSolo;
        const ctx = dueto ? this.ctxDuetoMelodia : this.ctxSolo;
        const compartilhado = this.tecladoCompartilhado();
        if (pistas.melodia && tela && ctx) this.desenharPista(ctx, tela, false, agora, compartilhado);
        if (dueto && pistas.base && !compartilhado && this.cvDuetoHarmonia && this.ctxDuetoHarmonia) {
            this.desenharPista(this.ctxDuetoHarmonia, this.cvDuetoHarmonia, true, agora);
        }
    },

    desenharPista: function(ctx, canvas, harmonia, agora, compartilhado = false) {
        const W = canvas._cssWidth || 390;
        const H = canvas._cssHeight || 160;
        const layout = this.usaPainelDuplo() ?
            (harmonia ? this.layoutDuetoBase : this.layoutDuetoMelodia) : this.layoutSolo || this.layoutOitava4;
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
        const regioes = compartilhado ? [true, false] : [harmonia];
        for (const base of regioes) {
            const faixa = coluna => {
                if (!compartilhado || !coluna) return coluna;
                return { ...coluna, xPct: coluna.xPct + (base ? 0 : coluna.wPct * .5), wPct: coluna.wPct * .5 };
            };
            this.desenharNotasDaPista(ctx, layout, faixa, W, H, centro, pps, base, agora);
        }
    },

    desenharNotasDaPista: function(ctx, layout, faixa, W, H, centro, pps, harmonia, agora) {
        const notas = harmonia ? this.acordesNaEsteira : this.notasNaEsteira;
        const passo = harmonia ? this.passoAcorde : this.passoNota;
        for (const efeito of this.efeitosEsteira) {
            if (efeito.harmonia !== harmonia) continue;
            const mapeamento = this.mapearNota(efeito.nota, harmonia);
            const posicao = faixa(layout[mapeamento?.tecla]);
            const col = mapeamento?.cor && posicao ? { ...posicao, cor: mapeamento.cor } : posicao;
            if (!col) continue;
            this.desenharAcerto(ctx, efeito, col, W, centro, pps, agora);
        }
        for (let i = Math.max(0, passo - 6); i < notas.length; i++) {
            const item = notas[i];
            const base = centro + (this.tempoMusicaSegundos - item.tInicio) * pps;
            const altura = Math.max(7, item.durSegundos * pps - 2);
            const topo = base - altura;
            if (base < -4) break;
            if (topo > H + 4) continue;
            const codigos = harmonia ? item.notas : [item.nota];
            for (const nota of codigos) {
                const mapeamento = this.mapearNota(nota, harmonia);
                const col = faixa(layout[mapeamento?.tecla]);
                if (!col || this.acertosVisuais.has(this.chaveVisual(harmonia, item, nota))) continue;
                const figura = this.figuraDaNota(item.durTempos);
                this.desenharBlocoNota(ctx, col, W, topo, altura, mapeamento, figura.cor, harmonia,
                    item.idx === passo && this.emFaixa(item));
            }
        }
    },

    desenharBlocoNota: function(ctx, col, largura, topo, altura, nota, cor, harmonia, naFaixa) {
        const x = col.xPct * largura + 1;
        const w = Math.max(2, col.wPct * largura - 2);
        ctx.save();
        const grad = ctx.createLinearGradient(x, topo, x, topo + altura);
        grad.addColorStop(0, cor + '75');
        grad.addColorStop(.65, cor + 'c8');
        grad.addColorStop(1, cor);
        ctx.fillStyle = grad;
        ctx.strokeStyle = naFaixa || harmonia ? '#fff1cc' : cor;
        ctx.lineWidth = naFaixa ? 2 : 1;
        if (harmonia) ctx.setLineDash([3, 2]);
        if (naFaixa) {
            ctx.shadowColor = cor;
            ctx.shadowBlur = 9;
        }
        ctx.beginPath();
        ctx.roundRect(x, topo, w, altura, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        if (altura >= 13 && w >= 9) {
            ctx.fillStyle = '#181d30';
            ctx.font = '800 9px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(nota.simbolo || nota.etiqueta, x + w / 2, topo + altura - 3, w - 1);
        }
        ctx.restore();
    },

    desenharAcerto: function(ctx, efeito, col, largura, centro, pps, agora) {
        const {preenchido, opacidade} = this.progressoDoEfeito(efeito, agora);
        const x = col.xPct * largura + 3;
        const w = Math.max(2, col.wPct * largura - 6);
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

    prepararTecla: function(tecla) {
        tecla.tabIndex = 0;
        tecla.setAttribute('role', 'button');
        const nota = this.infoNota(tecla.dataset.nota);
        tecla.setAttribute('aria-label', `${nota.nome}, oitava ${nota.oitava}`);
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
            const idTeclado = `teclado-${origem}`;
            container.querySelectorAll('[data-nota]').forEach(tecla => this.prepararTecla(tecla));
            const soltarTeclado = () => {
                trocarTecla(idTeclado, null);
                dedos.delete(idTeclado);
            };
            container.addEventListener('keydown', evento => {
                const tecla = obterTecla(evento.target);
                if (!tecla || !['Enter', ' '].includes(evento.key)) return;
                evento.preventDefault();
                if (!evento.repeat) trocarTecla(idTeclado, tecla);
            });
            container.addEventListener('keyup', evento => {
                if (!dedos.has(idTeclado) || !['Enter', ' '].includes(evento.key)) return;
                evento.preventDefault();
                soltarTeclado();
            });
            container.addEventListener('focusout', soltarTeclado);
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
        const melodia = document.getElementById('teclado-dueto-melodia');
        const baseDueto = document.getElementById('teclado-dueto-harmonia');
        associarTeclasDeContainer(melodia, 1.0, 'dueto-j1');
        associarTeclasDeContainer(baseDueto, 0.85, 'dueto-j2');

        for (const [registro, base] of [['agudo', 4], ['grave', 2]]) {
            const teclado = document.getElementById(`teclado-livre-${registro}`);
            if (!teclado) continue;
            this.montarTecladoAmpliado(teclado, 2, base);
            associarTeclasDeContainer(teclado, 1, `livre-${registro}`);
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) return;
            this.retomarAposConfiguracao = false;
            if (this.modo === 'dueto' && window.DuetoPiano?.pausarPartida()) return;
            if (this.tocandoMusica) this.pausarMusica();
            this.pararTodasNotas();
        });
    },

    obterInstrumentoPorOrigem: function(seletorOrigem, codigoNota) {
        if (seletorOrigem === 'solo' || (this.modo === 'aprendizado' && seletorOrigem.startsWith('dueto-'))) return this.timbreSolo;
        if (seletorOrigem === 'dueto-j1') return this.timbreDuetoJ1;
        if (seletorOrigem === 'dueto-j2') return this.timbreDuetoJ2;
        if (seletorOrigem.startsWith('livre-')) {
            const oitava = Math.min(5, this.infoNota(codigoNota).oitava);
            return this.timbresLivres[oitava] || 'piano';
        }
        return 'piano';
    },

    pressionarNota: function(codigoNota, pointerId, elTecla, fatorVol = 1.0, seletorOrigem = 'solo') {
        if (this.orientacaoAmpla?.matches === false || !this.infoNota(codigoNota)) return;
        if (this.tocandoMusica && !this.contagem && this.modo !== 'livre' && this.fatorVelocidade !== 'toque') this.conferirAtrasos();
        const pistas = this.origensDaTecla(codigoNota, seletorOrigem);
        const notas = this.notasDoToque(codigoNota, seletorOrigem, pistas);
        const instrumento = this.obterInstrumentoPorOrigem(seletorOrigem, codigoNota);
        const chaves = notas.map(nota => {
            const chave = `${nota}_${pointerId}`;
            window.AudioMotor?.iniciarVozPiano?.(chave, this.infoNota(nota).freq, fatorVol / Math.sqrt(notas.length), instrumento);
            return chave;
        });
        this.teclasAtivasPorPointer[pointerId] = { tecla: elTecla, chaves };
        if (this.modo === 'dueto') window.DuetoPiano?.enviarNotas(chaves, notas, instrumento);
        if (navigator.vibrate) try { navigator.vibrate(22); } catch {}

        if (elTecla) {
            const simbolos = notas.map(nota => this.mapearNota(nota, seletorOrigem === 'dueto-j2')?.simbolo).filter(Boolean);
            if (this.modo !== 'livre' && simbolos.length) elTecla.dataset.oitavaTocada = [...new Set(simbolos)].join(' ');
            elTecla.classList.add('tocando');
            if (!this.tocandoMusica || this.modo === 'livre') this.soltarNotaFlutuante(elTecla);
        }
        for (const pista of pistas) this.avaliarNota(codigoNota, pista, elTecla, pointerId, notas);
    },

    soltarNota: function(_codigoNota, pointerId, elTecla) {
        this.liberarEfeitoNota(pointerId);
        const ativa = this.teclasAtivasPorPointer[pointerId];
        for (const chave of ativa?.chaves || []) window.AudioMotor?.soltarVozPiano?.(chave);
        if (this.modo === 'dueto' && ativa) window.DuetoPiano?.soltarNotas(ativa.chaves);
        delete this.teclasAtivasPorPointer[pointerId];
        if (elTecla && !Object.values(this.teclasAtivasPorPointer).some(nota => nota.tecla === elTecla)) {
            elTecla.classList.remove('tocando');
            delete elTecla.dataset.oitavaTocada;
        }
    },

    pararTodasNotas: function() {
        if (this.modo === 'dueto') window.DuetoPiano?.soltarNotas(Object.values(this.teclasAtivasPorPointer).flatMap(nota => nota.chaves));
        window.AudioMotor?.soltarTodasVozesPiano?.();
        this.teclasAtivasPorPointer = {};
        document.querySelectorAll('.tecla-branca-piano, .tecla-preta-piano').forEach(el => {
            el.classList.remove('tocando');
            delete el.dataset.oitavaTocada;
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
        if (novoModo === this.modo) return;
        this.retomarAposConfiguracao = false;
        if (this.modo === 'dueto' && novoModo !== 'dueto') window.DuetoPiano?.sair();
        this.registrarRecordeLivre();
        this.pararMusicaEContadores();
        this.modo = novoModo;

        this.organizarPainel();

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

    alterarParteGuiada: function(parte) {
        if (this.modo === 'dueto') {
            if (!['melodia', 'base', 'ambas'].includes(parte)) return;
            this.parteDueto = parte;
        } else {
            if (!['melodia', 'ambas'].includes(parte)) return;
            this.parteSolo = parte;
        }
        this.retomarAposConfiguracao = false;
        if (this.modo === 'dueto') window.DuetoPiano?.pausarPartida(true);
        this.organizarPainel();
        this.reiniciarMusica();
        requestAnimationFrame(() => {
            this.inicializarCanvasEsteiras();
            this.renderizarTodasEsteiras();
        });
    },

    organizarPainel: function() {
        const painel = document.getElementById('tela-simon');
        if (!painel) return;
        const duplo = this.usaPainelDuplo();
        const solo = this.modo === 'aprendizado' && !duplo;
        const pistas = this.pistasAtivas();
        const compartilhado = this.tecladoCompartilhado();
        painel.dataset.modoPiano = this.modo;
        painel.classList.toggle('piano-maos-juntas', compartilhado);
        painel.querySelectorAll('[data-pista-piano]').forEach(bloco => {
            const parte = bloco.dataset.pistaPiano;
            bloco.hidden = !pistas[parte] || (compartilhado && parte === 'base');
        });
        for (const modo of ['aprendizado', 'livre', 'dueto']) {
            const botao = document.getElementById('tab-piano-' + modo);
            if (!botao) continue;
            botao.classList.toggle('ativo', this.modo === modo);
            botao.setAttribute('aria-pressed', String(this.modo === modo));
        }
        this.atualizarMenuPiano();
        document.getElementById('pista-esteira-box').style.display = solo ? 'block' : 'none';
        document.getElementById('teclado-piano-completo').style.display = solo ? 'flex' : 'none';
        document.getElementById('container-teclados-livre').style.display = this.modo === 'livre' ? 'flex' : 'none';
        document.getElementById('container-dueto-piano-2p').style.display = duplo ? 'flex' : 'none';
    },

    selecionarMusica: function(idx) {
        const musica = this.catalogoMusicas[Number(idx)];
        if (!musica) return;
        this.musicaIndex = Number(idx);
        this.estiloMusica = musica.estilo || 'infantil';
        document.querySelectorAll('[data-fonte-piano]').forEach(fonte => {
            fonte.hidden = !musica.fonte;
            const link = fonte.querySelector('a');
            const credito = musica.credito || '';
            if (musica.fonte) link.href = musica.fonte;
            const archives = musica.fonte?.startsWith('https://www.classicalarchives.com/');
            link.textContent = archives ? 'Original from Classical Archives' : 'Fonte da partitura';
            if (archives) link.href = 'https://www.classicalarchives.com/';
            fonte.querySelector('span').textContent = archives ? credito.replace(' Original from Classical Archives', '') : credito;
        });
        document.querySelectorAll('[data-parte-piano]').forEach(select => {
            select.closest('label').hidden = !musica.partes?.length;
            select.replaceChildren(new Option('Obra completa', ''));
            musica.partes?.forEach((parte, i) => select.add(new Option(parte.titulo, String(i))));
        });
        this.popularSeletoresMusica();
        this.selecionarParte('');
    },

    selecionarParte: function(valor) {
        const musica = this.catalogoMusicas[this.musicaIndex];
        if (!musica) return;
        if (document.getElementById('piano-configuracoes')?.open) this.retomarAposConfiguracao = false;
        const parte = valor === '' ? null : musica.partes?.[Number(valor)];
        this.parteAtual = parte || null;
        this.partituraAtual = musica;
        if (parte) {
            const fim = musica.partes[Number(valor) + 1]?.segundos ?? musica.duracao;
            const inicioBatidas = parte.segundos * musica.bpm / 60;
            const fimBatidas = fim * musica.bpm / 60;
            const recortar = trilha => trilha.filter(item => item.t >= inicioBatidas && item.t < fimBatidas)
                .map(item => ({...item, t: item.t - inicioBatidas, d: Math.min(item.d, fimBatidas - item.t)}));
            this.partituraAtual = {...musica, titulo: `${musica.titulo} · ${parte.titulo}`, duracao: fim - parte.segundos,
                melodia: recortar(musica.melodia), harmonia: recortar(musica.harmonia)};
        }
        this.movimentoAtual = parte ? String(valor) : '';
        document.querySelectorAll('[data-parte-piano]').forEach(select => { select.value = this.movimentoAtual; });
        document.querySelectorAll('[data-musica-piano]').forEach(rotulo => { rotulo.textContent = this.partituraAtual.titulo; });
        this.eventosBanda = window.BandaPiano?.montar(this.partituraAtual) || [];
        this.construirTrilhasMelodiaEHarmonia();
        this.reiniciarMusica();
    },

    atualizarDisplays: function() {
        if (!this.catalogoMusicas.length) return;
        const notaItem = this.notasNaEsteira[this.passoNota];
        const alvo = this.mapearNota(notaItem?.nota);
        const acordeItem = this.acordesNaEsteira[this.passoAcorde];
        const rotuloNota = alvo ? [alvo.etiqueta, alvo.simbolo].filter(Boolean).join(' ') : '—';
        const estado = document.getElementById('piano-estado-partida');
        const nota = document.getElementById('piano-nota-atual');
        if (estado && nota) {
            const livre = this.modo === 'livre';
            estado.hidden = livre && !this.desafioLivre;
            if (livre) {
                nota.textContent = this.encerrada ? 'Fim da tentativa' : (this.tabelaFrequencias[this.proximaNotaLivre]?.nome || '—');
            } else if (this.tecladoCompartilhado()) {
                nota.textContent = `Esq. ${acordeItem?.nome || '—'} · Dir. ${rotuloNota}`;
            } else {
                nota.textContent = this.pistasAtivas().melodia ? rotuloNota : (acordeItem?.nome || '—');
            }
        }

        const progresso = document.getElementById('progresso-piano');
        if (progresso) {
            const { melodia, base } = this.pistasAtivas();
            progresso.max = Math.max(1, (melodia ? this.notasNaEsteira.length : 0) +
                (base ? this.acordesNaEsteira.length : 0));
            progresso.value = (melodia ? this.passoNota : 0) + (base ? this.passoAcorde : 0);
        }
        document.querySelectorAll('[data-vidas-piano]').forEach(placar => {
            const coracoes = placar.querySelector('.piano-coracoes');
            for (const [indice, icone] of Array.from(coracoes.children).entries()) {
                icone.classList.toggle('cheio', indice < this.vidas);
            }
            const total = placar.querySelector('.piano-total-vidas');
            const vidas = this.vidasInfinitas ? '∞' : String(this.vidas);
            if (total.textContent !== vidas) total.textContent = vidas;
            placar.querySelector('.piano-acertos').textContent = `${this.acertosParaVida}/10`;
        });

        this.limparBrilhosTeclas();

        if (this.modo === 'livre' && this.desafioLivre && !this.encerrada) {
            document.getElementById('teclado-livre-agudo')
                ?.querySelector(`[data-nota="${this.proximaNotaLivre}"]`)?.classList.add('alvo-brilhando');
        }

        const iluminar = (id, nota, base = false) => {
            const mapa = this.mapearNota(nota, base);
            if (!mapa) return;
            const tecla = document.getElementById(id)?.querySelector(`[data-nota="${mapa.tecla}"]`);
            if (!tecla) return;
            tecla.classList.add(base ? 'harmonia-brilhando' : 'alvo-brilhando');
            const simbolos = (tecla.dataset.oitavaAlvo || '').split(' ').filter(Boolean);
            if (mapa.simbolo && !simbolos.includes(mapa.simbolo)) tecla.dataset.oitavaAlvo = [...simbolos, mapa.simbolo].join(' ');
        };

        if (notaItem && this.pistasAtivas().melodia) {
            iluminar('teclado-piano-completo', notaItem.nota);
            iluminar('teclado-dueto-melodia', notaItem.nota);
        }
        if (this.pistasAtivas().base) {
            const id = this.tecladoCompartilhado() ? 'teclado-dueto-melodia' : 'teclado-dueto-harmonia';
            for (const nota of acordeItem?.notas || []) iluminar(id, nota, true);
        }
    },

    limparBrilhosTeclas: function() {
        document.querySelectorAll('.tecla-branca-piano, .tecla-preta-piano').forEach(el => {
            el.classList.remove('alvo-brilhando', 'harmonia-brilhando');
            delete el.dataset.oitavaAlvo;
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

    registrarRecordeLivre: function() {
        if (this.modo !== 'livre' || !this.desafioLivre || !this.acertosTotais || this.recordeLivreGuardado) return;
        this.recordeLivreGuardado = true;
        window.RecordesArcade?.registrar('simon', 'Desafio de notas', this.acertosTotais, `${this.acertosTotais} acertos`);
    },

    concluirMusica: function() {
        if (this.encerrada) return;
        this.encerrada = true;
        const total = this.acertosTotais + this.errosTotais;
        if (total) {
            const precisao = Math.round(this.acertosTotais * 100 / total);
            const modo = this.modo === 'dueto' ? 'Dueto' : 'Aprender';
            const modalidade = this.dificuldade === 'avancado' ? modo : `${modo} · ${this.niveis[this.dificuldade]}`;
            window.RecordesArcade?.registrar('simon', modalidade, precisao,
                `${precisao}% de acerto`, this.partituraAtual?.titulo || '');
        }
        this.pararMusicaEContadores();
        if (!this.parteAtual && this.modo !== 'dueto' && typeof GerenciadorArcade !== 'undefined') {
            GerenciadorArcade.adicionarMoedas(5);
        }
        window.AudioMotor?.tocarTom(880, .3);
        this.mostrarResultado(true);
    },

    mostrarResultado: function(ganhou) {
        const titulo = document.getElementById('titulo-resultado-piano');
        const mensagem = document.getElementById('txt-msg-conclusao-musica');
        const proxima = document.getElementById('btn-proxima-piano');
        const acelerar = document.getElementById('btn-acelerar-piano');
        const repetir = document.getElementById('btn-repetir-piano');
        const overlay = document.getElementById('over-simon');
        const musica = this.partituraAtual;
        if (titulo) titulo.textContent = ganhou ? (this.parteAtual ? 'Movimento concluído!' : 'Música concluída!') : 'Fim da tentativa';
        if (mensagem) mensagem.textContent = ganhou
            ? `${musica.titulo}${this.parteAtual || this.modo === 'dueto' ? '' : ' · +5 moedas'}`
            : (this.modo === 'livre' ? 'As vidas acabaram. Tente outra sequência.' :
                'As vidas acabaram. Tente de novo ou reduza a velocidade.');
        if (proxima) proxima.hidden = !ganhou;
        if (acelerar) {
            const velocidade = this.proximaVelocidade();
            acelerar.hidden = !ganhou || this.modo !== 'aprendizado' || velocidade === undefined;
            if (!acelerar.hidden) acelerar.textContent = `Tocar a ${velocidade * 100}%`;
        }
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
        if (this.modo === 'aprendizado') this.togglePlay();
    },

    proximaVelocidade: function() {
        const atual = this.fatorVelocidade === 'toque' ? 0 : this.fatorVelocidade;
        return [.5, .75, 1].find(fator => fator > atual);
    },

    tocarMaisRapido: function() {
        const velocidade = this.proximaVelocidade();
        if (this.modo !== 'aprendizado' || velocidade === undefined) return;
        this.mudarFatorVelocidade(velocidade);
        this.repetirPartida();
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
