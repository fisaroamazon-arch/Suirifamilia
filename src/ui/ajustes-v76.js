/* Cabeçalho, estações e fechamento dos painéis por gesto/backdrop. */
(function(){
 const S=window.Suiri;
 window.SuiriIconPaths.winter='<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M8 4l4 3 4-3M8 20l4-3 4 3M3 11l4-1-1-4m12 12-1-4 4-1M3 13l4 1-1 4m12-12-1 4 4 1"/>';
 const seasons=[null,{icon:'winter',name:'Inverno',phase:'Menstrual'},{icon:'flower',name:'Primavera',phase:'Folicular'},{icon:'sun',name:'Verão',phase:'Ovulatória'},{icon:'leaf',name:'Outono',phase:'Lútea'}];
 function seasonUI(){
  for(let i=1;i<=4;i++){
   const item=seasons[i],button=document.getElementById('btn-modal-fase-'+i),legend=document.getElementById('marco-estagio-'+i);
   if(button&&button.dataset.season!==String(i)){button.dataset.season=String(i);button.innerHTML=window.iconeModernoSuiri(item.icon)+'<span>'+item.phase+'</span>';button.setAttribute('aria-label',item.phase+' · '+item.name);}
   if(button)button.setAttribute('aria-pressed',String((window.estagioModalAtivoAtual||1)===i));
   if(legend&&!legend.querySelector('.season-symbol')){const mark=legend.querySelector('.fase-traco');const el=document.createElement('span');el.className='season-symbol';el.innerHTML=window.iconeModernoSuiri(item.icon);el.title=item.name;if(mark)mark.replaceWith(el);else legend.prepend(el);legend.setAttribute('aria-label',item.phase+' · '+item.name);}
  }
  const active=window.estagioModalAtivoAtual||1,glyph=document.getElementById('modal-fase-emoji');if(glyph&&(glyph.dataset.season!==String(active)||!glyph.querySelector('svg'))){glyph.dataset.season=String(active);glyph.innerHTML=window.iconeModernoSuiri(seasons[active].icon);}
  for(const topic of ['geral','fertilidade','libido','energia'])document.getElementById('btn-modal-topico-'+topic)?.setAttribute('aria-pressed',String((window.topicoModalAtivoAtual||'geral')===topic));
 }
 const render=window.renderizarConteudoModalOrientacoes;if(render)window.renderizarConteudoModalOrientacoes=function(...args){const value=render.apply(this,args);seasonUI();return value;};
 const dismiss=modal=>{
  if(modal.id==='modal-modo-acolhimento')return window.fecharModoAcolhimento?.();
  if(modal.id==='modal-crop-imagem')return window.fecharModalCrop?.();
  if(modal.id==='modal-confirmacao-nativo-suiri'){modal.querySelector('[id*="cancelar"]')?.click();return;}
  S.closeModal(modal.id);
 };
 const initialized=new WeakSet();
 function setup(modal){
  const panel=modal.firstElementChild;if(!panel||initialized.has(panel))return;initialized.add(panel);panel.classList.add('suiri-sheet');
  const handle=document.createElement('button');handle.type='button';handle.className='sheet-drag-handle';handle.setAttribute('aria-label','Puxe para baixo para fechar');handle.innerHTML='<span></span>';panel.prepend(handle);
  handle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dismiss(modal);}});
  modal.addEventListener('click',e=>{if(e.target===modal)dismiss(modal);});
  let gesture=null;
  panel.addEventListener('pointerdown',e=>{
   if(!e.target.closest('.sheet-drag-handle,.modal-header'))return;if(e.target.closest('button,input,a')&&!e.target.closest('.sheet-drag-handle'))return;
   gesture={x:e.clientX,y:e.clientY,id:e.pointerId};try{e.target.setPointerCapture?.(e.pointerId);}catch{}
  });
  panel.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dy=Math.max(0,e.clientY-gesture.y);if(dy>8&&Math.abs(e.clientX-gesture.x)<dy){if(e.cancelable)e.preventDefault();panel.style.setProperty('--sheet-drag',Math.min(180,dy)+'px');}});
  function end(e){if(!gesture||e.pointerId!==gesture.id)return;const dy=e.clientY-gesture.y,dx=Math.abs(e.clientX-gesture.x);gesture=null;panel.style.removeProperty('--sheet-drag');if(e.type!=='pointercancel'&&dy>65&&dy>dx)dismiss(modal);}
  panel.addEventListener('pointerup',end);panel.addEventListener('pointercancel',end);
  if(modal.id==='modal-orientacoes-estagio-fase'){
   const phases=document.getElementById('btn-modal-fase-1')?.parentElement,topics=document.getElementById('btn-modal-topico-geral')?.parentElement;
   phases?.classList.add('phase-tabs');topics?.classList.add('phase-topics');
  }
 }
 function scan(scope){if(scope.matches?.('.modal-overlay'))setup(scope);scope.querySelectorAll?.('.modal-overlay').forEach(setup);seasonUI();}
 scan(document.body);
 new MutationObserver(records=>{let added=false;for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1&&!node.closest('svg,.season-symbol,.sheet-drag-handle')){const owner=node.closest('.modal-overlay');if(owner)setup(owner);if(node.matches('.modal-overlay')||node.querySelector('.modal-overlay'))scan(node);added=true;}if(added)seasonUI();}).observe(document.body,{childList:true,subtree:true});
 function viewport(){document.documentElement.style.setProperty('--suiri-modal-vh',(window.visualViewport?.height||innerHeight)+'px');document.documentElement.style.setProperty('--suiri-modal-top',(window.visualViewport?.offsetTop||0)+'px');}
 viewport();window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);
})();
