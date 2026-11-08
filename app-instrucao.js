// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-INSTRUCAO.JS (100% COMPLETO E CONTROLADO)
// Tour Interativo Passo a Passo com Áudio Sincronizado, Fuga de Janela
// e Controle Manual por Clique ("Próximo" avança e toca o respectivo áudio)
// =========================================================================

let passoTourAtual = 0;
let canceladorExecucaoDemo = false;
let elementoFocadoAnterior = null;
let audioTourAtual = null;

// =========================================================================
// 1. GERENCIADOR DE ÁUDIO (audios/instrucao/)
// =========================================================================

function pararAudioInstrucao() {
    if (audioTourAtual) {
        audioTourAtual.pause();
        audioTourAtual.currentTime = 0;
        audioTourAtual.onended = null;
        audioTourAtual.onerror = null;
        audioTourAtual = null;
    }
}

function reproduzirAudioPasso(nomeArquivo) {
    pararAudioInstrucao();
    if (!nomeArquivo) return;

    try {
        audioTourAtual = new Audio(`audios/instrucao/${nomeArquivo}`);
        audioTourAtual.play().catch(erro => {
            console.warn("Aviso de áudio:", erro);
        });
    } catch (e) {
        console.error("Erro ao carregar o arquivo de áudio:", e);
    }
}

// =========================================================================
// 2. UTILITÁRIOS VISUAIS E FUGA INTELIGENTE DA JANELA
// =========================================================================

function esperarMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// A janela sai da frente de onde a instrução está apontando
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

    // Se o elemento estiver da metade para baixo, a janela sobe para o topo
    if (rect.top > (alturaJanela / 2) - 60) {
        modal.classList.remove('posicao-rodape');
        modal.classList.add('posicao-topo');
    } else {
        // Se estiver no topo, a janela desce para o rodapé
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
    if (canceladorExecucaoDemo) return null;

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

// Digitação simulada com pausas humanas e sem abrir teclado no celular
async function simularDigitacao(elementoInput, texto, velocidade = 80) {
    if (!elementoInput || canceladorExecucaoDemo) return;
    elementoInput.readOnly = true;
    elementoInput.value = '';
    
    await esperarMs(400); 
    
    for (let i = 0; i < texto.length; i++) {
        if (canceladorExecucaoDemo) {
            elementoInput.readOnly = false;
            return;
        }
        elementoInput.value += texto.charAt(i);
        await esperarMs(velocidade + (Math.random() * 25));
    }
    
    await esperarMs(600); 
}

// Clique simulado
async function simularCliqueVisual(elemento) {
    if (!elemento || canceladorExecucaoDemo) return;
    await esperarMs(350);
    elemento.classList.add('clique-simulado-tour');
    await esperarMs(300);
    elemento.classList.remove('clique-simulado-tour');
    await esperarMs(350);
}

// =========================================================================
// 3. ROTEIRO DOS QUADROS (CADA UM COM SEU ÁUDIO E ANIMAÇÃO)
// =========================================================================

const passosTourGuiado = [
    // -------------------------------------------------------------
    // QUADRO 1: APRESENTAÇÃO GERAL (Toca áudio 1 e aguarda "Próximo")
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Bem-vindo ao Suiri Gestão Familiar",
        descricao: "Este é o seu centro de comando. Aqui a família organiza tarefas, controla compras de supermercado, gere finanças individuais e conjuntas, e motiva as crianças com gamificação. Toque em 'Próximo' para conhecer o sistema passo a passo.",
        audio: "guia_geral_1.mp3",
        executarDemo: async () => {
            destacarElementoTour('#cabecalho-topo-usuario');
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // QUADRO 2: PERFIS E TROCA DE MEMBRO (Toca áudio 2)
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Passo 1: Perfis e Troca de Membro",
        descricao: "No topo da tela, sua foto de perfil está em destaque. Tocando no botão de dois membros ao lado, você alterna rapidamente para o parceiro ou filhos. Perfis adultos exigem PIN de 4 dígitos, enquanto o perfil Kids entra direto.",
        audio: "guia_geral_2.mp3",
        executarDemo: async () => {
            const btnTrocar = destacarElementoTour('#btn-trocar-membro-topo');
            await simularCliqueVisual(btnTrocar);
            await esperarMs(1000);
            destacarElementoTour('#cabecalho-topo-usuario');
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // QUADRO 3: MISSÕES E REGRAS (Toca áudio 3)
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Passo 2: Atribuir Missões e Regras",
        descricao: "Ao criar uma tarefa, defina prioridade e horário limite. Concluir no prazo dá 100% de XP. Se passar da hora, a recompensa cai para metade. Se marcar 'Não Fiz', há penalidade de perda de XP!",
        audio: "guia_geral_3.mp3",
        executarDemo: async () => {
            const btnIncluir = destacarElementoTour('button[onclick*="modal-nova-missao"]');
            await simularCliqueVisual(btnIncluir);
            document.getElementById('modal-nova-missao')?.classList.remove('oculto');
            await esperarMs(600);

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

    // -------------------------------------------------------------
    // QUADRO 4: LOJINHA E RECOMPENSAS (Toca áudio 4)
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Passo 3: A Lojinha de Recompensas",
        descricao: "O XP ganho nas tarefas tem valor real! Toque na Loja no topo para resgatar prêmios combinados pela família. Para as crianças, os pontos podem até ser convertidos em mesada financeira.",
        audio: "guia_geral_4.mp3",
        executarDemo: async () => {
            const btnLoja = destacarElementoTour('.btn-loja-topo');
            await simularCliqueVisual(btnLoja);
            if (typeof window.abrirModalRankingEquipe === 'function') {
                window.abrirModalRankingEquipe();
                await esperarMs(800);
                destacarElementoTour('#modal-ranking-equipe .modal-conteudo');
            }
        },
        limparDemo: () => {
            if (typeof window.fecharModalRankingEquipe === 'function') window.fecharModalRankingEquipe();
        }
    },

    // -------------------------------------------------------------
    // QUADRO 5: MODO KIDS E MASCOTE CHUÍRI (Toca áudio 5)
    // -------------------------------------------------------------
    {
        tela: 'inicio',
        titulo: "Passo 4: O Mascote Chuíri (Modo Kids)",
        descricao: "No perfil Kids, as crianças não veem botões bancários. Elas cumprem suas tarefas e usam as moedas para alimentar o Chuíri, que tem níveis de fome, sono e banho em tempo real.",
        audio: "guia_geral_5.mp3",
        executarDemo: async () => {
            destacarElementoTour('#cabecalho-topo-usuario');
            await esperarMs(1200);
        },
        limparDemo: () => {}
    },

    // -------------------------------------------------------------
    // QUADRO 6: SUPERMERCADO INTELIGENTE (Toca áudio 6)
    // -------------------------------------------------------------
    {
        tela: 'mercado',
        titulo: "Passo 5: Supermercado e IA",
        descricao: "Na aba Mercado, planeie na 'Lista do Mês'. No supermercado, use 'No Mercado' e digite os preços. O app avisa com borda verde promoções e vermelha inflação, além de ler notas por IA.",
        audio: "guia_geral_6.mp3",
        executarDemo: async () => {
            if (typeof window.alternarVisualizacaoMercado === 'function') window.alternarVisualizacaoMercado('lista');
            await esperarMs(500);

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

    // -------------------------------------------------------------
    // QUADRO 7: FINANÇAS, CARTEIRAS E VOZ (Toca áudio 7)
    // -------------------------------------------------------------
    {
        tela: 'financeiro',
        titulo: "Passo 6: Finanças por Voz e Transferências",
        descricao: "Minha Carteira mostra seu saldo pessoal. O Montante Familiar soma o patrimônio de todos. Toque no microfone para lançar gastos falando, ou transfira saldos entre familiares.",
        audio: "guia_geral_7.mp3",
        executarDemo: async () => {
            destacarElementoTour('.box-carteira-topo');
            await esperarMs(1000);
            const btnCupom = destacarElementoTour('button[onclick*="abrirModalOpcoesCupomIA"]');
            await simularCliqueVisual(btnCupom);
            document.getElementById('modal-escolha-origem-cupom')?.classList.remove('oculto');
            await esperarMs(1000);
        },
        limparDemo: () => {
            document.getElementById('modal-escolha-origem-cupom')?.classList.add('oculto');
        }
    },

    // -------------------------------------------------------------
    // QUADRO 8: CALENDÁRIO, COFRES E METAS (Toca áudio 8)
    // -------------------------------------------------------------
    {
        tela: 'calendario',
        titulo: "Passo 7: Calendário, Cofres e Relatórios",
        descricao: "Agende contas no Calendário. Ao clicar em 'Já Pago', o valor é debitado na hora da sua carteira. Acompanhe os Cofres Compartilhados e gere relatórios do mês em PDF.",
        audio: "guia_geral_8.mp3",
        executarDemo: async () => {
            destacarElementoTour('#grid-calendario-container');
            await esperarMs(1200);
        },
        limparDemo: () => {}
    }
];

// =========================================================================
// 4. CONTROLE DE NAVEGAÇÃO ("PRÓXIMO" E "ANTERIOR")
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
    // Interrompe imediatamente qualquer demo ou áudio do quadro anterior
    canceladorExecucaoDemo = true;
    pararAudioInstrucao();
    await esperarMs(60);
    canceladorExecucaoDemo = false;

    const passo = passosTourGuiado[passoTourAtual];
    if (!passo) return;

    // Dispara o áudio correspondente a este quadro
    if (passo.audio) {
        reproduzirAudioPasso(passo.audio);
    }

    const lblNumero = document.getElementById('tour-passo-numero');
    const lblTitulo = document.getElementById('tour-passo-titulo');
    const lblDesc = document.getElementById('tour-passo-descricao');
    const btnAnt = document.getElementById('btn-tour-anterior');
    const btnProx = document.getElementById('btn-tour-proximo');

    if (lblNumero) lblNumero.textContent = `Manual • Passo ${passoTourAtual + 1} de ${passosTourGuiado.length}`;
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

    // Muda para a aba correspondente do quadro
    if (passo.tela && typeof window.navegarParaTela === 'function') {
        window.navegarParaTela(passo.tela);
        await esperarMs(400);
    }

    // Executa a animação/destaque deste quadro
    if (!canceladorExecucaoDemo && typeof passo.executarDemo === 'function') {
        try {
            await passo.executarDemo();
        } catch (e) {
            console.warn("Tour demo:", e);
        }
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

    // Se o usuário clicar em "Próximo", avança para o próximo quadro e toca o respectivo áudio
    if (novoPasso >= 0 && novoPasso < passosTourGuiado.length) {
        passoTourAtual = novoPasso;
        await window.renderizarPassoTourAtual();
    } else if (novoPasso >= passosTourGuiado.length) {
        window.encerrarTourInstrucoes(true);
    }
};

window.encerrarTourInstrucoes = function(tocarAgradecimento = false) {
    canceladorExecucaoDemo = true;
    removerDestaqueElemento();
    pararAudioInstrucao();

    // Se concluiu todas as etapas, toca o áudio final de agradecimento
    if (tocarAgradecimento) {
        reproduzirAudioPasso("guia_final_agradecimento.mp3");
    }

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
        window.mostrarToast("Manual concluído! Bons registros familiares!");
    }
};
