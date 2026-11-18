/* Visualização de áudio real. Não usa microfone e não altera o som no modo local. */
(function(){
 const canvas=document.getElementById('suiri-audio-visualizer');if(!canvas)return;
 const engine=window.PlayerMulher||window.PlayerHomem,ctx=canvas.getContext('2d'),AudioCtx=window.AudioContext||window.webkitAudioContext;
 let context=null,analyser=null,source=null,bound=null,raf=0,disabled=false,data=null;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 function draw(){
  const active=analyser&&engine.audio&&!engine.audio.paused&&!engine.audio.muted&&!document.hidden;
  if(active)analyser.getByteFrequencyData(data);
  ctx.clearRect(0,0,canvas.width,canvas.height);const color=getComputedStyle(document.documentElement).getPropertyValue('--v73-accent').trim()||'#107c41';ctx.fillStyle=color;
  const bars=16,gap=3,width=(canvas.width-gap*(bars-1))/bars;
  for(let i=0;i<bars;i++){
   let level=0;if(active){const start=Math.floor(i*data.length*.7/bars),end=Math.max(start+1,Math.floor((i+1)*data.length*.7/bars));for(let j=start;j<end;j++)level+=data[j];level=level/(end-start)/255;}
   const height=Math.max(4,level*canvas.height*.85);ctx.globalAlpha=active ? .65+level*.35 : .28;ctx.fillRect(i*(width+gap),(canvas.height-height)/2,width,height);
  }
  ctx.globalAlpha=1;canvas.dataset.state=active?'ativo':disabled?'indisponivel':'pausado';
 }
 function stop(){cancelAnimationFrame(raf);raf=0;draw();}
 function frame(){draw();if(engine.audio&&!engine.audio.paused&&!document.hidden&&!reduce.matches&&analyser)raf=requestAnimationFrame(frame);else raf=0;}
 function start(){if(!raf&&!reduce.matches)frame();else draw();}
 function setup(){
  if(!engine?.audio||bound===engine.audio)return;bound=engine.audio;
  bound.addEventListener('play',()=>{if(context?.state==='running')start();else draw();});bound.addEventListener('pause',stop);bound.addEventListener('ended',stop);
 }
 function attach(node){if(source)return;source=node;analyser=context.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.78;data=new Uint8Array(analyser.frequencyBinCount);source.connect(analyser);start();}
 window.SuiriAudioViz={
  async ativar(){
   setup();if(disabled||!AudioCtx||!engine.audio){disabled=!AudioCtx;draw();return false;}
   try{
    context ||= new AudioCtx();await context.resume();if(source){start();return true;}
    const audio=engine.audio,url=new URL(audio.src,location.href);
    if(['https:','http:'].includes(location.protocol)&&url.origin===location.origin){
     const node=context.createMediaElementSource(audio);attach(node);analyser.connect(context.destination);return true;
    }
    // A captura não redireciona a saída original: uma restrição do file:// não silencia a música.
    const capture=audio.captureStream||audio.mozCaptureStream;if(!capture){disabled=true;draw();return false;}
    const stream=capture.call(audio);const connect=()=>{if(!stream.getAudioTracks().length)return;if(source){source.disconnect();source=null;}attach(context.createMediaStreamSource(stream));};
    connect();stream.addEventListener?.('addtrack',connect);return true;
   }catch{disabled=true;draw();return false;}
  },
  estado:()=>({supported:!!AudioCtx,active:!!analyser,disabled}),desenhar:draw
 };
 const original=engine.iniciar;engine.iniciar=function(...args){const result=original.apply(this,args);setup();draw();return result;};
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 window.addEventListener('pagehide',event=>{engine.audio?.pause();stop();if(!event.persisted)context?.close().catch(()=>{});});setup();draw();
})();
