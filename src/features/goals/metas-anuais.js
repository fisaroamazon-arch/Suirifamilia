/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.carregarMetasAnuais = async function() {
    const cli = obterClienteSupabase();
    if (!cli || !window.familiaAtualId) return;

    const { data, error } = await cli.from('planos_anuais')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .order('criado_em', { ascending: false });

    if (!error) {
        window.metasAnuaisLista = data || [];
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
    }
};

window.atualizarResumoMiniPainelMetas = function() {
    const lblResumo = document.getElementById('lbl-metas-ano-resumo');
    const lblPct = document.getElementById('lbl-metas-ano-porcentagem');
    const barraFill = document.getElementById('barra-metas-ano-fill');
    const meuId = obterUsuarioId();

    const metasVisiveis = (window.metasAnuaisLista || []).filter(m => {
        return m.escopo === 'casa' || (m.escopo === 'pessoal' && m.criado_por === meuId);
    });

    const total = metasVisiveis.length;
    const concluidas = metasVisiveis.filter(m => m.concluida === true).length;
    const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    if (lblResumo) {
        lblResumo.textContent = total > 0 
            ? `${concluidas} de ${total} objetivos concluídos`
            : "Nenhum plano anual cadastrado ainda";
    }

    if (lblPct) {
        lblPct.textContent = `${pct}%`;
    }

    if (barraFill) {
        barraFill.style.width = `${pct}%`;
    }
};

window.abrirModalMetasAnuais = function() {
    document.getElementById('modal-metas-anuais')?.classList.remove('oculto');
    window.alternarAbaMetasAnuais(window.abaMetasAnuaisAtiva || 'casa');
};

window.fecharModalMetasAnuais = function() {
    document.getElementById('modal-metas-anuais')?.classList.add('oculto');
    window.fecharFormularioNovaMetaAnual();
};

window.alternarAbaMetasAnuais = function(aba) {
    window.abaMetasAnuaisAtiva = aba;
    const btnCasa = document.getElementById('btn-tab-metas-casa');
    const btnPessoal = document.getElementById('btn-tab-metas-pessoal');

    if (btnCasa && btnPessoal) {
        if (aba === 'casa') {
            btnCasa.className = 'btn-filtro-missao ativo';
            btnPessoal.className = 'btn-filtro-missao';
        } else {
            btnPessoal.className = 'btn-filtro-missao ativo';
            btnCasa.className = 'btn-filtro-missao';
        }
    }

    window.renderizarMetasAnuaisModal();
};

window.abrirFormularioNovaMetaAnual = function() {
    const bloco = document.getElementById('bloco-form-nova-meta-anual');
    if (bloco) {
        bloco.classList.remove('oculto');
        const inTitulo = document.getElementById('input-meta-anual-titulo');
        if (inTitulo) inTitulo.focus();
    }
};

window.fecharFormularioNovaMetaAnual = function() {
    const bloco = document.getElementById('bloco-form-nova-meta-anual');
    if (bloco) bloco.classList.add('oculto');
    const inTitulo = document.getElementById('input-meta-anual-titulo');
    if (inTitulo) inTitulo.value = '';
};

window.salvarNovaMetaAnual = async function() {
    const cli = obterClienteSupabase();
    const meuId = obterUsuarioId();
    if (!cli || !window.familiaAtualId || !meuId) return;

    const inTitulo = document.getElementById('input-meta-anual-titulo');
    const selAno = document.getElementById('select-meta-anual-ano');
    const selCat = document.getElementById('select-meta-anual-categoria');

    const titulo = inTitulo?.value?.trim();
    const ano = parseInt(selAno?.value || '2026', 10);
    const categoria = selCat?.value || 'Geral';
    const escopo = window.abaMetasAnuaisAtiva || 'casa';

    if (!titulo) {
        return window.mostrarToast("Informe o objetivo da meta anual.", "erro");
    }

    const payload = {
        familia_id: window.familiaAtualId,
        criado_por: meuId,
        titulo: titulo,
        ano: ano,
        categoria: categoria,
        escopo: escopo,
        concluida: false
    };

    const { error } = await cli.from('planos_anuais').insert([payload]);

    if (!error) {
        window.mostrarToast(`Plano "${titulo}" adicionado com sucesso!`);
        window.fecharFormularioNovaMetaAnual();
        await window.carregarMetasAnuais();
    } else {
        window.mostrarToast("Erro ao cadastrar plano: " + error.message, "erro");
    }
};

window.alternarStatusMetaAnual = async function(id, statusAtual) {
    const cli = obterClienteSupabase();
    if (!cli) return;

    const novoStatus = !statusAtual;

    const { error } = await cli.from('planos_anuais')
        .update({ concluida: novoStatus })
        .eq('id', id);

    if (!error) {
        const item = window.metasAnuaisLista.find(m => m.id === id);
        if (item) item.concluida = novoStatus;
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
        if (novoStatus) {
            window.dispararParticulasSucesso();
            if (window.SonsSuiri && typeof window.SonsSuiri.sucessoMissao === 'function') {
                window.SonsSuiri.sucessoMissao();
            }
        }
    }
};

window.excluirMetaAnual = async function(id) {
    const confirmado = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente excluir este objetivo anual?")
        : confirm("Deseja realmente excluir este objetivo anual?");
    if (!confirmado) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('planos_anuais').delete().eq('id', id);
    if (!error) {
        window.mostrarToast("Objetivo removido.");
        window.metasAnuaisLista = window.metasAnuaisLista.filter(m => m.id !== id);
        window.atualizarResumoMiniPainelMetas();
        window.renderizarMetasAnuaisModal();
    }
};

window.renderizarMetasAnuaisModal = function() {
    const container = document.getElementById('lista-metas-anuais-container');
    if (!container) return;

    container.innerHTML = '';
    const meuId = obterUsuarioId();
    const abaAtiva = window.abaMetasAnuaisAtiva || 'casa';

    const listaFiltrada = (window.metasAnuaisLista || []).filter(m => {
        if (abaAtiva === 'casa') return m.escopo === 'casa';
        else return m.escopo === 'pessoal' && m.criado_por === meuId;
    });

    if (listaFiltrada.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:22px 10px; color:var(--texto-suave); font-size:13px; line-height:1.45;">
                Nenhum objetivo ${abaAtiva === 'casa' ? 'da família' : 'pessoal'} cadastrado para este ano.<br>
                Toque no botão acima para adicionar o primeiro!
            </div>
        `;
        return;
    }

    listaFiltrada.forEach(meta => {
        const itemEl = document.createElement('div');
        const concluida = meta.concluida === true;

        itemEl.style.cssText = `
            background: #ffffff;
            border: 1px solid ${concluida ? '#86efac' : 'rgba(226, 232, 240, 0.9)'};
            border-left: 5px solid ${concluida ? 'var(--cor-sucesso, #10b981)' : 'var(--cor-primaria, #f97316)'};
            border-radius: 14px;
            padding: 12px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            box-shadow: 0 1px 3px rgba(15,23,42,0.02);
            ${concluida ? 'opacity: 0.85; background: #ecfdf5;' : ''}
        `;

        const catSegura = window.esc ? window.esc(meta.categoria || 'Geral') : (meta.categoria || 'Geral');
        const titSeguro = window.esc ? window.esc(meta.titulo) : meta.titulo;

        itemEl.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                    <span style="font-size:10px; font-weight:800; background:#fff7ed; color:#ea580c; padding:2px 7px; border-radius:6px; border:1px solid rgba(249,115,22,0.18);">
                        ${meta.ano || 2026}
                    </span>
                    <span style="font-size:10.5px; font-weight:700; color:var(--texto-suave);">
                        ${catSegura}
                    </span>
                </div>
                <strong style="font-size:13.5px; color:var(--texto-principal, #0f172a); line-height:1.35; display:block; ${concluida ? 'text-decoration:line-through; color:#64748b;' : ''}">
                    ${titSeguro}
                </strong>
            </div>

            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                <button type="button" class="${concluida ? 'btn-secundario' : 'btn-sucesso'}" style="padding:6px 11px; font-size:11.5px; font-weight:800; border-radius:9px; display:inline-flex; align-items:center; gap:4px;" onclick="window.alternarStatusMetaAnual('${meta.id}', ${concluida})">
                    ${concluida ? `${obterIconeSeguro('check')} Feito` : 'Concluir'}
                </button>
                <button type="button" class="btn-erro" style="padding:6px 9px; font-size:11px; border-radius:9px; display:inline-flex; align-items:center; gap:4px;" onclick="window.excluirMetaAnual('${meta.id}')" title="Excluir">
                    ${obterIconeSeguro('excluir')} Excluir
                </button>
            </div>
        `;

        container.appendChild(itemEl);
    });
};

// =========================================================================
// 18. GATILHO MATINAL DAS 07:00 AM (PENSE - UMA VEZ AO DIA)
// =========================================================================

