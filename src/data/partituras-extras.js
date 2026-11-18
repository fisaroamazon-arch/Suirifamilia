/* Temas didáticos de uma oitava. Letras a–m correspondem às 13 teclas de C4 a C5. */
(() => {
    const notas = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5'];
    const acordes = {
        C: ['C3','E3','G3'], Dm: ['D3','F3','A3'], D: ['D3','F#3','A3'],
        Em: ['E3','G3','B3'], F: ['F3','A3','C4'], G: ['G3','B3','D3'],
        Am: ['A3','C4','E3'], E: ['E3','G#3','B3'], Bb: ['A#3','D3','F3'],
        Cm: ['C3','D#3','G3'], Gm: ['G3','A#3','D3']
    };
    const classicas = [
        ['Ode à Alegria · Beethoven', 92, 'C G C G', 'e e f h h f e c a a c e e:1.5 c:.5 c:2 | e e f h h f e c a a c e c:1.5 a:.5 a:2'],
        ['Para Elisa · Beethoven', 88, 'Am E Am E', 'j i j i j e h f c:2 | a c f h:2 | c e h j:2 | e j i j i j e h f:2'],
        ['Sinfonia nº 5 · Beethoven', 108, 'Cm Gm Cm Gm', 'h:.5 h:.5 h:.5 d:2 | f:.5 f:.5 f:.5 c:2 | h:.5 h:.5 h:.5 d:2 | m:.5 m:.5 m:.5 h:2'],
        ['Marcha Turca · Mozart', 104, 'Am E Am E', 'e:.5 d:.5 e:.5 f:.5 h j | j:.5 i:.5 j:.5 l:.5 m:2 | m l j h f e d e:2'],
        ['Ah, vous dirai-je, maman · Mozart', 100, 'C F G C', 'a a h h j j h:2 f f e e c c a:2 | h h f f e e c:2 h h f f e e c:2'],
        ['Pequena Serenata Noturna · Mozart', 108, 'C G C G', 'a:1.5 h:.5 a:1.5 h:.5 a h m e:2 | f:1.5 c:.5 f:1.5 c:.5 f c l h:2'],
        ['Minueto em Sol · Petzold', 90, 'G D G C', 'h c:.5 e:.5 f:.5 h:.5 m a a | j c:.5 e:.5 f:.5 h:.5 l a a | h f:.5 e:.5 c:.5 a:.5 h:2'],
        ['Prelúdio em Dó · Bach', 88, 'C Dm G C', 'a:.5 e:.5 h:.5 m:.5 e:.5 h:.5 m:.5 h:.5 | c:.5 f:.5 j:.5 m:.5 f:.5 j:.5 m:.5 j:.5 | a:.5 e:.5 h:.5 m:.5 h:.5 e:.5 c:.5 a:2'],
        ['Jesus, Alegria dos Homens · Bach', 86, 'C F G C', 'a c e h f f j h h m l m | h e a c e f e c a:2'],
        ['Ária da Suíte nº 3 · Bach', 64, 'C G Am F', 'e:3 e:.5 f:.5 h:2 f:.5 e:.5 | c:2 e f h:2 e:2 | a c e h f e c a:2'],
        ['A Primavera · Vivaldi', 114, 'C G C G', 'e e e c a:2 h h h f e:2 | e f h e f h j h f e c a:2'],
        ['O Inverno · Vivaldi', 100, 'Cm Gm Cm Gm', 'a:.5 a:.5 a:.5 a:.5 d:.5 d:.5 d:.5 d:.5 | f:.5 f:.5 f:.5 f:.5 h:.5 h:.5 h:.5 h:.5 | m h g f d c a:2'],
        ['Canção de Ninar · Brahms', 76, 'C G F C', 'e:.75 e:.25 h:2 e e h:2 | e h m l j:2 j h f h j h:2'],
        ['Dança Húngara nº 5 · Brahms', 108, 'Am E Am E', 'j:1.5 l:.5 m j e f h e | j:.5 h:.5 f:.5 e:.5 f h j:2 | m l j i j e j:2'],
        ['Lago dos Cisnes · Tchaikovsky', 84, 'Am Dm E Am', 'e:2 j l m c:2 m l j l:2 | h:2 f e c e j:3'],
        ['Dança da Fada Açucarada · Tchaikovsky', 90, 'Am E Dm Am', 'e:.5 j:.5 l:.5 m:.5 j:.5 e:.5 f:.5 e:.5 | d:.5 h:.5 j:.5 h:.5 f:.5 e:.5 c:.5 e:2 | j:.5 h:.5 e:.5 c:.5 a:2'],
        ['Amanhecer · Grieg', 80, 'C F C G', 'h e c a c e h e c a | e h j h e c e h:2'],
        ['Na Gruta do Rei da Montanha · Grieg', 100, 'Am E Am E', 'a:.5 c:.5 d:.5 f:.5 h:.5 d:.5 h:1 | g:.5 c:.5 g:1 f:.5 b:.5 f:1 | a:.5 c:.5 d:.5 f:.5 h:.5 d:.5 h:.5 m:.5 j h d h:2'],
        ['Tema do Novo Mundo · Dvořák', 69, 'C F G C', 'e:1.5 h:.5 h:2 e c a:2 | c:1.5 e:.5 h e c:3 | e:1.5 h:.5 h:2 e c a:2'],
        ['Gymnopédie nº 1 · Satie', 66, 'F C F C', 'g j h g b:2 a b d a:2 | g j h g b:2 a b d a:2']
    ];
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
    const converter = ([titulo,bpm,base,tema], estilo) => {
        const melodia = tema.replace(/\|/g,' ').trim().split(/\s+/).map(token => {
            const [letra, duracao] = token.split(':');
            return {n:notas[letra.charCodeAt(0)-97], d:Number(duracao || 1)};
        });
        const compasso = 4;
        const ciclo = base.split(' ');
        let restante = melodia.reduce((soma, nota) => soma + nota.d, 0);
        const harmonia = [];
        for (let i=0; restante>0; i++) {
            const nome = ciclo[Math.floor(i/compasso) % ciclo.length];
            const d = Math.min(1, restante);
            harmonia.push({nome, notas:[acordes[nome][i % 3]], d});
            restante -= d;
        }
        return {titulo,bpm,estilo,compasso,melodia,harmonia};
    };
    window.CATALOGO_MUSICAS = [
        ...window.CATALOGO_MUSICAS.map(m => ({...m, titulo:m.titulo.replace(/^\d+\.\s*/,''), estilo:'infantil'})),
        ...classicas.map(m => converter(m, 'classicas')),
        ...pop.map(m => converter(m, 'pop'))
    ];
})();
