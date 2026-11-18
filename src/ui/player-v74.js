/* Player comum para os espaços, reutilizando catálogo e favoritas existentes. */
(function(){
 const female=!!document.querySelector('.container-mulher'),male=!!document.querySelector('.container-homem');if(!female&&!male)return;
 const S=window.Suiri,icon=window.iconeModernoSuiri,engine=female?window.PlayerMulher:window.PlayerHomem;if(!engine)return;
 const root=document.createElement('section');root.className='suiri-player';root.id='player-suiri';root.setAttribute('aria-label','Player de música');
 root.innerHTML=`<div class="player-cabecalho"><canvas id="suiri-audio-visualizer" class="player-visualizer" width="144" height="96" aria-label="Visualização do áudio"></canvas><div class="player-identidade"><span class="player-selo">SUIRI MUSIC</span><strong id="suiri-faixa-titulo">Escolha sua trilha</strong><span class="player-artista">Filipe Sales · Instrumental</span></div><button type="button" class="player-icone" data-player-action="favorite" aria-label="Favoritar faixa">${icon('heart')}</button></div><div class="player-linha-tempo"><input type="range" min="0" max="1000" step="1" value="0" id="suiri-player-seek" aria-label="Posição na música" disabled><div class="player-tempos"><span id="suiri-player-current">0:00</span><span id="suiri-player-duration">0:00</span></div></div><div class="player-controles"><button type="button" class="player-icone" data-player-action="shuffle" aria-label="Reprodução aleatória">${icon('shuffle')}</button><button type="button" class="player-icone" data-player-action="previous" aria-label="Faixa anterior">${icon('previous')}</button><button type="button" class="player-play" data-player-action="toggle" aria-label="Reproduzir">${icon('play')}</button><button type="button" class="player-icone" data-player-action="next" aria-label="Próxima faixa">${icon('next')}</button><button type="button" class="player-icone player-mais" data-player-action="details" aria-label="Mais controles do player" aria-expanded="false" aria-controls="suiri-player-extras">${icon('settings')}</button><button type="button" class="player-icone" data-player-action="queue" aria-label="Abrir lista de músicas" aria-expanded="false" aria-controls="suiri-player-queue">${icon('list')}</button></div><div id="suiri-player-extras" class="player-extras oculto"><div class="player-rodape"><span id="suiri-player-status" role="status" aria-live="polite">Sua pausa começa aqui</span><div class="player-volume">${icon('volume')}<input type="range" min="0" max="100" step="1" value="100" id="suiri-player-volume" aria-label="Volume da música"></div></div></div><div id="suiri-player-queue" class="player-fila oculto"><div class="player-fila-topo"><strong>Sua biblioteca</strong><button type="button" data-player-action="only-favorites" class="player-favoritas-filtro" aria-pressed="false">${icon('heart')} Só favoritas</button></div><div id="suiri-player-lista"></div></div>`;
 if(male){document.querySelector('.painel-player-homem').replaceWith(root);}else{
  document.getElementById('mini-player-espaco-mulher')?.remove();document.getElementById('gaveta-favoritas-mulher')?.remove();document.getElementById('barra-topo-player-mulher').after(root);
 }
 const el=id=>document.getElementById(id),action=a=>root.querySelector(`[data-player-action="${a}"]`);
 const seek=el('suiri-player-seek'),volume=el('suiri-player-volume');let errorMessage='',bound=null,dragging=false,queueOpen=false;
 const format=t=>{const seconds=Number.isFinite(t)?Math.max(0,Math.floor(t)):0;return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
 function paintRange(input){input.style.setProperty('--range-pct',`${(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100}%`);}
 function list(){
  const out=el('suiri-player-lista');out.replaceChildren();const catalog=engine.obterCatalogo();
  const rows=catalog.map((item,index)=>({item,index})).filter(({item})=>!engine.soFavoritas||engine.favoritas.includes(item.arquivo));
  if(!rows.length){const p=document.createElement('p');p.textContent='Nenhuma favorita ainda. Use o coração para guardar suas músicas.';out.append(p);return;}
  rows.forEach(({item,index})=>{
   const b=document.createElement('button');b.type='button';b.className='player-faixa'+(index===engine.indiceAtual?' atual':'');
   b.innerHTML=icon(index===engine.indiceAtual&&!engine.audio?.paused?'pause':'play');const title=document.createElement('span');title.textContent=item.titulo;b.append(title);if(engine.favoritas.includes(item.arquivo))b.insertAdjacentHTML('beforeend',icon('heart'));
   b.onclick=()=>{errorMessage='';engine.carregarPorIndice(index,true);update();};out.append(b);
  });
 }
 function connect(){
  if(!engine.audio||bound===engine.audio)return;bound=engine.audio;
  const saved=Number(S.storage.getItem('suiri_player_volume'));if(S.storage.getItem('suiri_player_volume')!==null&&Number.isFinite(saved))bound.volume=Math.max(0,Math.min(1,saved));
  for(const event of ['timeupdate','loadedmetadata','durationchange','play','pause','ended','volumechange'])bound.addEventListener(event,()=>update(false));
  bound.addEventListener('loadstart',()=>{errorMessage='';update(false);});
  bound.addEventListener('error',()=>window.SuiriPlayer.reportarErro());
 }
 function update(rebuild=true){
  connect();const catalog=engine.obterCatalogo(),item=catalog[engine.indiceAtual],audio=engine.audio,playing=audio&&!audio.paused;
  el('suiri-faixa-titulo').textContent=item?.titulo||'Escolha sua trilha';
  action('toggle').innerHTML=icon(playing?'pause':'play');action('toggle').setAttribute('aria-label',playing?'Pausar':'Reproduzir');
  const favored=!!item&&engine.favoritas.includes(item.arquivo);action('favorite').setAttribute('aria-pressed',String(favored));action('favorite').setAttribute('aria-label',favored?'Remover faixa das favoritas':'Favoritar faixa');
  action('shuffle').setAttribute('aria-pressed',String(engine.modoAleatorio));action('only-favorites').setAttribute('aria-pressed',String(engine.soFavoritas));
  const duration=Number(audio?.duration),time=Number(audio?.currentTime)||0;seek.disabled=!Number.isFinite(duration)||duration<=0;
  if(!dragging)seek.value=seek.disabled?'0':String(time/duration*1000);
  seek.setAttribute('aria-valuetext',`${format(time)} de ${format(duration)}`);paintRange(seek);
  el('suiri-player-current').textContent=format(time);el('suiri-player-duration').textContent=format(duration);
  volume.value=String(Math.round((audio?.volume??1)*100));paintRange(volume);
  const status=errorMessage||(playing?'Tocando agora':audio?.src?'Pronto para ouvir':'Sua pausa começa aqui');if(el('suiri-player-status').textContent!==status)el('suiri-player-status').textContent=status;
  root.classList.toggle('tocando',!!playing);if(rebuild&&queueOpen)list();
 }
 window.SuiriPlayer={atualizar:update,reportarErro(){errorMessage='Não foi possível carregar esta faixa. Escolha outra na lista.';if(engine.audio)engine.audio.pause();update(false);}};
 const oldUpdate=engine.atualizarInterface;engine.atualizarInterface=function(...args){oldUpdate.apply(this,args);update();};
 const oldInit=engine.iniciar;engine.iniciar=function(...args){const result=oldInit.apply(this,args);connect();update();return result;};
 root.addEventListener('click',async e=>{
  const button=e.target.closest('[data-player-action]');if(!button)return;const type=button.dataset.playerAction;
  if(!S.memberId())return;
  if(!engine.audio)engine.iniciar();
  try{
   if(type==='toggle'){window.SuiriAudioViz?.ativar();if(engine.audio.paused){errorMessage='';await engine.audio.play();}else engine.audio.pause();}
   if(type==='previous'){errorMessage='';(female?engine.anterior:engine.retroceder).call(engine);}
   if(type==='next'){errorMessage='';(female?engine.proxima:engine.avancar).call(engine);}
   if(type==='shuffle')engine.alternarAleatorio();
   if(type==='favorite')engine.alternarFavorito();
   if(type==='details'){const extras=el('suiri-player-extras');extras.classList.toggle('oculto');button.setAttribute('aria-expanded',String(!extras.classList.contains('oculto')));}
   if(type==='queue'){queueOpen=!queueOpen;el('suiri-player-queue').classList.toggle('oculto',!queueOpen);button.setAttribute('aria-expanded',String(queueOpen));}
   if(type==='only-favorites'){
    if(engine.soFavoritas)engine.soFavoritas=false;
    else if(!engine.favoritas.length)window.mostrarToast?.('Favorite uma música usando o coração para criar sua lista.','info');
    else (female?engine.tocarSoFavoritas:engine.tocarApenasFavoritas).call(engine);
   }
   update();
  }catch{errorMessage='Toque em reproduzir para tentar novamente.';update(false);}
 });
 seek.addEventListener('pointerdown',()=>{dragging=true;});seek.addEventListener('pointerup',()=>{dragging=false;});seek.addEventListener('pointercancel',()=>{dragging=false;});
 seek.addEventListener('input',()=>{if(!seek.disabled&&engine.audio&&Number.isFinite(engine.audio.duration)){engine.audio.currentTime=Number(seek.value)/1000*engine.audio.duration;el('suiri-player-current').textContent=format(engine.audio.currentTime);}paintRange(seek);});
 volume.addEventListener('input',()=>{const value=Number(volume.value)/100;if(engine.audio)engine.audio.volume=value;if(S.memberId())S.storage.setItem('suiri_player_volume',String(value));paintRange(volume);});
 update();
})();
