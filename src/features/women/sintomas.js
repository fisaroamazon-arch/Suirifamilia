/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.alternarSecaoComoSeSenteHoje = function() {
    const bloco = document.getElementById('bloco-corpo-sintomas-retratil');
    const btn = document.getElementById('btn-toggle-sintomas-bloco');
    if (!bloco) return;

    bloco.classList.toggle('oculto');
    if (btn) {
        btn.textContent = bloco.classList.contains('oculto') ? 'Responder' : 'Recolher';
    }
};

window.obterDescricaoNotaBarraSintomas = function(tipo, val) {
    const v = Math.round(Number(val));
    switch(tipo) {
        case 'emocional':
            if (v === 1) return `Depressiva / Triste 🌧️`;
            if (v === 2) return `Sensível / Emotiva 💧`;
            if (v === 3) return `Estável / Serena 🧘‍♀️`;
            if (v === 4) return `Alegre & Confiante 🌸`;
            return `Super Feliz & Radiante ✨`;
        case 'fisico':
            if (v === 1) return `Dores Fortes / Cólica 🥀`;
            if (v === 2) return `Incômodo / Inchaço 🌧️`;
            if (v === 3) return `Corpo Leve / Sem Dores 🌿`;
            if (v === 4) return `Disposta & Flexível 💃`;
            return `Bem-Estar Total & Plena ✨`;
        case 'energia':
            if (v === 1) return `Desânimo / Exaustão 😴`;
            if (v === 2) return `Energia Baixa / Lenta ☕`;
            if (v === 3) return `Ritmo Moderado 🌿`;
            if (v === 4) return `Disposta & Produtiva ⚡`;
            return `Revigorada / Pico de Vigor 🔥`;
        case 'comunicacao':
            if (v === 1) return `Silenciosa / Fechada 🤫`;
            if (v === 2) return `Monossilábica / Poupando Voz 💭`;
            if (v === 3) return `Conversa Normal 🗣️`;
            if (v === 4) return `Comunicativa & Sociável 💬`;
            return `Ativa Verbalmente & Expressiva ✨`;
        case 'social':
            if (v === 1) return `Querendo Ficar Só / Ninho 🛋️`;
            if (v === 2) return `Preferindo Silêncio / Calma 📖`;
            if (v === 3) return `Neutra / Equilibrada ☕`;
            if (v === 4) return `Aberta a Conversas / Saídas 👭`;
            return `Querendo Companhia / Socializar 🎉`;
        case 'pazmental':
            if (v === 1) return `Sobrecarga / Mente Ansiosa 🌪️`;
            if (v === 2) return `Pensamentos Acelerados ⚡`;
            if (v === 3) return `Pensamentos Sob Controle 🧘‍♀️`;
            if (v === 4) return `Mente Tranquila & Clara 🌿`;
            return `Paz Absoluta & Clareza Serena 🕊️`;
        case 'paciencia':
            if (v === 1) return `Pavio Curto / Irritada ⚡`;
            if (v === 2) return `Sensível a Barulho / Ruídos 🔊`;
            if (v === 3) return `Tolerância Normal 🌿`;
            if (v === 4) return `Serena & Gentil 🌸`;
            return `Paciência Doce & Compreensiva 💖`;
        case 'autoestima':
            if (v === 1) return `Autocrítica / Borocochô 🥀`;
            if (v === 2) return `Insegura / Vulnerável 💧`;
            if (v === 3) return `Confortável Consigo Mesma 💃`;
            if (v === 4) return `Bonita, Segura & Forte ✨`;
            return `Deusa / Amor-Próprio Radiante 👑`;
        default:
            return `Nível ${v}`;
    }
};

window.atualizarRotuloBarraSintomas = function(tipo) {
    const rng = document.getElementById(`range-sint-${tipo}`);
    const badge = document.getElementById(`badge-sint-${tipo}`);
    if (rng && badge) {
        badge.textContent = window.obterDescricaoNotaBarraSintomas(tipo, rng.value);
    }
};

window.salvarRegistroSintomaDiario = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const valores = {
        emocional: Math.round(Number(document.getElementById('range-sint-emocional')?.value || '3')),
        fisico: Math.round(Number(document.getElementById('range-sint-fisico')?.value || '3')),
        energia: Math.round(Number(document.getElementById('range-sint-energia')?.value || '3')),
        comunicacao: Math.round(Number(document.getElementById('range-sint-comunicacao')?.value || '3')),
        social: Math.round(Number(document.getElementById('range-sint-social')?.value || '3')),
        pazmental: Math.round(Number(document.getElementById('range-sint-pazmental')?.value || '3')),
        paciencia: Math.round(Number(document.getElementById('range-sint-paciencia')?.value || '3')),
        autoestima: Math.round(Number(document.getElementById('range-sint-autoestima')?.value || '3'))
    };

    const sangrando = false;

    const hojeObj = new Date();
    const hojeStr = hojeObj.getFullYear() + "-" + String(hojeObj.getMonth() + 1).padStart(2, '0') + "-" + String(hojeObj.getDate()).padStart(2, '0');

    const mediaEmocional = ((valores.emocional + valores.paciencia + valores.autoestima) / 3).toFixed(1);
    const mediaFisica = ((valores.fisico + valores.energia + valores.pazmental) / 3).toFixed(1);

    const descHumorTexto = `Emocional: ${valores.emocional}/5, Paciência: ${valores.paciencia}/5, Autoestima: ${valores.autoestima}/5 (Média: ${mediaEmocional})`;
    const descFisicoTexto = `Físico: ${valores.fisico}/5, Energia: ${valores.energia}/5, Paz: ${valores.pazmental}/5, Social: ${valores.social}/5, Fala: ${valores.comunicacao}/5 (Média: ${mediaFisica})`;

    try {
        const payload = {
            usuario_id: usuarioId,
            data_registro: hojeStr,
            humor: descHumorTexto,
            sintoma_fisico: descFisicoTexto,
            sangramento_ativo: sangrando
        };

        const { error } = await supabase.from('saude_sintomas').insert([payload]);

        if (error) {
            window.mostrarToast("Erro ao guardar: " + error.message, "erro");
        } else {
            if (typeof window.mostrarToast === 'function') {
                window.mostrarToast("As 8 dimensões de hoje foram guardadas com sucesso!", "sucesso");
            }
            window.alternarSecaoComoSeSenteHoje();
            await window.carregarHistoricoSintomas();
        }
    } catch (err) { 
        console.error(err); 
    }
};

window.carregarHistoricoSintomas = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const limiteObj = new Date();
    limiteObj.setDate(limiteObj.getDate() - 30);
    const dataLimite = limiteObj.getFullYear() + "-" + String(limiteObj.getMonth() + 1).padStart(2, '0') + "-" + String(limiteObj.getDate()).padStart(2, '0');

    try {
        const { data, error } = await supabase
            .from('saude_sintomas')
            .select('*')
            .eq('usuario_id', usuarioId)
            .gte('data_registro', dataLimite)
            .order('data_registro', { ascending: false });

        if (!error && data) {
            window.dadosSintomasDiarios = data;
            window.renderizarHistoricoSintomas();
        }
    } catch (err) {}
};

function extrairMediaNumericaSintoma(texto, padrao = 3.0) {
    if (!texto) return padrao;
    const match = String(texto).match(/Média:\s*([\d\.]+)/i);
    if (match) {
        let val = parseFloat(match[1]);
        if (val > 5) val = val / 2;
        return val;
    }
    const matchNota = String(texto).match(/Nota\s*(\d+)/i);
    if (matchNota) {
        let val = parseFloat(matchNota[1]);
        if (val > 5) val = val / 2;
        return val;
    }
    return padrao;
}

window.renderizarHistoricoSintomas = function() {
    const container = document.getElementById('container-historico-sintomas-ciclos');
    if (!container) return;

    const lista = window.dadosSintomasDiarios || [];

    if (lista.length === 0) {
        container.innerHTML = `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:18px; padding:14px; text-align:center;">
                <span style="font-size:11.5px; color:#6b21a8; font-weight:600;">Sem registos recentes. Toque em 'Responder' para registar o seu dia.</span>
            </div>
        `;
        return;
    }

    const pontosGrafico = [...lista.slice(0, 10)].reverse();
    let svgGraficoHtml = '';

    if (pontosGrafico.length >= 2) {
        const w = 320;
        const h = 80;
        const pad = 14;
        const dx = (w - (pad * 2)) / Math.max(1, pontosGrafico.length - 1);
        const calcY = (val) => h - pad - (((val - 1) / 4) * (h - (pad * 2)));

        const ptsEmocional = pontosGrafico.map((p, idx) => `${pad + (idx * dx)},${calcY(extrairMediaNumericaSintoma(p.humor, 3.0))}`).join(' ');
        const ptsFisico = pontosGrafico.map((p, idx) => `${pad + (idx * dx)},${calcY(extrairMediaNumericaSintoma(p.sintoma_fisico, 3.0))}`).join(' ');

        svgGraficoHtml = `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:18px; padding:12px 14px; margin-bottom:10px; box-shadow:0 3px 10px rgba(124,58,237,0.04);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11px; font-weight:800; color:#581c87; text-transform:uppercase;">Curva das 8 Dimensões</span>
                    <div style="display:flex; gap:10px; font-size:10px; font-weight:800;">
                        <span style="color:#7c3aed;">● Emocional</span>
                        <span style="color:#10b981;">● Vitalidade</span>
                    </div>
                </div>
                <div style="width:100%; height:80px;">
                    <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
                        <line x1="${pad}" y1="${calcY(3)}" x2="${w - pad}" y2="${calcY(3)}" stroke="#d8b4fe" stroke-dasharray="3,3" stroke-width="1" />
                        <polyline fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsEmocional}" />
                        <polyline fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsFisico}" />
                        ${pontosGrafico.map((p, idx) => `
                            <circle cx="${pad + (idx * dx)}" cy="${calcY(extrairMediaNumericaSintoma(p.humor, 3.0))}" r="3" fill="#7c3aed" />
                            <circle cx="${pad + (idx * dx)}" cy="${calcY(extrairMediaNumericaSintoma(p.sintoma_fisico, 3.0))}" r="3" fill="#10b981" />
                        `).join('')}
                    </svg>
                </div>
            </div>
        `;
    }

    const htmlLista = lista.map(reg => {
        const partesData = reg.data_registro.split('-');
        const dataFormatada = `${partesData[2]}/${partesData[1]}`;
        const humorTxt = reg.humor || '-';
        const fisicoTxt = reg.sintoma_fisico || '-';
        const gota = reg.sangramento_ativo ? ' • 🩸 Sangramento Ativo' : '';

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(88,28,135,0.03);">
                <div style="display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; margin-right:8px;">
                    <strong style="font-size:12px; color:#3b0764;">${dataFormatada}${gota}</strong>
                    <span style="font-size:11px; color:#581c87; font-weight:600; line-height:1.35;">${humorTxt}</span>
                    <span style="font-size:10.5px; color:#047857; font-weight:600; line-height:1.35;">${fisicoTxt}</span>
                </div>
                <button type="button" style="background:#fef2f2; border:1px solid #fecaca; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="window.excluirRegistroSintoma('${reg.id}')" title="Excluir">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${svgGraficoHtml}
        <h4 style="font-size:12px; color:#581c87; margin:6px 0 8px 2px; text-transform:uppercase; font-weight:800;">Histórico dos Registos Diários</h4>
        ${htmlLista}
    `;
};

window.excluirRegistroSintoma = async function(idSintoma) {
    const supabase = obterClienteSupabaseSeguro();
    if (!supabase || !idSintoma) return;

    if (!confirm("Deseja mesmo eliminar este registo diário?")) return;

    try {
        const { error } = await supabase.from('saude_sintomas').delete().eq('id', idSintoma);
        if (!error) {
            window.mostrarToast("Registo removido com sucesso!", "sucesso");
            await window.carregarHistoricoSintomas();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 7. DIÁRIO DA ALMA: LIVRO DE MEMÓRIAS EM PAPEL RÚSTICO PAGINADO
// =========================================================================

let capituloDiarioEmLeituraAtual = null;
let indicePaginaLeituraAtual = 0;
let listaPaginasLeitura = [];

