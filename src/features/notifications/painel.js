/* Suiri Família 7.0 · domínio extraído de app-painel.js. */
window.abrirModalNotificacoesGerais = async function() {
    if (await window.atualizarNotificacoesGeraisPainel() === false) {
        window.mostrarToast("Não foi possível atualizar o quadro de notificações.", "erro");
    }
    document.getElementById('modal-notificacoes-gerais')?.classList.remove('oculto');
};

window.fecharModalNotificacoesGerais = function() {
    document.getElementById('modal-notificacoes-gerais')?.classList.add('oculto');
};

window.atualizarNotificacoesGeraisPainel = async function() {
    const cli = obterClienteSupabase();
    if (!window.familiaAtualId || !cli) return;

    const hoje = new Date();
    const hojeStr = Suiri.today(hoje);

    const limite7Dias = new Date(hoje);
    limite7Dias.setDate(limite7Dias.getDate() + 7);
    const limite7DiasStr = Suiri.today(limite7Dias);
    const familia = window.familiaAtualId;

    const [{ data: contas, error: erroContas }, { data: eventos, error: erroEventos }] = await Promise.all([
        cli.from('agenda_financeira').select('*').eq('familia_id', familia)
            .gte('data_vencimento', hojeStr).lte('data_vencimento', limite7DiasStr)
            .order('data_vencimento', { ascending: true }),
        cli.from('compromissos_familia').select('*').eq('familia_id', familia)
            .gte('data_evento', hojeStr).lte('data_evento', limite7DiasStr)
            .order('data_evento', { ascending: true })
    ]);
    if (familia !== window.familiaAtualId || erroContas || erroEventos) return false;

    const listaContas = contas || [];
    const listaEventos = eventos || [];

    listaContas.forEach(c => {
        const itemLocal = window.contasCalendarioAtual?.find(x => x.id === c.id);
        if (itemLocal && (itemLocal.status === 'liquidado' || itemLocal.pago === true)) {
            c.status = 'liquidado';
            c.pago = true;
        }
    });

    const contasHoje = listaContas.filter(c => c.data_vencimento === hojeStr);
    const eventosHoje = listaEventos.filter(e => e.data_evento === hojeStr);

    const contasSemana = listaContas.filter(c => c.data_vencimento > hojeStr);
    const eventosSemana = listaEventos.filter(e => e.data_evento > hojeStr);

    const pendenciasHoje = contasHoje.filter(c => c.status !== 'liquidado' && c.pago !== true);
    const totalBadge = pendenciasHoje.length + eventosHoje.length;
    if (totalBadge > 0) await window.exibirLembreteAgenda(familia, hojeStr);

    const btnSinoFlutuante = document.getElementById('btn-sino-notificacoes-topo');
    if (btnSinoFlutuante) {
        if (totalBadge > 0) {
            btnSinoFlutuante.classList.add('tem-pendencias');
            btnSinoFlutuante.title = `Quadro de Notificações (${totalBadge} pendência${totalBadge > 1 ? 's' : ''} hoje)`;
        } else {
            btnSinoFlutuante.classList.remove('tem-pendencias');
            btnSinoFlutuante.title = 'Quadro de Notificações (Tudo em dia)';
        }
    }

    const lblHojeCont = document.getElementById('contador-notif-hoje');
    if (lblHojeCont) lblHojeCont.textContent = `${totalBadge} item(ns)`;

    const lblSemanaCont = document.getElementById('contador-notif-semana');
    if (lblSemanaCont) lblSemanaCont.textContent = `${contasSemana.length + eventosSemana.length} item(ns)`;

    const containerHoje = document.getElementById('lista-notificacoes-hoje');
    if (containerHoje) {
        containerHoje.innerHTML = '';
        if (contasHoje.length === 0 && eventosHoje.length === 0) {
            containerHoje.innerHTML = '<span style="font-size:12px; color:var(--texto-suave); text-align:center; display:block; padding:12px;">Nada agendado para o dia de hoje.</span>';
        } else {
            eventosHoje.forEach(ev => {
                containerHoje.innerHTML += `
                    <div style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-left:4px solid ${/^#[0-9a-f]{6}$/i.test(ev.cor_etiqueta) ? ev.cor_etiqueta : '#0ea5e9'}; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                        <div>
                            <strong style="font-size:13px; font-weight:800; color:#0f172a; display:block;">${window.esc ? window.esc(ev.titulo) : ev.titulo}</strong>
                            <span style="font-size:11px; color:#64748b;">${ev.horario_inicio ? 'Horário: ' + ev.horario_inicio.slice(0, 5) : 'Dia todo'}</span>
                        </div>
                        <span style="font-size:10.5px; font-weight:800; background:#e0f2fe; color:#0369a1; padding:3px 7px; border-radius:6px; border:1px solid rgba(2,132,199,0.2);">Compromisso</span>
                    </div>
                `;
            });

            contasHoje.forEach(c => {
                const jaPago = (c.status === 'liquidado' || c.pago === true);
                const ehPagar = c.tipo_evento === 'conta_pagar';
                const cor = jaPago ? '#94a3b8' : (ehPagar ? '#ef4444' : '#10b981');

                const btnAcao = !jaPago ? `
                    <button type="button" id="btn-baixa-notif-${c.id}" class="${ehPagar ? 'btn-secundario' : 'btn-sucesso'}" 
                            style="padding:5px 9px; font-size:11px; font-weight:800; border-radius:9px; display:inline-flex; align-items:center; gap:4px; ${ehPagar ? 'border:1px solid #ef4444; color:#ef4444; background:#fff1f2;' : ''}" 
                            onclick="window.marcarItemAgendaComoLiquidado('${c.id}', '${c.tipo_evento}', ${c.valor}, '${encodeURIComponent(c.descricao || '').replace(/'/g,'%27')}', '${c.escopo || 'casa'}')">
                        <img src="assets/icons-modern/icone-check.svg" alt="Check" style="width:12px; height:12px; object-fit:contain;">
                        ${ehPagar ? 'Já Pago' : 'Já Recebido'}
                    </button>
                ` : `
                    <span style="font-size:10.5px; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:3px;">
                        <img src="assets/icons-modern/icone-check.svg" alt="Baixado" style="width:11px; height:11px; object-fit:contain;"> Baixado
                    </span>
                `;

                containerHoje.innerHTML += `
                    <div id="linha-notif-hoje-${c.id}" style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-left:4px solid ${cor}; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(15,23,42,0.02); ${jaPago ? 'opacity:0.7;' : ''}">
                        <div>
                            <strong style="font-size:13px; font-weight:800; color:#0f172a; display:block; ${jaPago ? 'text-decoration:line-through; opacity:0.6;' : ''}">${window.esc ? window.esc(c.descricao) : c.descricao}</strong>
                            <span style="font-size:11.5px; font-weight:800; color:${cor}; font-variant-numeric:tabular-nums;">R$ ${Number(c.valor || 0).toFixed(2)} • ${ehPagar ? 'A Pagar' : 'A Receber'}</span>
                        </div>
                        <div>${btnAcao}</div>
                    </div>
                `;
            });
        }
    }

    const containerSemana = document.getElementById('lista-notificacoes-proximos-dias');
    if (containerSemana) {
        containerSemana.innerHTML = '';
        if (contasSemana.length === 0 && eventosSemana.length === 0) {
            containerSemana.innerHTML = '<span style="font-size:12px; color:var(--texto-suave); text-align:center; display:block; padding:12px;">Nenhuma despesa ou evento nos próximos 7 dias.</span>';
        } else {
            const todosItens = [];
            eventosSemana.forEach(e => todosItens.push({ ...e, tipoItem: 'evento', dataBase: e.data_evento }));
            contasSemana.forEach(c => todosItens.push({ ...c, tipoItem: 'conta', dataBase: c.data_vencimento }));

            todosItens.sort((a, b) => a.dataBase.localeCompare(b.dataBase));

            todosItens.forEach(item => {
                const dataFmt = item.dataBase.split('-').reverse().slice(0, 2).join('/');
                if (item.tipoItem === 'evento') {
                    containerSemana.innerHTML += `
                        <div style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-radius:12px; padding:9px 12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(15,23,42,0.02);">
                            <div>
                                <span style="font-size:10px; font-weight:800; color:#0284c7; background:#e0f2fe; padding:2px 6px; border-radius:5px; border:1px solid rgba(2,132,199,0.2);">${dataFmt}</span>
                                <strong style="font-size:12.5px; font-weight:800; color:#0f172a; margin-left:6px;">${window.esc ? window.esc(item.titulo) : item.titulo}</strong>
                            </div>
                            <span style="font-size:11px; color:#64748b; font-weight:600;">${item.horario_inicio ? item.horario_inicio.slice(0, 5) : 'Agenda'}</span>
                        </div>
                    `;
                } else {
                    const ehPagar = item.tipo_evento === 'conta_pagar';
                    const jaPago = (item.status === 'liquidado' || item.pago === true);
                    const cor = ehPagar ? '#ef4444' : '#10b981';

                    containerSemana.innerHTML += `
                        <div id="linha-notif-semana-${item.id}" style="background:#ffffff; border:1px solid rgba(226,232,240,0.9); border-radius:12px; padding:9px 12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(15,23,42,0.02); ${jaPago ? 'opacity:0.65;' : ''}">
                            <div>
                                <span style="font-size:10px; font-weight:800; color:${cor}; background:${ehPagar ? '#fee2e2' : '#ecfdf5'}; padding:2px 6px; border-radius:5px; border:1px solid ${ehPagar ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'};">${dataFmt}</span>
                                <strong style="font-size:12.5px; font-weight:800; color:#0f172a; margin-left:6px; ${jaPago ? 'text-decoration:line-through; opacity:0.6;' : ''}">${window.esc ? window.esc(item.descricao) : item.descricao}</strong>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:11.5px; font-weight:800; color:${cor}; font-variant-numeric:tabular-nums;">R$ ${Number(item.valor || 0).toFixed(2)}</span>
                                ${!jaPago ? `
                                    <button type="button" id="btn-baixa-sem-${item.id}" class="btn-secundario" style="padding:4px 8px; font-size:10.5px; font-weight:800; border-radius:8px;" onclick="window.marcarItemAgendaComoLiquidado('${item.id}', '${item.tipo_evento}', ${item.valor}, '${encodeURIComponent(item.descricao || '').replace(/'/g,'%27')}', '${item.escopo || 'casa'}')">
                                        Baixar
                                    </button>
                                ` : `
                                    <span style="font-size:10px; font-weight:800; color:#065f46; background:#ecfdf5; padding:2px 6px; border-radius:6px;">Baixado</span>
                                `}
                            </div>
                        </div>
                    `;
                }
            });
        }
    }
};

// =========================================================================
// 3C. LIQUIDAÇÃO DE CONTAS COM PERSISTÊNCIA E BLOQUEIO PERMANENTE
// =========================================================================

// marcarItemAgendaComoLiquidado está em src/services/operations.js.

window.abrirModalNovoEventoCalendario = function() {
    const hojeStr = Suiri.today();
    const elData = document.getElementById('evento-data');
    if (elData) elData.value = hojeStr;
    document.getElementById('modal-novo-evento-calendario')?.classList.remove('oculto');
};

window.fecharModalNovoEventoCalendario = function() {
    document.getElementById('modal-novo-evento-calendario')?.classList.add('oculto');
};

window.salvarNovoEventoCalendario = async function() {
    const titulo = document.getElementById('evento-titulo')?.value.trim();
    const descricao = document.getElementById('evento-descricao')?.value.trim();
    const dataEvento = document.getElementById('evento-data')?.value;
    let hrInicio = document.getElementById('evento-hora-inicio')?.value;
    let hrFim = document.getElementById('evento-hora-fim')?.value;
    const escopo = document.getElementById('evento-escopo')?.value || 'casa';
    const corSelecionada = document.querySelector('input[name="evento-cor"]:checked')?.value || '#0284c7';

    if (!titulo || !dataEvento) return window.mostrarToast("Título e data são obrigatórios.", "erro");

    if (hrInicio && hrInicio.length === 5) hrInicio += ':00'; else hrInicio = null;
    if (hrFim && hrFim.length === 5) hrFim += ':00'; else hrFim = null;

    const cli = obterClienteSupabase();
    if (!cli) return window.mostrarToast("Erro de ligação.", "erro");

    const { error } = await cli.from('compromissos_familia').insert([{
        familia_id: window.familiaAtualId,
        criado_por: obterUsuarioId(),
        titulo: titulo,
        descricao: descricao,
        data_evento: dataEvento,
        horario_inicio: hrInicio,
        horario_fim: hrFim,
        cor_etiqueta: corSelecionada,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal')
    }]);

    if (error) return window.mostrarToast("Erro ao agendar compromisso: " + error.message, "erro");

    window.mostrarToast("Compromisso confirmado e agendado com sucesso!");
    const inTit = document.getElementById('evento-titulo');
    const inDesc = document.getElementById('evento-descricao');
    if (inTit) inTit.value = '';
    if (inDesc) inDesc.value = '';

    window.fecharModalNovoEventoCalendario();
    window.carregarDadosCalendarioMes();
};

window.excluirEventoCalendario = async function(id) {
    const confirmou = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente confirmar a exclusão deste compromisso?", "Confirmar Exclusão")
        : confirm("Deseja realmente confirmar a exclusão deste compromisso?");

    if (!confirmou) return;

    const cli = obterClienteSupabase();
    if (!cli) return;

    const { error } = await cli.from('compromissos_familia').delete().eq('id', id);
    if (error) {
        window.mostrarToast("Erro ao excluir: " + error.message, "erro");
    } else {
        window.mostrarToast("Compromisso removido com sucesso.");
        window.fecharModalDetalhesDiaCalendario();
        window.carregarDadosCalendarioMes();
    }
};

// =========================================================================
// 4. ESCUTA EM TEMPO REAL (REALTIME SUPABASE)
// =========================================================================


window.exibirLembreteAgenda = async function(familia, dia) {
    if (window.SuiriAndroid) {
        window.SuiriAndroid('reminder');
        return;
    }
    if (window.Notification?.permission !== 'granted' || !navigator.serviceWorker) return;
    try {
        const registro = await navigator.serviceWorker.getRegistration();
        if (!registro?.active || familia !== window.familiaAtualId) return;
        const chave = `suiri-agenda:${familia}:${obterUsuarioId()}`;
        if (localStorage.getItem(chave) === dia) return;
        localStorage.setItem(chave, dia);
        try {
            await registro.showNotification('Suiri Família', {
                body: 'Confira os lembretes de hoje no aplicativo.',
                icon: './assets/images/icone.jpg',
                tag: 'suiri-agenda',
                data: { url: './index.html' }
            });
        } catch (error) {
            localStorage.removeItem(chave);
            throw error;
        }
    } catch (error) {
        console.warn('Lembrete do dispositivo indisponível.', error);
    }
};
