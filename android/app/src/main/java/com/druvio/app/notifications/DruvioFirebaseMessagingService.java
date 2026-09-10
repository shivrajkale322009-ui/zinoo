package com.druvio.app.notifications;

import android.Manifest;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.druvio.app.MainActivity;
import com.druvio.app.R;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DruvioFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "DruvioFCM";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        DruvioFcmManager.handleNewToken(token);
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);
        List<String> dataKeys = new ArrayList<>(message.getData().keySet());
        Collections.sort(dataKeys);
        Log.d(TAG, "Notification received. id=" + message.getMessageId()
            + ", hasNotification=" + (message.getNotification() != null)
            + ", dataKeys=" + dataKeys);

        String title = valueOrDefault(message.getData().get("title"), "Druvio");
        String body = message.getData().get("body");
        if (message.getNotification() != null) {
            title = valueOrDefault(message.getNotification().getTitle(), title);
            body = valueOrDefault(message.getNotification().getBody(), body);
        }
        if (body == null || body.trim().isEmpty()) body = "You have a new update.";

        showNotification(title, body, DruvioFcmManager.deepLinkFromData(message.getData()), message.getMessageId());
    }

    private void showNotification(String title, String body, String deepLink, String messageId) {
        DruvioFcmManager.createNotificationChannel(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Notification not displayed because permission is not granted.");
            return;
        }

        Intent intent = new Intent(this, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra("druvio_notification_tap", true);
        if (deepLink != null) intent.setData(Uri.parse(deepLink));

        int requestCode = messageId == null ? (int) System.currentTimeMillis() : messageId.hashCode();
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, DruvioFcmManager.CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_druvio)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(pendingIntent);
        NotificationManagerCompat.from(this).notify(requestCode, builder.build());
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value;
    }
}
