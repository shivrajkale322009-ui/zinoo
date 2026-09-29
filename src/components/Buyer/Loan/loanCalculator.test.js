import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLoan } from './loanCalculator.js';

test('calculates monthly reducing-balance EMI and repayment totals', () => {
  const result = calculateLoan(1200000, 10, 60);
  assert.ok(Math.abs(result.emi - 25496.45) < 0.01);
  assert.equal(result.totalPayment, result.emi * 60);
  assert.equal(result.totalInterest, result.totalPayment - 1200000);
});
test('handles interest-free loans and fully paid plots', () => {
  assert.deepEqual(calculateLoan(1200000, 0, 60), { emi: 20000, totalInterest: 0, totalPayment: 1200000 });
  assert.deepEqual(calculateLoan(0, 36, 60), { emi: 0, totalInterest: 0, totalPayment: 0 });
});
test('handles the maximum rate and a one-month loan', () => {
  const result = calculateLoan(3000000, 36, 1);
  assert.ok(Math.abs(result.emi - 3090000) < 0.01);
});
