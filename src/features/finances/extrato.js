/* Suiri Família 7.0 · domínio extraído de app-gestao.js. */
window.obterEscopoPadraoFinancas = function() {
    const prefSalva = localStorage.getItem(CHAVE_PREF_ESCOPO_FINANCAS);
    return prefSalva ? prefSalva : 'casa';
};

window.salvarPreferenciaEscopoFinancas = function(novoEscopo) {
    if (novoEscopo === 'casa' || novoEscopo === 'pessoal') {
        localStorage.setItem(CHAVE_PREF_ESCOPO_FINANCAS, novoEscopo);
    }
};

window.aplicarPreferenciaEscopoFormulario = function() {
    const escopoPadrao = window.obterEscopoPadraoFinancas();
    const selEscopo = document.getElementById('select-fin-escopo');
    if (selEscopo) {
        selEscopo.value = escopoPadrao;
        if (!selEscopo.dataset.ouvinteMemoria) {
            selEscopo.dataset.ouvinteMemoria = "true";
            selEscopo.addEventListener('change', function() {
                window.salvarPreferenciaEscopoFinancas(this.value);
            });
        }
    }
    
    const radioCasa = document.getElementById('radio-escopo-casa');
    const radioPessoal = document.getElementById('radio-escopo-pessoal');
    if (radioCasa && radioPessoal) {
        if (escopoPadrao === 'pessoal') {
            radioPessoal.checked = true;
        } else {
            radioCasa.checked = true;
        }
        if (!radioCasa.dataset.ouvinteMemoria) {
            radioCasa.dataset.ouvinteMemoria = "true";
            radioCasa.addEventListener('change', () => window.salvarPreferenciaEscopoFinancas('casa'));
        }
        if (!radioPessoal.dataset.ouvinteMemoria) {
            radioPessoal.dataset.ouvinteMemoria = "true";
            radioPessoal.addEventListener('change', () => window.salvarPreferenciaEscopoFinancas('pessoal'));
        }
    }
};

window.identificarSegmentoItem = function(nomeItem) {
    if (!nomeItem) return 'Mercearia';
    const termo = nomeItem.toLowerCase();
    for (const [segmento, palavras] of Object.entries(DICIONARIO_SEGMENTOS_MERCADO)) {
        if (palavras.some(p => termo.includes(p))) {
            return segmento;
        }
    }
    return 'Mercearia';
};

// =========================================================================
// 1. CHECAGEM DE EXTRATO NOMINAL COM PRIVACIDADE E BUSCA INSTANTÂNEA
// =========================================================================

window.garantirBarraBuscaExtrato = function() {
    const containerLista = document.getElementById('lista-extrato-carteira');
    if (!containerLista || document.getElementById('barra-busca-rapida-extrato')) return;

    const barra = document.createElement('div');
    barra.id = 'barra-busca-rapida-extrato';
    barra.style.cssText = 'display:flex; gap:8px; margin-bottom:12px; align-items:center;';
    barra.innerHTML = `
        <input type="text" id="input-busca-texto-extrato" placeholder="Buscar no extrato (ex: mercado, luz, nome...)" 
               style="flex:1; padding:9px 12px; font-size:12.5px; border-radius:12px; border:1px solid #cbd5e1; background:#ffffff;" 
               oninput="window.filtrarListaExtratoMemoria()">
        <select id="select-busca-categoria-extrato" style="width:135px; padding:9px 28px 9px 10px; font-size:12px; border-radius:12px; border:1px solid #cbd5e1; background-color:#ffffff;" onchange="window.filtrarListaExtratoMemoria()">
            <option value="todas">Categorias</option>
            <option value="Supermercado">Supermercado</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Moradia">Moradia</option>
            <option value="Transporte">Transporte</option>
            <option value="Saúde">Saúde</option>
            <option value="Lazer">Lazer</option>
            <option value="Educação">Educação</option>
            <option value="Salário">Salário</option>
            <option value="Transferência">Transferência</option>
            <option value="Geral">Geral</option>
        </select>
    `;
    containerLista.parentNode.insertBefore(barra, containerLista);
};

window.carregarExtratoPeriodo = async function() {
    const container = document.getElementById('lista-extrato-carteira');
    const cli = obterClienteSupabase();
    if (!container || !window.familiaAtualId || !cli) return;

    window.garantirBarraBuscaExtrato();
    window.aplicarPreferenciaEscopoFormulario();

    let dtInicio = document.getElementById('extrato-filtro-inicio')?.value;
    let dtFim = document.getElementById('extrato-filtro-fim')?.value;

    const hoje = new Date();
    if (!dtInicio) {
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dtInicio = Suiri.today(primeiroDia);
        const elIn = document.getElementById('extrato-filtro-inicio');
        if (elIn) elIn.value = dtInicio;
    }
    if (!dtFim) {
        dtFim = Suiri.today(hoje);
        const elFim = document.getElementById('extrato-filtro-fim');
        if (elFim) elFim.value = dtFim;
    }

    container.innerHTML = '<span class="status-texto" style="font-size:12px; text-align:center; display:block; padding:12px 0;">Carregando extrato...</span>';

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome, papel')
            .eq('familia_id', window.familiaAtualId);
        window.listaMembrosFamilia = membros || [];
    }

    let { data: transacoes, error } = await Suiri.transactionQuery().select('*')
        .eq('familia_id', window.familiaAtualId)
        .gte('data_transacao', dtInicio)
        .lte('data_transacao', dtFim)
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false });

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        const resFallback = await cli.from('transacoes_financeiras')
            .select('*')
            .eq('familia_id', window.familiaAtualId)
            .gte('data_transacao', dtInicio)
            .lte('data_transacao', dtFim)
            .order('data_transacao', { ascending: false });
        transacoes = resFallback.data;
        error = resFallback.error;
    }

    if(error){container.textContent="Não foi possível carregar o extrato. "+error.message;return;}
    window.cacheTransacoesExtrato = transacoes || [];
    window.filtrarListaExtratoMemoria();
};

window.filtrarListaExtratoMemoria = function() {
    const container = document.getElementById('lista-extrato-carteira');
    if (!container) return;

    const termoBusca = (document.getElementById('input-busca-texto-extrato')?.value || '').toLowerCase().trim();
    const catFiltro = document.getElementById('select-busca-categoria-extrato')?.value || 'todas';
    const usuarioConectadoId = obterUsuarioId();

    const listaFiltrada = (window.cacheTransacoesExtrato || []).filter(t => {
        const ehMeuLancamento = (t.membro_id === usuarioConectadoId);
        const ehPrivativo = (t.escopo === 'pessoal' || t.eh_privado === true);
        const ehEntrada = t.tipo === 'entrada' || (t.valor > 0 && t.tipo !== 'saida');

        let descVisivel = t.descricao || 'Sem descrição';
        let catVisivel = t.categoria || 'Geral';
        if (ehPrivativo && !ehMeuLancamento) {
            descVisivel = ehEntrada ? 'Entrada Privada' : 'Gasto Privado';
            catVisivel = 'Privativo';
        }

        if (catFiltro !== 'todas' && catVisivel !== catFiltro) {
            return false;
        }

        if (termoBusca) {
            let nomeMembro = 'familiar';
            if (window.listaMembrosFamilia) {
                const m = window.listaMembrosFamilia.find(x => x.id === t.membro_id);
                if (m && m.nome) nomeMembro = m.nome.toLowerCase();
            }
            const textoCombinado = `${descVisivel} ${catVisivel} ${esc(nomeMembro)} ${t.valor || ''}`.toLowerCase();
            if (!textoCombinado.includes(termoBusca)) return false;
        }

        return true;
    });

    container.innerHTML = '';

    if (listaFiltrada.length === 0) {
        container.innerHTML = '<span class="status-texto" style="font-size:12px; text-align:center; display:block; padding:16px 0;">Nenhuma movimentação encontrada para este filtro.</span>';
        return;
    }

    listaFiltrada.forEach(t => {
        const item = document.createElement('div');
        item.className = 'cartao-geral';
        item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:11px 15px; margin-bottom:8px; border-radius:14px; border:1px solid rgba(226, 232, 240, 0.85); box-shadow:0 1px 3px rgba(15,23,42,0.02); transition:transform 0.15s ease;';

        const ehEntrada = t.tipo === 'entrada' || (t.valor > 0 && t.tipo !== 'saida');
        const cor = ehEntrada ? 'var(--cor-sucesso, #10b981)' : 'var(--cor-erro, #f43f5e)';
        const sinal = ehEntrada ? '+' : '-';
        const dataFmt = t.data_transacao ? t.data_transacao.split('-').reverse().slice(0, 2).join('/') : '--/--';
        const tCodificado = encodeURIComponent(JSON.stringify(t)).replace(/'/g, "%27");

        let nomeResponsavel = 'Familiar';
        if (window.listaMembrosFamilia) {
            const membro = window.listaMembrosFamilia.find(m => m.id === t.membro_id);
            if (membro && membro.nome) {
                nomeResponsavel = membro.nome.split(' ')[0];
            } else if (t.membro_id === usuarioConectadoId && window.perfilAtual?.nome) {
                nomeResponsavel = window.perfilAtual.nome.split(' ')[0];
            }
        }

        const ehMeuLancamento = (t.membro_id === usuarioConectadoId);
        const ehPrivativo = (t.escopo === 'pessoal' || t.eh_privado === true);

        let descricaoVisivel = t.descricao || 'Sem descrição';
        let categoriaVisivel = t.categoria || 'Geral';

        if (ehPrivativo && !ehMeuLancamento) {
            descricaoVisivel = ehEntrada ? 'Entrada Privada' : 'Gasto Privado';
            categoriaVisivel = 'Privativo';
        }

        const verboTipo = ehEntrada ? 'recebeu' : 'gastou';
        const linhaNominalDestaque = `${esc(nomeResponsavel)} ${verboTipo} ${categoriaVisivel.toLowerCase()} R$ ${Number(t.valor || 0).toFixed(2)}`;
        const marcadorDot = `<span style="width:8px; height:8px; border-radius:50%; background:${cor}; display:inline-block; margin-right:7px; flex-shrink:0;"></span>`;

        const tagEscopoSvg = ehPrivativo
            ? `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; color:var(--texto-suave);"><img src="assets/icons-modern/icone-pessoa-escopo.svg" alt="Pessoal" style="width:13px; height:13px; object-fit:contain;"> Pessoal</span>`
            : `<span style="display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; color:var(--texto-suave);"><img src="assets/icons-modern/icone-casa-escopo.svg" alt="Casa" style="width:13px; height:13px; object-fit:contain;"> Casa</span>`;

        const descSegura = window.esc ? window.esc(descricaoVisivel) : descricaoVisivel;

        const botoesAcaoHtml = ehMeuLancamento ? `
            <button type="button" class="btn-secundario" style="padding:6px 9px; font-size:11px; border-radius:9px; display:inline-flex; align-items:center;" onclick="window.abrirModalEditarTransacao('${tCodificado}')" title="Editar">
                <img src="assets/icons-modern/icone-editar.svg" alt="Editar" style="width:13px; height:13px; object-fit:contain;">
            </button>
            <button type="button" class="btn-erro" style="padding:6px 9px; font-size:11px; border-radius:9px; display:inline-flex; align-items:center;" onclick="window.excluirTransacaoCarteira('${t.id}')" title="Excluir">
                <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:13px; height:13px; object-fit:contain;">
            </button>
        ` : `
            <span style="font-size:10.5px; color:var(--texto-suave, #94a3b8); font-style:italic; padding:0 4px;">Leitura</span>
        `;

        item.innerHTML = `
            <div style="flex:1; min-width:0; padding-right:8px;">
                <div style="font-size:13.5px; font-weight:800; color:var(--texto-principal, #0f172a); display:flex; align-items:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${marcadorDot}
                    <span style="overflow:hidden; text-overflow:ellipsis; font-variant-numeric:tabular-nums;">${esc(linhaNominalDestaque)}</span>
                </div>
                <div style="font-size:11.5px; color:var(--texto-suave, #64748b); margin-top:2px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span style="font-variant-numeric:tabular-nums;">${dataFmt}</span>
                    <span>•</span>
                    <span>Ref: <em>${descSegura}</em></span>
                    <span>•</span>
                    ${tagEscopoSvg}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                <strong style="color:${cor}; font-size:13.5px; white-space:nowrap; font-variant-numeric:tabular-nums;">${sinal} R$ ${Number(t.valor || 0).toFixed(2)}</strong>
                ${botoesAcaoHtml}
            </div>
        `;
        container.appendChild(item);
    });
};

window.abrirModalEditarTransacao = function(tJson) {
    const t = typeof tJson === 'string' ? JSON.parse(decodeURIComponent(tJson)) : tJson;
    if (!t) return;

    const usuarioConectadoId = obterUsuarioId();
    if (t.membro_id && t.membro_id !== usuarioConectadoId) {
        return window.mostrarToast ? window.mostrarToast("Acesso restrito: você não pode alterar o lançamento de outro familiar.", "erro") : alert("Acesso negado.");
    }

    const elId = document.getElementById('edit-transacao-id');
    const elDesc = document.getElementById('edit-transacao-descricao');
    const elVal = document.getElementById('edit-transacao-valor');
    const elTipo = document.getElementById('edit-transacao-tipo');
    const elEscopo = document.getElementById('edit-transacao-escopo');
    const elCat = document.getElementById('edit-transacao-categoria');
    const elData = document.getElementById('edit-transacao-data');

    if (elId) elId.value = t.id || '';
    if (elDesc) elDesc.value = t.descricao || '';
    if (elVal) elVal.value = t.valor || '';
    if (elTipo) elTipo.value = t.tipo || 'saida';
    if (elEscopo) elEscopo.value = t.escopo || 'pessoal';
    if (elCat) elCat.value = t.categoria || 'Geral';
    if (elData) elData.value = t.data_transacao || '';

    document.getElementById('modal-editar-transacao')?.classList.remove('oculto');
};

window.fecharModalEditarTransacao = function() {
    document.getElementById('modal-editar-transacao')?.classList.add('oculto');
};

window.salvarEdicaoTransacao = async function() {
    const id = document.getElementById('edit-transacao-id')?.value;
    const descricao = document.getElementById('edit-transacao-descricao')?.value.trim();
    const valor = parseFloat(document.getElementById('edit-transacao-valor')?.value);
    const tipo = document.getElementById('edit-transacao-tipo')?.value || 'saida';
    const escopo = document.getElementById('edit-transacao-escopo')?.value || 'pessoal';
    const categoria = document.getElementById('edit-transacao-categoria')?.value || 'Geral';
    const data_transacao = document.getElementById('edit-transacao-data')?.value;
    const cli = obterClienteSupabase();
    const usuarioConectadoId = obterUsuarioId();

    if (!descricao || isNaN(valor) || valor <= 0) {
        return window.mostrarToast("Informe descrição e valor válidos.", "erro");
    }
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const transacaoOriginal = window.cacheTransacoesExtrato?.find(t => t.id === id);
    if (transacaoOriginal && transacaoOriginal.membro_id !== usuarioConectadoId) {
        return window.mostrarToast("Acesso restrito: você só pode alterar os seus próprios lançamentos.", "erro");
    }

    const payload = {
        descricao: descricao,
        valor: valor,
        tipo: tipo,
        escopo: escopo,
        eh_privado: (escopo === 'pessoal'),
        categoria: categoria,
        data_transacao: data_transacao
    };

    let query = cli.from('transacoes').update(payload).eq('id', id);
    if (usuarioConectadoId) query = query.eq('membro_id', usuarioConectadoId);
    let { error } = await query;

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        let queryFallback = cli.from('transacoes_financeiras').update(payload).eq('id', id);
        if (usuarioConectadoId) queryFallback = queryFallback.eq('membro_id', usuarioConectadoId);
        const res = await queryFallback;
        error = res.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao salvar: " + error.message, "erro");
    }

    window.fecharModalEditarTransacao();
    window.mostrarToast("Lançamento confirmado e atualizado!");
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

window.excluirTransacaoCarteira = async function(id) {
    const usuarioConectadoId = obterUsuarioId();
    const transacaoAlvo = window.cacheTransacoesExtrato?.find(t => t.id === id);

    if (transacaoAlvo && transacaoAlvo.membro_id !== usuarioConectadoId) {
        return window.mostrarToast ? window.mostrarToast("Ação não permitida: você só pode excluir suas próprias transações.", "erro") : alert("Acesso negado.");
    }

    const confirmou = window.confirmarAcaoSuiri
        ? await window.confirmarAcaoSuiri("Deseja realmente remover este lançamento da sua carteira?", "Confirmar Exclusão")
        : confirm("Deseja realmente remover este lançamento da sua carteira?");

    if (!confirmou) return;
    const cli = obterClienteSupabase();
    if (!cli) return;

    let query = cli.from('transacoes').delete().eq('id', id);
    if (usuarioConectadoId) query = query.eq('membro_id', usuarioConectadoId);
    let { error } = await query;

    if (error && error.message && error.message.includes('relation "public.transacoes" does not exist')) {
        let queryFallback = cli.from('transacoes_financeiras').delete().eq('id', id);
        if (usuarioConectadoId) queryFallback = queryFallback.eq('membro_id', usuarioConectadoId);
        const res = await queryFallback;
        error = res.error;
    }

    if (error) {
        return window.mostrarToast("Erro ao excluir: " + error.message, "erro");
    }

    window.mostrarToast("Lançamento removido com sucesso!");
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

window.abrirModalCorrecaoCarteira = function() {
    document.getElementById('modal-correcao-carteira')?.classList.remove('oculto');
};

window.fecharModalCorrecaoCarteira = function() {
    document.getElementById('modal-correcao-carteira')?.classList.add('oculto');
};

window.salvarAjusteCarteira = async function() {
    const inputReal = document.getElementById('input-saldo-real-banco');
    const saldoBanco = parseFloat(inputReal?.value);
    const cli = obterClienteSupabase();
    if (isNaN(saldoBanco)) return window.mostrarToast("Digite um valor válido.", "erro");
    if (!cli) return window.mostrarToast("Erro de conexão.", "erro");

    const saldoSistema = window.saldoCarteiraNumerico;
    if(!Number.isFinite(saldoSistema))return window.mostrarToast('Aguarde o carregamento do saldo antes de ajustar.', 'erro');
    const diferenca = saldoBanco - saldoSistema;

    if (diferenca === 0) return window.mostrarToast("O saldo já se encontra alinhado!", "info");

    const tipoAj = diferenca > 0 ? 'entrada' : 'saida';
    const valorAj = Math.abs(diferenca);

    const ajusteResultado=await cli.from('transacoes').insert([{
        familia_id: window.familiaAtualId,
        membro_id: obterUsuarioId(),
        tipo: tipoAj,
        escopo: 'pessoal',
        eh_privado: true,
        descricao: 'Ajuste de Conciliação Bancária',
        categoria: 'Geral',
        valor: valorAj,
        data_transacao: Suiri.today()
    }]);

    if(ajusteResultado.error)return window.mostrarToast("Ajuste não salvo: "+ajusteResultado.error.message,"erro");
    window.mostrarToast("Saldo retificado e confirmado com sucesso!");
    if (inputReal) inputReal.value = '';
    window.fecharModalCorrecaoCarteira();
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
    if (typeof window.renderizarGraficoBarrasMesAnterior === 'function') await window.renderizarGraficoBarrasMesAnterior();
    window.carregarExtratoPeriodo();
};

// =========================================================================
// 1B. TRANSFERÊNCIA DE SALDO ENTRE CARTEIRAS DA FAMÍLIA
// =========================================================================

(function () {
    let busy = false;
    function updateTransferUI() {
        const pending = Suiri.transfer.pending();
        const destination = document.getElementById('transferencia-destinatario-id');
        const amount = document.getElementById('transferencia-valor');
        const button = document.getElementById('transferencia-confirmar');
        const status = document.getElementById('transferencia-status');
        if (pending) {
            if (destination && ![...destination.options].some(option => option.value === pending.destination)) {
                const option = document.createElement('option');option.value = pending.destination;option.textContent = 'Destinatário da transferência pendente';destination.append(option);
            }
            if (destination) destination.value = pending.destination;
            if (amount) amount.value = pending.amount;
        }
        if (destination) destination.disabled = busy || !!pending;
        if (amount) amount.disabled = busy || !!pending;
        if (button) { button.disabled = busy;button.textContent = busy ? 'Verificando...' : pending ? 'Consultar novamente' : 'Confirmar'; }
        if (status) status.textContent = pending ? 'Há uma transferência aguardando confirmação. Consulte a mesma operação antes de iniciar outra.' : '';
    }
    window.abrirModalTransferirSaldo = async function () {
        const modal = document.getElementById('modal-transferir-saldo');
        const select = document.getElementById('transferencia-destinatario-id');
        const input = document.getElementById('transferencia-valor');
        const cli = obterClienteSupabase();
        const sender = obterUsuarioId();
        if (!modal || busy) return;
        try {
            // Confere a conta antes de abrir e recupera eventuais pendências.
            Suiri.transfer.pending();
            if (input) input.value = '';
            let members = window.listaMembrosFamilia || [];
            if (!members.length && cli && window.familiaAtualId) {
                const result = await cli.from('membros').select('id,nome,parentesco').eq('familia_id',window.familiaAtualId);
                members = Suiri.check(result) || [];
            }
            if (sender !== obterUsuarioId()) return;
            if (select) {
                select.replaceChildren();
                const placeholder = document.createElement('option');placeholder.value = '';placeholder.textContent = 'Selecione o familiar...';select.append(placeholder);
                for (const member of members.filter(member => member.id !== sender)) {
                    const option = document.createElement('option');option.value = member.id;
                    option.textContent = member.nome + (member.parentesco ? ` (${member.parentesco})` : '');select.append(option);
                }
                if (select.options.length === 1) placeholder.textContent = 'Nenhum outro familiar cadastrado';
            }
            updateTransferUI();Suiri.openModal('modal-transferir-saldo');
        } catch (error) { Suiri.notifyError(error); }
    };
    window.fecharModalTransferirSaldo = function () { Suiri.closeModal('modal-transferir-saldo'); };
    window.confirmarTransferenciaSaldo = async function () {
        const modal = document.getElementById('modal-transferir-saldo');
        if (busy || !modal || modal.classList.contains('oculto')) return;
        const sender = obterUsuarioId(), user = window.usuarioAtual?.id, family = window.familiaAtualId;
        const destination = document.getElementById('transferencia-destinatario-id')?.value;
        const value = document.getElementById('transferencia-valor')?.value;
        let result;
        busy = true;
        try {
            updateTransferUI();
            result = await Suiri.transfer.submit(destination,value);
        } catch (error) {
            if (window.usuarioAtual?.id === user && obterUsuarioId() === sender && window.familiaAtualId === family) Suiri.notifyError(error);
        } finally {
            busy = false;
            if (window.usuarioAtual?.id === user && obterUsuarioId() === sender && window.familiaAtualId === family) {
                try { updateTransferUI(); } catch (error) { Suiri.notifyError(error); }
            }
        }
        if (!result || window.usuarioAtual?.id !== user || obterUsuarioId() !== sender || window.familiaAtualId !== family) return;
        window.mostrarToast(result.repetida ? 'Transferência já confirmada. Nenhum novo débito foi realizado.' : 'Transferência confirmada.');
        window.fecharModalTransferirSaldo();
        const refresh = await Promise.allSettled([
            Promise.resolve().then(() => window.carregarCarteiraIndividual?.()),
            Promise.resolve().then(() => window.renderizarGraficoBarrasMesAnterior?.()),
            Promise.resolve().then(() => window.carregarExtratoPeriodo?.())
        ]);
        if (window.usuarioAtual?.id === user && refresh.some(item => item.status === 'rejected')) {
            window.mostrarToast('Transferência confirmada. Atualize a página para recarregar o extrato.','info');
        }
    };
})();

// =========================================================================
// 2. MÓDULO DE MERCADO COM HISTÓRICO, IA POR VOZ & VISÃO COMPUTACIONAL
// =========================================================================

