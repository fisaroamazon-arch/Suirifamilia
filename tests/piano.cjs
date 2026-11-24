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
    assert.equal(motor.mapearNota('E6').simbolo, '↑2');
    assert.equal(motor.mapearNota('E2').simbolo, '↓2');
    assert.equal(motor.mapearNota('E6').tecla, 'E4');
    assert.equal(motor.mapearNota('E2').tecla, 'E4');

    motor.mudarFatorVelocidade('toque');
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
    motor.atualizarAlcance();
    assert.equal(teclado.children.length, 37);
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
    assert.equal(motor.mapearNota('E5').tecla, 'E4');
    assert.equal(teclado.children[0].dataset.nota, 'C4');
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
    console.log('Piano: catálogo, movimentos, mapeamento, som e iluminação de oitavas verificados.');
} finally {
    dom.window.close();
}
