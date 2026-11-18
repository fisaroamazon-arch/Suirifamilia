window.TamagotchiKids = {
    GIFS_CHUIRI: {
        padrao:   'assets/images/animated/padrao.gif',
        dormir:   'assets/images/animated/dormir.gif',
        dormindo: 'assets/images/animated/dormindo.gif',
        banho:    'assets/images/animated/banho.gif',
        comendo:  'assets/images/animated/comendo.gif',
        feliz:    'assets/images/animated/feliz.gif',
        triste:   'assets/images/animated/triste.gif'
    },

    // 2. CARDÁPIO DA GELADEIRA (USANDO AS MOEDAS DO CHUÍRI)
    CARDAPIO_COZINHA: [
        { id: 'maca',    nome: 'Maçã Crocante',    custo: 0,  fome: 15, felicidade: 5,  cor: '#ef4444', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>` },
        { id: 'cenoura', nome: 'Suco de Laranja',  custo: 5,  fome: 25, felicidade: 10, cor: '#f97316', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>` },
        { id: 'pizza',   nome: 'Refeição Completa',custo: 12, fome: 45, felicidade: 18, cor: '#eab308', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M6 2v20"/><path d="M9 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/></svg>` },
        { id: 'festa',   nome: 'Banquete Real',    custo: 20, fome: 100,felicidade: 30, cor: '#ec4899', icone: `<svg class="icone-svg" style="width:22px;height:22px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` }
    ],

    // 3. CONFIGURAÇÃO DE ÁUDIOS MP3
    CONFIG_PASTAS_AUDIO: {
        saudacao: { pasta: 'assets/audio/pet/saudacao', total: 3 },
        parabens: { pasta: 'assets/audio/pet/parabens', total: 3 },
        falha:    { pasta: 'assets/audio/pet/consolo',  total: 3 },
        comida:   { pasta: 'assets/audio/pet/delicia',  total: 1 },
        toque:    { pasta: 'assets/audio/pet/amigo',    total: 10 }
    },

    // 4. ESTADO NO LOCALSTORAGE COM DECAIMENTO REAL PELO TEMPO
    obterEstado: function() {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        const chave = `suiri_monstrinho_${idMembro}`;
        const salvo = localStorage.getItem(chave);
        const agora = Date.now();

        if (salvo) {
            try {
                const obj = JSON.parse(salvo);
                if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Estado inválido');
                if (!obj.nome || obj.nome === 'Tutu') obj.nome = 'Chuíri';
                if (typeof obj.moedas !== 'number') obj.moedas = 50;
                if (typeof obj.fome !== 'number') obj.fome = 80;
                if (typeof obj.felicidade !== 'number') obj.felicidade = 85;
                if (typeof obj.higiene !== 'number') obj.higiene = 90;
                if (typeof obj.energia !== 'number') obj.energia = 85;

                const ultimoTimestamp = obj.ultimo_timestamp || agora;
                const horasPassadas = Math.floor((agora - ultimoTimestamp) / (1000 * 60 * 60));

                if (horasPassadas >= 1) {
                    const perdaFome = Math.min(50, horasPassadas * 4);
                    const perdaHigiene = Math.min(40, horasPassadas * 3);
                    const perdaEnergia = obj.dormindo ? 0 : Math.min(40, horasPassadas * 3);
                    const perdaFelicidade = Math.min(35, horasPassadas * 2);

                    obj.fome = Math.max(15, obj.fome - perdaFome);
                    obj.higiene = Math.max(15, obj.higiene - perdaHigiene);
                    obj.energia = obj.dormindo ? Math.min(100, obj.energia + (horasPassadas * 10)) : Math.max(15, obj.energia - perdaEnergia);
                    obj.felicidade = Math.max(20, obj.felicidade - perdaFelicidade);
                    obj.ultimo_timestamp = agora;
                    this.salvarEstado(obj);
                }
                return obj;
            } catch (e) {}
        }

        const estadoInicial = {
            nome: 'Chuíri',
            fome: 80,
            felicidade: 85,
            higiene: 90,
            energia: 85,
            moedas: 50,
            ultimo_timestamp: agora
        };
        this.salvarEstado(estadoInicial);
        return estadoInicial;
    },

    salvarEstado: function(estado, atualizarHorario = true) {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        if (atualizarHorario) estado.ultimo_timestamp = Date.now();
        localStorage.setItem(`suiri_monstrinho_${idMembro}`, JSON.stringify(estado));
    },

    definirEstadoAnimacao: function(estadoNome, duracaoTemporariaMs = 0) {
        const imgs = [
            document.getElementById('img-chuiri-animado-widget'),
            document.getElementById('img-chuiri-animado-palco')
        ].filter(Boolean);

        if (imgs.length === 0) return;

        if (this._timeoutAnimacao) {
            clearTimeout(this._timeoutAnimacao);
            this._timeoutAnimacao = null;
        }

        if (estadoNome === 'dormir') {
            imgs.forEach(img => { img.src = this.GIFS_CHUIRI.dormir; });
            this._timeoutAnimacao = setTimeout(() => {
                imgs.forEach(img => { img.src = this.GIFS_CHUIRI.dormindo; });
            }, 7930); // Duração de uma volta da animação original de deitar.
            return;
        }

        imgs.forEach(img => { img.src = this.GIFS_CHUIRI[estadoNome] || this.GIFS_CHUIRI.padrao; });

        if (duracaoTemporariaMs > 0) {
            this._timeoutAnimacao = setTimeout(() => {
                const estado = this.obterEstado();
                const voltaPara = this.animacaoDeRepouso(estado);
                imgs.forEach(img => { img.src = this.GIFS_CHUIRI[voltaPara]; });
            }, duracaoTemporariaMs);
        }
    },

    // 6. MOTOR DE ÁUDIO NO MODO KIDS
    obterAudioCtx: function() {
        if (!window.modoKidsAtivo) return null;
        if (!this._audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this._audioCtx = new AudioCtx();
        }
        if (this._audioCtx && this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    },

    tocarAudio: function(tipoAudio) {
        if (!window.modoKidsAtivo || this.obterEstado().silencioso) return;

        if (this._instanciaAudioAtual) {
            try { this._instanciaAudioAtual.pause(); this._instanciaAudioAtual.currentTime = 0; } catch (e) {}
        }

        const cfg = this.CONFIG_PASTAS_AUDIO[tipoAudio];
        if (cfg) {
            const sorteado = Math.floor(Math.random() * (cfg.total || 1)) + 1;
            const audio = new Audio(`${cfg.pasta}/${sorteado}.mp3`);
            this._instanciaAudioAtual = audio;
            audio.play().catch(() => { this.tocarMelodiaMascote(); });
        } else {
            this.tocarMelodiaMascote();
        }
    },

    tocarMelodiaMascote: function() {
        if (!window.modoKidsAtivo || this.obterEstado().silencioso) return;
        try {
            const ctx = this.obterAudioCtx();
            if (!ctx) return;
            const notas = [523.25, 659.25, 783.99, 1046.50];
            notas.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.08));
                gain.gain.setValueAtTime(0.08, ctx.currentTime + (idx * 0.08));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.08) + 0.07);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + (idx * 0.08));
                osc.stop(ctx.currentTime + (idx * 0.08) + 0.075);
            });
        } catch (e) {}
    },

    animacaoDeRepouso: function(estado) {
        if (estado.dormindo) return 'dormindo';
        return Math.min(estado.fome, estado.higiene) < 30 ? 'triste' : 'padrao';
    },

    montarWidgetNaTela: function() {
        const widget = document.getElementById('container-tamagotchi-kids');
        if (!widget) return;
        const perfil = window.modoKidsAtivo ? window.perfilAtual?.id : null;
        if (this._perfilWidget !== perfil) {
            this.fecharCasinha();
            clearTimeout(this._timeoutAnimacao);
            this._instanciaAudioAtual?.pause();
            this._perfilWidget = perfil;
        }
        if (!window.modoKidsAtivo) return;
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao(this.animacaoDeRepouso(this.obterEstado()));
    },

    alternarSom: function() {
        const estado = this.obterEstado();
        estado.silencioso = !estado.silencioso;
        this.salvarEstado(estado, false);
        if (estado.silencioso) this._instanciaAudioAtual?.pause();
        this.atualizarStatusCompacto();
    },

    interagirComToque: function() {
        if (!window.modoKidsAtivo) return;
        const estado = this.obterEstado();
        if (estado.dormindo) {
            this.mostrarRecado('O Chuíri está dormindo. Você pode acordá-lo no quarto.');
            return;
        }
        estado.felicidade = Math.min(100, estado.felicidade + 5);
        this.salvarEstado(estado, false);
        this.atualizarStatusCompacto();
        this.mostrarRecado('O Chuíri adorou seu carinho!');
        this.definirEstadoAnimacao('feliz', 4500);
        this.tocarAudio('toque');
    },

    aoCompletarMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado, false);
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao('feliz', 10000);
        this.tocarAudio('parabens');
    },

    aoFalharMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado, false);
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao('triste', 10000);
        this.tocarAudio('falha');
    },

    abrirCasinha: function() {
        if (!window.modoKidsAtivo) return;
        const modal = document.getElementById('modal-casinha-chuiri');
        if (!modal || modal.open) return;
        const estado = this.obterEstado();
        this.fecharMenuGeladeira(false);
        this.posicionarChuiriNoComodo(estado.dormindo ? 'quarto' : 'sala');
        this.atualizarStatusCompacto();
        this.definirEstadoAnimacao(this.animacaoDeRepouso(estado));
        modal.showModal();
        modal.scrollTop = 0;
    },

    fecharCasinha: function() {
        const modal = document.getElementById('modal-casinha-chuiri');
        if (modal?.open) modal.close();
    },

    mostrarRecado: function(mensagem) {
        for (const id of ['chuiri-recado-kids', 'chuiri-recado-casa']) {
            const campo = document.getElementById(id);
            if (campo) campo.textContent = mensagem;
        }
    },

    atualizarStatusCompacto: function() {
        const estado = this.obterEstado();
        for (const campo of document.querySelectorAll('[data-chuiri-moedas]')) {
            campo.textContent = estado.moedas;
        }
        for (const campo of document.querySelectorAll('[data-chuiri-status]')) {
            campo.value = estado[campo.dataset.chuiriStatus];
            campo.nextElementSibling.textContent = `${campo.value}%`;
        }
        for (const botao of document.querySelectorAll('[data-chuiri-som]')) {
            botao.setAttribute('aria-pressed', String(estado.silencioso === true));
            botao.textContent = estado.silencioso ? 'Voz desligada' : 'Voz ligada';
        }
        const cama = document.getElementById('btn-acao-cama');
        if (cama) cama.textContent = estado.dormindo ? 'Acordar' : 'Cama';
        let recado = 'Vamos brincar?';
        if (estado.dormindo) recado = 'O Chuíri está descansando.';
        else if (estado.fome < 55) recado = 'Que tal um lanche na cozinha?';
        else if (estado.higiene < 55) recado = 'Hora de brincar com água no banho!';
        else if (estado.energia < 55) recado = 'Uma soneca faria bem ao Chuíri.';
        this.mostrarRecado(recado);
    },

    posicionarChuiriNoComodo: function(comodo) {
        const box = document.getElementById('container-chuiri-ativo');
        if (!box) return;

        box.dataset.comodo = comodo;
    },

    executarAcaoNoComodo: function(comodo, estadoAnimacao, tipoAudio, duracaoMs = 8000) {
        this.posicionarChuiriNoComodo(comodo);
        this.definirEstadoAnimacao(estadoAnimacao, duracaoMs);
        if (tipoAudio) this.tocarAudio(tipoAudio);
    },

    acaoDormirCama: function() {
        this.fecharMenuGeladeira(false);
        const estado = this.obterEstado();
        estado.dormindo = !estado.dormindo;
        if (estado.dormindo) estado.energia = Math.min(100, estado.energia + 40);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();
        this.executarAcaoNoComodo('quarto', estado.dormindo ? 'dormir' : this.animacaoDeRepouso(estado), estado.dormindo ? 'saudacao' : null, 0);
        if (!estado.dormindo) this.mostrarRecado('Chuíri acordou!');
    },

    acaoTocarGeladeira: function() {
        this.abrirMenuGeladeira();
    },

    abrirMenuGeladeira: function() {
        const menu = document.getElementById('menu-geladeira-chuiri');
        const grade = document.getElementById('grade-cardapio-geladeira');
        if (!menu || !grade) return;

        const estado = this.obterEstado();
        const saldoMoedas = estado.moedas || 0;

        grade.innerHTML = this.CARDAPIO_COZINHA.map(item => {
            const podeComprar = saldoMoedas >= item.custo;
            const labelPreco = item.custo === 0 ? 'Grátis' : `${item.custo} Moedas`;

            return `
                <button type="button" class="chuiri-lanche" ${podeComprar ? '' : 'disabled'}
                        onclick="window.TamagotchiKids.servirAlimentoGeladeira('${item.id}')">
                    <span class="chuiri-lanche-icone" style="color:${item.cor}" aria-hidden="true">${item.icone}</span>
                    <span><strong>${item.nome}</strong><small>${labelPreco} · +${item.fome}% saciedade</small></span>
                </button>
            `;
        }).join('');

        menu.hidden = false;
        document.getElementById('btn-acao-geladeira').setAttribute('aria-expanded', 'true');
        document.getElementById('chuiri-fechar-geladeira').focus();
    },

    fecharMenuGeladeira: function(devolverFoco = true) {
        const menu = document.getElementById('menu-geladeira-chuiri');
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        const botao = document.getElementById('btn-acao-geladeira');
        botao.setAttribute('aria-expanded', 'false');
        if (devolverFoco) botao.focus();
    },

    servirAlimentoGeladeira: function(idAlimento) {
        const item = this.CARDAPIO_COZINHA.find(x => x.id === idAlimento);
        if (!item) return;

        const estado = this.obterEstado();
        if ((estado.moedas || 0) < item.custo) {
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast(`Faltam moedas para ${item.nome}! Jogue no Arcade ou cumpra missões!`, 'erro');
            }
            return;
        }

        estado.dormindo = false;
        estado.moedas = Math.max(0, (estado.moedas || 0) - item.custo);
        estado.fome = Math.min(100, (estado.fome || 0) + item.fome);
        estado.felicidade = Math.min(100, (estado.felicidade || 0) + item.felicidade);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();
        this.fecharMenuGeladeira();

        this.mostrarRecado(`${item.nome} servido para o Chuíri!`);
        this.executarAcaoNoComodo('cozinha', 'comendo', 'comida', 8000);
    },

    acaoTomarBanho: function() {
        this.fecharMenuGeladeira(false);
        const estado = this.obterEstado();
        estado.dormindo = false;
        estado.higiene = 100;
        estado.felicidade = Math.min(100, estado.felicidade + 12);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();

        this.mostrarRecado('Chuíri tomou um banho!');
        this.executarAcaoNoComodo('banheiro', 'banho', 'parabens', 8500);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-casinha-chuiri');
    modal?.addEventListener('cancel', event => {
        if (document.getElementById('menu-geladeira-chuiri').hidden) return;
        event.preventDefault();
        window.TamagotchiKids.fecharMenuGeladeira();
    });
    document.getElementById('btn-acao-sala')?.addEventListener('click', () => {
        window.TamagotchiKids.fecharCasinha();
    });
    window.addEventListener('pageshow', event => {
        if (!window.modoKidsAtivo) return;
        if (event.persisted) {
            window.TamagotchiKids.fecharCasinha();
            window.carregarMissoesDoDia?.();
        }
        window.TamagotchiKids.montarWidgetNaTela();
    });
});
