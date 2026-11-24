/* Dados fictícios e os controles da interface que cada etapa demonstra. */
(() => {
    const acao = nome => `[data-tour-acao="${nome}"]`;
    const aba = nome => `.bottom-nav-item[data-tela="${nome}"]`;
    const abrirModal = id => ({modal}) => modal(id);
    const ficha = (titulo, corpo) => `<article class="cartao-geral tour-exemplo-card"><strong>${titulo}</strong>${corpo}</article>`;
    const exemplo = (seletor, titulo, texto) => ({exemplo}) =>
        exemplo(seletor, ficha(titulo, `<p>${texto}</p>`));
    const abrir = (tela, alvo, titulo, texto, proximaTela, resultado, depois) =>
        ({tela, alvo, titulo, texto, abrir: proximaTela, resultado, depois});

    function agenda(cena, descricao = 'Internet · R$ 90,00', pago = false) {
        cena.texto('#mes-ano-calendario-titulo', 'Junho de 2026');
        const dias = Array.from({length: 30}, (_, i) => `<span${i === 11 ? ' class="tour-dia-marcado"' : ''}>${i + 1}</span>`).join('');
        cena.exemplo('#grid-calendario-container', `<div class="tour-mini-calendario">${dias}</div>
            ${ficha(descricao, `<p class="tour-linha"><span>Dia 12 · ${pago ? 'Pago' : 'A pagar'}</span>${pago ? '' : '<button id="tour-baixa" class="btn-secundario" type="button">Já pago</button>'}</p>`)}`);
    }

    function perfis(cena) {
        cena.doc.body.insertAdjacentHTML('beforeend', `<div class="modal-overlay" id="tour-perfis"><div class="modal-conteudo">
            <div class="modal-header"><h3>Trocar usuário</h3></div>
            ${ficha('Adultos', '<button type="button" class="btn-secundario">Ana</button>')}
            ${ficha('Espaço Kids', '<button type="button" id="tour-perfil-lia" class="btn-principal">Lia</button>')}
        </div></div>`);
    }

    function tarefa(cena, preencher = false) {
        const modal = cena.modal('modal-nova-missao');
        if (preencher) cena.valor('#input-nova-missao-titulo', 'Organizar a mochila');
        cena.q('#select-nova-missao-responsavel').add(new Option('Lia · Kids', 'lia'));
        return modal;
    }

    function missaoKids(cena, feita = false) {
        cena.exemplo('#lista-missoes-kids-container', ficha('Organizar a mochila · 25 XP', `<p>Guardar cadernos e conferir o estojo.</p>
            ${feita ? '<p>✓ Concluída</p>' : '<button id="tour-missao-fiz" type="button" class="btn-sucesso">Fiz</button>'}`));
    }

    function mercado(cena, lista, noCarrinho = false) {
        cena.q('#bloco-lista-planejamento-mercado').classList.toggle('oculto', !lista);
        cena.q('#bloco-planilha-modo-mercado').classList.toggle('oculto', lista);
        for (const id of ['#btn-aba-lista-mes', '#btn-aba-modo-mercado']) {
            const ativo = id.includes('lista') === lista;
            const el = cena.q(id);
            el.classList.toggle('btn-principal', ativo);
            el.classList.toggle('btn-secundario', !ativo);
            el.setAttribute('aria-pressed', String(ativo));
        }
        if (lista) {
            cena.exemplo('#container-itens-lista-mes',
                ficha('Banana', '<p class="tour-linha"><span>Hortifrúti · 2 unidades</span><button class="btn-secundario" type="button" id="tour-levar-mercado">Levar ao mercado</button></p>'));
        } else {
            cena.exemplo('#corpo-tabela-planilha-mercado', `<tr><td><input type="checkbox" id="tour-carrinho" ${noCarrinho ? 'checked' : ''}></td>
                <td>Banana</td><td>2</td><td>4,50</td><td>9,00</td><td></td></tr>`);
            cena.texto('#valor-total-carrinho-mercado', noCarrinho ? 'R$ 9,00' : 'R$ 0,00');
        }
    }

    function registro(cena, receita = false, dados = {}) {
        cena.modal('modal-registro-rapido-financas');
        if (receita) tipoReceita(cena);
        for (const [id, valor] of Object.entries(dados)) cena.valor('#' + id, valor);
    }

    function tipoReceita(cena) {
        cena.q('#modal-registro-rapido-financas').dataset.finTipo = 'entrada';
        cena.valor('#select-fin-tipo', 'entrada');
        cena.q('#btn-toggle-tipo-despesa').setAttribute('aria-pressed', 'false');
        cena.q('#btn-toggle-tipo-receita').setAttribute('aria-pressed', 'true');
        cena.texto('#fin-confirmar-registro', 'Registrar receita');
        cena.q('#input-fin-descricao').placeholder = 'Ex. Aula particular';
    }

    const receita = {'input-fin-descricao': 'Aula particular', 'input-fin-valor': '120,00',
        'select-fin-categoria': 'Trabalho', 'select-fin-subcategoria': 'Aulas'};
    const despesa = {'input-fin-descricao': 'Farmácia', 'input-fin-valor': '25,00', 'select-fin-categoria': 'Saúde'};
    const mostrarBalanço = cena => {
        cena.q('#bloco-card-balanco-familiar').open = true;
        cena.valor('#data-inicio', '2026-06-01');
        cena.valor('#data-fim', '2026-06-30');
    };
    function relatorio(cena, formato = 'barras') {
        cena.q('#relatorio-pdf-container').classList.remove('oculto');
        cena.q('#acoes-botoes-relatorio').classList.remove('oculto');
        cena.valor('#relatorio-formato-grafico', formato);
        cena.texto('#titulo-grafico-categorias', 'Despesas por categoria');
        cena.texto('#periodo-grafico-balanco', '1 a 30 de junho · Todos os membros');
        const grafico = formato === 'pizza'
            ? '<div class="tour-pizza-demo" aria-label="Mercado 60%, Casa 40%"></div>'
            : '<div class="tour-barras-demo"><span>Mercado</span><i style="--parcela:60%"></i><span>Casa</span><i style="--parcela:40%"></i></div>';
        cena.exemplo('.fin-canvas', grafico);
        cena.exemplo('#legenda-grafico-categorias', '<li>Mercado · R$ 150,00 · 60%</li><li>Casa · R$ 100,00 · 40%</li>');
        if (!cena.q('#tour-extrato-exemplo')) {
            cena.exemplo('#area-resultados-relatorio', '<details id="tour-extrato-exemplo" class="cartao-geral"><summary>Ver mais · Extrato</summary><p>Mercado · R$ 150,00</p><p>Internet · R$ 100,00</p></details>');
        }
    }

    function configurar(cena) {
        cena.modal('modal-suiri-config');
        cena.q('#link-apk-android-config').hidden = false;
        cena.q('#link-apk-android-config').closest('[data-suiri-download-android]').hidden = false;
    }

    function memoria(cena, pares = 4) {
        const botoes = Array.from({length: pares * 2}, (_, i) =>
            `<button type="button" class="carta-arcade" id="tour-carta-${i}">?</button>`).join('');
        const grade = cena.q('#grade-memoria-arcade');
        grade.dataset.pares = pares;
        grade.innerHTML = botoes;
        cena.doc.querySelectorAll('[data-memoria-pares]').forEach(el => el.classList.toggle('ativo', Number(el.dataset.memoriaPares) === pares));
        cena.texto('#status-memoria-solo', `0/${pares} pares · 0 jogadas`);
    }

    function piano(cena) {
        const pista = cena.q('#pista-esteira-box');
        pista.style.background = 'linear-gradient(transparent 82%, #f6c184 83%, transparent 84%), repeating-linear-gradient(90deg, #2a3751 0 48px, #667991 49px 50px)';
        cena.texto('#piano-nota-atual', 'Dó4');
    }

    function arte(cena, aberto = false) {
        cena.q('#ferramentas-arte').open = aberto;
        if (aberto) {
            cena.exemplo('#paginas', '<button type="button" class="pagina" id="tour-borboleta"><img src="assets/images/arte/borboleta.svg" alt=""><span>Borboleta</span></button>');
        }
    }

    window.SuiriRoteiroManual = [
        {titulo: 'Navegação do Suíri', passos: [
            abrir('inicio', aba('calendario'), 'Abra a Agenda', 'Toque no ícone Agenda, na barra de baixo, para ver contas e compromissos.', 'calendario', '#mes-ano-calendario-titulo', agenda),
            abrir('calendario', aba('financeiro'), 'Encontre o saldo', 'Finanças mostra o saldo do seu perfil. A linha abaixo mostra o montante da família.', 'financeiro', '#lbl-saldo-carteira-membro'),
            abrir('financeiro', aba('inicio'), 'Volte às missões', 'Início traz as tarefas, as conquistas e as metas do ano.', 'inicio', '#btn-filtro-missao-todas')
        ]},
        {titulo: 'Perfis e permissões', passos: [
            {tela: 'inicio', alvo: '.perfil-hero-info', titulo: 'Troque de perfil', texto: 'Toque na foto do cabeçalho para escolher outro perfil do lar.', depois: perfis, resultado: '#tour-perfil-lia'},
            {tela: 'inicio', alvo: '#tour-perfil-lia', titulo: 'Entre no espaço Kids', texto: 'A criança tem uma tela com a Vila, seus jogos e as suas missões.', antes: perfis, abrir: 'kids', resultado: '#chuiri-vila-titulo'},
            abrir('inicio', aba('familia'), 'Gerencie a família', 'Abra Família para ver os membros. A adição e edição de perfis dependem das suas permissões.', 'familia', '#btn-novo-membro-familia'),
            {tela: 'familia', alvo: '#btn-novo-membro-familia', titulo: 'Adicione um membro', texto: 'Escolha o tipo de perfil e confira as áreas a que a pessoa terá acesso antes de salvar.', depois: abrirModal('modal-cadastro-familiar'), resultado: '#modal-cadastro-familiar h3'}
        ]},
        {titulo: 'Missões, da criação à conclusão', passos: [
            {tela: 'inicio', alvo: '#secao-inicio .btn-principal', titulo: 'Crie uma tarefa', texto: 'Em Início, toque em + Tarefa. Dê à missão um nome que diga o que precisa ser feito.', depois: tarefa, resultado: '#input-nova-missao-titulo'},
            {tela: 'inicio', alvo: '#input-nova-missao-titulo', titulo: 'Escreva o nome', texto: 'Digite a tarefa. Use a prioridade para definir a recompensa em XP.', antes: tarefa, digitar: 'Organizar a mochila', resultado: '#select-nova-missao-prioridade'},
            {tela: 'inicio', alvo: '#select-nova-missao-responsavel', titulo: 'Escolha quem vai fazer', texto: 'Escolha Casa para a família ou um perfil específico. Defina também quando a missão se repete.', antes: c => tarefa(c, true), depois: c => c.valor('#select-nova-missao-responsavel', 'lia'), resultado: '#select-nova-missao-responsavel'},
            {tela: 'inicio', alvo: acao('adicionarLinhaSubitemCriacao'), titulo: 'Inclua um checklist', texto: 'Use + Subitem para dividir a missão em etapas. Confira tudo e toque em Confirmar Missão.', antes: c => tarefa(c, true),
                depois: c => c.exemplo('#container-inputs-subitens-criacao', '<input value="Guardar os cadernos" aria-label="Subitem de exemplo">'), resultado: acao('adicionarNovaMissao')},
            {tela: 'kids', alvo: '#tour-missao-fiz', titulo: 'Marque como concluída', texto: 'Quando terminar, toque em Fiz. O XP aparece no perfil da criança.', antes: c => missaoKids(c), depois: c => missaoKids(c, true), resultado: '#lista-missoes-kids-container article'}
        ]},
        {titulo: 'Vila, missões Kids e lojinha', kids: true, passos: [
            {tela: 'kids', alvo: '#btn-chuiri-tamagotchi', titulo: 'Faça carinho no Chuíri', texto: 'Toque no personagem na Vila. O recado acima conta o que ele está sentindo.', depois: c => c.texto('#chuiri-recado-kids', 'O Chuíri adorou o carinho!')},
            {tela: 'kids', alvo: '#btn-casinha-tamagotchi', titulo: 'Entre na casinha', texto: 'Abra a casinha para encontrar a cama, a geladeira e o banho.', depois: abrirModal('modal-casinha-chuiri'), resultado: '#btn-acao-geladeira'},
            {tela: 'kids', alvo: '#btn-acao-geladeira', titulo: 'Escolha um lanche', texto: 'Na geladeira você pode dar um lanche ao Chuíri. Veja o preço em moedas antes de escolher.', antes: abrirModal('modal-casinha-chuiri'),
                depois: c => {
                    const menu = c.q('#menu-geladeira-chuiri');
                    menu.hidden = false;
                    menu.classList.remove('oculto');
                    c.q('#btn-acao-geladeira').setAttribute('aria-expanded', 'true');
                    if (!menu.textContent.trim()) menu.textContent = 'Fruta · 5 moedas';
                }, resultado: '#menu-geladeira-chuiri'},
            {tela: 'kids', alvo: '.chuiri-vila-atalhos button:first-child', titulo: 'Conheça a Lojinha', texto: 'Na Lojinha, confira as recompensas combinadas em casa e quanto XP elas custam.', depois: abrirModal('modal-ranking-equipe'), resultado: '#modal-ranking-equipe h3'},
            {tela: 'kids', alvo: '#tour-missao-fiz', titulo: 'Conclua uma missão', texto: 'Quando terminar a tarefa, marque Fiz. Se a tarefa permitir, você também pode marcar Fiz em partes.', antes: c => missaoKids(c), depois: c => missaoKids(c, true), resultado: '#lista-missoes-kids-container article'}
        ]},
        {titulo: 'Mercado e carrinho', passos: [
            {tela: 'mercado', alvo: '#btn-aba-lista-mes', titulo: 'Planeje com a Lista do Mês', texto: 'Abra Lista do Mês antes de sair. Use o formulário acima para incluir o que precisa comprar.', depois: c => mercado(c, true), resultado: '#input-novo-item-mercado'},
            {tela: 'mercado', alvo: '#input-novo-item-mercado', titulo: 'Adicione um produto', texto: 'Digite o nome ou use o microfone. Confira a categoria e quantidade antes de tocar em Adicionar Produto.', antes: c => mercado(c, true), digitar: 'Banana', depois: c => c.valor('#input-novo-item-qtd', '2'), resultado: acao('adicionarItemMercado')},
            {tela: 'mercado', alvo: '#btn-aba-modo-mercado', titulo: 'Passe para No Mercado', texto: 'Na loja, informe o preço de cada unidade. Marque a caixa da esquerda quando colocar o item no carrinho.', antes: c => mercado(c, true), depois: c => mercado(c, false), resultado: '#tour-carrinho'},
            {tela: 'mercado', alvo: '#tour-carrinho', titulo: 'Confira o total', texto: 'Duas bananas a R$ 4,50 dão R$ 9,00. Toque em Confirmar Compra só depois de conferir os itens e o total.', antes: c => mercado(c, false),
                depois: c => { c.q('#tour-carrinho').checked = true; c.texto('#valor-total-carrinho-mercado', 'R$ 9,00'); }, resultado: acao('finalizarCompraMercado')}
        ]},
        {titulo: 'Registrar receita ou despesa', passos: [
            {tela: 'financeiro', alvo: '.financeiro-acao-registro', titulo: 'Abra Registrar valor', texto: 'Em Finanças, toque no botão com o sinal de mais para abrir o lançamento.', depois: c => registro(c), resultado: '#btn-toggle-tipo-receita'},
            {tela: 'financeiro', alvo: '#btn-toggle-tipo-receita', titulo: 'Escolha Receita', texto: 'Para dinheiro que entrou, toque em Receita. Para gastos, use Despesa. O botão final muda de acordo com o tipo.', antes: c => registro(c), depois: tipoReceita, resultado: '#input-fin-descricao'},
            {tela: 'financeiro', alvo: '#input-fin-descricao', titulo: 'Informe a descrição e o valor', texto: 'Dê um nome que você reconheça no extrato. Neste exemplo, a entrada foi de R$ 120,00 por uma aula particular.', antes: c => registro(c, true), digitar: 'Aula particular', depois: c => c.valor('#input-fin-valor', receita['input-fin-valor']), resultado: '#input-fin-valor'},
            {tela: 'financeiro', alvo: '#select-fin-categoria', titulo: 'Organize por categoria', texto: 'Digite Trabalho e, na subcategoria, Aulas. Ao salvar, o sistema passa a sugerir esses nomes em receitas parecidas.', antes: c => registro(c, true, {'input-fin-descricao': 'Aula particular', 'input-fin-valor': '120,00'}), digitar: 'Trabalho', depois: c => c.valor('#select-fin-subcategoria', 'Aulas'), resultado: '#select-fin-subcategoria'},
            {tela: 'financeiro', alvo: '#select-fin-escopo', titulo: 'Escolha a visibilidade', texto: 'Selecione Pessoal se quiser manter os detalhes no seu perfil. Escolha Compartilhada para o lar.', antes: c => registro(c, true, receita), depois: c => c.valor('#select-fin-escopo', 'pessoal'), resultado: '#fin-confirmar-registro'},
            {tela: 'financeiro', alvo: '#fin-confirmar-registro', titulo: 'Confirme e veja o saldo', texto: 'Confira o tipo e o valor. No exemplo, a receita de R$ 120,00 aumenta o saldo de R$ 450,00 para R$ 570,00.', antes: c => registro(c, true, receita), abrir: 'financeiro',
                depois: c => c.texto('#lbl-saldo-carteira-membro', 'R$ 570,00'), resultado: '#lbl-saldo-carteira-membro'}
        ]},
        {titulo: 'Ditado e Cupom IA', passos: [
            {tela: 'financeiro', alvo: '#btn-mic-gastos', titulo: 'Dite uma despesa', texto: 'Toque no microfone e diga, por exemplo: “Gastei 25 reais na farmácia”. Confira os campos preenchidos.', antes: c => registro(c),
                depois: c => Object.entries(despesa).forEach(([id, v]) => c.valor('#' + id, v)), resultado: '#input-fin-valor'},
            {tela: 'financeiro', alvo: '.financeiro-acao-cupom', titulo: 'Leia um cupom', texto: 'Toque em Cupom IA. Você pode fotografar o cupom ou selecionar uma imagem que já tem no aparelho.', depois: abrirModal('modal-escolha-origem-cupom'), resultado: acao('acionarOrigemCupom')},
            {tela: 'financeiro', alvo: acao('acionarOrigemCupom'), titulo: 'Revise antes de gravar', texto: 'Após escolher a foto, a tela real pede consentimento para leitura pelo Gemini. Confira o rascunho antes de registrar.', antes: abrirModal('modal-escolha-origem-cupom'), abrir: 'financeiro',
                depois: c => registro(c, false, {'input-fin-descricao': 'Mercado do bairro', 'input-fin-valor': '52,90', 'select-fin-categoria': 'Mercado'}), resultado: '#input-fin-valor'}
        ]},
        {titulo: 'Balanço, gráficos e extrato', passos: [
            {tela: 'financeiro', alvo: '#bloco-card-balanco-familiar summary', titulo: 'Abra o Balanço Consolidado', texto: 'Escolha o intervalo de datas. Em Quem entra no balanço, selecione todos ou um membro específico.', depois: mostrarBalanço, resultado: '#data-inicio'},
            {tela: 'financeiro', alvo: acao('gerarRelatorio'), titulo: 'Gere o balanço', texto: 'O gráfico mostra em reais e em porcentagem quanto cada categoria representa no período.', antes: mostrarBalanço, depois: relatorio, resultado: '#titulo-grafico-categorias'},
            {tela: 'financeiro', alvo: '#relatorio-formato-grafico', titulo: 'Mude a visualização', texto: 'Escolha colunas, barras ou pizza. Você também pode agrupar os dados por subcategoria.', antes: relatorio, depois: c => relatorio(c, 'pizza'), resultado: '#legenda-grafico-categorias'},
            {tela: 'financeiro', alvo: '#tour-extrato-exemplo summary', titulo: 'Veja os lançamentos', texto: 'Abra Ver mais para consultar o extrato. Use Exportar PDF quando precisar guardar o balanço.', antes: relatorio, depois: c => { c.q('#tour-extrato-exemplo').open = true; }, resultado: '#tour-extrato-exemplo'}
        ]},
        {titulo: 'Contas, Agenda e cofres', passos: [
            {tela: 'calendario', alvo: acao('abrirModalAgendarContaSalario'), titulo: 'Agende uma conta', texto: 'Toque em Agendar Conta ou Salário Fixo. Informe descrição, valor, vencimento e se a conta se repete.', antes: c => agenda(c), depois: abrirModal('modal-agendar-conta-salario'), resultado: '#input-agenda-descricao'},
            {tela: 'calendario', alvo: '#input-agenda-descricao', titulo: 'Preencha a conta', texto: 'No exemplo, agendamos a internet de R$ 90,00 para dia 12. Revise o tipo antes de confirmar.', antes: abrirModal('modal-agendar-conta-salario'), digitar: 'Internet',
                depois: c => { c.valor('#input-agenda-valor', '90'); c.valor('#input-agenda-vencimento', '2026-06-12'); }, resultado: acao('adicionarItemAgendaFinanceira')},
            {tela: 'calendario', alvo: '#tour-baixa', titulo: 'Dê baixa após pagar', texto: 'Quando o dinheiro sair, toque em Já pago. Na conta real, confirme a baixa para atualizar o extrato.', antes: c => agenda(c), depois: c => agenda(c, undefined, true), resultado: '#grid-calendario-container article'},
            {tela: 'financeiro', alvo: '#bloco-card-cofres-compartilhados summary', titulo: 'Crie um cofre para um objetivo', texto: 'Abra Cofres do lar. Use Novo Cofre para cadastrar o objetivo e Guardar para fazer um aporte.',
                depois: c => { c.q('#bloco-card-cofres-compartilhados').open = true; }, resultado: acao('abrirModalDefinirMeta')}
        ]},
        {titulo: 'Arcade, piano e Espaço Arte', kids: true, passos: [
            abrir('kids', '.chuiri-atalho-arcade', 'Entre no Arcade', 'Na Vila, toque em Jogar no Arcade para ver os jogos.', 'jogos', '[data-arcade-jogo="memoria"]'),
            abrir('jogos', '[data-arcade-jogo="memoria"]', 'Escolha a Memória', 'Escolha quantos pares quer encontrar. Tabuleiros maiores têm mais cartas.', 'memoria', '[data-memoria-pares="16"]', memoria),
            {tela: 'memoria', alvo: '[data-memoria-pares="16"]', titulo: 'Experimente 16 pares', texto: 'Toque em 16 pares para montar um tabuleiro com 32 cartas. Depois vire duas cartas para procurar um par.', antes: memoria, depois: c => memoria(c, 16), resultado: '#tour-carta-0'},
            {tela: 'jogos', alvo: '.arcade-recordes-abrir', titulo: 'Veja seus recordes', texto: 'Abra Recordes e escolha o jogo. Os três melhores resultados são guardados no aparelho para o seu perfil.',
                depois: c => {
                    c.q('#arcade-recordes').open = true;
                    c.exemplo('#recordes-jogo', '<option>Chuíri Voador</option><option>Memória</option>');
                    c.exemplo('#recordes-resultados', '<h3>Solo</h3><ol><li><strong>12 troncos</strong></li><li><strong>9 troncos</strong></li><li><strong>7 troncos</strong></li></ol>');
                }, resultado: '#recordes-resultados'},
            abrir('jogos', '[data-arcade-jogo="simon"]', 'Abra o piano', 'Vire o aparelho para ganhar espaço. Use o botão Menu para escolher o modo e a música.', 'piano', '#piano-abrir-config', piano),
            {tela: 'piano', alvo: '#piano-abrir-config', titulo: 'Veja os modos do piano', texto: 'Em Aprender, siga a pista. Em Livre, toque as teclas. Em Dueto, combine as partes com outra pessoa.',
                antes: piano, depois: c => { c.q('#piano-configuracoes').open = true; }, resultado: '#tabs-piano-seletor-modos'},
            abrir('jogos', '.entrada-arte', 'Abra o Espaço Arte', 'O Espaço Arte tem uma folha em tela cheia. Abra Ferramentas para ver o caderno e os pincéis.', 'arte', '#abrir-ferramentas', arte),
            {tela: 'arte', alvo: '#abrir-ferramentas', titulo: 'Escolha ferramenta ou desenho', texto: 'Escolha um pincel e a cor, ou abra um desenho do caderno. Salvar PNG fica nesse mesmo menu.', depois: c => arte(c, true), resultado: '[data-pincel="cerdas"]'}
        ]},
        {titulo: 'Configurações e espaços pessoais', passos: [
            {tela: 'familia', alvo: acao('abrirConfiguracoesSuiri'), titulo: 'Abra Configurações', texto: 'Em Família, abra Configurações para escolher a aparência e encontrar o APK.', depois: configurar, resultado: '#suiri-config-tema'},
            {tela: 'familia', alvo: '#suiri-config-tema', titulo: 'Escolha o tema', texto: 'Escolha Claro, Escuro ou Seguir o sistema. Aqui só a tela de exemplo muda.', antes: configurar,
                depois: c => { c.doc.documentElement.dataset.theme = 'dark'; c.valor('#suiri-config-tema', 'escuro'); }, resultado: '#suiri-config-tema'},
            {tela: 'familia', alvo: '#btn-ativar-push', titulo: 'Ative os alertas', texto: 'No Android, toque em Ativar alertas e aceite a permissão do sistema. Este passo apenas mostra o botão.'},
            abrir('inicio', aba('meuespaco'), 'Encontre os espaços pessoais', 'Abra Meu Espaço para ver os atalhos de bem-estar e os espaços Mulher e Masculino.', 'meuespaco', '#card-acesso-espaco-mulher .btn-rodape-banner', c => c.q('#card-acesso-espaco-mulher').classList.remove('oculto'))
        ]}
    ];
})();
