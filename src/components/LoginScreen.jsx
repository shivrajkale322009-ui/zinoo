import React, { useRef, useState } from 'react';
import { browserLocalPersistence, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, setPersistence, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Smartphone, MapPin, ArrowRight, ChevronLeft, Loader } from 'lucide-react';

const ensureUserDoc = async (user) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { uid: user.uid, name: user.displayName || '', email: user.email || '', phone: user.phoneNumber || '', permissions: { buyer: true, seller: false, admin: false }, createdAt: serverTimestamp() });
  }
  return (await getDoc(ref)).data();
};

function GoogleMark() {
  return <svg className="login-google-mark" viewBox="0 0 48 48" aria-hidden="true"><path className="google-yellow" d="M43.6 20H24v8h11.3C33.7 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/><path className="google-red" d="M6.3 14.7l6.6 4.9C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.3 4 9.7 8.5 6.3 14.7z"/><path className="google-green" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.5-11.3-8.3l-6.6 5.1C9.5 39.3 16.2 44 24 44z"/><path className="google-blue" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/></svg>;
}

function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('home');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authRequestInFlight = useRef(false);
  const finishLogin = async (user) => {
    const userData = await ensureUserDoc(user);
    onLogin(user, userData.permissions ?? userData);
  };
  const handleGoogleLogin = async () => {
    if (authRequestInFlight.current) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    try { await setPersistence(auth, browserLocalPersistence); const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); await finishLogin((await signInWithPopup(auth, provider)).user); }
    catch (err) { setError(err?.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled before it finished. Please try again.' : `Google sign-in failed${err?.code ? ` (${err.code})` : ''}. Please try again.`); }
    finally { authRequestInFlight.current = false; setLoading(false); }
  };
  const handleSendOtp = async (event) => {
    event.preventDefault(); if (authRequestInFlight.current) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    try { if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} }); setConfirmationResult(await signInWithPhoneNumber(auth, phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`, window.recaptchaVerifier)); setStep('otp'); }
    catch (err) { setError(`${err?.code || 'otp-error'}: ${err?.message || 'Failed to send OTP. Please try again.'}`); window.recaptchaVerifier?.clear(); window.recaptchaVerifier = null; }
    finally { authRequestInFlight.current = false; setLoading(false); }
  };
  const handleVerifyOtp = async (event) => {
    event.preventDefault(); if (authRequestInFlight.current || !confirmationResult) return;
    authRequestInFlight.current = true; setLoading(true); setError('');
    try { await finishLogin((await confirmationResult.confirm(otp)).user); } catch { setError('Invalid OTP. Please check the code and try again.'); } finally { authRequestInFlight.current = false; setLoading(false); }
  };
  const go = (next) => { setStep(next); setError(''); };
  return <div className="login-screen"><div className="login-orb login-orb-top"/><div className="login-orb login-orb-bottom"/><div id="recaptcha-container"/>
    <div className="login-hero"><div className="login-logo"><MapPin size={36} strokeWidth={2.5}/></div><h1>Dru<span>vio</span></h1><p>India's first hyperlocal platform for verified plot projects around Chakan, Pune</p><div className="login-badges">{['✅ GPS Verified', '🏦 Bank Loan Available', '⭐ Druvio Score'].map((badge) => <span key={badge}>{badge}</span>)}</div></div>
    <div className="login-card">{error && <div className="login-error">⚠️ {error}</div>}
      {step === 'home' && <><h2>Sign in to Druvio</h2><p className="login-subtitle">Find verified plots. Book site visits. Claim cashback.</p><button className="login-google-button" onClick={handleGoogleLogin} disabled={loading}><GoogleMark/>{loading ? 'Signing in...' : 'Continue with Google'}</button><div className="login-divider"><i/><span>or</span><i/></div><button className="login-phone-button" onClick={() => go('phone')} disabled={loading}><Smartphone size={18}/>Continue with Mobile OTP</button><p className="login-terms">By signing in, you agree to Druvio's Terms of Service and Privacy Policy</p></>}
      {step === 'phone' && <form onSubmit={handleSendOtp} className="login-form"><div className="login-form-heading"><button type="button" onClick={() => go('home')} aria-label="Back"><ChevronLeft size={20}/></button><h2>Enter Mobile Number</h2></div><p>We'll send a 6-digit OTP to your Indian mobile number.</p><div className="login-phone-field"><div>🇮🇳 +91</div><input type="tel" className="form-input" placeholder="Enter 10-digit mobile number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))} required autoFocus/></div><button type="submit" disabled={loading || phoneNumber.length !== 10} className="btn-primary login-submit">{loading ? <><Loader size={16} className="spin"/> Sending OTP...</> : <>Send OTP <ArrowRight size={16}/></>}</button></form>}
      {step === 'otp' && <form onSubmit={handleVerifyOtp} className="login-form"><div className="login-form-heading"><button type="button" onClick={() => { setOtp(''); go('phone'); }} aria-label="Back"><ChevronLeft size={20}/></button><h2>Enter OTP</h2></div><p>Enter the 6-digit code sent to <strong>+91 {phoneNumber}</strong></p><input type="number" className="form-input login-otp" placeholder="- - - - - -" value={otp} onChange={(event) => setOtp(event.target.value.slice(0, 6))} required autoFocus/><button type="submit" disabled={loading || otp.length !== 6} className="btn-primary login-submit">{loading ? <><Loader size={16}/> Verifying...</> : <>Verify & Sign In <ArrowRight size={16}/></>}</button><button type="button" onClick={() => { setOtp(''); go('phone'); }} className="login-link">Resend OTP</button></form>}
    </div></div>;
}

export default LoginScreen;
