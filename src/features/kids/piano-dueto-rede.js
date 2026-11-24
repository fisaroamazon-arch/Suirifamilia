window.DuetoPiano = (() => {
    const codigoValido = /^[0-9a-f]{32}$/;
    const idValido = /^[0-9a-f-]{36}$/;
    const timbres = ['piano', 'cordas', 'xilofone'];
    const vozesRemotas = new Map();
    let cliente;
    let sala;
    let recado = '';

    function atualizarTela() {
        const jogo = document.getElementById('piano-rede-estado');
        const ajustes = document.getElementById('piano-rede-ajustes');
        for (const campo of [jogo, ajustes]) {
            if (!campo) continue;
            campo.hidden = !recado;
            campo.textContent = recado;
        }
        document.querySelector('[data-piano-criar]').hidden = Boolean(sala);
        document.querySelector('[data-piano-convidar]').hidden = !sala?.anfitriao || !sala.conectada;
        document.querySelector('[data-piano-sair]').hidden = !sala;
        document.querySelector('[data-piano-entrar]').hidden = Boolean(sala);
        const convidado = sala && !sala.anfitriao;
        document.querySelectorAll('#piano-configuracoes [data-estilo-piano], #seletor-musica-alvo, [data-parte-piano], #botoes-velocidade-solo button')
            .forEach(campo => { campo.disabled = Boolean(convidado); });
        const iniciar = document.getElementById('btn-play-musica-dueto');
        iniciar.disabled = Boolean(sala && !sala.anfitriao);
        document.getElementById('piano-reiniciar-dueto').hidden = Boolean(sala);
    }

    function mostrar(texto) {
        recado = texto;
        atualizarTela();
    }

    function enviar(tipo, dados = {}) {
        if (!sala?.conectada) return;
        return sala.canal.send({type: 'broadcast', event: 'piano',
            payload: {de: sala.eu, tipo, ...dados}});
    }

    function pararNota(chave) {
        clearTimeout(vozesRemotas.get(chave));
        vozesRemotas.delete(chave);
        window.AudioMotor?.soltarVozPiano(chave);
    }

    function tocarRemoto(chave, nota, timbre) {
        if (!/^[A-G]#?-?\d{1,2}$/.test(nota || '') || !/^[\w#-]{1,48}$/.test(chave || '')) return;
        const dados = window.MotorMusica.infoNota(nota);
        if (!dados || vozesRemotas.size >= 32) return;
        const voz = 'dueto-remoto-' + chave;
        window.AudioMotor?.iniciarVozPiano(voz, dados.freq, .62, timbre);
        clearTimeout(vozesRemotas.get(voz));
        vozesRemotas.set(voz, setTimeout(() => pararNota(voz), 8000));
    }

    function iniciarAgendado(partida, atual) {
        const piano = window.MotorMusica;
        if (!Number.isInteger(partida.musica) || !piano.catalogoMusicas[partida.musica] ||
            ![.5, .75, 1].includes(partida.velocidade) || typeof partida.movimento !== 'string' ||
            !Number.isFinite(partida.inicio) || !Number.isFinite(partida.posicao)) return;
        const atraso = partida.inicio - (atual.ajusteRelogio || 0) - Date.now();
        if (atraso > 8000 || atraso < -2000) return;
        clearTimeout(atual.inicio);
        if (partida.recomecar || piano.musicaIndex !== partida.musica || (piano.movimentoAtual || '') !== partida.movimento) {
            piano.selecionarMusica(partida.musica);
            if (partida.movimento) piano.selecionarParte(partida.movimento);
        }
        piano.mudarFatorVelocidade(partida.velocidade);
        const inicio = performance.now() + atraso;
        atual.partida = partida;
        mostrar('Preparando para tocar…');
        atual.inicio = setTimeout(() => {
            if (sala !== atual) return;
            atual.inicio = null;
            document.getElementById('piano-configuracoes')?.close();
            mostrar('Dueto em dois celulares');
            piano.tempoMusicaSegundos = partida.posicao;
            piano.relogioCompartilhado = {inicio, posicao: partida.posicao};
            if (!piano.tocandoMusica) piano.togglePlay(true);
        }, Math.max(0, atraso));
    }

    function pausaLocal(atual, reiniciar) {
        clearTimeout(atual.inicio);
        atual.inicio = null;
        if (reiniciar) atual.partida = null;
        const piano = window.MotorMusica;
        if (reiniciar) piano.reiniciarMusica();
        else if (piano.tocandoMusica) piano.pausarMusica();
        piano.pararTodasNotas();
        mostrar('Dueto pausado. Quem criou a sala pode continuar.');
    }

    function receber(msg, atual) {
        if (sala !== atual || !msg || !idValido.test(msg.de) || msg.de === atual.eu) return;
        if (msg.tipo === 'cheguei' && atual.anfitriao) {
            if (atual.par && atual.par !== msg.de) {
                enviar('ocupada', {para: msg.de});
                return;
            }
            atual.par = msg.de;
            enviar('aceito', {para: msg.de, hora: Date.now(), eco: msg.hora});
            mostrar('A outra pessoa entrou. Toque em Jogar quando estiverem prontos.');
            return;
        }
        if (!atual.anfitriao && msg.para === atual.eu) {
            if (msg.tipo === 'ocupada' && !atual.par) return sair('Essa sala já tem duas pessoas.');
            if (msg.tipo === 'aceito' && !atual.par) {
                atual.par = msg.de;
                if (Number.isFinite(msg.hora) && Number.isFinite(msg.eco)) {
                    atual.ajusteRelogio = msg.hora - (msg.eco + Date.now()) / 2;
                }
                clearTimeout(atual.espera);
                mostrar('Na sala. Escolha sua parte em Ajustes. O anfitrião inicia a música.');
                return;
            }
        }
        if (atual.par !== msg.de) return;
        if (msg.tipo === 'tocar' && !atual.anfitriao) {
            if (document.getElementById('piano-configuracoes')?.open) pausarPartida(true);
            else iniciarAgendado(msg, atual);
        }
        if (msg.tipo === 'pausa') pausaLocal(atual, msg.reiniciar === true);
        if (msg.tipo === 'fim') sair('A outra pessoa saiu da sala.', false);
        if (msg.tipo === 'notas' && timbres.includes(msg.timbre) && Array.isArray(msg.notas)) {
            for (const entrada of msg.notas.slice(0, 3)) {
                if (Array.isArray(entrada)) tocarRemoto(entrada[0], entrada[1], msg.timbre);
            }
        }
        if (msg.tipo === 'soltar' && Array.isArray(msg.chaves)) {
            for (const chave of msg.chaves.slice(0, 64)) pararNota('dueto-remoto-' + chave);
        }
    }

    async function conectar(codigo, anfitriao) {
        if (sala || !codigoValido.test(codigo)) return;
        const atual = {codigo, anfitriao, eu: crypto.randomUUID()};
        sala = atual;
        mostrar('Conectando à sala…');
        try {
            const config = window.SuiriConfig;
            if (!window.supabase?.createClient) throw new Error('Abra o Arcade com internet para entrar na sala.');
            cliente ||= window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
                auth: {detectSessionInUrl: false}
            });
            const {data: {session}} = await cliente.auth.getSession();
            if (!session) throw new Error('Entre no Suíri Família e abra o convite novamente.');
            const {data, error} = await cliente.from('membros').select('familia_id')
                .eq('id', session.user.id).maybeSingle();
            if (error || !idValido.test(data?.familia_id || '')) throw new Error('Não foi possível confirmar sua família.');
            await cliente.realtime.setAuth(session.access_token);
            if (sala !== atual) return;
            const canal = cliente.channel('piano:' + data.familia_id + ':' + codigo, {config: {private: true}});
            atual.canal = canal;
            canal.on('broadcast', {event: 'piano'}, ({payload}) => receber(payload, atual)).subscribe(status => {
                if (sala !== atual) return;
                if (status === 'SUBSCRIBED') {
                    atual.conectada = true;
                    if (anfitriao) mostrar('Sala aberta. Copie o convite e envie a alguém da família.');
                    else {
                        enviar('cheguei', {hora: Date.now()});
                        clearTimeout(atual.espera);
                        atual.espera = setTimeout(() => sair('Sala não encontrada. Confira o convite e peça ao anfitrião para manter a sala aberta.'), 12000);
                        mostrar('Aguardando o anfitrião…');
                    }
                } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
                    sair('A conexão com a sala caiu. Abra um novo convite para jogar.', false);
                }
            });
        } catch (erro) {
            if (sala === atual) sair(erro instanceof Error ? erro.message : 'Não foi possível abrir a sala.', false);
        }
    }

    function criar() {
        conectar(crypto.randomUUID().replaceAll('-', ''), true);
    }

    function codigoDoConvite(hash) {
        const codigo = new URLSearchParams(hash.slice(1)).get('dueto');
        return codigoValido.test(codigo || '') ? codigo : null;
    }

    function entrar() {
        const campo = document.getElementById('piano-convite-recebido');
        let codigo = null;
        try {
            const convite = new URL(campo.value.trim());
            if (convite.origin === location.origin && convite.pathname === location.pathname) {
                codigo = codigoDoConvite(convite.hash);
            }
        } catch {}
        if (!codigo) {
            mostrar('Cole o link de convite copiado no Dueto do Suíri Família.');
            return;
        }
        campo.value = '';
        conectar(codigo, false);
    }

    async function convidar() {
        if (!sala?.anfitriao) return;
        const convite = new URL(location.href);
        convite.hash = 'dueto=' + sala.codigo;
        try {
            await navigator.clipboard.writeText(convite.href);
            mostrar('Convite copiado. Envie a uma pessoa da família.');
        } catch {
            const campo = document.querySelector('[data-piano-link]');
            campo.value = convite.href;
            campo.hidden = false;
            campo.select();
        }
    }

    function sair(texto = '', avisar = true) {
        if (!sala) return;
        const atual = sala;
        if (avisar) enviar('fim');
        sala = null;
        clearTimeout(atual.espera);
        clearTimeout(atual.inicio);
        for (const chave of vozesRemotas.keys()) pararNota(chave);
        if (atual.canal) cliente.removeChannel(atual.canal);
        const campo = document.querySelector('[data-piano-link]');
        if (campo) { campo.hidden = true; campo.value = ''; }
        if (window.MotorMusica?.tocandoMusica) window.MotorMusica.pausarMusica();
        mostrar(texto);
    }

    function pausarPartida(reiniciar = false) {
        if (!sala) return false;
        if (!reiniciar && !sala.inicio && !window.MotorMusica.tocandoMusica) return true;
        if (sala.par) enviar('pausa', {reiniciar});
        pausaLocal(sala, reiniciar);
        return true;
    }

    function controlarPartida() {
        if (!sala) return false;
        if (!sala.par) {
            mostrar(sala.anfitriao ? 'A outra pessoa precisa entrar pelo convite.' : 'Aguarde o anfitrião.');
            return true;
        }
        if (!sala.anfitriao) return true;
        const piano = window.MotorMusica;
        if (piano.tocandoMusica || sala.inicio) return pausarPartida();
        const musica = piano.musicaIndex;
        const movimento = piano.movimentoAtual || '';
        const velocidade = piano.fatorVelocidade;
        const recomecar = !sala.partida || piano.encerrada || sala.partida.musica !== musica ||
            sala.partida.movimento !== movimento || sala.partida.velocidade !== velocidade;
        const posicao = recomecar ? -piano.tempoParaAcertar() * 3 : piano.tempoMusicaSegundos;
        const partida = {musica, movimento, velocidade, recomecar, posicao, inicio: Date.now() + 1800};
        enviar('tocar', partida);
        iniciarAgendado(partida, sala);
        return true;
    }

    function entrarPeloConvite() {
        const codigo = codigoDoConvite(location.hash);
        if (!codigo) return;
        GerenciadorArcade.abrirJogo('simon');
        window.MotorMusica.trocarModo('dueto');
        conectar(codigo, false);
    }

    window.addEventListener('DOMContentLoaded', entrarPeloConvite);
    window.addEventListener('pagehide', () => sair());
    return {
        criar, entrar, convidar, sair, controlarPartida, pausarPartida,
        enviarNotas(chaves, notas, timbre) {
            if (sala?.par) enviar('notas', {notas: notas.map((nota, i) => [chaves[i], nota]), timbre});
        },
        soltarNotas(chaves) {
            if (sala?.par && chaves.length) enviar('soltar', {chaves});
        }
    };
})();
