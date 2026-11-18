/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.inicializarNavegacaoSwipe = function() {
    if (window._swipeJaInicializado) return;
    window._swipeJaInicializado = true;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const telasOrdem = ['meuespaco', 'inicio', 'mercado', 'financeiro', 'calendario', 'familia'];

    window.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 50) {
            return;
        }

        const elementoFocado = document.activeElement;
        if (elementoFocado && (elementoFocado.tagName === 'INPUT' || elementoFocado.tagName === 'TEXTAREA' || elementoFocado.tagName === 'SELECT')) {
            return;
        }

        const algumModalAberto = document.querySelector('.modal-overlay:not(.oculto)');
        if (algumModalAberto) return;

        if (window.modoKidsAtivo) return;

        let telaAtual = window.telaAtualVisivel;
        if (!telaAtual) {
            const abaAtivaNav = document.querySelector('.bottom-nav-item.ativo');
            telaAtual = abaAtivaNav ? abaAtivaNav.getAttribute('data-tela') : 'inicio';
        }

        const indexAtual = telasOrdem.indexOf(telaAtual);
        if (indexAtual === -1) return;

        if (deltaX < 0) {
            const proximoIndex = (indexAtual + 1) % telasOrdem.length;
            if (typeof window.navegarParaTela === 'function') {
                window.navegarParaTela(telasOrdem[proximoIndex]);
            }
        } else {
            const anteriorIndex = (indexAtual - 1 + telasOrdem.length) % telasOrdem.length;
            if (typeof window.navegarParaTela === 'function') {
                window.navegarParaTela(telasOrdem[anteriorIndex]);
            }
        }
    }, { passive: true });
};

// =========================================================================
// 7. CRIAÇÃO DE MISSÕES E REATIVAÇÃO
// =========================================================================

