# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Preserve LineNumberTable and SourceFile attributes for proper Crashlytics stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Preserve Capacitor core classes, reflection bridge, and plugin annotations
-keep class com.getcapacitor.** { *; }
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin <fields>;
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
    @com.getcapacitor.PluginMethod <methods>;
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve custom native app plugin classes, messaging services, activities, and helpers
-keep class com.druvio.app.notifications.** { *; }
-keep class com.druvio.app.search.** { *; }
-keep class ee.forgr.capacitor_updater.** { *; }
-keep class io.capawesome.capacitorjs.plugins.appupdate.** { *; }

# Firebase Messaging Service & Notifications
-keep class com.google.firebase.messaging.** { *; }

# Suppress warnings for optional Facebook SDK classes (transitive dependency, not used)
-dontwarn com.facebook.CallbackManager$Factory
-dontwarn com.facebook.CallbackManager
-dontwarn com.facebook.FacebookCallback
-dontwarn com.facebook.login.LoginManager
-dontwarn com.facebook.login.widget.LoginButton
