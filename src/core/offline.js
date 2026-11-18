/* Compatibilidade com a fila anterior, sem executar itens sem proprietário. */
(function(){
    'use strict';
    const S=window.Suiri;
    const dbPromise=new Promise((resolve,reject)=>{
        const request=indexedDB.open('SuiriOfflineDB',1);
        request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('FilaAcoes'))request.result.createObjectStore('FilaAcoes',{keyPath:'id',autoIncrement:true});};
        request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    dbPromise.catch(error=>console.warn('Armazenamento offline indisponível',error));
    const transaction=async(mode,work)=>{
        const db=await dbPromise;
        return new Promise((resolve,reject)=>{
            const tx=db.transaction('FilaAcoes',mode),store=tx.objectStore('FilaAcoes');let value;
            try{const request=work(store);if(request)request.onsuccess=()=>{value=request.result;};}catch(error){reject(error);return;}
            tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Operação local interrompida.'));
        });
    };
    const list=()=>transaction('readonly',store=>store.getAll());
    window.adicionarAFilaOffline=async function(action){
        if(!window.usuarioAtual?.id||!window.perfilAtual?.id)throw new Error('Sessão necessária para guardar uma pendência.');
        if(action.tabela!=='membros'||action.tipoOperacao!=='update'||action.condicao?.id!==window.perfilAtual.id||Object.keys(action.dados||{}).some(k=>k!=='avatar_url'))throw new Error('Esta operação não suporta modo offline.');
        await transaction('readwrite',store=>store.add({...action,authUserId:window.usuarioAtual.id,memberId:window.perfilAtual.id,familyId:window.familiaAtualId,operationId:crypto.randomUUID(),timestamp:Date.now(),attempts:0}));
        window.mostrarToast('Foto salva neste aparelho. Sincronização pendente.', 'info');
    };
    window.processarFilaOffline=()=>S.once('offline-sync',async()=>{
        if(!navigator.onLine||!window.cliente||!window.usuarioAtual||!window.familiaAtualId)return;
        const owner=window.usuarioAtual.id,family=window.familiaAtualId;
        let count=0;
        for(const action of await list()){
            if(!action.authUserId||action.authUserId!==owner||action.familyId!==family)continue;
            if(window.usuarioAtual?.id!==owner)break;
            if(action.tabela!=='membros'||action.tipoOperacao!=='update'||action.memberId!==action.condicao?.id||Object.keys(action.dados||{}).some(k=>k!=='avatar_url'))continue;
            try{
                const result=await window.cliente.from('membros').update(action.dados).eq('id',action.memberId).eq('familia_id',family).select('id');
                S.check(result,1);
                await transaction('readwrite',store=>store.delete(action.id));count++;
            }catch(error){
                await transaction('readwrite',store=>store.put({...action,attempts:(action.attempts||0)+1,lastError:error.message}));
            }
        }
        if(count)window.mostrarToast(`${count} pendência(s) sincronizada(s).`);
        await window.atualizarStatusOfflineSuiri();
    });
    window.atualizarStatusOfflineSuiri=async function(){
        const el=document.getElementById('suiri-offline-status');if(!el)return;
        try{
            const rows=await list(),own=rows.filter(r=>r.authUserId===window.usuarioAtual?.id);
            const legacy=rows.filter(r=>!r.authUserId);
            const lastError=own.find(r=>r.lastError)?.lastError;
            el.textContent=`${navigator.onLine?'Conectado':'Sem internet'} · ${own.length} pendência(s) da sua conta.${legacy.length?' Há pendências antigas sem identificação; elas foram preservadas e não serão enviadas automaticamente.':''}${lastError?' Última tentativa: '+String(lastError).slice(0,200):''}`;
        }catch{el.textContent='Armazenamento local indisponível.';}
    };
    window.limparFilaOfflinePropria=async owner=>{
        const rows=await list();for(const row of rows)if(row.authUserId===owner)await transaction('readwrite',store=>store.delete(row.id));
    };
    window.addEventListener('online',()=>window.processarFilaOffline().catch(S.notifyError));
    window.addEventListener('offline',()=>window.atualizarStatusOfflineSuiri());
})();
