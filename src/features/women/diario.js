/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.abrirPaginaDiario = function(id = '', titulo = '', conteudoCompleto = '', tipoFonte = 'cursiva', metaSalva = null) {
    const vistaPrincipal = document.getElementById('vista-principal-espaco-mulher');
    const vistaDiario = document.getElementById('vista-pagina-diario-mulher');

    if (vistaPrincipal && vistaDiario) {
        vistaPrincipal.classList.add('oculto');
        vistaDiario.classList.remove('oculto');

        document.getElementById('diario-id-edit').value = id;
        document.getElementById('diario-titulo').value = titulo || '';

        let textoLimpo = conteudoCompleto || '';
        let meta = metaSalva || { fisico: 7, humor: "Feliz" };

        const regexMeta = /<!--suiri_meta:(\{.*?\})-->/;
        const matchMeta = textoLimpo.match(regexMeta);
        if (matchMeta) {
            try {
                meta = JSON.parse(matchMeta[1]);
                textoLimpo = textoLimpo.replace(regexMeta, '').trim();
            } catch (e) {}
        }

        const rngFisico = document.getElementById('range-termo-fisico-diario');
        if (rngFisico) {
            rngFisico.value = meta.fisico !== undefined ? meta.fisico : 7;
            window.atualizarRotuloTermoFisicoDiario(rngFisico.value);
        }

        const humorParaAtivar = meta.humor || "Feliz";
        const btnHumor = document.querySelector(`.btn-humor-diario-opcao[data-humor="${humorParaAtivar}"]`);
        if (btnHumor) {
            window.selecionarHumorDiario(btnHumor);
        } else {
            window.humorDiarioSelecionadoAtual = humorParaAtivar;
        }

        if (textoLimpo.includes('<!--suiri_page_break-->')) {
            window.paginasDiarioAtuais = textoLimpo.split('<!--suiri_page_break-->');
        } else if (textoLimpo) {
            window.paginasDiarioAtuais = [textoLimpo];
        } else {
            window.paginasDiarioAtuais = [""];
        }

        window.indicePaginaDiarioAtual = 0;
        window.atualizarVisorPaginaDiario();
        window.mudarEstiloFonteDiario(tipoFonte);
    }
};

window.fecharPaginaDiario = function() {
    const vistaPrincipal = document.getElementById('vista-principal-espaco-mulher');
    const vistaDiario = document.getElementById('vista-pagina-diario-mulher');

    if (vistaPrincipal && vistaDiario) {
        vistaDiario.classList.add('oculto');
        vistaPrincipal.classList.remove('oculto');
    }
};

window.atualizarVisorPaginaDiario = function() {
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    const elIndicador = document.getElementById('indicador-pagina-diario-atual');

    if (txtArea) {
        txtArea.value = window.paginasDiarioAtuais[window.indicePaginaDiarioAtual] || '';
    }

    if (elIndicador) {
        elIndicador.textContent = `Página ${window.indicePaginaDiarioAtual + 1} de ${window.paginasDiarioAtuais.length}`;
    }
};

window.salvarTextoPaginaAtualEmMemoria = function() {
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    if (txtArea) {
        window.paginasDiarioAtuais[window.indicePaginaDiarioAtual] = txtArea.value;
    }
};

window.adicionarNovaPaginaAoDiario = function() {
    window.salvarTextoPaginaAtualEmMemoria();
    window.paginasDiarioAtuais.push("");
    window.indicePaginaDiarioAtual = window.paginasDiarioAtuais.length - 1;
    window.atualizarVisorPaginaDiario();
    document.getElementById('diario-conteudo-pagina-ativa')?.focus();
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(`Nova folha aberta (Página ${window.indicePaginaDiarioAtual + 1})`, "info");
    }
};

window.navegarPaginaDiario = function(direcao) {
    window.salvarTextoPaginaAtualEmMemoria();
    const novoIndex = window.indicePaginaDiarioAtual + direcao;

    if (novoIndex >= 0 && novoIndex < window.paginasDiarioAtuais.length) {
        window.indicePaginaDiarioAtual = novoIndex;
        window.atualizarVisorPaginaDiario();
    } else if (novoIndex >= window.paginasDiarioAtuais.length) {
        const textoAtual = window.paginasDiarioAtuais[window.indicePaginaDiarioAtual]?.trim();
        if (textoAtual.length > 0) {
            window.adicionarNovaPaginaAoDiario();
        }
    }
};

window.monitorarLimiteLinhasPagina = function(textarea) {
    const linhas = textarea.value.split('\n');
    if (linhas.length > 18) {
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Fim da folha alcançado. Toque em '+ Nova Folha' para virar a página.", "info");
        }
    }
};

window.mudarEstiloFonteDiario = function(tipo) {
    const inputTipo = document.getElementById('diario-tipo-fonte');
    const txtArea = document.getElementById('diario-conteudo-pagina-ativa');
    const btnCursiva = document.getElementById('btn-fonte-cursiva');
    const btnForma = document.getElementById('btn-fonte-forma');

    if (inputTipo) inputTipo.value = tipo;

    if (tipo === 'cursiva') {
        if (txtArea) {
            txtArea.style.fontFamily = "'Alex Brush', 'Great Vibes', cursive";
            txtArea.style.fontSize = "20px";
            txtArea.style.lineHeight = "34px";
            txtArea.style.fontStyle = "normal";
        }
        if (btnCursiva) { btnCursiva.style.background = '#7c3aed'; btnCursiva.style.color = '#fff'; btnCursiva.style.border = 'none'; }
        if (btnForma) { btnForma.style.background = '#fff'; btnForma.style.color = '#5c4426'; btnForma.style.border = '1px solid #d5c3a5'; }
    } else {
        if (txtArea) {
            txtArea.style.fontFamily = "'Segoe UI', sans-serif";
            txtArea.style.fontSize = "14.5px";
            txtArea.style.lineHeight = "34px";
            txtArea.style.fontStyle = "normal";
        }
        if (btnForma) { btnForma.style.background = '#7c3aed'; btnForma.style.color = '#fff'; btnForma.style.border = 'none'; }
        if (btnCursiva) { btnCursiva.style.background = '#fff'; btnCursiva.style.color = '#5c4426'; btnCursiva.style.border = '1px solid #d5c3a5'; }
    }
};

window.salvarPaginaDiarioCompleta = async function() {
    window.salvarTextoPaginaAtualEmMemoria();

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    
    const id = document.getElementById('diario-id-edit')?.value;
    const titulo = document.getElementById('diario-titulo')?.value?.trim();
    const tipoFonte = document.getElementById('diario-tipo-fonte')?.value || 'cursiva';

    const vFisico = Math.round(Number(document.getElementById('range-termo-fisico-diario')?.value || '7'));
    const vHumor = window.humorDiarioSelecionadoAtual || 'Feliz';

    const paginasFiltradas = window.paginasDiarioAtuais.filter((p, idx) => idx === 0 || p.trim().length > 0);
    let conteudoBase = paginasFiltradas.join('<!--suiri_page_break-->');

    if (!supabase || !usuarioId) return;
    if (!conteudoBase || !conteudoBase.trim()) {
        return typeof window.mostrarToast === 'function' ? window.mostrarToast("Escreva algo na folha do diário.", "erro") : alert("Escreva algo.");
    }

    const metaTag = `<!--suiri_meta:${JSON.stringify({ fisico: vFisico, humor: vHumor, txtFisico: window.obterDescricaoTermoFisicoDiario(vFisico) })}-->`;
    const conteudoCompleto = metaTag + '\n' + conteudoBase;

    try {
        const payload = {
            usuario_id: usuarioId,
            titulo: titulo || 'Pensamento do Dia',
            conteudo: conteudoCompleto,
            data_registro: Suiri.today(),
            tipo_fonte: tipoFonte
        };

        let error;
        if (id) {
            const res = await supabase.from('saude_diario').update(payload).eq('id', id);
            error = res.error;
        } else {
            const res = await supabase.from('saude_diario').insert([payload]);
            error = res.error;
        }

        if (error) {
            window.mostrarToast("Erro ao guardar no diário: " + error.message, "erro");
        } else {
            window.mostrarToast("Capítulo guardado com carinho no seu livro de memórias!", "sucesso");
            window.fecharPaginaDiario();
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

window.carregarDiarioMulher = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    const container = document.getElementById('container-lista-diario-mulher');
    if (!supabase || !usuarioId || !container) return;

    try {
        const { data, error } = await supabase
            .from('saude_diario')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('criado_em', { ascending: false });

        if (!error && data) {
            window.dadosDiarioMulher = data;
            if (data.length === 0) {
                container.innerHTML = '<span style="font-size:11.5px; color:#78593a; font-style:italic;">Nenhum capítulo gravado ainda. Comece a sua primeira folha de memórias!</span>';
                return;
            }

            container.innerHTML = data.map(item => {
                const partes = String(item.data_registro || item.criado_em?.slice(0,10) || Suiri.today()).split('-');
                const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                
                let textoLimpo = item.conteudo || '';
                let meta = { fisico: 7, humor: 'Feliz', txtFisico: 'Mulherão 💃' };

                const matchMeta = textoLimpo.match(/<!--suiri_meta:(\{.*?\})-->/);
                if (matchMeta) {
                    try {
                        meta = JSON.parse(matchMeta[1]);
                        textoLimpo = textoLimpo.replace(/<!--suiri_meta:(\{.*?\})-->/, '').trim();
                    } catch (e) {}
                }

                const paginas = textoLimpo.includes('<!--suiri_page_break-->') 
                    ? textoLimpo.split('<!--suiri_page_break-->') 
                    : [textoLimpo];

                const primeiraPagina = paginas[0] || '';
                const resumo = primeiraPagina.length > 110 ? primeiraPagina.substring(0, 110) + '...' : primeiraPagina;
                const estiloFonte = item.tipo_fonte === 'cursiva' ? "font-family:'Alex Brush', 'Great Vibes', cursive; font-size:18px;" : "font-family:'Segoe UI', sans-serif; font-size:12.5px;";

                const descFisicaCurta = meta.fisico <= 3 ? 'Borocochô 🥀' : (meta.fisico <= 7 ? 'Mulherão 💃' : 'Deusa ✨');

                return `
                    <div style="background:#fbf5e8; border:1.5px solid #d5c3a5; border-radius:16px; padding:14px 16px; box-shadow:0 3px 10px rgba(78,52,24,0.06); position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-bottom:1px dashed #d8c6aa; padding-bottom:6px;">
                            <strong style="font-size:14px; color:#3c2a1a; font-family:'Playfair Display', serif;">${esc(item.titulo || 'Pensamento do Dia')}</strong>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:10px; font-weight:800; background:#f0e4cd; color:#5c4426; padding:2px 6px; border-radius:6px;">${paginas.length} folha${paginas.length > 1 ? 's' : ''}</span>
                                <span style="font-size:11px; color:#78593a; font-weight:700;">${dataFormatada}</span>
                            </div>
                        </div>

                        <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
                            <span style="font-size:10px; font-weight:800; background:#ede3ce; color:#5c4426; padding:2px 7px; border-radius:6px; border:1px solid #d5c3a5;">
                                ${descFisicaCurta}
                            </span>
                            <span style="font-size:10px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:2px 7px; border-radius:6px; border:1px solid #d8b4fe;">
                                Humor: ${esc(meta.humor || 'Feliz')}
                            </span>
                        </div>

                        <p style="color:#2c1f14; margin:0 0 10px 0; line-height:1.45; ${estiloFonte} white-space:pre-wrap;">"${esc(resumo)}"</p>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" style="background:#7c3aed; border:none; color:#ffffff; padding:6px 14px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer;" onclick="window.abrirLeitorCapituloDiario('${item.id}')">📖 Abrir Livro</button>
                            <div style="display:flex; gap:6px;">
                                <button type="button" style="background:#fef2f2; border:1px solid #fecaca; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="window.excluirPaginaDiario('${item.id}')" title="Excluir">
                                    <img src="assets/icons-modern/icone-lixo.svg" alt="Excluir" style="width:16px; height:16px; object-fit:contain;">
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Erro ao carregar diário:", err);
    }
};

window.abrirLeitorCapituloDiario = function(idCapitulo) {
    const item = window.dadosDiarioMulher.find(d => d.id === idCapitulo);
    if (!item) return;

    capituloDiarioEmLeituraAtual = item;
    
    let textoLimpo = item.conteudo || '';
    let meta = { fisico: 7, humor: 'Feliz', txtFisico: 'Mulherão 💃' };

    const matchMeta = textoLimpo.match(/<!--suiri_meta:(\{.*?\})-->/);
    if (matchMeta) {
        try {
            meta = JSON.parse(matchMeta[1]);
            textoLimpo = textoLimpo.replace(/<!--suiri_meta:(\{.*?\})-->/, '').trim();
        } catch (e) {}
    }

    listaPaginasLeitura = textoLimpo.includes('<!--suiri_page_break-->') 
        ? textoLimpo.split('<!--suiri_page_break-->') 
        : [textoLimpo];
    indicePaginaLeituraAtual = 0;

    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    const elTitulo = document.getElementById('leitura-titulo-pagina');
    const elData = document.getElementById('leitura-data-pagina');
    const elBadges = document.getElementById('leitura-meta-badges');

    const partes = String(item.data_registro || item.criado_em?.slice(0,10) || Suiri.today()).split('-');
    const dataFmt = `${partes[2]}/${partes[1]}/${partes[0]}`;

    if (elTitulo) elTitulo.textContent = item.titulo || 'Pensamento do Dia';
    if (elData) elData.textContent = dataFmt;

    if (elBadges) {
        const descFisicaCurta = meta.fisico <= 3 ? 'Borocochô 🥀' : (meta.fisico <= 7 ? 'Mulherão 💃' : 'Deusa ✨');
        elBadges.innerHTML = `
            <span style="font-size:10.5px; font-weight:800; background:#ede3ce; color:#5c4426; padding:3px 8px; border-radius:6px; border:1px solid #d5c3a5;">
                Física: ${descFisicaCurta}
            </span>
            <span style="font-size:10.5px; font-weight:800; background:#f3e8ff; color:#7c3aed; padding:3px 8px; border-radius:6px; border:1px solid #d8b4fe;">
                Humor: ${esc(meta.humor || 'Feliz')}
            </span>
        `;
    }

    window.atualizarVisorLeituraPagina();
    if (modalLeitura) modalLeitura.classList.remove('oculto');
};

window.atualizarVisorLeituraPagina = function() {
    const elConteudo = document.getElementById('leitura-conteudo-pagina');
    const elIndicador = document.getElementById('leitura-indicador-pagina');

    if (!capituloDiarioEmLeituraAtual) return;

    const textoPagina = listaPaginasLeitura[indicePaginaLeituraAtual] || '';
    const tipoFonte = capituloDiarioEmLeituraAtual.tipo_fonte || 'cursiva';

    if (elConteudo) {
        elConteudo.textContent = textoPagina;
        elConteudo.style.fontFamily = tipoFonte === 'cursiva' ? "'Alex Brush', 'Great Vibes', cursive" : "'Segoe UI', sans-serif";
        elConteudo.style.fontSize = tipoFonte === 'cursiva' ? "20px" : "14.5px";
    }

    if (elIndicador) {
        elIndicador.textContent = `Página ${indicePaginaLeituraAtual + 1} de ${listaPaginasLeitura.length}`;
    }
};

window.navegarLeituraPagina = function(dir) {
    const novoIdx = indicePaginaLeituraAtual + dir;
    if (novoIdx >= 0 && novoIdx < listaPaginasLeitura.length) {
        indicePaginaLeituraAtual = novoIdx;
        window.atualizarVisorLeituraPagina();
    }
};

window.fecharLeituraDiarioInteira = function() {
    const modalLeitura = document.getElementById('vista-leitura-diario-inteira');
    if (modalLeitura) modalLeitura.classList.add('oculto');
};

window.editarPaginaAtualLeitura = function() {
    if (!capituloDiarioEmLeituraAtual) return;
    const item = capituloDiarioEmLeituraAtual;
    window.fecharLeituraDiarioInteira();
    window.abrirPaginaDiario(item.id, item.titulo, item.conteudo, item.tipo_fonte || 'cursiva');
};

window.excluirPaginaDiario = async function(idDiario) {
    const supabase = obterClienteSupabaseSeguro();
    if (!supabase || !idDiario) return;

    if (!confirm("Deseja mesmo apagar este capítulo de memórias?")) return;

    try {
        const { error } = await supabase.from('saude_diario').delete().eq('id', idDiario);
        if (!error) {
            window.mostrarToast("Capítulo removido com sucesso!", "sucesso");
            await window.carregarDiarioMulher();
        }
    } catch (err) { console.error(err); }
};

// =========================================================================
// 8. MINUTO ZEN (VÍDEO ZEN.MP4 TELA CHEIA) E MODO ALÍVIO
// =========================================================================

