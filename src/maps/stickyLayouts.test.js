import test from 'node:test';
import assert from 'node:assert/strict';
import { StickyLayouts } from './stickyLayouts.js';

const path = [{ lat: 1, lng: 1 }, { lat: 2, lng: 1 }, { lat: 2, lng: 2 }];
function setup() {
  const polygons = [];
  const layouts = new StickyLayouts((options) => {
    const polygon = {
      options, map: null,
      setOptions(next) { Object.assign(this.options, next); },
      setMap(map) { this.map = map; }
    };
    polygons.push(polygon);
    return polygon;
  });
  return { layouts, polygons, map: {} };
}

test('switching projects and closing details retain all viewed layouts', () => {
  const { layouts, polygons, map } = setup();
  layouts.remember('a', path);
  layouts.show(map, true, 'a');
  assert.equal(polygons[0].map, null); // Selected overlay renders this one.
  layouts.remember('b', path);
  layouts.show(map, true, 'b');
  assert.equal(polygons[0].map, map);
  layouts.show(map, true, null);
  assert.ok(polygons.every((polygon) => polygon.map === map));
});

test('revisiting a project updates its existing geographic boundary', () => {
  const { layouts, polygons } = setup();
  layouts.remember('a', path);
  const updated = path.map((point) => ({ ...point, lat: point.lat + 1 }));
  layouts.remember('a', updated);
  layouts.remember('a', []);
  assert.equal(polygons.length, 1);
  assert.deepEqual(polygons[0].options.paths, updated);
});

test('layer toggle hides and restores retained boundaries; teardown releases them', () => {
  const { layouts, polygons, map } = setup();
  layouts.remember('a', path);
  layouts.show(map, false);
  assert.equal(polygons[0].map, null);
  layouts.show(map, true);
  assert.equal(polygons[0].map, map);
  layouts.clear();
  assert.equal(polygons[0].map, null);
  assert.equal(layouts.has('a'), false);
});
