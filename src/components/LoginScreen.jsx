import React, { useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Smartphone, MapPin, ArrowRight, ChevronLeft, Loader } from 'lucide-react';

// Ensure user document exists in Firestore with a default role
const ensureUserDoc = async (user) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      role: 'buyer', // Default role — upgrade to 'seller' or 'admin' manually in Firestore
      createdAt: serverTimestamp()
    });
  }
  return (await getDoc(ref)).data();
};

function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('home'); // 'home' | 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Google Sign-In ───────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userData = await ensureUserDoc(result.user);
      onLogin(result.user, userData.role);
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Phone OTP – Step 1: Send OTP ────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
      }
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err) {
      const errorMessage = `${err?.code || 'otp-error'}: ${err?.message || 'Failed to send OTP. Please try again.'}`;
      setError(errorMessage);
      console.error('OTP error:', err);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Phone OTP – Step 2: Verify OTP ──────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      const userData = await ensureUserDoc(result.user);
      onLogin(result.user, userData.role);
    } catch (err) {
      setError('Invalid OTP. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #eff6ff 0%, #ffffff 60%, #f0f9ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      {/* LOGO & HERO SECTION */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px 20px',
        textAlign: 'center'
      }}>
        {/* Logo Icon */}
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          marginBottom: 16
        }}>
          <MapPin size={36} color="white" strokeWidth={2.5} />
        </div>

        <h1 style={{
          fontSize: 32,
          fontFamily: 'var(--font-title)',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          Dru<span style={{ color: '#2563eb' }}>vio</span>
        </h1>
        <p style={{
          fontSize: 13,
          color: '#64748b',
          marginTop: 6,
          lineHeight: 1.5,
          maxWidth: 240
        }}>
          India's first hyperlocal platform for verified plot projects around Chakan, Pune
        </p>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['✅ GPS Verified', '🏦 Bank Loan Available', '⭐ Druvio Score'].map((badge) => (
            <span key={badge} style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 20
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* AUTH CARD */}
      <div style={{
        padding: '24px 24px 40px',
        background: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        boxShadow: '0 -8px 30px rgba(37, 99, 235, 0.08)',
        border: '1px solid #e2e8f0',
        borderBottom: 'none'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            marginBottom: 16,
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        {step === 'home' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>
              Sign in to Druvio
            </h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
              Find verified plots. Book site visits. Claim cashback.
            </p>

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '13px 20px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#0f172a',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: 12,
                transition: 'all 0.2s'
              }}
            >
              {/* Google Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.3 4 9.7 8.5 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.7-3.5-11.3-8.3l-6.6 5.1C9.5 39.3 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Phone OTP */}
            <button
              onClick={() => { setStep('phone'); setError(''); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '13px 20px',
                background: '#2563eb',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Smartphone size={18} />
              Continue with Mobile OTP
            </button>

            <p style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              By signing in, you agree to Druvio's Terms of Service and Privacy Policy
            </p>
          </>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button type="button" onClick={() => { setStep('home'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Enter Mobile Number</h2>
            </div>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              We'll send a 6-digit OTP to your Indian mobile number.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                background: '#f1f5f9',
                border: '1.5px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 700,
                color: '#0f172a',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                autoFocus
                style={{ flex: 1 }}
              />
            </div>

            <button type="submit" disabled={loading || phoneNumber.length !== 10} className="btn-primary" style={{ width: '100%', padding: '13px', opacity: phoneNumber.length !== 10 ? 0.6 : 1 }}>
              {loading ? <><Loader size={16} className="spin" /> Sending OTP...</> : <>Send OTP <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Enter OTP</h2>
            </div>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Enter the 6-digit code sent to <strong>+91 {phoneNumber}</strong>
            </p>

            <input
              type="number"
              className="form-input"
              placeholder="- - - - - -"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              required
              autoFocus
              style={{ fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: 700 }}
            />

            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary" style={{ width: '100%', padding: '13px', opacity: otp.length !== 6 ? 0.6 : 1 }}>
              {loading ? <><Loader size={16} /> Verifying...</> : <>Verify & Sign In <ArrowRight size={16} /></>}
            </button>

            <button type="button" onClick={() => { setOtp(''); setStep('phone'); setError(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginScreen;
