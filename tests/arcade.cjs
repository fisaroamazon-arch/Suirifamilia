const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const window = { addEventListener() {} };
const fonte = fs.readFileSync('src/pages/arcade.js', 'utf8');
const { MotorFlappy: voo } = vm.runInNewContext(fonte + '\n({ MotorFlappy })', { window });

for (const altura of [360, 400, 560, 690, 900, 1100]) {
    voo.canvas = { width: 390, height: altura };
    for (const troncos of [0, 15, 28, 42]) {
        voo.obstaculosPassados = troncos;
        const aberturas = ['amador', 'moderado', 'avancado'].map(nivel => {
            voo.nivel = nivel;
            return voo.obterEspacoAtual();
        });
        assert(aberturas[0] > aberturas[1] && aberturas[1] > aberturas[2]);

        for (let semente = 0; semente < 32; semente++) {
            voo.estadoSemente = voo.sementeVoo = semente;
            voo.passagensGeradas = 0;
            let faixaAnterior;
            for (let indice = 0; indice < 6; indice++) {
                const passagem = voo.criarPassagem();
                const faixa = [passagem.topo - 22, passagem.base - (voo.p1.h - 22)];
                const contexto = `altura ${altura}, ${troncos} troncos, semente ${semente}, passagem ${indice}`;
                assert(faixa[0] < faixa[1], `A passagem precisa acomodar o Chuíri · ${contexto}`);
                if (faixaAnterior) {
                    assert(faixa[0] > faixaAnterior[1] || faixa[1] < faixaAnterior[0],
                        `Passagens consecutivas precisam mudar a altitude · ${contexto}`);
                }
                faixaAnterior = faixa;
            }
        }
    }
}

console.log('Voador: aberturas distintas por nível e sem faixa reta no Avançado.');
