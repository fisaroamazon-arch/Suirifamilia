const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><button id="tecla"></button>', { runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
try {
    for (const file of ['src/data/partituras.js', 'src/data/partituras-classicas.js',
        'src/data/partituras-extras.js', 'src/features/kids/piano-banda.js', 'src/features/kids/piano.js']) {
        window.eval(fs.readFileSync(file, 'utf8'));
    }

    const { PARTITURAS_CLASSICAS: classicas, MotorMusica: motor } = window;
    assert.equal(motor.fatorVelocidade, 'toque');
    assert.equal(motor.metronomoLigado, true);
    assert.equal(motor.repetirErros, true);
    assert.equal(motor.alcancePreferido, 2);
    assert.equal(motor.dificuldade, 'amador');
    assert.equal(classicas.length, 20);
    assert.equal(new Set(classicas.map(musica => musica.titulo)).size, 20);
    for (const musica of classicas) {
        assert(musica.melodia.length >= 54);
        assert(musica.melodia.every(({ n, t, d }, i, notas) =>
            motor.infoNota(n) && d > 0 && t / 2 < musica.duracao && (!i || t >= notas[i - 1].t)));
    }
    const quinta = classicas.find(musica => musica.titulo.startsWith('Sinfonia nº 5'));
    assert.equal(quinta.partes.length, 4);
    assert(quinta.duracao > 1800);

    motor.catalogoMusicas = window.CATALOGO_MUSICAS;
    motor.selecionarEstilo('classicas');
    motor.selecionarMusica(motor.catalogoMusicas.findIndex(musica => musica.titulo.startsWith('Para Elisa')));
    assert.equal(motor.notasNaEsteira[0].nota, 'E5');
    const notasAmador = motor.notasNaEsteira.map(item => item.tInicio);
    assert(motor.acordesNaEsteira.every(item => item.notas.length <= 1));
    motor.alterarDificuldade('moderado');
    const notasModerado = motor.notasNaEsteira.map(item => item.tInicio);
    assert(notasModerado.length > notasAmador.length && notasAmador.every(nota => notasModerado.includes(nota)));
    assert(motor.acordesNaEsteira.every(item => item.notas.length <= 2));
    motor.alterarDificuldade('avancado');
    assert.equal(motor.notasNaEsteira.length, motor.partituraAtual.melodia.length);
    assert(motor.notasNaEsteira.length > notasModerado.length);
    const batida = 60 / motor.partituraAtual.bpm;
    for (const [nivel, aceitaAtraso, aceitaAntecipacao] of [
        ['amador', true, true], ['moderado', true, false], ['avancado', false, false]
    ]) {
        motor.alterarDificuldade(nivel);
        const primeira = motor.notasNaEsteira[0];
        motor.tempoMusicaSegundos = primeira.tInicio + .68 * batida;
        assert.equal(motor.emFaixa(primeira), aceitaAtraso);
        motor.tempoMusicaSegundos = primeira.tInicio - .53 * batida;
        assert.equal(motor.emFaixa(primeira), aceitaAntecipacao);
    }
    motor.alterarDificuldade('amador');
    const primeira = motor.notasNaEsteira[0];
    motor.tempoMusicaSegundos = primeira.tInicio + .76 * batida;
    assert(motor.emFaixa(primeira));
    assert(motor.conferirAtrasos());
    motor.tempoMusicaSegundos = primeira.tInicio + .89 * batida;
    assert(!motor.emFaixa(primeira));
    motor.tempoMusicaSegundos = primeira.tInicio - .66 * batida;
    assert(!motor.emFaixa(primeira));
    motor.alterarDificuldade('avancado');
    motor.reiniciarMusica();
    motor.alterarAlcance(1);
    assert.equal(motor.mapearNota('E6').simbolo, '↑2');
    assert.equal(motor.mapearNota('E2').simbolo, '↓2');
    assert.equal(motor.mapearNota('E6').tecla, 'E4');
    assert.equal(motor.mapearNota('E2').tecla, 'E4');

    motor.mudarFatorVelocidade('toque');
    assert.equal(motor.metronomoLigado, true);
    const metronomo = [];
    window.AudioMotor.tocarMetronomo = acento => metronomo.push(acento);
    motor.togglePlay();
    const contagem = motor.contagem;
    assert(contagem?.comCompasso);
    for (let i = 0; i < contagem.batidas; i++) {
        assert.equal(motor.atualizarContagem(contagem.inicio + (i + .1) * contagem.intervalo), true);
    }
    assert.equal(metronomo.length, contagem.batidas);
    assert.deepEqual(metronomo, [true, ...Array(contagem.batidas - 1).fill(false)]);
    assert.equal(motor.atualizarContagem(contagem.inicio + contagem.duracao), false);
    assert.equal(motor.tempoMusicaSegundos, contagem.destino);
    assert.equal(metronomo.at(-1), true);
    assert(motor.timerMetronomoSemRelogio, 'O metrônomo continua depois da contagem em Sem relógio.');
    const tocaram = [];
    const soltaram = [];
    window.AudioMotor.iniciarVozPiano = (id, freq) => tocaram.push({ id, freq });
    window.AudioMotor.soltarVozPiano = id => soltaram.push(id);
    const tecla = window.document.getElementById('tecla');
    motor.pressionarNota('E4', 1, tecla);
    assert.equal(tecla.dataset.oitavaTocada, '↑1');
    assert(Math.abs(tocaram[0].freq - 659.255) < .01);
    assert.equal(motor.passoNota, 1);
    motor.soltarNota('E4', 1, tecla);
    assert.equal(tecla.dataset.oitavaTocada, undefined);
    assert.deepEqual(soltaram, ['E5_1']);

    motor.alterarTreino(true);
    const alvo = motor.notasNaEsteira[motor.passoNota];
    const vidas = motor.vidas;
    motor.avaliarNota('C4', 'solo', tecla, 2, ['C4']);
    assert.equal(motor.passoNota, 1);
    assert.equal(motor.vidas, vidas);
    assert.equal(motor.contagem.destino, alvo.tInicio);
    assert.equal(motor.contagem.erro, true);
    assert.equal(motor.timerMetronomoSemRelogio, null);
    motor.pausarMusica();
    assert.equal(motor.contagemPendente.destino, alvo.tInicio);
    motor.togglePlay();
    assert.equal(motor.contagem.destino, alvo.tInicio);
    motor.alterarTreino(false);
    motor.alterarVidas('infinitas');
    for (let i = 0; i < 6; i++) motor.registrarErro();
    assert.equal(motor.vidas, vidas);
    assert.equal(motor.encerrada, false);
    motor.alterarVidas('limite');

    motor.selecionarMusica(motor.catalogoMusicas.indexOf(quinta));
    motor.selecionarParte('1');
    assert.equal(motor.parteAtual.titulo, 'II. Andante con moto');
    assert(motor.partituraAtual.duracao < quinta.duracao);
    assert(motor.notasNaEsteira.at(-1).tInicio < motor.partituraAtual.duracao);
    window.document.body.insertAdjacentHTML('beforeend', `
        <label><select id="piano-alcance"><option value="1">1</option>
        <option value="2">2</option><option value="3">3</option></select></label>
        <div id="teclado-piano-completo"><div data-nota="C4"></div></div>`);
    const teclado = window.document.getElementById('teclado-piano-completo');
    motor.orientacaoAmpla = {matches:true};
    motor.alterarAlcance(2);
    assert.equal(teclado.children.length, 25);
    assert.equal(motor.mapearNota('E5').tecla, 'E5');
    assert.equal(motor.mapearNota('E6').simbolo, '↑1');
    motor.alterarAlcance(3);
    assert.equal(teclado.children.length, 37);
    assert.equal(motor.mapearNota('G#3').tecla, 'G#3');
    assert.equal(motor.mapearNota('G#2').simbolo, '↓1');
    motor.orientacaoAmpla.matches = false;
    motor.atualizarAlcance();
    assert.equal(motor.mapearNota('E5').tecla, 'E5');
    assert.equal(teclado.children[0].dataset.nota, 'C3');
    assert.equal(teclado.children.length, 37);
    motor.orientacaoAmpla.matches = true;
    const livre = window.document.createElement('div');
    for (const [base, inicio, fim] of [[2, 'C2', 'C4'], [4, 'C4', 'C6']]) {
        motor.montarTecladoAmpliado(livre, 2, base);
        assert.equal(livre.children.length, 25);
        assert.equal(livre.firstElementChild.dataset.nota, inicio);
        assert.equal(livre.lastElementChild.dataset.nota, fim);
    }
    motor.timbresLivres[2] = 'cordas';
    motor.timbresLivres[5] = 'xilofone';
    assert.equal(motor.obterInstrumentoPorOrigem('livre-grave', 'A2'), 'cordas');
    assert.equal(motor.obterInstrumentoPorOrigem('livre-agudo', 'C6'), 'xilofone');
    motor.modo = 'dueto';
    motor.parteDueto = 'base';
    motor.passoNota = 0;
    motor.passoAcorde = motor.acordesNaEsteira.length;
    assert.equal(motor.partidaCompleta(), true);
    assert.equal(motor.mapearNota('E2', true).tecla, 'E2');
    motor.parteDueto = 'melodia';
    assert.equal(motor.partidaCompleta(), false);
    motor.modo = 'aprendizado';
    motor.parteSolo = 'ambas';
    assert.equal(motor.usaPainelDuplo(), true);
    assert.equal(motor.pistasAtivas().base, true);

    const notasInteiras = motor.notasNaEsteira.map(({nota, tInicio, tFim}) => [nota, tInicio, tFim]);
    const baseInteira = motor.acordesNaEsteira.flatMap(({notas, tInicio, tFim}) =>
        notas.map(nota => [nota, tInicio, tFim]));
    for (const nivel of ['amador', 'moderado']) {
        motor.alterarDificuldade(nivel);
        for (const [pista, tocadas, originais] of [
            ['melodia', motor.notasNaEsteira.map(({nota, tInicio, tFim}) => [nota, tInicio, tFim]), notasInteiras],
            ['base', motor.acordesNaEsteira.flatMap(({notas, tInicio, tFim}) => notas.map(nota => [nota, tInicio, tFim])), baseInteira]
        ]) {
            const automaticas = motor.eventosAutomaticos.filter(item => item.pista === pista)
                .map(({nota, tInicio, tFim}) => [nota, tInicio, tFim]);
            assert.deepEqual([...tocadas, ...automaticas].map(item => JSON.stringify(item)).sort(),
                Array.from(originais, item => JSON.stringify(item)).sort());
        }
    }
    const primeiraAuto = motor.eventosAutomaticos[0];
    const vozesAntes = tocaram.length;
    motor.tocarAutomaticasAte(primeiraAuto.tInicio, true);
    assert.equal(tocaram.length, vozesAntes, 'A nota automática junto de um alvo espera o toque.');
    motor.tocarAutomaticasAte(primeiraAuto.tInicio);
    assert(tocaram.length > vozesAntes);
    assert.equal(tocaram[vozesAntes].freq, motor.infoNota(primeiraAuto.nota).freq);
    assert.equal(motor.errosTotais, 0);
    assert.equal(motor.acertosTotais, 0);
    motor.pausarMusica();
    assert.equal(motor.vozesAutomaticas.size, 0);
    motor.alterarDificuldade('avancado');
    assert.equal(motor.eventosAutomaticos.length, 0);
    console.log('Piano: catálogo, movimentos, mapeamento, som e iluminação de oitavas verificados.');
} finally {
    dom.window.close();
}
