/* Manual do Suíri Família. Cada demonstração acontece no próprio guia. */
(() => {
    const passos = [
        { titulo: 'Encontre o que precisa', lugar: 'Menu inferior · Início',
            texto: 'Use a barra inferior para navegar entre tarefas, compras, finanças, agenda e família. O cabeçalho mostra em qual perfil você está.',
            campos: [['Perfil', 'Casa da Ana'], ['Atalhos', 'Início · Mercado · Finanças · Agenda · Família']], acao: 'Simular o atalho Agenda', resultado: 'A Agenda abre com os próximos compromissos, pagamentos e recebimentos.' },
        { titulo: 'Perfis e permissões', lugar: 'Foto do perfil · Família',
            texto: 'Toque na sua foto para trocar de perfil. Em Família, o responsável pode adicionar pessoas, editar permissões e ligar os alertas do aparelho.',
            campos: [['Perfil de exemplo', 'Lia · Kids'], ['Permissão', 'Missões ativadas']], acao: 'Experimentar o perfil Kids', resultado: 'Lia vê as próprias tarefas, a Vila e o Arcade. Para voltar ao adulto, confirme o acesso solicitado.' },
        { titulo: 'Crie e conclua missões', lugar: 'Início · Missões',
            texto: 'Crie uma missão, escolha quem deve fazê-la e adicione passos se precisar. O responsável pode editar a tarefa depois.',
            campos: [['Tarefa', 'Organizar a mochila'], ['Para', 'Lia'], ['Recompensa', '20 XP']], acao: 'Simular “Fiz!”', resultado: 'A tarefa vai para as concluídas. Quando a missão permitir, “Fiz em partes” concede metade do XP.' },
        { titulo: 'Vila, Lojinha e mesada', lugar: 'Perfil Kids · Vila do Chuíri',
            texto: 'Faça carinho no Chuíri, abra a casinha ou visite a Lojinha. A família define os prêmios e pode escolher uma taxa de conversão de XP para cada criança.',
            campos: [['Moedas do Arcade', '54 moedas'], ['Lojinha', 'Recompensa combinada em casa']], acao: 'Simular uma troca de XP', resultado: 'O Suíri usa a taxa de conversão desse perfil. O adulto pode conferir o saldo e o resgate.' },
        { titulo: 'Planeje a compra e confira o carrinho', lugar: 'Mercado · Lista do Mês / No Mercado',
            texto: 'Faça a lista antes de sair. No mercado, marque os itens que entraram no carrinho e confira quantidade e preço unitário antes de finalizar.',
            campos: [['Produto', 'Banana'], ['Quantidade', '2'], ['Preço de cada', 'R$ 4,50']], acao: 'Simular o total do carrinho', resultado: '2 × R$ 4,50 = R$ 9,00. Na tela real, finalizar a compra lança o total no extrato.' },
        { titulo: 'Registre receita ou despesa', lugar: 'Finanças · Botão +',
            texto: 'Escolha Receita ou Despesa e confira o tipo antes de confirmar. Digite a categoria e a subcategoria. O Suíri guarda esses nomes para sugerir nos próximos lançamentos.',
            campos: [['Tipo', 'Receita'], ['Descrição', 'Aula particular'], ['Valor', 'R$ 120,00'], ['Categoria', 'Trabalho › Aulas']], acao: 'Simular o lançamento', resultado: 'O extrato ganha uma receita de R$ 120,00. “Trabalho › Aulas” fica disponível para futuras receitas.' },
        { titulo: 'Use o microfone ou leia um cupom', lugar: 'Finanças · Microfone / Cupom IA',
            texto: 'Dite o valor e a descrição pelo microfone ou fotografe o cupom. Na leitura do cupom, confirme se quer enviar a foto ao Google Gemini. Confira o rascunho antes de salvar.',
            campos: [['Exemplo de ditado', 'Gastei 25 reais na farmácia'], ['Tipo sugerido', 'Despesa']], acao: 'Ver o rascunho', resultado: 'Farmácia · R$ 25,00. Na tela real, você pode corrigir o valor, a descrição, a categoria e a visibilidade.' },
        { titulo: 'Acompanhe o saldo e os gastos', lugar: 'Finanças · Balanço / Previsão',
            texto: 'Escolha o período e os membros. O gráfico aparece primeiro, com legenda em reais e porcentagem. Use “Ver mais” para abrir o extrato e “Previsão e economia” para acompanhar o ritmo dos gastos.',
            campos: [['Grupo', 'Mercado · R$ 150'], ['Despesas do exemplo', 'R$ 250']], acao: 'Ler o gráfico de exemplo', resultado: 'Mercado representa 60% dos gastos. Em “Todos” você também pode comparar os membros da casa.' },
        { titulo: 'Organize contas, agenda e metas', lugar: 'Agenda · Finanças · Meu Espaço',
            texto: 'Agende uma conta a pagar ou receber e confirme quando o dinheiro sair ou entrar. Recados, cofres e metas ajudam a família a acompanhar o que vem depois.',
            campos: [['Conta', 'Internet'], ['Valor', 'R$ 90,00'], ['Status', 'A pagar']], acao: 'Simular a baixa', resultado: 'A conta muda para paga e gera o lançamento no extrato. Confira a data e o valor antes de confirmar.' },
        { titulo: 'Jogue no Arcade e faça arte', lugar: 'Vila · Jogar no Arcade',
            texto: 'Escolha o tamanho da Memória, vire o celular para tocar piano ou abra o Espaço Arte. No desenho, use Ferramentas para escolher pincel, cor, caderno e salvar.',
            campos: [['Memória', '4 a 32 pares'], ['Piano', 'Aprender, Livre ou Dueto'], ['Caderno', 'Fácil, médio e avançado']], acao: 'Experimentar o caderno', resultado: 'Escolha um desenho para abrir a folha. Ao terminar, toque em Ferramentas e depois em Salvar PNG.' },
        { titulo: 'Ajustes, Android e espaços pessoais', lugar: 'Família · Configurações / Meu Espaço',
            texto: 'Em Configurações, escolha o tema ou deixe seguir o aparelho e use o botão para baixar o APK. Meu Espaço reúne os atalhos de bem-estar, conteúdos e os Espaços Mulher e Homem.',
            campos: [['Tema', 'Seguir o celular'], ['Alertas no Android', 'Missões da família e fluxo de caixa']], acao: 'Simular a ativação de alertas', resultado: 'No Android, toque em Ativar alertas e aceite a permissão do sistema. Abra a notificação para ir direto à seção.' }
    ];
    const modal = document.getElementById('modal-tour-instrucoes');
    if (!modal) return;
    const campo = id => document.getElementById(id);
    const indice = campo('tour-indice');
    const proximo = campo('btn-tour-proximo');
    const anterior = campo('btn-tour-anterior');
    const narrar = campo('tour-narrar');
    const simular = campo('tour-simular');
    const resultado = campo('tour-resultado');
    const exemplo = campo('tour-exemplo');
    const selecaoKids = [1, 2, 3, 9];
    const native = navigator.userAgent.includes('SuiriFamiliaVoz/1');
    let roteiro = passos;
    let posicao = 0;
    let comVoz = false;

    function silenciar() {
        if (native) window.SuiriAndroid('stop-tour');
        else window.speechSynthesis?.cancel();
    }

    function ler(texto) {
        if (!comVoz) return;
        if (native) {
            window.SuiriTextoTour = texto;
            window.SuiriAndroid('speak-tour');
        } else if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
            silenciar();
            const frase = new SpeechSynthesisUtterance(texto);
            frase.lang = 'pt-BR';
            frase.rate = .92;
            const voz = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase() === 'pt-br');
            if (voz) frase.voice = voz;
            window.speechSynthesis.speak(frase);
        }
    }

    function renderizar() {
        const passo = roteiro[posicao];
        indice.value = String(posicao);
        campo('tour-passo-numero').textContent = `${posicao + 1} de ${roteiro.length}`;
        campo('tour-passo-titulo').textContent = passo.titulo;
        campo('tour-local').textContent = passo.lugar;
        campo('tour-passo-descricao').textContent = passo.texto;
        anterior.disabled = posicao === 0;
        proximo.textContent = posicao + 1 === roteiro.length ? 'Concluir' : 'Próximo →';
        exemplo.replaceChildren();
        for (const [rotulo, valor] of passo.campos) {
            const linha = document.createElement('div');
            const label = document.createElement('dt');
            const dado = document.createElement('dd');
            label.textContent = rotulo;
            dado.textContent = valor;
            linha.append(label, dado);
            exemplo.append(linha);
        }
        simular.textContent = passo.acao;
        simular.setAttribute('aria-expanded', 'false');
        resultado.hidden = true;
        resultado.textContent = '';
        modal.scrollTop = 0;
        ler(passo.titulo + '. ' + passo.texto);
    }

    window.iniciarTourInstrucoes = function() {
        roteiro = window.modoKidsAtivo ? selecaoKids.map(i => passos[i]) : passos;
        indice.replaceChildren(...roteiro.map(({titulo}, i) => new Option(titulo, String(i))));
        posicao = 0;
        if (!modal.open) {
            modal.classList.remove('oculto');
            modal.showModal();
        }
        renderizar();
    };
    window.navegarTour = function(direcao) {
        const destino = posicao + direcao;
        if (destino >= roteiro.length) modal.close();
        else if (destino >= 0) {
            posicao = destino;
            renderizar();
        }
    };
    window.encerrarTourInstrucoes = () => modal.close();
    modal.addEventListener('close', () => {
        modal.classList.add('oculto');
        if (comVoz) silenciar();
    });
    indice.addEventListener('change', () => {
        posicao = Number(indice.value);
        renderizar();
    });
    simular.addEventListener('click', () => {
        resultado.textContent = roteiro[posicao].resultado;
        resultado.hidden = false;
        simular.setAttribute('aria-expanded', 'true');
        resultado.scrollIntoView?.({block: 'nearest'});
        ler(roteiro[posicao].resultado);
    });
    narrar.hidden = !(native || (window.speechSynthesis && window.SpeechSynthesisUtterance));
    narrar.addEventListener('click', () => {
        comVoz = !comVoz;
        narrar.setAttribute('aria-pressed', String(comVoz));
        narrar.textContent = comVoz ? 'Parar narração' : 'Ouvir passo';
        if (comVoz) ler(roteiro[posicao].texto);
        else silenciar();
    });
})();
