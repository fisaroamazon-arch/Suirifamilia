// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SAUDE-MULHER.JS (100% COMPLETO E INTEGRAL)
// Ciclo, Diário da Alma, Rituais (6 Metas), Curadoria de Mídia e Modais Boutique
// Integrado com o Catálogo de Ícones PNG Transparentes (./icone/)
// =========================================================================

window.dadosCicloMulher = [];
window.dadosSintomasDiarios = [];
window.dadosDiarioMulher = [];

// Persistência das 6 Metas Diárias (O Santuário) e Mídia
window.dadosRituaisFemininos = JSON.parse(localStorage.getItem('suiri_rituais_fem')) || {};
window.configMetasFemininas = JSON.parse(localStorage.getItem('suiri_metas_fem_config')) || [
    "Hidratação Consciente (2L)",
    "Pausa / Leitura Inspiradora",
    "Movimento Suave / Treino",
    "Alimentação Nutritiva",
    "Momento de Silêncio / Respiração",
    "Desconexão Noturna (Zero Telas)"
];

window.dadosMidiaMulherAssistida = JSON.parse(localStorage.getItem('suiri_midia_mulher_assistida')) || [];
window.indiceMidiaMulher = { filmes: 0, series: 0 };
window.abaMidiaMulherAtiva = 'filmes';

// Catálogo Fallback caso os arrays globais ainda não tenham carregado
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

// =========================================================================
// 1. RENDERIZAÇÃO DA INTERFACE PRINCIPAL
// =========================================================================

window.abrirEspacoMulher = async function() {
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : (window.perfilAtual?.id || null);
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;

    if (!usuarioId || !supabase) {
        return typeof window.mostrarToast === 'function' ? window.mostrarToast("Sessão não identificada.", "erro") : alert("Sessão não identificada.");
    }

    if (typeof window.navegarParaTela === 'function') {
        const secoes = document.querySelectorAll('.secao-conteudo-app');
        secoes.forEach(sec => sec.classList.add('oculto'));
        const telaAlvo = document.getElementById('secao-espaco-mulher');
        if (telaAlvo) telaAlvo.classList.remove('oculto');
        document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('ativo'));
    }

    window.renderizarEsqueletoEspacoMulher();
    window.sincronizarCheckboxesRituaisHoje();
    window.calcularOfensivaERendimentoRituais();
    window.atualizarVisualizacaoMidiaMulher();
    window.renderizarHistoricoAssistidosMulher();
    window.renderizarHistoricoRituaisRetratil();

    await window.carregarDadosCicloMulher();
    await window.carregarHistoricoSintomas();
    await window.carregarDiarioMulher();
};

window.fecharEspacoMulher = function() {
    if (typeof window.navegarParaTela === 'function') window.navegarParaTela('meuespaco');
};

window.renderizarEsqueletoEspacoMulher = function() {
    const container = document.getElementById('secao-espaco-mulher');
    if (!container) return;

    container.innerHTML = `
        <div id="vista-principal-espaco-mulher">
            <!-- TOPO DA PÁGINA -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; padding: 4px 2px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button type="button" class="btn-secundario" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:700; background:#ffffff; border:1px solid #fbcfe8; color:#be185d; box-shadow:0 2px 6px rgba(244,114,182,0.1);" onclick="window.fecharEspacoMulher()">← Voltar</button>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-mulher.png" alt="Espaço Mulher" style="width:28px; height:28px; object-fit:contain;">
                        <div>
                            <h2 style="margin:0; font-size:19px; font-weight:900; color:#831843; letter-spacing:-0.3px;">Espaço Mulher</h2>
                            <span style="font-size:11px; color:#9d174d; font-weight:600;">Seu refúgio de ritmo e autocuidado</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:8px 12px; border-radius:14px; font-size:11.5px; font-weight:800; border:1px solid #f472b6; background:#fff1f2; color:#9d174d;" onclick="window.abrirPaginaDiario()">Diário</button>
                    <button type="button" class="btn-secundario" style="padding:8px 12px; border-radius:14px; font-size:11.5px; font-weight:800; border:1px solid #f472b6; background:#fff1f2; color:#9d174d;" onclick="window.abrirModalRegistroCiclo()">+ Ciclo</button>
                </div>
            </div>

            <!-- BOTÕES DE BEM-ESTAR -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
                <button type="button" class="btn-secundario" style="padding:10px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #f472b6; background:#fff1f2; color:#9d174d; box-shadow:0 2px 6px rgba(244,114,182,0.1);" onclick="window.abrirModalRespiracaoGuiada()">1 Minuto Zen</button>
                <button type="button" class="btn-secundario" style="padding:10px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #ec4899; background:#fdf2f8; color:#be185d; box-shadow:0 2px 6px rgba(236,72,153,0.1);" onclick="window.abrirModoAcolhimentoEmergencia()">Modo Alívio (TPM)</button>
            </div>

            <!-- CARTÃO DO CICLO & DICA DA FASE -->
            <div class="cartao-geral" style="background: radial-gradient(circle at 50% 0%, #ffffff 0%, #fff1f2 60%, #fce7f3 100%); border: 1.5px solid rgba(244, 114, 182, 0.4); text-align:center; padding: 22px 18px; border-radius: 24px; box-shadow: 0 10px 25px rgba(244,114,182,0.12); position:relative; overflow:hidden;">
                <span style="font-size:11px; font-weight:800; color:#be185d; text-transform:uppercase; letter-spacing:1.5px; display:inline-block; margin-bottom:6px; background:rgba(255,255,255,0.7); padding:3px 12px; border-radius:20px; border:1px solid #fbcfe8;">Fase do Ciclo</span>
                <div id="display-fase-ciclo-atual" style="font-size:22px; font-weight:900; color:#831843; margin-bottom:4px;">Calculando...</div>
                <p id="txt-previsao-proxima-menstruacao" style="font-size:12px; color:#9d174d; margin:0 0 4px 0; font-weight:600;">Analisando...</p>
                <span id="txt-data-base-calculo" style="font-size:10.5px; color:#a21caf; display:block; margin-bottom:10px; font-weight:600;"></span>
                
                <div style="background: #fce7f3; border-radius: 12px; height: 8px; width: 100%; overflow: hidden;">
                    <div id="barra-progresso-ciclo" style="background: linear-gradient(90deg, #f472b6, #db2777); height: 100%; width: 0%; border-radius:12px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; font-weight: 800; color: #be185d;">
                    <span id="txt-dia-ciclo-atual">Dia 1</span>
                    <span id="txt-dia-ciclo-final">Dia 28</span>
                </div>

                <!-- QUADRO DE SAÚDE BIOLÓGICA DA FASE -->
                <div style="background:rgba(255,255,255,0.85); border:1px dashed #f472b6; border-radius:14px; padding:12px; margin-top:14px; text-align:left; display:flex; align-items:flex-start; gap:10px;">
                    <img id="icone-dica-diaria-img" src="./icone/icone-mulher.png" alt="Fase" style="width:24px; height:24px; object-fit:contain; flex-shrink:0; margin-top:2px;">
                    <div>
                        <strong style="font-size:11.5px; color:#831843; text-transform:uppercase; display:block; margin-bottom:2px;">Conselho Biológico da Fase:</strong>
                        <p id="txt-dica-diaria-ciclo" style="font-size:12px; color:#9d174d; margin:0; line-height:1.45; font-weight:500;">A carregar orientação...</p>
                    </div>
                </div>
            </div>

            <!-- QUADRO DE INSPIRAÇÃO LITERÁRIA & ALMA -->
            <div class="cartao-geral" style="background: linear-gradient(135deg, #fff7ed 0%, #fdf4ff 100%); border: 1.5px dashed #f472b6; margin-top:14px; padding:14px 16px; border-radius:18px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <img src="./icone/icone-lampada-pense.png" alt="Inspiração" style="width:18px; height:18px; object-fit:contain;">
                    <strong style="font-size:12.5px; color:#9d174d; font-weight:800;">Inspiração Literária & Alma</strong>
                </div>
                <p id="txt-inspiracao-diaria" style="font-size:12px; color:#701a75; margin:0; line-height:1.5; font-style:italic;">A procurar reflexão...</p>
            </div>

            <!-- QUADRO: O SANTUÁRIO (6 METAS DIÁRIAS FEMININAS) -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #fbcfe8; border-left:4px solid #db2777; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(244,114,182,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-mulher.png" alt="Rituais" style="width:20px; height:20px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#831843; font-weight:800;">O Santuário (Rituais Diários)</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span id="streak-rituais-mulher" style="font-size:11.5px; font-weight:800; color:#db2777; background:#fdf2f8; padding:3px 8px; border-radius:8px; border:1px solid #fbcfe8; display:inline-flex; align-items:center; gap:4px;">
                            <img src="./icone/icone-fogo.png" alt="Fogo" style="width:12px; height:12px; object-fit:contain;"> 0 dias
                        </span>
                        <button type="button" style="background:#fff1f2; border:1px solid #fbcfe8; color:#be185d; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.abrirModalEditarMetasMulher()" title="Editar metas">
                            <img src="./icone/icones-configuracao.png" alt="Configuração" style="width:13px; height:13px; object-fit:contain;">
                        </button>
                    </div>
                </div>

                <!-- Título e Barra de Progresso do Dia -->
                <div style="background:#fffafb; border:1px solid #fce7f3; border-radius:14px; padding:10px 12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span id="badge-titulo-rituais" style="font-size:11.5px; font-weight:800; color:#831843;">Desperte a Alma (0/6)</span>
                        <strong id="badge-pct-rituais" style="font-size:11.5px; font-weight:800; color:#db2777;">0%</strong>
                    </div>
                    <div style="background:#fce7f3; border-radius:10px; height:7px; width:100%; overflow:hidden;">
                        <div id="barra-progresso-rituais" style="background:linear-gradient(90deg, #f472b6, #db2777); height:100%; width:0%; border-radius:10px; transition:width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- As 6 Caixas de Seleção -->
                <div id="container-grid-metas-mulher" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"></div>

                <!-- Histórico Retrátil dos Rituais -->
                <div style="margin-top:14px; border-top:1px dashed #fce7f3; padding-top:10px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-historico-rituais', 'seta-hist-rituais')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#fffafb; padding:8px 12px; border-radius:10px; border:1px solid #fbcfe8;">
                        <span style="font-size:11.5px; font-weight:800; color:#831843;">Histórico dos Rituais (<span id="contador-historico-rituais">0</span>)</span>
                        <span id="seta-hist-rituais" style="font-size:11px; color:#9d174d; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-historico-rituais" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>

            <!-- QUADRO: CURADORIA DE FILMES & SÉRIES -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #fbcfe8; border-left:4px solid #a855f7; margin-top:14px; padding:16px 18px; border-radius:20px; box-shadow:0 6px 16px rgba(168,85,247,0.08);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-filme.png" alt="Filmes" style="width:20px; height:20px; object-fit:contain;">
                        <strong style="font-size:13.5px; color:#581c87; font-weight:800;">Curadoria: Filmes & Séries</strong>
                    </div>
                    <div style="display:flex; gap:4px; background:#f5f3ff; padding:3px; border-radius:10px; border:1px solid #ede9fe;">
                        <button type="button" id="btn-aba-filmes-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:#9333ea; color:#fff;" onclick="window.alternarAbaMidiaMulher('filmes')">Filmes</button>
                        <button type="button" id="btn-aba-series-mulher" style="border:none; padding:4px 10px; font-size:11px; font-weight:800; border-radius:8px; cursor:pointer; background:transparent; color:#6b21a8;" onclick="window.alternarAbaMidiaMulher('series')">Séries</button>
                    </div>
                </div>

                <!-- Cartão do Carrossel em Destaque -->
                <div id="card-carrossel-midia-mulher" style="background:linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border:1px solid #f3e8ff; border-radius:16px; padding:14px; position:relative; min-height:120px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <span id="midia-mulher-categoria" style="font-size:10px; font-weight:800; background:#f3e8ff; color:#7e22ce; padding:2px 8px; border-radius:6px; text-transform:uppercase;">Categoria</span>
                            <span id="midia-mulher-tempo" style="font-size:11px; font-weight:700; color:#86198f;">-</span>
                        </div>
                        <h3 id="midia-mulher-titulo" style="margin:6px 0 4px 0; font-size:16px; color:#581c87; font-weight:900;">Título</h3>
                        <p id="midia-mulher-desc" style="font-size:12px; color:#4a044e; margin:0; line-height:1.45;">Descrição da obra e reflexão.</p>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px dashed #f5d0fe; padding-top:10px;">
                        <div style="display:flex; gap:6px;">
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #f3e8ff; color:#7e22ce;" onclick="window.navegarCarrosselMidiaMulher(-1)">◄</button>
                            <button type="button" class="btn-secundario" style="width:34px; height:34px; padding:0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#fff; border:1px solid #f3e8ff; color:#7e22ce;" onclick="window.navegarCarrosselMidiaMulher(1)">►</button>
                        </div>
                        <button type="button" id="btn-marcar-assistido-mulher" style="padding:7px 12px; font-size:11.5px; border-radius:10px; font-weight:800; background:#9333ea; color:#fff; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" onclick="window.abrirModalAvaliacaoMidiaMulher()">
                            <img src="./icone/icone-check.png" alt="Assistido" style="width:13px; height:13px; object-fit:contain;"> Já Assisti
                        </button>
                    </div>
                </div>

                <!-- Caixa Flutuante de Avaliação com 5 Estrelas -->
                <div id="caixa-avaliacao-midia-mulher" class="oculto" style="margin-top:10px; background:#fdf4ff; border:1.5px solid #f0abfc; border-radius:14px; padding:12px; text-align:center;">
                    <span style="font-size:12px; font-weight:800; color:#86198f; display:block; margin-bottom:6px;">Quantas estrelas dá a esta obra?</span>
                    <div style="display:flex; justify-content:center; gap:8px; margin-bottom:8px;">
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(1)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(2)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(3)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(4)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                        <button type="button" onclick="window.confirmarAvaliacaoMidiaMulher(5)" style="font-size:22px; background:none; border:none; cursor:pointer; color:#f59e0b;">★</button>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:4px 10px; font-size:10.5px; border-radius:8px; color:#86198f;" onclick="document.getElementById('caixa-avaliacao-midia-mulher').classList.add('oculto')">Cancelar</button>
                </div>

                <!-- Histórico Retrátil de Filmes e Séries Assistidos -->
                <div style="margin-top:14px;">
                    <div onclick="window.alternarRetratilGenerico('bloco-assistidos-mulher', 'seta-assistidos-mulher')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#faf5ff; padding:8px 12px; border-radius:10px; border:1px solid #f3e8ff;">
                        <span style="font-size:11.5px; font-weight:800; color:#581c87;">Obras Assistidas (<span id="contador-assistidos-mulher">0</span>) • Mais Bem Avaliadas no Topo</span>
                        <span id="seta-assistidos-mulher" style="font-size:11px; color:#7e22ce; transition:transform 0.2s ease;">▼</span>
                    </div>
                    <div id="bloco-assistidos-mulher" class="oculto" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>

            <!-- COMO SE SENTE HOJE -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #fbcfe8; border-radius:20px; margin-top:14px; padding:14px 16px;">
                <h4 style="font-size:13.5px; font-weight:800; color:#831843; margin:0 0 10px 0;">Como se sente hoje? (Pode marcar vários)</h4>
                
                <label style="font-size:11px; font-weight:800; color:#9d174d; display:block; margin-bottom:6px;">Humor / Ânimo</label>
                <div id="grupo-tags-humor" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                    <button type="button" class="tag-opcao-humor" data-valor="calma" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Calma / Leve</button>
                    <button type="button" class="tag-opcao-humor" data-valor="energica" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Com Energia</button>
                    <button type="button" class="tag-opcao-humor" data-valor="sensivel" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Sensível / Doce</button>
                    <button type="button" class="tag-opcao-humor" data-valor="irritada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Irritada / Intensa</button>
                    <button type="button" class="tag-opcao-humor" data-valor="cansada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Cansada / Fadigada</button>
                </div>

                <label style="font-size:11px; font-weight:800; color:#9d174d; display:block; margin-bottom:6px;">Sensação Física / Sintomas</label>
                <div id="grupo-tags-sintoma" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                    <button type="button" class="tag-opcao-sintoma" data-valor="colica_leve" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Cólica Leve</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="colica_forte" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Cólica Forte</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="dor_cabeca" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Dor de Cabeça</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="seios_sensiveis" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Seios Sensíveis</button>
                    <button type="button" class="tag-opcao-sintoma" data-valor="inchaco" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Inchaço</button>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #fce7f3; padding-top:10px;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#be123c; font-weight:800; cursor:pointer;">
                        <input type="checkbox" id="check-menstruando-hoje" style="width:18px; height:18px; accent-color:#be123c; border-radius:6px;">
                        Menstruando hoje
                    </label>
                    <button type="button" class="btn-principal" style="width:auto; padding:8px 16px; font-size:12px; font-weight:800; border-radius:12px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); border:none; color:#fff; cursor:pointer;" onclick="window.salvarRegistroSintomaDiario()">Registar</button>
                </div>
            </div>

            <div id="container-historico-sintomas-ciclos" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div>
        </div>

        <!-- VISTA DE PÁGINA INTEIRA: DIÁRIO DA ALMA -->
        <div id="vista-pagina-diario-mulher" class="oculto">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding: 4px 2px;">
                <button type="button" class="btn-secundario" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:700; background:#ffffff; border:1px solid #fbcfe8; color:#be185d;" onclick="window.fecharPaginaDiario()">← Voltar ao Espaço</button>
                <h3 style="margin:0; font-size:18px; font-weight:900; color:#831843;">Meu Diário da Alma</h3>
                <button type="button" class="btn-principal" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:800; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); border:none; color:#fff;" onclick="window.salvarPaginaDiarioCompleta()">Guardar</button>
            </div>

            <div class="cartao-geral" style="background: #fffdfa; border: 2px solid #f472b6; border-radius: 22px; padding: 20px; box-shadow: 0 10px 25px rgba(244,114,182,0.15); position: relative;">
                <input type="hidden" id="diario-id-edit">

                <div style="margin-bottom: 12px;">
                    <label style="font-size:11px; font-weight:800; color:#9d174d; text-transform:uppercase; display:block; margin-bottom:4px;">Título / Tema</label>
                    <input type="text" id="diario-titulo" placeholder="Ex: Reflexões de hoje..." style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; font-weight:700; color:#831843; outline:none;">
                </div>

                <div style="margin-bottom: 14px;">
                    <label style="font-size:11px; font-weight:800; color:#9d174d; text-transform:uppercase; display:block; margin-bottom:4px;">Estilo da Escrita</label>
                    <div style="display:flex; gap:8px;">
                        <button type="button" id="btn-fonte-cursiva" class="btn-principal" style="flex:1; padding:8px; border-radius:12px; font-family:'Georgia', serif; font-style:italic; font-size:12px; background:#db2777; color:#fff; border:none; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('cursiva')">Cursiva (Manuscrita)</button>
                        <button type="button" id="btn-fonte-forma" class="btn-secundario" style="flex:1; padding:8px; border-radius:12px; font-family:'Segoe UI', sans-serif; font-size:12px; background:#fff; color:#9d174d; border:1.5px solid #fbcfe8; cursor:pointer;" onclick="window.mudarEstiloFonteDiario('forma')">Letra de Forma</button>
                    </div>
                    <input type="hidden" id="diario-tipo-fonte" value="cursiva">
                </div>

                <div>
                    <label style="font-size:11px; font-weight:800; color:#9d174d; text-transform:uppercase; display:block; margin-bottom:4px;">Página de Desabafos</label>
                    <div style="position: relative; border: 1.5px solid #fbcfe8; border-radius: 16px; background-color: #fffdf9; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-image: linear-gradient(to bottom, transparent 31px, #fbcfe8 31px); background-size: 100% 32px; opacity: 0.4;"></div>
                        <textarea id="diario-conteudo" rows="14" placeholder="Escreva o que vai no coração..." style="width: 100%; box-sizing: border-box; padding: 14px; border: none; background: transparent; font-size: 15px; line-height: 32px; outline: none; resize: vertical; font-family: 'Georgia', serif; font-style: italic; color: #4a044e; position: relative; z-index: 2;"></textarea>
                    </div>
                </div>
            </div>

            <!-- PÁGINAS ANTERIORES -->
            <div style="margin-top: 20px;">
                <h4 style="font-size:13px; font-weight:800; color:#831843; margin:0 0 10px 4px; text-transform:uppercase; letter-spacing:0.5px;">Páginas Anteriores</h4>
                <div id="container-lista-diario-mulher" style="display:flex; flex-direction:column; gap:10px;">
                    <span style="font-size:11px; color:#9d174d;">A carregar diário...</span>
                </div>
            </div>
        </div>

        <!-- MODAIS BOUTIQUE -->
        <!-- MODAL 1: LEITURA IMERSIVA DO DIÁRIO -->
        <div id="vista-leitura-diario-inteira" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(74,4,78,0.48); z-index:1000080; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div style="background:#fffdfa; width:100%; max-width:480px; max-height:86vh; padding:22px; border-radius:28px; border:1.5px solid #fbcfe8; box-shadow:0 25px 60px rgba(112,26,117,0.22); display:flex; flex-direction:column; position:relative; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #fce7f3; padding-bottom:8px;">
                    <div>
                        <span id="leitura-data-pagina" style="font-size:11px; font-weight:800; color:#db2777; text-transform:uppercase; letter-spacing:0.5px;">Data</span>
                        <h3 id="leitura-titulo-pagina" style="margin:2px 0 0 0; font-size:17px; font-weight:900; color:#831843;">Título</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#be185d; border:1px solid #fbcfe8; background:#fff1f2; font-weight:800;" onclick="window.fecharLeituraDiarioInteira()">✕</button>
                </div>
                <div style="flex:1; position: relative; border: 1.5px solid #fce7f3; border-radius: 18px; background-color: #fffdf9; overflow-y: auto; padding: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-image: linear-gradient(to bottom, transparent 31px, #fbcfe8 31px); background-size: 100% 32px; opacity: 0.35;"></div>
                    <div id="leitura-conteudo-pagina" style="font-size:15.5px; line-height:32px; color:#4a044e; white-space: pre-wrap; position:relative; z-index:2;"></div>
                </div>
                <div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end;">
                    <button type="button" class="btn-secundario" style="border-radius:12px; padding:10px 14px; font-size:12px; color:#be185d; border:1px solid #fbcfe8; font-weight:700; display:inline-flex; align-items:center; gap:4px;" onclick="window.editarPaginaAtualLeitura()">
                        <img src="./icone/icone-editar.png" alt="Editar" style="width:13px; height:13px; object-fit:contain;"> Editar Página
                    </button>
                    <button type="button" class="btn-principal" style="border-radius:12px; padding:10px 16px; font-size:12px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none;" onclick="window.fecharLeituraDiarioInteira()">Voltar ao Diário</button>
                </div>
            </div>
        </div>

        <!-- MODAL 2: REGISTO DO CICLO -->
        <div id="modal-registro-ciclo-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(74,4,78,0.48); z-index:1000050; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:360px; padding:24px; border-radius:28px; border:1.5px solid #fbcfe8; box-shadow: 0 25px 60px rgba(112,26,117,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #fce7f3; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:17px; font-weight:900; color:#831843;">Registar Ciclo Menstrual</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#be185d; border:1px solid #fbcfe8; background:#fff1f2; font-weight:800;" onclick="window.fecharModalRegistroCiclo()">✕</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#9d174d; margin-bottom:5px; display:block;">Primeiro dia do ciclo</label>
                        <input type="date" id="input-data-inicio-ciclo" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #fbcfe8; background:#fffafb; font-weight:700; color:#831843; outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#9d174d; margin-bottom:5px; display:block;">Duração do sangramento (dias)</label>
                        <input type="number" id="input-duracao-sangramento" value="5" min="1" max="15" style="border-radius:14px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #fbcfe8; background:#fffafb; font-weight:700; color:#831843; outline:none;">
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:20px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #fbcfe8; color:#be185d; font-weight:700;" onclick="window.fecharModalRegistroCiclo()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none;" onclick="window.salvarCicloHistorico()">Confirmar</button>
                </div>
            </div>
        </div>

        <!-- MODAL 3: PERSONALIZAR 6 METAS -->
        <div id="modal-config-metas-mulher" class="modal-overlay oculto" style="position:fixed; inset:0; width:100%; height:100%; background:rgba(74,4,78,0.48); z-index:1000060; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;">
            <div class="modal-conteudo" style="background:#ffffff; width:100%; max-width:390px; max-height:86vh; overflow-y:auto; padding:24px; border-radius:28px; border:1.5px solid #fbcfe8; box-shadow:0 25px 60px rgba(112,26,117,0.22);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fce7f3; padding-bottom:8px;">
                    <h3 style="margin:0; font-size:16.5px; font-weight:900; color:#831843;">Personalizar 6 Metas</h3>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; color:#be185d; border:1px solid #fbcfe8; background:#fff1f2; font-weight:800;" onclick="window.fecharModalEditarMetasMulher()">✕</button>
                </div>
                <p style="font-size:11.5px; color:#9d174d; margin:0 0 14px 0; line-height:1.4;">Defina os seus hábitos ou rituais diários inegociáveis de autocuidado:</p>
                <div id="container-inputs-editar-metas-mulher" style="display:flex; flex-direction:column; gap:8px;"></div>
                <div style="display:flex; gap:8px; margin-top:16px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:11px; border:1px solid #fbcfe8; color:#be185d; font-weight:700;" onclick="window.fecharModalEditarMetasMulher()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:11px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none;" onclick="window.salvarNovasMetasConfiguradasMulher()">Guardar</button>
                </div>
            </div>
        </div>
    `;
};

// =========================================================================
// 2. LÓGICA DAS 6 METAS DIÁRIAS (O SANTUÁRIO / RITUAIS FEMININOS)
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
            <label style="display:flex; align-items:center; justify-content:space-between; background:#fffafb; padding:10px 12px; border-radius:12px; border:1px solid #fce7f3; cursor:pointer;">
                <span style="font-size:11.5px; font-weight:700; color:#831843; line-height:1.3; overflow:hidden; text-overflow:ellipsis;">${meta}</span>
                <input type="checkbox" id="check-ritual-fem-${idx}" onchange="window.salvarCheckinRitualMulher(${idx})" ${checked ? 'checked' : ''} style="width:16px; height:16px; accent-color:#db2777; flex-shrink:0;">
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

    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
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
        elStreak.innerHTML = `<img src="./icone/icone-fogo.png" alt="Fogo" style="width:12px; height:12px; object-fit:contain;"> ${ofensiva} dias`;
    }
};

window.renderizarHistoricoRituaisRetratil = function() {
    const cont = document.getElementById('bloco-historico-rituais');
    const elContador = document.getElementById('contador-historico-rituais');
    if (!cont) return;

    const datas = Object.keys(window.dadosRituaisFemininos).sort().reverse();
    if (elContador) elContador.textContent = datas.length;

    if (datas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#9d174d; text-align:center; display:block; padding:8px;">Nenhum registo diário guardado ainda.</span>';
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
            <div style="background:#fffafb; border:1px solid #fce7f3; border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:12px; color:#831843;">${dataFormatada} • ${titulo}</strong>
                    </div>
                    <span style="font-size:11px; font-weight:800; color:#db2777;">${total}/6 (${pct}%)</span>
                </div>
                <div style="background:#fce7f3; border-radius:8px; height:5px; width:100%; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, #f472b6, #db2777); height:100%; width:${pct}%;"></div>
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
            <label style="font-size:10.5px; font-weight:800; color:#9d174d; display:block; margin-bottom:2px;">Meta ${i + 1}</label>
            <input type="text" id="input-edit-meta-mulher-${i}" value="${meta}" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:10px; border:1.5px solid #fbcfe8; background:#fffafb; font-size:12px; font-weight:600; color:#831843;">
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
// 3. CURADORIA DE FILMES & SÉRIES (CARROSSEL, ESTRELAS E HISTÓRICO)
// =========================================================================

window.alternarAbaMidiaMulher = function(aba) {
    window.abaMidiaMulherAtiva = aba;
    const btnF = document.getElementById('btn-aba-filmes-mulher');
    const btnS = document.getElementById('btn-aba-series-mulher');

    if (aba === 'filmes') {
        if (btnF) { btnF.style.background = '#9333ea'; btnF.style.color = '#fff'; }
        if (btnS) { btnS.style.background = 'transparent'; btnS.style.color = '#6b21a8'; }
    } else {
        if (btnS) { btnS.style.background = '#9333ea'; btnS.style.color = '#fff'; }
        if (btnF) { btnF.style.background = 'transparent'; btnF.style.color = '#6b21a8'; }
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
            btnAcao.innerHTML = `<img src="./icone/icone-check.png" alt="Assistido" style="width:13px; height:13px; object-fit:contain; vertical-align:middle; margin-right:4px;"> Já Assisti`;
            btnAcao.style.background = '#9333ea';
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
        cont.innerHTML = '<span style="font-size:11px; color:#86198f; text-align:center; display:block; padding:8px;">Nenhuma obra avaliada ainda.</span>';
        return;
    }

    cont.innerHTML = ordenados.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #f3e8ff; padding:8px 12px; border-radius:10px;">
            <div style="min-width:0;">
                <strong style="font-size:12.5px; color:#581c87; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.titulo}</strong>
                <span style="font-size:10px; color:#7e22ce; text-transform:uppercase;">${item.tipo} • ${item.categoria || ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:800; color:#f59e0b;">${'★'.repeat(item.estrelas)}</span>
                <button type="button" onclick="window.removerMidiaMulherAssistida('${item.id}')" style="background:none; border:none; cursor:pointer; padding:2px 4px; display:flex; align-items:center;" title="Remover">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
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
// 4. MÚLTIPLA ESCOLHA DE HUMOR E SINTOMAS
// =========================================================================

window.toggleTagSelecao = function(btn) {
    btn.classList.toggle('selecionado');
    if (btn.classList.contains('selecionado')) {
        btn.style.background = '#fce7f3';
        btn.style.borderColor = '#db2777';
        btn.style.color = '#831843';
    } else {
        btn.style.background = '#fffafb';
        btn.style.borderColor = '#fbcfe8';
        btn.style.color = '#831843';
    }
};

window.salvarRegistroSintomaDiario = async function() {
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
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
// 5. DIÁRIO EM PÁGINA INTEIRA & LEITURA IMERSIVA
// =========================================================================

let paginaDiarioEmLeituraAtual = null;

window.abrirPaginaDiario = function(id = '', titulo = '', conteudo = '', tipoFonte = 'cursiva') {
    const vistaPrincipal = document.getElementById('vista-principal-espaco-mulher');
    const vistaDiario = document.getElementById('vista-pagina-diario-mulher');

    if (vistaPrincipal && vistaDiario) {
        vistaPrincipal.classList.add('oculto');
        vistaDiario.classList.remove('oculto');

        document.getElementById('diario-id-edit').value = id;
        document.getElementById('diario-titulo').value = titulo;
        document.getElementById('diario-conteudo').value = conteudo;
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

window.lerPaginaDiarioInteira = function(id, titulo, conteudo, dataRegistro, tipoFonte) {
    paginaDiarioEmLeituraAtual = { id, titulo, conteudo, dataRegistro, tipoFonte };
    
    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    const elTitulo = document.getElementById('leitura-titulo-pagina');
    const elData = document.getElementById('leitura-data-pagina');
    const elConteudo = document.getElementById('leitura-conteudo-pagina');

    if (elTitulo) elTitulo.textContent = titulo || 'Pensamento do Dia';
    if (elData) elData.textContent = dataRegistro;
    if (elConteudo) {
        elConteudo.textContent = conteudo;
        elConteudo.style.fontFamily = tipoFonte === 'cursiva' ? "'Georgia', serif" : "'Segoe UI', sans-serif";
        elConteudo.style.fontStyle = tipoFonte === 'cursiva' ? "italic" : "normal";
    }

    if (modalLeitura) modalLeitura.classList.remove('oculto');
};

window.fecharLeituraDiarioInteira = function() {
    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    if (modalLeitura) modalLeitura.classList.add('oculto');
};

window.editarPaginaAtualLeitura = function() {
    if (!paginaDiarioEmLeituraAtual) return;
    window.fecharLeituraDiarioInteira();
    window.abrirPaginaDiario(
        paginaDiarioEmLeituraAtual.id,
        paginaDiarioEmLeituraAtual.titulo,
        paginaDiarioEmLeituraAtual.conteudo,
        paginaDiarioEmLeituraAtual.tipoFonte
    );
};

window.mudarEstiloFonteDiario = function(tipo) {
    const inputTipo = document.getElementById('diario-tipo-fonte');
    const txtArea = document.getElementById('diario-conteudo');
    const btnCursiva = document.getElementById('btn-fonte-cursiva');
    const btnForma = document.getElementById('btn-fonte-forma');

    if (inputTipo) inputTipo.value = tipo;

    if (tipo === 'cursiva') {
        if (txtArea) {
            txtArea.style.fontFamily = "'Georgia', serif";
            txtArea.style.fontStyle = "italic";
        }
        if (btnCursiva) { btnCursiva.style.background = '#db2777'; btnCursiva.style.color = '#fff'; btnCursiva.style.border = 'none'; }
        if (btnForma) { btnForma.style.background = '#fff'; btnForma.style.color = '#9d174d'; btnForma.style.border = '1.5px solid #fbcfe8'; }
    } else {
        if (txtArea) {
            txtArea.style.fontFamily = "'Segoe UI', sans-serif";
            txtArea.style.fontStyle = "normal";
        }
        if (btnForma) { btnForma.style.background = '#db2777'; btnForma.style.color = '#fff'; btnForma.style.border = 'none'; }
        if (btnCursiva) { btnCursiva.style.background = '#fff'; btnCursiva.style.color = '#9d174d'; btnCursiva.style.border = '1.5px solid #fbcfe8'; }
    }
};

window.carregarDiarioMulher = async function() {
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
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
                container.innerHTML = '<span style="font-size:11.5px; color:#9d174d;">Nenhuma página escrita ainda. Comece agora!</span>';
                return;
            }

            container.innerHTML = data.map(item => {
                const partes = item.data_registro.split('-');
                const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                const estiloFonte = item.tipo_fonte === 'cursiva' ? "font-family: Georgia, serif; font-style: italic;" : "font-family: 'Segoe UI', sans-serif;";
                const conteudoResumo = item.conteudo.length > 120 ? item.conteudo.substring(0, 120) + '...' : item.conteudo;

                return `
                    <div style="background:#fffdf9; border:1px solid #fbcfe8; border-radius:16px; padding:14px 16px; box-shadow:0 2px 8px rgba(244,114,182,0.06);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <strong style="font-size:13.5px; color:#831843;">${item.titulo || 'Pensamento do Dia'}</strong>
                            <span style="font-size:11px; color:#9d174d; font-weight:700;">${dataFormatada}</span>
                        </div>
                        <p style="font-size:12.5px; color:#4a044e; margin:0 0 10px 0; line-height:1.5; ${estiloFonte} white-space: pre-wrap;">${conteudoResumo}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" style="background:#fce7f3; border:none; color:#831843; padding:6px 14px; border-radius:10px; font-size:11.5px; font-weight:800; cursor:pointer;" onclick="window.lerPaginaDiarioInteira('${item.id}', '${item.titulo || ''}', \`${item.conteudo.replace(/`/g, '\\`')}\`, '${dataFormatada}', '${item.tipo_fonte || 'cursiva'}')">Ler Página</button>
                            <div style="display:flex; gap:6px;">
                                <button type="button" style="background:#ffe4e6; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.excluirPaginaDiario('${item.id}')" title="Excluir">
                                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:14px; height:14px; object-fit:contain;">
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

window.salvarPaginaDiarioCompleta = async function() {
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
    
    const id = document.getElementById('diario-id-edit')?.value;
    const titulo = document.getElementById('diario-titulo')?.value;
    const conteudo = document.getElementById('diario-conteudo')?.value;
    const tipoFonte = document.getElementById('diario-tipo-fonte')?.value || 'cursiva';

    if (!supabase || !usuarioId) return;
    if (!conteudo || !conteudo.trim()) {
        return typeof window.mostrarToast === 'function' ? window.mostrarToast("Escreva algo na página do diário.", "erro") : alert("Escreva algo.");
    }

    try {
        const payload = {
            usuario_id: usuarioId,
            titulo: titulo || 'Pensamento do Dia',
            conteudo: conteudo.trim(),
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
            window.mostrarToast("Página guardada com carinho no diário!", "sucesso");
            window.fecharPaginaDiario();
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

window.excluirPaginaDiario = async function(idDiario) {
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    if (!supabase || !idDiario) return;

    if (!confirm("Deseja mesmo apagar esta página do diário?")) return;

    try {
        const { error } = await supabase.from('saude_diario').delete().eq('id', idDiario);
        if (!error) {
            window.mostrarToast("Página removida com sucesso!", "sucesso");
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 6. FERRAMENTAS DE BEM-ESTAR (RESPIRAÇÃO E MODO ALÍVIO BOUTIQUE)
// =========================================================================

window.abrirModalRespiracaoGuiada = function() {
    let modal = document.getElementById('modal-respiracao-guiada');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respiracao-guiada';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(74,4,78,0.48); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg, #ffffff 0%, #fff1f2 100%); width:100%; max-width:360px; padding:30px 24px; border-radius:30px; border:1.5px solid #fbcfe8; text-align:center; box-shadow:0 25px 60px rgba(112,26,117,0.22);">
                <h3 style="margin:0 0 6px 0; font-size:20px; font-weight:900; color:#831843;">Respiração Consciente</h3>
                <p id="txt-instrucao-respiracao" style="font-size:13.5px; color:#9d174d; margin:0 0 24px 0; font-weight:700;"> Inspire fundo pelo nariz... </p>
                
                <div style="display:flex; align-items:center; justify-content:center; height:180px; margin-bottom:24px;">
                    <div id="circulo-respiracao" style="width:110px; height:110px; background:linear-gradient(135deg, #f472b6, #db2777); border-radius:50%; box-shadow:0 0 35px rgba(236,72,153,0.5); transition: transform 4s ease-in-out;"></div>
                </div>

                <p style="font-size:11.5px; color:#64748b; margin:0 0 20px 0; font-weight:500;">Deixe o corpo relaxar e solte a tensão dos ombros.</p>
                <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModalRespiracao()">Encerrar Pausa</button>
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
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(74,4,78,0.48); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:#ffffff; width:100%; max-width:420px; max-height:86vh; padding:24px; border-radius:30px; border:1.5px solid #fbcfe8; overflow-y:auto; box-shadow:0 25px 60px rgba(112,26,117,0.22); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #fce7f3; padding-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="./icone/icone-mulher.png" alt="Acolhimento" style="width:24px; height:24px; object-fit:contain;">
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#831843;">Modo Acolhimento</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; font-weight:800; color:#be185d; background:#fff1f2; border:1px solid #fbcfe8;" onclick="window.fecharModoAcolhimento()">✕</button>
                </div>

                <p style="font-size:12.5px; color:#9d174d; line-height:1.5; margin:0 0 16px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="background:#fff1f2; border:1px solid #fbcfe8; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#831843; display:block; margin-bottom:5px;">Posições de Alívio (Cólica)</strong>
                        <p style="font-size:12px; color:#475569; margin:0; line-height:1.45;">
                            • <strong>Postura da Criança:</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão.<br>
                            • <strong>Pernas na Parede:</strong> Deite de costas e apoie as pernas esticadas na parede para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#86198f; display:block; margin-bottom:5px;">Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12px; color:#475569; margin:0; line-height:1.45;">
                            • O Fabuloso Destino de Amélie Poulain<br>
                            • Comer, Rezar, Amar<br>
                            • Anne with an E (Série)
                        </p>
                    </div>

                    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#b45309; display:block; margin-bottom:5px;">Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12px; color:#78350f; font-style:italic; margin:0; line-height:1.45;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se recolher, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModoAcolhimento(); window.abrirModalRespiracaoGuiada();">Iniciar 1 Minuto de Respiração Guiada</button>
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
// 7. PREVISÕES, CICLOS E SINCRONIZAÇÃO
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
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
    if (!supabase || !usuarioId) return;

    try {
        const { data, error } = await supabase
            .from('saude_ciclos')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_inicio', { ascending: false });

        if (!error && data) window.dadosCicloMulher = data;
    } catch (err) { console.error(err); }
    window.processarEExibirPrevisao();
};

window.processarEExibirPrevisao = function() {
    const elFase = document.getElementById('display-fase-ciclo-atual');
    const elPrevisao = document.getElementById('txt-previsao-proxima-menstruacao');
    const elDataBase = document.getElementById('txt-data-base-calculo');
    const elDica = document.getElementById('txt-dica-diaria-ciclo');
    const elIconeDicaImg = document.getElementById('icone-dica-diaria-img');
    const elBarra = document.getElementById('barra-progresso-ciclo');
    const elTxtDia = document.getElementById('txt-dia-ciclo-atual');
    const elTxtFinal = document.getElementById('txt-dia-ciclo-final');
    const elInspiracao = document.getElementById('txt-inspiracao-diaria');

    const hoje = obterHoje();
    const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
    const diaDoAno = calcularDiffDias(hoje, inicioAno);

    if (elInspiracao) {
        let catalogoInspiracao = INSPIRACOES_FALLBACK;
        if (window.AcervoBemEstarMulher && window.AcervoBemEstarMulher.length > 0) {
            catalogoInspiracao = window.AcervoBemEstarMulher;
        }
        elInspiracao.innerHTML = catalogoInspiracao[diaDoAno % catalogoInspiracao.length];
    }

    const ciclosValidosPassados = window.dadosCicloMulher ? window.dadosCicloMulher.filter(c => parseData(c.data_inicio).getTime() <= hoje.getTime()) : [];

    if (ciclosValidosPassados.length === 0) {
        if (elFase) elFase.textContent = "Sem registos";
        if (elPrevisao) elPrevisao.textContent = "Adicione o seu último ciclo para iniciar as previsões.";
        if (elDataBase) elDataBase.textContent = "Base: Nenhum histórico encontrado";
        if (elDica) elDica.textContent = "Acompanhar o seu ciclo ajuda a entender as suas oscilações de energia.";
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
        corGradiente = "linear-gradient(90deg, #fb7185, #e11d48)";
    } else if (diaAtualDoCiclo > duracaoSangramento && diaAtualDoCiclo < inicioJanelaFertil) {
        faseTexto = "Fase Folicular";
        chaveFase = "folicular";
        corGradiente = "linear-gradient(90deg, #34d399, #059669)";
    } else if (diaAtualDoCiclo >= inicioJanelaFertil && diaAtualDoCiclo <= fimJanelaFertil) {
        faseTexto = "Fase Ovulatória";
        chaveFase = "ovulatoria";
        corGradiente = "linear-gradient(90deg, #fbbf24, #d97706)";
    } else {
        faseTexto = "Fase Lútea";
        chaveFase = "lutea";
        corGradiente = "linear-gradient(90deg, #a78bfa, #7c3aed)";
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
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
    
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
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
    const usuarioId = window.obterUsuarioId ? window.obterUsuarioId() : null;
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
        container.innerHTML = '<span style="font-size:11.5px; color:#9d174d; text-align:center; display:block; padding:12px; font-weight:600;">Sem registos recentes.</span>';
        return;
    }

    const htmlLista = window.dadosSintomasDiarios.map(reg => {
        const partesData = reg.data_registro.split('-');
        const dataFormatada = `${partesData[2]}/${partesData[1]}`;
        const humorTxt = reg.humor || '-';
        const fisicoTxt = reg.sintoma_fisico || '-';
        const gota = reg.sangramento_ativo ? ' • Sangramento Ativo' : '';

        return `
            <div style="background:#ffffff; border:1px solid #fce7f3; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <strong style="font-size:12.5px; color:#831843;">${dataFormatada}${gota}</strong>
                    <span style="font-size:11px; color:#64748b; font-weight:500;">Humor: ${humorTxt} • Física: ${fisicoTxt}</span>
                </div>
                <button type="button" style="background:#ffe4e6; border:none; width:28px; height:28px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.excluirRegistroSintoma('${reg.id}')" title="Excluir">
                    <img src="./icone/icone-lixo.png" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `<h4 style="font-size:12px; color:#9d174d; margin: 6px 0 8px 2px; text-transform:uppercase; font-weight:800;">Últimos Registos</h4>` + htmlLista;
};

window.excluirRegistroSintoma = async function(idSintoma) {
    const supabase = window.obterClienteSupabase ? window.obterClienteSupabase() : null;
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
