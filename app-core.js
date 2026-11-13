// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-CORE.JS (100% COMPLETO E INTEGRAL)
// Núcleo de Sessão, Autenticação, Trocar Membro (Tela Cheia & Avatares Grandes),
// Login Real Oficial para Troca de Adultos com Senha de Acesso,
// Modal Nativo "Concordo / Cancelar", Transições Direcionais Inteligentes,
// Modo Kids Isolado, Ciclo Horário Automático do Cenário (Manhã / Tarde / Noite),
// Integração Mascote Tamagotchi, Gestão de Avatar, Fila Offline (IndexedDB)
// SVGs Coloridos Ilustrados com Preenchimento e Catálogo com Busca Semântica
// AJUSTE: Abertura Direta Sem Vídeo Splash de Introdução
// =========================================================================

// Configuração do Supabase
const SUPABASE_URL = 'https://apbqjbrqwulgohcjkxae.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5hbnJj3KsCaxsfzjuGy0Xg_2io0kWPR';

// Inicialização segura e disponibilização global para todos os módulos
var cliente = (typeof window.supabase !== 'undefined' && window.supabase.createClient && SUPABASE_URL.startsWith('http'))
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

window.cliente = cliente;
window.clienteSupabase = cliente;

var esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
window.esc = esc;

// =========================================================================
// CATÁLOGO UNIVERSAL DE ÍCONES SVG COLORIDOS E ILUSTRADOS COM PREENCHIMENTO
// =========================================================================
window.IconesSuiri = {
    // --- CASA, LIMPEZA & ROTINA DOMÉSTICA ---
    vassoura: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#D97706" d="M38 4l6 6-18 18-6-6L38 4z"/><path fill="#92400E" d="M42 2l4 4-4 4-4-4 4-4z"/><path fill="#FBBF24" d="M12 28l8 8-12 10H4l-2-2 2-6 10-10z"/><path fill="#F59E0B" d="M14 36l-8 6h4l6-4-2-2z"/></svg>`,
    cama: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="44" height="24" x="2" y="18" fill="#60A5FA" rx="4"/><path fill="#3B82F6" d="M2 30h44v12H2z"/><circle cx="12" cy="14" r="6" fill="#FDE047"/><rect width="14" height="8" x="6" y="20" fill="#FFFFFF" rx="3"/><rect width="14" height="8" x="24" y="20" fill="#FFFFFF" rx="3"/><path fill="#1E40AF" d="M2 38h4v6H2zm40 0h4v6h-4z"/></svg>`,
    banheira: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#38BDF8" d="M6 22h36a2 2 0 0 1 2 2v6a12 12 0 0 1-12 12H16A12 12 0 0 1 4 30v-6a2 2 0 0 1 2-2z"/><path fill="#0284C7" d="M10 22V10a4 4 0 0 1 4-4h2v4h-2a2 2 0 0 0-2 2v6h-2z"/><circle cx="20" cy="14" r="2" fill="#E0F2FE"/><circle cx="26" cy="12" r="3" fill="#E0F2FE"/><circle cx="32" cy="15" r="2" fill="#E0F2FE"/><path fill="#64748B" d="M10 42v4h4v-4h-4zm24 0v4h4v-4h-4z"/></svg>`,
    louca: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/><circle cx="24" cy="24" r="14" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/><circle cx="24" cy="24" r="9" fill="#38BDF8" opacity="0.35"/><path fill="#F59E0B" d="M24 8v32M8 24h32"/></svg>`,
    lixo: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#64748B" d="M10 14l3 28a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4l3-28H10z"/><rect width="36" height="6" x="6" y="8" fill="#475569" rx="2"/><rect width="12" height="4" x="18" y="4" fill="#334155" rx="2"/><path fill="#94A3B8" d="M18 18v20h3V18h-3zm9 0v20h3V18h-3z"/></svg>`,
    camisa: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#3B82F6" d="M38 10l8 6-4 8-6-3v21a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V21l-6 3-4-8 8-6 8 4h8l8-4z"/><path fill="#1D4ED8" d="M20 10l4 6 4-6-4-2-4 2z"/><circle cx="24" cy="22" r="1.5" fill="#FFFFFF"/><circle cx="24" cy="28" r="1.5" fill="#FFFFFF"/><circle cx="24" cy="34" r="1.5" fill="#FFFFFF"/></svg>`,
    casa: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#EF4444" d="M24 4L2 22h6v20a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V22h6L24 4z"/><path fill="#FDE047" d="M20 30h8v14h-8z"/><rect width="8" height="8" x="12" y="20" fill="#60A5FA" rx="1"/><rect width="8" height="8" x="28" y="20" fill="#60A5FA" rx="1"/></svg>`,
    planta: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#D97706" d="M14 26l3 18h14l3-18H14z"/><path fill="#22C55E" d="M24 26V10c0-6 8-8 12-4s-2 14-12 20z"/><path fill="#16A34A" d="M24 26V14c0-5-7-7-10-3s1 12 10 15z"/></svg>`,

    // --- REFEIÇÃO, ALIMENTOS & MERCADO ---
    refeicao: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="#F59E0B"/><path fill="#EA580C" d="M20 20a4 4 0 0 1 8 0c0 3-4 7-4 7s-4-4-4-7z"/><path fill="#22C55E" d="M28 26a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path fill="#94A3B8" d="M4 12v24h3V24h2v12h3V12c-2 0-3 2-4 3-1-1-2-3-4-3zm36 0v24h4V12c-4 0-4 6-4 12z"/></svg>`,
    carrinho: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="18" cy="42" r="4" fill="#334155"/><circle cx="38" cy="42" r="4" fill="#334155"/><path fill="#F59E0B" d="M4 6h6l6 24h22l4-18H14"/><path fill="#EF4444" d="M22 14h18v10H24l-2-10z"/></svg>`,
    maca: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#EF4444" d="M24 12c-3-4-8-4-12-1s-4 10-1 18c3 7 11 15 13 15s10-8 13-15c3-8 2-15-1-18s-9-3-12 1z"/><path fill="#15803D" d="M24 12c0-5 3-8 6-9-1 4-3 7-6 9z"/><circle cx="18" cy="22" r="2" fill="#FECDD3" opacity="0.6"/></svg>`,
    cenoura: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#F97316" d="M36 12L12 44c-2 2-6 0-5-3L20 4l16 8z"/><path fill="#22C55E" d="M28 8c2-4 7-6 12-6-1 5-4 9-8 10l-4-4zm6 6c4-1 9 1 12 5-4 2-8 1-11-2l-1-3z"/></svg>`,

    // --- FINANÇAS, CONTAS & TRABALHO ---
    carteira: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="40" height="28" x="4" y="10" fill="#92400E" rx="5"/><path fill="#B45309" d="M4 18h40v4H4z"/><path fill="#FDE047" d="M32 20h12v10H32a4 4 0 0 1 0-8z"/><circle cx="38" cy="24" r="2" fill="#B45309"/></svg>`,
    moeda: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#FBBF24"/><circle cx="24" cy="24" r="16" fill="#F59E0B"/><path fill="#FEF08A" d="M24 14v20M18 18h10a4 4 0 0 1 0 8H18a4 4 0 0 0 0 8h12"/></svg>`,
    conta: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#F1F5F9" d="M8 4h32v40l-6-4-6 4-6-4-6 4-8-4V4z"/><path fill="#3B82F6" d="M14 12h20v4H14zm0 8h20v3H14zm0 7h14v3H14z"/><circle cx="34" cy="34" r="6" fill="#22C55E"/><path fill="#FFFFFF" d="m32 34 2 2 4-4"/></svg>`,
    agenda: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="40" height="36" x="4" y="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="4"/><path fill="#EF4444" d="M4 8h40v10H4z"/><rect width="4" height="8" x="12" y="4" fill="#334155" rx="2"/><rect width="4" height="8" x="32" y="4" fill="#334155" rx="2"/><circle cx="16" cy="26" r="2" fill="#3B82F6"/><circle cx="24" cy="26" r="2" fill="#F59E0B"/><circle cx="32" cy="26" r="2" fill="#10B981"/><circle cx="16" cy="34" r="2" fill="#8B5CF6"/><circle cx="24" cy="34" r="2" fill="#EC4899"/><circle cx="32" cy="34" r="2" fill="#64748B"/></svg>`,
    relogio: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#0284C7"/><circle cx="24" cy="24" r="16" fill="#FFFFFF"/><path fill="#0F172A" d="M22 14h4v11h6v4H22z"/><circle cx="24" cy="24" r="2" fill="#EF4444"/></svg>`,

    // --- MANUTENÇÃO, SERVIÇOS & TECNOLOGIA ---
    raio: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#FACC15" stroke="#EAB308" stroke-width="2" d="M26 2L8 26h14l-2 20 18-24H24l2-20z"/></svg>`,
    agua: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#38BDF8" d="M24 4C24 4 10 18 10 28a14 14 0 0 0 28 0C38 18 24 4 24 4z"/><path fill="#BAE6FD" d="M20 20a6 6 0 0 0-6 6c0 1 1 1 1 0a4 4 0 0 1 4-4c1 0 1-1 1-2z"/></svg>`,
    gota: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#0284C7" d="M24 6S12 18 12 28a12 12 0 0 0 24 0c0-10-12-22-12-22z"/><circle cx="20" cy="26" r="3" fill="#BAE6FD"/></svg>`,
    wifi: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#3B82F6" d="M24 34a4 4 0 1 1-4 4 4 4 0 0 1 4-4zm-12-8a16 16 0 0 1 24 0l-4 4a11 11 0 0 0-16 0zm-8-8a27 27 0 0 1 40 0l-4 4a22 22 0 0 0-32 0z"/></svg>`,
    carro: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#EF4444" d="M8 22l6-10h20l6 10H8z"/><path fill="#DC2626" d="M4 22h40v14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V22z"/><circle cx="14" cy="38" r="5" fill="#1E293B"/><circle cx="34" cy="38" r="5" fill="#1E293B"/><rect width="18" height="6" x="15" y="14" fill="#E0F2FE" rx="2"/></svg>`,
    martelo: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#D97706" d="M14 26l8 8-16 12-4-4 12-16z"/><path fill="#64748B" d="M20 18l8-8 12 12-8 8-12-12z"/><rect width="8" height="18" x="30" y="4" fill="#475569" rx="2" transform="rotate(45 34 13)"/></svg>`,
    tesoura: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="12" cy="36" r="6" fill="#F59E0B"/><circle cx="36" cy="36" r="6" fill="#F59E0B"/><path fill="#94A3B8" d="m14 32 18-24 4 2-16 26zm20 0L16 8l-4 2 16 26z"/></svg>`,
    lampada: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#FDE047" d="M24 4a14 14 0 0 0-9 24c2 3 3 6 3 8h12c0-2 1-5 3-8a14 14 0 0 0-9-24z"/><rect width="10" height="6" x="19" y="38" fill="#94A3B8" rx="2"/><path fill="#64748B" d="M21 44h6v2h-6z"/></svg>`,

    // --- SAÚDE, HIGIENE, AUTOCUIDADO & EXERCÍCIO ---
    ioga: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="10" r="5" fill="#F59E0B"/><path fill="#10B981" d="M24 18c-5 0-10 4-10 9 0 3 2 5 5 5 2 0 4-2 5-4 1 2 3 4 5 4 3 0 5-2 5-5 0-5-5-9-10-9z"/><path fill="#059669" d="M12 36c4-3 8-4 12-4s8 1 12 4c2 2 1 6-2 6H14c-3 0-4-4-2-6z"/></svg>`,
    treino: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="8" height="24" x="4" y="12" fill="#64748B" rx="3"/><rect width="6" height="18" x="12" y="15" fill="#475569" rx="2"/><rect width="20" height="6" x="14" y="21" fill="#94A3B8"/><rect width="6" height="18" x="30" y="15" fill="#475569" rx="2"/><rect width="8" height="24" x="36" y="12" fill="#64748B" rx="3"/></svg>`,
    coracao: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#EF4444" d="M24 42s-16-10-20-21a11 11 0 0 1 19-8l1 2 1-2a11 11 0 0 1 19 8c-4 11-20 21-20 21z"/></svg>`,
    remedio: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="16" height="32" x="16" y="8" fill="#EF4444" rx="8" transform="rotate(45 24 24)"/><path fill="#FFFFFF" d="M16 16l16 16c4-4 4-12 0-16s-12-4-16 0z"/></svg>`,
    escovaDente: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="6" height="36" x="14" y="6" fill="#38BDF8" rx="3" transform="rotate(-30 17 24)"/><rect width="10" height="12" x="26" y="6" fill="#FFFFFF" rx="2"/><path fill="#0284C7" d="M28 8h6v2h-6zm0 4h6v2h-6z"/></svg>`,
    oculos: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="14" cy="24" r="10" fill="#E0F2FE" stroke="#334155" stroke-width="3"/><circle cx="34" cy="24" r="10" fill="#E0F2FE" stroke="#334155" stroke-width="3"/><path fill="none" stroke="#334155" stroke-width="3" d="M24 24h0M4 22l6-4M44 22l-6-4"/></svg>`,

    // --- ESTUDO, LAZER & FAMÍLIA ---
    livro: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#3B82F6" d="M6 10c8-2 16 0 18 3v27c-4-2-12-3-18-1V10z"/><path fill="#2563EB" d="M42 10c-8-2-16 0-18 3v27c4-2 12-3 18-1V10z"/><path fill="#DBEAFE" d="M8 12c6-1 12 1 14 3v22c-4-2-9-2-14-1V12zm32 0c-6-1-12 1-14 3v22c4-2 9-2 14-1V12z"/></svg>`,
    lapis: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#F59E0B" d="m32 6 10 10L16 42l-10 2 2-10L32 6z"/><path fill="#EF4444" d="m36 2 8 8-4 4-8-8 4-4z"/><path fill="#1E293B" d="m6 44 4-1-3-3-1 4z"/></svg>`,
    mochila: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="28" height="32" x="10" y="12" fill="#8B5CF6" rx="6"/><path fill="#6D28D9" d="M14 26h20v14H14z"/><path fill="#C4B5FD" d="M18 12V8a6 6 0 0 1 12 0v4"/><circle cx="24" cy="30" r="2" fill="#FDE047"/></svg>`,
    controle: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="40" height="24" x="4" y="12" fill="#1E293B" rx="8"/><circle cx="14" cy="24" r="6" fill="#334155"/><path fill="#FFFFFF" d="M14 20v8M10 24h8"/><circle cx="32" cy="22" r="2" fill="#EF4444"/><circle cx="36" cy="26" r="2" fill="#F59E0B"/><circle cx="28" cy="26" r="2" fill="#10B981"/><circle cx="32" cy="30" r="2" fill="#3B82F6"/></svg>`,
    filme: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="40" height="30" x="4" y="9" fill="#E11D48" rx="4"/><polygon points="20,18 32,24 20,30" fill="#FFFFFF"/></svg>`,
    musica: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="14" cy="34" r="6" fill="#8B5CF6"/><circle cx="36" cy="30" r="6" fill="#8B5CF6"/><path fill="#6D28D9" d="M20 34V10l22-4v24h-4V12L20 15v19z"/></svg>`,
    bicicleta: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="12" cy="32" r="8" fill="none" stroke="#0284C7" stroke-width="4"/><circle cx="36" cy="32" r="8" fill="none" stroke="#0284C7" stroke-width="4"/><path fill="none" stroke="#EF4444" stroke-width="4" stroke-linecap="round" d="M12 32l10-14h8l6 14m-14 0V18"/></svg>`,
    bola: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/><polygon points="24,14 31,19 28,27 20,27 17,19" fill="#0F172A"/><path stroke="#0F172A" stroke-width="2" d="m24 14 0-8m7 13 7-4m-3 8 7 3m-15 3-4 7m-6-13-7-3m7-7-4-6"/></svg>`,
    patinha: `<svg class="icone-svg" viewBox="0 0 48 48"><ellipse cx="24" cy="30" rx="9" ry="7" fill="#F97316"/><circle cx="14" cy="18" r="4" fill="#FB923C"/><circle cx="21" cy="14" r="4.5" fill="#FB923C"/><circle cx="27" cy="14" r="4.5" fill="#FB923C"/><circle cx="34" cy="18" r="4" fill="#FB923C"/></svg>`,
    sol: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="12" fill="#F59E0B"/><path fill="#FBBF24" d="M24 2v6M24 40v6M2 24h6M40 24h6M8.4 8.4l4.3 4.3M35.3 35.3l4.3 4.3M8.4 39.6l4.3-4.3M35.3 12.7l4.3-4.3"/></svg>`,
    lua: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#FDE047" d="M34 8a18 18 0 1 0 6 30c-12-2-18-14-13-24a17 17 0 0 0-7-6z"/><polygon points="34,14 36,18 40,18 37,21 38,25 34,23 30,25 31,21 28,18 32,18" fill="#F59E0B"/></svg>`,
    familia: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="16" cy="16" r="6" fill="#F59E0B"/><circle cx="32" cy="16" r="6" fill="#3B82F6"/><circle cx="24" cy="24" r="5" fill="#EC4899"/><path fill="#F59E0B" d="M6 38c0-5 5-9 10-9s10 4 10 9v4H6z"/><path fill="#3B82F6" d="M22 38c0-5 5-9 10-9s10 4 10 9v4H22z"/></svg>`,

    // --- CONQUISTAS & DESTAQUES ---
    fogo: `<svg class="icone-svg icone-fogo" viewBox="0 0 48 48"><path fill="#EF4444" d="M24 4s12 10 12 24a14 14 0 0 1-28 0c0-10 8-16 16-24z"/><path fill="#F59E0B" d="M24 18s7 6 7 14a8 8 0 0 1-16 0c0-6 5-10 9-14z"/><path fill="#FEF08A" d="M24 28a4 4 0 0 1 4 4 4 4 0 0 1-8 0c0-3 4-4 4-4z"/></svg>`,
    escudo: `<svg class="icone-svg icone-escudo" viewBox="0 0 48 48"><path fill="#3B82F6" d="M24 4s16 4 16 14c0 14-16 26-16 26S8 32 8 18C8 8 24 4 24 4z"/><path fill="#60A5FA" d="M24 8v32c8-7 12-16 12-22 0-8-12-10-12-10z"/><polygon points="24,14 27,21 34,22 29,26 30,33 24,29 18,33 19,26 14,22 21,21" fill="#FEF08A"/></svg>`,
    coroa: `<svg class="icone-svg icone-coroa" viewBox="0 0 48 48"><path fill="#F59E0B" d="M6 38l4-22 8 8 6-16 6 16 8-8 4 22H6z"/><rect width="36" height="6" x="6" y="38" fill="#D97706" rx="2"/><circle cx="10" cy="16" r="3" fill="#EF4444"/><circle cx="24" cy="8" r="3" fill="#3B82F6"/><circle cx="38" cy="16" r="3" fill="#10B981"/></svg>`,
    trofeu: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#FBBF24" d="M14 6h20v14a10 10 0 0 1-20 0V6z"/><path fill="#F59E0B" d="M14 8H8a6 6 0 0 0 6 6v-2a4 4 0 0 1-4-4h4V8zm20 0h6a6 6 0 0 1-6 6v-2a4 4 0 0 0 4-4h-4V8z"/><path fill="#D97706" d="M22 26h4v8h-4zm-8 8h20v6H14z"/></svg>`,
    medalha: `<svg class="icone-svg" viewBox="0 0 48 48"><path fill="#3B82F6" d="M16 4l8 16L12 36l-4-8z"/><path fill="#EF4444" d="M32 4l-8 16 12 16 4-8z"/><circle cx="24" cy="30" r="12" fill="#FBBF24"/><circle cx="24" cy="30" r="9" fill="#F59E0B"/><polygon points="24,24 26,28 30,29 27,32 28,36 24,34 20,36 21,32 18,29 22,28" fill="#FFFFFF"/></svg>`,
    presente: `<svg class="icone-svg" viewBox="0 0 48 48"><rect width="36" height="24" x="6" y="18" fill="#EC4899" rx="3"/><rect width="40" height="8" x="4" y="12" fill="#F43F5E" rx="2"/><path fill="#FDE047" d="M21 12h6v30h-6zM4 15h40v2H4z"/><path fill="#F59E0B" d="M24 12c-4-6-10 0-3 3h3zm0 0c4-6 10 0 3 3h-3z"/></svg>`,
    alvo: `<svg class="icone-svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#EF4444"/><circle cx="24" cy="24" r="14" fill="#FFFFFF"/><circle cx="24" cy="24" r="8" fill="#EF4444"/><circle cx="24" cy="24" r="3" fill="#FDE047"/></svg>`
};

// =========================================================================
// MAPEAMENTO SEMÂNTICO DE BUSCA PARA OS ÍCONES
// =========================================================================
window.TagsIconesSuiri = {
    vassoura: 'vassoura varrer limpeza faxina arrumar chao po poeira casa higiene',
    cama: 'cama quarto arrumar dormir sono lencol acordar descanso',
    banheira: 'banheira banho lavar chuveiro higiene agua relaxar espuma',
    louca: 'louca prato pia lavar cozinha comida jantar almoco copos talheres',
    lixo: 'lixo lixeira descartar saco reciclagem coleta limpeza entulho',
    camisa: 'camisa roupa lavar passar dobrar guardar varal lavanderia tecido',
    casa: 'casa lar residencia familia organizar comodos sala teto reforma',
    planta: 'planta regar jardim flor horta cuidar regador natureza vaso',
    refeicao: 'refeicao prato almoco jantar comida cozinhar chef garfo faca alimentar',
    carrinho: 'carrinho mercado compras supermercado feira despensa mantimentos comprar',
    maca: 'maca fruta lanche saudavel dieta comida nutricao alimentar',
    cenoura: 'cenoura vegetal legume feira horta salada vitamina saudavel',
    carteira: 'carteira dinheiro financas pagar saldo cartao economia banco',
    moeda: 'moeda dinheiro centavos valor mesada pagar salario cofre economia',
    conta: 'conta boleto fatura pagar recibo divida agua luz energia internet taxa',
    agenda: 'agenda calendario compromisso horario data dia evento reuniao marcar',
    relogio: 'relogio tempo hora prazo limite alarme despertar acordar minutos',
    raio: 'raio energia luz eletricidade tomada forca lampada perigo voltagem',
    agua: 'agua beber hidratar torneira filtro copo garrafa banho encanamento',
    gota: 'gota agua pingar vazar torneira regar chuva hidratacao',
    wifi: 'wifi internet rede conexao computador celular roteador online',
    carro: 'carro automovel veiculo lavar mecânico abastecer gasolina viagem transito',
    martelo: 'martelo ferramenta conserto reforma prego bater obra oficina reparo',
    tesoura: 'tesoura cortar papel artesanato cabelo costura tecido material',
    lampada: 'lampada ideia luz trocar iluminacao quarto sala pensar',
    ioga: 'ioga yoga alongamento meditar paz equilibrio zen respirar postura relaxamento',
    treino: 'treino academia exercicio peso haltere muscular forca fitness correr saude',
    coracao: 'coracao saude amor carinho bem estar vida amar cuidar',
    remedio: 'remedio farmacia pilula remedios dor doente medicacao vitamina saude',
    escovaDente: 'escova dente escovar dentes bucal sorriso pasta dental acordar',
    oculos: 'oculos ler leitura ver oculista estudar computador enxergar',
    livro: 'livro ler leitura estudar tarefa licao escola faculdade aprender historia',
    lapis: 'lapis caneta escrever desenhar licao tarefa anotar caderno pintar',
    mochila: 'mochila escola aula material guardar viagem passeio bolsa',
    controle: 'controle videogame jogo jogar videogame play game videogame diversao',
    filme: 'filme cinema tv assistir televisao serie pipoca video desenho',
    musica: 'musica cancao tocar violao instrumento ouvir som dancar',
    bicicleta: 'bicicleta pedalar passeio bike esporte ar livre parque andar',
    bola: 'bola futebol esporte chutar jogo quadra brincar jogar',
    patinha: 'patinha pet cachorro gato animal passear racao cuidar veterinario bicho',
    sol: 'sol dia acordar manha parque caminhar calor ar livre',
    lua: 'lua noite dormir descansar cama sono estrelas boa noite',
    familia: 'familia pais filhos reuniao conversar almoco uniao lar',
    fogo: 'fogo ofensiva chama foco meta energia calor dias implacavel',
    escudo: 'escudo protecao defesa seguranca cuidar proteger heroi',
    coroa: 'coroa rei rainha lider conquista vitoria campeao adm primeiro lugar',
    trofeu: 'trofeu premio vitoria campeao primeiro ganhar ouro recompensa',
    medalha: 'medalha premio destaque reconhecimento vitoria honra prata bronze',
    presente: 'presente recompensa premio surpresa aniversario loja resgatar mimo',
    alvo: 'alvo missao objetivo foco meta tarefa acertar cumprir'
};

// =========================================================================
// CATÁLOGO DE EMOJIS CATEGORIZADOS PARA A ABA "EMOJIS" COM PALAVRAS-CHAVE
// =========================================================================
window.CatalogoEmojisSuiri = [
    { emoji: '🧹', tags: 'vassoura varrer limpeza faxina po' },
    { emoji: '🛏️', tags: 'cama quarto dormir sono descansar arrumar' },
    { emoji: '🧺', tags: 'roupa lavanderia cesto lavar' },
    { emoji: '🧼', tags: 'sabao lavar banho espuma higiene limpeza' },
    { emoji: '🧽', tags: 'esponja louca pia lavar' },
    { emoji: '🗑️', tags: 'lixo lixeira descartar' },
    { emoji: '🪴', tags: 'planta regar vaso flor regador' },
    { emoji: '🚿', tags: 'chuveiro banho agua lavar' },
    { emoji: '🪣', tags: 'balde esfregão agua faxina' },
    { emoji: '🪟', tags: 'janela vidro limpar abrir' },
    { emoji: '📦', tags: 'caixa guardar organizar mudanca pacote' },
    { emoji: '🔑', tags: 'chave trancar porta casa fechar' },
    { emoji: '🧘', tags: 'ioga yoga meditar zen relaxar respirar' },
    { emoji: '🏃', tags: 'correr corrida exercicio cardio esteira treino' },
    { emoji: '🏋️', tags: 'musculacao peso academia treino forca' },
    { emoji: '🚴', tags: 'bicicleta pedalar bike pedal esporte' },
    { emoji: '🚶', tags: 'caminhar caminhada passos ar livre' },
    { emoji: '💊', tags: 'remedio comprimido pilula vitamina farmacia' },
    { emoji: '🦷', tags: 'dente escovar escova dentista bucal' },
    { emoji: '💧', tags: 'agua hidratar beber copo sede' },
    { emoji: '🥗', tags: 'salada dieta saudavel comida vegetais' },
    { emoji: '🍎', tags: 'maca fruta lanche comida saudavel' },
    { emoji: '😴', tags: 'dormir sono descanso soneca cama' },
    { emoji: '🛒', tags: 'carrinho mercado compras supermercado feira' },
    { emoji: '🍳', tags: 'cozinhar fritar ovo cafe comida cafe' },
    { emoji: '🍲', tags: 'sopa panela almoço jantar comida refeicao' },
    { emoji: '🥩', tags: 'carne churrasco acougue bife' },
    { emoji: '🍞', tags: 'pao padaria cafe cafe torrada' },
    { emoji: '🥛', tags: 'leite copo laticinios beber' },
    { emoji: '☕', tags: 'cafe xicara acordar manha pause quente' },
    { emoji: '🍕', tags: 'pizza lanche jantar delivery festa' },
    { emoji: '📚', tags: 'livro livros estudar estudo leitura aula licao' },
    { emoji: '✏️', tags: 'lapis escrever desenhar anotar licao' },
    { emoji: '💻', tags: 'computador notebook trabalho home office programar' },
    { emoji: '📝', tags: 'caderno anotaçao lista notas tarefas' },
    { emoji: '🎒', tags: 'mochila escola aula material guardar' },
    { emoji: '📅', tags: 'calendario agenda data dia marcar' },
    { emoji: '⏰', tags: 'relogio alarme despertar tempo hora prazo' },
    { emoji: '💰', tags: 'dinheiro saco moeda riqueza pagar' },
    { emoji: '💵', tags: 'nota cedula real dinheiro pagamento' },
    { emoji: '💳', tags: 'cartao credito debito pagar banco' },
    { emoji: '🪙', tags: 'moeda centavos mesada trocado' },
    { emoji: '🧾', tags: 'recibo cupom fiscal nota comprovante conta' },
    { emoji: '🐷', tags: 'porquinho cofre cofrinho poupar guardar' },
    { emoji: '🐶', tags: 'cachorro cao pet passear latir bicho' },
    { emoji: '🐱', tags: 'gato felino pet miau bicho' },
    { emoji: '🎮', tags: 'videogame controle jogo play gamer' },
    { emoji: '⚽', tags: 'bola futebol jogar esporte partida' },
    { emoji: '🎬', tags: 'filme cinema tela video serie pipoca' },
    { emoji: '🎧', tags: 'fone musica ouvir som podcast' },
    { emoji: '🎨', tags: 'paleta pintura arte desenhar pintar quadro' },
    { emoji: '🚗', tags: 'carro transito viagem dirigir abastecer' },
    { emoji: '⭐', tags: 'estrela destaque especial favorito nota dez' },
    { emoji: '🏆', tags: 'trofeu premio campeao vitoria primeiro' },
    { emoji: '🔥', tags: 'fogo chama ofensiva quente meta foco' }
];

// =========================================================================
// 1. UTILITÁRIOS: CPF, FORMATAÇÃO DE MOEDA & DIÁLOGO PERSONALIZADO
// =========================================================================
window.validarCPF = function(cpf) {
    cpf = String(cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
};

window.limparCPF = function(cpf) {
    return String(cpf || '').replace(/\D/g, '');
};

window.formatarCPF = function(v) {
    const s = String(v || '').replace(/\D/g, '');
    if (s.length !== 11) return s;
    return s.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

window.formatarMoedaBRL = function(valor) {
    const v = Number(valor) || 0;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

window.confirmarAcaoSuiri = function(mensagem, titulo = 'Confirmação') {
    return new Promise((resolve) => {
        let modal = document.getElementById('modal-confirmacao-nativo-suiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmacao-nativo-suiri';
            modal.className = 'modal-overlay';
            modal.style.zIndex = '1000005';
            modal.innerHTML = `
                <div class="modal-conteudo" style="max-width: 340px; text-align: center; padding: 22px 18px; border-radius: 22px; border: 1.5px solid var(--borda-delicada, rgba(217, 119, 6, 0.25)); background: #ffffff;">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; color: var(--cor-primaria, #d97706); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                        ${window.IconesSuiri?.escudo || ''}
                    </div>
                    <h3 id="titulo-confirmacao-suiri" style="margin: 0 0 6px 0; font-size: 16px; color: var(--texto-principal); font-weight: 800;"></h3>
                    <p id="texto-confirmacao-suiri" style="font-size: 13px; color: var(--texto-suave); line-height: 1.45; margin: 0 0 18px 0;"></p>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="btn-cancelar-confirmacao-suiri" class="btn-secundario" style="flex: 1; padding: 11px; border-radius: 12px; font-weight: 700;">Cancelar</button>
                        <button type="button" id="btn-concordo-confirmacao-suiri" class="btn-principal" style="flex: 1; padding: 11px; border-radius: 12px; font-weight: 800;">Concordo</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const elTit = document.getElementById('titulo-confirmacao-suiri');
        const elTxt = document.getElementById('texto-confirmacao-suiri');
        const btnCanc = document.getElementById('btn-cancelar-confirmacao-suiri');
        const btnConc = document.getElementById('btn-concordo-confirmacao-suiri');

        if (elTit) elTit.textContent = titulo;
        if (elTxt) elTxt.textContent = mensagem;

        modal.classList.remove('oculto');

        const fechar = (decisao) => {
            modal.classList.add('oculto');
            resolve(decisao);
        };

        if (btnCanc) btnCanc.onclick = () => fechar(false);
        if (btnConc) btnConc.onclick = () => fechar(true);
    });
};

// =========================================================================
// 2. ESTADO GLOBAL DA SESSÃO, MODO KIDS & CONTROLO DE MEMBROS
// =========================================================================
window.usuarioAtual = null;
window.perfilAtual = null;
window.familiaAtualId = null;
window.dadosFamiliaAtual = null;
window.listaMembrosFamilia = [];
window.telaAtualVisivel = 'inicio';
window.modoKidsAtivo = false;

window.mostrarToast = function(msg, tipo = 'sucesso') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.prepend(container);
    }
    const t = document.createElement('div');
    t.className = `toast-msg toast-${tipo}`;
    t.innerHTML = `
        <span style="display:flex;align-items:center;gap:6px;">
            ${tipo === 'sucesso' ? '✓' : ''}
            ${esc(msg)}
        </span>
        <span style="cursor:pointer;opacity:0.8;padding:2px 6px;" onclick="this.parentElement.remove()">✕</span>
    `;
    container.appendChild(t);
    setTimeout(() => { if (t.parentElement) t.remove(); }, 4000);
};

window.alternarAbaLoginCadastro = function(aba) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    const formLogin = document.getElementById('bloco-form-login');
    const formCad = document.getElementById('bloco-form-cadastro');
    if (aba === 'cadastro') {
        formLogin?.classList.add('oculto');
        formCad?.classList.remove('oculto');
    } else {
        formCad?.classList.add('oculto');
        formLogin?.classList.remove('oculto');
    }
};

window.solicitarPermissaoPush = async function() {
    if (!("Notification" in window)) {
        return window.mostrarToast("Este navegador não suporta notificações Push.", "erro");
    }
    
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            window.mostrarToast("Notificações Push ativadas com sucesso!");
        } else {
            window.mostrarToast("Permissão de Push negada ou ignorada.", "alerta");
        }
    } catch (e) {
        console.error("Erro ao solicitar Push:", e);
        window.mostrarToast("Não foi possível solicitar as notificações.", "erro");
    }
};

// =========================================================================
// 3. AUTENTICAÇÃO REAL E CADASTRO DA FAMÍLIA COM NACIONALIDADE & GÊNERO
// =========================================================================
window.fazerLoginEmail = async function(email, senha) {
    if (!cliente) return window.mostrarToast("Configure a ligação ao Supabase no app-core.js!", "erro");

    const emailLimpo = String(email || '').trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes('@')) {
        return window.mostrarToast("Introduza um e-mail válido.", "erro");
    }
    if (!senha || senha.length < 6) {
        return window.mostrarToast("A palavra-passe deve conter pelo menos 6 dígitos.", "erro");
    }

    const { data, error } = await cliente.auth.signInWithPassword({
        email: emailLimpo,
        password: senha
    });

    if (error) {
        return window.mostrarToast("E-mail ou palavra-passe incorretos: " + error.message, "erro");
    }

    window.usuarioAtual = data.user;
    await window.iniciarAppFamilia();
    return true;
};

window.cadastrarNovaFamiliaADM = async function({ nomeFamilia, nomeAdm, emailAdm, cpfAdm, senha, nacionalidade, genero }) {
    if (!cliente) {
        return window.mostrarToast("Configure a ligação ao Supabase no app-core.js!", "erro");
    }

    const emailLimpo = String(emailAdm || '').trim().toLowerCase();
    const cpfLimpo = window.limparCPF(cpfAdm);
    const nac = nacionalidade || 'BR';
    const gen = genero || 'Masculino';

    if (!nomeFamilia || nomeFamilia.trim().length < 2) {
        return window.mostrarToast("Indique o nome da Família / Lar.", "erro");
    }
    if (!nomeAdm || nomeAdm.trim().length < 2) {
        return window.mostrarToast("Indique o seu nome completo.", "erro");
    }
    if (!emailLimpo || !emailLimpo.includes('@')) {
        return window.mostrarToast("Indique um e-mail válido para o início de sessão.", "erro");
    }
    if (!window.validarCPF(cpfLimpo)) {
        return window.mostrarToast("CPF inválido. Verifique os números.", "erro");
    }
    if (!senha || senha.length < 6) {
        return window.mostrarToast("A palavra-passe deve ter no mínimo 6 dígitos.", "erro");
    }

    window.mostrarToast("A registar o Lar da família...", "info");

    const { data: authData, error: authError } = await cliente.auth.signUp({
        email: emailLimpo,
        password: senha,
        options: {
            data: { nome: nomeAdm.trim() }
        }
    });

    if (authError || !authData?.user) {
        console.error("Erro Auth signUp:", authError);
        const msgAuth = authError?.message || "falha na resposta";
        if (msgAuth.includes("already registered") || msgAuth.includes("User already exists")) {
            return window.mostrarToast("Este e-mail já está cadastrado. Tente entrar pelo login.", "erro");
        }
        return window.mostrarToast("Erro ao criar utilizador: " + msgAuth, "erro");
    }

    const userId = authData.user.id;

    if (!authData.session) {
        const { data: loginData } = await cliente.auth.signInWithPassword({
            email: emailLimpo,
            password: senha
        });
        if (loginData?.user) {
            window.usuarioAtual = loginData.user;
        }
    }

    let { data: novaFamilia, error: errFam } = await cliente.from('familias').insert([{
        nome_familia: nomeFamilia.trim(),
        cpf_adm_principal: cpfLimpo,
        orcamento_mercado_mensal: 1200.00
    }]).select().maybeSingle();

    if (errFam && (errFam.message.includes('unique') || errFam.message.includes('duplicate') || errFam.code === '23505')) {
        const { data: famExistente } = await cliente.from('familias')
            .select('*')
            .eq('cpf_adm_principal', cpfLimpo)
            .maybeSingle();
        if (famExistente) {
            novaFamilia = famExistente;
            errFam = null;
        }
    }

    if (errFam || !novaFamilia) {
        console.error("Erro insert familias:", errFam);
        const detalhe = errFam?.message || "falha na tabela familias";
        if (detalhe.includes('row-level security') || detalhe.includes('policy')) {
            return window.mostrarToast("Permissão de criação bloqueada. Execute o SQL de liberação.", "erro");
        }
        return window.mostrarToast("Erro ao criar família: " + detalhe, "erro");
    }

    const { error: errMembro } = await cliente.from('membros').upsert([{
        id: userId,
        familia_id: novaFamilia.id,
        nome: nomeAdm.trim(),
        cpf: cpfLimpo,
        papel: 'adm',
        parentesco: 'Chefe do Lar',
        nacionalidade: nac,
        genero: gen,
        possui_cartao: true,
        eh_kids: false,
        permissoes: { mercado: true, gastos: true, missoes: true, financeiro_adm: true },
        saldo_carteira: 0,
        ofensiva_atual: 1,
        xp_total: 50,
        ultimo_checkin_data: new Date().toISOString().split('T')[0]
    }], { onConflict: 'id' });

    if (errMembro) {
        console.error("Erro upsert membros:", errMembro);
        return window.mostrarToast("Erro ao criar membro ADM: " + (errMembro?.message || "falha na tabela"), "erro");
    }

    window.mostrarToast("Lar registado com sucesso!");
    window.usuarioAtual = authData.user;
    await window.iniciarAppFamilia();
    return true;
};

// =========================================================================
// 4. GESTÃO DE FOTO DE PERFIL (AVATAR) E FERRAMENTA DE CROP COM CANVAS
// =========================================================================
let imagemOriginalCrop = null;
let coordsCrop = { x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false };
const MAX_DIM = 240;

window.abrirSeletorFotoPerfil = function() {
    document.getElementById('input-upload-avatar-membro')?.click();
};

window.processarUploadAvatar = function(evento) {
    const file = evento.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        return window.mostrarToast("Selecione um ficheiro de imagem válido.", "erro");
    }

    const leitor = new FileReader();
    leitor.onload = function(e) {
        imagemOriginalCrop = new Image();
        imagemOriginalCrop.onload = function() {
            coordsCrop = { x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false };
            const container = document.querySelector('.crop-container');
            if (container) {
                 const rect = container.getBoundingClientRect();
                 const imgRatio = imagemOriginalCrop.width / imagemOriginalCrop.height;
                 
                 if (imgRatio > 1) {
                     coordsCrop.scale = 200 / imagemOriginalCrop.height;
                 } else {
                     coordsCrop.scale = 200 / imagemOriginalCrop.width;
                 }
                 
                 coordsCrop.x = ((rect.width || 300) - (imagemOriginalCrop.width * coordsCrop.scale)) / 2;
                 coordsCrop.y = ((rect.height || 300) - (imagemOriginalCrop.height * coordsCrop.scale)) / 2;
            }
            
            document.getElementById('modal-crop-imagem')?.classList.remove('oculto');
            desenharCanvasCrop();
        };
        imagemOriginalCrop.src = e.target.result;
    };
    leitor.readAsDataURL(file);
    evento.target.value = '';
};

function desenharCanvasCrop() {
    const canvas = document.getElementById('canvas-crop');
    if (!canvas || !imagemOriginalCrop) return;
    
    const container = document.querySelector('.crop-container') || canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 300;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scaledW = imagemOriginalCrop.width * coordsCrop.scale;
    const scaledH = imagemOriginalCrop.height * coordsCrop.scale;
    
    ctx.drawImage(imagemOriginalCrop, coordsCrop.x, coordsCrop.y, scaledW, scaledH);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const maskSize = 200;
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, maskSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, maskSize / 2, 0, Math.PI * 2);
    ctx.stroke();
}

function inicializarArrastoCrop() {
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;

    const startDrag = (e) => {
        coordsCrop.dragging = true;
        const pointer = e.touches ? e.touches[0] : e;
        coordsCrop.startX = pointer.clientX - coordsCrop.x;
        coordsCrop.startY = pointer.clientY - coordsCrop.y;
    };

    const drag = (e) => {
        if (!coordsCrop.dragging) return;
        e.preventDefault();
        const pointer = e.touches ? e.touches[0] : e;
        coordsCrop.x = pointer.clientX - coordsCrop.startX;
        coordsCrop.y = pointer.clientY - coordsCrop.startY;
        desenharCanvasCrop();
    };

    const endDrag = () => {
        coordsCrop.dragging = false;
    };

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
    
    canvas.addEventListener('touchstart', startDrag, { passive: false });
    canvas.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', endDrag);
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarArrastoCrop();
});

window.ajustarZoomCrop = function(delta) {
    if (!imagemOriginalCrop) return;
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;
    
    const novaScale = Math.max(0.1, coordsCrop.scale + delta);
    const centerOffsetX = (canvas.width / 2) - coordsCrop.x;
    const centerOffsetY = (canvas.height / 2) - coordsCrop.y;
    const ratio = novaScale / coordsCrop.scale;
    
    coordsCrop.x = (canvas.width / 2) - (centerOffsetX * ratio);
    coordsCrop.y = (canvas.height / 2) - (centerOffsetY * ratio);
    coordsCrop.scale = novaScale;
    desenharCanvasCrop();
};

window.fecharModalCrop = function() {
    document.getElementById('modal-crop-imagem')?.classList.add('oculto');
    imagemOriginalCrop = null;
};

window.confirmarCropImagem = async function() {
    if (!imagemOriginalCrop) return;
    const canvas = document.getElementById('canvas-crop');
    if (!canvas) return;
    
    const maskSize = 200;
    const outputSize = 240; 
    
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = outputSize;
    finalCanvas.height = outputSize;
    const fCtx = finalCanvas.getContext('2d');
    
    const maskX = (canvas.width - maskSize) / 2;
    const maskY = (canvas.height - maskSize) / 2;
    const scaleRatio = outputSize / maskSize;
    
    fCtx.fillStyle = '#ffffff'; 
    fCtx.fillRect(0, 0, outputSize, outputSize);
    
    fCtx.save();
    fCtx.scale(scaleRatio, scaleRatio);
    fCtx.translate(-maskX, -maskY);
    
    const scaledW = imagemOriginalCrop.width * coordsCrop.scale;
    const scaledH = imagemOriginalCrop.height * coordsCrop.scale;
    
    fCtx.drawImage(imagemOriginalCrop, coordsCrop.x, coordsCrop.y, scaledW, scaledH);
    fCtx.restore();

    const base64Data = finalCanvas.toDataURL('image/jpeg', 0.85);
    window.fecharModalCrop();
    await window.guardarFotoPerfil(base64Data);
};

window.guardarFotoPerfil = async function(base64Data) {
    if (!window.perfilAtual || !cliente) return;

    window.mostrarToast("A atualizar foto...", "info");

    const { error } = await cliente.from('membros')
        .update({ avatar_url: base64Data })
        .eq('id', window.perfilAtual.id);

    if (error) {
        window.adicionarAFilaOffline({
            tabela: 'membros',
            tipoOperacao: 'update',
            dados: { avatar_url: base64Data },
            condicao: { id: window.perfilAtual.id }
        });
        window.mostrarToast("Sem rede. Foto guardada na Fila Offline com sucesso!", "info");
    }

    window.perfilAtual.avatar_url = base64Data;
    try {
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(window.perfilAtual));
    } catch(e) {}
    
    const imgEl = document.getElementById('img-avatar-topo');
    if (imgEl) imgEl.src = base64Data;

    const imgKids = document.getElementById('img-avatar-kids');
    if (imgKids) imgKids.src = base64Data;

    if (typeof window.renderizarMembrosFamiliaPainel === 'function') {
        window.renderizarMembrosFamiliaPainel();
    }

    if (!error) window.mostrarToast("Foto de perfil cortada e atualizada!");
};

// =========================================================================
// 5. TROCA DE PERFIL COM LOGIN OFICIAL VIA SUPABASE AUTH PARA ADULTOS
// =========================================================================
window.abrirModalSenhaAdulto = function(membro) {
    if (!membro) return;

    let modal = document.getElementById('modal-senha-adulto-suiri');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-senha-adulto-suiri';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '1000002';
        modal.innerHTML = `
            <div class="modal-conteudo" style="max-width: 320px; text-align: center; padding: 22px 18px; border-radius: 20px; border: 1.5px solid rgba(217, 119, 6, 0.25); background: #ffffff;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
                    <svg class="icone-svg" style="width: 22px; height: 22px;" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 id="titulo-modal-senha-membro" style="margin: 0 0 4px 0; font-size: 16px; color: var(--texto-principal, #1e293b); font-weight: 800;">Acesso Restrito</h3>
                <p id="subtitulo-modal-senha-membro" style="font-size: 12.5px; color: var(--texto-suave, #64748b); line-height: 1.4; margin: 0 0 14px 0;"></p>
                <input type="password" id="input-senha-membro-quiosque" placeholder="Digite sua senha de login" style="text-align: center; font-size: 15px; margin-bottom: 14px; width: 100%; box-sizing: border-box; padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1;">
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-secundario" style="flex: 1; padding: 10px;" onclick="document.getElementById('modal-senha-adulto-suiri').classList.add('oculto')">Cancelar</button>
                    <button type="button" id="btn-confirmar-senha-membro" class="btn-principal" style="flex: 1; padding: 10px;">Entrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const sub = document.getElementById('subtitulo-modal-senha-membro');
    const input = document.getElementById('input-senha-membro-quiosque');
    const btnConfirmar = document.getElementById('btn-confirmar-senha-membro');

    const primeiroNome = (membro.nome || 'Adulto').split(' ')[0];
    if (sub) sub.textContent = `Acesso para ${primeiroNome}. Digite sua senha de acesso:`;
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 200);
    }

    const submeterLogin = async () => {
        const senha = input.value.trim();
        if (!senha) {
            return window.mostrarToast("Digite a sua senha de acesso.", "erro");
        }

        const emailMembro = membro.email ? membro.email.toLowerCase().trim() : '';
        if (!emailMembro) {
            return window.mostrarToast("Este perfil não possui e-mail de login cadastrado.", "erro");
        }

        const cli = window.cliente || window.clienteSupabase;
        if (!cli) {
            return window.mostrarToast("Erro de conexão com o banco.", "erro");
        }

        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "Validando...";

        try {
            const { data, error } = await cli.auth.signInWithPassword({
                email: emailMembro,
                password: senha
            });

            if (error) {
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = "Entrar";
                if (window.SonsSuiri && typeof window.SonsSuiri.somFalhaAcolhedor === 'function') {
                    window.SonsSuiri.somFalhaAcolhedor();
                }
                return window.mostrarToast("Senha incorreta. Acesso não permitido.", "erro");
            }

            window.usuarioAtual = data.user;
            window.perfilAtual = membro;
            localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));

            modal.classList.add('oculto');
            window.fecharJanelaPrincipalQuiosque();
            window.aplicarRegrasPerfilKidsOuAdulto();

            if (typeof window.atualizarIconeBotaoSessao === 'function') {
                window.atualizarIconeBotaoSessao();
            }

            window.mostrarToast(`Sessão ativa para ${primeiroNome}!`);
        } catch (e) {
            console.error("Erro na autenticação de troca de adulto:", e);
            window.mostrarToast("Falha na autenticação do usuário.", "erro");
        } finally {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = "Entrar";
        }
    };

    btnConfirmar.onclick = submeterLogin;

    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submeterLogin();
            }
        };
    }

    modal.classList.remove('oculto');
};

// =========================================================================
// 6. MOTOR "TROCAR MEMBRO & LOGOUT" COM SEPARAÇÃO ADULTOS / KIDS
// =========================================================================
window.atualizarIconeBotaoSessao = function() {
    const btnSair = document.getElementById('btn-sair-topo-app');
    const imgIcone = document.getElementById('img-icone-sessao-topo');
    if (!btnSair) return;

    const totalMembros = (window.listaMembrosFamilia || []).length;

    if (totalMembros > 1) {
        if (imgIcone) {
            imgIcone.src = './icone/trocar.png';
            imgIcone.alt = 'Trocar Perfil';
        }
        btnSair.title = 'Trocar Perfil';
    } else {
        if (imgIcone) {
            imgIcone.src = './icone/icone-porta-sair.png';
            imgIcone.alt = 'Sair do Lar';
        }
        btnSair.title = 'Sair do Lar';
    }
};

window.acionarBotaoSessaoTopo = function() {
    const totalMembros = (window.listaMembrosFamilia || []).length;
    if (totalMembros > 1) {
        window.abrirJanelaPrincipalQuiosque();
    } else {
        window.fazerLogoff();
    }
};

window.abrirJanelaPrincipalQuiosque = function() {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }
    let modal = document.getElementById('modal-janela-quiosque');
    if (!modal) {
        window.criarModalQuiosqueDinamico();
    } else {
        modal.classList.remove('oculto');
    }
    window.renderizarAvataresQuiosque();
};

window.fecharJanelaPrincipalQuiosque = function() {
    document.getElementById('modal-janela-quiosque')?.classList.add('oculto');
};

window.criarModalQuiosqueDinamico = function() {
    let modal = document.getElementById('modal-janela-quiosque');
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'modal-janela-quiosque';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '99999';
    modal.innerHTML = `
        <div class="modal-conteudo modal-quiosque-tela-cheia" style="display:flex; flex-direction:column; max-height:90vh; overflow-y:auto; padding:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--borda-delicada, #f1f5f9); padding-bottom:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="display:inline-flex; width:26px; height:26px; color:var(--cor-primaria);">${window.IconesSuiri?.familia || '👥'}</span>
                    <h2 style="font-size:20px; color:var(--texto-principal, #1e293b); margin:0; font-weight:800;">Trocar Perfil</h2>
                </div>
                <button type="button" class="btn-secundario" style="padding:6px 12px; font-size:14px; border-radius:12px;" onclick="window.fecharJanelaPrincipalQuiosque()">✕</button>
            </div>
            
            <!-- BLOCO 1: PERFIS ADULTOS -->
            <div id="secao-quiosque-adultos" style="margin-bottom:16px;">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:var(--texto-suave, #64748b); display:block; margin-bottom:8px;">
                    👑 Perfis Adultos
                </span>
                <div id="grade-avatares-adultos" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:12px;"></div>
            </div>

            <!-- BLOCO 2: PERFIS KIDS -->
            <div id="secao-quiosque-kids" style="margin-bottom:18px;">
                <span style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#10b981; display:block; margin-bottom:8px;">
                    ⭐ Perfis Kids
                </span>
                <div id="grade-avatares-kids" class="grade-avatares-expandida" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:12px;"></div>
            </div>

            <!-- RODAPÉ: BOTÃO SAIR DA CONTA -->
            <div style="border-top:1.5px solid var(--borda-delicada, #f1f5f9); padding-top:14px; margin-top:auto; display:flex; flex-direction:column; gap:8px;">
                <button type="button" class="btn-erro" style="width:100%; font-size:13.5px; font-weight:800; border-radius:14px; padding:12px; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#fff1f2; color:#e11d48; border:1.5px solid #fecdd3;" onclick="window.fecharJanelaPrincipalQuiosque(); window.fazerLogoff();">
                    <img src="./icone/icone-porta-sair.png" alt="Sair" style="width:16px; height:16px; object-fit:contain;">
                    Sair da Conta
                </button>
                <button type="button" class="btn-secundario" style="width:100%; font-size:13px; font-weight:700; border-radius:14px; padding:10px;" onclick="window.fecharJanelaPrincipalQuiosque()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.renderizarAvataresQuiosque = function() {
    const containerAdultos = document.getElementById('grade-avatares-adultos');
    const containerKids = document.getElementById('grade-avatares-kids');
    const secaoKids = document.getElementById('secao-quiosque-kids');
    const secaoAdultos = document.getElementById('secao-quiosque-adultos');

    if (!containerAdultos || !containerKids) return;

    containerAdultos.innerHTML = '';
    containerKids.innerHTML = '';

    const membros = window.listaMembrosFamilia || [];
    const adultos = membros.filter(m => !(m.eh_kids === true || m.papel === 'dependente'));
    const kids = membros.filter(m => (m.eh_kids === true || m.papel === 'dependente'));

    if (adultos.length === 0 && secaoAdultos) secaoAdultos.classList.add('oculto');
    else if (secaoAdultos) secaoAdultos.classList.remove('oculto');

    if (kids.length === 0 && secaoKids) secaoKids.classList.add('oculto');
    else if (secaoKids) secaoKids.classList.remove('oculto');

    const montarCardMembro = (m, ehKids) => {
        const card = document.createElement('div');
        card.className = `card-usuario-quiosque ${ehKids ? 'card-usuario-kids-destaque' : ''}`;
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.onclick = () => window.selecionarUsuarioQuiosque(m.id);

        const avatarSrc = m.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
        const nomeCurto = String(m.nome || 'Membro').split(' ')[0];
        const bandeirinha = (typeof window.obterMiniBandeiraNacionalidade === 'function')
            ? window.obterMiniBandeiraNacionalidade(m.nacionalidade || 'BR')
            : '';

        card.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${avatarSrc}" class="avatar-quiosque-grande" style="width:68px; height:68px; border-radius:18px; object-fit:cover; border: 3px solid ${ehKids ? '#10b981' : 'var(--cor-primaria, #f97316)'};">
                <span style="position: absolute; bottom: 4px; right: 4px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
                    ${bandeirinha}
                </span>
            </div>
            <strong style="font-size:13px; color:var(--texto-principal, #1e293b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; margin-top:4px;">
                ${esc(nomeCurto)}
            </strong>
            <span style="font-size:10.5px; color:${ehKids ? '#15803d' : 'var(--texto-suave, #64748b)'}; font-weight:800; margin-top:2px; background:${ehKids ? '#dcfce7' : '#f1f5f9'}; padding:2px 8px; border-radius:999px;">
                ${ehKids ? 'Kids' : (m.parentesco || 'Adulto')}
            </span>
        `;
        return card;
    };

    adultos.forEach(m => containerAdultos.appendChild(montarCardMembro(m, false)));
    kids.forEach(m => containerKids.appendChild(montarCardMembro(m, true)));
};

window.selecionarUsuarioQuiosque = function(membroId) {
    const membro = (window.listaMembrosFamilia || []).find(m => m.id === membroId);
    if (!membro) return;

    const ehKids = membro.eh_kids === true || membro.papel === 'dependente';
    const primeiroNome = String(membro.nome || 'Usuário').split(' ')[0];

    if (ehKids) {
        window.perfilAtual = membro;
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));
        window.fecharJanelaPrincipalQuiosque();
        window.aplicarRegrasPerfilKidsOuAdulto();
        if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
            window.SonsSuiri.sucessoMissao();
        }
        window.mostrarToast(`Olá, ${primeiroNome}! Suas missões estão prontas!`);
    } else {
        window.abrirModalSenhaAdulto(membro);
    }
};

window.atualizarCartaoEspacoPessoal = function() {
    const cardIntimo = document.getElementById('card-acesso-espaco-intimo');
    if (!cardIntimo) return;

    const genero = String(window.perfilAtual?.genero || '').toLowerCase();
    const titulo = document.getElementById('lbl-titulo-espaco-intimo');
    const desc = document.getElementById('lbl-desc-espaco-intimo');
    const iconeContainer = cardIntimo.querySelector('div > div');

    if (genero === 'masculino') {
        cardIntimo.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
        cardIntimo.style.border = '1.5px solid #7dd3fc';
        cardIntimo.style.boxShadow = '0 4px 12px rgba(125, 211, 252, 0.25)';
        if (iconeContainer) {
            iconeContainer.style.background = '#bae6fd';
            iconeContainer.textContent = '🔥';
        }
        if (titulo) {
            titulo.style.color = '#0369a1';
            titulo.textContent = 'Espaço Masculino';
        }
        if (desc) {
            desc.style.color = '#0284c7';
            desc.textContent = 'Performance, estoicismo, treino e garagem';
        }
        cardIntimo.onclick = function() {
            if (typeof window.abrirEspacoMasculino === 'function') {
                window.abrirEspacoMasculino();
            } else {
                window.mostrarToast("Espaço Masculino a carregar...", "info");
            }
        };
    } else {
        cardIntimo.style.background = 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)';
        cardIntimo.style.border = '1.5px solid #f0abfc';
        cardIntimo.style.boxShadow = '0 4px 12px rgba(240, 171, 252, 0.2)';
        if (iconeContainer) {
            iconeContainer.style.background = '#f5d0fe';
            iconeContainer.textContent = '🌸';
        }
        if (titulo) {
            titulo.style.color = '#86198f';
            titulo.textContent = 'Espaço Mulher';
        }
        if (desc) {
            desc.style.color = '#a21caf';
            desc.textContent = 'Ciclo, fertilidade, dicas e bem-estar';
        }
        cardIntimo.onclick = function() {
            if (typeof window.abrirEspacoMulher === 'function') {
                window.abrirEspacoMulher();
            }
        };
    }
};

window.aplicarRegrasPerfilKidsOuAdulto = function() {
    if (!window.perfilAtual) return;

    const ehKids = window.perfilAtual.eh_kids === true || window.perfilAtual.papel === 'dependente';
    window.modoKidsAtivo = ehKids;

    const telaKids = document.getElementById('tela-kids-exclusiva');
    const painelAdulto = document.getElementById('painel-adulto-container');
    const barraNav = document.getElementById('barra-navegacao-principal');

    if (ehKids) {
        document.body.classList.add('modo-kids-ativo');

        const horaAtual = new Date().getHours();
        document.body.classList.remove('cenario-dia', 'cenario-tarde', 'cenario-noite');
        if (horaAtual >= 6 && horaAtual < 16) {
            document.body.classList.add('cenario-dia');
        } else if (horaAtual >= 16 && horaAtual < 18.5) {
            document.body.classList.add('cenario-tarde');
        } else {
            document.body.classList.add('cenario-noite');
        }

        telaKids?.classList.remove('oculto');
        painelAdulto?.classList.add('oculto');
        barraNav?.classList.add('oculto');

        const elNomeKids = document.getElementById('nome-membro-kids');
        if (elNomeKids) elNomeKids.textContent = window.perfilAtual.nome;

        const elXpKids = document.getElementById('contador-xp-kids');
        if (elXpKids) elXpKids.textContent = `${window.perfilAtual.xp_total || 0} XP`;

        const imgKids = document.getElementById('img-avatar-kids');
        if (imgKids && window.perfilAtual.avatar_url) {
            imgKids.src = window.perfilAtual.avatar_url;
        }

        if (window.TamagotchiKids && typeof window.TamagotchiKids.montarWidgetNaTela === 'function') {
            window.TamagotchiKids.montarWidgetNaTela();
        }

        if (typeof window.carregarMissoesKidsExclusiva === 'function') {
            window.carregarMissoesKidsExclusiva();
        } else if (typeof window.carregarMissoesDoDia === 'function') {
            window.carregarMissoesDoDia();
        }
    } else {
        document.body.classList.remove('modo-kids-ativo', 'cenario-dia', 'cenario-tarde', 'cenario-noite');
        telaKids?.classList.add('oculto');
        painelAdulto?.classList.remove('oculto');
        barraNav?.classList.remove('oculto');

        document.getElementById('container-tamagotchi-kids')?.remove();
        document.getElementById('modal-tamagotchi-cuidados')?.classList.add('oculto');

        const elNomeMembro = document.getElementById('nome-membro-topo');
        if (elNomeMembro) elNomeMembro.textContent = window.perfilAtual.nome;

        const elOfensiva = document.getElementById('contador-ofensiva-topo');
        if (elOfensiva) elOfensiva.textContent = window.perfilAtual.ofensiva_atual || 0;

        const imgAvatar = document.getElementById('img-avatar-topo');
        if (imgAvatar && window.perfilAtual.avatar_url) {
            imgAvatar.src = window.perfilAtual.avatar_url;
        }

        if (typeof window.atualizarBandeiraPerfilTopo === 'function') {
            window.atualizarBandeiraPerfilTopo();
        }

        const navMercado = document.querySelector('.bottom-nav-item[data-tela="mercado"]');
        if (window.perfilAtual.permissoes && window.perfilAtual.permissoes.mercado === false) {
            navMercado?.classList.add('oculto');
        } else {
            navMercado?.classList.remove('oculto');
        }

        if (typeof window.carregarMetasAnuais === 'function') {
            window.carregarMetasAnuais();
        }

        window.atualizarCartaoEspacoPessoal();
        window.navegarParaTela(window.telaAtualVisivel || 'inicio');
    }
    
    window.atualizarIconeBotaoSessao();
};

// =========================================================================
// 7. INICIALIZAÇÃO DA SESSÃO E DADOS FAMILIARES (ASSÍNCRONO OTIMIZADO)
// =========================================================================
window.iniciarAppFamilia = async function() {
    if (!window.usuarioAtual || !cliente) return;

    // 1. Liberação visual imediata: oculta login e exibe o app de pronto
    document.getElementById('tela-login')?.classList.add('oculto');
    document.getElementById('tela-app')?.classList.remove('oculto');

    // 2. Busca do membro atual
    const { data: membro, error: errMembro } = await cliente.from('membros')
        .select('*')
        .eq('id', window.usuarioAtual.id)
        .maybeSingle();

    if (errMembro || !membro) {
        window.mostrarToast("Perfil de membro não encontrado.", "erro");
        return;
    }

    if (!membro.genero) {
        membro.genero = 'Masculino';
    }

    window.perfilAtual = membro;
    window.familiaAtualId = membro.familia_id;
    try {
        localStorage.setItem('suiri_perfil_ativo', JSON.stringify(membro));
    } catch(e) {}

    window.aplicarRegrasPerfilKidsOuAdulto();

    // 3. Consultas da família e dos membros em paralelo
    const [resFamilia, resMembros] = await Promise.all([
        cliente.from('familias').select('*').eq('id', window.familiaAtualId).single(),
        cliente.from('membros').select('*').eq('familia_id', window.familiaAtualId).order('nome')
    ]);

    window.dadosFamiliaAtual = resFamilia?.data || null;
    window.listaMembrosFamilia = resMembros?.data || [];

    try {
        if (window.dadosFamiliaAtual) {
            localStorage.setItem('suiri_familia_ativa', JSON.stringify(window.dadosFamiliaAtual));
        }
        if (window.listaMembrosFamilia.length > 0) {
            localStorage.setItem('suiri_membros_ativos', JSON.stringify(window.listaMembrosFamilia));
        }
    } catch(e) {}

    const selRelatorio = document.getElementById('filtro-membro-relatorio');
    if (selRelatorio) {
        selRelatorio.innerHTML = '<option value="todos">Todos os Membros (Casa)</option>';
        window.listaMembrosFamilia
            .filter(m => m.possui_cartao !== false)
            .forEach(m => {
                selRelatorio.innerHTML += `<option value="${m.id}">${esc(m.nome)}</option>`;
            });
    }

    const elNomeFamilia = document.getElementById('nome-familia-topo');
    if (elNomeFamilia) elNomeFamilia.textContent = window.dadosFamiliaAtual?.nome_familia || 'Suiri Gestão Familiar';

    window.atualizarIconeBotaoSessao();

    // 4. Inicializações assíncronas dos submódulos em background
    if (typeof window.carregarListaMembrosPainel === 'function') {
        window.carregarListaMembrosPainel();
    } else if (typeof window.atualizarTodosSeletoresMembros === 'function') {
        window.atualizarTodosSeletoresMembros();
    }

    if (typeof window.iniciarModuloMissoes === 'function') window.iniciarModuloMissoes();
    if (typeof window.carregarMetasAnuais === 'function') window.carregarMetasAnuais();
    if (typeof window.carregarItensMercado === 'function') window.carregarItensMercado();
    if (typeof window.carregarCarteiraIndividual === 'function') window.carregarCarteiraIndividual();
    if (typeof window.carregarCofresCompartilhados === 'function') window.carregarCofresCompartilhados();
    if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    if (typeof window.iniciarEscutaRealtimeFamilia === 'function') window.iniciarEscutaRealtimeFamilia();
};

window.fazerLogoff = async function() {
    if (cliente) await cliente.auth.signOut();
    try {
        localStorage.removeItem('suiri_perfil_ativo');
        localStorage.removeItem('suiri_familia_ativa');
        localStorage.removeItem('suiri_membros_ativos');
    } catch(e) {}
    window.usuarioAtual = null;
    window.perfilAtual = null;
    window.familiaAtualId = null;
    window.location.reload();
};

// =========================================================================
// 8. VERIFICAÇÃO ULTRA-RÁPIDA (FAST-PATH LOCALSTORAGE)
// =========================================================================
window.verificarSessao = async function() {
    if (!cliente) {
        document.getElementById('tela-app')?.classList.add('oculto');
        document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
        document.getElementById('tela-login')?.classList.remove('oculto');
        return;
    }

    let temSessaoLocal = false;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                temSessaoLocal = true;
                break;
            }
        }
    } catch(e) {}

    const perfilCache = localStorage.getItem('suiri_perfil_ativo');

    if (temSessaoLocal && perfilCache) {
        try {
            const perfil = JSON.parse(perfilCache);
            window.perfilAtual = perfil;
            window.familiaAtualId = perfil.familia_id;

            const familiaCache = localStorage.getItem('suiri_familia_ativa');
            if (familiaCache) window.dadosFamiliaAtual = JSON.parse(familiaCache);

            const membrosCache = localStorage.getItem('suiri_membros_ativos');
            if (membrosCache) window.listaMembrosFamilia = JSON.parse(membrosCache);

            document.getElementById('tela-login')?.classList.add('oculto');
            document.getElementById('tela-app')?.classList.remove('oculto');

            const elNomeFamilia = document.getElementById('nome-familia-topo');
            if (elNomeFamilia && window.dadosFamiliaAtual?.nome_familia) {
                elNomeFamilia.textContent = window.dadosFamiliaAtual.nome_familia;
            }

            window.aplicarRegrasPerfilKidsOuAdulto();
            window.atualizarIconeBotaoSessao();
        } catch (e) {
            console.warn("Aviso ao ler cache local rápido:", e);
        }
    }

    try {
        const { data: { session }, error } = await cliente.auth.getSession();
        if (session && session.user && !error) {
            window.usuarioAtual = session.user;
            await window.iniciarAppFamilia();
        } else {
            try {
                localStorage.removeItem('suiri_perfil_ativo');
                localStorage.removeItem('suiri_familia_ativa');
                localStorage.removeItem('suiri_membros_ativos');
            } catch(e) {}
            document.getElementById('tela-app')?.classList.add('oculto');
            document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
            document.getElementById('tela-login')?.classList.remove('oculto');
        }
    } catch (err) {
        if (!window.perfilAtual) {
            document.getElementById('tela-app')?.classList.add('oculto');
            document.getElementById('barra-navegacao-principal')?.classList.add('oculto');
            document.getElementById('tela-login')?.classList.remove('oculto');
        }
    }
};

// =========================================================================
// 9. NAVEGAÇÃO REATIVA ENTRE TELAS (COM DIREÇÃO E SWIPE)
// =========================================================================
window.navegarParaTela = function(nomeTela) {
    if (window.SonsSuiri && typeof window.SonsSuiri.popClique === 'function') {
        window.SonsSuiri.popClique();
    }

    if (window.modoKidsAtivo) return;

    const ordemTelas = ['meuespaco', 'inicio', 'mercado', 'financeiro', 'calendario', 'familia'];
    const indexAtual = ordemTelas.indexOf(window.telaAtualVisivel || 'inicio');
    const indexDestino = ordemTelas.indexOf(nomeTela);
    let direcaoClasse = '';

    if (indexDestino > indexAtual) {
        direcaoClasse = 'animar-entrada-direita';
    } else if (indexDestino < indexAtual) {
        direcaoClasse = 'animar-entrada-esquerda';
    }

    window.telaAtualVisivel = nomeTela;
    
    const secoes = document.querySelectorAll('.secao-conteudo-app');
    secoes.forEach(sec => {
        sec.classList.add('oculto');
        sec.classList.remove('animar-entrada-direita', 'animar-entrada-esquerda');
    });

    const telaAlvo = document.getElementById(`secao-${nomeTela}`);
    if (telaAlvo) {
        if (direcaoClasse) {
            telaAlvo.classList.add(direcaoClasse);
        }
        telaAlvo.classList.remove('oculto');
    }

    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        if (btn.getAttribute('data-tela') === nomeTela) {
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });

    if (nomeTela === 'meuespaco') {
        window.atualizarCartaoEspacoPessoal();
    } else if (nomeTela === 'mercado') {
        if (typeof window.carregarItensMercado === 'function') window.carregarItensMercado();
    } else if (nomeTela === 'financeiro') {
        if (typeof window.carregarCarteiraIndividual === 'function') window.carregarCarteiraIndividual();
        if (typeof window.carregarExtratoPeriodo === 'function') window.carregarExtratoPeriodo();
        if (typeof window.carregarCofresCompartilhados === 'function') window.carregarCofresCompartilhados();
    } else if (nomeTela === 'calendario') {
        if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    } else if (nomeTela === 'familia') {
        if (typeof window.carregarListaMembrosPainel === 'function') window.carregarListaMembrosPainel();
    } else if (nomeTela === 'inicio') {
        if (typeof window.carregarMissoesDoDia === 'function') window.carregarMissoesDoDia();
        if (typeof window.carregarRecadosLar === 'function') window.carregarRecadosLar();
        if (typeof window.carregarMetasAnuais === 'function') window.carregarMetasAnuais();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// =========================================================================
// 10. ELIMINAÇÃO TOTAL DA PRÓPRIA CONTA
// =========================================================================
window.solicitarExclusaoPropriaConta = async function() {
    if (!cliente || !window.usuarioAtual) {
        return window.mostrarToast("Sessão não identificada para exclusão.", "erro");
    }

    const primeiroAviso = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Tem a certeza absoluta de que pretende eliminar a sua conta? Todos os seus dados, tarefas e registos serão eliminados de forma irreversível.", "Eliminar Conta")
        : confirm("Tem a certeza absoluta de que pretende eliminar a sua conta? Todos os seus dados serão eliminados.");

    if (!primeiroAviso) return;

    const segundoAviso = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Esta é uma ação definitiva e sem retorno. Deseja confirmar agora a remoção completa?", "Confirmação Final")
        : confirm("Esta é uma ação definitiva e sem retorno. Deseja confirmar agora?");

    if (!segundoAviso) return;

    window.mostrarToast("A eliminar a sua conta e registos...", "info");

    try {
        const { error } = await cliente.rpc('excluir_minha_propria_conta');

        if (error) {
            console.error("Falha ao executar exclusão:", error);
            return window.mostrarToast("Erro ao processar eliminação: " + error.message, "erro");
        }

        await cliente.auth.signOut();
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}

        window.usuarioAtual = null;
        window.perfilAtual = null;
        window.familiaAtualId = null;

        window.mostrarToast("Conta e dados eliminados com sucesso.");
        setTimeout(() => {
            window.location.reload();
        }, 1200);

    } catch (err) {
        console.error("Exceção na eliminação:", err);
        window.mostrarToast("Falha de comunicação ao eliminar conta.", "erro");
    }
};

// =========================================================================
// 11. FILA OFFLINE (ROBUSTEZ COM INDEXED-DB)
// =========================================================================
const DB_NAME = 'SuiriOfflineDB';
const STORE_NAME = 'FilaAcoes';

const idbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

window.adicionarAFilaOffline = async function(acao) {
    try {
        const db = await idbPromise;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.add({ ...acao, timestamp: Date.now() });
        window.mostrarToast("Ação guardada localmente (Modo Offline).", "info");
    } catch (e) {
        console.error("Erro na fila offline IndexedDB:", e);
    }
};

window.processarFilaOffline = async function() {
    if (!navigator.onLine || !cliente || !window.familiaAtualId) return;
    
    try {
        const db = await idbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = async () => {
            const fila = request.result;
            if (fila.length === 0) return;

            let sucessoCount = 0;
            for (const item of fila) {
                try {
                    if (item.tabela && item.dados) {
                        if (item.tipoOperacao === 'insert') {
                            await cliente.from(item.tabela).insert(item.dados);
                        } else if (item.tipoOperacao === 'update' && item.condicao) {
                            await cliente.from(item.tabela).update(item.dados).match(item.condicao);
                        }
                    }
                    const delTx = db.transaction(STORE_NAME, 'readwrite');
                    delTx.objectStore(STORE_NAME).delete(item.id);
                    sucessoCount++;
                } catch (err) {
                    console.error("Falha ao sincronizar item offline", err);
                }
            }
            if (sucessoCount > 0) {
                window.mostrarToast("Ações offline sincronizadas com sucesso!");
            }
        };
    } catch (err) {
        console.error("Erro ao processar IndexedDB offline", err);
    }
};

window.addEventListener('online', () => window.processarFilaOffline());

document.addEventListener("DOMContentLoaded", () => {
    window.verificarSessao();
});
