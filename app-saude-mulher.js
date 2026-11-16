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
window.dadosSintomasDiarios = [];
window.dadosDiarioMulher = [];

// Persistência das 6 Metas Diárias (O Santuário), Radar de Feminilidade e Mídia
window.dadosRituaisFemininos = JSON.parse(localStorage.getItem('suiri_rituais_fem')) || {};
window.configMetasFemininas = JSON.parse(localStorage.getItem('suiri_metas_fem_config')) || [
    "Hidratação Consciente (2L)",
    "Pausa / Leitura Inspiradora",
    "Movimento Suave / Treino",
    "Alimentação Nutritiva",
    "Momento de Silêncio / Respiração",
    "Desconexão Noturna (Zero Telas)"
];

window.dadosRadarFeminilidade = JSON.parse(localStorage.getItem('suiri_radar_fem')) || {
    vitalidade: 3,
    paz_mental: 3,
    afeto_libido: 3,
    ultima_relacao: null,
    historico: []
};

window.dadosMidiaMulherAssistida = JSON.parse(localStorage.getItem('suiri_midia_mulher_assistida')) || [];
window.dadosMidiaMulherQueroVer = JSON.parse(localStorage.getItem('suiri_midia_mulher_quero_ver')) || [];
window.indiceMidiaMulher = { filmes: 0, series: 0 };
window.abaMidiaMulherAtiva = 'filmes';

// Configuração TMDb (Sinopse em Português pt-BR, Logos Oficiais e Cache V3)
window.TMDB_API_KEY = window.TMDB_API_KEY || '340bf11ebbaf9247c353e8eb6dc824b4';
window.cacheTmdbMulher = JSON.parse(localStorage.getItem('suiri_tmdb_cache_mulher_v3')) || {};

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
                    <img src="./icone/medita.png" onerror="this.onerror=null; this.src='./icone/icone-mulher.png';" alt="Espaço Mulher" style="width:80px; height:80px; object-fit:contain;">
                </div>
                <div style="flex:1; min-width:0;">
                    <h1 style="margin:0; font-size:26px; font-weight:900; color:#3b0764; letter-spacing:-0.5px; line-height:1.15;">Espaço Mulher</h1>
                    <span style="font-size:12.5px; color:#6b21a8; font-weight:600; display:block; margin-top:3px;">Seu refúgio de ritmo, equilíbrio e autocuidado</span>
                </div>
            </div>

            <!-- LINHA 3: DIÁRIO E CICLO -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                <button type="button" onclick="window.abrirPaginaDiario()" 
                        style="width:100%; box-sizing:border-box; padding:12px 14px; border-radius:18px; border:1.5px solid #d8b4fe; background:linear-gradient(135deg, #ffffff 0%, #faf5ff 100%); color:#3b0764; box-shadow:0 4px 14px rgba(124,58,237,0.08); display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:transform 0.15s ease;">
                    <img src="./icone/diario.png" onerror="this.onerror=null; this.src='./icone/icone-livro.png'; this.style.display='inline-block';" alt="Diário" style="width:29px; height:29px; object-fit:contain; flex-shrink:0;">
                    <div style="text-align:left;">
                        <strong style="font-size:13.5px; display:block; line-height:1.2; font-weight:900;">Diário</strong>
                        <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">Memórias & Alma</span>
                    </div>
                </button>

                <button type="button" onclick="window.abrirModalRegistroCiclo()" 
                        style="width:100%; box-sizing:border-box; padding:12px 14px; border-radius:18px; border:1.5px solid #d8b4fe; background:linear-gradient(135deg, #ffffff 0%, #faf5ff 100%); color:#3b0764; box-shadow:0 4px 14px rgba(124,58,237,0.08); display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:transform 0.15s ease;">
                    <img src="./icone/ciclo.png" onerror="this.onerror=null; this.src='./icone/icone-mulher.png'; this.style.display='inline-block';" alt="Ciclo" style="width:50px; height:50px; object-fit:contain; flex-shrink:0;">
                    <div style="text-align:left;">
                        <strong style="font-size:13.5px; display:block; line-height:1.2; font-weight:900;">Ciclo</strong>
                        <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">Registar Período</span>
                    </div>
                </button>
            </div>

            <!-- BOTÕES: MINUTO ZEN & MODO ALÍVIO -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
                <button type="button" class="btn-secundario" style="padding:11px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #c084fc; background:#ffffff; color:#581c87; box-shadow:0 2px 8px rgba(124,58,237,0.08); display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="window.abrirModalMinutoZen()">
                    <img src="./icone/zen.png" onerror="this.onerror=null; this.src='./icone/icone-ioga.png';" alt="Zen" style="width:36px; height:36px; object-fit:contain;">
                    <span>Minuto Zen</span>
                </button>
                <button type="button" class="btn-secundario" style="padding:11px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #a855f7; background:#faf5ff; color:#6b21a8; box-shadow:0 2px 8px rgba(168,85,247,0.08); display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="window.abrirModoAcolhimentoEmergencia()">
                    <img src="./icone/alivio.png" onerror="this.onerror=null; this.src='./icone/icone-coracao.png';" alt="Alívio" style="width:36px; height:36px; object-fit:contain;">
                    <span>Modo Alívio (TPM)</span>
                </button>
            </div>

            <!-- 1. FASE MENSTRUAL & ROTEIRO EM LINHA DOS 4 ESTÁGIOS -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #d8b4fe; border-left:4px solid #7c3aed; text-align:center; padding:18px 16px 16px 16px; border-radius:24px; box-shadow:0 8px 24px rgba(88,28,135,0.05); position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:10.5px; font-weight:800; color:#6b21a8; text-transform:uppercase; letter-spacing:1px; background:#f3e8ff; padding:2px 10px; border-radius:20px;">Jornada do Ciclo</span>
                    <span id="lbl-status-estagio-resumo" style="font-size:11px; font-weight:800; color:#7c3aed; background:#faf5ff; border:1px solid #d8b4fe; padding:2px 8px; border-radius:10px;">Estágio 1 • Menstrual</span>
                </div>

                <div id="display-fase-ciclo-atual" style="font-size:22px; font-weight:900; color:#3b0764; margin-bottom:4px;">Ciclo Natural</div>
                <p id="txt-previsao-proxima-menstruacao" style="font-size:12px; color:#581c87; margin:0 0 3px 0; font-weight:600;">Toque em 'Ciclo' para registar a sua data.</p>
                <span id="txt-data-base-calculo" style="font-size:10.5px; color:#7e22ce; display:block; margin-bottom:14px; font-weight:600;"></span>
                
                <!-- ROTEIRO EM LINHA (STEPPER HORIZONTAL COM OS 4 ESTÁGIOS) -->
                <div style="position:relative; margin:22px 4px 14px 4px; padding:0 2px;">
                    <!-- Linha de fundo da trilha -->
                    <div style="position:absolute; top:13px; left:8%; right:8%; height:3px; background:#f3e8ff; z-index:1; border-radius:4px;"></div>
                    <!-- Linha ativa de progresso -->
                    <div id="linha-progresso-estagios" style="position:absolute; top:13px; left:8%; width:10%; height:3px; background:linear-gradient(90deg, #e11d48, #7c3aed); z-index:2; border-radius:4px; transition:width 0.4s ease;"></div>

                    <!-- 4 Estágios em Linha -->
                    <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:flex-start;">
                        <!-- Estágio 1: Menstrual -->
                        <div id="marco-estagio-1" onclick="window.abrirModalOrientacoesFase('geral', 1)" style="display:flex; flex-direction:column; align-items:center; width:24%; text-align:center; cursor:pointer;" title="Toque para ver detalhes da fase 1">
                            <div class="bolinha-estagio" style="width:26px; height:26px; border-radius:50%; background:#ffffff; border:2.5px solid #d8b4fe; color:#6b21a8; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(124,58,237,0.1); transition:all 0.3s ease;">1</div>
                            <strong style="font-size:11px; color:#3b0764; margin-top:6px; display:block; line-height:1.2;">Menstrual</strong>
                            <span id="sub-estagio-1" style="font-size:9.5px; color:#7e22ce; font-weight:700; display:block; margin-top:2px;">Dia 1-5</span>
                        </div>

                        <!-- Estágio 2: Folicular -->
                        <div id="marco-estagio-2" onclick="window.abrirModalOrientacoesFase('geral', 2)" style="display:flex; flex-direction:column; align-items:center; width:24%; text-align:center; cursor:pointer;" title="Toque para ver detalhes da fase 2">
                            <div class="bolinha-estagio" style="width:26px; height:26px; border-radius:50%; background:#ffffff; border:2.5px solid #d8b4fe; color:#6b21a8; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(124,58,237,0.1); transition:all 0.3s ease;">2</div>
                            <strong style="font-size:11px; color:#3b0764; margin-top:6px; display:block; line-height:1.2;">Folicular</strong>
                            <span id="sub-estagio-2" style="font-size:9.5px; color:#7e22ce; font-weight:700; display:block; margin-top:2px;">Dia 6-11</span>
                        </div>

                        <!-- Estágio 3: Ovulatória -->
                        <div id="marco-estagio-3" onclick="window.abrirModalOrientacoesFase('geral', 3)" style="display:flex; flex-direction:column; align-items:center; width:24%; text-align:center; cursor:pointer;" title="Toque para ver detalhes da fase 3">
                            <div class="bolinha-estagio" style="width:26px; height:26px; border-radius:50%; background:#ffffff; border:2.5px solid #d8b4fe; color:#6b21a8; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(124,58,237,0.1); transition:all 0.3s ease;">3</div>
                            <strong style="font-size:11px; color:#3b0764; margin-top:6px; display:block; line-height:1.2;">Ovulatória</strong>
                            <span id="sub-estagio-3" style="font-size:9.5px; color:#7e22ce; font-weight:700; display:block; margin-top:2px;">Dia 12-16</span>
                        </div>

                        <!-- Estágio 4: Lútea -->
                        <div id="marco-estagio-4" onclick="window.abrirModalOrientacoesFase('geral', 4)" style="display:flex; flex-direction:column; align-items:center; width:24%; text-align:center; cursor:pointer;" title="Toque para ver detalhes da fase 4">
                            <div class="bolinha-estagio" style="width:26px; height:26px; border-radius:50%; background:#ffffff; border:2.5px solid #d8b4fe; color:#6b21a8; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(124,58,237,0.1); transition:all 0.3s ease;">4</div>
                            <strong style="font-size:11px; color:#3b0764; margin-top:6px; display:block; line-height:1.2;">Lútea</strong>
                            <span id="sub-estagio-4" style="font-size:9.5px; color:#7e22ce; font-weight:700; display:block; margin-top:2px;">Dia 17-28</span>
                        </div>
                    </div>
                </div>

                <!-- CARD DE ESTIMATIVA: CHEGADA MÉDIA DO PRÓXIMO ESTÁGIO -->
                <div id="box-previsao-proximo-estagio" style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:14px; padding:10px 12px; margin-top:14px; text-align:left; display:flex; align-items:center; gap:10px;">
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
                         title="Toque para ver orientações de fertilidade">
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
                    <img id="icone-dica-diaria-img" src="./icone/icone-mulher.png" alt="Fase" style="width:42px; height:42px; object-fit:contain; flex-shrink:0;">
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
                        <img src="./icone/icone-lampada-pense.png" alt="Inspiração" style="width:30px; height:30px; object-fit:contain;">
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
                        <input type="range" id="range-sint-emocional" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('emocional')">
                    </div>

                    <!-- 2. Conforto Físico & Dores -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🌿 Conforto Físico & Dores:</span>
                            <strong id="badge-sint-fisico" style="font-size:10.5px; color:#047857; background:#dcfce7; padding:2px 8px; border-radius:6px;">Corpo Leve / Sem Dores 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-fisico" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#10b981; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('fisico')">
                    </div>

                    <!-- 3. Disposição & Energia -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">⚡ Disposição & Energia:</span>
                            <strong id="badge-sint-energia" style="font-size:10.5px; color:#b45309; background:#fef3c7; padding:2px 8px; border-radius:6px;">Ritmo Moderado 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-energia" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#f59e0b; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('energia')">
                    </div>

                    <!-- 4. Comunicação & Expressão -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">💬 Comunicação & Expressão:</span>
                            <strong id="badge-sint-comunicacao" style="font-size:10.5px; color:#1d4ed8; background:#dbeafe; padding:2px 8px; border-radius:6px;">Conversa Normal 🗣️</strong>
                        </div>
                        <input type="range" id="range-sint-comunicacao" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#3b82f6; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('comunicacao')">
                    </div>

                    <!-- 5. Sociabilidade & Companhia -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🛋️ Sociabilidade & Companhia:</span>
                            <strong id="badge-sint-social" style="font-size:10.5px; color:#6b21a8; background:#ede9fe; padding:2px 8px; border-radius:6px;">Neutra / Equilibrada ☕</strong>
                        </div>
                        <input type="range" id="range-sint-social" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#8b5cf6; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('social')">
                    </div>

                    <!-- 6. Paz Mental & Clareza -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🧠 Paz Mental & Clareza:</span>
                            <strong id="badge-sint-pazmental" style="font-size:10.5px; color:#0e7490; background:#cffafe; padding:2px 8px; border-radius:6px;">Pensamentos Sob Controle 🧘‍♀️</strong>
                        </div>
                        <input type="range" id="range-sint-pazmental" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#06b6d4; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('pazmental')">
                    </div>

                    <!-- 7. Paciência & Tolerância (TPM) -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">🕊️ Paciência & Tolerância:</span>
                            <strong id="badge-sint-paciencia" style="font-size:10.5px; color:#9d174d; background:#fce7f3; padding:2px 8px; border-radius:6px;">Tolerância Normal 🌿</strong>
                        </div>
                        <input type="range" id="range-sint-paciencia" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#ec4899; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('paciencia')">
                    </div>

                    <!-- 8. Autoestima & Amor-Próprio -->
                    <div style="padding:8px 0; margin-bottom:6px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764;">👑 Autoestima & Amor-Próprio:</span>
                            <strong id="badge-sint-autoestima" style="font-size:10.5px; color:#701a75; background:#fae8ff; padding:2px 8px; border-radius:6px;">Confortável Consigo Mesma 💃</strong>
                        </div>
                        <input type="range" id="range-sint-autoestima" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#d946ef; cursor:pointer;" oninput="window.atualizarRotuloBarraSintomas('autoestima')">
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
                        <img src="./icone/icone-mulher.png" alt="Rituais" style="width:24px; height:24px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">O Santuário (Rituais & Evolução)</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span id="streak-rituais-mulher" style="font-size:11.5px; font-weight:800; color:#6b21a8; background:#f3e8ff; padding:3px 8px; border-radius:8px; border:1px solid #d8b4fe; display:inline-flex; align-items:center; gap:4px;">
                            <img src="./icone/icone-fogo.png" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> 0 dias
                        </span>
                        <button type="button" style="background:#faf5ff; border:1px solid #d8b4fe; color:#581c87; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.abrirModalEditarMetasMulher()" title="Editar metas">
                            <img src="./icone/icones-configuracao.png" alt="Configuração" style="width:16px; height:16px; object-fit:contain;">
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
                        <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-coracao.png';" alt="Radar de Feminilidade" style="width:32px; height:32px; object-fit:contain;">
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
                                <img src="./icone/icone-energia.png" alt="Vitalidade" style="width:16px; height:16px; object-fit:contain;">
                                Vitalidade & Brilho:
                            </span>
                            <strong id="badge-vitalidade-valor" style="font-size:10.5px; color:#581c87; background:#ede9fe; padding:2px 8px; border-radius:6px;">Equilíbrio / Estável</strong>
                        </div>
                        <input type="range" id="range-vitalidade-fem" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('vitalidade')">
                    </div>

                    <!-- Slider 2: Paz Mental & Carga Emocional -->
                    <div style="padding:8px 0; border-bottom:1px solid #d8b4fe;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                                <img src="./icone/icone-estresse.png" alt="Paz Mental" style="width:16px; height:16px; object-fit:contain;">
                                Paz Mental & Leveza:
                            </span>
                            <strong id="badge-pazmental-valor" style="font-size:10.5px; color:#7e22ce; background:#ede9fe; padding:2px 8px; border-radius:6px;">Serena / Em Paz</strong>
                        </div>
                        <input type="range" id="range-pazmental-fem" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#a855f7; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('paz_mental')">
                    </div>

                    <!-- Slider 3: Afeto & Libido / Conexão -->
                    <div style="padding:8px 0; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11.5px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                                <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-fogo.png';" alt="Afeto" style="width:16px; height:16px; object-fit:contain;">
                                Afeto & Magnetismo:
                            </span>
                            <strong id="badge-afeto-valor" style="font-size:10.5px; color:#9333ea; background:#ede9fe; padding:2px 8px; border-radius:6px;">Conexão Serena</strong>
                        </div>
                        <input type="range" id="range-afeto-fem" min="1" max="5" value="3" step="1" style="width:100%; accent-color:#9333ea; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('afeto_libido')">
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
                                <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-coracao.png';" alt="Love" style="width:14px; height:14px; object-fit:contain;">
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
                        <img src="./icone/icone-filme.png" alt="Filmes" style="width:24px; height:24px; object-fit:contain;">
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
                                    <img src="./icone/icone-check.png" alt="Assistido" style="width:16px; height:16px; object-fit:contain;"> Já Assisti
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
                                    <strong style="font-size:12px; color:#064e3b;">${p.titulo}</strong>
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
                                    <strong style="font-size:12px; color:#3b0764;">${c.titulo}</strong>
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
                    <input type="range" id="range-termo-fisico-diario" min="0" max="10" value="7" step="1" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloTermoFisicoDiario(this.value)">
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
                        <img src="./icone/icone-editar.png" alt="Editar" style="width:16px; height:16px; object-fit:contain;"> Editar Capítulo
                    </button>
                    <button type="button" class="btn-principal" style="border-radius:12px; padding:9px 16px; font-size:11.5px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.fecharLeituraDiarioInteira()">Fechar</button>
                </div>
            </div>
        </div>

        <div id="modal-registro-ciclo-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000050; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:360px; padding:24px; border-radius:28px; border:1.5px solid #d8b4fe; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1.5px solid #d8b4fe; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:17px; font-weight:900; color:#3b0764;">Registar Ciclo Menstrual</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #d8b4fe; background:#faf5ff; font-weight:800;" onclick="window.fecharModalRegistroCiclo()">✕</button>
                </div>
                <div style="flex-direction:column; gap:12px; display:flex;">
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:5px; display:block;">Primeiro dia do ciclo</label>
                        <input type="date" id="input-data-inicio-ciclo" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:5px; display:block;">Duração do sangramento (dias)</label>
                        <input type="number" id="input-duracao-sangramento" value="5" min="1" max="15" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #d8b4fe; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:20px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #d8b4fe; color:#581c87; font-weight:700;" onclick="window.fecharModalRegistroCiclo()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.salvarCicloHistorico()">Confirmar</button>
                </div>
            </div>
        </div>


        <!-- MODAL COMPLETO: ORIENTAÇÕES E DICAS PARA LIDAR COM A FASE -->
        <div id="modal-orientacoes-estagio-fase" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.65); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:14px; box-sizing:border-box;">
            <div style="background:#ffffff; width:100%; max-width:440px; max-height:88vh; padding:20px; border-radius:26px; border:1.8px solid #d8b4fe; box-shadow:0 25px 60px rgba(59,7,100,0.28); display:flex; flex-direction:column; position:relative; overflow:hidden; text-align:left;">
                
                <!-- Cabeçalho do Modal -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1.5px solid #d8b4fe; padding-bottom:10px;">
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

window.obterDescricaoTermoFisicoDiario = function(valor) {
    const v = parseInt(valor, 10);
    if (v <= 3) return `Borocochô 🥀`;
    if (v <= 7) return `Mulherão 💃`;
    return `Deusa ✨`;
};

window.atualizarRotuloTermoFisicoDiario = function(val) {
    const badge = document.getElementById('badge-termo-fisico-diario');
    if (badge) {
        badge.textContent = window.obterDescricaoTermoFisicoDiario(val);
    }
};

window.selecionarHumorDiario = function(btn) {
    document.querySelectorAll('.btn-humor-diario-opcao').forEach(b => {
        b.classList.remove('ativo');
        b.style.background = '#ffffff';
        b.style.color = '#5c4426';
        b.style.borderColor = '#d5c3a5';
        b.style.fontWeight = '700';
    });

    btn.classList.add('ativo');
    btn.style.background = '#7c3aed';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#7c3aed';
    btn.style.fontWeight = '800';

    window.humorDiarioSelecionadoAtual = btn.getAttribute('data-humor') || 'Feliz';
};

// =========================================================================
// 3. RADAR DE FEMINILIDADE (5 NÍVEIS, SEM NOTA, CORPO RETRÁTIL)
// =========================================================================

window.alternarSecaoRadarFeminilidade = function() {
    const bloco = document.getElementById('bloco-corpo-radar-retratil');
    const btn = document.getElementById('btn-toggle-radar-bloco');
    if (!bloco) return;

    bloco.classList.toggle('oculto');
    if (btn) {
        btn.textContent = bloco.classList.contains('oculto') ? 'Responder' : 'Recolher';
    }
};

window.obterDescricaoNotaFeminilidade = function(tipo, valor) {
    const v = parseInt(valor, 10);
    if (tipo === 'vitalidade') {
        if (v === 1) return `Exaustão / Bateria Baixa`;
        if (v === 2) return `Pedindo Repouso`;
        if (v === 3) return `Equilíbrio / Estável`;
        if (v === 4) return `Vitalidade Ativa`;
        return `Plenitude & Radiante`;
    } else if (tipo === 'paz_mental') {
        if (v === 1) return `Serenidade Total`;
        if (v === 2) return `Serena / Em Paz`;
        if (v === 3) return `Emoções Oscilantes`;
        if (v === 4) return `Mente Inquieta / Tensa`;
        return `Sobrecarga / Pedindo Pausa`;
    } else if (tipo === 'afeto_libido') {
        if (v === 1) return `Recolhimento / Em Si`;
        if (v === 2) return `Acolhimento Suave`;
        if (v === 3) return `Conexão Serena`;
        if (v === 4) return `Magnetismo Ativo`;
        return `Desejo Vivo & Magnetismo`;
    }
    return `Nível ${v}`;
};

window.atualizarRotuloSliderFeminilidade = function(tipo) {
    let elRange, elBadge;
    if (tipo === 'vitalidade') {
        elRange = document.getElementById('range-vitalidade-fem');
        elBadge = document.getElementById('badge-vitalidade-valor');
    } else if (tipo === 'paz_mental') {
        elRange = document.getElementById('range-pazmental-fem');
        elBadge = document.getElementById('badge-pazmental-valor');
    } else if (tipo === 'afeto_libido') {
        elRange = document.getElementById('range-afeto-fem');
        elBadge = document.getElementById('badge-afeto-valor');
    }

    if (elRange && elBadge) {
        elBadge.textContent = window.obterDescricaoNotaFeminilidade(tipo, elRange.value);
    }
};

window.salvarRadarFeminilidadeCompleto = async function() {
    const dtRelacao = document.getElementById('slider-data-relacao-fem')?.value || null;
    const vVit = parseInt(document.getElementById('range-vitalidade-fem')?.value || '3', 10);
    const vPaz = parseInt(document.getElementById('range-pazmental-fem')?.value || '3', 10);
    const vAfeto = parseInt(document.getElementById('range-afeto-fem')?.value || '3', 10);
    const hojeStr = new Date().toISOString().split('T')[0];

    const novoRegistro = {
        id: 'rad_fem_' + Date.now(),
        data: hojeStr,
        ultima_relacao: dtRelacao,
        vitalidade: vVit,
        paz_mental: vPaz,
        afeto_libido: vAfeto,
        txtVit: window.obterDescricaoNotaFeminilidade('vitalidade', vVit),
        txtPaz: window.obterDescricaoNotaFeminilidade('paz_mental', vPaz),
        txtAfeto: window.obterDescricaoNotaFeminilidade('afeto_libido', vAfeto)
    };

    window.dadosRadarFeminilidade.ultima_relacao = dtRelacao;
    window.dadosRadarFeminilidade.vitalidade = vVit;
    window.dadosRadarFeminilidade.paz_mental = vPaz;
    window.dadosRadarFeminilidade.afeto_libido = vAfeto;

    if (!Array.isArray(window.dadosRadarFeminilidade.historico)) {
        window.dadosRadarFeminilidade.historico = [];
    }

    window.dadosRadarFeminilidade.historico.unshift(novoRegistro);
    if (window.dadosRadarFeminilidade.historico.length > 20) {
        window.dadosRadarFeminilidade.historico = window.dadosRadarFeminilidade.historico.slice(0, 20);
    }

    localStorage.setItem('suiri_radar_fem', JSON.stringify(window.dadosRadarFeminilidade));
    window.renderizarHistoricoRadarFeminilidade();
    window.renderizarGraficoETendenciasFeminilidade();

    window.alternarSecaoRadarFeminilidade();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Radar de Feminilidade guardado com sucesso!", "sucesso");
    }

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            await supabase.from('espaco_fem_radar').upsert({
                usuario_id: usuarioId,
                data_registro: hojeStr,
                ultima_relacao: dtRelacao,
                vitalidade: vVit,
                paz_mental: vPaz,
                afeto_libido: vAfeto
            }, { onConflict: 'usuario_id, data_registro' });
        } catch (e) {}
    }
};

window.renderizarHistoricoRadarFeminilidade = function() {
    const cont = document.getElementById('lista-historico-radar-fem');
    const elContador = document.getElementById('contador-historico-radar-fem');
    if (!cont) return;

    const hist = window.dadosRadarFeminilidade.historico || [];
    if (elContador) elContador.textContent = hist.length;

    if (hist.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhuma avaliação confidencial guardada ainda.</span>';
        return;
    }

    cont.innerHTML = hist.map(reg => {
        const partes = reg.data.split('-');
        const dataFmt = `${partes[2]}/${partes[1]}`;
        const infoRelacao = reg.ultima_relacao ? ` • Conexão: ${reg.ultima_relacao.split('-').slice(1).reverse().join('/')}` : '';

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; padding:8px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:10px; font-weight:800; color:#581c87; display:block;">${dataFmt}${infoRelacao}</span>
                    <span style="font-size:11px; color:#3b0764; font-weight:700; display:flex; align-items:center; gap:6px; margin-top:2px;">
                        <img src="./icone/icone-energia.png" alt="Vitalidade" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtVit} | 
                        <img src="./icone/icone-estresse.png" alt="Paz" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtPaz}
                    </span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; font-weight:800; color:#7c3aed; background:#f3e8ff; padding:2px 6px; border-radius:6px; border:1px solid #d8b4fe; display:inline-flex; align-items:center; gap:3px;">
                        <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-fogo.png';" alt="Afeto" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtAfeto}
                    </span>
                    <button type="button" onclick="window.removerItemHistoricoRadarFeminilidade('${reg.id}')" style="background:none; border:none; cursor:pointer; padding:2px; display:flex; align-items:center;" title="Remover registo">
                        <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.removerItemHistoricoRadarFeminilidade = function(id) {
    if (!window.dadosRadarFeminilidade.historico) return;
    window.dadosRadarFeminilidade.historico = window.dadosRadarFeminilidade.historico.filter(r => r.id !== id);
    localStorage.setItem('suiri_radar_fem', JSON.stringify(window.dadosRadarFeminilidade));
    window.renderizarHistoricoRadarFeminilidade();
    window.renderizarGraficoETendenciasFeminilidade();
};

window.carregarRadarFeminilidadeNuvem = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    try {
        const { data } = await supabase
            .from('espaco_fem_radar')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_registro', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            window.dadosRadarFeminilidade.ultima_relacao = data.ultima_relacao;
            window.dadosRadarFeminilidade.vitalidade = data.vitalidade > 5 ? Math.round(data.vitalidade / 2) : (data.vitalidade || 3);
            window.dadosRadarFeminilidade.paz_mental = data.paz_mental > 5 ? Math.round(data.paz_mental / 2) : (data.paz_mental || 3);
            window.dadosRadarFeminilidade.afeto_libido = data.afeto_libido > 5 ? Math.round(data.afeto_libido / 2) : (data.afeto_libido || 3);

            const inDt = document.getElementById('slider-data-relacao-fem');
            const rngVit = document.getElementById('range-vitalidade-fem');
            const rngPaz = document.getElementById('range-pazmental-fem');
            const rngAfeto = document.getElementById('range-afeto-fem');

            if (inDt) inDt.value = data.ultima_relacao || '';
            if (rngVit) rngVit.value = window.dadosRadarFeminilidade.vitalidade;
            if (rngPaz) rngPaz.value = window.dadosRadarFeminilidade.paz_mental;
            if (rngAfeto) rngAfeto.value = window.dadosRadarFeminilidade.afeto_libido;

            window.atualizarRotuloSliderFeminilidade('vitalidade');
            window.atualizarRotuloSliderFeminilidade('paz_mental');
            window.atualizarRotuloSliderFeminilidade('afeto_libido');
            window.renderizarGraficoETendenciasFeminilidade();
        }
    } catch (e) {}
};

// Renderização dos Gráficos SVG & Tendências do Radar
window.renderizarGraficoETendenciasFeminilidade = function() {
    const contGraf = document.getElementById('container-grafico-svg-mulher');
    const contComp = document.getElementById('bloco-comparativo-semanas-mulher');
    const elInsight = document.getElementById('texto-insight-tendencia-mulher');

    if (!contGraf) return;

    const histRadar = window.dadosRadarFeminilidade.historico || [];

    if (histRadar.length < 2) {
        contGraf.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center;">Registe pelo menos 2 avaliações no Radar para traçar as curvas.</span>';
        if (contComp) contComp.innerHTML = '<span style="font-size:11px; color:#6b21a8; grid-column:span 2; text-align:center;">Aguardando dados comparativos.</span>';
        return;
    }

    const pontos = [...histRadar.slice(0, 7)].reverse();
    const w = 320;
    const h = 75;
    const pad = 14;
    const dx = (w - (pad * 2)) / Math.max(1, pontos.length - 1);

    const normalizar5 = (val) => val > 5 ? (val / 2) : val;
    const calcY = (val) => h - pad - (((normalizar5(val) - 1) / 4) * (h - (pad * 2)));

    const ptsVitalidade = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.vitalidade || 3)}`).join(' ');
    const ptsPaz = pontos.map((p, idx) => `${pad + (idx * dx)},${calcY(p.paz_mental || 3)}`).join(' ');

    contGraf.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
            <line x1="${pad}" y1="${calcY(3)}" x2="${w - pad}" y2="${calcY(3)}" stroke="#d8b4fe" stroke-dasharray="3,3" stroke-width="1" />
            <polyline fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsVitalidade}" />
            <polyline fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsPaz}" />
            ${pontos.map((p, idx) => `
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.vitalidade || 3)}" r="3" fill="#7c3aed" />
                <circle cx="${pad + (idx * dx)}" cy="${calcY(p.paz_mental || 3)}" r="3" fill="#e11d48" />
            `).join('')}
        </svg>
    `;

    const semAtual = histRadar.slice(0, 7);
    const semAnt = histRadar.slice(7, 14);

    const calcMedia = (arr, prop) => arr.length ? (arr.reduce((acc, c) => acc + normalizar5(c[prop] || 3), 0) / arr.length).toFixed(1) : null;

    const medV_Atu = calcMedia(semAtual, 'vitalidade') || "3.0";
    const medP_Atu = calcMedia(semAtual, 'paz_mental') || "3.0";
    const medV_Ant = calcMedia(semAnt, 'vitalidade');
    const medP_Ant = calcMedia(semAnt, 'paz_mental');

    if (contComp) {
        contComp.innerHTML = `
            <div style="background:#faf5ff; border:1px solid #d8b4fe; padding:7px 10px; border-radius:10px;">
                <span style="font-size:10px; color:#6b21a8; font-weight:800; text-transform:uppercase; display:block;">Semana Atual:</span>
                <span style="font-size:11.5px; color:#3b0764; font-weight:700; display:block; margin-top:2px;">
                    🌸 ${medV_Atu} | 🧘‍♀️ ${medP_Atu}
                </span>
            </div>
            <div style="background:#faf5ff; border:1px solid #d8b4fe; padding:7px 10px; border-radius:10px;">
                <span style="font-size:10px; color:#6b21a8; font-weight:800; text-transform:uppercase; display:block;">Semana Anterior:</span>
                <span style="font-size:11.5px; color:#3b0764; font-weight:700; display:block; margin-top:2px;">
                    ${medV_Ant ? `🌸 ${medV_Ant} | 🧘‍♀️ ${medP_Ant}` : '<em style="color:#94a3b8; font-size:10.5px;">Sem histórico</em>'}
                </span>
            </div>
        `;
    }

    if (elInsight) {
        if (parseFloat(medP_Atu) >= 4.0) {
            elInsight.innerHTML = `🍵 <strong>Período de Sobrecarga / Tensão:</strong> O seu índice de tensão emocional está elevado (${medP_Atu}/5). Use o <em>Modo Alívio</em> e priorize o descanso hoje.`;
        } else if (parseFloat(medV_Atu) >= 4.0) {
            elInsight.innerHTML = `✨ <strong>Fase Radiante:</strong> Vitalidade e brilho em alta (${medV_Atu}/5). Excelente momento para conexões, novos projetos e magnetismo a dois!`;
        } else {
            elInsight.innerHTML = `🌿 <strong>Ritmo Suave & Equilíbrio:</strong> Mantenha a hidratação e os rituais do Santuário para sustentar o seu bem-estar corporal.`;
        }
    }
};

// =========================================================================
// 4. LÓGICA DAS 6 METAS DIÁRIAS (O SANTUÁRIO COM NÍVEIS XP & METAS)
// =========================================================================

window.niveisFemininos = [
    { nivel: 1, nome: "Despertar Serena", minXP: 0, maxXP: 300 },
    { nivel: 2, nome: "Harmonia & Flor", minXP: 300, maxXP: 700 },
    { nivel: 3, nome: "Constância Serena", minXP: 700, maxXP: 1400 },
    { nivel: 4, nome: "Guardiã do Próprio Lar", minXP: 1400, maxXP: 2500 },
    { nivel: 5, nome: "Plenitude Radiante", minXP: 2500, maxXP: 4000 },
    { nivel: 6, nome: "Soberana de Si Mesma", minXP: 4000, maxXP: 99999 }
];

window.calcularEvolucaoSantuario = function() {
    let totalRituaisCumpridos = 0;
    let totalDiasPerfeitos = 0;
    let xpTotal = 0;

    const datas = Object.keys(window.dadosRituaisFemininos);
    datas.forEach(dt => {
        const reg = window.dadosRituaisFemininos[dt];
        const qtd = reg.totalCumpridas || 0;
        totalRituaisCumpridos += qtd;
        xpTotal += (qtd * 10);
        if (qtd === 6) {
            totalDiasPerfeitos++;
            xpTotal += 40;
        }
    });

    let nivelAtual = window.niveisFemininos[0];
    for (let n of window.niveisFemininos) {
        if (xpTotal >= n.minXP) nivelAtual = n;
    }

    const ofensiva = window.obterOfensivaMulher();
    const conquistasDef = [
        { id: "cf1", titulo: "Primeiro Despertar", desc: "Completou o 1º ritual de autocuidado", desbloqueada: totalRituaisCumpridos >= 1 },
        { id: "cf2", titulo: "Trinca Serena", desc: "3 dias seguidos de constância", desbloqueada: ofensiva >= 3 },
        { id: "cf3", titulo: "Plenitude Total", desc: "Completou 100% (6/6) dos rituais num dia", desbloqueada: totalDiasPerfeitos >= 1 },
        { id: "cf4", titulo: "Semana Radiante", desc: "7 dias seguidos cuidando de si", desbloqueada: ofensiva >= 7 },
        { id: "cf5", titulo: "Harmonia de Ciclo", desc: "14 dias seguidos de rituais", desbloqueada: ofensiva >= 14 },
        { id: "cf6", titulo: "Flor da Constância", desc: "Alcançou 30 rituais concluídos", desbloqueada: totalRituaisCumpridos >= 30 }
    ];

    return {
        totalRituais: totalRituaisCumpridos,
        diasPerfeitos: totalDiasPerfeitos,
        xp: xpTotal,
        nivel: nivelAtual,
        conquistas: conquistasDef
    };
};

window.obterOfensivaMulher = function() {
    let ofensiva = 0;
    const datas = Object.keys(window.dadosRituaisFemininos).sort().reverse();
    for (let dt of datas) {
        const item = window.dadosRituaisFemininos[dt];
        if (item.totalCumpridas && item.totalCumpridas > 0) {
            ofensiva++;
        } else {
            break;
        }
    }
    return ofensiva;
};

window.renderizarPainelEvolucaoSantuario = function() {
    const dados = window.calcularEvolucaoSantuario();

    const elNivel = document.getElementById('lbl-nome-nivel-mulher');
    const elXP = document.getElementById('lbl-xp-mulher');
    const elBarraXP = document.getElementById('barra-xp-mulher');
    const elProx = document.getElementById('lbl-info-prox-nivel-mulher');

    if (elNivel) elNivel.textContent = `Grau ${dados.nivel.nivel}: ${dados.nivel.nome}`;
    if (elXP) elXP.textContent = `${dados.xp} XP`;

    const spanNivel = dados.nivel.maxXP - dados.nivel.minXP;
    const progressoNoNivel = dados.xp - dados.nivel.minXP;
    const pctNivel = Math.min(100, Math.round((progressoNoNivel / spanNivel) * 100));

    if (elBarraXP) elBarraXP.style.width = `${pctNivel}%`;
    if (elProx) {
        if (dados.nivel.nivel === 6) {
            elProx.textContent = "Ápice Alcançado: Plenitude Soberana!";
        } else {
            elProx.textContent = `Faltam ${dados.nivel.maxXP - dados.xp} XP para o próximo nível (${pctNivel}%)`;
        }
    }

    const agora = new Date();
    let rituaisSemana = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(agora.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const reg = window.dadosRituaisFemininos[dStr];
        if (reg) rituaisSemana += (reg.totalCumpridas || 0);
    }
    const metaAlvoSemana = 25;
    const pctSemana = Math.min(100, Math.round((rituaisSemana / metaAlvoSemana) * 100));

    const elMetaSem = document.getElementById('lbl-meta-sem-mulher');
    const elMetaSemPct = document.getElementById('lbl-meta-sem-mulher-pct');
    const elBarraSem = document.getElementById('barra-meta-sem-mulher');

    if (elMetaSem) elMetaSem.textContent = `${rituaisSemana} / ${metaAlvoSemana}`;
    if (elMetaSemPct) elMetaSemPct.textContent = `${pctSemana}%`;
    if (elBarraSem) elBarraSem.style.width = `${pctSemana}%`;

    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    let rituaisMes = 0;
    let diasPerfeitosMes = 0;

    Object.keys(window.dadosRituaisFemininos).forEach(dt => {
        const [ano, mes] = dt.split('-').map(Number);
        if (ano === anoAtual && (mes - 1) === mesAtual) {
            const reg = window.dadosRituaisFemininos[dt];
            const qtd = reg.totalCumpridas || 0;
            rituaisMes += qtd;
            if (qtd === 6) diasPerfeitosMes++;
        }
    });

    const diasDecorridos = agora.getDate();
    const totalPossivel = diasDecorridos * 6;
    const taxaMes = totalPossivel > 0 ? Math.round((rituaisMes / totalPossivel) * 100) : 0;

    const elStatsRituais = document.getElementById('lbl-stats-rituais-mes');
    const elStatsPerfeitos = document.getElementById('lbl-stats-perfeitos-mes');
    const elStatsTaxa = document.getElementById('lbl-stats-taxa-mes-mulher');

    if (elStatsRituais) elStatsRituais.textContent = `${rituaisMes} rituais`;
    if (elStatsPerfeitos) elStatsPerfeitos.textContent = `${diasPerfeitosMes} dias 100%`;
    if (elStatsTaxa) elStatsTaxa.textContent = `Taxa: ${taxaMes}% de adesão`;

    const contConquistas = document.getElementById('bloco-conquistas-mulher');
    const elContadorConquistas = document.getElementById('contador-conquistas-mulher');
    if (contConquistas) {
        const desbloqueadas = dados.conquistas.filter(c => c.desbloqueada).length;
        if (elContadorConquistas) elContadorConquistas.textContent = `${desbloqueadas}/${dados.conquistas.length}`;

        contConquistas.innerHTML = dados.conquistas.map(c => `
            <div style="background:${c.desbloqueada ? '#faf5ff' : '#ffffff'}; border:1px solid ${c.desbloqueada ? '#d8b4fe' : '#ede9fe'}; padding:7px 9px; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:13px;">${c.desbloqueada ? '🌸' : '🔒'}</span>
                    <strong style="font-size:11px; color:${c.desbloqueada ? '#3b0764' : '#6b21a8'};">${c.titulo}</strong>
                </div>
                <span style="font-size:9.5px; color:#581c87; display:block; margin-top:2px;">${c.desc}</span>
            </div>
        `).join('');
    }
};

window.alternarRetratilGenerico = function(conteudoId, setaId) {
    const el = document.getElementById(conteudoId);
    const seta = document.getElementById(setaId);
    if (!el) return;
    el.classList.toggle('oculto');
    if (seta) {
        seta.style.transform = el.classList.contains('oculto') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

window.obterTituloRituaisMulher = function(qtd) {
    if (qtd === 0) return "Desperte a Alma";
    if (qtd <= 2) return "Semente Plantada 🌱";
    if (qtd <= 4) return "Em Florescimento 🌸";
    if (qtd === 5) return "Equilíbrio Radiante ✨";
    return "Plenitude & Luz 💖";
};

// 6 METAS DIÁRIAS EM FORMATO VERTICAL FLUIDO
window.sincronizarCheckboxesRituaisHoje = function() {
    const containerGrid = document.getElementById('container-grid-metas-mulher');
    if (!containerGrid) return;

    const hojeStr = new Date().toISOString().split('T')[0];
    const registroHoje = window.dadosRituaisFemininos[hojeStr] || {};

    containerGrid.innerHTML = window.configMetasFemininas.map((meta, idx) => {
        const checked = !!registroHoje[`meta_${idx}`];
        return `
            <label style="display:flex; align-items:center; justify-content:space-between; padding:9px 4px; border-bottom:1px solid #d8b4fe; cursor:pointer;">
                <span style="font-size:12px; font-weight:700; color:#3b0764; line-height:1.3; white-space:normal; word-break:break-word; padding-right:10px;">${meta}</span>
                <input type="checkbox" id="check-ritual-fem-${idx}" onchange="window.salvarCheckinRitualMulher(${idx})" ${checked ? 'checked' : ''} style="width:18px; height:18px; accent-color:#7c3aed; flex-shrink:0; cursor:pointer;">
            </label>
        `;
    }).join('');
};

window.salvarCheckinRitualMulher = async function(idx) {
    const hojeStr = new Date().toISOString().split('T')[0];
    if (!window.dadosRituaisFemininos[hojeStr]) {
        window.dadosRituaisFemininos[hojeStr] = { data: hojeStr, metas: {} };
    }

    const check = document.getElementById(`check-ritual-fem-${idx}`);
    window.dadosRituaisFemininos[hojeStr][`meta_${idx}`] = check ? check.checked : false;

    let cumpridas = 0;
    for (let i = 0; i < 6; i++) {
        if (window.dadosRituaisFemininos[hojeStr][`meta_${i}`]) cumpridas++;
    }
    window.dadosRituaisFemininos[hojeStr].totalCumpridas = cumpridas;
    window.dadosRituaisFemininos[hojeStr].pct = Math.round((cumpridas / 6) * 100);

    localStorage.setItem('suiri_rituais_fem', JSON.stringify(window.dadosRituaisFemininos));
    
    window.renderizarPainelEvolucaoSantuario();
    window.renderizarHistoricoRituaisRetratil();

    const elStreak = document.getElementById('streak-rituais-mulher');
    if (elStreak) {
        elStreak.innerHTML = `<img src="./icone/icone-fogo.png" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> ${window.obterOfensivaMulher()} dias`;
    }

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            await supabase.from('espaco_fem_checkins').upsert({
                usuario_id: usuarioId,
                data_registro: hojeStr,
                cumpridas: cumpridas,
                percentual: window.dadosRituaisFemininos[hojeStr].pct
            }, { onConflict: 'usuario_id, data_registro' });
        } catch (e) {}
    }
};

window.renderizarHistoricoRituaisRetratil = function() {
    const cont = document.getElementById('bloco-historico-rituais');
    const elContador = document.getElementById('contador-historico-rituais');
    if (!cont) return;

    const datas = Object.keys(window.dadosRituaisFemininos).sort().reverse();
    if (elContador) elContador.textContent = datas.length;

    if (datas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhum registo diário guardado ainda.</span>';
        return;
    }

    cont.innerHTML = datas.slice(0, 7).map(dt => {
        const reg = window.dadosRituaisFemininos[dt];
        const partes = dt.split('-');
        const dataFormatada = `${partes[2]}/${partes[1]}`;
        const total = reg.totalCumpridas || 0;
        const pct = reg.pct || Math.round((total / 6) * 100);
        const titulo = window.obterTituloRituaisMulher(total);

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:12px; padding:9px 12px; display:flex; flex-direction:column; gap:5px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:11.5px; color:#3b0764;">${dataFormatada} • ${titulo}</strong>
                    <span style="font-size:11px; font-weight:800; color:#7c3aed;">${total}/6 (${pct}%)</span>
                </div>
                <div style="background:#ede9fe; border-radius:8px; height:5px; width:100%; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:${pct}%;"></div>
                </div>
            </div>
        `;
    }).join('');
};

window.abrirModalEditarMetasMulher = function() {
    const modal = document.getElementById('modal-config-metas-mulher');
    const container = document.getElementById('container-inputs-editar-metas-mulher');
    if (!modal || !container) return;

    container.innerHTML = window.configMetasFemininas.map((meta, i) => `
        <div>
            <label style="font-size:10.5px; font-weight:800; color:#581c87; display:block; margin-bottom:2px;">Meta ${i + 1}</label>
            <input type="text" id="input-edit-meta-mulher-${i}" value="${meta}" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-size:12px; font-weight:600; color:#3b0764;">
        </div>
    `).join('');

    modal.classList.remove('oculto');
};

window.fecharModalEditarMetasMulher = function() {
    const modal = document.getElementById('modal-config-metas-mulher');
    if (modal) modal.classList.add('oculto');
};

window.salvarNovasMetasConfiguradasMulher = function() {
    const novasMetas = [];
    for (let i = 0; i < 6; i++) {
        const val = document.getElementById(`input-edit-meta-mulher-${i}`)?.value.trim();
        novasMetas.push(val || `Meta ${i + 1}`);
    }

    window.configMetasFemininas = novasMetas;
    localStorage.setItem('suiri_metas_fem_config', JSON.stringify(novasMetas));
    window.fecharModalEditarMetasMulher();
    window.sincronizarCheckboxesRituaisHoje();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("6 Metas atualizadas com sucesso!", "sucesso");
    }
};

// =========================================================================
// 5. CURADORIA DE FILMES & SÉRIES (COM LOGOS E LINKS DIRETOS AOS STREAMERS)
// =========================================================================

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

    if (aba === 'filmes') {
        if (btnF) { 
            btnF.style.background = '#7c3aed'; 
            btnF.style.color = '#fff'; 
            btnF.textContent = `Filmes (${listaFilmesQtd})`;
        }
        if (btnS) { 
            btnS.style.background = 'transparent'; 
            btnS.style.color = '#581c87'; 
            btnS.textContent = `Séries (${listaSeriesQtd})`;
        }
    } else {
        if (btnS) { 
            btnS.style.background = '#7c3aed'; 
            btnS.style.color = '#fff'; 
            btnS.textContent = `Séries (${listaSeriesQtd})`;
        }
        if (btnF) { 
            btnF.style.background = 'transparent'; 
            btnF.style.color = '#581c87'; 
            btnF.textContent = `Filmes (${listaFilmesQtd})`;
        }
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
            if (atual && (atual.imdbId === item.imdbId || atual.titulo === item.titulo)) {
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
                            ? `<img src="${p.logo}" alt="${p.nome}" style="width:18px; height:18px; border-radius:5px; object-fit:cover; display:block; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.12);">` 
                            : `<span style="font-size:12px; line-height:1;">📺</span>`;

                        return `
                            <a href="${linkDireto}" target="_blank" rel="noopener noreferrer" 
                               style="text-decoration:none; display:inline-flex; align-items:center; gap:5px; background:#ffffff; color:#3b0764; border:1px solid #d8b4fe; border-radius:8px; padding:4px 9px; box-shadow:0 1px 3px rgba(124,58,237,0.05); font-size:11px; font-weight:700; cursor:pointer;" 
                               title="Abrir ${tituloBusca} no ${p.nome}">
                                ${tagLogo}
                                <span>${p.nome}</span>
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
            btnAcao.innerHTML = `<img src="./icone/icone-check.png" alt="Assistido" style="width:16px; height:16px; object-fit:contain; vertical-align:middle; margin-right:4px;"> Já Assisti`;
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

    localStorage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));
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
    localStorage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));

    window.dadosMidiaMulherAssistida = window.dadosMidiaMulherAssistida.filter(m => m.titulo.toLowerCase() !== tituloItem.toLowerCase());
    window.dadosMidiaMulherAssistida.push({
        id: item.id || ('mid_fem_' + Date.now()),
        titulo: tituloItem,
        tipo: window.abaMidiaMulherAtiva,
        categoria: item.categoria,
        estrelas: parseInt(estrelas, 10),
        data: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('suiri_midia_mulher_assistida', JSON.stringify(window.dadosMidiaMulherAssistida));
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
                <strong style="font-size:12.5px; color:#3b0764; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.titulo}</strong>
                <span style="font-size:10px; color:#6b21a8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(5, { id: '${item.id}', titulo: '${item.titulo}', categoria: '${item.categoria}' })" style="background:#7c3aed; color:#fff; border:none; padding:4px 8px; font-size:10.5px; border-radius:8px; font-weight:800; cursor:pointer;" title="Marcar como visto">
                    ✓ Já Vi
                </button>
                <button type="button" onclick="window.removerMidiaQueroVerMulher('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaQueroVerMulher = function(id) {
    window.dadosMidiaMulherQueroVer = window.dadosMidiaMulherQueroVer.filter(m => m.id !== id);
    localStorage.setItem('suiri_midia_mulher_quero_ver', JSON.stringify(window.dadosMidiaMulherQueroVer));
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
                <strong style="font-size:12.5px; color:#3b0764; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.titulo}</strong>
                <span style="font-size:10px; color:#6b21a8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:800; color:#f59e0b;">${'★'.repeat(item.estrelas)}</span>
                <button type="button" onclick="window.removerMidiaMulherAssistida('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaMulherAssistida = function(id) {
    window.dadosMidiaMulherAssistida = window.dadosMidiaMulherAssistida.filter(m => m.id !== id);
    localStorage.setItem('suiri_midia_mulher_assistida', JSON.stringify(window.dadosMidiaMulherAssistida));
    window.renderizarHistoricoAssistidosMulher();
    window.atualizarVisualizacaoMidiaMulher();
};

// =========================================================================
// 6. COMO SE SENTE HOJE: 8 BARRAS (5 NÍVEIS, SEM NOTA NO RÓTULO)
// =========================================================================

window.alternarSecaoComoSeSenteHoje = function() {
    const bloco = document.getElementById('bloco-corpo-sintomas-retratil');
    const btn = document.getElementById('btn-toggle-sintomas-bloco');
    if (!bloco) return;

    bloco.classList.toggle('oculto');
    if (btn) {
        btn.textContent = bloco.classList.contains('oculto') ? 'Responder' : 'Recolher';
    }
};

window.obterDescricaoNotaBarraSintomas = function(tipo, val) {
    const v = parseInt(val, 10);
    switch(tipo) {
        case 'emocional':
            if (v === 1) return `Depressiva / Triste 🌧️`;
            if (v === 2) return `Sensível / Emotiva 💧`;
            if (v === 3) return `Estável / Serena 🧘‍♀️`;
            if (v === 4) return `Alegre & Confiante 🌸`;
            return `Super Feliz & Radiante ✨`;
        case 'fisico':
            if (v === 1) return `Dores Fortes / Cólica 🥀`;
            if (v === 2) return `Incômodo / Inchaço 🌧️`;
            if (v === 3) return `Corpo Leve / Sem Dores 🌿`;
            if (v === 4) return `Disposta & Flexível 💃`;
            return `Bem-Estar Total & Plena ✨`;
        case 'energia':
            if (v === 1) return `Desânimo / Exaustão 😴`;
            if (v === 2) return `Energia Baixa / Lenta ☕`;
            if (v === 3) return `Ritmo Moderado 🌿`;
            if (v === 4) return `Disposta & Produtiva ⚡`;
            return `Revigorada / Pico de Vigor 🔥`;
        case 'comunicacao':
            if (v === 1) return `Silenciosa / Fechada 🤫`;
            if (v === 2) return `Monossilábica / Poupando Voz 💭`;
            if (v === 3) return `Conversa Normal 🗣️`;
            if (v === 4) return `Comunicativa & Sociável 💬`;
            return `Ativa Verbalmente & Expressiva ✨`;
        case 'social':
            if (v === 1) return `Querendo Ficar Só / Ninho 🛋️`;
            if (v === 2) return `Preferindo Silêncio / Calma 📖`;
            if (v === 3) return `Neutra / Equilibrada ☕`;
            if (v === 4) return `Aberta a Conversas / Saídas 👭`;
            return `Querendo Companhia / Socializar 🎉`;
        case 'pazmental':
            if (v === 1) return `Sobrecarga / Mente Ansiosa 🌪️`;
            if (v === 2) return `Pensamentos Acelerados ⚡`;
            if (v === 3) return `Pensamentos Sob Controle 🧘‍♀️`;
            if (v === 4) return `Mente Tranquila & Clara 🌿`;
            return `Paz Absoluta & Clareza Serena 🕊️`;
        case 'paciencia':
            if (v === 1) return `Pavio Curto / Irritada ⚡`;
            if (v === 2) return `Sensível a Barulho / Ruídos 🔊`;
            if (v === 3) return `Tolerância Normal 🌿`;
            if (v === 4) return `Serena & Gentil 🌸`;
            return `Paciência Doce & Compreensiva 💖`;
        case 'autoestima':
            if (v === 1) return `Autocrítica / Borocochô 🥀`;
            if (v === 2) return `Insegura / Vulnerável 💧`;
            if (v === 3) return `Confortável Consigo Mesma 💃`;
            if (v === 4) return `Bonita, Segura & Forte ✨`;
            return `Deusa / Amor-Próprio Radiante 👑`;
        default:
            return `Nível ${v}`;
    }
};

window.atualizarRotuloBarraSintomas = function(tipo) {
    const rng = document.getElementById(`range-sint-${tipo}`);
    const badge = document.getElementById(`badge-sint-${tipo}`);
    if (rng && badge) {
        badge.textContent = window.obterDescricaoNotaBarraSintomas(tipo, rng.value);
    }
};

window.salvarRegistroSintomaDiario = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const valores = {
        emocional: parseInt(document.getElementById('range-sint-emocional')?.value || '3', 10),
        fisico: parseInt(document.getElementById('range-sint-fisico')?.value || '3', 10),
        energia: parseInt(document.getElementById('range-sint-energia')?.value || '3', 10),
        comunicacao: parseInt(document.getElementById('range-sint-comunicacao')?.value || '3', 10),
        social: parseInt(document.getElementById('range-sint-social')?.value || '3', 10),
        pazmental: parseInt(document.getElementById('range-sint-pazmental')?.value || '3', 10),
        paciencia: parseInt(document.getElementById('range-sint-paciencia')?.value || '3', 10),
        autoestima: parseInt(document.getElementById('range-sint-autoestima')?.value || '3', 10)
    };

    const sangrando = false;

    const hojeObj = new Date();
    const hojeStr = hojeObj.getFullYear() + "-" + String(hojeObj.getMonth() + 1).padStart(2, '0') + "-" + String(hojeObj.getDate()).padStart(2, '0');

    const mediaEmocional = ((valores.emocional + valores.paciencia + valores.autoestima) / 3).toFixed(1);
    const mediaFisica = ((valores.fisico + valores.energia + valores.pazmental) / 3).toFixed(1);

    const descHumorTexto = `Emocional: ${valores.emocional}/5, Paciência: ${valores.paciencia}/5, Autoestima: ${valores.autoestima}/5 (Média: ${mediaEmocional})`;
    const descFisicoTexto = `Físico: ${valores.fisico}/5, Energia: ${valores.energia}/5, Paz: ${valores.pazmental}/5, Social: ${valores.social}/5, Fala: ${valores.comunicacao}/5 (Média: ${mediaFisica})`;

    try {
        const payload = {
            usuario_id: usuarioId,
            data_registro: hojeStr,
            humor: descHumorTexto,
            sintoma_fisico: descFisicoTexto,
            sangramento_ativo: sangrando
        };

        const { error } = await supabase.from('saude_sintomas').insert([payload]);

        if (error) {
            window.mostrarToast("Erro ao guardar: " + error.message, "erro");
        } else {
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast("As 8 dimensões de hoje foram guardadas com sucesso!", "sucesso");
            }
            window.alternarSecaoComoSeSenteHoje();
            await window.carregarHistoricoSintomas();
        }
    } catch (err) { 
        console.error(err); 
    }
};

window.carregarHistoricoSintomas = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const limiteObj = new Date();
    limiteObj.setDate(limiteObj.getDate() - 30);
    const dataLimite = limiteObj.getFullYear() + "-" + String(limiteObj.getMonth() + 1).padStart(2, '0') + "-" + String(limiteObj.getDate()).padStart(2, '0');

    try {
        const { data, error } = await supabase
            .from('saude_sintomas')
            .select('*')
            .eq('usuario_id', usuarioId)
            .gte('data_registro', dataLimite)
            .order('data_registro', { ascending: false });

        if (!error && data) {
            window.dadosSintomasDiarios = data;
            window.renderizarHistoricoSintomas();
        }
    } catch (err) {}
};

function extrairMediaNumericaSintoma(texto, padrao = 3.0) {
    if (!texto) return padrao;
    const match = String(texto).match(/Média:\s*([\d\.]+)/i);
    if (match) {
        let val = parseFloat(match[1]);
        if (val > 5) val = val / 2;
        return val;
    }
    const matchNota = String(texto).match(/Nota\s*(\d+)/i);
    if (matchNota) {
        let val = parseFloat(matchNota[1]);
        if (val > 5) val = val / 2;
        return val;
    }
    return padrao;
}

window.renderizarHistoricoSintomas = function() {
    const container = document.getElementById('container-historico-sintomas-ciclos');
    if (!container) return;

    const lista = window.dadosSintomasDiarios || [];

    if (lista.length === 0) {
        container.innerHTML = `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:18px; padding:14px; text-align:center;">
                <span style="font-size:11.5px; color:#6b21a8; font-weight:600;">Sem registos recentes. Toque em 'Responder' para registar o seu dia.</span>
            </div>
        `;
        return;
    }

    const pontosGrafico = [...lista.slice(0, 10)].reverse();
    let svgGraficoHtml = '';

    if (pontosGrafico.length >= 2) {
        const w = 320;
        const h = 80;
        const pad = 14;
        const dx = (w - (pad * 2)) / Math.max(1, pontosGrafico.length - 1);
        const calcY = (val) => h - pad - (((val - 1) / 4) * (h - (pad * 2)));

        const ptsEmocional = pontosGrafico.map((p, idx) => `${pad + (idx * dx)},${calcY(extrairMediaNumericaSintoma(p.humor, 3.0))}`).join(' ');
        const ptsFisico = pontosGrafico.map((p, idx) => `${pad + (idx * dx)},${calcY(extrairMediaNumericaSintoma(p.sintoma_fisico, 3.0))}`).join(' ');

        svgGraficoHtml = `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:18px; padding:12px 14px; margin-bottom:10px; box-shadow:0 3px 10px rgba(124,58,237,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11px; font-weight:800; color:#581c87; text-transform:uppercase;">Curva das 8 Dimensões</span>
                    <div style="display:flex; gap:10px; font-size:10px; font-weight:800;">
                        <span style="color:#7c3aed;">● Emocional</span>
                        <span style="color:#10b981;">● Vitalidade</span>
                    </div>
                </div>
                <div style="width:100%; height:80px;">
                    <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
                        <line x1="${pad}" y1="${calcY(3)}" x2="${w - pad}" y2="${calcY(3)}" stroke="#d8b4fe" stroke-dasharray="3,3" stroke-width="1" />
                        <polyline fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsEmocional}" />
                        <polyline fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsFisico}" />
                        ${pontosGrafico.map((p, idx) => `
                            <circle cx="${pad + (idx * dx)}" cy="${calcY(extrairMediaNumericaSintoma(p.humor, 3.0))}" r="3" fill="#7c3aed" />
                            <circle cx="${pad + (idx * dx)}" cy="${calcY(extrairMediaNumericaSintoma(p.sintoma_fisico, 3.0))}" r="3" fill="#10b981" />
                        `).join('')}
                    </svg>
                </div>
            </div>
        `;
    }

    const htmlLista = lista.map(reg => {
        const partesData = reg.data_registro.split('-');
        const dataFormatada = `${partesData[2]}/${partesData[1]}`;
        const humorTxt = reg.humor || '-';
        const fisicoTxt = reg.sintoma_fisico || '-';
        const gota = reg.sangramento_ativo ? ' • 🩸 Sangramento Ativo' : '';

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(88,28,135,0.03);">
                <div style="display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; margin-right:8px;">
                    <strong style="font-size:12px; color:#3b0764;">${dataFormatada}${gota}</strong>
                    <span style="font-size:11px; color:#581c87; font-weight:600; line-height:1.35;">${humorTxt}</span>
                    <span style="font-size:10.5px; color:#047857; font-weight:600; line-height:1.35;">${fisicoTxt}</span>
                </div>
                <button type="button" style="background:#fef2f2; border:1px solid #fecaca; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="window.excluirRegistroSintoma('${reg.id}')" title="Excluir">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${svgGraficoHtml}
        <h4 style="font-size:12px; color:#581c87; margin:6px 0 8px 2px; text-transform:uppercase; font-weight:800;">Histórico dos Registos Diários</h4>
        ${htmlLista}
    `;
};

window.excluirRegistroSintoma = async function(idSintoma) {
    const supabase = obterClienteSupabaseSeguro();
    if (!supabase || !idSintoma) return;

    if (!confirm("Deseja mesmo eliminar este registo diário?")) return;

    try {
        const { error } = await supabase.from('saude_sintomas').delete().eq('id', idSintoma);
        if (!error) {
            window.mostrarToast("Registo removido com sucesso!", "sucesso");
            await window.carregarHistoricoSintomas();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 7. DIÁRIO DA ALMA: LIVRO DE MEMÓRIAS EM PAPEL RÚSTICO PAGINADO
// =========================================================================

let capituloDiarioEmLeituraAtual = null;
let indicePaginaLeituraAtual = 0;
let listaPaginasLeitura = [];

window.abrirPaginaDiario = function(id = '', titulo = '', conteudoCompleto = '', tipoFonte = 'cursiva', metaSalva = null) {
    const vistaPrincipal = document.getElementById('vista-principal-espaco-mulher');
    const vistaDiario = document.getElementById('vista-pagina-diario-mulher');

    if (vistaPrincipal && vistaDiario) {
        vistaPrincipal.classList.add('oculto');
        vistaDiario.classList.remove('oculto');

        document.getElementById('diario-id-edit').value = id;
        document.getElementById('diario-titulo').value = titulo || '';

        let textoLimpo = conteudoCompleto || '';
        let meta = metaSalva || { fisico: 7, humor: "Feliz" };

        const regexMeta = /<!--suiri_meta:(\{.*?\})-->/;
        const matchMeta = textoLimpo.match(regexMeta);
        if (matchMeta) {
            try {
                meta = JSON.parse(matchMeta[1]);
                textoLimpo = textoLimpo.replace(regexMeta, '').trim();
            } catch (e) {}
        }

        const rngFisico = document.getElementById('range-termo-fisico-diario');
        if (rngFisico) {
            rngFisico.value = meta.fisico !== undefined ? meta.fisico : 7;
            window.atualizarRotuloTermoFisicoDiario(rngFisico.value);
        }

        const humorParaAtivar = meta.humor || "Feliz";
        const btnHumor = document.querySelector(`.btn-humor-diario-opcao[data-humor="${humorParaAtivar}"]`);
        if (btnHumor) {
            window.selecionarHumorDiario(btnHumor);
        } else {
            window.humorDiarioSelecionadoAtual = humorParaAtivar;
        }

        if (textoLimpo.includes('<!--suiri_page_break-->')) {
            window.paginasDiarioAtuais = textoLimpo.split('<!--suiri_page_break-->');
        } else if (textoLimpo) {
            window.paginasDiarioAtuais = [textoLimpo];
        } else {
            window.paginasDiarioAtuais = [""];
        }

        window.indicePaginaDiarioAtual = 0;
        window.atualizarVisorPaginaDiario();
        window.mudarEstiloFonteDiario(tipoFonte);
    }
};

window.fecharPaginaDiario = function() {
    const vistaPrincipal = document.getElementById('vista-principal-espaco-mulher');
    const vistaDiario = document.getElementById('vista-pagina-diario-mulher');

    if (vistaPrincipal && vistaDiario) {
        vistaDiario.classList.add('oculto');
        vistaPrincipal.classList.remove('oculto');
    }
};

window.atualizarVisorPaginaDiario = function() {
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    const elIndicador = document.getElementById('indicador-pagina-diario-atual');

    if (txtArea) {
        txtArea.value = window.paginasDiarioAtuais[window.indicePaginaDiarioAtual] || '';
    }

    if (elIndicador) {
        elIndicador.textContent = `Página ${window.indicePaginaDiarioAtual + 1} de ${window.paginasDiarioAtuais.length}`;
    }
};

window.salvarTextoPaginaAtualEmMemoria = function() {
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    if (txtArea) {
        window.paginasDiarioAtuais[window.indicePaginaDiarioAtual] = txtArea.value;
    }
};

window.adicionarNovaPaginaAoDiario = function() {
    window.salvarTextoPaginaAtualEmMemoria();
    window.paginasDiarioAtuais.push("");
    window.indicePaginaDiarioAtual = window.paginasDiarioAtuais.length - 1;
    window.atualizarVisorPaginaDiario();
    document.getElementById('diario-conteudo-pagina-ativa')?.focus();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Nova folha aberta (Página ${window.indicePaginaDiarioAtual + 1})`, "info");
    }
};

window.navegarPaginaDiario = function(direcao) {
    window.salvarTextoPaginaAtualEmMemoria();
    const novoIndex = window.indicePaginaDiarioAtual + direcao;

    if (novoIndex >= 0 && novoIndex < window.paginasDiarioAtuais.length) {
        window.indicePaginaDiarioAtual = novoIndex;
        window.atualizarVisorPaginaDiario();
    } else if (novoIndex >= window.paginasDiarioAtuais.length) {
        const textoAtual = window.paginasDiarioAtuais[window.indicePaginaDiarioAtual]?.trim();
        if (textoAtual.length > 0) {
            window.adicionarNovaPaginaAoDiario();
        }
    }
};

window.monitorarLimiteLinhasPagina = function(textarea) {
    const linhas = textarea.value.split('\n');
    if (linhas.length > 18) {
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Fim da folha alcançado. Toque em '+ Nova Folha' para virar a página.", "info");
        }
    }
};

window.mudarEstiloFonteDiario = function(tipo) {
    const inputTipo = document.getElementById('diario-tipo-fonte');
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    const btnCursiva = document.getElementById('btn-fonte-cursiva');
    const btnForma = document.getElementById('btn-fonte-forma');

    if (inputTipo) inputTipo.value = tipo;

    if (tipo === 'cursiva') {
        if (txtArea) {
            txtArea.style.fontFamily = "'Alex Brush', 'Great Vibes', cursive";
            txtArea.style.fontSize = "20px";
            txtArea.style.lineHeight = "34px";
            txtArea.style.fontStyle = "normal";
        }
        if (btnCursiva) { btnCursiva.style.background = '#7c3aed'; btnCursiva.style.color = '#fff'; btnCursiva.style.border = 'none'; }
        if (btnForma) { btnForma.style.background = '#fff'; btnForma.style.color = '#5c4426'; btnForma.style.border = '1px solid #d5c3a5'; }
    } else {
        if (txtArea) {
            txtArea.style.fontFamily = "'Segoe UI', sans-serif";
            txtArea.style.fontSize = "14.5px";
            txtArea.style.lineHeight = "34px";
            txtArea.style.fontStyle = "normal";
        }
        if (btnForma) { btnForma.style.background = '#7c3aed'; btnForma.style.color = '#fff'; btnForma.style.border = 'none'; }
        if (btnCursiva) { btnCursiva.style.background = '#fff'; btnCursiva.style.color = '#5c4426'; btnCursiva.style.border = '1px solid #d5c3a5'; }
    }
};

window.salvarPaginaDiarioCompleta = async function() {
    window.salvarTextoPaginaAtualEmMemoria();

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    
    const id = document.getElementById('diario-id-edit')?.value;
    const titulo = document.getElementById('diario-titulo')?.value?.trim();
    const tipoFonte = document.getElementById('diario-tipo-fonte')?.value || 'cursiva';

    const vFisico = parseInt(document.getElementById('range-termo-fisico-diario')?.value || '7', 10);
    const vHumor = window.humorDiarioSelecionadoAtual || 'Feliz';

    const paginasFiltradas = window.paginasDiarioAtuais.filter((p, idx) => idx === 0 || p.trim().length > 0);
    let conteudoBase = paginasFiltradas.join('<!--suiri_page_break-->');

    if (!supabase || !usuarioId) return;
    if (!conteudoBase || !conteudoBase.trim()) {
        return typeof window.mostrarToast === 'function' ? window.mostrarToast("Escreva algo na folha do diário.", "erro") : alert("Escreva algo.");
    }

    const metaTag = `<!--suiri_meta:${JSON.stringify({ fisico: vFisico, humor: vHumor, txtFisico: window.obterDescricaoTermoFisicoDiario(vFisico) })}-->`;
    const conteudoCompleto = metaTag + '\n' + conteudoBase;

    try {
        const payload = {
            usuario_id: usuarioId,
            titulo: titulo || 'Pensamento do Dia',
            conteudo: conteudoCompleto,
            tipo_fonte: tipoFonte
        };

        let error;
        if (id) {
            const res = await supabase.from('saude_diario').update(payload).eq('id', id);
            error = res.error;
        } else {
            const res = await supabase.from('saude_diario').insert([payload]);
            error = res.error;
        }

        if (error) {
            window.mostrarToast("Erro ao guardar no diário: " + error.message, "erro");
        } else {
            window.mostrarToast("Capítulo guardado com carinho no seu livro de memórias!", "sucesso");
            window.fecharPaginaDiario();
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

window.carregarDiarioMulher = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    const container = document.getElementById('container-lista-diario-mulher');
    if (!supabase || !usuarioId || !container) return;

    try {
        const { data, error } = await supabase
            .from('saude_diario')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('criado_em', { ascending: false });

        if (!error && data) {
            window.dadosDiarioMulher = data;
            if (data.length === 0) {
                container.innerHTML = '<span style="font-size:11.5px; color:#78593a; font-style:italic;">Nenhum capítulo gravado ainda. Comece a sua primeira folha de memórias!</span>';
                return;
            }

            container.innerHTML = data.map(item => {
                const partes = item.data_registro.split('-');
                const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                
                let textoLimpo = item.conteudo || '';
                let meta = { fisico: 7, humor: 'Feliz', txtFisico: 'Mulherão 💃' };

                const matchMeta = textoLimpo.match(/<!--suiri_meta:(\{.*?\})-->/);
                if (matchMeta) {
                    try {
                        meta = JSON.parse(matchMeta[1]);
                        textoLimpo = textoLimpo.replace(/<!--suiri_meta:(\{.*?\})-->/, '').trim();
                    } catch (e) {}
                }

                const paginas = textoLimpo.includes('<!--suiri_page_break-->') 
                    ? textoLimpo.split('<!--suiri_page_break-->') 
                    : [textoLimpo];

                const primeiraPagina = paginas[0] || '';
                const resumo = primeiraPagina.length > 110 ? primeiraPagina.substring(0, 110) + '...' : primeiraPagina;
                const estiloFonte = item.tipo_fonte === 'cursiva' ? "font-family:'Alex Brush', 'Great Vibes', cursive; font-size:18px;" : "font-family:'Segoe UI', sans-serif; font-size:12.5px;";

                const descFisicaCurta = meta.fisico <= 3 ? 'Borocochô 🥀' : (meta.fisico <= 7 ? 'Mulherão 💃' : 'Deusa ✨');

                return `
                    <div style="background:#fbf5e8; border:1.5px solid #d5c3a5; border-radius:16px; padding:14px 16px; box-shadow:0 3px 10px rgba(78,52,24,0.06); position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px dashed #d8c6aa; padding-bottom:6px;">
                            <strong style="font-size:14px; color:#3c2a1a; font-family:'Playfair Display', serif;">${item.titulo || 'Pensamento do Dia'}</strong>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:10px; font-weight:800; background:#f0e4cd; color:#5c4426; padding:2px 6px; border-radius:6px;">${paginas.length} folha${paginas.length > 1 ? 's' : ''}</span>
                                <span style="font-size:11px; color:#78593a; font-weight:700;">${dataFormatada}</span>
                            </div>
                        </div>

                        <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
                            <span style="font-size:10px; font-weight:800; background:#ede3ce; color:#5c4426; padding:2px 7px; border-radius:6px; border:1px solid #d5c3a5;">
                                ${descFisicaCurta}
                            </span>
                            <span style="font-size:10px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:2px 7px; border-radius:6px; border:1px solid #d8b4fe;">
                                Humor: ${meta.humor || 'Feliz'}
                            </span>
                        </div>

                        <p style="color:#2c1f14; margin:0 0 10px 0; line-height:1.45; ${estiloFonte} white-space:pre-wrap;">"${resumo}"</p>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" style="background:#7c3aed; border:none; color:#ffffff; padding:6px 14px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer;" onclick="window.abrirLeitorCapituloDiario('${item.id}')">📖 Abrir Livro</button>
                            <div style="display:flex; gap:6px;">
                                <button type="button" style="background:#fef2f2; border:1px solid #fecaca; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.excluirPaginaDiario('${item.id}')" title="Excluir">
                                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Erro ao carregar diário:", err);
    }
};

window.abrirLeitorCapituloDiario = function(idCapitulo) {
    const item = window.dadosDiarioMulher.find(d => d.id === idCapitulo);
    if (!item) return;

    capituloDiarioEmLeituraAtual = item;
    
    let textoLimpo = item.conteudo || '';
    let meta = { fisico: 7, humor: 'Feliz', txtFisico: 'Mulherão 💃' };

    const matchMeta = textoLimpo.match(/<!--suiri_meta:(\{.*?\})-->/);
    if (matchMeta) {
        try {
            meta = JSON.parse(matchMeta[1]);
            textoLimpo = textoLimpo.replace(/<!--suiri_meta:(\{.*?\})-->/, '').trim();
        } catch (e) {}
    }

    listaPaginasLeitura = textoLimpo.includes('<!--suiri_page_break-->') 
        ? textoLimpo.split('<!--suiri_page_break-->') 
        : [textoLimpo];
    indicePaginaLeituraAtual = 0;

    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    const elTitulo = document.getElementById('leitura-titulo-pagina');
    const elData = document.getElementById('leitura-data-pagina');
    const elBadges = document.getElementById('leitura-meta-badges');

    const partes = item.data_registro.split('-');
    const dataFmt = `${partes[2]}/${partes[1]}/${partes[0]}`;

    if (elTitulo) elTitulo.textContent = item.titulo || 'Pensamento do Dia';
    if (elData) elData.textContent = dataFmt;

    if (elBadges) {
        const descFisicaCurta = meta.fisico <= 3 ? 'Borocochô 🥀' : (meta.fisico <= 7 ? 'Mulherão 💃' : 'Deusa ✨');
        elBadges.innerHTML = `
            <span style="font-size:10.5px; font-weight:800; background:#ede3ce; color:#5c4426; padding:3px 8px; border-radius:6px; border:1px solid #d5c3a5;">
                Física: ${descFisicaCurta}
            </span>
            <span style="font-size:10.5px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:3px 8px; border-radius:6px; border:1px solid #d8b4fe;">
                Humor: ${meta.humor || 'Feliz'}
            </span>
        `;
    }

    window.atualizarVisorLeituraPagina();
    if (modalLeitura) modalLeitura.classList.remove('oculto');
};

window.atualizarVisorLeituraPagina = function() {
    const elConteudo = document.getElementById('leitura-conteudo-pagina');
    const elIndicador = document.getElementById('leitura-indicador-pagina');

    if (!capituloDiarioEmLeituraAtual) return;

    const textoPagina = listaPaginasLeitura[indicePaginaLeituraAtual] || '';
    const tipoFonte = capituloDiarioEmLeituraAtual.tipo_fonte || 'cursiva';

    if (elConteudo) {
        elConteudo.textContent = textoPagina;
        elConteudo.style.fontFamily = tipoFonte === 'cursiva' ? "'Alex Brush', 'Great Vibes', cursive" : "'Segoe UI', sans-serif";
        elConteudo.style.fontSize = tipoFonte === 'cursiva' ? "20px" : "14.5px";
    }

    if (elIndicador) {
        elIndicador.textContent = `Página ${indicePaginaLeituraAtual + 1} de ${listaPaginasLeitura.length}`;
    }
};

window.navegarLeituraPagina = function(dir) {
    const novoIdx = indicePaginaLeituraAtual + dir;
    if (novoIdx >= 0 && novoIdx < listaPaginasLeitura.length) {
        indicePaginaLeituraAtual = novoIdx;
        window.atualizarVisorLeituraPagina();
    }
};

window.fecharLeituraDiarioInteira = function() {
    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    if (modalLeitura) modalLeitura.classList.add('oculto');
};

window.editarPaginaAtualLeitura = function() {
    if (!capituloDiarioEmLeituraAtual) return;
    const item = capituloDiarioEmLeituraAtual;
    window.fecharLeituraDiarioInteira();
    window.abrirPaginaDiario(item.id, item.titulo, item.conteudo, item.tipo_fonte || 'cursiva');
};

window.excluirPaginaDiario = async function(idDiario) {
    const supabase = obterClienteSupabaseSeguro();
    if (!supabase || !idDiario) return;

    if (!confirm("Deseja mesmo apagar este capítulo de memórias?")) return;

    try {
        const { error } = await supabase.from('saude_diario').delete().eq('id', idDiario);
        if (!error) {
            window.mostrarToast("Capítulo removido com sucesso!", "sucesso");
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 8. MINUTO ZEN (VÍDEO ZEN.MP4 TELA CHEIA) E MODO ALÍVIO
// =========================================================================

window.abrirModalMinutoZen = function() {
    let modal = document.getElementById('modal-video-minuto-zen');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-video-minuto-zen';
        modal.style.cssText = 'position:fixed !important; inset:0 !important; width:100vw !important; height:100vh !important; background:#000000 !important; z-index:9999999 !important; overflow:hidden !important; margin:0 !important; padding:0 !important; display:flex; align-items:center; justify-content:center;';
        modal.innerHTML = `
            <video id="video-zen-reprodutor" loop playsinline webkit-playsinline preload="auto" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; pointer-events:auto;"></video>
            
            <button type="button" onclick="window.fecharModalMinutoZen()" 
                    style="position:absolute; top:24px; right:20px; z-index:10; width:44px; height:44px; border-radius:50%; background:rgba(0,0,0,0.55); border:1.5px solid rgba(255,255,255,0.7); color:#ffffff; font-size:20px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.4); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);">
                ✕
            </button>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.remove('oculto');
    modal.style.display = 'flex';

    const vid = document.getElementById('video-zen-reprodutor');
    if (vid) {
        if (!vid.src || !vid.src.includes('zen.mp4')) {
            vid.src = 'zen.mp4';
        }

        vid.setAttribute('playsinline', '');
        vid.setAttribute('webkit-playsinline', '');
        vid.loop = true;

        vid.muted = false;
        vid.defaultMuted = false;
        vid.volume = 1.0;

        vid.currentTime = 0;
        vid.load();
        
        const promessa = vid.play();
        if (promessa !== undefined) {
            promessa.catch(() => {
                vid.play().catch(() => {});
            });
        }
    }
};

window.fecharModalMinutoZen = function() {
    const modal = document.getElementById('modal-video-minuto-zen');
    const vid = document.getElementById('video-zen-reprodutor');

    if (vid) {
        vid.pause();
        vid.currentTime = 0;
        vid.muted = true;
    }

    if (modal) {
        modal.classList.add('oculto');
        modal.style.display = 'none';
    }
};

window.abrirModalRespiracaoGuiada = window.abrirModalMinutoZen;
window.fecharModalRespiracao = window.fecharModalMinutoZen;

window.abrirModoAcolhimentoEmergencia = function() {
    let modal = document.getElementById('modal-modo-acolhimento');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-modo-acolhimento';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:#ffffff; width:100%; max-width:420px; max-height:86vh; padding:24px; border-radius:30px; border:1.5px solid #d8b4fe; overflow-y:auto; box-shadow:0 25px 60px rgba(59,7,100,0.22); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #d8b4fe; padding-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/medita.png" onerror="this.onerror=null; this.src='./icone/icone-mulher.png';" alt="Acolhimento" style="width:29px; height:29px; object-fit:contain;">
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#3b0764;">Modo Acolhimento</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; font-weight:800; color:#581c87; background:#faf5ff; border:1px solid #d8b4fe;" onclick="window.fecharModoAcolhimento()">✕</button>
                </div>

                <p style="font-size:12.5px; color:#581c87; line-height:1.5; margin:0 0 16px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#3b0764; display:block; margin-bottom:5px;">Posições de Alívio (Cólica)</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • <strong>Postura da Criança:</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão.<br>
                            • <strong>Pernas na Parede:</strong> Deite de costas e apoie as pernas esticadas na parede para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#581c87; display:block; margin-bottom:5px;">Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • O Fabuloso Destino de Amélie Poulain<br>
                            • Comer, Rezar, Amar<br>
                            • Anne with an E (Série)
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#7e22ce; display:block; margin-bottom:5px;">Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12px; color:#3b0764; font-style:italic; margin:0; line-height:1.45;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se recolher, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModoAcolhimento(); window.abrirModalMinutoZen();">Iniciar Minuto Zen</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('oculto');
};

window.fecharModoAcolhimento = function() {
    const modal = document.getElementById('modal-modo-acolhimento');
    if (modal) modal.classList.add('oculto');
};

// =========================================================================
// 9. PREVISÕES, CICLOS, INSPIRAÇÃO E REGISTRO RÁPIDO
// =========================================================================

window.registrarMenstruacaoHojeRapido = function() {
    window.abrirModalRegistroCiclo();
    const dtInicio = document.getElementById('input-data-inicio-ciclo');
    if (dtInicio) {
        const hojeObj = new Date();
        dtInicio.value = hojeObj.getFullYear() + '-' + String(hojeObj.getMonth() + 1).padStart(2, '0') + '-' + String(hojeObj.getDate()).padStart(2, '0');
    }
};

window.abrirModalRegistroCiclo = function() {
    const modal = document.getElementById('modal-registro-ciclo-mulher');
    if (modal) {
        modal.classList.remove('oculto');
        const dtInicio = document.getElementById('input-data-inicio-ciclo');
        if (dtInicio && !dtInicio.value) {
            const h = new Date();
            dtInicio.value = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
        }
    }
};

window.fecharModalRegistroCiclo = function() {
    const modal = document.getElementById('modal-registro-ciclo-mulher');
    if (modal) modal.classList.add('oculto');
};

window.carregarDadosCicloMulher = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            const { data, error } = await supabase
                .from('saude_ciclos')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('data_inicio', { ascending: false });

            if (!error && data) window.dadosCicloMulher = data;
        } catch (err) { console.error(err); }
    }
    window.processarEExibirPrevisao();
};

window.atualizarInspiracaoDiaria = function(sortearOutra = false) {
    const elInspiracao = document.getElementById('txt-inspiracao-diaria');
    if (!elInspiracao) return;

    let catalogo = (window.AcervoBemEstarMulher && window.AcervoBemEstarMulher.length > 0)
        ? window.AcervoBemEstarMulher
        : INSPIRACOES_FALLBACK;

    if (!catalogo || catalogo.length === 0) {
        catalogo = INSPIRACOES_FALLBACK;
    }

    if (sortearOutra) {
        const idxSorteio = Math.floor(Math.random() * catalogo.length);
        elInspiracao.innerHTML = catalogo[idxSorteio];
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Nova inspiração da alma sorteada! 🌸", "info");
        }
    } else {
        const hoje = obterHoje();
        const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
        const diaDoAno = Math.max(0, calcularDiffDias(hoje, inicioAno));
        elInspiracao.innerHTML = catalogo[diaDoAno % catalogo.length];
    }
};

window.processarEExibirPrevisao = function() {
    const elFase = document.getElementById('display-fase-ciclo-atual');
    const elPrevisao = document.getElementById('txt-previsao-proxima-menstruacao');
    const elDataBase = document.getElementById('txt-data-base-calculo');
    const elDica = document.getElementById('txt-dica-diaria-ciclo');
    const elBarra = document.getElementById('barra-progresso-ciclo');
    const elTxtDia = document.getElementById('txt-dia-ciclo-atual');
    const elTxtFinal = document.getElementById('txt-dia-ciclo-final');

    const hoje = obterHoje();
    const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
    const diaDoAno = Math.max(0, calcularDiffDias(hoje, inicioAno));

    window.atualizarInspiracaoDiaria(false);

    const ciclosValidosPassados = window.dadosCicloMulher ? window.dadosCicloMulher.filter(c => parseData(c.data_inicio).getTime() <= hoje.getTime()) : [];

    if (ciclosValidosPassados.length === 0) {
        if (elFase) elFase.textContent = "Ciclo Natural (Bem-Estar)";
        if (elPrevisao) elPrevisao.textContent = "Toque em '+ Ciclo' ou 'Menstruei hoje' para iniciar.";
        if (elDataBase) elDataBase.textContent = "Sem histórico inicial registado";
        
        let dicaGenerica = "A sua energia e criatividade renovam-se a cada dia. Respeite os seus limites e cuide de si com carinho.";
        if (window.AcervoDicasMulher && window.AcervoDicasMulher.folicular && window.AcervoDicasMulher.folicular.length > 0) {
            dicaGenerica = window.AcervoDicasMulher.folicular[diaDoAno % window.AcervoDicasMulher.folicular.length];
        }
        if (elDica) elDica.textContent = dicaGenerica;
        if (elBarra) elBarra.style.width = "40%";
        if (elTxtDia) elTxtDia.textContent = "Dia 1";
        if (elTxtFinal) elTxtFinal.textContent = "Dia 28";

        window.renderizarRoteiroEstagiosCiclo(1, 28, 5, false);
        return;
    }

    let mediaCiclo = 28;
    if (ciclosValidosPassados.length > 1) {
        let somaDias = 0;
        let qtdValidos = 0;
        for (let i = 0; i < ciclosValidosPassados.length - 1; i++) {
            const dataAtual = parseData(ciclosValidosPassados[i].data_inicio);
            const dataAnt = parseData(ciclosValidosPassados[i+1].data_inicio);
            const diff = calcularDiffDias(dataAtual, dataAnt);
            
            if (diff >= 20 && diff <= 45) {
                somaDias += diff;
                qtdValidos++;
            }
        }
        if (qtdValidos > 0) mediaCiclo = Math.round(somaDias / qtdValidos);
    }

    const ultimoCiclo = ciclosValidosPassados[0];
    const dataInicioUltimo = parseData(ultimoCiclo.data_inicio);
    const duracaoSangramento = parseInt(ultimoCiclo.duracao_sangramento || 5, 10);

    let diaAtualDoCiclo = calcularDiffDias(hoje, dataInicioUltimo) + 1;
    if (diaAtualDoCiclo < 1) diaAtualDoCiclo = 1;

    const proximaMenstruacao = criarDataAbsoluta(dataInicioUltimo.getFullYear(), dataInicioUltimo.getMonth() + 1, dataInicioUltimo.getDate() + mediaCiclo);
    const diasParaProxima = calcularDiffDias(proximaMenstruacao, hoje);

    const diaOvulacaoEstimado = mediaCiclo - 14; 
    const inicioJanelaFertil = Math.max(duracaoSangramento + 1, diaOvulacaoEstimado - 4);
    const fimJanelaFertil = diaOvulacaoEstimado + 1;

    let faseTexto = "";
    let chaveFase = "";
    let corGradiente = ""; 

    if (diaAtualDoCiclo > mediaCiclo) {
        faseTexto = "Atraso Menstrual";
        chaveFase = "lutea";
        corGradiente = "linear-gradient(90deg, #94a3b8, #64748b)";
    } else if (diaAtualDoCiclo >= 1 && diaAtualDoCiclo <= duracaoSangramento) {
        faseTexto = "Fase Menstrual";
        chaveFase = "menstrual";
        corGradiente = "linear-gradient(90deg, #e11d48, #9f1239)";
    } else if (diaAtualDoCiclo > duracaoSangramento && diaAtualDoCiclo < inicioJanelaFertil) {
        faseTexto = "Fase Folicular";
        chaveFase = "folicular";
        corGradiente = "linear-gradient(90deg, #10b981, #047857)";
    } else if (diaAtualDoCiclo >= inicioJanelaFertil && diaAtualDoCiclo <= fimJanelaFertil) {
        faseTexto = "Fase Ovulatória";
        chaveFase = "ovulatoria";
        corGradiente = "linear-gradient(90deg, #f59e0b, #b45309)";
    } else {
        faseTexto = "Fase Lútea";
        chaveFase = "lutea";
        corGradiente = "linear-gradient(90deg, #a855f7, #6b21a8)";
    }

    if (elFase) elFase.textContent = faseTexto;
    if (elDataBase) elDataBase.textContent = `Ciclo Base: ${formatarDataVisor(dataInicioUltimo)}`;

    if (elPrevisao) {
        if (diasParaProxima > 1) {
            elPrevisao.textContent = `Próxima menstruação prevista em ${diasParaProxima} dias.`;
        } else if (diasParaProxima === 1) {
            elPrevisao.textContent = "Próxima menstruação prevista para amanhã.";
        } else if (diasParaProxima === 0) {
            elPrevisao.textContent = "A menstruação deve descer hoje.";
        } else {
            const diasAtraso = Math.abs(diasParaProxima);
            elPrevisao.textContent = `Ciclo atrasado há ${diasAtraso} dia(s).`;
        }
    }

    if (elDica) {
        let dicaParaMostrar = DICAS_BIOLOGICAS_FALLBACK[chaveFase] || "Respeite o ritmo do seu corpo hoje.";
        if (window.AcervoDicasMulher && window.AcervoDicasMulher[chaveFase] && window.AcervoDicasMulher[chaveFase].length > 0) {
            const catalogoFase = window.AcervoDicasMulher[chaveFase];
            dicaParaMostrar = catalogoFase[diaDoAno % catalogoFase.length];
        }
        elDica.textContent = dicaParaMostrar;
    }

    if (elBarra && elTxtDia && elTxtFinal) {
        let pctProgresso = (diaAtualDoCiclo / mediaCiclo) * 100;
        if (pctProgresso > 100) pctProgresso = 100;
        if (pctProgresso < 0) pctProgresso = 0;
        
        elBarra.style.width = `${pctProgresso}%`;
        elBarra.style.background = corGradiente;
        elTxtDia.textContent = `Dia ${diaAtualDoCiclo}`;
        elTxtFinal.textContent = diaAtualDoCiclo > mediaCiclo ? `Atraso` : `Dia ${mediaCiclo}`;
    }

    // Renderiza o Roteiro em Linha dos 4 Estágios com a Previsão de Chegada
    window.renderizarRoteiroEstagiosCiclo(diaAtualDoCiclo, mediaCiclo, duracaoSangramento, true);
};

window.renderizarRoteiroEstagiosCiclo = function(diaAtual, mediaCiclo, duracaoSangramento, cicloAtivo) {
    duracaoSangramento = duracaoSangramento || 5;
    mediaCiclo = mediaCiclo || 28;

    const diaOvulacao = mediaCiclo - 14;
    const inicioFertil = Math.max(duracaoSangramento + 1, diaOvulacao - 4);
    const fimFertil = diaOvulacao + 1;

    const fimMenstrual = duracaoSangramento;
    const inicioFolicular = duracaoSangramento + 1;
    const fimFolicular = inicioFertil - 1;
    const inicioOvulacao = inicioFertil;
    const fimOvulacao = fimFertil;
    const inicioLutea = fimFertil + 1;
    const fimLutea = mediaCiclo;

    // Atualiza os subtítulos de dias de cada marco na interface
    const elSub1 = document.getElementById('sub-estagio-1');
    const elSub2 = document.getElementById('sub-estagio-2');
    const elSub3 = document.getElementById('sub-estagio-3');
    const elSub4 = document.getElementById('sub-estagio-4');

    if (elSub1) elSub1.textContent = `Dia 1-${fimMenstrual}`;
    if (elSub2) elSub2.textContent = `Dia ${inicioFolicular}-${fimFolicular}`;
    if (elSub3) elSub3.textContent = `Dia ${inicioOvulacao}-${fimOvulacao}`;
    if (elSub4) elSub4.textContent = `Dia ${inicioLutea}-${fimLutea}`;

    if (!cicloAtivo) {
        const lblResumo = document.getElementById('lbl-status-estagio-resumo');
        const txtEst = document.getElementById('txt-estimativa-proximo-estagio');
        if (lblResumo) lblResumo.textContent = 'Ciclo Padrão (28 Dias)';
        if (txtEst) txtEst.innerHTML = 'Registe a sua data em <strong>Ciclo</strong> para mapear o seu estágio atual e a previsão em tempo real.';
        return;
    }

    window.estagioCicloAtualDetectado = 1;
    let estagioAtual = 1;
    let nomeEstagioAtual = "Fase Menstrual";
    let proximoEstagioNome = "";
    let diaChegadaProximo = 0;
    let diasParaProximo = 0;
    let progressoLinha = 12;

    if (diaAtual <= fimMenstrual) {
        estagioAtual = 1;
        nomeEstagioAtual = "Fase Menstrual";
        proximoEstagioNome = "Fase Folicular";
        diaChegadaProximo = inicioFolicular;
        diasParaProximo = diaChegadaProximo - diaAtual;
        progressoLinha = 12;
    } else if (diaAtual <= fimFolicular) {
        estagioAtual = 2;
        nomeEstagioAtual = "Fase Folicular";
        proximoEstagioNome = "Fase Ovulatória";
        diaChegadaProximo = inicioOvulacao;
        diasParaProximo = diaChegadaProximo - diaAtual;
        progressoLinha = 38;
    } else if (diaAtual <= fimOvulacao) {
        estagioAtual = 3;
        nomeEstagioAtual = "Fase Ovulatória";
        proximoEstagioNome = "Fase Lútea";
        diaChegadaProximo = inicioLutea;
        diasParaProximo = diaChegadaProximo - diaAtual;
        progressoLinha = 65;
    } else if (diaAtual <= mediaCiclo) {
        estagioAtual = 4;
        nomeEstagioAtual = "Fase Lútea";
        proximoEstagioNome = "Fase Menstrual (Novo Ciclo)";
        diaChegadaProximo = mediaCiclo + 1;
        diasParaProximo = mediaCiclo - diaAtual + 1;
        progressoLinha = 92;
    } else {
        estagioAtual = 4;
        nomeEstagioAtual = "Fase Lútea (Atraso)";
        proximoEstagioNome = "Novo Ciclo Menstrual";
        diaChegadaProximo = mediaCiclo + 1;
        diasParaProximo = 0;
        progressoLinha = 100;
    }

    window.estagioCicloAtualDetectado = estagioAtual;

    // Atualiza a linha de conexão com animação fluida
    const elLinha = document.getElementById('linha-progresso-estagios');
    if (elLinha) {
        elLinha.style.width = `${progressoLinha}%`;
    }

    // Atualiza visualmente os 4 marcos (bolinhas)
    for (let i = 1; i <= 4; i++) {
        const marco = document.getElementById(`marco-estagio-${i}`);
        if (!marco) continue;
        const bolinha = marco.querySelector('.bolinha-estagio');
        const titulo = marco.querySelector('strong');
        const subtitulo = marco.querySelector('span');

        if (i === estagioAtual) {
            // Estágio Ativo
            bolinha.style.background = 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)';
            bolinha.style.borderColor = '#c084fc';
            bolinha.style.color = '#ffffff';
            bolinha.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.22), 0 4px 10px rgba(124, 58, 237, 0.3)';
            bolinha.style.transform = 'scale(1.15)';
            if (titulo) titulo.style.color = '#581c87';
            if (subtitulo) subtitulo.style.color = '#7c3aed';
        } else if (i < estagioAtual) {
            // Estágio Concluído
            bolinha.style.background = '#10b981';
            bolinha.style.borderColor = '#059669';
            bolinha.style.color = '#ffffff';
            bolinha.style.boxShadow = 'none';
            bolinha.style.transform = 'scale(1)';
            bolinha.innerHTML = '✓';
            if (titulo) titulo.style.color = '#047857';
            if (subtitulo) subtitulo.style.color = '#059669';
        } else {
            // Estágio Futuro
            bolinha.style.background = '#ffffff';
            bolinha.style.borderColor = '#d8b4fe';
            bolinha.style.color = '#94a3b8';
            bolinha.style.boxShadow = 'none';
            bolinha.style.transform = 'scale(1)';
            bolinha.textContent = i;
            if (titulo) titulo.style.color = '#64748b';
            if (subtitulo) subtitulo.style.color = '#94a3b8';
        }
    }

    // Atualiza o resumo no topo do cartão
    const lblResumo = document.getElementById('lbl-status-estagio-resumo');
    if (lblResumo) {
        lblResumo.textContent = `Estágio ${estagioAtual} • ${nomeEstagioAtual}`;
    }

    // Atualiza a caixa de estimativa do próximo estágio
    const txtEst = document.getElementById('txt-estimativa-proximo-estagio');
    if (txtEst) {
        if (diasParaProximo <= 0) {
            txtEst.innerHTML = `Transição iminente: a <strong>${proximoEstagioNome}</strong> deve começar hoje ou a qualquer momento.`;
        } else if (diasParaProximo === 1) {
            txtEst.innerHTML = `A <strong>${proximoEstagioNome}</strong> está prevista para começar <strong>amanhã</strong> (por volta do Dia ${diaChegadaProximo} do ciclo).`;
        } else {
            txtEst.innerHTML = `O próximo estágio (<strong>${proximoEstagioNome}</strong>) chega em média no <strong>Dia ${diaChegadaProximo}</strong> — faltam cerca de <strong>${diasParaProximo} dia(s)</strong>.`;
        }
    }

    // Atualiza Painel Biológico: Fertilidade, Libido e Energia
    const badgeFert = document.getElementById('badge-bio-fertilidade');
    const subFert = document.getElementById('sub-bio-fertilidade');
    const badgeLib = document.getElementById('badge-bio-libido');
    const subLib = document.getElementById('sub-bio-libido');
    const badgeEnergia = document.getElementById('badge-bio-energia');
    const subEnergia = document.getElementById('sub-bio-energia');

    let dadosBio = {
        fert: "Mínima",
        subFert: "Pouco propenso",
        corFert: "#be185d",
        lib: "Em recolhimento",
        subLib: "Foco em carinho",
        corLib: "#7c3aed",
        energia: "Bateria Baixa",
        subEnergia: "Repouso & Ninho",
        corEnergia: "#ca8a04"
    };

    if (estagioAtual === 1) { // Menstrual
        dadosBio = {
            fert: "Muito Baixa",
            subFert: "Improvável engravidar",
            corFert: "#9d174d",
            lib: "Introspectiva",
            subLib: "Conforto & Aconchego",
            corLib: "#6b21a8",
            energia: "Bateria Baixa",
            subEnergia: "Repouso & Descanso",
            corEnergia: "#e11d48"
        };
    } else if (estagioAtual === 2) { // Folicular
        dadosBio = {
            fert: "Média-Baixa",
            subFert: "Fertilidade subindo",
            corFert: "#b45309",
            lib: "Despertando",
            subLib: "Energia em ascensão",
            corLib: "#7c3aed",
            energia: "Em Alta ⚡",
            subEnergia: "Criatividade & Pique",
            corEnergia: "#16a34a"
        };
    } else if (estagioAtual === 3) { // Ovulatória
        dadosBio = {
            fert: "PICO MÁXIMO",
            subFert: "Altamente propensa",
            corFert: "#e11d48",
            lib: "Ápice & Fogo 🔥",
            subLib: "Magnetismo no auge",
            corLib: "#c026d3",
            energia: "Radiante / 100%",
            subEnergia: "Força & Vigor Total",
            corEnergia: "#d97706"
        };
    } else { // Lútea
        dadosBio = {
            fert: "Infértil / Baixa",
            subFert: "Pouco propensa",
            corFert: "#64748b",
            lib: "Calma & Suave",
            subLib: "Afeto e conexão serena",
            corLib: "#581c87",
            energia: "Desacelerando",
            subEnergia: "Pede pausas & calma",
            corEnergia: "#64748b"
        };
    }

    if (badgeFert) {
        badgeFert.textContent = dadosBio.fert;
        badgeFert.style.color = dadosBio.corFert;
    }
    if (subFert) subFert.textContent = dadosBio.subFert;
    if (badgeLib) {
        badgeLib.textContent = dadosBio.lib;
        badgeLib.style.color = dadosBio.corLib;
    }
    if (subLib) subLib.textContent = dadosBio.subLib;
    if (badgeEnergia) {
        badgeEnergia.textContent = dadosBio.energia;
        badgeEnergia.style.color = dadosBio.corEnergia;
    }
    if (subEnergia) subEnergia.textContent = dadosBio.subEnergia;

};


// =========================================================================
// MOTOR DO MODAL DE ORIENTAÇÕES E DICAS POR FASE DO CICLO
// =========================================================================
window.estagioModalAtivoAtual = 1;
window.topicoModalAtivoAtual = 'geral';

window.abrirModalOrientacoesFase = function(topico = 'geral', estagioNum = null) {
    let modal = document.getElementById('modal-orientacoes-estagio-fase');
    if (!modal) return;

    if (estagioNum !== null && estagioNum !== undefined) {
        window.estagioModalAtivoAtual = parseInt(estagioNum, 10);
    } else {
        window.estagioModalAtivoAtual = window.estagioCicloAtualDetectado || 1;
    }

    window.topicoModalAtivoAtual = topico || 'geral';
    window.renderizarConteudoModalOrientacoes();
    modal.classList.remove('oculto');
};

window.fecharModalOrientacoesFase = function() {
    const modal = document.getElementById('modal-orientacoes-estagio-fase');
    if (modal) modal.classList.add('oculto');
};

window.trocarFaseModalOrientacoes = function(numFase) {
    window.estagioModalAtivoAtual = numFase;
    window.renderizarConteudoModalOrientacoes();
};

window.trocarTopicoModalOrientacoes = function(topico) {
    window.topicoModalAtivoAtual = topico;
    window.renderizarConteudoModalOrientacoes();
};

window.renderizarConteudoModalOrientacoes = function() {
    const numFase = window.estagioModalAtivoAtual || 1;
    const topico = window.topicoModalAtivoAtual || 'geral';
    const dados = window.ORIENTACOES_FASES_CICLO ? window.ORIENTACOES_FASES_CICLO[numFase] : null;
    if (!dados) return;

    const elEmoji = document.getElementById('modal-fase-emoji');
    const elTitulo = document.getElementById('modal-fase-titulo');
    const elSubtitulo = document.getElementById('modal-fase-subtitulo');

    if (elEmoji) elEmoji.textContent = dados.emoji;
    if (elTitulo) elTitulo.textContent = dados.nome;
    if (elSubtitulo) elSubtitulo.textContent = `${dados.estacao} • ${dados.dias_ref}`;

    for (let i = 1; i <= 4; i++) {
        const btnFase = document.getElementById(`btn-modal-fase-${i}`);
        if (!btnFase) continue;
        if (i === numFase) {
            btnFase.style.background = '#ffffff';
            btnFase.style.color = '#3b0764';
            btnFase.style.boxShadow = '0 2px 6px rgba(124, 58, 237, 0.15)';
            btnFase.style.fontWeight = '900';
        } else {
            btnFase.style.background = 'transparent';
            btnFase.style.color = '#6b21a8';
            btnFase.style.boxShadow = 'none';
            btnFase.style.fontWeight = '700';
        }
    }

    ['geral', 'fertilidade', 'libido', 'energia'].forEach(t => {
        const btnTopico = document.getElementById(`btn-modal-topico-${t}`);
        if (!btnTopico) return;
        if (t === topico) {
            btnTopico.style.background = '#7c3aed';
            btnTopico.style.color = '#ffffff';
            btnTopico.style.border = 'none';
        } else {
            btnTopico.style.background = '#ffffff';
            btnTopico.style.color = '#581c87';
            btnTopico.style.border = '1px solid #d8b4fe';
        }
    });

    const container = document.getElementById('modal-conteudo-orientacoes-corpo');
    if (!container) return;

    let html = '';

    if (topico === 'geral') {
        html += `
            <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-left:4px solid #7c3aed; border-radius:14px; padding:12px; margin-bottom:12px;">
                <span style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:3px;">Sua Vibe & Fisiologia Nesta Fase:</span>
                <p style="margin:0; font-size:12px; color:#3b0764; font-weight:600; line-height:1.45;">${dados.resumo_vibe}</p>
            </div>
        `;
    }

    const chavesCards = (topico === 'geral') ? ['fertilidade', 'libido', 'energia'] : [topico];

    chavesCards.forEach(chave => {
        const c = dados.cards[chave];
        if (!c) return;

        html += `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:16px; padding:12px 14px; margin-bottom:10px; box-shadow:0 3px 8px rgba(88,28,135,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f3e8ff; padding-bottom:6px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:16px;">${c.icone}</span>
                        <strong style="font-size:12.5px; color:#3b0764;">${c.titulo}</strong>
                    </div>
                    <span style="font-size:10.5px; font-weight:800; background:#faf5ff; color:${c.cor}; border:1px solid #d8b4fe; padding:2px 8px; border-radius:8px;">${c.badge}</span>
                </div>

                <div style="font-size:11.5px; color:#581c87; margin-bottom:8px; line-height:1.4; background:#fdf4ff; border-radius:8px; padding:7px 9px;">
                    <strong>O que acontece no seu corpo:</strong> ${c.fisiologia}
                </div>

                <div style="font-size:11.5px; color:#3b0764; line-height:1.45;">
                    <strong style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; display:block; margin-bottom:4px;">Como lidar da melhor forma:</strong>
                    <ul style="margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;">
                        ${c.como_lidar.map(item => `<li style="font-size:11px;">${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};


window.salvarCicloHistorico = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    
    const dataInicio = document.getElementById('input-data-inicio-ciclo')?.value;
    const duracao = parseInt(document.getElementById('input-duracao-sangramento')?.value || '5', 10);

    if (!supabase || !usuarioId) return;
    if (!dataInicio) return typeof window.mostrarToast === 'function' ? window.mostrarToast("Informe a data.", "erro") : alert("Falta a data.");

    try {
        const { error } = await supabase.from('saude_ciclos').insert([{
            usuario_id: usuarioId,
            data_inicio: dataInicio,
            duracao_sangramento: duracao
        }]);

        if (error) {
            window.mostrarToast("Erro ao guardar ciclo: " + error.message, "erro");
        } else {
            window.mostrarToast("Início do ciclo atualizado com sucesso! 🩸", "sucesso");
            window.fecharModalRegistroCiclo();
            await window.carregarDadosCicloMulher();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 10. GATILHO DE AUTO-INICIALIZAÇÃO SEGURO NA CARGA DA TELA
// =========================================================================
(function inicializarEspacoMulherAutomatico() {
    const disparar = () => {
        if (typeof window.abrirEspacoMulher === 'function') {
            window.abrirEspacoMulher();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', disparar);
    } else {
        setTimeout(disparar, 60);
    }
})();
