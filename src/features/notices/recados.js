/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.carregarRecadosLar = async function() {
    const cli = obterClienteSupabase();
    const container = document.getElementById('lista-recados-lar');
    const lblContador = document.getElementById('contador-recados-pendentes');
    if (!cli || !window.familiaAtualId || !container) return;

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome, eh_kids, papel, avatar_url')
            .eq('familia_id', window.familiaAtualId);
        window.listaMembrosFamilia = membros || [];
    }

    const { data, error } = await cli.from('recados_lar')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('fixado', { ascending: false })
        .order('criado_em', { ascending: false })
        .limit(10);

    window.recadosLarLista = (!error && data) ? data : [];
    
    if (lblContador) {
        lblContador.textContent = `${window.recadosLarLista.length} aviso${window.recadosLarLista.length === 1 ? '' : 's'}`;
    }

    window.renderizarRecadosLar();
};

window.renderizarRecadosLar = function() {
    const container = document.getElementById('lista-recados-lar');
    if (!container) return;

    const meuId = obterUsuarioId();

    if (window.recadosLarLista.length === 0) {
        container.innerHTML = '<span style="font-size:11.5px; color:var(--texto-suave); text-align:center; display:block; padding:8px 0;">Nenhum recado no mural hoje.</span>';
        return;
    }

    container.innerHTML = window.recadosLarLista.map(r => {
        let autorNome = 'Familiar';
        if (window.listaMembrosFamilia) {
            const m = window.listaMembrosFamilia.find(x => x.id === r.autor_id);
            if (m) autorNome = obterPrimeiroNomeSeguro(m.nome);
        }

        const lidosArray = Array.isArray(r.lido_por) ? r.lido_por : [];
        const jaLi = lidosArray.includes(meuId);
        const souAutor = r.autor_id === meuId;

        let nomesQuemLeu = [];
        if (window.listaMembrosFamilia && lidosArray.length > 0) {
            nomesQuemLeu = window.listaMembrosFamilia
                .filter(m => lidosArray.includes(m.id))
                .map(m => m.id === meuId ? 'Você' : obterPrimeiroNomeSeguro(m.nome));
        }

        const infoQuemLeu = nomesQuemLeu.length > 0
            ? `<div style="font-size:10.5px; color:var(--cor-sucesso, #10b981); margin-top:3px; font-weight:700;">✓ Lido por: ${nomesQuemLeu.join(', ')}</div>`
            : '';

        const dataFmt = r.criado_em ? new Date(r.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const msgSegura = window.esc ? window.esc(r.mensagem) : r.mensagem;

        return `
            <div style="background:#ffffff; border:1px solid rgba(226, 232, 240, 0.9); border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:8px; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <span style="font-size:11px; font-weight:800; color:var(--cor-primaria, #f97316);">${autorNome}</span>
                        <span style="font-size:10px; color:var(--texto-suave);">${dataFmt}</span>
                    </div>
                    <div style="font-size:12.5px; color:var(--texto-principal, #0f172a); word-break:break-word; line-height:1.4;">
                        ${msgSegura}
                    </div>
                    ${infoQuemLeu}
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    <button type="button" class="btn-secundario" style="padding:4px 7px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center;" onclick="if(window.alfinetarItemEspecifico) window.alfinetarItemEspecifico('recado', '${r.id}')" title="Fixar no Meu Espaço">
                        <img src="assets/icons-modern/icone-alfinete.svg" alt="Fixar" style="width:13px; height:13px; object-fit:contain;">
                    </button>
                    ${!jaLi ? `
                        <button type="button" class="btn-secundario" style="padding:5px 9px; font-size:10.5px; font-weight:800; border-radius:8px;" onclick="window.marcarRecadoLido('${r.id}')" title="Marcar como lido">
                            Marcar Lido
                        </button>
                    ` : `
                        <span style="font-size:10.5px; font-weight:800; color:var(--cor-sucesso, #10b981);">Lido</span>
                    `}
                    ${souAutor ? `
                        <button type="button" class="btn-erro" style="padding:4px 7px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center;" onclick="window.excluirRecadoLar('${r.id}')" title="Eliminar recado">
                            ${obterIconeSeguro('excluir')}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

window.publicarRecadoLar = async function() {
    const input = document.getElementById('input-novo-recado');
    const msg = input?.value?.trim();
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();

    if (!msg) return window.mostrarToast("Escreva o recado antes de enviar.", "erro");
    if (!cli || !meuId) return window.mostrarToast("Erro de sessão.", "erro");

    const payload = {
        familia_id: window.familiaAtualId,
        autor_id: meuId,
        mensagem: msg,
        fixado: false,
        lido_por: [meuId]
    };

    const { error } = await cli.from('recados_lar').insert([payload]);

    if (!error) {
        if (input) input.value = '';
        window.mostrarToast("Recado afixado no mural!");
        await window.carregarRecadosLar();
    } else {
        window.mostrarToast("Erro ao publicar: " + error.message, "erro");
    }
};

window.marcarRecadoLido = async function(recadoId) {
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();
    if (!cli || !meuId) return;

    const recado = window.recadosLarLista.find(r => r.id === recadoId);
    if (!recado) return;

    const lidosArray = Array.isArray(recado.lido_por) ? [...recado.lido_por] : [];
    if (!lidosArray.includes(meuId)) {
        lidosArray.push(meuId);
        await cli.from('recados_lar').update({ lido_por: lidosArray }).eq('id', recadoId);
        recado.lido_por = lidosArray;
        window.renderizarRecadosLar();
    }
};

window.excluirRecadoLar = async function(recadoId) {
    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Tem certeza de que deseja retirar este recado do mural?")
        : confirm("Tem certeza de que deseja retirar este recado do mural?");
    if (!confirmado) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('recados_lar').delete().eq('id', recadoId);
    if (!error) {
        window.mostrarToast("Recado removido.");
        window.recadosLarLista = window.recadosLarLista.filter(r => r.id !== recadoId);
        window.renderizarRecadosLar();
    }
};

// =========================================================================
// 17. GESTOR DE PLANOS & METAS ANUAIS
// =========================================================================

