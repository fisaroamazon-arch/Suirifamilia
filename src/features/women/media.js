/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.obterListaMidiaMulherAtual = function() {
    if (window.abaMidiaMulherAtiva === 'filmes') {
        return window.CatalogoFilmesMasculinos || [];
    } else {
        return window.CatalogoSeriesMasculinas || [];
    }
};

window.alternarAbaMidiaMulher = function(aba) {
    window.abaMidiaMulherAtiva = aba;
    const btnF = document.getElementById('btn-aba-filmes-mulher');
    const btnS = document.getElementById('btn-aba-series-mulher');

    const listaFilmesQtd = (window.CatalogoFilmesMasculinos && window.CatalogoFilmesMasculinos.length) || 200;
    const listaSeriesQtd = (window.CatalogoSeriesMasculinas && window.CatalogoSeriesMasculinas.length) || 250;

    if (btnF) {
        btnF.setAttribute('aria-pressed', String(aba === 'filmes'));
        btnF.textContent = `Filmes (${listaFilmesQtd})`;
    }
    if (btnS) {
        btnS.setAttribute('aria-pressed', String(aba === 'series'));
        btnS.textContent = `Séries (${listaSeriesQtd})`;
    }

    window.indiceMidiaMulher[aba] = 0;
    window.atualizarVisualizacaoMidiaMulher();
};

window.sortearMidiaMulherAleatoria = function() {
    const lista = window.obterListaMidiaMulherAtual();
    if (!lista || lista.length === 0) return;

    let idxAtual = window.indiceMidiaMulher[window.abaMidiaMulherAtiva] || 0;
    let novoIdx;
    do {
        novoIdx = Math.floor(Math.random() * lista.length);
    } while (lista.length > 1 && novoIdx === idxAtual);

    window.indiceMidiaMulher[window.abaMidiaMulherAtiva] = novoIdx;
    window.atualizarVisualizacaoMidiaMulher();

    if (typeof window.mostrarToast === 'function') {
        const item = lista[novoIdx];
        window.mostrarToast(`Sorteado: "${item.titulo || item.tituloOriginal}" 🔀`, "info");
    }
};

window.navegarCarrosselMidiaMulher = function(dir) {
    const lista = window.obterListaMidiaMulherAtual();
    if (!lista || lista.length === 0) return;

    let idx = (window.indiceMidiaMulher[window.abaMidiaMulherAtiva] || 0) + dir;
    if (idx < 0) idx = lista.length - 1;
    if (idx >= lista.length) idx = 0;

    window.indiceMidiaMulher[window.abaMidiaMulherAtiva] = idx;
    window.atualizarVisualizacaoMidiaMulher();
};

// Integração TMDb com Cache no LocalStorage V3 (Provedores com Logo e Link)
window.buscarDadosTmdbMidiaMulher = async function(item) {
    if (!item) return null;
    const chaveItem = item.imdbId || (item.tituloOriginal || item.titulo || '').toLowerCase().trim();
    if (window.cacheTmdbMulher[chaveItem]) {
        return window.cacheTmdbMulher[chaveItem];
    }

    if (!window.TMDB_API_KEY) return null;

    try {
        let tmdbId = null;
        let tipoMidia = window.abaMidiaMulherAtiva === 'filmes' ? 'movie' : 'tv';
        let dadosObra = null;

        if (item.imdbId) {
            const resFind = await fetch(`https://api.themoviedb.org/3/find/${item.imdbId}?api_key=${window.TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`);
            const dataFind = await resFind.json();
            if (dataFind.movie_results && dataFind.movie_results.length > 0) {
                dadosObra = dataFind.movie_results[0];
                tipoMidia = 'movie';
                tmdbId = dadosObra.id;
            } else if (dataFind.tv_results && dataFind.tv_results.length > 0) {
                dadosObra = dataFind.tv_results[0];
                tipoMidia = 'tv';
                tmdbId = dadosObra.id;
            }
        }

        if (!dadosObra) {
            const termo = encodeURIComponent(item.tituloOriginal || item.titulo);
            const resBusca = await fetch(`https://api.themoviedb.org/3/search/${tipoMidia}?api_key=${window.TMDB_API_KEY}&query=${termo}&language=pt-BR&page=1`);
            const dataBusca = await resBusca.json();
            if (dataBusca.results && dataBusca.results.length > 0) {
                dadosObra = dataBusca.results[0];
                tmdbId = dadosObra.id;
            }
        }

        if (dadosObra) {
            let provedoresBR = [];
            let linkJustWatch = `https://www.themoviedb.org/${tipoMidia}/${tmdbId}/watch?locale=BR`;

            if (tmdbId) {
                try {
                    const resWatch = await fetch(`https://api.themoviedb.org/3/${tipoMidia}/${tmdbId}/watch/providers?api_key=${window.TMDB_API_KEY}`);
                    const dataWatch = await resWatch.json();
                    if (dataWatch.results && dataWatch.results.BR) {
                        const regiaoBR = dataWatch.results.BR;
                        linkJustWatch = regiaoBR.link || linkJustWatch;

                        const listaFlatrate = regiaoBR.flatrate || [];
                        const listaRent = regiaoBR.rent || [];
                        const listaBuy = regiaoBR.buy || [];

                        const mapProvedores = new Map();
                        listaFlatrate.forEach(p => mapProvedores.set(p.provider_name, {
                            nome: p.provider_name,
                            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                        }));
                        listaRent.forEach(p => {
                            if (!mapProvedores.has(p.provider_name)) mapProvedores.set(p.provider_name, {
                                nome: p.provider_name,
                                logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                            });
                        });
                        listaBuy.forEach(p => {
                            if (!mapProvedores.has(p.provider_name)) mapProvedores.set(p.provider_name, {
                                nome: p.provider_name,
                                logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                            });
                        });

                        provedoresBR = Array.from(mapProvedores.values()).slice(0, 5);
                    }
                } catch (errProv) {}
            }

            const info = {
                poster: dadosObra.poster_path ? `https://image.tmdb.org/t/p/w780${dadosObra.poster_path}` : null,
                plot: dadosObra.overview && dadosObra.overview.trim().length > 0 ? dadosObra.overview : null,
                rating: dadosObra.vote_average ? dadosObra.vote_average.toFixed(1) : null,
                provedores: provedoresBR,
                linkJustWatch: linkJustWatch
            };

            window.cacheTmdbMulher[chaveItem] = info;
            localStorage.setItem('suiri_tmdb_cache_mulher_v3', JSON.stringify(window.cacheTmdbMulher));
            return info;
        }
    } catch (e) {
        console.warn("TMDb fetch offline:", e);
    }
    return null;
};

window.atualizarVisualizacaoMidiaMulher = function() {
    const lista = window.obterListaMidiaMulherAtual();
    const idx = window.indiceMidiaMulher[window.abaMidiaMulherAtiva] || 0;
    const item = lista[idx];

    if (!item) return;

    const elPosterImg = document.getElementById('midia-mulher-poster-img');
    const elCat = document.getElementById('midia-mulher-categoria');
    const elTempo = document.getElementById('midia-mulher-tempo');
    const elTitulo = document.getElementById('midia-mulher-titulo');
    const elMomento = document.getElementById('midia-mulher-momento');
    const elDesc = document.getElementById('midia-mulher-desc');
    const contGen = document.getElementById('midia-mulher-generos');
    const contPosicao = document.getElementById('midia-mulher-posicao-contador');
    const boxOndeAssistir = document.getElementById('container-onde-assistir-mulher');
    const provStreaming = document.getElementById('provedores-streaming-mulher');
    const linkJustWatch = document.getElementById('midia-mulher-link-justwatch');
    const btnAcao = document.getElementById('btn-marcar-assistido-mulher');
    const btnQueroVer = document.getElementById('btn-quero-ver-mulher');

    const capaFallback = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
    if (elPosterImg) elPosterImg.src = item.capa || capaFallback;

    if (elCat) elCat.textContent = item.categoria || (item.generos ? item.generos[0] : window.abaMidiaMulherAtiva.toUpperCase());
    if (elTempo) elTempo.textContent = item.ano || item.temporadas || '';
    if (elTitulo) elTitulo.textContent = item.titulo || item.tituloOriginal || '';
    if (elMomento) {
        elMomento.textContent = item.momento || 'Recomendação consagrada do acervo familiar.';
    }
    if (elDesc) elDesc.textContent = item.desc || 'Carregando sinopse oficial em português...';

    if (contPosicao) {
        contPosicao.textContent = `${idx + 1} / ${lista.length}`;
    }

    if (boxOndeAssistir) boxOndeAssistir.style.display = 'none';

    if (contGen) {
        const generos = item.generos || [item.categoria || 'Geral'];
        contGen.innerHTML = generos.slice(0, 3).map(g => `
            <span style="font-size:9.5px; font-weight:800; background:#f3e8ff; color:#6b21a8; padding:2px 7px; border-radius:6px; border:1px solid #d8b4fe;">${g}</span>
        `).join('');
    }

    window.buscarDadosTmdbMidiaMulher(item).then(dadosApi => {
        if (dadosApi) {
            const atual = window.obterListaMidiaMulherAtual()[window.indiceMidiaMulher[window.abaMidiaMulherAtiva]];
            if (atual === item) {
                if (dadosApi.poster && elPosterImg) {
                    elPosterImg.src = dadosApi.poster;
                }
                if (dadosApi.plot && elDesc) {
                    elDesc.textContent = dadosApi.plot;
                }
                if (dadosApi.rating && elMomento) {
                    elMomento.textContent = `Avaliação TMDb: ${dadosApi.rating} ★ • ${item.categoria || 'Obra em Destaque'}`;
                }

                if (linkJustWatch && dadosApi.linkJustWatch) {
                    linkJustWatch.href = dadosApi.linkJustWatch;
                }

                if (dadosApi.provedores && dadosApi.provedores.length > 0 && boxOndeAssistir && provStreaming) {
                    const tituloBusca = item.titulo || item.tituloOriginal || '';

                    provStreaming.innerHTML = dadosApi.provedores.map(p => {
                        const linkDireto = window.obterLinkDiretoStreamingMulher(p.nome, tituloBusca, dadosApi.linkJustWatch);
                        const tagLogo = p.logo 
                            ? `<img src="${p.logo}" alt="${esc(p.nome)}" style="width:18px; height:18px; border-radius:5px; object-fit:cover; display:block; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.12);">` 
                            : `<span style="font-size:12px; line-height:1;">📺</span>`;

                        return `
                            <a href="${linkDireto}" target="_blank" rel="noopener noreferrer" 
                               style="text-decoration:none; display:inline-flex; align-items:center; gap:5px; background:#ffffff; color:#3b0764; border:1px solid #d8b4fe; border-radius:8px; padding:4px 9px; box-shadow:0 1px 3px rgba(124,58,237,0.05); font-size:11px; font-weight:700; cursor:pointer;" 
                               title="Abrir ${tituloBusca} no ${esc(p.nome)}">
                                ${tagLogo}
                                <span>${esc(p.nome)}</span>
                                <span style="font-size:10px; color:#7c3aed; font-weight:800; margin-left:1px;">↗</span>
                            </a>
                        `;
                    }).join('');
                    boxOndeAssistir.style.display = 'block';
                }
            }
        }
    });

    const tituloItem = item.titulo || item.tituloOriginal || '';
    const naListaQueroVer = window.dadosMidiaMulherQueroVer.some(m => m.titulo.toLowerCase() === tituloItem.toLowerCase());
    if (btnQueroVer) {
        if (naListaQueroVer) {
            btnQueroVer.textContent = '📌 Na Minha Lista';
            btnQueroVer.style.background = '#ddd6fe';
            btnQueroVer.style.borderColor = '#7c3aed';
            btnQueroVer.style.color = '#4c1d95';
        } else {
            btnQueroVer.textContent = '📌 Quero Assistir';
            btnQueroVer.style.background = '#ede9fe';
            btnQueroVer.style.borderColor = '#c084fc';
            btnQueroVer.style.color = '#581c87';
        }
    }

    const jaVisto = window.dadosMidiaMulherAssistida.find(m => m.titulo.toLowerCase() === tituloItem.toLowerCase());
    if (btnAcao) {
        if (jaVisto) {
            btnAcao.textContent = `★ ${jaVisto.estrelas} Estrelas`;
            btnAcao.style.background = '#f59e0b';
        } else {
            btnAcao.innerHTML = `<img src="assets/icons-modern/icone-check.svg" alt="Assistido" style="width:16px; height:16px; object-fit:contain; vertical-align:middle; margin-right:4px;"> Já Assisti`;
            btnAcao.style.background = '#7c3aed';
        }
    }
};

window.alternarQueroAssistirMulher = function(itemDireto = null) {
    const lista = window.obterListaMidiaMulherAtual();
    const item = itemDireto || lista[window.indiceMidiaMulher[window.abaMidiaMulherAtiva]];
    if (!item) return;

    const tituloItem = item.titulo || item.tituloOriginal;
    const idx = window.dadosMidiaMulherQueroVer.findIndex(m => m.titulo.toLowerCase() === tituloItem.toLowerCase());

    if (idx >= 0) {
        window.dadosMidiaMulherQueroVer.splice(idx, 1);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`"${tituloItem}" removido de 'Quero Assistir'.`, "info");
        }
    } else {
        window.dadosMidiaMulherQueroVer.unshift({
            id: item.id || ('quero_' + Date.now()),
            titulo: tituloItem,
            tipo: window.abaMidiaMulherAtiva,
            categoria: item.categoria || 'Geral',
            ano: item.ano || item.temporadas || '',
            desc: item.desc || '',
            imdbId: item.imdbId || null,
            salvo_em: new Date().toISOString()
        });
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`"${tituloItem}" adicionado à lista 'Quero Assistir'! 📌`, "sucesso");
        }
    }

    Suiri.storage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));
    window.atualizarVisualizacaoMidiaMulher();
    window.renderizarHistoricoQueroVerMulher();
};

window.abrirModalAvaliacaoMidiaMulher = function() {
    const caixa = document.getElementById('caixa-avaliacao-midia-mulher');
    if (caixa) caixa.classList.toggle('oculto');
};

window.confirmarAvaliacaoMidiaMulher = function(estrelas, itemParam = null) {
    const lista = window.obterListaMidiaMulherAtual();
    const item = itemParam || lista[window.indiceMidiaMulher[window.abaMidiaMulherAtiva]];
    if (!item) return;

    const tituloItem = item.titulo || item.tituloOriginal;
    window.dadosMidiaMulherQueroVer = window.dadosMidiaMulherQueroVer.filter(m => m.titulo.toLowerCase() !== tituloItem.toLowerCase());
    Suiri.storage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));

    window.dadosMidiaMulherAssistida = window.dadosMidiaMulherAssistida.filter(m => m.titulo.toLowerCase() !== tituloItem.toLowerCase());
    window.dadosMidiaMulherAssistida.push({
        id: item.id || ('mid_fem_' + Date.now()),
        titulo: tituloItem,
        tipo: window.abaMidiaMulherAtiva,
        categoria: item.categoria,
        estrelas: parseInt(estrelas, 10),
        data: Suiri.today()
    });

    Suiri.storage.setItem('suiri_midia_mulher_assistida', JSON.stringify(window.dadosMidiaMulherAssistida));
    document.getElementById('caixa-avaliacao-midia-mulher')?.classList.add('oculto');
    
    window.atualizarVisualizacaoMidiaMulher();
    window.renderizarHistoricoQueroVerMulher();
    window.renderizarHistoricoAssistidosMulher();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Avaliação de ${estrelas} estrelas guardada!`, "sucesso");
    }
};

window.renderizarHistoricoQueroVerMulher = function() {
    const cont = document.getElementById('bloco-quero-ver-mulher');
    const elContador = document.getElementById('contador-quero-ver-mulher');
    if (!cont) return;

    const lista = window.dadosMidiaMulherQueroVer || [];
    if (elContador) elContador.textContent = lista.length;

    if (lista.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhum título na sua lista para assistir.</span>';
        return;
    }

    cont.innerHTML = lista.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #d8b4fe; padding:8px 12px; border-radius:10px;">
            <div style="min-width:0; flex:1;">
                <strong style="font-size:12.5px; color:#3b0764; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(item.titulo)}</strong>
                <span style="font-size:10px; color:#6b21a8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(5, { id: '${item.id}', titulo: ${Suiri.jsArg(item.titulo)}, categoria: ${Suiri.jsArg(item.categoria)} })" style="background:#7c3aed; color:#fff; border:none; padding:4px 8px; font-size:10.5px; border-radius:8px; font-weight:800; cursor:pointer;" title="Marcar como visto">
                    ✓ Já Vi
                </button>
                <button type="button" onclick="window.removerMidiaQueroVerMulher('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaQueroVerMulher = function(id) {
    window.dadosMidiaMulherQueroVer = window.dadosMidiaMulherQueroVer.filter(m => m.id !== id);
    Suiri.storage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));
    window.renderizarHistoricoQueroVerMulher();
    window.atualizarVisualizacaoMidiaMulher();
};

window.renderizarHistoricoAssistidosMulher = function() {
    const cont = document.getElementById('bloco-assistidos-mulher');
    const elContador = document.getElementById('contador-assistidos-mulher');
    if (!cont) return;

    const ordenados = [...window.dadosMidiaMulherAssistida].sort((a, b) => b.estrelas - a.estrelas);
    if (elContador) elContador.textContent = ordenados.length;

    if (ordenados.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhuma obra avaliada ainda.</span>';
        return;
    }

    cont.innerHTML = ordenados.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #d8b4fe; padding:8px 12px; border-radius:10px;">
            <div style="min-width:0;">
                <strong style="font-size:12.5px; color:#3b0764; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(item.titulo)}</strong>
                <span style="font-size:10px; color:#6b21a8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:800; color:#f59e0b;">${'★'.repeat(item.estrelas)}</span>
                <button type="button" onclick="window.removerMidiaMulherAssistida('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaMulherAssistida = function(id) {
    window.dadosMidiaMulherAssistida = window.dadosMidiaMulherAssistida.filter(m => m.id !== id);
    Suiri.storage.setItem('suiri_midia_mulher_assistida', JSON.stringify(window.dadosMidiaMulherAssistida));
    window.renderizarHistoricoAssistidosMulher();
    window.atualizarVisualizacaoMidiaMulher();
};

// =========================================================================
// 6. COMO SE SENTE HOJE: 8 BARRAS (5 NÍVEIS, SEM NOTA NO RÓTULO)
// =========================================================================

