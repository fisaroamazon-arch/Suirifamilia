/* Suiri Família 7.0 · entrada da página jogos.html. */
// =========================================================================
        // MOTOR DE VIBRAÇÃO HÁPTICA OTIMIZADO
        // =========================================================================
        function tentarVibrar(duracao = 40) {
            if (navigator.vibrate) {
                try { navigator.vibrate(duracao); } catch(e) {}
            }
        }

        // =========================================================================
        // GERENCIADOR DE TRILHA SONORA EM SEGUNDO PLANO (SONG/1.MP3 A 10.MP3)
        // =========================================================================
        const TrilhaSonoraArcade = {
            audio: null,
            totalMusicas: 19,
            ultimaMusica: 0,
            tocando: false,

            obterAudio: function() {
                if (!this.audio) {
                    this.audio = new Audio();
                    this.audio.volume = 0.35; // Volume equilibrado para os jogos
                    this.audio.addEventListener('ended', () => {
                        if (this.tocando) {
                            this.tocarAleatoria();
                        }
                    });
                }
                return this.audio;
            },

            tocarAleatoria: function() {
                const a = this.obterAudio();
                let prox = 1;
                if (this.totalMusicas > 1) {
                    do {
                        prox = Math.floor(Math.random() * this.totalMusicas) + 1;
                    } while (prox === this.ultimaMusica && this.totalMusicas > 1);
                }
                this.ultimaMusica = prox;
                const faixas=window.CatalogoMusicasFelipeSales||[];
                if(!faixas.length)return;
                a.src = 'assets/audio/music/'+faixas[(prox-1)%faixas.length].arquivo;
                this.tocando = true;
                const promessa = a.play();
                if (promessa !== undefined) {
                    promessa.catch(() => {});
                }
            },

            iniciar: function() {
                this.tocando = true;
                this.tocarAleatoria();
            },

            parar: function() {
                this.tocando = false;
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                }
            }
        };

        // =========================================================================
        // MOTOR ACÚSTICO COMPARTILHADO (ARCADE GERAL)
        // =========================================================================
        const AudioMotor = {
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

            tocarEstouro: function(variacao, atraso = 0, intensidade = 1) {
                const ctx = this.obterCtx();
                if (!ctx) return;
                const inicio = ctx.currentTime + atraso;
                const tom = 2 ** (variacao / 12);
                const saida = this.obterSaida();
                if (!this.ruidoBolha) {
                    const amostras = Math.round(ctx.sampleRate * .06);
                    this.ruidoBolha = ctx.createBuffer(1, amostras, ctx.sampleRate);
                    const dados = this.ruidoBolha.getChannelData(0);
                    for (let i = 0; i < amostras; i++) {
                        dados[i] = (Math.random() * 2 - 1) * Math.exp(-6.5 * i / amostras);
                    }
                }
                const estalo = ctx.createBufferSource();
                const filtro = ctx.createBiquadFilter();
                const volumeEstalo = ctx.createGain();
                estalo.buffer = this.ruidoBolha;
                filtro.type = 'bandpass';
                filtro.frequency.value = 1850 * tom;
                filtro.Q.value = .65;
                volumeEstalo.gain.value = .48 * intensidade;
                estalo.connect(filtro).connect(volumeEstalo).connect(saida);
                estalo.start(inicio);
                estalo.onended = () => { estalo.disconnect(); filtro.disconnect(); volumeEstalo.disconnect(); };

                const gota = ctx.createOscillator();
                const volumeGota = ctx.createGain();
                gota.frequency.setValueAtTime(590 * tom, inicio);
                gota.frequency.exponentialRampToValueAtTime(165 * tom, inicio + .075);
                volumeGota.gain.setValueAtTime(.001, inicio);
                volumeGota.gain.linearRampToValueAtTime(.28 * intensidade, inicio + .006);
                volumeGota.gain.exponentialRampToValueAtTime(.001, inicio + .085);
                gota.connect(volumeGota).connect(saida);
                gota.start(inicio);
                gota.stop(inicio + .09);
                gota.onended = () => { gota.disconnect(); volumeGota.disconnect(); };
            },

            tocarEfeito: function(nome, variacao = 0) {
                if (nome === 'bolha') return this.tocarEstouro(variacao);
                if (nome === 'bomba-bolhas') {
                    this.tocarEstouro(-7);
                    this.tocarEstouro(2, .055, .8);
                    this.tocarEstouro(7, .12, .65);
                    return;
                }
                const efeitos = {
                    voo: [[390, 765, .12, 0, 'sine'], [800, 1100, .06, .018, 'triangle']],
                    impacto: [[185, 53, .23, 0, 'triangle'], [108, 46, .12, .025, 'sine']],
                    bloco: [[325, 587, .12, 0, 'triangle'], [702, 872, .09, .032, 'sine']],
                    rebote: [[280, 465, .09, 0, 'triangle']],
                    carta: [[480, 660, .07, 0, 'triangle']],
                    par: [[523, 523, .18, 0, 'sine'], [659, 659, .19, .065, 'sine'], [784, 784, .22, .13, 'triangle']]
                };
                const ctx = this.obterCtx();
                if (!ctx || !efeitos[nome]) return;
                const agora = ctx.currentTime;
                const transposicao = 2 ** (variacao / 12);
                for (const [de, para, duracao, atraso, tipo] of efeitos[nome]) {
                    const inicio = agora + atraso;
                    const osc = ctx.createOscillator();
                    const volume = ctx.createGain();
                    osc.type = tipo;
                    osc.frequency.setValueAtTime(de * transposicao, inicio);
                    osc.frequency.exponentialRampToValueAtTime(para * transposicao, inicio + duracao);
                    volume.gain.setValueAtTime(.0001, inicio);
                    volume.gain.linearRampToValueAtTime(nome === 'impacto' ? .19 : .12, inicio + .008);
                    volume.gain.exponentialRampToValueAtTime(.0001, inicio + duracao);
                    osc.connect(volume).connect(this.obterSaida());
                    osc.start(inicio);
                    osc.stop(inicio + duracao + .01);
                    osc.onended = () => { osc.disconnect(); volume.disconnect(); };
                }
            },

            tocarSomCaneta: function(duracao = 0.12) {
                try {
                    const ctx = this.obterCtx();
                    if (!ctx) return;
                    const bufferSize = Math.floor(ctx.sampleRate * duracao);
                    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.sin(i / 8);
                    const noise = ctx.createBufferSource();
                    noise.buffer = buffer;

                    const filter = ctx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(3600, ctx.currentTime);
                    filter.Q.setValueAtTime(2.2, ctx.currentTime);

                    const gain = ctx.createGain();
                    gain.gain.setValueAtTime(0.28, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);

                    noise.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.obterSaida() || ctx.destination);

                    noise.start();
                } catch(e) {}
            }
        };

        // =========================================================================
        // GERENCIADOR CENTRAL DO ARCADE
        // =========================================================================
        const GerenciadorArcade = {
            telaAtiva: 'menu',
            menusAntesDaPartida: new Map(),
            partidaPausada: null,

            chaveTrilha: function() {
                let id = 'local';
                try { id = JSON.parse(localStorage.getItem('suiri_perfil_ativo') || '{}').id || id; } catch {}
                return `suiri:arcade:trilha:${id}`;
            },

            trilhaLigada: function() {
                try { return localStorage.getItem(this.chaveTrilha()) !== 'off'; } catch { return true; }
            },

            atualizarControleTrilha: function() {
                const botao = document.getElementById('arcade-som');
                const ligada = this.trilhaLigada();
                botao?.setAttribute('aria-pressed', String(ligada));
                if (botao) botao.querySelector('span').textContent = ligada ? 'Trilha ligada' : 'Trilha desligada';
            },

            alternarTrilha: function() {
                try { localStorage.setItem(this.chaveTrilha(), this.trilhaLigada() ? 'off' : 'on'); } catch { return; }
                this.atualizarControleTrilha();
                if (!this.trilhaLigada()) TrilhaSonoraArcade.parar();
                else if (!this.partidaPausada && this.telaAtiva !== 'menu' && this.telaAtiva !== 'simon') TrilhaSonoraArcade.iniciar();
            },

            motorAtivo: function() {
                return { flappy: MotorFlappy, quebrablocos: MotorQuebraBlocos, bolhas: MotorBolhas }[this.telaAtiva];
            },

            atualizarControlePausa: function(ativo, motor) {
                const botao = motor?.canvas?.parentElement.querySelector('[data-arcade-pausar]');
                if (botao) botao.hidden = !ativo;
            },

            pausar: function() {
                const motor = this.motorAtivo();
                if (!motor?.rodando || this.partidaPausada) return;
                const dialogo = document.getElementById('arcade-pausa');
                if (!dialogo?.showModal) return;
                const agora = performance.now();
                this.partidaPausada = { motor, agora };
                motor.rodando = false;
                cancelAnimationFrame(motor.anim);
                motor.anim = null;
                motor.teclas?.clear();
                motor.canvas.parentElement.dataset.pausa = 'sim';
                TrilhaSonoraArcade.audio?.pause();
                dialogo.showModal();
            },

            continuar: function() {
                const pausa = this.partidaPausada;
                if (!pausa || document.hidden) return;
                this.partidaPausada = null;
                const { motor, agora } = pausa;
                const instante = performance.now();
                delete motor.canvas.parentElement.dataset.pausa;
                document.getElementById('arcade-pausa')?.close();
                motor.rodando = true;
                motor.ultimoFrame = instante;
                if (motor === MotorBolhas) {
                    motor.ultimoSpawn += instante - agora;
                    motor.proximaBomba += instante - agora;
                    if (motor.fimAvisoBonus) motor.fimAvisoBonus += instante - agora;
                    if (motor.prazoRush) motor.prazoRush += instante - agora;
                }
                motor.canvas.focus({ preventScroll: true });
                motor.loop(instante);
                if (this.trilhaLigada()) {
                    if (TrilhaSonoraArcade.tocando) TrilhaSonoraArcade.audio?.play()?.catch(() => {});
                    else TrilhaSonoraArcade.iniciar();
                }
            },


            obterNomeUsuario: function() {
                try {
                    const p = JSON.parse(localStorage.getItem('suiri_perfil_ativo') || '{}');
                    if (p.nome) return p.nome;
                } catch(e) {}
                return localStorage.getItem('usuario_ativo') || localStorage.getItem('nome_usuario') || 'Jogador 1';
            },

            atualizarNomesJogadores: function() {
                const nomeJ1 = this.obterNomeUsuario();
                const nomeJ2 = "Shuiri";

                document.querySelectorAll('.lbl-j1-nome').forEach(el => el.textContent = nomeJ1);
                document.querySelectorAll('.lbl-j2-nome').forEach(el => el.textContent = nomeJ2);

                const lblBolhasJ1 = document.getElementById('lbl-nome-j1-bolhas');
                const lblBolhasJ2 = document.getElementById('lbl-nome-j2-bolhas');
                if (lblBolhasJ1 && MotorBolhas.modo !== 'solo') lblBolhasJ1.textContent = `${nomeJ1}:`;
                if (lblBolhasJ2) lblBolhasJ2.textContent = `${nomeJ2}:`;
            },

            obterEstado: function() {
                let id = 'padrao_kids';
                try {
                    const p = JSON.parse(localStorage.getItem('suiri_perfil_ativo') || '{}');
                    if (p.id) id = p.id;
                } catch(e) {}
                const chave = `suiri_monstrinho_${id}`;
                const s = localStorage.getItem(chave);
                if (s) {
                    try { return JSON.parse(s); } catch(e) {}
                }
                return { nome: 'Chuíri', fome: 80, felicidade: 85, higiene: 90, energia: 85, moedas: 50 };
            },

            salvarEstado: function(estado) {
                let id = 'padrao_kids';
                try {
                    const p = JSON.parse(localStorage.getItem('suiri_perfil_ativo') || '{}');
                    if (p.id) id = p.id;
                } catch(e) {}
                localStorage.setItem(`suiri_monstrinho_${id}`, JSON.stringify(estado));
                this.atualizarSaldoVisual();
            },

            adicionarMoedas: function(qtd) {
                if (qtd <= 0) return;
                const est = this.obterEstado();
                est.moedas = (est.moedas || 0) + qtd;
                est.felicidade = Math.min(100, (est.felicidade || 80) + 5);
                this.salvarEstado(est);
            },

            atualizarSaldoVisual: function() {
                const est = this.obterEstado();
                const el = document.getElementById('txt-moedas-arcade');
                if (el) {
                    const moedas = String(est.moedas || 0);
                    const mudou = el.textContent !== moedas;
                    el.textContent = moedas;
                    if (mudou && this.telaAtiva !== 'menu' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        el.parentElement.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.11)' }, { transform: 'scale(1)' }], 300);
                    }
                }
            },

            controlarBarraSuperior: function(exibir) {
                const barra = document.getElementById('barra-topo-arcade');
                if (barra) {
                    barra.style.display = exibir ? 'flex' : 'none';
                }
            },

            voltarAcao: function() {
                this.controlarBarraSuperior(true);
                if (this.telaAtiva === 'simon') window.MotorMusica?.fecharPiano();
                if (this.partidaPausada) {
                    delete this.partidaPausada.motor.canvas.parentElement.dataset.pausa;
                    this.partidaPausada = null;
                    document.getElementById('arcade-pausa')?.close();
                }
                TrilhaSonoraArcade.parar(); // Para a música ao voltar para o menu ou sair
                if (this.telaAtiva === 'menu') {
                    window.location.href = 'index.html';
                } else {
                    MotorFlappy.parar();
                    MotorQuebraBlocos.parar();
                    if (window.MotorMusica && typeof window.MotorMusica.pararMusicaEContadores === 'function') {
                        window.MotorMusica.pararMusicaEContadores();
                    }
                    MotorBolhas.parar();
                    MotorVelha.parar();
                    MotorMemoria.parar();
                    document.querySelectorAll('.area-jogo').forEach(el => el.style.display = 'none');
                    document.getElementById('menu-arcade').style.display = 'flex';
                    document.querySelector(`[data-arcade-jogo="${this.telaAtiva}"]`)?.focus({ preventScroll: true });
                    this.telaAtiva = 'menu';
                    document.body.dataset.arcadeTela = 'menu';
                    document.getElementById('rotulo-voltar-arcade').textContent = 'Vila';
                }
            },

            abrirJogo: function(idJogo, telaInteira = false) {
                if (this.telaAtiva !== 'menu' || !document.getElementById(`tela-${idJogo}`)) return;
                this.atualizarNomesJogadores();
                if (window.MotorMusica && typeof window.MotorMusica.pararMusicaEContadores === 'function') {
                    window.MotorMusica.pararMusicaEContadores();
                }
                document.getElementById('menu-arcade').style.display = 'none';
                document.querySelectorAll('.area-jogo').forEach(el => el.style.display = 'none');
                this.telaAtiva = idJogo;
                document.body.dataset.arcadeTela = idJogo;
                const menu = document.getElementById(`over-${idJogo}`);
                if (menu?.querySelector('.arcade-pre-jogo') && !this.menusAntesDaPartida.has(idJogo)) {
                    this.menusAntesDaPartida.set(idJogo, menu.innerHTML);
                } else if (menu && this.menusAntesDaPartida.has(idJogo)) {
                    menu.innerHTML = this.menusAntesDaPartida.get(idJogo);
                }
                document.getElementById('rotulo-voltar-arcade').textContent = 'Arcade';
                document.querySelectorAll(`#tela-${idJogo} [data-arcade-imagem]`).forEach(img => {
                    const parado = matchMedia('(prefers-reduced-motion: reduce)').matches ? '-parado' : '';
                    img.src = `assets/images/kids/${img.dataset.arcadeImagem}${parado}.webp`;
                });

                if (idJogo === 'simon' || !this.trilhaLigada()) {
                    TrilhaSonoraArcade.parar();
                } else {
                    TrilhaSonoraArcade.iniciar();
                }

                if (idJogo === 'flappy') {
                    document.getElementById('tela-flappy').style.display = 'block';
                    MotorFlappy.montar();
                } else if (idJogo === 'quebrablocos') {
                    document.getElementById('tela-quebrablocos').style.display = 'block';
                    MotorQuebraBlocos.montar();
                } else if (idJogo === 'simon') {
                    document.getElementById('tela-simon').style.display = 'block';
                    window.AudioMotor?.carregarAmostra?.('piano');
                    if (window.MotorMusica && typeof window.MotorMusica.montar === 'function') {
                        window.MotorMusica.montar();
                        if (telaInteira) window.MotorMusica.ativarTelaInteira(true);
                        document.getElementById('piano-abrir-config')?.focus({ preventScroll: true });
                    }
                } else if (idJogo === 'bolhas') {
                    document.getElementById('tela-bolhas').style.display = 'block';
                    MotorBolhas.montar();
                } else if (idJogo === 'velha') {
                    document.getElementById('tela-velha').style.display = 'block';
                    MotorVelha.iniciar();
                } else if (idJogo === 'memoria') {
                    document.getElementById('tela-memoria').style.display = 'flex';
                    MotorMemoria.trocarModo(MotorMemoria.modo);
                }
                document.querySelector(`#tela-${idJogo} .overlay-jogo button, #tela-${idJogo} .btn-modo-som-tab`)
                    ?.focus({ preventScroll: true });
            }
        };

        // =========================================================================
        // 1. MOTOR DO CHUÍRI VOADOR (1P E 2P COOPERATIVO COM REVIVER)
        // =========================================================================
        const cenariosVoo = {
            serra: { nome: 'Serra ao amanhecer', ceu: ['#274b75', '#71bbcc', '#ffe5ad'], luz: '#ffeabb', fundo: '#739c93', perto: '#3e7774',
                frente: '#204b50', chao: '#225e52', borda: '#8ed5a4', madeira: ['#3c303f', '#b87964', '#754851'] },
            litoral: { nome: 'Litoral dourado', ceu: ['#265990', '#71cddd', '#ffe4b6'], luz: '#fff3cb', fundo: '#71b6c8', perto: '#3e9c9a',
                frente: '#1e707f', chao: '#78564b', borda: '#eed093', madeira: ['#3d334b', '#b98d6b', '#675063'] },
            estrelas: { nome: 'Céu estrelado', ceu: ['#171e44', '#433c78', '#aa82a6'], luz: '#eff2ff', fundo: '#535883', perto: '#364969',
                frente: '#243653', chao: '#263955', borda: '#96acd8', madeira: ['#26283f', '#987d9c', '#534762'] }
        };

        const sequenciaVoo = Object.keys(cenariosVoo);

        function pintarCenarioVoo(ctx, w, h, nome, cores) {
            const ceu = ctx.createLinearGradient(0, 0, 0, h);
            for (const [indice, cor] of cores.ceu.entries()) ceu.addColorStop(indice * .47, cor);
            ctx.fillStyle = ceu;
            ctx.fillRect(0,0,w,h);
            const xLuz = w * .72, yLuz = h * .24, raio = Math.min(w * .16, 86);
            const aurora = ctx.createRadialGradient(xLuz,yLuz,raio*.3,xLuz,yLuz,raio*1.9);
            aurora.addColorStop(0, cores.luz + '94');
            aurora.addColorStop(1, cores.luz + '00');
            ctx.fillStyle = aurora;
            ctx.fillRect(xLuz - 2*raio,yLuz - 2*raio,4*raio,4*raio);
            ctx.fillStyle = cores.luz;
            ctx.beginPath();
            ctx.arc(xLuz,yLuz,raio*.7,0,2*Math.PI);
            ctx.fill();
            if (nome === 'estrelas') {
                for (let i = 0; i < 49; i++) {
                    const x = (Math.sin(i * 18.13) * .5 + .5) * w;
                    const y = (Math.cos(i * 13.21) * .5 + .5) * h * .58;
                    ctx.globalAlpha = .22 + (i % 4) * .15;
                    ctx.fillRect(x, y, i % 8 === 0 ? 2 : 1, i % 8 === 0 ? 2 : 1);
                }
                ctx.globalAlpha = 1;
            } else {
                for (const [x,y,s] of [[.12,.21,.6],[.41,.15,.34],[.61,.39,.48],[.9,.31,.5]]) {
                    ctx.fillStyle = '#fff6';
                    ctx.beginPath();
                    ctx.ellipse(w*x,h*y,w*s*.29,h*.023,0,0,2*Math.PI);
                    ctx.ellipse(w*x-w*s*.14,h*y-h*.013,w*s*.19,h*.021,0,0,2*Math.PI);
                    ctx.fill();
                }
            }
            for (const [indice, cor] of [cores.fundo, cores.perto, cores.frente].entries()) {
                ctx.fillStyle = cor;
                ctx.beginPath();
                for (let x = 0; x <= w + 6; x += 6) {
                    const y = h * (.58 + indice * .096) +
                        (Math.sin(x / w * 9 + indice * 3) * .043 + Math.sin(x / w * 22) * .018) * h;
                    if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.lineTo(w,h);
                ctx.lineTo(0,h);
                ctx.fill();
            }
            if (nome === 'litoral') {
                ctx.strokeStyle = '#d8fbff67';
                ctx.lineWidth = 1.1;
                for (let i = 0; i < 25; i++) {
                    const x = (Math.sin(i*8.8)*.5+.5) * w;
                    const y = h * (.63 + i*.011);
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    ctx.lineTo(x + 7 + (i % 6)*4,y);
                    ctx.stroke();
                }
            } else {
                for (let i = 0; i < 26; i++) {
                    const x = i * w / 25;
                    const y = h * (.875 + Math.sin(i * .69) * .042);
                    const altura = 12 + ((i * 13) % 37);
                    ctx.fillStyle = cores.frente;
                    ctx.fillRect(x-1,y,2,altura + 55);
                    ctx.beginPath();
                    ctx.moveTo(x,y-altura);
                    ctx.lineTo(x-8,y+2);
                    ctx.lineTo(x+8,y+2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        const MotorFlappy = {
            canvas: null, ctx: null, anim: null, rodando: false,
            modo: 1, // 1 = Solo, 2 = Cooperativo
            cenarioEscolhido: 'viagem',
            cenario: 'serra',
            obstaculosPassados: 0,
            moedasGanhasPartida: 0,
            ultimoFrame: 0,
            fpsIntervalo: 25,
            
            // Personagem 1: Chuíri (assets/images/animated/voando.gif)
            p1: { xBase: 45, x: 45, y: 220, w: 68, h: 108, grav: 0.34, imp: -5.8, vy: 0, vivo: true, el: null },
            // Personagem 2: Gato (assets/images/animated/gato.gif)
            p2: { xBase: 75, x: 75, y: 220, w: 64, h: 70, grav: 0.34, imp: -5.8, vy: 0, vivo: true, el: null },
            
            obstaculos: [],
            moedasNoAr: [],
            vidasNoAr: [], // Itens de reviver coletáveis
            particulasVento: [],
            timer: 0,
            larguraTronco: 58,
            obstaculoParaSpawnVida: 0,
            cicloAnimProfundidade: 0,

            montar: function() {
                this.canvas = document.getElementById('cv-flappy');
                this.ctx = this.canvas.getContext('2d');
                const r = this.canvas.parentElement.getBoundingClientRect();
                this.canvas.width = r.width;
                this.canvas.height = r.height;

                this.p1.el = document.getElementById('chuiri-voador-gif-el');
                this.p2.el = document.getElementById('gato-voador-gif-el');

                // Multitoque independente: Esquerda = P1 (Chuíri), Direita = P2 (Gato)
                const capturarPulo = (clientX) => {
                    if (!this.rodando) return;
                    const rect = this.canvas.getBoundingClientRect();
                    const touchX = clientX - rect.left;
                    if (this.modo === 2) {
                        if (touchX < rect.width / 2) {
                            this.pular(1);
                        } else {
                            this.pular(2);
                        }
                    } else {
                        this.pular(1);
                    }
                };

                this.canvas.onpointerdown = e => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    capturarPulo(e.clientX);
                };
                this.canvas.onkeydown = e => {
                    if (!this.rodando || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
                    const jogador = ['Space', 'ArrowUp'].includes(e.code) ? 1 : e.code === 'KeyW' && this.modo === 2 ? 2 : 0;
                    if (!jogador) return;
                    e.preventDefault();
                    this.pular(jogador);
                };

                document.getElementById('over-flappy').style.display = 'flex';
                if (this.p1.el) this.p1.el.style.display = 'none';
                if (this.p2.el) this.p2.el.style.display = 'none';
                this.rodando = false;
                const seletor = document.getElementById('flappy-cenario');
                if (seletor) seletor.value = this.cenarioEscolhido;
                this.preverCenario(this.cenarioEscolhido);
            },

            preverCenario: function(valor) {
                this.cenarioEscolhido = Object.hasOwn(cenariosVoo, valor) ? valor : 'viagem';
                this.cenario = this.cenarioEscolhido === 'viagem' ? 'serra' : this.cenarioEscolhido;
                if (this.canvas && !this.rodando) {
                    this.obstaculos = [];
                    this.moedasNoAr = [];
                    this.vidasNoAr = [];
                    this.particulasVento = [];
                    this.desenhar();
                }
            },

            iniciar: function(modoEscolhido = 1) {
                this.modo = modoEscolhido;
                this.preverCenario(this.cenarioEscolhido);
                this.obstaculos = [];
                this.moedasNoAr = [];
                this.vidasNoAr = [];
                this.particulasVento = [];
                this.obstaculosPassados = 0;
                this.moedasGanhasPartida = 0;
                this.timer = 91;
                this.centroPassagem = this.canvas.height * .48;
                this.cicloAnimProfundidade = 0;
                document.querySelectorAll("#tela-flappy .impacto-voo").forEach(efeito => efeito.remove());
                this.obstaculoParaSpawnVida = 0;
                tentarVibrar(35);

                const yInicial = this.canvas.height / 2 - 40;

                // Reset P1
                this.p1.y = yInicial;
                this.p1.vy = 0;
                this.p1.vivo = true;
                this.p1.xBase = this.modo === 2 ? 40 : 50;

                // Reset P2
                this.p2.y = yInicial + 20;
                this.p2.vy = 0;
                this.p2.vivo = (this.modo === 2);
                this.p2.xBase = 85;

                document.getElementById('placar-flappy').textContent = '0';
                document.getElementById('placar-moedas-ganhas-flappy').textContent = '0';
                document.getElementById('over-flappy').style.display = 'none';

                const hud2P = document.getElementById('hud-status-2p-flappy');
                if (hud2P) hud2P.style.display = this.modo === 2 ? 'flex' : 'none';
                this.atualizarBadgesVidas2P();

                if (this.p1.el) {
                    this.p1.el.style.display = 'block';
                    this.p1.el.style.opacity = '1';
                }

                if (this.p2.el) {
                    if (this.modo === 2) {
                        this.p2.el.style.display = 'block';
                        this.p2.el.style.opacity = '1';
                    } else {
                        this.p2.el.style.display = 'none';
                    }
                }

                this.rodando = true;
                GerenciadorArcade.atualizarControlePausa(true, this);
                this.canvas.focus({ preventScroll: true });
                this.aguardandoPrimeiroToque = true;
                for (const jogador of [this.p1, this.p2]) {
                    jogador.x = jogador.xBase;
                    if (!jogador.el) continue;
                    jogador.el.style.left = `${jogador.x}px`;
                    jogador.el.style.top = `${jogador.y}px`;
                    jogador.el.style.transform = '';
                }
                document.getElementById('flappy-primeiro-toque').hidden = false;

                this.ultimoFrame = performance.now();
                this.loop(this.ultimoFrame);
            },

            pular: function(jogador = 1) {
                if (!this.rodando) return;
                const p = (jogador === 1) ? this.p1 : this.p2;
                if (!p.vivo) return;

                if (this.aguardandoPrimeiroToque) {
                    this.aguardandoPrimeiroToque = false;
                    document.getElementById('flappy-primeiro-toque').hidden = true;
                    if (this.modo === 2) {
                        const parceiro = jogador === 1 ? this.p2 : this.p1;
                        parceiro.vy = parceiro.imp;
                    }
                }
                p.vy = p.imp;
                AudioMotor.tocarEfeito('voo', jogador === 1 ? 0 : 3);

                for (let i = 0; i < 3; i++) {
                    this.particulasVento.push({
                        x: p.x + 10,
                        y: p.y + (p.h / 2) + (Math.random() * 20),
                        vx: -(Math.random() * 2 + 1),
                        vy: (Math.random() * 2 - 1),
                        alpha: 0.8,
                        raio: Math.random() * 3 + 2
                    });
                }
            },

            atualizarBadgesVidas2P: function() {
                const b1 = document.getElementById('badge-p1-flappy-vivo');
                const b2 = document.getElementById('badge-p2-flappy-vivo');
                if (b1) {
                    b1.style.opacity = this.p1.vivo ? '1' : '0.35';
                    b1.textContent = this.p1.vivo ? '💙 Chuíri' : '💀 Chuíri';
                }
                if (b2) {
                    b2.style.opacity = this.p2.vivo ? '1' : '0.35';
                    b2.textContent = this.p2.vivo ? '💖 Gato' : '💀 Gato';
                }
            },

            parar: function() {
                this.rodando = false;
                GerenciadorArcade.atualizarControlePausa(false, this);
                if (this.anim) cancelAnimationFrame(this.anim);
                this.anim = null;
                document.getElementById('flappy-primeiro-toque').hidden = true;
                if (this.p1.el) this.p1.el.style.display = 'none';
                if (this.p2.el) this.p2.el.style.display = 'none';
            },

            loop: function(timestamp) {
                if (!MotorFlappy.rodando) return;
                MotorFlappy.anim = requestAnimationFrame((ts) => MotorFlappy.loop(ts));
                
                if (!timestamp) timestamp = performance.now();
                const delta = timestamp - MotorFlappy.ultimoFrame;
                if (delta > MotorFlappy.fpsIntervalo) {
                    MotorFlappy.ultimoFrame = timestamp - (delta % MotorFlappy.fpsIntervalo);
                    MotorFlappy.atualizar();
                    MotorFlappy.desenhar();
                }
            },

            obterProgresso: function() {
                return Math.min(1, Math.max(0, (this.obstaculosPassados - 4) / 38));
            },

            obterEspacoAtual: function() {
                const espacoInicial = Math.min(290, this.canvas.height * .62);
                return espacoInicial * (1 - .31 * this.obterProgresso());
            },

            atualizar: function() {
                if (this.aguardandoPrimeiroToque) return;
                // Ciclo senoidal suave de troca de profundidade e avanço/recuo
                this.cicloAnimProfundidade += 0.045;
                const balancoX = Math.sin(this.cicloAnimProfundidade) * 22;

                // Atualização física P1 (Chuíri)
                if (this.p1.vivo) {
                    this.p1.vy += this.p1.grav;
                    this.p1.y += this.p1.vy;
                    this.p1.x = this.p1.xBase + (this.modo === 2 ? balancoX : 0);

                    if (this.p1.y + this.p1.h - 18 >= this.canvas.height - 24 || this.p1.y <= -20) {
                        this.abaterJogador(1);
                    }

                    if (this.p1.el) {
                        this.p1.el.style.left = `${this.p1.x}px`;
                        this.p1.el.style.top = `${this.p1.y}px`;
                        const angulo1 = Math.min(6, Math.max(-10, this.p1.vy * 0.9));
                        
                        // Quem está na frente tem z-index maior e escala cheia
                        if (this.modo === 2 && balancoX > 0) {
                            this.p1.el.style.zIndex = '34';
                            this.p1.el.style.transform = `rotate(${angulo1}deg) scale(1)`;
                        } else if (this.modo === 2) {
                            this.p1.el.style.zIndex = '31';
                            this.p1.el.style.transform = `rotate(${angulo1}deg) scale(0.92)`;
                        } else {
                            this.p1.el.style.transform = `rotate(${angulo1}deg)`;
                        }
                    }
                }

                // Atualização física P2 (Gato)
                if (this.modo === 2 && this.p2.vivo) {
                    this.p2.vy += this.p2.grav;
                    this.p2.y += this.p2.vy;
                    this.p2.x = this.p2.xBase - balancoX; // Inverso do P1

                    if (this.p2.y + this.p2.h - 10 >= this.canvas.height - 24 || this.p2.y <= -20) {
                        this.abaterJogador(2);
                    }

                    if (this.p2.el) {
                        this.p2.el.style.left = `${this.p2.x}px`;
                        this.p2.el.style.top = `${this.p2.y}px`;
                        const angulo2 = Math.min(6, Math.max(-10, this.p2.vy * 0.9));

                        if (balancoX <= 0) {
                            this.p2.el.style.zIndex = '34';
                            this.p2.el.style.transform = `rotate(${angulo2}deg) scale(1)`;
                        } else {
                            this.p2.el.style.zIndex = '31';
                            this.p2.el.style.transform = `rotate(${angulo2}deg) scale(0.92)`;
                        }
                    }
                }


                // Se ambos caíram, fim de jogo
                if (!this.p1.vivo && !this.p2.vivo) {
                    return this.fim();
                }

                // Partículas de vento
                for (let i = this.particulasVento.length - 1; i >= 0; i--) {
                    const p = this.particulasVento[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= 0.03;
                    if (p.alpha <= 0) this.particulasVento.splice(i, 1);
                }

                // Spawn de troncos e itens
                this.timer++;
                const progressoVoo = this.obterProgresso();
                const intervaloSpawn = 137 - progressoVoo * 41;
                if (this.timer > intervaloSpawn) {
                    this.timer = 0;
                    const espaco = this.obterEspacoAtual();
                    const variacao = this.canvas.height * (.017 + .13 * progressoVoo);
                    const centro = this.centroPassagem + (Math.random() * 2 - 1) * variacao;
                    const topo = Math.max(20, Math.min(this.canvas.height - espaco - 37, centro - espaco / 2));
                    this.centroPassagem = topo + espaco / 2;

                    this.obstaculos.push({
                        x: this.canvas.width,
                        topo: topo,
                        base: topo + espaco,
                        passou: false
                    });

                    // Se alguém precisa de vida no modo 2P
                    const precisaVida = this.modo === 2 && (!this.p1.vivo || !this.p2.vivo);
                    if (precisaVida && this.vidasNoAr.length === 0 && this.obstaculosPassados >= this.obstaculoParaSpawnVida) {
                        this.vidasNoAr.push({
                            x: this.canvas.width + this.larguraTronco / 2,
                            y: topo + espaco / 2,
                            coletada: false,
                            r: 16
                        });
                    } else if (Math.random() < 0.45) {
                        this.moedasNoAr.push({
                            x: this.canvas.width + this.larguraTronco / 2,
                            y: topo + espaco / 2,
                            coletada: false,
                            r: 11
                        });
                    }
                }

                const velRolagem = 2.12 + progressoVoo * 1.4;

                // Movimento e colisão com troncos
                for (let i = this.obstaculos.length - 1; i >= 0; i--) {
                    const ob = this.obstaculos[i];
                    ob.x -= velRolagem;

                    // Colisão P1
                    if (this.p1.vivo) {
                        const mx1 = 18; const my1 = 22;
                        if (this.p1.x + this.p1.w - mx1 > ob.x && this.p1.x + mx1 < ob.x + this.larguraTronco) {
                            if (this.p1.y + my1 < ob.topo || this.p1.y + this.p1.h - my1 > ob.base) {
                                this.abaterJogador(1);
                            }
                        }
                    }

                    // Colisão P2
                    if (this.modo === 2 && this.p2.vivo) {
                        const mx2 = 14; const my2 = 14;
                        if (this.p2.x + this.p2.w - mx2 > ob.x && this.p2.x + mx2 < ob.x + this.larguraTronco) {
                            if (this.p2.y + my2 < ob.topo || this.p2.y + this.p2.h - my2 > ob.base) {
                                this.abaterJogador(2);
                            }
                        }
                    }

                    // Pontuação e renascimento
                    const refX = Math.max(this.p1.x, this.p2.x);
                    if (!ob.passou && ob.x + this.larguraTronco < refX + 20) {
                        ob.passou = true;
                        this.obstaculosPassados++;
                        document.getElementById('placar-flappy').textContent = this.obstaculosPassados;

                        // Se havia renascimento pendente após passar o próximo tronco
                        if (this.p1.renascerPendente) {
                            this.reviverJogador(1);
                        }
                        if (this.p2.renascerPendente) {
                            this.reviverJogador(2);
                        }

                        if (this.obstaculosPassados % 10 === 0) {
                            this.moedasGanhasPartida++;
                            GerenciadorArcade.adicionarMoedas(1);
                            document.getElementById('placar-moedas-ganhas-flappy').textContent = this.moedasGanhasPartida;
                            AudioMotor.tocarTom(880, 0.22);
                            tentarVibrar(30);
                        } else {
                            AudioMotor.tocarEfeito('bloco');
                        }
                    }

                    if (ob.x < -80) this.obstaculos.splice(i, 1);
                }

                // Coleta de moedas
                for (let i = this.moedasNoAr.length - 1; i >= 0; i--) {
                    const m = this.moedasNoAr[i];
                    m.x -= velRolagem;

                    const pegouP1 = this.p1.vivo && Math.hypot((this.p1.x + 34) - m.x, (this.p1.y + 54) - m.y) < 36;
                    const pegouP2 = this.modo === 2 && this.p2.vivo && Math.hypot((this.p2.x + 32) - m.x, (this.p2.y + 35) - m.y) < 32;

                    if (!m.coletada && (pegouP1 || pegouP2)) {
                        m.coletada = true;
                        this.moedasGanhasPartida++;
                        GerenciadorArcade.adicionarMoedas(1);
                        document.getElementById('placar-moedas-ganhas-flappy').textContent = this.moedasGanhasPartida;
                        AudioMotor.tocarTom(980, 0.2);
                        tentarVibrar(25);
                    }

                    if (m.x < -40 || m.coletada) this.moedasNoAr.splice(i, 1);
                }

                // Coleta de vida (reviver parceiro)
                for (let i = this.vidasNoAr.length - 1; i >= 0; i--) {
                    const v = this.vidasNoAr[i];
                    v.x -= velRolagem;

                    const pegouP1 = this.p1.vivo && Math.hypot((this.p1.x + 34) - v.x, (this.p1.y + 54) - v.y) < 38;
                    const pegouP2 = this.modo === 2 && this.p2.vivo && Math.hypot((this.p2.x + 32) - v.x, (this.p2.y + 35) - v.y) < 34;

                    if (!v.coletada && (pegouP1 || pegouP2)) {
                        v.coletada = true;
                        AudioMotor.tocarTom(1046.5, 0.35);
                        tentarVibrar([30, 40, 50]);

                        // Programa o renascimento para o próximo obstáculo
                        if (!this.p1.vivo) this.p1.renascerPendente = true;
                        if (!this.p2.vivo) this.p2.renascerPendente = true;
                    }

                    if (v.x < -40 || v.coletada) this.vidasNoAr.splice(i, 1);
                }
            },

            mostrarImpacto: function(x, y, tipo) {
                const tela = document.getElementById('tela-flappy');
                if (!tela) return;
                const efeito = document.createElement('span');
                efeito.className = 'impacto-voo impacto-' + tipo;
                efeito.setAttribute('aria-hidden', 'true');
                efeito.style.left = Math.max(14, Math.min(this.canvas.width - 14, x)) + 'px';
                efeito.style.top = Math.max(14, Math.min(this.canvas.height - 14, y)) + 'px';
                efeito.textContent = '✦';
                tela.appendChild(efeito);
                setTimeout(() => efeito.remove(), 520);
            },

            abaterJogador: function(num) {
                const p = num === 1 ? this.p1 : this.p2;
                if (!p.vivo) return;

                this.mostrarImpacto(p.x + p.w / 2, p.y + p.h / 2, "obstaculo");
                p.vivo = false;
                tentarVibrar(45);
                AudioMotor.tocarEfeito('impacto');

                if (p.el) {
                    p.el.style.opacity = '0';
                    setTimeout(() => { if (!p.vivo && p.el) p.el.style.display = 'none'; }, 200);
                }

                this.atualizarBadgesVidas2P();

                // Define que a vidinha aparecerá entre 5 a 10 obstáculos à frente
                if (this.modo === 2 && (this.p1.vivo || this.p2.vivo)) {
                    this.obstaculoParaSpawnVida = this.obstaculosPassados + Math.floor(Math.random() * 6) + 5;
                }
            },

            reviverJogador: function(num) {
                const p = num === 1 ? this.p1 : this.p2;
                const outro = num === 1 ? this.p2 : this.p1;
                p.renascerPendente = false;
                p.vivo = true;
                p.y = outro.vivo ? outro.y : (this.canvas.height / 2);
                p.vy = -3.5;

                if (p.el) {
                    p.el.style.display = 'block';
                    p.el.style.opacity = '1';
                }

                AudioMotor.tocarTom(880, 0.2);
                this.atualizarBadgesVidas2P();
            },

            desenhar: function() {
                const ctx = this.ctx;
                const w = this.canvas.width;
                const h = this.canvas.height;
                if (this.rodando && this.cenarioEscolhido === 'viagem') {
                    this.cenario = sequenciaVoo[Math.floor(this.obstaculosPassados / 8) % sequenciaVoo.length];
                }
                const cores = cenariosVoo[this.cenario];
                const chaveFundo = this.cenario + ':' + w + 'x' + h;
                if (this.chaveFundo !== chaveFundo && w && h) {
                    this.fundo ||= document.createElement('canvas');
                    this.fundo.width = w;
                    this.fundo.height = h;
                    pintarCenarioVoo(this.fundo.getContext('2d'), w, h, this.cenario, cores);
                    this.chaveFundo = chaveFundo;
                }
                if (this.fundo) ctx.drawImage(this.fundo, 0, 0);
                else ctx.clearRect(0, 0, w, h);
                const rotuloCenario = document.getElementById('hud-cenario-flappy');
                if (rotuloCenario && rotuloCenario.textContent !== cores.nome) rotuloCenario.textContent = cores.nome;

                // Partículas
                this.particulasVento.forEach(p => {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Troncos
                this.obstaculos.forEach(ob => {
                    this.desenharTronco(ctx, ob.x, 0, this.larguraTronco, ob.topo, true);
                    this.desenharTronco(ctx, ob.x, ob.base, this.larguraTronco, h - ob.base, false);
                });

                // Moedas
                this.moedasNoAr.forEach(m => {
                    ctx.save();
                    ctx.fillStyle = '#f59e0b';
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fef08a';
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.r - 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });

                // Vidas Coletáveis em SVG (Coração Mágico Flutuante)
                this.vidasNoAr.forEach(v => {
                    ctx.save();
                    ctx.shadowColor = '#ec4899';
                    ctx.shadowBlur = 14;
                    this.desenharCoracaoSvg(ctx, v.x, v.y, v.r);
                    ctx.restore();
                });

                // Chão
                ctx.fillStyle = cores.chao;
                ctx.fillRect(0, h - 24, w, 24);
                ctx.fillStyle = cores.borda;
                ctx.fillRect(0, h - 24, w, 4);
                ctx.fillStyle = '#183639';
                ctx.fillRect(0, h - 8, w, 8);
            },

            desenharCoracaoSvg: function(ctx, x, y, r) {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(r / 12, r / 12);
                ctx.fillStyle = '#ec4899';
                ctx.beginPath();
                ctx.moveTo(0, 4);
                ctx.bezierCurveTo(-6, -4, -12, 2, -12, 7);
                ctx.bezierCurveTo(-12, 12, -4, 16, 0, 20);
                ctx.bezierCurveTo(4, 16, 12, 12, 12, 7);
                ctx.bezierCurveTo(12, 2, 6, -4, 0, 4);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(-4, 6, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },

            desenharTronco: function(ctx, x, y, w, h, invertido) {
                ctx.save();
                const madeira = ctx.createLinearGradient(x, 0, x + w, 0);
                const [cascaEscura, cascaClara, cascaMedia] = cenariosVoo[this.cenario].madeira;
                madeira.addColorStop(0, cascaEscura);
                madeira.addColorStop(.32, cascaClara);
                madeira.addColorStop(.65, cascaMedia);
                madeira.addColorStop(1, cascaEscura);
                ctx.fillStyle = madeira;
                ctx.fillRect(x, y, w, h);

                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.clip();
                ctx.strokeStyle = '#f6b78f55';
                ctx.lineWidth = 1.5;
                for (let i = 1; i < 5; i++) {
                    const veia = x + i * w / 5;
                    ctx.beginPath();
                    ctx.moveTo(veia, y);
                    ctx.bezierCurveTo(veia - 7, y + h / 3, veia + 8, y + h / 2, veia, y + h);
                    ctx.stroke();
                }

                const borda = invertido ? y + h - 12 : y;
                ctx.fillStyle = '#305e54';
                ctx.fillRect(x, borda, w, 12);
                ctx.fillStyle = cenariosVoo[this.cenario].borda;
                ctx.fillRect(x, invertido ? borda + 8 : borda, w, 4);
                ctx.restore();
            },

            fim: function() {
                window.RecordesArcade?.registrar('flappy', this.modo === 2 ? 'Dupla' : 'Solo',
                    this.obstaculosPassados, `${this.obstaculosPassados} troncos`);
                this.parar();
                tentarVibrar(60);
                const ov = document.getElementById('over-flappy');
                const tituloModo = this.modo === 2 ? 'Dueto Aéreo Finalizado!' : 'Fim do Voo!';
                ov.innerHTML = `
                    <div class="painel-dialogo-arcade">
                        <h2 style="color:#ef4444;">${tituloModo}</h2>
                        <p>Troncos superados: <strong>${this.obstaculosPassados}</strong><br>
                        <span style="color:#b45309; font-weight:900; font-size:14px; margin-top:4px; display:inline-block;">+${this.moedasGanhasPartida} Moedas conquistadas!</span></p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn-acao-jogo" onclick="MotorFlappy.iniciar(${this.modo})">Jogar Novamente</button>
                            <button class="btn-acao-jogo" style="background:#0284c7; border-bottom-color:#0369a1;" onclick="MotorFlappy.iniciar(${this.modo === 1 ? 2 : 1})">${this.modo === 1 ? '👥 Modo 2 Jogadores (Dueto)' : '👤 Modo 1 Jogador (Solo)'}</button>
                        </div>
                        <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                    </div>
                `;
                ov.style.display = 'flex';
            }
        };

        // =========================================================================
        // 2. QUEBRA-BLOCOS MÁGICO (1P) & SKATE PONG (2P)
        // =========================================================================
        const MotorQuebraBlocos = {
            canvas: null, ctx: null, anim: null, rodando: false,
            modo: 1,
            faseAtual: 1,
            vidas: 3,
            skate: { x: 140, y: 0, w: 98, h: 22 },
            skateTopo: { x: 140, y: 65, w: 98, h: 22 },
            pontosJ1: 0,
            pontosJ2: 0,
            bola: { x: 180, y: 300, r: 7, vx: 2.8, vy: -3.2 },
            chuiriGifEl: null,
            blocos: [],
            estilhacos: [],
            totalDestruidos: 0,
            moedasGanhas: 0,
            ultimoFrame: 0,
            fpsIntervalo: 25,
            obstaculoTimer: 0,

            montar: function() {
                this.canvas = document.getElementById('cv-quebrablocos');
                this.ctx = this.canvas.getContext('2d');
                const r = this.canvas.parentElement.getBoundingClientRect();
                this.canvas.width = r.width;
                this.canvas.height = r.height;

                this.chuiriGifEl = document.getElementById('chuiri-skate-gif-el');
                this.skate.y = this.canvas.height - 90;
                this.skate.x = this.canvas.width / 2 - this.skate.w / 2;
                this.skateTopo.x = this.canvas.width / 2 - this.skateTopo.w / 2;

                const ponteiros = new Map();
                const mover = e => {
                    if (!this.rodando || !ponteiros.has(e.pointerId)) return;
                    const rect = this.canvas.getBoundingClientRect();
                    this.moverSkate(ponteiros.get(e.pointerId), (e.clientX - rect.left) * this.canvas.width / rect.width);
                };
                this.canvas.onpointerdown = e => {
                    if (!this.rodando || e.button !== 0) return;
                    const rect = this.canvas.getBoundingClientRect();
                    ponteiros.set(e.pointerId, this.modo === 2 && e.clientY - rect.top < rect.height / 2);
                    this.canvas.setPointerCapture?.(e.pointerId);
                    mover(e);
                };
                this.canvas.onpointermove = mover;
                this.canvas.onlostpointercapture = this.canvas.onpointercancel = e => ponteiros.delete(e.pointerId);
                this.canvas.onpointerup = e => {
                    if (!ponteiros.has(e.pointerId)) return;
                    mover(e);
                    ponteiros.delete(e.pointerId);
                    this.lancarBolaSolo();
                };

                this.teclas = new Set();
                this.canvas.onkeydown = e => {
                    if (!this.rodando || e.altKey || e.ctrlKey || e.metaKey) return;
                    if (e.code === 'Space' && this.modo === 1) {
                        e.preventDefault();
                        if (!e.repeat) this.lancarBolaSolo();
                        return;
                    }
                    if (!['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) return;
                    e.preventDefault();
                    this.teclas.add(e.code);
                };
                this.canvas.onkeyup = e => this.teclas.delete(e.code);
                this.canvas.onblur = () => { this.teclas.clear(); ponteiros.clear(); };

                document.getElementById('over-quebrablocos').style.display = 'flex';
                if (this.chuiriGifEl) this.chuiriGifEl.style.display = 'none';
                this.rodando = false;
            },

            moverSkate: function(topo, centro) {
                const skate = topo ? this.skateTopo : this.skate;
                skate.x = Math.max(0, Math.min(this.canvas.width - skate.w, centro - skate.w / 2));
                if (!topo && this.chuiriGifEl && this.modo === 1) {
                    this.chuiriGifEl.style.left = `${skate.x + (skate.w - 68) / 2}px`;
                    this.chuiriGifEl.style.top = `${skate.y - 60}px`;
                }
            },

            iniciar: function(modoEscolhido = 1) {
                this.modo = modoEscolhido;
                this.faseAtual = 1;
                this.vidas = 3;
                this.totalDestruidos = 0;
                this.moedasGanhas = 0;
                this.pontosJ1 = 0;
                this.pontosJ2 = 0;
                this.estilhacos = [];
                this.bolaEmEspera = false;
                this.obstaculoTimer = 0;
                tentarVibrar(35);

                const hudNormal = document.getElementById('hud-quebrablocos-normal');
                const hudPong = document.getElementById('hud-skate-pong-2p');

                if (this.modo === 2) {
                    GerenciadorArcade.controlarBarraSuperior(false);
                    GerenciadorArcade.atualizarNomesJogadores();
                    hudNormal.style.display = 'none';
                    hudPong.style.display = 'flex';
                    document.getElementById('placar-pong-j1').textContent = '0';
                    document.getElementById('placar-pong-j2').textContent = '0';
                    this.skateTopo.y = 65;
                    if (this.chuiriGifEl) this.chuiriGifEl.style.display = 'none';
                } else {
                    GerenciadorArcade.controlarBarraSuperior(true);
                    hudNormal.style.display = 'flex';
                    hudPong.style.display = 'none';
                    document.getElementById('placar-quebrablocos-fase').textContent = '1';
                    document.getElementById('placar-quebrablocos-vidas').textContent = this.vidas;
                    document.getElementById('placar-quebrablocos-blocos').textContent = '0';
                    document.getElementById('placar-quebrablocos-moedas').textContent = '0';
                    if (this.chuiriGifEl) {
                        this.chuiriGifEl.style.display = 'block';
                        this.chuiriGifEl.style.left = `${this.skate.x + (this.skate.w - 68) / 2}px`;
                        this.chuiriGifEl.style.top = `${this.skate.y - 60}px`;
                    }
                }

                document.getElementById('over-quebrablocos').style.display = 'none';

                const arena = this.canvas.parentElement.getBoundingClientRect();
                this.canvas.width = Math.round(arena.width);
                this.canvas.height = Math.round(arena.height);
                this.skate.w = this.modo === 1 ? Math.min(116, this.canvas.width * .35) : 98;
                this.skateTopo.w = 98;
                this.teclas.clear();
                this.skate.y = this.canvas.height - 90;
                this.skate.x = this.canvas.width / 2 - this.skate.w / 2;
                this.skateTopo.x = this.canvas.width / 2 - this.skateTopo.w / 2;
                this.moverSkate(false, this.canvas.width / 2);

                this.bola.x = this.canvas.width / 2;
                this.bola.y = this.canvas.height / 2;
                this.bola.vx = (Math.random() < 0.5 ? -1 : 1) * 2.8;
                this.bola.vy = (Math.random() < 0.5 ? -1 : 1) * 3.4;

                if (this.modo === 1) {
                    this.gerarGradeBlocos();
                    this.servirBolaSolo();
                } else this.blocos = [];

                this.rodando = true;
                GerenciadorArcade.atualizarControlePausa(true, this);
                this.canvas.focus({ preventScroll: true });
                this.ultimoFrame = performance.now();
                this.loop(this.ultimoFrame);
            },

            gerarGradeBlocos: function() {
                this.blocos = [];
                const alturaBloco = 22;
                const distancia = alturaBloco + 7;
                const limite = Math.max(1, Math.floor((this.skate.y - 83) / distancia));
                const linhas = Math.min(7, this.faseAtual + 1, limite);
                const colunas = Math.min(7, this.faseAtual + 4);
                const margemX = 14;
                const larguraBloco = (this.canvas.width - (margemX * 2)) / colunas;
                const paletaCores = ['#f780a3', '#ffac6f', '#ffda76', '#75e1ba', '#77cefa', '#bf9dff'];

                for (let l = 0; l < linhas; l++) {
                    const cor = paletaCores[l % paletaCores.length];
                    for (let c = 0; c < colunas; c++) {
                        this.blocos.push({
                            x: margemX + c * larguraBloco,
                            y: 43 + l * distancia,
                            w: larguraBloco - 6,
                            h: alturaBloco,
                            cor: cor,
                            resistencia: this.faseAtual >= 4 && (l * 2 + c) % 4 === 0 ? 2 : 1,
                            vivo: true
                        });
                    }
                }
            },

            adicionarObstaculoCentroPong: function() {
                const w = 48;
                const h = 16;
                const x = Math.random() * (this.canvas.width - w - 20) + 10;
                const y = this.canvas.height / 2 - 25 + Math.random() * 50;
                this.blocos.push({
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    cor: '#f59e0b',
                    vivo: true
                });
            },

            parar: function() {
                this.rodando = false;
                this.teclas?.clear();
                document.getElementById('blocos-dica-saque').hidden = true;
                GerenciadorArcade.atualizarControlePausa(false, this);
                if (this.anim) cancelAnimationFrame(this.anim);
                if (this.chuiriGifEl) this.chuiriGifEl.style.display = 'none';
            },

            loop: function(timestamp) {
                if (!MotorQuebraBlocos.rodando) return;
                MotorQuebraBlocos.anim = requestAnimationFrame((ts) => MotorQuebraBlocos.loop(ts));
                
                if (!timestamp) timestamp = performance.now();
                const delta = timestamp - MotorQuebraBlocos.ultimoFrame;
                if (delta > MotorQuebraBlocos.fpsIntervalo) {
                    MotorQuebraBlocos.ultimoFrame = timestamp - (delta % MotorQuebraBlocos.fpsIntervalo);
                    MotorQuebraBlocos.atualizar();
                    MotorQuebraBlocos.desenhar();
                }
            },

            gerarEstilhacos: function(bx, by, bw, bh, cor) {
                for (let i = 0; i < 5; i++) {
                    this.estilhacos.push({
                        x: bx + bw / 2,
                        y: by + bh / 2,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        cor: cor,
                        alpha: 1,
                        tamanho: Math.random() * 3 + 3
                    });
                }
            },

            atualizar: function() {
                const direcao = (direita, esquerda) => Number(this.teclas.has(direita)) - Number(this.teclas.has(esquerda));
                const base = direcao('ArrowRight', 'ArrowLeft');
                const topo = direcao('KeyD', 'KeyA');
                if (base) this.moverSkate(false, this.skate.x + this.skate.w / 2 + base * 7);
                if (topo && this.modo === 2) this.moverSkate(true, this.skateTopo.x + this.skateTopo.w / 2 + topo * 7);
                for (let i = this.estilhacos.length - 1; i >= 0; i--) {
                    const est = this.estilhacos[i];
                    est.x += est.vx;
                    est.y += est.vy;
                    est.vy += 0.2;
                    est.alpha -= 0.04;
                    if (est.alpha <= 0) this.estilhacos.splice(i, 1);
                }
                if (this.bolaEmEspera) {
                    this.posicionarBolaNoSkate();
                    return;
                }
                const anterior = { x: this.bola.x, y: this.bola.y };
                this.bola.x += this.bola.vx;
                this.bola.y += this.bola.vy;

                if (this.bola.x - this.bola.r <= 0 || this.bola.x + this.bola.r >= this.canvas.width) {
                    this.bola.x = Math.max(this.bola.r, Math.min(this.canvas.width - this.bola.r, this.bola.x));
                    this.bola.vx *= -1;
                    AudioMotor.tocarEfeito('rebote');
                }

                if (this.modo === 1) {
                    if (this.bola.y - this.bola.r <= 0) {
                        this.bola.vy *= -1;
                        AudioMotor.tocarEfeito('rebote');
                    }
                } else {
                    if (this.bola.vy < 0 && this.bola.y - this.bola.r <= this.skateTopo.y + 12 && this.bola.y + this.bola.r >= this.skateTopo.y) {
                        if (this.bola.x >= this.skateTopo.x && this.bola.x <= this.skateTopo.x + this.skateTopo.w) {
                            this.bola.vy = Math.abs(this.bola.vy);
                            const centro = this.skateTopo.x + this.skateTopo.w / 2;
                            const offset = (this.bola.x - centro) / (this.skateTopo.w / 2);
                            this.bola.vx = offset * 4.4;
                            AudioMotor.tocarTom(620, 0.08);
                            tentarVibrar(15);
                        }
                    }

                    if (this.bola.y < -15) {
                        this.pontosJ1++;
                        document.getElementById('placar-pong-j1').textContent = this.pontosJ1;
                        AudioMotor.tocarTom(880, 0.2);
                        if (this.pontosJ1 >= 5) return this.fim();
                        this.resetarBolaPong(1);
                    }

                    if (this.bola.y > this.canvas.height + 15) {
                        this.pontosJ2++;
                        document.getElementById('placar-pong-j2').textContent = this.pontosJ2;
                        AudioMotor.tocarTom(320, 0.2);
                        if (this.pontosJ2 >= 5) return this.fim();
                        this.resetarBolaPong(-1);
                    }

                    this.obstaculoTimer++;
                    if (this.pontosJ1 + this.pontosJ2 >= 2 && this.obstaculoTimer > 310) {
                        this.obstaculoTimer = 0;
                        if (this.blocos.filter(b => b.vivo).length < 3) {
                            this.adicionarObstaculoCentroPong();
                        }
                    }
                }

                if (this.bola.vy > 0 && this.bola.y + this.bola.r >= this.skate.y && this.bola.y - this.bola.r <= this.skate.y + 12) {
                    if (this.bola.x >= this.skate.x && this.bola.x <= this.skate.x + this.skate.w) {
                        this.bola.vy = -Math.abs(this.bola.vy);
                        const centro = this.skate.x + this.skate.w / 2;
                        const offset = (this.bola.x - centro) / (this.skate.w / 2);
                        this.bola.vx = this.modo === 1 && Math.abs(offset) < .16 ?
                            .75 * (Math.sign(this.bola.vx) || 1) : offset * 4.4;
                        AudioMotor.tocarTom(550, 0.08);
                        tentarVibrar(15);
                    }
                }

                const { x, y, r } = this.bola;
                const bloco = this.blocos.find(b => b.vivo &&
                    x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h);
                if (bloco) this.rebaterNoBloco(bloco, anterior);

                if (this.modo === 1) {
                    if (!this.blocos.some(b => b.vivo)) {
                        this.faseAtual++;
                        this.moedasGanhas += 3;
                        GerenciadorArcade.adicionarMoedas(3);
                        document.getElementById('placar-quebrablocos-fase').textContent = this.faseAtual;
                        document.getElementById('placar-quebrablocos-moedas').textContent = this.moedasGanhas;
                        const centro = this.skate.x + this.skate.w / 2;
                        this.skate.w = Math.max(72, this.skate.w - 4);
                        this.moverSkate(false, centro);
                        this.gerarGradeBlocos();
                        this.servirBolaSolo();
                    }

                    if (this.bola.y - this.bola.r > this.canvas.height) {
                        this.vidas--;
                        document.getElementById('placar-quebrablocos-vidas').textContent = this.vidas;
                        if (!this.vidas) this.fim();
                        else this.servirBolaSolo();
                    }
                }
            },

            rebaterNoBloco: function(bloco, anterior) {
                const bola = this.bola;
                if (anterior.y - bola.r >= bloco.y + bloco.h) {
                    bola.y = bloco.y + bloco.h + bola.r;
                    bola.vy = Math.abs(bola.vy);
                } else if (anterior.y + bola.r <= bloco.y) {
                    bola.y = bloco.y - bola.r;
                    bola.vy = -Math.abs(bola.vy);
                } else if (anterior.x < bloco.x + bloco.w / 2) {
                    bola.x = bloco.x - bola.r;
                    bola.vx = -Math.abs(bola.vx);
                } else {
                    bola.x = bloco.x + bloco.w + bola.r;
                    bola.vx = Math.abs(bola.vx);
                }
                if (bloco.resistencia > 1) {
                    bloco.resistencia--;
                    AudioMotor.tocarEfeito('rebote', -4);
                    return;
                }
                bloco.vivo = false;
                this.gerarEstilhacos(bloco.x, bloco.y, bloco.w, bloco.h, bloco.cor);
                if (this.modo === 2) {
                    AudioMotor.tocarTom(720, .1);
                    tentarVibrar(25);
                    return;
                }
                this.totalDestruidos++;
                document.getElementById('placar-quebrablocos-blocos').textContent = this.totalDestruidos;
                if (this.totalDestruidos % 5 === 0) {
                    this.moedasGanhas++;
                    GerenciadorArcade.adicionarMoedas(1);
                    document.getElementById('placar-quebrablocos-moedas').textContent = this.moedasGanhas;
                    AudioMotor.tocarTom(880, .16);
                } else {
                    AudioMotor.tocarEfeito('bloco');
                }
            },

            posicionarBolaNoSkate: function() {
                this.bola.x = this.skate.x + this.skate.w / 2;
                this.bola.y = this.skate.y - this.bola.r - 5;
            },

            servirBolaSolo: function() {
                this.bolaEmEspera = true;
                this.posicionarBolaNoSkate();
                document.getElementById('blocos-dica-saque').hidden = false;
            },

            lancarBolaSolo: function() {
                if (!this.rodando || this.modo !== 1 || !this.bolaEmEspera) return;
                this.bolaEmEspera = false;
                this.posicionarBolaNoSkate();
                this.bola.vx = this.bola.x <= this.canvas.width / 2 ? 1.35 : -1.35;
                this.bola.vy = -Math.min(5.65, 2.45 + (this.faseAtual - 1) * .38);
                document.getElementById('blocos-dica-saque').hidden = true;
                AudioMotor.tocarEfeito('rebote');
            },

            resetarBolaPong: function(direcaoY) {
                this.bola.x = this.canvas.width / 2;
                this.bola.y = this.canvas.height / 2;
                this.bola.vx = (Math.random() < 0.5 ? -1 : 1) * 2.8;
                this.bola.vy = direcaoY * 3.4;
            },

            desenhar: function() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.estilhacos.forEach(est => {
                    ctx.save();
                    ctx.fillStyle = est.cor;
                    ctx.globalAlpha = est.alpha;
                    ctx.fillRect(est.x, est.y, est.tamanho, est.tamanho);
                    ctx.restore();
                });

                this.desenharSkate(this.skate);

                if (this.modo === 2) {
                    this.desenharSkate(this.skateTopo, true);

                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([8, 8]);
                    ctx.beginPath();
                    ctx.moveTo(0, this.canvas.height / 2);
                    ctx.lineTo(this.canvas.width, this.canvas.height / 2);
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.save();
                ctx.shadowColor = '#ffe5ae';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#fff4cf';
                ctx.beginPath();
                ctx.arc(this.bola.x, this.bola.y, this.bola.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                for (const bloco of this.blocos) if (bloco.vivo) this.desenharBloco(bloco);
            },

            desenharSkate: function(skate, invertido = false) {
                const ctx = this.ctx;
                const {x, y, w} = skate;
                ctx.save();
                ctx.translate(x, invertido ? y + 12 : y);
                if (invertido) ctx.scale(1, -1);
                for (const roda of [w * .22, w * .78]) {
                    ctx.fillStyle = '#b5c7db';
                    ctx.fillRect(roda - 3, 6, 6, 10);
                    ctx.beginPath();
                    ctx.arc(roda, 17, 7, 0, Math.PI * 2);
                    ctx.fillStyle = invertido ? '#ffaecc' : '#7fe7d1';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#263447';
                    ctx.stroke();
                    ctx.fillStyle = '#f6faff';
                    ctx.beginPath();
                    ctx.arc(roda, 17, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                const deck = ctx.createLinearGradient(0, -3, 0, 11);
                deck.addColorStop(0, invertido ? '#ffd0ed' : '#fff0b6');
                deck.addColorStop(.48, invertido ? '#eb73ac' : '#ee9d51');
                deck.addColorStop(1, invertido ? '#602e62' : '#914439');
                ctx.fillStyle = deck;
                ctx.beginPath();
                ctx.moveTo(0, -2);
                ctx.quadraticCurveTo(8, 4, 17, 0);
                ctx.lineTo(w - 17, 0);
                ctx.quadraticCurveTo(w - 8, 4, w, -2);
                ctx.quadraticCurveTo(w, 11, w - 16, 10);
                ctx.lineTo(16, 10);
                ctx.quadraticCurveTo(0, 11, 0, -2);
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#fff6c6';
                ctx.stroke();
                ctx.fillStyle = '#233345';
                ctx.beginPath();
                ctx.roundRect(15, 0, w - 30, 3.5, 2);
                ctx.fill();
                ctx.restore();
            },

            desenharBloco: function(bloco) {
                const ctx = this.ctx;
                const {x, y, w, h, cor, resistencia} = bloco;
                const face = ctx.createLinearGradient(x, y, x + w * .7, y + h);
                face.addColorStop(0, '#fff7df');
                face.addColorStop(.31, cor);
                face.addColorStop(.68, cor);
                face.addColorStop(1, '#645175');
                ctx.fillStyle = '#171329a8';
                ctx.beginPath();
                ctx.roundRect(x, y + 3, w, h + 1, 6);
                ctx.fill();
                ctx.fillStyle = face;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, 6);
                ctx.fill();
                ctx.strokeStyle = '#fff4e69c';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = '#fff9d66e';
                ctx.beginPath();
                ctx.roundRect(x + 5, y + 3, w - 10, 3, 2);
                ctx.fill();
                if (resistencia > 1) {
                    ctx.fillStyle = '#4e395c';
                    for (const centro of [x + w * .3, x + w * .7]) {
                        ctx.beginPath();
                        ctx.arc(centro, y + h * .62, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            },

            fim: function() {
                if (this.modo === 2) {
                    window.RecordesArcade?.registrar('quebrablocos', 'Skate Pong',
                        this.pontosJ1 - this.pontosJ2, `${this.pontosJ1} × ${this.pontosJ2}`, 'Base × Topo');
                } else {
                    window.RecordesArcade?.registrar('quebrablocos', 'Solo',
                        this.totalDestruidos, `${this.totalDestruidos} blocos`, `Fase ${this.faseAtual}`);
                }
                this.parar();
                tentarVibrar(60);
                GerenciadorArcade.controlarBarraSuperior(true);
                const ov = document.getElementById('over-quebrablocos');

                if (this.modo === 2) {
                    const nomeJ1 = GerenciadorArcade.obterNomeUsuario();
                    const vencedor = this.pontosJ1 >= 5 ? `🏆 ${nomeJ1} (Base) Venceu!` : '🏆 Shuiri (Topo) Venceu!';
                    ov.innerHTML = `
                        <div class="painel-dialogo-arcade">
                            <h2 style="color:#10b981;">Fim do Duelo!</h2>
                            <p>${vencedor}<br>
                            Placar final: <strong>${this.pontosJ1}</strong> a <strong>${this.pontosJ2}</strong></p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn-acao-jogo" onclick="MotorQuebraBlocos.iniciar(2)">Jogar Outra Partida (2P)</button>
                                <button class="btn-acao-jogo" style="background:#0284c7; border-bottom-color:#0369a1;" onclick="MotorQuebraBlocos.iniciar(1)">Modo Solo (Quebra-Blocos)</button>
                            </div>
                            <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                        </div>
                    `;
                } else {
                    ov.innerHTML = `
                        <div class="painel-dialogo-arcade">
                            <h2 style="color:#ef4444;">A bolinha caiu!</h2>
                            <p>Fase alcançada: <strong>${this.faseAtual}</strong><br>
                            Blocos destruídos: <strong>${this.totalDestruidos}</strong><br>
                            <span style="color:#b45309; font-weight:900; font-size:14px; margin-top:4px; display:inline-block;">+${this.moedasGanhas} Moedas conquistadas!</span></p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn-acao-jogo" onclick="MotorQuebraBlocos.iniciar(1)">Jogar Novamente</button>
                                <button class="btn-acao-jogo" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-bottom-color:#075985;" onclick="MotorQuebraBlocos.iniciar(2)">👥 Jogar Duelo (Skate Pong)</button>
                            </div>
                            <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                        </div>
                    `;
                }
                ov.style.display = 'flex';
            }
        };

        // =========================================================================
        // 4. ESTOURAR BOLHAS (SOLO, DUELO 2P & MODO RUSH TOTAL DE TODOS OS CANTOS)
        // =========================================================================
        const MotorBolhas = {
            canvas: null, ctx: null, anim: null, rodando: false,
            modo: 'solo',
            estouradasJ1: 0,
            estouradasJ2: 0,
            vidasJ1: 5,
            vidasJ2: 5,
            segundosRestantesRush: 180,
            prazoRush: 0,
            bolhas: [],
            gotas: [],
            ultimoSpawn: 0,
            ultimoFrame: 0,
            fpsIntervalo: 25,

            montar: function() {
                this.canvas = document.getElementById('cv-bolhas');
                if (!this.canvas) return;
                this.ctx = this.canvas.getContext('2d');
                this.ajustarCanvasDimensoes();

                this.canvas.onpointerdown = e => {
                    if (!this.rodando || e.button !== 0) return;
                    e.preventDefault();
                    const rect = this.canvas.getBoundingClientRect();
                    this.estourarNaPosicao((e.clientX - rect.left) * this.canvas.width / rect.width,
                        (e.clientY - rect.top) * this.canvas.height / rect.height);
                };

                const overEl = document.getElementById('over-bolhas');
                if (overEl) overEl.style.display = 'flex';
                this.rodando = false;
            },

            ajustarCanvasDimensoes: function() {
                if (!this.canvas || !this.canvas.parentElement) return;
                const r = this.canvas.parentElement.getBoundingClientRect();
                this.canvas.width = Math.round(r.width || window.innerWidth);
                this.canvas.height = Math.round(r.height || window.innerHeight);
            },

            iniciarModo: function(modoEscolhido = 'solo') {
                this.parar();
                this.modo = modoEscolhido;
                this.estouradasJ1 = 0;
                this.estouradasJ2 = 0;
                this.vidasJ1 = 5;
                this.vidasJ2 = 5;
                this.segundosRestantesRush = 180;
                this.bolhas = [];
                this.gotas = [];
                this.ultimoSpawn = performance.now();
                this.prazoRush = 0;
                this.proximaBomba = this.ultimoSpawn + 13500;
                this.bomba = null;
                this.onda = null;
                this.fimAvisoBonus = 0;
                tentarVibrar(35);

                const hudTempo = document.getElementById('hud-bolhas-tempo-rush');
                const hudJ1 = document.getElementById('hud-bolhas-j1');
                const hudJ2 = document.getElementById('hud-bolhas-j2');
                const lblJ1 = document.getElementById('lbl-nome-j1-bolhas');
                const lblJ2 = document.getElementById('lbl-nome-j2-bolhas');
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();

                if (document.getElementById('placar-bolhas-estouradas')) {
                    document.getElementById('placar-bolhas-estouradas').textContent = '0';
                }
                if (document.getElementById('placar-bolhas-vidas-j1')) {
                    document.getElementById('placar-bolhas-vidas-j1').textContent = '❤️ 5';
                }
                const overEl = document.getElementById('over-bolhas');
                if (overEl) overEl.style.display = 'none';

                if (this.modo === 'duelo') {
                    GerenciadorArcade.controlarBarraSuperior(false);
                    if (lblJ1) lblJ1.textContent = `${nomeJ1} (Azul):`;
                    if (lblJ2) lblJ2.textContent = "Shuiri (Rosa):";
                    if (hudJ1) hudJ1.style.display = 'flex';
                    if (hudJ2) hudJ2.style.display = 'flex';
                    if (hudTempo) hudTempo.style.display = 'none';
                    if (document.getElementById('placar-bolhas-vidas-j2')) {
                        document.getElementById('placar-bolhas-vidas-j2').textContent = '❤️ 5';
                    }
                    if (document.getElementById('placar-bolhas-estouradas-j2')) {
                        document.getElementById('placar-bolhas-estouradas-j2').textContent = '0';
                    }
                } else if (this.modo === 'rush') {
                    GerenciadorArcade.controlarBarraSuperior(false);
                    if (lblJ1) lblJ1.textContent = `${nomeJ1} (Azul):`;
                    if (lblJ2) lblJ2.textContent = "Shuiri (Rosa):";
                    if (hudJ1) hudJ1.style.display = 'flex';
                    if (hudJ2) hudJ2.style.display = 'flex';
                    if (hudTempo) hudTempo.style.display = 'flex';
                    if (document.getElementById('placar-bolhas-vidas-j1')) {
                        document.getElementById('placar-bolhas-vidas-j1').textContent = '⚡ Livre';
                    }
                    if (document.getElementById('placar-bolhas-vidas-j2')) {
                        document.getElementById('placar-bolhas-vidas-j2').textContent = '⚡ Livre';
                    }
                    if (document.getElementById('placar-bolhas-estouradas-j2')) {
                        document.getElementById('placar-bolhas-estouradas-j2').textContent = '0';
                    }
                    this.atualizarDisplayTimerRush();

                    this.prazoRush = performance.now() + this.segundosRestantesRush * 1000;
                } else {
                    GerenciadorArcade.controlarBarraSuperior(true);
                    if (lblJ1) lblJ1.textContent = "Estouradas:";
                    if (hudJ1) hudJ1.style.display = 'flex';
                    if (hudJ2) hudJ2.style.display = 'none';
                    if (hudTempo) hudTempo.style.display = 'none';
                }

                this.ajustarCanvasDimensoes();

                this.rodando = true;
                GerenciadorArcade.atualizarControlePausa(true, this);
                this.canvas.focus({ preventScroll: true });
                this.criarBolha(.34, 'j1');
                if (this.modo !== 'solo') this.criarBolha(.68, 'j2');
                this.ultimoFrame = performance.now();
                this.loop(this.ultimoFrame);
            },

            atualizarDisplayTimerRush: function() {
                const min = String(Math.floor(this.segundosRestantesRush / 60)).padStart(2, '0');
                const sec = String(this.segundosRestantesRush % 60).padStart(2, '0');
                const el = document.getElementById('placar-bolhas-tempo');
                if (el) el.textContent = `${min}:${sec}`;
            },

            parar: function() {
                this.rodando = false;
                GerenciadorArcade.atualizarControlePausa(false, this);
                if (this.anim) cancelAnimationFrame(this.anim);
                this.anim = null;
                this.mostrarBonus('');
            },

            criarBolha: function(fracaoInicial, donoInicial) {
                let dono = 'j1';
                if (this.modo === 'duelo' || this.modo === 'rush') {
                    dono = Math.random() < 0.5 ? 'j1' : 'j2';
                }

                const progresso = this.obterProgresso();
                const velBase = this.modo === 'rush' ? 1.18 + 1.45 * progresso : .86 + 1.15 * progresso;
                const variacao = .3 + .95 * progresso;
                const raio = 36 - 13 * progresso + Math.random() * 5;
                let x, y, vx, vy;

                if (this.modo === 'rush') {
                    const borda = Math.floor(Math.random() * 4);
                    if (borda === 0) {
                        x = Math.random() * (this.canvas.width - 60) + 30;
                        y = this.canvas.height + 25;
                        vx = (Math.random() - 0.5) * 1.8;
                        vy = -(velBase + Math.random() * variacao);
                    } else if (borda === 1) {
                        x = Math.random() * (this.canvas.width - 60) + 30;
                        y = -25;
                        vx = (Math.random() - 0.5) * 1.8;
                        vy = velBase + Math.random() * variacao;
                    } else if (borda === 2) {
                        x = -25;
                        y = Math.random() * (this.canvas.height - 60) + 30;
                        vx = velBase + Math.random() * variacao;
                        vy = (Math.random() - 0.5) * 1.8;
                    } else {
                        x = this.canvas.width + 25;
                        y = Math.random() * (this.canvas.height - 60) + 30;
                        vx = -(velBase + Math.random() * variacao);
                        vy = (Math.random() - 0.5) * 1.8;
                    }
                } else {
                    x = Math.random() * Math.max(0, this.canvas.width - 2 * raio) + raio;
                    y = this.canvas.height + 25;
                    vx = (Math.random() - 0.5) * 0.9;
                    vy = -(velBase + Math.random() * variacao);
                }

                if (fracaoInicial !== undefined) {
                    dono = donoInicial;
                    x = this.canvas.width * fracaoInicial;
                    y = this.canvas.height * .7;
                    vx = 0;
                    vy = -velBase;
                }
                this.bolhas.push({
                    dono: dono,
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    r: raio,
                    oscilacao: Math.random() * Math.PI * 2,
                    entrouNaTela: false
                });
            },

            obterProgresso: function() {
                if (this.modo === 'rush') return Math.min(1, Math.max(0, (166 - this.segundosRestantesRush) / 166));
                return Math.min(1, Math.max(0, (this.estouradasJ1 + this.estouradasJ2 - 5) / 56));
            },

            gerarGotas: function(bx, by, cor = '#38bdf8') {
                for (let i = 0; i < 6; i++) {
                    const ang = (Math.PI * 2 / 6) * i;
                    this.gotas.push({
                        x: bx,
                        y: by,
                        vx: Math.cos(ang) * (Math.random() * 3 + 2),
                        vy: Math.sin(ang) * (Math.random() * 3 + 2),
                        cor: cor,
                        alpha: 1
                    });
                }
            },

            mostrarBonus: function(texto) {
                const status = document.getElementById('bolhas-bonus-status');
                status.hidden = !texto;
                status.textContent = texto;
            },

            contabilizarEstouros: function(j1, j2) {
                const anterior = this.estouradasJ1 + this.estouradasJ2;
                this.estouradasJ1 += j1;
                this.estouradasJ2 += j2;
                document.getElementById('placar-bolhas-estouradas').textContent = this.estouradasJ1;
                document.getElementById('placar-bolhas-estouradas-j2').textContent = this.estouradasJ2;
                const moedas = Math.floor((anterior + j1 + j2) / 20) - Math.floor(anterior / 20);
                if (moedas) GerenciadorArcade.adicionarMoedas(moedas);
                return moedas;
            },

            estourarNaPosicao: function(x, y) {
                const bomba = this.bomba;
                if (bomba && Math.hypot(x - bomba.x, y - bomba.y) <= bomba.r + 12) {
                    const naTela = this.bolhas.filter(b => b.x + b.r >= 0 && b.x - b.r <= this.canvas.width &&
                        b.y + b.r >= 0 && b.y - b.r <= this.canvas.height);
                    const rosas = naTela.filter(b => b.dono === 'j2').length;
                    this.contabilizarEstouros(naTela.length - rosas, rosas);
                    for (const b of naTela.slice(0, 18)) {
                        this.gerarGotas(b.x, b.y, b.dono === 'j2' ? '#f6a6ca' : '#8af2f7');
                    }
                    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        this.onda = { x: bomba.x, y: bomba.y, r: bomba.r, alpha: .85 };
                    }
                    this.bolhas = [];
                    this.bomba = null;
                    this.mostrarBonus(naTela.length ? `Bomba dourada · +${naTela.length} ${naTela.length === 1 ? 'bolha' : 'bolhas'}` : 'Bomba dourada estourada');
                    this.fimAvisoBonus = performance.now() + 2100;
                    AudioMotor.tocarEfeito('bomba-bolhas');
                    tentarVibrar([24, 26, 18]);
                    return;
                }
                for (let i = this.bolhas.length - 1; i >= 0; i--) {
                    const b = this.bolhas[i];
                    if (Math.hypot(x - b.x, y - b.y) > b.r + 13) continue;
                    const rosa = b.dono === 'j2';
                    this.gerarGotas(b.x, b.y, rosa ? '#f6a6ca' : '#8af2f7');
                    this.bolhas.splice(i, 1);
                    AudioMotor.tocarEfeito('bolha', rosa ? 4 : Math.random() * 3);
                    tentarVibrar(20);
                    if (this.contabilizarEstouros(rosa ? 0 : 1, rosa ? 1 : 0)) AudioMotor.tocarTom(880, 0.18);
                    return;
                }
            },

            atualizarBomba: function(agora) {
                if (this.fimAvisoBonus && agora >= this.fimAvisoBonus) {
                    this.fimAvisoBonus = 0;
                    this.mostrarBonus('');
                }
                if (this.bomba) {
                    this.bomba.y += 2.8;
                    if (this.bomba.y > this.canvas.height + this.bomba.r) {
                        this.bomba = null;
                        this.mostrarBonus('');
                    }
                } else if (agora >= this.proximaBomba) {
                    this.bomba = { x: this.canvas.width * (.2 + Math.random() * .6), y: -30, r: 26 };
                    this.proximaBomba = agora + 16500 + Math.random() * 5500;
                    this.mostrarBonus('Toque na bomba dourada para estourar todas!');
                }
                if (this.onda) {
                    this.onda.r += 23;
                    this.onda.alpha -= .05;
                    if (this.onda.alpha <= 0) this.onda = null;
                }
            },

            loop: function(timestamp) {
                if (!MotorBolhas.rodando) return;
                MotorBolhas.anim = requestAnimationFrame((ts) => MotorBolhas.loop(ts));
                
                if (!timestamp) timestamp = performance.now();
                const delta = timestamp - MotorBolhas.ultimoFrame;
                if (delta > MotorBolhas.fpsIntervalo) {
                    MotorBolhas.ultimoFrame = timestamp - (delta % MotorBolhas.fpsIntervalo);
                    MotorBolhas.atualizar();
                    MotorBolhas.desenhar();
                }
            },

            atualizar: function() {
                const agora = performance.now();
                if (this.modo === 'rush') {
                    const segundos = Math.max(0, Math.ceil((this.prazoRush - agora) / 1000));
                    if (segundos !== this.segundosRestantesRush) {
                        this.segundosRestantesRush = segundos;
                        this.atualizarDisplayTimerRush();
                    }
                    if (!segundos) return this.fim();
                }
                const progresso = this.obterProgresso();
                const intervalo = this.modo === 'rush' ? 1100 - progresso * 805 :
                    (this.modo === 'duelo' ? 1330 : 1470) - progresso * 820;
                this.atualizarBomba(agora);

                if (agora - this.ultimoSpawn > intervalo) {
                    this.ultimoSpawn = agora;
                    this.criarBolha();
                    if (this.modo === 'rush' && progresso >= .72 && Math.random() < .22) {
                        this.criarBolha();
                    }
                }

                for (let i = this.gotas.length - 1; i >= 0; i--) {
                    const g = this.gotas[i];
                    g.x += g.vx;
                    g.y += g.vy;
                    g.alpha -= 0.05;
                    if (g.alpha <= 0) this.gotas.splice(i, 1);
                }

                for (let i = this.bolhas.length - 1; i >= 0; i--) {
                    const b = this.bolhas[i];
                    b.x += b.vx;
                    b.y += b.vy;
                    b.oscilacao += 0.04;
                    b.x += Math.sin(b.oscilacao) * 0.45;

                    if (!b.entrouNaTela) {
                        if (b.x >= 0 && b.x <= this.canvas.width && b.y >= 0 && b.y <= this.canvas.height) {
                            b.entrouNaTela = true;
                        }
                    }

                    const foraTela = b.entrouNaTela && (b.x < -60 || b.x > this.canvas.width + 60 || b.y < -60 || b.y > this.canvas.height + 60);

                    if (foraTela) {
                        this.bolhas.splice(i, 1);

                        if (this.modo !== 'rush') {
                            AudioMotor.tocarEfeito('impacto');
                            tentarVibrar(40);

                            if (b.dono === 'j2') {
                                this.vidasJ2--;
                                const elV2 = document.getElementById('placar-bolhas-vidas-j2');
                                if (elV2) elV2.textContent = `❤️ ${this.vidasJ2}`;
                            } else {
                                this.vidasJ1--;
                                const elV1 = document.getElementById('placar-bolhas-vidas-j1');
                                if (elV1) elV1.textContent = `❤️ ${this.vidasJ1}`;
                            }

                            if (this.vidasJ1 <= 0 || (this.modo === 'duelo' && this.vidasJ2 <= 0)) {
                                return this.fim();
                            }
                        }
                    }
                }
            },

            desenhar: function() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.gotas.forEach(g => {
                    ctx.fillStyle = g.cor;
                    ctx.globalAlpha = g.alpha;
                    ctx.beginPath();
                    ctx.arc(g.x, g.y, 2.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                });

                this.bolhas.forEach(b => {
                    ctx.save();
                    const rival = b.dono === 'j2';
                    const brilho = ctx.createRadialGradient(
                        b.x - b.r * .34, b.y - b.r * .36, 0, b.x, b.y, b.r
                    );
                    brilho.addColorStop(0, '#ffffffda');
                    brilho.addColorStop(.42, rival ? '#f19db188' : '#a4eced77');
                    brilho.addColorStop(.72, rival ? '#db5a9d66' : '#74aaff55');
                    brilho.addColorStop(1, rival ? '#ffc4deae' : '#baffffe0');
                    ctx.fillStyle = brilho;
                    ctx.strokeStyle = rival ? '#ffc0d3' : '#cdfaff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    if (rival) {
                        ctx.moveTo(b.x, b.y - b.r);
                        ctx.lineTo(b.x + b.r * .85, b.y);
                        ctx.lineTo(b.x, b.y + b.r);
                        ctx.lineTo(b.x - b.r * .85, b.y);
                        ctx.closePath();
                    } else {
                        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    }
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#fff9';
                    ctx.beginPath();
                    ctx.ellipse(b.x - b.r * .29, b.y - b.r * .34, b.r * .22, b.r * .10, -.6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
                if (this.onda) {
                    ctx.save();
                    ctx.globalAlpha = this.onda.alpha;
                    ctx.strokeStyle = '#ffe5a0';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(this.onda.x, this.onda.y, this.onda.r, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                if (this.bomba) this.desenharBomba();
            },

            desenharBomba: function() {
                const ctx = this.ctx;
                const {x, y, r} = this.bomba;
                ctx.save();
                ctx.translate(x, y);
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#ffdd96';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(8, -18);
                ctx.quadraticCurveTo(10, -32, 20, -33);
                ctx.stroke();
                ctx.strokeStyle = '#fff5c6';
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                    const angulo = i * Math.PI / 3;
                    ctx.beginPath();
                    ctx.moveTo(22 + Math.cos(angulo) * 4, -34 + Math.sin(angulo) * 4);
                    ctx.lineTo(22 + Math.cos(angulo) * 8, -34 + Math.sin(angulo) * 8);
                    ctx.stroke();
                }
                const dourado = ctx.createRadialGradient(-9, -10, 2, 0, 1, r);
                dourado.addColorStop(0, '#fffce1');
                dourado.addColorStop(.5, '#ffcc72');
                dourado.addColorStop(1, '#ad581e');
                ctx.fillStyle = dourado;
                ctx.strokeStyle = '#ffeabb';
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#86421d';
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const angulo = i * Math.PI / 5 - Math.PI / 2;
                    const raio = i % 2 === 0 ? 14 : 6;
                    ctx.lineTo(Math.cos(angulo) * raio, Math.sin(angulo) * raio);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },

            fim: function() {
                const modos = {solo:'Sobrevivência', duelo:'Duelo', rush:'Rush'};
                const bolhas = this.estouradasJ1 + (this.modo === 'rush' ? this.estouradasJ2 : 0);
                window.RecordesArcade?.registrar('bolhas', modos[this.modo], bolhas, `${bolhas} bolhas`);
                this.parar();
                tentarVibrar([60, 50, 60]);
                GerenciadorArcade.controlarBarraSuperior(true);
                const ov = document.getElementById('over-bolhas');
                if (!ov) return;
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();

                if (this.modo === 'rush') {
                    const totalGeral = this.estouradasJ1 + this.estouradasJ2;
                    const moedas = Math.floor(totalGeral / 15);
                    GerenciadorArcade.adicionarMoedas(moedas);

                    let vencedorRush = "Empate Fantástico!";
                    if (this.estouradasJ1 > this.estouradasJ2) vencedorRush = `🏆 ${nomeJ1} (Azul) Venceu!`;
                    else if (this.estouradasJ2 > this.estouradasJ1) vencedorRush = "🏆 Shuiri (Rosa) Venceu!";

                    ov.innerHTML = `
                        <div class="painel-dialogo-arcade">
                            <h2 style="color:#f59e0b;">Tempo Esgotado!</h2>
                            <p style="font-weight:900; color:#0284c7; margin-bottom:6px;">${vencedorRush}</p>
                            <p>${nomeJ1} (Azul): <strong>${this.estouradasJ1}</strong> bolhas<br>
                            Shuiri (Rosa): <strong>${this.estouradasJ2}</strong> bolhas<br>
                            <span style="color:#b45309; font-weight:900; font-size:14px; margin-top:4px; display:inline-block;">+${moedas} Moedas conquistadas! 🪙</span></p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn-acao-jogo" onclick="MotorBolhas.iniciarModo('rush')">Jogar Outro Rush (3 Min)</button>
                                <button class="btn-acao-jogo" style="background:#0284c7; border-bottom-color:#0369a1;" onclick="MotorBolhas.iniciarModo('solo')">Modo Sobrevivência (1P)</button>
                            </div>
                            <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                        </div>
                    `;
                } else if (this.modo === 'duelo') {
                    let resultado = "Empate emocionante!";
                    let corRes = "#f59e0b";
                    if (this.vidasJ1 <= 0 && this.vidasJ2 > 0) {
                        resultado = "🏆 Shuiri (Rosa) Venceu!";
                        corRes = "#f43f5e";
                    } else if (this.vidasJ2 <= 0 && this.vidasJ1 > 0) {
                        resultado = `🏆 ${nomeJ1} (Azul) Venceu!`;
                        corRes = "#0284c7";
                    } else if (this.estouradasJ1 > this.estouradasJ2) {
                        resultado = `🏆 ${nomeJ1} Venceu por Pontos!`;
                        corRes = "#0284c7";
                    } else if (this.estouradasJ2 > this.estouradasJ1) {
                        resultado = "🏆 Shuiri Venceu por Pontos!";
                        corRes = "#f43f5e";
                    }

                    ov.innerHTML = `
                        <div class="painel-dialogo-arcade">
                            <h2 style="color:${corRes};">${resultado}</h2>
                            <p style="margin:10px 0 14px 0;">
                                ${nomeJ1} (Azul): <strong>${this.estouradasJ1}</strong> bolhas (${this.vidasJ1} vidas)<br>
                                Shuiri (Rosa): <strong>${this.estouradasJ2}</strong> bolhas (${this.vidasJ2} vidas)
                            </p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn-acao-jogo" onclick="MotorBolhas.iniciarModo('duelo')">Jogar Novamente (Duelo)</button>
                                <button class="btn-acao-jogo" style="background:#0284c7; border-bottom-color:#0369a1;" onclick="MotorBolhas.iniciarModo('solo')">Modo Solo (1 Jogador)</button>
                            </div>
                            <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                        </div>
                    `;
                } else {
                    const moedas = Math.floor(this.estouradasJ1 / 20);
                    ov.innerHTML = `
                        <div class="painel-dialogo-arcade">
                            <h2 style="color:#ef4444;">Fim de Partida!</h2>
                            <p>5 bolhas escaparam!<br>
                            Bolhas estouradas: <strong>${this.estouradasJ1}</strong><br>
                            <span style="color:#b45309; font-weight:900; font-size:14px; margin-top:4px; display:inline-block;">+${moedas} Moedas faturadas!</span></p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn-acao-jogo" onclick="MotorBolhas.iniciarModo('solo')">Jogar Novamente</button>
                                <button class="btn-acao-jogo" style="background:linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-bottom-color:#9d174d;" onclick="MotorBolhas.iniciarModo('duelo')">👥 Jogar Duelo (2P)</button>
                                <button class="btn-acao-jogo" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-bottom-color:#b45309;" onclick="MotorBolhas.iniciarModo('rush')">⚡ Modo Rush (3 Minutos)</button>
                            </div>
                            <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                        </div>
                    `;
                }
                ov.style.display = 'flex';
            }
        };

        // =========================================================================
        // 5. JOGO DA VELHA TRADICIONAL & MULTIJOGADOR
        // =========================================================================
        const MotorVelha = {
            modo: 'ia',
            dificuldade: 'treino',
            proximoInicio: { ia: 'X', '2p': 'X' },
            tabuleiro: Array(9).fill(''),
            turno: 'X',
            fim: false,

            trocarModo: function(novoModo) {
                this.modo = novoModo;
                const tabIA = document.getElementById('tab-velha-ia');
                const tab2P = document.getElementById('tab-velha-2p');
                document.getElementById('velha-nivel').hidden = novoModo !== 'ia';
                if (novoModo === 'ia') {
                    tabIA.classList.add('ativo');
                    tab2P.classList.remove('ativo');
                } else {
                    tab2P.classList.add('ativo');
                    tabIA.classList.remove('ativo');
                }
                this.iniciar();
            },

            obterSvgX: function() {
                return `
                    <svg viewBox="0 0 50 50" style="width:52px; height:52px;">
                        <line x1="10" y1="10" x2="40" y2="40" class="traco-x" />
                        <line x1="40" y1="10" x2="10" y2="40" class="traco-x" />
                    </svg>
                `;
            },

            obterSvgO: function() {
                return `
                    <svg viewBox="0 0 50 50" style="width:50px; height:50px;">
                        <circle cx="25" cy="25" r="18" class="traco-o" />
                    </svg>
                `;
            },

            linhasVitoria: [
                { linha: [0,1,2], tipo: 'h', idx: 0 },
                { linha: [3,4,5], tipo: 'h', idx: 1 },
                { linha: [6,7,8], tipo: 'h', idx: 2 },
                { linha: [0,3,6], tipo: 'v', idx: 0 },
                { linha: [1,4,7], tipo: 'v', idx: 1 },
                { linha: [2,5,8], tipo: 'v', idx: 2 },
                { linha: [0,4,8], tipo: 'd', idx: 1 },
                { linha: [2,4,6], tipo: 'd', idx: 2 }
            ],

            parar: function() {
                clearTimeout(this.timerChuiri);
            },

            iniciar: function() {
                this.parar();
                this.tabuleiro = Array(9).fill('');
                this.turno = this.proximoInicio[this.modo];
                this.proximoInicio[this.modo] = this.turno === 'X' ? 'O' : 'X';
                this.fim = false;
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();
                
                const statusEl = document.getElementById('status-velha');
                if (this.modo === '2p') {
                    statusEl.textContent = this.turno === 'X' ? `${nomeJ1} começa (X)` : 'Jogador 2 começa (O)';
                } else {
                    statusEl.textContent = this.turno === 'X' ? 'Você começa com X' : 'Chuíri começa com O';
                }
                
                const linhaVitoria = document.getElementById('linha-vitoria-caneta');
                linhaVitoria?.classList.remove('tracado');

                const g = document.getElementById('grade-velha-invisivel');
                g.innerHTML = '';
                for (let i = 0; i < 9; i++) {
                    const c = document.createElement('button');
                    c.type = 'button';
                    c.setAttribute('aria-label', `Casa ${i + 1}, vazia`);
                    c.className = 'casa-velha-livre';
                    c.id = `velha-casa-${i}`;
                    c.onclick = () => this.jogada(i);
                    g.appendChild(c);
                }
                if (this.modo === 'ia' && this.turno === 'O') {
                    this.timerChuiri = setTimeout(() => this.jogadaChuiri(), 420);
                }
                this.atualizarDica();
            },

            jogada: function(i) {
                if (this.fim || this.tabuleiro[i] !== '') return;
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();

                if (this.modo === '2p') {
                    const jogAtual = this.turno;
                    this.marcar(i, jogAtual);
                    AudioMotor.tocarSomCaneta(0.12);
                    tentarVibrar(25);

                    const vitoriaInfo = this.checarVitoria(jogAtual);
                    if (vitoriaInfo) return this.vitoria(jogAtual, vitoriaInfo);
                    if (this.tabuleiro.every(x => x !== '')) return this.empate();

                    this.turno = this.turno === 'X' ? 'O' : 'X';
                    const vezNome = this.turno === 'X' ? `${nomeJ1} (X)` : 'Jogador 2 (O)';
                    document.getElementById('status-velha').textContent = `Vez de ${vezNome}`;
                } else {
                    if (this.turno !== 'X') return;
                    this.marcar(i, 'X');
                    AudioMotor.tocarSomCaneta(0.12);
                    tentarVibrar(25);

                    const vitoriaInfo = this.checarVitoria('X');
                    if (vitoriaInfo) return this.vitoria('X', vitoriaInfo);
                    if (this.tabuleiro.every(x => x !== '')) return this.empate();

                    this.turno = 'O';
                    this.atualizarDica();
                    document.getElementById('status-velha').textContent = 'Chuíri a riscar...';
                    this.timerChuiri = setTimeout(() => this.jogadaChuiri(), 420);
                }
            },

            jogadaChuiri: function() {
                if (this.fim || this.modo !== 'ia') return;
                const escolhida = this.escolherJogada();
                if (escolhida !== undefined) {
                    this.marcar(escolhida, 'O');
                    AudioMotor.tocarSomCaneta(0.18);
                    tentarVibrar(25);
                }

                const vitoriaInfo = this.checarVitoria('O');
                if (vitoriaInfo) return this.vitoria('O', vitoriaInfo);
                if (this.tabuleiro.every(x => x !== '')) return this.empate();
                this.turno = 'X';
                this.atualizarDica();
                document.getElementById('status-velha').textContent = 'Sua vez: Você joga com X (Caneta Azul)';
            },

            casaQueFechaTrinca: function(p) {
                for (const {linha} of this.linhasVitoria) {
                    if (linha.filter(i => this.tabuleiro[i] === p).length !== 2) continue;
                    const casa = linha.find(i => !this.tabuleiro[i]);
                    if (casa !== undefined) return casa;
                }
            },

            escolherJogada: function() {
                const vazias = [4, 0, 2, 6, 8, 1, 3, 5, 7].filter(i => !this.tabuleiro[i]);
                if (this.dificuldade === 'desafio') return this.melhorJogada(vazias);
                const vitoria = this.casaQueFechaTrinca('O');
                if (vitoria !== undefined) return vitoria;
                if (this.dificuldade === 'intermediario') return this.casaQueFechaTrinca('X') ?? vazias[0];
                return vazias[Math.floor(Math.random() * vazias.length)];
            },

            melhorJogada: function(vazias) {
                const tabuleiro = this.tabuleiro.slice();
                const cache = new Map();
                const venceu = p => this.linhasVitoria.some(({linha}) => linha.every(i => tabuleiro[i] === p));
                const avaliar = (vez, livres) => {
                    if (venceu('O')) return livres.length + 1;
                    if (venceu('X')) return -(livres.length + 1);
                    if (!livres.length) return 0;
                    const chave = vez + tabuleiro.map(casa => casa || '-').join('');
                    if (cache.has(chave)) return cache.get(chave);
                    const pontuacoes = livres.map(i => {
                        tabuleiro[i] = vez;
                        const valor = avaliar(vez === 'O' ? 'X' : 'O', livres.filter(casa => casa !== i));
                        tabuleiro[i] = '';
                        return valor;
                    });
                    const melhor = vez === 'O' ? Math.max(...pontuacoes) : Math.min(...pontuacoes);
                    cache.set(chave, melhor);
                    return melhor;
                };
                let melhor;
                let maior = -Infinity;
                for (const i of vazias) {
                    tabuleiro[i] = 'O';
                    const valor = avaliar('X', vazias.filter(casa => casa !== i));
                    tabuleiro[i] = '';
                    if (valor <= maior) continue;
                    melhor = i;
                    maior = valor;
                }
                return melhor;
            },

            atualizarDica: function() {
                const dica = document.getElementById('velha-dica');
                document.querySelector('.casa-velha-dica')?.classList.remove('casa-velha-dica');
                dica.hidden = this.fim || this.modo !== 'ia' || this.dificuldade !== 'treino';
                if (dica.hidden) return;
                dica.textContent = 'Junte três marcas em linha, coluna ou diagonal.';
                if (this.turno !== 'X') return;
                const vitoria = this.casaQueFechaTrinca('X');
                const casa = vitoria ?? this.casaQueFechaTrinca('O');
                if (casa === undefined) return;
                document.getElementById(`velha-casa-${casa}`)?.classList.add('casa-velha-dica');
                dica.textContent = vitoria !== undefined ? 'Toque na casa destacada para fechar a trinca.' :
                    'Toque na casa destacada para bloquear a trinca do Chuíri.';
            },

            marcar: function(i, p) {
                this.tabuleiro[i] = p;
                const el = document.getElementById(`velha-casa-${i}`);
                if (el) {
                    el.innerHTML = p === 'X' ? this.obterSvgX() : this.obterSvgO();
                    el.setAttribute('aria-label', `Casa ${i + 1}, ${p}`);
                    el.setAttribute('aria-disabled', 'true');
                }
            },

            checarVitoria: function(p) {
                return this.linhasVitoria.find(item => item.linha.every(idx => this.tabuleiro[idx] === p)) || null;
            },

            riscarLinhaVitoria: function(vInfo) {
                const linha = document.getElementById('linha-vitoria-caneta');
                if (!linha) return;

                AudioMotor.tocarSomCaneta(0.35);
                const [inicio, , final] = vInfo.linha;
                const dx = final % 3 - inicio % 3;
                const dy = Math.floor(final / 3) - Math.floor(inicio / 3);
                const coluna = inicio % 3;
                const fila = Math.floor(inicio / 3);
                linha.style.left = `${(coluna + .5) * 100 / 3}%`;
                linha.style.top = `calc(${(fila + .5) * 100 / 3}% - 2px)`;
                linha.style.width = `${Math.hypot(dx, dy) * 100 / 3}%`;
                linha.style.setProperty('--linha-angulo', `${Math.atan2(dy, dx)}rad`);
                linha.classList.add('tracado');
                vInfo.linha.forEach(indice => document.getElementById(`velha-casa-${indice}`)?.classList.add('trinca'));
            },

            vitoria: function(p, vInfo) {
                if (p === 'X' || this.modo === '2p') {
                    const jogadas = this.tabuleiro.filter(Boolean).length;
                    const niveis = { treino: 'Treino', intermediario: 'Intermediário', desafio: 'Desafio' };
                    const modalidade = this.modo === '2p' ? 'Dois jogadores' : `Contra Chuíri · ${niveis[this.dificuldade]}`;
                    window.RecordesArcade?.registrar('velha', modalidade,
                        -jogadas, `Vitória em ${jogadas} jogadas`, `Trinca com ${p}`);
                }
                this.fim = true;
                this.atualizarDica();
                this.riscarLinhaVitoria(vInfo);
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();

                if (this.modo === '2p') {
                    const vencedor = p === 'X' ? `${nomeJ1} (Azul)` : 'Shuiri (Vermelho)';
                    document.getElementById('status-velha').innerHTML = `<strong style="color:${p === 'X' ? '#10b981' : '#ef4444'};">🎉 ${esc(vencedor)} fechou a trinca!</strong>`;
                    GerenciadorArcade.adicionarMoedas(1);
                    AudioMotor.tocarTom(880, 0.25);
                } else {
                    if (p === 'X') {
                        document.getElementById('status-velha').innerHTML = '<strong style="color:#10b981;">Trinca de caneta perfeita! +1 Moeda!</strong>';
                        GerenciadorArcade.adicionarMoedas(1);
                        AudioMotor.tocarTom(880, 0.25);
                    } else {
                        document.getElementById('status-velha').innerHTML = '<strong style="color:#ef4444;">O Chuíri fechou a trinca desta vez!</strong>';
                    }
                }
            },

            empate: function() {
                this.fim = true;
                this.atualizarDica();
                document.getElementById('status-velha').innerHTML = '<strong>Deu velha! Ninguém riscou a trinca.</strong>';
            }
        };

        // =========================================================================
        // 6. JOGO DA MEMÓRIA 3D (SOLO E 2 JOGADORES POR TURNOS ALTERNADOS)
        // =========================================================================
        const MotorMemoria = {
            modo: 'solo',
            totalPares: 4,
            jogadas: 0,
            cartas: [],
            viradas: [],
            pares: 0,
            paresJ1: 0,
            paresJ2: 0,
            turno: 1,
            bloqueado: false,

            simbolos: [
                { id: 'foguete', nome: 'Foguete', cor: '#9ad3ff' },
                { id: 'gato', nome: 'Gato', cor: '#ffd0a1' },
                { id: 'borboleta', nome: 'Borboleta', cor: '#ffb9de' },
                { id: 'sorvete', nome: 'Sorvete', cor: '#ffedad' },
                { id: 'dino', nome: 'Dinossauro', cor: '#b8e7c1' },
                { id: 'castelo', nome: 'Castelo', cor: '#e1c5fa' },
                { id: 'baleia', nome: 'Baleia', cor: '#b2eee9' },
                { id: 'robo', nome: 'Robô', cor: '#dfdfed' }
            ],
            figurasGeradas: new Map(),

            catalogo: function() {
                const cores = ['#f2ccaa', '#c5d7ff', '#f0c5e1', '#c5edca', '#f8e2ab', '#ddcefa', '#bcebe4'];
                const usados = new Set(this.simbolos.map(item => item.id));
                const outros = SuiriDesenhosArte.niveis.facil.filter(([id]) => !usados.has(id));
                const extras = SuiriDesenhosArte.niveis.medio.slice(0, 12);
                return [
                    ...this.simbolos,
                    ...outros.map(([id, nome], i) => ({id, nome, cor: cores[i % cores.length]})),
                    ...extras.map(([id, nome], i) => ({id, nome, nivel: 'medio', cor: cores[(i + 2) % cores.length]}))
                ];
            },

            figura: function(carta) {
                if (!carta.nivel) return `assets/images/arte/${carta.id}.svg`;
                if (!this.figurasGeradas.has(carta.id)) {
                    this.figurasGeradas.set(carta.id, SuiriDesenhosArte.renderizar(carta.nivel, carta.id, 132).toDataURL());
                }
                return this.figurasGeradas.get(carta.id);
            },

            trocarNivel: function(pares) {
                if (![4, 6, 8, 12, 16, 24, 32].includes(pares)) return;
                this.totalPares = pares;
                for (const botao of document.querySelectorAll('[data-memoria-pares]')) {
                    const ativo = Number(botao.dataset.memoriaPares) === pares;
                    botao.classList.toggle('ativo', ativo);
                    botao.setAttribute('aria-pressed', String(ativo));
                }
                this.iniciar();
            },

            parar: function() {
                clearTimeout(this.timerCartas);
                this.fecharModal();
            },

            trocarModo: function(novoModo) {
                this.modo = novoModo;
                this.iniciar();
                document.getElementById('tab-memoria-solo').classList.toggle('ativo', novoModo === 'solo');
                document.getElementById('tab-memoria-2p').classList.toggle('ativo', novoModo === '2p');

                if (novoModo === '2p') {
                    GerenciadorArcade.controlarBarraSuperior(false);
                    GerenciadorArcade.atualizarNomesJogadores();
                    document.getElementById('status-memoria-solo').style.display = 'none';
                    document.getElementById('status-memoria-2p').style.display = 'flex';
                } else {
                    GerenciadorArcade.controlarBarraSuperior(true);
                    document.getElementById('status-memoria-solo').style.display = 'block';
                    document.getElementById('status-memoria-2p').style.display = 'none';
                }
            },

            atualizarPlacar: function() {
                if (this.modo === '2p') {
                    const nomeJ1 = GerenciadorArcade.obterNomeUsuario();
                    const elJ1 = document.getElementById('memoria-placar-j1');
                    const elJ2 = document.getElementById('memoria-placar-j2');
                    const elTurno = document.getElementById('memoria-turno-vez');

                    if (elJ1) elJ1.textContent = `${nomeJ1} (Azul): ${this.paresJ1}`;
                    if (elJ2) elJ2.innerHTML = `Shuiri (Vermelho): <strong>${this.paresJ2}</strong>`;

                    if (elTurno) {
                        if (this.turno === 1) {
                            elTurno.textContent = `Vez de ${nomeJ1} (Azul)`;
                            elTurno.style.background = "#e0f2fe";
                            elTurno.style.color = "#0284c7";
                            elTurno.style.borderColor = "#38bdf8";
                        } else {
                            elTurno.textContent = "Vez de Shuiri (Vermelho)";
                            elTurno.style.background = "#fee2e2";
                            elTurno.style.color = "#dc2626";
                            elTurno.style.borderColor = "#f87171";
                        }
                    }
                } else {
                    const elSolo = document.getElementById('status-memoria-solo');
                    if (elSolo) elSolo.textContent = `${this.pares}/${this.totalPares} pares · ${this.jogadas} jogadas`;
                }
            },

            iniciar: function() {
                const grade = document.getElementById('grade-memoria-arcade');
                if (!grade) return;
                this.parar();
                grade.replaceChildren();
                this.jogadas = 0;
                this.viradas = [];
                this.pares = 0;
                this.paresJ1 = 0;
                this.paresJ2 = 0;
                this.turno = 1;
                this.bloqueado = false;
                this.usouDica = false;
                const dica = document.getElementById('memoria-espiar');
                dica.hidden = this.modo !== 'solo' || this.totalPares > 8;
                dica.disabled = false;
                this.atualizarPlacar();

                grade.dataset.pares = this.totalPares;
                const simbolos = this.catalogo().slice(0, this.totalPares);
                const baralho = [...simbolos, ...simbolos];
                for (let i = baralho.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
                }
                this.cartas = baralho;

                baralho.forEach((_, idx) => {
                    const c = document.createElement('button');
                    c.type = 'button';
                    this.ocultarCarta(c, idx);
                    c.className = 'carta-arcade';
                    c.id = `carta-memoria-${idx}`;
                    c.onclick = () => this.virar(idx);
                    grade.appendChild(c);
                });
            },

            ocultarCarta: function(carta, idx) {
                carta.textContent = '?';
                carta.setAttribute('aria-label', `Carta ${idx + 1}, virada para baixo`);
                carta.classList.remove('revelada');
                carta.removeAttribute('data-v');
            },

            revelarCarta: function(el, idx) {
                const c = this.cartas[idx];
                const figura = document.createElement('img');
                figura.src = this.figura(c);
                figura.alt = '';
                figura.className = 'memoria-figura';
                el.style.setProperty('--memoria-figura-fundo', c.cor);
                el.replaceChildren(figura);
                el.setAttribute('aria-label', `Carta ${idx + 1}, ${c.nome}`);
                el.classList.add('revelada');
            },

            espiar: function() {
                const dica = document.getElementById('memoria-espiar');
                if (dica.hidden || dica.disabled || this.bloqueado) return;
                dica.disabled = true;
                this.usouDica = true;
                this.bloqueado = true;
                const cartas = [...document.getElementById('grade-memoria-arcade').children];
                cartas.forEach((carta, idx) => this.revelarCarta(carta, idx));
                this.timerCartas = setTimeout(() => {
                    cartas.forEach((carta, idx) => this.ocultarCarta(carta, idx));
                    this.bloqueado = false;
                }, 2000);
            },

            virar: function(idx) {
                if (this.bloqueado || this.viradas.length >= 2) return;
                const el = document.getElementById(`carta-memoria-${idx}`);
                if (!el || el.getAttribute('data-v') === '1') return;
                document.getElementById('memoria-espiar').disabled = true;
                const c = this.cartas[idx];
                this.revelarCarta(el, idx);
                el.setAttribute('data-v', '1');
                AudioMotor.tocarEfeito('carta');
                this.viradas.push({ idx, id: c.id });

                if (this.viradas.length === 2) {
                    this.jogadas++;
                    const [c1, c2] = this.viradas;
                    if (c1.id === c2.id) {
                        AudioMotor.tocarEfeito('par');
                        tentarVibrar(30);

                        if (this.modo === 'solo') this.pares++;
                        else if (this.turno === 1) this.paresJ1++;
                        else this.paresJ2++;
                        this.atualizarPlacar();
                        for (const carta of [c1, c2]) {
                            const botao = document.getElementById(`carta-memoria-${carta.idx}`);
                            botao.classList.add('pareada');
                            botao.setAttribute('aria-disabled', 'true');
                        }
                        if (this.pares + this.paresJ1 + this.paresJ2 === this.totalPares) {
                            const premio = this.totalPares === 4 ? 10 :
                                this.totalPares === 6 ? (this.modo === '2p' ? 16 : 28) :
                                    (this.modo === '2p' ? 25 : 50);
                            GerenciadorArcade.adicionarMoedas(premio);
                            this.timerCartas = setTimeout(() => this.fimDeJogo(premio), 450);
                        }
                        this.viradas = [];
                    } else {
                        this.bloqueado = true;
                        this.atualizarPlacar();
                        this.timerCartas = setTimeout(() => {
                            for (const carta of [c1, c2]) {
                                this.ocultarCarta(document.getElementById(`carta-memoria-${carta.idx}`), carta.idx);
                            }
                            if (this.modo === '2p') {
                                this.turno = this.turno === 1 ? 2 : 1;
                                this.atualizarPlacar();
                            }
                            this.viradas = [];
                            this.bloqueado = false;
                        }, {4: 1280, 6: 1150, 8: 1030, 12: 970, 16: 910, 24: 870, 32: 830}[this.totalPares]);
                    }
                }
            },

            fimDeJogo: function(premio) {
                const modalidade = `${this.totalPares} pares · ${this.modo === '2p' ? 'Dupla' : 'Solo'}${this.usouDica ? ' · Com dica' : ''}`;
                if (this.modo === '2p') {
                    window.RecordesArcade?.registrar('memoria', modalidade, this.paresJ1,
                        `${this.paresJ1} pares`, `${this.jogadas} jogadas na partida`);
                } else {
                    window.RecordesArcade?.registrar('memoria', modalidade, -this.jogadas, `${this.jogadas} jogadas`);
                }
                const ov = document.getElementById('over-memoria');
                const cont = document.getElementById('dialogo-memoria-conteudo');
                if (!ov || !cont || GerenciadorArcade.telaAtiva !== 'memoria') return;
                const nomeJ1 = esc(GerenciadorArcade.obterNomeUsuario());

                if (this.modo === '2p') {
                    let resultado = "Empate Perfeito!";
                    let cor = "#f59e0b";
                    if (this.paresJ1 > this.paresJ2) {
                        resultado = `🏆 ${nomeJ1} (Azul) Venceu!`;
                        cor = "#0284c7";
                    } else if (this.paresJ2 > this.paresJ1) {
                        resultado = "🏆 Shuiri (Vermelho) Venceu!";
                        cor = "#dc2626";
                    }
                    cont.innerHTML = `
                        <h2 style="color:${cor};">${resultado}</h2>
                        <p style="margin:10px 0 14px 0; font-size:13.5px; color:#334155; line-height:1.45;">
                            Placar de Pares:<br>
                            ${nomeJ1} (Azul): <strong>${this.paresJ1}</strong> pares<br>
                            Shuiri (Vermelho): <strong>${this.paresJ2}</strong> pares<br>
                            <span style="color:#b45309; font-weight:900; font-size:13px; margin-top:4px; display:inline-block;">+${premio} moedas conquistadas! 🪙</span>
                        </p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn-acao-jogo" onclick="MotorMemoria.iniciar()">Jogar Outra Partida (2P)</button>
                            <button class="btn-acao-jogo" style="background:#0284c7; border-bottom-color:#0369a1;" onclick="MotorMemoria.trocarModo('solo')">Modo Solo (1 Jogador)</button>
                        </div>
                        <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                    `;
                } else {
                    cont.innerHTML = `
                        <h2 style="color:#10b981;">🎉 Parabéns!</h2>
                        <p style="margin:10px 0 14px 0; font-size:13.5px; color:#334155; line-height:1.45;">
                            Você encontrou ${this.totalPares} pares em ${this.jogadas} jogadas!<br>
                            <span style="color:#b45309; font-weight:900; font-size:14px; margin-top:4px; display:inline-block;">+${premio} moedas conquistadas! 🪙</span>
                        </p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn-acao-jogo" onclick="MotorMemoria.iniciar()">Jogar Novamente</button>
                            <button class="btn-acao-jogo" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-bottom-color:#075985;" onclick="MotorMemoria.trocarModo('2p')">👥 Duelo (2 Jogadores)</button>
                        </div>
                        <button class="btn-link-voltar" onclick="GerenciadorArcade.voltarAcao()">Voltar ao Menu</button>
                    `;
                }
                ov.style.display = 'flex';
                cont.querySelector('button')?.focus();
            },

            fecharModal: function() {
                const ov = document.getElementById('over-memoria');
                if (ov) ov.style.display = 'none';
            }
        };

        // =========================================================================
        // INICIALIZAÇÃO DO ESTADO GERAL DO ARCADE
        // =========================================================================
        window.addEventListener('DOMContentLoaded', () => {
            GerenciadorArcade.atualizarSaldoVisual();
            GerenciadorArcade.atualizarNomesJogadores();
            GerenciadorArcade.atualizarControleTrilha();
            const dialogo = document.getElementById('arcade-pausa');
            dialogo?.addEventListener('cancel', evento => {
                evento.preventDefault();
                GerenciadorArcade.continuar();
            });
            for (const alca of document.querySelectorAll('dialog [data-arcade-fechar-gesto]')) {
                const janela = alca.closest('dialog');
                const fechar = janela === dialogo ? () => GerenciadorArcade.continuar() : () => janela.close();
                let toque = null;
                let ignorarCliqueAte = 0;
                alca.addEventListener('click', () => {
                    if (performance.now() > ignorarCliqueAte) fechar();
                });
                alca.addEventListener('pointerdown', e => {
                    if (e.button !== 0) return;
                    ignorarCliqueAte = 0;
                    toque = { id: e.pointerId, x: e.clientX, y: e.clientY };
                    alca.setPointerCapture?.(e.pointerId);
                });
                alca.addEventListener('pointercancel', () => { toque = null; });
                alca.addEventListener('pointerup', e => {
                    if (toque?.id !== e.pointerId) return;
                    const dy = e.clientY - toque.y;
                    const dx = Math.abs(e.clientX - toque.x);
                    if (Math.max(Math.abs(dy), dx) > 8) ignorarCliqueAte = performance.now() + 400;
                    if (dy > 48 && dy > dx) fechar();
                    toque = null;
                });
            }
            document.addEventListener('keydown', evento => {
                if (evento.defaultPrevented || evento.key !== 'Escape' || GerenciadorArcade.partidaPausada) return;
                GerenciadorArcade.pausar();
            });
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    GerenciadorArcade.pausar();
                    TrilhaSonoraArcade.audio?.pause();
                } else if (!GerenciadorArcade.partidaPausada && TrilhaSonoraArcade.tocando && GerenciadorArcade.trilhaLigada()) {
                    TrilhaSonoraArcade.audio?.play()?.catch(() => {});
                }
            });
        });
