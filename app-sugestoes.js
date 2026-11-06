// app-sugestoes.js - Motor do Carrossel de Sugestões da Semana e Detector de Emojis Kids

// Função global inteligente que garante que toda tarefa Kids tenha o emoji em concordância com o título
window.obterEmojiConcordanteKids = function(titulo, emojiSalvo) {
    // Se já houver um emoji válido salvo (que não seja estrela genérica ou nome de ícone SVG), respeita-o
    if (emojiSalvo && typeof emojiSalvo === 'string') {
        const limpo = emojiSalvo.trim();
        const nomesSvgAntigos = ['estrela', 'alvo', 'default', 'escova', 'cama', 'agua', 'livro', 'caixa', 'vassoura', 'lista', 'calculadora', 'coracao', 'escudo'];
        if (limpo.length > 0 && limpo !== '⭐' && !nomesSvgAntigos.includes(limpo.toLowerCase()) && !limpo.startsWith('<svg')) {
            return limpo;
        }
    }

    const t = (titulo || '').toLowerCase();
    if (t.includes('dente') || t.includes('escovar')) return '🪥';
    if (t.includes('cama') || t.includes('lençol') || t.includes('lencol')) return '🛏️';
    if (t.includes('brinquedo') || t.includes('guardar') || t.includes('bonec') || t.includes('carrinho')) return '🧸';
    if (t.includes('água') || t.includes('agua') || t.includes('beber') || t.includes('garrafinha')) return '💧';
    if (t.includes('livr') || t.includes('ler') || t.includes('leitura') || t.includes('história') || t.includes('historia')) return '📖';
    if (t.includes('banho') || t.includes('lavar o corpo') || t.includes('cheiros')) return '🛀';
    if (t.includes('fruta') || t.includes('maçã') || t.includes('maca') || t.includes('banana') || t.includes('lanche')) return '🍎';
    if (t.includes('mão') || t.includes('mao') || t.includes('sabão') || t.includes('sabao')) return '🧼';
    if (t.includes('mesa') || t.includes('prato') || t.includes('louça') || t.includes('louca') || t.includes('almoço') || t.includes('jantar')) return '🍽️';
    if (t.includes('pet') || t.includes('cachorro') || t.includes('gato') || t.includes('ração') || t.includes('racao') || t.includes('bichinho')) return '🐶';
    if (t.includes('tarefa') || t.includes('lição') || t.includes('licao') || t.includes('escola') || t.includes('estudar') || t.includes('dever')) return '✏️';
    if (t.includes('dormir') || t.includes('sono') || t.includes('deitar')) return '😴';
    if (t.includes('sapato') || t.includes('calçado') || t.includes('calcado') || t.includes('tênis') || t.includes('tenis')) return '👟';
    if (t.includes('mochila') || t.includes('material') || t.includes('mala')) return '🎒';
    if (t.includes('lixo') || t.includes('cesto') || t.includes('recicla')) return '🗑️';
    if (t.includes('abraç') || t.includes('abrac') || t.includes('carinho') || t.includes('beijo') || t.includes('pais')) return '🤗';
    if (t.includes('legume') || t.includes('salada') || t.includes('verdura') || t.includes('brócolis') || t.includes('brocolis')) return '🥦';
    if (t.includes('roupa') || t.includes('vestir') || t.includes('pijama') || t.includes('dobrar')) return '👕';
    if (t.includes('tela') || t.includes('celular') || t.includes('tv') || t.includes('brincar') || t.includes('jogo')) return '🧩';
    if (t.includes('favor') || t.includes('obrigad') || t.includes('mágic') || t.includes('magic') || t.includes('educad')) return '✨';
    if (t.includes('quarto') || t.includes('arrumar') || t.includes('limpar')) return '🧹';
    if (t.includes('planta') || t.includes('regar') || t.includes('flor')) return '🌱';

    return '🎯';
};

window.SugestoesMissoes = {
    adultos: [
        {
                "titulo": "Organizar a despensa",
                "descricao": "Verificar validades e organizar os alimentos.",
                "icone": "caixa"
        },
        {
                "titulo": "Limpeza rápida da sala",
                "descricao": "Recolher objetos fora do lugar e tirar o pó.",
                "icone": "vassoura"
        },
        {
                "titulo": "Planejar cardápio",
                "descricao": "Anotar as refeições da semana e o que falta comprar.",
                "icone": "lista"
        },
        {
                "titulo": "Revisar as contas",
                "descricao": "Conferir a aba de finanças e os próximos vencimentos.",
                "icone": "calculadora"
        },
        {
                "titulo": "Dia do desapego",
                "descricao": "Separar 3 itens que não usa mais para doação.",
                "icone": "coracao"
        },
        {
                "titulo": "Beber 2L de água",
                "descricao": "Manter a hidratação em dia hoje.",
                "icone": "agua"
        },
        {
                "titulo": "Ler 15 páginas",
                "descricao": "Avançar na leitura de um livro atual.",
                "icone": "livro"
        },
        {
                "titulo": "Exercício de 30 min",
                "descricao": "Fazer uma caminhada ou treino em casa.",
                "icone": "escudo"
        },
        {
                "titulo": "Ligar para um familiar",
                "descricao": "Fazer uma chamada para alguém querido.",
                "icone": "coracao"
        },
        {
                "titulo": "Organizar guarda-roupa",
                "descricao": "Dobrar peças soltas e organizar cabides.",
                "icone": "caixa"
        },
        {
                "titulo": "Planejar a semana",
                "descricao": "Revisar a agenda e principais metas.",
                "icone": "lista"
        },
        {
                "titulo": "Meditação de 10 min",
                "descricao": "Pausar e focar na respiração.",
                "icone": "default"
        },
        {
                "titulo": "Limpar a geladeira",
                "descricao": "Descartar o que passou e limpar as prateleiras.",
                "icone": "vassoura"
        },
        {
                "titulo": "Alongamento matinal",
                "descricao": "Esticar o corpo logo ao acordar.",
                "icone": "escudo"
        },
        {
                "titulo": "Preparar marmitas",
                "descricao": "Cozinhar porções antecipadas para a semana.",
                "icone": "caixa"
        },
        {
                "titulo": "Zero telas antes de dormir",
                "descricao": "Desligar celular 1h antes de deitar.",
                "icone": "cama"
        },
        {
                "titulo": "Limpar área de trabalho",
                "descricao": "Organizar a mesa e os papéis.",
                "icone": "vassoura"
        },
        {
                "titulo": "Check-up financeiro",
                "descricao": "Anotar todos os gastos do final de semana.",
                "icone": "calculadora"
        },
        {
                "titulo": "Trocar roupas de cama",
                "descricao": "Colocar lençóis limpos.",
                "icone": "cama"
        },
        {
                "titulo": "Aprender algo novo",
                "descricao": "Assistir a um vídeo ou ler um artigo útil.",
                "icone": "livro"
        },
        {
                "titulo": "Organizar a despensa 2",
                "descricao": "Verificar validades e organizar os alimentos.",
                "icone": "caixa"
        },
        {
                "titulo": "Limpeza rápida da sala 2",
                "descricao": "Recolher objetos fora do lugar e tirar o pó.",
                "icone": "vassoura"
        },
        {
                "titulo": "Planejar cardápio 2",
                "descricao": "Anotar as refeições da semana e o que falta comprar.",
                "icone": "lista"
        },
        {
                "titulo": "Revisar as contas 2",
                "descricao": "Conferir a aba de finanças e os próximos vencimentos.",
                "icone": "calculadora"
        },
        {
                "titulo": "Dia do desapego 2",
                "descricao": "Separar 3 itens que não usa mais para doação.",
                "icone": "coracao"
        },
        {
                "titulo": "Beber 2L de água 2",
                "descricao": "Manter a hidratação em dia hoje.",
                "icone": "agua"
        },
        {
                "titulo": "Ler 15 páginas 2",
                "descricao": "Avançar na leitura de um livro atual.",
                "icone": "livro"
        },
        {
                "titulo": "Exercício de 30 min 2",
                "descricao": "Fazer uma caminhada ou treino em casa.",
                "icone": "escudo"
        },
        {
                "titulo": "Ligar para um familiar 2",
                "descricao": "Fazer uma chamada para alguém querido.",
                "icone": "coracao"
        },
        {
                "titulo": "Organizar guarda-roupa 2",
                "descricao": "Dobrar peças soltas e organizar cabides.",
                "icone": "caixa"
        },
        {
                "titulo": "Planejar a semana 2",
                "descricao": "Revisar a agenda e principais metas.",
                "icone": "lista"
        },
        {
                "titulo": "Meditação de 10 min 2",
                "descricao": "Pausar e focar na respiração.",
                "icone": "default"
        },
        {
                "titulo": "Limpar a geladeira 2",
                "descricao": "Descartar o que passou e limpar as prateleiras.",
                "icone": "vassoura"
        },
        {
                "titulo": "Alongamento matinal 2",
                "descricao": "Esticar o corpo logo ao acordar.",
                "icone": "escudo"
        },
        {
                "titulo": "Preparar marmitas 2",
                "descricao": "Cozinhar porções antecipadas para a semana.",
                "icone": "caixa"
        },
        {
                "titulo": "Zero telas antes de dormir 2",
                "descricao": "Desligar celular 1h antes de deitar.",
                "icone": "cama"
        },
        {
                "titulo": "Limpar área de trabalho 2",
                "descricao": "Organizar a mesa e os papéis.",
                "icone": "vassoura"
        },
        {
                "titulo": "Check-up financeiro 2",
                "descricao": "Anotar todos os gastos do final de semana.",
                "icone": "calculadora"
        },
        {
                "titulo": "Trocar roupas de cama 2",
                "descricao": "Colocar lençóis limpos.",
                "icone": "cama"
        },
        {
                "titulo": "Aprender algo novo 2",
                "descricao": "Assistir a um vídeo ou ler um artigo útil.",
                "icone": "livro"
        },
        {
                "titulo": "Organizar a despensa 3",
                "descricao": "Verificar validades e organizar os alimentos.",
                "icone": "caixa"
        },
        {
                "titulo": "Limpeza rápida da sala 3",
                "descricao": "Recolher objetos fora do lugar e tirar o pó.",
                "icone": "vassoura"
        },
        {
                "titulo": "Planejar cardápio 3",
                "descricao": "Anotar as refeições da semana e o que falta comprar.",
                "icone": "lista"
        },
        {
                "titulo": "Revisar as contas 3",
                "descricao": "Conferir a aba de finanças e os próximos vencimentos.",
                "icone": "calculadora"
        },
        {
                "titulo": "Dia do desapego 3",
                "descricao": "Separar 3 itens que não usa mais para doação.",
                "icone": "coracao"
        },
        {
                "titulo": "Beber 2L de água 3",
                "descricao": "Manter a hidratação em dia hoje.",
                "icone": "agua"
        },
        {
                "titulo": "Ler 15 páginas 3",
                "descricao": "Avançar na leitura de um livro atual.",
                "icone": "livro"
        },
        {
                "titulo": "Exercício de 30 min 3",
                "descricao": "Fazer uma caminhada ou treino em casa.",
                "icone": "escudo"
        },
        {
                "titulo": "Ligar para um familiar 3",
                "descricao": "Fazer uma chamada para alguém querido.",
                "icone": "coracao"
        },
        {
                "titulo": "Organizar guarda-roupa 3",
                "descricao": "Dobrar peças soltas e organizar cabides.",
                "icone": "caixa"
        },
        {
                "titulo": "Planejar a semana 3",
                "descricao": "Revisar a agenda e principais metas.",
                "icone": "lista"
        },
        {
                "titulo": "Meditação de 10 min 3",
                "descricao": "Pausar e focar na respiração.",
                "icone": "default"
        },
        {
                "titulo": "Limpar a geladeira 3",
                "descricao": "Descartar o que passou e limpar as prateleiras.",
                "icone": "vassoura"
        },
        {
                "titulo": "Alongamento matinal 3",
                "descricao": "Esticar o corpo logo ao acordar.",
                "icone": "escudo"
        },
        {
                "titulo": "Preparar marmitas 3",
                "descricao": "Cozinhar porções antecipadas para a semana.",
                "icone": "caixa"
        },
        {
                "titulo": "Zero telas antes de dormir 3",
                "descricao": "Desligar celular 1h antes de deitar.",
                "icone": "cama"
        },
        {
                "titulo": "Limpar área de trabalho 3",
                "descricao": "Organizar a mesa e os papéis.",
                "icone": "vassoura"
        },
        {
                "titulo": "Check-up financeiro 3",
                "descricao": "Anotar todos os gastos do final de semana.",
                "icone": "calculadora"
        },
        {
                "titulo": "Trocar roupas de cama 3",
                "descricao": "Colocar lençóis limpos.",
                "icone": "cama"
        },
        {
                "titulo": "Aprender algo novo 3",
                "descricao": "Assistir a um vídeo ou ler um artigo útil.",
                "icone": "livro"
        },
        {
                "titulo": "Organizar a despensa 4",
                "descricao": "Verificar validades e organizar os alimentos.",
                "icone": "caixa"
        },
        {
                "titulo": "Limpeza rápida da sala 4",
                "descricao": "Recolher objetos fora do lugar e tirar o pó.",
                "icone": "vassoura"
        },
        {
                "titulo": "Planejar cardápio 4",
                "descricao": "Anotar as refeições da semana e o que falta comprar.",
                "icone": "lista"
        },
        {
                "titulo": "Revisar as contas 4",
                "descricao": "Conferir a aba de finanças e os próximos vencimentos.",
                "icone": "calculadora"
        },
        {
                "titulo": "Dia do desapego 4",
                "descricao": "Separar 3 itens que não usa mais para doação.",
                "icone": "coracao"
        },
        {
                "titulo": "Beber 2L de água 4",
                "descricao": "Manter a hidratação em dia hoje.",
                "icone": "agua"
        },
        {
                "titulo": "Ler 15 páginas 4",
                "descricao": "Avançar na leitura de um livro atual.",
                "icone": "livro"
        },
        {
                "titulo": "Exercício de 30 min 4",
                "descricao": "Fazer uma caminhada ou treino em casa.",
                "icone": "escudo"
        },
        {
                "titulo": "Ligar para um familiar 4",
                "descricao": "Fazer uma chamada para alguém querido.",
                "icone": "coracao"
        },
        {
                "titulo": "Organizar guarda-roupa 4",
                "descricao": "Dobrar peças soltas e organizar cabides.",
                "icone": "caixa"
        },
        {
                "titulo": "Planejar a semana 4",
                "descricao": "Revisar a agenda e principais metas.",
                "icone": "lista"
        },
        {
                "titulo": "Meditação de 10 min 4",
                "descricao": "Pausar e focar na respiração.",
                "icone": "default"
        },
        {
                "titulo": "Limpar a geladeira 4",
                "descricao": "Descartar o que passou e limpar as prateleiras.",
                "icone": "vassoura"
        },
        {
                "titulo": "Alongamento matinal 4",
                "descricao": "Esticar o corpo logo ao acordar.",
                "icone": "escudo"
        },
        {
                "titulo": "Preparar marmitas 4",
                "descricao": "Cozinhar porções antecipadas para a semana.",
                "icone": "caixa"
        },
        {
                "titulo": "Zero telas antes de dormir 4",
                "descricao": "Desligar celular 1h antes de deitar.",
                "icone": "cama"
        },
        {
                "titulo": "Limpar área de trabalho 4",
                "descricao": "Organizar a mesa e os papéis.",
                "icone": "vassoura"
        },
        {
                "titulo": "Check-up financeiro 4",
                "descricao": "Anotar todos os gastos do final de semana.",
                "icone": "calculadora"
        },
        {
                "titulo": "Trocar roupas de cama 4",
                "descricao": "Colocar lençóis limpos.",
                "icone": "cama"
        },
        {
                "titulo": "Aprender algo novo 4",
                "descricao": "Assistir a um vídeo ou ler um artigo útil.",
                "icone": "livro"
        },
        {
                "titulo": "Organizar a despensa 5",
                "descricao": "Verificar validades e organizar os alimentos.",
                "icone": "caixa"
        },
        {
                "titulo": "Limpeza rápida da sala 5",
                "descricao": "Recolher objetos fora do lugar e tirar o pó.",
                "icone": "vassoura"
        },
        {
                "titulo": "Planejar cardápio 5",
                "descricao": "Anotar as refeições da semana e o que falta comprar.",
                "icone": "lista"
        },
        {
                "titulo": "Revisar as contas 5",
                "descricao": "Conferir a aba de finanças e os próximos vencimentos.",
                "icone": "calculadora"
        },
        {
                "titulo": "Dia do desapego 5",
                "descricao": "Separar 3 itens que não usa mais para doação.",
                "icone": "coracao"
        },
        {
                "titulo": "Beber 2L de água 5",
                "descricao": "Manter a hidratação em dia hoje.",
                "icone": "agua"
        },
        {
                "titulo": "Ler 15 páginas 5",
                "descricao": "Avançar na leitura de um livro atual.",
                "icone": "livro"
        },
        {
                "titulo": "Exercício de 30 min 5",
                "descricao": "Fazer uma caminhada ou treino em casa.",
                "icone": "escudo"
        },
        {
                "titulo": "Ligar para um familiar 5",
                "descricao": "Fazer uma chamada para alguém querido.",
                "icone": "coracao"
        },
        {
                "titulo": "Organizar guarda-roupa 5",
                "descricao": "Dobrar peças soltas e organizar cabides.",
                "icone": "caixa"
        },
        {
                "titulo": "Planejar a semana 5",
                "descricao": "Revisar a agenda e principais metas.",
                "icone": "lista"
        },
        {
                "titulo": "Meditação de 10 min 5",
                "descricao": "Pausar e focar na respiração.",
                "icone": "default"
        },
        {
                "titulo": "Limpar a geladeira 5",
                "descricao": "Descartar o que passou e limpar as prateleiras.",
                "icone": "vassoura"
        },
        {
                "titulo": "Alongamento matinal 5",
                "descricao": "Esticar o corpo logo ao acordar.",
                "icone": "escudo"
        },
        {
                "titulo": "Preparar marmitas 5",
                "descricao": "Cozinhar porções antecipadas para a semana.",
                "icone": "caixa"
        },
        {
                "titulo": "Zero telas antes de dormir 5",
                "descricao": "Desligar celular 1h antes de deitar.",
                "icone": "cama"
        },
        {
                "titulo": "Limpar área de trabalho 5",
                "descricao": "Organizar a mesa e os papéis.",
                "icone": "vassoura"
        },
        {
                "titulo": "Check-up financeiro 5",
                "descricao": "Anotar todos os gastos do final de semana.",
                "icone": "calculadora"
        },
        {
                "titulo": "Trocar roupas de cama 5",
                "descricao": "Colocar lençóis limpos.",
                "icone": "cama"
        },
        {
                "titulo": "Aprender algo novo 5",
                "descricao": "Assistir a um vídeo ou ler um artigo útil.",
                "icone": "livro"
        }
    ],
    kids: [
        { "titulo": "Escovar os dentes", "descricao": "Deixar os dentinhos brilhando!", "emoji_inteligente": "🪥" },
        { "titulo": "Arrumar a cama", "descricao": "Esticar os lençóis logo ao acordar.", "emoji_inteligente": "🛏️" },
        { "titulo": "Guardar brinquedos", "descricao": "Colocar tudo na caixa após brincar.", "emoji_inteligente": "🧸" },
        { "titulo": "Beber água", "descricao": "Encher a garrafinha e beber tudo.", "emoji_inteligente": "💧" },
        { "titulo": "Ler um livrinho", "descricao": "Ler as páginas do seu livro favorito.", "emoji_inteligente": "📖" },
        { "titulo": "Tomar banho", "descricao": "Se lavar bem para ficar cheiroso.", "emoji_inteligente": "🛀" },
        { "titulo": "Comer uma fruta", "descricao": "Lanche saudável do dia.", "emoji_inteligente": "🍎" },
        { "titulo": "Lavar as mãos", "descricao": "Usar sabão antes de comer.", "emoji_inteligente": "🧼" },
        { "titulo": "Ajudar na mesa", "descricao": "Levar o próprio prato para a pia.", "emoji_inteligente": "🍽️" },
        { "titulo": "Dar comida pro pet", "descricao": "Colocar ração ou água para o bichinho.", "emoji_inteligente": "🐶" },
        { "titulo": "Fazer a tarefa de casa", "descricao": "Terminar as lições da escola.", "emoji_inteligente": "✏️" },
        { "titulo": "Hora de dormir cedo", "descricao": "Ir para a cama no horário certo.", "emoji_inteligente": "😴" },
        { "titulo": "Guardar os sapatos", "descricao": "Colocar o calçado no lugar ao chegar.", "emoji_inteligente": "👟" },
        { "titulo": "Arrumar mochila", "descricao": "Deixar o material pronto para amanhã.", "emoji_inteligente": "🎒" },
        { "titulo": "Jogar o lixo fora", "descricao": "Colocar o lixinho no cesto.", "emoji_inteligente": "🗑️" },
        { "titulo": "Abraçar os pais", "descricao": "Dar um abraço bem apertado!", "emoji_inteligente": "🤗" },
        { "titulo": "Comer todos os legumes", "descricao": "Ficar forte com a salada.", "emoji_inteligente": "🥦" },
        { "titulo": "Organizar as roupas", "descricao": "Colocar a roupa suja no cesto.", "emoji_inteligente": "👕" },
        { "titulo": "Tempo sem tela", "descricao": "Brincar 1 hora sem celular ou TV.", "emoji_inteligente": "🧩" },
        { "titulo": "Falar por favor e obrigado", "descricao": "Usar as palavras mágicas hoje.", "emoji_inteligente": "✨" },
        { "titulo": "Escovar os dentes 2", "descricao": "Deixar os dentinhos brilhando!", "emoji_inteligente": "🪥" },
        { "titulo": "Arrumar a cama 2", "descricao": "Esticar os lençóis logo ao acordar.", "emoji_inteligente": "🛏️" },
        { "titulo": "Guardar brinquedos 2", "descricao": "Colocar tudo na caixa após brincar.", "emoji_inteligente": "🧸" },
        { "titulo": "Beber água 2", "descricao": "Encher a garrafinha e beber tudo.", "emoji_inteligente": "💧" },
        { "titulo": "Ler um livrinho 2", "descricao": "Ler as páginas do seu livro favorito.", "emoji_inteligente": "📖" },
        { "titulo": "Tomar banho 2", "descricao": "Se lavar bem para ficar cheiroso.", "emoji_inteligente": "🛀" },
        { "titulo": "Comer uma fruta 2", "descricao": "Lanche saudável do dia.", "emoji_inteligente": "🍎" },
        { "titulo": "Lavar as mãos 2", "descricao": "Usar sabão antes de comer.", "emoji_inteligente": "🧼" },
        { "titulo": "Ajudar na mesa 2", "descricao": "Levar o próprio prato para a pia.", "emoji_inteligente": "🍽️" },
        { "titulo": "Dar comida pro pet 2", "descricao": "Colocar ração ou água para o bichinho.", "emoji_inteligente": "🐶" },
        { "titulo": "Fazer a tarefa de casa 2", "descricao": "Terminar as lições da escola.", "emoji_inteligente": "✏️" },
        { "titulo": "Hora de dormir cedo 2", "descricao": "Ir para a cama no horário certo.", "emoji_inteligente": "😴" },
        { "titulo": "Guardar os sapatos 2", "descricao": "Colocar o calçado no lugar ao chegar.", "emoji_inteligente": "👟" },
        { "titulo": "Arrumar mochila 2", "descricao": "Deixar o material pronto para amanhã.", "emoji_inteligente": "🎒" },
        { "titulo": "Jogar o lixo fora 2", "descricao": "Colocar o lixinho no cesto.", "emoji_inteligente": "🗑️" },
        { "titulo": "Abraçar os pais 2", "descricao": "Dar um abraço bem apertado!", "emoji_inteligente": "🤗" },
        { "titulo": "Comer todos os legumes 2", "descricao": "Ficar forte com a salada.", "emoji_inteligente": "🥦" },
        { "titulo": "Organizar as roupas 2", "descricao": "Colocar a roupa suja no cesto.", "emoji_inteligente": "👕" },
        { "titulo": "Tempo sem tela 2", "descricao": "Brincar 1 hora sem celular ou TV.", "emoji_inteligente": "🧩" },
        { "titulo": "Falar por favor e obrigado 2", "descricao": "Usar as palavras mágicas hoje.", "emoji_inteligente": "✨" },
        { "titulo": "Escovar os dentes 3", "descricao": "Deixar os dentinhos brilhando!", "emoji_inteligente": "🪥" },
        { "titulo": "Arrumar a cama 3", "descricao": "Esticar os lençóis logo ao acordar.", "emoji_inteligente": "🛏️" },
        { "titulo": "Guardar brinquedos 3", "descricao": "Colocar tudo na caixa após brincar.", "emoji_inteligente": "🧸" },
        { "titulo": "Beber água 3", "descricao": "Encher a garrafinha e beber tudo.", "emoji_inteligente": "💧" },
        { "titulo": "Ler um livrinho 3", "descricao": "Ler as páginas do seu livro favorito.", "emoji_inteligente": "📖" },
        { "titulo": "Tomar banho 3", "descricao": "Se lavar bem para ficar cheiroso.", "emoji_inteligente": "🛀" },
        { "titulo": "Comer uma fruta 3", "descricao": "Lanche saudável do dia.", "emoji_inteligente": "🍎" },
        { "titulo": "Lavar as mãos 3", "descricao": "Usar sabão antes de comer.", "emoji_inteligente": "🧼" },
        { "titulo": "Ajudar na mesa 3", "descricao": "Levar o próprio prato para a pia.", "emoji_inteligente": "🍽️" },
        { "titulo": "Dar comida pro pet 3", "descricao": "Colocar ração ou água para o bichinho.", "emoji_inteligente": "🐶" },
        { "titulo": "Fazer a tarefa de casa 3", "descricao": "Terminar as lições da escola.", "emoji_inteligente": "✏️" },
        { "titulo": "Hora de dormir cedo 3", "descricao": "Ir para a cama no horário certo.", "emoji_inteligente": "😴" },
        { "titulo": "Guardar os sapatos 3", "descricao": "Colocar o calçado no lugar ao chegar.", "emoji_inteligente": "👟" },
        { "titulo": "Arrumar mochila 3", "descricao": "Deixar o material pronto para amanhã.", "emoji_inteligente": "🎒" },
        { "titulo": "Jogar o lixo fora 3", "descricao": "Colocar o lixinho no cesto.", "emoji_inteligente": "🗑️" },
        { "titulo": "Abraçar os pais 3", "descricao": "Dar um abraço bem apertado!", "emoji_inteligente": "🤗" },
        { "titulo": "Comer todos os legumes 3", "descricao": "Ficar forte com a salada.", "emoji_inteligente": "🥦" },
        { "titulo": "Organizar as roupas 3", "descricao": "Colocar a roupa suja no cesto.", "emoji_inteligente": "👕" },
        { "titulo": "Tempo sem tela 3", "descricao": "Brincar 1 hora sem celular ou TV.", "emoji_inteligente": "🧩" },
        { "titulo": "Falar por favor e obrigado 3", "descricao": "Usar as palavras mágicas hoje.", "emoji_inteligente": "✨" },
        { "titulo": "Escovar os dentes 4", "descricao": "Deixar os dentinhos brilhando!", "emoji_inteligente": "🪥" },
        { "titulo": "Arrumar a cama 4", "descricao": "Esticar os lençóis logo ao acordar.", "emoji_inteligente": "🛏️" },
        { "titulo": "Guardar brinquedos 4", "descricao": "Colocar tudo na caixa após brincar.", "emoji_inteligente": "🧸" },
        { "titulo": "Beber água 4", "descricao": "Encher a garrafinha e beber tudo.", "emoji_inteligente": "💧" },
        { "titulo": "Ler um livrinho 4", "descricao": "Ler as páginas do seu livro favorito.", "emoji_inteligente": "📖" },
        { "titulo": "Tomar banho 4", "descricao": "Se lavar bem para ficar cheiroso.", "emoji_inteligente": "🛀" },
        { "titulo": "Comer uma fruta 4", "descricao": "Lanche saudável do dia.", "emoji_inteligente": "🍎" },
        { "titulo": "Lavar as mãos 4", "descricao": "Usar sabão antes de comer.", "emoji_inteligente": "🧼" },
        { "titulo": "Ajudar na mesa 4", "descricao": "Levar o próprio prato para a pia.", "emoji_inteligente": "🍽️" },
        { "titulo": "Dar comida pro pet 4", "descricao": "Colocar ração ou água para o bichinho.", "emoji_inteligente": "🐶" },
        { "titulo": "Fazer a tarefa de casa 4", "descricao": "Terminar as lições da escola.", "emoji_inteligente": "✏️" },
        { "titulo": "Hora de dormir cedo 4", "descricao": "Ir para a cama no horário certo.", "emoji_inteligente": "😴" },
        { "titulo": "Guardar os sapatos 4", "descricao": "Colocar o calçado no lugar ao chegar.", "emoji_inteligente": "👟" },
        { "titulo": "Arrumar mochila 4", "descricao": "Deixar o material pronto para amanhã.", "emoji_inteligente": "🎒" },
        { "titulo": "Jogar o lixo fora 4", "descricao": "Colocar o lixinho no cesto.", "emoji_inteligente": "🗑️" },
        { "titulo": "Abraçar os pais 4", "descricao": "Dar um abraço bem apertado!", "emoji_inteligente": "🤗" },
        { "titulo": "Comer todos os legumes 4", "descricao": "Ficar forte com a salada.", "emoji_inteligente": "🥦" },
        { "titulo": "Organizar as roupas 4", "descricao": "Colocar a roupa suja no cesto.", "emoji_inteligente": "👕" },
        { "titulo": "Tempo sem tela 4", "descricao": "Brincar 1 hora sem celular ou TV.", "emoji_inteligente": "🧩" },
        { "titulo": "Falar por favor e obrigado 4", "descricao": "Usar as palavras mágicas hoje.", "emoji_inteligente": "✨" },
        { "titulo": "Escovar os dentes 5", "descricao": "Deixar os dentinhos brilhando!", "emoji_inteligente": "🪥" },
        { "titulo": "Arrumar a cama 5", "descricao": "Esticar os lençóis logo ao acordar.", "emoji_inteligente": "🛏️" },
        { "titulo": "Guardar brinquedos 5", "descricao": "Colocar tudo na caixa após brincar.", "emoji_inteligente": "🧸" },
        { "titulo": "Beber água 5", "descricao": "Encher a garrafinha e beber tudo.", "emoji_inteligente": "💧" },
        { "titulo": "Ler um livrinho 5", "descricao": "Ler as páginas do seu livro favorito.", "emoji_inteligente": "📖" },
        { "titulo": "Tomar banho 5", "descricao": "Se lavar bem para ficar cheiroso.", "emoji_inteligente": "🛀" },
        { "titulo": "Comer uma fruta 5", "descricao": "Lanche saudável do dia.", "emoji_inteligente": "🍎" },
        { "titulo": "Lavar as mãos 5", "descricao": "Usar sabão antes de comer.", "emoji_inteligente": "🧼" },
        { "titulo": "Ajudar na mesa 5", "descricao": "Levar o próprio prato para a pia.", "emoji_inteligente": "🍽️" },
        { "titulo": "Dar comida pro pet 5", "descricao": "Colocar ração ou água para o bichinho.", "emoji_inteligente": "🐶" },
        { "titulo": "Fazer a tarefa de casa 5", "descricao": "Terminar as lições da escola.", "emoji_inteligente": "✏️" },
        { "titulo": "Hora de dormir cedo 5", "descricao": "Ir para a cama no horário certo.", "emoji_inteligente": "😴" },
        { "titulo": "Guardar os sapatos 5", "descricao": "Colocar o calçado no lugar ao chegar.", "emoji_inteligente": "👟" },
        { "titulo": "Arrumar mochila 5", "descricao": "Deixar o material pronto para amanhã.", "emoji_inteligente": "🎒" },
        { "titulo": "Jogar o lixo fora 5", "descricao": "Colocar o lixinho no cesto.", "emoji_inteligente": "🗑️" },
        { "titulo": "Abraçar os pais 5", "descricao": "Dar um abraço bem apertado!", "emoji_inteligente": "🤗" },
        { "titulo": "Comer todos os legumes 5", "descricao": "Ficar forte com a salada.", "emoji_inteligente": "🥦" },
        { "titulo": "Organizar as roupas 5", "descricao": "Colocar a roupa suja no cesto.", "emoji_inteligente": "👕" },
        { "titulo": "Tempo sem tela 5", "descricao": "Brincar 1 hora sem celular ou TV.", "emoji_inteligente": "🧩" },
        { "titulo": "Falar por favor e obrigado 5", "descricao": "Usar as palavras mágicas hoje.", "emoji_inteligente": "✨" }
    ],
    sugestoesDaSemana: { kids: [], adultos: [] },
    indiceAtual: 0,
    abaAtiva: 'kids',

    inicializar: function() {
        this.verificarNovaSemana();
        this.preInstalarKids();
    },

    verificarNovaSemana: function() {
        const dataUltimaAtualizacao = localStorage.getItem('suiri_sugestoes_data');
        const dataAtual = new Date();
        if (!dataUltimaAtualizacao || (dataAtual.getDay() === 1 && dataAtual.toDateString() !== dataUltimaAtualizacao)) {
            this.sortearNovasMissoes();
            localStorage.setItem('suiri_sugestoes_data', dataAtual.toDateString());
        } else {
            this.carregarMissoesSalvas();
        }
    },

    sortearNovasMissoes: function() {
        this.sugestoesDaSemana.kids = this.embaralhar([...this.kids]).slice(0, 5);
        this.sugestoesDaSemana.adultos = this.embaralhar([...this.adultos]).slice(0, 5);
        localStorage.setItem('suiri_sugestoes_semana', JSON.stringify(this.sugestoesDaSemana));
    },

    carregarMissoesSalvas: function() {
        const salvas = localStorage.getItem('suiri_sugestoes_semana');
        if (salvas) {
            this.sugestoesDaSemana = JSON.parse(salvas);
        } else {
            this.sortearNovasMissoes();
        }
    },

    preInstalarKids: function() {
        const kidsJaInstalado = localStorage.getItem('suiri_kids_preinstalado');
        if (!kidsJaInstalado) {
            console.log("Pré-instalando 5 sugestões Kids no sistema...");
            localStorage.setItem('suiri_kids_preinstalado', 'true');
        }
    },

    embaralhar: function(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
};

window.abrirModalSugestoes = function() {
    window.SugestoesMissoes.inicializar();
    document.getElementById('modal-sugestoes-missoes').classList.remove('oculto');
    const abaInicial = (document.body.classList.contains('modo-kids-ativo')) ? 'kids' : 'adultos';
    window.trocarAbaSugestoes(abaInicial);
};

window.fecharModalSugestoes = function() {
    document.getElementById('modal-sugestoes-missoes').classList.add('oculto');
};

window.trocarAbaSugestoes = function(aba) {
    window.SugestoesMissoes.abaAtiva = aba;
    window.SugestoesMissoes.indiceAtual = 0;
    
    document.getElementById('btn-sugestao-tab-kids').classList.toggle('ativo', aba === 'kids');
    document.getElementById('btn-sugestao-tab-adultos').classList.toggle('ativo', aba === 'adultos');
    
    window.renderizarSugestaoAtual();
};

window.renderizarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba];
    const indice = window.SugestoesMissoes.indiceAtual;
    
    if (!lista || lista.length === 0) return;
    
    const sugestao = lista[indice];
    document.getElementById('sugestao-titulo').innerText = sugestao.titulo;
    document.getElementById('sugestao-descricao').innerText = sugestao.descricao;
    
    const iconeContainer = document.getElementById('sugestao-icone-svg');
    
    if (aba === 'kids') {
        // Sem estrela SVG: exibe diretamente o Emoji nítido e em concordância com a tarefa
        const emojiTarefa = window.obterEmojiConcordanteKids(sugestao.titulo, sugestao.emoji_inteligente || sugestao.emoji);
        iconeContainer.innerHTML = `<div style="font-size: 72px; line-height: 1.1; margin-bottom: 8px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)); user-select: none;">${emojiTarefa}</div>`;
    } else {
        // Adultos usam SVGs minimalistas monocromáticos
        const svgs = {
            'escova': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            'cama': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M2 4v16M22 4v16M2 8h20M2 17h20"/></svg>',
            'agua': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
            'livro': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
            'caixa': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>',
            'vassoura': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M21 3l-6 6M21 3l-4 4M21 3v4M21 3h-4"/><path d="M15 9l-4 4-2-2-4 4 2 2-4 4c4 0 6-2 8-4l2 2 4-4-2-2 4-4"/></svg>',
            'lista': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
            'calculadora': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg>',
            'coracao': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'escudo': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            'default': '<svg class="icone-svg" style="width:48px; height:48px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>'
        };
        iconeContainer.innerHTML = svgs[sugestao.icone] || svgs['default'];
    }
};

window.sugestaoProxima = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba];
    window.SugestoesMissoes.indiceAtual = (window.SugestoesMissoes.indiceAtual + 1) % lista.length;
    window.renderizarSugestaoAtual();
};

window.sugestaoAnterior = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const lista = window.SugestoesMissoes.sugestoesDaSemana[aba];
    window.SugestoesMissoes.indiceAtual = (window.SugestoesMissoes.indiceAtual - 1 + lista.length) % lista.length;
    window.renderizarSugestaoAtual();
};

window.aceitarSugestaoAtual = function() {
    const aba = window.SugestoesMissoes.abaAtiva;
    const sugestao = window.SugestoesMissoes.sugestoesDaSemana[aba][window.SugestoesMissoes.indiceAtual];
    
    const inputTitulo = document.getElementById('input-nova-missao-titulo');
    if(inputTitulo) {
        // Remove números finais de lote (ex: "Arrumar a cama 2" -> "Arrumar a cama") para ficar limpo no cartão
        const tituloLimpo = (sugestao.titulo || '').replace(/\s+[2-5]$/, '');
        inputTitulo.value = tituloLimpo;
        
        // Se for kids, preenchemos o input de emoji gigante com o emoji em concordância
        const inputEmoji = document.getElementById('input-nova-missao-emoji');
        if (aba === 'kids') {
            if (inputEmoji) {
                inputEmoji.value = window.obterEmojiConcordanteKids(tituloLimpo, sugestao.emoji_inteligente || sugestao.emoji);
                inputEmoji.classList.remove('oculto');
                
                setTimeout(() => {
                    inputEmoji.focus();
                    if (typeof inputEmoji.setSelectionRange === 'function') {
                        inputEmoji.setSelectionRange(0, inputEmoji.value.length);
                    } else {
                        inputEmoji.select();
                    }
                }, 300);
            }
            const selectResp = document.getElementById('select-nova-missao-responsavel');
            if(selectResp) selectResp.value = 'todos_kids';
        } else {
            if (inputEmoji) inputEmoji.value = '';
        }
        
        window.fecharModalSugestoes();
        document.getElementById('modal-nova-missao').classList.remove('oculto');
        
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`Sugestão carregada!`, 'sucesso');
        }
    }
};

// Suporte para deslizar (Swipe Gestures)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    const cartao = document.getElementById('cartao-sugestao-atual');
    if (cartao) {
        cartao.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        cartao.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
    }
});

function handleSwipe() {
    if (touchEndX < touchStartX - 40) window.sugestaoProxima();
    if (touchEndX > touchStartX + 40) window.sugestaoAnterior();
}
