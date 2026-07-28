import React from 'react';

export default function CashbackBadge({ amount, label, color }) {
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return null;
  const formattedAmount = new Intl.NumberFormat('en-IN').format(amount);

  return (
    <div className="cashback-badge" style={color ? { '--cashback-badge-color': color } : undefined} aria-label={`₹${formattedAmount} ${label}`}>
      <strong>₹{formattedAmount}</strong>
      <span>{label}</span>
    </div>
  );
}
