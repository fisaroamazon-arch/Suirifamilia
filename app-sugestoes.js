// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SUGESTOES.JS (100% COMPLETO E UNIFICADO)
// Motor do Carrossel de Sugestões de Tarefas (Adultos & Kids)
// Detector Inteligente de Emojis Concordantes para Crianças e SVGs Adultos
// Compatibilidade Total de IDs e Gestos de Deslize (Swipe)
// =========================================================================

// 1. DETECTOR INTELIGENTE DE EMOJI CONCORDANTE PARA O UNIVERSO KIDS
window.obterEmojiConcordanteKids = function(titulo, emojiSalvo) {
    if (emojiSalvo && typeof emojiSalvo === 'string') {
        const limpo = emojiSalvo.trim();
        const nomesSvgAntigos = [
            'estrela', 'alvo', 'default', 'escova', 'escovadente', 'cama', 'agua', 'gota',
            'livro', 'caixa', 'blocos', 'vassoura', 'lista', 'agenda', 'calculadora',
            'coracao', 'escudo', 'urso', 'banheira', 'refeicao', 'patinha', 'flor',
            'bicicleta', 'sol', 'bola', 'lua', 'musica', 'cenoura', 'maca', 'camisa', 'lixo'
        ];
        if (limpo.length > 0 && limpo.length <= 5 && limpo !== '⭐' && !nomesSvgAntigos.includes(limpo.toLowerCase()) && !limpo.startsWith('<svg')) {
            return limpo;
        }
    }

    const t = String(titulo || '').toLowerCase();
    if (t.includes('dente') || t.includes('escovar') || t.includes('fio dental')) return '🪥';
    if (t.includes('cama') || t.includes('lençol') || t.includes('lencol') || t.includes('travesseiro')) return '🛏️';
    if (t.includes('brinquedo') || t.includes('guardar') || t.includes('bonec') || t.includes('carrinho') || t.includes('lego')) return '🧸';
    if (t.includes('água') || t.includes('agua') || t.includes('beber') || t.includes('garrafinha') || t.includes('hidrat')) return '💧';
    if (t.includes('livr') || t.includes('ler') || t.includes('leitura') || t.includes('história') || t.includes('historia')) return '📖';
    if (t.includes('banho') || t.includes('lavar o corpo') || t.includes('cheiros') || t.includes('chuveiro')) return '🛀';
    if (t.includes('fruta') || t.includes('maçã') || t.includes('maca') || t.includes('banana') || t.includes('lanche')) return '🍎';
    if (t.includes('mão') || t.includes('mao') || t.includes('sabão') || t.includes('sabao') || t.includes('unha')) return '🧼';
    if (t.includes('mesa') || t.includes('prato') || t.includes('louça') || t.includes('louca') || t.includes('almoço') || t.includes('jantar') || t.includes('talher')) return '🍽️';
    if (t.includes('pet') || t.includes('cachorro') || t.includes('gato') || t.includes('ração') || t.includes('racao') || t.includes('bichinho')) return '🐶';
    if (t.includes('tarefa') || t.includes('lição') || t.includes('licao') || t.includes('escola') || t.includes('estudar') || t.includes('dever')) return '✏️';
    if (t.includes('dormir') || t.includes('sono') || t.includes('deitar') || t.includes('noite')) return '😴';
    if (t.includes('sapato') || t.includes('calçado') || t.includes('calcado') || t.includes('tênis') || t.includes('tenis') || t.includes('chinelo')) return '👟';
    if (t.includes('mochila') || t.includes('material') || t.includes('caderno') || t.includes('estojo')) return '🎒';
    if (t.includes('lixo') || t.includes('cesto') || t.includes('recicla') || t.includes('papel')) return '🗑️';
    if (t.includes('abraç') || t.includes('abrac') || t.includes('carinho') || t.includes('beijo') || t.includes('pais') || t.includes('família')) return '🤗';
    if (t.includes('legume') || t.includes('salada') || t.includes('verdura') || t.includes('brócolis') || t.includes('brocolis') || t.includes('cenoura')) return '🥦';
    if (t.includes('roupa') || t.includes('vestir') || t.includes('pijama') || t.includes('dobrar') || t.includes('meia')) return '👕';
    if (t.includes('tela') || t.includes('celular') || t.includes('tv') || t.includes('brincar') || t.includes('jogo') || t.includes('quebra-cabeça')) return '🧩';
    if (t.includes('favor') || t.includes('obrigad') || t.includes('mágic') || t.includes('magic') || t.includes('educad') || t.includes('ajudar')) return '✨';
    if (t.includes('quarto') || t.includes('arrumar') || t.includes('limpar') || t.includes('varrer')) return '🧹';
    if (t.includes('planta') || t.includes('regar') || t.includes('flor') || t.includes('jardim')) return '🌱';
    if (t.includes('desenh') || t.includes('pintar') || t.includes('colorir') || t.includes('arte')) return '🎨';
    if (t.includes('música') || t.includes('musica') || t.includes('cantar') || t.includes('dançar')) return '🎵';
    if (t.includes('esporte') || t.includes('correr') || t.includes('bola') || t.includes('bicicleta')) return '⚽';

    return '🌟';
};

// 2. CATÁLOGO RICO E GENUÍNO DE SUGESTÕES (SEM REPETIÇÕES NUMÉRICAS)
window.SugestoesMissoes = {
    adultos: [
        { titulo: "Organizar a despensa", descricao: "Verificar validades e alinhar os mantimentos da casa.", icone: "blocos", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { titulo: "Limpeza rápida da sala", descricao: "Recolher objetos fora do lugar e arejar o ambiente.", icone: "vassoura", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Planejar cardápio da semana", descricao: "Anotar as refeições principais e o que falta comprar.", icone: "refeicao", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { titulo: "Revisar contas e vencimentos", descricao: "Conferir a aba de finanças e os próximos boletos.", icone: "carteira", recorrencia_tipo: "semanal_7d", prioridade: 1 },
        { titulo: "Dia do desapego em casa", descricao: "Separar 3 itens em bom estado para doação.", icone: "presente", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { titulo: "Beber 2 litros de água hoje", descricao: "Manter a hidratação constante ao longo do dia.", icone: "gota", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Ler 15 páginas de um livro", descricao: "Dedicar um momento tranquilo à leitura pessoal.", icone: "livro", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { titulo: "Fazer 30 minutos de exercício", descricao: "Caminhada, academia ou treino funcional em casa.", icone: "bicicleta", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Ligar ou mandar mensagem a um familiar", descricao: "Cultivar a proximidade com quem você ama.", icone: "familia", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { titulo: "Organizar o guarda-roupa", descricao: "Dobrar peças soltas e alinhar os cabides.", icone: "camisa", recorrencia_tipo: "quinzenal_15d", prioridade: 3 },
        { titulo: "Planejar as metas da semana", descricao: "Definir as 3 prioridades mais importantes no calendário.", icone: "agenda", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { titulo: "Pausa de 10 min de respiração/meditação", descricao: "Desacelerar a mente e aliviar o estresse do dia.", icone: "flor", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { titulo: "Higienizar a geladeira", descricao: "Descartar sobras antigas e limpar as prateleiras.", icone: "vassoura", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { titulo: "Alongamento matinal ao acordar", descricao: "Despertar o corpo com movimentos suaves.", icone: "sol", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Preparar lanches ou marmitas", descricao: "Deixar porções prontas para economizar tempo e dinheiro.", icone: "refeicao", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { titulo: "Desligar telas 1h antes de dormir", descricao: "Garantir uma noite de sono profunda e reparadora.", icone: "lua", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Organizar mesa de trabalho/estudos", descricao: "Limpar papéis acumulados e organizar cabos.", icone: "lapis", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { titulo: "Registrar gastos no extrato", descricao: "Lançar as compras do dia na carteira do Suiri.", icone: "moeda", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Trocar roupas de cama e banho", descricao: "Colocar lençóis e toalhas limpas e cheirosas.", icone: "cama", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { titulo: "Regar as plantas da casa", descricao: "Cuidar dos vasos e verificar a terra das plantas.", icone: "broto", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { titulo: "Limpar filtros de água ou ar", descricao: "Manutenção preventiva para a saúde da família.", icone: "escudo", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { titulo: "Fazer uma refeição 100% natural", descricao: "Priorizar legumes, verduras e proteínas frescas.", icone: "cenoura", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Revisar lista de supermercado", descricao: "Conferir o que acabou antes de ir às compras.", icone: "carrinho", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { titulo: "Momento de lazer em família", descricao: "Jogar conversa fora, ver um filme ou brincar com as crianças.", icone: "filme", recorrencia_tipo: "semanal_7d", prioridade: 1 }
    ],

    kids: [
        { titulo: "Escovar os dentes com capricho", descricao: "Deixar os dentinhos limpos e brilhando após comer!", emoji_inteligente: "🪥", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Arrumar a minha cama", descricao: "Esticar o lençol e ajeitar o travesseiro ao acordar.", emoji_inteligente: "🛏️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Guardar todos os brinquedos", descricao: "Colocar cada brinquedo de volta na caixa após brincar.", emoji_inteligente: "🧸", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Beber água na garrafinha", descricao: "Hidratar o corpo para ter muita energia!", emoji_inteligente: "💧", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Ler uma história ou livrinho", descricao: "Viajar na imaginação lendo páginas de um livro.", emoji_inteligente: "📖", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Tomar banho sem enrolar", descricao: "Lavar bem o cabelo e o corpo para ficar cheiroso!", emoji_inteligente: "🛀", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Comer uma fruta deliciosa", descricao: "Escolher uma fruta saudável para o lanche do dia.", emoji_inteligente: "🍎", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Lavar as mãos antes de comer", descricao: "Usar água e sabonete para mandar a sujeira embora.", emoji_inteligente: "🧼", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Levar o prato até a pia", descricao: "Ajudar a família tirando o próprio prato da mesa.", emoji_inteligente: "🍽️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Cuidar do bichinho de estimação", descricao: "Colocar água fresquinha e comida para o pet.", emoji_inteligente: "🐶", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Fazer a lição de casa com atenção", descricao: "Caprichar nas tarefas da escola antes de brincar.", emoji_inteligente: "✏️", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Dormir no horário combinado", descricao: "Deitar cedo para descansar e crescer forte.", emoji_inteligente: "😴", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Guardar os sapatos no lugar", descricao: "Não deixar tênis ou chinelos espalhados pela sala.", emoji_inteligente: "👟", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Deixar a mochila pronta", descricao: "Arrumar os cadernos e o estojo para o dia seguinte.", emoji_inteligente: "🎒", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Jogar os papeizinhos no lixo", descricao: "Manter o quarto e a casa sempre limpinhos.", emoji_inteligente: "🗑️", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { titulo: "Dar um abraço apertado nos pais", descricao: "Espalhar carinho e alegria pela casa hoje!", emoji_inteligente: "🤗", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { titulo: "Comer os legumes e a salada", descricao: "Deixar o prato colorido para ficar super forte!", emoji_inteligente: "🥦", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { titulo: "Colocar a roupa suja no cesto", descricao: "Não deixar roupa jogada no chão após o banho.", emoji_inteligente: "👕", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Brincar longe das telas", descricao: "Inventar brincadeiras divertidas sem TV ou celular.", emoji_inteligente: "🧩", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Usar as palavrinhas mágicas", descricao: "Dizer por favor, obrigado e bom dia com um sorriso!", emoji_inteligente: "✨", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { titulo: "Fazer um desenho bem bonito", descricao: "Soltar a criatividade com lápis de cor e papel.", emoji_inteligente: "🎨", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { titulo: "Ajudar a regar as plantinhas", descricao: "Dar água com cuidado para as flores da casa.", emoji_inteligente: "🌱", recorrencia_tipo: "semanal_7d", prioridade: 3 }
    ],

    sugestoesDaSemana: { kids: [], adultos: [] },
    indiceAtual: 0,
    abaAtiva: 'kids',

    inicializar: function() {
        this.sortearNovasMissoes();
    },

    sortearNovasMissoes: function() {
        this.sugestoesDaSemana.kids = this.embaralhar([...this.kids]);
        this.sugestoesDaSemana.adultos = this.embaralhar([...this.adultos]);
    },

    embaralhar: function(array) {
        const copia = [...array];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }
};

// 3. CONTROLES DO MODAL DE SUGESTÕES (COMPATÍVEL COM TODOS OS IDS DO HTML)
window.abrirModalSugestoes = function() {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    window.SugestoesMissoes.inicializar();
    document.getElementById('modal-sugestoes-missoes')?.classList.remove('oculto');
    const abaInicial = (document.body.classList.contains('modo-kids-ativo') || window.modoKidsAtivo) ? 'kids' : 'adultos';
    window.trocarAbaSugestoes(abaInicial);
};

window.fecharModalSugestoes = function() {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    document.getElementById('modal-sugestoes-missoes')?.classList.add('oculto');
};

window.trocarAbaSugestoes = function(aba) {
    window.SugestoesMissoes.abaAtiva = aba;
    window.SugestoesMissoes.indiceAtual = 0;

    // Compatibilidade com os dois padrões de botões de aba no HTML
    const btnKids1 = document.getElementById('btn-sugestao-tab-kids');
    const btnAdultos1 = document.getElementById('btn-sugestao-tab-adultos');
    if (btnKids1 && btnAdultos1) {
        btnKids1.classList.toggle('ativo', aba === 'kids');
        btnAdultos1.classList.toggle('ativo', aba === 'adultos');
    }

    const btnKids2 = document.getElementById('btn-sugestao-kids');
    const btnAdultos2 = document.getElementById('btn-sugestao-adultos');
    if (btnKids2 && btnAdultos2) {
        btnKids2.className = aba === 'kids' ? 'btn-principal' : 'btn-secundario';
        btnAdultos2.className = aba === 'adultos' ? 'btn-principal' : 'btn-secundario';
    }

    window.renderizarSugestaoAtual();
};

// Alias para compatibilidade com chamadas antigas do app-operacional.js
window.carregarSugestoes = function(tipo) {
    window.trocarAbaSugestoes(tipo);
};

window.renderizarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba] || [];
    const indice = window.SugestoesMissoes.indiceAtual;

    const elTitulo = document.getElementById('sugestao-titulo') || document.getElementById('titulo-sugestao-atual');
    const elDesc = document.getElementById('sugestao-descricao') || document.getElementById('frequencia-sugestao-atual');
    const iconeContainer = document.getElementById('sugestao-icone-svg') || document.getElementById('icone-sugestao-atual');

    if (lista.length === 0) {
        if (elTitulo) elTitulo.textContent = "Todas as sugestões vistas!";
        if (elDesc) elDesc.textContent = "Troque de aba ou reabra para sortear novamente.";
        if (iconeContainer) iconeContainer.innerHTML = window.IconesSuiri?.check || '✨';
        return;
    }

    const sugestao = lista[indice];
    if (elTitulo) elTitulo.textContent = sugestao.titulo;
    if (elDesc) elDesc.textContent = sugestao.descricao || 'Sugestão de rotina positiva';

    if (iconeContainer) {
        if (aba === 'kids') {
            const emojiTarefa = window.obterEmojiConcordanteKids(sugestao.titulo, sugestao.emoji_inteligente || sugestao.emoji);
            iconeContainer.innerHTML = `<div style="font-size: 68px; line-height: 1.1; margin-bottom: 6px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.14)); user-select: none;">${emojiTarefa}</div>`;
        } else {
            const chaveIcone = sugestao.icone || 'alvo';
            const svgCatalogo = window.IconesSuiri?.[chaveIcone] || window.IconesSuiri?.alvo || `
                <svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            `;
            iconeContainer.innerHTML = `<div style="color:var(--cor-primaria, #d97706); transform:scale(2.1); margin: 16px 0;">${svgCatalogo}</div>`;
        }
    }
};

window.sugestaoProxima = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba] || [];
    if (lista.length === 0) return;

    const cardAtual = document.getElementById('cartao-sugestao-atual');
    if (cardAtual) {
        cardAtual.style.transform = 'translateX(-18px) scale(0.97)';
        cardAtual.style.opacity = '0.5';
    }

    setTimeout(() => {
        window.SugestoesMissoes.indiceAtual = (window.SugestoesMissoes.indiceAtual + 1) % lista.length;
        window.renderizarSugestaoAtual();
        if (cardAtual) {
            cardAtual.style.transform = 'translateX(0) scale(1)';
            cardAtual.style.opacity = '1';
        }
    }, 150);
};

window.sugestaoAnterior = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba] || [];
    if (lista.length === 0) return;

    window.SugestoesMissoes.indiceAtual = (window.SugestoesMissoes.indiceAtual - 1 + lista.length) % lista.length;
    window.renderizarSugestaoAtual();
};

// Alias para o botão "Recusar / Próxima"
window.recusarSugestao = function() {
    window.sugestaoProxima();
};

window.aceitarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba] || [];
    const sugestao = lista[window.SugestoesMissoes.indiceAtual];
    if (!sugestao) return;

    const inputTitulo = document.getElementById('input-nova-missao-titulo');
    if (inputTitulo) {
        const tituloLimpo = (sugestao.titulo || '').trim();
        inputTitulo.value = tituloLimpo;

        const inputEmoji = document.getElementById('input-nova-missao-emoji');
        const inputIcone = document.getElementById('input-nova-missao-icone');
        const btnPreviewIcone = document.getElementById('btn-seletor-icone-nova');
        const selectResp = document.getElementById('select-nova-missao-responsavel');
        const selectRecorrencia = document.getElementById('select-nova-missao-recorrencia');
        const selectPrio = document.getElementById('select-nova-missao-prioridade');

        if (selectRecorrencia && sugestao.recorrencia_tipo) {
            selectRecorrencia.value = sugestao.recorrencia_tipo;
        }
        if (selectPrio && sugestao.prioridade) {
            selectPrio.value = String(sugestao.prioridade);
        }

        if (aba === 'kids') {
            const emojiIdeal = window.obterEmojiConcordanteKids(tituloLimpo, sugestao.emoji_inteligente || sugestao.emoji);
            if (inputEmoji) {
                inputEmoji.value = emojiIdeal;
                inputEmoji.classList.remove('oculto');
            }
            if (inputIcone) inputIcone.value = emojiIdeal;
            if (btnPreviewIcone) btnPreviewIcone.innerHTML = `<span style="font-size:20px;">${emojiIdeal}</span>`;
            if (selectResp) selectResp.value = 'todos_kids';
        } else {
            if (inputEmoji) inputEmoji.value = '';
            const chaveSvg = sugestao.icone || 'alvo';
            if (inputIcone) inputIcone.value = chaveSvg;
            if (btnPreviewIcone && window.IconesSuiri?.[chaveSvg]) {
                btnPreviewIcone.innerHTML = window.IconesSuiri[chaveSvg];
            }
            if (selectResp) selectResp.value = 'todos';
        }

        window.fecharModalSugestoes();
        document.getElementById('modal-nova-missao')?.classList.remove('oculto');

        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`Sugestão "${tituloLimpo}" pronta para confirmar!`, 'sucesso');
        }
    }
};

// Alias para compatibilidade com chamadas antigas
window.aceitarSugestao = function() {
    window.aceitarSugestaoAtual();
};

// Suporte para deslizar no cartão de sugestões (Swipe Gestures)
document.addEventListener('DOMContentLoaded', () => {
    let startX = 0;
    const cartao = document.getElementById('cartao-sugestao-atual');
    if (cartao) {
        cartao.addEventListener('touchstart', e => {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        cartao.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].screenX;
            if (endX < startX - 40) window.sugestaoProxima();
            if (endX > startX + 40) window.sugestaoAnterior();
        }, { passive: true });
    }
});
