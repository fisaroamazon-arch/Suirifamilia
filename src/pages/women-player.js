/* Suiri Família 7.0 · entrada da página mulher.html. */
// =========================================================================
        // MOTOR DE MÚSICA DO ESPAÇO MULHER (100% IDÊNTICO AO MOTOR DE HOMEM.HTML)
        // COM ROLAGEM CÍCLICA INFINITA: "[Título] - Filipe Sales"
        // =========================================================================
        window.PlayerMulher = window.PlayerMulher || {
            audio: null,
            pastaSong: 'assets/audio/music/',
            indiceAtual: 0,
            autorPadrao: 'Filipe Sales',
            modoAleatorio: Suiri.storage.getItem('suiri_mulher_aleatorio') !== 'false',
            soFavoritas: false,
            deveTocarSalvo: Suiri.storage.getItem('suiri_mulher_deve_tocar') === 'true',
            favoritas: JSON.parse(Suiri.storage.getItem('suiri_mulher_musicas_favoritas') || '[]'),

            obterCatalogo: function() {
                if (Array.isArray(window.CatalogoMusicasFelipeSales) && window.CatalogoMusicasFelipeSales.length > 0) {
                    return window.CatalogoMusicasFelipeSales;
                }
                return [{ arquivo: "1.mp3", titulo: "Música 1" }];
            },

            iniciar: function() {
                const catalogo = this.obterCatalogo();

                if (!this.audio) {
                    this.audio = new Audio();
                    this.audio.preload = 'auto';

                    this.audio.addEventListener('ended', () => {
                        this.proxima();
                    });

                    this.audio.addEventListener('play', () => {
                        Suiri.storage.setItem('suiri_mulher_deve_tocar', 'true');
                        this.atualizarInterface();
                    });

                    this.audio.addEventListener('pause', () => {
                        Suiri.storage.setItem('suiri_mulher_deve_tocar', 'false');
                        this.atualizarInterface();
                    });

                    this.audio.addEventListener('error', () => {
                        this.deveTocarSalvo=false;this.audio.pause();
                        window.SuiriPlayer?.reportarErro();
                    });
                }

                const ultimoIdx = parseInt(Suiri.storage.getItem('suiri_mulher_idx_atual') || '0', 10);
                this.indiceAtual = (ultimoIdx >= 0 && ultimoIdx < catalogo.length) ? ultimoIdx : 0;

                this.carregarPorIndice(this.indiceAtual, false);
                this.atualizarInterface();
                this.renderizarListaFavoritas();

                if (this.deveTocarSalvo) {
                    const promessa = this.audio.play();
                    if (promessa !== undefined) {
                        promessa.catch(() => {
                            const retomarAposInteracao = () => {
                                if (this.deveTocarSalvo && this.audio && this.audio.paused) {
                                    this.audio.play().catch(() => {});
                                }
                                document.removeEventListener('click', retomarAposInteracao);
                                document.removeEventListener('touchstart', retomarAposInteracao);
                            };
                            document.addEventListener('click', retomarAposInteracao, { once: true });
                            document.addEventListener('touchstart', retomarAposInteracao, { once: true });
                        });
                    }
                }
            },

            carregarPorIndice: function(indice, reproduzir = true) {
                const catalogo = this.obterCatalogo();
                if (indice < 0 || indice >= catalogo.length) {
                    indice = 0;
                }
                this.indiceAtual = indice;
                Suiri.storage.setItem('suiri_mulher_idx_atual', indice.toString());

                const item = catalogo[indice];
                if (!this.audio) this.audio = new Audio();

                this.audio.src = `${this.pastaSong}${item.arquivo}`;
                this.atualizarInterface();

                if (reproduzir) {
                    this.audio.play().catch(e => console.warn(e));
                }
            },

            alternarPausa: function() {
                if (!this.audio) {
                    this.iniciar();
                }
                if (!this.audio.src || this.audio.src === '' || this.audio.src.endsWith('/')) {
                    this.carregarPorIndice(this.indiceAtual, true);
                    return;
                }
                if (this.audio.paused) {
                    this.audio.play().catch(e => console.warn(e));
                } else {
                    this.audio.pause();
                }
                this.atualizarInterface();
            },

            alternarAleatorio: function() {
                this.modoAleatorio = !this.modoAleatorio;
                Suiri.storage.setItem('suiri_mulher_aleatorio', this.modoAleatorio ? 'true' : 'false');
                this.atualizarInterface();
                if (typeof window.mostrarToast === 'function') {
                    window.mostrarToast(this.modoAleatorio ? "Modo Aleatório ativado 🔀" : "Modo Sequencial ativado ➡️", "info");
                }
            },

            obterProximoIndiceAleatorio: function(ignorarAtual = true) {
                const catalogo = this.obterCatalogo();
                let listaIndices = [];

                if (this.soFavoritas && this.favoritas.length > 0) {
                    listaIndices = this.favoritas
                        .map(arq => catalogo.findIndex(item => item.arquivo === arq))
                        .filter(idx => idx !== -1);
                } else {
                    listaIndices = catalogo.map((_, i) => i);
                }

                if (listaIndices.length === 0) return 0;
                if (listaIndices.length === 1) return listaIndices[0];

                let candidatos = ignorarAtual ? listaIndices.filter(i => i !== this.indiceAtual) : listaIndices;
                if (candidatos.length === 0) candidatos = listaIndices;

                const sorteado = Math.floor(Math.random() * candidatos.length);
                return candidatos[sorteado];
            },

            proxima: function() {
                const catalogo = this.obterCatalogo();

                if (this.soFavoritas && this.favoritas.length > 0) {
                    const indicesFavs = this.favoritas
                        .map(arq => catalogo.findIndex(item => item.arquivo === arq))
                        .filter(idx => idx !== -1);

                    if (indicesFavs.length > 0) {
                        if (this.modoAleatorio) {
                            this.carregarPorIndice(this.obterProximoIndiceAleatorio(true), true);
                        } else {
                            const pos = indicesFavs.indexOf(this.indiceAtual);
                            const proxPos = (pos === -1 || pos + 1 >= indicesFavs.length) ? 0 : pos + 1;
                            this.carregarPorIndice(indicesFavs[proxPos], true);
                        }
                        return;
                    }
                }

                if (this.modoAleatorio) {
                    this.carregarPorIndice(this.obterProximoIndiceAleatorio(true), true);
                } else {
                    let proximo = this.indiceAtual + 1;
                    if (proximo >= catalogo.length) proximo = 0;
                    this.carregarPorIndice(proximo, true);
                }
            },

            anterior: function() {
                const catalogo = this.obterCatalogo();

                if (this.soFavoritas && this.favoritas.length > 0) {
                    const indicesFavs = this.favoritas
                        .map(arq => catalogo.findIndex(item => item.arquivo === arq))
                        .filter(idx => idx !== -1);

                    if (indicesFavs.length > 0) {
                        const pos = indicesFavs.indexOf(this.indiceAtual);
                        const antPos = (pos <= 0) ? indicesFavs.length - 1 : pos - 1;
                        this.carregarPorIndice(indicesFavs[antPos], true);
                        return;
                    }
                }

                let anterior = this.indiceAtual - 1;
                if (anterior < 0) anterior = catalogo.length - 1;
                this.carregarPorIndice(anterior, true);
            },

            alternarFavorito: function() {
                const catalogo = this.obterCatalogo();
                const item = catalogo[this.indiceAtual];
                if (!item) return;

                const pos = this.favoritas.indexOf(item.arquivo);
                if (pos >= 0) {
                    this.favoritas.splice(pos, 1);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast(`"${item.titulo}" removida das favoritas.`, "info");
                    }
                } else {
                    this.favoritas.push(item.arquivo);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast(`"${item.titulo}" guardada nas favoritas! ❤️`, "sucesso");
                    }
                }

                Suiri.storage.setItem('suiri_mulher_musicas_favoritas', JSON.stringify(this.favoritas));
                this.atualizarInterface();
                this.renderizarListaFavoritas();
            },

            alternarGavetaFavoritas: function() {
                const gaveta = document.getElementById('gaveta-favoritas-mulher');
                if (!gaveta) return;
                gaveta.classList.toggle('oculto');
                this.renderizarListaFavoritas();
            },

            tocarSoFavoritas: function() {
                if (this.favoritas.length === 0) {
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast("Nenhuma música favoritada ainda!", "aviso");
                    }
                    return;
                }

                this.soFavoritas = !this.soFavoritas;
                const btn = document.getElementById('btn-tocar-so-favoritas-mulher');

                if (this.soFavoritas) {
                    if (btn) btn.textContent = '⏹ Tocar Todas as Faixas';
                    const catalogo = this.obterCatalogo();
                    const primeiroFavIdx = catalogo.findIndex(m => m.arquivo === this.favoritas[0]);
                    this.carregarPorIndice(primeiroFavIdx >= 0 ? primeiroFavIdx : 0, true);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast("Fila restrita às favoritas! ❤️", "sucesso");
                    }
                } else {
                    if (btn) btn.textContent = '▶ Tocar Só Favoritas';
                    this.carregarPorIndice(0, true);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast("Reproduzindo catálogo completo.", "info");
                    }
                }
                this.atualizarInterface();
            },

            renderizarListaFavoritas: function() {
                const cont = document.getElementById('lista-favoritas-mulher-conteudo');
                const contador = document.getElementById('contador-favoritas-mulher');
                if (contador) contador.textContent = this.favoritas.length;

                if (!cont) return;

                if (this.favoritas.length === 0) {
                    cont.innerHTML = '<span style="font-size:11px; color:#9d174d; text-align:center; display:block; padding:8px;">Nenhuma música favoritada ainda. Toque no coração 🤍 para guardar.</span>';
                    return;
                }

                const catalogo = this.obterCatalogo();

                cont.innerHTML = this.favoritas.map(arq => {
                    const item = catalogo.find(f => f.arquivo === arq) || { titulo: arq, arquivo: arq };
                    const idxNoCatalogo = catalogo.findIndex(f => f.arquivo === arq);

                    return `
                        <div style="background:rgba(255, 255, 255, 0.85); border:1px solid #fbcfe8; padding:6px 10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:700; color:#581c87; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:65%;">🎵 ${item.titulo} - Filipe Sales</span>
                            <div style="display:flex; gap:4px; align-items:center;">
                                <button type="button" onclick="window.PlayerMulher.carregarPorIndice(${idxNoCatalogo}, true)" 
                                        style="background:#f3e8ff; border:1px solid #d8b4fe; color:#581c87; border-radius:6px; padding:2px 8px; font-size:10px; font-weight:800; cursor:pointer;">
                                    Tocar ▶
                                </button>
                                <button type="button" onclick="window.PlayerMulher.removerFavoritaDireta('${arq}')" 
                                        style="background:none; border:none; color:#db2777; cursor:pointer; font-size:13px; line-height:1; padding:2px 4px;" title="Remover dos favoritos">
                                    ✕
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            removerFavoritaDireta: function(caminhoArquivo) {
                const pos = this.favoritas.indexOf(caminhoArquivo);
                if (pos >= 0) {
                    this.favoritas.splice(pos, 1);
                    Suiri.storage.setItem('suiri_mulher_musicas_favoritas', JSON.stringify(this.favoritas));
                    if (this.soFavoritas && this.favoritas.length === 0) {
                        this.soFavoritas = false;
                    }
                    this.atualizarInterface();
                    this.renderizarListaFavoritas();
                }
            },

            parar: function() {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                }
                Suiri.storage.setItem('suiri_mulher_deve_tocar', 'false');
                this.atualizarInterface();
            },

            atualizarInterface: function() {
                const catalogo = this.obterCatalogo();
                const item = catalogo[this.indiceAtual] || { titulo: "Sem faixa" };

                const btnPlay = document.getElementById('btn-player-mulher-toggle');
                const lblFaixa1 = document.getElementById('player-mulher-faixa-lbl-1');
                const lblFaixa2 = document.getElementById('player-mulher-faixa-lbl-2');
                const track = document.getElementById('marquee-player-mulher-track');
                const btnCoracao = document.getElementById('btn-player-mulher-coracao');
                const contadorFav = document.getElementById('contador-favoritas-mulher');
                const btnShuffle = document.getElementById('btn-player-mulher-shuffle');

                const estaTocando = this.audio && !this.audio.paused;

                if (btnPlay) {
                    btnPlay.innerHTML = estaTocando ? '⏸' : '▶';
                    btnPlay.title = estaTocando ? 'Pausar' : 'Reproduzir';
                }

                const textoCompleto = `${item.titulo} - ${this.autorPadrao}`;
                if (lblFaixa1) lblFaixa1.textContent = textoCompleto;
                if (lblFaixa2) lblFaixa2.textContent = textoCompleto;

                if (track) {
                    track.style.animationPlayState = estaTocando ? 'running' : 'paused';
                }

                if (contadorFav) {
                    contadorFav.textContent = this.favoritas.length;
                }

                if (btnCoracao && item.arquivo) {
                    const ehFav = this.favoritas.includes(item.arquivo);
                    btnCoracao.innerHTML = ehFav ? '❤️' : '🤍';
                    btnCoracao.title = ehFav ? 'Favoritada' : 'Favoritar';
                }

                if (btnShuffle) {
                    btnShuffle.style.background = this.modoAleatorio ? '#d8b4fe' : '#f3e8ff';
                    btnShuffle.style.borderColor = this.modoAleatorio ? '#9333ea' : '#d8b4fe';
                    btnShuffle.style.color = this.modoAleatorio ? '#3b0764' : '#581c87';
                }
            }
        };

        document.addEventListener("DOMContentLoaded", async () => {
            if(!await window.suiriSessaoPronta)return;
            Suiri.reloadPersonal?.();
            if (window.PlayerMulher && typeof window.PlayerMulher.iniciar === 'function') {
                window.PlayerMulher.iniciar();
            }

            const vidFundo = document.getElementById('video-cenario-fundo');
            if (vidFundo && document.documentElement.dataset.womenMode!=='foco') {
                vidFundo.muted = true;
                vidFundo.defaultMuted = true;
                vidFundo.setAttribute('muted', '');
                vidFundo.setAttribute('playsinline', '');
                vidFundo.setAttribute('webkit-playsinline', '');

                vidFundo.loop=true;

                const dispararVideoIos = () => {
                    vidFundo.muted = true;
                    vidFundo.defaultMuted = true;
                    const promessa = vidFundo.play();
                    if (promessa !== undefined) {
                        promessa.catch(() => {
                            vidFundo.load();
                            vidFundo.play().catch(() => {});
                        });
                    }
                };

                vidFundo.load();
                dispararVideoIos();

                document.body.addEventListener('touchstart', () => {
                    if (document.documentElement.dataset.womenMode!=='foco' && vidFundo.paused) {
                        dispararVideoIos();
                    }
                }, { once: true });
            }

            window.aplicarModoMulherSuiri?.();

            const perfilRaw = localStorage.getItem('suiri_perfil_ativo') || localStorage.getItem('suiri_ultimo_perfil');
            let perfil = {};
            try {
                perfil = JSON.parse(perfilRaw || '{}');
            } catch (e) {
                perfil = {};
            }


            window.fecharEspacoMulher = function() {
                if (window.PlayerMulher && typeof window.PlayerMulher.parar === 'function') {
                    window.PlayerMulher.parar();
                }
                window.location.href = 'index.html';
            };

            if (typeof window.renderizarEsqueletoEspacoMulher === 'function') {
                window.renderizarEsqueletoEspacoMulher();
                if (typeof window.processarEExibirPrevisao === 'function') window.processarEExibirPrevisao();
                if (typeof window.sincronizarCheckboxesRituaisHoje === 'function') window.sincronizarCheckboxesRituaisHoje();
                if (typeof window.calcularOfensivaERendimentoRituais === 'function') window.calcularOfensivaERendimentoRituais();
                if (typeof window.renderizarHistoricoRadarFeminilidade === 'function') window.renderizarHistoricoRadarFeminilidade();
                if (typeof window.atualizarVisualizacaoMidiaMulher === 'function') window.atualizarVisualizacaoMidiaMulher();
                if (typeof window.renderizarHistoricoAssistidosMulher === 'function') window.renderizarHistoricoAssistidosMulher();
                if (typeof window.renderizarHistoricoRituaisRetratil === 'function') window.renderizarHistoricoRituaisRetratil();

                if (typeof window.carregarDadosCicloMulher === 'function') await window.carregarDadosCicloMulher();
                if (typeof window.carregarHistoricoSintomas === 'function') await window.carregarHistoricoSintomas();
                if (typeof window.carregarDiarioMulher === 'function') await window.carregarDiarioMulher();
                if (typeof window.carregarRadarFeminilidadeNuvem === 'function') await window.carregarRadarFeminilidadeNuvem();
            }
        });
