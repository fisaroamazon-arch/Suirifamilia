const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

async function main() {
    const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { runScripts: 'outside-only', url: 'https://suiri.test/' });
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

    const filhos = [{ id: 'kid-test', nome: 'Criança', eh_kids: true }];
    window.listaMembrosFamilia = filhos;
    window.perfilAtual = window.usuarioAtual = { id: 'user-test', papel: 'adm' };
    window.esc = value => String(value ?? '').replaceAll('<', '&lt;');
    window.obterPrimeiroNomeSeguro = nome => nome;
    window.Suiri.check = ({ data, error }, count) => {
        if (error || (count && data?.length !== count)) throw new Error('Atualização não confirmada');
        return data;
    };
    window.Suiri.closeModal = id => field(id).classList.add('oculto');
    window.eval(fs.readFileSync('src/features/missions/state-and-ui.js', 'utf8'));
    window.eval(fs.readFileSync('src/features/missions/missoes.js', 'utf8'));
    window.eval(`cacheMissoes = [{ id: 'task-test', titulo: 'Tarefa Kids', atribuido_a: 'kid-test', escopo: 'casa', recorrencia_tipo: 'unica' }];`);
    let alteracao;
    client.from = () => ({
        update: dados => {
            alteracao = dados;
            return { eq() { return this; }, select: async () => ({ data: [{ id: 'task-test' }] }) };
        }
    });
    window.carregarMissoesDoDia = async () => {};
    window.iniciarEdicaoMissao('task-test');
    assert(!field('modal-editar-missao').classList.contains('oculto'));
    assert.equal(field('edit-missao-responsavel').value, 'kid-test');
    field('edit-missao-titulo').value = 'Tarefa corrigida';
    await window.salvarEdicaoMissao();
    assert.equal(alteracao.titulo, 'Tarefa corrigida');
    assert.equal(alteracao.atribuido_a, 'kid-test');
    assert(field('modal-editar-missao').classList.contains('oculto'));

    window.eval(fs.readFileSync('src/features/reports/relatorios.js', 'utf8'));
    const relatorio = window.eval(`agrupamentoCategoriasRelatorio([
        { tipo: 'saida', valor: 10.1, categoria: 'Mercado', subcategoria: 'Feira' },
        { tipo: 'saida', valor: 2.2, categoria: 'Mercado', subcategoria: 'Feira' },
        { tipo: 'saida', valor: 5, categoria: 'Oculta', subcategoria: 'Sigilo', eh_privado: true, membro_id: 'outro' },
        { tipo: 'entrada', valor: 15, categoria: 'Transferência', transferencia_interna: true },
        { tipo: 'entrada', valor: 20, categoria: 'Recorrente', subcategoria: 'Projeto' }
    ], 'user-test')`);
    assert.equal(relatorio.saida.get('Mercado').subcategorias.get('Feira'), 1230);
    assert.equal(relatorio.saida.get('Privativo').subcategorias.has('Sigilo'), false);
    assert.equal(relatorio.entrada.has('Transferência'), false);
    window.ultimoResumoRelatorio = { categorias: relatorio };
    window.HTMLCanvasElement.prototype.getContext = () => ({});
    let grafico;
    window.Chart = class {
        constructor(_contexto, config) { grafico = config; }
        destroy() {}
    };
    field('relatorio-grupo-grafico').value = 'subcategoria';
    for (const [formato, tipo, eixo] of [['colunas', 'bar', 'x'], ['barras', 'bar', 'y'], ['pizza', 'pie', 'x']]) {
        field('relatorio-formato-grafico').value = formato;
        window.renderizarGraficoCategorias();
        assert.equal(grafico.type, tipo);
        assert.equal(grafico.options.indexAxis, eixo);
        assert.equal(grafico.data.labels[0], 'Mercado › Feira');
    }

    let reminders = 0;
    window.familiaAtualId = 'family-test';
    window.Notification = { permission: 'denied' };
    Object.defineProperty(window.navigator, 'serviceWorker', {
        value: { getRegistration: async () => ({
            active: true,
            showNotification: async (_title, notification) => {
                assert.equal(notification.tag, 'suiri-agenda');
                reminders++;
            }
        }) }
    });
    window.eval(fs.readFileSync('src/features/notifications/painel.js', 'utf8'));
    await window.exibirLembreteAgenda('family-test', '2026-11-24');
    assert.equal(reminders, 0);
    window.Notification.permission = 'granted';
    await Promise.all([
        window.exibirLembreteAgenda('family-test', '2026-11-24'),
        window.exibirLembreteAgenda('family-test', '2026-11-24')
    ]);
    assert.equal(reminders, 1);
    await window.exibirLembreteAgenda('family-test', '2026-11-25');
    assert.equal(reminders, 2);

    dom.window.close();
    console.log('Ditado, cupom, edição Kids, relatórios e notificações verificados.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
