/* Suiri 7.4 · modos femininos, contraste e símbolos vetoriais. */
(function(){
 const root=document.documentElement,S=window.Suiri,icon=window.iconeModernoSuiri;
 const women=!!document.querySelector('.container-mulher');
 const key=()=>S.memberId()?`suiri:v74:mulher-modo:${S.memberId()}`:null;
 window.aplicarModoMulherSuiri=function(){
  if(!women)return;
  const stored=key()&&localStorage.getItem(key());const mode=stored==='foco'?'foco':'normal';root.dataset.womenMode=mode;
  document.body.classList.remove('modo-vidro');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='foco'?'#21142e':'#581c87');
  document.querySelectorAll('[data-women-choice]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.womenChoice===mode));});
  const video=document.getElementById('video-cenario-fundo');
  if(video){video.loop=true;video.muted=true;video.playsInline=true;if(mode==='foco')video.pause();else if(S.memberId())video.play()?.catch(()=>{});}
 };
 window.escolherModoMulherSuiri=function(mode){if(!women||!['normal','foco'].includes(mode)||!key())return;localStorage.setItem(key(),mode);window.aplicarModoMulherSuiri();};
 if(women){
  const toolbar=document.getElementById('barra-topo-player-mulher');
  toolbar.classList.add('barra-modo-mulher');
  const group=document.createElement('div');group.className='seletor-modo-mulher';group.setAttribute('role','group');group.setAttribute('aria-label','Modo do espaço feminino');
  for(const [mode,label,glyph] of [['normal','Tradicional','flower'],['foco','Foco','moon']]){
   const b=document.createElement('button');b.type='button';b.dataset.womenChoice=mode;b.innerHTML=icon(glyph)+'<span>'+label+'</span>';b.onclick=()=>window.escolherModoMulherSuiri(mode);group.append(b);
  }
  toolbar.append(group);window.aplicarModoMulherSuiri();
  document.addEventListener('suiri:session-ready',window.aplicarModoMulherSuiri);
 }
 // Replace only interface symbols. The emoji picker and user-entered data stay intact.
 const map={'✦':'star','◈':'checklist','↗':'dumbbell','♡':'heart','◎':'activity','♫':'music','⚙':'settings','◒':'cycle','✎':'edit','❋':'flower','☾':'moon','▦':'list','⚔️':'shield','🔥':'flame','💪':'dumbbell','❤️':'heart','🤍':'heart','⭐':'star','🏛️':'book','🏪':'bag','🛒':'cart','📊':'chart','⚡':'bolt','🎯':'checklist','🎵':'music','🎶':'music','📌':'pin','📖':'book','📝':'edit','🗑️':'trash','🔀':'shuffle','▶':'play','⏸':'pause','⏭':'next','⏮':'previous','🌸':'flower','🌿':'leaf','💧':'leaf','🧘‍♀️':'flower','👤':'user','👥':'users','✓':'check','✕':'x','⚙️':'settings','⏳':'clock','🛠️':'wrench','📅':'calendar','🏠':'home','🔔':'bell','📋':'checklist'};
 const symbols=Object.keys(map).sort((a,b)=>b.length-a.length);const expression=new RegExp(symbols.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
 function modernize(scope){
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const p=node.parentElement;if(!p||p.closest('script,style,textarea,input,select,svg,blockquote,[contenteditable],.emoji-opcao,.botao-emoji,#grid-emojis,#pilula-frase-filosofica,#texto-reflexao-estoica-conteudo'))continue;
   const value=node.nodeValue;expression.lastIndex=0;
   if(!expression.test(value))continue;
   // Display text from the catalogue/user content is preserved unless it is a UI control or heading.
   if(!p.closest('button,nav,h1,h2,h3,h4,label,.modal-header,.bottom-nav-item')&&value.trim().length>12)continue;
   const fragment=document.createDocumentFragment();let start=0;expression.lastIndex=0;
   for(const m of value.matchAll(expression)){
    fragment.append(document.createTextNode(value.slice(start,m.index)));
    const span=document.createElement('span');span.className='simbolo-moderno';span.setAttribute('aria-hidden','true');span.innerHTML=icon(map[m[0]]);fragment.append(span);start=m.index+m[0].length;
   }
   fragment.append(document.createTextNode(value.slice(start)));node.replaceWith(fragment);
  }
 }
 modernize(document.body);
 const observer=new MutationObserver(records=>{
  const pending=[];
  for(const r of records)for(const n of r.addedNodes){if(n.nodeType===1&&!n.matches('.simbolo-moderno,svg'))pending.push(n);else if(n.nodeType===3&&n.parentElement)pending.push(n.parentElement);}
  [...new Set(pending)].forEach(n=>{if(n.isConnected&&!n.closest('.simbolo-moderno,svg'))modernize(n);});
 });observer.observe(document.body,{childList:true,subtree:true});
})();
