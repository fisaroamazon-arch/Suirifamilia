/* Suiri Família 7.0 · entrada da página homem.html. */
document.addEventListener("DOMContentLoaded", async () => {
            if(!await window.suiriSessaoPronta)return;
            Suiri.reloadPersonal?.();
            if (window.PlayerHomem && typeof window.PlayerHomem.iniciar === 'function') {
                window.PlayerHomem.iniciar();
            }

            const perfilRaw = localStorage.getItem('suiri_perfil_ativo') || localStorage.getItem('suiri_ultimo_perfil');
            let perfil = {};
            try {
                perfil = JSON.parse(perfilRaw || '{}');
            } catch (e) {
                perfil = {};
            }


            window.fecharEspacoMasculino = function() {
                if (window.PlayerHomem && window.PlayerHomem.audio) {
                    window.PlayerHomem.audio.pause();
                }
                window.location.href = 'index.html';
            };

            if (typeof window.renderizarEsqueletoEspacoMasculino === 'function') {
                window.renderizarEsqueletoEspacoMasculino();
                if (typeof window.renderizarReflexaoEstoica === 'function') window.renderizarReflexaoEstoica(false);
                if (typeof window.renderizarListaFavoritasEstoicas === 'function') window.renderizarListaFavoritasEstoicas();
                if (typeof window.renderizarBotoesForja === 'function') window.renderizarBotoesForja();
                if (typeof window.renderizarPainelEvolucaoForja === 'function') window.renderizarPainelEvolucaoForja();
                if (typeof window.renderizarHistoricoForja === 'function') window.renderizarHistoricoForja();
                if (typeof window.renderizarGraficoETendenciasEstadoDiario === 'function') window.renderizarGraficoETendenciasEstadoDiario();
                if (typeof window.renderizarGraficoETendenciasRadar === 'function') window.renderizarGraficoETendenciasRadar();
                if (typeof window.renderizarHistoricoRadarIntimo === 'function') window.renderizarHistoricoRadarIntimo();
                if (typeof window.atualizarVisualizacaoMidia === 'function') window.atualizarVisualizacaoMidia();
                if (typeof window.renderizarHistoricoQueroVerMasc === 'function') window.renderizarHistoricoQueroVerMasc();
                if (typeof window.renderizarHistoricoAssistidos === 'function') window.renderizarHistoricoAssistidos();
                if (typeof window.renderizarListasMasculinas === 'function') window.renderizarListasMasculinas();

                if (typeof window.carregarDadosNuvemEspacoMasculino === 'function') {
                    try {
                        await window.carregarDadosNuvemEspacoMasculino();
                    } catch (e) {
                        console.warn("Base local ativa para o Espaço Masculino.");
                    }
                }
            }
        });
