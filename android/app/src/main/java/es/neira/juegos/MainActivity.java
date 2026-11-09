package es.neira.juegos;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Juegos Neira: la app solo es una "ventana" a la web de juegos.
 * Los juegos viven en el hosting, asi que cada cambio que se suba
 * aparece solo en todos los moviles sin reinstalar nada.
 */
public class MainActivity extends Activity {
    private WebView web;

    /** Puente para que cada juego pida la orientacion que necesita. */
    public class Puente {
        @JavascriptInterface
        public void setOrientation(String o) {
            runOnUiThread(() -> {
                if ("landscape".equals(o)) setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                else if ("portrait".equals(o)) setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
                else setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);
            });
        }
        @JavascriptInterface
        public String version() { return BuildConfig.VERSION_NAME; }
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " NeiraApp");
        web.addJavascriptInterface(new Puente(), "NeiraApp");
        web.setBackgroundColor(0xFF1E6FE0);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                // Sin internet y sin nada guardado todavia: pantalla de aviso
                if (req.isForMainFrame()) v.loadUrl("file:///android_asset/sin_conexion.html");
            }
        });
        setContentView(web);
        hideBars();
        if (savedInstanceState == null) web.loadUrl(BuildConfig.JUEGOS_URL);
        else web.restoreState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    private void hideBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.evaluateJavascript("window.appPause&&window.appPause()", null);
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        hideBars();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        // Atras: dentro de un juego primero pausa; luego vuelve al menu; en el menu sale
        web.evaluateJavascript("window.appBack?window.appBack():'salir'", v -> {
            if (v != null && v.contains("pausa")) return;
            if (web.canGoBack()) web.goBack(); else finish();
        });
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }
}
