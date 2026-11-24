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
 const dismiss = modal => {
  if (modal.id === 'modal-modo-acolhimento') return window.fecharModoAcolhimento?.();
  if (modal.id === 'modal-crop-imagem') return window.fecharModalCrop?.();
  if (modal.id === 'modal-confirmar-exclusao-agenda') return window.fecharModalConfirmarExclusaoAgenda?.();
  if (modal.id === 'modal-confirmacao-nativo-suiri') {
   modal.querySelector('[id*="cancelar"]')?.click();
   return;
  }
  if (modal.id === 'modal-casinha-chuiri') return window.TamagotchiKids?.fecharCasinha();
  if (modal.matches('dialog')) return modal.close();
  if (modal.id) S.closeModal(modal.id);
  else modal.classList.add('oculto');
 };

 const initialized = new WeakSet();
 const backdrops = new WeakSet();
 const overlaySelector = S.isHome ? '.modal-overlay, dialog:not(#modal-tour-instrucoes)' : '.modal-overlay';

 function setup(modal) {
  const native = modal.matches('dialog');
  if (native && !S.isHome) return;
  const panel = native ? modal : modal.firstElementChild;
  if (!panel || initialized.has(panel)) return;
  initialized.add(panel);
  panel.classList.add(native ? 'suiri-swipe-dialog' : 'suiri-sheet');

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'sheet-drag-handle';
  handle.setAttribute('aria-label', 'Fechar janela. Também pode deslizar para baixo.');
  handle.innerHTML = '<span></span>';
  panel.prepend(handle);

  let gesture = null;
  let ignoreHandleClickUntil = 0;
  const isOpen = () => native ? modal.open : !modal.classList.contains('oculto') && !modal.hidden;
  const dismissIfOpen = () => { if (isOpen()) dismiss(modal); };

  handle.addEventListener('click', () => {
   if (performance.now() >= ignoreHandleClickUntil) dismissIfOpen();
  });
  if (!native && !backdrops.has(modal)) {
   backdrops.add(modal);
   modal.addEventListener('click', event => { if (event.target === modal) dismissIfOpen(); });
  }

  const clear = () => {
   gesture = null;
   panel.style.removeProperty('--sheet-drag');
  };
  if (native) modal.addEventListener('close', clear);

  function begin(target, point, source, id) {
   if (!isOpen() || gesture) return false;
   const grip = target === handle || handle.contains(target);
   const header = target.closest('.modal-header, .chuiri-casa-topo');
   const interactive = target.closest('button, input, select, textarea, a, label, summary, [role="button"], [contenteditable], canvas, video');
   if (interactive && !grip) return false;
   if (!grip && !header) {
    if (source !== 'touch' || !S.isHome) return false;
    for (let element = target; element && panel.contains(element); element = element.parentElement) {
     if (element.scrollTop > 1) return false;
    }
   }
   if (grip) ignoreHandleClickUntil = 0;
   gesture = { source, id, x: point.clientX, y: point.clientY, grip, dragging: false };
   return true;
  }

  function move(event, point, source, id) {
   if (!gesture || gesture.source !== source || gesture.id !== id) return;
   const dy = point.clientY - gesture.y;
   const dx = Math.abs(point.clientX - gesture.x);
   if (!gesture.dragging) {
    if (Math.max(dx, Math.abs(dy)) <= 8) return;
    if (gesture.grip) ignoreHandleClickUntil = performance.now() + 400;
    if (dy <= dx || !event.cancelable) return clear();
    gesture.dragging = true;
   }
   if (event.cancelable) event.preventDefault();
   panel.style.setProperty('--sheet-drag', Math.max(0, Math.min(180, dy)) + 'px');
  }

  function end(point, source, id, cancelled = false) {
   if (!gesture || gesture.source !== source || gesture.id !== id) return;
   const dy = cancelled ? 0 : point.clientY - gesture.y;
   const dx = cancelled ? 0 : Math.abs(point.clientX - gesture.x);
   const close = (gesture.dragging || source === 'pointer') && dy > 65 && dy > dx;
   if (gesture.grip && (gesture.dragging || close)) ignoreHandleClickUntil = performance.now() + 400;
   clear();
   if (close) dismissIfOpen();
  }

  panel.addEventListener('pointerdown', event => {
   if (event.pointerType === 'touch' || event.button !== 0) return;
   if (begin(event.target, event, 'pointer', event.pointerId)) {
    try { event.target.setPointerCapture?.(event.pointerId); } catch {}
   }
  });
  panel.addEventListener('pointermove', event => move(event, event, 'pointer', event.pointerId));
  panel.addEventListener('pointerup', event => end(event, 'pointer', event.pointerId));
  panel.addEventListener('pointercancel', event => end(event, 'pointer', event.pointerId, true));

  panel.addEventListener('touchstart', event => {
   if (event.touches.length !== 1) return clear();
   const touch = event.touches[0];
   begin(event.target, touch, 'touch', touch.identifier);
  }, { passive: true });
  panel.addEventListener('touchmove', event => {
   if (event.touches.length !== 1) return clear();
   const touch = event.touches[0];
   move(event, touch, 'touch', touch.identifier);
  }, { passive: false });
  panel.addEventListener('touchend', event => {
   for (const touch of event.changedTouches) end(touch, 'touch', touch.identifier);
  }, { passive: true });
  panel.addEventListener('touchcancel', clear, { passive: true });

  if (modal.id === 'modal-orientacoes-estagio-fase') {
   const phases = document.getElementById('btn-modal-fase-1')?.parentElement;
   const topics = document.getElementById('btn-modal-topico-geral')?.parentElement;
   phases?.classList.add('phase-tabs');
   topics?.classList.add('phase-topics');
  }
 }
 function scan(scope) {
  if (scope.matches?.(overlaySelector)) setup(scope);
  scope.querySelectorAll?.(overlaySelector).forEach(setup);
 }
 scan(document.body);
 seasonUI();
 new MutationObserver(records => {
  let added = false;
  for (const record of records) {
   for (const node of record.addedNodes) {
    if (node.nodeType !== 1 || node.closest('svg,.season-symbol,.sheet-drag-handle')) continue;
    const owner = node.closest(overlaySelector);
    if (owner) setup(owner);
    scan(node);
    added = true;
   }
  }
  if (added) seasonUI();
 }).observe(document.body, { childList: true, subtree: true });
 function viewport(){document.documentElement.style.setProperty('--suiri-modal-vh',(window.visualViewport?.height||innerHeight)+'px');document.documentElement.style.setProperty('--suiri-modal-top',(window.visualViewport?.offsetTop||0)+'px');}
 viewport();window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);
})();
