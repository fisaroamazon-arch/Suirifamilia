/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.calcularEvolucaoSantuario = function() {
    let totalRituaisCumpridos = 0;
    let totalDiasPerfeitos = 0;
    let xpTotal = 0;

    const datas = Object.keys(window.dadosRituaisFemininos);
    datas.forEach(dt => {
        const reg = window.dadosRituaisFemininos[dt];
        const qtd = reg.totalCumpridas || 0;
        totalRituaisCumpridos += qtd;
        xpTotal += (qtd * 10);
        if (qtd === 6) {
            totalDiasPerfeitos++;
            xpTotal += 40;
        }
    });

    let nivelAtual = window.niveisFemininos[0];
    for (let n of window.niveisFemininos) {
        if (xpTotal >= n.minXP) nivelAtual = n;
    }

    const ofensiva = window.obterOfensivaMulher();
    const conquistasDef = [
        { id: "cf1", titulo: "Primeiro Despertar", desc: "Completou o 1º ritual de autocuidado", desbloqueada: totalRituaisCumpridos >= 1 },
        { id: "cf2", titulo: "Trinca Serena", desc: "3 dias seguidos de constância", desbloqueada: ofensiva >= 3 },
        { id: "cf3", titulo: "Plenitude Total", desc: "Completou 100% (6/6) dos rituais num dia", desbloqueada: totalDiasPerfeitos >= 1 },
        { id: "cf4", titulo: "Semana Radiante", desc: "7 dias seguidos cuidando de si", desbloqueada: ofensiva >= 7 },
        { id: "cf5", titulo: "Harmonia de Ciclo", desc: "14 dias seguidos de rituais", desbloqueada: ofensiva >= 14 },
        { id: "cf6", titulo: "Flor da Constância", desc: "Alcançou 30 rituais concluídos", desbloqueada: totalRituaisCumpridos >= 30 }
    ];

    return {
        totalRituais: totalRituaisCumpridos,
        diasPerfeitos: totalDiasPerfeitos,
        xp: xpTotal,
        nivel: nivelAtual,
        conquistas: conquistasDef
    };
};

window.obterOfensivaMulher = function() {
    let ofensiva = 0;
    const datas = Object.keys(window.dadosRituaisFemininos).sort().reverse();
    for (let dt of datas) {
        const item = window.dadosRituaisFemininos[dt];
        if (item.totalCumpridas && item.totalCumpridas > 0) {
            ofensiva++;
        } else {
            break;
        }
    }
    return ofensiva;
};

window.renderizarPainelEvolucaoSantuario = function() {
    const dados = window.calcularEvolucaoSantuario();

    const elNivel = document.getElementById('lbl-nome-nivel-mulher');
    const elXP = document.getElementById('lbl-xp-mulher');
    const elBarraXP = document.getElementById('barra-xp-mulher');
    const elProx = document.getElementById('lbl-info-prox-nivel-mulher');

    if (elNivel) elNivel.textContent = `Grau ${dados.nivel.nivel}: ${dados.nivel.nome}`;
    if (elXP) elXP.textContent = `${dados.xp} XP`;

    const spanNivel = dados.nivel.maxXP - dados.nivel.minXP;
    const progressoNoNivel = dados.xp - dados.nivel.minXP;
    const pctNivel = Math.min(100, Math.round((progressoNoNivel / spanNivel) * 100));

    if (elBarraXP) elBarraXP.style.width = `${pctNivel}%`;
    if (elProx) {
        if (dados.nivel.nivel === 6) {
            elProx.textContent = "Ápice Alcançado: Plenitude Soberana!";
        } else {
            elProx.textContent = `Faltam ${dados.nivel.maxXP - dados.xp} XP para o próximo nível (${pctNivel}%)`;
        }
    }

    const agora = new Date();
    let rituaisSemana = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(agora.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const reg = window.dadosRituaisFemininos[dStr];
        if (reg) rituaisSemana += (reg.totalCumpridas || 0);
    }
    const metaAlvoSemana = 25;
    const pctSemana = Math.min(100, Math.round((rituaisSemana / metaAlvoSemana) * 100));

    const elMetaSem = document.getElementById('lbl-meta-sem-mulher');
    const elMetaSemPct = document.getElementById('lbl-meta-sem-mulher-pct');
    const elBarraSem = document.getElementById('barra-meta-sem-mulher');

    if (elMetaSem) elMetaSem.textContent = `${rituaisSemana} / ${metaAlvoSemana}`;
    if (elMetaSemPct) elMetaSemPct.textContent = `${pctSemana}%`;
    if (elBarraSem) elBarraSem.style.width = `${pctSemana}%`;

    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    let rituaisMes = 0;
    let diasPerfeitosMes = 0;

    Object.keys(window.dadosRituaisFemininos).forEach(dt => {
        const [ano, mes] = dt.split('-').map(Number);
        if (ano === anoAtual && (mes - 1) === mesAtual) {
            const reg = window.dadosRituaisFemininos[dt];
            const qtd = reg.totalCumpridas || 0;
            rituaisMes += qtd;
            if (qtd === 6) diasPerfeitosMes++;
        }
    });

    const diasDecorridos = agora.getDate();
    const totalPossivel = diasDecorridos * 6;
    const taxaMes = totalPossivel > 0 ? Math.round((rituaisMes / totalPossivel) * 100) : 0;

    const elStatsRituais = document.getElementById('lbl-stats-rituais-mes');
    const elStatsPerfeitos = document.getElementById('lbl-stats-perfeitos-mes');
    const elStatsTaxa = document.getElementById('lbl-stats-taxa-mes-mulher');

    if (elStatsRituais) elStatsRituais.textContent = `${rituaisMes} rituais`;
    if (elStatsPerfeitos) elStatsPerfeitos.textContent = `${diasPerfeitosMes} dias 100%`;
    if (elStatsTaxa) elStatsTaxa.textContent = `Taxa: ${taxaMes}% de adesão`;

    const contConquistas = document.getElementById('bloco-conquistas-mulher');
    const elContadorConquistas = document.getElementById('contador-conquistas-mulher');
    if (contConquistas) {
        const desbloqueadas = dados.conquistas.filter(c => c.desbloqueada).length;
        if (elContadorConquistas) elContadorConquistas.textContent = `${desbloqueadas}/${dados.conquistas.length}`;

        contConquistas.innerHTML = dados.conquistas.map(c => `
            <div style="background:${c.desbloqueada ? '#faf5ff' : '#ffffff'}; border:1px solid ${c.desbloqueada ? '#d8b4fe' : '#ede9fe'}; padding:7px 9px; border-radius:10px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:13px;">${c.desbloqueada ? '🌸' : '🔒'}</span>
                    <strong style="font-size:11px; color:${c.desbloqueada ? '#3b0764' : '#6b21a8'};">${esc(c.titulo)}</strong>
                </div>
                <span style="font-size:9.5px; color:#581c87; display:block; margin-top:2px;">${c.desc}</span>
            </div>
        `).join('');
    }
};

window.alternarRetratilGenerico = function(conteudoId, setaId) {
    const el = document.getElementById(conteudoId);
    const seta = document.getElementById(setaId);
    if (!el) return;
    el.classList.toggle('oculto');
    if (seta) {
        seta.style.transform = el.classList.contains('oculto') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

window.obterTituloRituaisMulher = function(qtd) {
    if (qtd === 0) return "Desperte a Alma";
    if (qtd <= 2) return "Semente Plantada 🌱";
    if (qtd <= 4) return "Em Florescimento 🌸";
    if (qtd === 5) return "Equilíbrio Radiante ✨";
    return "Plenitude & Luz 💖";
};

// 6 METAS DIÁRIAS EM FORMATO VERTICAL FLUIDO
window.sincronizarCheckboxesRituaisHoje = function() {
    const containerGrid = document.getElementById('container-grid-metas-mulher');
    if (!containerGrid) return;

    const hojeStr = Suiri.today();
    const registroHoje = window.dadosRituaisFemininos[hojeStr] || {};

    containerGrid.innerHTML = window.configMetasFemininas.map((meta, idx) => {
        const checked = !!registroHoje[`meta_${idx}`];
        return `
            <label style="display:flex; align-items:center; justify-content:space-between; padding:9px 4px; border-bottom:1px solid #d8b4fe; cursor:pointer;">
                <span style="font-size:12px; font-weight:700; color:#3b0764; line-height:1.3; white-space:normal; word-break:break-word; padding-right:10px;">${meta}</span>
                <input type="checkbox" id="check-ritual-fem-${idx}" onchange="window.salvarCheckinRitualMulher(${idx})" ${checked ? 'checked' : ''} style="width:18px; height:18px; accent-color:#7c3aed; flex-shrink:0; cursor:pointer;">
            </label>
        `;
    }).join('');
};

window.salvarCheckinRitualMulher = async function(idx) {
    const hojeStr = Suiri.today();
    if (!window.dadosRituaisFemininos[hojeStr]) {
        window.dadosRituaisFemininos[hojeStr] = { data: hojeStr, metas: {} };
    }

    const check = document.getElementById(`check-ritual-fem-${idx}`);
    window.dadosRituaisFemininos[hojeStr][`meta_${idx}`] = check ? check.checked : false;

    let cumpridas = 0;
    for (let i = 0; i < 6; i++) {
        if (window.dadosRituaisFemininos[hojeStr][`meta_${i}`]) cumpridas++;
    }
    window.dadosRituaisFemininos[hojeStr].totalCumpridas = cumpridas;
    window.dadosRituaisFemininos[hojeStr].pct = Math.round((cumpridas / 6) * 100);

    Suiri.storage.setItem('suiri_rituais_fem', JSON.stringify(window.dadosRituaisFemininos));
    
    window.renderizarPainelEvolucaoSantuario();
    window.renderizarHistoricoRituaisRetratil();

    const elStreak = document.getElementById('streak-rituais-mulher');
    if (elStreak) {
        elStreak.innerHTML = `<img src="assets/icons-modern/icone-fogo.svg" alt="Fogo" style="width:15px; height:15px; object-fit:contain;"> ${window.obterOfensivaMulher()} dias`;
    }

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            await supabase.from('espaco_fem_checkins').upsert({
                usuario_id: usuarioId,
                data_registro: hojeStr,
                cumpridas: cumpridas,
                percentual: window.dadosRituaisFemininos[hojeStr].pct
            }, { onConflict: 'usuario_id, data_registro' });
        } catch (e) {}
    }
};

window.renderizarHistoricoRituaisRetratil = function() {
    const cont = document.getElementById('bloco-historico-rituais');
    const elContador = document.getElementById('contador-historico-rituais');
    if (!cont) return;

    const datas = Object.keys(window.dadosRituaisFemininos).sort().reverse();
    if (elContador) elContador.textContent = datas.length;

    if (datas.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhum registo diário guardado ainda.</span>';
        return;
    }

    cont.innerHTML = datas.slice(0, 7).map(dt => {
        const reg = window.dadosRituaisFemininos[dt];
        const partes = dt.split('-');
        const dataFormatada = `${partes[2]}/${partes[1]}`;
        const total = reg.totalCumpridas || 0;
        const pct = reg.pct || Math.round((total / 6) * 100);
        const titulo = window.obterTituloRituaisMulher(total);

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:12px; padding:9px 12px; display:flex; flex-direction:column; gap:5px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:11.5px; color:#3b0764;">${dataFormatada} • ${titulo}</strong>
                    <span style="font-size:11px; font-weight:800; color:#7c3aed;">${total}/6 (${pct}%)</span>
                </div>
                <div style="background:#ede9fe; border-radius:8px; height:5px; width:100%; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, #a855f7, #6b21a8); height:100%; width:${pct}%;"></div>
                </div>
            </div>
        `;
    }).join('');
};

window.abrirModalEditarMetasMulher = function() {
    const modal = document.getElementById('modal-config-metas-mulher');
    const container = document.getElementById('container-inputs-editar-metas-mulher');
    if (!modal || !container) return;

    container.innerHTML = window.configMetasFemininas.map((meta, i) => `
        <div>
            <label style="font-size:10.5px; font-weight:800; color:#581c87; display:block; margin-bottom:2px;">Meta ${i + 1}</label>
            <input type="text" id="input-edit-meta-mulher-${i}" value="${meta}" style="width:100%; box-sizing:border-box; padding:8px 10px; border-radius:10px; border:1.5px solid #d8b4fe; background:#faf5ff; font-size:12px; font-weight:600; color:#3b0764;">
        </div>
    `).join('');

    modal.classList.remove('oculto');
};

window.fecharModalEditarMetasMulher = function() {
    const modal = document.getElementById('modal-config-metas-mulher');
    if (modal) modal.classList.add('oculto');
};

window.salvarNovasMetasConfiguradasMulher = function() {
    const novasMetas = [];
    for (let i = 0; i < 6; i++) {
        const val = document.getElementById(`input-edit-meta-mulher-${i}`)?.value.trim();
        novasMetas.push(val || `Meta ${i + 1}`);
    }

    window.configMetasFemininas = novasMetas;
    Suiri.storage.setItem('suiri_metas_fem_config', JSON.stringify(novasMetas));
    window.fecharModalEditarMetasMulher();
    window.sincronizarCheckboxesRituaisHoje();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("6 Metas atualizadas com sucesso!", "sucesso");
    }
};

// =========================================================================
// 5. CURADORIA DE FILMES & SÉRIES (COM LOGOS E LINKS DIRETOS AOS STREAMERS)
// =========================================================================

