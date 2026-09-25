// Guards the catalogue against automated pruning: every channel in the default
// 3x3 grid must still exist in tv-channels.json, or first-time visitors get a
// hole in their starting grid. A maintenance PR that retires one fails CI here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// channelsData.js needs the browser (IndexedDB, DOM), so read the array from source.
const source = readFileSync(new URL('../assets/js/channelsData.js', import.meta.url), 'utf8');
const block = /DEFAULT_CHANNELS_ARRAY\s*=\s*\[([\s\S]*?)\]/.exec(source)?.[1] ?? '';
const defaults = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
const catalogue = JSON.parse(
    readFileSync(new URL('../json-tv/tv-channels.json', import.meta.url), 'utf8'),
);

test('the default grid list is found and has 9 channels', () => {
    assert.equal(defaults.length, 9, `parsed: ${defaults.join(', ')}`);
});

test('every default channel is still in the active catalogue', () => {
    const missing = defaults.filter((id) => !(id in catalogue));
    assert.deepEqual(missing, [], `retired or renamed default channels: ${missing.join(', ')}`);
});
