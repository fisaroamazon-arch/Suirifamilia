/* Suiri Família 7.0 · domínio extraído de app-saude-mulher.js. */
window.registrarMenstruacaoHojeRapido = function() {
    window.abrirModalRegistroCiclo();
    const dtInicio = document.getElementById('input-data-inicio-ciclo');
    if (dtInicio) {
        const hojeObj = new Date();
        dtInicio.value = hojeObj.getFullYear() + '-' + String(hojeObj.getMonth() + 1).padStart(2, '0') + '-' + String(hojeObj.getDate()).padStart(2, '0');
    }
};

// Carrega os membros familiares cadastrados para o seletor de notificação
window.carregarMembrosSeletorNotificacaoCiclo = function() {
    const select = document.getElementById('select-membro-notificar-ciclo');
    if (!select) return;

    let membros = [];
    try {
        membros = JSON.parse(localStorage.getItem('suiri_membros_familia_cache') || '[]');
        if ((!membros || membros.length === 0) && window.listaMembrosFamilia) {
            membros = window.listaMembrosFamilia;
        }
        if ((!membros || membros.length === 0) && window.listaMembrosCadastrados) {
            membros = window.listaMembrosCadastrados;
        }
    } catch (e) {
        membros = [];
    }

    const usuarioId = obterUsuarioIdSeguro();
    const membrosFiltrados = membros.filter(m => m.id !== usuarioId);
    const valorSalvo = Suiri.storage.getItem('suiri_ciclo_notificar_membro_id') || '';

    let html = `<option value="">🔒 Apenas para mim (Privado)</option>`;
    membrosFiltrados.forEach(m => {
        const nomeMembro = (m.nome || m.nome_completo || 'Familiar').split(' ')[0];
        const parentesco = m.parentesco ? ` (${m.parentesco})` : '';
        const selected = m.id === valorSalvo ? 'selected' : '';
        html += `<option value="${m.id}" ${selected}>👤 ${esc(nomeMembro)}${esc(parentesco)}</option>`;
    });

    select.innerHTML = html;
};

// Dispara mensagem sutil no Mural do Lar (recados_lar) para o familiar escolhido
window.enviarNotificacaoCicloParaMural = async function(faseTexto, chaveFase) {
    const destinatarioId = Suiri.storage.getItem('suiri_ciclo_notificar_membro_id');
    if (!destinatarioId) return;

    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (!supabase || !usuarioId) return;

    let nomeMulher = 'Ela';
    try {
        const raw = localStorage.getItem('suiri_perfil_ativo') || localStorage.getItem('suiri_ultimo_perfil');
        if (raw) {
            const p = JSON.parse(raw);
            if (p && p.nome) nomeMulher = p.nome.split(' ')[0];
        }
    } catch (e) {}

    let mensagem = "";
    if (chaveFase === 'menstrual') {
        mensagem = `🌸 Aviso com carinho: A ${nomeMulher} iniciou a fase menstrual hoje. Um período que pede mais descanso, acolhimento e apoio nas tarefas do lar. ☕`;
    } else if (chaveFase === 'lutea') {
        mensagem = `🧘‍♀️ Aviso com carinho: A ${nomeMulher} entrou na fase lútea (pré-menstrual). Compreensão extra, diálogo sereno e acolhimento fazem toda a diferença hoje. 💖`;
    } else if (chaveFase === 'ovulatoria') {
        mensagem = `✨ Aviso com carinho: A ${nomeMulher} está na fase ovulatória. Vitalidade, boa disposição e energia em alta! 🌸`;
    } else {
        mensagem = `🌿 Aviso com carinho: A ${nomeMulher} entrou na fase folicular. Criatividade e renovação de energia para o lar. 🌱`;
    }

    const hojeStr = Suiri.today();
    const chaveAntiDuplicado = `suiri_aviso_ciclo_${usuarioId}_${chaveFase}_${hojeStr}`;
    if (localStorage.getItem(chaveAntiDuplicado)) return;

    let familiaId = null;
    try {
        const rawP = localStorage.getItem('suiri_perfil_ativo');
        if (rawP) familiaId = JSON.parse(rawP).familia_id || null;
    } catch (e) {}

    try {
        const payload = {
            autor_id: usuarioId,
            destinatario_id: destinatarioId,
            mensagem: mensagem,
            familia_id: familiaId,
            lido_por: []
        };

        const { error } = await supabase.from('recados_lar').insert([payload]);
        if (!error) {
            localStorage.setItem(chaveAntiDuplicado, 'true');
        }
    } catch (err) {
        console.warn("Aviso no mural ignorado ou coluna pendente:", err);
    }
};

// Edição explícita: um registro existente nunca é substituído ao cadastrar um novo.
window.renderizarHistoricoCiclosEdicao = function() {
    const area = document.getElementById('historico-ciclos-edicao');
    if (!area) return;
    const registros = (window.dadosCicloMulher || []).filter(c => c.id != null);
    area.replaceChildren();
    const titulo = document.createElement('div');
    titulo.textContent = 'Histórico de ciclos: editar ou excluir registros';
    titulo.style.cssText = 'font-size:11px;font-weight:800;color:#581c87;margin-bottom:6px';
    area.appendChild(titulo);
    for (const c of registros) {
        const linha = document.createElement('div');
        linha.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px;border-bottom:1px solid #e9d5ff;font-size:11px;color:#581c87';
        const data = document.createElement('span');
        data.textContent = String(c.data_inicio).slice(0,10).split('-').reverse().join('/');
        const botao = document.createElement('button');
        botao.type = 'button'; botao.textContent = 'Editar';
        botao.style.cssText = 'padding:5px 10px;border:1px solid #c084fc;border-radius:8px;background:#faf5ff;color:#581c87;font-weight:800';
        botao.addEventListener('click', () => window.editarCicloHistorico(c.id));
        const excluir = document.createElement('button');
        excluir.type = 'button';
        excluir.textContent = 'Excluir';
        excluir.setAttribute('aria-label', 'Excluir ciclo de ' + data.textContent);
        excluir.style.cssText = 'padding:5px 10px;border:1px solid #fecdd3;border-radius:8px;background:#fff1f2;color:#be123c;font-weight:800';
        excluir.addEventListener('click', () => window.excluirCicloHistorico(c.id));
        const acoes = document.createElement('div');
        acoes.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end';
        acoes.append(botao, excluir);
        linha.append(data,acoes); area.appendChild(linha);
    }
};
window.excluirCicloHistorico = async function(id) {
    const registro = (window.dadosCicloMulher || []).find(c => String(c.id) === String(id));
    if (!registro) return;
    const data = String(registro.data_inicio).slice(0,10).split('-').reverse().join('/');
    if (!window.confirm('Excluir o ciclo de ' + data + '?\\n\\nEsta ação é permanente e recalculará as previsões.')) return;
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    const avisar = (mensagem, tipo) => typeof window.mostrarToast === 'function' ? window.mostrarToast(mensagem, tipo) : alert(mensagem);
    if (!supabase || !usuarioId) return avisar('Sessão indisponível. Entre novamente.', 'erro');
    const area = document.getElementById('historico-ciclos-edicao');
    const botoes = area ? Array.from(area.querySelectorAll('button')) : [];
    botoes.forEach(b => b.disabled = true);
    try {
        const { data: excluidos, error } = await supabase.from('saude_ciclos')
            .delete().eq('usuario_id', usuarioId).eq('id', registro.id).select('id');
        if (error) throw error;
        if (!excluidos || excluidos.length !== 1) {
            throw new Error('O banco não confirmou a exclusão. Verifique a política DELETE da tabela saude_ciclos.');
        }
        if (String(window.cicloEdicaoId) === String(registro.id)) window.novoRegistroCiclo();
        await window.carregarDadosCicloMulher();
        window.renderizarHistoricoCiclosEdicao();
        avisar('Ciclo excluído. Previsões atualizadas.', 'sucesso');
    } catch (erro) {
        console.error('Falha ao excluir ciclo:', erro);
        avisar('Não foi possível excluir: ' + (erro.message || erro), 'erro');
    } finally {
        botoes.forEach(b => b.disabled = false);
    }
};
window.editarCicloHistorico = function(id) {
    const c = (window.dadosCicloMulher || []).find(x => String(x.id) === String(id));
    if (!c) return;
    window.cicloEdicaoId = c.id;
    document.getElementById('input-data-inicio-ciclo').value = String(c.data_inicio).slice(0,10);
    document.getElementById('input-duracao-sangramento').value = c.duracao_sangramento || 5;
    const titulo = document.getElementById('titulo-modal-ciclo');
    if (titulo) titulo.textContent = 'Corrigir ciclo existente';
    const botao = document.getElementById('btn-salvar-ciclo');
    if (botao) botao.textContent = 'Salvar correção';
};
window.novoRegistroCiclo = function() {
    window.cicloEdicaoId = null;
    const titulo = document.getElementById('titulo-modal-ciclo');
    if (titulo) titulo.textContent = 'Registrar nova menstruação';
    const botao = document.getElementById('btn-salvar-ciclo');
    if (botao) botao.textContent = 'Registrar novo ciclo';
};

window.abrirModalRegistroCiclo = function() {
    window.novoRegistroCiclo();
    const modal = document.getElementById('modal-registro-ciclo-mulher');
    if (modal) {
        modal.classList.remove('oculto');
        const dtInicio = document.getElementById('input-data-inicio-ciclo');
        if (dtInicio && !dtInicio.value) {
            const h = new Date();
            dtInicio.value = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
        }

        const inputMedia = document.getElementById('input-duracao-media-ciclo');
        if (inputMedia) {
            inputMedia.value = Suiri.storage.getItem('suiri_ciclo_duracao_media_manual') || '28';
        }

        window.carregarMembrosSeletorNotificacaoCiclo();
        window.renderizarHistoricoCiclosEdicao();
    }
};

window.fecharModalRegistroCiclo = function() {
    const modal = document.getElementById('modal-registro-ciclo-mulher');
    if (modal) modal.classList.add('oculto');
};

window.carregarDadosCicloMulher = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    if (supabase && usuarioId) {
        try {
            const { data, error } = await supabase
                .from('saude_ciclos')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('data_inicio', { ascending: false });

            if (!error && data) window.dadosCicloMulher = data;
        } catch (err) { console.error(err); }
    }
    window.processarEExibirPrevisao();
};

window.atualizarInspiracaoDiaria = function(sortearOutra = false) {
    const elInspiracao = document.getElementById('txt-inspiracao-diaria');
    if (!elInspiracao) return;

    let catalogo = (window.AcervoBemEstarMulher && window.AcervoBemEstarMulher.length > 0)
        ? window.AcervoBemEstarMulher
        : INSPIRACOES_FALLBACK;

    if (!catalogo || catalogo.length === 0) {
        catalogo = INSPIRACOES_FALLBACK;
    }

    if (sortearOutra) {
        const idxSorteio = Math.floor(Math.random() * catalogo.length);
        elInspiracao.innerHTML = catalogo[idxSorteio];
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("Nova inspiração da alma sorteada! 🌸", "info");
        }
    } else {
        const hoje = obterHoje();
        const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
        const diaDoAno = Math.max(0, calcularDiffDias(hoje, inicioAno));
        elInspiracao.innerHTML = catalogo[diaDoAno % catalogo.length];
    }
};

window.processarEExibirPrevisao = function() {
    const elFase = document.getElementById('display-fase-ciclo-atual');
    const elPrevisao = document.getElementById('txt-previsao-proxima-menstruacao');
    const elDataBase = document.getElementById('txt-data-base-calculo');
    const elDica = document.getElementById('txt-dica-diaria-ciclo');
    const elBarra = document.getElementById('barra-progresso-ciclo');
    const elTxtDia = document.getElementById('txt-dia-ciclo-atual');
    const elTxtFinal = document.getElementById('txt-dia-ciclo-final');

    const hoje = obterHoje();
    const inicioAno = criarDataAbsoluta(hoje.getFullYear(), 1, 1);
    const diaDoAno = Math.max(0, calcularDiffDias(hoje, inicioAno));

    window.atualizarInspiracaoDiaria(false);

    const ciclosValidosPassados = (window.dadosCicloMulher || [])
        .filter(c => c.data_inicio && parseData(c.data_inicio).getTime() <= hoje.getTime())
        .sort((a,b) => String(b.data_inicio).localeCompare(String(a.data_inicio)));
    // Registros duplicados da mesma data não devem distorcer a média.
    const datasVistas = new Set();
    const ciclosUnicos = ciclosValidosPassados.filter(c => {
        const data = String(c.data_inicio).slice(0,10);
        if (datasVistas.has(data)) return false;
        datasVistas.add(data); return true;
    });

    if (ciclosValidosPassados.length === 0) {
        if (elFase) elFase.textContent = "Ciclo Natural (Bem-Estar)";
        if (elPrevisao) elPrevisao.textContent = "Toque em '+ Ciclo' ou 'Menstruei hoje' para iniciar.";
        if (elDataBase) elDataBase.textContent = "Sem histórico inicial registado";
        
        let dicaGenerica = "A sua energia e criatividade renovam-se a cada dia. Respeite os seus limites e cuide de si com carinho.";
        if (window.AcervoDicasMulher && window.AcervoDicasMulher.folicular && window.AcervoDicasMulher.folicular.length > 0) {
            dicaGenerica = window.AcervoDicasMulher.folicular[diaDoAno % window.AcervoDicasMulher.folicular.length];
        }
        if (elDica) elDica.textContent = dicaGenerica;
        if (elBarra) elBarra.style.width = "40%";
        if (elTxtDia) elTxtDia.textContent = "Dia 1";
        if (elTxtFinal) elTxtFinal.textContent = "Dia 28";

        window.renderizarRoteiroEstagiosCiclo(1, 28, 5, false);
        return;
    }

    const duracaoManualSalva = parseInt(Suiri.storage.getItem('suiri_ciclo_duracao_media_manual') || '28', 10);
    let mediaCiclo = (duracaoManualSalva >= 20 && duracaoManualSalva <= 45) ? duracaoManualSalva : 28;

    if (ciclosUnicos.length > 1 && !Suiri.storage.getItem('suiri_ciclo_duracao_media_manual')) {
        let somaDias = 0;
        let qtdValidos = 0;
        // Média móvel dos ciclos válidos observados (filtro biológico entre 18 e 50 dias)
        for (let i = 0; i < Math.min(ciclosUnicos.length - 1, 6); i++) {
            const dataAtual = parseData(ciclosUnicos[i].data_inicio);
            const dataAnt = parseData(ciclosUnicos[i+1].data_inicio);
            const diff = calcularDiffDias(dataAtual, dataAnt);
            
            if (diff >= 18 && diff <= 50) {
                somaDias += diff;
                qtdValidos++;
            }
        }
        if (qtdValidos > 0) {
            mediaCiclo = Math.round(somaDias / qtdValidos);
        }
    }

    const ultimoCiclo = ciclosUnicos[0];
    const dataInicioUltimo = parseData(ultimoCiclo.data_inicio);
    const duracaoSangramento = parseInt(ultimoCiclo.duracao_sangramento || 5, 10);

    let diaAtualDoCiclo = calcularDiffDias(hoje, dataInicioUltimo) + 1;
    if (diaAtualDoCiclo < 1) diaAtualDoCiclo = 1;

    const proximaMenstruacao = criarDataAbsoluta(dataInicioUltimo.getFullYear(), dataInicioUltimo.getMonth() + 1, dataInicioUltimo.getDate() + mediaCiclo);
    const diasParaProxima = calcularDiffDias(proximaMenstruacao, hoje);

    const diaOvulacaoEstimado = mediaCiclo - 14; 
    const inicioJanelaFertil = Math.max(duracaoSangramento + 1, diaOvulacaoEstimado - 4);
    const fimJanelaFertil = diaOvulacaoEstimado + 1;

    let faseTexto = "";
    let chaveFase = "";
    let corGradiente = ""; 

    if (diaAtualDoCiclo > mediaCiclo) {
        faseTexto = "Atraso Menstrual";
        chaveFase = "lutea";
        corGradiente = "linear-gradient(90deg, #94a3b8, #64748b)";
    } else if (diaAtualDoCiclo >= 1 && diaAtualDoCiclo <= duracaoSangramento) {
        faseTexto = "Fase Menstrual";
        chaveFase = "menstrual";
        corGradiente = "linear-gradient(90deg, #e11d48, #9f1239)";
    } else if (diaAtualDoCiclo > duracaoSangramento && diaAtualDoCiclo < inicioJanelaFertil) {
        faseTexto = "Fase Folicular";
        chaveFase = "folicular";
        corGradiente = "linear-gradient(90deg, #10b981, #047857)";
    } else if (diaAtualDoCiclo >= inicioJanelaFertil && diaAtualDoCiclo <= fimJanelaFertil) {
        faseTexto = "Fase Ovulatória";
        chaveFase = "ovulatoria";
        corGradiente = "linear-gradient(90deg, #f59e0b, #b45309)";
    } else {
        faseTexto = "Fase Lútea";
        chaveFase = "lutea";
        corGradiente = "linear-gradient(90deg, #a855f7, #6b21a8)";
    }

    if (elFase) elFase.textContent = faseTexto;
    if (elDataBase) elDataBase.textContent = `Ciclo Base: ${formatarDataVisor(dataInicioUltimo)}`;

    if (elPrevisao) {
        if (diasParaProxima > 1) {
            elPrevisao.textContent = `Próxima menstruação prevista em ${diasParaProxima} dias.`;
        } else if (diasParaProxima === 1) {
            elPrevisao.textContent = "Próxima menstruação prevista para amanhã.";
        } else if (diasParaProxima === 0) {
            elPrevisao.textContent = "A menstruação deve descer hoje.";
        } else {
            const diasAtraso = Math.abs(diasParaProxima);
            elPrevisao.textContent = `Ciclo atrasado há ${diasAtraso} dia(s).`;
        }
    }

    if (elDica) {
        let dicaParaMostrar = DICAS_BIOLOGICAS_FALLBACK[chaveFase] || "Respeite o ritmo do seu corpo hoje.";
        if (window.AcervoDicasMulher && window.AcervoDicasMulher[chaveFase] && window.AcervoDicasMulher[chaveFase].length > 0) {
            const catalogoFase = window.AcervoDicasMulher[chaveFase];
            dicaParaMostrar = catalogoFase[diaDoAno % catalogoFase.length];
        }
        elDica.textContent = dicaParaMostrar;
    }

    if (elBarra && elTxtDia && elTxtFinal) {
        let pctProgresso = (diaAtualDoCiclo / mediaCiclo) * 100;
        if (pctProgresso > 100) pctProgresso = 100;
        if (pctProgresso < 0) pctProgresso = 0;
        
        elBarra.style.width = `${pctProgresso}%`;
        elBarra.style.background = corGradiente;
        elTxtDia.textContent = `Dia ${diaAtualDoCiclo}`;
        elTxtFinal.textContent = diaAtualDoCiclo > mediaCiclo ? `Atraso` : `Dia ${mediaCiclo}`;
    }

    // Sincroniza notificação opcional no mural caso a usuária tenha configurado familiar
    if (typeof window.enviarNotificacaoCicloParaMural === 'function') {
        window.enviarNotificacaoCicloParaMural(faseTexto, chaveFase);
    }

    // Renderiza o Roteiro em Linha dos 4 Estágios com a Previsão de Chegada
    window.renderizarRoteiroEstagiosCiclo(diaAtualDoCiclo, mediaCiclo, duracaoSangramento, true);
};

window.renderizarRoteiroEstagiosCiclo = function(diaAtual, mediaCiclo, duracaoSangramento, cicloAtivo) {
    duracaoSangramento = duracaoSangramento || 5;
    mediaCiclo = mediaCiclo || 28;

    diaAtual = Math.max(1, diaAtual);
    
    // Limits
    let fimMenstrual = duracaoSangramento;
    let inicioFolicular = fimMenstrual + 1;
    
    let diaOvulacao = mediaCiclo - 14;
    let inicioOvulacao = diaOvulacao - 2;
    if (inicioOvulacao <= inicioFolicular) {
        inicioOvulacao = inicioFolicular + 1; 
    }
    let fimFolicular = inicioOvulacao - 1;
    let fimOvulacao = inicioOvulacao + 4;
    
    let inicioLutea = fimOvulacao + 1;
    let fimLutea = mediaCiclo;
    if (inicioLutea > fimLutea) {
        inicioLutea = fimLutea; 
    }

    const elSub1 = document.getElementById('sub-estagio-1');
    const elSub2 = document.getElementById('sub-estagio-2');
    const elSub3 = document.getElementById('sub-estagio-3');
    const elSub4 = document.getElementById('sub-estagio-4');

    if (elSub1) elSub1.textContent = `Dia 1-${fimMenstrual}`;
    if (elSub2) elSub2.textContent = `Dia ${inicioFolicular}-${fimFolicular}`;
    if (elSub3) elSub3.textContent = `Dia ${inicioOvulacao}-${fimOvulacao}`;
    if (elSub4) elSub4.textContent = `Dia ${inicioLutea}-${fimLutea}`;

    if (!cicloAtivo) {
        const linha=document.getElementById('linha-progresso-estagios');if(linha)linha.style.width='0%';
        const trilha=document.getElementById('trilha-ciclo');if(trilha){trilha.setAttribute('aria-valuenow','0');trilha.setAttribute('aria-valuetext','Registre o início do ciclo para acompanhar.');}
        const dia=document.getElementById('ciclo-dia-progresso');if(dia)dia.textContent='Registre o início do ciclo';
        document.querySelectorAll('.legenda-fases-ciclo button').forEach(el=>{el.classList.remove('fase-atual','fase-concluida');el.removeAttribute('aria-current');});
        const lblResumo = document.getElementById('lbl-status-estagio-resumo');
        const txtEst = document.getElementById('txt-estimativa-proximo-estagio');
        if (lblResumo) lblResumo.textContent = 'Ciclo Padrão (28 Dias)';
        if (txtEst) txtEst.innerHTML = 'Registe a sua data em <strong>Ciclo</strong> para mapear o seu estágio atual e a previsão em tempo real.';
        return;
    }

    window.estagioCicloAtualDetectado = 1;
    let estagioAtual = 1;
    let nomeEstagioAtual = "Fase Menstrual";
    let proximoEstagioNome = "";
    let diaChegadaProximo = 0;
    let diasParaProximo = 0;

    if (diaAtual < inicioFolicular) {
        estagioAtual = 1;
        nomeEstagioAtual = "Fase Menstrual";
        proximoEstagioNome = "Fase Folicular";
        diaChegadaProximo = inicioFolicular;
        diasParaProximo = diaChegadaProximo - diaAtual;
    } else if (diaAtual < inicioOvulacao) {
        estagioAtual = 2;
        nomeEstagioAtual = "Fase Folicular";
        proximoEstagioNome = "Fase Ovulatória";
        diaChegadaProximo = inicioOvulacao;
        diasParaProximo = diaChegadaProximo - diaAtual;
    } else if (diaAtual < inicioLutea) {
        estagioAtual = 3;
        nomeEstagioAtual = "Fase Ovulatória";
        proximoEstagioNome = "Fase Lútea";
        diaChegadaProximo = inicioLutea;
        diasParaProximo = diaChegadaProximo - diaAtual;
    } else if (diaAtual <= mediaCiclo) {
        estagioAtual = 4;
        nomeEstagioAtual = "Fase Lútea";
        proximoEstagioNome = "Fase Menstrual (Novo Ciclo)";
        diaChegadaProximo = mediaCiclo + 1;
        diasParaProximo = diaChegadaProximo - diaAtual;
    } else {
        estagioAtual = 4;
        nomeEstagioAtual = "Fase Lútea (Atraso)";
        proximoEstagioNome = "Novo Ciclo Menstrual";
        diaChegadaProximo = mediaCiclo + 1;
        diasParaProximo = 0;
    }

    window.estagioCicloAtualDetectado = estagioAtual;

    const progressoLinha = Math.min(100, Math.max(0, diaAtual / mediaCiclo * 100));
    const elLinha = document.getElementById('linha-progresso-estagios');
    if(elLinha)elLinha.style.width=progressoLinha+'%';
    const trilha=document.getElementById('trilha-ciclo');
    if(trilha){trilha.setAttribute('aria-valuenow',String(Math.round(progressoLinha)));trilha.setAttribute('aria-valuetext',`Dia ${diaAtual} de ${mediaCiclo}, ${nomeEstagioAtual}, estimativa`);}
    const diaLabel=document.getElementById('ciclo-dia-progresso');
    if(diaLabel)diaLabel.textContent=diaAtual>mediaCiclo?`Dia ${diaAtual} · além da previsão`:`Dia ${diaAtual} de ${mediaCiclo}`;
    const divisoes=document.getElementById('divisoes-ciclo');
    if(divisoes)divisoes.innerHTML=[inicioFolicular,inicioOvulacao,inicioLutea].map(d=>`<span style="left:${Math.min(100,Math.max(0,(d-1)/mediaCiclo*100))}%"></span>`).join('');
    for(let i=1;i<=4;i++){
        const marco=document.getElementById(`marco-estagio-${i}`);if(!marco)continue;
        marco.classList.toggle('fase-atual',i===estagioAtual);
        marco.classList.toggle('fase-concluida',i<estagioAtual);
        if(i===estagioAtual)marco.setAttribute('aria-current','step');else marco.removeAttribute('aria-current');
    }

    // Atualiza o resumo no topo do cartão
    const lblResumo = document.getElementById('lbl-status-estagio-resumo');
    if (lblResumo) {
        lblResumo.textContent = `Estágio ${estagioAtual} • ${nomeEstagioAtual}`;
    }

    // Atualiza a caixa de estimativa do próximo estágio
    const txtEst = document.getElementById('txt-estimativa-proximo-estagio');
    if (txtEst) {
        if (diasParaProximo <= 0) {
            txtEst.innerHTML = `Transição iminente: a <strong>${proximoEstagioNome}</strong> deve começar hoje ou a qualquer momento.`;
        } else if (diasParaProximo === 1) {
            txtEst.innerHTML = `A <strong>${proximoEstagioNome}</strong> está prevista para começar <strong>amanhã</strong> (por volta do Dia ${diaChegadaProximo} do ciclo).`;
        } else {
            txtEst.innerHTML = `O próximo estágio (<strong>${proximoEstagioNome}</strong>) chega em média no <strong>Dia ${diaChegadaProximo}</strong> — faltam cerca de <strong>${diasParaProximo} dia(s)</strong>.`;
        }
    }

    // Atualiza Painel Biológico: Fertilidade, Libido e Energia
    const badgeFert = document.getElementById('badge-bio-fertilidade');
    const subFert = document.getElementById('sub-bio-fertilidade');
    const badgeLib = document.getElementById('badge-bio-libido');
    const subLib = document.getElementById('sub-bio-libido');
    const badgeEnergia = document.getElementById('badge-bio-energia');
    const subEnergia = document.getElementById('sub-bio-energia');

    let dadosBio = {
        fert: "Mínima",
        subFert: "Pouco propenso",
        corFert: "#be185d",
        lib: "Em recolhimento",
        subLib: "Foco em carinho",
        corLib: "#7c3aed",
        energia: "Bateria Baixa",
        subEnergia: "Repouso & Ninho",
        corEnergia: "#ca8a04"
    };

    if (estagioAtual === 1) { // Menstrual
        dadosBio = {
            fert: "Muito Baixa",
            subFert: "Improvável engravidar",
            corFert: "#9d174d",
            lib: "Introspectiva",
            subLib: "Conforto & Aconchego",
            corLib: "#6b21a8",
            energia: "Bateria Baixa",
            subEnergia: "Repouso & Descanso",
            corEnergia: "#e11d48"
        };
    } else if (estagioAtual === 2) { // Folicular
        dadosBio = {
            fert: "Média-Baixa",
            subFert: "Fertilidade subindo",
            corFert: "#b45309",
            lib: "Despertando",
            subLib: "Energia em ascensão",
            corLib: "#7c3aed",
            energia: "Em Alta ⚡",
            subEnergia: "Criatividade & Pique",
            corEnergia: "#16a34a"
        };
    } else if (estagioAtual === 3) { // Ovulatória
        dadosBio = {
            fert: "PICO MÁXIMO",
            subFert: "Altamente propensa",
            corFert: "#e11d48",
            lib: "Ápice & Fogo 🔥",
            subLib: "Magnetismo no auge",
            corLib: "#c026d3",
            energia: "Radiante / 100%",
            subEnergia: "Força & Vigor Total",
            corEnergia: "#d97706"
        };
    } else { // Lútea
        dadosBio = {
            fert: "Infértil / Baixa",
            subFert: "Pouco propensa",
            corFert: "#64748b",
            lib: "Calma & Suave",
            subLib: "Afeto e conexão serena",
            corLib: "#581c87",
            energia: "Desacelerando",
            subEnergia: "Pede pausas & calma",
            corEnergia: "#64748b"
        };
    }

    if (badgeFert) {
        badgeFert.textContent = dadosBio.fert;
        badgeFert.style.color = dadosBio.corFert;
    }
    if (subFert) subFert.textContent = dadosBio.subFert;
    if (badgeLib) {
        badgeLib.textContent = dadosBio.lib;
        badgeLib.style.color = dadosBio.corLib;
    }
    if (subLib) subLib.textContent = dadosBio.subLib;
    if (badgeEnergia) {
        badgeEnergia.textContent = dadosBio.energia;
        badgeEnergia.style.color = dadosBio.corEnergia;
    }
    if (subEnergia) subEnergia.textContent = dadosBio.subEnergia;

};


// =========================================================================
// MOTOR DO MODAL DE ORIENTAÇÕES E DICAS POR FASE DO CICLO
// =========================================================================
window.estagioModalAtivoAtual = 1;
window.topicoModalAtivoAtual = 'geral';

window.abrirModalOrientacoesFase = function(topico = 'geral', estagioNum = null) {
    let modal = document.getElementById('modal-orientacoes-estagio-fase');
    if (!modal) return;

    if (estagioNum !== null && estagioNum !== undefined) {
        window.estagioModalAtivoAtual = parseInt(estagioNum, 10);
    } else {
        window.estagioModalAtivoAtual = window.estagioCicloAtualDetectado || 1;
    }

    window.topicoModalAtivoAtual = topico || 'geral';
    window.renderizarConteudoModalOrientacoes();
    modal.classList.remove('oculto');
};

window.fecharModalOrientacoesFase = function() {
    const modal = document.getElementById('modal-orientacoes-estagio-fase');
    if (modal) modal.classList.add('oculto');
};

window.trocarFaseModalOrientacoes = function(numFase) {
    window.estagioModalAtivoAtual = numFase;
    window.renderizarConteudoModalOrientacoes();
};

window.trocarTopicoModalOrientacoes = function(topico) {
    window.topicoModalAtivoAtual = topico;
    window.renderizarConteudoModalOrientacoes();
};

window.renderizarConteudoModalOrientacoes = function() {
    const numFase = window.estagioModalAtivoAtual || 1;
    const topico = window.topicoModalAtivoAtual || 'geral';
    const dados = window.ORIENTACOES_FASES_CICLO ? window.ORIENTACOES_FASES_CICLO[numFase] : null;
    if (!dados) return;

    const elEmoji = document.getElementById('modal-fase-emoji');
    const elTitulo = document.getElementById('modal-fase-titulo');
    const elSubtitulo = document.getElementById('modal-fase-subtitulo');

    if (elEmoji) elEmoji.textContent = dados.emoji;
    if (elTitulo) elTitulo.textContent = dados.nome;
    if (elSubtitulo) elSubtitulo.textContent = `${dados.estacao} • ${dados.dias_ref}`;

    for (let i = 1; i <= 4; i++) {
        const btnFase = document.getElementById(`btn-modal-fase-${i}`);
        if (!btnFase) continue;
        if (i === numFase) {
            btnFase.style.background = '#ffffff';
            btnFase.style.color = '#3b0764';
            btnFase.style.boxShadow = '0 2px 6px rgba(124, 58, 237, 0.15)';
            btnFase.style.fontWeight = '900';
        } else {
            btnFase.style.background = 'transparent';
            btnFase.style.color = '#6b21a8';
            btnFase.style.boxShadow = 'none';
            btnFase.style.fontWeight = '700';
        }
    }

    ['geral', 'fertilidade', 'libido', 'energia'].forEach(t => {
        const btnTopico = document.getElementById(`btn-modal-topico-${t}`);
        if (!btnTopico) return;
        if (t === topico) {
            btnTopico.style.background = '#7c3aed';
            btnTopico.style.color = '#ffffff';
            btnTopico.style.border = 'none';
        } else {
            btnTopico.style.background = '#ffffff';
            btnTopico.style.color = '#581c87';
            btnTopico.style.border = '1px solid #d8b4fe';
        }
    });

    const container = document.getElementById('modal-conteudo-orientacoes-corpo');
    if (!container) return;

    let html = '';

    if (topico === 'geral') {
        html += `
            <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-left:4px solid #7c3aed; border-radius:14px; padding:12px; margin-bottom:12px;">
                <span style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:3px;">Sua Vibe & Fisiologia Nesta Fase:</span>
                <p style="margin:0; font-size:12px; color:#3b0764; font-weight:600; line-height:1.45;">${dados.resumo_vibe}</p>
            </div>
        `;
    }

    const chavesCards = (topico === 'geral') ? ['fertilidade', 'libido', 'energia'] : [topico];

    chavesCards.forEach(chave => {
        const c = dados.cards[chave];
        if (!c) return;

        html += `
            <div style="background:#ffffff; border:1px solid #d8b4fe; border-radius:16px; padding:12px 14px; margin-bottom:10px; box-shadow:0 3px 8px rgba(88,28,135,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #f3e8ff; padding-bottom:6px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:16px;">${c.icone}</span>
                        <strong style="font-size:12.5px; color:#3b0764;">${esc(c.titulo)}</strong>
                    </div>
                    <span style="font-size:10.5px; font-weight:800; background:#faf5ff; color:${c.cor}; border:1px solid #d8b4fe; padding:2px 8px; border-radius:8px;">${c.badge}</span>
                </div>

                <div style="font-size:11.5px; color:#581c87; margin-bottom:8px; line-height:1.4; background:#fdf4ff; border-radius:8px; padding:7px 9px;">
                    <strong>O que acontece no seu corpo:</strong> ${c.fisiologia}
                </div>

                <div style="font-size:11.5px; color:#3b0764; line-height:1.45;">
                    <strong style="font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; display:block; margin-bottom:4px;">Como lidar da melhor forma:</strong>
                    <ul style="margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;">
                        ${c.como_lidar.map(item => `<li style="font-size:11px;">${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};


window.salvarCicloHistorico = async function() {
    const supabase = obterClienteSupabaseSeguro();
    const usuarioId = obterUsuarioIdSeguro();
    const dataInicio = document.getElementById('input-data-inicio-ciclo')?.value;
    const duracao = Number(document.getElementById('input-duracao-sangramento')?.value);
    const media = Number(document.getElementById('input-duracao-media-ciclo')?.value);
    const membro = document.getElementById('select-membro-notificar-ciclo')?.value || '';
    const avisar = (mensagem, tipo) => typeof window.mostrarToast === 'function' ? window.mostrarToast(mensagem, tipo) : alert(mensagem);
    if (!supabase || !usuarioId) return avisar('Sessão indisponível. Entre novamente.', 'erro');
    const hojeISO = [obterHoje().getFullYear(), String(obterHoje().getMonth()+1).padStart(2,'0'), String(obterHoje().getDate()).padStart(2,'0')].join('-');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio || '') || parseData(dataInicio).getTime() > obterHoje().getTime()) return avisar('Informe uma data válida, não futura.', 'erro');
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 15 || !Number.isInteger(media) || media < 20 || media > 45) return avisar('Confira a duração do fluxo (1 a 15) e do ciclo (20 a 45).', 'erro');
    const editando = window.cicloEdicaoId !== null && window.cicloEdicaoId !== undefined;
    const duplicado = (window.dadosCicloMulher || []).find(c => String(c.data_inicio).slice(0,10) === dataInicio && (!editando || String(c.id) !== String(window.cicloEdicaoId)));
    if (duplicado) return avisar('Já existe um ciclo nesta data. Use Editar no histórico.', 'erro');
    const payload = { data_inicio: dataInicio, duracao_sangramento: duracao };
    const botao = document.getElementById('btn-salvar-ciclo');
    if (botao) botao.disabled = true;
    try {
        let consulta;
        if (editando) {
            consulta = supabase.from('saude_ciclos').update(payload).eq('usuario_id', usuarioId).eq('id', window.cicloEdicaoId).select();
        } else {
            consulta = supabase.from('saude_ciclos').insert([{...payload, usuario_id: usuarioId}]).select();
        }
        const {data, error} = await consulta;
        if (error) throw error;
        if (!data || data.length !== 1) throw new Error('O banco não confirmou a alteração. Confira permissões da tabela saude_ciclos.');
        Suiri.storage.setItem('suiri_ciclo_duracao_media_manual', String(media));
        Suiri.storage.setItem('suiri_ciclo_notificar_membro_id', membro);
        await window.carregarDadosCicloMulher();
        window.novoRegistroCiclo();
        window.fecharModalRegistroCiclo();
        avisar(editando ? 'Data corrigida e previsões recalculadas.' : 'Novo ciclo registrado e previsões atualizadas.', 'sucesso');
    } catch (erro) {
        console.error('Falha ao salvar ciclo:', erro);
        avisar('Não foi possível salvar: ' + (erro.message || erro), 'erro');
    } finally { if (botao) botao.disabled = false; }
};

// =========================================================================
// 10. GATILHO DE AUTO-INICIALIZAÇÃO SEGURO NA CARGA DA TELA
// =========================================================================
