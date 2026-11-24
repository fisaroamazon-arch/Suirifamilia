/* Suiri 7.3 · paletas acessíveis, escalas contínuas e reflexão diária local. */
(function(){
    const S=window.Suiri,root=document.documentElement;
    const men=!!document.querySelector('.container-homem');
    const profileKey=()=>S.memberId()?`suiri:v73:console:${S.memberId()}`:null;
    function consoleStyle(){
        const key=profileKey(),saved=key&&localStorage.getItem(key);
        return ['xbox','playstation'].includes(saved)?saved:(root.dataset.theme==='dark'?'playstation':'xbox');
    }
    window.escolherEstiloMasculino=function(style){
        if(!['xbox','playstation'].includes(style)||!profileKey())return;
        localStorage.setItem(profileKey(),style);applyConsole();
    };
    function applyConsole(){
        if(!men)return;
        const style=consoleStyle();root.dataset.console=style;
        document.querySelectorAll('[data-console-choice]').forEach(b=>{const active=b.dataset.consoleChoice===style;b.setAttribute('aria-pressed',String(active));b.classList.toggle('selecionado',active);});
    }
    function injectSwitch(){
        if(!men||document.getElementById('seletor-console'))return;
        const back=document.querySelector('button[onclick*="fecharEspacoMasculino"]');if(!back)return;
        const row=document.createElement('div');row.className='linha-voltar-console';back.before(row);row.append(back);
        const group=document.createElement('div');group.id='seletor-console';group.setAttribute('role','group');group.setAttribute('aria-label','Estilo do espaço masculino');
        for(const [style,name,icon] of [['xbox','Xbox','✕'],['playstation','PlayStation','△○']]){
            const b=document.createElement('button');b.type='button';b.dataset.consoleChoice=style;b.innerHTML='<span aria-hidden="true">'+icon+'</span> '+name;b.onclick=()=>window.escolherEstiloMasculino(style);group.append(b);
        }
        row.append(group);applyConsole();
    }
    function updateRange(input){
        if(input.closest('.suiri-player'))return;
        const min=Number(input.min)||0,max=Number(input.max)||100,value=Number(input.value);
        const percent=Math.max(0,Math.min(100,(value-min)/Math.max(0.01,max-min)*100));
        input.style.setProperty('--range-pct',percent+'%');
        if(max-min>=4){input.step='0.01';input.setAttribute('aria-valuetext',`${Math.round(value*100)/100} de ${max}`);}
    }
    function rgb(color){
        if(!color)return null;
        const m=color.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);if(m)return m.slice(1).map(Number);
        const hex=color.match(/^#([\da-f]{6}|[\da-f]{3})$/i);if(hex){let h=hex[1];if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
        return null;
    }
    function decorate(scope){
        const els=[...(scope.nodeType===1?[scope]:[]),...scope.querySelectorAll('[style],[class],input[type="range"]')];
        for(const el of els){
            if(el.matches('input[type="range"]')){updateRange(el);continue;}
            const bg=rgb(el.style.backgroundColor)||(!el.classList.contains('suiri-fundo-legado-claro')?rgb(getComputedStyle(el).backgroundColor):null),color=rgb(el.style.color);
            if(bg&&Math.max(...bg)>190&&Math.min(...bg)>160&&!['INPUT','HTML','BODY'].includes(el.tagName))el.classList.add('suiri-fundo-legado-claro');
            if(color&&Math.max(...color)<160)el.classList.add('suiri-texto-legado-escuro');
        }
    }
    document.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))updateRange(e.target);});
    const observer=new MutationObserver(records=>{
        for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)decorate(node);
        injectSwitch();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    new MutationObserver(()=>{applyConsole();decorate(document.body);}).observe(root,{attributes:true,attributeFilter:['data-theme']});
    decorate(document.body);injectSwitch();applyConsole();
    document.addEventListener('suiri:session-ready',()=>{
        applyConsole();
        if(S.isHome){window.filtrarMissoesPorAba?.('todas');}
    });
    // Modal Pense: fonte verificável já incluída no projeto, disponível sem rede.
    if(!S.isHome)return;
    let timer=null,pending=null;
    const dayKey=id=>`suiri:pense:v73:${id}`;
    const eligible=()=>!!window.perfilAtual?.id&&!window.modoKidsAtivo&&!window.perfilAtual.eh_kids&&window.perfilAtual.papel!=='dependente';
    function itemDoDia(){return window.obterReflexaoEstoicaDoDia?.();}
    function show(){
        if(!eligible())return false;
        const item=itemDoDia(),modal=document.getElementById('modal-pilula-dia');if(!item||!modal)return false;
        const box=document.getElementById('pilula-frase-filosofica');box.replaceChildren();
        const quote=document.createElement('blockquote');quote.textContent=item.texto;
        const author=document.createElement('cite');author.textContent='— '+item.autor;quote.append(author);box.append(quote);
        const hint = document.getElementById('pilula-dica-financeira');
        const dica = S.planejamentoFinanceiro?.dicaDoDia();
        hint.hidden = !dica;
        if (dica) hint.textContent = 'Dica para economizar · ' + dica;
        S.openModal(modal.id);localStorage.setItem(dayKey(S.memberId()),S.today());
        clearTimeout(timer);pending=null;return true;
    }
    function tryShow(id){
        if(!eligible()||S.memberId()!==id){pending=null;return;}
        if(localStorage.getItem(dayKey(id))===S.today()){pending=null;return;}
        if(document.hidden||document.querySelector('.modal-overlay:not(.oculto),[data-suiri-menu-aberto]')){
            timer=setTimeout(()=>tryShow(id),1500);return;
        }
        show();
    }
    S.Pense={
        abrir:show,
        agendar(){
            if(!eligible())return;
            const id=S.memberId();if(localStorage.getItem(dayKey(id))===S.today())return;
            clearTimeout(timer);pending=id;timer=setTimeout(()=>tryShow(id),600);
        }
    };
    window.abrirModalPilulaDia=show;
    window.fecharModalPilulaDia=()=>S.closeModal('modal-pilula-dia');
    window.verificarGatilhoPenseSeteManha=()=>S.Pense.agendar();
    document.addEventListener('suiri:session-ready',()=>S.Pense.agendar());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)S.Pense.agendar();});
})();
