/* Suiri Família 7.2 · acesso, navegação visual e apoio voluntário. */
(function(){
    const S=window.Suiri;
    function genero(){
        const p=window.perfilAtual||{};
        const v=String(p.genero||p.sexo||'').trim().toLowerCase();
        if(['feminino','mulher','f'].includes(v))return 'feminino';
        if(['masculino','homem','m'].includes(v))return 'masculino';
        return null;
    }
    function entrar(tipo,url){
        if(genero()!==tipo)return window.mostrarToast?.('Este espaço está disponível para o gênero cadastrado no seu perfil.','info');
        location.href=url;
    }
    window.acessarModuloMulherHTML=window.abrirEspacoMulher=()=>entrar('feminino','mulher.html');
    window.acessarModuloHomemHTML=window.abrirEspacoMasculino=()=>entrar('masculino','homem.html');
    function acesso(){
        window.atualizarCartoesGeneroMeuEspaco?.();
        const reflexao=window.obterReflexaoEstoicaDoDia?.();
        const frase=document.getElementById('txt-frase-estoica-quadro'),autor=document.getElementById('txt-autor-estoico-quadro');
        if(reflexao&&frase){frase.textContent=reflexao.texto;frase.title=reflexao.texto;if(autor)autor.textContent='— '+reflexao.autor;}

        if((S.page==='homem.html'&&genero()!=='masculino')||(S.page==='mulher.html'&&genero()!=='feminino'))location.replace('index.html#meuespaco');
    }
    // Navegação por setores preservando os controles e os dados existentes.
    function decorar(container,tipo){
        if(!container)return;
        const cards=[...container.querySelectorAll(':scope > .cartao-geral')];
        const labels=tipo==='homem'?['Reflexão','Forja','Corpo & Mente','Arsenal','A dois','Filmes e séries','Música','Oficina']:['Meu ciclo','Inspiração','Como estou','Rituais','Radar','Filmes e séries','Relaxar'];
        const icons=tipo==='homem'?['✦','◈','◎','↗','♡','▶','♫','⚙']:['◒','✦','✎','❋','♡','▶','☾'];
        const nav=document.createElement('nav');nav.className='navegacao-espacos';nav.setAttribute('aria-label','Setores do espaço');
        cards.forEach((card,i)=>{
            card.id ||= 'setor-'+tipo+'-'+i;card.classList.add('setor-espaco');
            // Remove molduras decorativas internas; mantém gráficos, barras e controles.
            [...card.querySelectorAll('div')].forEach(child=>{if(child.tagName==='DIV'&&child.style.border&&child.style.padding&&!child.hasAttribute('onclick')&&!child.id.startsWith('barra-'))child.classList.add('bloco-integrado');});
            const link=document.createElement('a');link.href='#'+card.id;
            if(location.hash===link.hash)link.setAttribute('aria-current','location');
            const title=card.querySelector('strong,h2,h3')?.textContent?.trim();
            link.innerHTML='<span aria-hidden="true">'+(icons[i]||'✦')+'</span>';
            link.append(document.createTextNode(labels[i]||title?.slice(0,25)||'Mais'));
            nav.append(link);
        });
        if(cards.length){
            nav.addEventListener('click',event=>{
                const link=event.target.closest('a');
                if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
                nav.querySelector('[aria-current]')?.removeAttribute('aria-current');
                link.setAttribute('aria-current','location');
            });
            cards[0].before(nav);
        }
    }
    for(const [name,id,tipo] of [['renderizarEsqueletoEspacoMasculino','secao-espaco-masculino','homem'],['renderizarEsqueletoEspacoMulher','secao-espaco-mulher','mulher']]){
        const fn=window[name];if(!fn)continue;
        window[name]=function(...args){const result=fn.apply(this,args);decorar(document.getElementById(id),tipo);return result;};
    }
    // A área feminina usa este nome no módulo legado.
    const women=document.getElementById('secao-espaco-mulher');
    if(women)new MutationObserver(()=>{if(women.querySelector('.cartao-geral')&&!women.querySelector('.navegacao-espacos'))decorar(women,'mulher');}).observe(women,{childList:true});
    const intervaloApoio = 2 * 24 * 60 * 60 * 1000;
    let reminderTimer;
    function agendarApoio(atraso) {
        clearTimeout(reminderTimer);
        reminderTimer = setTimeout(mostrarConviteApoio, atraso);
    }
    function mostrarConviteApoio() {
        clearTimeout(reminderTimer);
        const perfil = window.perfilAtual;
        if (!S.isHome || !perfil?.id || window.modoKidsAtivo || perfil.eh_kids || perfil.papel === 'dependente' || !window.SuiriConfig?.pix) return;
        if (document.hidden) return;
        const key = 'suiri:v72:apoio:' + perfil.id;
        const restante = intervaloApoio - (Date.now() - Number(localStorage.getItem(key) || 0));
        if (restante > 0) {
            agendarApoio(Math.min(restante, intervaloApoio));
        } else if (document.querySelector('.modal-overlay:not(.oculto),[data-suiri-menu-aberto]')) {
            agendarApoio(30000);
        } else if (window.abrirModalApoioPix()) {
            localStorage.setItem(key, String(Date.now()));
            agendarApoio(intervaloApoio);
        }
    }
    document.addEventListener('suiri:session-ready', () => { acesso(); agendarApoio(1600); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) mostrarConviteApoio(); });
    // O arsenal mantém a mesma mensagem ao reabrir no mesmo dia e muda na virada.
    let lastDay=S.today();setInterval(()=>{const day=S.today();if(day===lastDay)return;lastDay=day;
        window.renderizarReflexaoEstoica?.(false);
        const list=window.AcervoArsenalPratico||[],el=document.getElementById('texto-arsenal-pratico-conteudo');
        if(el&&list.length){el.textContent=list[Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000)%list.length];const label=document.querySelector('.rotulo-dia-arsenal');if(label)label.textContent='DICA DO DIA · '+new Date().toLocaleDateString('pt-BR');}
    },60000);
})();
