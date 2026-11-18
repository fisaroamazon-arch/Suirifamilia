const {PGlite}=require('@electric-sql/pglite');
const fs=require('fs'),assert=require('node:assert/strict');
const db=new PGlite(),checks=[];
const sql=fs.readFileSync('supabase/03_TRANSFERENCIAS_V71.sql','utf8');
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
const child='10000000-0000-4000-8000-000000000003',outsider='10000000-0000-4000-8000-000000000004';
const f='20000000-0000-4000-8000-000000000001',g='20000000-0000-4000-8000-000000000002';
const q=(sql,args=[])=>db.query(sql,args);
const auth=uid=>q("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);
const send=async(value='10.00',id=crypto.randomUUID(),sender=a,dest=b,family=f)=>(await q('select transferir_saldo_familiar_v71($1,$2,$3,$4,$5) r',[id,family,sender,dest,value])).rows[0].r;
const fail=async fn=>{let e;try{await fn()}catch(error){e=error;}assert(e,'Expected rejection');return e;};
const count=async()=>Number((await q('select count(*) n from transacoes')).rows[0].n);
const balances=async()=>Object.fromEntries((await q('select id,saldo_carteira from membros')).rows.map(r=>[r.id,Number(r.saldo_carteira)]));
async function test(name,fn){await fn();checks.push({name,passed:true});}
(async()=>{
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 create table membros(id uuid primary key,familia_id uuid,nome text not null,papel text,eh_kids boolean,permissoes jsonb,saldo_carteira numeric);
 create table transacoes(id uuid primary key,familia_id uuid,membro_id uuid,tipo text not null,valor numeric not null,descricao text not null,categoria text,data_transacao date not null,escopo text,eh_privado boolean);
 create table transacoes_financeiras(like transacoes including all);
 `);
 await test('migração instala com as colunas recebidas, sem depender da migração V7',()=>db.exec(sql));
 for(const [id,fam,kids]of [[a,f,false],[b,f,false],[child,f,true],[outsider,g,false]])await q("insert into membros values($1,$2,'Teste','adulto',$3,'{}',0)",[id,fam,kids]);
 await q("insert into transacoes values(gen_random_uuid(),$1,$2,'entrada',20,'Inicial','Geral',current_date,'pessoal',true)",[f,a]);
 await q('insert into transacoes_financeiras select * from transacoes');
 await q('update transacoes_financeiras set valor=500');
 await q('update membros set saldo_carteira=200 where id=$1',[a]);
 await auth(null);
 await test('sessão ausente não transfere',async()=>{assert.equal((await send()).codigo,'NAO_AUTORIZADO');assert.equal(await count(),1);});
 await auth(a);
 await test('remetente diferente da conta autenticada é recusado',async()=>assert.equal((await send('1',crypto.randomUUID(),b,a)).codigo,'NAO_AUTORIZADO'));
 await test('família informada diferente da conta é recusada',async()=>assert.equal((await send('1',crypto.randomUUID(),a,outsider,g)).codigo,'NAO_AUTORIZADO'));
 await test('destinatário de outro lar e transferência para si são recusados',async()=>{assert.equal((await send('1',crypto.randomUUID(),a,outsider)).codigo,'DESTINATARIO_INVALIDO');assert.equal((await send('1',crypto.randomUUID(),a,a)).codigo,'MESMO_MEMBRO');});
 await test('NULL, valores especiais, negativos, zero e frações de centavo são recusados',async()=>{
  for(const value of [null,'NaN','Infinity','-Infinity','-1','0','0.001','1.999'])assert.equal((await send(value)).codigo,'VALOR_INVALIDO',String(value));
  assert.equal((await q('select transferir_saldo_familiar_v71(null,$1,$2,$3,1) r',[f,a,b])).rows[0].r.codigo,'DADOS_INVALIDOS');
  assert.equal(await count(),1);
 });
 await test('cache maior e saldo legado não autorizam gasto além do extrato',async()=>{const r=await send('100');assert.equal(r.codigo,'SALDO_INSUFICIENTE');assert.equal(Number(r.saldo_disponivel),20);assert.equal(await count(),1);});
 const id=crypto.randomUUID();let first;
 await test('saída, entrada, confirmação e caches são consistentes',async()=>{
  first=await send('10.00',id);assert(first.sucesso);assert.equal(first.operacao_id,id);assert.equal(await count(),3);
  const caches=await balances();assert.equal(caches[a],10);assert.equal(caches[b],10);
  const rows=(await q("select * from transacoes where categoria='Transferência'")).rows;
  assert.equal(rows.length,2);assert(rows.every(r=>r.eh_privado&&r.escopo==='pessoal'));
  assert.equal(Number((await q("select sum(case tipo when 'entrada' then valor else -valor end) n from transacoes")).rows[0].n),20);
  assert(!('saldo_destinatario' in first));
 });
 await test('repetir a mesma operação retorna a confirmação anterior sem novos lançamentos',async()=>{const r=await send('10',id);assert(r.repetida);assert.equal(r.transacao_saida_id,first.transacao_saida_id);assert.equal(await count(),3);});
 await test('reutilizar identificador com outro valor ou destinatário não transfere',async()=>{assert.equal((await send('1',id)).codigo,'OPERACAO_DIVERGENTE');assert.equal((await send('10',id,a,child)).codigo,'OPERACAO_DIVERGENTE');assert.equal(await count(),3);});
 await test('revogação de permissão bloqueia novos envios e ainda permite reconsultar confirmação',async()=>{
  await q("update membros set permissoes='{"+'"gastos":false'+"}' where id=$1",[a]);
  assert.equal((await send('1')).codigo,'SEM_PERMISSAO');assert((await send('10',id)).repetida);
  await q("update membros set permissoes='{}' where id=$1",[a]);
 });
 await test('perfil infantil autenticado não faz débito',async()=>{await auth(child);assert.equal((await send('1',crypto.randomUUID(),child,b)).codigo,'SEM_PERMISSAO');await auth(a);});
 await test('saldo zero não aciona a tabela antiga',async()=>{
  await auth(b);await send('10',crypto.randomUUID(),b,a);
  await q("insert into transacoes_financeiras values(gen_random_uuid(),$1,$2,'entrada',500,'Legado','Geral',current_date,'pessoal',true)",[f,b]);
  assert.equal((await send('1',crypto.randomUUID(),b,a)).codigo,'SALDO_INSUFICIENTE');await auth(a);
 });
 await test('a transferência não depende da existência da tabela antiga',async()=>{await db.exec('drop table transacoes_financeiras');assert((await send('1')).sucesso);});
 await test('uma segunda operação distinta é reavaliada pelo saldo atualizado',async()=>{assert.equal((await send('100')).codigo,'SALDO_INSUFICIENTE');});
 await test('extrato com tipo desconhecido, valor negativo ou subcentavo é recusado',async()=>{
  for(const [type,value]of [['outro','1'],['entrada','-1'],['entrada','0.001']]){
   const row=crypto.randomUUID();await q("insert into transacoes values($1,$2,$3,$4,$5,'Inválido','Geral',current_date,'pessoal',true)",[row,f,a,type,value]);
   assert.equal((await send('1')).codigo,'EXTRATO_INCONSISTENTE');await q('delete from transacoes where id=$1',[row]);
  }
 });
 await test('falha no crédito reverte também débito e registro da operação',async()=>{
  const before=await count(),caches=await balances(),operation=crypto.randomUUID();
  await db.exec("alter table transacoes add constraint teste_credito check(not(tipo='entrada' and categoria='Transferência' and valor=13))");
  await fail(()=>send('13',operation));assert.equal(await count(),before);assert.deepEqual(await balances(),caches);
  assert.equal((await q('select * from suiri_transferencias_v71 where operacao_id=$1',[operation])).rows.length,0);
  await db.exec('alter table transacoes drop constraint teste_credito');
 });
 await test('falha no cache do destinatário reverte os dois lançamentos e o cache do remetente',async()=>{
  const before=await count(),caches=await balances();
  await db.exec(`create function teste_falha_cache()returns trigger language plpgsql as $$begin if new.id='${b}'::uuid then raise exception 'falha sintética';end if;return new;end$$;
  create trigger teste_falha_cache before update on membros for each row execute function teste_falha_cache();`);
  await fail(()=>send('1'));assert.equal(await count(),before);assert.deepEqual(await balances(),caches);
  await db.exec('drop trigger teste_falha_cache on membros;drop function teste_falha_cache()');
 });
 await test('trigger preexistente que atualiza cache não causa débito ou crédito duplicado',async()=>{
  await db.exec(`create function teste_cache()returns trigger language plpgsql as $$begin update public.membros set saldo_carteira=coalesce(saldo_carteira,0)+case new.tipo when 'entrada' then new.valor else -new.valor end where id=new.membro_id;return new;end$$;
  create trigger teste_cache after insert on transacoes for each row execute function teste_cache();`);
  assert((await send('1')).sucesso);
  for(const member of [a,b]){const expected=Number((await q("select coalesce(sum(case tipo when 'entrada' then valor else -valor end),0)n from transacoes where membro_id=$1",[member])).rows[0].n);assert.equal((await balances())[member],expected);}
  await db.exec('drop trigger teste_cache on transacoes;drop function teste_cache()');
 });
 await test('trigger legado incompatível falha sem deixar transferência parcial',async()=>{
  const before=await count();
  await db.exec(`create function teste_legado()returns trigger language plpgsql as $$begin update membros set saldo_carteira=0 where id=new.membro_id;return new;end$$;
  create trigger teste_legado after insert on transacoes for each row execute function teste_legado();`);
  await fail(()=>send('1'));assert.equal(await count(),before);
  await db.exec('drop trigger teste_legado on transacoes;drop function teste_legado()');
 });
 await test('cliente antigo recebe recusa explícita e não movimenta saldo',async()=>{const before=await count();const r=(await q('select transferir_saldo_familiar($1,$2,$3,1)r',[f,a,b])).rows[0].r;assert.equal(r.codigo,'ATUALIZE_O_SITE');assert.equal(await count(),before);});
 await test('anônimo não pode executar as RPCs de transferência',async()=>{
  await db.exec('set role anon');await fail(()=>send('1'));
  await fail(()=>q('select transferir_saldo_familiar($1,$2,$3,1)',[f,a,b]));await db.exec('reset role');
 });
 await test('autenticado executa a RPC, mas não grava no registro de confirmações',async()=>{
  await db.exec('set role authenticated');assert((await send('1')).sucesso);
  await fail(()=>q('delete from suiri_transferencias_v71'));await db.exec('reset role');
 });
 await test('confirmações são visíveis apenas à conta remetente',async()=>{
  await auth(outsider);await db.exec('set role authenticated');assert.equal((await q('select * from suiri_transferencias_v71')).rows.length,0);
  await db.exec('reset role');await auth(a);
 });
 await test('trigger de bloqueio também funciona em INSERT, UPDATE e DELETE diretos',async()=>{
  const row=crypto.randomUUID();
  await db.exec('grant insert,update,delete,select on transacoes to authenticated;set role authenticated');
  await q("insert into transacoes values($1,$2,$3,'entrada',1,'Direto','Geral',current_date,'pessoal',true)",[row,f,a]);
  await q('update transacoes set valor=2 where id=$1',[row]);await q('delete from transacoes where id=$1',[row]);await db.exec('reset role');
 });
 await test('isolamento sem leitura atualizada é recusado antes das alterações',async()=>{
  const before=await count();await db.exec('begin isolation level repeatable read');await fail(()=>send('1'));await db.exec('rollback');assert.equal(await count(),before);
 });
 await test('migração reaplicada preserva confirmações e mantém apenas o próprio trigger',async()=>{
  const before=await count(),logs=(await q('select count(*)n from suiri_transferencias_v71')).rows[0].n;
  await db.exec(sql);assert.equal(await count(),before);assert.equal((await q('select count(*)n from suiri_transferencias_v71')).rows[0].n,logs);
  assert.equal(Number((await q("select count(*)n from pg_trigger where tgname='suiri_bloquear_extrato_v71'")).rows[0].n),1);
 });
 await test('consultas de conciliação e de triggers retornam diagnóstico sem alterar lançamentos',async()=>{
  const before=await count();
  const balances=await q(fs.readFileSync('supabase/04_CONFERIR_SALDOS_V71.sql','utf8'));assert.equal(balances.rows.length,4);assert('saldo_extrato_oficial' in balances.rows[0]);
  const triggers=await q(fs.readFileSync('supabase/05_DIAGNOSTICO_TRIGGERS_V71.sql','utf8'));assert(triggers.rows.some(row=>row.gatilho==='suiri_bloquear_extrato_v71'));assert.equal(await count(),before);
 });
 await test('esquema incompleto cancela a migração antes de instalar a RPC',async()=>{
  const clean=new PGlite();await clean.exec('create table membros(id uuid)');await fail(()=>clean.exec(sql));await clean.exec('rollback');
  assert.equal((await clean.query("select to_regprocedure('public.transferir_saldo_familiar_v71(uuid,uuid,uuid,uuid,numeric)') r")).rows[0].r,null);await clean.close();
 });
 const result={engine:'PGlite/PostgreSQL; esquema representativo baseado nas colunas recebidas. Sem sessões concorrentes reais.',checks};
 fs.mkdirSync('.test-results',{recursive:true});fs.writeFileSync('.test-results/transfers-database.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({transfers_database_checks:checks.length,passed:true}));await db.close();
})().catch(error=>{console.error(error);process.exit(1);});
