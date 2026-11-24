/* Reprodução visual com cópias dos controles. A tela de exemplo nunca executa os cliques do aplicativo. */
(() => {
    const janela = document.getElementById('modal-tour-instrucoes');
    if (!janela) return;

    const campo = id => document.getElementById(id);
    const tela = campo('tour-tela');
    const guia = campo('tour-guia');
    const cursor = campo('tour-toque');
    const indice = campo('tour-indice');
    const proximo = campo('btn-tour-proximo');
    const anterior = campo('btn-tour-anterior');
    const narrar = campo('tour-narrar');
    const movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)');
    const nativo = navigator.userAgent.includes('SuiriFamiliaVoz/1') && typeof window.SuiriAndroid === 'function';
    const etapas = window.SuiriRoteiroManual;
    const urlBase = new URL('./', location.href);
    const paginas = new Map();

    function copiar(elemento) {
        const copia = elemento.cloneNode(true);
        copia.querySelectorAll('script, iframe, object, embed, audio, video, input[type="file"]').forEach(el => el.remove());
        for (const el of [copia, ...copia.querySelectorAll('*')]) {
            const acao = el.getAttribute('onclick')?.match(/\bwindow\.(\w+)\(/)?.[1];
            if (acao) el.dataset.tourAcao = acao;
            for (const atributo of el.getAttributeNames()) {
                if (/^on|^autofocus$|^target$|^formaction$/i.test(atributo)) el.removeAttribute(atributo);
            }
            if (el.matches('a, area')) el.removeAttribute('href');
            if (el.matches('a, button, input, select, textarea, summary, [tabindex]')) el.tabIndex = -1;
        }
        return copia;
    }

    function folhas(doc) {
        return [...doc.querySelectorAll('head link[rel="stylesheet"]')]
            .map(el => new URL(el.getAttribute('href'), urlBase))
            .filter(url => url.origin === urlBase.origin)
            .map(url => url.href);
    }

    // Este script roda antes do carregamento do perfil. Os modelos contêm só a interface inicial.
    const inicio = {
        app: copiar(campo('tela-app')),
        nav: copiar(campo('barra-navegacao-principal')),
        modais: new Map([...document.querySelectorAll('.modal-overlay[id], dialog[id]')]
            .filter(el => el !== janela).map(el => [el.id, copiar(el)])),
        folhas: folhas(document)
    };
    const folhaTour = inicio.folhas.find(url => new URL(url).pathname.endsWith('/styles/tour.css'));
    const estrutura = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
        '<meta http-equiv="Content-Security-Policy" content="script-src \'none\'; connect-src \'none\'; object-src \'none\'; form-action \'none\'; frame-src \'none\'">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Demonstração</title></head><body></body></html>';

    let capitulos = [];
    let capitulo = 0;
    let etapa = 0;
    let turno = 0;
    let comVoz = false;
    let documento;
    let estilosDaTela;
    let abriuDe;
    let prepararQuadro;
    let aoCarregarQuadro;
    let limparAlvo;
    let interagir;
    let alvoAtual;

    const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

    function falar(texto) {
        if (!comVoz) return;
        if (nativo) {
            window.SuiriTextoTour = texto;
            window.SuiriAndroid('speak-tour');
        } else {
            window.speechSynthesis.cancel();
            const frase = new SpeechSynthesisUtterance(texto);
            frase.lang = 'pt-BR';
            frase.rate = .88;
            const voz = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase() === 'pt-br');
            if (voz) frase.voice = voz;
            window.speechSynthesis.speak(frase);
        }
    }

    function silenciar() {
        if (!comVoz) return;
        if (nativo) window.SuiriAndroid('stop-tour');
        else window.speechSynthesis?.cancel();
    }

    function carregarPagina(nome) {
        if (!paginas.has(nome)) {
            // Estas duas páginas são do próprio site e também estão no cache do app.
            const requisicao = fetch(new URL(nome === 'arte' ? 'arte.html' : 'jogos.html', urlBase))
                .then(resposta => {
                    if (!resposta.ok) throw new Error('Tela de exemplo indisponível');
                    return resposta.text();
                }).then(html => {
                    const fonte = new DOMParser().parseFromString(html, 'text/html');
                    return {app: copiar(fonte.querySelector(nome === 'arte' ? '.atelier' : '#app-container')),
                        folhas: [...folhas(fonte), folhaTour].filter(Boolean)};
                }).catch(erro => {
                    paginas.delete(nome);
                    throw erro;
                });
            paginas.set(nome, requisicao);
        }
        return paginas.get(nome);
    }

    async function prepararEstilos(pagina, arquivos, atual) {
        if (estilosDaTela === pagina) return;
        const links = arquivos.map(url => {
            const link = documento.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            return link;
        });
        const prontas = links.map(link => new Promise(resolve => {
            link.onload = resolve;
            link.onerror = resolve;
        }));
        documento.head.querySelectorAll('link').forEach(link => link.remove());
        documento.head.append(...links);
        estilosDaTela = null;
        await Promise.race([Promise.all(prontas), esperar(1500)]);
        if (turno === atual) estilosDaTela = pagina;
    }

    async function montarTela(nome, atual) {
        const pagina = nome === 'arte' ? 'arte' : ['jogos', 'memoria', 'piano'].includes(nome) ? 'jogos' : 'inicio';
        const modelo = pagina === 'inicio' ? inicio : await carregarPagina(pagina);
        if (turno !== atual) return null;
        await prepararEstilos(pagina, modelo.folhas, atual);
        if (turno !== atual) return null;

        const corpo = documento.body;
        documento.documentElement.dataset.theme = document.documentElement.dataset.theme || 'light';
        corpo.className = 'tour-cena';
        delete corpo.dataset.arcadeTela;
        const app = modelo.app.cloneNode(true);
        if (pagina === 'inicio') {
            const principal = documento.createElement('main');
            principal.className = 'container';
            principal.append(app);
            const kids = nome === 'kids';
            const nav = inicio.nav.cloneNode(true);
            corpo.replaceChildren(principal, nav);
            corpo.classList.toggle('modo-kids-ativo', kids);
            app.classList.remove('oculto');
            const adulto = app.querySelector('#painel-adulto-container');
            const vila = app.querySelector('#tela-kids-exclusiva');
            (kids ? adulto : vila).remove();
            nav.hidden = kids;
            if (kids) {
                const imagem = vila.querySelector('#img-chuiri-animado-widget');
                imagem.src = 'assets/images/kids/padrao-parado.webp';
                vila.classList.remove('oculto');
            } else {
                adulto.querySelectorAll('section.secao-conteudo-app').forEach(el => {
                    if (el.id !== 'secao-' + nome) el.remove();
                    else el.classList.remove('oculto');
                });
                nav.querySelectorAll('[data-tela]').forEach(el => {
                    const selecionado = el.dataset.tela === nome;
                    el.classList.toggle('ativo', selecionado);
                    if (selecionado) el.setAttribute('aria-current', 'page');
                    else el.removeAttribute('aria-current');
                });
            }
        } else {
            corpo.replaceChildren(app);
            if (pagina === 'jogos') {
                corpo.classList.add('arcade-page');
                corpo.dataset.arcadeTela = nome === 'piano' ? 'simon' : nome === 'jogos' ? 'menu' : 'memoria';
                if (nome !== 'jogos') {
                    app.querySelector('#menu-arcade').style.display = 'none';
                    app.querySelector(nome === 'piano' ? '#tela-simon' : '#tela-memoria').style.display = 'flex';
                }
            }
        }
        documento.defaultView.scrollTo({top: 0, behavior: 'instant'});

        const q = seletor => documento.querySelector(seletor);
        const modal = id => {
            const copia = inicio.modais.get(id).cloneNode(true);
            corpo.append(copia);
            if (copia.localName === 'dialog') copia.open = true;
            else copia.classList.remove('oculto');
            return copia;
        };
        const valor = (s, v) => { q(s).value = v; };
        const texto = (s, v) => { q(s).textContent = v; };
        const exemplo = (s, html) => { q(s).innerHTML = html; };
        if (pagina === 'inicio' && nome === 'kids') texto('#nome-membro-kids', 'Lia');
        else if (pagina === 'inicio') {
            texto('#nome-membro-topo', 'Ana');
            texto('#nome-familia-topo', 'Casa de exemplo');
            if (nome === 'financeiro') {
                texto('#lbl-saldo-carteira-membro', 'R$ 450,00');
                texto('#lbl-saldo-total-familia-montante', 'R$ 780,00');
            }
        }
        return {q, modal, valor, texto, exemplo, doc: documento};
    }

    function posicionar(alvo) {
        if (!alvo?.isConnected) return;
        const quadro = tela.getBoundingClientRect();
        const r = alvo.getBoundingClientRect();
        const caixa = janela.getBoundingClientRect();
        const y = quadro.top - caixa.top;
        const topo = r.top + y;
        const baixo = r.bottom + y;
        if (matchMedia('(min-width: 760px) and (min-height: 441px)').matches &&
                r.right + quadro.left + 16 < caixa.right - guia.offsetWidth - 16) {
            janela.dataset.posicao = 'lado';
        } else {
            janela.dataset.posicao = caixa.height - baixo > guia.offsetHeight + 18 ||
                caixa.height - baixo >= topo ? 'baixo' : 'alto';
        }
        const x = quadro.left - caixa.left + r.left + r.width / 2;
        const centro = Math.max(11, Math.min(quadro.height - 11, r.top + r.height / 2));
        cursor.style.left = Math.max(11, Math.min(quadro.width - 11, x)) + 'px';
        cursor.style.top = y + centro + 'px';
    }

    function destacar(alvo, suave = false) {
        limparAlvo?.();
        if (!alvo) {
            janela.dataset.posicao = 'baixo';
            return;
        }
        alvoAtual = alvo;
        alvo.classList.add('tour-destaque');
        alvo.scrollIntoView({block: 'center', inline: 'nearest', behavior: suave && !movimentoReduzido.matches ? 'smooth' : 'instant'});
        posicionar(alvo);
        limparAlvo = () => {
            alvo.classList.remove('tour-destaque', 'tour-apertado', 'tour-foco-formulario');
            limparAlvo = null;
            alvoAtual = null;
        };
    }

    async function digitar(campoExemplo, texto, atual) {
        campoExemplo.value = '';
        campoExemplo.classList.add('tour-foco-formulario');
        for (const letra of texto) {
            if (turno !== atual) return;
            campoExemplo.value += letra;
            await esperar(65);
        }
    }

    async function renderizar() {
        const atual = ++turno;
        const assunto = capitulos[capitulo];
        const passo = assunto.passos[etapa];
        limparAlvo?.();
        interagir = null;
        cursor.getAnimations?.().forEach(anim => anim.cancel());
        cursor.classList.remove('tour-toque-pulso');
        cursor.hidden = true;
        indice.value = String(capitulo);
        campo('tour-passo-numero').textContent = `${etapa + 1} de ${assunto.passos.length}`;
        campo('tour-passo-titulo').textContent = passo.titulo;
        campo('tour-passo-descricao').textContent = passo.texto;
        campo('tour-estado').textContent = '';
        anterior.disabled = capitulo === 0 && etapa === 0;
        proximo.textContent = capitulo === capitulos.length - 1 && etapa === assunto.passos.length - 1 ? 'Concluir' : 'Próximo →';

        try {
            await prepararQuadro;
            if (turno !== atual) return;
            const cena = await montarTela(passo.tela, atual);
            if (!cena || turno !== atual) return;
            passo.antes?.(cena);
            falar(passo.titulo + '. ' + passo.texto);
            const alvo = cena.q(passo.alvo);
            if (!alvo) throw new Error('Controle de exemplo indisponível');
            destacar(alvo, true);
            let executado = false;
            const tocar = async () => {
                if (turno !== atual || executado) return;
                executado = true;
                interagir = null;
                posicionar(alvo);
                cursor.hidden = false;
                if (!movimentoReduzido.matches && cursor.animate) {
                    cursor.animate([{transform: 'translate(22px, 30px)', opacity: .1},
                        {transform: 'translate(0, 0)', opacity: 1}], {duration: 540, easing: 'ease-out'});
                    await esperar(540);
                }
                if (turno !== atual) return;
                cursor.classList.add('tour-toque-pulso');
                alvo.classList.add('tour-apertado');
                campo('tour-estado').textContent = 'Toque demonstrado.';
                await esperar(380);
                if (turno !== atual) return;
                alvo.classList.remove('tour-apertado');
                if (passo.digitar) await digitar(alvo, passo.digitar, atual);
                if (turno !== atual) return;
                cursor.hidden = true;
                if (passo.abrir) {
                    const seguinte = await montarTela(passo.abrir, atual);
                    if (!seguinte || turno !== atual) return;
                    passo.depois?.(seguinte);
                    destacar(passo.resultado ? seguinte.q(passo.resultado) : null);
                } else {
                    passo.depois?.(cena);
                    if (passo.resultado) destacar(cena.q(passo.resultado), true);
                }
            };
            interagir = evento => {
                if (alvo.contains(evento.target)) tocar();
            };
            await esperar(1400);
            await tocar();
        } catch {
            if (turno !== atual) return;
            limparAlvo?.();
            cursor.hidden = true;
            campo('tour-estado').textContent = 'Tela de exemplo indisponível.';
            campo('tour-passo-descricao').textContent = 'A demonstração desta tela não carregou. Toque em repetir ou siga para o próximo passo.';
        }
    }

    window.iniciarTourInstrucoes = () => {
        if (janela.open) return;
        abriuDe = document.activeElement;
        capitulos = window.modoKidsAtivo ? etapas.filter(item => item.kids) : etapas;
        indice.replaceChildren(...capitulos.map((item, i) => new Option(item.titulo, String(i))));
        capitulo = etapa = 0;
        prepararQuadro = new Promise(resolve => {
            aoCarregarQuadro = () => {
                const quadro = tela.contentDocument;
                if (!quadro || quadro.title !== 'Demonstração') return;
                tela.removeEventListener('load', aoCarregarQuadro);
                aoCarregarQuadro = null;
                documento = quadro;
                const base = documento.createElement('base');
                base.href = urlBase.href;
                documento.head.append(base);
                estilosDaTela = null;
                documento.addEventListener('click', evento => {
                    evento.preventDefault();
                    interagir?.(evento);
                }, true);
                documento.addEventListener('keydown', evento => {
                    if (evento.key === 'Escape') janela.close();
                });
                documento.addEventListener('scroll', () => posicionar(alvoAtual), true);
                resolve();
            };
            tela.addEventListener('load', aoCarregarQuadro);
        });
        tela.srcdoc = estrutura;
        janela.classList.remove('oculto');
        janela.dataset.posicao = 'baixo';
        janela.showModal();
        proximo.focus({preventScroll: true});
        renderizar();
    };

    function navegar(delta) {
        const destino = etapa + delta;
        if (destino >= 0 && destino < capitulos[capitulo].passos.length) etapa = destino;
        else if (capitulo + delta >= capitulos.length) return janela.close();
        else if (capitulo + delta < 0) return;
        else {
            capitulo += delta;
            etapa = delta < 0 ? capitulos[capitulo].passos.length - 1 : 0;
        }
        renderizar();
    }

    window.encerrarTourInstrucoes = () => janela.close();
    janela.addEventListener('close', () => {
        turno++;
        interagir = null;
        limparAlvo?.();
        silenciar();
        if (aoCarregarQuadro) tela.removeEventListener('load', aoCarregarQuadro);
        aoCarregarQuadro = null;
        tela.removeAttribute('srcdoc');
        documento = null;
        janela.classList.add('oculto');
        abriuDe?.focus({preventScroll: true});
    });
    campo('tour-fechar').addEventListener('click', window.encerrarTourInstrucoes);
    campo('tour-repetir').addEventListener('click', renderizar);
    anterior.addEventListener('click', () => navegar(-1));
    proximo.addEventListener('click', () => navegar(1));
    indice.addEventListener('change', () => {
        capitulo = Number(indice.value);
        etapa = 0;
        renderizar();
    });
    narrar.hidden = !(nativo || (window.speechSynthesis && window.SpeechSynthesisUtterance));
    narrar.addEventListener('click', () => {
        if (comVoz) silenciar();
        comVoz = !comVoz;
        narrar.setAttribute('aria-pressed', String(comVoz));
        if (comVoz) falar(campo('tour-passo-descricao').textContent);
    });
    window.addEventListener('resize', () => posicionar(alvoAtual));

    let gesto;
    const cabecalho = guia.querySelector('.tour-cabecalho');
    cabecalho.addEventListener('pointerdown', evento => {
        if (evento.target.closest('button')) return;
        cabecalho.setPointerCapture?.(evento.pointerId);
        gesto = {id: evento.pointerId, x: evento.clientX, y: evento.clientY};
    });
    cabecalho.addEventListener('pointerup', evento => {
        const atual = gesto;
        gesto = null;
        if (atual?.id === evento.pointerId && evento.clientY - atual.y > 55
                && evento.clientY - atual.y > Math.abs(evento.clientX - atual.x)) janela.close();
    });
    cabecalho.addEventListener('pointercancel', () => { gesto = null; });
})();
