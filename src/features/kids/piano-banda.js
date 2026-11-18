window.BandaPiano = (() => {
    const alturas = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const ativos = new Set();
    let ruido;

    function numero(nota) {
        return (Number(nota.at(-1)) + 1) * 12 + alturas.indexOf(nota.slice(0,-1));
    }

    function montar(musica) {
        const eventos = [];
        const fim = musica.melodia.reduce((soma, nota) => soma + nota.d, 0);
        const compasso = musica.compasso || 4;
        const pop = musica.estilo === 'pop';
        const classica = musica.estilo === 'classicas';
        const adicionar = (tempo, nota, canal, duracao, volume) => {
            if (tempo < fim) eventos.push({tempo, nota, canal, duracao:Math.min(duracao,fim-tempo), volume});
        };
        let tempo = 0;
        for (const item of musica.harmonia || []) {
            for (const nota of item.notas) {
                const midi = numero(nota);
                adicionar(tempo, midi, 1, item.d * .74, 53);
                if (Math.floor(tempo) % 2 === 0) adicionar(tempo, midi - 12, 0, item.d * .8, 73);
            }
            tempo += item.d;
        }
        if (!classica) {
            for (let i = 0; i < fim; i++) {
                adicionar(i, i % compasso === 0 ? 36 : (pop ? 38 : 42), 9, .14, pop ? 70 : 45);
                if (pop) adicionar(i + .5, 42, 9, .10, 43);
            }
        }
        return eventos.sort((a,b) => a.tempo - b.tempo);
    }

    function tocar(evento, bpm) {
        const motor = window.AudioMotor;
        const ctx = motor?.obterCtx();
        if (!ctx) return;
        const inicio = ctx.currentTime;
        const duracao = Math.max(.045, evento.duracao * 60 / bpm);
        const ganho = ctx.createGain();
        const volume = evento.volume / 127 * (evento.canal === 0 ? .19 : .12);
        let fonte;
        if (evento.canal === 9 && evento.nota !== 36) {
            if (!ruido || ruido.sampleRate !== ctx.sampleRate) {
                ruido = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .18), ctx.sampleRate);
                const amostras = ruido.getChannelData(0);
                for (let i=0;i<amostras.length;i++) amostras[i] = Math.random()*2-1;
            }
            fonte = ctx.createBufferSource();
            fonte.buffer = ruido;
        } else {
            fonte = ctx.createOscillator();
            fonte.type = evento.canal === 1 ? 'triangle' : 'sine';
            const freq = 440 * 2 ** ((evento.nota - 69) / 12);
            fonte.frequency.setValueAtTime(evento.canal === 9 ? 126 : freq, inicio);
            if (evento.canal === 9) fonte.frequency.exponentialRampToValueAtTime(48, inicio + .042);
        }
        ganho.gain.setValueAtTime(.0001, inicio);
        ganho.gain.linearRampToValueAtTime(volume, inicio + .009);
        ganho.gain.exponentialRampToValueAtTime(.0001, inicio + duracao);
        fonte.connect(ganho);
        ganho.connect(motor.obterSaida());
        const voz = {fonte, ganho};
        ativos.add(voz);
        fonte.onended = () => {
            ativos.delete(voz);
            fonte.disconnect();
            ganho.disconnect();
        };
        fonte.start(inicio);
        fonte.stop(inicio + duracao);
    }

    function parar() {
        for (const {fonte, ganho} of ativos) {
            ganho.disconnect();
            fonte.stop();
        }
        ativos.clear();
    }

    function baixar(musica, eventos, bpm) {
        const bytes = [];
        const inteiro = (n, tamanho) => Array.from({length:tamanho}, (_,i) => (n >>> ((tamanho-i-1)*8)) & 255);
        const variavel = n => {
            const partes = [n & 127];
            while ((n >>>= 7)) partes.unshift((n & 127) | 128);
            return partes;
        };
        const trilha = eventos.flatMap(({tempo, nota, canal, duracao, volume}) => [
            {tick:Math.round(tempo*480), dados:[0x90|canal,nota,volume]},
            {tick:Math.round((tempo+duracao)*480), dados:[0x80|canal,nota,0]}
        ]).sort((a,b) => a.tick-b.tick || a.dados[0]-b.dados[0]);
        bytes.push(0,0xff,0x51,3,...inteiro(Math.round(60000000/bpm),3),0,0xc0,33,0,0xc1,48);
        let ultimo = 0;
        for (const {tick,dados} of trilha) {
            bytes.push(...variavel(tick-ultimo),...dados);
            ultimo=tick;
        }
        bytes.push(0,0xff,0x2f,0);
        const cabecalho = [77,84,104,100,0,0,0,6,0,0,0,1,1,224,77,84,114,107,...inteiro(bytes.length,4)];
        const url = URL.createObjectURL(new Blob([Uint8Array.from([...cabecalho,...bytes])],{type:'audio/midi'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = musica.titulo.replace(/[^\p{L}\p{N} -]/gu,'').trim() + '.mid';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url),10000);
    }

    return {montar, tocar, parar, baixar};
})();
