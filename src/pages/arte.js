(() => {
    'use strict';

    const paginas = [
        ['ursinho', 'Ursinho'], ['gato', 'Gato'], ['raposa', 'Raposa'], ['borboleta', 'Borboleta'],
        ['abelha', 'Abelha'], ['peixe', 'Peixe'], ['tartaruga', 'Tartaruga'], ['baleia', 'Baleia'],
        ['arvore', 'Árvore'], ['flor', 'Flor'], ['casa', 'Casa'], ['foguete', 'Foguete'],
        ['planeta', 'Planeta'], ['robo', 'Robô'], ['dino', 'Dinossauro'], ['caracol', 'Caracol'],
        ['sorvete', 'Sorvete'], ['barco', 'Barco'], ['castelo', 'Castelo'], ['arco-iris', 'Arco-íris']
    ];
    const obter = id => document.getElementById(id);
    const papel = obter('papel');
    const tamanho = papel.width;
    const exibicao = papel.getContext('2d');
    const camada = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = tamanho;
        return canvas.getContext('2d', {willReadFrequently: true});
    };
    const tinta = camada();
    const rascunho = camada();
    const aviso = obter('arte-aviso');
    const desfazer = obter('desfazer');
    const refazer = obter('refazer');
    const anteriores = [];
    const posteriores = [];
    const limiteHistorico = 10;
    let modelo = null;
    let pincel = 'pincel';
    let cor = obter('cor-livre').value;
    let traco = null;
    let revisaoModelo = 0;
    let quadro = 0;

    function desenhar() {
        cancelAnimationFrame(quadro);
        quadro = 0;
        exibicao.fillStyle = '#ffffff';
        exibicao.fillRect(0, 0, tamanho, tamanho);
        if (modelo && !modelo.contorno) exibicao.drawImage(modelo.imagem, 0, 0);
        exibicao.drawImage(tinta.canvas, 0, 0);
        if (traco && traco.pincel !== 'borracha') {
            exibicao.globalAlpha = traco.pincel === 'marca' ? .38 : 1;
            exibicao.drawImage(rascunho.canvas, 0, 0);
            exibicao.globalAlpha = 1;
        }
        if (modelo?.contorno) {
            exibicao.globalCompositeOperation = 'multiply';
            exibicao.drawImage(modelo.imagem, 0, 0, tamanho, tamanho);
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
        return {modelo, tinta: tinta.getImageData(0, 0, tamanho, tamanho)};
    }

    function registrar(estado) {
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
        const estado = origem.pop();
        modelo = estado.modelo;
        tinta.putImageData(estado.tinta, 0, 0);
        aviso.textContent = '';
        desenhar();
        atualizarHistorico();
    }

    function trocarModelo(novoModelo) {
        finalizarTraco();
        const anterior = estadoAtual();
        modelo = novoModelo;
        tinta.clearRect(0, 0, tamanho, tamanho);
        registrar(anterior);
        desenhar();
    }

    function ponto(evento) {
        const caixa = papel.getBoundingClientRect();
        return {
            x: (evento.clientX - caixa.left) * tamanho / caixa.width,
            y: (evento.clientY - caixa.top) * tamanho / caixa.height
        };
    }

    function pintarCerdas(ctx, inicio, fim, largura) {
        const dx = fim.x - inicio.x;
        const dy = fim.y - inicio.y;
        const distancia = Math.hypot(dx, dy);
        const lateralX = distancia ? -dy / distancia : .6;
        const lateralY = distancia ? dx / distancia : .8;
        const cerdas = Math.max(4, Math.ceil(largura / 2));
        ctx.lineCap = 'round';
        for (let i = 0; i < cerdas; i++) {
            const afastamento = (i / (cerdas - 1) - .5) * largura * .93;
            const x = afastamento * lateralX;
            const y = afastamento * lateralY;
            const centro = 1 - Math.abs(2 * i / (cerdas - 1) - 1);
            ctx.lineWidth = Math.max(.75, largura / cerdas * .9);
            ctx.globalAlpha = (.22 + .55 * centro) * (i % 3 === 0 ? .62 : 1);
            ctx.beginPath();
            if (distancia) {
                ctx.moveTo(inicio.x + x, inicio.y + y);
                ctx.lineTo(fim.x + x, fim.y + y);
                ctx.stroke();
            } else {
                ctx.arc(fim.x + x, fim.y + y, ctx.lineWidth, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function pintarSegmento(inicio, fim) {
        const {pincel: tipo, cor: pigmento, largura} = traco;
        const camadaAlvo = tipo === 'borracha' ? tinta : rascunho;
        camadaAlvo.save();
        camadaAlvo.globalCompositeOperation = tipo === 'borracha' ? 'destination-out' : 'source-over';
        camadaAlvo.fillStyle = camadaAlvo.strokeStyle = pigmento;
        if (tipo === 'pincel') {
            pintarCerdas(camadaAlvo, inicio, fim, largura);
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
            const larguraReal = tipo === 'lapis' ? largura * .38 : largura;
            camadaAlvo.lineCap = camadaAlvo.lineJoin = 'round';
            camadaAlvo.lineWidth = larguraReal;
            camadaAlvo.beginPath();
            if (inicio.x === fim.x && inicio.y === fim.y) {
                camadaAlvo.arc(fim.x, fim.y, larguraReal / 2, 0, Math.PI * 2);
                camadaAlvo.fill();
            } else {
                camadaAlvo.moveTo(inicio.x, inicio.y);
                camadaAlvo.lineTo(fim.x, fim.y);
                camadaAlvo.stroke();
            }
        }
        camadaAlvo.restore();
        if (!quadro) quadro = requestAnimationFrame(desenhar);
    }

    function finalizarTraco() {
        if (!traco) return;
        const feito = traco;
        if (feito.pincel !== 'borracha') {
            tinta.globalAlpha = feito.pincel === 'marca' ? .38 : 1;
            tinta.drawImage(rascunho.canvas, 0, 0);
            tinta.globalAlpha = 1;
        }
        traco = null;
        rascunho.clearRect(0, 0, tamanho, tamanho);
        registrar(feito.antes);
        desenhar();
    }

    papel.addEventListener('pointerdown', evento => {
        if (traco || evento.button !== 0) return;
        papel.setPointerCapture(evento.pointerId);
        const local = ponto(evento);
        traco = {
            id: evento.pointerId, anterior: local, pincel, cor,
            largura: Number(obter('espessura').value),
            antes: estadoAtual()
        };
        pintarSegmento(local, local);
    });
    papel.addEventListener('pointermove', evento => {
        if (evento.pointerId !== traco?.id) return;
        const eventos = evento.getCoalescedEvents?.() || [];
        for (const amostra of eventos.length ? eventos : [evento]) {
            const local = ponto(amostra);
            pintarSegmento(traco.anterior, local);
            traco.anterior = local;
        }
    });
    papel.addEventListener('pointerup', evento => {
        if (evento.pointerId !== traco?.id) return;
        const local = ponto(evento);
        if (local.x !== traco.anterior.x || local.y !== traco.anterior.y) pintarSegmento(traco.anterior, local);
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
    }
    document.querySelectorAll('[data-cor]').forEach(botao => {
        botao.addEventListener('click', () => selecionarCor(botao.dataset.cor));
    });
    obter('cor-livre').addEventListener('input', evento => selecionarCor(evento.target.value));

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
                const contexto = camada();
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
            obter('folha').scrollIntoView({block: 'nearest'});
        } catch {
            if (revisao === revisaoModelo) aviso.textContent = 'Não foi possível abrir a imagem. Experimente outro arquivo.';
        }
    }

    for (const [id, nome] of paginas) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'pagina';
        botao.dataset.pagina = id;
        botao.setAttribute('aria-pressed', 'false');
        const miniatura = document.createElement('img');
        miniatura.alt = '';
        miniatura.loading = 'lazy';
        miniatura.src = 'assets/images/arte/' + id + '.svg';
        const titulo = document.createElement('span');
        titulo.textContent = nome;
        botao.append(miniatura, titulo);
        botao.addEventListener('click', () => carregarModelo(id, nome, miniatura.src, true));
        obter('paginas').append(botao);
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

    desenhar();
})();
