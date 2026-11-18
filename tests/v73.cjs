const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve('.');
const uid='10000000-0000-4000-8000-000000000001',fam='20000000-0000-4000-8000-000000000001';
const checks=[],pages=[];
function setup(w,logged=true){
 w.__calls=[];w.__errors=[];w.__failWrites=false;w.__toasts=[];
 w.indexedDB=new IDBFactory();w.structuredClone=structuredClone;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.scrollTo=()=>{};w.confirm=()=>true;w.alert=()=>{};
 w.URL.createObjectURL=()=> 'blob:synthetic';w.URL.revokeObjectURL=()=>{};
 Object.defineProperty(w.crypto,'randomUUID',{value:()=>crypto.randomUUID()});
 Object.defineProperty(w.navigator,'serviceWorker',{value:{register:async()=>({scope:'http://suiri.test/',update:async()=>{}}),getRegistrations:async()=>[]}});
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]||(()=>{})});
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/jpeg;base64,ZmFrZQ==';
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};w.HTMLMediaElement.prototype.pause=function(){};
 w.Audio=class extends w.EventTarget{constructor(){super();this.paused=true;this.duration=200;this.currentTime=0;}load(){}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}};
 w.__user={id:uid,email:'teste@example.invalid',user_metadata:{}};
 w.__tables={membros:[{id:uid,familia_id:fam,nome:'Teste Adulto',email:'teste@example.invalid',papel:'adm',genero:'feminino',sexo:'feminino',possui_cartao:true,eh_kids:false,xp_total:100,permissoes:{mercado:true,gastos:true,missoes:true}},{id:'10000000-0000-4000-8000-000000000003',familia_id:fam,nome:'Teste Kids',papel:'dependente',eh_kids:true,xp_total:20}],familias:[{id:fam,nome_familia:'Lar de Teste'}]};
 const from=table=>{
  const state={table,op:'select',filters:[],payload:null,single:false,returning:false};
  const builder=new Proxy(state,{get(t,k){
   if(k==='then')return(a,b)=>Promise.resolve().then(()=>{
    w.__calls.push(JSON.parse(JSON.stringify(state)));
    if(state.op!=='select'&&w.__failWrites)return {data:null,error:{message:'Recusa sintética de gravação',code:'42501'}};
    let rows=(w.__tables[table]||[]).filter(row=>state.filters.every(([key,v])=>String(row[key])===String(v)));
    if(state.op==='update'){rows.forEach(row=>Object.assign(row,state.payload));}
    if(state.op==='insert'||state.op==='upsert'){rows=(Array.isArray(state.payload)?state.payload:[state.payload]).map(x=>({id:crypto.randomUUID(),...x}));w.__tables[table]||=[];w.__tables[table].push(...rows);}
    if(state.op==='delete')w.__tables[table]=(w.__tables[table]||[]).filter(row=>!rows.includes(row));
    const data=state.single?(rows[0]||null):rows;return {data,error:null};
   }).then(a,b);
   return(...args)=>{if(['insert','update','upsert','delete'].includes(k)){state.op=k;state.payload=args[0];}if(k==='eq')state.filters.push(args);if(k==='select')state.returning=true;if(k==='single'||k==='maybeSingle')state.single=true;return builder;};
  }});return builder;
 };
 const cli={from,auth:{getSession:async()=>({data:{session:logged?{user:w.__user}:null},error:null}),onAuthStateChange:fn=>{w.__authEvent=fn;return {data:{subscription:{unsubscribe(){}}}}},signInWithPassword:async()=>({data:{user:w.__user},error:null}),signOut:async()=>({error:null}),resetPasswordForEmail:async()=>({data:{},error:null}),updateUser:async()=>({data:{user:w.__user},error:null}),signUp:async()=>({data:{user:{id:crypto.randomUUID()},session:{}},error:null})},
  rpc:async(name,args)=>{w.__calls.push({rpc:name,args});if(name==='suiri_extrato_v7')return {data:[],error:null};return {data:null,error:{message:'RPC de teste indisponível',code:'PGRST202'}};},functions:{invoke:async()=>({data:null,error:{message:'não implantada'}})},channel:name=>{w.__calls.push({channel:name});return {on(){return this},subscribe(){return this}}},removeChannel:()=>w.__calls.push({removeChannel:true})};
 w.supabase={createClient:()=>cli};
 w.Chart=class{constructor(){}destroy(){}update(){}toBase64Image(){return ''}};
 w.__cli=cli;
}
class Resources extends ResourceLoader{fetch(url){const u=new URL(url);if(u.hostname!=='suiri.test')return Promise.resolve(Buffer.from(''));if(u.pathname.includes('/vendor/'))return Promise.resolve(Buffer.from(''));const filename=path.join(root,u.pathname);try{return Promise.resolve(fs.readFileSync(filename))}catch{return null}}}
async function load(name,logged=true){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Could not parse CSS|Not implemented: navigation/.test(e.message))errors.push(e.message)});
 const dom=new JSDOM(fs.readFileSync(path.join(root,name),'utf8'),{url:'http://suiri.test/'+name,runScripts:'dangerously',resources:new Resources(),pretendToBeVisual:true,virtualConsole:vc,beforeParse:w=>setup(w,logged)});
 await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));
 await new Promise(r=>setTimeout(r,600));
 return {dom,w:dom.window,errors};
}
async function test(name,fn){await fn();checks.push({name,passed:true});}
(async()=>{
 const main=await load('index.html'),w=main.w,d=w.document;w.localStorage.setItem('suiri:v72:apoio:'+w.perfilAtual.id,String(Date.now()));
 await test('Pense abre preenchido e registra a data local somente ao exibir',async()=>{
  d.querySelectorAll('.modal-overlay').forEach(el=>el.classList.add('oculto'));
  w.Suiri.Pense.agendar();await new Promise(r=>setTimeout(r,750));
  const modal=d.getElementById('modal-pilula-dia');assert(!modal.classList.contains('oculto'));assert(d.querySelector('#pilula-frase-filosofica blockquote').textContent.length>30);
  const key='suiri:pense:v73:'+w.perfilAtual.id;assert.equal(w.localStorage.getItem(key),w.Suiri.today());
  w.fecharModalPilulaDia();w.Suiri.Pense.agendar();await new Promise(r=>setTimeout(r,750));assert(modal.classList.contains('oculto'));
  assert.equal(w.abrirModalPilulaDia(),true);assert(!modal.classList.contains('oculto'));w.fecharModalPilulaDia();
  w.localStorage.setItem(key,'2000-01-01');d.getElementById('modal-nova-missao').classList.remove('oculto');w.Suiri.Pense.agendar();await new Promise(r=>setTimeout(r,750));assert(modal.classList.contains('oculto'));assert.equal(w.localStorage.getItem(key),'2000-01-01');d.getElementById('modal-nova-missao').classList.add('oculto');
  w.Suiri.Pense.agendar();await new Promise(r=>setTimeout(r,750));assert(!modal.classList.contains('oculto'));w.fecharModalPilulaDia();
 });
 await test('missões de todos chegam aos dois adultos, coletivas em Todas e individuais em Minhas; Kids separados',async()=>{
  const base={familia_id:fam,criado_por:uid,status:'pendente',prioridade:1,icone:'⭐',xp_recompensa:10,recorrencia_tipo:'unica',concluidos_por_array:[],falhados_por_array:[],subitens:[]};
  const kid='10000000-0000-4000-8000-000000000003',other='10000000-0000-4000-8000-000000000004';
  w.listaMembrosFamilia.push({id:other,nome:'Outro adulto',papel:'adulto',eh_kids:false});
  w.__tables.missoes=[
   {...base,id:'a',titulo:'Coletiva casa',escopo:'casa',atribuido_a:null},
   {...base,id:'b',titulo:'Coletiva legado',escopo:'todos',atribuido_a:'todos'},
   {...base,id:'c',titulo:'Apenas kids',escopo:'kids',destinatario_kids:'todos_kids',atribuido_a:null},
   {...base,id:'d',titulo:'Infantil individual',escopo:'casa',atribuido_a:kid},
   {...base,id:'e',titulo:'Pessoal autor',escopo:'pessoal',atribuido_a:uid},
   {...base,id:'f',titulo:'Atribuída ao outro adulto',escopo:'casa',atribuido_a:other},
   {...base,id:'g',titulo:'Pessoal do outro adulto',escopo:'individual',criado_por:other,atribuido_a:uid}
  ];
  for(const id of [uid,other]){
   w.perfilAtual={id,familia_id:fam,papel:'adulto',eh_kids:false};w.modoKidsAtivo=false;await w.carregarMissoesDoDia();
   for(const filtro of ['todas','minhas']){
    w.filtrarMissoesPorAba(filtro);const text=d.getElementById('lista-missoes-dia').textContent;
    assert.equal(text.includes('Coletiva casa'),filtro==='todas');assert.equal(text.includes('Coletiva legado'),filtro==='todas');
    assert(!text.includes('Apenas kids'));assert(!text.includes('Infantil individual'));
    assert.equal(text.includes('Pessoal autor'),id===uid);
    assert.equal(text.includes('Atribuída ao outro adulto'),id===other);
    assert.equal(text.includes('Pessoal do outro adulto'),id===other);
   }
  }
  w.perfilAtual={id:kid,familia_id:fam,papel:'dependente',eh_kids:true};w.modoKidsAtivo=true;await w.carregarMissoesDoDia();const text=d.getElementById('lista-missoes-kids-container').textContent;assert(text.includes('Apenas kids'));assert(text.includes('Infantil individual'));assert(!text.includes('Coletiva casa'));assert(!text.includes('Coletiva legado'));assert.equal(d.getElementById('lista-missoes-dia').textContent,'');
  assert.equal(w.abrirModalPilulaDia(),false);
 });
 await test('reativação ignora perfis sem permissão e missões de outro perfil',async()=>{
  const perfil={id:uid,familia_id:fam,papel:'adulto',permissoes:{missoes:false}};
  w.perfilAtual=perfil;w.modoKidsAtivo=false;
  const vencida={familia_id:fam,status:'concluida',prioridade:1,recorrencia_tipo:'diaria_24h',proxima_execucao:'2025-01-01T04:00:00Z',suiri_ocorrencia:2};
  w.__tables.missoes=[
   {...vencida,id:'coletiva',titulo:'Missão vencida da casa',escopo:'casa',atribuido_a:null},
   {...vencida,id:'alheia',titulo:'Missão vencida de outra pessoa',escopo:'casa',atribuido_a:'10000000-0000-4000-8000-000000000004'},
   {...vencida,id:'minha',titulo:'Minha missão vencida',escopo:'pessoal',criado_por:uid,atribuido_a:uid}
  ];
  const chamadas=[];const operacao=w.Suiri.operation;
  w.Suiri.operation=async(kind,payload)=>{
   chamadas.push(payload.id);return {mission:{status:'pendente',proxima_execucao:null,suiri_ocorrencia:3}};
  };
  try{
   await w.carregarMissoesDoDia();await w.verificarReativacaoAutomaticaMissoes();
   assert.deepEqual(chamadas,[]);
   perfil.permissoes.missoes=true;
   await Promise.all([w.verificarReativacaoAutomaticaMissoes(),w.verificarReativacaoAutomaticaMissoes()]);
   assert.deepEqual(chamadas,['coletiva','minha']);
   const card=d.getElementById('card-missao-bloco-minha');
   assert(card.querySelector('button[data-missao-acao="complete"]'));
  } finally {w.Suiri.operation=operacao;}
 });
 main.dom.window.close();
 const male=await load('homem.html'),m=male.w;
 await test('estilos Xbox e PlayStation têm seleção persistida por membro',async()=>{
  m.perfilAtual.genero='masculino';m.renderizarEsqueletoEspacoMasculino();await new Promise(r=>setTimeout(r,10));
  const root=m.document.documentElement;m.Suiri.theme.apply();await new Promise(r=>setTimeout(r,10));assert.equal(root.dataset.console,'xbox');
  assert.equal(m.document.querySelectorAll('#seletor-console button').length,2);
  m.escolherEstiloMasculino('xbox');assert.equal(root.dataset.console,'xbox');assert.equal(m.document.querySelector('[data-console-choice="xbox"]').getAttribute('aria-pressed'),'true');
  root.dataset.theme='light';await new Promise(r=>setTimeout(r,10));assert.equal(root.dataset.console,'xbox');
  m.escolherEstiloMasculino('playstation');m.Suiri.theme.apply();await new Promise(r=>setTimeout(r,10));assert.equal(root.dataset.console,'playstation');
  assert.equal(m.localStorage.getItem('suiri:v73:console:'+m.perfilAtual.id),'playstation');
 });
 await test('barras masculinas mantêm posições fracionárias e preenchimento',()=>{
  const input=m.document.getElementById('range-humor-diario');assert.equal(input.step,'0.01');input.value='5.37';input.dispatchEvent(new m.Event('input',{bubbles:true}));assert.equal(input.value,'5.37');assert(input.style.getPropertyValue('--range-pct').startsWith('48.55'));assert.equal(m.obterDescricaoNotaEstadoDiario('humor',5.37),'Neutro / Equilibrado');
 });male.dom.window.close();
 const female=await load('mulher.html'),f=female.w;
 await test('barras femininas usam interação contínua mantendo rótulos coerentes',async()=>{
  f.renderizarEsqueletoEspacoMulher();await new Promise(r=>setTimeout(r,10));const input=f.document.getElementById('range-vitalidade-fem');assert.equal(input.step,'0.01');input.value='3.24';input.dispatchEvent(new f.Event('input',{bubbles:true}));assert.equal(input.value,'3.24');assert.equal(f.obterDescricaoNotaFeminilidade('vitalidade',3.24),'Equilíbrio / Estável');
 });female.dom.window.close();
 console.log(JSON.stringify({v73:checks},null,2));fs.writeFileSync('.test-results/v73.json',JSON.stringify({engine:'DOM e Supabase simulados; sem gravações em contas reais',checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
