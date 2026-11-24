/* Temas didáticos de uma oitava. Letras a–m correspondem às 13 teclas de C4 a C5. */
(() => {
    const notas = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5'];
    const acordes = {
        C: ['C3','E3','G3'], Dm: ['D3','F3','A3'], D: ['D3','F#3','A3'],
        Em: ['E3','G3','B3'], F: ['F3','A3','C4'], G: ['G3','B3','D3'],
        Am: ['A3','C4','E3'], E: ['E3','G#3','B3'], Bb: ['A#3','D3','F3'],
        Cm: ['C3','D#3','G3'], Gm: ['G3','A#3','D3']
    };
    const pop = [
        ['Palco de Neon · K-pop',114,'Am F C G','j j m l j h e h | f f j h e c e h | m l j h e h j m'],
        ['Modo Estrela · K-pop',112,'C G Am F','h h e h j m j h | g h j g e c e h | m m l j h f e h'],
        ['Onda Rosa · K-pop',104,'F C G Am','f j h f e h j h | h m l h e h l m | j h f e c e f j'],
        ['Luzes da Cidade · Synth-pop',98,'Am F C G','e h j e h j m j | f e c f j h f e | e h m h j m l h'],
        ['De Volta ao Palco · K-pop',108,'Am G F E','j m j h e h j:2 | h l h f c f h:2 | f j f e h j m:2'],
        ['Dança no Terraço · Dance-pop',112,'C Am F G','a e h e g h j:2 | j h e h a c e:2 | f j h f h l m:2'],
        ['Passos de Luz · Pop',96,'C F Am G','a c e h f e c:2 | e h j m l j h:2 | e f h e c e h:2'],
        ['Papel Colorido · Indie pop',90,'F C Am G','f j f e c e h:2 | h j m j h e f:2 | f e c e h e a:2'],
        ['Brisa Quente · Pop',92,'C G F G','e g h e c e f:2 | h e c e h j h:2 | a e f j h f a:2'],
        ['Clube da Lua · Dance-pop',105,'Am F C G','j e h j m j h:2 | f j m j h f e:2 | h l m j h e j:2'],
        ['O Refrão do Sol · Pop',100,'C F G C','m h e h j h e:2 | c f h j m j h:2 | m h e f c e a:2'],
        ['Pista de Estrelas · Synth-pop',110,'Am G F E','e e h j h e c:2 | j j m l j h f:2 | i i l j h e j:2'],
        ['Fica Mais um Pouco · Pop acústico',80,'C Am F G','e h e c a c e:2 | e j h e f h e:2 | e f h j h f e:2'],
        ['Roda Gigante · Indie pop',88,'F C G Am','f e c e f j h:2 | e h m h e h c:2 | j l m e g h j:2'],
        ['Sábado de Manhã · Pop',94,'C G Am F','a e h e c e f:2 | h l h f c e h:2 | j h e f h j e:2'],
        ['Vento de Verão · Pop',98,'G Dm F C','h f c f h j h:2 | c f j h f c e:2 | f h j m h e a:2'],
        ['Amanhã Tem Show · K-pop',116,'Am F C G','e h j m j h j:2 | f j m j h f j:2 | m l h e h l m:2'],
        ['Balões no Céu · Pop acústico',85,'C Am F G','a c e h e h m:2 | j h e j h f e:2 | f j h e c e a:2'],
        ['Rua das Lanternas · Synth-pop',103,'Cm Bb F G','a d h d f h m:2 | k f d f k h f:2 | f j h d c f h:2'],
        ['Última Batida · Dance-pop',113,'C G Am F','h h m e h e m:2 | l h f c h f l:2 | j e f h j m m:2']
    ];
    const lerFrase = frase => frase.trim().split(/\s+/).map(token => {
            const [letra, duracao] = token.split(':');
            return {n:notas[letra.charCodeAt(0)-97], d:Number(duracao || 1)};
    });

    function arranjar(frases, ciclo, bpm, estilo) {
        const compasso = 4;
        const melodia = [];
        const harmonia = [];
        let batidas = 0;

        function adicionar(frase, progressao) {
            const duracao = frase.reduce((soma, nota) => soma + nota.d, 0);
            const total = Math.ceil(duracao / compasso) * compasso;
            melodia.push(...frase.slice(0, -1), {...frase.at(-1), d: frase.at(-1).d + total - duracao});
            for (let i = 0; i < total; i++) {
                const nome = progressao[Math.floor(i / compasso) % progressao.length];
                harmonia.push({nome, notas:[acordes[nome][i % 3]], d:1});
            }
            batidas += total;
        }

        const motivo = frases.flat();
        const notasPonte = [...new Set(motivo.map(nota => nota.n))];
        const ponte = Array.from({length: 4}, (_, compassoPonte) => {
            const ordem = [0, 1, 2, 1];
            return ordem.map((passo, i) => ({
                n: notasPonte[(compassoPonte + passo) % notasPonte.length],
                d: estilo === 'pop' ? [0.5, 1.5, 1, 1][i] : 1
            }));
        }).flat();
        const virada = [...ciclo.slice(1), ciclo[0]];
        const alvo = bpm * 2.25;
        let secao = 0;
        while (batidas < alvo) {
            switch (secao % 5) {
                case 0: frases.forEach(frase => adicionar(frase, ciclo)); break;
                case 1:
                    frases.forEach((frase, indice) => {
                        const resposta = frase.map((nota, posicao) => ({
                            ...nota, d: nota.d === 1 ? ((posicao + indice) % 2 ? 1.25 : .75) : nota.d
                        }));
                        adicionar(resposta, ciclo);
                    });
                    break;
                case 2: adicionar(ponte, virada); break;
                case 3: adicionar(motivo, ciclo); break;
                case 4: adicionar(ponte.slice(8).concat(frases[0]), virada); break;
            }
            secao++;
        }
        const tonica = acordes[ciclo[0]][0].replace('3', '4');
        adicionar([{n: motivo.at(-1).n, d: 2}, {n: tonica, d: 6}], [ciclo.at(-1), ciclo[0]]);
        return {compasso, melodia, harmonia};
    }

    const converter = ([titulo,bpm,base,tema], estilo) => {
        const {compasso, melodia, harmonia} = arranjar(tema.split('|').map(lerFrase), base.split(' '), bpm, estilo);
        return {titulo,bpm,estilo,compasso,melodia,harmonia};
    };
    window.CATALOGO_MUSICAS = [
        ...window.CATALOGO_MUSICAS.map(m => ({...m, titulo:m.titulo.replace(/^\d+\.\s*/,''), estilo:'infantil'})),
        ...window.PARTITURAS_CLASSICAS,
        ...pop.map(m => converter(m, 'pop'))
    ];
})();
