(async function () {
    if (window.SuiriAndroid || typeof fetch !== 'function') return;

    const repositorio = 'https://github.com/fisaroamazon-arch/Suirifamilia/releases';
    const blocos = Array.from(document.querySelectorAll('[data-suiri-download-android]'));
    try {
        const resposta = await fetch('https://api.github.com/repos/fisaroamazon-arch/Suirifamilia/releases?per_page=10', {
            signal: AbortSignal.timeout(8000)
        });
        if (!resposta.ok) throw new Error('Releases temporariamente indisponíveis');
        const releases = await resposta.json();
        const maisRecente = releases
            .filter(release => !release.draft && !release.prerelease)
            .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
            .map(release => ({
                versao: release.tag_name.replace(/^android-/, ''),
                apk: release.assets.find(asset => asset.name === 'suiri-familia.apk'
                    && asset.state === 'uploaded'
                    && asset.browser_download_url?.startsWith(repositorio + '/download/'))
            }))
            .find(release => release.apk);

        for (const bloco of blocos) {
            const status = bloco.querySelector('[data-apk-status]');
            if (maisRecente) {
                const link = bloco.querySelector('[data-apk-link]');
                link.href = maisRecente.apk.browser_download_url;
                link.hidden = false;
                status.textContent = `Versão ${maisRecente.versao}`;
            } else {
                status.textContent = 'APK oficial para Android em preparação.';
            }
            bloco.hidden = false;
        }
    } catch {
        for (const bloco of blocos) {
            const link = bloco.querySelector('[data-apk-link]');
            link.href = repositorio;
            link.textContent = 'Ver versões para Android';
            link.hidden = false;
            bloco.hidden = false;
        }
    }
})();
