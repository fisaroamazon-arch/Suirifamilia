package br.com.suirifamilia.app;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.view.WindowInsets;
import android.util.Base64;
import org.json.JSONObject;
import org.json.JSONTokener;
import java.io.OutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;

public final class MainActivity extends Activity {
    private static final String SITE = "https://fisaroamazon-arch.github.io/Suirifamilia/";
    private static final String CHANNEL = "agenda";
    private static final int VOICE = 1, GALLERY = 2, MICROPHONE = 3, CAMERA = 4, NOTIFICATIONS = 5, SAVE_PDF = 6;
    private static final int PDF_CHUNK = 65536, MAX_PDF_BASE64 = 16000000;
    private WebView web;
    private ValueCallback<Uri[]> gallery;
    private PermissionRequest camera;
    private StringBuilder pdfInProgress;
    private byte[] pdfToSave;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setUserAgentString(web.getSettings().getUserAgentString() + " SuiriFamiliaAndroid/1 SuiriFamiliaPDF/1");
        web.setWebViewClient(new WebViewClient() {
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
                        case "save-pdf": startPdfExport(view.getUrl()); break;
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
        FrameLayout content = new FrameLayout(this);
        content.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            content.setOnApplyWindowInsetsListener((view, insets) -> {
                int system = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                int ime = WindowInsets.Type.ime();
                Insets safe = Insets.max(insets.getInsetsIgnoringVisibility(system), insets.getInsets(ime));
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
        if (state == null || web.restoreState(state) == null) web.loadUrl(SITE);
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
            web.evaluateJavascript("window.atualizarNotificacoesGeraisPainel?.()", null);
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
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle("Suiri Família").setContentText("Confira os lembretes de hoje no aplicativo.")
                .setContentIntent(open).setAutoCancel(true).setVisibility(Notification.VISIBILITY_PRIVATE).build());
        getPreferences(MODE_PRIVATE).edit().putString("last_reminder", today).apply();
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

    private void startPdfExport(String page) {
        if (pdfInProgress != null || pdfToSave != null) return;
        pdfInProgress = new StringBuilder();
        readPdfChunk(page);
    }

    private void readPdfChunk(String page) {
        int offset = pdfInProgress.length();
        if (!page.equals(web.getUrl()) || offset > MAX_PDF_BASE64) {
            finishPdfRead("Não foi possível receber o PDF.");
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
                if (pdf.length < 5 || pdf[0] != '%' || pdf[1] != 'P' || pdf[2] != 'D' || pdf[3] != 'F' || pdf[4] != '-') {
                    throw new IllegalArgumentException("PDF inválido");
                }
                finishPdfRead(null);
                pdfToSave = pdf;
                startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT)
                    .addCategory(Intent.CATEGORY_OPENABLE).setType("application/pdf")
                    .putExtra(Intent.EXTRA_TITLE, "Suiri_Familia_" + LocalDate.now() + ".pdf"), SAVE_PDF);
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
                runOnUiThread(() -> message("PDF salvo."));
            } catch (IOException | SecurityException error) {
                runOnUiThread(() -> message("Não foi possível salvar o PDF."));
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
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
