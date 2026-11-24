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
 const main=await load('index.html'),w=main.w;
 pages.push({page:'index.html',errors:main.errors.slice()});
 await test('bootstrap mostra o lar somente após sessão e perfil',()=>{assert(!w.document.getElementById('tela-app').classList.contains('oculto'));assert.equal(w.perfilAtual.id,uid);assert.equal(w.document.getElementById('nome-familia-topo').textContent,'Lar de Teste');});
 await test('zero IDs duplicados após renderização',()=>{const ids=[...w.document.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size);});
 await test('todos os handlers estáticos têm função definida',()=>{for(const el of w.document.querySelectorAll('*'))for(const attr of el.attributes)if(attr.name.startsWith('on'))for(const match of attr.value.matchAll(/window\.([A-Za-z_$][\w$]*)\s*\(/g))assert.equal(typeof w[match[1]],'function',match[1]);});
 await test('todas as seis seções abrem e histórico acompanha',()=>{for(const screen of ['meuespaco','inicio','mercado','financeiro','calendario','familia']){w.navegarParaTela(screen);assert(!w.document.getElementById('secao-'+screen).classList.contains('oculto'));assert.equal(w.location.hash,'#'+screen);}});
 await test('modo escuro do painel é opcional e persiste',()=>{w.abrirConfiguracoesSuiri();assert(!w.document.getElementById('modal-suiri-config').classList.contains('oculto'));w.Suiri.theme.set('escuro');assert.equal(w.document.documentElement.dataset.theme,'dark');assert.equal(w.localStorage.getItem('suiri:v7:tema-principal'),'escuro');assert.equal(w.document.getElementById('suiri-config-tema').value,'escuro');w.Suiri.theme.set('claro');assert.equal(w.document.documentElement.dataset.theme,'light');});
 await test('dados pessoais isolados entre pessoas',()=>{w.Suiri.storage.setItem('suiri_radar_fem','{"segredo":"A"}');const original=w.perfilAtual;w.perfilAtual={id:'profile-b'};assert.equal(w.Suiri.storage.getItem('suiri_radar_fem'),null);w.Suiri.reloadPersonal();assert(!w.dadosRadarFeminilidade.segredo);w.perfilAtual=original;w.Suiri.reloadPersonal();assert.equal(w.dadosRadarFeminilidade.segredo,'A');});
 await test('crop confirma sem variáveis indefinidas',async()=>{w.SuiriCrop.carregarImagem({width:400,height:300},uid);assert.equal(await w.confirmarCropImagem(),undefined);assert(w.__calls.some(x=>x.table==='membros'&&x.op==='update'));});
 await test('rejeição do banco não anuncia baixa bem-sucedida',async()=>{const toast=w.mostrarToast,confirm=w.confirmarAcaoSuiri;const messages=[];w.mostrarToast=(...x)=>messages.push(x);w.confirmarAcaoSuiri=async()=>true;await w.marcarItemAgendaComoLiquidado('bill-test');assert(messages.some(x=>x[1]==='erro'));assert(!messages.some(x=>/confirmad/i.test(x[0])&&x[1]!=='erro'));w.mostrarToast=toast;w.confirmarAcaoSuiri=confirm;});
 await test('cofre com HTML é exibido como texto',()=>{w.cofresCompartilhadosLista=[{id:'cofre-test',titulo:'<img src=x onerror="alert(1)">',valor_alvo:20,valor_acumulado:0}];w.renderizarCofresNaTela();const c=w.document.getElementById('lista-cofres-compartilhados');assert(!c.querySelector('img[src="x"]'));assert(c.textContent.includes('<img'));});
 await test('argumentos de evento suportam apóstrofo sem injeção',()=>{const div=w.document.createElement('div');w.__injected=false;const name="O'Connor\");window.__injected=true;//";div.innerHTML=`<button onclick="window.__received=${w.Suiri.jsArg(name)}">Teste</button>`;div.querySelector('button').click();assert.equal(w.__received,name);assert.equal(w.__injected,false);});
 await test('fila offline mantém pendência quando o banco recusa',async()=>{await w.adicionarAFilaOffline({tabela:'membros',tipoOperacao:'update',dados:{avatar_url:'data:image/jpeg;base64,WA=='},condicao:{id:uid}});w.__failWrites=true;await w.processarFilaOffline();await w.atualizarStatusOfflineSuiri();assert(w.document.getElementById('suiri-offline-status').textContent.includes('1 pendência'));w.__failWrites=false;await w.processarFilaOffline();await w.atualizarStatusOfflineSuiri();assert(w.document.getElementById('suiri-offline-status').textContent.includes('0 pendência'));});
 await test('datas mensais e meia-noite corretas',()=>{assert.equal(w.Suiri.monthDate('2027-01-31',1),'2027-02-28');assert.equal(w.Suiri.monthDate('2028-01-31',1),'2028-02-29');const d=new Date(w.eval("calcularProximaDataExecucao('diaria_24h','00:00')"));assert.equal(d.getHours(),0);});
 await test('recuperação de senha tem fluxo de envio',async()=>{w.abrirModalRecuperarSenha();w.document.getElementById('recuperar-email-input').value='teste@example.invalid';await w.enviarLinkRecuperacaoSenha();assert(w.document.getElementById('modal-recuperar-senha').classList.contains('oculto'));});
 await test('páginas gerais não carregam módulos íntimos',()=>{const scripts=[...w.document.scripts].map(x=>x.src);assert(!scripts.some(x=>/features\/(women|men)/.test(x)));});
 const destination='10000000-0000-4000-8000-000000000003';
 async function transferUI(work){
  const rpc=w.__cli.rpc,toast=w.mostrarToast,messages=[];w.mostrarToast=(...args)=>messages.push(args);
  try{await work({rpc,messages});}finally{w.__cli.rpc=rpc;w.mostrarToast=toast;}
 }
 await test('transferência aceita vírgula e bloqueia toque duplo enquanto aguarda confirmação',()=>transferUI(async({rpc,messages})=>{
  let resolveRequest;const calls=[];
  w.__cli.rpc=async(name,args)=>{if(name!=='transferir_saldo_familiar_v71')return rpc(name,args);calls.push(args);return new Promise(resolve=>resolveRequest=()=>resolve({data:{sucesso:true,operacao_id:args.p_operacao_id}}));};
  await w.abrirModalTransferirSaldo();w.document.getElementById('transferencia-destinatario-id').value=destination;w.document.getElementById('transferencia-valor').value='1,20';
  const first=w.confirmarTransferenciaSaldo();await w.confirmarTransferenciaSaldo();await new Promise(r=>setImmediate(r));
  assert.equal(calls.length,1);assert.equal(calls[0].p_valor,'1.20');assert(w.document.getElementById('transferencia-confirmar').disabled);
  resolveRequest();await first;assert(w.document.getElementById('modal-transferir-saldo').classList.contains('oculto'));assert(messages.some(x=>x[0]==='Transferência confirmada.'));
  await w.confirmarTransferenciaSaldo();assert.equal(calls.length,1);
 }));
 await test('queda de conexão recupera valor, destinatário e identificador ao reabrir a janela',()=>transferUI(async({rpc,messages})=>{
  let saved;w.__cli.rpc=async(name,args)=>{if(name!=='transferir_saldo_familiar_v71')return rpc(name,args);saved=args;throw new Error('Conexão perdida');};
  await w.abrirModalTransferirSaldo();w.document.getElementById('transferencia-destinatario-id').value=destination;w.document.getElementById('transferencia-valor').value='2';await w.confirmarTransferenciaSaldo();
  assert(!messages.some(x=>x[0]==='Transferência confirmada.'));w.fecharModalTransferirSaldo();await w.abrirModalTransferirSaldo();
  assert.equal(w.document.getElementById('transferencia-valor').value,'2.00');assert(w.document.getElementById('transferencia-valor').disabled);assert.equal(w.document.getElementById('transferencia-confirmar').textContent,'Consultar novamente');
  w.__cli.rpc=async(name,args)=>{if(name!=='transferir_saldo_familiar_v71')return rpc(name,args);assert.equal(args.p_operacao_id,saved.p_operacao_id);return {data:{sucesso:true,operacao_id:args.p_operacao_id,repetida:true}};};
  await w.confirmarTransferenciaSaldo();assert(messages.some(x=>/Nenhum novo débito/.test(x[0])));
 }));
 await test('resposta sem confirmação não fecha a janela nem anuncia sucesso',()=>transferUI(async({rpc,messages})=>{
  w.__cli.rpc=async(name,args)=>name==='transferir_saldo_familiar_v71'?{data:null,error:null}:rpc(name,args);
  await w.abrirModalTransferirSaldo();w.document.getElementById('transferencia-destinatario-id').value=destination;w.document.getElementById('transferencia-valor').value='3';await w.confirmarTransferenciaSaldo();
  assert(!w.document.getElementById('modal-transferir-saldo').classList.contains('oculto'));assert(!messages.some(x=>x[0]==='Transferência confirmada.'));
  w.__cli.rpc=async(name,args)=>name==='transferir_saldo_familiar_v71'?{data:{sucesso:true,operacao_id:args.p_operacao_id}}:rpc(name,args);await w.confirmarTransferenciaSaldo();
 }));
 await test('falha ao recarregar o extrato não é apresentada como falha da transferência já confirmada',()=>transferUI(async({rpc,messages})=>{
  const wallet=w.carregarCarteiraIndividual;w.carregarCarteiraIndividual=async()=>{throw new Error('Falha no refresh');};
  try{
   w.__cli.rpc=async(name,args)=>name==='transferir_saldo_familiar_v71'?{data:{sucesso:true,operacao_id:args.p_operacao_id}}:rpc(name,args);
   await w.abrirModalTransferirSaldo();w.document.getElementById('transferencia-destinatario-id').value=destination;w.document.getElementById('transferencia-valor').value='4';await w.confirmarTransferenciaSaldo();
   assert(messages.some(x=>x[0]==='Transferência confirmada.'));assert(messages.some(x=>/recarregar o extrato/.test(x[0])));assert(!messages.some(x=>x[1]==='erro'));
  }finally{w.carregarCarteiraIndividual=wallet;}
 }));
 await test('troca de conta durante a chamada não exibe confirmação no perfil seguinte',()=>transferUI(async({rpc,messages})=>{
  const user=w.usuarioAtual,profile=w.perfilAtual;let release;
  w.__cli.rpc=async(name,args)=>name==='transferir_saldo_familiar_v71'?new Promise(resolve=>release=()=>resolve({data:{sucesso:true,operacao_id:args.p_operacao_id}})):rpc(name,args);
  await w.abrirModalTransferirSaldo();w.document.getElementById('transferencia-destinatario-id').value=destination;w.document.getElementById('transferencia-valor').value='5';const request=w.confirmarTransferenciaSaldo();await new Promise(r=>setImmediate(r));
  w.usuarioAtual={id:destination};w.perfilAtual={id:destination};release();await request;assert(!messages.some(x=>x[0]==='Transferência confirmada.'));
  w.usuarioAtual=user;w.perfilAtual=profile;w.fecharModalTransferirSaldo();
 }));
 await new Promise(r=>setTimeout(r,250));pages[0].errors=main.errors.slice();main.dom.window.close();
 const anon=await load('index.html',false);
 await test('sem sessão, painel fica oculto e login disponível',()=>{assert(anon.w.document.getElementById('tela-app').classList.contains('oculto'));assert(!anon.w.document.getElementById('tela-login').classList.contains('oculto'));});anon.dom.window.close();
 for(const name of ['mulher.html','homem.html','jogos.html']){const page=await load(name);pages.push({page:name,errors:page.errors.slice()});page.dom.window.close();}
 assert(pages.every(x=>!x.errors.length),JSON.stringify(pages));
 fs.mkdirSync('.test-results',{recursive:true});fs.writeFileSync('.test-results/dom-v7.json',JSON.stringify({engine:'JSDOM, IndexedDB sintético e Supabase simulado; não é navegador visual',pages,checks},null,2));console.log(JSON.stringify({pages,checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
