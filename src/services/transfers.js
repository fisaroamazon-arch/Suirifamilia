/* Suiri Família 7.1: confirmação explícita e retomada da mesma transferência. */
(function () {
    'use strict';
    const S = window.Suiri;
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const inFlight = new Map();
    function amount(value) {
        const text = String(value ?? '').trim().replace(',', '.');
        if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error('Use um valor maior que zero, com até duas casas decimais.');
        const [whole, fraction = ''] = text.split('.');
        const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
        if (cents <= 0n || cents > 9007199254740991n) throw new Error('Informe um valor monetário válido maior que zero.');
        return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
    }
    function context() {
        const user = window.usuarioAtual?.id, sender = window.perfilAtual?.id, family = window.familiaAtualId;
        if (!UUID.test(user || '') || !UUID.test(sender || '') || !UUID.test(family || '') || user !== sender) {
            throw new Error('Entre com a conta do remetente para transferir.');
        }
        return { user, sender, family, key: `suiri:v71:transfer:${user}:${family}:${sender}` };
    }
    function load(ctx) {
        const raw = localStorage.getItem(ctx.key);
        if (!raw) return null;
        let pending;
        try { pending = JSON.parse(raw); } catch { /* A pendência não deve ser descartada silenciosamente. */ }
        if (!pending || !UUID.test(pending.id || '') || !UUID.test(pending.destination || '') ||
            pending.user !== ctx.user || pending.sender !== ctx.sender || pending.family !== ctx.family ||
            amount(pending.amount) !== pending.amount) {
            throw new Error('A pendência de transferência está inválida. Confira o extrato antes de recuperar este dispositivo.');
        }
        return pending;
    }
    function forget(ctx, id) {
        try { if (load(ctx)?.id === id) localStorage.removeItem(ctx.key); } catch { /* Um replay continua seguro no servidor. */ }
    }
    async function send(ctx, destination, value) {
        if (context().key !== ctx.key) throw new Error('A conta mudou. Reabra a transferência no perfil correto.');
        let pending = load(ctx);
        if (pending && (pending.destination !== destination || pending.amount !== value)) {
            throw new Error('Consulte primeiro a transferência pendente. Reabra a janela para recuperar os dados dela.');
        }
        if (!pending) {
            pending = { id: crypto.randomUUID(), user: ctx.user, sender: ctx.sender, family: ctx.family, destination, amount: value };
            // Sem armazenamento persistente, não envia: uma recarga perderia o identificador.
            localStorage.setItem(ctx.key, JSON.stringify(pending));
        }
        let response;
        try {
            response = await window.cliente.rpc('transferir_saldo_familiar_v71', {
                p_operacao_id: pending.id, p_familia_id: ctx.family, p_remetente_id: ctx.sender,
                p_destinatario_id: destination, p_valor: value
            });
        } catch {
            throw new Error('A confirmação não chegou. Toque em Consultar novamente para verificar a mesma transferência.');
        }
        if (response?.error) {
            if (['PGRST202', '42883'].includes(response.error.code)) {
                throw new Error('Aplique supabase/03_TRANSFERENCIAS_V71.sql no Supabase e consulte novamente.');
            }
            throw new Error('A transferência ficou sem confirmação. Consulte novamente a mesma operação.');
        }
        const result = response?.data;
        if (result?.sucesso === false) {
            forget(ctx, pending.id);
            throw new Error(result.mensagem || 'A transferência foi recusada.');
        }
        if (result?.sucesso !== true || result.operacao_id !== pending.id) {
            throw new Error('O servidor não confirmou a transferência. Toque em Consultar novamente.');
        }
        forget(ctx, pending.id);
        return result;
    }
    S.transfer = {
        amount,
        pending() { return load(context()); },
        submit(destination, value) {
            const ctx = context(), normalized = amount(value);
            if (!window.cliente) return Promise.reject(new Error('Conexão indisponível.'));
            if (!UUID.test(destination || '') || destination === ctx.sender) return Promise.reject(new Error('Selecione outro familiar.'));
            const current = inFlight.get(ctx.key);
            if (current) {
                if (current.destination !== destination || current.amount !== normalized) return Promise.reject(new Error('Aguarde a confirmação da transferência em andamento.'));
                return current.promise;
            }
            const promise = Promise.resolve().then(() => {
                if (navigator.locks?.request) return navigator.locks.request(ctx.key, () => send(ctx, destination, normalized));
                return send(ctx, destination, normalized);
            }).finally(() => inFlight.delete(ctx.key));
            inFlight.set(ctx.key, { destination, amount: normalized, promise });
            return promise;
        }
    };
})();
