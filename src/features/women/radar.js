/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.obterDescricaoTermoFisicoDiario = function(valor) {
    const v = Math.round(Number(valor));
    if (v <= 3) return `Borocochô 🥀`;
    if (v <= 7) return `Mulherão 💃`;
    return `Deusa ✨`;
};

window.atualizarRotuloTermoFisicoDiario = function(val) {
    const badge = document.getElementById('badge-termo-fisico-diario');
    if (badge) {
        badge.textContent = window.obterDescricaoTermoFisicoDiario(val);
    }
};

window.selecionarHumorDiario = function(btn) {
    document.querySelectorAll('.btn-humor-diario-opcao').forEach(b => {
        b.classList.remove('ativo');
        b.style.background = '#ffffff';
        b.style.color = '#5c4426';
        b.style.borderColor = '#d5c3a5';
        b.style.fontWeight = '700';
    });

    btn.classList.add('ativo');
    btn.style.background = '#7c3aed';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#7c3aed';
    btn.style.fontWeight = '800';

    window.humorDiarioSelecionadoAtual = btn.getAttribute('data-humor') || 'Feliz';
};

// =========================================================================
// 3. RADAR DE FEMINILIDADE (5 NÍVEIS, SEM NOTA, CORPO RETRÁTIL)
// =========================================================================

window.alternarSecaoRadarFeminilidade = function(aberto) {
    const btn = document.getElementById('btn-toggle-radar-bloco');
    if (btn) Suiri.togglePanel(btn, aberto);
};

window.obterDescricaoNotaFeminilidade = function(tipo, valor) {
    const v = Math.round(Number(valor));
    if (tipo === 'vitalidade') {
        if (v === 1) return `Exaustão / Bateria Baixa`;
        if (v === 2) return `Pedindo Repouso`;
        if (v === 3) return `Equilíbrio / Estável`;
        if (v === 4) return `Vitalidade Ativa`;
        return `Plenitude & Radiante`;
    } else if (tipo === 'paz_mental') {
        if (v === 1) return `Serenidade Total`;
        if (v === 2) return `Serena / Em Paz`;
        if (v === 3) return `Emoções Oscilantes`;
        if (v === 4) return `Mente Inquieta / Tensa`;
        return `Sobrecarga / Pedindo Pausa`;
    } else if (tipo === 'afeto_libido') {
        if (v === 1) return `Recolhimento / Em Si`;
        if (v === 2) return `Acolhimento Suave`;
        if (v === 3) return `Conexão Serena`;
        if (v === 4) return `Magnetismo Ativo`;
        return `Desejo Vivo & Magnetismo`;
    }
    return `Nível ${v}`;
};

window.atualizarRotuloSliderFeminilidade = function(tipo) {
    let elRange, elBadge;
    if (tipo === 'vitalidade') {
        elRange = document.getElementById('range-vitalidade-fem');
        elBadge = document.getElementById('badge-vitalidade-valor');
    } else if (tipo === 'paz_mental') {
        elRange = document.getElementById('range-pazmental-fem');
        elBadge = document.getElementById('badge-pazmental-valor');
    } else if (tipo === 'afeto_libido') {
        elRange = document.getElementById('range-afeto-fem');
        elBadge = document.getElementById('badge-afeto-valor');
    }

    if (elRange && elBadge) {
        elBadge.textContent = window.obterDescricaoNotaFeminilidade(tipo, elRange.value);
    }
};

window.salvarRadarFeminilidadeCompleto = async function() {
    const dtRelacao = document.getElementById('slider-data-relacao-fem')?.value || null;
    const vVit = Math.round(Number(document.getElementById('range-vitalidade-fem')?.value || '3'));
    const vPaz = Math.round(Number(document.getElementById('range-pazmental-fem')?.value || '3'));
    const vAfeto = Math.round(Number(document.getElementById('range-afeto-fem')?.value || '3'));
    const hojeStr = Suiri.today();

    const novoRegistro = {
        id: 'rad_fem_' + Date.now(),
        data: hojeStr,
        ultima_relacao: dtRelacao,
        vitalidade: vVit,
        paz_mental: vPaz,
        afeto_libido: vAfeto,
        txtVit: window.obterDescricaoNotaFeminilidade('vitalidade', vVit),
        txtPaz: window.obterDescricaoNotaFeminilidade('paz_mental', vPaz),
        txtAfeto: window.obterDescricaoNotaFeminilidade('afeto_libido', vAfeto)
    };

    window.dadosRadarFeminilidade.ultima_relacao = dtRelacao;
    window.dadosRadarFeminilidade.vitalidade = vVit;
    window.dadosRadarFeminilidade.paz_mental = vPaz;
    window.dadosRadarFeminilidade.afeto_libido = vAfeto;

    if (!Array.isArray(window.dadosRadarFeminilidade.historico)) {
        window.dadosRadarFeminilidade.historico = [];
    }

    window.dadosRadarFeminilidade.historico.unshift(novoRegistro);
    if (window.dadosRadarFeminilidade.historico.length > 20) {
        window.dadosRadarFeminilidade.historico = window.dadosRadarFeminilidade.historico.slice(0, 20);
    }

    Suiri.storage.setItem('suiri_radar_fem', JSON.stringify(window.dadosRadarFeminilidade));
    window.renderizarHistoricoRadarFeminilidade();
    window.renderizarGraficoETendenciasFeminilidade();

    window.alternarSecaoRadarFeminilidade(false);

    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Radar de Feminilidade guardado com sucesso!", "sucesso");
    }

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            await supabase.from('espaco_fem_radar').upsert({
                usuario_id: usuarioId,
                data_registro: hojeStr,
                ultima_relacao: dtRelacao,
                vitalidade: vVit,
                paz_mental: vPaz,
                afeto_libido: vAfeto
            }, { onConflict: 'usuario_id, data_registro' });
        } catch (e) {}
    }
};

window.renderizarHistoricoRadarFeminilidade = function() {
    const cont = document.getElementById('lista-historico-radar-fem');
    const elContador = document.getElementById('contador-historico-radar-fem');
    if (!cont) return;

    const hist = window.dadosRadarFeminilidade.historico || [];
    if (elContador) elContador.textContent = hist.length;

    if (hist.length === 0) {
        cont.innerHTML = '<span style="font-size:11px; color:#6b21a8; text-align:center; display:block; padding:8px;">Nenhuma avaliação confidencial guardada ainda.</span>';
        return;
    }

    cont.innerHTML = hist.map(reg => {
        const partes = reg.data.split('-');
        const dataFmt = `${partes[2]}/${partes[1]}`;
        const infoRelacao = reg.ultima_relacao ? ` • Conexão: ${reg.ultima_relacao.split('-').slice(1).reverse().join('/')}` : '';

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; padding:8px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="font-size:10px; font-weight:800; color:#581c87; display:block;">${dataFmt}${infoRelacao}</span>
                    <span style="font-size:11px; color:#3b0764; font-weight:700; display:flex; align-items:center; gap:6px; margin-top:2px;">
                        <img src="assets/icons-modern/icone-energia.svg" alt="Vitalidade" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtVit} | 
                        <img src="assets/icons-modern/icone-estresse.svg" alt="Paz" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtPaz}
                    </span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; font-weight:800; color:#7c3aed; background:#f3e8ff; padding:2px 6px; border-radius:6px; border:1px solid #d8b4fe; display:inline-flex; align-items:center; gap:3px;">
                        <img src="assets/icons-modern/love.svg" onerror="this.onerror=null; this.src='assets/icons-modern/icone-fogo.svg';" alt="Afeto" style="width:16px; height:16px; object-fit:contain;"> ${reg.txtAfeto}
                    </span>
                    <button type="button" onclick="window.removerItemHistoricoRadarFeminilidade('${reg.id}')" style="background:none; border:none; cursor:pointer; padding:2px; display:flex; align-items:center;" title="Remover registo">
                        <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.removerItemHistoricoRadarFeminilidade = function(id) {
    if (!window.dadosRadarFeminilidade.historico) return;
    window.dadosRadarFeminilidade.historico = window.dadosRadarFeminilidade.historico.filter(r => r.id !== id);
    Suiri.storage.setItem('suiri_radar_fem', JSON.stringify(window.dadosRadarFeminilidade));
    window.renderizarHistoricoRadarFeminilidade();
    window.renderizarGraficoETendenciasFeminilidade();
};

window.carregarRadarFeminilidadeNuvem = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    try {
        const { data } = await supabase
            .from('espaco_fem_radar')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_registro', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            window.dadosRadarFeminilidade.ultima_relacao = data.ultima_relacao;
            window.dadosRadarFeminilidade.vitalidade = data.vitalidade > 5 ? Math.round(data.vitalidade / 2) : (data.vitalidade || 3);
            window.dadosRadarFeminilidade.paz_mental = data.paz_mental > 5 ? Math.round(data.paz_mental / 2) : (data.paz_mental || 3);
            window.dadosRadarFeminilidade.afeto_libido = data.afeto_libido > 5 ? Math.round(data.afeto_libido / 2) : (data.afeto_libido || 3);

            const inDt = document.getElementById('slider-data-relacao-fem');
            const rngVit = document.getElementById('range-vitalidade-fem');
            const rngPaz = document.getElementById('range-pazmental-fem');
            const rngAfeto = document.getElementById('range-afeto-fem');

            if (inDt) inDt.value = data.ultima_relacao || '';
            if (rngVit) rngVit.value = window.dadosRadarFeminilidade.vitalidade;
            if (rngPaz) rngPaz.value = window.dadosRadarFeminilidade.paz_mental;
            if (rngAfeto) rngAfeto.value = window.dadosRadarFeminilidade.afeto_libido;

            window.atualizarRotuloSliderFeminilidade('vitalidade');
            window.atualizarRotuloSliderFeminilidade('paz_mental');
            window.atualizarRotuloSliderFeminilidade('afeto_libido');
            window.renderizarGraficoETendenciasFeminilidade();
        }
    } catch (e) {}
};

// Renderização dos Gráficos SVG & Tendências do Radar
window.renderizarGraficoETendenciasFeminilidade = function() {
    const contGraf = document.getElementById('container-grafico-svg-mulher');
    const contComp = document.getElementById('bloco-comparativo-semanas-mulher');
    const elInsight = document.getElementById('texto-insight-tendencia-mulher');

    if (!contGraf) return;

    const histRadar = window.dadosRadarFeminilidade.historico || [];

    const { points, current: semAtual, previous: semAnt } = Suiri.radarPeriods(histRadar);
    if (!points.length) {
        contGraf.textContent = 'Nenhum registro nos últimos 30 dias.';
        if (contComp) contComp.textContent = 'Sem registros para comparação.';
        if (elInsight) elInsight.textContent = 'Registre suas avaliações para acompanhar sua evolução.';
        return;
    }

    const nota = (reg, campo) => {
        const valor = Number(reg[campo]);
        return valor >= 1 && valor <= 10 ? (valor > 5 ? valor / 2 : valor) : null;
    };
    const series = [
        ['vitalidade', 'Vitalidade', '#7c3aed'],
        ['paz_mental', 'Tensão emocional', '#e11d48'],
        ['afeto_libido', 'Afeto e magnetismo', '#0f766e']
    ].map(([campo, label, color]) => ({
        label, color, values: points.map(reg => nota(reg, campo))
    }));
    contGraf.innerHTML = Suiri.dailyChart(points.map(reg => reg.data), series, 1, 5);

    const calcMedia = (arr, prop) => {
        const valores = arr.map(reg => nota(reg, prop)).filter(Number.isFinite);
        return valores.length ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : null;
    };
    const medV_Atu = calcMedia(semAtual, 'vitalidade');
    const medP_Atu = calcMedia(semAtual, 'paz_mental');
    const medA_Atu = calcMedia(semAtual, 'afeto_libido');
    const medV_Ant = calcMedia(semAnt, 'vitalidade');
    const medP_Ant = calcMedia(semAnt, 'paz_mental');
    const medA_Ant = calcMedia(semAnt, 'afeto_libido');

    if (contComp) {
        contComp.innerHTML = `
            <div style="background:#faf5ff; border:1px solid #d8b4fe; padding:7px 10px; border-radius:10px;">
                <span style="font-size:10px; color:#6b21a8; font-weight:800; text-transform:uppercase; display:block;">Últimos 7 dias:</span>
                <span style="font-size:11.5px; color:#3b0764; font-weight:700; display:block; margin-top:2px;">
                    🌸 ${medV_Atu ?? '—'} | 🧘‍♀️ ${medP_Atu ?? '—'} | ❤️ ${medA_Atu ?? '—'}
                </span>
            </div>
            <div style="background:#faf5ff; border:1px solid #d8b4fe; padding:7px 10px; border-radius:10px;">
                <span style="font-size:10px; color:#6b21a8; font-weight:800; text-transform:uppercase; display:block;">7 dias anteriores:</span>
                <span style="font-size:11.5px; color:#3b0764; font-weight:700; display:block; margin-top:2px;">
                    ${(medV_Ant || medP_Ant || medA_Ant) ? `🌸 ${medV_Ant ?? '—'} | 🧘‍♀️ ${medP_Ant ?? '—'} | ❤️ ${medA_Ant ?? '—'}` : '<em style="color:#94a3b8; font-size:10.5px;">Sem histórico</em>'}
                </span>
            </div>
        `;
    }

    if (elInsight) {
        if (!semAtual.length) {
            elInsight.textContent = 'Registre uma avaliação para acompanhar os últimos 7 dias.';
        } else if (parseFloat(medP_Atu) >= 4.0) {
            elInsight.innerHTML = `🍵 <strong>Período de Sobrecarga / Tensão:</strong> O seu índice de tensão emocional está elevado (${medP_Atu}/5). Use o <em>Modo Alívio</em> e priorize o descanso hoje.`;
        } else if (parseFloat(medV_Atu) >= 4.0) {
            elInsight.innerHTML = `✨ <strong>Fase Radiante:</strong> Vitalidade e brilho em alta (${medV_Atu}/5). Excelente momento para conexões, novos projetos e magnetismo a dois!`;
        } else {
            elInsight.innerHTML = `🌿 <strong>Ritmo Suave & Equilíbrio:</strong> Mantenha a hidratação e os rituais do Santuário para sustentar o seu bem-estar corporal.`;
        }
    }
};

// =========================================================================
// 4. LÓGICA DAS 6 METAS DIÁRIAS (O SANTUÁRIO COM NÍVEIS XP & METAS)
// =========================================================================

window.niveisFemininos = [
    { nivel: 1, nome: "Despertar Serena", minXP: 0, maxXP: 300 },
    { nivel: 2, nome: "Harmonia & Flor", minXP: 300, maxXP: 700 },
    { nivel: 3, nome: "Constância Serena", minXP: 700, maxXP: 1400 },
    { nivel: 4, nome: "Guardiã do Próprio Lar", minXP: 1400, maxXP: 2500 },
    { nivel: 5, nome: "Plenitude Radiante", minXP: 2500, maxXP: 4000 },
    { nivel: 6, nome: "Soberana de Si Mesma", minXP: 4000, maxXP: 99999 }
];

