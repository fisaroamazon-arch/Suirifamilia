/* Aparência compartilhada pelo painel e pelo login. */
(function () {
    const chave = 'suiri:v7:aparencia-principal';
    const tema = Suiri.theme;
    const sistema = window.matchMedia?.('(prefers-color-scheme: dark)');

    tema.apply = function () {
        let preferencia = 'automatico';
        try {
            const salva = localStorage.getItem(chave);
            if (salva === 'claro' || salva === 'escuro') preferencia = salva;
        } catch {}
        const escuro = preferencia === 'escuro' || (preferencia === 'automatico' && sistema?.matches);
        const raiz = document.documentElement;
        const esquema = escuro ? 'dark' : 'light';
        const mudou = raiz.dataset.theme !== esquema;
        raiz.dataset.theme = esquema;
        raiz.style.colorScheme = esquema;
        const seletor = document.getElementById('suiri-config-tema');
        if (seletor) seletor.value = preferencia;
        if (mudou) window.renderizarGraficoCategorias?.();
    };

    tema.set = function (preferencia) {
        try {
            if (preferencia === 'claro' || preferencia === 'escuro') localStorage.setItem(chave, preferencia);
            else localStorage.removeItem(chave);
        } catch {
            window.mostrarToast?.('Não foi possível salvar a preferência de tema.', 'erro');
        }
        tema.apply();
    };

    if (sistema?.addEventListener) sistema.addEventListener('change', tema.apply);
    else sistema?.addListener?.(tema.apply);
    tema.apply();
})();
