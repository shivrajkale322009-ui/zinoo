# Zinoo Android updates

The first Android release with this system is **1.0.6 (2026083006)**. Existing
installs need that Play Store release first. No production deployment or Play
Store upload is performed by the setup scripts. The signed manifest is initially
paused until the device acceptance checks below are complete.

## What happens on a phone

1. Before React mounts, the app checks only locally staged update metadata. It
   verifies the signature, expiry, native build, runtime fingerprint, device
   rollout eligibility, and downloaded checksum. No internet request delays launch.
2. A compatible staged bundle is activated before login or a form can appear.
   Staging is consumed before activation to avoid an activation loop.
3. After a real login/main screen renders, the app acknowledges startup health.
   The updater retains the last successful version. A new bundle that cannot boot
   within 60 seconds rolls back through the native updater to the last successful
   bundle (or the original packaged app). API failures after successful startup
   are not automatically diagnosed as bad releases.
4. Five seconds after screen readiness, the app checks the signed manifest. It
   checks again at most every 15 minutes while visible, and on reconnection.
   Downloads do not reload the current screen. Returning from the SMS app,
   payment app, file picker, or background does not activate an update.
5. Signed releases default to a stable 5% installation cohort. Increasing the
   percentage includes the existing cohort. Device IDs are hashed locally and are
   not sent to the update host. Capgo cloud updates and telemetry are disabled.
6. Google Play availability is checked separately after login. The user chooses
   **Update** to accept Play's flexible download flow. After download, only an
   explicit **Restart to update** action completes it during a running session.
   **Later** dismisses the notice. Sideloaded and offline installs may not receive
   Google Play update information.

There is no automatic promotion to 100% based on elapsed time: review results from
the pilot, then promote deliberately. A paused or revoked manifest clears staging
when the phone next checks it. A previously downloaded, unexpired update may
still activate offline before the phone learns of a pause.

## Signing and compatibility

- `updates/public-key.pem` is shipped with the app. The signing private key is in
  `updates/private/signing-key.pem`, which is ignored by Git. Back it up securely.
  A CI job can supply its own protected path using `ZINOO_UPDATE_SIGNING_KEY`.
- Never upload the private key, commit it, or put it in a `VITE_` environment variable.
- The manifest uses RSA/SHA-256 signatures. Archives use SHA-256 checksums and HTTPS.
  Both the signed download URL and its origin/path are validated before download.
- `updates/android-runtime.json` records the approved Android native build and
  a fingerprint of native source/configuration, plugins, patches and trust key.
  Web-only release packaging refuses to proceed if these inputs change.
- Native releases must increase `versionCode`, update `versionName`, then run
  `npm run android:release:prepare`. Native updates reset old downloaded web assets.
- A changed launcher icon, native plugin, permission, signing public key, Android
  resource, or native code requires a new Android release. Ordinary React/CSS changes
  can use a live update, subject to the applicable store policies.

## Prepare a web-only release

From the repository root:

```powershell
npm run test:updates
npm run build
npm run updates:release -- --version 1.0.6-live.2
```

Use a new unique version for every archive; releases cannot be overwritten. This
creates the ZIP and release metadata under `updates/releases/`, and signs
`updates/android.json` with a 5% rollout. These commands only prepare local files.
Back up the release archives along with release metadata, especially when using CI.

Firebase Hosting's predeploy hook copies the signed manifest and retained archives
into `dist/app-updates/`. Archives are **not** copied into the Android app or into
future update ZIPs. The manifest has no-store caching and supports requests from
the Capacitor origin; immutable archive names use long-lived caching.

Publishing uses the existing Zinoo Firebase Hosting site and therefore also
publishes the current website build. Review the website changes before deploying:

```powershell
npm run build
npm run deploy:hosting
```

Do not publish from a fresh checkout without restoring the release archive store:
the predeploy hook fails if the active archive is missing or has changed. Retain
previous archives so phones using a recently fetched manifest can finish downloads.
The expected production endpoint is `https://zinoo.in/app-updates/android.json`.
Verify that endpoint returns the signed JSON and correct CORS/no-store headers.

## Promote, pause, or roll back

```powershell
# Expand the same release to 25%, then 100% after observing pilot results.
npm run updates:rollout -- --percent 25
npm run build
npm run deploy:hosting

npm run updates:rollout -- --percent 100
npm run build
npm run deploy:hosting

# Stop further installations once devices receive the new manifest.
npm run updates:pause
npm run build
npm run deploy:hosting

# Offer a retained known-good release to all eligible installs of its native build.
npm run updates:rollback -- --version 1.0.6-live.2
npm run build
npm run deploy:hosting
```

Every control change is signed with a higher revision; clients reject older
manifests. A release expires after 90 days unless a newly signed control update
refreshes it. Expiry stops new installations; it does not disable the running app.
Rollback follows the same next-launch behavior and never forces an active form to reload.
The static manifest currently targets one exact Android native build at a time.
Older native builds continue working and obtain upgrades through Google Play.

## Required phone acceptance checks before the first production rollout

1. Install the new native build. Test mandatory Android login and session restoration.
2. Host a signed test release matching that build. Verify it downloads while browsing
   and that the current screen does not reload.
3. Enter a form; switch to SMS/Google login/another app and back. Verify the same
   screen and draft remain. Fully close and relaunch; verify the new bundle starts.
4. Test offline launch with no pending update and with a completed pending update.
5. In an isolated test release, deliberately break startup or omit readiness.
   Verify native rollback within the readiness timeout, including closing the app
   during the failed launch. Verify the failed release is not retried afterwards.
6. Check signature/checksum rejection, reduced rollout/pause, and a compatible
   known-good rollback release.
7. Install through Google Play internal testing, then publish a higher native build
   to that testing track. Verify **Update**, background download, **Later**, and
   **Restart to update**. A locally sideloaded APK cannot prove Play delivery works.
8. Check that the Play native upgrade discards pending assets from the older build.

Reference implementations: [Capgo updater](https://capgo.app/docs/plugins/updater/api/)
and [Google Play flexible updates](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java).
