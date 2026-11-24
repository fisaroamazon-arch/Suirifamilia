package br.com.suirifamilia.app;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.util.Base64;
import android.service.notification.StatusBarNotification;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import java.io.OutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.Collections;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String SITE = "https://fisaroamazon-arch.github.io/Suirifamilia/";
    private static final String CHANNEL = "agenda";
    private static final int ALERTA_DETALHADO = 2;
    private static final int VOICE = 1, GALLERY = 2, MICROPHONE = 3, CAMERA = 4, NOTIFICATIONS = 5, SAVE_PDF = 6;
    private static final int PDF_CHUNK = 65536, MAX_PDF_BASE64 = 16000000;
    private WebView web;
    private FrameLayout content;
    private boolean pianoTelaInteira;
    private int flagsAntesDoPiano;
    private ValueCallback<Uri[]> gallery;
    private PermissionRequest camera;
    private StringBuilder pdfInProgress;
    private byte[] pdfToSave;
    private int consultaAlertas;
    private boolean exportandoImagem;
    private TextToSpeech vozTour;
    private boolean vozTourPronta;
    private String textoVozTour;
    private int pedidoVozTour;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setUserAgentString(web.getSettings().getUserAgentString() + " SuiriFamiliaAndroid/1 SuiriFamiliaPDF/1 SuiriFamiliaAlertas/1 SuiriFamiliaImagem/1 SuiriFamiliaVoz/1 SuiriFamiliaPiano/1");
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                definirTelaInteiraPiano(false);
            }

            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri url = request.getUrl();
                if (isSite(url)) return false;
                if ("suiri-native".equals(url.getScheme()) && isSite(Uri.parse(view.getUrl() == null ? "" : view.getUrl()))) {
                    switch (url.getHost() == null ? "" : url.getHost()) {
                        case "voice":
                            if (has(Manifest.permission.RECORD_AUDIO)) startVoice();
                            else requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MICROPHONE);
                            break;
                        case "notifications": enableNotifications(); break;
                        case "reminder": remind(); break;
                        case "sync-alerts": sincronizarAlertas(); break;
                        case "clear-alerts":
                            consultaAlertas++;
                            limparAlertas(getSystemService(NotificationManager.class));
                            getPreferences(MODE_PRIVATE).edit().remove("perfil_alertas").apply();
                            web.loadUrl(SITE + "index.html");
                            break;
                        case "piano-fullscreen":
                            if ("/Suirifamilia/jogos.html".equals(Uri.parse(view.getUrl()).getPath())) definirTelaInteiraPiano(true);
                            break;
                        case "piano-exit-fullscreen": definirTelaInteiraPiano(false); break;
                        case "speak-tour": lerPassoTour(); break;
                        case "stop-tour": pararTourFalado(); break;
                        case "save-pdf": startPdfExport(view.getUrl(), false); break;
                        case "save-drawing": startPdfExport(view.getUrl(), true); break;
                    }
                } else if (request.hasGesture() && "https".equals(url.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, url)); }
                    catch (ActivityNotFoundException ignored) { message("Nenhum navegador disponível."); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) {
                if (!"https://fisaroamazon-arch.github.io/".equals(request.getOrigin().toString())
                        && !"https://fisaroamazon-arch.github.io".equals(request.getOrigin().toString())) {
                    request.deny();
                    return;
                }
                if (!isSite(Uri.parse(web.getUrl() == null ? "" : web.getUrl())) || camera != null
                        || !Arrays.equals(request.getResources(), new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE})) {
                    request.deny();
                    return;
                }
                if (has(Manifest.permission.CAMERA)) request.grant(request.getResources());
                else {
                    camera = request;
                    requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA);
                }
            }

            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (camera == request) camera = null;
            }

            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (gallery != null) gallery.onReceiveValue(null);
                gallery = callback;
                Intent picker = new Intent(Intent.ACTION_GET_CONTENT).setType("image/*")
                        .addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(picker, GALLERY); }
                catch (ActivityNotFoundException ignored) {
                    gallery = null;
                    callback.onReceiveValue(null);
                    message("Galeria indisponível.");
                }
                return true;
            }
        });
        content = new FrameLayout(this);
        content.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            content.setOnApplyWindowInsetsListener((view, insets) -> {
                int bars = WindowInsets.Type.systemBars();
                int cutout = WindowInsets.Type.displayCutout();
                int system = bars | cutout;
                int ime = WindowInsets.Type.ime();
                Insets safe = insets.getInsetsIgnoringVisibility(pianoTelaInteira ? cutout : system);
                safe = Insets.max(safe, insets.getInsets(ime));
                // Padding the parent shrinks the WebView itself, including its HTML viewport.
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return new WindowInsets.Builder(insets)
                        .setInsets(system | ime, Insets.NONE)
                        .setInsetsIgnoringVisibility(system, Insets.NONE)
                        .setDisplayCutout(null)
                        .build();
            });
        }
        setContentView(content);
        content.requestApplyInsets();
        if (state == null || web.restoreState(state) == null) abrirTelaInicial(getIntent());
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        abrirTelaInicial(intent);
    }

    private void abrirTelaInicial(Intent intent) {
        String tela = intent == null ? null : intent.getStringExtra("suiri_tela");
        if (Arrays.asList("inicio", "calendario", "financeiro").contains(tela)) web.loadUrl(SITE + "index.html#" + tela);
        else if (web.getUrl() == null) web.loadUrl(SITE);
    }

    private void definirTelaInteiraPiano(boolean ativar) {
        if (pianoTelaInteira == ativar) return;
        pianoTelaInteira = ativar;
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                if (ativar) {
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    controller.hide(WindowInsets.Type.systemBars());
                } else {
                    controller.show(WindowInsets.Type.systemBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_DEFAULT);
                }
            }
            content.requestApplyInsets();
        } else {
            View decor = getWindow().getDecorView();
            if (ativar) {
                flagsAntesDoPiano = decor.getSystemUiVisibility();
                decor.setSystemUiVisibility(flagsAntesDoPiano | View.SYSTEM_UI_FLAG_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            } else {
                decor.setSystemUiVisibility(flagsAntesDoPiano);
            }
        }
    }

    private static boolean isSite(Uri url) {
        String path = url.getPath();
        return "https".equals(url.getScheme()) && "fisaroamazon-arch.github.io".equals(url.getHost())
                && (url.getPort() == -1 || url.getPort() == 443) && path != null && path.startsWith("/Suirifamilia/");
    }

    private boolean has(String permission) {
        return checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED;
    }

    private void startVoice() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR")
                .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                .putExtra(RecognizerIntent.EXTRA_PROMPT, "Diga o gasto ou a entrada");
        try { startActivityForResult(intent, VOICE); }
        catch (ActivityNotFoundException ignored) {
            message("Reconhecimento de voz indisponível. Use o ditado do teclado.");
        }
    }

    private void message(String text) {
        Toast.makeText(this, text, Toast.LENGTH_LONG).show();
    }

    private void enableNotifications() {
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager.areNotificationsEnabled()) {
            criarCanaisAlertas(manager);
            message("Notificações ativadas. As pendências aparecem após sincronizar.");
            web.evaluateJavascript("if (window.SuiriAlertasAndroid) window.SuiriAlertasAndroid.atualizar(); "
                    + "else window.atualizarNotificacoesGeraisPainel?.()", null);
            sincronizarAlertas();
        } else if (Build.VERSION.SDK_INT >= 33 && !has(Manifest.permission.POST_NOTIFICATIONS)
                && !getPreferences(MODE_PRIVATE).getBoolean("asked_notifications", false)) {
            getPreferences(MODE_PRIVATE).edit().putBoolean("asked_notifications", true).apply();
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATIONS);
        } else {
            startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName()));
        }
    }

    private void remind() {
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (!manager.areNotificationsEnabled()) return;
        manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Agenda", NotificationManager.IMPORTANCE_DEFAULT));
        if (manager.getNotificationChannel(CHANNEL).getImportance() == NotificationManager.IMPORTANCE_NONE) return;
        String today = LocalDate.now().toString();
        if (today.equals(getPreferences(MODE_PRIVATE).getString("last_reminder", ""))) return;
        PendingIntent open = PendingIntent.getActivity(this, 0,
                new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        manager.notify(1, new Notification.Builder(this, CHANNEL)
                .setSmallIcon(R.drawable.suiri_notificacao)
                .setContentTitle("Suiri Família").setContentText("Confira os lembretes de hoje no aplicativo.")
                .setContentIntent(open).setAutoCancel(true).setVisibility(Notification.VISIBILITY_PRIVATE).build());
        getPreferences(MODE_PRIVATE).edit().putString("last_reminder", today).apply();
    }

    private void criarCanaisAlertas(NotificationManager manager) {
        manager.createNotificationChannel(new NotificationChannel("missoes", "Missões da família", NotificationManager.IMPORTANCE_DEFAULT));
        manager.createNotificationChannel(new NotificationChannel("caixa", "Fluxo de caixa", NotificationManager.IMPORTANCE_DEFAULT));
    }

    private static void limparAlertas(NotificationManager manager) {
        manager.cancel(1);
        for (StatusBarNotification n : manager.getActiveNotifications()) {
            if (n.getId() == ALERTA_DETALHADO) manager.cancel(n.getTag(), n.getId());
        }
    }

    private void sincronizarAlertas() {
        final int pedido = ++consultaAlertas;
        final String origem = web.getUrl();
        web.evaluateJavascript("window.SuiriAlertasAndroid?.ler()", resposta -> {
            if (pedido != consultaAlertas || origem == null || !origem.equals(web.getUrl())) return;
            try {
                Object valor = new JSONTokener(resposta).nextValue();
                if (valor instanceof String) publicarAlertas(new JSONObject((String) valor));
            } catch (org.json.JSONException ignored) {
                android.util.Log.w("SuiriAlertas", "Resposta de alertas indisponível.");
            }
        });
    }

    private void publicarAlertas(JSONObject snapshot) {
        NotificationManager manager = getSystemService(NotificationManager.class);
        SharedPreferences dados = getPreferences(MODE_PRIVATE);
        String perfil = snapshot.optString("perfil");
        if (!perfil.equals(dados.getString("perfil_alertas", ""))) {
            limparAlertas(manager);
            dados.edit().putString("perfil_alertas", perfil).apply();
        }
        if (perfil.isEmpty() || perfil.length() > 150 || !manager.areNotificationsEnabled()) return;
        criarCanaisAlertas(manager);
        for (String grupo : new String[]{"missoes", "contas", "lancamentos"}) {
            JSONArray lista = snapshot.optJSONArray(grupo);
            String canal = "missoes".equals(grupo) ? grupo : "caixa";
            if (lista == null || manager.getNotificationChannel(canal).getImportance() == NotificationManager.IMPORTANCE_NONE) continue;
            atualizarCanal(manager, dados, perfil, grupo, canal, lista);
        }
    }

    private void atualizarCanal(NotificationManager manager, SharedPreferences dados, String perfil, String grupo, String canal, JSONArray lista) {
        String chave = "lidos:" + perfil + ":" + grupo;
        String hoje = LocalDate.now().toString();
        String marcador = hoje + ":";
        Set<String> lidos = new HashSet<>(dados.getStringSet(chave, Collections.emptySet()));
        lidos.removeIf(item -> !item.startsWith(marcador));
        Set<String> ativos = new HashSet<>();
        for (int i = 0; i < Math.min(lista.length(), 120); i++) {
            JSONObject item = lista.optJSONObject(i);
            if (item == null) continue;
            String id = item.optString("id");
            String tela = item.optString("tela");
            if (!id.matches("[a-zA-Z0-9_-]{1,110}") || !Arrays.asList("inicio", "calendario", "financeiro").contains(tela)) continue;
            String tag = grupo + ":" + id;
            ativos.add(tag);
            StatusBarNotification existente = null;
            for (StatusBarNotification n : manager.getActiveNotifications()) {
                if (n.getId() == ALERTA_DETALHADO && tag.equals(n.getTag())) {
                    existente = n;
                    break;
                }
            }
            String marca = marcador + id;
            if (lidos.contains(marca) && existente == null) continue;
            String titulo = item.optString("titulo");
            String corpo = item.optString("corpo");
            if (existente != null && titulo.contentEquals(existente.getNotification().extras.getCharSequence(Notification.EXTRA_TITLE, ""))
                    && corpo.contentEquals(existente.getNotification().extras.getCharSequence(Notification.EXTRA_BIG_TEXT, ""))) continue;
            Intent destino = new Intent(this, MainActivity.class).putExtra("suiri_tela", tela)
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent abrir = PendingIntent.getActivity(this, tela.hashCode(), destino,
                    PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            String resumo = corpo.split("\n", 2)[0];
            manager.notify(tag, ALERTA_DETALHADO, new Notification.Builder(this, canal)
                    .setSmallIcon(R.drawable.suiri_notificacao).setContentTitle(titulo).setContentText(resumo)
                    .setStyle(new Notification.BigTextStyle().bigText(corpo))
                    .setContentIntent(abrir).setAutoCancel(true).setOnlyAlertOnce(true)
                    .setVisibility(Notification.VISIBILITY_PRIVATE).build());
            lidos.add(marca);
        }
        for (StatusBarNotification n : manager.getActiveNotifications()) {
            if (n.getId() == ALERTA_DETALHADO && n.getTag() != null && n.getTag().startsWith(grupo + ":") && !ativos.contains(n.getTag())) {
                manager.cancel(n.getTag(), n.getId());
            }
        }
        dados.edit().putStringSet(chave, lidos).apply();
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] result) {
        super.onRequestPermissionsResult(code, permissions, result);
        boolean granted = result.length > 0 && result[0] == PackageManager.PERMISSION_GRANTED;
        if (code == MICROPHONE) {
            if (granted) startVoice();
            else message("Autorize o microfone nas configurações do Android para ditar.");
        } else if (code == CAMERA && camera != null) {
            if (granted) camera.grant(camera.getResources());
            else camera.deny();
            camera = null;
        } else if (code == NOTIFICATIONS && granted) {
            enableNotifications();
        }
    }

    private void lerPassoTour() {
        final int pedido = ++pedidoVozTour;
        String origem = web.getUrl();
        web.evaluateJavascript("window.SuiriTextoTour || ''", resultado -> {
            if (pedido != pedidoVozTour || origem == null || !origem.equals(web.getUrl()) || resultado == null) return;
            try {
                Object texto = new JSONTokener(resultado).nextValue();
                if (!(texto instanceof String) || ((String) texto).isEmpty() || ((String) texto).length() > 1800) return;
                textoVozTour = (String) texto;
                if (vozTour == null) {
                    vozTour = new TextToSpeech(this, status -> {
                        runOnUiThread(() -> {
                            if (vozTour == null) return;
                            vozTourPronta = status == TextToSpeech.SUCCESS
                                    && vozTour.setLanguage(new Locale("pt", "BR")) >= TextToSpeech.LANG_AVAILABLE;
                            if (vozTourPronta) {
                                vozTour.setSpeechRate(.92f);
                                falarTextoTour();
                            } else {
                                textoVozTour = null;
                                message("A voz em português não está instalada no Android.");
                            }
                        });
                    });
                } else if (vozTourPronta) falarTextoTour();
            } catch (org.json.JSONException ignored) {
                android.util.Log.w("SuiriTour", "Texto para narração indisponível.");
            }
        });
    }

    private void falarTextoTour() {
        if (textoVozTour == null) return;
        vozTour.speak(textoVozTour, TextToSpeech.QUEUE_FLUSH, null, "manual-suiri");
        textoVozTour = null;
    }

    private void pararTourFalado() {
        pedidoVozTour++;
        textoVozTour = null;
        if (vozTour != null) vozTour.stop();
    }

    @Override protected void onPause() {
        pararTourFalado();
        super.onPause();
    }

    @Override protected void onDestroy() {
        if (vozTour != null) {
            vozTour.shutdown();
            vozTour = null;
        }
        super.onDestroy();
    }

    private void startPdfExport(String page, boolean imagem) {
        if (pdfInProgress != null || pdfToSave != null) return;
        exportandoImagem = imagem;
        pdfInProgress = new StringBuilder();
        readPdfChunk(page);
    }

    private void readPdfChunk(String page) {
        int offset = pdfInProgress.length();
        if (!page.equals(web.getUrl()) || offset > MAX_PDF_BASE64) {
            finishPdfRead("Não foi possível receber o arquivo.");
            return;
        }
        web.evaluateJavascript("(window.SuiriPdfAndroid || '').slice(" + offset + ","
                + (offset + PDF_CHUNK) + ")", result -> {
            if (!page.equals(web.getUrl())) {
                finishPdfRead("A página foi alterada durante a exportação.");
                return;
            }
            try {
                Object value = new JSONTokener(result).nextValue();
                if (!(value instanceof String)) throw new IllegalArgumentException("PDF inválido");
                String chunk = (String) value;
                pdfInProgress.append(chunk);
                if (pdfInProgress.length() > MAX_PDF_BASE64) throw new IllegalArgumentException("PDF grande");
                if (chunk.length() == PDF_CHUNK) {
                    readPdfChunk(page);
                    return;
                }
                byte[] pdf = Base64.decode(pdfInProgress.toString(), Base64.DEFAULT);
                boolean assinaturaValida = exportandoImagem
                        ? pdf.length >= 8 && pdf[0] == (byte) 137 && pdf[1] == 'P' && pdf[2] == 'N' && pdf[3] == 'G'
                        : pdf.length >= 5 && pdf[0] == '%' && pdf[1] == 'P' && pdf[2] == 'D' && pdf[3] == 'F' && pdf[4] == '-';
                if (!assinaturaValida) throw new IllegalArgumentException("Arquivo inválido");
                finishPdfRead(null);
                pdfToSave = pdf;
                startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT)
                    .addCategory(Intent.CATEGORY_OPENABLE).setType(exportandoImagem ? "image/png" : "application/pdf")
                    .putExtra(Intent.EXTRA_TITLE, exportandoImagem ? "meu-desenho-suiri.png" : "Suiri_Familia_" + LocalDate.now() + ".pdf"), SAVE_PDF);
            } catch (Exception error) {
                pdfToSave = null;
                finishPdfRead("Não foi possível abrir o seletor de arquivos para o PDF.");
            }
        });
    }

    private void finishPdfRead(String error) {
        pdfInProgress = null;
        String url = web.getUrl();
        if (url != null && isSite(Uri.parse(url))) web.evaluateJavascript("delete window.SuiriPdfAndroid", null);
        if (error != null) message(error);
    }

    private void savePdf(int result, Intent data) {
        byte[] pdf = pdfToSave;
        pdfToSave = null;
        Uri uri = data == null ? null : data.getData();
        if (result != RESULT_OK || uri == null || !"content".equals(uri.getScheme()) || pdf == null) return;
        new Thread(() -> {
            try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                if (output == null) throw new IOException("Destino indisponível");
                output.write(pdf);
                runOnUiThread(() -> message("Arquivo salvo."));
            } catch (IOException | SecurityException error) {
                runOnUiThread(() -> message("Não foi possível salvar o arquivo."));
            }
        }).start();
    }

    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == SAVE_PDF) savePdf(result, data);
        if (code == GALLERY && gallery != null) {
            ValueCallback<Uri[]> callback = gallery;
            gallery = null;
            Uri selected = result == RESULT_OK && data != null ? data.getData() : null;
            callback.onReceiveValue(selected != null && "content".equals(selected.getScheme()) ? new Uri[]{selected} : null);
        }
        if (code == VOICE && result == RESULT_OK && data != null && web.getUrl() != null && isSite(Uri.parse(web.getUrl()))) {
            ArrayList<String> phrases = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (phrases != null && !phrases.isEmpty()) {
                web.evaluateJavascript("if (!document.getElementById('modal-registro-rapido-financas')?.classList.contains('oculto')) "
                        + "window.processarTextoTranscrito?.(" + JSONObject.quote(phrases.get(0)) + ")", null);
            }
        }
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        web.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override public void onBackPressed() {
        if (pianoTelaInteira) {
            web.evaluateJavascript("(() => { const menu = document.getElementById('piano-configuracoes'); "
                    + "if (menu?.open) menu.close(); else GerenciadorArcade.voltarAcao(); })()", null);
            return;
        }
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
