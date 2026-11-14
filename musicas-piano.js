// =========================================================================
// SUIRI GESTÃO FAMILIAR - CATÁLOGO DE MÚSICAS DEDILHADAS (PARTE 1: 1 a 7)
// Harmonia sequencial nota por nota (arpejo contínuo sem acordes travados)
// =========================================================================

window.CATALOGO_MUSICAS = [
    // ---------------------------------------------------------------------
    // 1. PARABÉNS PRA VOCÊ (COMPLETA: ESTROFE + É PIQUE / RÁ-TIM-BUM)
    // ---------------------------------------------------------------------
    {
        titulo: "1. Parabéns pra Você (Completa)",
        bpm: 100,
        compasso: 3,
        melodia: [
            // "Parabéns pra você..."
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "F4", d: 1 },
            { n: "E4", d: 3 },
            // "Nesta data querida..."
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "G4", d: 1 },
            { n: "F4", d: 3 },
            // "Muitas felicidades..."
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "C5", d: 1 },
            { n: "A4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 3 },
            // "Muitos anos de vida!"
            { n: "A#4", d: 1 }, { n: "A#4", d: 1 }, { n: "A4", d: 1 },
            { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 3 },
            // "É pique, é pique, é pique..."
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            // "É hora, é hora, é hora..."
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            // "Rá-tim-bum! Chuíri!"
            { n: "C5", d: 2 }, { n: "A4", d: 1 },
            { n: "F4", d: 2 }, { n: "G4", d: 1 },
            { n: "F4", d: 3 }, { n: "F4", d: 3 }
        ],
        harmonia: [
            // Compasso 1 a 3 (DÓ Maior arpejado - 9 tempos)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // Compasso 4 a 6 (SOL Maior arpejado - 9 tempos)
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            // Compasso 7 a 9 (DÓ Maior arpejado - 9 tempos)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // Compasso 10 a 12 (FÁ, SOL e DÓ - 9 tempos)
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // É pique (FÁ e DÓ - 12 tempos)
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // É hora (SOL e DÓ - 12 tempos)
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // Rá-tim-bum (FÁ, SOL e DÓ - 12 tempos)
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }
        ]
    },

    // ---------------------------------------------------------------------
    // 2. CIRANDA, CIRANDINHA (COMPLETA: 3 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "2. Ciranda, Cirandinha (Completa)",
        bpm: 104,
        compasso: 2,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            // Volta e meia
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            // Estrofe 2 (O anel)
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            // Estrofe 3 (Dona Rosa)
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Padrão dedilhado: Baixo (2 tempos) + Resposta (1 + 1 tempo)
            // 1
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // 2
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // 3
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // 4
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // 5
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // 6
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }
        ]
    },

    // ---------------------------------------------------------------------
    // 3. BRILHA, BRILHA, ESTRELINHA (COMPLETA: FORMA A-B-A)
    // ---------------------------------------------------------------------
    {
        titulo: "3. Brilha, Brilha, Estrelinha (Completa)",
        bpm: 96,
        compasso: 4,
        melodia: [
            // Parte A
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "A4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            // Parte B
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
            // Parte A
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "A4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Parte A (16 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // Parte B (16 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            // Parte A (16 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }
        ]
    },

    // ---------------------------------------------------------------------
    // 4. CAI, CAI, BALÃO (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "4. Cai, Cai, Balão (Completa)",
        bpm: 108,
        compasso: 2,
        melodia: [
            // Estrofe 1
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 1 }, { n: "C4", d: 1 },
            // Estrofe 2
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Estrofe 1 (32 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            // Estrofe 2 (32 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 }
        ]
    },

    // ---------------------------------------------------------------------
    // 5. MARCHA SOLDADO (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "5. Marcha Soldado (Completa)",
        bpm: 114,
        compasso: 2,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 },
            // Estrofe 2
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            // Estrofe 1 (32 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            // Estrofe 2 (32 tempos arpejados)
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 }
        ]
    },

    // ---------------------------------------------------------------------
    // 6. O CRAVO BRIGOU COM A ROSA (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "6. O Cravo Brigou com a Rosa (Completa)",
        bpm: 102,
        compasso: 3,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 1 },
            { n: "A4", d: 2 }, { n: "F4", d: 1 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "C4", d: 2 },
            // Estrofe 2
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 1 },
            { n: "A4", d: 2 }, { n: "F4", d: 1 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Estrofe 1 (24 tempos de valsa arpejada)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 },
            // Estrofe 2 (24 tempos)
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "FÁ", notas: ["F3"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ", notas: ["C3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "DÓ", notas: ["C3"], d: 1 }
        ]
    },

    // ---------------------------------------------------------------------
    // 7. PEIXE VIVO (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "7. Peixe Vivo (Completa)",
        bpm: 104,
        compasso: 2,
        melodia: [
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // 48 tempos arpejados
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 2 },
            { nome: "FÁ", notas: ["F3"], d: 2 }, { nome: "LÁ", notas: ["A3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 2 },
            { nome: "FÁ", notas: ["F3"], d: 2 }, { nome: "LÁ", notas: ["A3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 2 },
            { nome: "SOL", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 2 },
            { nome: "DÓ", notas: ["C3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 }
        ]
    }
];

// =========================================================================
// SUIRI GESTÃO FAMILIAR - CATÁLOGO DE MÚSICAS COM TÔNICA E BALANÇO (PARTE 2: 8 a 14)
// Tônica sustentada na base com dedilhado rítmico nas notas complementares
// =========================================================================

window.CATALOGO_MUSICAS = window.CATALOGO_MUSICAS || [];

window.CATALOGO_MUSICAS.push(
    // ---------------------------------------------------------------------
    // 8. DONA ARANHA (COMPLETA: SUBIDA E DESCIDA)
    // ---------------------------------------------------------------------
    {
        titulo: "8. Dona Aranha (Completa)",
        bpm: 94,
        compasso: 2,
        melodia: [
            // A dona aranha subiu pela parede...
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            // Veio a chuva forte e a derrubou...
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 1 }, { n: "A4", d: 1 },
            { n: "A4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 2 },
            // Já passou a chuva, o sol já vem surgindo...
            { n: "E4", d: 1 }, { n: "G4", d: 1 }, { n: "C5", d: 1 }, { n: "C5", d: 1 },
            { n: "B4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            // E a dona aranha continua a subir!
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            // Ela é teimosa e desobediente...
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 2 },
            // Sobe, sobe, sobe e nunca está contente!
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            // Dona aranha desceu pela parede...
            { n: "C5", d: 1 }, { n: "B4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
            // Desce, desce, desce e nunca está contente!
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Subida (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Descida (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },

    // ---------------------------------------------------------------------
    // 9. ATIREI O PAU NO GATO (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "9. Atirei o Pau no Gato (Completa)",
        bpm: 110,
        compasso: 4,
        melodia: [
            // Estrofe 1
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "C4", d: 4 },
            // Estrofe 2 (Não atire o pau no gato)
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 2 }, { n: "D4", d: 2 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            // Estrofe 1 (44 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Estrofe 2 (44 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },

    // ---------------------------------------------------------------------
    // 10. BATATINHA QUANDO NASCE (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "10. Batatinha Quando Nasce (Completa)",
        bpm: 96,
        compasso: 2,
        melodia: [
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            // Estrofe 1
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Estrofe 2
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "DÓ", notas: ["C3"], d: 2 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },
    
    // ---------------------------------------------------------------------
    // 11. ALECRIM DOURADO (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "11. Alecrim Dourado (Completa)",
        bpm: 100,
        compasso: 3,
        melodia: [
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 2 }, { n: "E4", d: 1 },
            { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 3 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 3 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 2 }, { n: "E4", d: 1 },
            { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 3 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 2 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 3 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 2 },
            { n: "F4", d: 3 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 2 }, { n: "G4", d: 1 },
            { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 },
            { n: "G4", d: 2 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 2 },
            { n: "F4", d: 3 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "F4", d: 2 }, { n: "G4", d: 1 },
            { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Parte 1 (Alecrim dourado)
            { nome: "FÁ (Base)", notas: ["F3"], d: 3 },
            { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Parte 1 (Repetição)
            { nome: "FÁ (Base)", notas: ["F3"], d: 3 },
            { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Parte 2 (Meu amor)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 3 },
            { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Parte 2 (Repetição)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 3 },
            { nome: "LÁ", notas: ["A3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Final)", notas: ["C3"], d: 3 }
        ]
    },

    // ---------------------------------------------------------------------
    // 12. SE ESSA RUA FOSSE MINHA (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "12. Se Essa Rua Fosse Minha (Completa)",
        bpm: 88,
        compasso: 3,
        melodia: [
            // Estrofe 1
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "C5", d: 1 }, { n: "C5", d: 1 }, { n: "C5", d: 1 },
            { n: "B4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "E4", d: 3 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "B4", d: 1 }, { n: "A4", d: 1 }, { n: "G#4", d: 1 },
            { n: "A4", d: 2 }, { n: "B4", d: 1 },
            { n: "G#4", d: 2 }, { n: "E4", d: 1 },
            { n: "A4", d: 3 },
            // Estrofe 2
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "C5", d: 1 }, { n: "C5", d: 1 }, { n: "C5", d: 1 },
            { n: "B4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "E4", d: 3 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "B4", d: 1 }, { n: "A4", d: 1 }, { n: "G#4", d: 1 },
            { n: "A4", d: 2 }, { n: "B4", d: 1 },
            { n: "G#4", d: 2 }, { n: "E4", d: 1 },
            { n: "A4", d: 3 },
            // Estrofe 3
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "C5", d: 1 }, { n: "C5", d: 1 }, { n: "C5", d: 1 },
            { n: "B4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "E4", d: 3 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "G#4", d: 1 }, { n: "A4", d: 1 }, { n: "B4", d: 1 },
            { n: "C5", d: 3 },
            { n: "B4", d: 1 }, { n: "A4", d: 1 }, { n: "G#4", d: 1 },
            { n: "A4", d: 2 }, { n: "B4", d: 1 },
            { n: "G#4", d: 2 }, { n: "E4", d: 1 },
            { n: "A4", d: 3 }
        ],
        harmonia: [
            // Estrofe 1
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },

            // Estrofe 2
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },

            // Estrofe 3
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "SOL#", notas: ["G#3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "SOL#", notas: ["G#3"], d: 1 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 },
            { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "DÓ", notas: ["C4"], d: 1 },
            { nome: "MI (Base)", notas: ["E3"], d: 3 },
            { nome: "LÁ (Base)", notas: ["A3"], d: 3 }
        ]
    },
    
    // ---------------------------------------------------------------------
    // 13. BORBOLETINHA (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "13. Borboletinha (Completa)",
        bpm: 106,
        compasso: 2,
        melodia: [
            // Borboletinha
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 1 },
            { n: "D4", d: 2 }, { n: "D4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 2 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "C4", d: 2 },
            // Borboletão
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 1 },
            { n: "D4", d: 2 }, { n: "D4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 2 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Borboletinha
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Borboletão
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },

    // ---------------------------------------------------------------------
    // 14. SAPO CURURU (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "14. Sapo Cururu (Completa)",
        bpm: 96,
        compasso: 2,
        melodia: [
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 1 }, { n: "G4", d: 1 },
            { n: "F4", d: 2 }, { n: "D4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    }
);

// =========================================================================
// SUIRI GESTÃO FAMILIAR - CATÁLOGO DE MÚSICAS COM TÔNICA E BALANÇO (PARTE 3: 15 a 20)
// Tônica sustentada na base com dedilhado rítmico nas notas complementares
// =========================================================================

window.CATALOGO_MUSICAS = window.CATALOGO_MUSICAS || [];

window.CATALOGO_MUSICAS.push(
    // ---------------------------------------------------------------------
    // 15. A CANOA VIROU (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "15. A Canoa Virou (Completa)",
        bpm: 102,
        compasso: 2,
        melodia: [
            // Frase 1
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "D4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 2 },
            // Frase 2
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            // Frase 3
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "D4", d: 1 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 2 },
            // Frase 4
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 1 }, { n: "D4", d: 1 }, { n: "C4", d: 2 },
            // Frase 5
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 2 },
            // Frase 6
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // 48 tempos com tônica firme e alternância rítmica
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },

    // ---------------------------------------------------------------------
    // 16. CAPELINHA DE MELÃO (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "16. Capelinha de Melão (Completa)",
        bpm: 110,
        compasso: 2,
        melodia: [
            // Parte 1
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "C4", d: 2 },
            // Parte 2
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 },
            // Parte 3
            { n: "G4", d: 1 }, { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 1 },
            { n: "C4", d: 1 }, { n: "C4", d: 1 }, { n: "D4", d: 2 },
            { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            // 48 tempos com tônica firme e alternância rítmica
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },
    
    // ---------------------------------------------------------------------
    // 17. TEREZINHA DE JESUS (COMPLETA: 3 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "17. Terezinha de Jesus (Completa)",
        bpm: 96,
        compasso: 3,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 2 }, { n: "D4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "A4", d: 1 }, { n: "B4", d: 1 }, { n: "A4", d: 2 },
            { n: "G4", d: 1 }, { n: "F4", d: 2 }, { n: "E4", d: 1 },
            // Estrofe 2
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 2 }, { n: "D4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 2 },
            { n: "E4", d: 1 }, { n: "D4", d: 2 }, { n: "C4", d: 1 },
            // Estrofe 3
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 }, { n: "G4", d: 1 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 2 },
            { n: "F4", d: 1 }, { n: "E4", d: 2 }, { n: "D4", d: 1 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 }, { n: "A4", d: 1 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 2 },
            { n: "E4", d: 1 }, { n: "D4", d: 2 }, { n: "C4", d: 1 }
        ],
        harmonia: [
            // Estrofe 1 (24 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Estrofe 2 (24 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Estrofe 3 (24 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 }
        ]
    },

    // ---------------------------------------------------------------------
    // 18. POMBINHA BRANCA (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "18. Pombinha Branca (Completa)",
        bpm: 100,
        compasso: 3,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 },
            { n: "C5", d: 2 }, { n: "B4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 1 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 },
            { n: "C5", d: 2 }, { n: "B4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 1 }, { n: "C4", d: 2 },
            // Estrofe 2
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 },
            { n: "C5", d: 2 }, { n: "B4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 1 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 },
            { n: "C5", d: 2 }, { n: "B4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 2 },
            { n: "D4", d: 1 }, { n: "F4", d: 1 }, { n: "A4", d: 2 },
            { n: "G4", d: 2 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 1 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Estrofe 1 (36 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },

            // Estrofe 2 (36 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 }, { nome: "SI", notas: ["B3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 },
            { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 3 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 3 }
        ]
    },
    
    // ---------------------------------------------------------------------
    // 19. FUI NO TORORÓ (COMPLETA: 2 ESTROFES)
    // ---------------------------------------------------------------------
    {
        titulo: "19. Fui no Tororó (Completa)",
        bpm: 104,
        compasso: 2,
        melodia: [
            // Estrofe 1
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "F4", d: 1 },
            { n: "G4", d: 2 }, { n: "G4", d: 2 },
            { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            // Estrofe 2
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 2 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 2 }, { n: "C4", d: 2 },
            { n: "E4", d: 1 }, { n: "E4", d: 1 }, { n: "E4", d: 2 },
            { n: "F4", d: 1 }, { n: "F4", d: 1 }, { n: "F4", d: 2 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 1 },
            { n: "C4", d: 4 }
        ],
        harmonia: [
            // Estrofe 1 (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Estrofe 2 (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "FÁ (Base)", notas: ["F3"], d: 2 }, { nome: "DÓ", notas: ["C4"], d: 1 }, { nome: "LÁ", notas: ["A3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    },

    // ---------------------------------------------------------------------
    // 20. MEU LANCHINHO (COMPLETA)
    // ---------------------------------------------------------------------
    {
        titulo: "20. Meu Lanchinho (Completa)",
        bpm: 104,
        compasso: 2,
        melodia: [
            // Parte 1
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 },
            // Parte 2
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "C4", d: 1 }, { n: "D4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "E4", d: 1 }, { n: "F4", d: 1 }, { n: "G4", d: 2 },
            { n: "G4", d: 1 }, { n: "A4", d: 1 }, { n: "G4", d: 1 }, { n: "F4", d: 1 },
            { n: "E4", d: 1 }, { n: "C4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 1 },
            { n: "G4", d: 1 }, { n: "F4", d: 1 }, { n: "E4", d: 1 }, { n: "C4", d: 1 },
            { n: "D4", d: 2 }, { n: "C4", d: 2 }
        ],
        harmonia: [
            // Parte 1 (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },

            // Parte 2 (32 tempos)
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "SOL", notas: ["G3"], d: 1 }, { nome: "MI", notas: ["E3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 2 }, { nome: "MI", notas: ["E3"], d: 1 }, { nome: "SOL", notas: ["G3"], d: 1 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 },
            { nome: "SOL (Base)", notas: ["G3"], d: 2 }, { nome: "SI", notas: ["B3"], d: 1 }, { nome: "RÉ", notas: ["D3"], d: 1 },
            { nome: "DÓ (Base)", notas: ["C3"], d: 4 }
        ]
    }
);

// Atualização automática do catálogo no motor do piano
if (window.MotorMusica && typeof window.MotorMusica.carregarCatalogo === 'function') {
    window.MotorMusica.carregarCatalogo(window.CATALOGO_MUSICAS);
}