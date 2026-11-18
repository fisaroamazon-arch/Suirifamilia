/* Operações que exigem confirmação transacional no banco. Não há fallback parcial. */
(function(){
    const S=window.Suiri;
    const refresh=async()=>{
        await Promise.allSettled([window.carregarCarteiraIndividual?.(),window.carregarExtratoPeriodo?.(),window.carregarCofresCompartilhados?.(),window.carregarDadosCalendarioMes?.(),window.carregarListaMembrosPainel?.()]);
    };
    window.marcarItemAgendaComoLiquidado=(id)=>S.once(`bill:${id}`,async()=>{
        try{
            if(!await window.confirmarAcaoSuiri('Confirmar a baixa desta conta e o lançamento correspondente na carteira?'))return;
            const r=await S.operation('bill',{id},`bill:${id}`);
            window.mostrarToast(r.repeated?'Esta conta já estava liquidada.':'Conta e lançamento confirmados.');
            await refresh();
        }catch(error){S.notifyError(error);}
    });
    window.finalizarCompraMercado=()=>S.once('checkout',async()=>{
        try{
            const items=(window.itensMercadoAtual||[]).filter(i=>(i.no_carrinho||i.comprado)&&i.status!=='finalizado');
            if(!items.length)throw new Error('Marque os produtos da compra.');
            if(items.some(i=>!Number.isFinite(Number(i.quantidade))||Number(i.quantidade)<=0||!Number.isFinite(Number(i.valor_unitario))||Number(i.valor_unitario)<0))throw new Error('Confira os valores e quantidades.');
            const ids=items.map(i=>i.id).sort();
            if(!await window.confirmarAcaoSuiri('Confirmar esta compra e registrar uma única despesa na carteira?'))return;
            const r=await S.operation('checkout',{ids},ids.join(','));
            const total=document.getElementById('resumo-total-gasto-mercado');if(total)total.textContent=S.money(r.total);
            S.openModal('modal-fechamento-mercado');
            window.gerarGraficosFechamentoMercado?.(r.segments||{});
            await window.carregarItensMercado?.();await refresh();
            window.mostrarToast('Compra registrada. Os itens foram preservados no histórico.');
            window.gerarSugestoesCardapioMesIA?.();
        }catch(error){S.notifyError(error);}
    });
    window.confirmarAporteMeta=()=>S.once('contribution',async()=>{
        try{
            const amount=S.number(document.getElementById('input-valor-aporte')?.value);
            const destination=document.getElementById('select-destino-aporte')?.value||'pessoal';
            if(!Number.isFinite(amount)||amount<=0)throw new Error('Informe um valor positivo.');
            await S.operation('contribution',{amount,destination});
            window.fecharModalAporteMeta();await refresh();window.mostrarToast('Aporte confirmado.');
        }catch(error){S.notifyError(error);}
    });
    window.converterXPParaMesada=()=>S.once('allowance',async()=>{
        try{
            const rate=Suiri.parseJSON(localStorage.getItem(`suiri_taxa_xp_${window.familiaAtualId}`),{qtd:100,valor:5});
            if(!await window.confirmarAcaoSuiri(`Converter pontos em mesada na taxa de ${rate.qtd} XP por ${S.money(rate.valor)}?`))return;
            const r=await S.operation('allowance',{rate});await refresh();
            window.mostrarToast(`${r.count} conversão(ões) confirmada(s).`);
            window.renderizarHistoricoMissoesKidsADM?.();
        }catch(error){S.notifyError(error);}
    });
    window.resgatarBeneficioLoja=(id,cost,title)=>S.once(`reward:${id}`,async()=>{
        try{
            if(!await window.confirmarAcaoSuiri(`Confirmar o resgate de “${title}”?`))return;
            const r=await S.operation('reward',{id});
            window.perfilAtual.xp_total=r.xp;await refresh();
            window.mostrarToast('Recompensa resgatada e registrada no histórico.');
            window.renderizarListaBeneficiosLoja?.();window.carregarERenderizarRankingTop3?.();
        }catch(error){S.notifyError(error);}
    });
    async function mission(action,id){
        return S.once(`mission:${id}`,async()=>{
            try{
                const m=cacheMissoes.find(x=>x.id===id);if(!m)return;
                if(action==='fail'&&!await window.confirmarAcaoSuiri('Marcar esta missão como não realizada? A regra de pontos será aplicada uma vez.'))return;
                const r=await S.operation('mission',{id,action},`${id}:${window.perfilAtual.id}:${m.suiri_ocorrencia||0}:${action}`);
                Object.assign(m,r.mission);window.perfilAtual.xp_total=r.xp;
                if(r.streak!==undefined)window.perfilAtual.ofensiva_atual=r.streak;
                window.renderizarMissoesTela();window.carregarMissoesKidsExclusiva();window.renderizarHistoricoMissoesKidsADM();
                const xp=document.getElementById('contador-xp-kids');if(xp)xp.textContent=`${r.xp} XP`;
                const streak=document.getElementById('contador-ofensiva-topo');if(streak)streak.textContent=r.streak||0;
                if(action==='complete'&&!r.repeated){
                    window.SonsSuiri?.sucessoMissao?.();window.TamagotchiKids?.aoCompletarMissao?.();
                    window.SistemaEmblemas?.adicionarProgresso('primeiro_passo',1);
                    if(['🧹','🧽','vassoura','louca'].includes(m.icone))window.SistemaEmblemas?.adicionarProgresso('guardiao_limpeza',1);
                    window.SistemaEmblemas?.avaliarEmblemas();
                }
                window.mostrarToast(r.repeated?'Esta ação já foi registrada nesta ocorrência.':action==='reopen'?'Missão reaberta; a recompensa desta ocorrência não será duplicada.':action==='complete'?`Missão confirmada! ${r.delta>0?'+':''}${r.delta} XP.`:'Resultado da missão confirmado.');
            }catch(error){S.notifyError(error);}
        });
    }
    window.concluirMissaoDomestica=id=>mission('complete',id);
    window.falharMissaoDomestica=id=>mission('fail',id);
    window.reabrirMissaoDomestica=id=>mission('reopen',id);
    window.verificarReativacaoAutomaticaMissoes=async()=>{
        const due=cacheMissoes.filter(m=>m.proxima_execucao&&new Date(m.proxima_execucao)<=new Date()&&m.recorrencia_tipo!=='nenhuma');
        for(const m of due){try{const r=await S.operation('mission',{id:m.id,action:'reset'},`${m.id}:${m.suiri_ocorrencia||0}:reset`);Object.assign(m,r.mission);}catch(error){console.warn('Reativação pendente',error.message);}}
    };
})();
