// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SAUDE-MULHER.JS (100% COMPLETO E INTEGRAL)
// Topo Nobre Redesenhado: Diário & Ciclo em Coluna Dupla, Ícones +20% Maior,
// Botão de Voltar Elegante, Título Ampliado e Diário Rústico Paginado
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
    vitalidade: 5,
    paz_mental: 5,
    afeto_libido: 5,
    ultima_relacao: null,
    historico: []
};

window.dadosMidiaMulherAssistida = JSON.parse(localStorage.getItem('suiri_midia_mulher_assistida')) || [];
window.indiceMidiaMulher = { filmes: 0, series: 0 };
window.abaMidiaMulherAtiva = 'filmes';

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

// Catálogo Base de Filmes e Séries Femininas
window.CatalogoFilmesMulher = window.CatalogoFilmesMasculinos || [
    { id: "f1", titulo: "Comer, Rezar, Amar", ano: "2010", categoria: "Autodescoberta", desc: "A coragem de romper a rotina e reencontrar o prazer e a espiritualidade pelo mundo." },
    { id: "f2", titulo: "O Fabuloso Destino de Amélie Poulain", ano: "2001", categoria: "Sensibilidade & Afeto", desc: "A delicadeza em transformar pequenos gestos quotidianos em poesia visual." },
    { id: "f3", titulo: "Estrelas Além do Tempo", ano: "2016", categoria: "Superação & Força", desc: "A mente brilhante de três mulheres pioneiras que romperam barreiras históricas na NASA." },
    { id: "f4", titulo: "Adoráveis Mulheres (Little Women)", ano: "2019", categoria: "Irmandade & Independência", desc: "A cumplicidade feminina, ambição criativa e a liberdade de traçar o próprio caminho." },
    { id: "f5", titulo: "Um Sonho de Liberdade", ano: "1994", categoria: "Paciência & Resiliência", desc: "A esperança inabalável e a clareza de mente nos momentos de maior provação." },
    { id: "f6", titulo: "À Procura da Felicidade", ano: "2006", categoria: "Família & Coragem", desc: "A determinação incansável em proteger os nossos sonhos e a nossa família." }
];

window.CatalogoSeriesMulher = window.CatalogoSeriesMasculinas || [
    { id: "s1", titulo: "The Crown", temporadas: "6 Temporadas", categoria: "Liderança & Dever", desc: "Os bastidores do poder, maturidade e a responsabilidade de sustentar um legado." },
    { id: "s2", titulo: "Anne with an E", temporadas: "3 Temporadas", categoria: "Poesia & Imaginação", desc: "O poder transformador do afeto, do intelecto e da resiliência perante o mundo." },
    { id: "s3", titulo: "O Gambito da Rainha", temporadas: "1 Temporada", categoria: "Maestria & Foco", desc: "A genialidade estratégica superando traumas num universo dominado pelo rigor analítico." },
    { id: "s4", titulo: "The Bear (O Urso)", temporadas: "3 Temporadas", categoria: "Cura & Superação", desc: "A busca por excelência sob pressão extrema e o valor das relações verdadeiras." },
    { id: "s5", titulo: "This Is Us", temporadas: "6 Temporadas", categoria: "Família & Conexão", desc: "Uma reflexão inesquecível sobre tempo, luto, memórias e os laços que nos unem." }
];

const DICAS_BIOLOGICAS_FALLBACK = {
    menstrual: "O corpo pede descanso e aconchego. Hidrate-se e faça refeições quentinhas.",
    folicular: "A energia está a despertar! Excelente momento para novos planos e ideias criativas.",
    ovulatoria: "Pico de magnetismo e vitalidade. Expresse-se, converse e celebre o seu brilho.",
    lutea: "Tempo de recolhimento e organização. Desacelere o ritmo e acolha os seus limites."
};

const INSPIRACOES_FALLBACK = [
    "Dica de Leitura: 'Quarto de Despejo' (Carolina Maria de Jesus). A força crua e real de uma mulher que não se curvou à vida.",
    "Citação: 'Não sou alegre, nem sou triste: sou poeta.' — Cecília Meireles",
    "Bem-Estar: Prepare uma chávena do seu chá preferido. Sente-se num lugar confortável e beba sem olhar para o ecrã.",
    "Poesia: 'Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.' — Clarice Lispector"
];

function criarDataAbsoluta(ano, mes, dia) {
    const d = new Date();
    d.setFullYear(ano, mes - 1, dia);
    d.setHours(0, 0, 0, 0);
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
// 1. RENDERIZAÇÃO DA INTERFACE PRINCIPAL (TOPO ELEGANTE E ÍCONES +20%)
// =========================================================================

window.abrirEspacoMulher = async function() {
    const usuarioId = obterUsuarioIdSeguro();
    const supabase = obterClienteSupabaseSeguro();

    window.renderizarEsqueletoEspacoMulher();
    window.processarEExibirPrevisao();
    window.sincronizarCheckboxesRituaisHoje();
    window.calcularOfensivaERendimentoRituais();
    window.renderizarHistoricoRadarFeminilidade();
    window.atualizarVisualizacaoMidiaMulher();
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

    container.innerHTML = `
        <div id="vista-principal-espaco-mulher">
            
            <!-- LINHA 1 SUPERIOR: BOTÃO VOLTAR SOFISTICADO (ESTILO PÍLULA VIDRO) -->
            <div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:12px;">
                <button type="button" onclick="window.fecharEspacoMulher()" 
                        style="display:inline-flex; align-items:center; gap:8px; padding:8px 18px; border-radius:20px; font-size:12.5px; font-weight:800; background:rgba(255,255,255,0.92); border:1.5px solid #e9d5ff; color:#581c87; box-shadow:0 3px 10px rgba(124,58,237,0.06); backdrop-filter:blur(8px); cursor:pointer; transition:all 0.2s ease;">
                    <span style="font-size:16px; line-height:1;">←</span>
                    <span>Voltar ao Lar</span>
                </button>
            </div>

            <!-- LINHA 2: CABEÇALHO COM QUADRO +20% (70px), ÍCONE +20% (60px) E TIPOGRAFIA NOBRE (26px) -->
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px; padding:2px 4px;">
                <div style="width:70px; height:70px; border-radius:22px; background:linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); border:1.8px solid #d8b4fe; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 8px 20px rgba(124,58,237,0.16);">
                    <img src="./icone/icone-mulher.png" alt="Espaço Mulher" style="width:60px; height:60px; object-fit:contain;">
                </div>
                <div style="flex:1; min-width:0;">
                    <h1 style="margin:0; font-size:26px; font-weight:900; color:#3b0764; letter-spacing:-0.5px; line-height:1.15;">Espaço Mulher</h1>
                    <span style="font-size:12.5px; color:#6b21a8; font-weight:600; display:block; margin-top:3px;">Seu refúgio de ritmo, equilíbrio e autocuidado</span>
                </div>
            </div>

            <!-- LINHA 3: DIÁRIO E CICLO (50% / 50% COM ÍCONES +20%: 29px) -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
                <!-- Botão Diário à Esquerda com diario.png -->
                <button type="button" onclick="window.abrirPaginaDiario()" 
                        style="width:100%; box-sizing:border-box; padding:12px 14px; border-radius:18px; border:1.5px solid #d8b4fe; background:linear-gradient(135deg, #ffffff 0%, #faf5ff 100%); color:#3b0764; box-shadow:0 4px 14px rgba(124,58,237,0.08); display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:transform 0.15s ease;">
                    <img src="./icone/diario.png" onerror="this.onerror=null; this.src='./icone/icone-livro.png'; this.style.display='inline-block';" alt="Diário" style="width:29px; height:29px; object-fit:contain; flex-shrink:0;">
                    <div style="text-align:left;">
                        <strong style="font-size:13.5px; display:block; line-height:1.2; font-weight:900;">Diário</strong>
                        <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">Memórias & Alma</span>
                    </div>
                </button>

                <!-- Botão Ciclo à Direita com ciclo.png -->
                <button type="button" onclick="window.abrirModalRegistroCiclo()" 
                        style="width:100%; box-sizing:border-box; padding:12px 14px; border-radius:18px; border:1.5px solid #d8b4fe; background:linear-gradient(135deg, #ffffff 0%, #faf5ff 100%); color:#3b0764; box-shadow:0 4px 14px rgba(124,58,237,0.08); display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; transition:transform 0.15s ease;">
                    <img src="./icone/ciclo.png" onerror="this.onerror=null; this.src='./icone/icone-mulher.png'; this.style.display='inline-block';" alt="Ciclo" style="width:29px; height:29px; object-fit:contain; flex-shrink:0;">
                    <div style="text-align:left;">
                        <strong style="font-size:13.5px; display:block; line-height:1.2; font-weight:900;">Ciclo</strong>
                        <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">Registar Período</span>
                    </div>
                </button>
            </div>

            <!-- BOTÕES DE BEM-ESTAR -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
                <button type="button" class="btn-secundario" style="padding:11px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #c084fc; background:#ffffff; color:#581c87; box-shadow:0 2px 8px rgba(124,58,237,0.08);" onclick="window.abrirModalRespiracaoGuiada()">🌬️ 1 Minuto Zen</button>
                <button type="button" class="btn-secundario" style="padding:11px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #a855f7; background:#faf5ff; color:#6b21a8; box-shadow:0 2px 8px rgba(168,85,247,0.08);" onclick="window.abrirModoAcolhimentoEmergencia()">🌸 Modo Alívio (TPM)</button>
            </div>

            <!-- CARTÃO DO CICLO & DICA DA FASE -->
            <div class="cartao-geral" style="background:#ffffff; border:1.5px solid #e9d5ff; border-left:4px solid #7c3aed; text-align:center; padding:22px 18px; border-radius:24px; box-shadow:0 10px 25px rgba(88,28,135,0.06); position:relative; overflow:hidden;">
                <span style="font-size:11px; font-weight:800; color:#6b21a8; text-transform:uppercase; letter-spacing:1.5px; display:inline-block; margin-bottom:6px; background:#f3e8ff; padding:3px 12px; border-radius:20px; border:1px solid #e9d5ff;">Fase do Ciclo</span>
                <div id="display-fase-ciclo-atual" style="font-size:22px; font-weight:900; color:#3b0764; margin-bottom:4px;">Ciclo Natural</div>
                <p id="txt-previsao-proxima-menstruacao" style="font-size:12px; color:#581c87; margin:0 0 4px 0; font-weight:600;">Toque em '+ Ciclo' para registar a sua data.</p>
                <span id="txt-data-base-calculo" style="font-size:10.5px; color:#7e22ce; display:block; margin-bottom:10px; font-weight:600;"></span>
                
                <div style="background:#f3e8ff; border-radius:12px; height:8px; width:100%; overflow:hidden;">
                    <div id="barra-progresso-ciclo" style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:35%; border-radius:12px;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; font-weight:800; color:#6b21a8;">
                    <span id="txt-dia-ciclo-atual">Dia 1</span>
                    <span id="txt-dia-ciclo-final">Dia 28</span>
                </div>

                <!-- QUADRO DE SAÚDE BIOLÓGICA DA FASE (Ícone +20%: 29px) -->
                <div style="background:#faf5ff; border:1px dashed #c084fc; border-radius:14px; padding:12px; margin-top:14px; text-align:left; display:flex; align-items:flex-start; gap:10px;">
                    <img id="icone-dica-diaria-img" src="./icone/icone-mulher.png" alt="Fase" style="width:29px; height:29px; object-fit:contain; flex-shrink:0; margin-top:2px;">
                    <div style="flex:1;">
                        <strong style="font-size:11.5px; color:#3b0764; text-transform:uppercase; display:block; margin-bottom:2px;">Conselho Biológico da Fase:</strong>
                        <p id="txt-dica-diaria-ciclo" style="font-size:12px; color:#581c87; margin:0; line-height:1.45; font-weight:500;">A carregar orientação...</p>
                    </div>
                </div>
            </div>

            <!-- QUADRO DE INSPIRAÇÃO LITERÁRIA & ALMA (Ícone +20%: 22px) -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #e9d5ff; border-left:4px solid #a855f7; margin-top:14px; padding:14px 16px; border-radius:18px; box-shadow:0 4px 12px rgba(88,28,135,0.04);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                    <img src="./icone/icone-lampada-pense.png" alt="Inspiração" style="width:22px; height:22px; object-fit:contain;">
                    <strong style="font-size:12.5px; color:#3b0764; font-weight:800;">Inspiração Literária & Alma</strong>
                </div>
                <p id="txt-inspiracao-diaria" style="font-size:12px; color:#581c87; margin:0; line-height:1.55; font-style:italic;">A procurar reflexão...</p>
            </div>

            <!-- QUADRO: RADAR DE FEMINILIDADE & BEM-ESTAR -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #e9d5ff; border-left:4px solid #7c3aed; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:20px;">✨</span>
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">Radar de Feminilidade & Bem-Estar</strong>
                    </div>
                    <button type="button" class="btn-principal" style="padding:6px 14px; font-size:11px; border-radius:10px; width:auto; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; border:none; font-weight:800; cursor:pointer;" onclick="window.salvarRadarFeminilidadeCompleto()">Guardar</button>
                </div>

                <p style="font-size:11.5px; color:#6b21a8; margin:0 0 12px 0; line-height:1.4;">Avalie o seu estado interior de hoje com sinceridade e delicadeza:</p>

                <!-- Data da Última Conexão Íntima -->
                <div style="margin-bottom:14px;">
                    <label style="font-size:11px; font-weight:800; color:#581c87; display:block; margin-bottom:4px;">Última Conexão Íntima a Dois:</label>
                    <input type="date" id="slider-data-relacao-fem" style="width:100%; box-sizing:border-box; padding:9px 12px; border-radius:12px; border:1.5px solid #e9d5ff; font-size:12px; background:#faf5ff; color:#3b0764; outline:none; font-weight:600;">
                </div>

                <!-- Slider 1: Vitalidade & Brilho (Ícone +20%: 18px) -->
                <div style="background:#faf5ff; border:1px solid #ede9fe; padding:12px; border-radius:14px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:12px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                            <img src="./icone/icone-energia.png" alt="Vitalidade" style="width:18px; height:18px; object-fit:contain;">
                            Vitalidade & Brilho:
                        </span>
                        <strong id="badge-vitalidade-valor" style="font-size:11.5px; color:#581c87; background:#ede9fe; padding:2px 8px; border-radius:8px;">Nota 5 (Equilíbrio)</strong>
                    </div>
                    <input type="range" id="range-vitalidade-fem" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('vitalidade')">
                </div>

                <!-- Slider 2: Paz Mental & Carga Emocional (Ícone +20%: 18px) -->
                <div style="background:#faf5ff; border:1px solid #ede9fe; padding:12px; border-radius:14px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:12px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                            <img src="./icone/icone-estresse.png" alt="Paz Mental" style="width:18px; height:18px; object-fit:contain;">
                            Paz Mental & Leveza:
                        </span>
                        <strong id="badge-pazmental-valor" style="font-size:11.5px; color:#7e22ce; background:#ede9fe; padding:2px 8px; border-radius:8px;">Nota 5 (Serena)</strong>
                    </div>
                    <input type="range" id="range-pazmental-fem" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#a855f7; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('paz_mental')">
                </div>

                <!-- Slider 3: Afeto & Libido / Conexão (Ícone +20%: 18px) -->
                <div style="background:#faf5ff; border:1px solid #ede9fe; padding:12px; border-radius:14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:12px; font-weight:800; color:#3b0764; display:flex; align-items:center; gap:6px;">
                            <img src="./icone/icone-fogo.png" alt="Afeto" style="width:18px; height:18px; object-fit:contain;">
                            Afeto & Magnetismo:
                        </span>
                        <strong id="badge-afeto-valor" style="font-size:11.5px; color:#9333ea; background:#ede9fe; padding:2px 8px; border-radius:8px;">Nota 5 (Conexão Serena)</strong>
                    </div>
                    <input type="range" id="range-afeto-fem" min="1" max="10" value="5" step="1" style="width:100%; accent-color:#9333ea; cursor:pointer;" oninput="window.atualizarRotuloSliderFeminilidade('afeto_libido')">
                </div>

                <!-- Histórico Confidencial Retrátil do Radar -->
                <div style="border-top:1px dashed #e9d5ff; padding-top:10px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-historico-radar-fem', 'seta-hist-radar-fem')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#faf5ff; padding:8px 12px; border-radius:10px; border:1px solid #ede9fe;">
                        <span style="font-size:11.5px; font-weight:800; color:#581c87;">🌸 Histórico do Radar (<span id="contador-historico-radar-fem">0</span>)</span>
                        <span id="seta-hist-radar-fem" style="font-size:11px; color:#7c3aed; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-historico-radar-fem" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                        <div id="lista-historico-radar-fem" style="display:flex; flex-direction:column; gap:6px;"></div>
                    </div>
                </div>
            </div>

            <!-- QUADRO: O SANTUÁRIO (Ícones +20%: 24px, Fogo 15px, Config 16px) -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #e9d5ff; border-left:4px solid #9333ea; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-mulher.png" alt="Rituais" style="width:24px; height:24px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">O Santuário (Rituais Diários)</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span id="streak-rituais-mulher" style="font-size:11.5px; font-weight:800; color:#6b21a8; background:#f3e8ff; padding:3px 8px; border-radius:8px; border:1px solid #e9d5ff; display:inline-flex; align-items:center; gap:4px;">
                            <img src="./icone/icone-fogo.png" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> 0 dias
                        </span>
                        <button type="button" style="background:#faf5ff; border:1px solid #e9d5ff; color:#581c87; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.abrirModalEditarMetasMulher()" title="Editar metas">
                            <img src="./icone/icones-configuracao.png" alt="Configuração" style="width:16px; height:16px; object-fit:contain;">
                        </button>
                    </div>
                </div>

                <div style="background:#faf5ff; border:1px solid #ede9fe; border-radius:14px; padding:10px 12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span id="badge-titulo-rituais" style="font-size:11.5px; font-weight:800; color:#3b0764;">Desperte a Alma (0/6)</span>
                        <strong id="badge-pct-rituais" style="font-size:11.5px; font-weight:800; color:#7c3aed;">0%</strong>
                    </div>
                    <div style="background:#e9d5ff; border-radius:10px; height:7px; width:100%; overflow:hidden;">
                        <div id="barra-progresso-rituais" style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:0%; border-radius:10px; transition:width 0.3s ease;"></div>
                    </div>
                </div>

                <div id="container-grid-metas-mulher" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"></div>

                <div style="margin-top:14px; border-top:1px dashed #ede9fe; padding-top:10px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-historico-rituais', 'seta-hist-rituais')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#faf5ff; padding:8px 12px; border-radius:10px; border:1px solid #e9d5ff;">
                        <span style="font-size:11.5px; font-weight:800; color:#581c87;">Histórico dos Rituais (<span id="contador-historico-rituais">0</span>)</span>
                        <span id="seta-hist-rituais" style="font-size:11px; color:#7c3aed; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-historico-rituais" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>

            <!-- QUADRO: CURADORIA DE FILMES & SÉRIES (Ícone +20%: 24px, Check 16px) -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #e9d5ff; border-left:4px solid #6b21a8; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(88,28,135,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-filme.png" alt="Filmes" style="width:24px; height:24px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#3b0764; font-weight:800;">Curadoria: Filmes & Séries</strong>
                    </div>
                    <div style="display:flex; gap:4px; background:#f3e8ff; padding:3px; border-radius:10px; border:1px solid #e9d5ff;">
                        <button type="button" id="btn-aba-filmes-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:#7c3aed; color:#fff;" onclick="window.alternarAbaMidiaMulher('filmes')">Filmes</button>
                        <button type="button" id="btn-aba-series-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#581c87;" onclick="window.alternarAbaMidiaMulher('series')">Séries</button>
                    </div>
                </div>

                <div id="card-carrossel-midia-mulher" style="background:linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border:1px solid #e9d5ff; border-radius:16px; padding:14px; position:relative; min-height:120px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <span id="midia-mulher-categoria" style="font-size:10px; font-weight:800; background:#ede9fe; color:#581c87; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Categoria</span>
                            <span id="midia-mulher-tempo" style="font-size:11px; font-weight:700; color:#7e22ce;">-</span>
                        </div>
                        <h3 id="midia-mulher-titulo" style="margin:6px 0 4px 0; font-size:16px; color:#3b0764; font-weight:900;">Título</h3>
                        <p id="midia-mulher-desc" style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">Descrição da obra e reflexão.</p>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px dashed #d8b4fe; padding-top:10px;">
                        <div style="display:flex; gap:6px;">
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #e9d5ff; color:#6b21a8;" onclick="window.navegarCarrosselMidiaMulher(-1)">◄</button>
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #e9d5ff; color:#6b21a8;" onclick="window.navegarCarrosselMidiaMulher(1)">►</button>
                        </div>
                        <button type="button" id="btn-marcar-assistido-mulher" style="padding:7px 12px; font-size:11.5px; border-radius:10px; font-weight:800; background:#7c3aed; color:#fff; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" onclick="window.abrirModalAvaliacaoMidiaMulher()">
                            <img src="./icone/icone-check.png" alt="Assistido" style="width:16px; height:16px; object-fit:contain;"> Já Assisti
                        </button>
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
                    <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:10.5px; border-radius:8px; color:#581c87;" onclick="document.getElementById('caixa-avaliacao-midia-mulher').classList.add('oculto')">Cancelar</button>
                </div>

                <div style="margin-top:14px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-assistidos-mulher', 'seta-assistidos-mulher')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#faf5ff; padding:8px 12px; border-radius:10px; border:1px solid #e9d5ff;">
                        <span style="font-size:11.5px; font-weight:800; color:#3b0764;">Obras Assistidas (<span id="contador-assistidos-mulher">0</span>) • Mais Bem Avaliadas no Topo</span>
                        <span id="seta-assistidos-mulher" style="font-size:11px; color:#6b21a8; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-assistidos-mulher" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>

            <!-- COMO SE SENTE HOJE -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #e9d5ff; border-radius:20px; margin-top:14px; padding:14px 16px; box-shadow:0 4px 12px rgba(88,28,135,0.04);">
                <h4 style="font-size:13.5px; font-weight:800; color:#3b0764; margin:0 0 10px 0;">Como se sente hoje? (Pode marcar vários)</h4>
                
                <label style="font-size:11px; font-weight:800; color:#581c87; display:block; margin-bottom:6px;">Humor / Ânimo</label>
                <div id="grupo-tags-humor" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                    <button type="button" class="tag-opcao-humor" data-valor="calma" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Calma / Leve</button>
                    <button type="button" class="tag-opcao-humor" data-valor="energica" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Com Energia</button>
                    <button type="button" class="tag-opcao-humor" data-valor="sensivel" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Sensível / Doce</button>
                    <button type="button" class="tag-opcao-humor" data-valor="irritada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Irritada / Intensa</button>
                    <button type="button" class="tag-opcao-humor" data-valor="cansada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Cansada / Fadigada</button>
                </div>

                <label style="font-size:11px; font-weight:800; color:#581c87; display:block; margin-bottom:6px;">Sensação Física / Sintomas</label>
                <div id="grupo-tags-sintoma" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                    <button type="button" class="tag-opcao-sintoma" data-valor="colica_leve" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Cólica Leve</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="colica_forte" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Cólica Forte</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="dor_cabeca" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Dor de Cabeça</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="seios_sensiveis" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Seios Sensíveis</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="inchaco" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #e9d5ff; background:#faf5ff; color:#3b0764; font-size:11.5px; font-weight:700; cursor:pointer;">Inchaço</button>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #ede9fe; padding-top:10px;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#7c3aed; font-weight:800; cursor:pointer;">
                        <input type="checkbox" id="check-menstruando-hoje" style="width:18px; height:18px; accent-color:#7c3aed; border-radius:6px;">
                        Menstruando hoje
                    </label>
                    <button type="button" class="btn-principal" style="width:auto; padding:8px 16px; font-size:12px; font-weight:800; border-radius:12px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); border:none; color:#fff; cursor:pointer;" onclick="window.salvarRegistroSintomaDiario()">Registar</button>
                </div>
            </div>

            <div id="container-historico-sintomas-ciclos" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div>
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

            <!-- ESTRUTURA DO LIVRO / FOLHA DE PAPEL RÚSTICO -->
            <div id="livro-papel-container" style="background:#fbf5e8; border:2px solid #d5c3a5; border-radius:16px; padding:22px 18px 18px 18px; box-shadow:0 12px 30px rgba(78,52,24,0.18), inset 0 0 45px rgba(213,195,165,0.35); position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; bottom:0; left:0; width:12px; background:linear-gradient(90deg, rgba(168,138,98,0.4) 0%, rgba(213,195,165,0.1) 80%, transparent 100%); pointer-events:none;"></div>
                
                <input type="hidden" id="diario-id-edit">

                <!-- Título da Crónica / Pensamento -->
                <div style="margin-bottom:10px; border-bottom:1.5px solid #d8c6aa; padding-bottom:6px;">
                    <input type="text" id="diario-titulo" placeholder="Título da Página..." style="width:100%; box-sizing:border-box; border:none; background:transparent; font-size:17px; font-weight:800; color:#3c2a1a; font-family:'Playfair Display', Georgia, serif; outline:none;">
                </div>

                <!-- BLOCO 1: TERMÔMETRO FÍSICO (0 A 10: BOROCOCHÔ, MULHERÃO, DEUSA) -->
                <div style="background:#f5eedc; border:1px solid #d8c6aa; border-radius:12px; padding:10px 12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:800; color:#5c4426; text-transform:uppercase; letter-spacing:0.5px;">Sensação Física Hoje:</span>
                        <strong id="badge-termo-fisico-diario" style="font-size:12px; font-weight:800; color:#7c3aed; background:#ede3ce; padding:2px 8px; border-radius:8px;">Nota 7 (Mulherão 💃)</strong>
                    </div>
                    <input type="range" id="range-termo-fisico-diario" min="0" max="10" value="7" step="1" style="width:100%; accent-color:#7c3aed; cursor:pointer;" oninput="window.atualizarRotuloTermoFisicoDiario(this.value)">
                    <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#78593a; margin-top:3px;">
                        <span>0-3: Borocochô 🥀</span>
                        <span>4-7: Mulherão 💃</span>
                        <span>8-10: Deusa ✨</span>
                    </div>
                </div>

                <!-- BLOCO 2: HUMOR DA PÁGINA (6 BOTÕES) -->
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

                <!-- Seletor Elegante de Caligrafia -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed #d8c6aa; padding-bottom:8px;">
                    <span style="font-size:11px; font-weight:700; color:#78593a; text-transform:uppercase; letter-spacing:0.5px;">Estilo da Tinta:</span>
                    <div style="display:flex; gap:6px;">
                        <button type="button" id="btn-fonte-cursiva" style="border:none; padding:4px 10px; border-radius:8px; font-family:'Great Vibes', cursive; font-size:15px; background:#7c3aed; color:#fff; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('cursiva')">Caligrafia Elegante</button>
                        <button type="button" id="btn-fonte-forma" style="border:1px solid #d5c3a5; padding:4px 10px; border-radius:8px; font-family:'Segoe UI', sans-serif; font-size:11px; font-weight:700; background:#ffffff; color:#5c4426; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('forma')">Letra de Forma</button>
                    </div>
                    <input type="hidden" id="diario-tipo-fonte" value="cursiva">
                </div>

                <!-- Folha Pautada com Espaçamento Real -->
                <div style="position:relative; min-height:360px; background-color:transparent;">
                    <div style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; background-image:linear-gradient(to bottom, transparent 33px, rgba(168,138,98,0.25) 34px); background-size:100% 34px;"></div>
                    <textarea id="diario-conteudo-pagina-ativa" rows="11" placeholder="Escreva nesta folha o que vai no coração..." 
                              style="width:100%; box-sizing:border-box; padding:4px 6px; border:none; background:transparent; font-size:18px; line-height:34px; outline:none; resize:none; font-family:'Alex Brush', 'Great Vibes', cursive; color:#2c1f14; position:relative; z-index:2;"
                              oninput="window.monitorarLimiteLinhasPagina(this)"></textarea>
                </div>

                <!-- Rodapé da Folha com Navegação e Virada de Página -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; border-top:1.5px solid #d8c6aa; padding-top:10px;">
                    <button type="button" class="btn-secundario" style="padding:5px 10px; font-size:11px; font-weight:700; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; border-radius:8px;" onclick="window.navegarPaginaDiario(-1)">← Folha Anterior</button>
                    
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="indicador-pagina-diario-atual" style="font-size:12px; font-weight:800; color:#5c4426; font-family:'Playfair Display', serif;">Página 1 de 1</span>
                        <button type="button" style="padding:4px 8px; font-size:11px; font-weight:800; border-radius:8px; border:1.5px dashed #7c3aed; background:#faf5ff; color:#7c3aed; cursor:pointer;" onclick="window.adicionarNovaPaginaAoDiario()" title="Criar nova folha">+ Nova Folha</button>
                    </div>

                    <button type="button" class="btn-secundario" style="padding:5px 10px; font-size:11px; font-weight:700; border:1px solid #d5c3a5; background:#ffffff; color:#5c4426; border-radius:8px;" onclick="window.navegarPaginaDiario(1)">Próxima Folha →</button>
                </div>
            </div>

            <!-- PÁGINAS ANTERIORES / DIÁRIO HISTÓRICO -->
            <div style="margin-top:22px;">
                <h4 style="font-size:13.5px; font-weight:800; color:#3b0764; margin:0 0 10px 4px; text-transform:uppercase; letter-spacing:0.5px;">Capítulos Gravados Anteriores</h4>
                <div id="container-lista-diario-mulher" style="display:flex; flex-direction:column; gap:10px;">
                    <span style="font-size:11px; color:#6b21a8;">A carregar diário...</span>
                </div>
            </div>
        </div>

        <!-- MODAIS BOUTIQUE -->
        <!-- MODAL 1: LEITURA IMERSIVA DO DIÁRIO (PAGINADA) -->
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
                    <!-- Botão Editar Capítulo com Ícone +20%: 16px -->
                    <button type="button" class="btn-secundario" style="border-radius:12px; padding:9px 14px; font-size:11.5px; color:#5c4426; border:1px solid #d5c3a5; font-weight:700; display:inline-flex; align-items:center; gap:5px;" onclick="window.editarPaginaAtualLeitura()">
                        <img src="./icone/icone-editar.png" alt="Editar" style="width:16px; height:16px; object-fit:contain;"> Editar Capítulo
                    </button>
                    <button type="button" class="btn-principal" style="border-radius:12px; padding:9px 16px; font-size:11.5px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.fecharLeituraDiarioInteira()">Fechar</button>
                </div>
            </div>
        </div>

        <!-- MODAL 2: REGISTO DO CICLO -->
        <div id="modal-registro-ciclo-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000050; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:360px; padding:24px; border-radius:28px; border:1.5px solid #e9d5ff; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #ede9fe; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:17px; font-weight:900; color:#3b0764;">Registar Ciclo Menstrual</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #e9d5ff; background:#faf5ff; font-weight:800;" onclick="window.fecharModalRegistroCiclo()">✕</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:5px; display:block;">Primeiro dia do ciclo</label>
                        <input type="date" id="input-data-inicio-ciclo" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #e9d5ff; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:5px; display:block;">Duração do sangramento (dias)</label>
                        <input type="number" id="input-duracao-sangramento" value="5" min="1" max="15" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #e9d5ff; background:#faf5ff; font-weight:700; color:#3b0764; outline:none;">
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:20px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #e9d5ff; color:#581c87; font-weight:700;" onclick="window.fecharModalRegistroCiclo()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none;" onclick="window.salvarCicloHistorico()">Confirmar</button>
                </div>
            </div>
        </div>

        <!-- MODAL 3: PERSONALIZAR 6 METAS -->
        <div id="modal-config-metas-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000060; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:390px; max-height:86vh; overflow-y:auto; padding:24px; border-radius:28px; border:1.5px solid #e9d5ff; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #ede9fe; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:16.5px; font-weight:900; color:#3b0764;">Personalizar 6 Metas</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#581c87; border:1px solid #e9d5ff; background:#faf5ff; font-weight:800;" onclick="window.fecharModalEditarMetasMulher()">✕</button>
                </div>
                <p style="font-size:11.5px; color:#6b21a8; margin:0 0 14px 0; line-height:1.4;">Defina os seus rituais inegociáveis de autocuidado diário:</p>
                <div id="container-inputs-editar-metas-mulher" style="display:flex; flex-direction:column; gap:8px;"></div>
                <div style="display:flex; gap:8px; margin-top:16px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #e9d5ff; color:#581c87; font-weight:700;" onclick="window.fecharModalEditarMetasMulher()">Cancelar</button>
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
    if (v <= 3) return `Nota ${v} (Borocochô 🥀)`;
    if (v <= 7) return `Nota ${v} (Mulherão 💃)`;
    return `Nota ${v} (Deusa ✨)`;
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
// 3. RADAR DE FEMINILIDADE & BEM-ESTAR (SLIDERS 1 A 10 E HISTÓRICO)
// =========================================================================

window.obterDescricaoNotaFeminilidade = function(tipo, valor) {
    const v = parseInt(valor, 10);
    if (tipo === 'vitalidade') {
        if (v <= 2) return `Nota ${v} (Exaustão / Bateria Baixa)`;
        if (v <= 4) return `Nota ${v} (Pedindo Repouso)`;
        if (v <= 6) return `Nota ${v} (Equilíbrio / Estável)`;
        if (v <= 8) return `Nota ${v} (Vitalidade Ativa)`;
        return `Nota ${v} (Plenitude & Radiante)`;
    } else if (tipo === 'paz_mental') {
        if (v <= 2) return `Nota ${v} (Serenidade Total)`;
        if (v <= 4) return `Nota ${v} (Leveza / Em Paz)`;
        if (v <= 6) return `Nota ${v} (Emoções Oscilantes)`;
        if (v <= 8) return `Nota ${v} (Mente Inquieta / Tensa)`;
        return `Nota ${v} (Sobrecarga / Pedindo Pausa)`;
    } else if (tipo === 'afeto_libido') {
        if (v <= 3) return `Nota ${v} (Recolhimento / Em Si)`;
        if (v <= 7) return `Nota ${v} (Conexão Serena)`;
        return `Nota ${v} (Desejo Vivo & Magnetismo)`;
    }
    return `Nota ${v}`;
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
    const vVit = parseInt(document.getElementById('range-vitalidade-fem')?.value || '5', 10);
    const vPaz = parseInt(document.getElementById('range-pazmental-fem')?.value || '5', 10);
    const vAfeto = parseInt(document.getElementById('range-afeto-fem')?.value || '5', 10);
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
            <div style="background:#ffffff; border:1px solid #ede9fe; padding:8px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:10px; font-weight:800; color:#581c87; display:block;">${dataFmt}${infoRelacao}</span>
                    <span style="font-size:11px; color:#3b0764; font-weight:700; display:flex; align-items:center; gap:6px; margin-top:2px;">
                        <img src="./icone/icone-energia.png" alt="Vitalidade" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtVit} | 
                        <img src="./icone/icone-estresse.png" alt="Paz" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtPaz}
                    </span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; font-weight:800; color:#7c3aed; background:#f3e8ff; padding:3px 6px; border-radius:6px; display:inline-flex; align-items:center; gap:3px;">
                        <img src="./icone/icone-fogo.png" alt="Afeto" style="width:15px; height:15px; object-fit:contain;"> ${reg.txtAfeto}
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
            window.dadosRadarFeminilidade.vitalidade = data.vitalidade || 5;
            window.dadosRadarFeminilidade.paz_mental = data.paz_mental || 5;
            window.dadosRadarFeminilidade.afeto_libido = data.afeto_libido || 5;

            const inDt = document.getElementById('slider-data-relacao-fem');
            const rngVit = document.getElementById('range-vitalidade-fem');
            const rngPaz = document.getElementById('range-pazmental-fem');
            const rngAfeto = document.getElementById('range-afeto-fem');

            if (inDt) inDt.value = data.ultima_relacao || '';
            if (rngVit) rngVit.value = data.vitalidade || 5;
            if (rngPaz) rngPaz.value = data.paz_mental || 5;
            if (rngAfeto) rngAfeto.value = data.afeto_libido || 5;

            window.atualizarRotuloSliderFeminilidade('vitalidade');
            window.atualizarRotuloSliderFeminilidade('paz_mental');
            window.atualizarRotuloSliderFeminilidade('afeto_libido');
        }
    } catch (e) {}
};

// =========================================================================
// 4. LÓGICA DAS 6 METAS DIÁRIAS (O SANTUÁRIO)
// =========================================================================

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
    if (qtd <= 2) return "Semente Plantada";
    if (qtd <= 4) return "Em Florescimento";
    if (qtd === 5) return "Equilíbrio Radiante";
    return "Plenitude & Luz";
};

window.sincronizarCheckboxesRituaisHoje = function() {
    const containerGrid = document.getElementById('container-grid-metas-mulher');
    if (!containerGrid) return;

    const hojeStr = new Date().toISOString().split('T')[0];
    const registroHoje = window.dadosRituaisFemininos[hojeStr] || {};

    containerGrid.innerHTML = window.configMetasFemininas.map((meta, idx) => {
        const checked = !!registroHoje[`meta_${idx}`];
        return `
            <label style="display:flex; align-items:center; justify-content:space-between; background:#faf5ff; padding:10px 12px; border-radius:12px; border:1px solid #ede9fe; cursor:pointer;">
                <span style="font-size:11.5px; font-weight:700; color:#3b0764; line-height:1.3; overflow:hidden; text-overflow:ellipsis;">${meta}</span>
                <input type="checkbox" id="check-ritual-fem-${idx}" onchange="window.salvarCheckinRitualMulher(${idx})" ${checked ? 'checked' : ''} style="width:16px; height:16px; accent-color:#7c3aed; flex-shrink:0;">
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
    window.calcularOfensivaERendimentoRituais();
    window.renderizarHistoricoRituaisRetratil();

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

window.calcularOfensivaERendimentoRituais = function() {
    const hojeStr = new Date().toISOString().split('T')[0];
    const regHoje = window.dadosRituaisFemininos[hojeStr] || {};
    
    let cumpridas = 0;
    for (let i = 0; i < 6; i++) {
        if (regHoje[`meta_${i}`]) cumpridas++;
    }

    const pct = Math.round((cumpridas / 6) * 100);
    const barra = document.getElementById('barra-progresso-rituais');
    const badgeTitulo = document.getElementById('badge-titulo-rituais');
    const badgePct = document.getElementById('badge-pct-rituais');

    if (barra) barra.style.width = `${pct}%`;
    if (badgeTitulo) badgeTitulo.textContent = `${window.obterTituloRituaisMulher(cumpridas)} (${cumpridas}/6)`;
    if (badgePct) badgePct.textContent = `${pct}%`;

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

    const elStreak = document.getElementById('streak-rituais-mulher');
    if (elStreak) {
        elStreak.innerHTML = `<img src="./icone/icone-fogo.png" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> ${ofensiva} dias`;
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
            <div style="background:#ffffff; border:1px solid #ede9fe; border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:12px; color:#3b0764;">${dataFormatada} • ${titulo}</strong>
                    </div>
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
            <input type="text" id="input-edit-meta-mulher-${i}" value="${meta}" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:10px; border:1.5px solid #e9d5ff; background:#faf5ff; font-size:12px; font-weight:600; color:#3b0764;">
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
// 5. CURADORIA DE FILMES & SÉRIES (CARROSSEL, ESTRELAS E HISTÓRICO)
// =========================================================================

window.alternarAbaMidiaMulher = function(aba) {
    window.abaMidiaMulherAtiva = aba;
    const btnF = document.getElementById('btn-aba-filmes-mulher');
    const btnS = document.getElementById('btn-aba-series-mulher');

    if (aba === 'filmes') {
        if (btnF) { btnF.style.background = '#7c3aed'; btnF.style.color = '#fff'; }
        if (btnS) { btnS.style.background = 'transparent'; btnS.style.color = '#581c87'; }
    } else {
        if (btnS) { btnS.style.background = '#7c3aed'; btnS.style.color = '#fff'; }
        if (btnF) { btnF.style.background = 'transparent'; btnF.style.color = '#581c87'; }
    }

    window.atualizarVisualizacaoMidiaMulher();
};

window.obterListaMidiaMulherAtual = function() {
    const aba = window.abaMidiaMulherAtiva;
    if (aba === 'filmes') {
        return window.CatalogoFilmesMasculinos || window.CatalogoFilmesMulher;
    }
    return window.CatalogoSeriesMasculinas || window.CatalogoSeriesMulher;
};

window.navegarCarrosselMidiaMulher = function(dir) {
    const lista = window.obterListaMidiaMulherAtual();
    if (!lista || lista.length === 0) return;

    let idx = window.indiceMidiaMulher[window.abaMidiaMulherAtiva] + dir;
    if (idx < 0) idx = lista.length - 1;
    if (idx >= lista.length) idx = 0;

    window.indiceMidiaMulher[window.abaMidiaMulherAtiva] = idx;
    window.atualizarVisualizacaoMidiaMulher();
};

window.atualizarVisualizacaoMidiaMulher = function() {
    const lista = window.obterListaMidiaMulherAtual();
    const idx = window.indiceMidiaMulher[window.abaMidiaMulherAtiva] || 0;
    const item = lista[idx];

    if (!item) return;

    const elCat = document.getElementById('midia-mulher-categoria');
    const elTempo = document.getElementById('midia-mulher-tempo');
    const elTitulo = document.getElementById('midia-mulher-titulo');
    const elDesc = document.getElementById('midia-mulher-desc');
    const btnAcao = document.getElementById('btn-marcar-assistido-mulher');

    if (elCat) elCat.textContent = item.categoria || window.abaMidiaMulherAtiva.toUpperCase();
    if (elTempo) elTempo.textContent = item.ano || item.temporadas || '';
    if (elTitulo) elTitulo.textContent = item.titulo || '';
    if (elDesc) elDesc.textContent = item.desc || '';

    const jaVisto = window.dadosMidiaMulherAssistida.find(m => m.titulo.toLowerCase() === item.titulo.toLowerCase());
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

window.abrirModalAvaliacaoMidiaMulher = function() {
    const caixa = document.getElementById('caixa-avaliacao-midia-mulher');
    if (caixa) caixa.classList.toggle('oculto');
};

window.confirmarAvaliacaoMidiaMulher = function(estrelas) {
    const lista = window.obterListaMidiaMulherAtual();
    const item = lista[window.indiceMidiaMulher[window.abaMidiaMulherAtiva]];
    if (!item) return;

    window.dadosMidiaMulherAssistida = window.dadosMidiaMulherAssistida.filter(m => m.titulo.toLowerCase() !== item.titulo.toLowerCase());
    window.dadosMidiaMulherAssistida.push({
        id: item.id || ('mid_fem_' + Date.now()),
        titulo: item.titulo,
        tipo: window.abaMidiaMulherAtiva,
        categoria: item.categoria,
        estrelas: parseInt(estrelas, 10),
        data: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem('suiri_midia_mulher_assistida', JSON.stringify(window.dadosMidiaMulherAssistida));
    document.getElementById('caixa-avaliacao-midia-mulher')?.classList.add('oculto');
    
    window.atualizarVisualizacaoMidiaMulher();
    window.renderizarHistoricoAssistidosMulher();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Avaliação de ${estrelas} estrelas guardada!`, "sucesso");
    }
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
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #ede9fe; padding:8px 12px; border-radius:10px;">
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
// 6. MÚLTIPLA ESCOLHA DE HUMOR E SINTOMAS
// =========================================================================

window.toggleTagSelecao = function(btn) {
    btn.classList.toggle('selecionado');
    if (btn.classList.contains('selecionado')) {
        btn.style.background = '#f3e8ff';
        btn.style.borderColor = '#7c3aed';
        btn.style.color = '#3b0764';
    } else {
        btn.style.background = '#faf5ff';
        btn.style.borderColor = '#e9d5ff';
        btn.style.color = '#3b0764';
    }
};

window.salvarRegistroSintomaDiario = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const humoresSelecionados = Array.from(document.querySelectorAll('.tag-opcao-humor.selecionado')).map(b => b.getAttribute('data-valor'));
    const sintomasSelecionados = Array.from(document.querySelectorAll('.tag-opcao-sintoma.selecionado')).map(b => b.getAttribute('data-valor'));
    const sangrando = document.getElementById('check-menstruando-hoje')?.checked;

    if (humoresSelecionados.length === 0 && sintomasSelecionados.length === 0 && !sangrando) {
        return typeof window.mostrarToast === 'function' ? window.mostrarToast("Selecione pelo menos uma opção.", "erro") : alert("Selecione algo.");
    }

    const hojeObj = new Date();
    const hojeStr = hojeObj.getFullYear() + "-" + String(hojeObj.getMonth() + 1).padStart(2, '0') + "-" + String(hojeObj.getDate()).padStart(2, '0');

    try {
        const payload = {
            usuario_id: usuarioId,
            data_registro: hojeStr,
            humor: humoresSelecionados.length > 0 ? humoresSelecionados.join(', ') : null,
            sintoma_fisico: sintomasSelecionados.length > 0 ? sintomasSelecionados.join(', ') : 'nenhum',
            sangramento_ativo: sangrando
        };

        const { error } = await supabase.from('saude_sintomas').insert([payload]);

        if (error) {
            window.mostrarToast("Erro ao guardar: " + error.message, "erro");
        } else {
            if (typeof window.mostrarToast === 'function') window.mostrarToast("Registo diário salvo com sucesso!", "sucesso");
            
            document.querySelectorAll('.tag-opcao-humor.selecionado, .tag-opcao-sintoma.selecionado').forEach(b => window.toggleTagSelecao(b));
            if (document.getElementById('check-menstruando-hoje')) document.getElementById('check-menstruando-hoje').checked = false;
            
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
                                ${descFisicaCurta} (${meta.fisico}/10)
                            </span>
                            <span style="font-size:10px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:2px 7px; border-radius:6px; border:1px solid #e9d5ff;">
                                Humor: ${meta.humor || 'Feliz'}
                            </span>
                        </div>

                        <p style="color:#2c1f14; margin:0 0 10px 0; line-height:1.45; ${estiloFonte} white-space:pre-wrap;">"${resumo}"</p>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" style="background:#7c3aed; border:none; color:#ffffff; padding:6px 14px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer;" onclick="window.abrirLeitorCapituloDiario('${item.id}')">📖 Abrir Livro</button>
                            <div style="display:flex; gap:6px;">
                                <!-- Botão Excluir com Ícone +20%: 16px -->
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
                Física: ${descFisicaCurta} (${meta.fisico}/10)
            </span>
            <span style="font-size:10.5px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:3px 8px; border-radius:6px; border:1px solid #e9d5ff;">
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
// 8. FERRAMENTAS DE BEM-ESTAR (RESPIRAÇÃO E MODO ALÍVIO BOUTIQUE)
// =========================================================================

window.abrirModalRespiracaoGuiada = function() {
    let modal = document.getElementById('modal-respiracao-guiada');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respiracao-guiada';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:#ffffff; width:100%; max-width:360px; padding:30px 24px; border-radius:30px; border:1.5px solid #e9d5ff; text-align:center; box-shadow:0 25px 60px rgba(59,7,100,0.22);">
                <h3 style="margin:0 0 6px 0; font-size:20px; font-weight:900; color:#3b0764;">Respiração Consciente</h3>
                <p id="txt-instrucao-respiracao" style="font-size:13.5px; color:#581c87; margin:0 0 24px 0; font-weight:700;"> Inspire fundo pelo nariz... </p>
                
                <div style="display:flex; align-items:center; justify-content:center; height:180px; margin-bottom:24px;">
                    <div id="circulo-respiracao" style="width:110px; height:110px; background:linear-gradient(135deg, #a855f7, #6b21a8); border-radius:50%; box-shadow:0 0 35px rgba(124,58,237,0.35); transition: transform 4s ease-in-out;"></div>
                </div>

                <p style="font-size:11.5px; color:#6b21a8; margin:0 0 20px 0; font-weight:500;">Deixe o corpo relaxar e solte a tensão dos ombros.</p>
                <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModalRespiracao()">Encerrar Pausa</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('oculto');
    iniciarCicloRespiracao();
};

let intervaloRespiracao = null;
function iniciarCicloRespiracao() {
    const circulo = document.getElementById('circulo-respiracao');
    const txt = document.getElementById('txt-instrucao-respiracao');
    if (!circulo || !txt) return;

    let inspirar = true;
    const alternar = () => {
        const m = document.getElementById('modal-respiracao-guiada');
        if (!m || m.classList.contains('oculto')) return;
        if (inspirar) {
            circulo.style.transform = 'scale(1.45)';
            txt.textContent = 'Inspire lentamente... (4s)';
        } else {
            circulo.style.transform = 'scale(1.0)';
            txt.textContent = 'Expire devagar, esvaziando... (4s)';
        }
        inspirar = !inspirar;
    };
    alternar();
    intervaloRespiracao = setInterval(alternar, 4000);
}

window.fecharModalRespiracao = function() {
    if (intervaloRespiracao) clearInterval(intervaloRespiracao);
    const modal = document.getElementById('modal-respiracao-guiada');
    if (modal) modal.classList.add('oculto');
};

window.abrirModoAcolhimentoEmergencia = function() {
    let modal = document.getElementById('modal-modo-acolhimento');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-modo-acolhimento';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:#ffffff; width:100%; max-width:420px; max-height:86vh; padding:24px; border-radius:30px; border:1.5px solid #e9d5ff; overflow-y:auto; box-shadow:0 25px 60px rgba(59,7,100,0.22); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #ede9fe; padding-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-mulher.png" alt="Acolhimento" style="width:29px; height:29px; object-fit:contain;">
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#3b0764;">Modo Acolhimento</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; font-weight:800; color:#581c87; background:#faf5ff; border:1px solid #e9d5ff;" onclick="window.fecharModoAcolhimento()">✕</button>
                </div>

                <p style="font-size:12.5px; color:#581c87; line-height:1.5; margin:0 0 16px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#3b0764; display:block; margin-bottom:5px;">Posições de Alívio (Cólica)</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • <strong>Postura da Criança:</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão.<br>
                            • <strong>Pernas na Parede:</strong> Deite de costas e apoie as pernas esticadas na parede para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#581c87; display:block; margin-bottom:5px;">Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • O Fabuloso Destino de Amélie Poulain<br>
                            • Comer, Rezar, Amar<br>
                            • Anne with an E (Série)
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#7e22ce; display:block; margin-bottom:5px;">Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12px; color:#3b0764; font-style:italic; margin:0; line-height:1.45;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se recolher, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModoAcolhimento(); window.abrirModalRespiracaoGuiada();">Iniciar 1 Minuto de Respiração Guiada</button>
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
// 9. PREVISÕES, CICLOS E SINCRONIZAÇÃO
// =========================================================================

window.abrirModalRegistroCiclo = function() {
    const modal = document.getElementById('modal-registro-ciclo-mulher');
    if (modal) {
        modal.classList.remove('oculto');
        const dtInicio = document.getElementById('input-data-inicio-ciclo');
        if (dtInicio) {
            const h = new Date();
            dtInicio.value = h.getFullYear() + '-' + String(h.getMonth()+1).padStart(2,'0') + '-' + String(h.getDate()).padStart(2,'0');
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

window.processarEExibirPrevisao = function() {
    const elFase = document.getElementById('display-fase-ciclo-atual');
    const elPrevisao = document.getElementById('txt-previsao-proxima-menstruacao');
    const elDataBase = document.getElementById('txt-data-base-calculo');
    const elDica = document.getElementById('txt-dica-diaria-ciclo');
    const elBarra = document.getElementById('barra-progresso-ciclo');
    const elTxtDia = document.getElementById('txt-dia-ciclo-atual');
    const elTxtFinal = document.getElementById('txt-dia-ciclo-final');
    const elInspiracao = document.getElementById('txt-inspiracao-diaria');

    const hoje = obterHoje();
    const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
    const diaDoAno = Math.max(0, calcularDiffDias(hoje, inicioAno));

    if (elInspiracao) {
        let catalogoInspiracao = (window.AcervoBemEstarMulher && window.AcervoBemEstarMulher.length > 0)
            ? window.AcervoBemEstarMulher
            : INSPIRACOES_FALLBACK;
        elInspiracao.innerHTML = catalogoInspiracao[diaDoAno % catalogoInspiracao.length];
    }

    const ciclosValidosPassados = window.dadosCicloMulher ? window.dadosCicloMulher.filter(c => parseData(c.data_inicio).getTime() <= hoje.getTime()) : [];

    if (ciclosValidosPassados.length === 0) {
        if (elFase) elFase.textContent = "Ciclo Natural (Bem-Estar)";
        if (elPrevisao) elPrevisao.textContent = "Toque em '+ Ciclo' para acompanhar a sua previsão.";
        if (elDataBase) elDataBase.textContent = "Sem histórico inicial registado";
        
        let dicaGenerica = "A sua energia e criatividade renovam-se a cada dia. Respeite os seus limites e cuide de si com carinho.";
        if (window.AcervoDicasMulher && window.AcervoDicasMulher.folicular && window.AcervoDicasMulher.folicular.length > 0) {
            dicaGenerica = window.AcervoDicasMulher.folicular[diaDoAno % window.AcervoDicasMulher.folicular.length];
        }
        if (elDica) elDica.textContent = dicaGenerica;
        if (elBarra) elBarra.style.width = "40%";
        if (elTxtDia) elTxtDia.textContent = "Dia 1";
        if (elTxtFinal) elTxtFinal.textContent = "Dia 28";
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
    const inicioJanelaFertil = diaOvulacaoEstimado - 4;
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
            window.mostrarToast("Início do ciclo atualizado!", "sucesso");
            window.fecharModalRegistroCiclo();
            await window.carregarDadosCicloMulher();
        }
    } catch (err) { console.error(err); }
};

window.carregarHistoricoSintomas = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const limiteObj = new Date();
    limiteObj.setDate(limiteObj.getDate() - 15);
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

window.renderizarHistoricoSintomas = function() {
    const container = document.getElementById('container-historico-sintomas-ciclos');
    if (!container) return;

    if (!window.dadosSintomasDiarios || window.dadosSintomasDiarios.length === 0) {
        container.innerHTML = '<span style="font-size:11.5px; color:#6b21a8; text-align:center; display:block; padding:12px; font-weight:600;">Sem registos recentes.</span>';
        return;
    }

    const htmlLista = window.dadosSintomasDiarios.map(reg => {
        const partesData = reg.data_registro.split('-');
        const dataFormatada = `${partesData[2]}/${partesData[1]}`;
        const humorTxt = reg.humor || '-';
        const fisicoTxt = reg.sintoma_fisico || '-';
        const gota = reg.sangramento_ativo ? ' • Sangramento Ativo' : '';

        return `
            <div style="background:#ffffff; border:1px solid #ede9fe; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <strong style="font-size:12.5px; color:#3b0764;">${dataFormatada}${gota}</strong>
                    <span style="font-size:11px; color:#581c87; font-weight:500;">Humor: ${humorTxt} • Física: ${fisicoTxt}</span>
                </div>
                <!-- Botão Excluir com Ícone +20%: 16px -->
                <button type="button" style="background:#fef2f2; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.excluirRegistroSintoma('${reg.id}')" title="Excluir">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `<h4 style="font-size:12px; color:#581c87; margin: 6px 0 8px 2px; text-transform:uppercase; font-weight:800;">Últimos Registos</h4>` + htmlLista;
};

window.excluirRegistroSintoma = async function(idSintoma) {
    const supabase = obterClienteSupabaseSeguro();
    if (!supabase || !idSintoma) return;

    if (!confirm("Deseja mesmo eliminar este registo?")) return;

    try {
        const { error } = await supabase.from('saude_sintomas').delete().eq('id', idSintoma);
        if (!error) {
            window.mostrarToast("Registo removido com sucesso!", "sucesso");
            await window.carregarHistoricoSintomas();
        }
    } catch (err) { console.error(err); }
};
