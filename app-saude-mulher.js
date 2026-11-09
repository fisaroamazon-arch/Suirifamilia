// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SAUDE-MULHER.JS (COMPLETO E UNIFICADO)
// Ciclo, Diário em Tela Inteira, Sintomas e Ferramentas de Bem-Estar
// =========================================================================

window.dadosCicloMulher = [];
window.dadosSintomasDiarios = [];
window.dadosDiarioMulher = [];

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

const INSPIRACOES_FALLBACK = [
    "📖 Dica de Leitura: 'Quarto de Despejo' (Carolina Maria de Jesus). A força crua e real de uma mulher que não se curvou à vida.",
    "✨ Citação: 'Não sou alegre, nem sou triste: sou poeta.' — Cecília Meireles",
    "🌿 Bem-Estar: Prepare uma chávena do seu chá preferido. Sente-se num lugar confortável e beba sem olhar para o ecrã.",
    "✒️ Poesia: 'Renda-se, como eu me rendi. Mergulhe no que você não conhece como eu mergulhei.' — Clarice Lispector"
];

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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; padding: 4px 2px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <button type="button" class="btn-secundario" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:700; background:#ffffff; border:1px solid #fbcfe8; color:#be185d; box-shadow:0 2px 6px rgba(244,114,182,0.1);" onclick="window.fecharEspacoMulher()">← Voltar</button>
                    <div>
                        <h2 style="margin:0; font-size:19px; font-weight:900; color:#831843; letter-spacing:-0.3px;">Espaço Mulher</h2>
                        <span style="font-size:11px; color:#9d174d; font-weight:600;">Seu refúgio de ritmo e autocuidado</span>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn-secundario" style="padding:8px 12px; border-radius:14px; font-size:11.5px; font-weight:800; border:1px solid #f472b6; background:#fff1f2; color:#9d174d;" onclick="window.abrirPaginaDiario()">📖 Diário</button>
                    <button type="button" class="btn-secundario" style="padding:8px 12px; border-radius:14px; font-size:11.5px; font-weight:800; border:1px solid #f472b6; background:#fff1f2; color:#9d174d;" onclick="window.abrirModalRegistroCiclo()">+ Ciclo</button>
                </div>
            </div>

            <!-- BOTÕES DE BEM-ESTAR -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
                <button type="button" class="btn-secundario" style="padding:10px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #f472b6; background:#fff1f2; color:#9d174d; box-shadow:0 2px 6px rgba(244,114,182,0.1);" onclick="window.abrirModalRespiracaoGuiada()">🌿 1 Minuto Zen</button>
                <button type="button" class="btn-secundario" style="padding:10px; border-radius:14px; font-size:11.5px; font-weight:800; border:1.5px solid #ec4899; background:#fdf2f8; color:#be185d; box-shadow:0 2px 6px rgba(236,72,153,0.1);" onclick="window.abrirModoAcolhimentoEmergencia()">🍵 Modo Alívio (TPM)</button>
            </div>

            <!-- CARTÃO DO CICLO -->
            <div class="cartao-geral" style="background: radial-gradient(circle at 50% 0%, #ffffff 0%, #fff1f2 60%, #fce7f3 100%); border: 1.5px solid rgba(244, 114, 182, 0.4); text-align:center; padding: 22px 18px; border-radius: 24px; box-shadow: 0 10px 25px rgba(244,114,182,0.12); position:relative; overflow:hidden;">
                <span style="font-size:11px; font-weight:800; color:#be185d; text-transform:uppercase; letter-spacing:1.5px; display:inline-block; margin-bottom:6px; background:rgba(255,255,255,0.7); padding:3px 12px; border-radius:20px; border:1px solid #fbcfe8;">Fase do Ciclo</span>
                <div id="display-fase-ciclo-atual" style="font-size:22px; font-weight:900; color:#831843; margin-bottom:4px;">Calculando...</div>
                <p id="txt-previsao-proxima-menstruacao" style="font-size:12px; color:#9d174d; margin:0 0 4px 0; font-weight:600;">Analisando...</p>
                
                <div style="margin-top: 14px; background: #fce7f3; border-radius: 12px; height: 8px; width: 100%; overflow: hidden;">
                    <div id="barra-progresso-ciclo" style="background: linear-gradient(90deg, #f472b6, #db2777); height: 100%; width: 0%; border-radius:12px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; font-weight: 800; color: #be185d;">
                    <span id="txt-dia-ciclo-atual">Dia 1</span>
                    <span id="txt-dia-ciclo-final">Dia 28</span>
                </div>
            </div>

            <!-- QUADRO DE INSPIRAÇÃO -->
            <div class="cartao-geral" style="background: linear-gradient(135deg, #fff7ed 0%, #fdf4ff 100%); border: 1.5px dashed #f472b6; margin-top:14px; padding:14px 16px; border-radius:18px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span style="font-size:16px;">📖</span>
                    <strong style="font-size:12.5px; color:#9d174d; font-weight:800;">Inspiração Literária & Alma</strong>
                </div>
                <p id="txt-inspiracao-diaria" style="font-size:12px; color:#701a75; margin:0; line-height:1.5; font-style:italic;">Buscando poesia...</p>
            </div>

            <!-- COMO SE SENTE HOJE (MÚLTIPLA ESCOLHA) -->
            <div class="cartao-geral" style="background:#ffffff; border:1px solid #fbcfe8; border-radius:20px; margin-top:14px; padding:14px 16px;">
                <h4 style="font-size:13.5px; font-weight:800; color:#831843; margin:0 0 10px 0;">Como se sente hoje? (Pode marcar vários)</h4>
                
                <label style="font-size:11px; font-weight:800; color:#9d174d; display:block; margin-bottom:6px;">Humor / Ânimo</label>
                <div id="grupo-tags-humor" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                    <button type="button" class="tag-opcao-humor" data-valor="calma" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Calma / Leve 🧘‍♀️</button>
                    <button type="button" class="tag-opcao-humor" data-valor="energica" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Com Energia ⚡</button>
                    <button type="button" class="tag-opcao-humor" data-valor="sensivel" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Sensível / Doce 💧</button>
                    <button type="button" class="tag-opcao-humor" data-valor="irritada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Irritada / Intensa 🌪️</button>
                    <button type="button" class="tag-opcao-humor" data-valor="cansada" onclick="window.toggleTagSelecao(this)" style="padding:6px 12px; border-radius:12px; border:1.5px solid #fbcfe8; background:#fffafb; color:#831843; font-size:11.5px; font-weight:700; cursor:pointer;">Cansada / Fadigada 😴</button>
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
                        Menstruando hoje 🩸
                    </label>
                    <button type="button" class="btn-principal" style="width:auto; padding:8px 16px; font-size:12px; font-weight:800; border-radius:12px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); border:none; color:#fff; cursor:pointer;" onclick="window.salvarRegistroSintomaDiario()">Registar</button>
                </div>
            </div>

            <div id="container-historico-sintomas-ciclos" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div>
        </div>

        <!-- VISTA DE PÁGINA INTEIRA: DIÁRIO DA ALMA (CADERNO) -->
        <div id="vista-pagina-diario-mulher" class="oculto">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding: 4px 2px;">
                <button type="button" class="btn-secundario" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:700; background:#ffffff; border:1px solid #fbcfe8; color:#be185d;" onclick="window.fecharPaginaDiario()">← Voltar ao Espaço</button>
                <h3 style="margin:0; font-size:18px; font-weight:900; color:#831843;">📖 Meu Diário da Alma</h3>
                <button type="button" class="btn-principal" style="padding:8px 14px; border-radius:14px; font-size:12px; font-weight:800; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); border:none; color:#fff;" onclick="window.salvarPaginaDiarioCompleta()">Guardar</button>
            </div>

            <!-- Bloco Caderno com Linhas Estilo Pautado -->
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

            <!-- LISTA DE PÁGINAS ANTERIORES DO DIÁRIO -->
            <div style="margin-top: 20px;">
                <h4 style="font-size:13px; font-weight:800; color:#831843; margin:0 0 10px 4px; text-transform:uppercase; letter-spacing:0.5px;">Páginas Anteriores</h4>
                <div id="container-lista-diario-mulher" style="display:flex; flex-direction:column; gap:10px;">
                    <span style="font-size:11px; color:#9d174d;">A carregar diário...</span>
                </div>
            </div>
        </div>

        <!-- VISTA DE LEITURA EM TELA INTEIRA (MODAL DE CADERNO IMERSIVO) -->
        <div id="vista-leitura-diario-inteira" class="modal-overlay oculto" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); z-index:1000080; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
            <div style="background:#fffdfa; width:94%; max-width:500px; height:85vh; max-height:700px; padding:22px; border-radius:26px; border:2px solid #f472b6; box-shadow:0 20px 40px rgba(0,0,0,0.3); display:flex; flex-direction:column; position:relative; overflow:hidden;">
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #fbcfe8; padding-bottom:8px;">
                    <div>
                        <span id="leitura-data-pagina" style="font-size:11px; font-weight:800; color:#db2777; text-transform:uppercase;">Data</span>
                        <h3 id="leitura-titulo-pagina" style="margin:2px 0 0 0; font-size:17px; font-weight:900; color:#831843;">Título</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:4px 10px; border-radius:10px; color:#be185d;" onclick="window.fecharLeituraDiarioInteira()">✕ Fechar</button>
                </div>

                <div style="flex:1; position: relative; border: 1.5px solid #fbcfe8; border-radius: 16px; background-color: #fffdf9; overflow-y: auto; padding: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; background-image: linear-gradient(to bottom, transparent 31px, #fbcfe8 31px); background-size: 100% 32px; opacity: 0.35;"></div>
                    <div id="leitura-conteudo-pagina" style="font-size:16px; line-height:32px; color:#4a044e; white-space: pre-wrap; position:relative; z-index:2;"></div>
                </div>

                <div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end;">
                    <button type="button" class="btn-secundario" style="border-radius:12px; padding:10px 14px; font-size:12px; color:#be185d;" onclick="window.editarPaginaAtualLeitura()">Editar Página</button>
                    <button type="button" class="btn-principal" style="border-radius:12px; padding:10px 16px; font-size:12px; background:#db2777; color:#fff; font-weight:800;" onclick="window.fecharLeituraDiarioInteira()">Voltar ao Diário</button>
                </div>
            </div>
        </div>

        <!-- MODAL: REGISTRO DE CICLO -->
        <div id="modal-registro-ciclo-mulher" class="modal-overlay oculto" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.75); z-index:1000050; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px);">
            <div class="modal-conteudo" style="background:#ffffff; width:90%; max-width:340px; padding:22px; border-radius:26px; border:2px solid #fbcfe8; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <h3 style="margin:0; font-size:17px; font-weight:900; color:#831843;">Registar Menstruação</h3>
                    <button type="button" class="btn-secundario" style="padding:4px 9px; border-radius:10px; color:#be185d;" onclick="window.fecharModalRegistroCiclo()">✕</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#9d174d; margin-bottom:5px; display:block;">Primeiro dia do ciclo</label>
                        <input type="date" id="input-data-inicio-ciclo" style="border-radius:12px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #fbcfe8; background:#fffafb; font-weight:600;">
                    </div>
                    <div>
                        <label style="font-size:11.5px; font-weight:800; color:#9d174d; margin-bottom:5px; display:block;">Duração do sangramento (dias)</label>
                        <input type="number" id="input-duracao-sangramento" value="5" min="1" max="15" style="border-radius:12px; width:100%; box-sizing:border-box; padding:11px; border:1.5px solid #fbcfe8; background:#fffafb; font-weight:600;">
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:20px;">
                    <button type="button" class="btn-secundario" style="flex:1; border-radius:14px; padding:10px;" onclick="window.fecharModalRegistroCiclo()">Cancelar</button>
                    <button type="button" class="btn-principal" style="flex:1.2; border-radius:14px; padding:10px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800;" onclick="window.salvarCicloHistorico()">Confirmar</button>
                </div>
            </div>
        </div>
    `;
};

// =========================================================================
// 2. MÚLTIPLA ESCOLHA DE HUMOR E SINTOMAS
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
// 3. DIÁRIO EM PÁGINA INTEIRA & LEITURA IMERSIVA
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
                            <button type="button" style="background:#fce7f3; border:none; color:#831843; padding:6px 14px; border-radius:10px; font-size:11.5px; font-weight:800; cursor:pointer;" onclick="window.lerPaginaDiarioInteira('${item.id}', '${item.titulo || ''}', \`${item.conteudo.replace(/`/g, '\\`')}\`, '${dataFormatada}', '${item.tipo_fonte || 'cursiva'}')">📖 Ler Página</button>
                            <div style="display:flex; gap:6px;">
                                <button type="button" style="background:#ffe4e6; border:none; color:#e11d48; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" onclick="window.excluirPaginaDiario('${item.id}')" title="Excluir">🗑️</button>
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
// 4. FERRAMENTAS DE BEM-ESTAR (RESPIRAÇÃO E MODO ALÍVIO)
// =========================================================================

window.abrirModalRespiracaoGuiada = function() {
    let modal = document.getElementById('modal-respiracao-guiada');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respiracao-guiada';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%); width:90%; max-width:360px; padding:30px 24px; border-radius:28px; border:2.5px solid #f472b6; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <h3 style="margin:0 0 8px 0; font-size:20px; font-weight:900; color:#831843;">Respiração Consciente</h3>
                <p id="txt-instrucao-respiracao" style="font-size:14px; color:#9d174d; margin:0 0 24px 0; font-weight:700;"> Inspire fundo pelo nariz... </p>
                
                <div style="display:flex; align-items:center; justify-content:center; height:180px; margin-bottom:24px;">
                    <div id="circulo-respiracao" style="width:110px; height:110px; background:linear-gradient(135deg, #f472b6, #db2777); border-radius:50%; box-shadow:0 0 35px rgba(236,72,153,0.6); transition: transform 4s ease-in-out;"></div>
                </div>

                <p style="font-size:12px; color:#64748b; margin:0 0 20px 0;">Deixe o corpo relaxar e solte a tensão dos ombros.</p>
                <button type="button" class="btn-principal" style="width:100%; padding:14px; border-radius:16px; background:#db2777; color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModalRespiracao()">Encerrar Pausa</button>
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
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px);';
        modal.innerHTML = `
            <div style="background:#ffffff; width:94%; max-width:440px; max-height:85vh; padding:24px; border-radius:28px; border:2.5px solid #ec4899; overflow-y:auto; box-shadow:0 25px 50px rgba(0,0,0,0.4); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #fce7f3; padding-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:24px;">🍵</span>
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#831843;">Modo Acolhimento</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; font-weight:800; color:#be185d; background:#fff1f2; border:none;" onclick="window.fecharModoAcolhimento()">✕ Sair</button>
                </div>

                <p style="font-size:13px; color:#9d174d; line-height:1.5; margin:0 0 18px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:14px;">
                    <div style="background:#fff1f2; border:1.5px solid #fbcfe8; border-radius:16px; padding:16px;">
                        <strong style="font-size:13.5px; color:#831843; display:block; margin-bottom:6px;">🧘‍♀️ Posições de Alívio (Cólica)</strong>
                        <p style="font-size:12.5px; color:#475569; margin:0; line-height:1.5;">
                            • <strong>Postura da Criança:</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão.<br>
                            • <strong>Pernas na Parede:</strong> Deite de costas e apoie as pernas esticadas na parede para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#fdf4ff; border:1.5px solid #f5d0fe; border-radius:16px; padding:16px;">
                        <strong style="font-size:13.5px; color:#86198f; display:block; margin-bottom:6px;">🎬 Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12.5px; color:#475569; margin:0; line-height:1.5;">
                            • O Fabuloso Destino de Amélie Poulain<br>
                            • Comer, Rezar, Amar<br>
                            • Meu Amigo Totoro (Animação Ghibli)
                        </p>
                    </div>

                    <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:16px; padding:16px;">
                        <strong style="font-size:13.5px; color:#b45309; display:block; margin-bottom:6px;">✒️ Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12.5px; color:#78350f; font-style:italic; margin:0; line-height:1.5;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se recolher, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:20px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:14px; border-radius:16px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModoAcolhimento(); window.abrirModalRespiracaoGuiada();">Iniciar 1 Minuto de Respiração Guiada 🌿</button>
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
// 5. CICLOS E INTEGRAÇÃO SUPABASE
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
    const elIconeDica = document.getElementById('icone-dica-diaria');
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
        if (elIconeDica) elIconeDica.textContent = "🌸";
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
    let icone = "🌸";
    let corGradiente = ""; 

    if (diaAtualDoCiclo > mediaCiclo) {
        faseTexto = "Atraso Menstrual ⏳";
        chaveFase = "lutea";
        icone = "📅";
        corGradiente = "linear-gradient(90deg, #94a3b8, #64748b)";
    } else if (diaAtualDoCiclo >= 1 && diaAtualDoCiclo <= duracaoSangramento) {
        faseTexto = "Fase Menstrual 🩸";
        chaveFase = "menstrual";
        icone = "☕";
        corGradiente = "linear-gradient(90deg, #fb7185, #e11d48)";
    } else if (diaAtualDoCiclo > duracaoSangramento && diaAtualDoCiclo < inicioJanelaFertil) {
        faseTexto = "Fase Folicular 🌿";
        chaveFase = "folicular";
        icone = "🌱";
        corGradiente = "linear-gradient(90deg, #34d399, #059669)";
    } else if (diaAtualDoCiclo >= inicioJanelaFertil && diaAtualDoCiclo <= fimJanelaFertil) {
        faseTexto = "Fase Ovulatória ✨";
        chaveFase = "ovulatoria";
        icone = "🔥";
        corGradiente = "linear-gradient(90deg, #fbbf24, #d97706)";
    } else {
        faseTexto = "Fase Lútea 🍂";
        chaveFase = "lutea";
        icone = "🧘‍♀️";
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

    if (elIconeDica) elIconeDica.textContent = icone;

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
        const gota = reg.sangramento_ativo ? '<span style="color:#be123c;">🩸</span>' : '';

        return `
            <div style="background:#ffffff; border:1px solid #fce7f3; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <strong style="font-size:12.5px; color:#831843;">${dataFormatada} ${gota}</strong>
                    <span style="font-size:11px; color:#64748b; font-weight:500;">Humor: ${humorTxt} • Física: ${fisicoTxt}</span>
                </div>
                <button type="button" style="background:#ffe4e6; border:none; color:#e11d48; width:28px; height:28px; border-radius:8px; cursor:pointer;" onclick="window.excluirRegistroSintoma('${reg.id}')">🗑️</button>
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
