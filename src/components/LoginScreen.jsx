import React, { useCallback, useEffect, useRef, useState } from 'react';
import { signInWithCredential, signInWithPopup, signInWithRedirect, GoogleAuthProvider, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { auth, firebaseConfigDiagnostics } from '../firebaseConfig';
import { ArrowRight, ChevronLeft, Loader, ShieldCheck } from 'lucide-react';
import { assertWebOtpOnline, normalizeIndianMobileNumber, normalizePhoneAuthError, phoneAuthErrorMessage } from '../utils/phoneAuth';
import { authFailureDetails, authTrace, sanitizeAuthDiagnosticMessage, startAuthAttempt } from '../utils/authDiagnostics';
import { createWebRecaptchaLifecycle } from '../utils/webRecaptchaLifecycle';

const POPUP_FALLBACK_ERRORS = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/web-storage-unsupported'
]);

const googleAuthErrorMessage = (err, phase) => {
  if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'ERROR_CANCELED') return 'Google sign-in was cancelled before it finished. Please try again.';
  if (err?.code === 'auth/unauthorized-domain') return 'Google sign-in is not enabled for this domain. Please contact Zinoo support.';
  if (err?.code === 'auth/operation-not-allowed') return 'Google sign-in is not enabled for this Firebase project. Please contact Zinoo support.';
  if (err?.code === 'auth/network-request-failed') return 'Google sign-in could not reach Firebase. Check your connection and try again.';
  if (/\b(?:10|DEVELOPER_ERROR)\b/i.test(err?.message || '')) return 'Google sign-in configuration does not match this Android build (DEVELOPER_ERROR 10).';
  if (/\b(?:12501|SIGN_IN_CANCELLED)\b/i.test(err?.message || '')) return 'Google sign-in was cancelled before it finished. Please try again.';
  if (/\b(?:12502|SIGN_IN_CURRENTLY_IN_PROGRESS)\b/i.test(err?.message || '')) return 'Google sign-in is already in progress.';
  return `Google sign-in could not be completed${err?.code ? ` (${err.code})` : ''}. Please try again.`;
};

function LoginScreen({ onBackToLanding, initialStep = 'home', initialPhone = '', presentation = 'screen' }) {
  const [step, setStep] = useState(initialStep);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(25);
  const otpInputRefs = useRef([]);
  const mountedRef = useRef(true);
  const authRequestInFlight = useRef(false);
  const webRecaptchaLifecycleRef = useRef(null);
  const nativePhoneListenerHandlesRef = useRef([]);
  const nativeVerificationIdRef = useRef(null);
  const nativeAutoCodeRef = useRef(null);
  const nativeRequestTimeoutRef = useRef(null);
  const appVersionRef = useRef(null);
  const brandTapCountRef = useRef(0);
  const brandTapResetRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getAppVersion = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return 'web';
    if (appVersionRef.current) return appVersionRef.current;
    try {
      const info = await CapacitorApp.getInfo();
      appVersionRef.current = `${info.version || 'unknown'} (${info.build || 'unknown'})`;
    } catch (_) {
      appVersionRef.current = 'unknown';
    }
    return appVersionRef.current;
  }, []);

  const logPhoneAuthFailure = useCallback(async (phase, error) => {
    const diagnostic = normalizePhoneAuthError(error);
    const verificationFailure = ['auto-retrieval', 'instant-verification', 'code-verification'].includes(phase);
    authTrace(verificationFailure ? 'OTP_VERIFICATION_FAILED' : 'OTP_REQUEST_FAILED', authFailureDetails({
      ...error,
      name: diagnostic.exceptionClass,
      code: diagnostic.code,
      message: diagnostic.message,
      cause: diagnostic.cause
    }, {
      phase,
      flow: 'phone',
      sdk: '@capacitor-firebase/authentication + firebase/auth',
      normalizedCode: diagnostic.code,
      nativeExceptionClass: diagnostic.exceptionClass,
      nativeCauseClass: diagnostic.causeClass,
      platform: Capacitor.getPlatform(),
      appVersion: await getAppVersion()
    }));
    return diagnostic;
  }, [getAppVersion]);

  const clearNativePhoneAttempt = useCallback(async () => {
    if (nativeRequestTimeoutRef.current) window.clearTimeout(nativeRequestTimeoutRef.current);
    nativeRequestTimeoutRef.current = null;
    nativeVerificationIdRef.current = null;
    nativeAutoCodeRef.current = null;
    const handles = nativePhoneListenerHandlesRef.current.splice(0);
    await Promise.allSettled(handles.map((handle) => handle.remove()));
  }, []);
  const clearRecaptcha = useCallback(() => {
    webRecaptchaLifecycleRef.current?.invalidate('explicit-cleanup');
  }, []);
  const getWebRecaptchaLifecycle = useCallback(() => {
    if (!webRecaptchaLifecycleRef.current) {
      webRecaptchaLifecycleRef.current = createWebRecaptchaLifecycle({
        getContainer: () => document.getElementById('recaptcha-container'),
        createVerifier: (container, callbacks) => new RecaptchaVerifier(auth, container, callbacks),
        onEvent: ({ type, reason }) => {
          const container = document.getElementById('recaptcha-container');
          authTrace(`WEB_RECAPTCHA_${type.toUpperCase()}`, {
            flow: 'phone',
            sdk: 'firebase/auth',
            reason: reason || null,
            origin: window.location.origin,
            containerPresent: Boolean(container),
            containerConnected: Boolean(container?.isConnected),
            parentPresent: Boolean(container?.parentElement)
          });
          if (type === 'expired') setError('Security verification expired. Please try again.');
          if (type === 'error') setError('Security verification failed. Please try again.');
        }
      });
    }
    return webRecaptchaLifecycleRef.current;
  }, []);
  useEffect(() => {
    if (step !== 'otp' || resendSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendSeconds]);

  useEffect(() => () => {
    clearRecaptcha();
    void clearNativePhoneAttempt();
    if (brandTapResetRef.current) window.clearTimeout(brandTapResetRef.current);
  }, [clearNativePhoneAttempt, clearRecaptcha]);

  useEffect(() => {
    authTrace('AUTH_PLATFORM', {
      platform: Capacitor.getPlatform(),
      isNativePlatform: Capacitor.isNativePlatform()
    });
    authTrace('WEB_ORIGIN', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
  }, []);

  const confirmNativePhoneCredential = useCallback(async (verificationId, verificationCode, phase) => {
    try {
      authTrace('OTP_VERIFICATION_START', { flow: 'phone', sdk: 'firebase/auth', phase });
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      authTrace('NATIVE_CREDENTIAL_CREATED', {
        flow: 'phone',
        phase,
        providerId: credential.providerId,
        verificationIdPresent: Boolean(verificationId)
      });
      authTrace('WEB_SIGN_IN_WITH_CREDENTIAL_START', {
        flow: 'phone',
        phase,
        origin: window.location.origin,
        authDomain: auth.config.authDomain
      });
      let user;
      try {
        user = (await signInWithCredential(auth, credential)).user;
        authTrace('WEB_SIGN_IN_WITH_CREDENTIAL_SUCCESS', {
          flow: 'phone',
          phase,
          uidPresent: Boolean(user?.uid)
        });
      } catch (error) {
        authTrace('WEB_SIGN_IN_WITH_CREDENTIAL_FAILED', authFailureDetails(error, {
          flow: 'phone',
          phase,
          origin: window.location.origin,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          authDomain: auth.config.authDomain
        }));
        throw error;
      }
      authTrace('OTP_VERIFICATION_SUCCESS', { flow: 'phone', sdk: 'firebase/auth', uidPresent: Boolean(user?.uid) });
      await clearNativePhoneAttempt();
      return true;
    } catch (err) {
      const diagnostic = await logPhoneAuthFailure(phase, err);
      setError(phoneAuthErrorMessage(diagnostic));
      return false;
    }
  }, [clearNativePhoneAttempt, logPhoneAuthFailure]);

  const startNativePhoneAuth = useCallback(async (phoneNumberToVerify) => {
    await clearNativePhoneAttempt();
    authTrace('NATIVE_AUTH_START', {
      flow: 'phone',
      platform: Capacitor.getPlatform(),
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
    authTrace('OTP_REQUEST_START', { flow: 'phone', sdk: '@capacitor-firebase/authentication', platform: 'android', appVersion: await getAppVersion() });
    authTrace('OTP_NUMBER_NORMALIZED', { flow: 'phone', format: '+91**********', validE164: /^\+91[6-9]\d{9}$/.test(phoneNumberToVerify) });

    const codeSentHandle = await FirebaseAuthentication.addListener('phoneCodeSent', async ({ verificationId }) => {
      if (nativeRequestTimeoutRef.current) window.clearTimeout(nativeRequestTimeoutRef.current);
      nativeRequestTimeoutRef.current = null;
      nativeVerificationIdRef.current = verificationId;
      setConfirmationResult({ platform: 'android', verificationId });
      setResendSeconds(25);
      setStep('otp');
      setLoading(false);
      authTrace('OTP_REQUEST_SUCCESS', { flow: 'phone', sdk: '@capacitor-firebase/authentication', verificationIdPresent: Boolean(verificationId), platform: 'android', appVersion: await getAppVersion() });
      if (nativeAutoCodeRef.current) {
        const autoCode = nativeAutoCodeRef.current;
        nativeAutoCodeRef.current = null;
        void confirmNativePhoneCredential(verificationId, autoCode, 'auto-retrieval');
      }
    });

    const completedHandle = await FirebaseAuthentication.addListener('phoneVerificationCompleted', ({ verificationCode }) => {
      if (!verificationCode) {
        void logPhoneAuthFailure('instant-verification', new Error('Native instant verification completed without a bridgeable SMS code.'));
        return;
      }
      const verificationId = nativeVerificationIdRef.current;
      if (!verificationId) {
        nativeAutoCodeRef.current = verificationCode;
        return;
      }
      void confirmNativePhoneCredential(verificationId, verificationCode, 'auto-retrieval');
    });

    const failedHandle = await FirebaseAuthentication.addListener('phoneVerificationFailed', async (event) => {
      const diagnostic = await logPhoneAuthFailure('verification-failed', event);
      setError(phoneAuthErrorMessage(diagnostic));
      setLoading(false);
      await clearNativePhoneAttempt();
    });

    nativePhoneListenerHandlesRef.current.push(codeSentHandle, completedHandle, failedHandle);
    nativeRequestTimeoutRef.current = window.setTimeout(async () => {
      const timeoutError = { code: 'auth/session-expired', message: 'Phone verification timed out before a code was sent.' };
      await logPhoneAuthFailure('verification-timeout', timeoutError);
      setError('Phone verification timed out. Please request a new OTP.');
      setLoading(false);
      await clearNativePhoneAttempt();
    }, 65000);

    await FirebaseAuthentication.signInWithPhoneNumber({
      phoneNumber: phoneNumberToVerify,
      skipNativeAuth: true,
      timeout: 60
    });
    authTrace('NATIVE_AUTH_SUCCESS', {
      flow: 'phone',
      sdk: '@capacitor-firebase/authentication',
      requestAccepted: true
    });
  }, [clearNativePhoneAttempt, confirmNativePhoneCredential, getAppVersion, logPhoneAuthFailure]);
  const handleGoogleLogin = async () => {
    if (authRequestInFlight.current) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    let phase = 'authenticate';
    let authMethod = Capacitor.isNativePlatform() ? 'native' : 'popup';
    let popupStarted = false;
    const attemptId = startAuthAttempt();
    try {
      const authBridgeDiagnostics = {
        platform: Capacitor.getPlatform(),
        isNativePlatform: Capacitor.isNativePlatform(),
        firebaseAuthenticationAvailable: Capacitor.isPluginAvailable('FirebaseAuthentication'),
        registeredPluginProxies: Object.keys(Capacitor.Plugins || {}),
        firebaseAuthenticationExists: Boolean(FirebaseAuthentication),
        signInWithGoogleCallable: typeof FirebaseAuthentication?.signInWithGoogle === 'function'
      };
      console.info('[Zinoo Auth] Capacitor bridge diagnostics', authBridgeDiagnostics);
      authTrace('Google login started', {
        attemptId,
        origin: window.location.origin,
        pathname: window.location.pathname,
        authDomain: auth.config.authDomain,
        currentUserPresent: Boolean(auth.currentUser),
        method: Capacitor.isNativePlatform() ? 'native' : 'popup-first'
      });

      if (auth.currentUser) {
        // A previous OAuth attempt may have succeeded before profile loading
        // failed. Reuse that session instead of forcing another Google popup.
        return;
      } else if (Capacitor.isNativePlatform()) {
        if (!authBridgeDiagnostics.firebaseAuthenticationAvailable) {
          throw new Error('FirebaseAuthentication is not registered in the installed native app. Rebuild and reinstall the Android APK after running Capacitor sync.');
        }
        authTrace('GOOGLE_SIGNIN_START', { flow: 'google', sdk: '@capacitor-firebase/authentication' });
        const result = await FirebaseAuthentication.signInWithGoogle();
        authTrace('GOOGLE_ACCOUNT_SELECTED', { flow: 'google', credentialPresent: Boolean(result?.credential) });
        const idToken = result.credential?.idToken;
        const accessToken = result.credential?.accessToken;
        if (!idToken) throw new Error('Google Sign-In did not return an ID token.');
        authTrace('GOOGLE_TOKEN_RECEIVED', { flow: 'google', idTokenPresent: true, accessTokenPresent: Boolean(accessToken) });
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        authTrace('GOOGLE_CREDENTIAL_CREATED', { flow: 'google', providerId: credential.providerId });
        const user = (await signInWithCredential(auth, credential)).user;
        authTrace('GOOGLE_FIREBASE_SIGNIN_SUCCESS', { flow: 'google', uidPresent: Boolean(user?.uid) });
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        let user;
        try {
          phase = 'popup-started';
          popupStarted = true;
          user = (await signInWithPopup(auth, provider)).user;
          authTrace('signInWithPopup resolved', {
            userPresent: Boolean(user),
            uidPresent: Boolean(user?.uid),
            providerIds: user?.providerData?.map((item) => item.providerId) || [],
            currentUserPresent: Boolean(auth.currentUser)
          });
          if (import.meta.env.DEV) {
            console.info('[Zinoo Auth] Google popup result', {
              authenticatedResult: Boolean(user),
              currentUserPresent: Boolean(auth.currentUser),
              method: 'popup',
              origin: window.location.origin
            });
          }
        } catch (err) {
          authTrace('signInWithPopup ERROR', {
            code: err?.code || 'unknown',
            message: sanitizeAuthDiagnosticMessage(err?.message),
            currentUserPresent: Boolean(auth.currentUser),
            willFallbackToRedirect: presentation !== 'modal' && POPUP_FALLBACK_ERRORS.has(err?.code)
          });
          if (presentation === 'modal' || !POPUP_FALLBACK_ERRORS.has(err?.code)) throw err;
          // Some browsers and embedded webviews disallow Firebase's popup even
          // when sign-in starts from a click. Continue in the current tab instead.
          authMethod = 'redirect-fallback';
          phase = 'redirect-started';
          await signInWithRedirect(auth, provider);
          return;
        }
      }
    }
    catch (err) {
      authTrace('Google login ERROR', {
        ...authFailureDetails(err, { flow: 'google', sdk: '@capacitor-firebase/authentication + firebase/auth' }),
        method: authMethod, phase, currentUserPresent: Boolean(auth.currentUser)
      });
      console.error('[Zinoo Auth] Google sign-in failed', {
        code: err?.code,
        message: err?.message,
        method: authMethod,
        phase,
        origin: typeof window === 'undefined' ? 'unknown' : window.location.origin,
        popupStarted,
        redirectResultExists: false,
        platform: Capacitor.getPlatform(),
        isNativePlatform: Capacitor.isNativePlatform(),
        firebaseAuthenticationAvailable: Capacitor.isPluginAvailable('FirebaseAuthentication')
      });
      setError(googleAuthErrorMessage(err, phase));
    }
    finally { authRequestInFlight.current = false; setLoading(false); }
  };
  const handleBrandTap = () => {
    brandTapCountRef.current += 1;
    if (brandTapCountRef.current === 5) {
      if (brandTapResetRef.current) window.clearTimeout(brandTapResetRef.current);
      brandTapCountRef.current = 0;
      brandTapResetRef.current = null;
      void handleGoogleLogin();
      return;
    }
    if (!brandTapResetRef.current) {
      brandTapResetRef.current = window.setTimeout(() => {
        brandTapCountRef.current = 0;
        brandTapResetRef.current = null;
      }, 2500);
    }
  };
  const handleSendOtp = async (event) => {
    event.preventDefault(); if (authRequestInFlight.current) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    const normalizedPhone = normalizeIndianMobileNumber(phoneNumber);
    try {
      if (!normalizedPhone) throw Object.assign(new Error('Invalid Indian mobile number.'), { code: 'auth/invalid-phone-number' });
      if (Capacitor.getPlatform() === 'android') {
        if (!Capacitor.isPluginAvailable('FirebaseAuthentication')) {
          throw Object.assign(new Error('Native Firebase Authentication is unavailable in this Android build.'), { code: 'auth/app-not-authorized' });
        }
        await startNativePhoneAuth(normalizedPhone);
        return;
      }
      assertWebOtpOnline(navigator.onLine);
      console.info('[Zinoo Auth] Web phone OTP request prepared', {
        phoneNumber: normalizedPhone,
        isE164IndianNumber: /^\+91[6-9]\d{9}$/.test(normalizedPhone),
        platform: Capacitor.getPlatform(),
        projectId: firebaseConfigDiagnostics.projectId,
        authDomain: firebaseConfigDiagnostics.authDomain,
        origin: window.location.origin
      });
      const recaptchaLifecycle = getWebRecaptchaLifecycle();
      const result = await recaptchaLifecycle.execute((verifier) => {
        const recaptchaHost = document.getElementById('recaptcha-container');
        const recaptchaBounds = recaptchaHost?.getBoundingClientRect();
        console.info('[Zinoo Auth] Calling signInWithPhoneNumber', {
          firebaseAppName: auth.app.name,
          authAppName: auth.app.name,
          authProjectId: auth.app.options.projectId,
          phoneNumberFormat: '+91**********',
          verifierPresent: Boolean(verifier),
          verifierIsCurrent: verifier === recaptchaLifecycle.getCurrent(),
          verifierState: recaptchaLifecycle.getState(),
          containerPresent: Boolean(recaptchaHost),
          containerConnected: Boolean(recaptchaHost?.isConnected),
          containerWidth: Math.round(recaptchaBounds?.width || 0),
          containerHeight: Math.round(recaptchaBounds?.height || 0),
          requestAlreadyInFlight: authRequestInFlight.current,
          requestStartedAt: new Date().toISOString(),
          lifecycleMode: 'lazy-firebase-managed-render'
        });
        return signInWithPhoneNumber(auth, normalizedPhone, verifier);
      });
      if (!mountedRef.current) return;
      console.info('[Zinoo Auth] signInWithPhoneNumber resolved', {
        confirmationResultPresent: Boolean(result),
        verificationIdPresent: Boolean(result?.verificationId),
        verifierClearedAfterRequest: !webRecaptchaLifecycleRef.current?.getCurrent()
      });
      setConfirmationResult(result);
      setResendSeconds(25);
      setStep('otp');
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[Zinoo Auth] signInWithPhoneNumber rejected', {
        name: err?.name || 'Error',
        code: err?.code || 'unknown',
        message: err?.message || 'Unknown Firebase phone authentication error',
        customData: err?.customData ?? null,
        phoneNumberFormat: normalizedPhone ? '+91**********' : null,
        verifierPresent: Boolean(webRecaptchaLifecycleRef.current?.getCurrent()),
        projectId: firebaseConfigDiagnostics.projectId,
        authDomain: firebaseConfigDiagnostics.authDomain,
        origin: window.location.origin
      });
      const diagnostic = await logPhoneAuthFailure('request-code', err);
      console.info('[Zinoo Auth] Phone authentication context', {
        hostname: window.location.hostname,
        authDomain: firebaseConfigDiagnostics.authDomain,
        projectId: firebaseConfigDiagnostics.projectId
      });
      setError(phoneAuthErrorMessage(diagnostic));
    }
    finally {
      authRequestInFlight.current = false;
      if (mountedRef.current) setLoading(false);
    }
  };
  const handleVerifyOtp = async (event) => {
    event.preventDefault(); if (authRequestInFlight.current || !confirmationResult) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    try {
      if (confirmationResult.platform === 'android') {
        await confirmNativePhoneCredential(confirmationResult.verificationId, otp, 'code-verification');
        return;
      }
      await confirmationResult.confirm(otp);
    } catch (err) {
      if (!mountedRef.current) return;
      const diagnostic = await logPhoneAuthFailure('code-verification', err);
      setError(phoneAuthErrorMessage(diagnostic));
    } finally {
      authRequestInFlight.current = false;
      if (mountedRef.current) setLoading(false);
    }
  };
  const go = (next) => {
    clearRecaptcha();
    if (next !== 'otp') void clearNativePhoneAttempt();
    if (next === 'phone') {
      setConfirmationResult(null);
      setOtp('');
    }
    setStep(next);
    setError('');
  };
  const updateOtpDigit = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const digits = otp.padEnd(6, ' ').split(' ');
    digits[index] = digit || ' ';
    setOtp(digits.join('').replace(/ /g, ''));
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setOtp(pasted);
    otpInputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };
  const formattedPhone = phoneNumber ? `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}` : '';

  return <div className={`login-screen ${presentation === 'modal' ? 'login-screen-modal' : ''}`} role={presentation === 'modal' ? 'dialog' : undefined} aria-modal={presentation === 'modal' ? 'true' : undefined} aria-label={presentation === 'modal' ? 'Sign in to continue' : undefined}>
    {onBackToLanding && <button type="button" className="login-back-to-site" onClick={onBackToLanding} aria-label="Close login"><ChevronLeft size={20} /></button>}
    <header className="login-hero">
      <button type="button" className="login-brand-trigger" onClick={handleBrandTap} aria-label="Zinoo">
        <img className="login-brand-wordmark" src="/brand/zinoo-logo.png" alt="Zinoo"/>
      </button>
      <p>Find verified plots. Book visits. Claim cashback.</p>
    </header>

    <main className="login-auth-panel">{error && <div className="login-error">⚠️ {error}</div>}
      {(step === 'home' || step === 'phone') && <form onSubmit={handleSendOtp} className="login-form login-phone-entry">
        <label className="login-mobile-label" htmlFor="login-mobile-number">Mobile number</label>
        <label className="login-phone-field"><span>+91</span><input id="login-mobile-number" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Enter mobile number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))} disabled={loading} required autoFocus/></label>
        <button id="login-send-otp-button" type="submit" disabled={loading || phoneNumber.length !== 10} className="login-submit">{loading ? <><Loader className="spin"/> Verifying...</> : 'Verify'}</button>
      </form>}
      {step === 'otp' && <form onSubmit={handleVerifyOtp} className="login-form">
        <div className="login-form-heading"><div><h1>Verify OTP</h1><p>Enter the 6-digit code sent to<br/><strong>+91 {formattedPhone}</strong></p></div></div>
        <div className="login-otp-cells" onPaste={handleOtpPaste}>{Array.from({ length: 6 }, (_, index) => <input key={index} ref={(element) => { otpInputRefs.current[index] = element; }} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength="1" value={otp[index] || ''} onChange={(event) => updateOtpDigit(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(index, event)} aria-label={`OTP digit ${index + 1}`} autoFocus={index === 0}/>)}</div>
        <p className="login-resend">Didn&apos;t receive OTP? {resendSeconds > 0 ? <>Resend in <strong>00:{String(resendSeconds).padStart(2, '0')}</strong></> : <button type="button" onClick={() => go('phone')}>Resend now</button>}</p>
        <button type="submit" disabled={loading || otp.length !== 6} className="login-submit">{loading ? <><Loader className="spin"/> Verifying...</> : <>Verify &amp; Continue <ArrowRight/></>}</button>
        <p className="login-form-security"><ShieldCheck/> Your verification helps us keep Zinoo secure.</p>
      </form>}
    </main>
    <footer className="login-terms">By signing in, you agree to Zinoo&apos;s <a href="/terms-and-conditions">Terms of Service</a> and <a href="/privacy-policy.html">Privacy Policy</a></footer>
  </div>;
}

export default LoginScreen;
