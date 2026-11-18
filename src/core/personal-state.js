/* Estados locais separados por pessoa. As chaves legadas não são atribuídas automaticamente. */
(function(){
    const S=window.Suiri;
    const defaults=['Hidratação Consciente (2L)','Pausa / Leitura Inspiradora','Movimento Suave / Treino','Alimentação Nutritiva','Momento de Silêncio / Respiração','Desconexão Noturna (Zero Telas)'];
    S.legacyPersonalKeys=['suiri_radar_fem','suiri_rituais_fem','suiri_metas_fem_config','suiri_midia_mulher_assistida','suiri_midia_mulher_quero_ver','suiri_ciclo_duracao_media_manual','suiri_ciclo_notificar_membro_id','suiri_midia_assistida','suiri_manutencao_masc','suiri_lazer_masc'];
    S.reloadPersonal=function(){
        if(!window.perfilAtual?.id)return;
        const get=(key,fallback)=>S.parseJSON(S.storage.getItem(key),fallback);
        window.dadosCicloMulher=[];window.dadosSintomasDiarios=[];window.dadosDiarioMulher=[];
        window.dadosRituaisFemininos=get('suiri_rituais_fem',{});
        window.configMetasFemininas=get('suiri_metas_fem_config',defaults.slice());
        window.dadosRadarFeminilidade=get('suiri_radar_fem',{vitalidade:3,paz_mental:3,afeto_libido:3,ultima_relacao:null,historico:[]});
        window.dadosMidiaMulherAssistida=get('suiri_midia_mulher_assistida',[]);
        window.dadosMidiaMulherQueroVer=get('suiri_midia_mulher_quero_ver',[]);
        window.dadosMidiaAssistida=get('suiri_midia_assistida',[]);
        window.dadosManutencaoGaragem=get('suiri_manutencao_masc',[]);
        window.dadosAcervoLazer=get('suiri_lazer_masc',[]);
        if(window.obterChaveStorageMasc){
            const mget=(key,fallback)=>S.parseJSON(localStorage.getItem(window.obterChaveStorageMasc(key)),fallback);
            window.configMissoesForja=mget('config_missoes',window.missoesPadraoForja||[]);
            window.dadosForjaDiaria=mget('forja_diaria',{});
            window.dadosEstadoDiario=mget('estado_diario',{humor:5,estresse:5,fisico:5,mental:5,historico:[]});
            window.dadosRadarIntimo=mget('radar_intimo',{libido:5,realizacao:5,parceira:5,ultima_relacao:null,historico:[]});
            window.dadosReflexoesFavoritas=mget('estoicas_favoritas',[]);
            window.dadosMidiaQueroVerMasc=mget('midia_quero_ver',[]);
        }
        window.meusAlfinetes=S.parseJSON(localStorage.getItem('suiri_alfinetes_'+window.perfilAtual.id),[]);
    };
    window.exportarDadosLocaisSuiri=()=>{
        const data={format:'suiri-legacy-local-v1',exportedAt:new Date().toISOString(),data:{}};
        for(const key of S.legacyPersonalKeys){const raw=localStorage.getItem(key);if(raw!==null)data.data[key]=S.parseJSON(raw,raw);}
        const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='suiri_dados_locais_anteriores.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    window.importarDadosLocaisSuiri=async()=>{
        if(window.perfilAtual?.id!==window.usuarioAtual?.id)return window.mostrarToast('Entre no seu próprio perfil adulto para importar.','erro');
        const keys=S.legacyPersonalKeys.filter(k=>localStorage.getItem(k)!==null&&S.storage.getItem(k)===null);
        if(!keys.length)return window.mostrarToast('Não há dados antigos disponíveis para importar sem substituir registros atuais.','info');
        if(!await window.confirmarAcaoSuiri(`Associar ${keys.length} conjunto(s) de dados locais antigos ao perfil ${window.perfilAtual.nome}? Eles podem incluir informações íntimas. Confirme somente se forem seus. Os originais serão preservados.`,'Importar meus dados antigos'))return;
        for(const key of keys)S.storage.setItem(key,localStorage.getItem(key));
        S.reloadPersonal();window.mostrarToast('Dados associados ao seu perfil neste aparelho.');
    };
})();
