import { useEffect, useRef, useState } from 'react';
import { Check, Home, LockKeyhole, ShieldCheck, X } from 'lucide-react';

const BENEFITS = [
  'View Verified Projects',
  'Contact Sellers Directly',
  'Book Site Visits',
  'Save Favourite Projects',
  'Earn Cashback on Booking'
];

export default function LeadCaptureModal({ intent, onClose, onContinue }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const submit = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanName.length < 2 || cleanPhone.length !== 10) return;
    onContinue({ ...intent, name: cleanName, phone: cleanPhone });
  };

  return (
    <div className="lead-capture-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="lead-capture-modal" role="dialog" aria-modal="true" aria-labelledby="lead-capture-title">
        <button type="button" className="lead-capture-close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="lead-capture-mark" aria-hidden="true">
          <Home />
          <span><LockKeyhole /></span>
        </div>
        <header>
          <h2 id="lead-capture-title">Continue to View This Property</h2>
          <p>Enter your details to continue exploring verified plots on Zinoo.</p>
        </header>
        <form onSubmit={submit}>
          <label>
            <span>Full Name</span>
            <input ref={nameRef} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" autoComplete="name" required />
          </label>
          <label>
            <span>Mobile Number</span>
            <div className="lead-phone-field"><strong>+91</strong><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter 10-digit number" inputMode="numeric" autoComplete="tel-national" required /></div>
          </label>
          <button type="submit" className="lead-capture-submit" disabled={name.trim().length < 2 || phone.length !== 10}>Continue</button>
        </form>
        <p className="lead-security"><ShieldCheck /> Your details are safe and secure.</p>
        <div className="lead-benefits">
          <strong>Why continue with Zinoo?</strong>
          <div>{BENEFITS.map((benefit) => <span key={benefit}><Check /> {benefit}</span>)}</div>
        </div>
        <p className="lead-legal">By continuing, you agree to Zinoo&apos;s <a href="/terms-and-conditions">Terms of Service</a> and <a href="/privacy-policy.html">Privacy Policy</a>.</p>
      </section>
    </div>
  );
}
