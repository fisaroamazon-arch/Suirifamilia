/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.abrirModalMinutoZen = function() {
    let modal = document.getElementById('modal-video-minuto-zen');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-video-minuto-zen';
        modal.style.cssText = 'position:fixed !important; inset:0 !important; width:100vw !important; height:100vh !important; background:#000000 !important; z-index:9999999 !important; overflow:hidden !important; margin:0 !important; padding:0 !important; display:flex; align-items:center; justify-content:center;';
        modal.innerHTML = `
            <video id="video-zen-reprodutor" loop playsinline webkit-playsinline preload="auto" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; pointer-events:auto;"></video>
            
            <button type="button" onclick="window.fecharModalMinutoZen()" 
                    style="position:absolute; top:24px; right:20px; z-index:10; width:44px; height:44px; border-radius:50%; background:rgba(0,0,0,0.55); border:1.5px solid rgba(255,255,255,0.7); color:#ffffff; font-size:20px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.4); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);">
                ✕
            </button>
        `;
        document.body.appendChild(modal);
    }

    modal.classList.remove('oculto');
    modal.style.display = 'flex';

    const vid = document.getElementById('video-zen-reprodutor');
    if (vid) {
        if (!vid.src || !vid.src.includes('assets/video/zen.mp4')) {
            vid.src = 'assets/video/zen.mp4';
        }

        vid.setAttribute('playsinline', '');
        vid.setAttribute('webkit-playsinline', '');
        vid.loop = true;

        vid.muted = false;
        vid.defaultMuted = false;
        vid.volume = 1.0;

        vid.currentTime = 0;
        vid.load();
        
        const promessa = vid.play();
        if (promessa !== undefined) {
            promessa.catch(() => {
                vid.play().catch(() => {});
            });
        }
    }
};

window.fecharModalMinutoZen = function() {
    const modal = document.getElementById('modal-video-minuto-zen');
    const vid = document.getElementById('video-zen-reprodutor');

    if (vid) {
        vid.pause();
        vid.currentTime = 0;
        vid.muted = true;
    }

    if (modal) {
        modal.classList.add('oculto');
        modal.style.display = 'none';
    }
};

window.abrirModalRespiracaoGuiada = window.abrirModalMinutoZen;
window.fecharModalRespiracao = window.fecharModalMinutoZen;

window.abrirModoAcolhimentoEmergencia = function() {
    let modal = document.getElementById('modal-modo-acolhimento');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-modo-acolhimento';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; inset:0; width:100%; height:100%; background:rgba(30,14,51,0.55); z-index:1000200; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); padding:16px; box-sizing:border-box;';
        modal.innerHTML = `
            <div style="background:#ffffff; width:100%; max-width:420px; max-height:86vh; padding:24px; border-radius:30px; border:1.5px solid #d8b4fe; overflow-y:auto; box-shadow:0 25px 60px rgba(59,7,100,0.22); text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #d8b4fe; padding-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="assets/icons-modern/medita.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-mulher.svg';" alt="Acolhimento" style="width:29px; height:29px; object-fit:contain;">
                        <h3 style="margin:0; font-size:18px; font-weight:900; color:#3b0764;">Modo Acolhimento</h3>
                    </div>
                    <button type="button" class="btn-secundario" style="padding:6px 12px; border-radius:12px; font-weight:800; color:#581c87; background:#faf5ff; border:1px solid #d8b4fe;" onclick="window.fecharModoAcolhimento()">✕</button>
                </div>

                <p style="font-size:12.5px; color:#581c87; line-height:1.5; margin:0 0 16px 0; font-weight:600;">
                    As cobranças do mundo podem esperar. Este é o seu momento de pausa inegociável. Respire e acolha o seu corpo.
                </p>

                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#3b0764; display:block; margin-bottom:5px;">Posições de Alívio (Cólica)</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • <strong>Postura da Criança:</strong> Ajoelhe-se, encoste os glúteos nos calcanhares e estique os braços à frente no chão.<br>
                            • <strong>Pernas na Parede:</strong> Deite de costas e apoie as pernas esticadas na parede para aliviar a tensão pélvica.
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#581c87; display:block; margin-bottom:5px;">Filmes & Séries Reconfortantes</strong>
                        <p style="font-size:12px; color:#4c1d95; margin:0; line-height:1.45;">
                            • O Fabuloso Destino de Amélie Poulain<br>
                            • Comer, Rezar, Amar<br>
                            • Anne with an E (Série)
                        </p>
                    </div>

                    <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:16px; padding:14px;">
                        <strong style="font-size:13px; color:#7e22ce; display:block; margin-bottom:5px;">Poesia de Acolhimento</strong>
                        <blockquote style="font-size:12px; color:#3b0764; font-style:italic; margin:0; line-height:1.45;">
                            “Não há mal que dure sempre, nem cansaço que o descanso não cure. Permita-se recolher, aquecer a alma e esperar a nova primavera.”
                        </blockquote>
                    </div>
                </div>

                <div style="margin-top:18px;">
                    <button type="button" class="btn-principal" style="width:100%; padding:13px; border-radius:16px; background:linear-gradient(135deg, #7c3aed 0%, #581c87 100%); color:#fff; font-weight:800; border:none; cursor:pointer;" onclick="window.fecharModoAcolhimento(); window.abrirModalMinutoZen();">Iniciar Minuto Zen</button>
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

// =========================================================================
// 9. PREVISÕES, CICLOS, INSPIRAÇÃO E REGISTRO RÁPIDO
// =========================================================================

