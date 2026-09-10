import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePermissions } from './permissions.js';

test('recognizes a legacy root-level admin role', () => {
  assert.deepEqual(normalizePermissions({ role: 'admin' }), {
    buyer: true,
    seller: true,
    admin: true
  });
});

test('root-level role is preserved when a permissions map also exists', () => {
  assert.deepEqual(normalizePermissions({
    role: 'admin',
    permissions: { buyer: true, seller: false, admin: false }
  }), {
    buyer: true,
    seller: true,
    admin: true
  });
});

test('normalizes whitespace and casing in legacy roles', () => {
  assert.deepEqual(normalizePermissions({ role: ' Admin ' }), {
    buyer: true,
    seller: true,
    admin: true
  });
});

test('recognizes the current nested permissions format', () => {
  assert.deepEqual(normalizePermissions({
    permissions: { buyer: true, seller: true, admin: false }
  }), {
    buyer: true,
    seller: true,
    admin: false
  });
});
