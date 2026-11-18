// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-ESPACO-MASCULINO.JS (100% INTEGRAL E COMPLETO)
// Reorganização Oficial do Layout: 
// 1. Princípio do Dia
// 2. A Forja (Missões + Estado Diário: Humor, Mente Serena, Disposição, Foco)
// 3. Arsenal Prático (Doutrina Física & Nutrição com Sorteio)
// 4. Radar Pessoal & Vida a Dois (Libido, Performance Própria, Satisfação Parceira)
// 5. Filmes & Séries (Com Logos Oficiais de Streaming e Links Diretos)
// 6. Trincheira Sonora & Digital
// 7. Oficina & Garagem
// =========================================================================

// CONFIGURAÇÃO DA API TMDB
window.TMDB_API_KEY = '340bf11ebbaf9247c353e8eb6dc824b4';

// 1. PERSISTÊNCIA E CHAVES DINÂMICAS POR UTILIZADOR
window.obterIdUsuarioMasc = function() {
    return window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || 'padrao');
};

window.obterChaveStorageMasc = function(sufixo) {
    return `suiri_masc_${sufixo}_${window.obterIdUsuarioMasc()}`;
};

// 6 Missões Padrão da Forja (Editáveis)
window.missoesPadraoForja = [
    { id: "m1", rotulo: "Acordar Cedo" },
    { id: "m2", rotulo: "Banho Frio" },
    { id: "m3", rotulo: "Alongamento" },
    { id: "m4", rotulo: "Treino / Calistenia" },
    { id: "m5", rotulo: "Sem Açúcar / Dieta Limpa" },
    { id: "m6", rotulo: "Leitura / Estudo Estoico" }
];

// Carregamento de dados com chaves seguras
window.configMissoesForja = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('config_missoes'))) || window.missoesPadraoForja;
window.dadosForjaDiaria = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('forja_diaria'))) || {};
window.dadosEstadoDiario = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('estado_diario'))) || { humor: 5, estresse: 5, fisico: 5, mental: 5, historico: [] };
window.dadosRadarIntimo = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('radar_intimo'))) || { libido: 5, realizacao: 5, parceira: 5, ultima_relacao: null, historico: [] };
window.dadosReflexoesFavoritas = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('estoicas_favoritas'))) || [];
window.dadosMidiaAssistida = Suiri.parseJSON(Suiri.storage.getItem('suiri_midia_assistida')) || [];
window.dadosMidiaQueroVerMasc = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('midia_quero_ver'))) || [];
window.dadosManutencaoGaragem = Suiri.parseJSON(Suiri.storage.getItem('suiri_manutencao_masc')) || [];
window.dadosAcervoLazer = Suiri.parseJSON(Suiri.storage.getItem('suiri_lazer_masc')) || [];

window.reflexaoEstoicaExibidaAtual = null;
window.indiceMidiaAtual = { filmes: 0, series: 0 };
window.abaMidiaAtiva = 'filmes';
window.modoNavegacaoMidia = 'aleatorio';
window.itemMidiaAtualmenteExibido = null;

// =========================================================================
// 2. MOTOR DE LINKS DIRETOS PARA CADA PLATAFORMA DE STREAMING
// =========================================================================
window.obterLinkDiretoStreaming = function(nomeProvedor, tituloFilme, linkFallback) {
    if (!nomeProvedor) return linkFallback || '#';
    const p = nomeProvedor.toLowerCase();
    const q = encodeURIComponent(tituloFilme || '');

    if (p.includes('netflix')) {
        return `https://www.netflix.com/search?q=${q}`;
    }
    if (p.includes('prime') || p.includes('amazon')) {
        return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`;
    }
    if (p.includes('max') || p.includes('hbo')) {
        return `https://play.max.com/search?q=${q}`;
    }
    if (p.includes('disney')) {
        return `https://www.disneyplus.com/search?q=${q}`;
    }
    if (p.includes('globo')) {
        return `https://globoplay.globo.com/busca/?q=${q}`;
    }
    if (p.includes('apple')) {
        return `https://tv.apple.com/search?term=${q}`;
    }
    if (p.includes('looke')) {
        return `https://www.looke.com.br/busca/${q}`;
    }
    if (p.includes('paramount')) {
        return `https://www.paramountplus.com/search/?q=${q}`;
    }
    if (p.includes('claro')) {
        return `https://www.clarovideo.com/brasil/search?q=${q}`;
    }
    if (p.includes('telecine')) {
        return `https://globoplay.globo.com/busca/?q=${q}`;
    }
    if (p.includes('crunchyroll')) {
        return `https://www.crunchyroll.com/search?q=${q}`;
    }
    if (p.includes('oldflix')) {
        return `https://www.oldflix.com.br/busca?q=${q}`;
    }
    if (p.includes('belas artes') || p.includes('carte')) {
        return `https://www.belasartesalacarte.com.br/search?q=${q}`;
    }
    if (p.includes('youtube') || p.includes('google play')) {
        return `https://www.google.com/search?q=${encodeURIComponent(tituloFilme + ' ' + nomeProvedor + ' assistir')}`;
    }

    return linkFallback || `https://www.google.com/search?q=${encodeURIComponent(tituloFilme + ' ' + nomeProvedor + ' onde assistir')}`;
};

// =========================================================================
// 2.1. MOTOR DE ENRIQUECIMENTO TMDB COM CACHE LOCAL V6 (COM LOGOS E STREAMING)
// =========================================================================
window.obterDadosTMDbComCache = async function(item) {
    if (!item) return null;

    const idCache = item.imdbId || (item.tituloOriginal ? item.tituloOriginal.toLowerCase().trim() : item.titulo.toLowerCase().trim());
    const chaveStorage = `suiri_tmdb_cache_v6_${idCache}`;

    const cache = localStorage.getItem(chaveStorage);
    if (cache) {
        try {
            const objCache = JSON.parse(cache);
            if (objCache && (objCache.poster || objCache.sinopse)) {
                return objCache;
            }
        } catch (e) {}
    }

    if (!window.TMDB_API_KEY) return null;

    try {
        let tmdbId = null;
        let tipoMidia = (window.abaMidiaAtiva === 'series') ? 'tv' : 'movie';
        let dadosItem = null;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7500);

        if (item.imdbId && item.imdbId.startsWith('tt')) {
            const urlFind = `https://api.themoviedb.org/3/find/${item.imdbId}?api_key=${window.TMDB_API_KEY}&external_source=imdb_id&language=pt-BR`;
            const respFind = await fetch(urlFind, { signal: controller.signal });
            const dataFind = await respFind.json();

            if (dataFind.movie_results && dataFind.movie_results.length > 0) {
                dadosItem = dataFind.movie_results[0];
                tipoMidia = 'movie';
                tmdbId = dadosItem.id;
            } else if (dataFind.tv_results && dataFind.tv_results.length > 0) {
                dadosItem = dataFind.tv_results[0];
                tipoMidia = 'tv';
                tmdbId = dadosItem.id;
            }
        }

        if (!dadosItem) {
            const queryTitulo = item.tituloOriginal || item.titulo;
            const urlBusca = `https://api.themoviedb.org/3/search/${tipoMidia}?api_key=${window.TMDB_API_KEY}&query=${encodeURIComponent(queryTitulo)}&language=pt-BR&page=1`;
            const respBusca = await fetch(urlBusca, { signal: controller.signal });
            const dataBusca = await respBusca.json();

            if (dataBusca.results && dataBusca.results.length > 0) {
                dadosItem = dataBusca.results[0];
                tmdbId = dadosItem.id;
            }
        }

        if (!dadosItem || !tmdbId) {
            clearTimeout(timeoutId);
            return null;
        }

        let provedores = [];
        let linkJustWatch = `https://www.themoviedb.org/${tipoMidia}/${tmdbId}/watch?locale=BR`;
        try {
            const urlProviders = `https://api.themoviedb.org/3/${tipoMidia}/${tmdbId}/watch/providers?api_key=${window.TMDB_API_KEY}`;
            const respProv = await fetch(urlProviders, { signal: controller.signal });
            const dataProv = await respProv.json();

            if (dataProv.results && dataProv.results.BR) {
                const regiaoBR = dataProv.results.BR;
                linkJustWatch = regiaoBR.link || linkJustWatch;

                const listaFlatrate = regiaoBR.flatrate || [];
                const listaRent = regiaoBR.rent || [];
                const listaBuy = regiaoBR.buy || [];

                const mapProvedores = new Map();
                listaFlatrate.forEach(p => mapProvedores.set(p.provider_name, { 
                    nome: p.provider_name, 
                    tipo: 'Streaming',
                    logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                }));
                listaRent.forEach(p => {
                    if (!mapProvedores.has(p.provider_name)) mapProvedores.set(p.provider_name, { 
                        nome: p.provider_name, 
                        tipo: 'Aluguel',
                        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                    });
                });
                listaBuy.forEach(p => {
                    if (!mapProvedores.has(p.provider_name)) mapProvedores.set(p.provider_name, { 
                        nome: p.provider_name, 
                        tipo: 'Compra',
                        logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null
                    });
                });

                provedores = Array.from(mapProvedores.values()).slice(0, 5);
            }
        } catch (eProviders) {}

        clearTimeout(timeoutId);

        const posterFinal = dadosItem.poster_path ? `https://image.tmdb.org/t/p/w780${dadosItem.poster_path}` : null;
        const notaTMDb = dadosItem.vote_average ? dadosItem.vote_average.toFixed(1) : (item.imdbRating || '8.0');

        const resultado = {
            titulo: dadosItem.title || dadosItem.name || item.titulo,
            ano: (dadosItem.release_date || dadosItem.first_air_date || item.ano || '').substring(0, 4),
            poster: posterFinal,
            sinopse: dadosItem.overview && dadosItem.overview.trim().length > 0 ? dadosItem.overview : null,
            imdbRating: notaTMDb,
            provedores: provedores,
            linkOndeAssistir: linkJustWatch
        };

        try {
            localStorage.setItem(chaveStorage, JSON.stringify(resultado));
        } catch (errStorage) {}

        return resultado;
    } catch (err) {
        console.warn("TMDb em segundo plano:", err.message);
    }

    return null;
};

// =========================================================================
// 3. ABERTURA E CONTROLO DE NAVEGAÇÃO
// =========================================================================

window.abrirEspacoMasculino = async function() {
    const secoes = document.querySelectorAll('.secao-conteudo-app');
    secoes.forEach(sec => sec.classList.add('oculto'));

    const telaAlvo = document.getElementById('secao-espaco-masculino');
    if (telaAlvo) {
        telaAlvo.classList.remove('oculto');
    }

    document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('ativo'));

    try {
        window.configMissoesForja = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('config_missoes'))) || window.missoesPadraoForja;
        window.dadosForjaDiaria = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('forja_diaria'))) || {};
        window.dadosEstadoDiario = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('estado_diario'))) || { humor: 5, estresse: 5, fisico: 5, mental: 5, historico: [] };
        window.dadosRadarIntimo = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('radar_intimo'))) || { libido: 5, realizacao: 5, parceira: 5, ultima_relacao: null, historico: [] };
        window.dadosReflexoesFavoritas = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('estoicas_favoritas'))) || [];
        window.dadosMidiaQueroVerMasc = Suiri.parseJSON(localStorage.getItem(window.obterChaveStorageMasc('midia_quero_ver'))) || [];
    } catch (e) {}

    window.renderizarEsqueletoEspacoMasculino();
    window.renderizarReflexaoEstoica(false);
    window.renderizarListaFavoritasEstoicas();
    window.renderizarBotoesForja();
    window.renderizarPainelEvolucaoForja();
    window.renderizarHistoricoForja();
    window.renderizarGraficoETendenciasEstadoDiario();
    window.renderizarGraficoETendenciasRadar();
    window.renderizarHistoricoRadarIntimo();
    window.atualizarVisualizacaoMidia();
    window.renderizarHistoricoQueroVerMasc();
    window.renderizarHistoricoAssistidos();
    window.renderizarListasMasculinas();

    if (typeof window.carregarDadosNuvemEspacoMasculino === 'function') {
        try {
            await window.carregarDadosNuvemEspacoMasculino();
        } catch (e) {
            console.warn("Base local ativa para o Espaço Masculino.");
        }
    }
};

window.fecharEspacoMasculino = function() {
    window.location.href = 'index.html';
};

// =========================================================================
// 4. RENDERIZAÇÃO DO ESQUELETO VISUAL (ORDEM OFICIAL 1 A 7)
// =========================================================================

window.renderizarEsqueletoEspacoMasculino = function() {
    const container = document.getElementById('secao-espaco-masculino');
    if (!container) return;

    const listaDinamica = window.AcervoDinamicaADois || [];
    const pilulaSemanal = listaDinamica.length > 0 
        ? listaDinamica[Math.floor(Math.random() * listaDinamica.length)] 
        : "Cultive a presença e o respeito mútuo em todos os momentos no lar.";

    const listaArsenal = window.AcervoArsenalPratico || [];
    const sabedoriaArsenal = listaArsenal.length > 0 
        ? listaArsenal[Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()) / 86400000) % listaArsenal.length] 
        : "Dedique constância ao treino físico diário e hidrate o corpo logo ao acordar.";

    const totalFilmesDisponiveis = (window.CatalogoFilmesMasculinos || []).length || 200;
    const totalSeriesDisponiveis = (window.CatalogoSeriesMasculinas || []).length || 250;

    container.innerHTML = `
        <style id="estilos-xbox-espaco-masculino">
        @keyframes pulsoGlowThumbXbox {
            0% {
                box-shadow: 0 1px 4px rgba(16, 124, 16, 0.35), 0 0 0 0 rgba(34, 197, 94, 0.4);
            }
            70% {
                box-shadow: 0 1px 6px rgba(16, 124, 16, 0.45), 0 0 0 5px rgba(34, 197, 94, 0);
            }
            100% {
                box-shadow: 0 1px 4px rgba(16, 124, 16, 0.35), 0 0 0 0 rgba(34, 197, 94, 0);
            }
        }

        .slider-xbox-animado {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 5px;
            background: #e2e8f0;
            border-radius: 999px;
            outline: none;
            border: none;
            cursor: pointer;
            margin: 6px 0;
            padding: 0;
            transition: background 0.25s ease;
        }

        .slider-xbox-animado:focus {
            outline: none;
        }

        .slider-xbox-animado::-webkit-slider-runnable-track {
            height: 5px;
            background: #e2e8f0;
            border-radius: 999px;
            border: none;
        }

        .slider-xbox-animado::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #107c10;
            border: 2px solid #ffffff;
            cursor: grab;
            margin-top: -5px;
            animation: pulsoGlowThumbXbox 2.6s infinite ease-in-out;
            transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease, background 0.18s ease;
        }

        .slider-xbox-animado::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.28);
            background: #22c55e;
            box-shadow: 0 2px 10px rgba(34, 197, 94, 0.65), 0 0 0 6px rgba(34, 197, 94, 0.2);
            animation: none;
        }

        .slider-xbox-humor::-webkit-slider-thumb { background: #0284c7 !important; animation: none !important; }
        .slider-xbox-humor:active::-webkit-slider-thumb { background: #38bdf8 !important; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.6), 0 0 0 6px rgba(2, 132, 199, 0.2) !important; }

        .slider-xbox-estresse::-webkit-slider-thumb { background: #d97706 !important; animation: none !important; }
        .slider-xbox-estresse:active::-webkit-slider-thumb { background: #f59e0b !important; box-shadow: 0 2px 10px rgba(217, 119, 6, 0.6), 0 0 0 6px rgba(217, 119, 6, 0.2) !important; }

        .slider-xbox-fisico::-webkit-slider-thumb { background: #16a34a !important; animation: pulsoGlowThumbXbox 2.6s infinite ease-in-out !important; }
        .slider-xbox-fisico:active::-webkit-slider-thumb { background: #22c55e !important; box-shadow: 0 2px 10px rgba(34, 197, 94, 0.65), 0 0 0 6px rgba(34, 197, 94, 0.2) !important; }

        .slider-xbox-mental::-webkit-slider-thumb { background: #7c3aed !important; animation: none !important; }
        .slider-xbox-mental:active::-webkit-slider-thumb { background: #a855f7 !important; box-shadow: 0 2px 10px rgba(124, 58, 237, 0.6), 0 0 0 6px rgba(124, 58, 237, 0.2) !important; }

        .slider-xbox-libido::-webkit-slider-thumb { background: #e11d48 !important; animation: none !important; }
        .slider-xbox-libido:active::-webkit-slider-thumb { background: #fb7185 !important; box-shadow: 0 2px 10px rgba(225, 29, 72, 0.6), 0 0 0 6px rgba(225, 29, 72, 0.2) !important; }

        .slider-xbox-realizacao::-webkit-slider-thumb { background: #0284c7 !important; animation: none !important; }
        .slider-xbox-realizacao:active::-webkit-slider-thumb { background: #38bdf8 !important; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.6), 0 0 0 6px rgba(2, 132, 199, 0.2) !important; }

        .slider-xbox-parceira::-webkit-slider-thumb { background: #d97706 !important; animation: none !important; }
        .slider-xbox-parceira:active::-webkit-slider-thumb { background: #f59e0b !important; box-shadow: 0 2px 10px rgba(217, 119, 6, 0.6), 0 0 0 6px rgba(217, 119, 6, 0.2) !important; }

        .slider-xbox-animado::-moz-range-track {
            background: #e2e8f0;
            border-radius: 999px;
            height: 5px;
            border: none;
        }

        .slider-xbox-animado::-moz-range-thumb {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #107c10;
            border: 2px solid #ffffff;
            cursor: grab;
            transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
        }

        .slider-xbox-animado::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(1.28);
            box-shadow: 0 2px 10px rgba(34, 197, 94, 0.65), 0 0 0 6px rgba(34, 197, 94, 0.2);
        }

        .badge-streaming-link {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .badge-streaming-link:active {
            transform: scale(0.96);
        }
        </style>

        <!-- TOPO: RETORNO AO LAR -->
        <div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:12px;">
            <button type="button" onclick="window.fecharEspacoMasculino()" 
                    style="display:inline-flex; align-items:center; gap:8px; padding:7px 16px; border-radius:18px; font-size:12px; font-weight:800; background:#ffffff; border:1.5px solid #e2e8f0; color:#0f172a; box-shadow:0 2px 8px rgba(0,0,0,0.06); cursor:pointer;">
                <span style="font-size:14px; line-height:1; color:#f97316;">←</span>
                <span>Voltar ao Lar</span>
            </button>
        </div>

        <!-- CABEÇALHO NOBRE -->
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px; padding:2px 4px;">
            <div style="width:85px; height:85px; border-radius:18px; background:#ffffff; border:2px solid #22c55e; box-shadow:0 4px 12px rgba(22, 163, 74, 0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <img class="avatar-espaco-pessoal" src="${window.esc(Suiri.imageUrl(window.perfilAtual?.avatar_url || 'assets/icons-modern/icone-pessoa-escopo.svg'))}" alt="Foto do usuário">
            </div>
            <div style="flex:1; min-width:0;">
                <h1 style="margin:0; font-size:24px; font-weight:900; color:#0f172a; letter-spacing:-0.4px; line-height:1.15;">Espaço Masculino</h1>
                <span style="font-size:12px; color:#16a34a; font-weight:700; display:block; margin-top:3px; letter-spacing:0.2px;">Descompressão, Foco & Blindagem Diária</span>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 1. PRINCÍPIO ESTOICO DO DIA -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #16a34a; box-shadow:0 4px 18px rgba(15,23,42,0.05); border-radius:20px; padding:18px 16px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span id="label-titulo-reflexao-estoica" style="font-size:11.5px; font-weight:800; color:#15803d; text-transform:uppercase; letter-spacing:0.5px;">🏛️ Princípio do Dia</span>
                <span style="font-size:10.5px; font-weight:800; background:#f0f9ff; color:#0369a1; padding:3px 9px; border-radius:10px; border:1px solid #bae6fd;">365 Estoicos</span>
            </div>
            
            <p id="texto-reflexao-estoica-conteudo" style="font-size:14px; color:#1e293b; margin:0 0 10px 0; line-height:1.6; font-weight:600;">Carregando reflexão...</p>
            <span id="autor-reflexao-estoica-conteudo" style="font-size:11.5px; font-weight:800; color:#d97706; display:block; text-align:right; margin-bottom:14px;">— Autor</span>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:12px; gap:6px;">
                <button type="button" class="btn-secundario" style="padding:7px 12px; font-size:11.5px; border-radius:10px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1; font-weight:700; display:inline-flex; align-items:center; gap:6px;" onclick="window.renderizarReflexaoEstoica(false)">
                    <img src="assets/icons-modern/icone-calendario.svg" alt="Calendário" style="width:16px; height:16px; object-fit:contain;">
                    De Hoje
                </button>
                <button type="button" id="btn-favoritar-estoica" class="btn-secundario" style="padding:7px 12px; font-size:11.5px; border-radius:10px; background:#fffbeb; border:1px solid #d97706; color:#b45309; font-weight:800;" onclick="window.alternarFavoritoReflexaoAtual()">🤍 Favoritar</button>
                <button type="button" class="btn-principal" style="width:auto; padding:7px 14px; font-size:11.5px; border-radius:10px; background:#16a34a; color:#fff; font-weight:800; border:none;" onclick="window.renderizarReflexaoEstoica(true)">Próxima 🔀</button>
            </div>

            <div style="margin-top:12px;">
                <div onclick="window.alternarSecaoRetratil('bloco-favoritas-conteudo', 'seta-favoritas')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:9px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#15803d;">⭐ Mensagens Favoritas (<span id="contador-favoritas-estoicas">0</span>)</span>
                    <span id="seta-favoritas" style="font-size:12px; color:#15803d; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-favoritas-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 2. A FORJA (MISSÕES, NÍVEIS, XP + ESTADO DIÁRIO DO HOMEM) -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #ea580c; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="assets/icons-modern/icone-fogo.svg" alt="A Forja" style="width:30px; height:30px; object-fit:contain;">
                    <strong style="font-size:14px; color:#0f172a; font-weight:900;">A Forja (Evolução & Missões)</strong>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:10.5px; border-radius:8px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1; display:inline-flex; align-items:center; gap:4px;" onclick="window.alternarEdicaoConfigForja()">
                        <img src="assets/icons-modern/icones-configuracao.svg" alt="Configuração" style="width:16px; height:16px; object-fit:contain;">
                        Editar
                    </button>
                    <span id="streak-forja" style="font-size:11.5px; font-weight:800; color:#f97316; background:#fff7ed; padding:3px 8px; border-radius:8px; border:1px solid #fed7aa; display:inline-flex; align-items:center; gap:4px;">
                        <img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:18px; height:18px; object-fit:contain;"> 0 dias
                    </span>
                </div>
            </div>

            <!-- NÍVEL DO GUERREIRO & XP ACUMULADO -->
            <div id="painel-nivel-guerreiro" style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:14px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div>
                        <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Patamar Atual:</span>
                        <h4 id="lbl-nome-nivel-forja" style="margin:2px 0 0 0; font-size:14px; color:#b45309; font-weight:900;">Carregando Nível...</h4>
                    </div>
                    <span id="lbl-xp-acumulado" style="font-size:11px; font-weight:800; color:#f97316; background:#fff7ed; padding:3px 8px; border-radius:8px; border:1px solid #fed7aa;">0 XP</span>
                </div>
                <div style="background:#e2e8f0; border-radius:8px; height:7px; width:100%; overflow:hidden; margin-bottom:4px;">
                    <div id="barra-progresso-xp-forja" style="background:linear-gradient(90deg, #ea580c, #f59e0b); height:100%; width:0%; transition:width 0.4s ease;"></div>
                </div>
                <span id="lbl-info-proximo-nivel" style="font-size:10px; color:#64748b; display:block; text-align:right;">Faltam 0 XP para o próximo nível</span>
            </div>

            <!-- ESTATÍSTICAS MENSAIS E META DA SEMANA -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:12px;">
                    <span style="font-size:10px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:4px;">🎯 Meta da Semana</span>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                        <strong id="lbl-meta-semanal-status" style="font-size:12px; color:#0f172a;">0 / 25</strong>
                        <span id="lbl-meta-semanal-pct" style="font-size:11px; font-weight:800; color:#15803d;">0%</span>
                    </div>
                    <div style="background:#e2e8f0; border-radius:6px; height:6px; width:100%; overflow:hidden;">
                        <div id="barra-meta-semanal" style="background:#16a34a; height:100%; width:0%;"></div>
                    </div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:12px;">
                    <span style="font-size:10px; font-weight:800; color:#059669; text-transform:uppercase; display:block; margin-bottom:4px;">📊 Desempenho Mês</span>
                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                        <div>
                            <strong id="lbl-stats-concluidas-mes" style="font-size:13px; color:#0f172a;">0</strong>
                            <span style="font-size:10px; color:#64748b;"> missões</span>
                        </div>
                        <span id="lbl-stats-dias-perfeitos-mes" style="font-size:10.5px; font-weight:800; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:6px;">0 dias 100%</span>
                    </div>
                    <span id="lbl-stats-taxa-mes" style="font-size:10px; color:#047857; display:block; margin-top:4px;">Taxa: 0% de consistência</span>
                </div>
            </div>

            <!-- DESEMPENHO DO DIA DE HOJE -->
            <div style="background:#fff7ed; border:1px solid #fdba74; padding:10px 12px; border-radius:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:6px;">
                    <span style="font-weight:700; color:#b45309;">Grau de Hoje: <strong id="lbl-grau-forja-hoje" style="color:#ea580c;">Inerte</strong></span>
                    <strong id="lbl-porcentagem-forja-hoje" style="color:#ea580c; font-weight:900;">0%</strong>
                </div>
                <div style="background:#e2e8f0; border-radius:8px; height:8px; width:100%; overflow:hidden;">
                    <div id="barra-forja-fill-hoje" style="background:linear-gradient(90deg, #f97316, #ef4444); height:100%; width:0%; transition:width 0.3s ease;"></div>
                </div>
            </div>

            <!-- FORMULÁRIO PARA EDITAR AS MISSÕES -->
            <div id="form-edicao-missoes-forja" class="oculto" style="background:#f8fafc; border:1.5px dashed #cbd5e1; padding:12px; border-radius:12px; margin-bottom:12px;">
                <span style="font-size:11.5px; font-weight:800; color:#0f172a; display:block; margin-bottom:8px;">Personalize suas 6 metas diárias:</span>
                <div id="container-inputs-edicao-forja" style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;"></div>
                <div style="display:flex; justify-content:flex-end; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:11px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1;" onclick="window.alternarEdicaoConfigForja()">Cancelar</button>
                    <button type="button" class="btn-principal" style="width:auto; padding:4px 12px; font-size:11px; background:#ea580c; color:#fff;" onclick="window.salvarConfiguracaoMissoesForja()">Salvar Metas</button>
                </div>
            </div>

            <!-- GRADE DAS 6 MISSÕES -->
            <div id="grid-botoes-missoes-forja" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;"></div>

            <!-- CHECK-IN DO ESTADO DIÁRIO -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:14px; margin-bottom:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:16px;">⚡</span>
                        <strong style="font-size:13px; color:#0f172a; font-weight:900;">Estado do Dia (Corpo & Mente)</strong>
                    </div>
                    <button type="button" class="btn-principal" style="padding:4px 10px; font-size:10px; border-radius:7px; width:auto; background:#ea580c; color:#fff; font-weight:800; border:none;" onclick="window.salvarEstadoDiarioCompleto()">Salvar Estado</button>
                </div>
                <p style="font-size:11px; color:#64748b; margin:0 0 12px 0;">Mapeie como você se sente hoje. Deslize a barra do mal-estar (1) até o ápice de vitalidade e equilíbrio (10).</p>

                <!-- Humor Geral -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                    <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Humor Geral</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <button type="button" onclick="window.alternarSecaoRetratil('legenda-humor-diario')" 
                                style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                            <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                            <span style="font-size:11px; font-weight:700; color:#0284c7; text-decoration:underline;">Instrução</span>
                        </button>
                        <span id="badge-humor-diario-val" style="font-size:11.5px; font-weight:800; color:#0369a1; text-align:right;">Neutro / Equilibrado</span>
                    </div>
                    <input type="range" id="range-humor-diario" class="slider-xbox-animado slider-xbox-humor" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloEstadoDiario('humor')">
                    <div id="legenda-humor-diario" class="oculto" style="margin-top:8px; background:#f0f9ff; border-left:3px solid #0284c7; padding:8px 10px; border-radius:8px; font-size:11px; color:#0369a1; line-height:1.45;">
                        Deslize a barra para expressar como sentiu seu humor e ânimo hoje: marque mais para a esquerda se esteve triste, desanimado ou irritado, ou mais para a direita se esteve animado, radiante e confiante.
                    </div>
                </div>

                <!-- Nível de Estresse / Paz Mental -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                    <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Nível de Estresse / Paz Mental</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <button type="button" onclick="window.alternarSecaoRetratil('legenda-estresse-diario')" 
                                style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                            <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                            <span style="font-size:11px; font-weight:700; color:#d97706; text-decoration:underline;">Instrução</span>
                        </button>
                        <span id="badge-estresse-diario-val" style="font-size:11.5px; font-weight:800; color:#b45309; text-align:right;">Moderado</span>
                    </div>
                    <input type="range" id="range-estresse-diario" class="slider-xbox-animado slider-xbox-estresse" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloEstadoDiario('estresse')">
                    <div id="legenda-estresse-diario" class="oculto" style="margin-top:8px; background:#fffbeb; border-left:3px solid #d97706; padding:8px 10px; border-radius:8px; font-size:11px; color:#92400e; line-height:1.45;">
                        Deslize a barra para expressar o nível de pressão que sentiu hoje: marque mais para a esquerda se esteve tenso, sobrecarregado ou ansioso, ou mais para a direita se esteve com a mente serena, calma e em paz.
                    </div>
                </div>

                <!-- Disposição Física -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                    <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Disposição Física</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <button type="button" onclick="window.alternarSecaoRetratil('legenda-fisico-diario')" 
                                style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                            <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                            <span style="font-size:11px; font-weight:700; color:#16a34a; text-decoration:underline;">Instrução</span>
                        </button>
                        <span id="badge-fisico-diario-val" style="font-size:11.5px; font-weight:800; color:#15803d; text-align:right;">Normal</span>
                    </div>
                    <input type="range" id="range-fisico-diario" class="slider-xbox-animado slider-xbox-fisico" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloEstadoDiario('fisico')">
                    <div id="legenda-fisico-diario" class="oculto" style="margin-top:8px; background:#f0fdf4; border-left:3px solid #16a34a; padding:8px 10px; border-radius:8px; font-size:11px; color:#166534; line-height:1.45;">
                        Deslize a barra para expressar a energia física do seu corpo hoje: marque mais para a esquerda se sentiu o corpo pesado, esgotado ou sem forças, ou mais para a direita se esteve com disposição total e vigor máximo.
                    </div>
                </div>

                <!-- Foco Mental -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                    <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Foco Mental</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <button type="button" onclick="window.alternarSecaoRetratil('legenda-mental-diario')" 
                                style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                            <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                            <span style="font-size:11px; font-weight:700; color:#7c3aed; text-decoration:underline;">Instrução</span>
                        </button>
                        <span id="badge-mental-diario-val" style="font-size:11.5px; font-weight:800; color:#6d28d9; text-align:right;">Concentrado</span>
                    </div>
                    <input type="range" id="range-mental-diario" class="slider-xbox-animado slider-xbox-mental" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloEstadoDiario('mental')">
                    <div id="legenda-mental-diario" class="oculto" style="margin-top:8px; background:#f5f3ff; border-left:3px solid #7c3aed; padding:8px 10px; border-radius:8px; font-size:11px; color:#5b21b6; line-height:1.45;">
                        Deslize a barra para expressar sua clareza de raciocínio hoje: marque mais para a esquerda se sentiu a mente dispersa, distraída ou com névoa, ou mais para a direita se esteve com foco blindado e mente afiada.
                    </div>
                </div>

                <!-- GRÁFICO RETRÁTIL DO ESTADO DIÁRIO -->
                <div style="border-top:1px dashed #cbd5e1; padding-top:10px;">
                    <div onclick="window.alternarSecaoRetratil('bloco-grafico-estado-diario', 'seta-grafico-estado-diario')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                        <span style="font-size:11px; font-weight:800; color:#0f172a;">📊 Ver / Ocultar Gráfico do Estado Diário</span>
                        <span id="seta-grafico-estado-diario" style="font-size:12px; color:#0f172a; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-grafico-estado-diario" class="oculto" style="margin-top:10px; background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:10.5px; font-weight:800; color:#0f172a;">Evolução Temporal (1 a 10):</span>
                            <div style="display:flex; gap:6px; font-size:9.5px; font-weight:700; flex-wrap:wrap;">
                                <span style="color:#0284c7;">● Humor</span>
                                <span style="color:#d97706;">● Serenidade</span>
                                <span style="color:#16a34a;">● Físico</span>
                                <span style="color:#7c3aed;">● Mental</span>
                            </div>
                        </div>
                        <div id="container-grafico-svg-estado-diario" style="width:100%; height:110px; display:flex; align-items:center; justify-content:center;"></div>
                        <div id="texto-insight-estado-diario" style="font-size:11px; color:#64748b; margin-top:8px; line-height:1.4;">
                            Mantenha o check-in diário para visualizar tendências de equilíbrio e energia.
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAINEL RETRÁTIL DE CONQUISTAS -->
            <div style="margin-bottom:8px;">
                <div onclick="window.alternarSecaoRetratil('bloco-conquistas-forja-conteudo', 'seta-conquistas-forja')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#b45309;">🎖️ Conquistas & Insígnias (<span id="contador-conquistas-forja">0/6</span>)</span>
                    <span id="seta-conquistas-forja" style="font-size:12px; color:#b45309; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-conquistas-forja-conteudo" class="oculto" style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:6px;"></div>
            </div>

            <!-- HISTÓRICO RETRÁTIL -->
            <div style="border-top:1px dashed #cbd5e1; padding-top:10px;">
                <div onclick="window.alternarSecaoRetratil('bloco-historico-forja-conteudo', 'seta-historico-forja')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#0f172a;">📜 Histórico de Desempenho (<span id="contador-historico-forja">0</span>)</span>
                    <span id="seta-historico-forja" style="font-size:12px; color:#0f172a; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-historico-forja-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 3. ARSENAL PRÁTICO (DOUTRINA FÍSICA & NUTRIÇÃO COM SORTEIO) -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #059669; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="assets/icons-modern/icone-forte.svg" alt="Arsenal" style="width:26px; height:26px; object-fit:contain;">
                    <strong style="font-size:14px; color:#0f172a; font-weight:900;">Arsenal de Calistenia</strong>
                </div>
                <button type="button" onclick="window.sortearNovoArsenalPratico()" style="background:none; border:none; color:#15803d; font-size:11px; font-weight:800; cursor:pointer;" title="Sortear nova dica">🔀 Sortear</button>
            </div>
            <div style="background:#f0fdf4; border:1px dashed #86efac; padding:12px; border-radius:12px;">
                <span style="font-size:10.5px; font-weight:800; color:#047857; text-transform:uppercase; margin-bottom:4px; display:block;">Doutrina Física & Nutrição • Sorteio Aleatório</span>
                <span class="rotulo-dia-arsenal">DICA DO DIA · ${new Date().toLocaleDateString('pt-BR')}</span><p id="texto-arsenal-pratico-conteudo" style="font-size:12.5px; color:#15803d; margin:0; line-height:1.45; font-weight:600;">${sabedoriaArsenal}</p>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 4. RADAR PESSOAL & VIDA A DOIS -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #e11d48; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/love.svg';" alt="Radar Íntimo" style="width:35px; height:35px; object-fit:contain;">
                    <strong style="font-size:14px; color:#0f172a; font-weight:900;">Radar Pessoal & Vida a Dois</strong>
                </div>
                <button type="button" class="btn-principal" style="padding:4px 10px; font-size:10px; border-radius:7px; width:auto; background:#ea580c; color:#fff; font-weight:800; border:none;" onclick="window.salvarRadarIntimoCompleto()">Salvar Momento</button>
            </div>

            <!-- Pílula de Dinâmica a Dois com Sorteio -->
            <div style="background:#fff1f2; border:1px dashed #fecdd3; padding:12px; border-radius:12px; margin-bottom:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:10px; font-weight:800; color:#be123c; text-transform:uppercase;">Convivência & Casal • Pílula Sorteada</span>
                    <button type="button" onclick="window.sortearNovaDinamicaADois()" style="background:none; border:none; color:#be123c; font-size:11px; font-weight:800; cursor:pointer;" title="Sortear outra dica">🔀 Sortear</button>
                </div>
                <p id="texto-dinamica-a-dois-conteudo" style="font-size:12.5px; color:#9f1239; margin:0; line-height:1.5; font-weight:600;">${pilulaSemanal}</p>
            </div>

            <!-- Data da Relação -->
            <div style="margin-bottom:14px;">
                <label style="font-size:11px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">Data da Relação Íntima:</label>
                <input type="date" id="slider-data-relacao" style="width:100%; box-sizing:border-box; padding:9px 12px; border-radius:10px; border:1px solid #cbd5e1; font-size:12px; background:#f8fafc; color:#0f172a; outline:none; font-weight:600;">
            </div>

            <!-- Disposição / Libido -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Disposição / Libido</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                    <button type="button" onclick="window.alternarSecaoRetratil('legenda-libido-radar')" 
                            style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                        <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                        <span style="font-size:11px; font-weight:700; color:#e11d48; text-decoration:underline;">Instrução</span>
                    </button>
                    <span id="badge-libido-valor" style="font-size:11.5px; font-weight:800; color:#be123c; text-align:right;">Normal</span>
                </div>
                <input type="range" id="range-libido" class="slider-xbox-animado slider-xbox-libido" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloSlider('libido')">
                <div id="legenda-libido-radar" class="oculto" style="margin-top:8px; background:#fff1f2; border-left:3px solid #e11d48; padding:8px 10px; border-radius:8px; font-size:11px; color:#9f1239; line-height:1.45;">
                    Deslize a barra para expressar como esteve seu ânimo sexual e desejo prévio: marque mais para a esquerda se a disposição esteve em baixa, ou mais para a direita se sentiu pleno apetite, magnetismo e vitalidade íntima.
                </div>
            </div>

            <!-- Performance & Satisfação Própria -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Performance & Satisfação Própria</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                    <button type="button" onclick="window.alternarSecaoRetratil('legenda-realizacao-radar')" 
                            style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                        <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                        <span style="font-size:11px; font-weight:700; color:#0284c7; text-decoration:underline;">Instrução</span>
                    </button>
                    <span id="badge-realizacao-valor" style="font-size:11.5px; font-weight:800; color:#0369a1; text-align:right;">Satisfeito</span>
                </div>
                <input type="range" id="range-realizacao" class="slider-xbox-animado slider-xbox-realizacao" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloSlider('realizacao')">
                <div id="legenda-realizacao-radar" class="oculto" style="margin-top:8px; background:#f0f9ff; border-left:3px solid #0284c7; padding:8px 10px; border-radius:8px; font-size:11px; color:#0369a1; line-height:1.45;">
                    Deslize a barra para expressar como você se sentiu com o seu corpo e o momento a dois: marque mais para a esquerda se sentiu cansaço ou frustração, ou mais para a direita se sentiu potência física, satisfação e plenitude pessoal.
                </div>
            </div>

            <!-- Satisfação da Parceira -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:14px; margin-bottom:12px;">
                <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">Satisfação da Parceira</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                    <button type="button" onclick="window.alternarSecaoRetratil('legenda-parceira-radar')" 
                            style="background:none; border:none; padding:2px 0; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                        <img src="assets/icons-modern/icone-manual.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-manual.svg';" alt="Manual" style="width:14px; height:14px; object-fit:contain;">
                        <span style="font-size:11px; font-weight:700; color:#d97706; text-decoration:underline;">Instrução</span>
                    </button>
                    <span id="badge-parceira-valor" style="font-size:11.5px; font-weight:800; color:#b45309; text-align:right;">Satisfeita</span>
                </div>
                <input type="range" id="range-parceira" class="slider-xbox-animado slider-xbox-parceira" min="1" max="10" value="5" step="0.01" oninput="window.atualizarRotuloSlider('parceira')">
                <div id="legenda-parceira-radar" class="oculto" style="margin-top:8px; background:#fffbeb; border-left:3px solid #d97706; padding:8px 10px; border-radius:8px; font-size:11px; color:#92400e; line-height:1.45;">
                    Deslize a barra para expressar a sua percepção sobre a entrega e o prazer dela: marque mais para a esquerda se sentiu desconexão ou insatisfação, ou mais para a direita se percebeu prazer intenso, cumplicidade e total realização mútua.
                </div>
            </div>

            <!-- GRÁFICO RETRÁTIL DO RADAR ÍNTIMO -->
            <div style="border-top:1px dashed #cbd5e1; padding-top:10px; margin-bottom:10px;">
                <div onclick="window.alternarSecaoRetratil('bloco-grafico-radar-intimo', 'seta-grafico-radar-intimo')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#0f172a;">📊 Ver / Ocultar Gráfico & Análise Comparativa</span>
                    <span id="seta-grafico-radar-intimo" style="font-size:12px; color:#0f172a; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-grafico-radar-intimo" class="oculto" style="margin-top:10px;">
                    <div id="painel-tendencias-radar" style="background:#fff1f2; border:1px solid #fecdd3; padding:12px; border-radius:14px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:11px; font-weight:800; color:#be123c; text-transform:uppercase;">📈 Comparativo de Semanas</span>
                            <span id="badge-status-semanal" style="font-size:10px; font-weight:800; background:#ffe4e6; color:#9f1239; padding:2px 6px; border-radius:6px;">Ativo</span>
                        </div>
                        <div id="bloco-comparativo-semanas" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;"></div>
                        <div id="texto-insight-tendencia" style="font-size:11.5px; color:#881337; line-height:1.45; font-weight:500; background:#ffffff; padding:8px 10px; border-radius:8px; border-left:3px solid #e11d48; border:1px solid #fecdd3;">
                            Aguardando registros para análise comparativa.
                        </div>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:11px; font-weight:800; color:#0f172a;">Curva dos Últimos Registros (1 a 10):</span>
                            <div style="display:flex; gap:8px; font-size:10px; font-weight:700;">
                                <span style="color:#e11d48;">● Libido</span>
                                <span style="color:#0284c7;">● Performance</span>
                                <span style="color:#d97706;">● Parceira</span>
                            </div>
                        </div>
                        <div id="container-grafico-svg-radar" style="width:100%; height:110px; display:flex; align-items:center; justify-content:center;"></div>
                    </div>
                </div>
            </div>

            <!-- Histórico Retrátil Confidencial -->
            <div style="border-top:1px dashed #cbd5e1; padding-top:10px;">
                <div onclick="window.alternarSecaoRetratil('bloco-historico-radar-conteudo', 'seta-historico-radar')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#0f172a; display:inline-flex; align-items:center; gap:6px;">
                        <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/love.svg';" alt="Love" style="width:15px; height:15px; object-fit:contain;">
                        Histórico Confidencial (<span id="contador-historico-radar">0</span>)
                    </span>
                    <span id="seta-historico-radar" style="font-size:12px; color:#0f172a; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-historico-radar-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                    <div id="lista-historico-radar-notas" style="display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 5. FILMES E SÉRIES (COM LOGOS E LINKS DIRETOS) -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #16a34a; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="assets/icons-modern/icone-filme.svg" alt="Filmes e Séries" style="width:24px; height:24px; object-fit:contain;">
                    <strong style="font-size:14px; color:#0f172a; font-weight:900;">Curadoria de Obras</strong>
                </div>

                <div style="display:flex; gap:4px; background:#f1f5f9; padding:3px; border-radius:10px; border:1px solid #e2e8f0;">
                    <button type="button" id="btn-aba-filmes" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:#16a34a; color:#fff;" onclick="window.alternarAbaMidia('filmes')">Filmes (${totalFilmesDisponiveis})</button>
                    <button type="button" id="btn-aba-series" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#64748b;" onclick="window.alternarAbaMidia('series')">Séries (${totalSeriesDisponiveis})</button>
                </div>
            </div>

            <!-- CARD DE DESTAQUE -->
            <div id="card-carrossel-midia" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
                <div id="midia-capa-container" style="width:100%; height:200px; position:relative; overflow:hidden; background:#f1f5f9;">
                    <img id="midia-poster-img" src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80" alt="Capa" style="width:100%; height:100%; object-fit:cover; object-position:center top; display:block;">
                    <div id="midia-overlay-gradiente" style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.85) 100%); pointer-events:none;"></div>
                    <div style="position:absolute; bottom:10px; left:12px; right:12px; z-index:2;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span id="midia-badge-categoria" style="font-size:10px; font-weight:800; background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Categoria</span>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span id="midia-rating-imdb" style="font-size:11px; font-weight:800; color:#d97706; background:#fffbeb; padding:2px 6px; border-radius:6px; border:1px solid #fde68a;">★ 8.5</span>
                                <span id="midia-ano-tempo" style="font-size:11px; font-weight:700; color:#ffffff;">-</span>
                            </div>
                        </div>
                        <h3 id="midia-titulo-destaque" style="margin:0; font-size:16px; color:#ffffff; font-weight:900; text-shadow:0 1px 4px rgba(0,0,0,0.8);">Título</h3>
                        <span id="midia-subtitulo-original" style="font-size:11px; color:#cbd5e1; font-weight:600; display:block; margin-top:2px;"></span>
                    </div>
                </div>

                <div style="padding:14px;">
                    <p id="midia-descricao-destaque" style="font-size:12px; color:#334155; margin:0 0 10px 0; line-height:1.5;">Carregando sinopse oficial em português...</p>

                    <!-- PAINEL ONDE ASSISTIR COM LOGOS E LINKS DIRETOS -->
                    <div id="midia-bloco-onde-assistir" style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 12px; border-radius:12px; margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:10.5px; font-weight:800; color:#15803d; text-transform:uppercase;">📺 Onde Assistir (Toque para Abrir):</span>
                            <a id="midia-link-justwatch" href="#" target="_blank" rel="noopener noreferrer" style="font-size:10px; font-weight:700; color:#0284c7; text-decoration:none;">Mais opções ↗</a>
                        </div>
                        <div id="midia-provedores-lista" style="display:flex; flex-wrap:wrap; gap:6px;">
                            <span style="font-size:11px; color:#64748b;">Consultando disponibilidade...</span>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                        <div id="midia-tags-generos" style="display:flex; gap:4px; flex-wrap:wrap;"></div>
                        <div id="midia-posicao-contador" style="font-size:10.5px; font-weight:800; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:6px; border:1px solid #e2e8f0;">1 / 200</div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:10px; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; gap:6px; align-items:center;">
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" onclick="window.navegarCarrosselMidia(-1)" title="Obra Anterior">◄</button>
                            <button type="button" class="btn-secundario" style="padding:0 10px; height:34px; border-radius:10px; font-size:11.5px; font-weight:800; background:#f0fdf4; color:#15803d; border:1.5px solid #86efac; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.sortearMidiaAleatoria()" title="Sortear obra">
                                <span>🔀</span>
                                <span>Aleatório</span>
                            </button>
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" onclick="window.navegarCarrosselMidia(1)" title="Próxima Obra">►</button>
                        </div>

                        <div style="display:flex; gap:6px; align-items:center;">
                            <button type="button" id="btn-quero-ver-masc" style="padding:7px 11px; font-size:11px; border-radius:10px; font-weight:800; background:#f8fafc; color:#0369a1; border:1px solid #bae6fd; cursor:pointer;" onclick="window.alternarQueroAssistirMasc()">
                                📌 Quero Assistir
                            </button>
                            <button type="button" id="btn-marcar-assistido-acao" style="padding:7px 12px; font-size:11.5px; border-radius:10px; font-weight:800; background:#16a34a; color:#fff; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.abrirModalAvaliacaoMidia()">
                                <img src="assets/icons-modern/icone-check.svg" alt="Assistido" style="width:16px; height:16px; object-fit:contain;"> Já Assisti
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Caixa de Avaliação -->
            <div id="caixa-avaliacao-midia" class="oculto" style="margin-top:10px; background:#fffbeb; border:1.5px solid #fcd34d; border-radius:12px; padding:12px; text-align:center;">
                <span style="font-size:12px; font-weight:800; color:#92400e; display:block; margin-bottom:6px;">Qual a sua avaliação para esta obra?</span>
                <div style="display:flex; justify-content:center; gap:8px; margin-bottom:8px;">
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(1)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(2)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(3)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(4)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(5)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                </div>
                <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:10.5px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1;" onclick="document.getElementById('caixa-avaliacao-midia').classList.add('oculto')">Cancelar</button>
            </div>

            <div style="margin-top:14px;">
                <div onclick="window.alternarSecaoRetratil('bloco-quero-ver-masc-conteudo', 'seta-quero-ver-masc')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#15803d;">📌 Quero Assistir (<span id="contador-quero-ver-masc">0</span>)</span>
                    <span id="seta-quero-ver-masc" style="font-size:12px; color:#15803d; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-quero-ver-masc-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>

            <div style="margin-top:8px;">
                <div onclick="window.alternarSecaoRetratil('bloco-assistidos-conteudo', 'seta-assistidos')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0;">
                    <span style="font-size:11.5px; font-weight:800; color:#0f172a;">⭐ Obras Avaliadas (<span id="contador-assistidos">0</span>) • Mais Bem Avaliados no Topo</span>
                    <span id="seta-assistidos" style="font-size:12px; color:#0f172a; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-assistidos-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 6. TRINCHEIRA SONORA & DIGITAL -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #059669; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span style="font-size:20px;">🎧</span>
                <strong style="font-size:14px; color:#0f172a; font-weight:900;">Trincheira Sonora & Digital</strong>
            </div>

            <span style="font-size:11px; font-weight:800; color:#059669; text-transform:uppercase; display:block; margin-bottom:8px;">🎵 Playlists Recomendadas (Spotify)</span>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
                ${(window.CatalogoPlaylistsSpotify || []).map(p => `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #16a34a; box-shadow:0 2px 8px rgba(0,0,0,0.03); border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="min-width:0;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:14px;">${p.icone}</span>
                                <strong style="font-size:12.5px; color:#0f172a;">${esc(p.titulo)}</strong>
                                <span style="font-size:9.5px; font-weight:800; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:6px;">${p.tag}</span>
                            </div>
                            <span style="font-size:11px; color:#64748b; display:block; margin-top:2px;">${p.subtitulo}</span>
                        </div>
                        <a href="${p.link}" target="_blank" rel="noopener noreferrer" style="background:#16a34a; color:#ffffff; text-decoration:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:800; flex-shrink:0;">
                            Ouvir ↗
                        </a>
                    </div>
                `).join('')}
            </div>

            <span style="font-size:11px; font-weight:800; color:#dc2626; text-transform:uppercase; display:block; margin-bottom:8px;">📺 Canais de Formação & Prática (YouTube)</span>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${(window.CatalogoCanaisYoutube || []).map(c => `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #16a34a; box-shadow:0 2px 8px rgba(0,0,0,0.03); border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="min-width:0;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:14px;">${c.icone}</span>
                                <strong style="font-size:12.5px; color:#0f172a;">${esc(c.titulo)}</strong>
                            </div>
                            <span style="font-size:10.5px; font-weight:700; color:#dc2626; display:block; margin-top:2px;">${c.categoria}</span>
                            <span style="font-size:11px; color:#64748b; display:block; margin-top:1px;">${c.desc}</span>
                        </div>
                        <a href="${c.link}" target="_blank" rel="noopener noreferrer" style="background:#dc2626; color:#ffffff; text-decoration:none; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:800; flex-shrink:0;">
                            Acessar ↗
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- ============================================================= -->
        <!-- 7. OFICINA & GARAGEM (MANUTENÇÕES) -->
        <!-- ============================================================= -->
        <div class="cartao-geral" style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #475569; box-shadow:0 4px 18px rgba(15,23,42,0.05); margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <img src="assets/icons-modern/icone-oficina.svg" alt="Oficina" style="width:24px; height:24px; object-fit:contain;">
                <strong style="font-size:14px; color:#0f172a; font-weight:900;">Oficina & Garagem (Manutenções)</strong>
            </div>
            <p style="font-size:11.5px; color:#64748b; margin:0 0 10px 0;">Registo de revisões do veículo, filtros, ferramentas e manutenções do lar.</p>
            <div style="display:flex; gap:6px; margin-bottom:10px;">
                <input type="text" id="input-nova-manutencao" placeholder="Ex: Óleo do carro, filtro da torneira..." style="flex:1; padding:9px 12px; font-size:12px; border-radius:10px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; outline:none;">
                <button type="button" style="padding:9px 16px; font-weight:800; border-radius:10px; background:#475569; color:#fff; border:none; cursor:pointer;" onclick="window.adicionarManutencao()">+</button>
            </div>
            <div id="lista-manutencao-garagem" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
    `;
};

// Funções para sorteio dinâmico das dicas
window.sortearNovaDinamicaADois = function() {
    const lista = window.AcervoDinamicaADois || [];
    const el = document.getElementById('texto-dinamica-a-dois-conteudo');
    if (!el || lista.length === 0) return;
    const sorteado = lista[Math.floor(Math.random() * lista.length)];
    el.textContent = sorteado;
    if (typeof window.mostrarToast === 'function') window.mostrarToast("Nova dinâmica a dois sorteada! 🎲", "info");
};

window.sortearNovoArsenalPratico = function() {
    const lista = window.AcervoArsenalPratico || [];
    const el = document.getElementById('texto-arsenal-pratico-conteudo');
    if (!el || lista.length === 0) return;
    const sorteado = lista[Math.floor(Math.random() * lista.length)];
    el.textContent = sorteado;
    if (typeof window.mostrarToast === 'function') window.mostrarToast("Novo arsenal prático sorteado! 💪", "info");
};

// =========================================================================
// 4.1. MOTOR DE ROTAÇÃO E FAVORITOS DA REFLEXÃO ESTOICA
// =========================================================================

window.renderizarReflexaoEstoica = function(aleatorio = false) {
    const elTexto = document.getElementById('texto-reflexao-estoica-conteudo');
    const elAutor = document.getElementById('autor-reflexao-estoica-conteudo');
    const elTitulo = document.getElementById('label-titulo-reflexao-estoica');
    if (!elTexto || !elAutor) return;

    const lista = window.AcervoReflexoesEstoicas365 || [];
    if (lista.length === 0) {
        elTexto.textContent = "Carregando acervo de princípios estoicos...";
        elAutor.textContent = "— Filosofia";
        return;
    }

    let item;
    if (aleatorio) {
        const sorteado = Math.floor(Math.random() * lista.length);
        item = lista[sorteado];
        if (elTitulo) elTitulo.textContent = `🏛️ Reflexão Sorteada (${item.data || 'Aleatória'})`;
    } else {
        item = window.obterReflexaoEstoicaDoDia?.() || lista[0];

        if (elTitulo) elTitulo.textContent = `🏛️ Reflexão do Dia · ${lista.length} no acervo`;
    }

    if (item) {
        window.reflexaoEstoicaExibidaAtual = item;
        elTexto.textContent = `"${item.texto}"`;
        elAutor.textContent = `— ${item.autor}`;
        window.atualizarBotaoFavoritoEstado();
    }
};

window.atualizarBotaoFavoritoEstado = function() {
    const btn = document.getElementById('btn-favoritar-estoica');
    if (!btn || !window.reflexaoEstoicaExibidaAtual) return;

    const ehFavorita = window.dadosReflexoesFavoritas.some(f => 
        f.texto === window.reflexaoEstoicaExibidaAtual.texto && f.autor === window.reflexaoEstoicaExibidaAtual.autor
    );

    if (ehFavorita) {
        btn.innerHTML = "❤️ Favoritada";
        btn.style.background = "#fef3c7";
        btn.style.borderColor = "#f59e0b";
        btn.style.color = "#92400e";
    } else {
        btn.innerHTML = "🤍 Favoritar";
        btn.style.background = "#fffbeb";
        btn.style.borderColor = "#d97706";
        btn.style.color = "#b45309";
    }
};

window.alternarFavoritoReflexaoAtual = function() {
    if (!window.reflexaoEstoicaExibidaAtual) return;

    const chave = window.obterChaveStorageMasc('estoicas_favoritas');
    const item = window.reflexaoEstoicaExibidaAtual;

    const idx = window.dadosReflexoesFavoritas.findIndex(f => 
        f.texto === item.texto && f.autor === item.autor
    );

    if (idx >= 0) {
        window.dadosReflexoesFavoritas.splice(idx, 1);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Mensagem removida dos favoritos.", "info");
        }
    } else {
        window.dadosReflexoesFavoritas.unshift({
            id: 'fav_' + Date.now(),
            data: item.data || 'Reflexão',
            autor: item.autor,
            texto: item.texto,
            salvo_em: new Date().toISOString()
        });
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Mensagem adicionada aos favoritos! ⭐", "sucesso");
        }
    }

    localStorage.setItem(chave, JSON.stringify(window.dadosReflexoesFavoritas));
    window.atualizarBotaoFavoritoEstado();
    window.renderizarListaFavoritasEstoicas();
};

window.renderizarListaFavoritasEstoicas = function() {
    const cont = document.getElementById('bloco-favoritas-conteudo');
    const elContador = document.getElementById('contador-favoritas-estoicas');
    if (!cont) return;

    if (elContador) elContador.textContent = window.dadosReflexoesFavoritas.length;

    if (window.dadosReflexoesFavoritas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:8px;">Nenhuma reflexão favoritada ainda.</span>';
        return;
    }

    cont.innerHTML = window.dadosReflexoesFavoritas.map(item => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:3.5px solid #0284c7; padding:8px 10px; border-radius:10px; display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div style="min-width:0; flex:1;">
                <span style="font-size:10px; font-weight:800; color:#15803d; text-transform:uppercase; display:block;">${item.data || 'Reflexão'} • ${item.autor}</span>
                <p style="font-size:11.5px; color:#1e293b; margin:2px 0 0 0; line-height:1.4; font-weight:500;">"${esc(item.texto)}"</p>
            </div>
            <button type="button" onclick="window.removerFavoritoEstoico('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:2px 4px; flex-shrink:0; display:flex; align-items:center;" title="Remover dos favoritos">
                <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
            </button>
        </div>
    `).join('');
};

window.removerFavoritoEstoico = function(id) {
    const chave = window.obterChaveStorageMasc('estoicas_favoritas');
    window.dadosReflexoesFavoritas = window.dadosReflexoesFavoritas.filter(f => f.id !== id);
    localStorage.setItem(chave, JSON.stringify(window.dadosReflexoesFavoritas));
    window.atualizarBotaoFavoritoEstado();
    window.renderizarListaFavoritasEstoicas();
};

// =========================================================================
// 5. A FORJA: GAMIFICAÇÃO, NÍVEIS, CONQUISTAS E METAS
// =========================================================================

window.niveisGuerreiroForja = [
    { nivel: 1, nome: "Iniciado do Fogo", minXP: 0, maxXP: 300 },
    { nivel: 2, nome: "Forjador de Ferro", minXP: 300, maxXP: 700 },
    { nivel: 3, nome: "Guerreiro de Bronze", minXP: 700, maxXP: 1400 },
    { nivel: 4, nome: "Guardião de Aço", minXP: 1400, maxXP: 2500 },
    { nivel: 5, nome: "Mestre da Bigorna", minXP: 2500, maxXP: 4000 },
    { nivel: 6, nome: "Titã Forjado no Aço", minXP: 4000, maxXP: 99999 }
];

window.calcularNivelEConquistasForja = function() {
    let totalMissoesCumpridas = 0;
    let totalDiasPerfeitos = 0;
    let xpTotal = 0;

    const datas = Object.keys(window.dadosForjaDiaria);
    datas.forEach(dt => {
        const reg = window.dadosForjaDiaria[dt];
        const qtd = Object.keys(reg.itens || {}).length;
        totalMissoesCumpridas += qtd;
        xpTotal += (qtd * 10);
        if (qtd === 6) {
            totalDiasPerfeitos++;
            xpTotal += 40;
        }
    });

    let nivelAtual = window.niveisGuerreiroForja[0];
    for (let n of window.niveisGuerreiroForja) {
        if (xpTotal >= n.minXP) {
            nivelAtual = n;
        }
    }

    const conquistasDef = [
        { id: "c1", titulo: "Primeira Brasa", desc: "Completou a 1ª missão na Forja", desbloqueada: totalMissoesCumpridas >= 1 },
        { id: "c2", titulo: "Trinca de Ferro", desc: "3 dias seguidos de ofensiva", desbloqueada: window.obterStreakAtual() >= 3 },
        { id: "c3", titulo: "Aço Puro", desc: "Completou 100% (6/6) em 1 dia", desbloqueada: totalDiasPerfeitos >= 1 },
        { id: "c4", titulo: "Semana Blindada", desc: "7 dias seguidos de ofensiva", desbloqueada: window.obterStreakAtual() >= 7 },
        { id: "c5", titulo: "Muralha de Esparta", desc: "14 dias seguidos na batalha", desbloqueada: window.obterStreakAtual() >= 14 },
        { id: "c6", titulo: "Constância de Titã", desc: "Alcançou 30 missões concluídas", desbloqueada: totalMissoesCumpridas >= 30 }
    ];

    return {
        totalMissoes: totalMissoesCumpridas,
        diasPerfeitos: totalDiasPerfeitos,
        xp: xpTotal,
        nivel: nivelAtual,
        conquistas: conquistasDef
    };
};

window.obterStreakAtual = function() {
    let ofensiva = 0;
    const datas = Object.keys(window.dadosForjaDiaria).sort().reverse();
    for (let dtStr of datas) {
        const reg = window.dadosForjaDiaria[dtStr];
        const qtd = Object.keys(reg.itens || {}).length;
        if (qtd > 0) {
            ofensiva++;
        } else {
            break;
        }
    }
    return ofensiva;
};

window.renderizarPainelEvolucaoForja = function() {
    const dadosEvol = window.calcularNivelEConquistasForja();

    const elNivel = document.getElementById('lbl-nome-nivel-forja');
    const elXP = document.getElementById('lbl-xp-acumulado');
    const elBarraXP = document.getElementById('barra-progresso-xp-forja');
    const elProx = document.getElementById('lbl-info-proximo-nivel');

    if (elNivel) elNivel.textContent = `Nível ${dadosEvol.nivel.nivel}: ${dadosEvol.nivel.nome}`;
    if (elXP) elXP.textContent = `${dadosEvol.xp} XP`;

    const spanNivel = dadosEvol.nivel.maxXP - dadosEvol.nivel.minXP;
    const progressoNoNivel = dadosEvol.xp - dadosEvol.nivel.minXP;
    const pctNivel = Math.min(100, Math.round((progressoNoNivel / spanNivel) * 100));

    if (elBarraXP) elBarraXP.style.width = `${pctNivel}%`;
    if (elProx) {
        if (dadosEvol.nivel.nivel === 6) {
            elProx.textContent = "Patamar Máximo Alcançado! Honra Eterna.";
        } else {
            elProx.textContent = `Faltam ${dadosEvol.nivel.maxXP - dadosEvol.xp} XP para o próximo nível (${pctNivel}%)`;
        }
    }

    const agora = new Date();
    let missoesSemana = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(agora.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const reg = window.dadosForjaDiaria[dStr];
        if (reg) missoesSemana += Object.keys(reg.itens || {}).length;
    }
    const metaSemanaAlvo = 25;
    const pctSemana = Math.min(100, Math.round((missoesSemana / metaSemanaAlvo) * 100));

    const elMetaStatus = document.getElementById('lbl-meta-semanal-status');
    const elMetaPct = document.getElementById('lbl-meta-semanal-pct');
    const elBarraSemana = document.getElementById('barra-meta-semanal');

    if (elMetaStatus) elMetaStatus.textContent = `${missoesSemana} / ${metaSemanaAlvo}`;
    if (elMetaPct) elMetaPct.textContent = `${pctSemana}%`;
    if (elBarraSemana) elBarraSemana.style.width = `${pctSemana}%`;

    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    let missoesMes = 0;
    let diasPerfeitosMes = 0;

    Object.keys(window.dadosForjaDiaria).forEach(dtStr => {
        const [ano, mes] = dtStr.split('-').map(Number);
        if (ano === anoAtual && (mes - 1) === mesAtual) {
            const reg = window.dadosForjaDiaria[dtStr];
            const qtd = Object.keys(reg.itens || {}).length;
            if (qtd > 0) {
                missoesMes += qtd;
                if (qtd === 6) diasPerfeitosMes++;
            }
        }
    });

    const diasDecorridosMes = agora.getDate();
    const totalPossivelMes = diasDecorridosMes * 6;
    const taxaMes = totalPossivelMes > 0 ? Math.round((missoesMes / totalPossivelMes) * 100) : 0;

    const elStatsMissoes = document.getElementById('lbl-stats-concluidas-mes');
    const elStatsDiasPerfeitos = document.getElementById('lbl-stats-dias-perfeitos-mes');
    const elStatsTaxa = document.getElementById('lbl-stats-taxa-mes');

    if (elStatsMissoes) elStatsMissoes.textContent = missoesMes;
    if (elStatsDiasPerfeitos) elStatsDiasPerfeitos.textContent = `${diasPerfeitosMes} dias 100%`;
    if (elStatsTaxa) elStatsTaxa.textContent = `Taxa: ${taxaMes}% de consistência`;

    const contConquistas = document.getElementById('bloco-conquistas-forja-conteudo');
    const elContadorConquistas = document.getElementById('contador-conquistas-forja');
    if (contConquistas) {
        const desbloqueadas = dadosEvol.conquistas.filter(c => c.desbloqueada).length;
        if (elContadorConquistas) elContadorConquistas.textContent = `${desbloqueadas}/${dadosEvol.conquistas.length}`;

        contConquistas.innerHTML = dadosEvol.conquistas.map(c => `
            <div style="background:${c.desbloqueada ? '#fef3c7' : '#f8fafc'}; border:1px solid ${c.desbloqueada ? '#f59e0b' : '#e2e8f0'}; padding:8px 10px; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:14px;">${c.desbloqueada ? '🏆' : '🔒'}</span>
                    <strong style="font-size:11.5px; color:${c.desbloqueada ? '#b45309' : '#64748b'};">${esc(c.titulo)}</strong>
                </div>
                <span style="font-size:10px; color:${c.desbloqueada ? '#92400e' : '#64748b'}; display:block; margin-top:2px;">${c.desc}</span>
            </div>
        `).join('');
    }
};

window.alternarEdicaoConfigForja = function() {
    const form = document.getElementById('form-edicao-missoes-forja');
    if (!form) return;
    const estaOculto = form.classList.contains('oculto');
    if (estaOculto) {
        window.renderizarCamposEdicaoForja();
        form.classList.remove('oculto');
    } else {
        form.classList.add('oculto');
    }
};

window.renderizarCamposEdicaoForja = function() {
    const cont = document.getElementById('container-inputs-edicao-forja');
    if (!cont) return;
    cont.innerHTML = window.configMissoesForja.map((m, idx) => `
        <div>
            <label style="font-size:10.5px; font-weight:700; color:#64748b;">Missão ${idx + 1}:</label>
            <input type="text" id="input-cfg-forja-${m.id}" value="${m.rotulo}" style="width:100%; box-sizing:border-box; padding:6px 8px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:11.5px; outline:none;">
        </div>
    `).join('');
};

window.salvarConfiguracaoMissoesForja = function() {
    window.configMissoesForja = window.configMissoesForja.map(m => {
        const inp = document.getElementById(`input-cfg-forja-${m.id}`);
        return {
            id: m.id,
            rotulo: (inp && inp.value.trim()) ? inp.value.trim() : m.rotulo
        };
    });

    localStorage.setItem(window.obterChaveStorageMasc('config_missoes'), JSON.stringify(window.configMissoesForja));
    document.getElementById('form-edicao-missoes-forja')?.classList.add('oculto');
    window.renderizarBotoesForja();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Metas da Forja atualizadas!", "sucesso");
    }
};

window.obterGrauHonraForja = function(qtdCumprida) {
    if (qtdCumprida === 6) return { titulo: "🔥 Forjado no Aço (Ápice Absoluto)", cor: "#ea580c" };
    if (qtdCumprida === 5) return { titulo: "Vanguarda (Quase Imbatível)", cor: "#f97316" };
    if (qtdCumprida >= 3) return { titulo: "Guerreiro Firme (Ritmo de Batalha)", cor: "#d97706" };
    if (qtdCumprida >= 1) return { titulo: "Iniciado (Faísca Acesa)", cor: "#0284c7" };
    return { titulo: "Inerte (Desperte o Guerreiro)", cor: "#64748b" };
};

window.renderizarBotoesForja = function() {
    const grid = document.getElementById('grid-botoes-missoes-forja');
    if (!grid) return;

    const hojeStr = Suiri.today();
    const registroHoje = window.dadosForjaDiaria[hojeStr] || { itens: {} };

    grid.innerHTML = window.configMissoesForja.map(m => {
        const cumprido = !!registroHoje.itens[m.id];
        return `
            <label style="display:flex; align-items:center; justify-content:space-between; background:${cumprido ? '#f0fdf4' : '#f8fafc'}; padding:8px 10px; border-radius:10px; border:1.5px solid ${cumprido ? '#16a34a' : '#e2e8f0'}; cursor:pointer; transition:all 0.2s ease; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                <span style="font-size:11.5px; font-weight:800; color:${cumprido ? '#15803d' : '#1e293b'};">${m.rotulo}</span>
                <input type="checkbox" onchange="window.alternarItemForjaHoje('${m.id}', this.checked)" ${cumprido ? 'checked' : ''} style="width:16px; height:16px; accent-color:#16a34a;">
            </label>
        `;
    }).join('');

    window.atualizarProgressoForjaHoje();
};

window.alternarItemForjaHoje = function(idMissao, marcado) {
    const hojeStr = Suiri.today();
    if (!window.dadosForjaDiaria[hojeStr]) {
        window.dadosForjaDiaria[hojeStr] = { data: hojeStr, itens: {} };
    }

    if (marcado) {
        window.dadosForjaDiaria[hojeStr].itens[idMissao] = true;
    } else {
        delete window.dadosForjaDiaria[hojeStr].itens[idMissao];
    }

    const qtdCumprida = Object.keys(window.dadosForjaDiaria[hojeStr].itens).length;
    const porcentagem = Math.round((qtdCumprida / 6) * 100);
    const honra = window.obterGrauHonraForja(qtdCumprida);

    window.dadosForjaDiaria[hojeStr].qtd = qtdCumprida;
    window.dadosForjaDiaria[hojeStr].porcentagem = porcentagem;
    window.dadosForjaDiaria[hojeStr].grau = honra.titulo;

    localStorage.setItem(window.obterChaveStorageMasc('forja_diaria'), JSON.stringify(window.dadosForjaDiaria));
    
    window.atualizarProgressoForjaHoje();
    window.calcularOfensivaForja();
    window.renderizarPainelEvolucaoForja();
    window.renderizarHistoricoForja();
    window.renderizarBotoesForja();
};

window.atualizarProgressoForjaHoje = function() {
    const hojeStr = Suiri.today();
    const registroHoje = window.dadosForjaDiaria[hojeStr] || { itens: {} };
    const qtd = Object.keys(registroHoje.itens || {}).length;
    const pct = Math.round((qtd / 6) * 100);
    const honra = window.obterGrauHonraForja(qtd);

    const elGrau = document.getElementById('lbl-grau-forja-hoje');
    const elPct = document.getElementById('lbl-porcentagem-forja-hoje');
    const elFill = document.getElementById('barra-forja-fill-hoje');

    if (elGrau) { elGrau.textContent = honra.titulo; elGrau.style.color = honra.cor; }
    if (elPct) { elPct.textContent = `${pct}% (${qtd}/6)`; }
    if (elFill) { elFill.style.width = `${pct}%`; }
};

window.calcularOfensivaForja = function() {
    const ofensiva = window.obterStreakAtual();
    const elStreak = document.getElementById('streak-forja');
    if (elStreak) {
        elStreak.innerHTML = `<img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> ${ofensiva} dias seguidos`;
    }
};

window.renderizarHistoricoForja = function() {
    const cont = document.getElementById('bloco-historico-forja-conteudo');
    const elContador = document.getElementById('contador-historico-forja');
    if (!cont) return;

    const datas = Object.keys(window.dadosForjaDiaria).sort().reverse();
    if (elContador) elContador.textContent = datas.length;

    if (datas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:8px;">Nenhum registro diário da Forja ainda.</span>';
        return;
    }

    cont.innerHTML = datas.slice(0, 15).map(dtStr => {
        const reg = window.dadosForjaDiaria[dtStr];
        const qtd = Object.keys(reg.itens || {}).length;
        const pct = reg.porcentagem || Math.round((qtd / 6) * 100);
        const grau = reg.grau || window.obterGrauHonraForja(qtd).titulo;

        const nomesItens = Object.keys(reg.itens || {}).map(id => {
            const m = (window.configMissoesForja || []).find(cfg => cfg.id === id);
            return m ? m.rotulo : id;
        });

        return `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px 12px; border-radius:12px; border-left:4px solid #ea580c;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:10.5px; font-weight:800; color:#64748b;">${dtStr}</span>
                    <strong style="font-size:11px; color:#ea580c;">${pct}% (${qtd}/6)</strong>
                </div>
                <div style="font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:6px;">${grau}</div>
                
                <div style="background:#e2e8f0; border-radius:6px; height:6px; width:100%; overflow:hidden; margin-bottom:8px;">
                    <div style="background:linear-gradient(90deg, #f97316, #ef4444); height:100%; width:${pct}%;"></div>
                </div>

                <div style="flex-wrap:wrap; gap:4px; display:flex;">
                    ${nomesItens.length > 0 ? nomesItens.map(n => `
                        <span style="font-size:9.5px; font-weight:700; background:#f0fdf4; color:#15803d; padding:2px 6px; border-radius:6px; border:1px solid #bbf7d0; display:inline-flex; align-items:center; gap:3px;">
                            <img src="assets/icons-modern/icone-check.svg" alt="Feito" style="width:12px; height:12px; object-fit:contain;"> ${n}
                        </span>
                    `).join('') : '<span style="font-size:10px; color:#64748b;">Nenhum item cumprido</span>'}
                </div>
            </div>
        `;
    }).join('');
};

// =========================================================================
// 5.1. ESTADO DIÁRIO (CORPO & MENTE): 4 PILARES & GRÁFICO
// =========================================================================

window.obterDescricaoNotaEstadoDiario = function(tipo, valor) {
    const v = Math.round(Number(valor));
    if (tipo === 'humor') {
        if (v <= 2) return "Irritado / Desanimado";
        if (v <= 4) return "Mal-humorado";
        if (v <= 6) return "Neutro / Equilibrado";
        if (v <= 8) return "Bem-humorado";
        return "Radiante / Inabalável";
    } else if (tipo === 'estresse') {
        if (v <= 2) return "Sobrecarga / Tensão";
        if (v <= 4) return "Pressionado";
        if (v <= 6) return "Moderado";
        if (v <= 8) return "Tranquilo";
        return "Sereno / Calmo";
    } else if (tipo === 'fisico') {
        if (v <= 2) return "Esgotado";
        if (v <= 4) return "Cansado";
        if (v <= 6) return "Normal";
        if (v <= 8) return "Ativo / Forte";
        return "Vigor Máximo";
    } else if (tipo === 'mental') {
        if (v <= 2) return "Disperso / Confuso";
        if (v <= 4) return "Desfocado";
        if (v <= 6) return "Concentrado";
        if (v <= 8) return "Boa Clareza";
        return "Foco Blindado";
    }
    return "Equilibrado";
};

window.atualizarRotuloEstadoDiario = function(tipo) {
    const elRange = document.getElementById(`range-${tipo}-diario`);
    const elBadge = document.getElementById(`badge-${tipo}-diario-val`);
    if (elRange && elBadge) {
        elBadge.textContent = window.obterDescricaoNotaEstadoDiario(tipo, elRange.value);
    }
};

window.salvarEstadoDiarioCompleto = async function() {
    const vHumor = Math.round(Number(document.getElementById('range-humor-diario')?.value || '5'));
    const vEstresse = Math.round(Number(document.getElementById('range-estresse-diario')?.value || '5'));
    const vFisico = Math.round(Number(document.getElementById('range-fisico-diario')?.value || '5'));
    const vMental = Math.round(Number(document.getElementById('range-mental-diario')?.value || '5'));
    const hojeStr = Suiri.today();

    const novoRegistro = {
        id: 'est_' + Date.now(),
        data: hojeStr,
        humor: vHumor,
        estresse: vEstresse,
        fisico: vFisico,
        mental: vMental,
        textoHumor: window.obterDescricaoNotaEstadoDiario('humor', vHumor),
        textoEstresse: window.obterDescricaoNotaEstadoDiario('estresse', vEstresse),
        textoFisico: window.obterDescricaoNotaEstadoDiario('fisico', vFisico),
        textoMental: window.obterDescricaoNotaEstadoDiario('mental', vMental)
    };

    window.dadosEstadoDiario.humor = vHumor;
    window.dadosEstadoDiario.estresse = vEstresse;
    window.dadosEstadoDiario.fisico = vFisico;
    window.dadosEstadoDiario.mental = vMental;

    if (!Array.isArray(window.dadosEstadoDiario.historico)) {
        window.dadosEstadoDiario.historico = [];
    }

    const idxHoje = window.dadosEstadoDiario.historico.findIndex(r => r.data === hojeStr);
    if (idxHoje >= 0) {
        window.dadosEstadoDiario.historico[idxHoje] = novoRegistro;
    } else {
        window.dadosEstadoDiario.historico.unshift(novoRegistro);
    }

    if (window.dadosEstadoDiario.historico.length > 30) {
        window.dadosEstadoDiario.historico = window.dadosEstadoDiario.historico.slice(0, 30);
    }

    localStorage.setItem(window.obterChaveStorageMasc('estado_diario'), JSON.stringify(window.dadosEstadoDiario));
    window.renderizarGraficoETendenciasEstadoDiario();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Estado diário salvo com sucesso!", "sucesso");
    }
};

window.renderizarGraficoETendenciasEstadoDiario = function() {
    const hist = window.dadosEstadoDiario.historico || [];
    const contGraf = document.getElementById('container-grafico-svg-estado-diario');
    const elInsight = document.getElementById('texto-insight-estado-diario');

    if (!contGraf) return;

    if (hist.length < 2) {
        contGraf.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center;">Registre pelo menos 2 check-ins para gerar as curvas do seu Estado Diário.</span>';
        if (elInsight) elInsight.textContent = "Faça seu check-in diário para acompanhar a consistência do seu humor, serenidade, vigor físico e foco mental.";
        return;
    }

    const pontos = [...hist.slice(0, 7)].reverse();
    const w = 320;
    const h = 90;
    const pad = 16;
    const dx = (w - (pad * 2)) / Math.max(1, pontos.length - 1);

    const calcY = (val) => h - pad - (((val - 1) / 9) * (h - (pad * 2)));

    const ptsHumor = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.humor || 5)}`).join(' ');
    const ptsEstresse = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.estresse || 5)}`).join(' ');
    const ptsFisico = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.fisico || 5)}`).join(' ');
    const ptsMental = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.mental || 5)}`).join(' ');

    contGraf.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
            <line x1="${pad}" y1="${calcY(5)}" x2="${w - pad}" y2="${calcY(5)}" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1" />
            <polyline fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${ptsHumor}" />
            <polyline fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${ptsEstresse}" />
            <polyline fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${ptsFisico}" />
            <polyline fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${ptsMental}" />
            ${pontos.map((p, idx) => `
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.humor || 5)}" r="2.5" fill="#0284c7" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.estresse || 5)}" r="2.5" fill="#d97706" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.fisico || 5)}" r="2.5" fill="#16a34a" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.mental || 5)}" r="2.5" fill="#7c3aed" />
            `).join('')}
        </svg>
    `;

    const calcMedia = (arr, campo) => arr.length ? (arr.reduce((acc, cur) => acc + (cur[campo] || 5), 0) / arr.length).toFixed(1) : '5.0';
    const medH = calcMedia(pontos, 'humor');
    const medE = calcMedia(pontos, 'estresse');
    const medF = calcMedia(pontos, 'fisico');
    const medM = calcMedia(pontos, 'mental');

    if (elInsight) {
        if (parseFloat(medE) <= 4.0) {
            elInsight.innerHTML = `⚠️ <strong>Alerta de Tensão:</strong> Sua serenidade média está baixa (${medE}/10). Proteja momentos de silêncio e descompressão após o expediente.`;
        } else if (parseFloat(medF) >= 7.5 && parseFloat(medM) >= 7.5) {
            elInsight.innerHTML = `🔥 <strong>Pico de Rendimento:</strong> Seu vigor físico (${medF}/10) e foco mental (${medM}/10) estão no ápice. Momento propício para desafios de grande porte.`;
        } else {
            elInsight.innerHTML = `🎯 <strong>Estabilidade:</strong> Médias da semana: Humor ${medH} | Serenidade ${medE} | Físico ${medF} | Mental ${medM}. Mantenha a constância na Forja.`;
        }
    }
};

// =========================================================================
// 6. RADAR PESSOAL & VIDA A DOIS
// =========================================================================

window.obterDescricaoNotaSlider = function(tipo, valor) {
    const v = Math.round(Number(valor));
    if (tipo === 'libido') {
        if (v <= 2) return "Baixa / Desanimado";
        if (v <= 4) return "Disposição Baixa";
        if (v <= 6) return "Normal";
        if (v <= 8) return "Alta / Disposto";
        return "Desejo Máximo";
    } else if (tipo === 'realizacao') {
        if (v <= 2) return "Frustrado";
        if (v <= 4) return "Insatisfeito";
        if (v <= 6) return "Satisfeito";
        if (v <= 8) return "Muito Gratificante";
        return "Pleno & Revigorado";
    } else if (tipo === 'parceira') {
        if (v <= 2) return "Distante / Insatisfeita";
        if (v <= 4) return "Pouco Conectada";
        if (v <= 6) return "Satisfeita";
        if (v <= 8) return "Radiante";
        return "Totalmente Realizada";
    }
    return "Satisfeito";
};

window.atualizarRotuloSlider = function(tipo) {
    const elRange = document.getElementById(`range-${tipo}`);
    const elBadge = document.getElementById(`badge-${tipo}-valor`);
    if (elRange && elBadge) {
        elBadge.textContent = window.obterDescricaoNotaSlider(tipo, elRange.value);
    }
};

window.salvarRadarIntimoCompleto = async function() {
    const dtRelacao = document.getElementById('slider-data-relacao')?.value || null;
    const vLibido = Math.round(Number(document.getElementById('range-libido')?.value || '5'));
    const vRealizacao = Math.round(Number(document.getElementById('range-realizacao')?.value || '5'));
    const vParceira = Math.round(Number(document.getElementById('range-parceira')?.value || '5'));
    const hojeStr = Suiri.today();

    const novoRegistro = {
        id: 'rad_' + Date.now(),
        data: hojeStr,
        ultima_relacao: dtRelacao,
        libido: vLibido,
        realizacao: vRealizacao,
        parceira: vParceira,
        textoLibido: window.obterDescricaoNotaSlider('libido', vLibido),
        textoRealizacao: window.obterDescricaoNotaSlider('realizacao', vRealizacao),
        textoParceira: window.obterDescricaoNotaSlider('parceira', vParceira)
    };

    window.dadosRadarIntimo.ultima_relacao = dtRelacao;
    window.dadosRadarIntimo.libido = vLibido;
    window.dadosRadarIntimo.realizacao = vRealizacao;
    window.dadosRadarIntimo.parceira = vParceira;

    if (!Array.isArray(window.dadosRadarIntimo.historico)) {
        window.dadosRadarIntimo.historico = [];
    }
    
    window.dadosRadarIntimo.historico.unshift(novoRegistro);
    if (window.dadosRadarIntimo.historico.length > 30) {
        window.dadosRadarIntimo.historico = window.dadosRadarIntimo.historico.slice(0, 30);
    }

    localStorage.setItem(window.obterChaveStorageMasc('radar_intimo'), JSON.stringify(window.dadosRadarIntimo));
    
    window.renderizarGraficoETendenciasRadar();
    window.renderizarHistoricoRadarIntimo();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Momento registrado com sucesso! ⭐", "sucesso");
    }

    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    const meuId = window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || null);
    if (cli && meuId) {
        try {
            await cli.from('espaco_masc_radar').upsert({
                membro_id: meuId,
                familia_id: window.familiaAtualId || null,
                ultima_relacao: dtRelacao,
                energia: vRealizacao,
                estresse: vParceira,
                libido: vLibido
            }, { onConflict: 'membro_id' });
        } catch (err) {}
    }
};

window.renderizarGraficoETendenciasRadar = function() {
    const hist = window.dadosRadarIntimo.historico || [];
    const contGraf = document.getElementById('container-grafico-svg-radar');
    const contComp = document.getElementById('bloco-comparativo-semanas');
    const elInsight = document.getElementById('texto-insight-tendencia');

    if (!contGraf) return;

    if (hist.length < 2) {
        contGraf.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center;">Registre pelo menos 2 check-ins para gerar as curvas da Vida a Dois.</span>';
        if (contComp) contComp.innerHTML = '<span style="font-size:11px; color:#64748b; grid-column:span 2; text-align:center;">Sem dados semanais suficientes para comparação.</span>';
        if (elInsight) elInsight.textContent = "Faça seu check-in após os momentos a dois para acompanhar a evolução da cumplicidade e satisfação mútua.";
        return;
    }

    const pontos = [...hist.slice(0, 7)].reverse();
    const w = 320;
    const h = 90;
    const pad = 16;
    const dx = (w - (pad * 2)) / Math.max(1, pontos.length - 1);

    const calcY = (val) => h - pad - (((val - 1) / 9) * (h - (pad * 2)));

    const ptsLibido = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.libido || 5)}`).join(' ');
    const ptsRealizacao = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.realizacao || p.energia || 5)}`).join(' ');
    const ptsParceira = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.parceira || p.estresse || 5)}`).join(' ');

    contGraf.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
            <line x1="${pad}" y1="${calcY(5)}" x2="${w - pad}" y2="${calcY(5)}" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1" />
            <polyline fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsLibido}" />
            <polyline fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsRealizacao}" />
            <polyline fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsParceira}" />
            ${pontos.map((p, idx) => `
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.libido || 5)}" r="3" fill="#e11d48" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.realizacao || p.energia || 5)}" r="3" fill="#0284c7" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.parceira || p.estresse || 5)}" r="3" fill="#d97706" />
            `).join('')}
        </svg>
    `;

    const semAtual = hist.slice(0, 7);
    const semAnterior = hist.slice(7, 14);

    const calcMedia = (arr, campo, fallback) => {
        if (!arr.length) return null;
        return (arr.reduce((acc, cur) => acc + (cur[campo] || cur[fallback] || 5), 0) / arr.length).toFixed(1);
    };

    const medL_Atu = calcMedia(semAtual, 'libido', 'libido');
    const medR_Atu = calcMedia(semAtual, 'realizacao', 'energia');
    const medP_Atu = calcMedia(semAtual, 'parceira', 'estresse');

    const medL_Ant = calcMedia(semAnterior, 'libido', 'libido');
    const medR_Ant = calcMedia(semAnterior, 'realizacao', 'energia');
    const medP_Ant = calcMedia(semAnterior, 'parceira', 'estresse');

    if (contComp) {
        contComp.innerHTML = `
            <div style="background:#ffffff; padding:8px 10px; border-radius:10px; border:1px solid #fecdd3;">
                <span style="font-size:10px; color:#be123c; font-weight:800; text-transform:uppercase; display:block;">Semana Atual:</span>
                <span style="font-size:11.5px; color:#0f172a; font-weight:700; display:block; margin-top:3px;">
                    🔥 ${medL_Atu} | ⚡ ${medR_Atu} | ❤️ ${medP_Atu}
                </span>
            </div>
            <div style="background:#ffffff; padding:8px 10px; border-radius:10px; border:1px solid #fecdd3;">
                <span style="font-size:10px; color:#be123c; font-weight:800; text-transform:uppercase; display:block;">Semana Anterior:</span>
                <span style="font-size:11.5px; color:#0f172a; font-weight:700; display:block; margin-top:3px;">
                    ${medL_Ant ? `🔥 ${medL_Ant} | ⚡ ${medR_Ant} | ❤️ ${medP_Ant}` : '<em style="color:#64748b; font-size:10.5px;">Sem dados</em>'}
                </span>
            </div>
        `;
    }

    if (elInsight) {
        if (parseFloat(medP_Atu) >= 7.5 && parseFloat(medR_Atu) >= 7.5) {
            elInsight.innerHTML = `❤️ <strong>Alta Sintonia:</strong> Excelente harmonia e satisfação mútua no casal. As atenções e a presença estão a gerar conexão genuína.`;
        } else if (parseFloat(medL_Atu) >= 7.0 && parseFloat(medR_Atu) <= 5.0) {
            elInsight.innerHTML = `💡 <strong>Ajuste de Ritmo:</strong> Disposição em alta, porém a performance/realização sentida ficou moderada. Reduza a pressa e priorize o clima de cumplicidade.`;
        } else {
            elInsight.innerHTML = `🎯 <strong>Conexão Constante:</strong> Mantenha o diálogo aberto e a antecipação carinhosa ao longo da rotina para preservar o magnetismo a dois.`;
        }
    }
};

window.renderizarHistoricoRadarIntimo = function() {
    const cont = document.getElementById('lista-historico-radar-notas');
    const elContador = document.getElementById('contador-historico-radar');
    if (!cont) return;

    const hist = window.dadosRadarIntimo.historico || [];
    if (elContador) elContador.textContent = hist.length;

    if (hist.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:8px;">Nenhuma avaliação confidencial registrada ainda.</span>';
        return;
    }

    cont.innerHTML = hist.map(reg => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:10px; font-weight:800; color:#64748b; display:block;">Data: ${reg.data}${reg.ultima_relacao ? ' • Relação em ' + reg.ultima_relacao : ''}</span>
                <span style="font-size:11.5px; color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px; margin-top:2px;">
                    ⚡ ${reg.textoRealizacao || reg.textoEnergia} | 
                    ❤️ ${reg.textoParceira || reg.textoEstresse}
                </span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:10.5px; font-weight:800; color:#be123c; background:#fff1f2; border:1px solid #fecdd3; padding:3px 6px; border-radius:6px; display:inline-flex; align-items:center; gap:3px;">
                    <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-fogo.svg';" alt="Libido" style="width:14px; height:14px; object-fit:contain;"> ${reg.textoLibido}
                </span>
                <button type="button" onclick="window.removerItemHistoricoRadar('${reg.id}')" style="background:none; border:none; cursor:pointer; padding:2px; display:flex; align-items:center;" title="Remover registro">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerItemHistoricoRadar = function(id) {
    if (!window.dadosRadarIntimo.historico) return;
    window.dadosRadarIntimo.historico = window.dadosRadarIntimo.historico.filter(r => r.id !== id);
    localStorage.setItem(window.obterChaveStorageMasc('radar_intimo'), JSON.stringify(window.dadosRadarIntimo));
    window.renderizarGraficoETendenciasRadar();
    window.renderizarHistoricoRadarIntimo();
};

// =========================================================================
// 7. CURADORIA DE 200 FILMES & SÉRIES (MODO SEQUENCIAL + ALEATÓRIO 🔀 + TMDB)
// =========================================================================

window.obterListaMidiaMascAtual = function() {
    if (window.abaMidiaAtiva === 'filmes') {
        return window.CatalogoFilmesMasculinos || [];
    }
    return window.CatalogoSeriesMasculinas || [];
};

window.alternarAbaMidia = function(aba) {
    window.abaMidiaAtiva = aba;
    const btnF = document.getElementById('btn-aba-filmes');
    const btnS = document.getElementById('btn-aba-series');

    if (aba === 'filmes') {
        if (btnF) { btnF.style.background = '#16a34a'; btnF.style.color = '#fff'; }
        if (btnS) { btnS.style.background = 'transparent'; btnS.style.color = '#64748b'; }
    } else {
        if (btnS) { btnS.style.background = '#16a34a'; btnS.style.color = '#fff'; }
        if (btnF) { btnF.style.background = 'transparent'; btnF.style.color = '#64748b'; }
    }

    window.indiceMidiaAtual[aba] = 0;
    window.atualizarVisualizacaoMidia();
};

window.navegarCarrosselMidia = function(direcao) {
    const lista = window.obterListaMidiaMascAtual();
    if (!lista || lista.length === 0) return;

    let idx = (window.indiceMidiaAtual[window.abaMidiaAtiva] || 0) + direcao;
    if (idx < 0) idx = lista.length - 1;
    if (idx >= lista.length) idx = 0;

    window.indiceMidiaAtual[window.abaMidiaAtiva] = idx;
    window.atualizarVisualizacaoMidia();
};

window.sortearMidiaAleatoria = function() {
    const lista = window.obterListaMidiaMascAtual();
    if (!lista || lista.length === 0) return;

    let idxAtual = window.indiceMidiaAtual[window.abaMidiaAtiva] || 0;
    let novoIdx;
    do {
        novoIdx = Math.floor(Math.random() * lista.length);
    } while (lista.length > 1 && novoIdx === idxAtual);

    window.indiceMidiaAtual[window.abaMidiaAtiva] = novoIdx;
    window.atualizarVisualizacaoMidia();

    if (typeof window.mostrarToast === 'function') {
        const item = lista[novoIdx];
        window.mostrarToast(`Sorteado: ${item.titulo} 🎲`, "info");
    }
};

window.atualizarVisualizacaoMidia = function() {
    const lista = window.obterListaMidiaMascAtual();
    const idx = window.indiceMidiaAtual[window.abaMidiaAtiva] || 0;
    const item = lista[idx];

    if (!item) return;
    window.itemMidiaAtualmenteExibido = item;

    const elImg = document.getElementById('midia-poster-img');
    const elBadgeCat = document.getElementById('midia-badge-categoria');
    const elAno = document.getElementById('midia-ano-tempo');
    const elTitulo = document.getElementById('midia-titulo-destaque');
    const elSubtitulo = document.getElementById('midia-subtitulo-original');
    const elRating = document.getElementById('midia-rating-imdb');
    const elDesc = document.getElementById('midia-descricao-destaque');
    const contGeneros = document.getElementById('midia-tags-generos');
    const contPosicao = document.getElementById('midia-posicao-contador');
    const btnAcao = document.getElementById('btn-marcar-assistido-acao');
    const btnQueroVer = document.getElementById('btn-quero-ver-masc');
    const contProvedores = document.getElementById('midia-provedores-lista');
    const linkJustWatch = document.getElementById('midia-link-justwatch');

    if (elBadgeCat) elBadgeCat.textContent = item.categoria || window.abaMidiaAtiva.toUpperCase();
    if (elAno) elAno.textContent = item.ano || item.temporadas || '';
    if (elTitulo) elTitulo.textContent = item.titulo || '';
    if (elSubtitulo) {
        elSubtitulo.textContent = (item.tituloOriginal && item.tituloOriginal !== item.titulo) ? item.tituloOriginal : '';
    }
    if (elRating) {
        elRating.textContent = `★ ${item.imdbRating || '8.0'}`;
    }
    if (elDesc) elDesc.textContent = item.desc || "Buscando detalhes da obra...";

    if (contPosicao) {
        contPosicao.textContent = `${idx + 1} / ${lista.length}`;
    }

    if (contProvedores) {
        contProvedores.innerHTML = '<span style="font-size:11px; color:#64748b;">Consultando provedores de streaming...</span>';
    }

    const imagemPadrao = item.capa || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80';
    if (elImg) {
        elImg.src = imagemPadrao;
    }

    if (contGeneros) {
        const generos = item.generos || [item.categoria || 'Geral'];
        contGeneros.innerHTML = generos.slice(0, 3).map(g => `
            <span style="font-size:9.5px; font-weight:800; background:#f1f5f9; color:#334155; padding:2px 7px; border-radius:6px; border:1px solid #e2e8f0;">${g}</span>
        `).join('');
    }

    const naListaQueroVer = (window.dadosMidiaQueroVerMasc || []).some(m => m && m.titulo && item.titulo && m.titulo.toLowerCase() === item.titulo.toLowerCase());
    if (btnQueroVer) {
        if (naListaQueroVer) {
            btnQueroVer.textContent = '📌 Na Minha Lista';
            btnQueroVer.style.background = '#0284c7';
            btnQueroVer.style.borderColor = '#0284c7';
            btnQueroVer.style.color = '#ffffff';
        } else {
            btnQueroVer.textContent = '📌 Quero Assistir';
            btnQueroVer.style.background = '#f8fafc';
            btnQueroVer.style.borderColor = '#bae6fd';
            btnQueroVer.style.color = '#0369a1';
        }
    }

    const jaAvaliado = (window.dadosMidiaAssistida || []).find(m => m && m.titulo && item.titulo && m.titulo.toLowerCase() === item.titulo.toLowerCase());
    if (btnAcao) {
        if (jaAvaliado) {
            btnAcao.textContent = `★ ${jaAvaliado.estrelas} Estrelas`;
            btnAcao.style.background = '#f59e0b';
        } else {
            btnAcao.innerHTML = `<img src="assets/icons-modern/icone-check.svg" alt="Assistido" style="width:16px; height:16px; object-fit:contain; vertical-align:middle; margin-right:4px;"> Já Assisti`;
            btnAcao.style.background = '#16a34a';
        }
    }

    window.obterDadosTMDbComCache(item).then(dadosTmdb => {
        if (!dadosTmdb) return;
        if (window.itemMidiaAtualmenteExibido !== item) return;

        if (dadosTmdb.poster && elImg) {
            elImg.src = dadosTmdb.poster;
        }

        if (dadosTmdb.sinopse && elDesc) {
            elDesc.textContent = dadosTmdb.sinopse;
        }

        if (dadosTmdb.imdbRating && elRating) {
            elRating.textContent = `★ ${dadosTmdb.imdbRating}`;
        }

        if (linkJustWatch && dadosTmdb.linkOndeAssistir) {
            linkJustWatch.href = dadosTmdb.linkOndeAssistir;
        }

        if (contProvedores) {
            if (dadosTmdb.provedores && dadosTmdb.provedores.length > 0) {
                // EXIBIÇÃO COM LOGO OFICIAL E LINK DIRETO PARA O STREAMING
                contProvedores.innerHTML = dadosTmdb.provedores.map(p => {
                    const linkDireto = window.obterLinkDiretoStreaming(p.nome, item.titulo, dadosTmdb.linkOndeAssistir);
                    const tagLogo = p.logo 
                        ? `<img src="${p.logo}" alt="${esc(p.nome)}" style="width:19px; height:19px; border-radius:5px; object-fit:cover; display:block; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.15);">` 
                        : `<span style="font-size:12px; line-height:1;">📺</span>`;

                    return `
                        <a href="${linkDireto}" target="_blank" rel="noopener noreferrer" class="badge-streaming-link" 
                           style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:#ffffff; color:#0f172a; border:1px solid #bbf7d0; padding:4px 9px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); font-size:11px; font-weight:700; cursor:pointer;" 
                           title="Abrir ${esc(item.titulo)} no ${esc(p.nome)}">
                            ${tagLogo}
                            <span>${esc(p.nome)}</span>
                            <span style="font-size:10px; color:#16a34a; font-weight:800; margin-left:1px;">↗</span>
                        </a>
                    `;
                }).join('');
            } else {
                contProvedores.innerHTML = `
                    <span style="font-size:10.5px; color:#64748b;">
                        Disponível sob consulta no Brasil. 
                        <a href="${dadosTmdb.linkOndeAssistir || '#'}" target="_blank" rel="noopener noreferrer" style="color:#15803d; font-weight:700; text-decoration:underline;">Ver opções no JustWatch</a>
                    </span>
                `;
            }
        }
    });
};

window.alternarQueroAssistirMasc = function(itemDireto = null) {
    const lista = window.obterListaMidiaMascAtual();
    const item = itemDireto || lista[window.indiceMidiaAtual[window.abaMidiaAtiva]];
    if (!item || !item.titulo) return;

    const idx = (window.dadosMidiaQueroVerMasc || []).findIndex(m => m && m.titulo && m.titulo.toLowerCase() === item.titulo.toLowerCase());

    if (idx >= 0) {
        window.dadosMidiaQueroVerMasc.splice(idx, 1);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`"${item.titulo}" removido de 'Quero Assistir'.`, "info");
        }
    } else {
        window.dadosMidiaQueroVerMasc.unshift({
            id: item.id || ('quero_m_' + Date.now()),
            imdbId: item.imdbId || '',
            titulo: item.titulo,
            tipo: window.abaMidiaAtiva,
            categoria: item.categoria || 'Geral',
            ano: item.ano || item.temporadas || '',
            desc: item.desc || '',
            salvo_em: new Date().toISOString()
        });
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`"${item.titulo}" adicionado à lista 'Quero Assistir'! 📌`, "sucesso");
        }
    }

    localStorage.setItem(window.obterChaveStorageMasc('midia_quero_ver'), JSON.stringify(window.dadosMidiaQueroVerMasc));
    window.atualizarVisualizacaoMidia();
    window.renderizarHistoricoQueroVerMasc();
};

window.abrirModalAvaliacaoMidia = function() {
    const caixa = document.getElementById('caixa-avaliacao-midia');
    if (caixa) caixa.classList.toggle('oculto');
};

window.confirmarAvaliacaoMidia = function(estrelas, itemParam = null) {
    const lista = window.obterListaMidiaMascAtual();
    const item = itemParam || lista[window.indiceMidiaAtual[window.abaMidiaAtiva]];
    if (!item || !item.titulo) return;

    window.dadosMidiaQueroVerMasc = (window.dadosMidiaQueroVerMasc || []).filter(m => m && m.titulo && m.titulo.toLowerCase() !== item.titulo.toLowerCase());
    localStorage.setItem(window.obterChaveStorageMasc('midia_quero_ver'), JSON.stringify(window.dadosMidiaQueroVerMasc));

    window.dadosMidiaAssistida = (window.dadosMidiaAssistida || []).filter(m => m && m.titulo && m.titulo.toLowerCase() !== item.titulo.toLowerCase());
    window.dadosMidiaAssistida.push({
        id: item.id || ('mid_' + Date.now()),
        imdbId: item.imdbId || '',
        titulo: item.titulo,
        tipo: window.abaMidiaAtiva,
        categoria: item.categoria,
        estrelas: parseInt(estrelas, 10),
        data: Suiri.today()
    });

    Suiri.storage.setItem('suiri_midia_assistida', JSON.stringify(window.dadosMidiaAssistida));
    document.getElementById('caixa-avaliacao-midia')?.classList.add('oculto');
    
    window.atualizarVisualizacaoMidia();
    window.renderizarHistoricoQueroVerMasc();
    window.renderizarHistoricoAssistidos();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Avaliação de ${estrelas} estrelas registrada!`, "sucesso");
    }
};

window.renderizarHistoricoQueroVerMasc = function() {
    const cont = document.getElementById('bloco-quero-ver-masc-conteudo');
    const elContador = document.getElementById('contador-quero-ver-masc');
    if (!cont) return;

    const lista = window.dadosMidiaQueroVerMasc || [];
    if (elContador) elContador.textContent = lista.length;

    if (lista.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:8px;">Nenhum título na sua lista para assistir.</span>';
        return;
    }

    cont.innerHTML = lista.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; padding:9px 12px; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
            <div style="min-width:0; flex:1;">
                <strong style="font-size:12.5px; color:#0f172a; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(item.titulo)}</strong>
                <span style="font-size:10.5px; color:#15803d; text-transform:uppercase; font-weight:700;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" onclick="window.confirmarAvaliacaoMidia(5, { id: '${item.id}', titulo: ${Suiri.jsArg(item.titulo)}, categoria: ${Suiri.jsArg(item.categoria)} })" style="background:#16a34a; color:#fff; border:none; padding:5px 9px; font-size:10.5px; border-radius:8px; font-weight:800; cursor:pointer;" title="Marcar como visto">
                    ✓ Já Vi
                </button>
                <button type="button" onclick="window.removerMidiaQueroVerMasc('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaQueroVerMasc = function(id) {
    window.dadosMidiaQueroVerMasc = (window.dadosMidiaQueroVerMasc || []).filter(m => m.id !== id);
    localStorage.setItem(window.obterChaveStorageMasc('midia_quero_ver'), JSON.stringify(window.dadosMidiaQueroVerMasc));
    window.renderizarHistoricoQueroVerMasc();
    window.atualizarVisualizacaoMidia();
};

window.renderizarHistoricoAssistidos = function() {
    const cont = document.getElementById('bloco-assistidos-conteudo');
    const elContador = document.getElementById('contador-assistidos');
    if (!cont) return;

    const assistidosOrdenados = [...(window.dadosMidiaAssistida || [])].sort((a, b) => b.estrelas - a.estrelas);
    if (elContador) elContador.textContent = assistidosOrdenados.length;

    if (assistidosOrdenados.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:8px;">Nenhum título avaliado ainda.</span>';
        return;
    }

    cont.innerHTML = assistidosOrdenados.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; padding:9px 12px; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
            <div style="min-width:0;">
                <strong style="font-size:12.5px; color:#0f172a; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(item.titulo)}</strong>
                <span style="font-size:10.5px; color:#64748b; text-transform:uppercase; font-weight:700;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:800; color:#f59e0b;">${'★'.repeat(item.estrelas)}</span>
                <button type="button" onclick="window.removerMidiaAssistida('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover dos assistidos">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaAssistida = function(id) {
    window.dadosMidiaAssistida = (window.dadosMidiaAssistida || []).filter(m => m.id !== id);
    Suiri.storage.setItem('suiri_midia_assistida', JSON.stringify(window.dadosMidiaAssistida));
    window.renderizarHistoricoAssistidos();
    window.atualizarVisualizacaoMidia();
};

// =========================================================================
// 8. OFICINA, GARAGEM E MANUTENÇÕES
// =========================================================================

window.adicionarManutencao = async function() {
    const input = document.getElementById('input-nova-manutencao');
    const titulo = input?.value.trim();
    if (!titulo) return;

    input.value = '';
    const novoItem = { id: 'manut_' + Date.now(), titulo: titulo, concluido: false };
    window.dadosManutencaoGaragem.push(novoItem);
    window.salvarERenderizarMasculino();

    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    const meuId = window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || null);
    if (cli && meuId) {
        try {
            const { data } = await cli.from('espaco_masc_listas').insert([{
                familia_id: window.familiaAtualId || null,
                membro_id: meuId,
                tipo: 'manutencao',
                titulo: titulo
            }]).select().single();
            if (data) { novoItem.id = data.id; window.salvarERenderizarMasculino(); }
        } catch (err) {}
    }
};

window.alternarManutencao = async function(id) {
    const item = window.dadosManutencaoGaragem.find(i => i.id === id);
    if (!item) return;

    item.concluido = !item.concluido;
    window.salvarERenderizarMasculino();

    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    if (cli && !String(id).startsWith('manut_')) {
        try {
            await cli.from('espaco_masc_listas').update({ concluido: item.concluido }).eq('id', id);
        } catch (err) {}
    }
};

window.removerManutencao = async function(id) {
    window.dadosManutencaoGaragem = window.dadosManutencaoGaragem.filter(i => i.id !== id);
    window.salvarERenderizarMasculino();

    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    if (cli && !String(id).startsWith('manut_')) {
        try {
            await cli.from('espaco_masc_listas').delete().eq('id', id);
        } catch (err) {}
    }
};

window.salvarERenderizarMasculino = function() {
    Suiri.storage.setItem('suiri_manutencao_masc', JSON.stringify(window.dadosManutencaoGaragem));
    window.renderizarListasMasculinas();
};

window.renderizarListasMasculinas = function() {
    const contManut = document.getElementById('lista-manutencao-garagem');
    if (contManut) {
        if (window.dadosManutencaoGaragem.length === 0) {
            contManut.innerHTML = '<span style="font-size:11px; color:#64748b; text-align:center; display:block; padding:4px;">Nenhuma manutenção pendente.</span>';
        } else {
            contManut.innerHTML = window.dadosManutencaoGaragem.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; padding:10px 12px; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; flex:1;">
                        <input type="checkbox" onchange="window.alternarManutencao('${item.id}')" ${item.concluido ? 'checked' : ''} style="width:16px; height:16px; accent-color:#f97316;">
                        <span style="font-size:12.5px; color:#0f172a; font-weight:600; ${item.concluido ? 'text-decoration:line-through; color:#94a3b8;' : ''}">${esc(item.titulo)}</span>
                    </label>
                    <button type="button" onclick="window.removerManutencao('${item.id}')" style="background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center;" title="Remover">
                        <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                    </button>
                </div>
            `).join('');
        }
    }

    window.calcularOfensivaForja();

    // Sincroniza sliders de estado diário
    if (window.dadosEstadoDiario) {
        const rngH = document.getElementById('range-humor-diario');
        const rngE = document.getElementById('range-estresse-diario');
        const rngF = document.getElementById('range-fisico-diario');
        const rngM = document.getElementById('range-mental-diario');

        if (rngH) rngH.value = window.dadosEstadoDiario.humor || 5;
        if (rngE) rngE.value = window.dadosEstadoDiario.estresse || 5;
        if (rngF) rngF.value = window.dadosEstadoDiario.fisico || 5;
        if (rngM) rngM.value = window.dadosEstadoDiario.mental || 5;

        window.atualizarRotuloEstadoDiario('humor');
        window.atualizarRotuloEstadoDiario('estresse');
        window.atualizarRotuloEstadoDiario('fisico');
        window.atualizarRotuloEstadoDiario('mental');
    }

    // Sincroniza sliders do radar íntimo
    if (window.dadosRadarIntimo) {
        const inDt = document.getElementById('slider-data-relacao');
        const rngL = document.getElementById('range-libido');
        const rngR = document.getElementById('range-realizacao');
        const rngP = document.getElementById('range-parceira');

        if (inDt) inDt.value = window.dadosRadarIntimo.ultima_relacao || '';
        if (rngL) rngL.value = window.dadosRadarIntimo.libido || 5;
        if (rngR) rngR.value = window.dadosRadarIntimo.realizacao || window.dadosRadarIntimo.energia || 5;
        if (rngP) rngP.value = window.dadosRadarIntimo.parceira || window.dadosRadarIntimo.estresse || 5;

        window.atualizarRotuloSlider('libido');
        window.atualizarRotuloSlider('realizacao');
        window.atualizarRotuloSlider('parceira');
    }
};

// =========================================================================
// 9. SINCRONIZAÇÃO EM NUVEM (SUPABASE)
// =========================================================================

window.carregarDadosNuvemEspacoMasculino = async function() {
    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    const meuId = window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || null);
    if (!cli || !meuId) return;

    try {
        const { data: dRadar } = await cli.from('espaco_masc_radar').select('*').eq('membro_id', meuId).maybeSingle();
        if (dRadar) {
            window.dadosRadarIntimo.ultima_relacao = dRadar.ultima_relacao;
            window.dadosRadarIntimo.realizacao = dRadar.energia || 5;
            window.dadosRadarIntimo.parceira = dRadar.estresse || 5;
            window.dadosRadarIntimo.libido = dRadar.libido || 5;
        }

        const { data: dListas } = await cli.from('espaco_masc_listas').select('*').eq('membro_id', meuId).order('criado_em', { ascending: true });
        if (dListas) {
            window.dadosManutencaoGaragem = dListas.filter(l => l.tipo === 'manutencao');
        }

        window.renderizarListasMasculinas();
    } catch (err) {
        console.warn("Sem conexão remota para o módulo masculino:", err);
    }
};
