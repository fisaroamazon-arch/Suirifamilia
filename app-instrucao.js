// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-INSTRUCAO.JS (100% COMPLETO E INTEGRAL)
// Tour Interativo: Reposicionamento Dinâmico Inteligente (Topo / Rodapé)
// Z-Index Absoluto e Bloqueio de Teclado Virtual no Mobile
// Atualizado com: Trocar Membro, Modo Kids, Metas Anuais & Nova Ordem Finanças
// Padrão de Diálogos e Ações: Confirmar / Cancelar (Zero Emojis)
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

    const rect = elementoAlvo.getBoundingClientRect();
    const alturaJanela = window.innerHeight;

    // Se o elemento estiver localizado da metade para baixo, move o modal para o topo
    if (rect.top > (alturaJanela / 2) - 40) {
        modal.classList.remove('posicao-rodape');
        modal.classList.add('posicao-topo');
    } else {
        // Se estiver no topo, move o modal para o rodapé (acima da barra inferior fixa)
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
    // ETAPA 1: CABEÇALHO, PERFIL & TROCA RÁPIDA DE MEMBRO
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Perfil com Foto Ampliada & Troca de Membro",
        descricao: "No topo, sua foto de perfil surge em destaque. Toque no botão 'Trocar' para alternar rapidamente entre os membros da casa. Cada familiar possui seu próprio histórico e carteira.",
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
        descricao: "No fim da página inicial fica o painel de Metas do Ano. Toque em 'Ver Todos' para traçar grandes planos da Família (viagens, reformas) ou Metas Pessoais (cursos, estudos).",
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
    // ETAPA 2: MISSÕES COM ORDENAÇÃO INTELIGENTE
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Nova Missão para a Casa",
        descricao: "Cadastre tarefas para a família com checklist de etapas e horário limite. Conforme as missões são cumpridas, elas descem automaticamente para o final da lista!",
        executarDemo: async () => {
            if (typeof window.fecharModalMetasAnuais === 'function') window.fecharModalMetasAnuais();
            const btnIncluir = destacarElementoTour('button[onclick*="modal-nova-missao"]');
            await simularCliqueVisual(btnIncluir);
            document.getElementById('modal-nova-missao')?.classList.remove('oculto');
            await esperarMs(400);

            const inTitulo = destacarElementoTour('#input-nova-missao-titulo');
            if (inTitulo) {
                await simularDigitacao(inTitulo, "Organizar brinquedos na sala");
                await esperarMs(400);
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
        titulo: "Pense: Sabedoria Familiar",
        descricao: "Às 07:00 da manhã, o aplicativo sugere uma frase inspiradora e uma dica prática de economia para toda a casa começar o dia com sabedoria.",
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
        titulo: "Ofensiva, Pódio & Recompensas",
        descricao: "Acompanhe seus dias seguidos de ofensiva e troque os pontos (XP) ganhos nas tarefas por recompensas na lojinha da família!",
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
        titulo: "Lista do Mês & No Mercado",
        descricao: "Planeje as compras na aba 'Lista do Mês'. Ao chegar no mercado, mude para 'No Mercado' e transforme a lista em planilha viva com cálculo de carrinho em tempo real.",
        executarDemo: async () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
            if (typeof window.alternarVisualizacaoMercado === 'function') window.alternarVisualizacaoMercado('lista');
            
            const inProduto = destacarElementoTour('#input-novo-item-mercado');
            if (inProduto) {
                await simularDigitacao(inProduto, "Azeite de Oliva Extra Virgem");
                await esperarMs(400);
                destacarElementoTour('button[onclick*="adicionarItemMercado"]');
            }
        },
        limparDemo: () => {
            const inP = document.getElementById('input-novo-item-mercado');
            if (inP) { inP.value = ''; inP.readOnly = false; }
        }
    },

    // -------------------------------------------------------------
    // ETAPA 4: ABA FINANÇAS (NOVA ESTRUTURA RIGOROSA)
    // -------------------------------------------------------------
    {
        tela: 'financeiro',
        titulo: "1º Item: Minha Carteira & Montante Coletivo",
        descricao: "No topo das Finanças, visualize seu saldo pessoal separado do montante total acumulado por todos os membros com cartão da família.",
        executarDemo: async () => {
            destacarElementoTour('.box-carteira-topo');
            await esperarMs(1000);
        },
        limparDemo: () => {}
    },
    {
        tela: 'financeiro',
        titulo: "2º Item: Ler Cupom Fiscal com IA",
        descricao: "Toque em 'Ler Cupom Fiscal (IA)' e escolha entre tirar foto na hora com a câmara ou carregar um comprovante da galeria para lançar tudo automaticamente!",
        executarDemo: async () => {
            const btnCupom = destacarElementoTour('button[onclick*="abrirModalOpcoesCupomIA"]');
            await simularCliqueVisual(btnCupom);
            document.getElementById('modal-escolha-origem-cupom')?.classList.remove('oculto');
            await esperarMs(700);
        },
        limparDemo: () => {
            document.getElementById('modal-escolha-origem-cupom')?.classList.add('oculto');
        }
    },
    {
        tela: 'financeiro',
        titulo: "3º Item: Registo Rápido com Microfone",
        descricao: "Diga 'Almoço 45 reais' no microfone para a IA detetar valor, tipo e categoria de imediato, deixando tudo pronto para salvar com 1 toque.",
        executarDemo: async () => {
            document.getElementById('modal-escolha-origem-cupom')?.classList.add('oculto');
            const inDesc = destacarElementoTour('#input-fin-descricao');
            if (inDesc) {
                await simularDigitacao(inDesc, "Combustível 120 reais");
                const inVal = destacarElementoTour('#input-fin-valor');
                if (inVal) { inVal.readOnly = true; inVal.value = "120.00"; }
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
    {
        tela: 'financeiro',
        titulo: "4º Item: Balanço Familiar & Gráfico Comparativo",
        descricao: "Agora alocado nas Finanças! Gere o fechamento do período, veja o gráfico comparativo de Renda vs Gastos Próprios por pessoa e exporte em PDF ou WhatsApp.",
        executarDemo: async () => {
            destacarElementoTour('#bloco-card-balanco-familiar');
            await esperarMs(700);
            destacarElementoTour('button[onclick*="gerarRelatorio"]');
        },
        limparDemo: () => {}
    },
    {
        tela: 'financeiro',
        titulo: "5º, 6º e 7º Itens: Extrato, Meta & Cofres",
        descricao: "Logo abaixo ficam o Extrato Nominal detalhado, a barra de Meta de Poupança do mês e os Cofres do Lar para guardar reservas da casa.",
        executarDemo: async () => {
            destacarElementoTour('#lista-extrato-carteira');
            await esperarMs(600);
            destacarElementoTour('#bloco-card-cofres-compartilhados');
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // ETAPA 5: CALENDÁRIO & CONTAS DA CASA
    // -------------------------------------------------------------
    {
        tela: 'calendario',
        titulo: "Agenda & Contas da Casa",
        descricao: "Acompanhe contas a pagar (pontos vermelhos), salários (pontos verdes) e eventos da família. Ao pagar uma conta, dê baixa para debitar na carteira na hora!",
        executarDemo: async () => {
            destacarElementoTour('#grid-calendario-container');
            await esperarMs(800);
            destacarElementoTour('.cartao-geral:has(#input-agenda-descricao)');
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // ETAPA 6: MEMBROS & PERFIL KIDS
    // -------------------------------------------------------------
    {
        tela: 'familia',
        titulo: "Membros da Família & Modo Kids",
        descricao: "Cadastre cada familiar com foto e permissões. Ao ativar o 'Perfil Kids', as crianças acessam sua rotina gamificada com 1 toque, sem precisar de senha!",
        executarDemo: async () => {
            destacarElementoTour('#lista-membros-cadastrados');
            await esperarMs(800);
            const btnAddMembro = destacarElementoTour('#btn-novo-membro-familia');
            await simularCliqueVisual(btnAddMembro);
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
    window.mostrarToast("Manual concluído! Bons registros com o Suiri!");
};
