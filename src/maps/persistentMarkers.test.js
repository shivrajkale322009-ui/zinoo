import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileMarkers } from './persistentMarkers.js';

test('retains attached markers and DOM while refreshing click data', () => {
  const map = {};
  const writes = [];
  let clicked;
  let creations = 0;
  const descriptor = (value, html = 'price') => ({
    key: 'project:a',
    options: { position: { lat: 18, lng: 73 }, content: { outerHTML: html }, title: 'A' },
    onClick: () => { clicked = value; }
  });
  const create = (options) => {
    creations++;
    return new Proxy({ ...options, addEventListener(type, callback) { this.click = callback; } }, {
      set(target, key, value) { writes.push(key); target[key] = value; return true; }
    });
  };
  let records = reconcileMarkers(new Map(), [descriptor(1)], map, create);
  const marker = records.get('project:a').marker;
  const content = marker.content;
  writes.length = 0;
  records = reconcileMarkers(records, [descriptor(2)], map, create);
  assert.equal(creations, 1);
  assert.equal(records.get('project:a').marker, marker);
  assert.equal(marker.content, content);
  assert.deepEqual(writes, []);
  marker.click();
  assert.equal(clicked, 2);
  records = reconcileMarkers(records, [descriptor(3, 'new price')], map, create);
  assert.deepEqual(writes, ['content']);
  assert.equal(marker.map, map);
  reconcileMarkers(records, [], map, create);
  assert.equal(marker.map, null);
});

test('cluster splits replace only the affected cluster', () => {
  const map = {};
  const item = (key) => ({ key, options: { title: key }, onClick() {} });
  const create = (options) => ({ ...options, addEventListener() {} });
  const previous = reconcileMarkers(new Map(), [item('cluster:ab'), item('c')], map, create);
  const next = reconcileMarkers(previous, [item('a'), item('b'), item('c')], map, create);
  assert.equal(previous.get('cluster:ab').marker.map, null);
  assert.equal(next.get('c').marker, previous.get('c').marker);
  assert.equal(next.get('a').marker.map, map);
  assert.equal(next.get('b').marker.map, map);
});
