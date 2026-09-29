import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectShareData } from './projectShare.js';

test('share data includes project name, starting price, and address', () => {
  assert.deepEqual(getProjectShareData({
    name: 'Gatha Park', startingPrice: 1250000, completeAddress: 'Kuruli, Khed, Pune'
  }, 'https://zinoo.in/projects/gatha-park'), {
    title: 'Gatha Park',
    text: '🏡 Gatha Park\n💰Starting from ₹12.5 Lakh\n📍Kuruli, Khed, Pune\n\nView project details, photos & availability on Zinoo\n👉 https://zinoo.in/projects/gatha-park'
  });
});
