(() => {
    'use strict';

    const obter = id => document.getElementById(id);
    const papel = obter('papel');
    const tamanho = 640;
    const exibicao = papel.getContext('2d');
    const camada = (largura, altura) => {
        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;
        return canvas.getContext('2d', {willReadFrequently: true});
    };
    const tinta = camada(papel.width, papel.height);
    const rascunho = camada(papel.width, papel.height);
    const ferramentas = obter('ferramentas-arte');
    const botaoFerramentas = obter('abrir-ferramentas');
    const botaoFullscreen = obter('tela-cheia-arte');
    const { niveis, renderizar } = window.SuiriDesenhosArte;
    let nivel = 'facil';
    const aviso = obter('arte-aviso');
    const desfazer = obter('desfazer');
    const refazer = obter('refazer');
    const espessura = obter('espessura');
    const previa = document.querySelector('.previa-pincel');
    const anteriores = [];
    const posteriores = [];
    const limiteHistorico = 10;
    let modelo = null;
    let pincel = 'pincel';
    let cor = obter('cor-livre').value;
    let traco = null;
    let revisaoModelo = 0;
    let quadro = 0;
    let antesDeRedimensionar = null;
    let pontaCerdas;
    let corDaPonta;
    const opacidadeDoTraco = {marca: .38, cerdas: .61};

    function fatorDeEncaixe(origem, destino) {
        return Math.min(destino.width / origem.width, destino.height / origem.height);
    }

    function centralizar(ctx, imagem, escala = 1) {
        const fator = fatorDeEncaixe(imagem, ctx.canvas) * escala;
        const largura = imagem.width * fator;
        const altura = imagem.height * fator;
        ctx.drawImage(imagem, (ctx.canvas.width - largura) / 2, (ctx.canvas.height - altura) / 2, largura, altura);
    }

    function restaurarEstado(estado) {
        const origem = estado.tinta;
        const ajuste = fatorDeEncaixe(origem, papel);
        tinta.clearRect(0, 0, papel.width, papel.height);
        if (origem.width === papel.width && origem.height === papel.height) {
            tinta.putImageData(origem, 0, 0);
            modelo = estado.modelo;
            return;
        }
        const original = camada(origem.width, origem.height);
        original.putImageData(origem, 0, 0);
        centralizar(tinta, original.canvas);
        // A tinta e o modelo usam a mesma transformação, inclusive ao restaurar o histórico.
        modelo = estado.modelo;
        if (modelo) {
            const antes = fatorDeEncaixe(modelo.imagem, origem);
            const depois = fatorDeEncaixe(modelo.imagem, papel);
            modelo = {...modelo, escala: (modelo.escala ?? 1) * antes * ajuste / depois};
        }
    }

    function ajustarPapel() {
        const area = papel.getBoundingClientRect();
        if (!area.width || !area.height) return;
        const escala = 1000 / Math.max(area.width, area.height);
        const largura = Math.round(area.width * escala);
        const altura = Math.round(area.height * escala);
        if (papel.width === largura && papel.height === altura) return;
        finalizarTraco();
        antesDeRedimensionar ||= estadoAtual();
        papel.width = tinta.canvas.width = rascunho.canvas.width = largura;
        papel.height = tinta.canvas.height = rascunho.canvas.height = altura;
        restaurarEstado(antesDeRedimensionar);
        desenhar();
    }

    function desenhar() {
        cancelAnimationFrame(quadro);
        quadro = 0;
        exibicao.fillStyle = '#ffffff';
        exibicao.fillRect(0, 0, papel.width, papel.height);
        if (modelo && !modelo.contorno) centralizar(exibicao, modelo.imagem, modelo.escala);
        exibicao.drawImage(tinta.canvas, 0, 0);
        if (traco && traco.pincel !== 'borracha') {
            exibicao.globalAlpha = opacidadeDoTraco[traco.pincel] ?? 1;
            exibicao.drawImage(rascunho.canvas, 0, 0);
            exibicao.globalAlpha = 1;
        }
        if (modelo?.contorno) {
            exibicao.globalCompositeOperation = 'multiply';
            centralizar(exibicao, modelo.imagem, modelo.escala);
            exibicao.globalCompositeOperation = 'source-over';
        }
    }

    function atualizarHistorico() {
        desfazer.disabled = anteriores.length === 0;
        refazer.disabled = posteriores.length === 0;
        obter('paginas').querySelectorAll('[data-pagina]').forEach(botao => {
            botao.setAttribute('aria-pressed', String(botao.dataset.pagina === modelo?.id));
        });
    }

    function estadoAtual() {
        return {modelo, tinta: tinta.getImageData(0, 0, papel.width, papel.height)};
    }

    function registrar(estado) {
        antesDeRedimensionar = null;
        anteriores.push(estado);
        if (anteriores.length > limiteHistorico) anteriores.shift();
        posteriores.length = 0;
        atualizarHistorico();
    }

    function andarHistorico(origem, destino) {
        finalizarTraco();
        if (!origem.length) return;
        revisaoModelo++;
        destino.push(estadoAtual());
        antesDeRedimensionar = null;
        restaurarEstado(origem.pop());
        aviso.textContent = '';
        desenhar();
        atualizarHistorico();
    }

    function trocarModelo(novoModelo) {
        finalizarTraco();
        const anterior = estadoAtual();
        modelo = novoModelo;
        tinta.clearRect(0, 0, papel.width, papel.height);
        registrar(anterior);
        desenhar();
    }

    function ponto(evento, caixa) {
        return {
            x: (evento.clientX - caixa.left) * papel.width / caixa.width,
            y: (evento.clientY - caixa.top) * papel.height / caixa.height,
            pressao: evento.pointerType === 'pen' ? evento.pressure : .59
        };
    }

    function meio(a, b) {
        return {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, pressao: (a.pressao + b.pressao) / 2};
    }

    function pintarPincel(ctx, inicio, fim, controle, largura) {
        const medida = ponto => largura * (.44 + .95 * ponto.pressao);
        const caminho = Math.hypot(controle.x - inicio.x, controle.y - inicio.y)
            + Math.hypot(fim.x - controle.x, fim.y - controle.y);
        const passos = Math.max(1, Math.ceil(caminho / Math.max(.6, Math.min(medida(inicio), medida(fim)) * .18)));
        ctx.beginPath();
        for (let i = 0; i <= passos; i++) {
            const t = i / passos;
            const oposto = 1 - t;
            const x = oposto ** 2 * inicio.x + 2 * t * oposto * controle.x + t ** 2 * fim.x;
            const y = oposto ** 2 * inicio.y + 2 * t * oposto * controle.y + t ** 2 * fim.y;
            const raio = (medida(inicio) * oposto + medida(fim) * t) / 2;
            ctx.moveTo(x + raio, y);
            ctx.arc(x, y, raio, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    function obterPontaCerdas(pigmento) {
        if (corDaPonta === pigmento) return pontaCerdas;
        const lado = 80;
        const ponta = camada(lado, lado);
        const imagem = ponta.createImageData(lado, lado);
        const rgb = Number.parseInt(pigmento.slice(1), 16);
        for (let y = 0; y < lado; y++) {
            for (let x = 0; x < lado; x++) {
                const dx = (x + .5) * 2 / lado - 1;
                const dy = (y + .5) * 2 / lado - 1;
                const angulo = Math.atan2(dy, dx);
                const ruido = ((Math.imul(x + 23, 21373) ^ Math.imul(y + 19, 8831)) & 255) / 255;
                const raio = Math.hypot(dx, dy) + .04 * Math.sin(angulo * 13) + .08 * (ruido - .5);
                const borda = Math.min(1, Math.max(0, (1 - raio) / .55));
                const suavidade = borda * borda * (3 - 2 * borda);
                const fibra = .91 + .09 * Math.sin(dx * 37 + dy * 3);
                const i = (y * lado + x) * 4;
                imagem.data[i] = rgb >> 16;
                imagem.data[i + 1] = (rgb >> 8) & 255;
                imagem.data[i + 2] = rgb & 255;
                imagem.data[i + 3] = 255 * suavidade * fibra * (.78 + .22 * ruido);
            }
        }
        ponta.putImageData(imagem, 0, 0);
        corDaPonta = pigmento;
        pontaCerdas = ponta.canvas;
        return pontaCerdas;
    }

    function pintarCerdas(ctx, inicio, fim, controle, largura) {
        const dx = fim.x - inicio.x;
        const dy = fim.y - inicio.y;
        const distancia = Math.hypot(dx, dy);
        const intervalo = Math.max(.7, largura * .13);
        const ponta = obterPontaCerdas(traco.cor);
        let percurso = traco.proximoDeposito;
        ctx.globalAlpha = distancia ? .48 : .71;
        for (; percurso <= distancia; percurso += intervalo) {
            const t = distancia ? percurso / distancia : 0;
            const q = 1 - t;
            const x = q * q * inicio.x + 2 * q * t * controle.x + t * t * fim.x;
            const y = q * q * inicio.y + 2 * q * t * controle.y + t * t * fim.y;
            const pressao = inicio.pressao + (fim.pressao - inicio.pressao) * t;
            const comprimento = traco.comprimento + percurso;
            const abertura = .7 + .3 * Math.min(1, comprimento / (largura * .65));
            const diametro = largura * (.43 + 1.02 * pressao) * abertura;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.atan2(dy, dx) + .22 * Math.sin(comprimento / 13));
            ctx.drawImage(ponta, -diametro * .55, -diametro * .5, diametro * 1.1, diametro);
            ctx.restore();
        }
        traco.proximoDeposito = percurso - distancia;
    }

    function pintarGiz(ctx, inicio, fim, largura) {
        const distancia = Math.hypot(fim.x - inicio.x, fim.y - inicio.y);
        const etapas = Math.max(1, Math.ceil(distancia / 2.2));
        const raio = Math.max(1.2, largura * .38);
        const graos = Math.min(85, 8 + Math.ceil(raio * 4));
        for (let passo = 0; passo <= etapas; passo++) {
            const t = passo / etapas;
            const x = inicio.x + (fim.x - inicio.x) * t;
            const y = inicio.y + (fim.y - inicio.y) * t;
            for (let i = 0; i < graos; i++) {
                const angulo = Math.random() * 2 * Math.PI;
                const distanciaGrao = raio * Math.sqrt(Math.random());
                const lado = Math.random() * 1.5 + .65;
                ctx.globalAlpha = .18 + .46 * Math.random();
                ctx.fillRect(x + Math.cos(angulo) * distanciaGrao, y + Math.sin(angulo) * distanciaGrao, lado, lado);
            }
        }
    }

    function pintarSegmento(inicio, fim, controle = meio(inicio, fim)) {
        const {pincel: tipo, cor: pigmento, largura} = traco;
        const camadaAlvo = tipo === 'borracha' ? tinta : rascunho;
        camadaAlvo.save();
        camadaAlvo.globalCompositeOperation = tipo === 'borracha' ? 'destination-out' : 'source-over';
        camadaAlvo.fillStyle = camadaAlvo.strokeStyle = pigmento;
        if (tipo === 'pincel') {
            pintarPincel(camadaAlvo, inicio, fim, controle, largura);
        } else if (tipo === 'cerdas') {
            pintarCerdas(camadaAlvo, inicio, fim, controle, largura);
        } else if (tipo === 'giz') {
            pintarGiz(camadaAlvo, inicio, fim, largura);
        } else if (tipo === 'spray') {
            const distancia = Math.hypot(fim.x - inicio.x, fim.y - inicio.y);
            const etapas = Math.max(1, Math.ceil(distancia / Math.max(3, largura / 6)));
            camadaAlvo.globalAlpha = .55;
            for (let etapa = 1; etapa <= etapas; etapa++) {
                const posicao = etapa / etapas;
                const x = inicio.x + (fim.x - inicio.x) * posicao;
                const y = inicio.y + (fim.y - inicio.y) * posicao;
                for (let i = 0; i < 11; i++) {
                    const angulo = Math.random() * Math.PI * 2;
                    const raio = Math.sqrt(Math.random()) * largura * .72;
                    camadaAlvo.beginPath();
                    camadaAlvo.arc(x + Math.cos(angulo) * raio, y + Math.sin(angulo) * raio, 1, 0, Math.PI * 2);
                    camadaAlvo.fill();
                }
            }
        } else {
            const larguraReal = largura;
            camadaAlvo.lineCap = camadaAlvo.lineJoin = 'round';
            camadaAlvo.lineWidth = larguraReal;
            camadaAlvo.beginPath();
            if (inicio.x === fim.x && inicio.y === fim.y) {
                camadaAlvo.arc(fim.x, fim.y, larguraReal / 2, 0, Math.PI * 2);
                camadaAlvo.fill();
            } else {
                camadaAlvo.moveTo(inicio.x, inicio.y);
                camadaAlvo.quadraticCurveTo(controle.x, controle.y, fim.x, fim.y);
                camadaAlvo.stroke();
            }
        }
        camadaAlvo.restore();
        traco.comprimento += Math.hypot(fim.x - inicio.x, fim.y - inicio.y);
        if (!quadro) quadro = requestAnimationFrame(desenhar);
    }

    function consumirPonto(local) {
        const anterior = traco.anterior;
        if (local.x === anterior.x && local.y === anterior.y) return;
        const suavizado = meio(anterior, local);
        pintarSegmento(traco.extremo, suavizado, anterior);
        traco.extremo = suavizado;
        traco.anterior = local;
    }

    function finalizarTraco() {
        if (!traco) return;
        const feito = traco;
        if (feito.extremo !== feito.anterior) pintarSegmento(feito.extremo, feito.anterior, feito.anterior);
        if (feito.pincel !== 'borracha') {
            tinta.globalAlpha = opacidadeDoTraco[feito.pincel] ?? 1;
            tinta.drawImage(rascunho.canvas, 0, 0);
            tinta.globalAlpha = 1;
        }
        traco = null;
        rascunho.clearRect(0, 0, papel.width, papel.height);
        registrar(feito.antes);
        desenhar();
    }

    papel.addEventListener('pointerdown', evento => {
        if (traco || evento.button !== 0) return;
        papel.setPointerCapture(evento.pointerId);
        const local = ponto(evento, papel.getBoundingClientRect());
        traco = {
            id: evento.pointerId, anterior: local, extremo: local, pincel, cor, comprimento: 0, proximoDeposito: 0,
            largura: Number(espessura.value),
            antes: estadoAtual()
        };
        pintarSegmento(local, local);
    });
    papel.addEventListener('pointermove', evento => {
        if (evento.pointerId !== traco?.id) return;
        const eventos = evento.getCoalescedEvents?.() || [];
        const caixa = papel.getBoundingClientRect();
        for (const amostra of eventos.length ? eventos : [evento]) {
            consumirPonto(ponto(amostra, caixa));
        }
    });
    papel.addEventListener('pointerup', evento => {
        if (evento.pointerId !== traco?.id) return;
        const local = ponto(evento, papel.getBoundingClientRect());
        consumirPonto({...local, pressao: traco.anterior.pressao});
        finalizarTraco();
    });
    for (const nome of ['pointercancel', 'lostpointercapture']) {
        papel.addEventListener(nome, evento => {
            if (evento.pointerId === traco?.id) finalizarTraco();
        });
    }

    function selecionarPincel(novo) {
        pincel = novo;
        document.querySelectorAll('[data-pincel]').forEach(botao => {
            botao.setAttribute('aria-pressed', String(botao.dataset.pincel === novo));
        });
        atualizarPrevia();
    }

    function atualizarPrevia() {
        const largura = Number(espessura.value);
        previa.style.setProperty('--previa-tamanho', `${Math.max(2, largura * (pincel === 'giz' ? .3 : .36))}px`);
        previa.style.setProperty('--previa-cor', pincel === 'borracha' ? '#fff' : cor);
        previa.dataset.ferramenta = pincel;
        botaoFerramentas.style.setProperty('--cor-ativa', pincel === 'borracha' ? '#fff' : cor);
        espessura.setAttribute('aria-valuetext', `${largura} pixels`);
    }

    document.querySelectorAll('[data-pincel]').forEach(botao => {
        botao.addEventListener('click', () => selecionarPincel(botao.dataset.pincel));
    });
    function selecionarCor(nova) {
        cor = nova;
        obter('cor-livre').value = nova;
        document.querySelectorAll('[data-cor]').forEach(botao => {
            botao.setAttribute('aria-pressed', String(botao.dataset.cor === nova));
        });
        document.querySelector('.personalizada').style.backgroundColor = nova;
        if (pincel === 'borracha') selecionarPincel('pincel');
        atualizarPrevia();
    }
    document.querySelectorAll('[data-cor]').forEach(botao => {
        botao.addEventListener('click', () => selecionarCor(botao.dataset.cor));
    });
    obter('cor-livre').addEventListener('input', evento => selecionarCor(evento.target.value));
    espessura.addEventListener('input', atualizarPrevia);

    desfazer.addEventListener('click', () => andarHistorico(anteriores, posteriores));
    refazer.addEventListener('click', () => andarHistorico(posteriores, anteriores));
    obter('folha-nova').addEventListener('click', () => {
        revisaoModelo++;
        trocarModelo(null);
        aviso.textContent = '';
    });

    function carregarImagem(url) {
        return new Promise((resolve, rejeitar) => {
            const imagem = new Image();
            imagem.onload = () => resolve(imagem);
            imagem.onerror = rejeitar;
            imagem.src = url;
        });
    }

    function converterEmContorno(ctx) {
        const imagem = ctx.getImageData(0, 0, tamanho, tamanho);
        const pixels = imagem.data;
        const cinza = new Float32Array(tamanho * tamanho);
        for (let i = 0; i < cinza.length; i++) {
            const j = i * 4;
            cinza[i] = .2126 * pixels[j] + .7152 * pixels[j + 1] + .0722 * pixels[j + 2];
        }
        const suave = cinza.slice();
        for (let y = 1; y < tamanho - 1; y++) {
            for (let x = 1; x < tamanho - 1; x++) {
                const i = y * tamanho + x;
                suave[i] = (4 * cinza[i] +
                    2 * (cinza[i - 1] + cinza[i + 1] + cinza[i - tamanho] + cinza[i + tamanho]) +
                    cinza[i - tamanho - 1] + cinza[i - tamanho + 1] +
                    cinza[i + tamanho - 1] + cinza[i + tamanho + 1]) / 16;
            }
        }
        pixels.fill(255);
        for (let y = 2; y < tamanho - 2; y++) {
            for (let x = 2; x < tamanho - 2; x++) {
                const i = y * tamanho + x;
                const acima = i - tamanho;
                const abaixo = i + tamanho;
                const dx = suave[acima + 1] + 2 * suave[i + 1] + suave[abaixo + 1]
                    - suave[acima - 1] - 2 * suave[i - 1] - suave[abaixo - 1];
                const dy = suave[abaixo - 1] + 2 * suave[abaixo] + suave[abaixo + 1]
                    - suave[acima - 1] - 2 * suave[acima] - suave[acima + 1];
                const forca = Math.sqrt(dx * dx + dy * dy);
                const tom = 255 - Math.min(228, Math.max(0, (forca - 48) * 2.3));
                pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = tom;
            }
        }
        ctx.putImageData(imagem, 0, 0);
    }

    async function carregarModelo(id, nome, url, contorno, converter = false) {
        const revisao = ++revisaoModelo;
        aviso.textContent = converter ? 'Traçando contornos da foto…' : 'Carregando imagem…';
        try {
            const imagem = await carregarImagem(url);
            if (revisao !== revisaoModelo) return;
            let fundo = imagem;
            if (!contorno || converter) {
                const escala = Math.min(tamanho / imagem.naturalWidth, tamanho / imagem.naturalHeight);
                const largura = imagem.naturalWidth * escala;
                const altura = imagem.naturalHeight * escala;
                const contexto = camada(tamanho, tamanho);
                if (converter) {
                    contexto.fillStyle = '#fff';
                    contexto.fillRect(0, 0, tamanho, tamanho);
                }
                contexto.drawImage(imagem, (tamanho - largura) / 2, (tamanho - altura) / 2, largura, altura);
                if (converter) converterEmContorno(contexto);
                fundo = contexto.canvas;
            }
            trocarModelo({id, imagem: fundo, contorno});
            aviso.textContent = nome + ' está na folha.';
            ferramentas.close();
        } catch {
            if (revisao === revisaoModelo) aviso.textContent = 'Não foi possível abrir a imagem. Experimente outro arquivo.';
        }
    }

    function mostrarPaginas() {
        const fragmento = document.createDocumentFragment();
        for (const [id, nome] of niveis[nivel]) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'pagina';
            botao.dataset.pagina = id;
            botao.setAttribute('aria-pressed', String(id === modelo?.id));
            const miniatura = document.createElement('img');
            miniatura.alt = '';
            miniatura.loading = 'lazy';
            const nivelPagina = nivel;
            miniatura.src = nivelPagina === 'facil' ? 'assets/images/arte/' + id + '.svg'
                : renderizar(nivelPagina, id, 120).toDataURL();
            const titulo = document.createElement('span');
            titulo.textContent = nome;
            botao.append(miniatura, titulo);
            botao.addEventListener('click', () => {
                const url = nivelPagina === 'facil' ? miniatura.src : renderizar(nivelPagina, id, tamanho).toDataURL();
                carregarModelo(id, nome, url, true);
            });
            fragmento.append(botao);
        }
        obter('paginas').replaceChildren(fragmento);
    }

    const botoesNivel = document.querySelectorAll('[data-arte-nivel]');
    botoesNivel.forEach(botao => botao.addEventListener('click', () => {
        nivel = botao.dataset.arteNivel;
        botoesNivel.forEach(outro => outro.setAttribute('aria-pressed', String(outro === botao)));
        mostrarPaginas();
    }));
    botaoFerramentas.addEventListener('click', () => {
        ferramentas.showModal();
        ferramentas.scrollTop = 0;
    });
    obter('fechar-ferramentas').addEventListener('click', () => ferramentas.close());
    ferramentas.addEventListener('click', evento => {
        if (evento.target !== ferramentas) return;
        const limite = ferramentas.getBoundingClientRect();
        if (evento.clientX < limite.left || evento.clientX > limite.right ||
            evento.clientY < limite.top || evento.clientY > limite.bottom) ferramentas.close();
    });
    const cabecalho = ferramentas.querySelector('header');
    let gesto;
    cabecalho.addEventListener('pointerdown', evento => { gesto = {x: evento.clientX, y: evento.clientY}; });
    cabecalho.addEventListener('pointerup', evento => {
        if (gesto && evento.clientY - gesto.y > 45 && Math.abs(evento.clientX - gesto.x) < 55) ferramentas.close();
        gesto = null;
    });
    cabecalho.addEventListener('pointercancel', () => { gesto = null; });
    if (document.fullscreenEnabled) {
        botaoFullscreen.hidden = false;
        botaoFullscreen.addEventListener('click', async () => {
            ferramentas.close();
            try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await document.documentElement.requestFullscreen();
            } catch {
                aviso.textContent = 'O navegador manteve a visualização padrão.';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            botaoFullscreen.textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Entrar em tela cheia';
        });
    }

    async function importarImagem(evento, converter) {
        const arquivo = evento.target.files[0];
        evento.target.value = '';
        if (!arquivo) return;
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(arquivo.type) || arquivo.size > 20 * 1024 * 1024) {
            aviso.textContent = 'Escolha uma imagem PNG, JPG, WebP ou GIF de até 20 MB.';
            return;
        }
        const url = URL.createObjectURL(arquivo);
        try {
            await carregarModelo(null, converter ? 'O contorno da foto' : 'Sua imagem', url, converter, converter);
        } finally {
            URL.revokeObjectURL(url);
        }
    }
    obter('imagem-arte').addEventListener('change', evento => importarImagem(evento, false));
    obter('foto-contorno-arte').addEventListener('change', evento => importarImagem(evento, true));

    obter('baixar-arte').addEventListener('click', () => {
        finalizarTraco();
        desenhar();
        if (navigator.userAgent.includes('SuiriFamiliaImagem/1')) {
            window.SuiriPdfAndroid = papel.toDataURL('image/png').split(',')[1];
            location.href = 'suiri-native://save-drawing';
            return;
        }
        papel.toBlob(arquivo => {
            if (!arquivo) {
                aviso.textContent = 'Não foi possível salvar a imagem.';
                return;
            }
            const url = URL.createObjectURL(arquivo);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'meu-desenho-suiri.png';
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }, 'image/png');
    });

    mostrarPaginas();
    atualizarPrevia();
    ajustarPapel();
    new ResizeObserver(ajustarPapel).observe(obter('folha'));
})();
