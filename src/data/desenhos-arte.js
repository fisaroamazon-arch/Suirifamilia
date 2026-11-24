/* Contornos originais do caderno. As formas de cada motivo também são usadas nos cenários. */
(() => {
    const facil = [
        ['ursinho', 'Ursinho'], ['gato', 'Gato'], ['raposa', 'Raposa'], ['borboleta', 'Borboleta'],
        ['abelha', 'Abelha'], ['peixe', 'Peixe'], ['tartaruga', 'Tartaruga'], ['baleia', 'Baleia'],
        ['arvore', 'Árvore'], ['flor', 'Flor'], ['casa', 'Casa'], ['foguete', 'Foguete'],
        ['planeta', 'Planeta'], ['robo', 'Robô'], ['dino', 'Dinossauro'], ['caracol', 'Caracol'],
        ['sorvete', 'Sorvete'], ['barco', 'Barco'], ['castelo', 'Castelo'], ['arco-iris', 'Arco-íris']
    ];
    const motivos = {
        polvo: ['Polvo', 'M26 49 C17 12 80 10 73 49 C74 58 86 68 94 61 C95 78 82 82 72 73 C74 88 65 94 57 81 C54 99 43 99 43 81 C33 93 23 88 28 73 C16 86 7 76 7 65 C18 71 25 60 26 49Z', 'M37 46h3m20 0h3M44 56q6 8 14 0M14 72l4 2m63-3 5-2m-51 7-3 5m33-4 3 5'],
        coruja: ['Coruja', 'M25 30 21 11 39 23 Q50 17 61 23 L79 11 75 30 Q96 69 69 85 Q50 95 31 85 Q5 69 25 30Z', 'M45 44a12 12 0 1 0-24 0 12 12 0 1 0 24 0m34 0a12 12 0 1 0-24 0 12 12 0 1 0 24 0M50 49l6 8-6 6-6-6Z M29 66q12 10 4 18m38-18q-12 10-4 18M44 76l6 5 6-5'],
        polvo_lua: ['Água-viva', 'M15 52 C15 8 85 8 85 52 Q76 67 69 54 Q61 66 53 55 Q43 65 36 55 Q25 67 15 52Z', 'M24 58q17 10 2 22q-6 8 1 15m12-32q13 12-1 21m14-22q14 15 2 29m12-31q-2 11 8 19m5-22q-3 8 5 12M33 42h6m22 0h6m-23 5q5 7 12 0'],
        aviao: ['Avião', 'M8 55 39 50 63 19 L74 17 66 45 84 42 Q91 41 96 49 Q95 55 86 58 L65 63 67 82 58 84 43 66 17 69Z', 'M17 55 10 41 16 40 30 52m48-7 4 10m-25-2-7 2m-5 0-7 2m-4 0-7 2'],
        baleiro: ['Pote de doces', 'M32 23 L29 12 H71 L68 23 Q87 33 82 57 L76 88 H24 L18 57 Q13 34 32 23Z', 'M30 23h40 M20 49 H80 M30 55l12 8-2 10-12 0-5 6 2-15Zm23 14 6-11 10 3 3 12-7 8-11-4Zm-14 13 12-5 5 8'],
        caminhao: ['Caminhão', 'M6 35 H57 V42 H76 L92 59 V75 H7Z', 'M57 44v30m6-25h11l9 11H63ZM10 47h41M14 57h34M39 76a10 10 0 1 0-20 0 10 10 0 1 0 20 0m44 0a10 10 0 1 0-20 0 10 10 0 1 0 20 0'],
        moinho: ['Moinho', 'M34 50 L61 50 L67 91 H27Z', 'M50 38l-18-20 10-6 12 23 21-14 5 7-23 15 16 19-8 6-13-21-21 16-6-8 21-15Zm-3 53V75h10v16M34 60h10v9H34Z'],
        violao: ['Violão', 'M29 53 Q20 42 34 36 Q41 33 47 40 L66 17 77 19 81 30 54 48 Q61 55 54 64 Q65 77 49 88 Q25 99 13 79 Q3 62 29 53Z', 'M41 62a7 7 0 1 0-14 0 7 7 0 1 0 14 0M65 23l6 7M23 75l9 8M30 77l43-51M24 73l44-50'],
        cogumelo: ['Cogumelo', 'M40 54 Q35 67 30 85 Q49 96 70 85 Q64 67 60 54Z', 'M8 54 C19 9 78 5 92 54 Q83 66 50 65 Q17 66 8 54ZM18 54q31-11 65 0M33 32a7 5 0 1 0-14 0 7 5 0 1 0 14 0m37 2a10 8 0 1 0-20 0 10 8 0 1 0 20 0M40 76l-3 9m20-9 4 10'],
        pato: ['Patinho', 'M17 57 Q37 72 45 51 C38 45 40 20 61 18 Q78 16 81 36 L92 38 85 47 75 45 Q75 62 83 68 Q73 88 46 86 Q18 83 10 65Z', 'M68 33h3M32 68q18 11 30-3m-14 2 3 4m2-7 3 4M85 41h5'],
        mochila: ['Mochila', 'M23 37 Q22 26 34 24 H66 Q78 26 77 37 L87 80 Q89 91 76 92 H23 Q11 91 13 80Z', 'M38 23V15q11-10 24 0v8m-30 5 5 18h26l5-18M28 61h44v21H28Zm4 6h36M50 46v7m-29 4-5 18m63-18 5 18'],
        lampiao: ['Lampião', 'M31 22 43 13 V7 H57 V13 L69 22 78 36 68 41 74 78 81 90 H19 L26 78 32 41 22 36Z', 'M31 36h38m-41 41h44M42 44l-9 28h34l-9-28m-9 5q-11 13 0 19 12-3 1-16m-11-30h22'],
        jacare: ['Jacaré', 'M9 64 27 53 Q32 32 56 36 Q60 24 67 30 L75 43 94 48 95 61 71 64 Q62 79 48 79 L37 87 28 87 31 76 17 78 7 75Z', 'M94 55H69l-11 5m22-4-4 7m13-7-4 7M65 40h3M27 54l8 9m2-17 7 10m2-13 7 10m0 12 9 4'],
        patins: ['Patins', 'M25 18 H54 L58 48 Q64 54 83 57 L89 69 V77 H14 V57 Q25 44 25 18Z', 'M15 69h72M29 24h19m-23 14 22 2m-24 9 25 3m-9 26a9 9 0 1 0-18 0 9 9 0 1 0 18 0m41 0a9 9 0 1 0-18 0 9 9 0 1 0 18 0'],
        camaleao: ['Camaleão', 'M18 64 Q23 42 49 37 Q52 17 68 22 L88 41 Q88 57 69 61 L62 72 74 79 70 84 52 73 51 64 43 65 33 77 25 77 29 66 Q17 74 9 66 Q1 54 20 46', 'M68 37a6 6 0 1 0-12 0 6 6 0 1 0 12 0m7 9h11m-59 6 6 6 8-11 9 9m-37-2q-9 11 3 12'],
        celular: ['Câmera fotográfica', 'M12 32h18l7-11h26l8 11h17q7 0 7 8v36q0 8-8 8H13q-8 0-8-8V40q0-8 7-8Z', 'M74 57a24 21 0 1 0-48 0 24 21 0 1 0 48 0m-9 0a15 13 0 1 0-30 0 15 13 0 1 0 30 0M16 40h8v7h-8Zm60 0h9v6h-9Z'],
        paviao: ['Pavão', 'M42 63 Q-1 62 9 32 Q16 16 29 28 Q32 4 49 20 Q65 3 73 27 Q90 15 94 36 Q94 60 60 65 Q76 78 55 87 Q38 90 33 77 Q32 68 42 63Z', 'M45 59q-21-6-22-23 14 0 25 19m4-1q-11-17-3-28 10 9 6 26m5 4q7-19 19-22 2 17-19 25M46 70q4-11 12-7m-1 4 6 3-7 2m-9 15-3 6m10-7 3 7'],
        chave: ['Chave antiga', 'M30 30 C42 8 64 12 71 32 C76 49 64 56 57 56 V66 H70 V76 H57 V88 H44 V55 Q17 53 30 30Z', 'M59 36a9 9 0 1 0-18 0 9 9 0 1 0 18 0m-11 6v10m0 13v18M35 31l-3 11m31-11 3 11'],
        cereja: ['Cerejas', 'M51 26 Q60 10 80 16 Q67 30 51 26M51 26 Q34 33 31 58M51 26 Q65 42 69 59M31 57 C4 49 9 87 30 90 C54 88 57 50 31 57ZM69 59 C48 55 44 89 68 94 C94 93 95 54 69 59Z', 'M17 71q3-9 13-8m27 11q3-9 13-9'],
        satelite: ['Satélite', 'M33 40 61 31 71 60 43 70Z M61 41 90 32 96 51 68 59Z M39 58 11 67 5 49 34 40Z', 'M25 44l6 18m-16-14 6 17m54-28 6 18m5-21 6 18M41 48l14-5 5 12-14 5Zm8-11-4-12m0 0q-14 3-16-7l28-8q3 11-12 15m8 40 5 13m12-11q3 11-6 18']
    };
    const cenas = [
        ['recife', 'Jardim no recife', 'mar', 'polvo', 'polvo_lua'],
        ['mata', 'Passeio na mata', 'colinas', 'camaleao', 'paviao'],
        ['pista', 'Aeroporto', 'cidade', 'aviao', 'caminhao'],
        ['padaria', 'Vitrine de doces', 'feira', 'baleiro', 'cereja'],
        ['sitio', 'Sítio do moinho', 'colinas', 'moinho', 'pato'],
        ['serenata', 'Serenata na praça', 'cidade', 'violao', 'lampiao'],
        ['cogumelos', 'Casa dos cogumelos', 'colinas', 'cogumelo', 'mochila'],
        ['lagoa', 'Lagoa encantada', 'mar', 'pato', 'jacare'],
        ['estacao', 'Estação espacial', 'espaco', 'satelite', 'aviao'],
        ['bosque', 'Bosque das corujas', 'noite', 'coruja', 'cogumelo'],
        ['parque', 'Parque de patins', 'feira', 'patins', 'mochila'],
        ['tesouro', 'Tesouro escondido', 'mar', 'chave', 'polvo'],
        ['festival', 'Festival das lanternas', 'noite', 'lampiao', 'paviao'],
        ['trilha', 'Trilha fotográfica', 'colinas', 'celular', 'mochila'],
        ['pantanal', 'Encontro no Pantanal', 'mar', 'jacare', 'camaleao'],
        ['mercado', 'Feira de sabores', 'feira', 'cereja', 'caminhao'],
        ['portal', 'Portal da Lua', 'espaco', 'chave', 'satelite'],
        ['aviadores', 'Aviadores da madrugada', 'noite', 'aviao', 'coruja'],
        ['acuario', 'Aquário da cidade', 'cidade', 'polvo_lua', 'celular'],
        ['janela', 'Canção do quintal', 'feira', 'violao', 'baleiro']
    ];
    const fundos = {
        mar: [
            'M5 22Q13 17 21 22T37 22T53 22T69 22T85 22T95 22M5 26Q13 21 21 26T37 26T53 26T69 26T85 26T95 26M3 81Q19 72 39 86T70 82T97 78',
            'M8 79q-6-13 0-23 7 7 5 20m2 0q-4-11 8-20-1 10-6 18m72 6q4-18 9-22-2 14-7 21M18 88q4-8 10 0Z M70 90q7-10 14 0Z'
        ],
        colinas: [
            'M2 55Q19 15 46 47Q68 16 98 50M2 62Q25 52 42 64Q63 81 98 56M2 82Q23 69 34 91Q53 70 98 88',
            'M16 31Q16 19 27 20Q30 13 39 19Q49 19 47 27Q33 32 16 31Zm60 3a10 10 0 1 0 0-20m0 20a10 10 0 1 0 0-20M13 89l3-4m-3 4-4-4m82 6-2-5m2 5 4-5'
        ],
        cidade: [
            'M4 54V28H14V38H21V18H36V35H45V26H56V37H64V16H79V28H91V53M2 69H98M2 84Q28 78 52 84T98 84',
            'M24 24h8m-8 6h8m34-7h9m-9 7h9M10 35v5m74-5h3m-3 6h3m-38-7h4M7 90h9m7 0h9m40 0h9m7 0h5'
        ],
        feira: [
            'M6 67V38L12 24H86L94 38V65M6 38Q11 47 17 38Q24 47 30 38Q36 47 42 38Q50 47 57 38Q64 47 71 38Q77 47 83 38Q89 47 94 38M8 82h84M12 92h76',
            'M16 37l7-13m8 14 5-14m8 14 1-14m12 14-1-14m15 14-5-14m17 14-6-14M14 19h72M14 88h12m15 0h10m13 0h20'
        ],
        noite: [
            'M4 53Q22 29 38 54Q65 36 96 59M3 79Q30 69 45 83T98 79M72 14Q58 27 76 36Q59 43 54 29Q47 14 72 14Z',
            'M14 17v9m-5-4h10m15 10v8m-4-4h8m45-15v9m-4-4h8m7 12v10m-4-5h8M9 90q5-5 9 0m65 0q5-6 10 0'
        ],
        espaco: [
            'M20 29a12 12 0 1 0 0-24 12 12 0 1 0 0 24ZM4 25Q23 9 39 15Q43 20 24 27Q10 34 4 25ZM4 84Q29 70 48 80Q72 94 97 76',
            'M51 14v10m-5-5h10m20-8v10m-5-5h10m10 17v10m-5-5h10M12 87a8 3 0 1 0 16 0 8 3 0 1 0-16 0m46 3a5 3 0 1 0 10 0 5 3 0 1 0-10 0'
        ]
    };

    function renderizar(nivel, id, lado) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = lado;
        const ctx = canvas.getContext('2d');
        ctx.scale(lado / 100, lado / 100);
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 100, 100);
        ctx.strokeStyle = '#262236';

        function desenharMotivo(chave, x, y, escala) {
            const [, forma, detalhes] = motivos[chave];
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(escala, escala);
            ctx.lineWidth = 2.45;
            const contorno = new Path2D(forma);
            ctx.fill(contorno);
            ctx.stroke(contorno);
            ctx.lineWidth = 1.9;
            ctx.stroke(new Path2D(detalhes));
            ctx.restore();
        }

        if (nivel === 'medio') {
            desenharMotivo(id, 4, 4, .92);
        } else {
            const indice = cenas.findIndex(cena => cena[0] === id);
            const [, , fundo, principal, outro] = cenas[indice];
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.rect(2, 3, 96, 94);
            ctx.clip();
            fundos[fundo].forEach(caminho => ctx.stroke(new Path2D(caminho)));
            const invertido = indice % 2 === 1;
            desenharMotivo(outro, invertido ? 9 : 62, 33, .31);
            desenharMotivo(principal, invertido ? 38 : 7, 40, .54);
        }
        return canvas;
    }
    window.SuiriDesenhosArte = {
        niveis: {
            facil,
            medio: Object.entries(motivos).map(([id, info]) => [id, info[0]]),
            avancado: cenas.map(([id, nome]) => [id, nome])
        },
        renderizar
    };
})();
