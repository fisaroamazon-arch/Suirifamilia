(async function () {
    if (window.SuiriAndroid || typeof fetch !== 'function') return;

    const blocos = document.querySelectorAll('[data-suiri-download-android]');
    try {
        const metadados = new URL('./downloads/android.json', document.baseURI);
        const resposta = await fetch(metadados, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!resposta.ok) throw new Error('Download indisponível');
        const { versao } = await resposta.json();
        if (typeof versao !== 'string' || !/^\d+\.\d+\.\d+$/.test(versao)) throw new Error('Versão inválida');

        const arquivo = new URL('./suiri-familia.apk', metadados);
        arquivo.searchParams.set('v', versao);
        for (const bloco of blocos) {
            const link = bloco.querySelector('[data-apk-link]');
            link.href = arquivo.href;
            link.download = 'suiri-familia.apk';
            link.hidden = false;
            bloco.querySelector('[data-apk-status]').textContent = `Versão ${versao}`;
            bloco.hidden = false;
        }
    } catch {
        for (const bloco of blocos) {
            bloco.querySelector('[data-apk-status]').textContent = 'Download para Android temporariamente indisponível.';
            bloco.hidden = false;
        }
    }
})();
