const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

async function main() {
    const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { runScripts: 'outside-only' });
    const { window } = dom;
    const field = id => window.document.getElementById(id);
    const input = id => field('input-fin-' + id);
    window.mostrarToast = () => {};
    window.eval('let reconhecimentoVoz = null;');
    window.eval(fs.readFileSync('src/features/finances/voice-and-entry.js', 'utf8'));

    window.processarTextoTranscrito('Recebi 1200 de salário');
    assert.equal(input('valor').value, '1200.00');
    assert.equal(field('select-fin-tipo').value, 'entrada');
    assert.equal(field('btn-toggle-tipo-receita').getAttribute('aria-pressed'), 'true');
    assert.equal(input('descricao').dataset.viaVoz, 'true');

    window.processarTextoTranscrito('Paguei o dentista por 25 reais e 50 centavos');
    assert.equal(input('valor').value, '25.50');
    assert.equal(field('select-fin-tipo').value, 'saida');
    assert.equal(field('select-fin-categoria').value, 'Saúde');

    window.processarTextoTranscrito('Comprei arroz');
    assert.equal(input('valor').value, '');

    let called = 0;
    const client = { functions: { invoke: async (_name, request) => {
        called++;
        assert.equal(request.body.consent, true);
        return { data: { receipt: { estabelecimento: 'Mercado de Teste', total: 37.90, itens: [] } } };
    } } };
    window.obterClienteSupabase = () => client;
    window.obterUsuarioId = () => 'user-test';
    window.SuiriConfig = { aiFunction: 'suiri-ia' };
    window.Suiri = {
        once: (_key, fn) => fn(),
        notifyError: error => { throw error; },
        money: value => String(value),
        openModal: id => field(id).classList.remove('oculto')
    };
    window.eval(fs.readFileSync('src/features/shopping/mercado.js', 'utf8'));
    const image = new window.File(['imagem simulada'], 'cupom.jpg', { type: 'image/jpeg' });
    window.confirmarAcaoSuiri = async () => false;
    await window.lerFotoCupomFiscal(image);
    assert.equal(called, 0);
    window.confirmarAcaoSuiri = async () => true;
    await window.lerFotoCupomFiscal(image);
    assert.equal(called, 1);
    assert.equal(input('valor').value, '37.90');
    assert.equal(input('descricao').dataset.viaVoz, undefined);
    assert.equal(field('select-fin-escopo').value, 'pessoal');

    dom.window.close();
    console.log('Ditado, revisão e consentimento do cupom verificados.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
