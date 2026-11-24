window.RecordesArcade = (() => {
    const jogos = {flappy:'Chuíri Voador', quebrablocos:'Quebra-Blocos', simon:'Piano', bolhas:'Bolhas', velha:'Jogo da Velha', memoria:'Memória'};
    const dialogo = document.getElementById('arcade-recordes');
    const seletor = document.getElementById('recordes-jogo');
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
        const grupos = carregar(chave())[seletor.value] || {};
        if (!Object.keys(grupos).length) {
            const vazio = document.createElement('p');
            vazio.textContent = 'Termine uma partida para ver seu primeiro resultado aqui.';
            tabela.append(vazio);
            return;
        }
        for (const [grupo, tentativas] of Object.entries(grupos)) {
            if (!Array.isArray(tentativas)) continue;
            const titulo = document.createElement('h3');
            titulo.textContent = grupo;
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
            tabela.append(titulo, lista);
        }
    }

    seletor?.addEventListener('change', renderizar);
    seletor?.replaceChildren(...Object.entries(jogos).map(([id, nome]) => new Option(nome, id)));
    return {
        registrar,
        abrir(jogo = 'flappy') {
            if (!dialogo || dialogo.open) return;
            seletor.value = jogo in jogos ? jogo : 'flappy';
            renderizar();
            dialogo.showModal();
        }
    };
})();
