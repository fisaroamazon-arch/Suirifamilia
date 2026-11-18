/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SAUDE-MULHER.JS (100% COMPLETO E INTEGRAL)
// Ordem Reorganizada:
// 1. Fase Menstrual (com Botão "Menstruei hoje 🩸" integrado)
// 2. Inspiração Literária & Alma
// 3. Como se Sente Hoje (Retrátil, 5 Níveis, Sem Prefixo de Nota)
// 4. Santuário (Rituais & Evolução)
// 5. Radar de Feminilidade (Retrátil, 5 Níveis, Sem Prefixo de Nota)
// 6. Curadoria Completa (Com Logos de Streaming & Links Diretos aos Streamers)
// 7. Refúgio Sonoro & Digital (Spotify & YouTube)
// =========================================================================

window.dadosCicloMulher = [];
window.cicloEdicaoId = null;
window.dadosSintomasDiarios = [];
window.dadosDiarioMulher = [];

// Persistência das 6 Metas Diárias (O Santuário), Radar de Feminilidade e Mídia
window.dadosRituaisFemininos = Suiri.parseJSON(Suiri.storage.getItem('suiri_rituais_fem')) || {};
window.configMetasFemininas = Suiri.parseJSON(Suiri.storage.getItem('suiri_metas_fem_config')) || [
    "Hidratação Consciente (2L)",
    "Pausa / Leitura Inspiradora",
    "Movimento Suave / Treino",
    "Alimentação Nutritiva",
    "Momento de Silêncio / Respiração",
    "Desconexão Noturna (Zero Telas)"
];

window.dadosRadarFeminilidade = Suiri.parseJSON(Suiri.storage.getItem('suiri_radar_fem')) || {
    vitalidade: 3,
    paz_mental: 3,
    afeto_libido: 3,
    ultima_relacao: null,
    historico: []
};

window.dadosMidiaMulherAssistida = Suiri.parseJSON(Suiri.storage.getItem('suiri_midia_mulher_assistida')) || [];
window.dadosMidiaMulherQueroVer = Suiri.parseJSON(Suiri.storage.getItem('suiri_midia_mulher_quero_ver')) || [];
window.indiceMidiaMulher = { filmes: 0, series: 0 };
window.abaMidiaMulherAtiva = 'filmes';

// Configuração TMDb (Sinopse em Português pt-BR, Logos Oficiais e Cache V3)
window.TMDB_API_KEY = window.TMDB_API_KEY || '340bf11ebbaf9247c353e8eb6dc824b4';
window.cacheTmdbMulher = Suiri.parseJSON(localStorage.getItem('suiri_tmdb_cache_mulher_v3')) || {};

// Estado da Paginação do Diário
window.paginasDiarioAtuais = [""];
window.indicePaginaDiarioAtual = 0;
window.humorDiarioSelecionadoAtual = "Feliz";

// Helpers Seguros de Sessão e Supabase
function obterClienteSupabaseSeguro() {
    return window.clienteSupabase || window.cliente || window.supabaseClient || (typeof cliente !== 'undefined' ? cliente : null);
}

function obterUsuarioIdSeguro() {
    if (window.obterUsuarioId && typeof window.obterUsuarioId === 'function') {
        const id = window.obterUsuarioId();
        if (id) return id;
    }
    if (window.perfilAtual && window.perfilAtual.id) return window.perfilAtual.id;

    try {
        const raw = localStorage.getItem('suiri_perfil_ativo') || localStorage.getItem('suiri_ultimo_perfil');
        if (raw) {
            const p = JSON.parse(raw);
            if (p && p.id) return p.id;
        }
    } catch (e) {}

    return localStorage.getItem('suiri_usuario_id') || null;
}

// =========================================================================
// MOTOR DE LINKS DIRETOS AOS STREAMERS
// =========================================================================
window.obterLinkDiretoStreamingMulher = function(nomeProvedor, tituloObra, linkFallback) {
    if (!nomeProvedor) return linkFallback || '#';
    const p = nomeProvedor.toLowerCase();
    const q = encodeURIComponent(tituloObra || '');

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
        return `https://www.google.com/search?q=${encodeURIComponent(tituloObra + ' ' + nomeProvedor + ' assistir')}`;
    }

    return linkFallback || `https://www.google.com/search?q=${encodeURIComponent(tituloObra + ' ' + nomeProvedor + ' onde assistir')}`;
};

// Curadoria de Playlists do Spotify
window.CatalogoPlaylistsSpotifyMulher = window.CatalogoPlaylistsSpotifyMulher || [
    {
        id: "sp_f1",
        titulo: "Manhã Serena & Autocuidado",
        subtitulo: "Acústicos, Sons da Natureza e Despertar Suave",
        icone: "🌿",
        tag: "Manhã Leve",
        link: "https://open.spotify.com/search/morning%20acoustic%20peaceful"
    },
    {
        id: "sp_f2",
        titulo: "Foco Criativo & Leveza",
        subtitulo: "Piano Neoclássico, Lo-Fi Serena e Concentração",
        icone: "✨",
        tag: "Foco & Mente",
        link: "https://open.spotify.com/search/peaceful%20piano%20study"
    },
    {
        id: "sp_f3",
        titulo: "Pilates, Treino & Vitalidade",
        subtitulo: "Batidas Elevadas, Dança e Energia Feminina",
        icone: "⚡",
        tag: "Treino Radiante",
        link: "https://open.spotify.com/search/workout%20pop%20energy"
    },
    {
        id: "sp_f4",
        titulo: "Noite Zen & Descompressão",
        subtitulo: "Sons de Chuva, Frequências Binaurais e Spa",
        icone: "🌙",
        tag: "Sono Reparador",
        link: "https://open.spotify.com/search/spa%20relaxation%20ambient"
    }
];

// Curadoria de Canais do YouTube
window.CatalogoCanaisYoutubeMulher = window.CatalogoCanaisYoutubeMulher || [
    {
        id: "yt_f1",
        titulo: "Saúde da Mulher & Hormônios",
        categoria: "Fisiologia & Ciclo Consciente",
        desc: "Orientações sobre as 4 fases biológicas, equilíbrio hormonal e nutrição.",
        icone: "🌸",
        link: "https://www.youtube.com/results?search_query=saude+da+mulher+e+ciclo+menstrual"
    },
    {
        id: "yt_f2",
        titulo: "Pilates, Yoga & Mobilidade",
        categoria: "Corpo & Movimento Fluido",
        desc: "Rotinas práticas para alívio de cólicas, postura, respiração e bem-estar em casa.",
        icone: "🧘‍♀️",
        link: "https://www.youtube.com/results?search_query=yoga+para+alivio+de+colica+e+estresse"
    },
    {
        id: "yt_f3",
        titulo: "Psicologia & Inteligência Emocional",
        categoria: "Autoconhecimento & Paz",
        desc: "Gestão da carga mental, limites saudáveis, autocuidado e autoestima.",
        icone: "📖",
        link: "https://www.youtube.com/results?search_query=inteligencia+emocional+e+autocuidado+feminino"
    }
];

window.ORIENTACOES_FASES_CICLO = {
    1: {
        nome: "Fase Menstrual (Estágio 1)",
        emoji: "🩸",
        estacao: "Inverno Interior",
        dias_ref: "Dias 1 a 5 do ciclo",
        resumo_vibe: "O corpo está a renovar o endométrio. Os níveis de estrogénio e progesterona estão no ponto mais baixo. É tempo de recolhimento, desaceleração e escuta profunda do próprio corpo.",
        cards: {
            fertilidade: {
                titulo: "Fertilidade & Gravidez",
                badge: "Muito Baixa",
                sub: "Improvável engravidar",
                cor: "#9d174d",
                icone: "🍼",
                fisiologia: "O óvulo anterior não foi fecundado e o corpo descarta a camada interna do útero. A probabilidade de conceção durante o fluxo é muito baixa.",
                como_lidar: [
                    "<strong>Para quem deseja engravidar:</strong> Fase de repouso uterino. Foque em nutrir o sangue e descansar para o novo ciclo de folículos que começará em seguida.",
                    "<strong>Para quem evita gravidez:</strong> Embora a probabilidade seja mínima, em ciclos muito curtos ou irregulares os espermatozoides podem sobreviver até 5 dias. Mantenha os cuidados habituais.",
                    "<strong>Cuidados íntimos:</strong> Troque os absorventes ou esvazie o coletor com frequência para evitar proliferação bacteriana e higienize com água morna e sabonete neutro."
                ]
            },
            libido: {
                titulo: "Libido & Intimidade",
                badge: "Introspectiva",
                sub: "Conforto & Aconchego",
                cor: "#6b21a8",
                icone: "🔥",
                fisiologia: "Os níveis hormonais basais reduzem o ímpeto sexual ativo, mas a sensibilidade física na região pélvica pode variar.",
                como_lidar: [
                    "<strong>Sintonia emocional:</strong> O corpo pede carinho, abraços, cafuné e segurança afetiva mais do que sexo intenso.",
                    "<strong>Relação durante o período:</strong> Se houver vontade mútua, é perfeitamente seguro e saudável — o orgasmo liberta endorfinas e ocitocina que funcionam como analgésicos naturais contra cólicas.",
                    "<strong>Conforto a dois:</strong> Comunique com naturalidade como se sente ao parceiro. Uma massagem nos pés ou na região lombar faz maravilhas."
                ]
            },
            energia: {
                titulo: "Energia & Produtividade",
                badge: "Bateria Baixa",
                sub: "Repouso & Descanso",
                cor: "#e11d48",
                icone: "⚡",
                fisiologia: "A perda sanguínea e a baixa hormonal exigem trabalho extra do organismo. A fadiga é uma resposta biológica natural, não preguiça.",
                como_lidar: [
                    "<strong>No trabalho e rotina:</strong> Evite sobrecarga de tarefas complexas. Delegue o que puder e faça pausas respiratórias conscientes ao longo do dia.",
                    "<strong>Exercícios físicos:</strong> Substitua treinos pesados por caminhadas leves, alongamentos e posturas suaves de yoga (postura da criança e pernas na parede).",
                    "<strong>Nutrição e chás:</strong> Alimentos ricos em ferro (espinafre, feijão, lentilha, carnes) e chás mornos de camomila, gengibre ou canela para desinflamar e acalmar as cólicas."
                ]
            }
        }
    },
    2: {
        nome: "Fase Folicular (Estágio 2)",
        emoji: "🌿",
        estacao: "Primavera Interior",
        dias_ref: "Dias 6 a 11 do ciclo",
        resumo_vibe: "O hormônio FSH estimula o crescimento dos folículos e o estrogénio sobe dia a dia. Você ganha clareza mental, otimismo, leveza e vontade de iniciar novos projetos.",
        cards: {
            fertilidade: {
                titulo: "Fertilidade & Gravidez",
                badge: "Média-Baixa",
                sub: "Fertilidade subindo",
                cor: "#b45309",
                icone: "🍼",
                fisiologia: "Os folículos ovarianos estão amadurecendo. Conforme se aproxima do 10º dia, o muco cervical começa a ficar mais hidratado e alcalino.",
                como_lidar: [
                    "<strong>Para quem deseja engravidar:</strong> Inicie a preparação! Espermatozoides vivem até 5 dias nas trompas. Relações a cada 2 dias a partir do dia 8-9 aumentam muito as chances de conceber.",
                    "<strong>Para quem evita gravidez:</strong> Atenção redobrada. A janela fértil começa a abrir-se antes da ovulação real. Métodos de barreira são indispensáveis.",
                    "<strong>Sinal do corpo:</strong> Observe a mudança do muco vaginal, que sai de um aspecto seco/pastoso para mais leitoso e húmido."
                ]
            },
            libido: {
                titulo: "Libido & Intimidade",
                badge: "Despertando",
                sub: "Energia em ascensão",
                cor: "#7c3aed",
                icone: "🔥",
                fisiologia: "O estrogénio em alta estimula a vascularização pélvica, melhora a lubrificação e aumenta a receptividade sensorial.",
                como_lidar: [
                    "<strong>Vontade de explorar:</strong> Sua autoconfiança física está aumentando. Excelente momento para novidades a dois, jogos de sedução e encontros a sós.",
                    "<strong>Comunicação fluida:</strong> É mais fácil expressar fantasias e desejos com leveza e sem constrangimento.",
                    "<strong>Sensação de frescura:</strong> Aproveite para se vestir de maneira que te faça sentir bonita e poderosa para si mesma."
                ]
            },
            energia: {
                titulo: "Energia & Produtividade",
                badge: "Em Alta ⚡",
                sub: "Criatividade & Pique",
                cor: "#16a34a",
                icone: "⚡",
                fisiologia: "A dopamina e o estrogénio ativam áreas cerebrais ligadas ao foco, planeamento estratégico e resistência física.",
                como_lidar: [
                    "<strong>No trabalho e estudos:</strong> Tire projetos do papel, organize a casa, estude coisas novas e marque reuniões importantes. A mente está afiada.",
                    "<strong>Exercícios físicos:</strong> Aproveite para musculação intensa, corridas e desportos que exigem agilidade. A recuperação muscular é rápida.",
                    "<strong>Nutrição:</strong> Alimentos frescos, saladas verdes, sementes de abóbora e linhaça para dar suporte ao estrogénio saudável."
                ]
            }
        }
    },
    3: {
        nome: "Fase Ovulatória (Estágio 3)",
        emoji: "✨",
        estacao: "Verão Interior",
        dias_ref: "Dias 12 a 16 do ciclo",
        resumo_vibe: "Pico de estrogénio, pico de LH e surto de testosterona. Você está no auge do seu magnetismo, capacidade de comunicação e poder de atração.",
        cards: {
            fertilidade: {
                titulo: "Fertilidade & Gravidez",
                badge: "PICO MÁXIMO",
                sub: "Altamente propensa",
                cor: "#e11d48",
                icone: "🍼",
                fisiologia: "O folículo rompe-se e liberta o óvulo maduro, que sobrevive de 12 a 24 horas. O muco cervical fica transparente, escorregadio e elástico (estilo clara de ovo).",
                como_lidar: [
                    "<strong>Para quem deseja engravidar:</strong> ESTE É O MOMENTO! Mantenha relações no dia da ovulação e nas 24h seguintes para aproveitar o óvulo fresco.",
                    "<strong>Para quem evita gravidez:</strong> ALERTA MÁXIMO. É o período de maior risco fértil do mês. Use proteção rigorosa ou evite relações com penetração desprotegida.",
                    "<strong>Identificação no corpo:</strong> Sensação de humidade evidente e, por vezes, uma pontadinha leve em um dos lados do baixo ventre (dor da ovulação)."
                ]
            },
            libido: {
                titulo: "Libido & Intimidade",
                badge: "Ápice & Fogo 🔥",
                sub: "Magnetismo no auge",
                cor: "#c026d3",
                icone: "🔥",
                fisiologia: "A testosterona feminina atinge o ponto mais alto do mês. O olfato apura-se, a pele fica radiante e o desejo sexual alcança o topo biológico.",
                como_lidar: [
                    "<strong>Celebração a dois:</strong> A intimidade flui com intensidade e entusiasmo. A lubrificação natural e a sensibilidade do clitóris estão perfeitas.",
                    "<strong>Magnetismo social:</strong> Você atrai a atenção naturalmente, tem facilidade para encantar e negociar tanto na vida íntima quanto no trabalho.",
                    "<strong>Autonomia feminina:</strong> Canalize essa energia para celebrar o seu corpo, dançar ou desfrutar de momentos de autocuidado luxuoso."
                ]
            },
            energia: {
                titulo: "Energia & Produtividade",
                badge: "Radiante / 100%",
                sub: "Força & Vigor Total",
                cor: "#d97706",
                icone: "⚡",
                fisiologia: "Vigor neuromuscular no topo. A força contrátil dos músculos é máxima e a capacidade cardiovascular responde com facilidade.",
                como_lidar: [
                    "<strong>No dia a dia:</strong> Excelente para apresentações, eventos sociais, festas e tarefas desafiadoras do lar.",
                    "<strong>Exercícios físicos:</strong> Quebre recordes pessoais em treinos de força (perna, agachamento) ou treinos intervalados (HIIT).",
                    "<strong>Atenção:</strong> Como o corpo gasta bastante energia, beba pelo menos 2 a 2.5L de água e consuma carboidratos complexos e magnésio."
                ]
            }
        }
    },
    4: {
        nome: "Fase Lútea (Estágio 4)",
        emoji: "🍂",
        estacao: "Outono Interior",
        dias_ref: "Dias 17 a 28 do ciclo",
        resumo_vibe: "A progesterona assume o comando. O seu foco volta-se para a organização de detalhes, limites saudáveis e necessidade de silêncio e acolhimento.",
        cards: {
            fertilidade: {
                titulo: "Fertilidade & Gravidez",
                badge: "Infértil / Baixa",
                sub: "Pouco propensa",
                cor: "#64748b",
                icone: "🍼",
                fisiologia: "O corpo lúteo produz progesterona. O colo do útero fecha-se com muco espesso e a ovulação já se encerrou. Fecundação inviável após o 3º dia pós-ovulação.",
                como_lidar: [
                    "<strong>Para quem deseja engravidar:</strong> Fase das duas semanas de espera (2WW). Evite stress excessivo, mantenha o corpo aquecido e apoie a implantação do embrião com descanso.",
                    "<strong>Para quem evita gravidez:</strong> Período biologicamente seguro após a confirmação da ovulação, trazendo alívio reprodutivo.",
                    "<strong>Sinais corporais:</strong> Os seios podem ficar mais sensíveis ou inchados devido à ação da progesterona."
                ]
            },
            libido: {
                titulo: "Libido & Intimidade",
                badge: "Calma & Suave",
                sub: "Afeto e conexão serena",
                cor: "#581c87",
                icone: "🔥",
                fisiologia: "A progesterona tem efeito calmante sobre o sistema nervoso central. A libido intensa diminui e dá lugar ao desejo de segurança e abraço.",
                como_lidar: [
                    "<strong>Sem cobranças:</strong> Não se sinta culpada se a vontade de sexo intenso diminuir. O corpo pede carinho, massagens nos ombros e cafuné.",
                    "<strong>Comunicação aberta:</strong> Avise o seu parceiro de que está na fase pré-menstrual para evitar mal-entendidos emocionais.",
                    "<strong>Conforto térmico:</strong> Banhos quentes a dois e momentos de aconchego sem pressa fortalecem o vínculo emocional."
                ]
            },
            energia: {
                titulo: "Energia & Produtividade",
                badge: "Desacelerando",
                sub: "Pede pausas & calma",
                cor: "#64748b",
                icone: "⚡",
                fisiologia: "Aumento do metabolismo basal (mais fome calórica) e tendência à retenção de líquidos. Nos últimos dias antes de descer, a queda hormonal pode trazer a TPM.",
                como_lidar: [
                    "<strong>No dia a dia:</strong> Excelente para organizar armários, limpar gavetas, pagar contas e concluir pendências que exigem foco detalhista.",
                    "<strong>Exercícios físicos:</strong> Diminua a carga. Troque treinos pesados por pilates, yoga ou caminhadas ao ar livre.",
                    "<strong>Alívio da TPM:</strong> Chocolate preto (70%), sementes de girassol e sésamo, banana com aveia e canela. Evite excesso de sal e cafeína para diminuir o inchaço e a irritabilidade."
                ]
            }
        }
    }
};

const DICAS_BIOLOGICAS_FALLBACK = {
    menstrual: "O corpo pede descanso e aconchego. Hidrate-se e faça refeições quentinhas.",
    folicular: "A sua energia está a despertar! Excelente momento para novos planos e ideias criativas.",
    ovulatoria: "Pico de magnetismo e vitalidade. Expresse-se, converse e celebre o seu brilho.",
    lutea: "Tempo de recolhimento e organização. Desacelere o ritmo e acolha os seus limites."
};

const INSPIRACOES_FALLBACK = [
    "📖 Dica de Leitura: 'Quarto de Despejo' (Carolina Maria de Jesus). A força crua e real de uma mulher que não se curvou à vida.",
    "✨ Citação: 'Não sou alegre, nem sou triste: sou poeta.' — Cecília Meireles",
    "🌿 Bem-Estar: Prepare uma chávena do seu chá preferido. Sente-se num lugar confortável e beba sem olhar para o ecrã.",
    "✒️ Poesia: 'Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.' — Clarice Lispector",
    "📖 Dica de Leitura: 'Mulheres que Correm com os Lobos' (Clarissa Pinkola Estés). O resgate do instinto mais profundo da alma feminina.",
    "✨ Citação: 'Pense como uma rainha. Uma rainha não tem medo de falhar. O fracasso é apenas mais um degrau para a grandeza.' — Oprah Winfrey",
    "📖 Dica de Leitura: 'Um Teto Todo Seu' (Virginia Woolf). Uma reflexão essencial sobre a independência e o espaço da mulher.",
    "✒️ Poesia: 'Mesmo quando tudo parece desabar, cabe a mim decidir entre rir ou chorar, ir ou ficar, desistir ou lutar.' — Cora Coralina",
    "🌿 Bem-Estar: Feche os olhos por 60 segundos. Respire fundo, preenchendo o ventre de ar, e solte devagar. O seu corpo agradece a pausa.",
    "✨ Citação: 'Eu não sou o que me aconteceu. Eu sou o que escolho me tornar.' — Carl Jung",
    "📖 Dica de Leitura: 'A Cor Púrpura' (Alice Walker). Uma história brutal e bela sobre libertação feminina e irmandade.",
    "✒️ Poesia: 'A forma como você se ama é a forma como você ensina os outros a te amarem.' — Rupi Kaur",
    "🌿 Bem-Estar: Hoje, faça um elogio sincero a si mesma em frente ao espelho. Reconheça a sua própria beleza e força.",
    "✨ Citação: 'Não há limite para o que nós, como mulheres, podemos alcançar.' — Michelle Obama",
    "📖 Dica de Leitura: 'Circe' (Madeline Miller). A reinvenção de uma feiticeira, reclamando o seu poder e a sua voz autêntica.",
    "✒️ Poesia: 'Amar a si mesma é o início de um romance para toda a vida.' — Oscar Wilde"
];

function criarDataAbsoluta(ano, mes, dia) {
    const d = new Date();
    d.setFullYear(ano, mes - 1, dia);
    d.setHours(0, 0, 0, 0);
    d.setMilliseconds(0);
    return d;
}

function parseData(dataStr) {
    if (!dataStr) return criarDataAbsoluta(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    const partes = dataStr.substring(0, 10).split('-');
    return criarDataAbsoluta(Number(partes[0]), Number(partes[1]), Number(partes[2]));
}

function obterHoje() {
    const d = new Date();
    return criarDataAbsoluta(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function calcularDiffDias(dataMaior, dataMenor) {
    const umDiaMs = 1000 * 60 * 60 * 24;
    return Math.round((dataMaior.getTime() - dataMenor.getTime()) / umDiaMs);
}

function formatarDataVisor(data) {
    return String(data.getDate()).padStart(2, '0') + '/' + String(data.getMonth() + 1).padStart(2, '0') + '/' + data.getFullYear();
}

// Injeção de fontes elegantes para o livro de memórias
(function carregarFontesElegantes() {
    if (!document.getElementById('fontes-diario-papel')) {
        const link = document.createElement('link');
        link.id = 'fontes-diario-papel';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@1,500;1,600&family=Great+Vibes&display=swap';
        document.head.appendChild(link);
    }
})();

// =========================================================================
// 1. RENDERIZAÇÃO DA INTERFACE PRINCIPAL
// =========================================================================

window.abrirEspacoMulher = async function() {
    const usuarioId = obterUsuarioIdSeguro();
    const supabase = obterClienteSupabaseSeguro();

    window.renderizarEsqueletoEspacoMulher();
    window.processarEExibirPrevisao();
    window.atualizarInspiracaoDiaria(false);
    window.sincronizarCheckboxesRituaisHoje();
    window.renderizarPainelEvolucaoSantuario();
    window.renderizarHistoricoRadarFeminilidade();
    window.renderizarGraficoETendenciasFeminilidade();
    window.atualizarVisualizacaoMidiaMulher();
    window.renderizarHistoricoQueroVerMulher();
    window.renderizarHistoricoAssistidosMulher();
    window.renderizarHistoricoRituaisRetratil();

    if (usuarioId && supabase) {
        await window.carregarDadosCicloMulher();
        await window.carregarHistoricoSintomas();
        await window.carregarDiarioMulher();
        await window.carregarRadarFeminilidadeNuvem();
    }
};

window.fecharEspacoMulher = function() {
    window.location.href = 'index.html';
};

window.renderizarEsqueletoEspacoMulher = function() {
    const container = document.getElementById('secao-espaco-mulher');
    if (!container) return;

    const listaFilmes = (window.CatalogoFilmesMasculinos && window.CatalogoFilmesMasculinos.length) || 0;
    const listaSeries = (window.CatalogoSeriesMasculinas && window.CatalogoSeriesMasculinas.length) || 0;

    container.innerHTML = `
        <div id="vista-principal-espaco-mulher">
            
            <!-- LINHA 1 SUPERIOR: BOTÃO VOLTAR -->
            <div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:12px;">
                <button type="button" onclick="window.fecharEspacoMulher()" 
                        style="display:inline-flex; align-items:center; gap:8px; padding:8px 18px; border-radius:20px; font-size:12.5px; font-weight:800; background:rgba(255,255,255,0.92); border:1.5px solid #e9d5ff; color:#581c87; box-shadow:0 3px 10px rgba(124,58,237,0.06); backdrop-filter:blur(8px); cursor:pointer; transition:all 0.2s ease;">
                    <span style="font-size:16px; line-height:1;">←</span>
                    <span>Voltar ao Lar</span>
                </button>
            </div>

            <!-- LINHA 2: CABEÇALHO -->
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px; padding:2px 4px;">
                <div style="width:70px; height:70px; border-radius:22px; background:linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); border:1.8px solid #d8b4fe; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 8px 20px rgba(124,58,237,0.16);">
                    <img class="avatar-espaco-pessoal" src="${window.esc(Suiri.imageUrl(window.perfilAtual?.avatar_url || 'assets/icons-modern/icone-pessoa-escopo.svg'))}" alt="Foto do usuário">
                </div>
                <div style="flex:1; min-width:0;">
                    <h1 style="margin:0; font-size:26px; font-weight:900; color:#3b0764; letter-spacing:-0.5px; line-height:1.15;">Espaço Mulher</h1>
                    <span style="font-size:12.5px; color:#6b21a8; font-weight:600; display:block; margin-top:3px;">Seu refúgio de ritmo, equilíbrio e autocuidado</span>
                </div>
            </div>

            <nav class="atalhos-mulher-compactos" aria-label="Ferramentas do espaço feminino">
                <button type="button" onclick="window.abrirPaginaDiario()"><img src="assets/icons-modern/diario.svg" alt=""><span>Diário</span></button>
                <button type="button" onclick="window.abrirModalRegistroCiclo()"><img src="assets/icons-modern/ciclo.svg" alt=""><span>Ciclo</span></button>
                <button type="button" onclick="window.abrirModalMinutoZen()"><img src="assets/icons-modern/zen.svg" alt=""><span>Minuto Zen</span></button>
                <button type="button" onclick="window.abrirModoAcolhimentoEmergencia()"><img src="assets/icons-modern/alivio.svg" alt=""><span>Alívio</span></button>
            </nav>

            <!-- 1. FASE MENSTRUAL & ROTEIRO EM LINHA DOS 4 ESTÁGIOS -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #7c3aed; text-align:center; padding:18px 16px 16px 16px; border-radius:24px; box-shadow:0 8px 24px rgba(88,28,135,0.05); position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:10.5px; font-weight:800; color:#6b21a8; text-transform:uppercase; letter-spacing:1px; background:#f3e8ff; padding:2px 10px; border-radius:20px;">Jornada do Ciclo</span>
                    <span id="lbl-status-estagio-resumo" style="font-size:11px; font-weight:800; color:#7c3aed; background:#faf5ff; border:1px solid #d8b4fe; padding:2px 8px; border-radius:10px;">Estágio 1 • Menstrual</span>
                </div>

                <div id="display-fase-ciclo-atual" style="font-size:22px; font-weight:900; color:#3b0764; margin-bottom:4px;">Ciclo Natural</div>
                <p id="txt-previsao-proxima-menstruacao" style="font-size:12px; color:#581c87; margin:0 0 3px 0; font-weight:600;">Toque em 'Ciclo' para registar a sua data.</p>
                <span id="txt-data-base-calculo" style="font-size:10.5px; color:#7e22ce; display:block; margin-bottom:14px; font-weight:600;"></span>
                
                <div class="jornada-ciclo">
                    <div class="ciclo-progresso-cabecalho"><span>Seu ciclo, dia a dia</span><strong id="ciclo-dia-progresso">Registre o início do ciclo</strong></div>
                    <div id="trilha-ciclo" class="trilha-ciclo" role="progressbar" aria-label="Progresso estimado do ciclo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="linha-progresso-estagios"></div><div id="divisoes-ciclo"></div></div>
                    <div class="legenda-fases-ciclo">
                        <button type="button" id="marco-estagio-1" onclick="window.abrirModalOrientacoesFase('geral', 1)"><span class="fase-traco fase-1"></span><strong class="titulo-estagio">Menstrual</strong><span class="sub-estagio" id="sub-estagio-1">—</span></button>
                        <button type="button" id="marco-estagio-2" onclick="window.abrirModalOrientacoesFase('geral', 2)"><span class="fase-traco fase-2"></span><strong class="titulo-estagio">Folicular</strong><span class="sub-estagio" id="sub-estagio-2">—</span></button>
                        <button type="button" id="marco-estagio-3" onclick="window.abrirModalOrientacoesFase('geral', 3)"><span class="fase-traco fase-3"></span><strong class="titulo-estagio">Ovulatória</strong><span class="sub-estagio" id="sub-estagio-3">—</span></button>
                        <button type="button" id="marco-estagio-4" onclick="window.abrirModalOrientacoesFase('geral', 4)"><span class="fase-traco fase-4"></span><strong class="titulo-estagio">Lútea</strong><span class="sub-estagio" id="sub-estagio-4">—</span></button>
                    </div><p class="ciclo-nota">Toque em uma fase para conhecer seus detalhes.</p>
                </div>

                <!-- CARD DE ESTIMATIVA: CHEGADA MÉDIA DO PRÓXIMO ESTÁGIO -->
                <p class="suiri-hint">As fases são estimativas baseadas nos registros e podem variar. Não use este cálculo como método contraceptivo.</p><div id="box-previsao-proximo-estagio" style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:14px; padding:10px 12px; margin-top:14px; text-align:left; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:20px; line-height:1;">⏳</span>
                    <div style="flex:1;">
                        <span style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px; display:block;">Próximo Marco Biológico:</span>
                        <p id="txt-estimativa-proximo-estagio" style="margin:2px 0 0 0; font-size:11.5px; color:#3b0764; font-weight:700; line-height:1.35;">
                            Aguardando configuração do ciclo...
                        </p>
                    </div>
                </div>

                <!-- CABEÇALHO DA SUA VIBE & SENSAÇÕES -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; margin-bottom:6px; padding:0 2px;">
                    <div style="text-align:left;">
                        <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:5px;">
                            <span>✨</span> Sua Vibe: Como Você Pode Estar se Sentindo
                        </span>
                        <span style="font-size:10px; color:#6b21a8; font-weight:600; display:block; margin-top:1px;">
                            Toque nos cards para ver como melhor lidar com esta fase
                        </span>
                    </div>
                    <button type="button" onclick="window.abrirModalOrientacoesFase('geral')" 
                            style="background:#faf5ff; border:1px solid #d8b4fe; color:#7c3aed; border-radius:10px; padding:4px 9px; font-size:10.5px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px; flex-shrink:0; box-shadow:0 1px 3px rgba(124,58,237,0.06);" 
                            title="Ver orientações completas da fase">
                        <span>📖</span> Guia da Fase
                    </button>
                </div>

                <!-- PAINEL BIOLÓGICO: FERTILIDADE, LIBIDO & ENERGIA (INTERATIVO COM MODAL) -->
                <div id="painel-biologico-estagio" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                    <!-- Card 1: Fertilidade / Gravidez -->
                    <div onclick="window.abrirModalOrientacoesFase('fertilidade')" 
                         style="background:#fdf2f8; border:1px solid #fbcfe8; border-radius:14px; padding:10px 8px; text-align:center; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;"
                         title="Estimativa do ciclo; não usar como método contraceptivo">
                        <span style="font-size:16px; display:block; margin-bottom:2px;">🍼</span>
                        <span style="font-size:9.5px; font-weight:800; color:#9d174d; text-transform:uppercase; letter-spacing:0.3px; display:block;">Fertilidade</span>
                        <strong id="badge-bio-fertilidade" style="font-size:11px; font-weight:800; color:#be185d; display:block; margin-top:3px; line-height:1.2;">Mínima</strong>
                        <span id="sub-bio-fertilidade" style="font-size:9px; color:#9d174d; display:block; margin-top:2px;">Pouco propenso</span>
                        <span style="font-size:8.5px; color:#be185d; font-weight:700; display:block; margin-top:5px; text-decoration:underline;">Ver dicas ↗</span>
                    </div>

                    <!-- Card 2: Libido / Magnetismo -->
                    <div onclick="window.abrirModalOrientacoesFase('libido')" 
                         style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:14px; padding:10px 8px; text-align:center; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;"
                         title="Toque para ver orientações de libido e intimidade">
                        <span style="font-size:16px; display:block; margin-bottom:2px;">🔥</span>
                        <span style="font-size:9.5px; font-weight:800; color:#6b21a8; text-transform:uppercase; letter-spacing:0.3px; display:block;">Libido</span>
                        <strong id="badge-bio-libido" style="font-size:11px; font-weight:800; color:#7c3aed; display:block; margin-top:3px; line-height:1.2;">Em recolhimento</strong>
                        <span id="sub-bio-libido" style="font-size:9px; color:#6b21a8; display:block; margin-top:2px;">Foco em carinho</span>
                        <span style="font-size:8.5px; color:#7c3aed; font-weight:700; display:block; margin-top:5px; text-decoration:underline;">Ver dicas ↗</span>
                    </div>

                    <!-- Card 3: Energia & Vitalidade -->
                    <div onclick="window.abrirModalOrientacoesFase('energia')" 
                         style="background:#fefce8; border:1px solid #fef08a; border-radius:14px; padding:10px 8px; text-align:center; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;"
                         title="Toque para ver orientações de energia e disposição">
                        <span style="font-size:16px; display:block; margin-bottom:2px;">⚡</span>
                        <span style="font-size:9.5px; font-weight:800; color:#854d0e; text-transform:uppercase; letter-spacing:0.3px; display:block;">Energia</span>
                        <strong id="badge-bio-energia" style="font-size:11px; font-weight:800; color:#a16207; display:block; margin-top:3px; line-height:1.2;">Bateria Baixa</strong>
                        <span id="sub-bio-energia" style="font-size:9px; color:#854d0e; display:block; margin-top:2px;">Repouso & Ninho</span>
                        <span style="font-size:8.5px; color:#a16207; font-weight:700; display:block; margin-top:5px; text-decoration:underline;">Ver dicas ↗</span>
                    </div>
                </div>

                <!-- Barra de Progresso Geral do Ciclo -->
                <div style="background:#f3e8ff; border-radius:12px; height:6px; width:100%; overflow:hidden; margin-top:14px;">
                    <div id="barra-progresso-ciclo" style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:35%; border-radius:12px;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10.5px; font-weight:800; color:#6b21a8;">
                    <span id="txt-dia-ciclo-atual">Dia 1</span>
                    <span id="txt-dia-ciclo-final">Dia 28</span>
                </div>

                <!-- CONSELHO BIOLÓGICO -->
                <div style="border-top:1.5px solid #d8b4fe; padding-top:14px; margin-top:14px; text-align:left; display:flex; align-items:flex-start; gap:12px;">
                    <img id="icone-dica-diaria-img" src="assets/icons-modern/icone-mulher.svg" alt="Fase" style="width:42px; height:42px; object-fit:contain; flex-shrink:0;">
                    <div style="flex:1;">
                        <strong style="font-size:11.5px; color:#3b0764; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:3px;">Conselho Biológico da Fase</strong>
                        <p id="txt-dica-diaria-ciclo" style="font-size:12px; color:#581c87; margin:0; line-height:1.45; font-weight:500;">A carregar orientação...</p>
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top:14px;">
                    <button type="button" onclick="window.registrarMenstruacaoHojeRapido()" 
                            style="display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:12px; font-size:11.5px; font-weight:800; background:linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color:#ffffff; border:none; box-shadow:0 3px 8px rgba(225,29,72,0.22); cursor:pointer; transition:transform 0.15s ease;">
                        <span>🩸</span>
                        <span>Menstruei hoje</span>
                    </button>
                </div>
            </div>

            <!-- 2. INSPIRAÇÃO LITERÁRIA E ALMA -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #a855f7; margin-top:14px; padding:15px 18px; border-radius:20px; box-shadow:0 4px 14px rgba(88,28,135,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="assets/icons-modern/icone-lampada-pense.svg" alt="Inspiração" style="width:30px; height:30px; object-fit:contain;">
                        <strong style="font-size:13px; color:#3b0764; font-weight:800;">Inspiração Literária & Alma</strong>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" onclick="window.atualizarInspiracaoDiaria(true)" 
                                style="background:#faf5ff; border:1px solid #d8b4fe; color:#6b21a8; font-size:11px; font-weight:800; border-radius:8px; padding:4px 8px; cursor:pointer;" title="Sortear outra inspiração">
                            🔀 Outra
                        </button>
                        <button type="button" onclick="window.atualizarInspiracaoDiaria(false)" 
                                style="background:#f3e8ff; border:1px solid #c084fc; color:#581c87; font-size:11px; font-weight:800; border-radius:8px; padding:4px 8px; cursor:pointer;" title="Voltar à inspiração do dia">
                            📅 De Hoje
                        </button>
                    </div>
                </div>
                <p id="txt-inspiracao-diaria" style="font-size:12.5px; color:#4c1d95; margin:0; line-height:1.55; font-style:italic; font-weight:600;">
                    A carregar reflexão da alma...
                </p>
            </div>

            <!-- 3. COMO SE SENTE HOJE -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #ec4899; border-radius:20px; margin-top:14px; padding:16px 18px; box-shadow:0 4px 14px rgba(88,28,135,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <div>
                        <h4 style="font-size:14px; font-weight:900; color:#3b0764; margin:0;">Como se sente hoje</h4>
                        <span style="font-size:11.5px; color:#6b21a8; font-weight:600; display:block; margin-top:2px;">Um espaço para demonstrar suas sensações e emoções.</span>
                    </div>
                    <button type="button" id="btn-toggle-sintomas-bloco" 
                            style="padding:7px 16px; font-size:11.5px; border-radius:12px; font-weight:800; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; border:none; cursor:pointer; flex-shrink:0; box-shadow:0 3px 10px rgba(236,72,153,0.25);"
                            onclick="window.alternarSecaoComoSeSenteHoje()">
                        Responder
                    </button>
                </div>

                <!-- CORPO RETRÁTIL EXPANSÍVEL -->
                <div id="bloco-corpo-sintomas-retratil" class="oculto" style="margin-top:12px; border-top:1.5px solid #d8b4fe; padding-top:10px;">
                    <!-- 1. Estado Emocional -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🌸 Estado Emocional:</span>
                            <strong id="badge-sint-emocional" style="font-size:10.5px; color:#581c87; background:#f3e8ff; padding:2px 8px; border-radius:6px;">Estável / Serena 🧘‍♀️</strong>
                        </div>
                        <input type="range" id="range-sint-emocional" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('emocional')">
                    </div>

                    <!-- 2. Conforto Físico & Dores -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🌿 Conforto Físico & Dores:</span>
                            <strong id="badge-sint-fisico" style="font-size:10.5px; color:#047857; background:#dcfce7; padding:2px 8px; border-radius:6px;">Corpo Leve / Sem Dores 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-fisico" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#10b981; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('fisico')">
                    </div>

                    <!-- 3. Disposição & Energia -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">⚡ Disposição & Energia:</span>
                            <strong id="badge-sint-energia" style="font-size:10.5px; color:#b45309; background:#fef3c7; padding:2px 8px; border-radius:6px;">Ritmo Moderado 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-energia" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#f59e0b; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('energia')">
                    </div>

                    <!-- 4. Comunicação & Expressão -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">💬 Comunicação & Expressão:</span>
                            <strong id="badge-sint-comunicacao" style="font-size:10.5px; color:#1d4ed8; background:#dbeafe; padding:2px 8px; border-radius:6px;">Conversa Normal 🗣️</strong>
                        </div>
                        <input type="range" id="range-sint-comunicacao" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#3b82f6; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('comunicacao')">
                    </div>

                    <!-- 5. Sociabilidade & Companhia -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🛋️ Sociabilidade & Companhia:</span>
                            <strong id="badge-sint-social" style="font-size:10.5px; color:#6b21a8; background:#ede9fe; padding:2px 8px; border-radius:6px;">Neutra / Equilibrada ☕</strong>
                        </div>
                        <input type="range" id="range-sint-social" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#8b5cf6; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('social')">
                    </div>

                    <!-- 6. Paz Mental & Clareza -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🧠 Paz Mental & Clareza:</span>
                            <strong id="badge-sint-pazmental" style="font-size:10.5px; color:#0e7490; background:#cffafe; padding:2px 8px; border-radius:6px;">Pensamentos Sob Controle 🧘‍♀️</strong>
                        </div>
                        <input type="range" id="range-sint-pazmental" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#06b6d4; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('pazmental')">
                    </div>

                    <!-- 7. Paciência & Tolerância (TPM) -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🕊️ Paciência & Tolerância:</span>
                            <strong id="badge-sint-paciencia" style="font-size:10.5px; color:#9d174d; background:#fce7f3; padding:2px 8px; border-radius:6px;">Tolerância Normal 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-paciencia" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#ec4899; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('paciencia')">
                    </div>

                    <!-- 8. Autoestima & Amor-Próprio -->
                    <div style="padding:8px 0; margin-bottom:6px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">👑 Autoestima & Amor-Próprio:</span>
                            <strong id="badge-sint-autoestima" style="font-size:10.5px; color:#701a75; background:#fae8ff; padding:2px 8px; border-radius:6px;">Confortável Consigo Mesma 💃</strong>
                        </div>
                        <input type="range" id="range-sint-autoestima" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#d946ef; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('autoestima')">
                    </div>
                    
                    <div style="display:flex; justify-content:flex-end; align-items:center; border-top:1.5px solid #d8b4fe; padding-top:10px;">
                        <button type="button" class="btn-principal" style="width:auto; padding:8px 24px; font-size:12px; font-weight:800; border-radius:12px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); border:none; color:#fff; cursor:pointer;" onclick="window.salvarRegistroSintomaDiario()">Registar</button>
                    </div>
                </div>
            </div>

            <!-- HISTÓRICO COM GRÁFICO TEMPORAL DE SINTOMAS & HUMOR -->
            <div id="container-historico-sintomas-ciclos" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div>

            <!-- 4. O SANTUÁRIO (RITUAIS & EVOLUÇÃO) -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #9333ea; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="assets/icons-modern/icone-mulher.svg" alt="Rituais" style="width:24px; height:24px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">O Santuário (Rituais & Evolução)</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span id="streak-rituais-mulher" style="font-size:11.5px; font-weight:800; color:#6b21a8; background:#f3e8ff; padding:3px 8px; border-radius:8px; border:1px solid #d8b4fe; display:inline-flex; align-items:center; gap:4px;">
                            <img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> 0 dias
                        </span>
                        <button type="button" style="background:#faf5ff; border:1px solid #d8b4fe; color:#581c87; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.abrirModalEditarMetasMulher()" title="Editar metas">
                            <img src="assets/icons-modern/icones-configuracao.svg" alt="Configuração" style="width:16px; height:16px; object-fit:contain;">
                        </button>
                    </div>
                </div>

                <!-- Grau de Florescimento & XP -->
                <div id="painel-nivel-mulher" style="margin-bottom:14px; padding-bottom:12px; border-bottom:1.5px solid #d8b4fe;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div>
                            <span style="font-size:10px; font-weight:800; color:#6b21a8; text-transform:uppercase;">Grau de Constância:</span>
                            <h4 id="lbl-nome-nivel-mulher" style="margin:2px 0 0 0; font-size:13.5px; color:#3b0764; font-weight:900;">Despertar Serena</h4>
                        </div>
                        <span id="lbl-xp-mulher" style="font-size:11px; font-weight:800; color:#7c3aed; background:#ede9fe; padding:2px 8px; border-radius:6px; border:1px solid #d8b4fe;">0 XP</span>
                    </div>
                    <div style="background:#f3e8ff; border-radius:8px; height:6px; width:100%; overflow:hidden; margin-bottom:4px;">
                        <div id="barra-xp-mulher" style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:0%; transition:width 0.4s ease;"></div>
                    </div>
                    <span id="lbl-info-prox-nivel-mulher" style="font-size:10px; color:#581c87; display:block; text-align:right; font-weight:600;">Faltam 0 XP para o próximo nível</span>
                </div>

                <!-- Métricas Semanal e Mensal Integradas -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; padding-bottom:12px; border-bottom:1.5px solid #d8b4fe;">
                    <div>
                        <span style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; display:block; margin-bottom:4px;">🎯 Meta Semanal</span>
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                            <strong id="lbl-meta-sem-mulher" style="font-size:12.5px; color:#3b0764;">0 / 25</strong>
                            <span id="lbl-meta-sem-mulher-pct" style="font-size:11px; font-weight:800; color:#7c3aed;">0%</span>
                        </div>
                        <div style="background:#f3e8ff; border-radius:6px; height:5px; width:100%; overflow:hidden;">
                            <div id="barra-meta-sem-mulher" style="background:#7c3aed; height:100%; width:0%;"></div>
                        </div>
                    </div>

                    <div>
                        <span style="font-size:10px; font-weight:800; color:#059669; text-transform:uppercase; display:block; margin-bottom:4px;">📊 Desempenho Mês</span>
                        <div style="display:flex; justify-content:space-between; align-items:baseline;">
                            <strong id="lbl-stats-rituais-mes" style="font-size:12.5px; color:#3b0764;">0 rituais</strong>
                            <span id="lbl-stats-perfeitos-mes" style="font-size:10px; font-weight:800; color:#059669; background:#ecfdf5; padding:2px 6px; border-radius:6px; border:1px solid #a7f3d0;">0 dias 100%</span>
                        </div>
                        <span id="lbl-stats-taxa-mes-mulher" style="font-size:10px; color:#047857; display:block; margin-top:4px; font-weight:600;">Taxa: 0% de adesão</span>
                    </div>
                </div>

                <!-- 6 METAS DE HOJE -->
                <div id="container-grid-metas-mulher" style="display:flex; flex-direction:column; gap:2px;"></div>

                <!-- Insígnias & Conquistas Retrátil -->
                <div style="margin-top:14px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-conquistas-mulher', 'seta-conquistas-mulher')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 2px; border-top:1.5px solid #d8b4fe;">
                        <span style="font-size:11.5px; font-weight:800; color:#581c87;">🌸 Insígnias de Florescimento (<span id="contador-conquistas-mulher">0/6</span>)</span>
                        <span id="seta-conquistas-mulher" style="font-size:11px; color:#7c3aed; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-conquistas-mulher" class="oculto" style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:6px;"></div>
                </div>

                <!-- Histórico Retrátil dos Rituais -->
                <div style="margin-top:6px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-historico-rituais', 'seta-hist-rituais')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 2px; border-top:1.5px solid #d8b4fe;">
                        <span style="font-size:11.5px; font-weight:800; color:#581c87;">Histórico dos Rituais (<span id="contador-historico-rituais">0</span>)</span>
                        <span id="seta-hist-rituais" style="font-size:11px; color:#7c3aed; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-historico-rituais" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>

            <!-- 5. RADAR DE FEMINILIDADE -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #7c3aed; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/love.svg';" alt="Radar de Feminilidade" style="width:32px; height:32px; object-fit:contain;">
                        <div>
                            <strong style="font-size:13.5px; color:#3b0764; font-weight:800; display:block;">Radar de Feminilidade</strong>
                            <span style="font-size:11px; color:#6b21a8; font-weight:600;">Um espaço para demonstrar suas sensações e emoções.</span>
                        </div>
                    </div>
                    <button type="button" id="btn-toggle-radar-bloco" 
                            style="padding:7px 16px; font-size:11.5px; border-radius:12px; font-weight:800; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; border:none; cursor:pointer; flex-shrink:0; box-shadow:0 3px 10px rgba(124,58,237,0.25);"
                            onclick="window.alternarSecaoRadarFeminilidade()">
                        Responder
                    </button>
                </div>

                <!-- CORPO RETRÁTIL DO RADAR DE FEMINILIDADE -->
                <div id="bloco-corpo-radar-retratil" class="oculto" style="margin-top:12px; border-top:1.5px solid #d8b4fe; padding-top:10px;">
                    <div style="margin-bottom:12px;">
                        <label style="font-size:11px; font-weight:800; color:#581c87; display:block; margin-bottom:4px;">Última Conexão Íntima a Dois:</label>
                        <input type="date" id="slider-data-relacao-fem" style="width:100%; box-sizing:border-box; padding:8px 12px; border-radius:12px; border:1px solid #d8b4fe; font-size:12px; background:#faf5ff; color:#3b0764; outline:none; font-weight:600;">
                    </div>

                    <!-- Slider 1: Vitalidade & Brilho -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                                <img src="assets/icons-modern/icone-energia.svg" alt="Vitalidade" style="width:16px; height:16px; object-fit:contain;">
                                Vitalidade & Brilho:
                            </span>
                            <strong id="badge-vitalidade-valor" style="font-size:10.5px; color:#581c87; background:#ede9fe; padding:2px 8px; border-radius:6px;">Equilíbrio / Estável</strong>
                        </div>
                        <input type="range" id="range-vitalidade-fem" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('vitalidade')">
                    </div>

                    <!-- Slider 2: Paz Mental & Carga Emocional -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                                <img src="assets/icons-modern/icone-estresse.svg" alt="Paz Mental" style="width:16px; height:16px; object-fit:contain;">
                                Paz Mental & Leveza:
                            </span>
                            <strong id="badge-pazmental-valor" style="font-size:10.5px; color:#7e22ce; background:#ede9fe; padding:2px 8px; border-radius:6px;">Serena / Em Paz</strong>
                        </div>
                        <input type="range" id="range-pazmental-fem" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#a855f7; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('paz_mental')">
                    </div>

                    <!-- Slider 3: Afeto & Libido / Conexão -->
                    <div style="padding:8px 0; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                                <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-fogo.svg';" alt="Afeto" style="width:16px; height:16px; object-fit:contain;">
                                Afeto & Magnetismo:
                            </span>
                            <strong id="badge-afeto-valor" style="font-size:10.5px; color:#9333ea; background:#ede9fe; padding:2px 8px; border-radius:6px;">Conexão Serena</strong>
                        </div>
                        <input type="range" id="range-afeto-fem" min="1" max="5" value="3" step="0.01" style="width:100%; accent-color:#9333ea; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('afeto_libido')">
                    </div>

                    <div style="text-align:right; margin-bottom:12px;">
                        <button type="button" class="btn-principal" style="padding:8px 20px; font-size:12px; border-radius:12px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; border:none; font-weight:800; cursor:pointer;" onclick="window.salvarRadarFeminilidadeCompleto()">Registar</button>
                    </div>

                    <!-- DIAGNÓSTICO E CURVAS TEMPORAIS (SVG) -->
                    <div style="border-top:1.5px solid #d8b4fe; padding-top:10px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:11px; font-weight:800; color:#581c87;">Curva Biológica & Emocional (Últimos 7):</span>
                            <div style="display:flex; gap:8px; font-size:10px; font-weight:700;">
                                <span style="color:#7c3aed;">● Vitalidade</span>
                                <span style="color:#e11d48;">● Sobrecarga/TPM</span>
                            </div>
                        </div>
                        <div id="container-grafico-svg-mulher" style="width:100%; height:80px; display:flex; align-items:center; justify-content:center;"></div>
                    </div>

                    <!-- Comparativo de Semanas Integrado -->
                    <div id="bloco-comparativo-semanas-mulher" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;"></div>

                    <!-- Insight de Tendências -->
                    <div id="texto-insight-tendencia-mulher" style="font-size:11.5px; color:#3b0764; line-height:1.45; font-weight:600; padding:8px 10px; border-left:3px solid #7c3aed; margin-bottom:12px;">
                        Registe as suas avaliações diárias para identificar tendências biológicas e padrões emocionais.
                    </div>

                    <!-- Histórico Confidencial Retrátil do Radar -->
                    <div style="border-top:1.5px solid #d8b4fe; padding-top:8px;">
                        <div onclick="window.alternarRetratilGenerico('bloco-historico-radar-fem', 'seta-hist-radar-fem')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:6px 2px;">
                            <span style="font-size:11.5px; font-weight:800; color:#581c87; display:inline-flex; align-items:center; gap:6px;">
                                <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/love.svg';" alt="Love" style="width:14px; height:14px; object-fit:contain;">
                                Histórico do Radar (<span id="contador-historico-radar-fem">0</span>)
                            </span>
                            <span id="seta-hist-radar-fem" style="font-size:11px; color:#7c3aed; transition:transform 0.2s ease;">▼</span>
                        </div>
                        <div id="bloco-historico-radar-fem" class="oculto" style="margin-top:6px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                            <div id="lista-historico-radar-fem" style="display:flex; flex-direction:column; gap:6px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 6. CURADORIA DE FILMES & SÉRIES -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #6b21a8; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="assets/icons-modern/icone-filme.svg" alt="Filmes" style="width:24px; height:24px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">Curadoria de Obras</strong>
                    </div>
                    <div style="display:flex; gap:4px; background:#f3e8ff; padding:2px; border-radius:10px;">
                        <button type="button" id="btn-aba-filmes-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:#7c3aed; color:#fff;" onclick="window.alternarAbaMidiaMulher('filmes')">Filmes (${listaFilmes || 200})</button>
                        <button type="button" id="btn-aba-series-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#581c87;" onclick="window.alternarAbaMidiaMulher('series')">Séries (${listaSeries || 250})</button>
                    </div>
                </div>

                <div id="card-carrossel-midia-mulher" style="border-radius:16px; overflow:hidden;">
                    <div style="position:relative; width:100%; height:220px; background:#2e1065; overflow:hidden; display:flex; align-items:center; justify-content:center; border-radius:16px;">
                        <img id="midia-mulher-poster-img" src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80" alt="Capa da Obra" 
                             style="width:100%; height:100%; object-fit:cover; display:block; transition:opacity 0.3s ease;">
                        
                        <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(46,16,101,0.1) 0%, rgba(46,16,101,0.92) 100%); pointer-events:none;"></div>
                        
                        <div style="position:absolute; bottom:12px; left:14px; right:14px; z-index:2;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <span id="midia-mulher-categoria" style="font-size:9.5px; font-weight:800; background:#f3e8ff; color:#581c87; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Categoria</span>
                                <span id="midia-mulher-tempo" style="font-size:11px; font-weight:700; color:#faf5ff;">-</span>
                            </div>
                            <h3 id="midia-mulher-titulo" style="margin:0; font-size:17.5px; color:#ffffff; font-weight:900; line-height:1.2;">Título</h3>
                        </div>
                    </div>

                    <div style="padding:12px 2px 2px 2px;">
                        <div id="box-momento-mulher" style="border-left:3px solid #a855f7; padding-left:8px; margin-bottom:10px;">
                            <span style="font-size:9.5px; font-weight:800; color:#7c3aed; text-transform:uppercase; display:block;">Recomendação do Acervo</span>
                            <p id="midia-mulher-momento" style="font-size:11.5px; color:#3b0764; margin:1px 0 0 0; line-height:1.4; font-weight:600;"></p>
                        </div>

                        <p id="midia-mulher-desc" style="font-size:12px; color:#4c1d95; margin:0 0 10px 0; line-height:1.45;">Carregando sinopse...</p>

                        <!-- PAINEL ONDE ASSISTIR COM LOGOS E LINKS DIRETOS -->
                        <div id="container-onde-assistir-mulher" style="background:#faf5ff; border:1px solid #d8b4fe; padding:10px 12px; border-radius:12px; margin-bottom:12px; display:none;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size:10px; font-weight:800; color:#6b21a8; text-transform:uppercase;">📺 Onde Assistir (Toque para Abrir):</span>
                                <a id="midia-mulher-link-justwatch" href="#" target="_blank" rel="noopener noreferrer" style="font-size:10px; font-weight:700; color:#7c3aed; text-decoration:none;">Mais opções ↗</a>
                            </div>
                            <div id="provedores-streaming-mulher" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;"></div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                            <div id="midia-mulher-generos" style="display:flex; gap:4px; flex-wrap:wrap;"></div>
                            <div id="midia-mulher-posicao-contador" style="font-size:10px; font-weight:800; color:#6b21a8; background:#f3e8ff; padding:2px 8px; border-radius:6px; border:1px solid #d8b4fe;">1 / 200</div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1.5px solid #d8b4fe; padding-top:10px; flex-wrap:wrap; gap:8px;">
                            <div style="display:flex; gap:6px; align-items:center;">
                                <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #d8b4fe; color:#6b21a8; cursor:pointer;" onclick="window.navegarCarrosselMidiaMulher(-1)" title="Obra Anterior">◄</button>
                                <button type="button" class="btn-secundario" style="padding:0 12px; height:34px; border-radius:10px; font-size:11.5px; font-weight:800; background:#f3e8ff; color:#581c87; border:1px solid #d8b4fe; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.sortearMidiaMulherAleatoria()" title="Sortear Aleatório">
                                    <span>🔀</span>
                                    <span>Aleatório</span>
                                </button>
                                <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #d8b4fe; color:#6b21a8; cursor:pointer;" onclick="window.navegarCarrosselMidiaMulher(1)" title="Próxima Obra">►</button>
                            </div>
                            
                            <div style="display:flex; gap:6px; align-items:center;">
                                <button type="button" id="btn-quero-ver-mulher" style="padding:7px 11px; font-size:11px; border-radius:10px; font-weight:800; background:#ede9fe; color:#581c87; border:1px solid #c084fc; cursor:pointer;" onclick="window.alternarQueroAssistirMulher()">
                                    📌 Quero Assistir
                                </button>
                                <button type="button" id="btn-marcar-assistido-mulher" style="padding:7px 12px; font-size:11.5px; border-radius:10px; font-weight:800; background:#7c3aed; color:#fff; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.abrirModalAvaliacaoMidiaMulher()">
                                    <img src="assets/icons-modern/icone-check.svg" alt="Assistido" style="width:16px; height:16px; object-fit:contain;"> Já Assisti
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="caixa-avaliacao-midia-mulher" class="oculto" style="margin-top:10px; background:#faf5ff; border:1.5px solid #c084fc; border-radius:14px; padding:12px; text-align:center;">
                    <span style="font-size:12px; font-weight:800; color:#581c87; display:block; margin-bottom:6px;">Quantas estrelas dá a esta obra?</span>
                    <div style="display:flex; justify-content:center; gap:8px; margin-bottom:8px;">
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(1)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(2)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(3)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(4)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(5)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:10.5px; border-radius:8px; color:#581c87; border:1px solid #d8b4fe;" onclick="document.getElementById('caixa-avaliacao-midia-mulher').classList.add('oculto')">Cancelar</button>
                </div>

                <!-- GAVETA 1: QUERO ASSISTIR (RETRÁTIL) -->
                <div style="margin-top:14px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-quero-ver-mulher', 'seta-quero-ver-mulher')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 2px; border-top:1.5px solid #d8b4fe;">
                        <span style="font-size:11.5px; font-weight:800; color:#3b0764;">📌 Quero Assistir (<span id="contador-quero-ver-mulher">0</span>)</span>
                        <span id="seta-quero-ver-mulher" style="font-size:11px; color:#6b21a8; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-quero-ver-mulher" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
                </div>

                <!-- GAVETA 2: OBRAS AVALIADAS (RETRÁTIL) -->
                <div style="margin-top:6px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-assistidos-mulher', 'seta-assistidos-mulher')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 2px; border-top:1.5px solid #d8b4fe;">
                        <span style="font-size:11.5px; font-weight:800; color:#3b0764;">⭐ Obras Avaliadas (<span id="contador-assistidos-mulher">0</span>) • Mais Bem Avaliadas</span>
                        <span id="seta-assistidos-mulher" style="font-size:11px; color:#6b21a8; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-assistidos-mulher" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
                </div>
            </div>

            <!-- 7. INDICAÇÕES DE PLAYLIST E YOUTUBE -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #10b981; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(16,185,129,0.05);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <span style="font-size:18px;">🎧</span>
                    <strong style="font-size:13.5px; color:#065f46; font-weight:800;">Refúgio Sonoro & Bem-Estar</strong>
                </div>

                <span style="font-size:10.5px; font-weight:800; color:#059669; text-transform:uppercase; display:block; margin-bottom:6px; letter-spacing:0.5px;">🎵 Playlists de Equilíbrio (Spotify)</span>
                <div style="display:flex; flex-direction:column; margin-bottom:14px;">
                    ${window.CatalogoPlaylistsSpotifyMulher.map((p, idx) => `
                        <div style="padding:9px 0; border-bottom:${idx === window.CatalogoPlaylistsSpotifyMulher.length - 1 ? 'none' : '1px solid #d8b4fe'}; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div style="min-width:0;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:13px;">${p.icone}</span>
                                    <strong style="font-size:12px; color:#064e3b;">${esc(p.titulo)}</strong>
                                    <span style="font-size:9.5px; font-weight:800; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:6px; border:1px solid #bbf7d0;">${p.tag}</span>
                                </div>
                                <span style="font-size:11px; color:#047857; display:block; margin-top:1px;">${p.subtitulo}</span>
                            </div>
                            <a href="${p.link}" target="_blank" rel="noopener noreferrer" style="background:#10b981; color:#ffffff; text-decoration:none; padding:5px 11px; border-radius:8px; font-size:11px; font-weight:800; flex-shrink:0;">
                                Ouvir ↗
                            </a>
                        </div>
                    `).join('')}
                </div>

                <span style="font-size:10.5px; font-weight:800; color:#7c3aed; text-transform:uppercase; display:block; margin-bottom:6px; letter-spacing:0.5px; border-top:1.5px solid #d8b4fe; padding-top:10px;">📺 Canais de Saúde & Inspiração (YouTube)</span>
                <div style="display:flex; flex-direction:column;">
                    ${window.CatalogoCanaisYoutubeMulher.map((c, idx) => `
                        <div style="padding:9px 0; border-bottom:${idx === window.CatalogoCanaisYoutubeMulher.length - 1 ? 'none' : '1px solid #d8b4fe'}; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div style="min-width:0;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:13px;">${c.icone}</span>
                                    <strong style="font-size:12px; color:#3b0764;">${esc(c.titulo)}</strong>
                                </div>
                                <span style="font-size:10px; font-weight:700; color:#7c3aed; display:block; margin-top:1px;">${c.categoria}</span>
                                <span style="font-size:11px; color:#581c87; display:block; margin-top:1px;">${c.desc}</span>
                            </div>
                            <a href="${c.link}" target="_blank" rel="noopener noreferrer" style="background:#7c3aed; color:#ffffff; text-decoration:none; padding:5px 11px; border-radius:8px; font-size:11px; font-weight:800; flex-shrink:0;">
                                Acessar ↗
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>

        </div>

        <!-- ================================================================= -->
        <!-- VISTA DE PÁGINA INTEIRA: DIÁRIO EM FOLHA DE PAPEL RÚSTICO PAGINADO -->
        <!-- ================================================================= -->
        <div id="vista-pagina-diario-mulher" class="oculto">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding: 4px 2px;">
                <button type="button" class="btn-secundario" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:700; background:#ffffff; border:1.5px solid #d5c3a5; color:#5c4426;" onclick="window.fecharPaginaDiario()">← Voltar ao Espaço</button>
                <div style="text-align:center;">
                    <h3 style="margin:0; font-size:18px; font-weight:900; color:#3b0764; font-family:'Playfair Display', serif;">Livro de Memórias</h3>
                    <span style="font-size:11px; color:#78593a; font-weight:600;">Confidências da Alma</span>
                </div>
                <button type="button" class="btn-principal" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:800; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); border:none; color:#fff;" onclick="window.salvarPaginaDiarioCompleta()">Guardar</button>
            </div>

            <div id="livro-papel-container" style="background:#fbf5e8; border:2px solid #d5c3a5; border-radius:16px; padding:22px 18px 18px 18px; box-shadow:0 12px 30px rgba(78,52,24,0.18), inset 0 0 45px rgba(213,195,165,0.35); position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; bottom:0; left:0; width:12px; background:linear-gradient(90deg, rgba(168,138,98,0.4) 0%, rgba(213,195,165,0.1) 80%, transparent 100%); pointer-events:none;"></div>
                
                <input type="hidden" id="diario-id-edit">

                <div style="margin-bottom:10px; border-bottom:1.5px solid #d8c6aa; padding-bottom:6px;">
                    <input type="text" id="diario-titulo" placeholder="Título da Página..." style="width:100%; box-sizing:border-box; border:none; background:transparent; font-size:17px; font-weight:800; color:#3c2a1a; font-family:'Playfair Display', Georgia, serif; outline:none;">
                </div>

                <div style="background:#f5eedc; border:1px solid #d8c6aa; border-radius:12px; padding:10px 12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:800; color:#5c4426; text-transform:uppercase; letter-spacing:0.5px;">Sensação Física Hoje:</span>
                        <strong id="badge-termo-fisico-diario" style="font-size:12px; font-weight:800; color:#7c3aed; background:#ede3ce; padding:2px 8px; border-radius:8px;">Mulherão 💃</strong>
                    </div>
                    <input type="range" id="range-termo-fisico-diario" min="0" max="10" value="7" step="0.01" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloTermoFisicoDiario(this.value)">
                    <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#78593a; margin-top:3px;">
                        <span>0-3: Borocochô 🥀</span>
                        <span>4-7: Mulherão 💃</span>
                        <span>8-10: Deusa ✨</span>
                    </div>
                </div>

                <div style="margin-bottom:12px; border-bottom:1px dashed #d8c6aa; padding-bottom:10px;">
                    <span style="font-size:11px; font-weight:800; color:#5c4426; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">Como você se sente nesta página?</span>
                    <div id="grid-humores-diario-botoes" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
                        <button type="button" class="btn-humor-diario-opcao" data-humor="Irritada" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:700; border-radius:8px; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; cursor:pointer;">Irritada 🌪️</button>
                        <button type="button" class="btn-humor-diario-opcao" data-humor="Frustrada" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:700; border-radius:8px; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; cursor:pointer;">Frustrada 🌧️</button>
                        <button type="button" class="btn-humor-diario-opcao" data-humor="Decepcionada" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:700; border-radius:8px; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; cursor:pointer;">Decepcionada 🍂</button>
                        <button type="button" class="btn-humor-diario-opcao" data-humor="Em Paz" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:700; border-radius:8px; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; cursor:pointer;">Em Paz 🕊️</button>
                        <button type="button" class="btn-humor-diario-opcao ativo" data-humor="Feliz" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:800; border-radius:8px; border:1.5px solid #7c3aed; background:#7c3aed; color:#ffffff; cursor:pointer;">Feliz 🌸</button>
                        <button type="button" class="btn-humor-diario-opcao" data-humor="Radiante" onclick="window.selecionarHumorDiario(this)" style="padding:6px 4px; font-size:11px; font-weight:700; border-radius:8px; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; cursor:pointer;">Radiante ✨</button>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed #d8c6aa; padding-bottom:8px;">
                    <span style="font-size:11px; font-weight:700; color:#78593a; text-transform:uppercase; letter-spacing:0.5px;">Estilo da Tinta:</span>
                    <div style="display:flex; gap:6px;">
                        <button type="button" id="btn-fonte-cursiva" style="border:none; padding:4px 10px; border-radius:8px; font-family:'Great Vibes', cursive; font-size:15px; background:#7c3aed; color:#fff; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('cursiva')">Caligrafia Elegante</button>
                        <button type="button" id="btn-fonte-forma" style="border:1px solid #d5c3a5; padding:4px 10px; border-radius:8px; font-family:'Segoe UI', sans-serif; font-size:11px; font-weight:700; background:#ffffff; color:#5c4426; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('forma')">Letra de Forma</button>
                    </div>
                    <input type="hidden" id="diario-tipo-fonte" value="cursiva">
                </div>

                <div style="position:relative; min-height:360px; background-color:transparent;">
                    <div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; background-image:linear-gradient(to bottom, transparent 33px, rgba(168,138,98,0.25) 34px); background-size:100% 34px;"></div>
                    <textarea id="diario-conteudo-pagina-ativa" rows="11" placeholder="Escreva nesta folha o que vai no coração..." 
                              style="width:100%; box-sizing:border-box; padding:4px 6px; border:none; background:transparent; font-size:18px; line-height:34px; outline:none; resize:none; font-family:'Alex Brush', 'Great Vibes', cursive; color:#2c1f14; position:relative; z-index:2;"
                              oninput="window.monitorarLimiteLinhasPagina(this)"></textarea>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; border-top:1.5px solid #d8c6aa; padding-top:10px;">
                    <button type="button" class="btn-secundario" style="padding:5px 10px; font-size:11px; font-weight:700; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; border-radius:8px;" onclick="window.navegarPaginaDiario(-1)">← Folha Anterior</button>
                    
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="indicador-pagina-diario-atual" style="font-size:12px; font-weight:800; color:#5c4426; font-family:'Playfair Display', serif;">Página 1 de 1</span>
                        <button type="button" style="padding:4px 8px; font-size:11px; font-weight:800; border-radius:8px; border:1.5px dashed #7c3aed; background:#faf5ff; color:#7c3aed; cursor:pointer;" onclick="window.adicionarNovaPaginaAoDiario()" title="Criar nova folha">+ Nova Folha</button>
                    </div>

                    <button type="button" class="btn-secundario" style="padding:5px 10px; font-size:11px; font-weight:700; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; border-radius:8px;" onclick="window.navegarPaginaDiario(1)">Próxima Folha →</button>
                </div>
            </div>

            <div style="margin-top:22px;">
                <h4 style="font-size:13.5px; font-weight:800; color:#3b0764; margin:0 0 10px 4px; text-transform:uppercase; letter-spacing:0.5px;">Capítulos Gravados Anteriores</h4>
                <div id="container-lista-diario-mulher" style="display:flex; flex-direction:column; gap:10px;">
                    <span style="font-size:11.5px; color:#6b21a8;">A carregar diário...</span>
                </div>
            </div>
        </div>

        <!-- MODAIS BOUTIQUE -->
        <div id="vista-leitura-diario-inteira" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.65); z-index:1000080; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div style="background:#fbf5e8; width:100%; max-width:480px; max-height:86vh; padding:22px; border-radius:24px; border:2px solid #d5c3a5; box-shadow:0 25px 60px rgba(59,7,100,0.3); display:flex; flex-direction:column; position:relative; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1.5px solid #d8c6aa; padding-bottom:8px;">
                    <div>
                        <span id="leitura-data-pagina" style="font-size:10.5px; font-weight:800; color:#78593a; text-transform:uppercase; letter-spacing:0.5px;">Data</span>
                        <h3 id="leitura-titulo-pagina" style="margin:2px 0 0 0; font-size:17.5px; font-weight:900; color:#3c2a1a; font-family:'Playfair Display', serif;">Título</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#5c4426; border:1px solid #d5c3a5; background:#ffffff; font-weight:800;" onclick="window.fecharLeituraDiarioInteira()">✕</button>
                </div>

                <div id="leitura-meta-badges" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;"></div>

                <div style="flex:1; position:relative; border-radius:14px; background-color:transparent; overflow-y:auto; padding:12px 6px;">
                    <div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; background-image:linear-gradient(to bottom, transparent 33px, rgba(168,138,98,0.2) 34px); background-size:100% 34px;"></div>
                    <div id="leitura-conteudo-pagina" style="font-size:18px; line-height:34px; color:#2c1f14; white-space:pre-wrap; position:relative; z-index:2; font-family:'Alex Brush', 'Great Vibes', cursive;"></div>
                </div>

                <div id="barra-nav-leitura-paginas" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px dashed #d8c6aa; padding-top:8px;">
                    <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px;" onclick="window.navegarLeituraPagina(-1)">← Anterior</button>
                    <span id="leitura-indicador-pagina" style="font-size:11.5px; font-weight:800; color:#5c4426;">Página 1</span>
                    <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px;" onclick="window.navegarLeituraPagina(1)">Próxima →</button>
                </div>

                <div style="display:flex; gap:8px; margin-top:12px; justify-content:flex-end;">
                    <button type="button" class="btn-secundario" style="border-radius:12px; padding:9px 14px; font-size:11.5px; color:#5c4426; border:1px solid #d5c3a5; font-weight:700; display:inline-flex; align-items:center; gap:5px;" onclick="window.editarPaginaAtualLeitura()">
                        <img src="assets/icons-modern/icone-editar.svg" alt="Editar" style="width:16px; height:16px; object-fit:contain;"> Editar Capítulo
                    </button>
                    <button type="button" class="btn-principal" style="border-radius:12px; padding:9px 16px; font-size:11.5px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.fecharLeituraDiarioInteira()">Fechar</button>
                </div>
            </div>
        </div>

        <div id="modal-registro-ciclo-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000050; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:360px; padding:22px; border-radius:26px; border:1.5px solid #d8b4fe; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1.5px solid #d8b4fe; padding-bottom:8px;">
                    <h3 id="titulo-modal-ciclo" style="margin:0; font-size:17px; font-weight:900; color:#3b0764;">Registrar nova menstruação</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #d8b4fe; background:#faf5ff; font-weight:800;" onclick="window.fecharModalRegistroCiclo()">✕</button>
                </div>
                <div style="flex-direction:column; gap:11px; display:flex;">
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:4px; display:block;">Primeiro dia do ciclo (início do fluxo):</label>
                        <input type="date" id="input-data-inicio-ciclo" style="border-radius:12px; width:100%; box-sizing:border-box; padding:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                        <div>
                            <label style="font-size:11px; font-weight:800; color:#581c87; margin-bottom:4px; display:block;">Dias de Fluxo:</label>
                            <input type="number" id="input-duracao-sangramento" value="5" min="1" max="15" style="border-radius:12px; width:100%; box-sizing:border-box; padding:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:800; color:#581c87; margin-bottom:4px; display:block;">Duração do Ciclo:</label>
                            <input type="number" id="input-duracao-media-ciclo" value="28" min="20" max="45" placeholder="ex: 28" style="border-radius:12px; width:100%; box-sizing:border-box; padding:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                        </div>
                    </div>

                    <div>
                        <label style="font-size:11px; font-weight:800; color:#7c3aed; margin-bottom:4px; display:block;">📢 Notificar membro no Mural da Casa:</label>
                        <select id="select-membro-notificar-ciclo" style="border-radius:12px; width:100%; box-sizing:border-box; padding:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none; font-size:12px;">
                            <option value="">🔒 Apenas para mim (Privado)</option>
                        </select>
                        <span style="font-size:10px; color:#6b21a8; display:block; margin-top:2px; line-height:1.3;">O familiar escolhido receberá um aviso gentil no mural quando a fase do seu ciclo mudar.</span>
                    </div>
                </div>
                <div id="historico-ciclos-edicao" style="margin-top:12px; max-height:170px; overflow-y:auto;"></div>
                <div style="display:flex; gap:8px; margin-top:16px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #d8b4fe; color:#581c87; font-weight:700;" onclick="window.fecharModalRegistroCiclo()">Cancelar</button>
                    <button id="btn-salvar-ciclo" type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.salvarCicloHistorico()">Registrar novo ciclo</button>
                </div>
            </div>
        </div>


        <!-- MODAL COMPLETO: ORIENTAÇÕES E DICAS PARA LIDAR COM A FASE -->
        <div id="modal-orientacoes-estagio-fase" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.65); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:14px; box-sizing:border-box;">
            <div class="modal-conteudo fase-sheet" style="background:#ffffff; width:100%; max-width:440px; max-height:88vh; padding:20px; border-radius:26px; border:1.8px solid #d8b4fe; box-shadow:0 25px 60px rgba(59,7,100,0.28); display:flex; flex-direction:column; position:relative; overflow:hidden; text-align:left;">
                
                <!-- Cabeçalho do Modal -->
                <div class="modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1.5px solid #d8b4fe; padding-bottom:10px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span id="modal-fase-emoji" style="font-size:20px;">🌸</span>
                            <h3 id="modal-fase-titulo" style="margin:0; font-size:16.5px; font-weight:900; color:#3b0764; line-height:1.2;">Fase do Ciclo</h3>
                        </div>
                        <span id="modal-fase-subtitulo" style="font-size:11px; color:#7c3aed; font-weight:700; display:block; margin-top:2px;">Estação & Dias de Referência</span>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #d8b4fe; background:#faf5ff; font-weight:800; cursor:pointer;" onclick="window.fecharModalOrientacoesFase()">✕</button>
                </div>

                <!-- Seletor Rápido das 4 Fases (Stepper Compacto) -->
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px; margin-bottom:10px; background:#faf5ff; padding:3px; border-radius:12px; border:1px solid #e9d5ff;">
                    <button type="button" id="btn-modal-fase-1" onclick="window.trocarFaseModalOrientacoes(1)" style="border:none; padding:6px 2px; font-size:10.5px; font-weight:800; border-radius:8px; cursor:pointer; background:#ffffff; color:#3b0764; box-shadow:0 1px 3px rgba(0,0,0,0.06);">1. Menstrual</button>
                    <button type="button" id="btn-modal-fase-2" onclick="window.trocarFaseModalOrientacoes(2)" style="border:none; padding:6px 2px; font-size:10.5px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#6b21a8;">2. Folicular</button>
                    <button type="button" id="btn-modal-fase-3" onclick="window.trocarFaseModalOrientacoes(3)" style="border:none; padding:6px 2px; font-size:10.5px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#6b21a8;">3. Ovulatória</button>
                    <button type="button" id="btn-modal-fase-4" onclick="window.trocarFaseModalOrientacoes(4)" style="border:none; padding:6px 2px; font-size:10.5px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#6b21a8;">4. Lútea</button>
                </div>

                <!-- Filtro de Tópicos (Pílulas Rápidas) -->
                <div style="display:flex; gap:5px; margin-bottom:12px; overflow-x:auto; padding-bottom:2px;">
                    <button type="button" id="btn-modal-topico-geral" onclick="window.trocarTopicoModalOrientacoes('geral')" style="padding:5px 10px; border-radius:20px; font-size:11px; font-weight:800; border:none; cursor:pointer; background:#7c3aed; color:#fff; white-space:nowrap;">✨ Visão Geral</button>
                    <button type="button" id="btn-modal-topico-fertilidade" onclick="window.trocarTopicoModalOrientacoes('fertilidade')" style="padding:5px 10px; border-radius:20px; font-size:11px; font-weight:800; border:1px solid #d8b4fe; cursor:pointer; background:#ffffff; color:#581c87; white-space:nowrap;">🍼 Fertilidade</button>
                    <button type="button" id="btn-modal-topico-libido" onclick="window.trocarTopicoModalOrientacoes('libido')" style="padding:5px 10px; border-radius:20px; font-size:11px; font-weight:800; border:1px solid #d8b4fe; cursor:pointer; background:#ffffff; color:#581c87; white-space:nowrap;">🔥 Libido</button>
                    <button type="button" id="btn-modal-topico-energia" onclick="window.trocarTopicoModalOrientacoes('energia')" style="padding:5px 10px; border-radius:20px; font-size:11px; font-weight:800; border:1px solid #d8b4fe; cursor:pointer; background:#ffffff; color:#581c87; white-space:nowrap;">⚡ Energia</button>
                </div>

                <!-- Corpo com Rolagem Suave -->
                <div id="modal-conteudo-orientacoes-corpo" style="flex:1; overflow-y:auto; padding-right:4px;">
                    <!-- Preenchido dinamicamente via JavaScript -->
                </div>

                <!-- Rodapé com Botão Fechar -->
                <div style="margin-top:12px; border-top:1.5px solid #d8b4fe; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:10.5px; color:#7e22ce; font-weight:600;">Autoconhecimento Biológico & Bem-Estar</span>
                    <button type="button" class="btn-principal" style="padding:8px 18px; border-radius:12px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModalOrientacoesFase()">Entendido</button>
                </div>
            </div>
        </div>


        <div id="modal-config-metas-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000060; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:390px; max-height:86vh; overflow-y:auto; padding:24px; border-radius:28px; border:1.5px solid #d8b4fe; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1.5px solid #d8b4fe; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:16.5px; font-weight:900; color:#3b0764;">Personalizar 6 Metas</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #d8b4fe; background:#faf5ff; font-weight:800;" onclick="window.fecharModalEditarMetasMulher()">✕</button>
                </div>
                <p style="font-size:11.5px; color:#6b21a8; margin:0 0 14px 0; line-height:1.4;">Defina os seus rituais inegociáveis de autocuidado diário:</p>
                <div id="container-inputs-editar-metas-mulher" style="display:flex; flex-direction:column; gap:8px;"></div>
                <div style="display:flex; gap:8px; margin-top:16px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #d8b4fe; color:#581c87; font-weight:700;" onclick="window.fecharModalEditarMetasMulher()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.salvarNovasMetasConfiguradasMulher()">Guardar</button>
                </div>
            </div>
        </div>
    `;
};

// =========================================================================
// 2. CONTROLE DO TERMÔMETRO FÍSICO E BOTÕES DE HUMOR NO DIÁRIO
// =========================================================================

