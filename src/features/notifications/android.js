/* Alertas do perfil ativo, publicados pelo Android enquanto a página sincroniza. */
(() => {
    if (!navigator.userAgent.includes('SuiriFamiliaAlertas/1')) return;
    let perfil = '';
    let canais = {};
    let envio;
    let consulta = 0;
    const ativo = () => {
        const {usuarioAtual: usuario, perfilAtual: membro, familiaAtualId: familia} = window;
        return usuario?.id && membro?.id && familia ? [familia, usuario.id, membro.id].join(':') : '';
    };
    const permitido = (chave) => String(window.perfilAtual?.permissoes?.[chave]).toLowerCase() !== 'false';
    const kid = () => window.perfilAtual?.eh_kids === true || window.perfilAtual?.papel === 'dependente';
    const linha = (rotulo, valor) => valor ? rotulo + valor : '';
    const data = valor => /^\d{4}-\d{2}-\d{2}$/.test(valor || '') ? valor.split('-').reverse().join('/') : '';
    const visivel = item => (item.escopo !== 'pessoal' && !item.eh_privado) ||
        (item.membro_id || item.criado_por) === window.perfilAtual.id;

    function publicar() {
        clearTimeout(envio);
        envio = setTimeout(() => window.SuiriAndroid('sync-alerts'), 80);
    }

    function sincronizarPerfil() {
        const contexto = ativo();
        if (contexto === perfil) return;
        perfil = contexto;
        canais = {};
        consulta++;
        publicar();
    }

    function missao(m, hoje) {
        const passos = Array.isArray(m.subitens)
            ? m.subitens.filter(s => s.texto).map(s => (s.concluido ? '✓ ' : '• ') + s.texto) : [];
        return {
            id: 'missao-' + m.id + '-' + hoje,
            titulo: m.titulo || 'Missão da família',
            corpo: [m.descricao, linha('Responsável · ', window.listaMembrosFamilia?.find(p => p.id === m.atribuido_a)?.nome),
                linha('Recompensa · ', (m.xp_recompensa ?? 20) + ' XP'), ...passos].filter(Boolean).join('\n'),
            tela: 'inicio'
        };
    }

    function conta(item) {
        return {
            id: 'conta-' + item.id + '-' + item.data_vencimento,
            titulo: item.tipo_evento === 'conta_pagar' ? 'Pagamento de hoje' : 'Recebimento de hoje',
            corpo: [item.descricao, linha('Valor · ', Suiri.money(item.valor)),
                linha('Vencimento · ', data(item.data_vencimento)), linha('Categoria · ', item.categoria),
                item.observacoes].filter(Boolean).join('\n'),
            tela: 'calendario'
        };
    }

    function lancamento(item) {
        return {
            id: 'lancamento-' + item.id + '-' + item.data_transacao,
            titulo: item.tipo === 'entrada' ? 'Receita registrada' : 'Despesa registrada',
            corpo: [item.descricao, linha('Valor · ', Suiri.money(item.valor)),
                linha('Data · ', data(item.data_transacao)), [item.categoria, item.subcategoria].filter(Boolean).join(' › '),
                linha('Membro · ', window.listaMembrosFamilia?.find(p => p.id === item.membro_id)?.nome)]
                .filter(Boolean).join('\n'),
            tela: 'financeiro'
        };
    }

    async function sincronizarLancamentos() {
        if (!perfil) return;
        if (kid() || !permitido('gastos')) {
            canais.contas = [];
            canais.lancamentos = [];
            publicar();
            return;
        }
        const contexto = perfil;
        const pedido = ++consulta;
        try {
            const {data: itens, error} = await Suiri.transactionQuery().select('*')
                .eq('familia_id', window.familiaAtualId).eq('data_transacao', Suiri.today()).limit(60);
            if (error || pedido !== consulta || contexto !== ativo()) return;
            canais.lancamentos = (itens || []).filter(item => visivel(item) && !item.transferencia_interna
                && ['entrada', 'saida'].includes(item.tipo)).map(lancamento);
            publicar();
        } catch (erro) {
            console.warn('Não foi possível sincronizar os alertas do extrato.', erro);
        }
    }

    function atualizar() {
        sincronizarPerfil();
        if (!perfil || document.visibilityState !== 'visible') return;
        window.carregarMissoesDoDia?.();
        if (!kid() && permitido('gastos')) {
            window.atualizarNotificacoesGeraisPainel?.();
        }
        sincronizarLancamentos();
    }

    window.SuiriAlertasAndroid = {
        sincronizarPerfil,
        atualizar,
        atualizarMissoes(itens) {
            sincronizarPerfil();
            if (!perfil) return;
            const membro = window.perfilAtual.id;
            const infantil = kid();
            const podeVer = infantil ? missaoVisivelNoPainelKids : missaoVisivelNoPainelAdulto;
            const hoje = Suiri.today();
            canais.missoes = permitido('missoes') ? itens.filter(m => podeVer(m, membro) &&
                (m.destinatario_kids === 'todos_kids' ? !m.concluidos_por_array?.includes(membro)
                    && !m.falhados_por_array?.includes(membro) : m.status === 'pendente')).map(m => missao(m, hoje)) : [];
            publicar();
        },
        atualizarContas(itens) {
            sincronizarPerfil();
            if (!perfil || kid() || !permitido('gastos')) return;
            canais.contas = itens.filter(visivel).filter(item =>
                ['conta_pagar', 'conta_receber'].includes(item.tipo_evento)).map(conta);
            publicar();
        },
        ler() {
            sincronizarPerfil();
            const snapshot = {perfil};
            if (canais.missoes) snapshot.missoes = canais.missoes;
            if (canais.contas) snapshot.contas = canais.contas;
            if (canais.lancamentos) snapshot.lancamentos = canais.lancamentos;
            return JSON.stringify(snapshot);
        }
    };
    document.addEventListener('suiri:session-ready', sincronizarLancamentos);
    document.addEventListener('visibilitychange', atualizar);
    setInterval(() => {
        if (!perfil || document.visibilityState !== 'visible') return;
        if (kid() || !permitido('gastos')) return;
        sincronizarLancamentos();
    }, 60000);
})();
