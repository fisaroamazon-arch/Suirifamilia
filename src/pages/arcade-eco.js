window.MotorEco = (() => {
    const palco = document.getElementById('tela-eco');
    const notas = [...palco.querySelectorAll('[data-eco-nota]')];
    const frequencias = [261.63, 329.63, 392, 523.25];
    const recado = document.getElementById('eco-recado');
    const comecar = document.getElementById('eco-comecar');
    const escutar = document.getElementById('eco-escutar');
    const luzes = document.getElementById('eco-luzes');
    const recordes = document.getElementById('eco-recordes');
    let fase = 'pronto';
    let sequencia = [];
    let vidas = 3;
    let rodadas = 0;
    let passo = 0;
    let usouLuzes = false;
    let timer;
    let timerLuz;

    function mudarFase(novaFase, texto) {
        fase = novaFase;
        palco.dataset.ecoFase = fase;
        recado.textContent = texto;
        document.getElementById('eco-rodada').textContent = Math.min(10, rodadas + 1);
        document.getElementById('eco-vidas').textContent = vidas;
        for (const nota of notas) nota.disabled = fase !== 'jogar';
        comecar.textContent = fase === 'pausado' ? 'Continuar' :
            fase === 'pronto' ? 'Começar' : fase === 'fim' ? 'Jogar de novo' : 'Reiniciar';
        escutar.hidden = fase !== 'jogar';
        luzes.disabled = fase === 'escutar';
        recordes.hidden = fase !== 'fim';
    }

    function apagarNotas() {
        clearTimeout(timerLuz);
        for (const nota of notas) nota.classList.remove('eco-acesa');
    }

    function tocarNota(indice, duracao) {
        apagarNotas();
        if (fase !== 'escutar' || luzes.getAttribute('aria-pressed') === 'true') {
            notas[indice].classList.add('eco-acesa');
            if (fase === 'escutar') usouLuzes = true;
            timerLuz = setTimeout(apagarNotas, duracao);
        }
        AudioMotor.tocarTom(frequencias[indice], duracao / 1000, 'sine');
    }

    function acrescentarNota() {
        sequencia.push(Math.floor(Math.random() * notas.length));
    }

    function tocarSequencia() {
        clearTimeout(timer);
        passo = 0;
        const intervalo = Math.max(305, 570 - rodadas * 28);
        mudarFase('escutar', 'Escute a sequência…');
        let indice = 0;
        function proxima() {
            if (indice === sequencia.length) {
                mudarFase('jogar', `Sua vez · 0 de ${sequencia.length} notas`);
                return;
            }
            tocarNota(sequencia[indice++], intervalo * .64);
            timer = setTimeout(proxima, intervalo);
        }
        timer = setTimeout(proxima, 300);
    }

    function concluir() {
        if (rodadas) RecordesArcade.registrar('eco', usouLuzes ? 'Com luzes' : 'De ouvido',
            rodadas, `${rodadas} ${rodadas === 1 ? 'rodada' : 'rodadas'}`);
        const texto = rodadas === 10 ? 'Você completou as 10 rodadas!' :
            `Fim da partida · ${rodadas} ${rodadas === 1 ? 'rodada completa' : 'rodadas completas'}`;
        mudarFase('fim', texto);
        comecar.focus({ preventScroll: true });
    }

    function responder(indice) {
        if (fase !== 'jogar') return;
        tocarNota(indice, 200);
        if (indice !== sequencia[passo]) {
            vidas--;
            tentarVibrar(45);
            if (!vidas) {
                concluir();
                return;
            }
            mudarFase('erro', 'Quase! Escute a mesma sequência e tente de novo.');
            timer = setTimeout(tocarSequencia, 900);
            return;
        }
        passo++;
        if (passo < sequencia.length) {
            recado.textContent = `Sua vez · ${passo} de ${sequencia.length} notas`;
            return;
        }
        rodadas++;
        if (rodadas === 10) {
            concluir();
            return;
        }
        mudarFase('acerto', 'Sequência completa! Agora vem mais uma nota.');
        acrescentarNota();
        timer = setTimeout(tocarSequencia, 850);
    }

    palco.addEventListener('click', evento => {
        const nota = evento.target.closest('[data-eco-nota]');
        if (nota) responder(Number(nota.dataset.ecoNota));
    });
    luzes.addEventListener('click', () => {
        const ligado = luzes.getAttribute('aria-pressed') === 'true';
        luzes.setAttribute('aria-pressed', String(!ligado));
    });
    document.addEventListener('keydown', evento => {
        if (GerenciadorArcade.telaAtiva !== 'eco' || fase !== 'jogar' ||
            evento.repeat || evento.altKey || evento.ctrlKey || evento.metaKey) return;
        if (!/^[1-4]$/.test(evento.key)) return;
        evento.preventDefault();
        responder(Number(evento.key) - 1);
    });

    return {
        montar() {
            this.parar();
            vidas = 3;
            rodadas = 0;
            mudarFase('pronto', 'Toque em Começar e escute a primeira sequência.');
            comecar.focus({ preventScroll: true });
        },
        iniciar() {
            AudioMotor.obterCtx();
            if (fase === 'pausado') {
                tocarSequencia();
                return;
            }
            this.parar();
            vidas = 3;
            rodadas = 0;
            usouLuzes = false;
            sequencia = [];
            for (let i = 0; i < 3; i++) acrescentarNota();
            tocarSequencia();
        },
        escutarNovamente() {
            if (fase === 'jogar') {
                comecar.focus({ preventScroll: true });
                tocarSequencia();
            }
        },
        pausar() {
            if (['pronto', 'fim', 'pausado'].includes(fase)) return;
            this.parar();
            mudarFase('pausado', 'Partida pausada. Toque em Continuar para ouvir a sequência.');
        },
        parar() {
            clearTimeout(timer);
            apagarNotas();
            fase = 'pronto';
        }
    };
})();
