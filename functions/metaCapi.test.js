const test = require('node:test');
const assert = require('node:assert/strict');
const { STAGES, buildStageEvent } = require('./metaCapi');

test('a completed visit reports a qualified lead, without sending CRM notes', () => {
  const now = Date.now();
  const event = buildStageEvent({ before: { stage: 'Visit Scheduled' }, after: { stage: 'Visit Completed', source: 'Meta Ads', phone: '+919876543210', notes: [{ text: 'Internal note' }] }, changeId: 'visit-complete', changedAt: now, enabledAt: now - 1000, now });
  assert.equal(event.event_name, 'QualifiedLead');
  assert.equal(event.action_source, 'system_generated');
  assert.equal(event.custom_data.event_source, 'crm');
  assert.equal(event.user_data.ph[0].length, 64);
  assert.ok(!JSON.stringify(event).includes('Internal note'));
});

test('removed stages cannot generate Meta conversion events', () => {
  for (const stage of ['Interested', 'Requirement Collected', 'Negotiation', 'Follow Up Later']) {
    assert.equal(STAGES[stage], undefined);
    assert.equal(buildStageEvent({ after: { stage, source: 'Meta Ads', phone: '+919876543210' }, changeId: stage, changedAt: Date.now(), enabledAt: 1 }), null);
  }
});

test('editing another field after a visit does not resend the qualification', () => {
  assert.equal(buildStageEvent({ before: { stage: 'Visit Completed' }, after: { stage: 'Visit Completed', temperature: 'Hot', source: 'Meta Ads' }, changeId: 'temperature-change', changedAt: Date.now(), enabledAt: 1 }), null);
});
