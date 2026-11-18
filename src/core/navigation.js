/* Histórico das seções e contratos de interação compartilhados. */
(function(){
    const S=window.Suiri;
    const screens=['meuespaco','inicio','mercado','financeiro','calendario','familia'];
    const original=window.navegarParaTela;
    if(S.isHome&&original){
        window.navegarParaTela=function(screen, options={}){
            if(!screens.includes(screen)||window.modoKidsAtivo)return;
            if(screen==='mercado'&&window.perfilAtual?.permissoes?.mercado===false)return window.mostrarToast('Este perfil não tem acesso ao mercado.','erro');
            if(screen==='financeiro'&&window.perfilAtual?.permissoes?.gastos===false)return window.mostrarToast('Este perfil não tem acesso às finanças.','erro');
            original(screen);
            if(!options.silent){
                const url='#'+screen;
                if(history.state?.screen!==screen){if(options.replace)history.replaceState({screen},'',url);else history.pushState({screen},'',url);}
            }
        };
        window.addEventListener('popstate',()=>{
            document.querySelectorAll('.modal-overlay:not(.oculto)').forEach(el=>S.closeModal(el.id));
            const screen=location.hash.slice(1);window.navegarParaTela(screens.includes(screen)?screen:'inicio',{silent:true});
        });
        document.addEventListener('suiri:session-ready',()=>{
            const screen=location.hash.slice(1);window.navegarParaTela(screens.includes(screen)?screen:'inicio',{replace:true});
        });
    }
    if(window.confirmarAcaoSuiri){
        const confirm=window.confirmarAcaoSuiri;let queue=Promise.resolve();
        window.confirmarAcaoSuiri=(...args)=>{const result=queue.then(()=>confirm(...args));queue=result.catch(()=>{});return result;};
    }
    // Bloqueia somente os elementos que disparam gravação, mantendo cancelamento disponível.
    document.addEventListener('click',event=>{
        const button=event.target.closest('button');if(!button)return;
        const action=button.getAttribute('onclick')||'';
        if(!/salvar|adicionar|finalizarCompra|marcarItemAgenda|concluirMissao|resgatarBeneficio|confirmarAporte/.test(action))return;
        button.setAttribute('aria-busy','true');
        setTimeout(()=>{button.removeAttribute('aria-busy');},500);
    });
})();
