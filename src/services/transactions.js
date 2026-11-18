/* Repositório financeiro: o servidor remove detalhes pessoais de terceiros. */
(function(){
    const S=window.Suiri;
    S.transactionQuery=function(){
        const filters=[],orders=[];let columns='*',slice=null;
        const query={
            select(v){columns=v||'*';return query;},eq(k,v){filters.push(['eq',k,v]);return query;},gte(k,v){filters.push(['gte',k,v]);return query;},lte(k,v){filters.push(['lte',k,v]);return query;},lt(k,v){filters.push(['lt',k,v]);return query;},
            order(k,options={}){orders.push([k,options.ascending!==false]);return query;},
            range(a,b){slice=[a,b+1];return query;},limit(n){slice=[0,n];return query;},
            then(resolve,reject){return (async()=>{
                const val=(op,key)=>filters.find(x=>x[0]===op&&x[1]===key)?.[2]||null;
                const result=await window.cliente.rpc('suiri_extrato_v7',{p_inicio:val('gte','data_transacao'),p_fim:val('lte','data_transacao'),p_antes:val('lt','data_transacao'),p_membro:val('eq','membro_id')});
                if(result.error)return result;
                let rows=Array.isArray(result.data)?result.data:[];
                rows=rows.filter(row=>filters.every(([op,key,value])=>op==='eq'?String(row[key])===String(value):op==='gte'?row[key]>=value:op==='lte'?row[key]<=value:row[key]<value));
                rows.sort((a,b)=>{for(const [key,asc]of orders){const order=String(a[key]||'').localeCompare(String(b[key]||''));if(order)return asc?order:-order;}return String(a.id).localeCompare(String(b.id));});
                if(slice)rows=rows.slice(...slice);
                if(columns!=='*'){const keys=columns.split(',').map(x=>x.trim());rows=rows.map(row=>Object.fromEntries(keys.map(k=>[k,row[k]])));}
                return {data:rows,error:null};
            })().then(resolve,reject);}
        };return query;
    };
})();
