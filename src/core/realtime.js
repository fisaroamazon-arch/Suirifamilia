/* Suiri Família 7.0 · domínio extraído de app-painel.js. */
window.iniciarEscutaRealtimeFamilia = function() {
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId) return;

    try {
        if(window._suiriCanalFamilia)cli.removeChannel(window._suiriCanalFamilia);

        const canal = cli.channel('suiri-familia-canal-' + window.familiaAtualId);
        window._suiriCanalFamilia=canal;

        canal
            .on('postgres_changes', { event: '*', schema: 'public', table: 'membros', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarListaMembrosPainel();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recados_lar', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                if (typeof window.carregarRecadosLar === 'function') {
                    window.carregarRecadosLar();
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_financeira', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarDadosCalendarioMes();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compromissos_familia', filter: `familia_id=eq.${window.familiaAtualId}` }, () => {
                window.carregarDadosCalendarioMes();
            })
            .subscribe();
    } catch (e) {
        console.warn("Modo realtime operando em segundo plano:", e);
    }
};

// =========================================================================
// 5. INICIALIZAÇÃO AUTOMÁTICA
// =========================================================================

