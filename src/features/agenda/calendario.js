/* Suiri Família 7.0 · domínio extraído de app-painel.js. */
window.filtrarCalendarioPorTipo = function(tipo) {
    window.filtroCalendarioAtivo = tipo;
    window.renderizarGradeCalendario(window.contasCalendarioAtual, window.eventosCalendarioAtual);
};

window.navegarMesCalendario = function(direcao) {
    window.dataCalendarioAtual.setMonth(window.dataCalendarioAtual.getMonth() + direcao);
    window.carregarDadosCalendarioMes();
};

window.carregarDadosCalendarioMes = async function() {
    const cli = obterClienteSupabase();
    if (!window.familiaAtualId || !cli) return;

    const ano = window.dataCalendarioAtual.getFullYear();
    const mes = window.dataCalendarioAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).toISOString().split('T')[0];
    const ultimoDia = new Date(ano, mes + 1, 0).toISOString().split('T')[0];

    const titulo = document.getElementById('mes-ano-calendario-titulo');
    if (titulo) {
        const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        titulo.textContent = `${nomesMeses[mes]} ${ano}`;
    }

    const { data: contas } = await cli.from('agenda_financeira')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_vencimento', primeiroDia)
        .lte('data_vencimento', ultimoDia);

    const { data: eventos } = await cli.from('compromissos_familia')
        .select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_evento', primeiroDia)
        .lte('data_evento', ultimoDia);

    window.contasCalendarioAtual = contas || [];
    window.eventosCalendarioAtual = eventos || [];

    window.renderizarGradeCalendario(window.contasCalendarioAtual, window.eventosCalendarioAtual);
    await window.atualizarNotificacoesGeraisPainel();
};

window.renderizarGradeCalendario = function(contas, eventos) {
    const container = document.getElementById('grid-calendario-container');
    if (!container) return;

    container.innerHTML = '';
    const ano = window.dataCalendarioAtual.getFullYear();
    const mes = window.dataCalendarioAtual.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    let html = '<div class="grade-calendario-mensal" style="display:grid; grid-template-columns:repeat(7, minmax(0, 1fr)); gap:5px; text-align:center;">';

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(d => {
        html += `<div style="font-size:10.5px; font-weight:800; color:var(--texto-suave, #64748b); text-transform:uppercase; padding-bottom:6px; letter-spacing:0.3px;">${d}</div>`;
    });

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    for (let i = 0; i < primeiroDiaSemana; i++) {
        html += '<div></div>';
    }

    const hojeDataStr = Suiri.today();

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtualStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        const contasDoDia = contas.filter(c => c.data_vencimento === dataAtualStr);
        const eventosDoDia = eventos.filter(e => e.data_evento === dataAtualStr);

        let bolinhas = '';

        if (window.filtroCalendarioAtivo === 'todos' || window.filtroCalendarioAtivo === 'contas') {
            const contasPendentes = contasDoDia.filter(c => c.status !== 'liquidado' && c.pago !== true);
            if (contasPendentes.some(c => c.tipo_evento === 'conta_pagar')) {
                bolinhas += '<span style="width:5px; height:5px; border-radius:50%; background:var(--cor-erro, #ef4444); display:inline-block;"></span>';
            }
            if (contasPendentes.some(c => c.tipo_evento === 'recebimento')) {
                bolinhas += '<span style="width:5px; height:5px; border-radius:50%; background:var(--cor-sucesso, #10b981); display:inline-block;"></span>';
            }
            if (contasDoDia.length > 0 && contasPendentes.length === 0) {
                bolinhas += '<span style="width:5px; height:5px; border-radius:50%; background:#94a3b8; display:inline-block;" title="Contas Liquidadas"></span>';
            }
        }

        if (window.filtroCalendarioAtivo === 'todos' || window.filtroCalendarioAtivo === 'eventos') {
            if (eventosDoDia.length > 0) {
                const cor = eventosDoDia[0].cor_etiqueta || '#0284c7';
                bolinhas += `<span style="width:5px; height:5px; border-radius:50%; background:${cor}; display:inline-block;"></span>`;
            }
        }

        const ehHoje = hojeDataStr === dataAtualStr;
        const estiloDia = ehHoje
            ? 'background:#fff7ed; color:var(--cor-primaria, #f97316); border-radius:12px; border:2px solid var(--cor-primaria, #f97316); box-shadow:0 2px 8px rgba(249,115,22,0.18);'
            : 'background:#ffffff; border-radius:12px; border:1px solid rgba(226, 232, 240, 0.85); color:var(--texto-principal, #0f172a); box-shadow:0 1px 2px rgba(15, 23, 42, 0.02);';

        html += `
            <div style="padding:6px 0; cursor:pointer; display:flex; flex-direction:column; align-items:center; aspect-ratio:1/1; justify-content:center; font-variant-numeric:tabular-nums; transition:transform 0.15s ease, border-color 0.2s ease; ${estiloDia}" onclick="window.abrirDetalhesDiaCalendario('${dataAtualStr}')">
                <span style="font-size:13px; font-weight:700;">${dia}</span>
                <div style="display:flex; gap:3px; margin-top:3px; min-height:6px; align-items:center;">${bolinhas}</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
};

// =========================================================================
// 3. DETALHES DO DIA SELECIONADO & AÇÕES RÁPIDAS
// =========================================================================

window.abrirDetalhesDiaCalendario = function(dataIso) {
    const contas = window.contasCalendarioAtual.filter(c => c.data_vencimento === dataIso);
    const eventos = window.eventosCalendarioAtual.filter(e => e.data_evento === dataIso);

    const titulo = document.getElementById('detalhes-dia-calendario-titulo');
    const container = document.getElementById('conteudo-itens-dia-calendario');
    if (!titulo || !container) return;

    titulo.textContent = `Compromissos de ${dataIso.split('-').reverse().join('/')}`;
    container.innerHTML = '';

    const usuarioConectadoId = obterUsuarioId();

    if (contas.length === 0 && eventos.length === 0) {
        container.innerHTML = '<p class="status-texto" style="text-align:center; padding:16px 0; color:var(--texto-suave);">Nada agendado para este dia.</p>';
    } else {
        eventos.forEach(e => {
            const ehMeuEvento = (e.criado_por === usuarioConectadoId);
            const ehPrivado = (e.escopo === 'pessoal' || e.eh_privado === true);

            let tituloEvento = window.esc ? window.esc(e.titulo) : e.titulo;
            let descricaoEvento = e.descricao ? (window.esc ? window.esc(e.descricao) : e.descricao) : '';

            if (ehPrivado && !ehMeuEvento) {
                tituloEvento = "Compromisso Particular";
                descricaoEvento = "Horário reservado / Privativo";
            }

            const hora = (e.horario_inicio || e.horario_fim)
                ? `${e.horario_inicio ? e.horario_inicio.slice(0, 5) : ''} ${e.horario_fim ? 'até ' + e.horario_fim.slice(0, 5) : ''}`
                : 'Dia Inteiro';
            const cor = e.cor_etiqueta || '#0284c7';

            container.innerHTML += `
                <div class="cartao-geral" style="border-left:4px solid ${cor}; padding:12px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; border-radius:14px; border:1px solid rgba(226,232,240,0.85); box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                    <div>
                        <strong style="display:block; font-size:13.5px; font-weight:800; color:var(--texto-principal, #0f172a);">${tituloEvento}</strong>
                        ${descricaoEvento ? `<span style="font-size:11.5px; color:var(--texto-suave, #64748b); display:block; margin:2px 0;">${descricaoEvento}</span>` : ''}
                        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                            <span style="font-size:10px; font-weight:800; background:#f0f9ff; padding:2px 7px; border-radius:6px; color:${cor}; border:1px solid rgba(2,132,199,0.2);">Horário: ${hora}</span>
                            ${ehPrivado ? `<span style="font-size:10.5px; color:var(--texto-suave); font-weight:600;">(Particular)</span>` : ''}
                        </div>
                    </div>
                    ${(ehMeuEvento || window.perfilAtual?.papel === 'adm') ? `
                        <button class="btn-erro" style="padding:6px 10px; font-size:11px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.excluirEventoCalendario('${e.id}')" title="Excluir">
                            <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
                        </button>
                    ` : ''}
                </div>
            `;
        });

        contas.forEach(c => {
            const ehMinhaConta = (c.criado_por === usuarioConectadoId || c.membro_id === usuarioConectadoId);
            const ehPrivada = (c.escopo === 'pessoal' || c.eh_privado === true);
            const jaLiquidado = (c.status === 'liquidado' || c.pago === true);

            let descConta = window.esc ? window.esc(c.descricao) : c.descricao;
            if (ehPrivada && !ehMinhaConta) {
                descConta = (c.tipo_evento === 'conta_pagar') ? "Conta Pessoal" : "Recebimento Particular";
            }

            const ehPagamento = c.tipo_evento === 'conta_pagar';
            const cor = jaLiquidado ? '#94a3b8' : (ehPagamento ? 'var(--cor-erro, #ef4444)' : 'var(--cor-sucesso, #10b981)');
            const label = ehPagamento ? 'A Pagar' : 'A Receber';
            const iconeDot = `<span style="width:8px; height:8px; border-radius:50%; background:${cor}; display:inline-block; margin-right:5px;"></span>`;

            const btnBaixa = !jaLiquidado ? `
                <button type="button" id="btn-baixa-cal-${c.id}" class="${ehPagamento ? 'btn-secundario' : 'btn-sucesso'}" 
                        style="padding:6px 10px; font-size:11.5px; font-weight:800; border-radius:10px; display:inline-flex; align-items:center; gap:5px; ${ehPagamento ? 'border:1px solid #ef4444; color:#ef4444; background:#fff1f2;' : ''}" 
                        onclick="window.marcarItemAgendaComoLiquidado('${c.id}', '${c.tipo_evento}', ${c.valor}, '${encodeURIComponent(c.descricao || '').replace(/'/g,'%27')}', '${c.escopo || 'casa'}')">
                    <img src="assets/icons-modern/icone-check.svg" alt="Check" style="width:13px; height:13px; object-fit:contain;">
                    ${ehPagamento ? 'Já Pago' : 'Já Recebido'}
                </button>
            ` : `
                <span style="font-size:11px; font-weight:800; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:4px 9px; border-radius:8px; display:inline-flex; align-items:center; gap:4px;">
                    <img src="assets/icons-modern/icone-check.svg" alt="Baixado" style="width:12px; height:12px; object-fit:contain;"> Baixado
                </span>
            `;

            container.innerHTML += `
                <div id="linha-conta-cal-${c.id}" class="cartao-geral" style="border-left:4px solid ${cor}; padding:12px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; border-radius:14px; border:1px solid rgba(226,232,240,0.85); box-shadow:0 1px 3px rgba(15,23,42,0.02); ${jaLiquidado ? 'opacity:0.75; background:#f8fafc;' : ''}">
                    <div>
                        <strong style="display:flex; align-items:center; font-size:13.5px; font-weight:800; color:var(--texto-principal, #0f172a); ${jaLiquidado ? 'text-decoration:line-through; opacity:0.6;' : ''}">
                            ${iconeDot} ${descConta}
                        </strong>
                        <span style="font-size:11px; font-weight:800; background:rgba(0,0,0,0.04); padding:3px 8px; border-radius:6px; color:${cor}; margin-top:4px; display:inline-block; font-variant-numeric:tabular-nums;">
                            ${jaLiquidado ? 'Liquidado' : label}: R$ ${Number(c.valor || 0).toFixed(2)}
                        </span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        ${btnBaixa}
                        ${(ehMinhaConta || window.perfilAtual?.papel === 'adm') ? `
                            <button class="btn-erro" style="padding:6px 10px; font-size:11px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;" onclick="window.excluirContaRecorrenteAgenda('${c.id}', ${c.eh_perpetua})" title="Excluir">
                                <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('modal-detalhes-dia-calendario')?.classList.remove('oculto');
};

window.fecharModalDetalhesDiaCalendario = function() {
    document.getElementById('modal-detalhes-dia-calendario')?.classList.add('oculto');
};

// =========================================================================
// 3B. QUADRO DE NOTIFICAÇÕES GERAIS DO SINO FLUTUANTE
// =========================================================================

