import test from 'node:test';
import assert from 'node:assert/strict';
import { createClosedLostUpdate } from './crmLeadModel.js';

test('closed lost saves a structured tagged note and preserves existing history', () => {
  const lead = { notes: [{ text: 'Earlier note' }], activities: [{ title: 'Earlier activity' }], dealDetails: { purchasedProjectId: 'project-1' } };
  const result = createClosedLostUpdate(lead, 'Budget mismatch', '  Too expensive  ', { displayName: 'Agent' });
  assert.equal(result.stage, 'Closed Lost');
  assert.equal(result.dealDetails.lostReason, 'Budget mismatch');
  assert.equal(result.dealDetails.lostNotes, 'Too expensive');
  assert.equal(result.dealDetails.purchasedProjectId, 'project-1');
  assert.equal(result.notes[0].stage, 'Closed Lost');
  assert.equal(result.notes[0].reason, 'Budget mismatch');
  assert.equal(result.notes[0].text, 'Budget mismatch: Too expensive');
  assert.equal(result.notes[1], lead.notes[0]);
  assert.equal(result.activities[1], lead.activities[0]);
  assert.equal(lead.notes.length, 1);
});

test('closed lost rejects missing reasons and requires details for Other', () => {
  assert.throws(() => createClosedLostUpdate({}, '', '', null), /Select/);
  assert.throws(() => createClosedLostUpdate({}, 'Other', '  ', null), /Add a note/);
  assert.equal(createClosedLostUpdate({}, 'Not interested', '', null).notes[0].text, 'Not interested');
});
