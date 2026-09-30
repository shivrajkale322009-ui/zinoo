import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIndianPhone,
  getPhoneDigits,
  checkDuplicateLead,
  formatLeadBudget,
  getLeadSummaryMetrics,
  calculateConversionMetrics,
  createActivityRecord,
  getSampleDemoLeads,
  LEAD_STAGES,
  LEAD_TEMPERATURES
} from './crmLeadModel.js';

test('normalizes Indian phone numbers accurately to E.164 and 10 digits', () => {
  assert.equal(normalizeIndianPhone('9822012345'), '+919822012345');
  assert.equal(normalizeIndianPhone('+91 98220 12345'), '+919822012345');
  assert.equal(normalizeIndianPhone('09822012345'), '+919822012345');
  assert.equal(normalizeIndianPhone('919822012345'), '+919822012345');
  assert.equal(normalizeIndianPhone('12345'), '');

  assert.equal(getPhoneDigits('+919822012345'), '9822012345');
  assert.equal(getPhoneDigits('09822012345'), '9822012345');
  assert.equal(getPhoneDigits('9822012345'), '9822012345');
});

test('identifies duplicate leads by mobile number', () => {
  const existing = [
    { id: 'lead_1', name: 'Rahul Patil', phone: '+919822012345' },
    { id: 'lead_2', name: 'Sneha Deshmukh', phone: '09850123456' }
  ];

  const duplicate = checkDuplicateLead('9822012345', existing);
  assert.ok(duplicate);
  assert.equal(duplicate.id, 'lead_1');

  // Should ignore self when excludeLeadId is passed
  const selfCheck = checkDuplicateLead('9822012345', existing, 'lead_1');
  assert.equal(selfCheck, null);

  const nonDuplicate = checkDuplicateLead('9999999999', existing);
  assert.equal(nonDuplicate, null);
});

test('formats lead budget properly with Indian numbering', () => {
  assert.equal(formatLeadBudget(1500000, 2500000), '₹15 Lakh – ₹25 Lakh');
  assert.equal(formatLeadBudget(1500000, 1500000), '₹15 Lakh');
  assert.equal(formatLeadBudget(1000000, null), 'From ₹10 Lakh');
  assert.equal(formatLeadBudget(null, 3000000), 'Up to ₹30 Lakh');
  assert.equal(formatLeadBudget(null, null), 'Budget on request');
});

test('computes accurate lead summary metrics and conversion funnel', () => {
  const sampleLeads = getSampleDemoLeads();
  assert.ok(sampleLeads.length >= 6);

  const summary = getLeadSummaryMetrics(sampleLeads);
  assert.equal(summary.totalLeads, sampleLeads.length);
  assert.ok(summary.hotLeads >= 2);
  assert.ok(typeof summary.followUpsToday === 'number');
  assert.ok(typeof summary.overdueFollowUps === 'number');

  const conversions = calculateConversionMetrics(sampleLeads);
  assert.equal(conversions.totalLeads, sampleLeads.length);
  assert.ok(conversions.closedWonCount >= 1);
  assert.ok(conversions.leadToDealConversion >= 0);
  assert.ok(conversions.bySource['Meta Ads'] >= 1);
  assert.ok(conversions.byStage['Closed Won'] >= 1);
});

test('creates valid activity records with author and timestamps', () => {
  const user = { uid: 'usr_123', displayName: 'Vinod Pawar' };
  const act = createActivityRecord({
    type: 'site_visit_scheduled',
    title: 'Site Visit Scheduled',
    description: 'Scheduled visit for Saturday 11am',
    user
  });

  assert.ok(act.id.startsWith('act_'));
  assert.equal(act.createdBy, 'usr_123');
  assert.equal(act.createdByName, 'Vinod Pawar');
  assert.equal(act.type, 'site_visit_scheduled');
  assert.ok(act.createdAt);
});

test('defines all standard CRM stages and temperature tiers', () => {
  const stageKeys = LEAD_STAGES.map((s) => s.key);
  assert.ok(stageKeys.includes('New'));
  assert.ok(stageKeys.includes('Contacted'));
  assert.ok(!stageKeys.includes('Requirement Collected'));
  assert.ok(stageKeys.includes('Projects Suggested'));
  assert.ok(stageKeys.includes('Visit Scheduled'));
  assert.ok(stageKeys.includes('Visit Completed'));
  assert.ok(!stageKeys.includes('Interested'));
  assert.ok(!stageKeys.includes('Negotiation'));
  assert.ok(!stageKeys.includes('Follow Up Later'));
  assert.ok(stageKeys.includes('Closed Won'));
  assert.ok(stageKeys.includes('Closed Lost'));

  const tempKeys = LEAD_TEMPERATURES.map((t) => t.key);
  assert.ok(tempKeys.includes('Hot'));
  assert.ok(tempKeys.includes('Warm'));
  assert.ok(tempKeys.includes('Cold'));
});
