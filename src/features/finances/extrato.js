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
    barra.className = 'fin-extrato-filtros';
    barra.innerHTML = `
        <input type="search" id="input-busca-texto-extrato" placeholder="Buscar no extrato" aria-label="Buscar por descrição, categoria ou nome"
            oninput="window.filtrarListaExtratoMemoria()">
        <select id="select-busca-categoria-extrato" aria-label="Categoria do extrato" onchange="window.filtrarListaExtratoMemoria()"></select>
    `;
    containerLista.parentNode.insertBefore(barra, containerLista);
};

let versaoExtratoNominal = 0;

window.carregarExtratoPeriodo = async function() {
    const container = document.getElementById('lista-extrato-carteira');
    const cli = obterClienteSupabase();
    if (!container || !window.familiaAtualId || !cli) return;

    const familia = window.familiaAtualId;
    const membro = obterUsuarioId();
    const pedido = ++versaoExtratoNominal;
    const aindaAtual = () => pedido === versaoExtratoNominal && familia === window.familiaAtualId && membro === obterUsuarioId();
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

    if (dtInicio > dtFim) {
        container.textContent = 'A data inicial deve ser anterior ou igual à final.';
        return;
    }
    container.textContent = 'Carregando extrato…';

    if (!window.listaMembrosFamilia || window.listaMembrosFamilia.length === 0) {
        const { data: membros } = await cli.from('membros')
            .select('id, nome, papel')
            .eq('familia_id', familia);
        if (!aindaAtual()) return;
        window.listaMembrosFamilia = membros || [];
    }

    const { data: transacoes, error } = await Suiri.transactionQuery().select('*')
        .eq('familia_id', familia)
        .gte('data_transacao', dtInicio)
        .lte('data_transacao', dtFim)
        .order('data_transacao', { ascending: false })
        .order('criado_em', { ascending: false });

    if (!aindaAtual()) return;
    if (error) {
        container.textContent = 'Não foi possível carregar o extrato.';
        return;
    }
    window.cacheTransacoesExtrato = transacoes || [];
    const categorias = new Set(window.cacheTransacoesExtrato.map(t =>
        (t.escopo === 'pessoal' || t.eh_privado) && t.membro_id !== membro ? 'Privativo' : t.categoria || 'Geral'));
    const filtro = document.getElementById('select-busca-categoria-extrato');
    const anterior = filtro.value;
    filtro.replaceChildren(new Option('Todas as categorias', 'todas'),
        ...[...categorias].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(nome => new Option(nome, nome)));
    filtro.value = categorias.has(anterior) ? anterior : 'todas';
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
        const subVisivel = ehPrivativo && !ehMeuLancamento ? '' : t.subcategoria || '';

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
            const textoCombinado = `${descVisivel} ${catVisivel} ${subVisivel} ${nomeMembro} ${t.valor || ''}`.toLowerCase();
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
        item.className = 'fin-extrato-item fin-extrato-nominal';

        const ehEntrada = t.tipo === 'entrada' || (t.valor > 0 && t.tipo !== 'saida');
        const sinal = ehEntrada ? '+' : '−';
        const dataFmt = t.data_transacao ? t.data_transacao.split('-').reverse().slice(0, 2).join('/') : '--/--';

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

        const subcategoria = ehPrivativo && !ehMeuLancamento ? '' : t.subcategoria;
        item.innerHTML = `
            <span class="fin-extrato-texto" title="${esc(descricaoVisivel)}">${esc(descricaoVisivel)}</span>
            <strong class="fin-extrato-valor ${ehEntrada ? 'fin-entrada' : 'fin-saida'}">${sinal} ${Suiri.money(Number(t.valor || 0))}</strong>
            <small class="fin-extrato-texto">${esc(nomeResponsavel)} · ${esc(categoriaVisivel)}${subcategoria ? ' › ' + esc(subcategoria) : ''}</small>
            <div class="fin-extrato-acoes">
                <span>${dataFmt} · ${ehPrivativo ? 'Pessoal' : 'Casa'}</span>
            </div>
        `;
        if (ehMeuLancamento) {
            const acoes = item.querySelector('.fin-extrato-acoes');
            for (const [rotulo, icone, estilo, acao] of [
                ['Editar', 'editar', 'btn-secundario', () => window.abrirModalEditarTransacao(t)],
                ['Excluir', 'lixo', 'btn-erro', () => window.excluirTransacaoCarteira(t.id)]
            ]) {
                const botao = document.createElement('button');
                botao.type = 'button';
                botao.className = estilo;
                botao.title = rotulo;
                botao.innerHTML = `<img src="assets/icons-modern/icone-${icone}.svg" alt="${rotulo}">`;
                botao.addEventListener('click', acao);
                acoes.append(botao);
            }
        }
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
    document.getElementById('edit-transacao-subcategoria').value = t.subcategoria || '';
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
    const categoria = normalizarNomeFinanceiro(document.getElementById('edit-transacao-categoria')?.value) || 'Geral';
    const subcategoria = normalizarNomeFinanceiro(document.getElementById('edit-transacao-subcategoria')?.value);
    const data_transacao = document.getElementById('edit-transacao-data')?.value;
    const cli = obterClienteSupabase();
    const usuarioConectadoId = obterUsuarioId();
    const familia = window.familiaAtualId;

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
        subcategoria: subcategoria || null,
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

    if (familia !== window.familiaAtualId || usuarioConectadoId !== obterUsuarioId()) return;
    lembrarCategoriaFinanceira({ tipo, categoria, subcategoria });
    window.fecharModalEditarTransacao();
    window.mostrarToast("Lançamento confirmado e atualizado!");
    if (typeof window.carregarCarteiraIndividual === 'function') await window.carregarCarteiraIndividual();
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

