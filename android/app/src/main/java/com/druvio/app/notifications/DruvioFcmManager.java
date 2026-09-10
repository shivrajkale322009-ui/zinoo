package com.druvio.app.notifications;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import com.druvio.app.BuildConfig;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.Map;

public final class DruvioFcmManager {
    public static final String CHANNEL_ID = "druvio_default";
    public static final String TOPIC_ALL_USERS = "all_users";
    private static final String TAG = "DruvioFCM";

    private DruvioFcmManager() {}

    public static void initialize(Context context) {
        createNotificationChannel(context);
        FirebaseMessaging messaging = FirebaseMessaging.getInstance();
        messaging.setAutoInitEnabled(true);
        Log.d(TAG, "FCM initialization started.");
        messaging.getToken()
            .addOnSuccessListener(token -> {
                if (BuildConfig.DEBUG) Log.d(TAG, "FCM registration token: " + token);
                else Log.d(TAG, "FCM registration token is available.");
            })
            .addOnFailureListener(error -> Log.w(TAG, "FCM token generation failed.", error));
        subscribeToAllUsers();
    }

    public static void handleNewToken(String token) {
        if (BuildConfig.DEBUG) Log.d(TAG, "FCM registration token refreshed: " + token);
        else Log.d(TAG, "FCM registration token refreshed.");
        subscribeToAllUsers();
    }

    public static void subscribeToAllUsers() {
        FirebaseMessaging.getInstance().subscribeToTopic(TOPIC_ALL_USERS)
            .addOnSuccessListener(unused -> Log.d(TAG, "Subscribed to FCM topic: " + TOPIC_ALL_USERS))
            .addOnFailureListener(error -> Log.w(TAG, "FCM topic subscription failed: " + TOPIC_ALL_USERS, error));
    }

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Druvio",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Druvio product notifications");
        channel.enableVibration(false);
        channel.setVibrationPattern(null);
        channel.setSound(null, (AudioAttributes) null);
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    public static String deepLinkFromData(Map<String, String> data) {
        if (data == null) return null;
        String link = firstNonBlank(data.get("deep_link"), data.get("deeplink"), data.get("link"));
        if (link != null && isAllowedDeepLink(link)) return link;
        String screen = data.get("screen");
        return screen == null ? null : screenDeepLink(screen);
    }

    public static String deepLinkFromIntent(Intent intent) {
        if (intent == null) return null;
        String link = firstNonBlank(
            intent.getStringExtra("deep_link"),
            intent.getStringExtra("deeplink"),
            intent.getStringExtra("link")
        );
        if (link != null && isAllowedDeepLink(link)) return link;
        return screenDeepLink(intent.getStringExtra("screen"));
    }

    private static String screenDeepLink(String screen) {
        if (screen == null) return null;
        String normalized = screen.trim().toLowerCase();
        switch (normalized) {
            case "home":
            case "map":
            case "saved":
            case "cashback":
            case "nearby":
            case "support":
                return "druvio://app/" + Uri.encode(normalized);
            default:
                return null;
        }
    }

    private static boolean isAllowedDeepLink(String link) {
        Uri uri = Uri.parse(link);
        String scheme = uri.getScheme();
        return "druvio".equalsIgnoreCase(scheme)
            || "https".equalsIgnoreCase(scheme);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) return value.trim();
        }
        return null;
    }
}
