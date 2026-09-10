package com.druvio.app.notifications;

import android.Manifest;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "DruvioNotifications",
    permissions = @Permission(
        alias = "notifications",
        strings = { Manifest.permission.POST_NOTIFICATIONS }
    )
)
public class DruvioNotificationsPlugin extends Plugin {}
