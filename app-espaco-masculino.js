// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-ESPACO-MASCULINO.JS (100% INTEGRAL E COMPLETO)
// Alta Performance: Forja Romana & Medieval (Ferro Forjado, Brasas & Aço),
// Cabeçalho Nobre com Ícones +20%, Sliders Noturnos e Contraste Máximo
// Integrado ao Catálogo de Ícones PNG da Pasta ./icone/ (com love.png no Radar)
// Curadoria Dinâmica: Sorteio Diário, "Quero Assistir" e 2 Gavetas Retráteis
// =========================================================================

// 1. ACERVOS DIÁRIOS E SEMANAIS (FALLBACK SEGURO ANTES DO CATÁLOGO GERAL)
window.AcervoReflexoesEstoicas365 = window.AcervoReflexoesEstoicas365 || [
    { data: "1 de janeiro", autor: "Epiteto, Encheiridion, 23", texto: "Se você voltar sua atenção para as coisas exteriores, para o prazer de qualquer pessoa, esteja certo de que terá arruinado seu propósito de vida. Contente-se, então, em ser sábio; e se você deseja parecer assim para alguém, pareça assim a você mesmo, e isso lhe bastará." },
    { data: "2 de janeiro", autor: "Marco Aurélio, Meditações, 8, 12", texto: "Quando você hesita em lutar para se levantar, lembre-se de que a socialização está de acordo com a sua constituição e com a natureza humana. O sono também é comum para os seres irracionais." },
    { data: "3 de janeiro", autor: "Marco Aurélio, Meditações, 6, 22", texto: "Cumpro meu dever e, de resto, não me distraio com nada que careça de vida ou de razão, ou com quem tenha perdido ou ignorado o caminho correto." }
];

window.AcervoDinamicaADois = window.AcervoDinamicaADois || [
    "❤️ Comunicação: Falar com clareza sobre o que sente ou precisa não é fraqueza. A sua parceira é aliada, não plateia.",
    "🔋 Testosterona & Libido: O estresse crônico destrói o vigor masculino. Aprenda a fechar o ciclo de trabalho e desligar a mente.",
    "❤️ Convivência: Surpreenda na rotina doméstica. O suporte proativo na casa comunica respeito e parceria muito além das palavras.",
    "🔋 Vitalidade: O sono profundo e contínuo é o maior regulador hormonal do homem. Proteja o seu horário de deitar.",
    "❤️ Presença: Esteja por inteiro quando estiver em família. Largue o telemóvel nos momentos de conversa e descanso a dois."
];

window.AcervoArsenalPratico = [
    "💪 Calistenia: Ao executar flexões de braço, mantenha os cotovelos a 45º do tronco para proteger os ombros e focar no peitoral.",
    "🥩 Nutrição: Garanta uma fonte limpa de proteína em todas as refeições. Ela constrói massa muscular e mantém a saciedade alta.",
    "💪 Calistenia: Na barra fixa, complete o movimento até o peito encostar na linha e estenda quase todo o braço na descida.",
    "💧 Hidratação: Comece a manhã com 500 ml de água antes do primeiro café. Isso reidrata o cérebro e ativa o metabolismo.",
    "🥩 Nutrição: Evite calorias vazias em bebidas açucaradas ao longo do dia. A constância de energia vem de comida de verdade."
];

// Catálogo Base de Recomendações de Mídia
window.CatalogoFilmesMasculinos = window.CatalogoFilmesMasculinos || [
    { id: "f1", titulo: "Gladiador", ano: "2000", categoria: "Honra e Liderança", desc: "Força e honra: o general que se tornou escravo e desafiou um império." },
    { id: "f2", titulo: "Um Sonho de Liberdade", ano: "1994", categoria: "Resiliência e Paciência", desc: "A paciência metódica e a esperança inabalável contra o confinamento." },
    { id: "f3", titulo: "À Procura da Felicidade", ano: "2006", categoria: "Família e Superação", desc: "A luta inegociável de um pai que se recusa a ser derrotado pela miséria." },
    { id: "f4", titulo: "Ford vs Ferrari", ano: "2019", categoria: "Foco e Engenharia", desc: "Obsessão por perfeição técnica e a coragem de romper barreiras na pista." },
    { id: "f5", titulo: "Até o Último Homem", ano: "2016", categoria: "Convicção e Bravura", desc: "A integridade moral de servir e salvar vidas na linha de tiro sem tocar numa arma." },
    { id: "f6", titulo: "Coach Carter", ano: "2005", categoria: "Disciplina e Caráter", desc: "A disciplina dentro da quadra só tem valor se construir homens íntegros fora dela." },
    { id: "f7", titulo: "O Resgate do Soldado Ryan", ano: "1998", categoria: "Dever & Sacrifício", desc: "A irmandade incondicional sob a brutalidade do combate e o cumprimento do dever militar." },
    { id: "f8", titulo: "Clube da Luta", ano: "1999", categoria: "Mentalidade & Caos", desc: "Uma provocação crua sobre o vazio moderno, desapego material e reconstrução pessoal." },
    { id: "f9", titulo: "Invictus", ano: "2009", categoria: "Perdão & Liderança", desc: "O poder do esporte e da liderança magnânima para unir uma nação dividida." },
    { id: "f10", titulo: "Cinderella Man", ano: "2005", categoria: "Superação Familiar", desc: "O pugilista que luta cada round pela sobrevivência e dignidade da sua esposa e filhos." }
];

window.CatalogoSeriesMasculinas = window.CatalogoSeriesMasculinas || [
    { id: "s1", titulo: "Band of Brothers", temporadas: "1 Temporada", categoria: "Irmandade e Guerra", desc: "A mais pura representação de liderança sob fogo cruzado e lealdade extrema." },
    { id: "s2", titulo: "Peaky Blinders", temporadas: "6 Temporadas", categoria: "Estratégia e Frieza", desc: "Visão estratégica, postura calma em momentos críticos e fidelidade à família." },
    { id: "s3", titulo: "Suits", temporadas: "9 Temporadas", categoria: "Oratória e Negociação", desc: "Postura executiva, domínio sob pressão e resolução inteligente de crises." },
    { id: "s4", titulo: "The Bear (O Urso)", temporadas: "3 Temporadas", categoria: "Maestria e Foco", desc: "A busca implacável por elevar padrões em meio ao caos e superação pessoal." },
    { id: "s5", titulo: "Yellowstone", temporadas: "5 Temporadas", categoria: "Lealdade e Defesa", desc: "A proteção intransigente da terra e dos valores da família contra invasões externas." },
    { id: "s6", titulo: "Vikings", temporadas: "6 Temporadas", categoria: "Ambição & Exploração", desc: "A sede por desbravar novos horizontes, liderar guerreiros e desafiar o destino." },
    { id: "s7", titulo: "Mad Men", temporadas: "7 Temporadas", categoria: "Negócios & Identidade", desc: "Os bastidores do mundo corporativo, oratória persuasiva e os dilemas da alma masculina." }
];

// 2. PERSISTÊNCIA E CHAVES DINÂMICAS POR UTILIZADOR
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
window.configMissoesForja = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('config_missoes'))) || window.missoesPadraoForja;
window.dadosForjaDiaria = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('forja_diaria'))) || {};
window.dadosRadarIntimo = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('radar_intimo'))) || { energia: 5, estresse: 5, libido: 5, historico: [] };
window.dadosReflexoesFavoritas = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('estoicas_favoritas'))) || [];
window.dadosMidiaAssistida = JSON.parse(localStorage.getItem('suiri_midia_assistida')) || [];
window.dadosMidiaQueroVerMasc = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('midia_quero_ver'))) || [];
window.dadosManutencaoGaragem = JSON.parse(localStorage.getItem('suiri_manutencao_masc')) || [];
window.dadosAcervoLazer = JSON.parse(localStorage.getItem('suiri_lazer_masc')) || [];

window.reflexaoEstoicaExibidaAtual = null;
window.indiceMidiaAtual = { filmes: 0, series: 0 };
window.abaMidiaAtiva = 'filmes';

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
        window.configMissoesForja = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('config_missoes'))) || window.missoesPadraoForja;
        window.dadosForjaDiaria = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('forja_diaria'))) || {};
        window.dadosRadarIntimo = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('radar_intimo'))) || { energia: 5, estresse: 5, libido: 5, historico: [] };
        window.dadosReflexoesFavoritas = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('estoicas_favoritas'))) || [];
        window.dadosMidiaQueroVerMasc = JSON.parse(localStorage.getItem(window.obterChaveStorageMasc('midia_quero_ver'))) || [];
    } catch (e) {}

    window.renderizarEsqueletoEspacoMasculino();
    window.renderizarReflexaoEstoica(false);
    window.renderizarListaFavoritasEstoicas();
    window.renderizarBotoesForja();
    window.renderizarHistoricoForja();
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
// 4. RENDERIZAÇÃO DO ESQUELETO VISUAL (TEMA FORJA ROMANA / BRASAS & AÇO)
// =========================================================================

window.renderizarEsqueletoEspacoMasculino = function() {
    const container = document.getElementById('secao-espaco-masculino');
    if (!container) return;

    const agora = new Date();
    const diaDoAno = Math.floor((agora - new Date(agora.getFullYear(), 0, 0)) / 86400000);
    const inicioAno = new Date(agora.getFullYear(), 0, 1);
    const semanaDoAno = Math.floor((((agora - inicioAno) / 86400000) + inicioAno.getDay() + 1) / 7);

    const pilulaSemanal = window.AcervoDinamicaADois[semanaDoAno % window.AcervoDinamicaADois.length];
    const sabedoriaArsenal = window.AcervoArsenalPratico[diaDoAno % window.AcervoArsenalPratico.length];

    container.innerHTML = `
        <!-- LINHA 1 SUPERIOR: BOTÃO VOLTAR EM AÇO ESCOVADO -->
        <div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:12px;">
            <button type="button" onclick="window.fecharEspacoMasculino()" 
                    style="display:inline-flex; align-items:center; gap:8px; padding:7px 16px; border-radius:18px; font-size:12px; font-weight:800; background:rgba(30, 41, 59, 0.85); border:1.5px solid #475569; color:#f8fafc; box-shadow:0 3px 12px rgba(0,0,0,0.5); backdrop-filter:blur(8px); cursor:pointer; transition:all 0.2s ease;">
                <span style="font-size:14px; line-height:1; color:#f97316;">←</span>
                <span>Voltar ao Lar</span>
            </button>
        </div>

        <!-- LINHA 2: CABEÇALHO NOBRE COM ÍCONE 50px E CONTRASTE MÁXIMO -->
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px; padding:2px 4px;">
            <div style="width:85px; height:85px; border-radius:18px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border:2px solid #ea580c; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 16px rgba(234, 88, 12, 0.4);">
                <img src="./icone/icone-escudo.png" alt="Espaço Masculino" style="width:70px; height:70px; object-fit:contain;">
            </div>
            <div style="flex:1; min-width:0;">
                <h1 style="margin:0; font-size:24px; font-weight:900; color:#ffffff; letter-spacing:-0.4px; line-height:1.15; text-shadow:0 2px 8px rgba(0,0,0,0.8);">Espaço Masculino</h1>
                <span style="font-size:12px; color:#fbbf24; font-weight:700; display:block; margin-top:3px; letter-spacing:0.2px;">A Forja: Descompressão, Foco & Blindagem</span>
            </div>
        </div>

        <!-- QUADRO 1: PRINCÍPIO ESTOICO DO DIA -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #38bdf8; border-radius:20px; padding:18px 16px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span id="label-titulo-reflexao-estoica" style="font-size:11.5px; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">🏛️ Princípio do Dia</span>
                <span style="font-size:10.5px; font-weight:800; background:#1e293b; color:#7dd3fc; padding:2px 8px; border-radius:10px; border:1px solid #334155;">365 Estoicos</span>
            </div>
            
            <p id="texto-reflexao-estoica-conteudo" style="font-size:14px; color:#f8fafc; margin:0 0 10px 0; line-height:1.6; font-weight:600; text-shadow:0 1px 3px rgba(0,0,0,0.5);">Carregando reflexão...</p>
            <span id="autor-reflexao-estoica-conteudo" style="font-size:11.5px; font-weight:800; color:#fbbf24; display:block; text-align:right; margin-bottom:14px;">— Autor</span>

            <!-- Barra de Ações -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #334155; padding-top:12px; gap:6px;">
                <button type="button" class="btn-secundario" style="padding:7px 12px; font-size:11.5px; border-radius:10px; background:#1e293b; color:#f8fafc; border:1px solid #475569; font-weight:700; display:inline-flex; align-items:center; gap:6px;" onclick="window.renderizarReflexaoEstoica(false)">
                    <img src="./icone/icone-calendario.png" alt="Calendário" style="width:16px; height:16px; object-fit:contain;">
                    De Hoje
                </button>
                <button type="button" id="btn-favoritar-estoica" class="btn-secundario" style="padding:7px 12px; font-size:11.5px; border-radius:10px; background:#1e293b; border:1px solid #d97706; color:#fde68a; font-weight:800;" onclick="window.alternarFavoritoReflexaoAtual()">🤍 Favoritar</button>
                <button type="button" class="btn-principal" style="width:auto; padding:7px 14px; font-size:11.5px; border-radius:10px; background:#0284c7; color:#fff; font-weight:800; border:none;" onclick="window.renderizarReflexaoEstoica(true)">Próxima 🔀</button>
            </div>

            <!-- Painel Retrátil de Mensagens Favoritas -->
            <div style="margin-top:12px;">
                <div onclick="window.alternarSecaoRetratil('bloco-favoritas-conteudo', 'seta-favoritas')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#1e293b; padding:9px 12px; border-radius:10px; border:1px solid #334155;">
                    <span style="font-size:11.5px; font-weight:800; color:#38bdf8;">⭐ Mensagens Favoritas (<span id="contador-favoritas-estoicas">0</span>)</span>
                    <span id="seta-favoritas" style="font-size:12px; color:#38bdf8; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-favoritas-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- QUADRO 2: A FORJA (MISSÕES EM METAL ESCURO COM BRASAS) -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #ef4444; margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="./icone/icone-fogo.png" alt="A Forja" style="width:30px; height:30px; object-fit:contain;">
                    <strong style="font-size:14px; color:#ffffff; font-weight:900;">A Forja (6 Missões Diárias)</strong>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:10.5px; border-radius:8px; background:#1e293b; color:#cbd5e1; border:1px solid #475569; display:inline-flex; align-items:center; gap:4px;" onclick="window.alternarEdicaoConfigForja()">
                        <img src="./icone/icones-configuracao.png" alt="Configuração" style="width:16px; height:16px; object-fit:contain;">
                        Editar
                    </button>
                    <span id="streak-forja" style="font-size:11.5px; font-weight:800; color:#f97316; background:#2a1205; padding:3px 8px; border-radius:8px; border:1px solid #7c2d12; display:inline-flex; align-items:center; gap:4px;">
                        <img src="./icone/icone-fogo.png" alt="Fogo" style="width:18px; height:18px; object-fit:contain;"> 0 dias
                    </span>
                </div>
            </div>

            <!-- Painel de Desempenho Noturno -->
            <div style="background:#1e1b18; border:1px solid #7c2d12; padding:10px 12px; border-radius:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:6px;">
                    <span style="font-weight:700; color:#fed7aa;">Grau de Hoje: <strong id="lbl-grau-forja-hoje" style="color:#f97316;">Inerte</strong></span>
                    <strong id="lbl-porcentagem-forja-hoje" style="color:#ef4444; font-weight:900;">0%</strong>
                </div>
                <div style="background:#0f172a; border-radius:8px; height:8px; width:100%; overflow:hidden;">
                    <div id="barra-forja-fill-hoje" style="background:linear-gradient(90deg, #f97316, #ef4444); height:100%; width:0%; transition:width 0.3s ease;"></div>
                </div>
            </div>

            <!-- Formulário para Editar o Nome das 6 Missões -->
            <div id="form-edicao-missoes-forja" class="oculto" style="background:#0f172a; border:1.5px dashed #475569; padding:12px; border-radius:12px; margin-bottom:12px;">
                <span style="font-size:11.5px; font-weight:800; color:#cbd5e1; display:block; margin-bottom:8px;">Personalize suas 6 metas diárias:</span>
                <div id="container-inputs-edicao-forja" style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;"></div>
                <div style="display:flex; justify-content:flex-end; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:11px; background:#1e293b; color:#cbd5e1; border:1px solid #475569;" onclick="window.alternarEdicaoConfigForja()">Cancelar</button>
                    <button type="button" class="btn-principal" style="width:auto; padding:4px 12px; font-size:11px; background:#ea580c; color:#fff;" onclick="window.salvarConfiguracaoMissoesForja()">Salvar Metas</button>
                </div>
            </div>

            <!-- Grade das 6 Missões Diárias -->
            <div id="grid-botoes-missoes-forja" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;"></div>

            <!-- Histórico Retrátil da Forja -->
            <div style="border-top:1px dashed #334155; padding-top:10px;">
                <div onclick="window.alternarSecaoRetratil('bloco-historico-forja-conteudo', 'seta-historico-forja')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#1e293b; padding:8px 12px; border-radius:10px; border:1px solid #334155;">
                    <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">📜 Histórico de Desempenho (<span id="contador-historico-forja">0</span>)</span>
                    <span id="seta-historico-forja" style="font-size:12px; color:#cbd5e1; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-historico-forja-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- QUADRO 3: RADAR ÍNTIMO (COM LOVE.PNG NO CABEÇALHO E NA DISPOSIÇÃO/LIBIDO) -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #f43f5e; margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-coracao.png';" alt="Radar Íntimo" style="width:35px; height:35px; object-fit:contain;">
                    <strong style="font-size:14px; color:#ffffff; font-weight:900;">Radar Íntimo & Vitalidade</strong>
                </div>
                <button type="button" class="btn-principal" style="padding:6px 14px; font-size:11px; border-radius:10px; width:auto; background:#e11d48; color:#fff; font-weight:800; border:none;" onclick="window.salvarRadarIntimoCompleto()">Salvar Check-in</button>
            </div>

            <div style="background:#2a101b; border:1px dashed #9f1239; padding:12px; border-radius:12px; margin-bottom:14px;">
                <span style="font-size:10px; font-weight:800; color:#fb7185; text-transform:uppercase; margin-bottom:4px; display:block;">Pílula Semanal • Semana ${semanaDoAno} de 52</span>
                <p style="font-size:12.5px; color:#ffe4e6; margin:0; line-height:1.5; font-weight:600;">${pilulaSemanal}</p>
            </div>

            <div style="margin-bottom:14px;">
                <label style="font-size:11px; font-weight:800; color:#cbd5e1; display:block; margin-bottom:4px;">Última Conexão Íntima a Dois:</label>
                <input type="date" id="slider-data-relacao" style="width:100%; box-sizing:border-box; padding:9px 12px; border-radius:10px; border:1px solid #475569; font-size:12px; background:#0f172a; color:#f8fafc; outline:none; font-weight:600;">
            </div>

            <!-- Barra: Energia Biológica -->
            <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:12px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:800; color:#f8fafc; display:flex; align-items:center; gap:6px;">
                        <img src="./icone/icone-energia.png" alt="Energia" style="width:18px; height:18px; object-fit:contain;">
                        Energia Biológica:
                    </span>
                    <strong id="badge-energia-valor" style="font-size:11.5px; color:#38bdf8; background:#0f172a; padding:2px 8px; border-radius:8px; border:1px solid #0369a1;">Nota 5 (Normal)</strong>
                </div>
                <input type="range" id="range-energia" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#0284c7; cursor:pointer;" oninput="window.atualizarRotuloSlider('energia')">
            </div>

            <!-- Barra: Nível de Estresse -->
            <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:12px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:800; color:#f8fafc; display:flex; align-items:center; gap:6px;">
                        <img src="./icone/icone-estresse.png" alt="Estresse" style="width:18px; height:18px; object-fit:contain;">
                        Nível de Estresse:
                    </span>
                    <strong id="badge-estresse-valor" style="font-size:11.5px; color:#fbbf24; background:#0f172a; padding:2px 8px; border-radius:8px; border:1px solid #d97706;">Nota 5 (Moderado)</strong>
                </div>
                <input type="range" id="range-estresse" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#f59e0b; cursor:pointer;" oninput="window.atualizarRotuloSlider('estresse')">
            </div>

            <!-- Barra: Disposição / Libido (com love.png) -->
            <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:800; color:#f8fafc; display:flex; align-items:center; gap:6px;">
                        <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-fogo.png';" alt="Libido" style="width:18px; height:18px; object-fit:contain;">
                        Disposição / Libido:
                    </span>
                    <strong id="badge-libido-valor" style="font-size:11.5px; color:#f43f5e; background:#0f172a; padding:2px 8px; border-radius:8px; border:1px solid #be123c;">Nota 5 (Normal)</strong>
                </div>
                <input type="range" id="range-libido" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#f43f5e; cursor:pointer;" oninput="window.atualizarRotuloSlider('libido')">
            </div>

            <!-- Histórico Retrátil do Radar -->
            <div style="border-top:1px dashed #334155; padding-top:10px;">
                <div onclick="window.alternarSecaoRetratil('bloco-historico-radar-conteudo', 'seta-historico-radar')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#1e293b; padding:8px 12px; border-radius:10px; border:1px solid #334155;">
                    <span style="font-size:11.5px; font-weight:800; color:#cbd5e1; display:inline-flex; align-items:center; gap:6px;">
                        <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-coracao.png';" alt="Love" style="width:15px; height:15px; object-fit:contain;">
                        Histórico Confidencial (<span id="contador-historico-radar">0</span>)
                    </span>
                    <span id="seta-historico-radar" style="font-size:12px; color:#cbd5e1; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-historico-radar-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                    <div id="lista-historico-radar-notas" style="display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>
        </div>

        <!-- QUADRO 4: CURADORIA DE FILMES & SÉRIES DINÂMICA (ROTAÇÃO DIÁRIA + DUAS GAVETAS) -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #6366f1; margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="./icone/icone-filme.png" alt="Filmes e Séries" style="width:24px; height:24px; object-fit:contain;">
                    <strong style="font-size:14px; color:#ffffff; font-weight:900;">Curadoria: Filmes & Séries</strong>
                </div>
                <div style="display:flex; gap:4px; background:#0f172a; padding:3px; border-radius:10px; border:1px solid #334155;">
                    <button type="button" id="btn-aba-filmes" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:#6366f1; color:#fff;" onclick="window.alternarAbaMidia('filmes')">Filmes</button>
                    <button type="button" id="btn-aba-series" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#94a3b8;" onclick="window.alternarAbaMidia('series')">Séries</button>
                </div>
            </div>

            <div id="card-carrossel-midia" style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border:1px solid #334155; border-radius:14px; padding:14px; position:relative; min-height:130px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span id="midia-badge-categoria" style="font-size:10px; font-weight:800; background:#312e81; color:#c7d2fe; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Categoria</span>
                        <span id="midia-ano-tempo" style="font-size:11px; font-weight:700; color:#94a3b8;">-</span>
                    </div>
                    <h3 id="midia-titulo-destaque" style="margin:6px 0 4px 0; font-size:16px; color:#ffffff; font-weight:900;">Título</h3>
                    <p id="midia-descricao-destaque" style="font-size:12px; color:#cbd5e1; margin:0; line-height:1.45;">Descrição da obra e lição de conduta.</p>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px dashed #334155; padding-top:10px; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#1e293b; color:#fff; border:1px solid #475569;" onclick="window.navegarCarrosselMidia(-1)">◄</button>
                        <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#1e293b; color:#fff; border:1px solid #475569;" onclick="window.navegarCarrosselMidia(1)">►</button>
                    </div>

                    <div style="display:flex; gap:6px; align-items:center;">
                        <!-- Botão Quero Assistir Masculino -->
                        <button type="button" id="btn-quero-ver-masc" style="padding:7px 11px; font-size:11px; border-radius:10px; font-weight:800; background:#1e293b; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="window.alternarQueroAssistirMasc()">
                            📌 Quero Assistir
                        </button>
                        <!-- Botão Já Assisti Masculino -->
                        <button type="button" id="btn-marcar-assistido-acao" style="padding:7px 12px; font-size:11.5px; border-radius:10px; font-weight:800; background:#10b981; color:#fff; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.abrirModalAvaliacaoMidia()">
                            <img src="./icone/icone-check.png" alt="Assistido" style="width:16px; height:16px; object-fit:contain;"> Já Assisti
                        </button>
                    </div>
                </div>
            </div>

            <div id="caixa-avaliacao-midia" class="oculto" style="margin-top:10px; background:#1e293b; border:1.5px solid #d97706; border-radius:12px; padding:12px; text-align:center;">
                <span style="font-size:12px; font-weight:800; color:#fde68a; display:block; margin-bottom:6px;">Qual a sua avaliação para esta obra?</span>
                <div style="display:flex; justify-content:center; gap:8px; margin-bottom:8px;">
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(1)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(2)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(3)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(4)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    <button type="button" onclick="window.confirmarAvaliacaoMidia(5)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                </div>
                <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:10.5px; background:#0f172a; color:#cbd5e1; border:1px solid #475569;" onclick="document.getElementById('caixa-avaliacao-midia').classList.add('oculto')">Cancelar</button>
            </div>

            <!-- GAVETA 1: QUERO ASSISTIR (RETRÁTIL) -->
            <div style="margin-top:14px;">
                <div onclick="window.alternarSecaoRetratil('bloco-quero-ver-masc-conteudo', 'seta-quero-ver-masc')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#1e293b; padding:8px 12px; border-radius:10px; border:1px solid #334155;">
                    <span style="font-size:11.5px; font-weight:800; color:#38bdf8;">📌 Quero Assistir (<span id="contador-quero-ver-masc">0</span>)</span>
                    <span id="seta-quero-ver-masc" style="font-size:12px; color:#38bdf8; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-quero-ver-masc-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>

            <!-- GAVETA 2: OBRAS ASSISTIDAS E AVALIADAS (RETRÁTIL) -->
            <div style="margin-top:8px;">
                <div onclick="window.alternarSecaoRetratil('bloco-assistidos-conteudo', 'seta-assistidos')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#1e293b; padding:8px 12px; border-radius:10px; border:1px solid #334155;">
                    <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">⭐ Obras Avaliadas (<span id="contador-assistidos">0</span>) • Mais Bem Avaliados no Topo</span>
                    <span id="seta-assistidos" style="font-size:12px; color:#cbd5e1; transition:transform 0.2s ease;">▼</span>
                </div>
                <div id="bloco-assistidos-conteudo" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
            </div>
        </div>

        <!-- QUADRO 5: ARSENAL PRÁTICO -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #10b981; margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <img src="./icone/icone-forte.png" alt="Arsenal" style="width:26px; height:26px; object-fit:contain;">
                <strong style="font-size:14px; color:#ffffff; font-weight:900;">Arsenal Prático</strong>
            </div>
            <div style="background:#064e3b; border:1px dashed #34d399; padding:12px; border-radius:12px;">
                <span style="font-size:10.5px; font-weight:800; color:#a7f3d0; text-transform:uppercase; margin-bottom:4px; display:block;">Doutrina Física & Nutrição</span>
                <p style="font-size:12.5px; color:#ecfdf5; margin:0; line-height:1.45; font-weight:600;">${sabedoriaArsenal}</p>
            </div>
        </div>

        <!-- QUADRO 6: OFICINA & GARAGEM -->
        <div class="cartao-geral" style="background:#131822; border:1px solid #334155; border-left:4px solid #64748b; margin-bottom:14px; padding:16px 18px; border-radius:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <img src="./icone/icone-oficina.png" alt="Oficina" style="width:24px; height:24px; object-fit:contain;">
                <strong style="font-size:14px; color:#ffffff; font-weight:900;">Oficina & Garagem (Manutenções)</strong>
            </div>
            <p style="font-size:11.5px; color:#94a3b8; margin:0 0 10px 0;">Registo de revisões do veículo, filtros, ferramentas e manutenções do lar.</p>
            <div style="display:flex; gap:6px; margin-bottom:10px;">
                <input type="text" id="input-nova-manutencao" placeholder="Ex: Óleo do carro, filtro da torneira..." style="flex:1; padding:9px 12px; font-size:12px; border-radius:10px; border:1px solid #475569; background:#0f172a; color:#fff; outline:none;">
                <button type="button" style="padding:9px 16px; font-weight:800; border-radius:10px; background:#475569; color:#fff; border:none; cursor:pointer;" onclick="window.adicionarManutencao()">+</button>
            </div>
            <div id="lista-manutencao-garagem" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
    `;
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
    if (lista.length === 0) return;

    let item;
    if (aleatorio) {
        const sorteado = Math.floor(Math.random() * lista.length);
        item = lista[sorteado];
        if (elTitulo) elTitulo.textContent = `🏛️ Reflexão Sorteada (${item.data || 'Aleatória'})`;
    } else {
        const agora = new Date();
        const diaDoAno = Math.floor((agora - new Date(agora.getFullYear(), 0, 0)) / 86400000);
        item = lista[diaDoAno % lista.length];
        if (elTitulo) elTitulo.textContent = `🏛️ Princípio do Dia (${item.data || 'Hoje'})`;
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
        btn.style.background = "#78350f";
        btn.style.borderColor = "#f59e0b";
        btn.style.color = "#fde68a";
    } else {
        btn.innerHTML = "🤍 Favoritar";
        btn.style.background = "#1e293b";
        btn.style.borderColor = "#475569";
        btn.style.color = "#cbd5e1";
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
        cont.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:8px;">Nenhuma reflexão favoritada ainda.</span>';
        return;
    }

    cont.innerHTML = window.dadosReflexoesFavoritas.map(item => `
        <div style="background:#0f172a; border:1px solid #334155; border-left:3.5px solid #0284c7; padding:8px 10px; border-radius:10px; display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div style="min-width:0; flex:1;">
                <span style="font-size:10px; font-weight:800; color:#38bdf8; text-transform:uppercase; display:block;">${item.data || 'Reflexão'} • ${item.autor}</span>
                <p style="font-size:11.5px; color:#e2e8f0; margin:2px 0 0 0; line-height:1.4; font-weight:500;">"${item.texto}"</p>
            </div>
            <button type="button" onclick="window.removerFavoritoEstoico('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:2px 4px; flex-shrink:0; display:flex; align-items:center;" title="Remover dos favoritos">
                <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
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
// 5. A FORJA: 6 MISSÕES EM METAL ESCURO & CONTRASTE
// =========================================================================

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
            <label style="font-size:10.5px; font-weight:700; color:#94a3b8;">Missão ${idx + 1}:</label>
            <input type="text" id="input-cfg-forja-${m.id}" value="${m.rotulo}" style="width:100%; box-sizing:border-box; padding:6px 8px; border-radius:8px; border:1px solid #475569; background:#1e293b; color:#fff; font-size:11.5px; outline:none;">
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
    if (qtdCumprida === 6) return { titulo: "🔥 Forjado no Aço (Ápice Absoluto)", cor: "#ef4444" };
    if (qtdCumprida === 5) return { titulo: "Vanguarda (Quase Imbatível)", cor: "#f97316" };
    if (qtdCumprida >= 3) return { titulo: "Guerreiro Firme (Ritmo de Batalha)", cor: "#eab308" };
    if (qtdCumprida >= 1) return { titulo: "Iniciado (Faísca Acesa)", cor: "#38bdf8" };
    return { titulo: "Inerte (Desperte o Guerreiro)", cor: "#94a3b8" };
};

window.renderizarBotoesForja = function() {
    const grid = document.getElementById('grid-botoes-missoes-forja');
    if (!grid) return;

    const hojeStr = new Date().toISOString().split('T')[0];
    const registroHoje = window.dadosForjaDiaria[hojeStr] || { itens: {} };

    grid.innerHTML = window.configMissoesForja.map(m => {
        const cumprido = !!registroHoje.itens[m.id];
        return `
            <label style="display:flex; align-items:center; justify-content:space-between; background:${cumprido ? '#2a1205' : '#1e293b'}; padding:11px 12px; border-radius:12px; border:1.5px solid ${cumprido ? '#ea580c' : '#334155'}; cursor:pointer; transition:all 0.2s ease;">
                <span style="font-size:12px; font-weight:800; color:${cumprido ? '#fed7aa' : '#f8fafc'};">${m.rotulo}</span>
                <input type="checkbox" onchange="window.alternarItemForjaHoje('${m.id}', this.checked)" ${cumprido ? 'checked' : ''} style="width:18px; height:18px; accent-color:#f97316;">
            </label>
        `;
    }).join('');

    window.atualizarProgressoForjaHoje();
};

window.alternarItemForjaHoje = function(idMissao, marcado) {
    const hojeStr = new Date().toISOString().split('T')[0];
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
    window.renderizarHistoricoForja();
    window.renderizarBotoesForja();
};

window.atualizarProgressoForjaHoje = function() {
    const hojeStr = new Date().toISOString().split('T')[0];
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

    const elStreak = document.getElementById('streak-forja');
    if (elStreak) {
        elStreak.innerHTML = `<img src="./icone/icone-fogo.png" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> ${ofensiva} dias seguidos`;
    }
};

window.renderizarHistoricoForja = function() {
    const cont = document.getElementById('bloco-historico-forja-conteudo');
    const elContador = document.getElementById('contador-historico-forja');
    if (!cont) return;

    const datas = Object.keys(window.dadosForjaDiaria).sort().reverse();
    if (elContador) elContador.textContent = datas.length;

    if (datas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:8px;">Nenhum registro diário da Forja ainda.</span>';
        return;
    }

    cont.innerHTML = datas.slice(0, 15).map(dtStr => {
        const reg = window.dadosForjaDiaria[dtStr];
        const qtd = Object.keys(reg.itens || {}).length;
        const pct = reg.porcentagem || Math.round((qtd / 6) * 100);
        const grau = reg.grau || window.obterGrauHonraForja(qtd).titulo;

        const nomesItens = Object.keys(reg.itens || {}).map(id => {
            const m = window.configMissoesForja.find(cfg => cfg.id === id);
            return m ? m.rotulo : id;
        });

        return `
            <div style="background:#0f172a; border:1px solid #334155; padding:10px 12px; border-radius:12px; border-left:4px solid #ef4444;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:10.5px; font-weight:800; color:#94a3b8;">${dtStr}</span>
                    <strong style="font-size:11px; color:#f97316;">${pct}% (${qtd}/6)</strong>
                </div>
                <div style="font-size:11.5px; font-weight:800; color:#ffffff; margin-bottom:6px;">${grau}</div>
                
                <div style="background:#1e293b; border-radius:6px; height:6px; width:100%; overflow:hidden; margin-bottom:8px;">
                    <div style="background:linear-gradient(90deg, #f97316, #ef4444); height:100%; width:${pct}%;"></div>
                </div>

                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    ${nomesItens.length > 0 ? nomesItens.map(n => `
                        <span style="font-size:9.5px; font-weight:700; background:#2a1205; color:#fed7aa; padding:2px 6px; border-radius:6px; border:1px solid #7c2d12; display:inline-flex; align-items:center; gap:3px;">
                            <img src="./icone/icone-check.png" alt="Feito" style="width:12px; height:12px; object-fit:contain;"> ${n}
                        </span>
                    `).join('') : '<span style="font-size:10px; color:#94a3b8;">Nenhum item cumprido</span>'}
                </div>
            </div>
        `;
    }).join('');
};

// =========================================================================
// 6. RADAR ÍNTIMO: SLIDERS (1 A 10) E HISTÓRICO EXPANSÍVEL COM LOVE.PNG
// =========================================================================

window.obterDescricaoNotaSlider = function(tipo, valor) {
    const v = parseInt(valor, 10);
    if (tipo === 'energia') {
        if (v <= 2) return `Nota ${v} (Esgotado)`;
        if (v <= 4) return `Nota ${v} (Baixa)`;
        if (v <= 6) return `Nota ${v} (Normal)`;
        if (v <= 8) return `Nota ${v} (Boa)`;
        return `Nota ${v} (Alta Performance)`;
    } else if (tipo === 'estresse') {
        if (v <= 2) return `Nota ${v} (Relaxado)`;
        if (v <= 4) return `Nota ${v} (Tranquilo)`;
        if (v <= 6) return `Nota ${v} (Moderado)`;
        if (v <= 8) return `Nota ${v} (Tenso)`;
        return `Nota ${v} (Sobrecarga)`;
    } else if (tipo === 'libido') {
        if (v <= 3) return `Nota ${v} (Baixa)`;
        if (v <= 7) return `Nota ${v} (Normal)`;
        return `Nota ${v} (Alta)`;
    }
    return `Nota ${v}`;
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
    const vEnergia = parseInt(document.getElementById('range-energia')?.value || '5', 10);
    const vEstresse = parseInt(document.getElementById('range-estresse')?.value || '5', 10);
    const vLibido = parseInt(document.getElementById('range-libido')?.value || '5', 10);
    const hojeStr = new Date().toISOString().split('T')[0];

    const novoRegistro = {
        id: 'rad_' + Date.now(),
        data: hojeStr,
        ultima_relacao: dtRelacao,
        energia: vEnergia,
        estresse: vEstresse,
        libido: vLibido,
        textoEnergia: window.obterDescricaoNotaSlider('energia', vEnergia),
        textoEstresse: window.obterDescricaoNotaSlider('estresse', vEstresse),
        textoLibido: window.obterDescricaoNotaSlider('libido', vLibido)
    };

    window.dadosRadarIntimo.ultima_relacao = dtRelacao;
    window.dadosRadarIntimo.energia = vEnergia;
    window.dadosRadarIntimo.estresse = vEstresse;
    window.dadosRadarIntimo.libido = vLibido;

    if (!Array.isArray(window.dadosRadarIntimo.historico)) {
        window.dadosRadarIntimo.historico = [];
    }
    
    window.dadosRadarIntimo.historico.unshift(novoRegistro);
    if (window.dadosRadarIntimo.historico.length > 20) {
        window.dadosRadarIntimo.historico = window.dadosRadarIntimo.historico.slice(0, 20);
    }

    localStorage.setItem(window.obterChaveStorageMasc('radar_intimo'), JSON.stringify(window.dadosRadarIntimo));
    window.renderizarHistoricoRadarIntimo();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Check-in íntimo guardado com sucesso!", "sucesso");
    }

    const cli = window.obterClienteSupabase ? window.obterClienteSupabase() : window.cliente;
    const meuId = window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || null);
    if (cli && meuId) {
        try {
            await cli.from('espaco_masc_radar').upsert({
                membro_id: meuId,
                familia_id: window.familiaAtualId || null,
                ultima_relacao: dtRelacao,
                energia: vEnergia,
                estresse: vEstresse,
                libido: vLibido
            }, { onConflict: 'membro_id' });
        } catch (err) {}
    }
};

window.renderizarHistoricoRadarIntimo = function() {
    const cont = document.getElementById('lista-historico-radar-notas');
    const elContador = document.getElementById('contador-historico-radar');
    if (!cont) return;

    const hist = window.dadosRadarIntimo.historico || [];
    if (elContador) elContador.textContent = hist.length;

    if (hist.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:8px;">Nenhuma avaliação confidencial registrada ainda.</span>';
        return;
    }

    cont.innerHTML = hist.map(reg => `
        <div style="background:#0f172a; border:1px solid #334155; padding:8px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:10px; font-weight:800; color:#94a3b8; display:block;">Data: ${reg.data}${reg.ultima_relacao ? ' • Relação em ' + reg.ultima_relacao : ''}</span>
                <span style="font-size:11.5px; color:#f8fafc; font-weight:700; display:flex; align-items:center; gap:6px; margin-top:2px;">
                    <img src="./icone/icone-energia.png" alt="Energia" style="width:15px; height:15px; object-fit:contain;"> ${reg.textoEnergia} | 
                    <img src="./icone/icone-estresse.png" alt="Estresse" style="width:15px; height:15px; object-fit:contain;"> ${reg.textoEstresse}
                </span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:10.5px; font-weight:800; color:#fb7185; background:#2a101b; border:1px solid #9f1239; padding:3px 6px; border-radius:6px; display:inline-flex; align-items:center; gap:3px;">
                    <img src="./icone/love.png" onerror="this.onerror=null; this.src='./icone/icone-fogo.png';" alt="Libido" style="width:14px; height:14px; object-fit:contain;"> ${reg.textoLibido}
                </span>
                <button type="button" onclick="window.removerItemHistoricoRadar('${reg.id}')" style="background:none; border:none; cursor:pointer; padding:2px; display:flex; align-items:center;" title="Remover registro">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerItemHistoricoRadar = function(id) {
    if (!window.dadosRadarIntimo.historico) return;
    window.dadosRadarIntimo.historico = window.dadosRadarIntimo.historico.filter(r => r.id !== id);
    localStorage.setItem(window.obterChaveStorageMasc('radar_intimo'), JSON.stringify(window.dadosRadarIntimo));
    window.renderizarHistoricoRadarIntimo();
};

// =========================================================================
// 7. CURADORIA DE FILMES & SÉRIES (SORTEIO DIÁRIO, QUERO ASSISTIR & AVALIADOS)
// =========================================================================

// Gerador de semente baseado na data do dia para rotação diária
function obterSementeDataHojeMasc() {
    const hoje = new Date();
    const str = `${hoje.getFullYear()}-${hoje.getMonth() + 1}-${hoje.getDate()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Embaralhamento determinístico diário
window.obterCatalogoDiarioMasc = function(tipo) {
    const base = tipo === 'filmes'
        ? (window.CatalogoFilmesMasculinos || [])
        : (window.CatalogoSeriesMasculinas || []);
    
    if (base.length === 0) return [];

    let seed = obterSementeDataHojeMasc();
    const copia = [...base];
    
    for (let i = copia.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        const j = Math.floor(rnd * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
};

window.alternarAbaMidia = function(aba) {
    window.abaMidiaAtiva = aba;
    const btnF = document.getElementById('btn-aba-filmes');
    const btnS = document.getElementById('btn-aba-series');

    if (aba === 'filmes') {
        if (btnF) { btnF.style.background = '#6366f1'; btnF.style.color = '#fff'; }
        if (btnS) { btnS.style.background = 'transparent'; btnS.style.color = '#94a3b8'; }
    } else {
        if (btnS) { btnS.style.background = '#6366f1'; btnS.style.color = '#fff'; }
        if (btnF) { btnF.style.background = 'transparent'; btnF.style.color = '#94a3b8'; }
    }

    window.indiceMidiaAtual[aba] = 0;
    window.atualizarVisualizacaoMidia();
};

window.obterListaMidiaMascAtual = function() {
    return window.obterCatalogoDiarioMasc(window.abaMidiaAtiva);
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

window.atualizarVisualizacaoMidia = function() {
    const lista = window.obterListaMidiaMascAtual();
    const idx = window.indiceMidiaAtual[window.abaMidiaAtiva] || 0;
    const item = lista[idx];

    if (!item) return;

    const elBadgeCat = document.getElementById('midia-badge-categoria');
    const elAno = document.getElementById('midia-ano-tempo');
    const elTitulo = document.getElementById('midia-titulo-destaque');
    const elDesc = document.getElementById('midia-descricao-destaque');
    const btnAcao = document.getElementById('btn-marcar-assistido-acao');
    const btnQueroVer = document.getElementById('btn-quero-ver-masc');

    if (elBadgeCat) elBadgeCat.textContent = item.categoria || window.abaMidiaAtiva.toUpperCase();
    if (elAno) elAno.textContent = item.ano || item.temporadas || '';
    if (elTitulo) elTitulo.textContent = item.titulo || '';
    if (elDesc) elDesc.textContent = item.desc || '';

    // Verifica se já está na lista "Quero Assistir"
    const naListaQueroVer = window.dadosMidiaQueroVerMasc.some(m => m.titulo.toLowerCase() === item.titulo.toLowerCase());
    if (btnQueroVer) {
        if (naListaQueroVer) {
            btnQueroVer.textContent = '📌 Na Minha Lista';
            btnQueroVer.style.background = '#0369a1';
            btnQueroVer.style.borderColor = '#38bdf8';
            btnQueroVer.style.color = '#ffffff';
        } else {
            btnQueroVer.textContent = '📌 Quero Assistir';
            btnQueroVer.style.background = '#1e293b';
            btnQueroVer.style.borderColor = '#0284c7';
            btnQueroVer.style.color = '#38bdf8';
        }
    }

    // Verifica se já foi avaliado pelo utilizador
    const jaAvaliado = window.dadosMidiaAssistida.find(m => m.titulo.toLowerCase() === item.titulo.toLowerCase());
    if (btnAcao) {
        if (jaAvaliado) {
            btnAcao.textContent = `★ ${jaAvaliado.estrelas} Estrelas`;
            btnAcao.style.background = '#f59e0b';
        } else {
            btnAcao.innerHTML = `<img src="./icone/icone-check.png" alt="Assistido" style="width:16px; height:16px; object-fit:contain; vertical-align:middle; margin-right:4px;"> Já Assisti`;
            btnAcao.style.background = '#10b981';
        }
    }
};

// Alternar status "Quero Assistir" Masculino
window.alternarQueroAssistirMasc = function(itemDireto = null) {
    const lista = window.obterListaMidiaMascAtual();
    const item = itemDireto || lista[window.indiceMidiaAtual[window.abaMidiaAtiva]];
    if (!item) return;

    const idx = window.dadosMidiaQueroVerMasc.findIndex(m => m.titulo.toLowerCase() === item.titulo.toLowerCase());

    if (idx >= 0) {
        window.dadosMidiaQueroVerMasc.splice(idx, 1);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`"${item.titulo}" removido de 'Quero Assistir'.`, "info");
        }
    } else {
        window.dadosMidiaQueroVerMasc.unshift({
            id: item.id || ('quero_m_' + Date.now()),
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
    if (!item) return;

    // Se estiver em "Quero Assistir", remove automaticamente
    window.dadosMidiaQueroVerMasc = window.dadosMidiaQueroVerMasc.filter(m => m.titulo.toLowerCase() !== item.titulo.toLowerCase());
    localStorage.setItem(window.obterChaveStorageMasc('midia_quero_ver'), JSON.stringify(window.dadosMidiaQueroVerMasc));

    // Grava nos assistidos
    window.dadosMidiaAssistida = window.dadosMidiaAssistida.filter(m => m.titulo.toLowerCase() !== item.titulo.toLowerCase());
    window.dadosMidiaAssistida.push({
        id: item.id || ('mid_' + Date.now()),
        titulo: item.titulo,
        tipo: window.abaMidiaAtiva,
        categoria: item.categoria,
        estrelas: parseInt(estrelas, 10),
        data: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('suiri_midia_assistida', JSON.stringify(window.dadosMidiaAssistida));
    document.getElementById('caixa-avaliacao-midia')?.classList.add('oculto');
    
    window.atualizarVisualizacaoMidia();
    window.renderizarHistoricoQueroVerMasc();
    window.renderizarHistoricoAssistidos();

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Avaliação de ${estrelas} estrelas registrada!`, "sucesso");
    }
};

// Renderização da Gaveta 1: Quero Assistir Masculino
window.renderizarHistoricoQueroVerMasc = function() {
    const cont = document.getElementById('bloco-quero-ver-masc-conteudo');
    const elContador = document.getElementById('contador-quero-ver-masc');
    if (!cont) return;

    const lista = window.dadosMidiaQueroVerMasc || [];
    if (elContador) elContador.textContent = lista.length;

    if (lista.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:8px;">Nenhum título na sua lista para assistir.</span>';
        return;
    }

    cont.innerHTML = lista.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; border:1px solid #334155; padding:8px 12px; border-radius:10px;">
            <div style="min-width:0; flex:1;">
                <strong style="font-size:12.5px; color:#ffffff; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.titulo}</strong>
                <span style="font-size:10.5px; color:#38bdf8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" onclick="window.confirmarAvaliacaoMidia(5, { id: '${item.id}', titulo: '${item.titulo}', categoria: '${item.categoria}' })" style="background:#10b981; color:#fff; border:none; padding:4px 8px; font-size:10.5px; border-radius:8px; font-weight:800; cursor:pointer;" title="Marcar como visto">
                    ✓ Já Vi
                </button>
                <button type="button" onclick="window.removerMidiaQueroVerMasc('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaQueroVerMasc = function(id) {
    window.dadosMidiaQueroVerMasc = window.dadosMidiaQueroVerMasc.filter(m => m.id !== id);
    localStorage.setItem(window.obterChaveStorageMasc('midia_quero_ver'), JSON.stringify(window.dadosMidiaQueroVerMasc));
    window.renderizarHistoricoQueroVerMasc();
    window.atualizarVisualizacaoMidia();
};

// Renderização da Gaveta 2: Obras Assistidas e Avaliadas
window.renderizarHistoricoAssistidos = function() {
    const cont = document.getElementById('bloco-assistidos-conteudo');
    const elContador = document.getElementById('contador-assistidos');
    if (!cont) return;

    const assistidosOrdenados = [...window.dadosMidiaAssistida].sort((a, b) => b.estrelas - a.estrelas);
    if (elContador) elContador.textContent = assistidosOrdenados.length;

    if (assistidosOrdenados.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:8px;">Nenhum título avaliado ainda.</span>';
        return;
    }

    cont.innerHTML = assistidosOrdenados.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; border:1px solid #334155; padding:8px 12px; border-radius:10px;">
            <div style="min-width:0;">
                <strong style="font-size:12.5px; color:#ffffff; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.titulo}</strong>
                <span style="font-size:10.5px; color:#94a3b8; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:800; color:#f59e0b;">${'★'.repeat(item.estrelas)}</span>
                <button type="button" onclick="window.removerMidiaAssistida('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover dos assistidos">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        </div>
    `).join('');
};

window.removerMidiaAssistida = function(id) {
    window.dadosMidiaAssistida = window.dadosMidiaAssistida.filter(m => m.id !== id);
    localStorage.setItem('suiri_midia_assistida', JSON.stringify(window.dadosMidiaAssistida));
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
            if (data) novoItem.id = data.id;
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
    localStorage.setItem('suiri_manutencao_masc', JSON.stringify(window.dadosManutencaoGaragem));
    window.renderizarListasMasculinas();
};

window.renderizarListasMasculinas = function() {
    const contManut = document.getElementById('lista-manutencao-garagem');
    if (contManut) {
        if (window.dadosManutencaoGaragem.length === 0) {
            contManut.innerHTML = '<span style="font-size:11px; color:#94a3b8; text-align:center; display:block; padding:4px;">Nenhuma manutenção pendente.</span>';
        } else {
            contManut.innerHTML = window.dadosManutencaoGaragem.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:10px 12px; border-radius:12px; border:1px solid #334155;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; flex:1;">
                        <input type="checkbox" onchange="window.alternarManutencao('${item.id}')" ${item.concluido ? 'checked' : ''} style="width:16px; height:16px; accent-color:#f97316;">
                        <span style="font-size:12.5px; color:#f8fafc; font-weight:600; ${item.concluido ? 'text-decoration:line-through; color:#64748b;' : ''}">${item.titulo}</span>
                    </label>
                    <button type="button" onclick="window.removerManutencao('${item.id}')" style="background:none; border:none; cursor:pointer; padding:4px; display:flex; align-items:center;" title="Remover">
                        <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                    </button>
                </div>
            `).join('');
        }
    }

    window.calcularOfensivaForja();

    // Sincroniza sliders
    if (window.dadosRadarIntimo) {
        const inDt = document.getElementById('slider-data-relacao');
        const rngE = document.getElementById('range-energia');
        const rngS = document.getElementById('range-estresse');
        const rngL = document.getElementById('range-libido');

        if (inDt) inDt.value = window.dadosRadarIntimo.ultima_relacao || '';
        if (rngE) rngE.value = window.dadosRadarIntimo.energia || 5;
        if (rngS) rngS.value = window.dadosRadarIntimo.estresse || 5;
        if (rngL) rngL.value = window.dadosRadarIntimo.libido || 5;

        window.atualizarRotuloSlider('energia');
        window.atualizarRotuloSlider('estresse');
        window.atualizarRotuloSlider('libido');
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
            window.dadosRadarIntimo.energia = dRadar.energia || 5;
            window.dadosRadarIntimo.estresse = dRadar.estresse || 5;
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
