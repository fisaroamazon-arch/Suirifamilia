const CACHE_NAME = 'suiri-cache-v1';

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['./', './index.html']);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((chaves) => {
            return Promise.all(
                chaves.map((chave) => {
                    if (chave !== CACHE_NAME) return caches.delete(chave);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        fetch(evento.request).catch(() => caches.match(evento.request))
    );
});

// =========================================================================
// ESCUTA E EXIBIÇÃO DE NOTIFICAÇÕES PUSH NA TELA DE BLOQUEIO
// =========================================================================

self.addEventListener('push', (evento) => {
    let dados = {};
    
    if (evento.data) {
        try {
            // Tenta processar como JSON estruturado enviado pelo backend
            dados = evento.data.json();
        } catch (e) {
            // Se for apenas texto simples, assume como o corpo da mensagem
            dados = { corpo: evento.data.text() };
        }
    }

    const titulo = dados.titulo || 'Suiri Gestão Familiar';
    const opcoes = {
        body: dados.corpo || dados.body || 'Você tem uma nova notificação na família!',
        icon: './icone.jpg',
        badge: './icone.jpg',
        vibrate: [200, 100, 200], // Padrão tátil de vibração
        data: {
            url: dados.url || './index.html' // URL a abrir quando clicado
        }
    };

    evento.waitUntil(
        self.registration.showNotification(titulo, opcoes)
    );
});

// =========================================================================
// GESTÃO DE CLIQUE NA NOTIFICAÇÃO (ABRIR OU FOCAR A APLICAÇÃO)
// =========================================================================

self.addEventListener('notificationclick', (evento) => {
    // Fecha a notificação nativa após o toque
    evento.notification.close();
    
    const urlDestino = evento.notification.data?.url || './index.html';

    evento.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelasAbertas) => {
            // Se o app já estiver aberto numa aba/janela, trazemos ela para a frente (foco)
            for (let i = 0; i < janelasAbertas.length; i++) {
                const cliente = janelasAbertas[i];
                if (cliente.url.includes(urlDestino) && 'focus' in cliente) {
                    return cliente.focus();
                }
            }
            // Se não estiver aberto em lado nenhum, inicia o app
            if (clients.openWindow) {
                return clients.openWindow(urlDestino);
            }
        })
    );
});
