/* Suiri Família 7.0 · domínio extraído de app-gestao.js. */
// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-GESTAO.JS (100% COMPLETO E INTEGRAL)
// Mercado com Reconhecimento de Voz Inteligente & Fallback Robusto,
// Leitura de Cupom Fiscal (Atualizado para Gemini 2.5 Flash),
// Sugestões de Cardápio Mensal no Quadro de Avisos,
// Histórico de Preço Médio/Último, Extrato com Pesquisa Instantânea,
// Transferência de Saldo entre Carteiras e Agendamentos Recorrentes.
// Integrado com o Catálogo de Ícones PNG Transparentes (./icone/)
// Design System Warm Tech: Linho Orgânico, Elevações Suaves e Luz Solar
// =========================================================================

window.itensMercadoAtual = [];
window.cacheTransacoesExtrato = [];
let itemParaExcluirAgendaId = null;
let reconhecimentoVozMercado = null;

// Chave local para memorização de escopo padrão em Finanças
const CHAVE_PREF_ESCOPO_FINANCAS = 'suiri_pref_escopo_financas';

// Dicionário local para classificar termos não cadastrados
const DICIONARIO_SEGMENTOS_MERCADO = {
    'Açougue': ['carne', 'frango', 'alcatra', 'picanha', 'patinho', 'linguiça', 'peixe', 'tilapia', 'bisteca', 'coxa', 'moída', 'bacon', 'costela', 'bife'],
    'Hortifrúti': ['tomate', 'cebola', 'batata', 'banana', 'maçã', 'alface', 'laranja', 'cenoura', 'alho', 'limão', 'abacate', 'mamão', 'couve', 'fruta', 'verdura'],
    'Limpeza': ['detergente', 'amaciante', 'sabão', 'desinfetante', 'água sanitária', 'esponja', 'multiuso', 'cloro', 'saco de lixo', 'vassoura', 'sabao'],
    'Higiene': ['sabonete', 'shampoo', 'condicionador', 'pasta de dente', 'creme dental', 'fio dental', 'papel higiênico', 'desodorante', 'cotonete'],
    'Laticínios': ['leite', 'queijo', 'requeijão', 'iogurte', 'manteiga', 'creme de leite', 'leite condensado', 'parmesão'],
    'Padaria': ['pão', 'bolo', 'torrada', 'biscoito', 'bolacha', 'croissant', 'pao'],
    'Bebidas': ['café', 'chá', 'suco', 'refrigerante', 'cerveja', 'água mineral', 'vinho', 'cafe'],
    'Mercearia': ['arroz', 'feijão', 'macarrão', 'óleo', 'azeite', 'açúcar', 'sal', 'farinha', 'molho de tomate', 'milho', 'ervilha', 'aveia', 'feijao', 'oleo']
};

function gerarUUIDSeguro() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try { return crypto.randomUUID(); } catch (e) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}




// =========================================================================
// GESTÃO DE PREFERÊNCIA DE ESCOPO (MEMÓRIA: COMPARTILHADO VS PRIVADO)
// Primeiro uso padrão: 'casa' (compartilhado)
// =========================================================================

