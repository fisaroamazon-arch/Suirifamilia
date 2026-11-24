/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.verificarGatilhoPenseSeteManha = function() { window.Suiri?.Pense?.agendar(); };

// =========================================================================
// 19. DATAS INICIAIS DO BALANÇO EM FINANÇAS
// =========================================================================

const navegarOriginal = window.navegarParaTela;
window.navegarParaTela = function(nomeTela) {
    if (typeof navegarOriginal === 'function') {
        navegarOriginal(nomeTela);
    }

    if (nomeTela === 'financeiro') {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');

        const dtInicio = `${ano}-${mes}-01`;
        const dtFim = `${ano}-${mes}-${dia}`;

        const inInicio = document.getElementById('data-inicio');
        const inFim = document.getElementById('data-fim');

        if (inInicio && !inInicio.value) inInicio.value = dtInicio;
        if (inFim && !inFim.value) inFim.value = dtFim;
    }
};

// =========================================================================
// 20. INICIALIZAÇÃO AUTOMÁTICA SEGURA DO SWIPE & LISTENERS
// =========================================================================

window.inicializarNavegacaoSwipe();

document.addEventListener("DOMContentLoaded", () => {
    window.inicializarNavegacaoSwipe();
    if (window.familiaAtualId) {
        window.carregarCofresCompartilhados();
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') {
        window.verificarGatilhoPenseSeteManha();
        if (window.familiaAtualId) window.atualizarNotificacoesGeraisPainel();
    }
});
