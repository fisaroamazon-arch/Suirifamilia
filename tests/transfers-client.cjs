const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('src/services/transfers.js','utf8'),checks=[];
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002',f='20000000-0000-4000-8000-000000000001';
function setup(storage=new Map()){
 const locks=new Map(),calls=[];
 const w={usuarioAtual:{id:a},perfilAtual:{id:a},familiaAtualId:f,Suiri:{once(key,fn){if(locks.has(key))return locks.get(key);const p=Promise.resolve().then(fn).finally(()=>locks.delete(key));locks.set(key,p);return p;}}};
 const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 w.cliente={rpc:async(name,args)=>{calls.push(args);return {data:{sucesso:true,operacao_id:args.p_operacao_id},error:null};}};
 const sandbox={window:w,localStorage:local,crypto,navigator:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);
 return {w,t:w.Suiri.transfer,calls,storage,local,sandbox};
}
const reject=async fn=>{let e;try{await fn()}catch(err){e=err}assert(e,'Expected rejection');return e;};
async function test(name,fn){await fn();checks.push({name,passed:true});}
(async()=>{
 await test('valores em reais e centavos são normalizados sem arredondar frações',async()=>{
  const {t}=setup();assert.equal(t.amount('0001,2'),'1.20');assert.equal(t.amount('0.01'),'0.01');
  for(const value of ['','NaN','Infinity','1e2','-1','0','0.001','1,234','1.20xyz','90071992547409.92'])await reject(()=>t.amount(value));
 });
 await test('perfil ativo diferente da conta autenticada não envia transferência',async()=>{const s=setup();s.w.perfilAtual.id=b;await reject(()=>s.t.submit(b,'1'));assert.equal(s.calls.length,0);});
 await test('identificador é persistido antes da chamada e removido após confirmação explícita',async()=>{
  const s=setup();s.w.cliente.rpc=async(name,args)=>{assert.equal(s.t.pending().id,args.p_operacao_id);assert.equal(args.p_valor,'1.20');assert.equal(name,'transferir_saldo_familiar_v71');return {data:{sucesso:true,operacao_id:args.p_operacao_id}};};
  assert((await s.t.submit(b,'1,2')).sucesso);assert.equal(s.storage.size,0);
 });
 await test('envios simultâneos no mesmo contexto compartilham a mesma solicitação',async()=>{
  const s=setup();let release;s.w.cliente.rpc=(name,args)=>{s.calls.push(args);return new Promise(resolve=>release=()=>resolve({data:{sucesso:true,operacao_id:args.p_operacao_id}}));};
  const one=s.t.submit(b,'1'),two=s.t.submit(b,'1');assert.equal(one,two);
  await new Promise(resolve=>setImmediate(resolve));assert.equal(s.calls.length,1);release();await Promise.all([one,two]);
 });
 await test('envio simultâneo com outro valor não recebe confirmação da primeira solicitação',async()=>{
  const s=setup();const first=s.t.submit(b,'1');await reject(()=>s.t.submit(b,'2'));await first;assert.equal(s.calls.length,1);
 });
 await test('resposta nula preserva pendência e a próxima consulta reutiliza o ID',async()=>{
  const s=setup();s.w.cliente.rpc=async(name,args)=>{s.calls.push(args);return {data:null,error:null};};
  await reject(()=>s.t.submit(b,'2'));const id=s.t.pending().id;
  s.w.cliente.rpc=async(name,args)=>{assert.equal(args.p_operacao_id,id);return {data:{sucesso:true,operacao_id:id}};};assert((await s.t.submit(b,'2')).sucesso);
 });
 await test('confirmação perdida e recarga retomam a operação sem novo efeito financeiro',async()=>{
  const storage=new Map(),confirmed=new Map();let effects=0;
  const first=setup(storage);first.w.cliente.rpc=async(name,args)=>{effects++;confirmed.set(args.p_operacao_id,{sucesso:true,operacao_id:args.p_operacao_id});throw new Error('Conexão perdida depois do commit');};
  await reject(()=>first.t.submit(b,'5'));const id=first.t.pending().id;
  const reloaded=setup(storage);reloaded.w.cliente.rpc=async(name,args)=>{assert.equal(args.p_operacao_id,id);return {data:{...confirmed.get(id),repetida:true}};};
  assert((await reloaded.t.submit(b,'5')).repetida);assert.equal(effects,1);assert.equal(storage.size,0);
 });
 await test('trocar valor enquanto há pendência não cria uma nova operação',async()=>{
  const s=setup();s.w.cliente.rpc=async()=>({data:null});await reject(()=>s.t.submit(b,'5'));const id=s.t.pending().id;
  await reject(()=>s.t.submit(b,'6'));assert.equal(s.t.pending().id,id);
 });
 await test('recusa explícita do servidor libera a pendência e apresenta erro',async()=>{
  const s=setup();s.w.cliente.rpc=async()=>({data:{sucesso:false,mensagem:'Saldo insuficiente'}});
  assert.equal((await reject(()=>s.t.submit(b,'5'))).message,'Saldo insuficiente');assert.equal(s.storage.size,0);
 });
 await test('RPC ainda não instalada mantém o mesmo identificador para a próxima consulta',async()=>{
  const s=setup();s.w.cliente.rpc=async()=>({error:{code:'PGRST202'}});assert((await reject(()=>s.t.submit(b,'5'))).message.includes('03_TRANSFERENCIAS_V71.sql'));assert(s.t.pending().id);
 });
 await test('pendência corrompida não é descartada nem gera envio',async()=>{
  const s=setup();const key=`suiri:v71:transfer:${a}:${f}:${a}`;s.storage.set(key,'invalido');await reject(()=>s.t.submit(b,'5'));assert.equal(s.calls.length,0);assert.equal(s.storage.get(key),'invalido');
 });
 await test('falha no armazenamento impede envio sem identificador recuperável',async()=>{
  const s=setup();s.local.setItem=()=>{throw new Error('Storage cheio')};await reject(()=>s.t.submit(b,'5'));assert.equal(s.calls.length,0);
 });
 await test('resposta de outra operação não anuncia confirmação e preserva pendência',async()=>{
  const s=setup();s.w.cliente.rpc=async()=>({data:{sucesso:true,operacao_id:crypto.randomUUID()}});await reject(()=>s.t.submit(b,'5'));assert(s.t.pending());
 });
 await test('pendência fica separada quando outra conta acessa o mesmo dispositivo',async()=>{
  const s=setup();s.w.cliente.rpc=async()=>({data:null});await reject(()=>s.t.submit(b,'5'));const id=s.t.pending().id;
  s.w.usuarioAtual.id=b;s.w.perfilAtual.id=b;assert.equal(s.t.pending(),null);s.w.usuarioAtual.id=a;s.w.perfilAtual.id=a;assert.equal(s.t.pending().id,id);
 });
 await test('Web Locks é usado quando disponível para coordenar abas do navegador',async()=>{
  const s=setup();let requests=0;s.sandbox.navigator.locks={request:async(key,fn)=>{requests++;return fn();}};await s.t.submit(b,'1');assert.equal(requests,1);
 });
 const result={engine:'JavaScript/VM com armazenamento e RPC simulados; não é teste do PostgREST real',checks};
 fs.mkdirSync('.test-results',{recursive:true});fs.writeFileSync('.test-results/transfers-client.json',JSON.stringify(result,null,2));console.log(JSON.stringify({transfers_client_checks:checks.length,passed:true}));
})().catch(error=>{console.error(error);process.exit(1);});
