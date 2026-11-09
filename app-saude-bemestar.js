// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-SAUDE-BEMESTAR.JS
// Módulo de Mindfulness, Chás por Fase, Gratidão e Modo Acolhimento de Emergência
// =========================================================================

// 1. RESPIRAÇÃO GUIADA (MINDFULNESS DE 1 MINUTO)
window.abrirModalRespiracaoGuiada = function() {
    let modal = document.getElementById('modal-respiracao-guiada');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respiracao-guiada';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.75); z-index:1000100; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%); width:90%; max-width:360px; padding:26px; border-radius:28px; border:2px solid #f472b6; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.3);">
                <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:900; color:#831843;">Respiração Consciente</h3>
                <p id="txt-instrucao-respiracao" style="font-size:13px; color:#9d174d; margin:0 0 20px 0; font-weight:700;"> Inspire fundo pelo nariz... </p>
                
                <div style="display:flex; align-items:center; justify-content:center; height:160px; margin-bottom:20px;">
                    <div id="circulo-respiracao" style="width:100px; height:100px; background:linear-gradient(135deg, #f472b6, #db2777); border-radius:50%; box-shadow:0 0 25px rgba(236,72,153,0.5); transition: transform 4s ease-in-out;"></div>
                </div>

                <p style="font-size:11.5px; color:#64748b; margin:0 0 16px 0;">Deixe o corpo relaxar e solte a tensão dos ombros.</p>
                <button type="button" class="btn-principal" style="width:100%; padding:10px; border-radius:14px; background:#db2777; color:#fff; font-weight:800; border:none;" onclick="window.fecharModalRespiracao()">Encerrar Pausa</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('oculto');
    iniciarCicloRespiracao();
};

let intervaloRespiracao = null;
function iniciarCicloRespiracao() {
    const circulo = document.getElementById('circulo-respiracao');
    const txt = document.getElementById('txt-instrucao-respiracao');
    if (!circulo || !txt) return;

    let inspirar = true;
    const alternar = () => {
        if (!document.getElementById('modal-respiracao-guiada') || document.getElementById('modal-respiracao-guiada').classList.contains('oculto')) return;
        if (inspirar) {
            circulo.style.transform = 'scale(1.4)';
            txt.textContent = 'Inspire lentamente... (4s)';
        } else {
            circulo.style.transform = 'scale(1.0)';
            txt.textContent = 'Expire devagar, esvaziando... (4s)';
        }
        inspirar = !inspirar;
    };
    alternar();
    intervaloRespiracao = setInterval(alternar, 4000);
}

window.fecharModalRespiracao = function() {
    if (intervaloRespiracao) clearInterval(intervaloRespiracao);
    const modal = document.getElementById('modal-respiracao-guiada');
    if (modal) modal.classList.add('oculto');
};

// 2. RECEITAS DE CHÁS E AROMATERAPIA POR FASE
window.obterSugestaoChasEAromaterapia = function(chaveFase) {
    const acervo = {
        menstrual: {
            titulo: "Chá & Cuidado (Fase Menstrual)",
            cha: "☕ **Chá de Gengibre com Canela e Camomila**: Excelente para aquecer o corpo, melhorar a circulação e aliviar as cólicas uterinas.",
            banho: "🌿 **Banho Aromático**: Óleo essencial de Lavanda ou Sálvia no difusor para induzir o relaxamento profundo e aliviar dores lombares."
        },
        folicular: {
            titulo: "Chá & Cuidado (Fase Folicular)",
            cha: "🍵 **Chá Verde ou Chá de Hortelã**: Estimulante natural que acompanha o aumento de energia e clareza mental desta fase.",
            banho: "🍋 **Aromaterapia**: Óleo de Alecrim ou Laranja Doce para estimular o foco, a criatividade e a disposição."
        },
        ovulatoria: {
            titulo: "Chá & Cuidado (Fase Ovulatória)",
            cha: "🫖 **Chá de Hibisco ou Capim-Limão**: Refrescante e leve, ideal para manter o equilíbrio durante o pico de energia e extroversão.",
            banho: "🌸 **Aromaterapia**: Óleo essencial de Rosa ou Gerânio para celebrar a vitalidade e o autocuidado."
        },
        lutea: {
            titulo: "Chá & Cuidado (Fase Lútea / TPM)",
            cha: "🍵 **Chá de Erva-Cidreira, Melissa ou Mulungu**: Poderoso calmante natural para reduzir a ansiedade, irritabilidade e facilitar o sono.",
            banho: "🌿 **Banho Aromático**: Óleo essencial de Camomila Romana ou Bergamota para acalmar o sistema nervoso e preparar para o descanso."
        }
    };
    return acervo[chaveFase] || acervo.lutea;
};

// 3. MODO ACOLHIMENTO / ALÍVIO RÁPIDO (BOTÃO DE EMERGÊNCIA - CÓLICA / TPM)
window.abrirModoAcolhimentoEmergencia = function() {
    let modal = document.getElementById('modal-modo-acolhimento');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-modo-acolhimento';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px);';
        modal.innerHTML = `
            <div style="background:#ffffff; width:94%; max-width:440px; max-height:85vh; padding:24px; border-radius:28px; border:2.5px solid #ec4899; overflow-y:auto; box-shadow:0 25px 50px rgba(0,0,0,0.4); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #fce7f3; padding-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px;">🍵</span>
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#831843;">Modo Acolhimento & Alívio</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:4px 10px; border-radius:10px; color:#be185d;" onclick="window.fecharModoAcolhimento()">✕ Sair</button>
                </div>

                <p style="font-size:12.5px; color:#9d174d; line-height:1.5; margin:0 0 16px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="background:#fff1f2; border:1px solid #fbcfe8; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#831843; display:block; margin-bottom:4px;">🧘‍♀️ Posições de Alívio para Cólica</strong>
                        <p style="font-size:12px; color:#475569; margin:0; line-height:1.5;">
                            • <strong>Postura da Criança (Balasana):</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão, respirando fundo na região lombar.<br>
                            • <strong>Deitada com as pernas elevadas:</strong> Deite de costas e apoie as pernas esticadas numa parede ou almofada alta para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#86198f; display:block; margin-bottom:4px;">🎬 Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12px; color:#475569; margin:0; line-height:1.5;">
                            • *O Fabuloso Destino de Amélie Poulain* (Leveza e poesia visual)<br>
                            • *Minha Vó Era uma Palhaça* ou comédias aconchegantes<br>
                            • Animações Ghibli (*Meu Amigo Totoro*, *Kiki: A Aprendiz de Feiticeira*)
                        </p>
                    </div>

                    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#b45309; display:block; margin-bottom:4px;">✒️ Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12px; color:#78350f; font-style:italic; margin:0; line-height:1.5;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se ser outono: recolher as folhas, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:12px; border-radius:14px; background:linear-gradient(135deg, #ec4899 0%, #be185d 100%); color:#fff; font-weight:800; border:none;" onclick="window.abrirModalRespiracaoGuiada()">Iniciar 1 Minuto de Respiração Guiada 🌿</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('oculto');
};

window.fecharModoAcolhimento = function() {
    const modal = document.getElementById('modal-modo-acolhimento');
    if (modal) modal.classList.add('oculto');
};
