// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SUGESTOES.JS (100% COMPLETO E INTEGRAL)
// Motor de Sugestões: 60 Kids + 60 Adultos, 7 por Semana, Emojis Puros
// Atualização nas Segundas-Feiras & Exclusão Individual de Missões Aceitas
// =========================================================================

// 1. DETECTOR INTELIGENTE DE EMOJI CONCORDANTE
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

    return '⭐';
};

// 2. CATÁLOGO COMPLETO DE 60 SUGESTÕES PARA ADULTOS E 60 PARA KIDS
window.SugestoesMissoes = {
    adultos: [
        { id: "ad_1", titulo: "Organizar a despensa", descricao: "Verificar validades e organizar os alimentos por categoria.", icone: "🥫", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { id: "ad_2", titulo: "Limpeza rápida da sala", descricao: "Recolher objetos espalhados e arejar o ambiente.", icone: "🧹", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_3", titulo: "Planejar cardápio semanal", descricao: "Definir as refeições da semana e conferir o que falta.", icone: "📝", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_4", titulo: "Revisar as contas a pagar", descricao: "Acessar a aba finanças e conferir vencimentos da semana.", icone: "🧾", recorrencia_tipo: "semanal_7d", prioridade: 1 },
        { id: "ad_5", titulo: "Separar roupas para doação", descricao: "Escolher 3 peças do guarda-roupa que você não usa mais.", icone: "👕", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_6", titulo: "Higienizar a geladeira", descricao: "Descartar sobras antigas e passar pano nas prateleiras.", icone: "🧽", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { id: "ad_7", titulo: "Caminhada de 30 minutos", descricao: "Reservar um tempo para caminhar e respirar ar puro.", icone: "🏃", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "ad_8", titulo: "Regar todas as plantas", descricao: "Conferir a terra dos vasos e hidratar o jardim da casa.", icone: "🪴", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "ad_9", titulo: "Lavar e estender roupas", descricao: "Colocar a máquina para rodar e pendurar no varal.", icone: "🧺", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_10", titulo: "Trocar roupas de cama", descricao: "Colocar lençóis e fronhas limpas para a semana.", icone: "🛏️", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_11", titulo: "Faxina no banheiro", descricao: "Lavar o box, higienizar a pia e o vaso sanitário.", icone: "🚿", recorrencia_tipo: "semanal_7d", prioridade: 1 },
        { id: "ad_12", titulo: "Organizar gaveta de documentos", descricao: "Guardar comprovantes e descartar papéis velhos.", icone: "📁", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_13", titulo: "Momento leitura tranquila", descricao: "Ler pelo menos 15 páginas de um bom livro.", icone: "📖", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "ad_14", titulo: "Aporte na reserva familiar", descricao: "Guardar qualquer valor no cofrinho compartilhado.", icone: "🐷", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_15", titulo: "Limpar vidros e janelas", descricao: "Tirar marcas de dedos e poeira das janelas da sala.", icone: "🪟", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_16", titulo: "Lavar a louça da janta", descricao: "Não deixar pratos e panelas acumulados na pia para amanhã.", icone: "🍽️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_17", titulo: "Descartar o lixo da casa", descricao: "Amarrar os sacos da cozinha e banheiros e colocar fora.", icone: "🗑️", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "ad_18", titulo: "Higienizar o micro-ondas", descricao: "Limpar respingos internos com pano úmido e detergente.", icone: "🧼", recorrencia_tipo: "quinzenal_15d", prioridade: 3 },
        { id: "ad_19", titulo: "Limpar o fogão após cozinhar", descricao: "Passar desengordurante nas bocas e no tampo do fogão.", icone: "🍳", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_20", titulo: "Organizar calçados na entrada", descricao: "Alinhar sapatos e tênis na sapateira do hall.", icone: "👟", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "ad_21", titulo: "Passar aspirador ou pano no chão", descricao: "Remover pelos e poeira dos quartos e corredores.", icone: "🪣", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_22", titulo: "Desinfetar maçanetas e interruptores", descricao: "Passar álcool nos pontos de toque mais comuns da casa.", icone: "🧴", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "ad_23", titulo: "Lavar toalhas de banho", descricao: "Trocar toalhas de corpo e de rosto por limpas.", icone: "🛁", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_24", titulo: "Conferir óleo e água do carro", descricao: "Checagem rápida de manutenção preventiva no veículo.", icone: "🚗", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_25", titulo: "Calibrar os pneus do carro", descricao: "Passar no posto para calibrar os 4 pneus e o estepe.", icone: "⛽", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { id: "ad_26", titulo: "Fazer lista de compras da semana", descricao: "Anotar legumes, frutas e itens essenciais que acabaram.", icone: "🛒", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_27", titulo: "Preparar marmitas para a semana", descricao: "Adiantar porções nutritivas para economizar tempo e dinheiro.", icone: "🍱", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_28", titulo: "Alongamento ao acordar", descricao: "Fazer 10 minutos de alongamentos matinais para a postura.", icone: "🧘", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_29", titulo: "Treino de força ou musculação", descricao: "Praticar exercícios funcionais ou pesos para fortalecer o corpo.", icone: "🏋️", recorrencia_tipo: "semanal_7d", prioridade: 1 },
        { id: "ad_30", titulo: "Beber 2 litros de água", descricao: "Manter uma garrafinha cheia ao lado e hidratar o corpo.", icone: "💧", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "ad_31", titulo: "Comer uma refeição 100% natural", descricao: "Almoçar ou jantar focando em vegetais, legumes e proteínas.", icone: "🥗", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_32", titulo: "Pausa de respiração e presença", descricao: "Desacelerar por 10 minutos longe de qualquer tela.", icone: "✨", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "ad_33", titulo: "Desligar telas 1h antes de dormir", descricao: "Evitar celular e TV na cama para um sono mais profundo.", icone: "😴", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_34", titulo: "Lançar todos os gastos do dia", descricao: "Abrir o módulo de finanças e registrar compras no extrato.", icone: "💳", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "ad_35", titulo: "Conferir faturas de cartão", descricao: "Verificar assinaturas ativas e compras parceladas do mês.", icone: "💵", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_36", titulo: "Revisar assinaturas de streaming", descricao: "Cancelar serviços ou aplicativos que a família não usa mais.", icone: "📺", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_37", titulo: "Definir meta financeira do mês", descricao: "Estipular quanto a família deseja poupar neste mês.", icone: "💰", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_38", titulo: "Lavar o quintal ou varanda", descricao: "Varrer folhas e lavar o piso externo da casa.", icone: "🏡", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "ad_39", titulo: "Organizar cabos e eletrônicos", descricao: "Enrolar cabos soltos e organizar a bancada de trabalho.", icone: "💻", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_40", titulo: "Limpar o teclado e tela do PC", descricao: "Passar flanela seca e tirar a poeira do computador.", icone: "🖥️", recorrencia_tipo: "quinzenal_15d", prioridade: 3 },
        { id: "ad_41", titulo: "Fazer backup de fotos importantes", descricao: "Salvar recordações da família na nuvem ou drive externo.", icone: "📸", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_42", titulo: "Ligar para parentes queridos", descricao: "Bater um papo com avós, pais ou irmãos que moram longe.", icone: "📞", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_43", titulo: "Noite de filme em família", descricao: "Preparar pipoca e curtir uma sessão de cinema com todos.", icone: "🍿", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_44", titulo: "Alinhar prioridades com o cônjuge", descricao: "Conversar 15 minutos sobre compromissos e rotina da semana.", icone: "💬", recorrencia_tipo: "semanal_7d", prioridade: 1 },
        { id: "ad_45", titulo: "Dar banho no pet", descricao: "Lavar, secar e escovar o cachorrinho da casa.", icone: "🐶", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { id: "ad_46", titulo: "Limpar a caixa de areia do gato", descricao: "Peneirar e repor areia limpinha para o felino.", icone: "🐱", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "ad_47", titulo: "Passear 20 minutos com o pet", descricao: "Gastar a energia do bichinho com um passeio na rua.", icone: "🐾", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "ad_48", titulo: "Organizar remédios e conferir validades", descricao: "Descartar medicamentos vencidos na farmacinha de casa.", icone: "💊", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_49", titulo: "Limpar espelhos da casa", descricao: "Deixar os espelhos do banheiro e quartos sem manchas.", icone: "🪞", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "ad_50", titulo: "Descongelar e limpar o freezer", descricao: "Remover gelo acumulado e organizar potes congelados.", icone: "🧊", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_51", titulo: "Verificar lâmpadas queimadas", descricao: "Trocar lâmpadas apagadas por modelos LED econômicos.", icone: "💡", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_52", titulo: "Limpar a grelha ou churrasqueira", descricao: "Tirar gordura residual e deixar pronta para o próximo churrasco.", icone: "🥩", recorrencia_tipo: "quinzenal_15d", prioridade: 3 },
        { id: "ad_53", titulo: "Passar roupas de trabalho", descricao: "Deixar camisas e calças alinhadas para os próximos dias.", icone: "👔", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_54", titulo: "Trocar esponja de louça", descricao: "Substituir a esponja velha da pia por uma novinha.", icone: "🧽", recorrencia_tipo: "quinzenal_15d", prioridade: 2 },
        { id: "ad_55", titulo: "Limpar filtros do ar condicionado", descricao: "Lavar as telas do filtro para garantir ar puro e economia.", icone: "💨", recorrencia_tipo: "mensal_30d", prioridade: 3 },
        { id: "ad_56", titulo: "Limpar o filtro de água", descricao: "Higienizar a torneira do filtro ou trocar o refil de água.", icone: "🚰", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_57", titulo: "Fazer uma surpresa carinhosa", descricao: "Preparar o café da manhã ou deixar um bilhetinho no lar.", icone: "❤️", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "ad_58", titulo: "Passeio de bicicleta no parque", descricao: "Pedalar 40 minutos ao ar livre para relaxar o corpo.", icone: "🚴", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "ad_59", titulo: "Revisar as metas anuais no app", descricao: "Acessar os planos anuais e atualizar o progresso dos objetivos.", icone: "🎯", recorrencia_tipo: "mensal_30d", prioridade: 2 },
        { id: "ad_60", titulo: "Noite de descanso sem cobranças", descricao: "Deitar cedo, relaxar a mente e recarregar as energias.", icone: "🌙", recorrencia_tipo: "semanal_7d", prioridade: 3 }
    ],

    kids: [
        { id: "kd_1", titulo: "Escovar os dentes com capricho", descricao: "Deixar os dentinhos limpos e brilhando após comer!", icone: "🪥", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_2", titulo: "Arrumar a minha cama", descricao: "Esticar o lençol e ajeitar o travesseiro ao acordar.", icone: "🛏️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_3", titulo: "Guardar todos os brinquedos", descricao: "Colocar cada brinquedo de volta na caixa após brincar.", icone: "🧸", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_4", titulo: "Beber água na garrafinha", descricao: "Hidratar o corpo para ter muita energia e saúde!", icone: "💧", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_5", titulo: "Ler uma história ou livrinho", descricao: "Viajar na imaginação lendo páginas de um livro.", icone: "📖", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_6", titulo: "Tomar banho sem enrolar", descricao: "Lavar bem o cabelo e o corpo para ficar cheiroso!", icone: "🛀", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_7", titulo: "Comer uma fruta deliciosa", descricao: "Escolher uma maçã, banana ou uva gostosa no lanche.", icone: "🍎", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_8", titulo: "Lavar as mãos antes de comer", descricao: "Usar água e sabonete para mandar os bichinhos embora.", icone: "🧼", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_9", titulo: "Levar o prato até a pia", descricao: "Ajudar a família tirando o próprio prato e copo da mesa.", icone: "🍽️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_10", titulo: "Cuidar do bichinho de estimação", descricao: "Colocar água fresquinha e ração para o pet da casa.", icone: "🐶", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_11", titulo: "Fazer a lição de casa com atenção", descricao: "Caprichar nas tarefas da escola antes de brincar.", icone: "✏️", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_12", titulo: "Dormir no horário combinado", descricao: "Deitar cedo para descansar bastante e crescer forte.", icone: "😴", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_13", titulo: "Guardar os sapatos no lugar", descricao: "Não deixar tênis ou chinelos espalhados pela sala.", icone: "👟", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_14", titulo: "Deixar a mochila pronta", descricao: "Arrumar cadernos e o estojo para a aula de amanhã.", icone: "🎒", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_15", titulo: "Jogar papel no lixo", descricao: "Manter o quarto e a sala sempre limpinhos.", icone: "🗑️", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_16", titulo: "Dar um abraço apertado nos pais", descricao: "Espalhar muito amor e alegria pela casa hoje!", icone: "🤗", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_17", titulo: "Comer legumes e salada", descricao: "Deixar o prato colorido para ter superpoderes!", icone: "🥦", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_18", titulo: "Colocar a roupa suja no cesto", descricao: "Não deixar roupas jogadas no chão após o banho.", icone: "🧺", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_19", titulo: "Brincar longe das telas", descricao: "Inventar brincadeiras divertidas sem celular ou TV.", icone: "🧩", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_20", titulo: "Usar as palavrinhas mágicas", descricao: "Dizer por favor, obrigado e com licença sempre!", icone: "✨", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_21", titulo: "Fazer um desenho bem bonito", descricao: "Soltar a imaginação com lápis de cor e papel.", icone: "🎨", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_22", titulo: "Ajudar a regar as plantinhas", descricao: "Colocar água com cuidado nos vasinhos de flores.", icone: "🌱", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_23", titulo: "Pentear o cabelo ao acordar", descricao: "Passar a escova e ficar bem arrumado para o dia.", icone: "🪞", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_24", titulo: "Desligar a TV na hora combinada", descricao: "Respeitar o combinado da família sem reclamar.", icone: "📺", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_25", titulo: "Guardar os jogos de tabuleiro", descricao: "Não deixar peças perdidas pelo chão da sala.", icone: "🎲", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "kd_26", titulo: "Colocar os tênis sozinho", descricao: "Treinar amarrar o cadarço ou fechar o velcro.", icone: "👟", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_27", titulo: "Dizer bom dia com alegria", descricao: "Dar um sorriso largo para todo mundo ao acordar.", icone: "☀️", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_28", titulo: "Guardar o pijama na gaveta", descricao: "Dobrar o pijama e não largar em cima da cama.", icone: "👕", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_29", titulo: "Experimentar um alimento novo", descricao: "Provar um pedacinho de legume sem cara feia.", icone: "🥕", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "kd_30", titulo: "Limpar a mesa de estudos", descricao: "Organizar lápis, borracha e papéis usados.", icone: "✏️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_31", titulo: "Brincar ao ar livre no quintal", descricao: "Correr, pular corda ou andar de bicicleta.", icone: "🚴", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "kd_32", titulo: "Ajudar a guardar as compras", descricao: "Ajudar os pais a guardar frutas ou pacotes leves.", icone: "🛒", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_33", titulo: "Cuidar dos materiais escolares", descricao: "Apontar os lápis e não perder as borrachas.", icone: "🖍️", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "kd_34", titulo: "Passar fio dental nos dentes", descricao: "Limpar entre os dentes antes de dormir.", icone: "🦷", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_35", titulo: "Não gritar dentro de casa", descricao: "Falar com voz suave e calma com os familiares.", icone: "🤫", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_36", titulo: "Dividir o brinquedo com irmão", descricao: "Aprender a compartilhar e brincar juntos com alegria.", icone: "🤝", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_37", titulo: "Dar comida ao gatinho ou peixe", descricao: "Colocar a medida certa de comida no potinho.", icone: "🐱", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_38", titulo: "Encher a garrafinha para o dia", descricao: "Colocar água geladinha na garrafa da escola.", icone: "🚰", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_39", titulo: "Dizer 'eu te amo' para a família", descricao: "Fazer um familiar sorrir com palavras carinhosas.", icone: "❤️", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_40", titulo: "Organizar os gibis ou revistinhas", descricao: "Empilhar as leituras de forma organizada.", icone: "📚", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_41", titulo: "Apagar a luz ao sair do quarto", descricao: "Economizar energia elétrica na casa da família.", icone: "💡", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_42", titulo: "Fechar bem a torneira da pia", descricao: "Evitar desperdício de água após lavar as mãos.", icone: "🚿", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_43", titulo: "Recolher os lápis caídos no chão", descricao: "Não deixar pontas de lápis quebrarem pisando neles.", icone: "✏️", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_44", titulo: "Ouvir e respeitar os pais de primeira", descricao: "Atender aos chamados da família com prontidão.", icone: "👂", recorrencia_tipo: "diaria_24h", prioridade: 1 },
        { id: "kd_45", titulo: "Montar um quebra-cabeça", descricao: "Treinar a mente encaixando todas as peças.", icone: "🧩", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_46", titulo: "Tirar o pó dos próprios livros", descricao: "Passar uma flanelinha seca na prateleira do quarto.", icone: "🧹", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_47", titulo: "Treinar arremessar bola ou chutar", descricao: "Praticar esporte e se exercitar com a bola.", icone: "⚽", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_48", titulo: "Fazer uma cartinha para alguém", descricao: "Escrever ou desenhar um bilhetinho especial.", icone: "💌", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_49", titulo: "Ajudar a colocar os talheres na mesa", descricao: "Organizar colheres e garfos na hora da refeição.", icone: "🍴", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_50", titulo: "Secar as mãos direitinho na toalha", descricao: "Não sair pingando água pelo chão da casa.", icone: "🧼", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_51", titulo: "Guardar o estojo na mochila", descricao: "Não esquecer materiais espalhados pela sala.", icone: "🎒", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_52", titulo: "Andar de bicicleta ou patinete", descricao: "Brincar ao ar livre com capacete e segurança.", icone: "🛴", recorrencia_tipo: "semanal_7d", prioridade: 2 },
        { id: "kd_53", titulo: "Elogiar alguém da família", descricao: "Falar algo gentil para alegrar o dia de alguém.", icone: "🥰", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_54", titulo: "Organizar as meias em pares", descricao: "Ajudar a juntar as meias limpas da gaveta.", icone: "🧦", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_55", titulo: "Fechar as portas dos armários", descricao: "Não deixar portas e gavetas abertas ao passar.", icone: "🚪", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_56", titulo: "Passar protetor solar para brincar", descricao: "Cuidar da pele antes de sair no sol forte.", icone: "🧴", recorrencia_tipo: "diaria_24h", prioridade: 2 },
        { id: "kd_57", titulo: "Ajudar a dobrar os paninhos", descricao: "Dobrar guardanapos ou panos limpos com capricho.", icone: "🧺", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_58", titulo: "Cantar uma música alegre", descricao: "Cantarolar e alegrar o ambiente do lar.", icone: "🎵", recorrencia_tipo: "diaria_24h", prioridade: 3 },
        { id: "kd_59", titulo: "Proteger as plantinhas do sol forte", descricao: "Verificar se as mudinhas precisam de carinho e água.", icone: "🪴", recorrencia_tipo: "semanal_7d", prioridade: 3 },
        { id: "kd_60", titulo: "Dormir com um sorriso no rosto", descricao: "Agradecer pelo dia e ter uma ótima noite de sono.", icone: "⭐", recorrencia_tipo: "diaria_24h", prioridade: 2 }
    ],

    sugestoesDaSemana: { kids: [], adultos: [] },
    indiceAtual: 0,
    abaAtiva: 'kids',

    obterIdUsuario: function() {
        return window.perfilAtual?.id || window.usuarioAtual?.id || 'membro_padrao';
    },

    obterAceitasDoUsuario: function() {
        const uid = this.obterIdUsuario();
        try {
            return JSON.parse(localStorage.getItem(`suiri_sugestoes_aceitas_${uid}`) || '[]');
        } catch (e) {
            return [];
        }
    },

    registrarAceitaDoUsuario: function(missaoId) {
        const uid = this.obterIdUsuario();
        const aceitas = this.obterAceitasDoUsuario();
        if (!aceitas.includes(missaoId)) {
            aceitas.push(missaoId);
            localStorage.setItem(`suiri_sugestoes_aceitas_${uid}`, JSON.stringify(aceitas));
        }
    },

    obterChaveSegundaFeiraAtual: function() {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Calcula a data da segunda-feira
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0]; // Ex: 2026-11-02
    },

    inicializar: function() {
        this.verificarCicloSemanal();
    },

    verificarCicloSemanal: function() {
        const chaveSegunda = this.obterChaveSegundaFeiraAtual();
        const ultimaSemanaSalva = localStorage.getItem('suiri_sugestoes_semana_chave');

        if (ultimaSemanaSalva !== chaveSegunda) {
            this.sortearNovasSeteSugestoes();
            localStorage.setItem('suiri_sugestoes_semana_chave', chaveSegunda);
        } else {
            this.carregarSugestoesSalvas();
        }
    },

    sortearNovasSeteSugestoes: function() {
        // Sorteia exatamente 7 tarefas aleatórias de cada lista
        this.sugestoesDaSemana.kids = this.embaralhar([...this.kids]).slice(0, 7);
        this.sugestoesDaSemana.adultos = this.embaralhar([...this.adultos]).slice(0, 7);
        localStorage.setItem('suiri_sugestoes_lote_semanal', JSON.stringify(this.sugestoesDaSemana));
    },

    carregarSugestoesSalvas: function() {
        const salvas = localStorage.getItem('suiri_sugestoes_lote_semanal');
        if (salvas) {
            try {
                this.sugestoesDaSemana = JSON.parse(salvas);
            } catch (e) {
                this.sortearNovasSeteSugestoes();
            }
        } else {
            this.sortearNovasSeteSugestoes();
        }
    },

    obterListaVisivelUsuario: function(aba) {
        const lote = this.sugestoesDaSemana[aba] || [];
        const aceitas = this.obterAceitasDoUsuario();
        
        // Remove as missões que o usuário já aceitou
        let disponiveis = lote.filter(m => !aceitas.includes(m.id));

        // Se o usuário já aceitou todas as 7 da semana, pega outras da reserva
        if (disponiveis.length === 0) {
            const catalogoBase = aba === 'kids' ? this.kids : this.adultos;
            disponiveis = catalogoBase.filter(m => !aceitas.includes(m.id)).slice(0, 7);
        }

        return disponiveis;
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

// 3. CONTROLES DO MODAL DE SUGESTÕES
window.abrirModalSugestoes = function() {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    window.SugestoesMissoes.inicializar();
    document.getElementById('modal-sugestoes-missoes')?.classList.remove('oculto');
    const ehKids = window.modoKidsAtivo || (window.perfilAtual?.eh_kids === true) || (window.perfilAtual?.papel === 'dependente');
    const abaInicial = ehKids ? 'kids' : 'adultos';
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

    const btnKids1 = document.getElementById('btn-sugestao-tab-kids');
    const btnAdultos1 = document.getElementById('btn-sugestao-tab-adultos');
    if (btnKids1 && btnAdultos1) {
        btnKids1.className = aba === 'kids' ? 'btn-principal' : 'btn-secundario';
        btnAdultos1.className = aba === 'adultos' ? 'btn-principal' : 'btn-secundario';
    }

    const btnKids2 = document.getElementById('btn-sugestao-kids');
    const btnAdultos2 = document.getElementById('btn-sugestao-adultos');
    if (btnKids2 && btnAdultos2) {
        btnKids2.className = aba === 'kids' ? 'btn-principal' : 'btn-secundario';
        btnAdultos2.className = aba === 'adultos' ? 'btn-principal' : 'btn-secundario';
    }

    window.renderizarSugestaoAtual();
};

window.carregarSugestoes = function(tipo) {
    window.trocarAbaSugestoes(tipo);
};

window.renderizarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.obterListaVisivelUsuario(aba);
    const indice = window.SugestoesMissoes.indiceAtual;

    const elTitulo = document.getElementById('sugestao-titulo') || document.getElementById('titulo-sugestao-atual');
    const elDesc = document.getElementById('sugestao-descricao') || document.getElementById('frequencia-sugestao-atual');
    const iconeContainer = document.getElementById('sugestao-icone-svg') || document.getElementById('icone-sugestao-atual');

    if (lista.length === 0) {
        if (elTitulo) elTitulo.textContent = "Todas as sugestões foram aceitas!";
        if (elDesc) elDesc.textContent = "Parabéns pelo engajamento! Na próxima segunda-feira novas tarefas chegarão.";
        if (iconeContainer) {
            iconeContainer.innerHTML = `<span style="font-size: 58px; line-height: 1;">🎉</span>`;
        }
        return;
    }

    const item = lista[indice % lista.length];
    if (elTitulo) elTitulo.textContent = item.titulo;
    if (elDesc) elDesc.textContent = item.descricao || "Sugestão da semana";

    if (iconeContainer) {
        const emojiVisual = item.icone || window.obterEmojiConcordanteKids(item.titulo);
        iconeContainer.innerHTML = `<span style="font-size: 58px; line-height: 1; display: inline-block; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15)); user-select: none;">${emojiVisual}</span>`;
    }
};

window.sugestaoProxima = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.obterListaVisivelUsuario(aba);
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
    const lista = window.SugestoesMissoes.obterListaVisivelUsuario(aba);
    if (lista.length === 0) return;

    window.SugestoesMissoes.indiceAtual = (window.SugestoesMissoes.indiceAtual - 1 + lista.length) % lista.length;
    window.renderizarSugestaoAtual();
};

window.recusarSugestao = function() {
    window.sugestaoProxima();
};

window.aceitarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.obterListaVisivelUsuario(aba);
    const sugestao = lista[window.SugestoesMissoes.indiceAtual % lista.length];
    
    if (!sugestao) return;

    // Remove da lista do usuário que a aceitou
    window.SugestoesMissoes.registrarAceitaDoUsuario(sugestao.id);

    const inputTitulo = document.getElementById('input-nova-missao-titulo');
    const inputIcone = document.getElementById('input-nova-missao-icone');
    const previewIcone = document.getElementById('svg-preview-nova-missao');
    const selectResp = document.getElementById('select-nova-missao-responsavel');
    const selectRecorrencia = document.getElementById('select-nova-missao-recorrencia');
    const selectPrio = document.getElementById('select-nova-missao-prioridade');
    const modalNovaMissao = document.getElementById('modal-nova-missao');

    const tituloLimpo = (sugestao.titulo || '').trim();
    const emojiEscolhido = sugestao.icone || window.obterEmojiConcordanteKids(tituloLimpo);

    if (inputTitulo) inputTitulo.value = tituloLimpo;
    if (inputIcone) inputIcone.value = emojiEscolhido;
    if (previewIcone) {
        previewIcone.innerHTML = `<span style="font-size:32px; line-height:1; user-select:none;">${emojiEscolhido}</span>`;
    }
    if (selectRecorrencia && sugestao.recorrencia_tipo) {
        selectRecorrencia.value = sugestao.recorrencia_tipo;
    }
    if (selectPrio && sugestao.prioridade) {
        selectPrio.value = String(sugestao.prioridade);
    }

    if (selectResp) {
        if (aba === 'kids') {
            selectResp.value = 'todos_kids';
        } else {
            selectResp.value = 'todos';
        }
    }

    window.fecharModalSugestoes();

    if (modalNovaMissao) {
        modalNovaMissao.classList.remove('oculto');
    }

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Missão "${tituloLimpo}" aceita e carregada!`);
    }
};

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
