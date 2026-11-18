/* Suiri Família 7.0 · domínio extraído de app-operacional.js. */
window.contextoIconeAtual = 'nova';
window.abaAtivaSeletorSimbolo = 'emoji';

window.abrirSeletorIconesSVG = function(contexto) {
    window.contextoIconeAtual = contexto; 
    const modal = document.getElementById('modal-seletor-icones-svg');
    if (!modal) return;

    const inputBusca = document.getElementById('input-busca-simbolos');
    if (inputBusca) inputBusca.value = '';

    window.filtrarCatalogoSimbolos('');
    modal.classList.remove('oculto');
};

window.fecharSeletorIconesSVG = function() {
    document.getElementById('modal-seletor-icones-svg')?.classList.add('oculto');
};

window.filtrarCatalogoSimbolos = function(termoOriginal) {
    const termo = (termoOriginal || '').toLowerCase().trim();
    const gridEmoji = document.getElementById('grid-emojis-opcoes');
    const msgVazio = document.getElementById('msg-nenhum-simbolo');

    if (!gridEmoji) return;
    let html = '';
    let totalVisivel = 0;

    const catalogo = window.CatalogoEmojisSuiri || [];
    catalogo.forEach(item => {
        const tags = item.tags.toLowerCase();
        if (!termo || tags.includes(termo)) {
            html += `
                <button type="button" 
                        style="width: 100%; aspect-ratio: 1/1; background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; padding: 4px; box-shadow: 0 1px 3px rgba(15,23,42,0.02); transition: transform 0.14s ease, border-color 0.2s ease;"
                        onclick="window.selecionarEmojiComoSimbolo('${item.emoji}')">
                    ${item.emoji}
                </button>
            `;
            totalVisivel++;
        }
    });

    gridEmoji.innerHTML = html;

    if (msgVazio) {
        if (totalVisivel === 0) msgVazio.classList.remove('oculto');
        else msgVazio.classList.add('oculto');
    }
};

window.selecionarEmojiComoSimbolo = function(emojiCaractere) {
    const inputOculto = document.getElementById(`input-${window.contextoIconeAtual}-missao-icone`);
    const btnPreview = document.getElementById(`btn-icone-${window.contextoIconeAtual}-missao`);
    const spanSvg = document.getElementById(`svg-preview-${window.contextoIconeAtual}-missao`);
    
    if (inputOculto) {
        inputOculto.value = emojiCaractere;
    }
    
    const renderEmoji = `<span style="font-size:32px; line-height:1; user-select:none;">${emojiCaractere}</span>`;
    if (spanSvg) {
        spanSvg.innerHTML = renderEmoji;
    } else if (btnPreview) {
        btnPreview.innerHTML = `<span id="svg-preview-${window.contextoIconeAtual}-missao" style="display:flex; align-items:center; justify-content:center; width:34px; height:34px;">${renderEmoji}</span>`;
    }
    
    window.fecharSeletorIconesSVG();
};

window.selecionarIconeSVG = window.selecionarEmojiComoSimbolo;

// =========================================================================
// 12. MOTOR DE RECONHECIMENTO DE VOZ INTELIGENTE & PARSER FINANCEIRO
// =========================================================================

