/* Preferência do painel principal. Os espaços Homem e Mulher têm seus próprios estilos. */
(function () {
    const chave = 'suiri:v7:tema-principal';
    const tema = Suiri.theme;

    tema.apply = function () {
        let escuro = false;
        try {
            escuro = localStorage.getItem(chave) === 'escuro';
        } catch {}
        const raiz = document.documentElement;
        raiz.dataset.theme = escuro ? 'dark' : 'light';
        raiz.style.colorScheme = escuro ? 'dark' : 'light';
        const seletor = document.getElementById('suiri-config-tema');
        if (seletor) seletor.value = escuro ? 'escuro' : 'claro';
        window.renderizarGraficoCategorias?.();
    };

    tema.set = function (preferencia) {
        try {
            localStorage.setItem(chave, preferencia === 'escuro' ? 'escuro' : 'claro');
        } catch {
            window.mostrarToast?.('Não foi possível salvar a preferência de tema.', 'erro');
        }
        tema.apply();
    };

    tema.apply();
})();
