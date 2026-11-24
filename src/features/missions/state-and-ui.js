/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
// =========================================================================
// SUIRI GESTÃO FAMILIAR - APP-OPERACIONAL.JS (100% COMPLETO E INTEGRAL)
// Missões com Linhas Sutis, Warm Tech e Sem Janelas Duplas,
// Ícones Puros Empilhados (icone-check.png em cima e icone-xis.png em baixo),
// Subitens Despoluídos, Realtime, Fotinhas Cooperativas, Emojis Puros,
// Mesada Gamificada, Mural de Recados, Cofres Compartilhados e Voz.
// Integrado com o Catálogo de Ícones PNG Transparentes (./icone/)
// =========================================================================

let cacheMissoes = [];
let versaoCarregamentoMissoes = 0;
let filtroMissoesAtivo = 'todas';
let reconhecimentoVoz = null;
let canalRealtimeMissoes = null;
let canalRealtimeRecados = null;
let instanciaGraficoMesAnterior = null;
window.cofresCompartilhadosLista = [];
window.recadosLarLista = [];
window.metasAnuaisLista = [];

const ICONE_FALLBACK = `⭐`;

// Resgate de ícones seguros apontando para os arquivos PNG locais
function obterIconeSeguro(chave) {
    if (!chave) return ICONE_FALLBACK;
    
    const mapaIconesPng = {
        'check': `<img src="assets/icons-modern/icone-check.svg" alt="Check" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; display:block;">`,
        'xis': `<img src="assets/icons-modern/icone-xis.svg" alt="Xis" style="width:20px; height:20px; object-fit:contain; vertical-align:middle; display:block;">`,
        'joinha': `<img src="assets/icons-modern/icone-joinha.svg" alt="Fiz" style="width:18px; height:18px; object-fit:contain; vertical-align:middle;">`,
        'joinhaInvertido': `<img src="assets/icons-modern/icone-joinha-baixo.svg" alt="Não Fiz" style="width:18px; height:18px; object-fit:contain; vertical-align:middle;">`,
        'relogio': `<img src="assets/icons-modern/icone-relogio.svg" alt="Horário" style="width:13px; height:13px; object-fit:contain; vertical-align:middle;">`,
        'editar': `<img src="assets/icons-modern/icone-editar.svg" alt="Editar" style="width:13px; height:13px; object-fit:contain; vertical-align:middle;">`,
        'excluir': `<img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:13px; height:13px; object-fit:contain; vertical-align:middle;">`,
        'moeda': `<img src="assets/icons-modern/icone-carteira.svg" alt="XP" style="width:14px; height:14px; object-fit:contain; vertical-align:middle;">`,
        'trofeu': `<img src="assets/icons-modern/icone-loja.svg" alt="Troféu" style="width:20px; height:20px; object-fit:contain; vertical-align:middle;">`
    };

    if (mapaIconesPng[chave]) {
        return mapaIconesPng[chave];
    }
    
    if (String(chave).length <= 5) {
        return `<div style="font-size: inherit; line-height: 1; display:flex; align-items:center; justify-content:center;">${chave}</div>`;
    }
    return ICONE_FALLBACK;
}

function obterPrimeiroNomeSeguro(nomeCompleto, padrao = 'Familiar') {
    const str = String(nomeCompleto || '').trim();
    if (!str) return padrao;
    return str.split(' ')[0] || padrao;
}



function ehAdministrador() {
    return window.perfilAtual?.papel === 'adm' || window.perfilAtual?.papel === 'admin_familia';
}

window.dispararParticulasSucesso = function() {
    try {
        if (navigator.vibrate) navigator.vibrate(40);
    } catch (e) {}

    const cores = ['#10b981', '#f97316', '#38bdf8', '#ec4899', '#fde047'];
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particula-confete-suiri';
        const cor = cores[i % cores.length];
        const angulo = (Math.PI * 2 * i) / 18;
        const distancia = 55 + Math.random() * 65;
        const tx = Math.cos(angulo) * distancia;
        const ty = Math.sin(angulo) * distancia - 30;

        p.style.backgroundColor = cor;
        p.style.left = '50%';
        p.style.top = '45%';
        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 900);
    }
};

// =========================================================================
// INJEÇÃO DINÂMICA DE ALFINETES PARA O MÓDULO "MEU ESPAÇO" (COM ÍCONE PNG)
// =========================================================================
window.injetarPinosNosModais = function() {
    const imgPinHtml = `<img src="assets/icons-modern/icone-alfinete.svg" alt="Fixar" style="width:16px; height:16px; object-fit:contain; vertical-align:middle;">`;

    // 1. Missões
    const headerMissoes = document.getElementById('container-botoes-filtro-missoes');
    if (headerMissoes && !document.getElementById('pin-widget-missoes')) {
        const btnPin = document.createElement('button');
        btnPin.id = 'pin-widget-missoes';
        btnPin.className = 'btn-secundario';
        btnPin.style.cssText = 'padding:9px 12px; border-radius:12px; margin-left:6px; flex: 0 0 auto; display:flex; align-items:center; justify-content:center; border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar painel de Missões no Meu Espaço";
        btnPin.onclick = () => { if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('secao-inicio', 'Painel de Missões'); };
        headerMissoes.appendChild(btnPin);
    }

    // 2. Mural de Recados e Finanças
    const headerRecados = document.getElementById('lbl-titulo-mural-recados');
    if (headerRecados && !document.getElementById('pin-widget-recados')) {
        const btnPin = document.createElement('span');
        btnPin.id = 'pin-widget-recados';
        btnPin.style.cssText = 'cursor:pointer; margin-left:8px; display:inline-flex; align-items:center; vertical-align: middle; transition: transform 0.15s ease;';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar Mural de Recados no Meu Espaço";
        btnPin.onclick = (e) => { e.stopPropagation(); if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('bloco-card-mural-recados', 'Mural de Avisos'); };
        headerRecados.parentNode.insertBefore(btnPin, headerRecados.nextSibling);
    }

    // 3. Calendário (Agenda)
    const headerCalendario = document.getElementById('mes-ano-calendario-titulo');
    if (headerCalendario && !document.getElementById('pin-widget-calendario')) {
        const btnPin = document.createElement('span');
        btnPin.id = 'pin-widget-calendario';
        btnPin.style.cssText = 'cursor:pointer; margin-left:8px; display:inline-flex; align-items:center; vertical-align: middle; transition: transform 0.15s ease;';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar Calendário no Meu Espaço";
        btnPin.onclick = (e) => { e.stopPropagation(); if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('secao-calendario', 'Calendário da Casa'); };
        headerCalendario.appendChild(btnPin);
    }

    // 4. Saldo (Minha Carteira)
    const tituloCarteira = document.querySelector('.carteira-titulo');
    if (tituloCarteira && !document.getElementById('pin-widget-carteira')) {
        const btnPin = document.createElement('button');
        btnPin.id = 'pin-widget-carteira';
        btnPin.type = 'button';
        btnPin.setAttribute('aria-label', 'Fixar saldo no Meu Espaço');
        btnPin.innerHTML = imgPinHtml;
        btnPin.onclick = () => window.alfinetarWidgetArea?.('box-carteira-topo', 'Minha Carteira (Saldo)');
        tituloCarteira.appendChild(btnPin);
    }

    // 5. Registro Rápido de Finanças
    const headerRegRapido = document.querySelector('#card-registro-rapido-financas h3');
    if (headerRegRapido && !document.getElementById('pin-widget-registro-rapido')) {
        const btnPin = document.createElement('span');
        btnPin.id = 'pin-widget-registro-rapido';
        btnPin.style.cssText = 'cursor:pointer; margin-left:8px; display:inline-flex; align-items:center; vertical-align: middle; transition: transform 0.15s ease;';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar Lançamento Rápido no Meu Espaço";
        btnPin.onclick = (e) => { e.stopPropagation(); if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('card-registro-rapido-financas', 'Lançamento de Gastos'); };
        headerRegRapido.appendChild(btnPin);
    }

    // 6. Supermercado
    const btnAbaLista = document.getElementById('btn-aba-lista-mes');
    if (btnAbaLista && btnAbaLista.parentNode && !document.getElementById('pin-widget-mercado')) {
        const btnPin = document.createElement('button');
        btnPin.id = 'pin-widget-mercado';
        btnPin.className = 'btn-secundario';
        btnPin.style.cssText = 'padding: 6px 12px; border-radius: 12px; flex: 0 0 auto; margin-left: 4px; display:flex; align-items:center; justify-content:center; border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar Mercado no Meu Espaço";
        btnPin.onclick = (e) => { e.stopPropagation(); if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('secao-mercado', 'Supermercado'); };
        btnAbaLista.parentNode.appendChild(btnPin);
    }
    
    // 7. Metas do Ano
    const spanMetas = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('Planos & Metas do Ano'));
    if (spanMetas && spanMetas.parentElement && !document.getElementById('pin-widget-metas')) {
        const btnPin = document.createElement('span');
        btnPin.id = 'pin-widget-metas';
        btnPin.style.cssText = 'cursor:pointer; margin-left:8px; display:inline-flex; align-items:center; vertical-align: middle; transition: transform 0.15s ease;';
        btnPin.innerHTML = imgPinHtml;
        btnPin.title = "Fixar Metas do Ano no Meu Espaço";
        btnPin.onclick = (e) => { e.stopPropagation(); if(window.alfinetarWidgetArea) window.alfinetarWidgetArea('modal-metas-anuais', 'Planos & Metas do Ano'); };
        spanMetas.parentElement.appendChild(btnPin);
    }
};

// =========================================================================
// 1. INICIALIZAÇÃO E ESCUTA EM TEMPO REAL
// =========================================================================


function ehMissaoPessoalSuiri(m) {
    return ['pessoal', 'individual'].includes(String(m.escopo || '').trim().toLowerCase());
}

function responsavelMissaoSuiri(m) {
    return ehMissaoPessoalSuiri(m) ? m.criado_por || m.atribuido_a : m.atribuido_a;
}

window.audienciaMissaoSuiri = function(m) {
    const scope=String(m.escopo||'').trim().toLowerCase();
    const assigned=String(m.atribuido_a||'').trim().toLowerCase();
    const child=(window.listaMembrosFamilia||[]).find(p=>p.id===m.atribuido_a);
    if(ehMissaoPessoalSuiri(m))return 'individual';
    if(m.destinatario_kids==='todos_kids'||assigned==='todos_kids'||['kids','todos_kids'].includes(scope))return 'kids';
    if(child&&(child.eh_kids===true||child.papel==='dependente'))return 'kids-individual';
    if((!assigned||['todos','todos_adultos','casa','familia'].includes(assigned))&&['','casa','todos','todos_adultos','familia'].includes(scope))return 'adultos';
    return 'individual';
};
window.normalizarMissaoColetivaSuiri = function(m) {
    const item={...m},tipo=window.audienciaMissaoSuiri(m);
    if(tipo==='adultos'){item.escopo='casa';item.atribuido_a=null;}
    if(tipo==='kids'&&(!item.atribuido_a||String(item.atribuido_a).trim().toLowerCase()==='todos_kids')){item.escopo='kids';item.destinatario_kids='todos_kids';item.atribuido_a=null;}
    return item;
};

function missaoVisivelNoPainelAdulto(m, perfilId = obterUsuarioId()) {
    if (!perfilId) return false;
    const audiencia = window.audienciaMissaoSuiri(m);
    return audiencia === 'adultos' || (audiencia === 'individual' && responsavelMissaoSuiri(m) === perfilId);
}

function missaoVisivelNoPainelKids(m, perfilId = obterUsuarioId()) {
    if (!perfilId) return false;
    const audiencia = window.audienciaMissaoSuiri(m);
    if (audiencia === 'kids') return !m.atribuido_a || m.atribuido_a === 'todos_kids' || m.atribuido_a === perfilId;
    return audiencia !== 'adultos' && responsavelMissaoSuiri(m) === perfilId;
}

function podeOperarMissaoSuiri(m, perfil = window.perfilAtual) {
    if (!perfil?.id || String(perfil.permissoes?.missoes).toLowerCase() === 'false') return false;
    if (ehMissaoPessoalSuiri(m)) return responsavelMissaoSuiri(m) === perfil.id &&
        (!window.usuarioAtual?.id || window.usuarioAtual.id === perfil.id);
    if (m.atribuido_a && m.atribuido_a !== perfil.id) return false;
    return perfil.eh_kids || perfil.papel === 'dependente'
        ? missaoVisivelNoPainelKids(m, perfil.id)
        : missaoVisivelNoPainelAdulto(m, perfil.id);
}


const funcoesDeMissaoSuiri = {
    complete: 'concluirMissaoDomestica',
    partial: 'concluirMissaoParcialSuiri',
    fail: 'falharMissaoDomestica',
    reopen: 'reabrirMissaoDomestica'
};

document.addEventListener('click', async event => {
    const botao = event.target.closest?.('button[data-missao-acao][data-missao-id]');
    if (!botao || botao.disabled || !Object.hasOwn(funcoesDeMissaoSuiri, botao.dataset.missaoAcao)) return;
    const perfil = obterUsuarioId();
    const status = botao.closest('#tela-kids-exclusiva, #secao-inicio, #secao-meuespaco')
        ?.querySelector('[data-missao-status]');
    const informar = mensagem => {
        if (!status || perfil !== obterUsuarioId()) return;
        status.textContent = mensagem;
        status.hidden = !mensagem;
    };

    const acao = window[funcoesDeMissaoSuiri[botao.dataset.missaoAcao]];
    if (typeof acao !== 'function') {
        informar('As ações das missões ainda não carregaram. Reabra o site e tente novamente.');
        return;
    }

    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    try {
        await acao(botao.dataset.missaoId, informar);
    } finally {
        botao.disabled = false;
        botao.removeAttribute('aria-busy');
    }
}, true);
