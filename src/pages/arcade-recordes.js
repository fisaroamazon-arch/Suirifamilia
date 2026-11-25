window.RecordesArcade = (() => {
    const jogos = {flappy:'Chuíri Voador', quebrablocos:'Quebra-Blocos', simon:'Piano', bolhas:'Bolhas', velha:'Jogo da Velha', memoria:'Memória', eco:'Eco Musical', campo:'Campo Minado'};
    const dialogo = document.getElementById('arcade-recordes');
    const seletor = document.getElementById('recordes-jogo');
    const grupo = document.getElementById('recordes-grupo');
    const modalidade = document.getElementById('recordes-modalidade');
    const tabela = document.getElementById('recordes-resultados');
    const memoria = new Map();

    function chave() {
        let perfil = 'visitante';
        try { perfil = JSON.parse(localStorage.getItem('suiri_perfil_ativo') || '{}').id || perfil; } catch {}
        return 'suiri:arcade:recordes:v1:' + perfil;
    }

    function carregar(id) {
        if (memoria.has(id)) return memoria.get(id);
        try {
            const salvo = JSON.parse(localStorage.getItem(id) || '{}');
            if (salvo && typeof salvo === 'object' && !Array.isArray(salvo)) return salvo;
        } catch {}
        return {};
    }

    function registrar(jogo, modalidade, ordem, pontuacao, detalhe = '') {
        if (!(jogo in jogos) || !Number.isFinite(ordem)) return;
        const id = chave();
        const dados = carregar(id);
        const grupos = dados[jogo] ||= {};
        const tentativas = Array.isArray(grupos[modalidade]) ? grupos[modalidade] : [];
        grupos[modalidade] = [...tentativas, {ordem, pontuacao, detalhe}]
            .sort((a, b) => b.ordem - a.ordem).slice(0, 3);
        try { localStorage.setItem(id, JSON.stringify(dados)); } catch { memoria.set(id, dados); }
    }

    function renderizar() {
        tabela.replaceChildren();
        const grupos = Object.entries(carregar(chave())[seletor.value] || {})
            .filter(([, tentativas]) => Array.isArray(tentativas) && tentativas.length);
        const selecionado = modalidade.value;
        modalidade.replaceChildren(...grupos.map(([nome]) => new Option(nome, nome)));
        if (grupos.some(([nome]) => nome === selecionado)) modalidade.value = selecionado;
        grupo.hidden = grupos.length < 2;
        if (!grupos.length) {
            const vazio = document.createElement('p');
            vazio.textContent = 'Termine uma partida para ver seu primeiro resultado aqui.';
            tabela.append(vazio);
            return;
        }
        const [nome, tentativas] = grupos.find(([nome]) => nome === modalidade.value);
        if (grupo.hidden) {
            const titulo = document.createElement('h3');
            titulo.textContent = nome;
            tabela.append(titulo);
        }
        const lista = document.createElement('ol');
        for (const tentativa of tentativas.slice(0, 3)) {
            const linha = document.createElement('li');
            const valor = document.createElement('strong');
            valor.textContent = tentativa.pontuacao;
            linha.append(valor);
            if (tentativa.detalhe) {
                const detalhe = document.createElement('span');
                detalhe.textContent = tentativa.detalhe;
                linha.append(detalhe);
            }
            lista.append(linha);
        }
        tabela.append(lista);
    }

    seletor?.addEventListener('change', renderizar);
    modalidade?.addEventListener('change', renderizar);
    seletor?.replaceChildren(...Object.entries(jogos).map(([id, nome]) => new Option(nome, id)));
    return {
        registrar,
        abrir(jogo) {
            if (!dialogo || dialogo.open) return;
            const dados = carregar(chave());
            seletor.value = Object.hasOwn(jogos, jogo) ? jogo :
                (Object.keys(jogos).find(id => Object.keys(dados[id] || {}).length) || 'flappy');
            renderizar();
            dialogo.showModal();
        }
    };
})();
