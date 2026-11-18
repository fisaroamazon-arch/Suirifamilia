/* Suiri Família 7.0 — serviços comuns. URLs de assets são relativas às páginas. */
(function () {
    'use strict';
    const S = window.Suiri = window.Suiri || {};
    S.version = '7.10.0';
    // A versão usa a chave Gemini apenas no servidor.
    localStorage.removeItem('suiri_gemini_api_key');
    S.page = location.pathname.split('/').pop() || 'index.html';
    S.isHome = S.page === 'index.html';
    S.today = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    S.parseJSON = (text, fallback = null) => { try { return text ? JSON.parse(text) : fallback; } catch { return fallback; } };
    S.cachedProfile = () => S.parseJSON(localStorage.getItem('suiri_perfil_ativo'), {});
    S.memberId = () => window.perfilAtual?.id || S.cachedProfile()?.id || null;
    S.storage = {
        key(key) { const id = S.memberId(); return id ? `suiri:v7:member:${id}:${key}` : null; },
        getItem(key) { const scoped = this.key(key); return scoped ? localStorage.getItem(scoped) : null; },
        setItem(key, value) { const scoped = this.key(key); if (!scoped) throw new Error('Entre para salvar os dados pessoais.'); localStorage.setItem(scoped, value); },
        removeItem(key) { const scoped = this.key(key); if (scoped) localStorage.removeItem(scoped); }
    };
    S.monthDate = (dateISO, offset) => {
        const [y,m,d] = dateISO.split('-').map(Number);
        if (!y || !m || !d) throw new Error('Data inválida.');
        const first = new Date(y,m-1+offset,1,12);
        const last = new Date(first.getFullYear(), first.getMonth()+1,0,12).getDate();
        first.setDate(Math.min(d,last)); return S.today(first);
    };
    S.shiftDay = (dateISO, offset) => {
        const date = new Date(`${dateISO}T12:00:00`);
        date.setDate(date.getDate() + offset);
        return S.today(date);
    };
    S.shortDay = dateISO => `${dateISO.slice(8, 10)}/${dateISO.slice(5, 7)}`;
    S.dailyChart = (days, series, min, max) => {
        const x = index => 22 + index * 276 / (days.length - 1);
        const y = value => 82 - (value - min) * 66 / (max - min);
        const grid = [min, Math.ceil((min + max) / 2), max].map(value =>
            `<line x1="22" x2="298" y1="${y(value)}" y2="${y(value)}" class="grafico-diario-linha"/>
             <text x="16" y="${y(value) + 3}" text-anchor="end">${value}</text>`).join('');
        const marks = series.map(({ label, color, values }) => values.map((value, index) => {
            if (!Number.isFinite(value)) return '';
            const previous = values[index - 1];
            const segment = Number.isFinite(previous)
                ? `<line x1="${x(index - 1)}" y1="${y(previous)}" x2="${x(index)}" y2="${y(value)}" stroke="${color}" stroke-width="2"/>`
                : '';
            return `${segment}<circle cx="${x(index)}" cy="${y(value)}" r="2.6" fill="${color}"><title>${S.shortDay(days[index])} · ${label} ${value}/${max}</title></circle>`;
        }).join('')).join('');
        const ticks = [0, Math.floor(days.length / 2), days.length - 1].map((index, i) =>
            `<text x="${x(index)}" y="100" text-anchor="${['start', 'middle', 'end'][i]}">${S.shortDay(days[index])}</text>`).join('');
        return `<svg class="grafico-diario" viewBox="0 0 320 108" role="img" aria-label="Histórico diário de ${S.shortDay(days[0])} a ${S.shortDay(days.at(-1))}">${grid}${marks}${ticks}</svg>`;
    };
    S.money = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
    S.number = value => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
        let v=String(value ?? '').trim().replace(/[^\d.,-]/g,'');
        if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');
        const n=Number(v); return v && Number.isFinite(n) ? n : NaN;
    };
    S.check = (result, expected = null) => {
        if (!result || result.error) throw new Error(result?.error?.message || 'O servidor não confirmou a operação.');
        if (expected !== null && (!Array.isArray(result.data) || result.data.length !== expected)) throw new Error('O banco não confirmou a alteração. Verifique as permissões.');
        return result.data;
    };
    S.readAll = async factory => {
        let out=[];
        // Um registro por página funciona mesmo com max_rows configurado abaixo de 1000.
        // Consultas financeiras serão substituídas por agregação em banco em etapa posterior.
        for(let offset=0;offset<100000;){
            const result=await factory().range(offset,offset+199);
            const rows=S.check(result)||[];out.push(...rows);
            if(!rows.length)return out;
            offset+=rows.length;
        }
        throw new Error('Histórico muito grande; reduza o período.');
    };
    S.locks = new Map();
    S.once = async (key, work) => {
        if (S.locks.has(key)) return S.locks.get(key);
        const promise=Promise.resolve().then(work).finally(()=>S.locks.delete(key));
        S.locks.set(key,promise); return promise;
    };
    S.operation = async (kind, payload, stableKey = null) => {
        const cli=window.cliente;
        if(!cli || !window.usuarioAtual || !window.perfilAtual)throw new Error('Entre novamente para continuar.');
        const key=`suiri:v7:operation:${window.usuarioAtual.id}:${kind}:${stableKey || JSON.stringify(payload)}`;
        let id=localStorage.getItem(key);
        if(!id){id=crypto.randomUUID();localStorage.setItem(key,id);}
        const result=await cli.rpc('suiri_operacao_v7',{p_operation_id:id,p_kind:kind,p_member_id:window.perfilAtual.id,p_payload:payload});
        if(result.error){
            if(['PGRST202','42883'].includes(result.error.code))throw new Error('Atualize o banco com supabase/02_ATUALIZAR_V7.sql para usar esta operação com segurança.');
            throw new Error(result.error.message || 'Não foi possível salvar. Tente novamente.');
        }
        if(!result.data?.ok)throw new Error('Resposta sem confirmação. Nenhum sucesso foi assumido.');
        localStorage.removeItem(key);return result.data;
    };
    S.notifyError = error => { console.error(error); window.mostrarToast?.(error?.message || 'Não foi possível salvar.', 'erro'); };
    // Uma única aparência geral. Os estilos dos espaços são independentes.
    S.theme = {
        apply(){
            document.documentElement.dataset.theme='light';
            document.documentElement.style.colorScheme='light';
            document.body?.classList.remove('dark-mode');
        },
        set(){localStorage.setItem('suiri:v7:theme','claro');this.apply();}
    };
    S.theme.set();
    S.previousFocus = new WeakMap();
    S.openModal = id => {
        const modal=document.getElementById(id);if(!modal)return;
        S.previousFocus.set(modal,document.activeElement);modal.classList.remove('oculto');
        modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
        const heading=modal.querySelector('h2,h3');if(heading){heading.id ||= `${id}-title`;modal.setAttribute('aria-labelledby',heading.id);}
        setTimeout(()=>modal.querySelector('input:not([type="hidden"]),button,select,textarea,[tabindex="0"]')?.focus(),0);
    };
    S.closeModal=id=>{const modal=document.getElementById(id);if(!modal)return;modal.classList.add('oculto');S.previousFocus.get(modal)?.focus?.();};
    window.alternarSecaoRetratil=(id,seta)=>{const el=document.getElementById(id);if(!el)return;el.classList.toggle('oculto');const arrow=document.getElementById(seta);if(arrow)arrow.style.transform=el.classList.contains('oculto')?'':'rotate(180deg)';};
    window.acessarModuloMulherHTML=()=>{location.href='mulher.html';};
    window.acessarModuloHomemHTML=()=>{location.href='homem.html';};
    window.abrirModalRecuperarSenha=()=>S.openModal('modal-recuperar-senha');
    window.fecharModalRecuperarSenha=()=>S.closeModal('modal-recuperar-senha');
    window.enviarLinkRecuperacaoSenha=()=>S.once('recover',async()=>{
        try{
            const email=document.getElementById('recuperar-email-input')?.value.trim();
            if(!email||!email.includes('@'))throw new Error('Informe um e-mail válido.');
            if(!window.cliente)throw new Error('Conexão indisponível.');
            S.check(await window.cliente.auth.resetPasswordForEmail(email,{redirectTo:new URL('index.html',location.href).href}));
            S.closeModal('modal-recuperar-senha');window.mostrarToast('Se o e-mail estiver cadastrado, você receberá o link de recuperação.');
        }catch(error){S.notifyError(error);}
    });
    window.salvarNovaSenhaSuiri=()=>S.once('new-password',async()=>{
        try{
            const senha=document.getElementById('suiri-nova-senha')?.value||'';
            if(senha.length<8)throw new Error('Use uma senha com pelo menos 8 caracteres.');
            S.check(await window.cliente.auth.updateUser({password:senha}));
            S.closeModal('modal-suiri-nova-senha');window.mostrarToast('Senha atualizada.');
        }catch(error){S.notifyError(error);}
    });
    window.abrirModalAgendarContaSalario=()=>S.openModal('modal-agendar-conta-salario');
    window.fecharModalAgendarContaSalario=()=>S.closeModal('modal-agendar-conta-salario');
    window.abrirModalOpcoesCupomIA=()=>S.openModal('modal-escolha-origem-cupom');
    window.fecharModalOpcoesCupomIA=()=>S.closeModal('modal-escolha-origem-cupom');
    window.acionarOrigemCupom=origem=>{S.closeModal('modal-escolha-origem-cupom');document.getElementById(origem==='camera'?'input-camera-cupom-ia':'input-galeria-cupom-ia')?.click();};
    window.abrirAvisoPrivacidade = () => S.openModal('modal-aviso-privacidade');
    window.abrirModalApoioPix = () => {
        const input = document.getElementById('apoio-chave-pix');
        const chave = window.SuiriConfig?.pix;
        if (!input || !chave) return false;
        input.value = chave;
        document.getElementById('apoio-status-pix').textContent = '';
        S.openModal('modal-apoio-semanal');
        return true;
    };
    window.copiarChaveApoioPix = async () => {
        const input = document.getElementById('apoio-chave-pix');
        const status = document.getElementById('apoio-status-pix');
        if (!input?.value || !status) return;
        try {
            await navigator.clipboard.writeText(input.value);
            status.textContent = 'Chave Pix copiada.';
        } catch {
            input.focus();
            input.select();
            status.textContent = 'A chave está selecionada. Copie pelo menu do seu navegador.';
        }
    };
    window.abrirConfiguracoesSuiri=()=>{S.openModal('modal-suiri-config');S.theme.apply();window.atualizarStatusOfflineSuiri?.();};
    window.alternarModoEscuroVisual=()=>window.abrirConfiguracoesSuiri();
    const field = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    window.esc = field;
    S.jsArg = value => field(JSON.stringify(String(value ?? '')).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'));
    S.imageUrl = value => {const v=String(value||'');return /^(https:\/\/|data:image\/(jpeg|png|webp);base64,|assets\/)/i.test(v)?v:'assets/icons-modern/icone-pessoa-escopo.svg';};
    window.obterClienteSupabase=()=>window.cliente||null;
    window.obterUsuarioId=()=>window.perfilAtual?.id||window.usuarioAtual?.id||null;
    document.addEventListener('keydown',event=>{
        const modals=[...document.querySelectorAll('.modal-overlay:not(.oculto)')];
        const modal=modals.sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0)).pop();
        if(!modal)return;
        if(event.key==='Escape'){
            if(modal.id==='modal-confirmacao-nativo-suiri'){document.getElementById('btn-cancelar-confirmacao-suiri')?.click();return;}
            S.closeModal(modal.id);return;
        }
        if(event.key==='Tab'){
            const list=[...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length);
            const first=list[0],last=list[list.length-1];if(!first)return;
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
    });
    document.addEventListener('DOMContentLoaded',()=>{
        S.theme.apply();
        document.querySelectorAll('input,textarea,select').forEach(el=>{
            if(!el.hasAttribute('aria-label')&&!el.labels?.length){const label=el.getAttribute('placeholder')||el.id.replace(/[-_]/g,' ');el.setAttribute('aria-label',label);}
            if(el.type==='email'){el.autocomplete='email';el.autocapitalize='none';}
        });
        const observer=new MutationObserver(records=>{
            for(const record of records){const modal=record.target;
                if(!modal.matches?.('.modal-overlay')||modal.classList.contains('oculto'))continue;
                modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
                const title=modal.querySelector('h2,h3');if(title){title.id ||= `${modal.id}-title`;modal.setAttribute('aria-labelledby',title.id);}
                if(!modal.contains(document.activeElement)){
                    S.previousFocus.set(modal,document.activeElement);
                    modal.querySelector('input:not([type="hidden"]),button,select,textarea')?.focus();
                }
            }
        });observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
        if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Offline indisponível',error));
    });
})();
