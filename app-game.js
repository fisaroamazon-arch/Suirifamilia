// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-GAME.JS (100% COMPLETO & INTEGRAL)
// Sons Dinâmicos Nativos (Adultos vs Kids), Mascote Animado Kids,
// Gamificação, Patamares, Emblemas/Conquistas e Loja de Recompensas
// =========================================================================

// =========================================================================
// 1. SINTETIZADOR DE ÁUDIO NATIVO DINÂMICO (ADULTOS VS MODO KIDS)
// =========================================================================
window.SonsSuiri = {
    ctx: null,

    obterContexto: function() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },

    // Desbloqueia o motor de áudio no primeiro toque na tela
    desbloquearAudioGlobal: function() {
        const ctx = this.obterContexto();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    },

    // Identifica se o perfil ativo deve receber feedback sonoro infantil
    ehPerfilKids: function() {
        return Boolean(
            window.modoKidsAtivo || 
            window.perfilAtual?.eh_kids || 
            window.perfilAtual?.papel === 'dependente'
        );
    },

    // 1. CLIQUE / TOQUE DE NAVEGAÇÃO
    popClique: function() {
        const ctx = this.obterContexto();
        if (!ctx) return;

        if (this.ehPerfilKids()) {
            // Estalo agudo e saltitante de desenho animado
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(480, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.09);
        } else {
            // Toque suave, curto e discreto estilo interface executiva
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
        }
    },

    // 2. MISSÃO / TAREFA CONCLUÍDA COM SUCESSO
    sucessoMissao: function() {
        const ctx = this.obterContexto();
        if (!ctx) return;

        if (this.ehPerfilKids()) {
            // Trombetas triunfantes e fanfarra real para crianças
            const notasTrombeta = [
                { f: 523.25, t: 0.00, d: 0.12 }, // Dó
                { f: 523.25, t: 0.12, d: 0.12 }, // Dó
                { f: 523.25, t: 0.24, d: 0.12 }, // Dó
                { f: 659.25, t: 0.36, d: 0.24 }, // Mi
                { f: 783.99, t: 0.60, d: 0.40 }  // Sol triunfante
            ];

            notasTrombeta.forEach(nota => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(nota.f, ctx.currentTime + nota.t);

                gain.gain.setValueAtTime(0.18, ctx.currentTime + nota.t);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + nota.t + nota.d);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + nota.t);
                osc.stop(ctx.currentTime + nota.t + nota.d + 0.02);
            });

            setTimeout(() => this.sininhosMagicos(), 350);
        } else {
            // Acorde acústico sofisticado e harmonioso (Major 7th) para adultos
            const notasAdulto = [440, 554.37, 659.25, 830.61]; // A, C#, E, G#
            notasAdulto.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(0.09, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.50);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.52);
            });
        }
    },

    // 3. SININHOS MÁGICOS CRISTALINOS (CHIMES)
    sininhosMagicos: function() {
        const ctx = this.obterContexto();
        if (!ctx) return;

        const agudos = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
        agudos.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.06);

            gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + idx * 0.06);
            osc.stop(ctx.currentTime + idx * 0.06 + 0.36);
        });
    },

    // 4. ERRO, DESISTÊNCIA OU TAREFA FALHADA
    somFalhaAcolhedor: function() {
        const ctx = this.obterContexto();
        if (!ctx) return;

        if (this.ehPerfilKids()) {
            // Trombone cômico com efeito WA-WA-WA-WAAAH
            const tromboneNotas = [
                { f: 293.66, t: 0.00, d: 0.28 }, // Ré
                { f: 277.18, t: 0.30, d: 0.28 }, // Dó#
                { f: 261.63, t: 0.60, d: 0.28 }, // Dó
                { f: 246.94, t: 0.90, d: 0.65, vibrato: true } // Si arrastado
            ];

            tromboneNotas.forEach(nota => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(nota.f, ctx.currentTime + nota.t);

                if (nota.vibrato) {
                    osc.frequency.linearRampToValueAtTime(nota.f - 25, ctx.currentTime + nota.t + nota.d);
                }

                gain.gain.setValueAtTime(0.22, ctx.currentTime + nota.t);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + nota.t + nota.d);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + nota.t);
                osc.stop(ctx.currentTime + nota.t + nota.d + 0.05);
            });
        } else {
            // Tom descendente discreto e neutro para adultos
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.16);

            gain.gain.setValueAtTime(0.10, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.18);
        }
    },

    // 5. GANHO DE PONTOS / MOEDAS / REGISTRO FINANCEIRO
    moedaXP: function() {
        const ctx = this.obterContexto();
        if (!ctx) return;

        if (this.ehPerfilKids()) {
            this.sininhosMagicos();
        } else {
            // Duplo tom leve de confirmação para adultos
            [784, 1046.50].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

                gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.16);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + idx * 0.08 + 0.18);
            });
        }
    },

    fanfarraNivel: function() {
        this.sucessoMissao();
    }
};

// Desbloqueia o motor de áudio no primeiro toque na tela (compatibilidade mobile)
document.addEventListener('touchstart', () => window.SonsSuiri.desbloquearAudioGlobal(), { once: true });
document.addEventListener('click', () => window.SonsSuiri.desbloquearAudioGlobal(), { once: true });

// =========================================================================
// 2. MOTOR DE MASCOTE ANIMADO KIDS (ILUSTRAÇÕES VETORIAIS SVG)
// =========================================================================
window.MascotesSvg = {
    feliz: `
        <svg viewBox="0 0 120 120" style="width:105px; height:105px; animation: bounceMascote 0.6s infinite alternate ease-in-out;">
            <defs>
                <linearGradient id="gradEstrelaFeliz" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fde047"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                </linearGradient>
            </defs>
            <polygon points="60,10 74,42 108,45 82,68 90,102 60,84 30,102 38,68 12,45 46,42" 
                fill="url(#gradEstrelaFeliz)" stroke="#d97706" stroke-width="4" stroke-linejoin="round"/>
            <circle cx="42" cy="62" r="6" fill="#f472b6" opacity="0.6"/>
            <circle cx="78" cy="62" r="6" fill="#f472b6" opacity="0.6"/>
            <path d="M 44 54 Q 48 48 52 54" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <path d="M 68 54 Q 72 48 76 54" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="none"/>
            <path d="M 50 64 Q 60 76 70 64" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" fill="#b45309"/>
            <polygon points="18,22 22,26 18,30 14,26" fill="#fbbf24"/>
            <polygon points="102,22 106,26 102,30 98,26" fill="#fbbf24"/>
        </svg>
    `,

    triste: `
        <svg viewBox="0 0 120 120" style="width:105px; height:105px; animation: balancoMascoteTriste 1.2s infinite ease-in-out;">
            <defs>
                <linearGradient id="gradEstrelaTriste" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fed7aa"/>
                    <stop offset="100%" stop-color="#fb923c"/>
                </linearGradient>
            </defs>
            <polygon points="60,10 74,42 108,45 82,68 90,102 60,84 30,102 38,68 12,45 46,42" 
                fill="url(#gradEstrelaTriste)" stroke="#ea580c" stroke-width="4" stroke-linejoin="round"/>
            <path d="M 42 50 Q 48 48 52 52" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 78 50 Q 72 48 68 52" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="48" cy="56" r="3.5" fill="#7c2d12"/>
            <circle cx="72" cy="56" r="3.5" fill="#7c2d12"/>
            <path d="M 52 70 Q 60 63 68 70" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M 78 62 C 78 66 74 69 74 72 C 74 74 76 76 78 76 C 80 76 82 74 82 72 C 82 69 78 66 78 62 Z" fill="#38bdf8"/>
        </svg>
    `
};

window.dispararMascoteKids = function(tipo, mensagem) {
    const modal = document.getElementById('overlay-mascote-kids');
    const boxAnimacao = document.getElementById('box-animacao-mascote-kids');
    const tituloEl = document.getElementById('titulo-mascote-kids');
    const subtextoEl = document.getElementById('subtexto-mascote-kids');
    const btnFechar = document.getElementById('btn-fechar-mascote-kids');

    if (!modal || !boxAnimacao) return;

    if (tipo === 'feliz') {
        boxAnimacao.innerHTML = window.MascotesSvg.feliz;
        if (tituloEl) {
            tituloEl.textContent = "MUITO BEM! PARABÉNS!";
            tituloEl.style.color = "#15803d";
        }
        if (btnFechar) {
            btnFechar.className = "btn-sucesso";
            btnFechar.textContent = "Continuar";
        }
        if (window.SonsSuiri) window.SonsSuiri.sucessoMissao();
    } else {
        boxAnimacao.innerHTML = window.MascotesSvg.triste;
        if (tituloEl) {
            tituloEl.textContent = "QUE PENA!";
            tituloEl.style.color = "#dc2626";
        }
        if (btnFechar) {
            btnFechar.className = "btn-principal";
            btnFechar.textContent = "Continuar";
        }
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
    }

    if (subtextoEl) subtextoEl.textContent = mensagem;

    modal.classList.remove('oculto');
};

window.fecharModalMascoteKids = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('overlay-mascote-kids')?.classList.add('oculto');
};

// =========================================================================
// 3. MOTOR DE GAMIFICAÇÃO & PRÊMIOS (PADRÕES SEGMENTADOS)
// =========================================================================
window.MotorGamificacao = {
    PATAMARES: [
        { min: 10000, nome: 'Lenda da Casa', iconeChave: 'coroa', cor: '#d97706' },
        { min: 5000,  nome: 'Super Herói',   iconeChave: 'heroi', cor: '#8b5cf6' },
        { min: 2000,  nome: 'Campeão',       iconeChave: 'trofeu', cor: '#0ea5e9' },
        { min: 500,   nome: 'Guardião',      iconeChave: 'medalha', cor: '#10b981' },
        { min: 100,   nome: 'Ajudante',      iconeChave: 'alvo', cor: '#f59e0b' },
        { min: 0,     nome: 'Iniciante',     iconeChave: 'broto', cor: '#16a34a' }
    ],

    PREMIOS_KIDS_PADRAO: [
        { id: 'game_time',        para_kids: true,  corFundo: '#e0f2fe', corBorda: '#38bdf8', iconeChave: 'trofeu',   titulo: '1h de Videogame / Tablet', custo: 200, descricao: 'Tempo extra de tela para jogar seus jogos favoritos.' },
        { id: 'escolher_desenho', para_kids: true,  corFundo: '#fef3c7', corBorda: '#f59e0b', iconeChave: 'filme',    titulo: 'Escolher o Filme ou Desenho', custo: 250, descricao: 'Você escolhe a programação da família na TV!' },
        { id: 'sobremesa_chef',   para_kids: true,  corFundo: '#fce7f3', corBorda: '#ec4899', iconeChave: 'refeicao', titulo: 'Sobremesa Especial / Sorvete', custo: 300, descricao: 'Direito a escolher o sorvete ou sobremesa do dia.' },
        { id: 'dormir_tarde',     para_kids: true,  corFundo: '#f3e8ff', corBorda: '#a855f7', iconeChave: 'coroa',    titulo: '30 Minutos Mais Tarde na Cama', custo: 350, descricao: 'Ficar acordado um pouquinho a mais no fim de semana.' },
        { id: 'passeio_parque',   para_kids: true,  corFundo: '#dcfce7', corBorda: '#22c55e', iconeChave: 'broto',    titulo: 'Passeio Divertido ao Ar Livre', custo: 500, descricao: 'Um passeio alegre com brincadeiras no parque.' }
    ],

    PREMIOS_ADULTOS_PADRAO: [
        { id: 'folga_louca',      para_kids: false, corFundo: '#e0f2fe', corBorda: '#0284c7', iconeChave: 'medalha',  titulo: 'Folga da Louça do Dia', custo: 250, descricao: 'Outro membro da família assume a pia e a louça hoje.' },
        { id: 'massagem_ombros',  para_kids: false, corFundo: '#fef3c7', corBorda: '#f59e0b', iconeChave: 'coroa',    titulo: 'Massagem Relaxante nos Ombros', custo: 300, descricao: 'Momento de relaxamento merecido no fim do dia.' },
        { id: 'escolha_cardapio', para_kids: false, corFundo: '#fce7f3', corBorda: '#ec4899', iconeChave: 'refeicao', titulo: 'Escolher o Cardápio do Jantar', custo: 350, descricao: 'Decisão do que pedir ou preparar na refeição familiar.' },
        { id: 'dia_livre_casa',   para_kids: false, corFundo: '#dcfce7', corBorda: '#10b981', iconeChave: 'trofeu',   titulo: 'Passe Livre de Tarefas Domésticas', custo: 600, descricao: 'Um dia inteiro sem nenhuma obrigação na rotina da casa.' }
    ],

    obterPatamar: function(xp) {
        const total = Math.max(0, Number(xp) || 0);
        for (const p of this.PATAMARES) {
            if (total >= p.min) return p;
        }
        return this.PATAMARES[this.PATAMARES.length - 1];
    },

    obterIconeSvg: function(chave) {
        return window.IconesSuiri?.[chave] || window.IconesSuiri?.trofeu || `
            <svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="12 6 15 11 20 12 16 16 17 21 12 18 7 21 8 16 4 12 9 11 12 6"/></svg>
        `;
    }
};

// =========================================================================
// 3B. SISTEMA DE CONQUISTAS E EMBLEMAS (VITRINE)
// =========================================================================
window.SistemaEmblemas = {
    lista: [
        { id: 'fogo_implacavel', icone: 'fogo', titulo: 'Fogo Implacável', desc: 'Atingir 7 dias seguidos de ofensiva na casa.', meta: 7 },
        { id: 'mestre_economia', icone: 'carrinho', titulo: 'Mestre da Economia', desc: 'Fechar uma compra de mercado abaixo da média mensal.', meta: 1 },
        { id: 'guardiao_limpeza', icone: 'vassoura', titulo: 'Guardião da Limpeza', desc: 'Concluir 10 missões domésticas na mesma semana.', meta: 10 },
        { id: 'primeiro_passo', icone: 'check', titulo: 'Primeiro Passo', desc: 'Concluir a sua primeira missão com sucesso.', meta: 1 },
        { id: 'acumulador_xp', icone: 'moeda', titulo: 'Riqueza Acumulada', desc: 'Juntar 1000 XP no total histórico.', meta: 1000 }
    ],
    progressoLocal: function() {
        const id = window.perfilAtual?.id || 'default';
        return JSON.parse(localStorage.getItem(`suiri_emblemas_${id}`) || '{}');
    },
    salvarProgresso: function(progresso) {
        const id = window.perfilAtual?.id || 'default';
        localStorage.setItem(`suiri_emblemas_${id}`, JSON.stringify(progresso));
    },
    avaliarEmblemas: function() {
        if (!window.perfilAtual) return;
        let progresso = this.progressoLocal();
        let novos = 0;

        // Regra Automática: Fogo Implacável
        if (!progresso['fogo_implacavel'] && window.perfilAtual.ofensiva_atual >= 7) {
            progresso['fogo_implacavel'] = { desbloqueado: true, data: new Date().toISOString() };
            novos++;
        }

        // Regra Automática: Acumulador de XP
        if (!progresso['acumulador_xp'] && window.perfilAtual.xp_total >= 1000) {
            progresso['acumulador_xp'] = { desbloqueado: true, data: new Date().toISOString() };
            novos++;
        }

        // Regra Automática: Primeiro Passo
        if (!progresso['primeiro_passo'] && window.perfilAtual.xp_total > 50) { // O usuário começa com 50, se tiver mais, fez missão.
            progresso['primeiro_passo'] = { desbloqueado: true, data: new Date().toISOString() };
            novos++;
        }

        if (novos > 0) {
            this.salvarProgresso(progresso);
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast(`Você desbloqueou ${novos} novo(s) emblema(s)! Verifique suas Conquistas 🏆`);
            }
        }
    },
    adicionarProgresso: function(emblemaId, qtd = 1) {
        let progresso = this.progressoLocal();
        if (progresso[emblemaId]?.desbloqueado) return; 

        let atual = progresso[emblemaId]?.qtd || 0;
        atual += qtd;
        
        const emblema = this.lista.find(e => e.id === emblemaId);
        if (emblema && atual >= emblema.meta) {
            progresso[emblemaId] = { desbloqueado: true, qtd: atual, data: new Date().toISOString() };
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast(`Emblema Desbloqueado: ${emblema.titulo}! 🏆`);
            }
            if (window.SonsSuiri) window.SonsSuiri.fanfarraNivel();
        } else {
            progresso[emblemaId] = { desbloqueado: false, qtd: atual };
        }
        this.salvarProgresso(progresso);
    }
};

window.abrirModalEmblemas = function() {
    const modal = document.getElementById('modal-emblemas-conquistas');
    const container = document.getElementById('grid-emblemas-container');
    if (!modal || !container) return;

    if (window.SonsSuiri) window.SonsSuiri.popClique();

    // Reavalia regras automáticas antes de abrir
    if (window.SistemaEmblemas) window.SistemaEmblemas.avaliarEmblemas();

    const progresso = window.SistemaEmblemas.progressoLocal();

    container.innerHTML = window.SistemaEmblemas.lista.map(emb => {
        const status = progresso[emb.id];
        const desbloqueado = status?.desbloqueado === true;
        
        const bg = desbloqueado ? '#fef3c7' : '#f8fafc';
        const borda = desbloqueado ? '#f59e0b' : '#cbd5e1';
        const corIcone = desbloqueado ? '#d97706' : '#94a3b8';
        const corTitulo = desbloqueado ? '#92400e' : '#64748b';
        
        const iconeSvg = window.IconesSuiri?.[emb.icone] || window.IconesSuiri?.trofeu || `<svg class="icone-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;

        return `
            <div style="background: ${bg}; border: 1.5px solid ${borda}; border-radius: 14px; padding: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; opacity: ${desbloqueado ? '1' : '0.6'}; filter: ${desbloqueado ? 'none' : 'grayscale(100%)'}; transition: transform 0.2s;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: #ffffff; border: 2px solid ${borda}; display: flex; align-items: center; justify-content: center; color: ${corIcone}; margin-bottom: 8px; flex-shrink: 0;">
                    ${iconeSvg}
                </div>
                <strong style="font-size: 12.5px; color: ${corTitulo}; line-height: 1.2; margin-bottom: 4px;">${emb.titulo}</strong>
                <span style="font-size: 10.5px; color: #64748b; line-height: 1.3;">${emb.desc}</span>
                <div style="margin-top: auto; padding-top: 8px;">
                    ${desbloqueado 
                        ? `<span style="font-size:9.5px; font-weight:800; color:#15803d; background:#dcfce7; padding:3px 8px; border-radius:6px; border: 1px solid #86efac;">Desbloqueado</span>` 
                        : `<span style="font-size:9.5px; font-weight:800; color:#64748b; background:#e2e8f0; padding:3px 8px; border-radius:6px;">Bloqueado</span>`}
                </div>
            </div>
        `;
    }).join('');

    modal.classList.remove('oculto');
};

window.fecharModalEmblemas = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-emblemas-conquistas')?.classList.add('oculto');
};

// =========================================================================
// 4. PÍLULA DO DIA (DESATIVADA NO MODO KIDS)
// =========================================================================
window.abrirModalPilulaDia = function() {
    if (window.modoKidsAtivo) return;
    const modal = document.getElementById('modal-pilula-dia');
    if (!modal) return;
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    modal.classList.remove('oculto');
};

window.fecharModalPilulaDia = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-pilula-dia')?.classList.add('oculto');
};

// =========================================================================
// 5. SUPER LOJA: SEPARAÇÃO TOTAL (KIDS EXCLUSIVO VS. ADULTOS)
// =========================================================================
window.abrirModalRankingEquipe = async function() {
    const modal = document.getElementById('modal-ranking-equipe');
    if (!modal) return;

    if (window.SonsSuiri) window.SonsSuiri.popClique();

    const tituloLoja = document.getElementById('lbl-titulo-modal-loja');
    const btnNovoPremio = document.getElementById('btn-novo-premio-loja');
    const blocoPodio = document.getElementById('bloco-podio-loja');

    if (window.modoKidsAtivo) {
        if (tituloLoja) tituloLoja.textContent = "Lojinha de Prêmios Kids";
        if (btnNovoPremio) btnNovoPremio.classList.add('oculto');
        if (blocoPodio) blocoPodio.classList.remove('oculto');
    } else {
        if (tituloLoja) tituloLoja.textContent = "Loja de Recompensas do Lar";
        if (btnNovoPremio) btnNovoPremio.classList.remove('oculto');
        if (blocoPodio && window.listaMembrosFamilia && window.listaMembrosFamilia.length <= 1) {
            blocoPodio.classList.add('oculto');
        } else if (blocoPodio) {
            blocoPodio.classList.remove('oculto');
        }
    }

    modal.classList.remove('oculto');
    await window.carregarERenderizarRankingTop3();
    await window.renderizarListaBeneficiosLoja();
};

window.fecharModalRankingEquipe = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-ranking-equipe')?.classList.add('oculto');
};

window.carregarERenderizarRankingTop3 = async function() {
    const supabase = window.clienteSupabase || window.cliente;
    if (!window.familiaAtualId || !supabase) return;

    const { data: membros, error } = await supabase
        .from('membros')
        .select('id, nome, xp_total, ofensiva_atual')
        .eq('familia_id', window.familiaAtualId)
        .order('xp_total', { ascending: false });

    if (error || !membros) return;

    const ranking = membros || [];
    const p1 = ranking[0] || { nome: '-', xp_total: 0 };
    const p2 = ranking[1] || { nome: '-', xp_total: 0 };
    const p3 = ranking[2] || { nome: '-', xp_total: 0 };

    const el1Nome = document.getElementById('podio-colab-1-nome');
    const el1Pts  = document.getElementById('podio-colab-1-pts');
    if (el1Nome) el1Nome.textContent = p1.nome.split(' ')[0];
    if (el1Pts)  el1Pts.textContent = `${p1.xp_total || 0} XP`;

    const el2Nome = document.getElementById('podio-colab-2-nome');
    const el2Pts  = document.getElementById('podio-colab-2-pts');
    if (el2Nome) el2Nome.textContent = p2.nome.split(' ')[0];
    if (el2Pts)  el2Pts.textContent = `${p2.xp_total || 0} XP`;

    const el3Nome = document.getElementById('podio-colab-3-nome');
    const el3Pts  = document.getElementById('podio-colab-3-pts');
    if (el3Nome) el3Nome.textContent = p3.nome.split(' ')[0];
    if (el3Pts)  el3Pts.textContent = `${p3.xp_total || 0} XP`;
};

window.renderizarListaBeneficiosLoja = async function() {
    const container = document.getElementById('lista-beneficios-resgatáveis');
    const lblSaldo = document.getElementById('lbl-saldo-pontos-resgate');
    const supabase = window.clienteSupabase || window.cliente;

    if (!container) return;

    const saldoXP = Number(window.perfilAtual?.xp_total || 0);
    const iconeMoeda = window.IconesSuiri?.moeda || `
        <svg class="icone-svg" style="width:16px; height:16px; color:#d97706;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>
    `;

    if (lblSaldo) {
        lblSaldo.innerHTML = `
            <div style="font-size:14px; font-weight:800; color:#d97706; display:flex; align-items:center; gap:6px;">
                ${iconeMoeda} <span>Seus Pontos: <strong>${saldoXP} XP</strong></span>
            </div>
        `;
    }

    container.innerHTML = '';

    const ehModoKids = !!window.modoKidsAtivo;
    let itensBanco = [];

    if (supabase && window.familiaAtualId) {
        let query = supabase
            .from('beneficios_loja')
            .select('*')
            .eq('familia_id', window.familiaAtualId);

        if (ehModoKids) {
            query = query.eq('para_kids', true);
        }

        const { data } = await query.order('custo', { ascending: true });
        if (data && data.length > 0) {
            itensBanco = data;
        }
    }

    let itensExibicao = itensBanco;
    if (itensBanco.length === 0) {
        itensExibicao = ehModoKids 
            ? window.MotorGamificacao.PREMIOS_KIDS_PADRAO 
            : [...window.MotorGamificacao.PREMIOS_ADULTOS_PADRAO, ...window.MotorGamificacao.PREMIOS_KIDS_PADRAO];
    }

    if (itensExibicao.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px 10px; color:#64748b;">
                <svg class="icone-svg" style="width:36px; height:36px; stroke-width:1.5; margin-bottom:8px;" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
                <p style="font-size:13px; font-weight:700; margin:0;">Nenhum prêmio disponível nesta categoria.</p>
            </div>
        `;
        return;
    }

    itensExibicao.forEach(b => {
        const card = document.createElement('div');
        card.className = 'card-premio-kids';
        card.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--suiri-surface-secondary-light, #fef9ea); border:1px solid var(--borda-delicada, rgba(217, 119, 6, 0.16)); border-radius:14px; margin-bottom:8px;';

        const podeResgatar = saldoXP >= b.custo;
        const ehPersonalizado = !!b.familia_id;
        const iconeItem = window.MotorGamificacao.obterIconeSvg(b.iconeChave || 'presente');
        const bgIcone = b.corFundo || '#fef3c7';
        const bordaIcone = b.corBorda || '#f59e0b';

        const tagPublicoKids = (!ehModoKids && b.para_kids) ? `
            <span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:800; background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:6px; margin-top:3px;">
                <svg class="icone-svg" style="width:11px; height:11px;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Visível para Kids
            </span>
        ` : '';

        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; flex:1; margin-right:8px; min-width:0;">
                <div class="icone-premio-wrapper" style="background:${bgIcone}; border:1.5px solid ${bordaIcone}; color:#334155; border-radius:12px; padding:8px; flex-shrink:0;">
                    <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
                        ${iconeItem}
                    </div>
                </div>
                <div style="min-width:0;">
                    <strong style="font-size:14px; color:#1e293b; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${window.esc ? window.esc(b.titulo) : b.titulo}</strong>
                    <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${window.esc ? window.esc(b.descricao || 'Recompensa da casa') : (b.descricao || 'Recompensa da casa')}</div>
                    ${tagPublicoKids}
                    <div style="font-size:12.5px; font-weight:800; color:#d97706; margin-top:3px; display:inline-flex; align-items:center; gap:4px;">
                        ${iconeMoeda} ${b.custo} XP
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                <button type="button" class="btn-sucesso" style="padding:8px 14px; font-size:12px; font-weight:800; border-radius:10px; opacity:${podeResgatar ? '1' : '0.4'};"
                    ${!podeResgatar ? 'disabled' : ''} onclick="window.resgatarBeneficioLoja('${b.id}', ${b.custo}, '${window.esc ? window.esc(b.titulo) : b.titulo}')">
                    Resgatar
                </button>
                ${(!ehModoKids && ehPersonalizado) ? `
                    <button type="button" class="btn-secundario" style="padding:7px 9px; font-size:11px; border-radius:8px;" onclick="window.abrirModalEditarBeneficioExistente('${b.id}', '${window.esc ? window.esc(b.titulo) : b.titulo}', '${window.esc ? window.esc(b.descricao || '') : (b.descricao || '')}', ${b.custo}, ${!!b.para_kids})" title="Editar">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button type="button" class="btn-erro" style="padding:7px 9px; font-size:11px; border-radius:8px;" onclick="window.excluirBeneficioLoja('${b.id}')" title="Excluir">
                        <svg class="icone-svg" style="width:13px; height:13px;" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
};

// =========================================================================
// 6. RESGATE, CADASTRO, EDIÇÃO E EXCLUSÃO DE BENEFÍCIOS
// =========================================================================
window.resgatarBeneficioLoja = async function(id, custo, titulo) {
    const supabase = window.clienteSupabase || window.cliente;
    if (!window.perfilAtual || !supabase) return;

    const saldoAtual = Number(window.perfilAtual.xp_total || 0);
    if (saldoAtual < custo) {
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
        if (window.TamagotchiKids && typeof window.TamagotchiKids.aoFalharMissao === 'function') {
            window.TamagotchiKids.aoFalharMissao();
        }
        return window.mostrarToast(`Faltam ${custo - saldoAtual} XP para esta recompensa. Continue completando missões!`, "erro");
    }

    const confirmou = window.confirmarAcaoSuiri 
        ? await window.confirmarAcaoSuiri(`Deseja trocar ${custo} XP pela recompensa "${titulo}"?`, "Confirmar Resgate")
        : confirm(`Deseja trocar ${custo} XP pela recompensa "${titulo}"?`);

    if (!confirmou) return;

    const novoSaldo = saldoAtual - custo;

    const { error } = await supabase
        .from('membros')
        .update({ xp_total: novoSaldo })
        .eq('id', window.perfilAtual.id);

    if (error) {
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
        return window.mostrarToast("Falha ao debitar XP: " + error.message, "erro");
    }

    window.perfilAtual.xp_total = novoSaldo;
    if (window.SonsSuiri) window.SonsSuiri.moedaXP();

    if (window.TamagotchiKids && typeof window.TamagotchiKids.aoCompletarMissao === 'function') {
        window.TamagotchiKids.aoCompletarMissao();
    }

    const elXpKids = document.getElementById('contador-xp-kids');
    if (elXpKids) elXpKids.textContent = `${novoSaldo} XP`;

    window.dispararModalCelebracao(
        "RECOMPENSA RESGATADA!",
        `Você resgatou com sucesso "${titulo}". Aproveite sua conquista!`,
        window.IconesSuiri?.presente || `
            <svg class="icone-svg" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
        `
    );

    await window.renderizarListaBeneficiosLoja();
    await window.carregarERenderizarRankingTop3();

    if (typeof window.carregarListaMembrosPainel === 'function') {
        window.carregarListaMembrosPainel();
    }
};

window.abrirModalCriarBeneficio = function() {
    const inId = document.getElementById('edit-beneficio-id');
    const inTitulo = document.getElementById('edit-beneficio-titulo');
    const inDesc = document.getElementById('edit-beneficio-descricao');
    const inCusto = document.getElementById('edit-beneficio-custo');
    const inKids = document.getElementById('edit-beneficio-para-kids');
    const btnExcluir = document.getElementById('btn-excluir-beneficio-loja');
    const tituloModal = document.getElementById('titulo-modal-editar-beneficio');

    if (inId) inId.value = '';
    if (inTitulo) inTitulo.value = '';
    if (inDesc) inDesc.value = '';
    if (inCusto) inCusto.value = '200';
    if (inKids) inKids.checked = false;
    if (btnExcluir) btnExcluir.classList.add('oculto');
    if (tituloModal) tituloModal.textContent = "Criar Recompensa";

    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-editar-beneficio-loja')?.classList.remove('oculto');
};

window.abrirModalEditarBeneficioExistente = function(id, titulo, descricao, custo, paraKids) {
    const inId = document.getElementById('edit-beneficio-id');
    const inTitulo = document.getElementById('edit-beneficio-titulo');
    const inDesc = document.getElementById('edit-beneficio-descricao');
    const inCusto = document.getElementById('edit-beneficio-custo');
    const inKids = document.getElementById('edit-beneficio-para-kids');
    const btnExcluir = document.getElementById('btn-excluir-beneficio-loja');
    const tituloModal = document.getElementById('titulo-modal-editar-beneficio');

    if (inId) inId.value = id;
    if (inTitulo) inTitulo.value = titulo || '';
    if (inDesc) inDesc.value = descricao || '';
    if (inCusto) inCusto.value = custo || '200';
    if (inKids) inKids.checked = !!paraKids;
    if (btnExcluir) btnExcluir.classList.remove('oculto');
    if (tituloModal) tituloModal.textContent = "Editar Recompensa";

    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-editar-beneficio-loja')?.classList.remove('oculto');
};

window.fecharModalCriarBeneficio = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('modal-editar-beneficio-loja')?.classList.add('oculto');
};

window.salvarBeneficioLoja = async function() {
    const supabase = window.clienteSupabase || window.cliente;
    if (!window.familiaAtualId || !supabase) return;

    const inId = document.getElementById('edit-beneficio-id');
    const inTitulo = document.getElementById('edit-beneficio-titulo');
    const inDesc = document.getElementById('edit-beneficio-descricao');
    const inCusto = document.getElementById('edit-beneficio-custo');
    const inKids = document.getElementById('edit-beneficio-para-kids');

    const id = inId?.value;
    const titulo = inTitulo?.value.trim();
    const descricao = inDesc?.value.trim() || '';
    const custo = parseInt(inCusto?.value, 10);
    const paraKids = !!(inKids && inKids.checked);

    if (!titulo || isNaN(custo) || custo <= 0) {
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
        return window.mostrarToast("Preencha o título e uma pontuação válida em XP.", "erro");
    }

    const payload = {
        familia_id: window.familiaAtualId,
        titulo: titulo,
        descricao: descricao,
        custo: custo,
        para_kids: paraKids
    };

    let error = null;
    if (id) {
        const res = await supabase.from('beneficios_loja').update(payload).eq('id', id);
        error = res.error;
    } else {
        const res = await supabase.from('beneficios_loja').insert([payload]);
        error = res.error;
    }

    if (error) {
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
        return window.mostrarToast("Erro ao salvar recompensa: " + error.message, "erro");
    }

    if (window.SonsSuiri) window.SonsSuiri.moedaXP();
    window.mostrarToast(id ? "Recompensa atualizada com sucesso!" : "Nova recompensa adicionada à loja!");
    window.fecharModalCriarBeneficio();
    await window.renderizarListaBeneficiosLoja();
};

window.excluirBeneficioLojaConfirmado = async function() {
    const inId = document.getElementById('edit-beneficio-id');
    const id = inId?.value;
    if (!id) return;
    await window.excluirBeneficioLoja(id);
    window.fecharModalCriarBeneficio();
};

window.excluirBeneficioLoja = async function(id) {
    const supabase = window.clienteSupabase || window.cliente;
    if (!supabase || !id) return;

    const confirmou = window.confirmarAcaoSuiri 
        ? await window.confirmarAcaoSuiri("Deseja realmente remover esta recompensa da loja?", "Excluir Recompensa")
        : confirm("Deseja realmente remover esta recompensa da loja?");

    if (!confirmou) return;

    const { error } = await supabase.from('beneficios_loja').delete().eq('id', id);
    if (!error) {
        if (window.SonsSuiri) window.SonsSuiri.popClique();
        window.mostrarToast("Recompensa removida com sucesso.");
        await window.renderizarListaBeneficiosLoja();
    } else {
        if (window.SonsSuiri) window.SonsSuiri.somFalhaAcolhedor();
        window.mostrarToast("Erro ao remover: " + error.message, "erro");
    }
};

// =========================================================================
// 7. CELEBRAÇÃO HEROICA VISUAL (100% SVG)
// =========================================================================
window.dispararModalCelebracao = function(titulo, mensagem, iconeSvg) {
    const modal = document.getElementById('overlay-celebracao-subida-nivel');
    if (!modal) return;

    const elIcone = document.getElementById('celebracao-nivel-icone');
    const elTitulo = document.getElementById('celebracao-nivel-titulo');
    const elSub = document.getElementById('celebracao-nivel-subtexto');

    if (elIcone) {
        elIcone.innerHTML = iconeSvg || window.IconesSuiri?.trofeu || `
            <svg class="icone-svg" style="width:54px; height:54px; color:#f59e0b;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        `;
        const svgEl = elIcone.querySelector('svg');
        if (svgEl) {
            svgEl.style.width = '54px';
            svgEl.style.height = '54px';
            svgEl.style.color = '#f59e0b';
        }
    }
    if (elTitulo) elTitulo.textContent = titulo;
    if (elSub) elSub.textContent = mensagem;

    modal.classList.remove('oculto');
    if (window.SonsSuiri) window.SonsSuiri.fanfarraNivel();
};

window.fecharCelebracaoNivel = function() {
    if (window.SonsSuiri) window.SonsSuiri.popClique();
    document.getElementById('overlay-celebracao-subida-nivel')?.classList.add('oculto');
};
