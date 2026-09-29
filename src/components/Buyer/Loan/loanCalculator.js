export function calculateLoan(principal, annualInterest, months) {
  if (principal <= 0 || months <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
  const rate = annualInterest / 1200;
  const emi = rate === 0 ? principal / months : principal * rate / (1 - (1 + rate) ** -months);
  const totalPayment = emi * months;
  return { emi, totalInterest: Math.max(0, totalPayment - principal), totalPayment };
}
