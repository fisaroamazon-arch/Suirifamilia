/* Suiri Família 7.0 · domínio extraído de app-gestao.js. */
window.adicionarItemAgendaFinanceira = async function() {
    const descricao = document.getElementById('input-agenda-descricao')?.value.trim();
    const valor = parseFloat(document.getElementById('input-agenda-valor')?.value);
    const vencimentoStr = document.getElementById('input-agenda-vencimento')?.value;
    const tipo = document.getElementById('select-agenda-tipo')?.value || 'conta_pagar';
    const recorrencia = document.getElementById('select-agenda-recorrencia')?.value || 'unica';
    const escopo = document.getElementById('select-agenda-escopo')?.value || 'casa';
    const categoria = document.getElementById('select-agenda-categoria')?.value || 'Geral';
    const cli = obterClienteSupabase();
    const usuarioId = obterUsuarioId();

    if (!descricao || !Number.isFinite(valor) || valor<=0 || !vencimentoStr) return window.mostrarToast("Preencha descrição, valor e vencimento.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const datasGeradas = [];
    const dataInicial = new Date(vencimentoStr + 'T12:00:00'); 
    let qtdParcelas = 1;
    let ehPerpetua = false;
    let grupoId = gerarUUIDSeguro();

    if (recorrencia === 'mensal_12x') {
        qtdParcelas = 12;
    } else if (recorrencia === 'perpetua') {
        qtdParcelas = 36;
        ehPerpetua = true;
    }

    for (let i = 0; i < qtdParcelas; i++) {
        const dtCopy = new Date(dataInicial);
        dtCopy.setMonth(dtCopy.getMonth() + i);
        datasGeradas.push({
            data_vencimento: Suiri.monthDate(vencimentoStr,i),
            parcela_num: i + 1
        });
    }

    const payloadBatch = datasGeradas.map(d => {
        const obj = {
            familia_id: window.familiaAtualId,
            tipo_evento: tipo,
            escopo: escopo,
            eh_privado: (escopo === 'pessoal'),
            categoria: categoria,
            descricao: qtdParcelas > 1 && !ehPerpetua ? `${descricao} (${d.parcela_num}/${qtdParcelas})` : descricao,
            valor: valor,
            data_vencimento: d.data_vencimento,
            recorrencia_grupo_id: qtdParcelas > 1 ? grupoId : null,
            numero_parcela: d.parcela_num,
            total_parcelas: qtdParcelas,
            eh_perpetua: ehPerpetua,
            status: 'pendente',
            pago: false
        };
        if (usuarioId) {
            obj.criado_por = usuarioId;
            obj.membro_id = usuarioId;
        }
        return obj;
    });

    let { error } = await cli.from('agenda_financeira').insert(payloadBatch);

    if (error && error.message && error.message.includes('criado_por')) {
        const payloadFallback = payloadBatch.map(p => {
            const copia = { ...p };
            delete copia.criado_por;
            return copia;
        });
        const res = await cli.from('agenda_financeira').insert(payloadFallback);
        error = res.error;
    }

    if (!error) {
        window.fecharModalAgendarContaSalario();
        window.mostrarToast(qtdParcelas > 1 ? "Agendamentos confirmados (até 36 meses; renovação manual ao final)." : "Agendamento confirmado no calendário!");
        const inDesc = document.getElementById('input-agenda-descricao');
        const inVal = document.getElementById('input-agenda-valor');
        if (inDesc) inDesc.value = '';
        if (inVal) inVal.value = '';
        if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
        if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
        if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
    } else {
        window.mostrarToast("Erro ao agendar: " + error.message, "erro");
    }
};

window.excluirContaRecorrenteAgenda = async function(id, ehPerpetua) {
    if (ehPerpetua || typeof ehPerpetua === 'undefined' || ehPerpetua === 'true' || ehPerpetua === true) {
        itemParaExcluirAgendaId = id;
        document.getElementById('modal-confirmar-exclusao-agenda')?.classList.remove('oculto');
    } else {
        const confirmou = window.confirmarAcaoSuiri
            ? await window.confirmarAcaoSuiri("Deseja confirmar a exclusão deste agendamento do calendário?", "Confirmar Exclusão")
            : confirm("Deseja confirmar a exclusão deste agendamento do calendário?");

        if (confirmou) {
            const cli = obterClienteSupabase();
            if (!cli) return;
            const { error } = await cli.from('agenda_financeira').delete().eq('id', id);
            if (!error) {
                window.mostrarToast("Conta removida com sucesso!");
                window.fecharModalDetalhesDiaCalendario();
                if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
                if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
                if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
            }
        }
    }
};

window.fecharModalConfirmarExclusaoAgenda = function() {
    document.getElementById('modal-confirmar-exclusao-agenda')?.classList.add('oculto');
    itemParaExcluirAgendaId = null;
};

window.executarExclusaoAgenda = async function(modo) {
    if (!itemParaExcluirAgendaId) return;
    const cli = obterClienteSupabase();
    if (!cli) return;

    const { data: item } = await cli.from('agenda_financeira').select('*').eq('id', itemParaExcluirAgendaId).single();
    if (!item) return;

    if (modo === 'apenas_esta') {
        await cli.from('agenda_financeira').delete().eq('id', itemParaExcluirAgendaId);
    } else if (modo === 'proximas') {
        if (item.recorrencia_grupo_id) {
            await cli.from('agenda_financeira')
                .delete()
                .eq('recorrencia_grupo_id', item.recorrencia_grupo_id)
                .gte('data_vencimento', item.data_vencimento);
        } else {
            await cli.from('agenda_financeira').delete().eq('id', itemParaExcluirAgendaId);
        }
    }

    window.mostrarToast("Agendamentos removidos com sucesso!");
    window.fecharModalConfirmarExclusaoAgenda();
    window.fecharModalDetalhesDiaCalendario();
    if (typeof window.carregarDadosCalendarioMes === 'function') window.carregarDadosCalendarioMes();
    if (typeof window.atualizarNotificacoesGeraisPainel === 'function') window.atualizarNotificacoesGeraisPainel();
    if (typeof window.carregarAgendaFinanceira === 'function') window.carregarAgendaFinanceira();
};
