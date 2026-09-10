package com.druvio.app;

import android.graphics.Color;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.core.view.WindowCompat;
import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;
import com.druvio.app.notifications.DruvioFcmManager;
import com.druvio.app.notifications.DruvioNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "DruvioFCM";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(DruvioNotificationsPlugin.class);
        prepareNotificationIntent(getIntent());
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
            .setAppearanceLightStatusBars(false);
        getWindow().setNavigationBarColor(Color.rgb(1, 89, 249));
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
            .setAppearanceLightNavigationBars(false);
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            getWindow().setNavigationBarColor(Color.WHITE);
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
                .setAppearanceLightNavigationBars(true);
        }, 1400);
        DruvioFcmManager.initialize(getApplicationContext());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        prepareNotificationIntent(intent);
        super.onNewIntent(intent);
    }

    private void prepareNotificationIntent(Intent intent) {
        if (intent == null || intent.getData() != null) return;
        String deepLink = DruvioFcmManager.deepLinkFromIntent(intent);
        if (deepLink != null) {
            intent.setData(android.net.Uri.parse(deepLink));
            Log.d(TAG, "Notification tap routed to an in-app deep link.");
        } else if (intent.getBooleanExtra("druvio_notification_tap", false)
                || intent.hasExtra("google.message_id")) {
            Log.d(TAG, "Notification tap routed to the Druvio home screen.");
        }
    }
}
