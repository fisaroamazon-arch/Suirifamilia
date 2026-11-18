/* Suiri Família 7.0 · entrada da página homem.html. */
window.PlayerHomem = {
            audio: null,
            pastaSong: 'assets/audio/music/',
            indiceAtual: 0,
            modoAleatorio: Suiri.storage.getItem('suiri_homem_aleatorio') !== 'false',
            soFavoritas: false,
            deveTocarSalvo: Suiri.storage.getItem('suiri_homem_deve_tocar') === 'true',
            favoritas: JSON.parse(Suiri.storage.getItem('suiri_homem_musicas_favoritas') || '[]'),

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
                        this.avancar(true);
                    });

                    this.audio.addEventListener('play', () => {
                        Suiri.storage.setItem('suiri_homem_deve_tocar', 'true');
                        this.atualizarInterface();
                    });

                    this.audio.addEventListener('pause', () => {
                        Suiri.storage.setItem('suiri_homem_deve_tocar', 'false');
                        this.atualizarInterface();
                    });

                    this.audio.addEventListener('error', () => {
                        this.deveTocarSalvo=false;this.audio.pause();
                        window.SuiriPlayer?.reportarErro();
                    });
                }

                const ultimoIdx = parseInt(Suiri.storage.getItem('suiri_homem_idx_atual') || '0', 10);
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
                Suiri.storage.setItem('suiri_homem_idx_atual', indice.toString());

                const item = catalogo[indice];
                if (!this.audio) this.audio = new Audio();
                
                this.audio.src = `${this.pastaSong}${item.arquivo}`;
                this.atualizarInterface();

                if (reproduzir) {
                    this.audio.play().catch(() => {});
                }
            },

            alternarPlay: function() {
                if (!this.audio) return;
                if (this.audio.paused) {
                    this.audio.play().catch(() => {});
                } else {
                    this.audio.pause();
                }
            },

            alternarAleatorio: function() {
                this.modoAleatorio = !this.modoAleatorio;
                Suiri.storage.setItem('suiri_homem_aleatorio', this.modoAleatorio ? 'true' : 'false');
                this.atualizarInterface();
                if (typeof window.mostrarToast === 'function') {
                    window.mostrarToast(this.modoAleatorio ? "Modo Aleatório Ativado 🔀" : "Modo Sequencial Ativado 🔁", "info");
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

            avancar: function(automatico = false) {
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

            retroceder: function() {
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

                const idx = this.favoritas.indexOf(item.arquivo);
                if (idx >= 0) {
                    this.favoritas.splice(idx, 1);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast(`"${item.titulo}" removida das favoritas.`, "info");
                    }
                } else {
                    this.favoritas.push(item.arquivo);
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast(`"${item.titulo}" favoritada! ❤️`, "sucesso");
                    }
                }

                Suiri.storage.setItem('suiri_homem_musicas_favoritas', JSON.stringify(this.favoritas));
                this.atualizarInterface();
                this.renderizarListaFavoritas();
            },

            alternarPainelFavoritas: function() {
                const gaveta = document.getElementById('gaveta-player-favoritas');
                if (gaveta) gaveta.classList.toggle('oculto');
            },

            tocarApenasFavoritas: function() {
                if (this.favoritas.length === 0) {
                    if (typeof window.mostrarToast === 'function') {
                        window.mostrarToast("Nenhuma música favoritada ainda. Toque no coração para favoritar!", "erro");
                    }
                    return;
                }

                this.soFavoritas = true;
                const catalogo = this.obterCatalogo();
                const itemAtual = catalogo[this.indiceAtual];

                if (!itemAtual || !this.favoritas.includes(itemAtual.arquivo)) {
                    const primeiroFavIdx = catalogo.findIndex(m => m.arquivo === this.favoritas[0]);
                    this.carregarPorIndice(primeiroFavIdx >= 0 ? primeiroFavIdx : 0, true);
                } else if (this.audio.paused) {
                    this.audio.play().catch(() => {});
                }

                this.atualizarInterface();
                if (typeof window.mostrarToast === 'function') {
                    window.mostrarToast("Reproduzindo apenas músicas selecionadas! ⭐", "sucesso");
                }
            },

            renderizarListaFavoritas: function() {
                const cont = document.getElementById('lista-player-favoritas-itens');
                const contador = document.getElementById('contador-player-favoritas');
                if (contador) contador.textContent = this.favoritas.length;

                if (!cont) return;

                if (this.favoritas.length === 0) {
                    cont.innerHTML = '<span style="font-size: 11px; color: #64748b; text-align: center; display: block; padding: 4px;">Nenhuma faixa favoritada.</span>';
                    return;
                }

                const catalogo = this.obterCatalogo();

                cont.innerHTML = this.favoritas.map(arq => {
                    const item = catalogo.find(m => m.arquivo === arq) || { arquivo: arq, titulo: arq };
                    const idxNoCatalogo = catalogo.findIndex(m => m.arquivo === arq);

                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 7px 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <span style="font-size: 11.5px; color: #0f172a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%;">
                                ${item.titulo} - Felipe Sales
                            </span>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button type="button" onclick="window.PlayerHomem.carregarPorIndice(${idxNoCatalogo}, true)" style="background: #16a34a; border: none; color: #fff; padding: 4px 9px; border-radius: 6px; font-size: 10.5px; font-weight: 800; cursor: pointer;">
                                    ▶ Tocar
                                </button>
                                <button type="button" onclick="window.PlayerHomem.removerFavoritoDireto('${arq}')" style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 13px; line-height: 1;">
                                    ✖
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            removerFavoritoDireto: function(arq) {
                this.favoritas = this.favoritas.filter(a => a !== arq);
                Suiri.storage.setItem('suiri_homem_musicas_favoritas', JSON.stringify(this.favoritas));
                if (this.soFavoritas && this.favoritas.length === 0) {
                    this.soFavoritas = false;
                }
                this.atualizarInterface();
                this.renderizarListaFavoritas();
            },

            atualizarInterface: function() {
                const catalogo = this.obterCatalogo();
                const item = catalogo[this.indiceAtual] || { titulo: "Sem faixa" };

                const elTitulo = document.getElementById('player-homem-titulo');
                const btnToggle = document.getElementById('btn-player-toggle');
                const btnFav = document.getElementById('btn-player-favoritar');
                const btnAleatorio = document.getElementById('btn-player-aleatorio');
                const btnSoFav = document.getElementById('btn-player-tocar-so-favoritas');

                if (elTitulo) {
                    elTitulo.textContent = `${item.titulo} - Felipe Sales`;
                }

                if (btnToggle && this.audio) {
                    btnToggle.innerHTML = this.audio.paused ? '▶' : '⏸';
                }

                if (btnFav && item.arquivo) {
                    const ehFav = this.favoritas.includes(item.arquivo);
                    btnFav.innerHTML = ehFav ? '❤️' : '🤍';
                }

                if (btnAleatorio) {
                    if (this.modoAleatorio) {
                        btnAleatorio.classList.add('ativo');
                    } else {
                        btnAleatorio.classList.remove('ativo');
                    }
                }

                if (btnSoFav) {
                    if (this.soFavoritas) {
                        btnSoFav.style.background = '#d97706';
                        btnSoFav.textContent = '★ Favoritas Ativas';
                    } else {
                        btnSoFav.style.background = '#16a34a';
                        btnSoFav.textContent = '▶ Tocar Favoritas';
                    }
                }
            }
        };
