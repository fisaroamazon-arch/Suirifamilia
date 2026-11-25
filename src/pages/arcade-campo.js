window.MotorCampo = (() => {
    const niveis = {
        amador: { nome: 'Amador', linhas: 8, colunas: 8, minas: 8 },
        moderado: { nome: 'Moderado', linhas: 10, colunas: 10, minas: 15 },
        avancado: { nome: 'Avançado', linhas: 12, colunas: 12, minas: 26 }
    };
    const grade = document.getElementById('campo-grade');
    const seletor = document.getElementById('campo-nivel');
    const modoBandeira = document.getElementById('campo-modo-bandeira');
    const reiniciar = document.getElementById('campo-reiniciar');
    const relogio = document.getElementById('campo-tempo');
    const recado = document.getElementById('campo-recado');
    const contador = document.getElementById('campo-minas');
    let nivel = niveis.amador;
    let tabuleiro = [];
    let fase;
    let marcadas;
    let faltam;
    let foco;
    let inicio;
    let cronometro;

    function vizinhas(indice) {
        const linha = Math.floor(indice / nivel.colunas);
        const coluna = indice % nivel.colunas;
        const casas = [];
        for (let l = Math.max(0, linha - 1); l <= Math.min(nivel.linhas - 1, linha + 1); l++) {
            for (let c = Math.max(0, coluna - 1); c <= Math.min(nivel.colunas - 1, coluna + 1); c++) {
                if (l !== linha || c !== coluna) casas.push(l * nivel.colunas + c);
            }
        }
        return casas;
    }

    function semear(primeira) {
        const protegidas = new Set([primeira, ...vizinhas(primeira)]);
        const candidatas = tabuleiro.map(casa => casa.indice).filter(i => !protegidas.has(i));
        for (let i = 0; i < nivel.minas; i++) {
            const sorteada = i + Math.floor(Math.random() * (candidatas.length - i));
            [candidatas[i], candidatas[sorteada]] = [candidatas[sorteada], candidatas[i]];
            tabuleiro[candidatas[i]].mina = true;
        }
        for (const casa of tabuleiro) casa.numero = vizinhas(casa.indice).filter(i => tabuleiro[i].mina).length;
        fase = 'jogando';
        seletor.disabled = true;
        inicio = performance.now();
        cronometro = setInterval(() => {
            relogio.textContent = `${Math.floor((performance.now() - inicio) / 1000)} s`;
        }, 250);
        recado.textContent = 'Encontre as casas seguras e marque as minas com bandeiras.';
    }

    function atualizarCasa(casa) {
        const {botao, indice, aberta, mina, numero, bandeira} = casa;
        const estado = aberta ? (mina ? 'mina' : 'aberta') : bandeira ? 'bandeira' : 'fechada';
        const simbolo = aberta ? (mina ? '✸' : numero || '') : bandeira ? '⚑' : '';
        botao.dataset.campoEstado = estado;
        botao.dataset.campoNumero = aberta && !mina ? String(numero) : '';
        botao.textContent = simbolo;
        const descricao = aberta ? (mina ? 'mina' : numero ? `${numero} ${numero === 1 ? 'mina vizinha' : 'minas vizinhas'}` :
            'sem minas vizinhas') : bandeira ? 'marcada com bandeira' : 'fechada';
        botao.setAttribute('aria-label', `Linha ${Math.floor(indice / nivel.colunas) + 1}, coluna ${indice % nivel.colunas + 1}, ${descricao}`);
    }

    function concluir(venceu, atingida) {
        const tempo = Math.round(performance.now() - inicio);
        parar();
        fase = 'fim';
        seletor.disabled = false;
        modoBandeira.disabled = true;
        if (venceu) {
            const texto = `${(tempo / 1000).toFixed(1).replace('.', ',')} s`;
            relogio.textContent = texto;
            RecordesArcade.registrar('campo', nivel.nome, -tempo, texto);
            recado.textContent = 'Você encontrou todas as casas seguras!';
            AudioMotor.tocarEfeito('par');
            return;
        }
        atingida.botao.dataset.campoAtingida = 'sim';
        for (const casa of tabuleiro) {
            if (casa.mina) {
                casa.aberta = true;
                atualizarCasa(casa);
            }
        }
        recado.textContent = 'Essa casa tinha uma mina. Quer tentar outro tabuleiro?';
        AudioMotor.tocarEfeito('impacto');
        tentarVibrar(40);
    }

    function jogar(indice, marcar = modoBandeira.getAttribute('aria-pressed') === 'true') {
        const casa = tabuleiro[indice];
        if (!casa || casa.aberta || fase === 'fim') return;
        if (marcar) {
            if (!casa.bandeira && marcadas === nivel.minas) return;
            casa.bandeira = !casa.bandeira;
            marcadas += casa.bandeira ? 1 : -1;
            contador.textContent = nivel.minas - marcadas;
            atualizarCasa(casa);
            return;
        }
        if (casa.bandeira) return;
        if (fase === 'pronto') semear(indice);
        if (casa.mina) {
            concluir(false, casa);
            return;
        }
        const explorar = [indice];
        while (explorar.length) {
            const atual = tabuleiro[explorar.pop()];
            if (atual.aberta || atual.bandeira || atual.mina) continue;
            atual.aberta = true;
            faltam--;
            atualizarCasa(atual);
            if (!atual.numero) explorar.push(...vizinhas(atual.indice));
        }
        if (!faltam) concluir(true);
    }

    function parar() {
        clearInterval(cronometro);
    }

    function montar() {
        parar();
        nivel = niveis[seletor.value] || niveis.amador;
        fase = 'pronto';
        marcadas = 0;
        faltam = nivel.linhas * nivel.colunas - nivel.minas;
        foco = 0;
        seletor.disabled = false;
        modoBandeira.disabled = false;
        modoBandeira.setAttribute('aria-pressed', 'false');
        relogio.textContent = '0 s';
        contador.textContent = nivel.minas;
        recado.textContent = 'O primeiro toque é seguro. Use Bandeira para marcar suspeitas.';
        grade.style.setProperty('--campo-colunas', nivel.colunas);
        const fragmento = document.createDocumentFragment();
        tabuleiro = Array.from({length: nivel.linhas * nivel.colunas}, (_, indice) => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'campo-casa';
            botao.tabIndex = indice === 0 ? 0 : -1;
            botao.dataset.campoCasa = indice;
            const casa = {botao, indice, mina: false, aberta: false, bandeira: false, numero: 0};
            atualizarCasa(casa);
            fragmento.append(botao);
            return casa;
        });
        grade.replaceChildren(fragmento);
    }

    function indiceDoEvento(evento) {
        const casa = evento.target.closest('[data-campo-casa]');
        return casa ? Number(casa.dataset.campoCasa) : null;
    }

    grade.addEventListener('click', evento => jogar(indiceDoEvento(evento)));
    grade.addEventListener('contextmenu', evento => {
        evento.preventDefault();
        jogar(indiceDoEvento(evento), true);
    });
    grade.addEventListener('focusin', evento => {
        const indice = indiceDoEvento(evento);
        if (indice === null || indice === foco) return;
        tabuleiro[foco].botao.tabIndex = -1;
        foco = indice;
        tabuleiro[foco].botao.tabIndex = 0;
    });
    grade.addEventListener('keydown', evento => {
        const indice = indiceDoEvento(evento);
        if (indice === null) return;
        if (evento.key.toLowerCase() === 'f') {
            evento.preventDefault();
            jogar(indice, true);
            return;
        }
        const coluna = indice % nivel.colunas;
        const destinos = { ArrowUp: indice - nivel.colunas, ArrowDown: indice + nivel.colunas,
            ArrowLeft: coluna > 0 ? indice - 1 : indice,
            ArrowRight: coluna < nivel.colunas - 1 ? indice + 1 : indice };
        if (!Object.hasOwn(destinos, evento.key)) return;
        evento.preventDefault();
        tabuleiro[destinos[evento.key]]?.botao.focus();
    });
    modoBandeira.addEventListener('click', () => {
        const ligado = modoBandeira.getAttribute('aria-pressed') === 'true';
        modoBandeira.setAttribute('aria-pressed', String(!ligado));
    });
    seletor.addEventListener('change', montar);
    reiniciar.addEventListener('click', montar);
    return { montar, parar };
})();
