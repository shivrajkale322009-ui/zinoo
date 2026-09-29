import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const read = (filename) => readFileSync(resolve(currentDir, filename), 'utf8');

test('LeadManagementWorkspace exports coordinator and handles Firestore collections', () => {
  const code = read('LeadManagementWorkspace.jsx');
  assert.ok(code.includes('export default function LeadManagementWorkspace'));
  assert.ok(code.includes('LeadTable'));
  assert.ok(code.includes('LeadDetailWorkspace'));
  assert.ok(code.includes('AddLeadModal'));
  assert.ok(code.includes('CRMMetricsModal'));
  assert.ok(code.includes('/admin/leads'));
});

test('AddLeadModal contains duplicate lead detection and all required buyer fields', () => {
  const code = read('AddLeadModal.jsx');
  assert.ok(code.includes('checkDuplicateLead'));
  assert.ok(code.includes('Duplicate Lead Detected'));
  assert.ok(code.includes('preferredLocations'));
  assert.ok(code.includes('purchaseTimeline'));
  assert.ok(code.includes('loanRequired'));
  assert.ok(code.includes('nextFollowUpDate'));
  assert.ok(code.includes('budgetMin'));
  assert.ok(code.includes('budgetMax'));
});

test('LeadDetailWorkspace implements customer requirements, projects, visits, followups, notes, and won/lost', () => {
  const code = read('LeadDetailWorkspace.jsx');
  assert.ok(code.includes('getProjectShareData'));
  assert.ok(code.includes('getProjectPublicUrl'));
  assert.ok(code.includes('Closed Lost'));
  assert.ok(code.includes('Closed Won'));
  assert.ok(code.includes('commissionPercent'));
  assert.ok(code.includes('expectedCommission'));
  assert.ok(code.includes('Site Visit'));
  assert.ok(code.includes('Activity History'));
  assert.ok(code.includes('Internal Notes'));
});

test('LeadTable provides summary metrics, quick filters, and mobile cards', () => {
  const code = read('LeadTable.jsx');
  assert.ok(code.includes('getLeadSummaryMetrics'));
  assert.ok(code.includes('crm-mobile-card-list'));
  assert.ok(code.includes('crm-table'));
  assert.ok(code.includes('Today Follow-ups'));
  assert.ok(code.includes('Overdue Follow-ups'));
  assert.ok(code.includes('Hot Leads'));
});

test('AdminPanel includes the Lead Management section right below WhatsApp leads', () => {
  const adminCode = readFileSync(resolve(currentDir, '../AdminPanel.jsx'), 'utf8');
  assert.ok(adminCode.includes("label: 'Lead Management'"));
  assert.ok(adminCode.includes("key: 'crm_leads'"));
  assert.ok(adminCode.includes('<LeadManagementWorkspace'));

  // Verify it appears after WhatsApp leads in the file
  const whatsappPos = adminCode.indexOf("key: 'whatsapp'");
  const crmPos = adminCode.indexOf("key: 'crm_leads'");
  assert.ok(whatsappPos > 0);
  assert.ok(crmPos > whatsappPos, 'CRM Leads section must appear after WhatsApp Leads');
});
