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
                if (this.telaAtiva === 'simon' && window.MotorMusica?.modo === 'dueto') {
                    window.MotorMusica.trocarModo('aprendizado');
                    document.getElementById('tab-piano-aprendizado')?.focus();
                    return;
                }
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

            abrirJogo: function(idJogo) {
                if (this.telaAtiva !== 'menu' || !document.getElementById(`tela-${idJogo}`)) return;
                this.atualizarNomesJogadores();
                if (window.MotorMusica && typeof window.MotorMusica.pararMusicaEContadores === 'function') {
                    window.MotorMusica.pararMusicaEContadores();
                }
                document.getElementById('menu-arcade').style.display = 'none';
                document.querySelectorAll('.area-jogo').forEach(el => el.style.display = 'none');
                this.telaAtiva = idJogo;
                document.body.dataset.arcadeTela = idJogo;
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
        const MotorFlappy = {
            canvas: null, ctx: null, anim: null, rodando: false,
            modo: 1, // 1 = Solo, 2 = Cooperativo
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
            duplaEmContato: false,

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
            },

            iniciar: function(modoEscolhido = 1) {
                this.modo = modoEscolhido;
                this.obstaculos = [];
                this.moedasNoAr = [];
                this.vidasNoAr = [];
                this.particulasVento = [];
                this.obstaculosPassados = 0;
                this.moedasGanhasPartida = 0;
                this.timer = 62;
                this.centroPassagem = this.canvas.height * .48;
                this.cicloAnimProfundidade = 0;
                this.duplaEmContato = false;
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
                this.pular(1);
                if (this.modo === 2) this.pular(2);

                this.ultimoFrame = performance.now();
                this.loop(this.ultimoFrame);
            },

            pular: function(jogador = 1) {
                if (!this.rodando) return;
                const p = (jogador === 1) ? this.p1 : this.p2;
                if (!p.vivo) return;

                p.vy = p.imp;
                AudioMotor.tocarTom(jogador === 1 ? 520 : 680, 0.08);

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

            obterEspacoAtual: function() {
                const larguraInicial = Math.min(258, this.canvas.height * .56);
                const progresso = Math.min(1, this.obstaculosPassados / 36);
                return larguraInicial * (1 - .24 * progresso);
            },

            atualizar: function() {
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

                this.detectarEncontroDaDupla();

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
                const progressoVoo = Math.min(1, this.obstaculosPassados / 36);
                const intervaloSpawn = 124 - progressoVoo * 30;
                if (this.timer > intervaloSpawn) {
                    this.timer = 0;
                    const espaco = this.obterEspacoAtual();
                    const variacao = this.canvas.height * (.045 + .105 * progressoVoo);
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

                const velRolagem = 2.05 + progressoVoo * 1.45;

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
                            AudioMotor.tocarTom(640, 0.06);
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

            detectarEncontroDaDupla: function() {
                const a = this.p1;
                const b = this.p2;
                const ax = a.x + a.w / 2;
                const ay = a.y + a.h / 2;
                const bx = b.x + b.w / 2;
                const by = b.y + b.h / 2;
                const contato = this.modo === 2 && a.vivo && b.vivo &&
                    ((ax - bx) / 29) ** 2 + ((ay - by) / 34) ** 2 <= 1;
                if (contato && !this.duplaEmContato) {
                    this.mostrarImpacto((ax + bx) / 2, (ay + by) / 2, 'dupla');
                }
                this.duplaEmContato = contato;
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
                AudioMotor.tocarTom(220, 0.25);

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
                ctx.clearRect(0, 0, w, h);

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
                ctx.fillStyle = '#254a49';
                ctx.fillRect(0, h - 24, w, 24);
                ctx.fillStyle = '#78a978';
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
                madeira.addColorStop(0, '#4a3544');
                madeira.addColorStop(.32, '#ab7062');
                madeira.addColorStop(.65, '#8b5756');
                madeira.addColorStop(1, '#513a48');
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
                ctx.fillStyle = '#8fb876';
                ctx.fillRect(x, invertido ? borda + 8 : borda, w, 4);
                ctx.restore();
            },

            fim: function() {
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
                this.canvas.onlostpointercapture = this.canvas.onpointercancel =
                    this.canvas.onpointerup = e => ponteiros.delete(e.pointerId);

                this.teclas = new Set();
                this.canvas.onkeydown = e => {
                    if (!this.rodando || e.altKey || e.ctrlKey || e.metaKey || !['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) return;
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
                const limite = Math.max(1, Math.floor((this.skate.y - 91) / 20));
                const linhas = Math.min(8, this.faseAtual + 2, limite);
                const colunas = this.faseAtual < 3 ? 6 : 7;
                const margemX = 14;
                const larguraBloco = (this.canvas.width - (margemX * 2)) / colunas;
                const alturaBloco = 14;
                const paletaCores = ['#f66b91', '#fca96a', '#ffd577', '#6eddb4', '#69cafa', '#b490fc'];

                for (let l = 0; l < linhas; l++) {
                    const cor = paletaCores[l % paletaCores.length];
                    for (let c = 0; c < colunas; c++) {
                        this.blocos.push({
                            x: margemX + c * larguraBloco,
                            y: 36 + l * (alturaBloco + 6),
                            w: larguraBloco - 5,
                            h: alturaBloco,
                            cor: cor,
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
                this.bola.x += this.bola.vx;
                this.bola.y += this.bola.vy;

                if (this.bola.x - this.bola.r <= 0 || this.bola.x + this.bola.r >= this.canvas.width) {
                    this.bola.vx *= -1;
                    AudioMotor.tocarTom(420, 0.05);
                }

                if (this.modo === 1) {
                    if (this.bola.y - this.bola.r <= 0) {
                        this.bola.vy *= -1;
                        AudioMotor.tocarTom(420, 0.05);
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
                    if (this.obstaculoTimer > 280) {
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
                        this.bola.vx = offset * 4.4;
                        AudioMotor.tocarTom(550, 0.08);
                        tentarVibrar(15);
                    }
                }

                for (let i = this.estilhacos.length - 1; i >= 0; i--) {
                    const est = this.estilhacos[i];
                    est.x += est.vx;
                    est.y += est.vy;
                    est.vy += 0.2;
                    est.alpha -= 0.04;
                    if (est.alpha <= 0) this.estilhacos.splice(i, 1);
                }

                let vivos = 0;
                this.blocos.forEach(b => {
                    if (!b.vivo) return;
                    vivos++;

                    if (this.bola.x + this.bola.r > b.x && this.bola.x - this.bola.r < b.x + b.w &&
                        this.bola.y + this.bola.r > b.y && this.bola.y - this.bola.r < b.y + b.h) {
                        b.vivo = false;
                        this.bola.vy *= -1;
                        this.gerarEstilhacos(b.x, b.y, b.w, b.h, b.cor);

                        if (this.modo === 1) {
                            this.totalDestruidos++;
                            document.getElementById('placar-quebrablocos-blocos').textContent = this.totalDestruidos;

                            if (this.totalDestruidos % 5 === 0) {
                                this.moedasGanhas++;
                                GerenciadorArcade.adicionarMoedas(1);
                                document.getElementById('placar-quebrablocos-moedas').textContent = this.moedasGanhas;
                                AudioMotor.tocarTom(880, 0.16);
                            } else {
                                AudioMotor.tocarTom(640, 0.06);
                            }
                        } else {
                            AudioMotor.tocarTom(720, 0.1);
                            tentarVibrar(25);
                        }
                    }
                });

                if (this.modo === 1) {
                    if (vivos === 0) {
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

            servirBolaSolo: function() {
                this.bola.x = this.skate.x + this.skate.w / 2;
                this.bola.y = this.skate.y - this.bola.r - 12;
                this.bola.vx = (Math.random() < .5 ? -1 : 1) * 1.65;
                this.bola.vy = -Math.min(5.8, 2.65 + (this.faseAtual - 1) * .32);
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

                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(this.skate.x, this.skate.y + 2, this.skate.w, 9, 6);
                ctx.fill();
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.roundRect(this.skate.x + 2, this.skate.y, this.skate.w - 4, 6, 4);
                ctx.fill();
                ctx.restore();

                if (this.modo === 2) {
                    ctx.save();
                    ctx.fillStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.roundRect(this.skateTopo.x, this.skateTopo.y - 2, this.skateTopo.w, 9, 6);
                    ctx.fill();
                    ctx.fillStyle = '#f87171';
                    ctx.beginPath();
                    ctx.roundRect(this.skateTopo.x + 2, this.skateTopo.y, this.skateTopo.w - 4, 6, 4);
                    ctx.fill();
                    ctx.restore();

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

                this.blocos.forEach(b => {
                    if (!b.vivo) return;
                    const brilho = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
                    brilho.addColorStop(0, '#fff7df');
                    brilho.addColorStop(.24, b.cor);
                    brilho.addColorStop(.78, b.cor);
                    brilho.addColorStop(1, '#403351');
                    ctx.fillStyle = brilho;
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, b.w, b.h, 5);
                    ctx.fill();
                    ctx.strokeStyle = '#fff5dc55';
                    ctx.stroke();
                });
            },

            fim: function() {
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
                const qtdInicial = this.modo === 'rush' ? 12 : (this.modo === 'duelo' ? 8 : 4);
                for (let i = 0; i < qtdInicial; i++) this.criarBolha();
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
            },

            criarBolha: function() {
                let dono = 'j1';
                if (this.modo === 'duelo' || this.modo === 'rush') {
                    dono = Math.random() < 0.5 ? 'j1' : 'j2';
                }

                const progresso = this.obterProgresso();
                const velBase = this.modo === 'rush' ? 1.65 + .9 * progresso : .95 + .95 * progresso;
                const variacao = .45 + .95 * progresso;
                const raio = 32 - 9 * progresso + Math.random() * 6;
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
                if (this.modo === 'rush') return 1 - this.segundosRestantesRush / 180;
                return Math.min(1, (this.estouradasJ1 + this.estouradasJ2) / 42);
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

            estourarNaPosicao: function(x, y) {
                for (let i = this.bolhas.length - 1; i >= 0; i--) {
                    const b = this.bolhas[i];
                    const dist = Math.hypot(x - b.x, y - b.y);

                    if (dist < b.r + 20) {
                        const corGota = b.dono === 'j2' ? '#f43f5e' : '#38bdf8';
                        this.gerarGotas(b.x, b.y, corGota);

                        if (b.dono === 'j2') {
                            this.estouradasJ2++;
                            const elJ2 = document.getElementById('placar-bolhas-estouradas-j2');
                            if (elJ2) elJ2.textContent = this.estouradasJ2;
                            AudioMotor.tocarTom(920 + Math.random() * 100, 0.05);
                        } else {
                            this.estouradasJ1++;
                            const elJ1 = document.getElementById('placar-bolhas-estouradas');
                            if (elJ1) elJ1.textContent = this.estouradasJ1;
                            AudioMotor.tocarTom(750 + Math.random() * 100, 0.05);
                        }

                        this.bolhas.splice(i, 1);
                        tentarVibrar(20);

                        const totalGeral = this.estouradasJ1 + this.estouradasJ2;
                        if (totalGeral % 20 === 0) {
                            GerenciadorArcade.adicionarMoedas(1);
                            AudioMotor.tocarTom(880, 0.18);
                        }
                        break;
                    }
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
                const intervalo = this.modo === 'rush' ? 465 - progresso * 245 :
                    (this.modo === 'duelo' ? 1000 : 1230) - progresso * 410;

                if (agora - this.ultimoSpawn > intervalo) {
                    this.ultimoSpawn = agora;
                    this.criarBolha();
                    if (this.modo === 'rush' && progresso >= .32) {
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
                            AudioMotor.tocarTom(220, 0.15);
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
            },

            fim: function() {
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
                this.turno = 'X';
                this.fim = false;
                const nomeJ1 = GerenciadorArcade.obterNomeUsuario();
                
                const statusEl = document.getElementById('status-velha');
                if (this.modo === '2p') {
                    statusEl.textContent = `Vez de ${nomeJ1} (X - Caneta Azul)`;
                } else {
                    statusEl.textContent = 'Sua vez: Você joga com X (Caneta Azul)';
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
                    const vezNome = this.turno === 'X' ? `${nomeJ1} (X)` : 'Shuiri (O)';
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
                    document.getElementById('status-velha').textContent = 'Chuíri a riscar...';
                    this.timerChuiri = setTimeout(() => this.jogadaChuiri(), 420);
                }
            },

            jogadaChuiri: function() {
                if (this.fim || this.modo !== 'ia') return;
                let escolhida = null;

                for (let item of this.linhasVitoria) {
                    const contO = item.linha.filter(idx => this.tabuleiro[idx] === 'O').length;
                    const vazia = item.linha.find(idx => this.tabuleiro[idx] === '');
                    if (contO === 2 && vazia !== undefined) { escolhida = vazia; break; }
                }

                if (escolhida === null && (this.dificuldade === 'desafio' || Math.random() < .44)) {
                    for (let item of this.linhasVitoria) {
                        const contX = item.linha.filter(idx => this.tabuleiro[idx] === 'X').length;
                        const vazia = item.linha.find(idx => this.tabuleiro[idx] === '');
                        if (contX === 2 && vazia !== undefined) { escolhida = vazia; break; }
                    }
                }

                if (escolhida === null && this.dificuldade === 'desafio' && this.tabuleiro[4] === '') escolhida = 4;
                if (escolhida === null) {
                    const vazias = this.tabuleiro.map((v, idx) => v === '' ? idx : null).filter(v => v !== null);
                    if (vazias.length > 0) escolhida = vazias[Math.floor(Math.random() * vazias.length)];
                }

                if (escolhida !== null) {
                    this.marcar(escolhida, 'O');
                    AudioMotor.tocarSomCaneta(0.18);
                    tentarVibrar(25);
                }

                const vitoriaInfo = this.checarVitoria('O');
                if (vitoriaInfo) return this.vitoria('O', vitoriaInfo);
                if (this.tabuleiro.every(x => x !== '')) return this.empate();
                this.turno = 'X';
                document.getElementById('status-velha').textContent = 'Sua vez: Você joga com X (Caneta Azul)';
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
                this.fim = true;
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
                { id: 'estrela',  svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#f59e0b;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
                { id: 'coracao',  svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#ef4444;" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>` },
                { id: 'coroa',    svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#d97706;" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>` },
                { id: 'foguete',  svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#0284c7;" viewBox="0 0 24 24"><path d="m4.5 16.5-1.5 3 3-1.5M12 15l-3-3m5.5-2.5L16 8m-6.5 4.5L11 11M9 6l6 6M12 3l9 9-4.5 4.5-9-9L12 3z"/></svg>` },
                { id: 'patinha',  svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#10b981;" viewBox="0 0 24 24"><circle cx="12" cy="14" r="4"/><circle cx="6.5" cy="8.5" r="2.2"/><circle cx="10" cy="5.5" r="2.2"/><circle cx="14" cy="5.5" r="2.2"/><circle cx="17.5" cy="8.5" r="2.2"/></svg>` },
                { id: 'diamante', svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#6366f1;" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>` },
                { id: 'musica',   svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#a855f7;" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
                { id: 'sol',      svg: `<svg class="icone-svg" style="width:28px;height:28px;color:#f97316;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>` }
            ],

            trocarNivel: function(pares) {
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
                this.atualizarPlacar();

                const simbolos = this.simbolos.slice(0, this.totalPares);
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

            virar: function(idx) {
                if (this.bloqueado || this.viradas.length >= 2) return;
                const el = document.getElementById(`carta-memoria-${idx}`);
                if (!el || el.getAttribute('data-v') === '1') return;

                const c = this.cartas[idx];
                el.innerHTML = c.svg;
                el.setAttribute('aria-label', `Carta ${idx + 1}, ${c.id}`);
                el.classList.add('revelada');
                el.setAttribute('data-v', '1');
                AudioMotor.tocarTom(520, 0.08);
                this.viradas.push({ idx, id: c.id });

                if (this.viradas.length === 2) {
                    this.jogadas++;
                    const [c1, c2] = this.viradas;
                    if (c1.id === c2.id) {
                        AudioMotor.tocarTom(880, 0.18);
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
                        }, {4: 1080, 6: 880, 8: 700}[this.totalPares]);
                    }
                }
            },

            fimDeJogo: function(premio) {
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
            const alca = dialogo?.querySelector('.arcade-pausa-alca');
            let toque = null;
            let ignorarCliqueAte = 0;
            alca?.addEventListener('click', () => {
                if (performance.now() > ignorarCliqueAte) GerenciadorArcade.continuar();
            });
            alca?.addEventListener('pointerdown', e => {
                if (e.button !== 0) return;
                ignorarCliqueAte = 0;
                toque = { id: e.pointerId, x: e.clientX, y: e.clientY };
                alca.setPointerCapture?.(e.pointerId);
            });
            alca?.addEventListener('pointercancel', () => { toque = null; });
            alca?.addEventListener('pointerup', e => {
                if (toque?.id !== e.pointerId) return;
                const dy = e.clientY - toque.y;
                const dx = Math.abs(e.clientX - toque.x);
                if (Math.max(Math.abs(dy), dx) > 8) ignorarCliqueAte = performance.now() + 400;
                if (dy > 48 && dy > dx) GerenciadorArcade.continuar();
                toque = null;
            });
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
