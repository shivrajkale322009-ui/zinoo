import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { calculateLoan } from './loanCalculator';
import './buyerLoan.css';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const supportPhone = '918468845210';

function Slider({ id, label, value, max, min = 0, step, display, onChange }) {
  const [draft, setDraft] = useState(null);
  const unit = id === 'loan-interest' ? '%' : id === 'loan-tenure' ? 'months' : '₹';
  const normalize = (number) => Math.min(max, Math.max(min, Number(number.toFixed(step < 1 ? 1 : 0))));
  const commit = () => {
    if (draft !== null && draft !== '' && Number.isFinite(Number(draft))) onChange(normalize(Number(draft)));
    setDraft(null);
  };
  const progress = max > min ? Math.max(0, Math.min(100, (value - min) / (max - min) * 100)) : 0;
  return <div className="buyer-loan-field">
    <div className="buyer-loan-field-heading">
      <label htmlFor={`${id}-number`}>{label}</label>
      <div className="buyer-loan-number-box">
        {unit === '₹' && <span aria-hidden="true">₹</span>}
        <input id={`${id}-number`} type="number" inputMode={step < 1 ? 'decimal' : 'numeric'} min={min} max={max} step={step < 1 ? step : 1} value={draft ?? value} aria-label={`${label}${unit === 'months' ? ' in months' : unit === '₹' ? ' in rupees' : ' in percent'}`} onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const number = Number(next);
          if (next !== '' && Number.isFinite(number) && number >= min && number <= max) onChange(normalize(number));
        }} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
        {unit !== '₹' && <span aria-hidden="true">{unit}</span>}
      </div>
    </div>
    <input id={id} aria-label={label} type="range" min={min} max={max} step={step < 1 ? step : 1} value={value} style={{ '--loan-progress': `${progress}%` }} aria-valuetext={display} onChange={(event) => { setDraft(null); onChange(Number(event.target.value)); }} />
  </div>;
}

export default function BuyerLoanScreen({ onBack, initialPlotPrice }) {
  const requestedPrice = Number(initialPlotPrice);
  const startingPrice = Number.isFinite(requestedPrice) && requestedPrice > 0
    ? Math.min(3000000, Math.max(400000, requestedPrice))
    : 1500000;
  const [price, setPrice] = useState(startingPrice);
  const [downPayment, setDownPayment] = useState(Math.round(startingPrice * 0.2));
  const [interest, setInterest] = useState(10);
  const [months, setMonths] = useState(60);
  const principal = price - downPayment;
  const estimate = calculateLoan(principal, interest, months);
  const tenure = [Math.floor(months / 12) ? `${Math.floor(months / 12)} ${months >= 24 ? 'years' : 'year'}` : '', months % 12 ? `${months % 12} ${months % 12 === 1 ? 'month' : 'months'}` : ''].filter(Boolean).join(' ');
  const supportMessage = [
    '*Plot Loan Enquiry*',
    '',
    `*Loan required: ${money(principal)}*`,
    '',
    '*Purchase Details*',
    `• Plot price: ${money(price)}`,
    `• Down payment: ${money(downPayment)}`,
    '',
    '*Loan Preferences*',
    `• Annual interest: ${interest}%`,
    `• Tenure: ${tenure}`,
    '',
    '*Repayment Estimate*',
    `• Monthly EMI: *${money(estimate.emi)}*`,
    `• Total interest: ${money(estimate.totalInterest)}`,
    `• Total loan repayment: ${money(estimate.totalPayment)}`,
    '',
    'Please advise on loan eligibility, available options and required documents.'
  ].join('\n');
  const supportUrl = `https://wa.me/${supportPhone}?text=${encodeURIComponent(supportMessage)}`;

  return <main className="buyer-primary-screen buyer-loan-screen" aria-labelledby="buyer-loan-title">
    <div className="buyer-loan-inner">
      <header className="buyer-loan-banner">
        <div className="buyer-loan-banner-title">
          <button type="button" className="buyer-loan-back" onClick={onBack} aria-label="Back to previous buyer tab"><ArrowLeft size={21} /></button>
          <h1 id="buyer-loan-title">Loan Tool</h1>
        </div>
      </header>
      <section className="buyer-loan-controls" aria-label="Loan details">
        <Slider id="loan-plot-price" label="Plot price" value={price} min={400000} max={3000000} step={10000} display={money(price)} onChange={(value) => { setPrice(value); setDownPayment((current) => Math.min(current, value)); }} />
        <Slider id="loan-down-payment" label="Down payment" value={downPayment} max={price} step={10000} display={money(downPayment)} onChange={setDownPayment} />
        <div className="buyer-loan-principal"><div><span>Loan amount</span></div><output>{money(principal)}</output></div>
        <Slider id="loan-interest" label="Annual interest" value={interest} max={36} step={0.1} display={`${interest}%`} onChange={setInterest} />
        <Slider id="loan-tenure" label="Tenure" value={months} min={1} max={60} step={1} display={tenure} onChange={setMonths} />
      </section>
      <section className="buyer-loan-results" aria-label="Loan estimate" aria-live="polite" aria-atomic="true">
        <div className="buyer-loan-result buyer-loan-emi"><span>Estimated monthly EMI</span><strong>{money(estimate.emi)}</strong></div>
        <div className="buyer-loan-result"><span>Total interest</span><strong>{money(estimate.totalInterest)}</strong></div>
        <div className="buyer-loan-result"><span>Total payment</span><strong>{money(estimate.totalPayment)}</strong></div>
      </section>
      <a className="buyer-loan-support" href={supportUrl} target="_blank" rel="noopener noreferrer">
        <svg className="buyer-loan-whatsapp-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.16 1.59 5.97L0 24l6.26-1.64a11.95 11.95 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.46-8.42ZM12.04 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.38a9.86 9.86 0 0 1-1.52-5.25c0-5.47 4.45-9.92 9.92-9.92a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.03c0 5.47-4.45 9.92-9.94 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.28.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.35Z" />
        </svg>
        WHATSAPP FOR LOAN SUPPORT
      </a>
    </div>
  </main>;
}


