/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.abrirModalDefinirMetaEconomia = function() {
    const usuarioId = obterUsuarioId();
    const chave = `suiri_meta_pessoal_${usuarioId || 'padrao'}`;
    const metaAtual = parseFloat(localStorage.getItem(chave) || '500');
    
    const inputMeta = document.getElementById('input-novo-valor-meta-economia');
    if (inputMeta) inputMeta.value = metaAtual;
    document.getElementById('modal-definir-meta-economia')?.classList.remove('oculto');
};

window.fecharModalDefinirMetaEconomia = function() {
    document.getElementById('modal-definir-meta-economia')?.classList.add('oculto');
};

window.salvarNovaMetaEconomia = function() {
    const inputMeta = document.getElementById('input-novo-valor-meta-economia');
    const valor = parseFloat(inputMeta?.value);
    const usuarioId = obterUsuarioId();

    if (isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe um valor válido para a meta.", "erro");
    }

    const chave = `suiri_meta_pessoal_${usuarioId || 'padrao'}`;
    localStorage.setItem(chave, valor.toString());
    window.fecharModalDefinirMetaEconomia();
    window.mostrarToast(`Meta pessoal confirmada: R$ ${valor.toFixed(2)}!`);
    window.atualizarVisualizacaoMetaEconomia();
};

window.atualizarVisualizacaoMetaEconomia = async function() {
    const supabase = obterClienteSupabase();
    const usuarioId = obterUsuarioId();
    if (!usuarioId || !supabase) return;

    const chave = `suiri_meta_pessoal_${usuarioId}`;
    const metaMensal = parseFloat(localStorage.getItem(chave) || '500');
    
    const elMeta = document.getElementById('lbl-valor-meta-mensal');
    if (elMeta) elMeta.textContent = `R$ ${metaMensal.toFixed(2)}`;

    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

    let { data: transacoesMes } = await Suiri.transactionQuery().select('tipo, valor')
        .eq('membro_id', usuarioId)
        .gte('data_transacao', primeiroDia);

    if (!transacoesMes) {
        const res = await supabase.from('transacoes_financeiras')
            .select('tipo, valor')
            .eq('membro_id', usuarioId)
            .gte('data_transacao', primeiroDia);
        transacoesMes = res.data || [];
    }

    let entradasMes = 0;
    let saidasMes = 0;

    (transacoesMes || []).forEach(t => {
        if (t.tipo === 'entrada') entradasMes += Number(t.valor || 0);
        else saidasMes += Number(t.valor || 0);
    });

    const poupadoMes = Math.max(0, entradasMes - saidasMes);
    const porcentagem = Math.min(100, Math.round((poupadoMes / metaMensal) * 100));

    const elAcumulado = document.getElementById('lbl-status-acumulado-economia');
    const elPorcentagem = document.getElementById('lbl-porcentagem-meta-economia');
    const elFill = document.getElementById('barra-progresso-economia-fill');

    if (elAcumulado) elAcumulado.textContent = `R$ ${poupadoMes.toFixed(2)} guardados`;
    if (elPorcentagem) elPorcentagem.textContent = `${porcentagem}%`;
    if (elFill) elFill.style.width = `${porcentagem}%`;
};

window.carregarCofresCompartilhados = async function() {
    const cli = obterClienteSupabase();
    const container = document.getElementById('lista-cofres-compartilhados');
    if (!cli || !window.familiaAtualId || !container) return;

    const { data, error } = await cli.from('metas_compartilhadas')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .eq('ativa', true)
        .order('criado_em', { ascending: false });

    window.cofresCompartilhadosLista = (!error && data) ? data : [];
    window.renderizarCofresNaTela();
};

window.renderizarCofresNaTela = function() {
    const container = document.getElementById('lista-cofres-compartilhados');
    if (!container) return;

    if (window.cofresCompartilhadosLista.length === 0) {
        container.innerHTML = '<span style="font-size:11.5px; color:var(--texto-suave); text-align:center; display:block; padding:10px 0;">Nenhum cofre criado. Toque em "+ Novo Cofre" para começar.</span>';
        return;
    }

    container.innerHTML = window.cofresCompartilhadosLista.map(cofre => {
        const alvo = Number(cofre.valor_alvo || 0);
        const guardado = Number(cofre.valor_acumulado || 0);
        const pct = alvo > 0 ? Math.min(100, (guardado / alvo) * 100) : 0;

        return `
            <div style="background:var(--suiri-surface-secondary-light, #fffbeb); border:1px solid rgba(226, 232, 240, 0.9); border-radius:14px; padding:12px 14px; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:14px; font-weight:800; color:var(--texto-principal, #0f172a);">${esc(cofre.titulo)}</strong>
                        <div style="font-size:11.5px; color:var(--texto-suave, #64748b); margin-top:2px;">
                            Guardado: <strong style="color:var(--cor-sucesso, #10b981); font-variant-numeric:tabular-nums;">R$ ${guardado.toFixed(2)}</strong> de R$ ${alvo.toFixed(2)}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:11.5px; font-weight:800; color:var(--cor-sucesso, #10b981); font-variant-numeric:tabular-nums;">${pct.toFixed(0)}%</span>
                        <button type="button" class="btn-secundario" style="padding:4px 7px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center;" onclick="if(window.alfinetarItemEspecifico) window.alfinetarItemEspecifico('cofre', '${cofre.id}')" title="Fixar no Meu Espaço">
                            <img src="assets/icons-modern/icone-alfinete.svg" alt="Fixar" style="width:13px; height:13px; object-fit:contain;">
                        </button>
                        <button type="button" class="btn-secundario" style="padding:4px 8px; font-size:11px; border-radius:8px; font-weight:700;" onclick="window.abrirModalEditarCofre('${cofre.id}')">Ajustar</button>
                    </div>
                </div>

                <div style="background:#e2e8f0; border-radius:8px; height:8px; width:100%; overflow:hidden; position:relative; margin-top:8px;">
                    <div style="background:linear-gradient(90deg, #10b981, #059669); height:100%; width:${pct.toFixed(1)}%; transition:width 0.4s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
};

window.abrirModalDefinirMeta = function() {
    document.getElementById('titulo-modal-cofre').textContent = 'Novo Cofre Compartilhado';
    document.getElementById('input-meta-id').value = '';
    document.getElementById('input-meta-titulo').value = '';
    document.getElementById('input-meta-alvo').value = '';
    document.getElementById('modal-definir-meta')?.classList.remove('oculto');
};

window.abrirModalEditarCofre = function(id) {
    const cofre = window.cofresCompartilhadosLista.find(c => c.id === id);
    if (!cofre) return;

    document.getElementById('titulo-modal-cofre').textContent = 'Editar Cofre Compartilhado';
    document.getElementById('input-meta-id').value = cofre.id;
    document.getElementById('input-meta-titulo').value = cofre.titulo || '';
    document.getElementById('input-meta-alvo').value = cofre.valor_alvo || '';
    document.getElementById('modal-definir-meta')?.classList.remove('oculto');
};

window.fecharModalDefinirMeta = function() {
    document.getElementById('modal-definir-meta')?.classList.add('oculto');
};

window.salvarMetaEstavel = async function() {
    const cofreId = document.getElementById('input-meta-id')?.value;
    const titulo = document.getElementById('input-meta-titulo')?.value.trim();
    const alvo = parseFloat(document.getElementById('input-meta-alvo')?.value);
    const cli = obterClienteSupabase();

    if (!titulo || isNaN(alvo) || alvo <= 0) {
        return window.mostrarToast("Indique o objetivo e o valor alvo.", "erro");
    }
    if (!cli) return window.mostrarToast("Erro de ligação.", "erro");

    if (cofreId) {
        const result=await cli.from('metas_compartilhadas').update({
            titulo: titulo,
            valor_alvo: alvo
        }).eq('id', cofreId).select('id');
        try{Suiri.check(result,1);}catch(error){return Suiri.notifyError(error);}
    } else {
        const result=await cli.from('metas_compartilhadas').insert([{
            familia_id: window.familiaAtualId,
            titulo: titulo,
            valor_alvo: alvo,
            valor_acumulado: 0,
            ativa: true
        }]).select('id');
        try{Suiri.check(result,1);}catch(error){return Suiri.notifyError(error);}
    }

    window.mostrarToast("Cofre confirmado com sucesso!");
    window.fecharModalDefinirMeta();
    await window.carregarCofresCompartilhados();
};

window.abrirModalAporteMeta = function() {
    const selDestino = document.getElementById('select-destino-aporte');
    if (selDestino) {
        selDestino.innerHTML = '<option value="pessoal">Minha Poupança Individual</option>';
        window.cofresCompartilhadosLista.forEach(cofre => {
            selDestino.innerHTML += `<option value="${cofre.id}">Cofre: ${esc(cofre.titulo)}</option>`;
        });
    }

    const inVal = document.getElementById('input-valor-aporte');
    if (inVal) inVal.value = '';
    document.getElementById('modal-aporte-meta')?.classList.remove('oculto');
};

window.fecharModalAporteMeta = function() {
    document.getElementById('modal-aporte-meta')?.classList.add('oculto');
};

// confirmarAporteMeta está em src/services/operations.js.

// =========================================================================
// 16. MURAL DE RECADOS RÁPIDOS DO LAR
// =========================================================================

