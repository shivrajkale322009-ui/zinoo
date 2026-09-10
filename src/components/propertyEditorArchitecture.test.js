import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(path.join(directory, name), 'utf8');

test('admin and seller use the current shared PropertyDisplayEditor', () => {
  const admin = read('AdminPanel.jsx');
  const seller = read('SellerDashboard.jsx');

  assert.match(admin, /import PropertyDisplayEditor from ['"]\.\/PropertyDisplayEditor['"]/);
  assert.match(seller, /import PropertyDisplayEditor from ['"]\.\/PropertyDisplayEditor['"]/);
  assert.match(admin, /<PropertyDisplayEditor[\s\S]*role="admin"/);
  assert.match(seller, /<PropertyDisplayEditor/);
  assert.equal(existsSync(path.join(directory, 'PropertyEditor.jsx')), false);
  assert.doesNotMatch(admin, /propertyEditorVersion|Version 1|import PropertyEditor from/);
  assert.doesNotMatch(seller, /propertyEditorVersion|Version 1|import PropertyEditor from/);
});

test('V2 is a controlled editor sharing the existing seller and admin persistence pipelines', () => {
  const seller = read('SellerDashboard.jsx');
  const admin = read('AdminPanel.jsx');
  const v2 = read('PropertyDisplayEditor.jsx');

  assert.match(seller, /import PropertyDisplayEditor from ['"]\.\/PropertyDisplayEditor['"]/);
  assert.match(admin, /import PropertyDisplayEditor from ['"]\.\/PropertyDisplayEditor['"]/);
  assert.match(v2, /delegates all Firebase persistence to the existing/);
  assert.match(v2, /ProjectLocationPicker/);
  assert.match(v2, /onHighwayChange=\{\(result\) => apply\(\(current\) => applyHighwayResult\(current, result\)\)\}/);
  assert.match(v2, /onLayoutChange=\{\(geometry\) => apply\(\(current\) => \(\{ \.\.\.current, \.\.\.geometry \}\)\)\}/);
  assert.match(v2, /PropertyMediaDocumentsManager/);
  assert.doesNotMatch(v2, /firebase\/firestore|firebase\/storage/);
});

test('V2 edit delegates to the existing update handler and creation stays on the create handler', () => {
  const seller = read('SellerDashboard.jsx');
  const v2 = read('PropertyDisplayEditor.jsx');

  assert.match(seller, /mode="edit" property=\{editingProject\}[\s\S]*onSubmit=\{handleEditSave\}/);
  assert.match(seller, /mode="create" property=\{newProject\}[\s\S]*onSubmit=\{handleAddProject\}/);
  assert.doesNotMatch(v2, /addProject\(|addDoc\(/);
  assert.match(v2, /getPropertyChangeAudit/);
});

test('seller edit continues to synchronize public fields through the existing save pipeline', () => {
  const seller = read('SellerDashboard.jsx');
  assert.match(seller, /withSellerPreviewFields\(editingProject\)/);
  assert.match(seller, /onSubmit=\{handleEditSave\}/);
  assert.match(seller, /onSubmit=\{handleAddProject\}/);
});

test('property rejection requires a governed reason and accessible dialog contract', () => {
  const admin = read('AdminPanel.jsx');
  const dialog = read('PropertyRejectionModal.jsx');
  assert.match(admin, /reason\s*\n\s*\}\);/);
  assert.match(dialog, /role="dialog"/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /reason\.trim\(\)\.length >= 10/);
  assert.match(dialog, /event\.key === 'Escape'/);
  assert.match(dialog, /openerRef\.current\?\.focus/);
  assert.match(dialog, /btn-primary danger/);
});
