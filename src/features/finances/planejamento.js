/* Planejamento com o histórico do extrato, sem enviar valores a outros serviços. */
(function () {
    const dicas = [
        'Separe as contas fixas das compras do dia a dia. Defina um limite semanal para as compras antes de ir ao mercado.',
        'Confira assinaturas e cobranças recorrentes. Se uma delas já não faz parte da rotina, avalie cancelá-la antes da renovação.',
        'Compare o preço por quilo ou por litro no mercado. Embalagens maiores só compensam se forem usadas antes do vencimento.',
        'Antes de parcelar uma compra, some as parcelas que já entram no próximo mês e compare o custo total com o preço à vista.',
        'Se as despesas variam muito, reserve primeiro o dinheiro das contas essenciais e acompanhe o que sobra ao longo do mês.',
        'Escolha uma categoria de gasto para revisar por semana e registre o que mudou. Assim fica mais fácil descobrir onde a economia funcionou.',
        'Use uma lista para as compras e defina o teto do carrinho. Assim dá para trocar itens antes de passar no caixa.'
    ];
    let versao = 0;

    function dicaDoDia(data = Suiri.today()) {
        const dia = Math.floor(Date.parse(data) / 86400000);
        return dicas[dia % dicas.length] || dicas[0];
    }

    function calcular(transacoes, hoje) {
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const mesAtual = Suiri.today(inicio).slice(0, 7);
        const meses = new Map([-3, -2, -1].map(offset => [
            Suiri.today(new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1)).slice(0, 7), 0
        ]));
        const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
        const categorias = new Map();
        let atual = 0;
        for (const t of transacoes) {
            if (t.tipo !== 'saida' || t.transferencia_interna || t.categoria === 'Transferência') continue;
            const mes = t.data_transacao?.slice(0, 7);
            const valor = Math.round(Number(t.valor) * 100);
            if (!Number.isFinite(valor) || valor <= 0) continue;
            if (mes === mesAtual) {
                atual += valor;
                const categoria = t.categoria || 'Geral';
                categorias.set(categoria, (categorias.get(categoria) || 0) + valor);
            } else if (meses.has(mes)) {
                meses.set(mes, meses.get(mes) + valor);
            }
        }
        const historico = [...meses.values()].filter(valor => valor > 0);
        const ritmo = hoje.getDate() >= 7 && atual > 0 ? Math.round(atual / hoje.getDate() * diasNoMes) : null;
        const faixa = historico.length >= 2 ? [Math.min(...historico), Math.max(...historico)] : null;
        const limite = faixa?.[1] ?? null;
        const alerta = limite === null ? '' : atual > limite ? 'Os gastos do mês já ultrapassaram o maior total recente.'
            : ritmo !== null && ritmo > limite ? 'Mantido o ritmo atual, os gastos do mês podem ultrapassar o maior total recente.' : '';
        const categoria = [...categorias].filter(([nome]) => nome !== 'Privativo')
            .sort((a, b) => b[1] - a[1])[0];
        return { atual, ritmo, faixa, alerta, categoria };
    }

    async function atualizar() {
        const painel = document.getElementById('financeiro-previsao');
        const alerta = document.getElementById('financeiro-alerta');
        const familia = window.familiaAtualId;
        const membro = obterUsuarioId();
        if (!painel || !familia || !membro) return;
        const pedido = ++versao;
        const aindaAtual = () => pedido === versao && familia === window.familiaAtualId && membro === obterUsuarioId();
        const hoje = new Date();
        const inicio = Suiri.today(new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1));
        alerta.hidden = true;
        painel.innerHTML = '<p>Carregando os gastos da casa…</p>';
        try {
            const linhas = Suiri.check(await Suiri.transactionQuery().select('tipo,categoria,valor,transferencia_interna,data_transacao')
                .eq('familia_id', familia).eq('tipo', 'saida').gte('data_transacao', inicio).lte('data_transacao', Suiri.today(hoje))) || [];
            if (!aindaAtual()) return;

            const previsao = calcular(linhas, hoje);
            const moeda = centavos => Suiri.money(centavos / 100);
            const valorRitmo = previsao.ritmo === null ? 'Disponível a partir do dia 7, com gastos registrados.' : moeda(previsao.ritmo);
            const valorFaixa = previsao.faixa ? previsao.faixa.map(moeda).join(' a ') : 'São necessários dois meses fechados com registros.';
            alerta.textContent = previsao.alerta;
            alerta.hidden = !previsao.alerta;
            painel.innerHTML = `<dl class="fin-totais">
                <div><dt>Gasto neste mês</dt><dd>${moeda(previsao.atual)}</dd></div>
                <div><dt>Estimativa até o fim do mês</dt><dd>${valorRitmo}</dd></div>
                <div><dt>Faixa de referência para o próximo mês</dt><dd>${valorFaixa}</dd></div>
            </dl>
            <p class="fin-mensagem">A estimativa aplica o ritmo diário registrado aos dias do mês. A faixa usa o menor e o maior total dos últimos três meses completos com registros, supondo que o padrão de gastos se repita. Transferências internas ficam fora do cálculo.</p>
            <div class="fin-dica"><h4>Dica para economizar</h4><p></p></div>`;
            painel.querySelector('.fin-dica p').textContent = previsao.categoria
                ? `Entre as categorias visíveis, ${previsao.categoria[0]} soma ${moeda(previsao.categoria[1])} neste mês. Revise os lançamentos desse grupo e identifique o que pode esperar. ${dicaDoDia()}`
                : dicaDoDia();
        } catch (error) {
            if (!aindaAtual()) return;
            painel.textContent = 'Não foi possível calcular a previsão agora. ' + dicaDoDia();
        }
    }

    Suiri.planejamentoFinanceiro = { calcular, atualizar, dicaDoDia };
})();
