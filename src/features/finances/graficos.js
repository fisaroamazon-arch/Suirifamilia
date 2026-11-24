/* Gráficos financeiros com uma legenda legível por toque e por leitor de tela. */
(function () {
    const cores = ['#0d9488', '#6366f1', '#ea580c', '#0284c7', '#db2777', '#65a30d', '#9333ea', '#b45309'];
    const percentual = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
    const realCurto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
    const instancias = new WeakMap();

    function desenhar(canvas, legenda, series, formato) {
        instancias.get(canvas)?.destroy();
        instancias.delete(canvas);
        if (!series.length) {
            canvas.parentElement.hidden = true;
            legenda.innerHTML = '<li class="fin-mensagem">Sem movimentações neste período.</li>';
            return;
        }

        const total = series.reduce((soma, [, valor]) => soma + valor, 0);
        const textoValor = valor => `${Suiri.money(valor / 100)} · ${percentual.format(valor / total)}`;
        const exibidas = series.slice(0, 12);
        if (series.length > exibidas.length) {
            exibidas.push(['Outras categorias', series.slice(exibidas.length).reduce((soma, [, valor]) => soma + valor, 0)]);
        }
        legenda.replaceChildren(...exibidas.map(([rotulo, valor], i) => {
            const linha = document.createElement('li');
            linha.innerHTML = '<span class="fin-marca" aria-hidden="true"></span><span></span><strong></strong>';
            linha.firstElementChild.style.setProperty('--fin-cor', cores[i % cores.length]);
            linha.children[1].textContent = rotulo;
            linha.lastElementChild.textContent = textoValor(valor);
            return linha;
        }));

        canvas.parentElement.hidden = typeof Chart === 'undefined';
        if (canvas.parentElement.hidden) return;
        const pizza = formato === 'pizza';
        const barras = formato === 'barras';
        const escuro = document.documentElement.dataset.theme === 'dark';
        const texto = escuro ? '#d2e0ee' : '#34465b';
        const grade = escuro ? '#30455e' : '#e3ebf2';
        const rotulos = exibidas.map(([nome]) => nome);
        const valores = exibidas.map(([, valor]) => valor);
        const eixoNomes = {
            ticks: {
                color: texto,
                autoSkip: !barras,
                maxRotation: barras ? 0 : 28,
                callback(index) {
                    const nome = rotulos[index] || '';
                    const limite = barras ? 14 : 10;
                    return nome.length > limite ? nome.slice(0, limite - 1) + '…' : nome;
                }
            },
            grid: { display: false }
        };
        const eixoValores = {
            beginAtZero: true,
            ticks: { color: texto, maxTicksLimit: 5, callback: valor => realCurto.format(valor / 100) },
            grid: { color: grade }
        };
        canvas.parentElement.style.setProperty('--fin-canvas-altura', barras ? Math.max(155, 32 * exibidas.length + 40) + 'px' : '240px');
        const grafico = new Chart(canvas.getContext('2d'), {
            type: pizza ? 'doughnut' : 'bar',
            data: {
                labels: rotulos,
                datasets: [{
                    data: valores,
                    backgroundColor: valores.map((_, i) => cores[i % cores.length]),
                    borderColor: escuro ? '#1c3047' : '#fff',
                    borderWidth: pizza ? 2 : 0,
                    borderRadius: pizza ? 3 : 7,
                    maxBarThickness: 44
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 430 },
                ...(pizza ? { cutout: '52%' } : {
                    indexAxis: barras ? 'y' : 'x',
                    scales: { x: barras ? eixoValores : eixoNomes, y: barras ? eixoNomes : eixoValores }
                }),
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: item => textoValor(item.raw) } }
                }
            }
        });
        instancias.set(canvas, grafico);
    }

    Suiri.graficosFinanceiros = { desenhar, obter: canvas => instancias.get(canvas) };
})();
