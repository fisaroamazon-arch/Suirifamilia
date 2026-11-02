// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-INSTRUCAO.JS (100% COMPLETO E INTEGRAL)
// Tour Interativo: Reposicionamento Dinâmico Inteligente (Topo / Rodapé)
// Z-Index Absoluto e Bloqueio de Teclado Virtual no Mobile
// Atualizado com: Trocar Membro, Modo Kids e Metas Anuais
// Padrão de Diálogos e Ações: Confirmar / Cancelar
// =========================================================================

let passoTourAtual = 0;
let canceladorExecucaoDemo = false;
let elementoFocadoAnterior = null;

// =========================================================================
// 1. UTILITÁRIOS DE ANIMAÇÃO, SIMULAÇÃO E POSICIONAMENTO INTELIGENTE
// =========================================================================

function esperarMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ajustarPosicaoModalTour(elementoAlvo) {
    const modal = document.getElementById('modal-tour-instrucoes');
    if (!modal) return;

    if (!elementoAlvo) {
        modal.classList.remove('posicao-topo');
        modal.classList.add('posicao-rodape');
        return;
    }

    // Calcula a posição do elemento no ecrã
    const rect = elementoAlvo.getBoundingClientRect();
    const alturaJanela = window.innerHeight;

    // Se o elemento estiver localizado da metade para baixo, move o modal para o topo
    if (rect.top > (alturaJanela / 2) - 40) {
        modal.classList.remove('posicao-rodape');
        modal.classList.add('posicao-topo');
    } else {
        // Se estiver no topo, move o modal para o rodapé
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
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ajustarPosicaoModalTour(el);
    } else {
        ajustarPosicaoModalTour(null);
    }
    return el;
}

// Simulação de digitação bloqueando o teclado no telemóvel
async function simularDigitacao(elementoInput, texto, velocidade = 45) {
    if (!elementoInput) return;
    elementoInput.readOnly = true;
    elementoInput.value = '';
    
    for (let i = 0; i < texto.length; i++) {
        if (canceladorExecucaoDemo) {
            elementoInput.readOnly = false;
            return;
        }
        elementoInput.value += texto.charAt(i);
        await esperarMs(velocidade);
    }
}

async function simularCliqueVisual(elemento) {
    if (!elemento) return;
    elemento.classList.add('clique-simulado-tour');
    await esperarMs(200);
    elemento.classList.remove('clique-simulado-tour');
}

// =========================================================================
// 2. ROTEIRO DOS PASSOS DO TOUR COMPLETO
// =========================================================================

const passosTourGuiado = [
    // -------------------------------------------------------------
    // ETAPA 1: TROCAR MEMBRO & PERFIS COMPARTILHADOS
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Trocar Membro com 1 Toque",
        descricao: "No topo, toque no botão circular com os dois perfis para alternar de usuário rapidamente. Cada pessoa da família tem seu próprio espaço, carteira e histórico de tarefas.",
        executarDemo: async () => {
            const btnTrocar = destacarElementoTour('#btn-trocar-membro-topo');
            await simularCliqueVisual(btnTrocar);
            await esperarMs(600);
            destacarElementoTour('#cabecalho-topo-usuario');
        },
        limparDemo: () => {}
    },
    {
        tela: 'inicio',
        titulo: "Planos & Metas do Ano",
        descricao: "Logo abaixo do cabeçalho fica o painel de Metas do Ano. Toque em 'Ver Todos' para traçar grandes planos da Família (reformas, viagens) ou Metas Pessoais (cursos, leituras).",
        executarDemo: async () => {
            const btnMetas = destacarElementoTour('.cartao-geral button[onclick*="abrirModalMetasAnuais"]');
            await simularCliqueVisual(btnMetas);
            if (typeof window.abrirModalMetasAnuais === 'function') {
                window.abrirModalMetasAnuais();
                await esperarMs(600);
                destacarElementoTour('#modal-metas-anuais .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalMetasAnuais === 'function') window.fecharModalMetasAnuais();
        }
    },

    // -------------------------------------------------------------
    // ETAPA 2: MISSÕES, MURAL & GAMIFICAÇÃO
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Mural de Recados Rápidos",
        descricao: "Envie avisos para a casa toda ou para uma pessoa específica. Quem recebe toca em 'Lido' e quem enviou vê a confirmação em tempo real.",
        executarDemo: async () => {
            if (typeof window.fecharModalMetasAnuais === 'function') window.fecharModalMetasAnuais();
            const inRecado = destacarElementoTour('#input-novo-recado');
            if (inRecado) {
                await simularDigitacao(inRecado, "Favor colocar o lixo para fora hoje!");
                await esperarMs(500);
                const sel = destacarElementoTour('#select-recado-destinatario');
                if (sel && sel.options.length > 0) sel.selectedIndex = 0;
            }
        },
        limparDemo: () => {
            const el = document.getElementById('input-novo-recado');
            if (el) { el.value = ''; el.readOnly = false; }
        }
    },
    {
        tela: 'inicio',
        titulo: "Nova Missão Familiar",
        descricao: "Crie tarefas com XP e hora limite. As missões diárias reiniciam às 04:00 automaticamente. Se atrasar ganha metade dos pontos, e falhar desconta XP!",
        executarDemo: async () => {
            const inTitulo = destacarElementoTour('#input-nova-missao-titulo');
            if (inTitulo) {
                await simularDigitacao(inTitulo, "Regar as plantas do jardim");
                await esperarMs(400);
                destacarElementoTour('#select-nova-missao-prioridade');
                await esperarMs(400);
                const inHora = destacarElementoTour('#input-nova-missao-horario-limite');
                if (inHora) {
                    inHora.readOnly = true;
                    inHora.value = "10:30";
                }
            }
        },
        limparDemo: () => {
            const el1 = document.getElementById('input-nova-missao-titulo');
            const el2 = document.getElementById('input-nova-missao-horario-limite');
            if (el1) { el1.value = ''; el1.readOnly = false; }
            if (el2) { el2.value = ''; el2.readOnly = false; }
        }
    },
    {
        tela: 'inicio',
        titulo: "Pense: Pílula Diária & Sabedoria",
        descricao: "Às 07:00 da manhã o aplicativo sugere uma reflexão e dica financeira do dia para toda a família começar o dia com sabedoria.",
        executarDemo: async () => {
            const btnPense = destacarElementoTour('.btn-secundario[onclick*="abrirModalPilulaDia"]');
            await simularCliqueVisual(btnPense);
            if (typeof window.abrirModalPilulaDia === 'function') {
                window.abrirModalPilulaDia();
                await esperarMs(600);
                destacarElementoTour('#modal-pilula-dia .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalPilulaDia === 'function') window.fecharModalPilulaDia();
        }
    },
    {
        tela: 'inicio',
        titulo: "Pódio, Ofensiva & Loja de Recompensas",
        descricao: "Acompanhe seus dias seguidos de ofensiva, veja o pódio familiar de XP e troque seus pontos acumulados por recompensas criadas pela própria família!",
        executarDemo: async () => {
            if (typeof window.fecharModalPilulaDia === 'function') window.fecharModalPilulaDia();
            const btnLoja = destacarElementoTour('.btn-loja-topo');
            await simularCliqueVisual(btnLoja);
            if (typeof window.abrirModalRankingEquipe === 'function') {
                window.abrirModalRankingEquipe();
                await esperarMs(600);
                destacarElementoTour('#modal-ranking-equipe .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
        }
    },

    // -------------------------------------------------------------
    // ETAPA 3: SUPERMERCADO INTELIGENTE
    // -------------------------------------------------------------
    {
        tela: 'mercado',
        titulo: "Mercado: Planejamento (Lista do Mês)",
        descricao: "Na aba 'Lista do Mês', todos da casa podem incluir o que está faltando na despensa com sugestão de categoria e preço unitário.",
        executarDemo: async () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
            if (typeof window.alternarVisualizacaoMercado === 'function') window.alternarVisualizacaoMercado('lista');
            
            const inProduto = destacarElementoTour('#input-novo-item-mercado');
            if (inProduto) {
                await simularDigitacao(inProduto, "Café Torrado e Moído 500g");
                await esperarMs(400);
                const inQtd = destacarElementoTour('#input-novo-item-qtd');
                if (inQtd) { inQtd.readOnly = true; inQtd.value = "2"; }
                const inUnit = destacarElementoTour('#input-novo-item-unit');
                if (inUnit) { inUnit.readOnly = true; inUnit.value = "18.90"; }
                await esperarMs(500);
                destacarElementoTour('button[onclick*="adicionarItemMercado"]');
            }
        },
        limparDemo: () => {
            const inP = document.getElementById('input-novo-item-mercado');
            const inQ = document.getElementById('input-novo-item-qtd');
            const inU = document.getElementById('input-novo-item-unit');
            if (inP) { inP.value = ''; inP.readOnly = false; }
            if (inQ) { inQ.value = '1'; inQ.readOnly = false; }
            if (inU) { inU.value = ''; inU.readOnly = false; }
        }
    },
    {
        tela: 'mercado',
        titulo: "Modo 'No Mercado' (Carrinho em Tempo Real)",
        descricao: "Quando estiver no mercado, toque em 'No Mercado'. A lista vira uma planilha: você marca os itens comprados, ajusta o preço real e vê o total somado na hora!",
        executarDemo: async () => {
            const btnModo = destacarElementoTour('#btn-aba-modo-mercado');
            await simularCliqueVisual(btnModo);
            if (typeof window.alternarVisualizacaoMercado === 'function') {
                window.alternarVisualizacaoMercado('planilha');
            }
            await esperarMs(500);
            destacarElementoTour('.total-mercado-fixo');
        },
        limparDemo: () => {
            if (typeof window.alternarVisualizacaoMercado === 'function') window.alternarVisualizacaoMercado('lista');
        }
    },

    // -------------------------------------------------------------
    // ETAPA 4: FINANÇAS, CARTEIRA & MÚLTIPLOS COFRES
    // -------------------------------------------------------------
    {
        tela: 'financeiro',
        titulo: "Minha Carteira vs. Montante da Família",
        descricao: "O Suiri separa claramente o que é seu dinheiro individual e qual o saldo total acumulado por toda a família reunida.",
        executarDemo: async () => {
            destacarElementoTour('.box-carteira-topo');
            await esperarMs(1000);
            destacarElementoTour('#grafico-barras-mes-anterior');
        },
        limparDemo: () => {}
    },
    {
        tela: 'financeiro',
        titulo: "Reserva da Família: Múltiplos Cofres",
        descricao: "Crie múltiplos objetivos compartilhados (ex: Viagem, Reforma, Emergência). Toque em '+ Guardar' para depositar na sua poupança pessoal ou em um cofre coletivo.",
        executarDemo: async () => {
            const btnCofre = destacarElementoTour('button[onclick*="abrirModalDefinirMeta"]');
            await simularCliqueVisual(btnCofre);
            if (typeof window.abrirModalDefinirMeta === 'function') {
                window.abrirModalDefinirMeta();
                await esperarMs(500);
                const inTit = destacarElementoTour('#input-meta-titulo');
                if (inTit) await simularDigitacao(inTit, "Viagem de Fim de Ano");
                const inAlvo = destacarElementoTour('#input-meta-alvo');
                if (inAlvo) { inAlvo.readOnly = true; inAlvo.value = "3500"; }
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalDefinirMeta === 'function') window.fecharModalDefinirMeta();
            const inT = document.getElementById('input-meta-titulo');
            const inA = document.getElementById('input-meta-alvo');
            if (inT) { inT.value = ''; inT.readOnly = false; }
            if (inA) { inA.value = ''; inA.readOnly = false; }
        }
    },
    {
        tela: 'financeiro',
        titulo: "Lançamento Rápido por Voz",
        descricao: "Toque no microfone e diga: 'Almoço de 35 reais'. O aplicativo detecta automaticamente o valor, categoriza a despesa e prepara para salvar!",
        executarDemo: async () => {
            if (typeof window.fecharModalDefinirMeta === 'function') window.fecharModalDefinirMeta();
            const btnMic = destacarElementoTour('#btn-mic-gastos');
            await simularCliqueVisual(btnMic);
            const inDesc = destacarElementoTour('#input-fin-descricao');
            if (inDesc) {
                await simularDigitacao(inDesc, "Gasolina para o carro 150 reais");
                const inVal = destacarElementoTour('#input-fin-valor');
                if (inVal) { inVal.readOnly = true; inVal.value = "150.00"; }
                const selCat = destacarElementoTour('#select-fin-categoria');
                if (selCat) selCat.value = "Transporte";
            }
        },
        limparDemo: () => {
            const inD = document.getElementById('input-fin-descricao');
            const inV = document.getElementById('input-fin-valor');
            if (inD) { inD.value = ''; inD.readOnly = false; }
            if (inV) { inV.value = ''; inV.readOnly = false; }
        }
    },

    // -------------------------------------------------------------
    // ETAPA 5: AGENDA FINANCEIRA & EVENTOS DA CASA
    // -------------------------------------------------------------
    {
        tela: 'calendario',
        titulo: "Calendário Unificado da Casa",
        descricao: "Visualize no calendário do mês: Contas a pagar (pontos vermelhos), Salários/Recebimentos (pontos verdes) e Compromissos da família (pontos coloridos).",
        executarDemo: async () => {
            destacarElementoTour('#grid-calendario-container');
            await esperarMs(800);
            destacarElementoTour('.cartao-geral:has(#input-agenda-descricao)');
        },
        limparDemo: () => {}
    },
    {
        tela: 'calendario',
        titulo: "Agendar Novo Compromisso Familiar",
        descricao: "Festas, reuniões escolares ou consultas médicas podem ser agendadas com horário e cor de etiqueta personalizada para todos os membros visualizarem.",
        executarDemo: async () => {
            const btnCompromisso = destacarElementoTour('button[onclick*="abrirModalNovoEventoCalendario"]');
            await simularCliqueVisual(btnCompromisso);
            if (typeof window.abrirModalNovoEventoCalendario === 'function') {
                window.abrirModalNovoEventoCalendario();
                await esperarMs(500);
                const inEvTit = destacarElementoTour('#evento-titulo');
                if (inEvTit) await simularDigitacao(inEvTit, "Reunião de Pais e Mestres");
                const inIni = destacarElementoTour('#evento-hora-inicio');
                if (inIni) { inIni.readOnly = true; inIni.value = "19:00"; }
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalNovoEventoCalendario === 'function') window.fecharModalNovoEventoCalendario();
            const inT = document.getElementById('evento-titulo');
            const inH = document.getElementById('evento-hora-inicio');
            if (inT) { inT.value = ''; inT.readOnly = false; }
            if (inH) { inH.value = ''; inH.readOnly = false; }
        }
    },

    // -------------------------------------------------------------
    // ETAPA 6: MEMBROS DA FAMÍLIA, MODO KIDS & BALANÇO
    // -------------------------------------------------------------
    {
        tela: 'familia',
        titulo: "Gestão dos Membros & Perfil Kids",
        descricao: "Cadastre cada familiar com foto, papel e permissões. Marque 'Perfil Kids' para que crianças acessem com 1 toque no 'Trocar Membro', sem precisar de senha!",
        executarDemo: async () => {
            if (typeof window.fecharModalNovoEventoCalendario === 'function') window.fecharModalNovoEventoCalendario();
            destacarElementoTour('#lista-membros-cadastrados');
            await esperarMs(800);
            const btnAddMembro = destacarElementoTour('button[onclick*="abrirModalNovoMembro"]');
            await simularCliqueVisual(btnAddMembro);
            if (typeof window.abrirModalNovoMembro === 'function') {
                window.abrirModalNovoMembro();
                await esperarMs(600);
                destacarElementoTour('#modal-cadastro-familiar .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalNovoMembro === 'function') window.fecharModalNovoMembro();
        }
    },
    {
        tela: 'familia',
        titulo: "Balanço Financeiro Familiar em PDF",
        descricao: "Selecione o período e filtre por membro para compilar um balanço detalhado, visualizar o comparativo de Renda vs Gastos e exportar para PDF ou WhatsApp!",
        executarDemo: async () => {
            if (typeof window.fecharModalNovoMembro === 'function') window.fecharModalNovoMembro();
            destacarElementoTour('.cartao-geral:has(#filtro-membro-relatorio)');
            await esperarMs(700);
            destacarElementoTour('button[onclick*="gerarRelatorio"]');
        },
        limparDemo: () => {}
    }
];

// =========================================================================
// 3. CONTROLE DE NAVEGAÇÃO E EXECUÇÃO DO TOUR
// =========================================================================

window.iniciarTourInstrucoes = async function() {
    passoTourAtual = 0;
    canceladorExecucaoDemo = false;

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
    await esperarMs(50);
    canceladorExecucaoDemo = false;

    const passo = passosTourGuiado[passoTourAtual];
    if (!passo) return;

    const lblNumero = document.getElementById('tour-passo-numero');
    const lblTitulo = document.getElementById('tour-passo-titulo');
    const lblDesc = document.getElementById('tour-passo-descricao');
    const btnAnt = document.getElementById('btn-tour-anterior');
    const btnProx = document.getElementById('btn-tour-proximo');

    if (lblNumero) lblNumero.textContent = `Manual • Passo ${passoTourAtual + 1} de ${passosTourGuiado.length}`;
    if (lblTitulo) lblTitulo.textContent = passo.titulo;
    if (lblDesc) lblDesc.textContent = passo.descricao;

    if (btnAnt) btnAnt.style.display = passoTourAtual === 0 ? 'none' : 'block';
    if (btnProx) btnProx.textContent = (passoTourAtual === passosTourGuiado.length - 1) ? 'Confirmar ✓' : 'Próximo →';

    const containerBolinhas = document.getElementById('tour-indicadores-bolinhas');
    if (containerBolinhas) {
        containerBolinhas.innerHTML = passosTourGuiado.map((_, idx) => `
            <span style="display:inline-block; width:${idx === passoTourAtual ? '16px' : '6px'}; height:6px; border-radius:3px; background:${idx === passoTourAtual ? 'var(--cor-primaria, #d97706)' : '#cbd5e1'}; transition:all 0.3s ease; margin:0 2px;"></span>
        `).join('');
    }

    if (passo.tela && typeof window.navegarParaTela === 'function') {
        window.navegarParaTela(passo.tela);
    }

    try {
        if (typeof passo.executarDemo === 'function') {
            await passo.executarDemo();
        }
    } catch (e) {
        console.warn("Tour executado com supressão de interrupção:", e);
    }
};

window.navegarTour = async function(direcao) {
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
        'modal-metas-anuais'
    ].forEach(id => {
        document.getElementById(id)?.classList.add('oculto');
    });

    const modal = document.getElementById('modal-tour-instrucoes');
    if (modal) modal.classList.add('oculto');

    if (typeof window.navegarParaTela === 'function') {
        window.navegarParaTela('inicio');
    }
    window.mostrarToast("Manual concluído! Bons registros com o Suiri!");
};
