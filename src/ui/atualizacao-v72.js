/* Suiri Família 7.2 · acesso, navegação visual e apoio semanal. */
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
        const labels=tipo==='homem'?['Reflexão','Missões','Arsenal','A dois','Filmes e séries','Música','Oficina']:['Meu ciclo','Inspiração','Como estou','Rituais','Radar','Filmes e séries','Relaxar'];
        const icons=tipo==='homem'?['✦','◈','↗','♡','▶','♫','⚙']:['◒','✦','✎','❋','♡','▶','☾'];
        const nav=document.createElement('nav');nav.className='navegacao-espacos';nav.setAttribute('aria-label','Setores do espaço');
        cards.forEach((card,i)=>{
            card.id ||= 'setor-'+tipo+'-'+i;card.classList.add('setor-espaco');
            // Remove molduras decorativas internas; mantém gráficos, barras e controles.
            [...card.querySelectorAll('div')].forEach(child=>{if(child.tagName==='DIV'&&child.style.border&&child.style.padding&&!child.hasAttribute('onclick')&&!child.id.startsWith('barra-'))child.classList.add('bloco-integrado');});
            const link=document.createElement('a');link.href='#'+card.id;
            const title=card.querySelector('strong,h2,h3')?.textContent?.trim();
            link.innerHTML='<span aria-hidden="true">'+(icons[i]||'✦')+'</span>';
            link.append(document.createTextNode(labels[i]||title?.slice(0,25)||'Mais'));
            nav.append(link);
        });
        if(cards.length)cards[0].before(nav);
    }
    for(const [name,id,tipo] of [['renderizarEsqueletoEspacoMasculino','secao-espaco-masculino','homem'],['renderizarEsqueletoEspacoMulher','secao-espaco-mulher','mulher']]){
        const fn=window[name];if(!fn)continue;
        window[name]=function(...args){const result=fn.apply(this,args);decorar(document.getElementById(id),tipo);return result;};
    }
    // A área feminina usa este nome no módulo legado.
    const women=document.getElementById('secao-espaco-mulher');
    if(women)new MutationObserver(()=>{if(women.querySelector('.cartao-geral')&&!women.querySelector('.navegacao-espacos'))decorar(women,'mulher');}).observe(women,{childList:true});
    let reminderTimer;
    function apoioSemanal(){
        if(!S.isHome||!window.perfilAtual?.id||window.modoKidsAtivo||window.perfilAtual.eh_kids||window.perfilAtual.papel==='dependente')return;
        const key='suiri:v72:apoio:'+window.perfilAtual.id;
        const last=Number(localStorage.getItem(key)||0),now=Date.now();
        if(now-last<7*24*60*60*1000)return;
        if(document.hidden||document.querySelector('.modal-overlay:not(.oculto),[data-suiri-menu-aberto]')){
            clearTimeout(reminderTimer);reminderTimer=setTimeout(apoioSemanal,30000);return;
        }
        let modal=document.getElementById('modal-apoio-semanal');
        if(!modal){
            modal=document.createElement('div');modal.id='modal-apoio-semanal';modal.className='modal-overlay oculto';
            modal.innerHTML='<div class="modal-conteudo apoio-semanal"><span class="apoio-simbolo" aria-hidden="true">♡</span><p class="apoio-sobretitulo">FEITO PARA A SUA FAMÍLIA</p><h2>Está gostando do Suiri?</h2><p>Faça sua contribuição e ajude o projeto a continuar crescendo. Cada apoio faz diferença para melhorar o Suiri e cuidar de novas ideias.</p><p class="apoio-pix-aviso"></p><button type="button" class="btn-principal apoio-contribuir">Fazer minha contribuição</button><button type="button" class="btn-secundario apoio-depois">Agora não</button><small>Contribuição voluntária. Este convite aparece no máximo a cada 7 dias neste dispositivo.</small></div>';
            document.body.append(modal);
            modal.querySelector('.apoio-depois').onclick=()=>S.closeModal(modal.id);
            modal.querySelector('.apoio-contribuir').onclick=()=>window.abrirModalApoioPix();
        }
        const configured=Boolean(window.SuiriConfig?.pix);
        modal.querySelector('.apoio-contribuir').hidden=!configured;
        modal.querySelector('.apoio-pix-aviso').textContent=configured?'Ao contribuir, você pode copiar a chave Pix do projeto.':'A contribuição via Pix estará disponível quando a chave do projeto for configurada.';
        S.openModal(modal.id);localStorage.setItem(key,String(now));
    }
    document.addEventListener('suiri:session-ready',()=>{acesso();clearTimeout(reminderTimer);reminderTimer=setTimeout(apoioSemanal,1600);});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)apoioSemanal();});
    // O arsenal mantém a mesma mensagem ao reabrir no mesmo dia e muda na virada.
    let lastDay=S.today();setInterval(()=>{const day=S.today();if(day===lastDay)return;lastDay=day;
        window.renderizarReflexaoEstoica?.(false);
        const list=window.AcervoArsenalPratico||[],el=document.getElementById('texto-arsenal-pratico-conteudo');
        if(el&&list.length){el.textContent=list[Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000)%list.length];const label=document.querySelector('.rotulo-dia-arsenal');if(label)label.textContent='DICA DO DIA · '+new Date().toLocaleDateString('pt-BR');}
    },60000);
})();
