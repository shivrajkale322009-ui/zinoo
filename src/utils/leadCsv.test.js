import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLeadCsv } from './leadCsv.js';

test('data pasted without a header never falls back to the upload timestamp', () => {
  const [lead] = parseLeadCsv('"𝑷𝑶𝑰𝑺𝑶𝑵","96040 78222","25 May 2026","12:46","Second ads"', '2026-09-23');
  assert.equal(lead.date, '2026-05-25');
  assert.equal(lead.importTime, '12:46');
  assert.equal(lead.name, '𝑷𝑶𝑰𝑺𝑶𝑵');
});

test('quoted CSV preserves original dates, times, names and lots', () => {
  const rows = parseLeadCsv('Name,Mobile,Date,Time,Source Lot\n"Patil, A","80109 20376","29 April","14:57","First adss"\n"","8208028551","2026-06-05","","Matoshree"', '2026-09-23');
  assert.equal(rows[0].date, '2026-04-29');
  assert.equal(rows[0].importTime, '14:57');
  assert.equal(rows[0].name, 'Patil, A');
  assert.equal(rows[1].date, '2026-06-05');
  assert.equal(rows[1].importTime, '');
  assert.equal(rows[1].sourceLot, 'Matoshree');
});
test('actual supplied batches retain all 631 leads and source timestamps', () => {
  const rows = [1,2].flatMap(batch => parseLeadCsv(readFileSync(`zinoo-whatsapp-leads-import-batch-${batch}.csv`, 'utf8'), '2026-09-23'));
  assert.equal(rows.length, 631);
  assert.equal(rows[0].date, '2026-04-29');
  assert.equal(rows[0].importTime, '14:57');
  assert.ok(rows.filter(row => row.sourceLot === 'Matoshree').every(row => row.importTime === ''));
});
