// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-INSTRUCAO.JS (100% COMPLETO E DETALHADO)
// Tour Interativo Premium: Animações Lentas, Reposicionamento Dinâmico
// Z-Index Absoluto, Foco Visual Prolongado e Explicações Detalhadas
// =========================================================================

let passoTourAtual = 0;
let canceladorExecucaoDemo = false;
let elementoFocadoAnterior = null;

// =========================================================================
// 1. UTILITÁRIOS DE ANIMAÇÃO E SIMULAÇÃO (RITMO LENTO E ELEGANTE)
// =========================================================================

function esperarMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Inteligência de Posicionamento: Foge do elemento destacado
function ajustarPosicaoModalTour(elementoAlvo) {
    const modal = document.getElementById('modal-tour-instrucoes');
    if (!modal) return;

    if (!elementoAlvo) {
        modal.classList.remove('posicao-topo');
        modal.classList.add('posicao-rodape');
        return;
    }

    const rect = elementoAlvo.getBoundingClientRect();
    const alturaJanela = window.innerHeight;

    // Se o elemento está na metade inferior, o manual sobe para o topo.
    // Se o elemento está no topo, o manual desce para o rodapé.
    if (rect.top > (alturaJanela / 2) - 60) {
        modal.classList.remove('posicao-rodape');
        modal.classList.add('posicao-topo');
    } else {
        modal.classList.remove('posicao-topo');
        modal.classList.add('posicao-rodape');
    }
}

function removerDestaqueElemento() {
    if (elementoFocadoAnterior) {
        elementoFocadoAnterior.classList.remove('destaque-tour-foco', 'clique-simulado-tour');
        elementoFocadoAnterior = null;
    }
    document.querySelectorAll('.destaque-tour-foco').forEach(el => {
        el.classList.remove('destaque-tour-foco', 'clique-simulado-tour');
    });
}

function destacarElementoTour(seletorOuElemento) {
    removerDestaqueElemento();
    const el = typeof seletorOuElemento === 'string' ? document.querySelector(seletorOuElemento) : seletorOuElemento;
    
    if (el) {
        el.classList.add('destaque-tour-foco');
        elementoFocadoAnterior = el;
        
        // Rola a tela suavemente para deixar o elemento bem no centro da visão
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Move o modal de instrução para fora do caminho
        ajustarPosicaoModalTour(el);
    } else {
        ajustarPosicaoModalTour(null);
    }
    return el;
}

// Simulação de digitação LENTA e humana (bloqueando teclado virtual)
async function simularDigitacao(elementoInput, texto, velocidade = 85) {
    if (!elementoInput) return;
    elementoInput.readOnly = true; // Impede que o teclado do celular suba
    elementoInput.value = '';
    
    // Pausa dramática antes de começar a digitar
    await esperarMs(500); 
    
    for (let i = 0; i < texto.length; i++) {
        if (canceladorExecucaoDemo) {
            elementoInput.readOnly = false;
            return;
        }
        elementoInput.value += texto.charAt(i);
        await esperarMs(velocidade + (Math.random() * 30)); // Variação leve para parecer real
    }
    
    // Pausa após terminar de digitar para o utilizador ler
    await esperarMs(800); 
}

// Efeito de toque demorado na tela
async function simularCliqueVisual(elemento) {
    if (!elemento) return;
    await esperarMs(400); // Aguarda o olho do utilizador focar no botão
    elemento.classList.add('clique-simulado-tour');
    await esperarMs(350); // Mantém o botão "pressionado" visualmente
    elemento.classList.remove('clique-simulado-tour');
    await esperarMs(400); // Pausa para a próxima janela abrir
}

// =========================================================================
// 2. ROTEIRO DETALHADO DOS PASSOS DO TOUR
// =========================================================================

const passosTourGuiado = [
    // -------------------------------------------------------------
    // ETAPA 1: CABEÇALHO, PERFIL & TROCA RÁPIDA DE MEMBRO
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "O Seu Perfil e Troca Rápida",
        descricao: "Bem-vindo ao Suiri! No topo da tela, a sua foto de perfil está em destaque. Se tocar no botão de duas pessoas ao lado, pode alternar para o perfil do seu parceiro ou dos seus filhos rapidamente. Perfis adultos são protegidos por um PIN de segurança, enquanto o perfil 'Kids' entra de imediato para facilitar o uso das crianças.",
        executarDemo: async () => {
            const btnTrocar = destacarElementoTour('#btn-trocar-membro-topo');
            await simularCliqueVisual(btnTrocar);
            await esperarMs(1200);
            destacarElementoTour('#cabecalho-topo-usuario');
        },
        limparDemo: () => {}
    },
    {
        tela: 'inicio',
        titulo: "Visão de Longo Prazo: Metas Anuais",
        descricao: "Logo abaixo do cabeçalho, temos os Planos do Ano. É aqui que planeamos os grandes sonhos: uma viagem em família, um curso novo ou a reforma da casa. Pode criar objetivos privados (apenas para si) ou coletivos (para toda a casa acompanhar).",
        executarDemo: async () => {
            const btnMetas = destacarElementoTour('.cartao-geral button[onclick*="abrirModalMetasAnuais"]');
            await simularCliqueVisual(btnMetas);
            if (typeof window.abrirModalMetasAnuais === 'function') {
                window.abrirModalMetasAnuais();
                await esperarMs(1000);
                destacarElementoTour('#modal-metas-anuais .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalMetasAnuais === 'function') window.fecharModalMetasAnuais();
        }
    },

    // -------------------------------------------------------------
    // ETAPA 2: MISSÕES, REGRAS E PENALIDADES
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Atribuir Missões (Com Responsabilidade)",
        descricao: "Ao criar uma tarefa, pode atribuí-la à casa, a um indivíduo ou às crianças (Modo Kids). Defina a prioridade e um horário limite. Atenção: missões cumpridas no prazo dão 100% dos pontos (XP). Se passar da hora limite, a recompensa cai para metade. Se marcar como 'Não Fiz', haverá penalidade de perda de XP!",
        executarDemo: async () => {
            if (typeof window.fecharModalMetasAnuais === 'function') window.fecharModalMetasAnuais();
            const btnIncluir = destacarElementoTour('button[onclick*="modal-nova-missao"]');
            await simularCliqueVisual(btnIncluir);
            document.getElementById('modal-nova-missao')?.classList.remove('oculto');
            await esperarMs(800);

            const inTitulo = destacarElementoTour('#input-nova-missao-titulo');
            if (inTitulo) {
                await simularDigitacao(inTitulo, "Arrumar os brinquedos na sala", 70);
                destacarElementoTour('#select-nova-missao-prioridade');
            }
        },
        limparDemo: () => {
            document.getElementById('modal-nova-missao')?.classList.add('oculto');
            const el1 = document.getElementById('input-nova-missao-titulo');
            if (el1) { el1.value = ''; el1.readOnly = false; }
        }
    },
    {
        tela: 'inicio',
        titulo: "Sabedoria Diária: O Momento 'Pense'",
        descricao: "Às 07:00 da manhã de cada dia, o aplicativo recebe-o com uma frase inspiradora e uma dica prática de economia. Uma excelente forma de toda a família começar a jornada com foco e sabedoria financeira.",
        executarDemo: async () => {
            const btnPense = destacarElementoTour('.btn-secundario[onclick*="abrirModalPilulaDia"]');
            await simularCliqueVisual(btnPense);
            if (typeof window.abrirModalPilulaDia === 'function') {
                window.abrirModalPilulaDia();
                await esperarMs(1000);
                destacarElementoTour('#modal-pilula-dia .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalPilulaDia === 'function') window.fecharModalPilulaDia();
        }
    },
    {
        tela: 'inicio',
        titulo: "A Lojinha de Recompensas e o Pódio",
        descricao: "Os pontos de XP não servem apenas para subir de nível! Eles têm valor real. Toque no ícone da 'Loja' no topo para trocar o seu esforço por prémios definidos pela família (ex: 'Passe livre da louça' ou 'Escolher o jantar'). No caso das crianças, os pontos podem até ser convertidos em mesada.",
        executarDemo: async () => {
            if (typeof window.fecharModalPilulaDia === 'function') window.fecharModalPilulaDia();
            const btnLoja = destacarElementoTour('.btn-loja-topo');
            await simularCliqueVisual(btnLoja);
            if (typeof window.abrirModalRankingEquipe === 'function') {
                window.abrirModalRankingEquipe();
                await esperarMs(1000);
                destacarElementoTour('#modal-ranking-equipe .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
        }
    },

    // -------------------------------------------------------------
    // ETAPA 3: SUPERMERCADO INTELIGENTE E IA
    // -------------------------------------------------------------
    {
        tela: 'mercado',
        titulo: "O Supermercado: Planeamento vs. Execução",
        descricao: "Aba Mercado: Primeiro, planeie o mês adicionando itens em falta na 'Lista'. Quando for ao supermercado, mude para 'No Mercado'. A lista vira uma planilha viva: digite o preço e veja o total do carrinho aumentar.",
        executarDemo: async () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
            if (typeof window.alternarVisualizacaoMercado === 'function') window.alternarVisualizacaoMercado('lista');
            
            await esperarMs(800);
            const inProduto = destacarElementoTour('#input-novo-item-mercado');
            if (inProduto) {
                await simularDigitacao(inProduto, "Azeite de Oliva Extra Virgem", 60);
                destacarElementoTour('button[onclick*="adicionarItemMercado"]');
            }
        },
        limparDemo: () => {
            const inP = document.getElementById('input-novo-item-mercado');
            if (inP) { inP.value = ''; inP.readOnly = false; }
        }
    },
    {
        tela: 'mercado',
        titulo: "Alertas Históricos de Preços",
        descricao: "O Suiri decora todos os preços. Se na planilha do supermercado o preço de um item tiver uma borda verde, parabéns, encontrou uma promoção abaixo da média! Se ficar com borda vermelha espessa, significa que o produto sofreu inflação. Na finalização, o app gera sugestões de cardápios com os ingredientes que comprou.",
        executarDemo: async () => {
            destacarElementoTour('#bloco-lista-planejamento-mercado');
            await esperarMs(1200);
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // ETAPA 4: ABA FINANÇAS (LANÇAMENTOS E CARTEIRAS)
    // -------------------------------------------------------------
    {
        tela: 'financeiro',
        titulo: "Carteiras Separadas e Transparentes",
        descricao: "Repare no topo: 'Minha Carteira' reflete apenas o SEU dinheiro e os seus lançamentos. O 'Montante da Família' abaixo é a soma de todos os membros. Pode realizar 'Transferências' entre carteiras de forma imediata (ex: dar mesada ao filho).",
        executarDemo: async () => {
            destacarElementoTour('.box-carteira-topo');
            await esperarMs(1500);
        },
        limparDemo: () => {}
    },
    {
        tela: 'financeiro',
        titulo: "Lançamentos Rápidos: Voz e IA",
        descricao: "Não tem paciência para digitar? Toque no Microfone e diga 'Combustível 120 reais' – o sistema preenche tudo por si. Ou clique em 'Ler Cupom Fiscal (IA)' e tire uma foto do recibo para a Inteligência Artificial extrair todos os gastos automaticamente.",
        executarDemo: async () => {
            const btnCupom = destacarElementoTour('button[onclick*="abrirModalOpcoesCupomIA"]');
            await simularCliqueVisual(btnCupom);
            document.getElementById('modal-escolha-origem-cupom')?.classList.remove('oculto');
            await esperarMs(1200);
        },
        limparDemo: () => {
            document.getElementById('modal-escolha-origem-cupom')?.classList.add('oculto');
        }
    },
    {
        tela: 'financeiro',
        titulo: "Balanço, Extrato Nominal e Cofres",
        descricao: "Ao rolar a página de finanças, encontrará: o Balanço Oficial (que gera PDFs com gráficos comparativos de quem gastou mais), o Extrato Detalhado de todas as transações, e os Cofres da Família, que exibem uma barra de progresso visual para as vossas economias conjuntas.",
        executarDemo: async () => {
            destacarElementoTour('#bloco-card-balanco-familiar');
            await esperarMs(1200);
            destacarElementoTour('#lista-extrato-carteira');
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // ETAPA 5: CALENDÁRIO E DEBITOS
    // -------------------------------------------------------------
    {
        tela: 'calendario',
        titulo: "Agenda Integrada com as Finanças",
        descricao: "O calendário mostra compromissos (Azul), contas a pagar (Vermelho) e a receber (Verde). A grande vantagem: ao tocar em 'Já Pago' no calendário, a conta desaparece da agenda e o valor é debitado de imediato na sua carteira de finanças!",
        executarDemo: async () => {
            destacarElementoTour('#grid-calendario-container');
            await esperarMs(1500);
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // ETAPA 6: FAMÍLIA, KIDS E CONCLUSÃO
    // -------------------------------------------------------------
    {
        tela: 'familia',
        titulo: "Gestão do Lar e Modo Kids",
        descricao: "Na aba Família, o Administrador gere quem entra, edita permissões e cadastra as crianças. Quando entra no 'Perfil Kids', o aplicativo transforma-se numa casinha animada com o mascote Chuíri, onde a criança cumpre rotinas sem qualquer acesso a dados bancários dos adultos.",
        executarDemo: async () => {
            destacarElementoTour('#lista-membros-cadastrados');
            await esperarMs(1200);
            const btnAddMembro = destacarElementoTour('#btn-novo-membro-familia');
            await simularCliqueVisual(btnAddMembro);
        },
        limparDemo: () => {}
    }
];

// =========================================================================
// 3. CONTROLE DE NAVEGAÇÃO E EXECUÇÃO FLUIDA DO TOUR
// =========================================================================

window.iniciarTourInstrucoes = async function() {
    passoTourAtual = 0;
    canceladorExecucaoDemo = false;

    // Desfoca qualquer campo ativo para evitar teclado nativo na tela
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    const modal = document.getElementById('modal-tour-instrucoes');
    if (!modal) return;

    modal.classList.remove('oculto');
    ajustarPosicaoModalTour(null);
    await window.renderizarPassoTourAtual();
};

window.renderizarPassoTourAtual = async function() {
    canceladorExecucaoDemo = true;
    await esperarMs(80); // Micro-pausa para garantir limpeza
    canceladorExecucaoDemo = false;

    const passo = passosTourGuiado[passoTourAtual];
    if (!passo) return;

    const lblNumero = document.getElementById('tour-passo-numero');
    const lblTitulo = document.getElementById('tour-passo-titulo');
    const lblDesc = document.getElementById('tour-passo-descricao');
    const btnAnt = document.getElementById('btn-tour-anterior');
    const btnProx = document.getElementById('btn-tour-proximo');

    if (lblNumero) lblNumero.textContent = `Guia Completo • Passo ${passoTourAtual + 1} de ${passosTourGuiado.length}`;
    if (lblTitulo) lblTitulo.textContent = passo.titulo;
    if (lblDesc) lblDesc.textContent = passo.descricao;

    if (btnAnt) btnAnt.style.display = passoTourAtual === 0 ? 'none' : 'block';
    if (btnProx) btnProx.textContent = (passoTourAtual === passosTourGuiado.length - 1) ? 'Concluir ✓' : 'Próximo →';

    const containerBolinhas = document.getElementById('tour-indicadores-bolinhas');
    if (containerBolinhas) {
        containerBolinhas.innerHTML = passosTourGuiado.map((_, idx) => `
            <span style="display:inline-block; width:${idx === passoTourAtual ? '16px' : '6px'}; height:6px; border-radius:3px; background:${idx === passoTourAtual ? 'var(--cor-primaria, #d97706)' : '#cbd5e1'}; transition:all 0.4s ease; margin:0 2px;"></span>
        `).join('');
    }

    // Navega para a aba correta com antecedência
    if (passo.tela && typeof window.navegarParaTela === 'function') {
        window.navegarParaTela(passo.tela);
        await esperarMs(400); // Aguarda a animação de deslizamento da tela terminar
    }

    try {
        if (typeof passo.executarDemo === 'function') {
            await passo.executarDemo();
        }
    } catch (e) {
        console.warn("Tour em execução:", e);
    }
};

window.navegarTour = async function(direcao) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }

    const passoAnterior = passosTourGuiado[passoTourAtual];
    if (passoAnterior && typeof passoAnterior.limparDemo === 'function') {
        passoAnterior.limparDemo();
    }
    removerDestaqueElemento();

    const novoPasso = passoTourAtual + direcao;
    if (novoPasso >= 0 && novoPasso < passosTourGuiado.length) {
        passoTourAtual = novoPasso;
        await window.renderizarPassoTourAtual();
    } else if (novoPasso >= passosTourGuiado.length) {
        window.encerrarTourInstrucoes();
    }
};

window.encerrarTourInstrucoes = function() {
    canceladorExecucaoDemo = true;
    removerDestaqueElemento();

    // Executa a limpeza em todas as rotinas caso algo fique preso
    passosTourGuiado.forEach(p => {
        if (typeof p.limparDemo === 'function') {
            try { p.limparDemo(); } catch (e) {}
        }
    });

    [
        'modal-pilula-dia', 
        'modal-ranking-equipe', 
        'modal-definir-meta', 
        'modal-novo-evento-calendario', 
        'modal-cadastro-familiar',
        'modal-metas-anuais',
        'modal-escolha-origem-cupom'
    ].forEach(id => {
        document.getElementById(id)?.classList.add('oculto');
    });

    const modal = document.getElementById('modal-tour-instrucoes');
    if (modal) modal.classList.add('oculto');

    if (typeof window.navegarParaTela === 'function') {
        window.navegarParaTela('inicio');
    }
    
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Manual concluído! Bons registos e excelente gestão familiar!");
    }
};
