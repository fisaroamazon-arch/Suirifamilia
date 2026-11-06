// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-TAMAGOTCHI.JS (100% COMPLETO E INTEGRAL)
// Casinha Dobro do Tamanho (220px), Imagem Interna Alinhada (interna.jpg),
// Ícones Exatos nos Cômodos e Animações Executadas no Próprio Ambiente.
// Redirecionamento Direto para o Arcade (jogos.html). Zero Emojis (SVG Puro).
// =========================================================================

window.TamagotchiKids = {
    // 1. MÍDIAS DA CASA E DO CHUÍRI
    MIDIAS_CASA: {
        externa: 'casa.gif',
        internaFoto: 'interna.jpg'
    },

    GIFS_CHUIRI: {
        padrao:   'padrao.gif',
        dormir:   'dormir.gif',
        dormindo: 'dormindo.gif',
        banho:    'banho.gif',
        comendo:  'comendo.gif',
        feliz:    'feliz.gif',
        triste:   'triste.gif'
    },

    // 2. CONFIGURAÇÃO DE ÁUDIOS MP3
    CONFIG_PASTAS_AUDIO: {
        saudacao: { pasta: 'audios/saudacao', total: 3 },
        parabens: { pasta: 'audios/parabens', total: 3 },
        falha:    { pasta: 'audios/consolo',  total: 3 },
        comida:   { pasta: 'audios/delicia',  total: 3 },
        toque:    { pasta: 'audios/amigo',    total: 10 }
    },

    // 3. ESTADO NO LOCALSTORAGE
    obterEstado: function() {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        const chave = `suiri_monstrinho_${idMembro}`;
        const salvo = localStorage.getItem(chave);

        if (salvo) {
            try {
                const obj = JSON.parse(salvo);
                if (!obj.nome || obj.nome === 'Tutu') obj.nome = 'Chuíri';
                if (typeof obj.moedas !== 'number') obj.moedas = 50;
                if (typeof obj.higiene !== 'number') obj.higiene = 90;
                if (typeof obj.energia !== 'number') obj.energia = 85;
                return obj;
            } catch (e) {}
        }

        const estadoInicial = { nome: 'Chuíri', fome: 80, felicidade: 85, higiene: 90, energia: 85, moedas: 50 };
        this.salvarEstado(estadoInicial);
        return estadoInicial;
    },

    salvarEstado: function(estado) {
        const idMembro = window.perfilAtual?.id || 'padrao_kids';
        localStorage.setItem(`suiri_monstrinho_${idMembro}`, JSON.stringify(estado));
    },

    preCarregarMidias: function() {
        this._cacheImagens = {};
        const midiasImagens = { ...this.GIFS_CHUIRI, externa: this.MIDIAS_CASA.externa, internaFoto: this.MIDIAS_CASA.internaFoto };
        Object.entries(midiasImagens).forEach(([chave, url]) => {
            const img = new Image();
            img.src = url;
            this._cacheImagens[chave] = img;
        });
    },

    // 4. MOTOR DE ANIMAÇÃO DO CHUÍRI
    dormindoNaCama: false,

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
            }, 10000);
            return;
        }

        const srcEscolhido = this.GIFS_CHUIRI[estadoNome] || this.GIFS_CHUIRI.padrao;
        imgs.forEach(img => { img.src = srcEscolhido; });

        if (duracaoTemporariaMs > 0) {
            this._timeoutAnimacao = setTimeout(() => {
                const voltaPara = this.dormindoNaCama ? 'dormindo' : 'padrao';
                imgs.forEach(img => { img.src = this.GIFS_CHUIRI[voltaPara]; });
            }, duracaoTemporariaMs);
        }
    },

    // 5. MOTOR DE ÁUDIO
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
        if (!window.modoKidsAtivo) return;

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
        if (!window.modoKidsAtivo) return;
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

    // 6. WIDGET DA CASINHA (DOBRO DO TAMANHO: 220px) E CHUÍRI NO RODAPÉ
    montarWidgetNaTela: function() {
        if (!window.modoKidsAtivo) {
            document.getElementById('container-tamagotchi-kids')?.remove();
            return;
        }

        if (document.getElementById('container-tamagotchi-kids')) return;

        this.preCarregarMidias();

        const widget = document.createElement('div');
        widget.id = 'container-tamagotchi-kids';
        widget.style.cssText = `
            position: fixed; bottom: 18px; right: 14px;
            display: flex; align-items: flex-end; gap: 8px;
            z-index: 999; user-select: none; -webkit-tap-highlight-color: transparent;
        `;

        widget.innerHTML = `
            <!-- CASINHA COM O DOBRO DO TAMANHO (220px x 260px) -->
            <div id="btn-casinha-tamagotchi" title="Entrar na Casinha" style="width: 220px; height: 260px; cursor: pointer; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: flex-end; justify-content: center;">
                <img src="${this.MIDIAS_CASA.externa}" alt="Casinha do Chuíri" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));" />
            </div>

            <!-- CHUÍRI AO LADO -->
            <div id="btn-chuiri-tamagotchi" title="Falar com o Chuíri" style="width: 130px; height: 130px; cursor: pointer; position: relative; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); margin-bottom: 6px;">
                <img id="img-chuiri-animado-widget" src="${this.GIFS_CHUIRI.padrao}" alt="Chuíri" style="width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));" />
            </div>
        `;

        document.body.appendChild(widget);

        document.getElementById('btn-chuiri-tamagotchi').onclick = (e) => { e.stopPropagation(); this.interagirComToque(); };
        document.getElementById('btn-casinha-tamagotchi').onclick = (e) => { e.stopPropagation(); this.abrirCasinha(); };

        this.definirEstadoAnimacao('padrao');
        setTimeout(() => { if (window.modoKidsAtivo) this.tocarAudio('saudacao'); }, 1200);
    },

    interagirComToque: function() {
        const btnMascote = document.getElementById('btn-chuiri-tamagotchi');
        if (btnMascote) { 
            btnMascote.style.transform = 'scale(1.1)'; 
            setTimeout(() => { btnMascote.style.transform = 'scale(1)'; }, 200); 
        }
        this.definirEstadoAnimacao('feliz', 10000);
        this.tocarAudio('toque');
    },

    aoCompletarMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.min(100, estado.felicidade + 15);
        estado.moedas = (estado.moedas || 0) + 15;
        this.salvarEstado(estado);
        this.definirEstadoAnimacao('feliz', 10000);
        this.tocarAudio('parabens');
    },

    aoFalharMissao: function() {
        const estado = this.obterEstado();
        estado.felicidade = Math.max(10, estado.felicidade - 10);
        this.salvarEstado(estado);
        this.definirEstadoAnimacao('triste', 10000);
        this.tocarAudio('falha');
    },

    // 7. MODAL INTERNO - FOTO INTERNA.JPG EM TELA TOTAL
    abrirCasinha: function() {
        const btnCasinha = document.getElementById('btn-casinha-tamagotchi');
        if (btnCasinha) { 
            btnCasinha.style.transform = 'scale(1.08) rotate(-2deg)'; 
            setTimeout(() => { btnCasinha.style.transform = 'scale(1)'; }, 200); 
        }

        let modal = document.getElementById('modal-casinha-chuiri');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-casinha-chuiri';
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed !important; top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: rgba(10, 15, 29, 0.94) !important; backdrop-filter: blur(8px) !important;
                z-index: 9999999 !important; display: flex !important; align-items: center !important;
                justify-content: center !important; padding: 4px !important; box-sizing: border-box !important;
            `;

            modal.innerHTML = `
                <div style="width: 100%; max-width: 440px; height: 98vh; max-height: 840px; background: #000000; border: 3px solid #f59e0b; border-radius: 26px; display: flex; flex-direction: column; overflow: hidden; position: relative; box-shadow: 0 25px 60px rgba(0,0,0,0.6); box-sizing: border-box;">
                    
                    <!-- BARRA COMPACTA NO TOPO -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; z-index: 50; display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); pointer-events: auto;">
                        <div style="display:flex; align-items:center; gap:6px; background: rgba(0,0,0,0.65); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(245,158,11,0.5);">
                            <span style="font-size: 11px; font-weight: 800; color: #fde047; display:inline-flex; align-items:center; gap:4px;">
                                <svg class="icone-svg" style="width:13px;height:13px;color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>
                                <span id="txt-saldo-moedas-chuiri">0</span>
                            </span>
                            <span style="color:#64748b; font-size:10px;">•</span>
                            <span style="font-size: 10px; font-weight: 700; color: #a7f3d0;">Fome: <span id="txt-barra-fome">80%</span></span>
                            <span style="font-size: 10px; font-weight: 700; color: #7dd3fc;">Banho: <span id="txt-barra-higiene">90%</span></span>
                        </div>
                        <button type="button" style="width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(239, 68, 68, 0.85); color: #ffffff; font-size: 15px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);" onclick="window.TamagotchiKids.fecharCasinha()">✕</button>
                    </div>

                    <!-- FOTO INTERNA (interna.jpg) EM TELA TOTAL -->
                    <div style="flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden; background: #000000; display: flex; align-items: center; justify-content: center;">
                        <img id="img-cenario-interna" src="${this.MIDIAS_CASA.internaFoto}" alt="Interior da Casa" style="width: 100%; height: 100%; object-fit: cover; display: block;" />

                        <!-- CAMADA DE ÍCONES DE CÔMODOS REPOSICIONADOS -->
                        <div id="camada-icones-comodos" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; transition: opacity 0.3s ease;">
                            
                            <!-- 1. QUARTO (CAMA) - Alinhado no mezanino sobre a cama -->
                            <div id="btn-acao-cama" title="Dormir na Cama" onclick="window.TamagotchiKids.acaoDormirCama()" style="position: absolute; top: 31%; left: 52%; width: 44px; height: 44px; border-radius: 50%; background: rgba(124, 58, 237, 0.9); border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:20px;height:20px;color:#ffffff;" viewBox="0 0 24 24"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                            </div>

                            <!-- 2. COZINHA (GELADEIRA) - Alinhado em cima da geladeira branca -->
                            <div id="btn-acao-geladeira" title="Comer na Geladeira" onclick="window.TamagotchiKids.acaoTocarGeladeira()" style="position: absolute; top: 52%; left: 22%; width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.92); border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:20px;height:20px;color:#ffffff;" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                            </div>

                            <!-- 3. BANHEIRO (BANHO) - Alinhado sobre a banheira -->
                            <div id="btn-acao-banho" title="Tomar Banho" onclick="window.TamagotchiKids.acaoTomarBanho()" style="position: absolute; top: 57%; left: 65%; width: 44px; height: 44px; border-radius: 50%; background: rgba(2, 132, 199, 0.92); border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:20px;height:20px;color:#ffffff;" viewBox="0 0 24 24"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2"/><line x1="4" y1="21" x2="5" y2="19"/><line x1="20" y1="21" x2="19" y2="19"/></svg>
                            </div>

                            <!-- 4. SALA (JOGOS NO SOFÁ) - Alinhado na sala térrea -->
                            <div id="btn-acao-sala" title="Abrir Arcade de Jogos" onclick="window.TamagotchiKids.acaoTocarSala()" style="position: absolute; bottom: 12%; left: 26%; width: 44px; height: 44px; border-radius: 50%; background: rgba(16, 185, 129, 0.92); border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; pointer-events: auto;">
                                <svg class="icone-svg" style="width:20px;height:20px;color:#ffffff;" viewBox="0 0 24 24"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>
                            </div>

                        </div>

                        <!-- CHUÍRI (RENDERIZADO EXATAMENTE NO CÔMODO ATUAL) -->
                        <div id="container-chuiri-ativo" style="position: absolute; bottom: 8%; left: 34%; width: 95px; height: 95px; z-index: 35; pointer-events: none; transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);">
                            <img id="img-chuiri-animado-palco" src="${this.GIFS_CHUIRI.padrao}" alt="Chuíri" style="width:100%; height:100%; object-fit:contain; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.55));" />
                        </div>

                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.atualizarStatusCompacto();
        this.posicionarChuiriNoComodo('sala');
        modal.style.display = 'flex';
    },

    fecharCasinha: function() { 
        const modal = document.getElementById('modal-casinha-chuiri'); 
        if (modal) modal.style.display = 'none'; 
    },

    atualizarStatusCompacto: function() {
        const estado = this.obterEstado();
        const elMoedas = document.getElementById('txt-saldo-moedas-chuiri');
        const elFome = document.getElementById('txt-barra-fome');
        const elBanho = document.getElementById('txt-barra-higiene');

        if (elMoedas) elMoedas.textContent = estado.moedas || 0;
        if (elFome) elFome.textContent = `${estado.fome}%`;
        if (elBanho) elBanho.textContent = `${estado.higiene}%`;
    },

    // 8. POSICIONAMENTO E ANIMAÇÃO DO CHUÍRI NO PRÓPRIO CÔMODO
    posicionarChuiriNoComodo: function(comodo) {
        const box = document.getElementById('container-chuiri-ativo');
        if (!box) return;

        box.style.transform = 'none';
        box.style.top = 'auto';
        box.style.right = 'auto';

        if (comodo === 'quarto') {
            // Em cima da cama no sótão
            box.style.bottom = '64%';
            box.style.left = '46%';
            box.style.width = '84px';
            box.style.height = '84px';
        } else if (comodo === 'cozinha') {
            // Ao lado da mesa e geladeira
            box.style.bottom = '36%';
            box.style.left = '28%';
            box.style.width = '90px';
            box.style.height = '90px';
        } else if (comodo === 'banheiro') {
            // Próximo à banheira
            box.style.bottom = '36%';
            box.style.left = '60%';
            box.style.width = '90px';
            box.style.height = '90px';
        } else if (comodo === 'sala') {
            // Em frente à lareira / poltrona
            box.style.bottom = '8%';
            box.style.left = '34%';
            box.style.width = '95px';
            box.style.height = '95px';
        }
    },

    // 9. EXECUÇÃO DE ANIMAÇÕES NOS CÔMODOS
    executarAcaoNoComodo: function(comodo, estadoAnimacao, tipoAudio, duracaoMs = 8000) {
        this.posicionarChuiriNoComodo(comodo);
        this.definirEstadoAnimacao(estadoAnimacao);
        if (tipoAudio) this.tocarAudio(tipoAudio);

        if (this._timeoutAcaoComodo) clearTimeout(this._timeoutAcaoComodo);
        this._timeoutAcaoComodo = setTimeout(() => {
            const voltaPara = this.dormindoNaCama ? 'dormindo' : 'padrao';
            this.definirEstadoAnimacao(voltaPara);
        }, duracaoMs);
    },

    // 10. AÇÕES DISPARADAS PELOS BOTÕES
    acaoDormirCama: function() {
        this.dormindoNaCama = !this.dormindoNaCama;
        const estado = this.obterEstado();

        if (this.dormindoNaCama) {
            estado.energia = Math.min(100, estado.energia + 35);
            this.salvarEstado(estado);
            this.atualizarStatusCompacto();
            this.posicionarChuiriNoComodo('quarto');
            this.definirEstadoAnimacao('dormir');
            this.tocarAudio('saudacao');
        } else {
            this.posicionarChuiriNoComodo('quarto');
            this.definirEstadoAnimacao('padrao');
        }
    },

    acaoTocarGeladeira: function() {
        const estado = this.obterEstado();
        estado.fome = Math.min(100, estado.fome + 30);
        estado.felicidade = Math.min(100, estado.felicidade + 10);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();

        // Animação comendo no próprio piso da cozinha
        this.executarAcaoNoComodo('cozinha', 'comendo', 'comida', 8000);
    },

    acaoTomarBanho: function() {
        const estado = this.obterEstado();
        estado.higiene = 100;
        estado.felicidade = Math.min(100, estado.felicidade + 10);
        this.salvarEstado(estado);
        this.atualizarStatusCompacto();

        // Animação banho no banheiro
        this.executarAcaoNoComodo('banheiro', 'banho', 'parabens', 8000);
    },

    acaoTocarSala: function() {
        this.posicionarChuiriNoComodo('sala');
        this.definirEstadoAnimacao('feliz', 3000);
        this.tocarAudio('toque');
        
        // Redireciona diretamente para o arcade de jogos
        setTimeout(() => {
            window.location.href = 'jogos.html';
        }, 350);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.modoKidsAtivo) window.TamagotchiKids.montarWidgetNaTela(); }, 600);
});
