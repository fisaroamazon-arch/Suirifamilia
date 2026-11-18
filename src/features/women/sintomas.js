/* Como se sente hoje e histórico de bem-estar. */
const camposSintomas = {
    emocional: 'Emocional', fisico: 'Físico', energia: 'Energia', comunicacao: 'Fala',
    social: 'Social', pazmental: 'Paz', paciencia: 'Paciência', autoestima: 'Autoestima'
};
let versaoHistoricoSintomas = 0;

window.alternarSecaoComoSeSenteHoje = function() {
    const bloco = document.getElementById('bloco-corpo-sintomas-retratil');
    const btn = document.getElementById('btn-toggle-sintomas-bloco');
    if (!bloco) return;

    bloco.classList.toggle('oculto');
    if (!bloco.classList.contains('oculto')) {
        const hoje = registroSintomasPorDia().get(Suiri.today());
        const notas = `${hoje?.humor || ''} ${hoje?.sintoma_fisico || ''}`;
        for (const [campo, rotulo] of Object.entries(camposSintomas)) {
            const input = document.getElementById(`range-sint-${campo}`);
            const nota = notas.match(new RegExp(`${rotulo}: ([1-5])/5`));
            if (!input) continue;
            input.value = nota?.[1] || '3';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    btn?.setAttribute('aria-expanded', String(!bloco.classList.contains('oculto')));
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

    const valores = Object.fromEntries(Object.keys(camposSintomas).map(campo => [
        campo, Math.round(Number(document.getElementById(`range-sint-${campo}`)?.value || '3'))
    ]));

    const botao = document.getElementById('btn-confirmar-sintomas');
    if (!botao || botao.disabled) return;
    const hojeStr = Suiri.today();

    const mediaEmocional = ((valores.emocional + valores.paciencia + valores.autoestima) / 3).toFixed(1);
    const mediaFisica = ((valores.fisico + valores.energia + valores.pazmental) / 3).toFixed(1);

    const descHumorTexto = `Emocional: ${valores.emocional}/5, Paciência: ${valores.paciencia}/5, Autoestima: ${valores.autoestima}/5 (Média: ${mediaEmocional})`;
    const descFisicoTexto = `Físico: ${valores.fisico}/5, Energia: ${valores.energia}/5, Paz: ${valores.pazmental}/5, Social: ${valores.social}/5, Fala: ${valores.comunicacao}/5 (Média: ${mediaFisica})`;

    botao.disabled = true;
    const valoresDoDia = { humor: descHumorTexto, sintoma_fisico: descFisicoTexto };
    const gravar = async () => {
        const filtrarDia = consulta => consulta.eq('usuario_id', usuarioId).eq('data_registro', hojeStr);
        const atualizarDia = () => filtrarDia(supabase.from('saude_sintomas').update(valoresDoDia)).select('*');
        const existentes = Suiri.check(await filtrarDia(supabase.from('saude_sintomas').select('id')).limit(1));
        if (existentes.length) return Suiri.check(await atualizarDia());

        const insercao = await supabase.from('saude_sintomas').insert({
            ...valoresDoDia, usuario_id: usuarioId, data_registro: hojeStr, sangramento_ativo: false
        }).select('*');
        if (insercao.error?.code === '23505') return Suiri.check(await atualizarDia());
        return Suiri.check(insercao, 1);
    };

    try {
        const registros = navigator.locks?.request
            ? await navigator.locks.request(`suiri-sintomas:${usuarioId}:${hojeStr}`, gravar)
            : await gravar();
        if (!registros.length) throw new Error('O banco não confirmou a alteração.');
        if (obterUsuarioIdSeguro() !== usuarioId || !botao.isConnected) return;
        versaoHistoricoSintomas++;
        window.dadosSintomasDiarios = [...registros, ...window.dadosSintomasDiarios.filter(item => item.data_registro !== hojeStr)];
        window.renderizarHistoricoSintomas();
        const bloco = document.getElementById('bloco-corpo-sintomas-retratil');
        if (bloco && !bloco.classList.contains('oculto')) window.alternarSecaoComoSeSenteHoje();
        window.mostrarToast?.('Como você se sente hoje foi confirmado.', 'sucesso');
    } catch (erro) {
        window.mostrarToast?.('Erro ao confirmar: ' + erro.message, 'erro');
    } finally {
        botao.disabled = false;
    }
};

function periodoVibeAnterior(hoje) {
    const fim = Suiri.monthDate(hoje, -1);
    // Mantém a comparação dentro do mês anterior nos primeiros dias do mês.
    return { inicio: Suiri.shiftDay(fim, -Math.min(6, Number(fim.slice(8)) - 1)), fim };
}

window.carregarHistoricoSintomas = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    const hoje = Suiri.today();
    const limiteGrafico = Suiri.shiftDay(hoje, -34);
    const { inicio } = periodoVibeAnterior(hoje);
    const dataLimite = inicio < limiteGrafico ? inicio : limiteGrafico;
    const versaoConsulta = ++versaoHistoricoSintomas;

    try {
        const { data, error } = await supabase.from('saude_sintomas')
            .select('*')
            .eq('usuario_id', usuarioId)
            .gte('data_registro', dataLimite)
            .lte('data_registro', hoje)
            .order('data_registro', { ascending: false })
            .order('id', { ascending: false });
        if (obterUsuarioIdSeguro() !== usuarioId || versaoConsulta !== versaoHistoricoSintomas) return;
        if (error || !data) throw new Error(error?.message);
        window.dadosSintomasDiarios = data;
        window.renderizarHistoricoSintomas();
    } catch {
        if (obterUsuarioIdSeguro() === usuarioId && versaoConsulta === versaoHistoricoSintomas && !window.dadosSintomasDiarios.length) {
            const status = document.getElementById('status-historico-sintomas');
            if (status) status.textContent = 'Não foi possível carregar o histórico agora.';
        }
    }
};

function extrairMediaNumericaSintoma(texto, padrao = null) {
    if (!texto) return padrao;
    const match = String(texto).match(/Média:\s*([\d\.]+)/i);
    if (match) {
        let val = parseFloat(match[1]);
        if (val > 5) val = val / 2;
        return val >= 1 && val <= 5 ? val : padrao;
    }
    const matchNota = String(texto).match(/Nota\s*(\d+)/i);
    if (matchNota) {
        let val = parseFloat(matchNota[1]);
        if (val > 5) val = val / 2;
        return val >= 1 && val <= 5 ? val : padrao;
    }
    return padrao;
}

function registroSintomasPorDia() {
    const porDia = new Map();
    for (const item of window.dadosSintomasDiarios || []) {
        const anterior = porDia.get(item.data_registro);
        if (!anterior || (item.created_at || '') > (anterior.created_at || '')) porDia.set(item.data_registro, item);
    }
    return porDia;
}

window.renderizarHistoricoSintomas = function() {
    const container = document.getElementById('container-historico-sintomas-ciclos');
    if (!container) return;

    const hoje = Suiri.today();
    const porDia = registroSintomasPorDia();
    const dias = Array.from({ length: 35 }, (_, index) => Suiri.shiftDay(hoje, index - 34));
    const lista = dias.map(dia => porDia.get(dia)).filter(Boolean).reverse();
    const curvas = [
        { campo: 'humor', label: 'Emocional', color: '#a274eb' },
        { campo: 'sintoma_fisico', label: 'Vitalidade', color: '#32b89a' }
    ];
    const series = curvas.map(curva => ({
        ...curva, values: dias.map(dia => extrairMediaNumericaSintoma(porDia.get(dia)?.[curva.campo]))
    }));
    const { inicio, fim } = periodoVibeAnterior(hoje);
    const registrosAnteriores = [...porDia.values()].filter(reg => reg.data_registro >= inicio && reg.data_registro <= fim);
    const medias = curvas.map(({ campo, label }) => {
        const valores = registrosAnteriores.map(reg => extrairMediaNumericaSintoma(reg[campo])).filter(Number.isFinite);
        if (!valores.length) return '';
        const media = valores.reduce((total, valor) => total + valor, 0) / valores.length;
        return `<span><strong>${label}</strong> ${media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/5</span>`;
    }).filter(Boolean);

    const htmlLista = lista.map(reg => {
        const dataFormatada = Suiri.shortDay(reg.data_registro);
        const humorTxt = reg.humor || '-';
        const fisicoTxt = reg.sintoma_fisico || '-';
        const gota = reg.sangramento_ativo ? ' • 🩸 Sangramento Ativo' : '';

        return `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:14px; padding:11px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(88,28,135,0.03);">
                <div style="display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; margin-right:8px;">
                    <strong style="font-size:12px; color:#3b0764;">${dataFormatada}${gota}</strong>
                    <span style="font-size:11px; color:#581c87; font-weight:600; line-height:1.35;">${esc(humorTxt)}</span>
                    <span style="font-size:10.5px; color:#047857; font-weight:600; line-height:1.35;">${esc(fisicoTxt)}</span>
                </div>
                <button type="button" style="background:#fef2f2; border:1px solid #fecaca; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="window.excluirRegistroSintoma(${Suiri.jsArg(reg.id)})" title="Excluir">
                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="painel-grafico-diario">
            <div class="titulo-grafico-diario">
                <strong>Últimos 35 dias</strong>
                <div class="legenda-grafico-diario">
                    ${curvas.map(({ label, color }) => `<span style="--cor-curva:${color}">${label}</span>`).join('')}
                </div>
            </div>
            ${Suiri.dailyChart(dias, series, 1, 5)}
            <small id="status-historico-sintomas">${lista.length ? `${lista.length} de 35 dias com registro.` : 'Toque em Responder para registrar o seu dia.'}</small>
        </div>
        <section class="painel-grafico-diario" aria-labelledby="titulo-vibe-anterior">
            <strong id="titulo-vibe-anterior">Como era sua vibe na fase anterior?</strong>
            <small>Mesmo período do mês passado · ${inicio === fim ? Suiri.shortDay(fim) : `${Suiri.shortDay(inicio)} a ${Suiri.shortDay(fim)}`}</small>
            ${medias.length ? `<div class="vibe-anterior-medias">${medias.join('')}</div><small>${registrosAnteriores.length} ${registrosAnteriores.length === 1 ? 'dia registrado' : 'dias registrados'}</small>` : '<p>Sem registros comparáveis nesse período.</p>'}
        </section>
        ${lista.length ? `<h4>Histórico dos registros diários</h4>${htmlLista}` : ''}
    `;
    const status = document.getElementById('status-sintomas-hoje');
    if (status) status.textContent = porDia.has(hoje) ? 'Registro de hoje confirmado.' : '';
};

window.excluirRegistroSintoma = async function(idSintoma) {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId || !idSintoma) return;

    if (!confirm("Deseja excluir este registro?")) return;

    try {
        const { error } = await supabase.from('saude_sintomas').delete().eq('usuario_id', usuarioId).eq('id', idSintoma);
        if (!error && obterUsuarioIdSeguro() === usuarioId) {
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

