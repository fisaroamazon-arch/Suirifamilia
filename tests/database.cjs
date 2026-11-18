const {PGlite}=require('@electric-sql/pglite');
const fs=require('fs'),assert=require('node:assert/strict');
const sql=fs.readFileSync('supabase/02_ATUALIZAR_V7.sql','utf8');
const db=new PGlite();
const uid='10000000-0000-4000-8000-000000000001',adult='10000000-0000-4000-8000-000000000002',kid='10000000-0000-4000-8000-000000000003',other='10000000-0000-4000-8000-000000000004';
const fam='20000000-0000-4000-8000-000000000001',fam2='20000000-0000-4000-8000-000000000002';
const bill='30000000-0000-4000-8000-000000000001',item='40000000-0000-4000-8000-000000000001',mission='50000000-0000-4000-8000-000000000001',cofre='60000000-0000-4000-8000-000000000001';
const checks=[];
const q=async(sql,args=[])=>db.query(sql,args);
const op=async(kind,payload,member=uid,id=crypto.randomUUID())=>(await q('select public.suiri_operacao_v7($1,$2,$3,$4) as r',[id,kind,member,JSON.stringify(payload)])).rows[0].r;
const expectFailure=async fn=>{let error;try{await fn()}catch(e){error=e}assert(error,'Expected rejection');return error.message;};
async function test(name,fn){await fn();checks.push({name,passed:true});}
(async()=>{
 await db.exec(`
 create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt()returns jsonb language sql stable as $$select jsonb_build_object('email','test@example.invalid')$$;
 grant usage on schema auth to authenticated;grant execute on all functions in schema auth to authenticated;
 create table familias(id uuid primary key default gen_random_uuid(),nome_familia text,cpf_adm_principal text unique,orcamento_mercado_mensal numeric);
 create table membros(id uuid primary key,familia_id uuid,nome text,email text,cpf text,papel text,parentesco text,nacionalidade text,genero text,sexo text,possui_cartao boolean,eh_kids boolean default false,permissoes jsonb default '{}',saldo_carteira numeric default 0,xp_total integer default 0,ofensiva_atual int default 0,ultimo_checkin_data date);
 create table transacoes(id uuid primary key default gen_random_uuid(),familia_id uuid,membro_id uuid,tipo text,valor numeric,descricao text,categoria text,data_transacao date,escopo text,eh_privado boolean);
 create table itens_mercado(id uuid primary key,familia_id uuid,quantidade numeric,valor_unitario numeric,valor_total numeric,segmento_categoria text,comprado boolean,no_carrinho boolean);
 create table agenda_financeira(id uuid primary key,familia_id uuid,status text,pago boolean,valor numeric,descricao text,tipo_evento text,escopo text,membro_id uuid,criado_por uuid);
 create table missoes(id uuid primary key,familia_id uuid,titulo text,status text,escopo text,atribuido_a uuid,criado_por uuid,destinatario_kids text,xp_recompensa integer,recorrencia_tipo text,horario_limite time,horario_reinicio time,concluido_em timestamptz,concluido_por uuid,proxima_execucao timestamptz,concluidos_por_array jsonb,falhados_por_array jsonb,subitens jsonb);
 create table metas_compartilhadas(id uuid primary key,familia_id uuid,titulo text,valor_acumulado numeric);
 create table beneficios_loja(id uuid primary key,familia_id uuid,titulo text,custo integer,para_kids boolean);
 create table saude_ciclos(id uuid primary key default gen_random_uuid(),usuario_id uuid,conteudo text);
 create table saude_sintomas(id uuid primary key default gen_random_uuid(),usuario_id uuid,conteudo text);
 create table saude_diario(id uuid primary key default gen_random_uuid(),usuario_id text,conteudo text);
 create table espaco_fem_radar(id uuid primary key default gen_random_uuid(),usuario_id text,conteudo text);
 create table espaco_fem_checkins(id uuid primary key default gen_random_uuid(),usuario_id varchar(100),conteudo text);
 create table espaco_masc_radar(id uuid primary key default gen_random_uuid(),membro_id uuid,conteudo text);
 create table espaco_masc_listas(id uuid primary key default gen_random_uuid(),membro_id text,conteudo text);
 create table recados_lar(id uuid primary key default gen_random_uuid(),familia_id text,conteudo text);
 `);
 await db.exec(sql);
 await db.exec(fs.readFileSync('supabase/03_TRANSFERENCIAS_V71.sql','utf8'));
 await q('insert into auth.users values($1),($2),($3),($4)',[uid,adult,kid,other]);
 await q('insert into familias(id,nome_familia)values($1,$2),($3,$4)',[fam,'Teste A',fam2,'Teste B']);
 for(const [id,f,p,k,xp]of [[uid,fam,'adm',false,1000],[adult,fam,'adulto',false,100],[kid,fam,'dependente',true,450],[other,fam2,'adm',false,100]])await q('insert into membros(id,familia_id,nome,papel,eh_kids,xp_total)values($1,$2,$3,$4,$5,$6)',[id,f,id,p,k,xp]);
 await q("select set_config('request.jwt.claim.sub',$1,false)",[uid]);
 const personalTables=[['saude_ciclos','usuario_id','uuid'],['saude_sintomas','usuario_id','uuid'],['saude_diario','usuario_id','text'],['espaco_fem_radar','usuario_id','text'],['espaco_fem_checkins','usuario_id','text'],['espaco_masc_radar','membro_id','uuid'],['espaco_masc_listas','membro_id','text']];
 for(const [table,owner,type]of personalTables){
  await db.exec(`grant select,insert,update,delete on ${table} to authenticated;grant select on ${table} to anon;create policy teste_legado on ${table} for all to authenticated using(true)with check(true);create policy teste_legado_anon on ${table} for select to anon using(true);`);
  await q(`insert into ${table}(${owner},conteudo)values($1,'Meu registro'),($2,'Registro alheio'),(null,'Sem dono')`,[uid,adult]);
  if(type==='text')await q(`insert into ${table}(${owner},conteudo)values('id-legado-invalido','Dado legado')`);
 }
 await test('políticas pessoais aceitam UUID, TEXT e VARCHAR sem expor outros proprietários',async()=>{
  await db.exec('set role authenticated');
  for(const [table]of personalTables){const rows=(await q(`select conteudo from ${table}`)).rows;assert.equal(rows.length,1,table);assert.equal(rows[0].conteudo,'Meu registro');}
  await db.exec('reset role');
 });
 await test('diário com proprietário TEXT permite inserir somente para a própria conta',async()=>{
  await db.exec('set role authenticated');await q("insert into saude_diario(usuario_id,conteudo)values($1,'Nova anotação')",[uid]);
  await expectFailure(()=>q("insert into saude_diario(usuario_id,conteudo)values($1,'Outra conta')",[adult]));await db.exec('reset role');
 });
 await test('atualizar e excluir diário respeitam o dono e impedem trocar a autoria',async()=>{
  await db.exec('set role authenticated');
  assert.equal((await q("update saude_diario set conteudo='Alterado indevidamente' where usuario_id=$1 returning id",[adult])).rows.length,0);
  assert.equal((await q('delete from saude_diario where usuario_id=$1 returning id',[adult])).rows.length,0);
  await expectFailure(()=>q('update saude_diario set usuario_id=$1 where usuario_id=$2',[adult,uid]));
  await q("update saude_diario set conteudo='Atualizado pelo dono' where usuario_id=$1",[uid]);
  assert.equal((await q('delete from saude_diario where usuario_id=$1 returning id',[uid])).rows.length,2);await db.exec('reset role');
 });
 await test('autenticado sem auth.uid e anônimo não recebem registros pessoais',async()=>{
  await q("select set_config('request.jwt.claim.sub','',false)");await db.exec('set role authenticated');
  for(const [table]of personalTables)assert.equal((await q(`select * from ${table}`)).rows.length,0);
  await db.exec('reset role');await q("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role anon');
  for(const [table]of personalTables)assert.equal((await q(`select * from ${table}`)).rows.length,0);await db.exec('reset role');
 });
 await test('limite familiar também aceita coluna TEXT em tabela opcional',async()=>{
  await db.exec('grant select,insert on recados_lar to authenticated;create policy teste_legado on recados_lar for all to authenticated using(true)with check(true)');
  await q("insert into recados_lar(familia_id,conteudo)values($1,'Meu lar'),($2,'Outro lar'),('legado-invalido','Legado')",[fam,fam2]);
  await db.exec('set role authenticated');const rows=(await q('select conteudo from recados_lar')).rows;assert.equal(rows.length,1);assert.equal(rows[0].conteudo,'Meu lar');
  await expectFailure(()=>q("insert into recados_lar(familia_id,conteudo)values($1,'Outro lar')",[fam2]));await db.exec('reset role');
 });
 await q("insert into agenda_financeira values($1,$2,'pendente',false,50,'Conta','conta_pagar','casa',$3,$3)",[bill,fam,uid]);
 await test('baixa e lançamento atômicos; repetição não duplica',async()=>{
  const r=await op('bill',{id:bill});assert(r.ok);const again=await op('bill',{id:bill});assert(again.repeated);
  assert.equal(Number((await q('select count(*)n from transacoes')).rows[0].n),1);
 });
 await test('adulto não pode agir por outro adulto',async()=>{await expectFailure(()=>op('contribution',{amount:10,destination:'pessoal'},adult));});
 await test('família diferente é recusada',async()=>{await expectFailure(()=>op('contribution',{amount:10,destination:'pessoal'},other));});
 await test('missão pessoal exige autoria no banco e na operação; missão coletiva continua compartilhada',async()=>{
  const particular='50000000-0000-4000-8000-000000000071',coletiva='50000000-0000-4000-8000-000000000072';
  await db.exec('grant select,insert,update,delete on missoes to authenticated;create policy teste_missoes_legado on missoes for all to authenticated using(true)with check(true);');
  await q("insert into missoes(id,familia_id,titulo,status,escopo,atribuido_a,criado_por,recorrencia_tipo,proxima_execucao) values($1,$3,'Pessoal','concluida','individual',$5,$4,'diaria_24h',now()-interval '1 hour'),($2,$3,'Casa','concluida','casa',null,$4,'diaria_24h',now()-interval '1 hour')",[particular,coletiva,fam,uid,adult]);
  await q("select set_config('request.jwt.claim.sub',$1,false)",[adult]);await db.exec('set role authenticated');
  assert.deepEqual((await q('select id from missoes order by id')).rows.map(row=>row.id),[coletiva]);
  await expectFailure(()=>op('mission',{id:particular,action:'reset'},adult));
  assert.equal((await op('mission',{id:coletiva,action:'reset'},adult)).mission.status,'pendente');
  await db.exec('reset role');
  await q("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');
  assert.equal((await q('select id from missoes')).rows.length,2);
  assert.equal((await op('mission',{id:particular,action:'reset'})).mission.status,'pendente');
  await db.exec('reset role');
 });
 await q('insert into itens_mercado values($1,$2,2,3.50,7,\'Mercearia\',true,true,false,null)',[item,fam]);
 await test('compra preserva itens e grava despesa uma vez',async()=>{
  const r=await op('checkout',{ids:[item]});assert.equal(r.total,7);assert(r.purchase_id);
  assert((await op('checkout',{ids:[item]})).repeated);
  const rows=(await q('select * from itens_mercado')).rows;assert.equal(rows.length,1);assert.equal(rows[0].suiri_finalizada,true);
 });
 await test('falha na transação não marca compra como finalizada',async()=>{
  const bad='40000000-0000-4000-8000-000000000002';
  await q("insert into itens_mercado values($1,$2,1,13,13,'Mercearia',true,true,false,null)",[bad,fam]);
  await db.exec("alter table transacoes add constraint test_failure check(valor<>13)");
  await expectFailure(()=>op('checkout',{ids:[bad]}));assert.equal((await q('select suiri_finalizada from itens_mercado where id=$1',[bad])).rows[0].suiri_finalizada,false);
  await db.exec('alter table transacoes drop constraint test_failure');
 });
 await q("insert into metas_compartilhadas values($1,$2,'Viagem',0)",[cofre,fam]);
 await test('aportes somam e ficam vinculados a débitos',async()=>{await op('contribution',{destination:cofre,amount:10});await op('contribution',{destination:cofre,amount:20});assert.equal(Number((await q('select valor_acumulado from metas_compartilhadas')).rows[0].valor_acumulado),30);});
 await test('valor negativo é recusado',async()=>{await expectFailure(()=>op('contribution',{destination:cofre,amount:-10}));});
 await q("insert into missoes(id,familia_id,titulo,status,escopo,atribuido_a,criado_por,xp_recompensa,recorrencia_tipo,horario_reinicio,subitens)values($1,$2,'Teste','pendente','casa',$3,$4,20,'diaria_24h','00:00','[]')",[mission,fam,kid,uid]);
 await test('conclusão duplicada ou reaberta não duplica XP',async()=>{
  const before=(await q('select xp_total from membros where id=$1',[kid])).rows[0].xp_total;
  const r=await op('mission',{id:mission,action:'complete'},kid);assert.equal(r.xp,before+20);
  assert((await op('mission',{id:mission,action:'complete'},kid)).repeated);
  await op('mission',{id:mission,action:'reopen'},kid);
  assert((await op('mission',{id:mission,action:'complete'},kid)).repeated);
  assert.equal((await q('select status from missoes where id=$1',[mission])).rows[0].status,'concluida');
  assert.equal((await q('select xp_total from membros where id=$1',[kid])).rows[0].xp_total,before+20);
 });
 await test('mesada debita XP e cria entrada na mesma transação',async()=>{const r=await op('allowance',{rate:{qtd:100,valor:5}});assert.equal(r.count,1);assert.equal((await q('select xp_total from membros where id=$1',[kid])).rows[0].xp_total,70);});
 await test('recompensa padrão usa preço do servidor e aceita replay do mesmo ID',async()=>{const id=crypto.randomUUID();const r=await op('reward',{id:'game_time',cost:-100},uid,id);assert.equal(r.xp,800);assert((await op('reward',{id:'game_time'},uid,id)).repeated);});
 await test('bloqueio impede criança de operar finanças',async()=>{await expectFailure(()=>op('contribution',{amount:1,destination:'pessoal'},kid));});
 await test('usuário autenticado não grava diretamente no ledger',async()=>{
  await db.exec('set role authenticated');
  await expectFailure(()=>q("insert into suiri_operacoes_v7 values(gen_random_uuid(),$1,$2,$1,'reward','fake','{}',now())",[uid,fam]));
  await db.exec('reset role');
 });
 await test('RPC funciona com privilégio authenticated e autorização explícita',async()=>{await db.exec('set role authenticated');const r=await op('contribution',{amount:1,destination:'pessoal'});assert(r.ok);await db.exec('reset role');});
 await test('extrato mascara detalhes privados no servidor',async()=>{
  await q("insert into transacoes(familia_id,membro_id,tipo,valor,descricao,categoria,data_transacao,escopo,eh_privado)values($1,$2,'saida',1,'SEGREDO_PRIVADO','CATEGORIA_PRIVADA',current_date,'pessoal',true)",[fam,adult]);
  const r=await q('select suiri_extrato_v7() as r');assert(!JSON.stringify(r.rows).includes('SEGREDO_PRIVADO'));assert(JSON.stringify(r.rows).includes('Gasto Privado'));
 });
 await test('RLS restringe consulta direta mesmo com política antiga permissiva',async()=>{
  await db.exec('grant select on transacoes to authenticated; create policy teste_leitura_antiga on transacoes for select to authenticated using(true)');
  await db.exec('set role authenticated');const r=await q('select descricao from transacoes');assert(!JSON.stringify(r.rows).includes('SEGREDO_PRIVADO'));await db.exec('reset role');
 });
 await test('cota de IA aceita 20 reservas e recusa a próxima',async()=>{
  for(let i=0;i<20;i++)assert.equal((await q('select suiri_reservar_cota_ia_v7() as r')).rows[0].r,true);
  await expectFailure(()=>q('select suiri_reservar_cota_ia_v7()'));
 });
 await test('política anônima antiga não expõe dados familiares',async()=>{
  await db.exec('grant select on transacoes to anon;create policy teste_anon_antiga on transacoes for select to anon using(true);set role anon');
  assert.equal((await q('select * from transacoes')).rows.length,0);await db.exec('reset role');
 });
 await test('esquema incompatível aborta sem criar estruturas novas',async()=>{
  const clean=new PGlite();await clean.exec('create table familias(id uuid primary key)');await expectFailure(()=>clean.exec(sql));await clean.exec('rollback');const r=await clean.query("select to_regclass('public.suiri_operacoes_v7') as tabela");assert.equal(r.rows[0].tabela,null);await clean.close();
 });
 await test('nova tentativa permite concluir após falha sem repetir crédito ou penalidade',async()=>{
  const retry='50000000-0000-4000-8000-000000000002';
  await q("insert into missoes(id,familia_id,titulo,status,escopo,atribuido_a,criado_por,xp_recompensa,recorrencia_tipo,horario_reinicio,subitens)values($1,$2,'Nova tentativa','pendente','casa',$3,$4,20,'diaria_24h','00:00',$5)",[retry,fam,kid,uid,JSON.stringify([{texto:'Teste',concluido:false}])]);
  const before=(await q('select xp_total from membros where id=$1',[kid])).rows[0].xp_total;
  await op('mission',{id:retry,action:'fail'},kid);await op('mission',{id:retry,action:'reopen'},kid);await op('mission',{id:retry,action:'complete'},kid);
  await op('mission',{id:retry,action:'reopen'},kid);await op('mission',{id:retry,action:'complete'},kid);
  assert.equal((await q('select xp_total from membros where id=$1',[kid])).rows[0].xp_total,before+10);
  const task=(await q('select * from missoes where id=$1',[retry])).rows[0];assert.equal(task.status,'concluida');assert.equal(task.subitens[0].concluido,true);
 });
 await test('migração é reaplicável sem perder dados',async()=>{await db.exec(sql);assert.equal(Number((await q('select count(*)n from membros')).rows[0].n),4);});
 await db.close();
 fs.mkdirSync('.test-results',{recursive:true});fs.writeFileSync('.test-results/sql-v7.json',JSON.stringify({engine:'PGlite/PostgreSQL em memória; schema de teste compatível, não o Supabase real',checks},null,2));console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e.message,e.detail||'',e.where||'',e.position||'');process.exit(1)});
