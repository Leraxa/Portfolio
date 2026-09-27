const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCommitFeed } = require('../github');

const item = {
  sha: 'abc1234', html_url: 'https://github.com/Leraxa/Portfolio/commit/abc1234',
  repository: { full_name: 'Leraxa/Portfolio' },
  commit: { message: 'Fix layout\n\nDetails', committer: { date: '2026-09-23T10:00:00Z' } }
};
test('maps commits and shares cached results between requests', async () => {
  let calls = 0;
  const feed = createCommitFeed(async () => {
    calls++;
    return { ok: true, json: async () => ({ items: [item] }) };
  });
  const [a, b] = await Promise.all([feed(), feed()]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.equal(a.commits[0].message, 'Fix layout');
  await feed();
  assert.equal(calls, 1);
});
test('serves stale data and backs off after an upstream failure', async () => {
  let time = Date.parse('2026-09-23T10:00:00Z');
  let calls = 0;
  const feed = createCommitFeed(async () => {
    calls++;
    if (calls > 1) return { ok: false, status: 403 };
    return { ok: true, json: async () => ({ items: [item] }) };
  }, () => time);
  await feed();
  time += 16 * 60 * 1000;
  assert.equal((await feed()).stale, true);
  assert.equal((await feed()).stale, true);
  assert.equal(calls, 2);
});
test('reports an initial failure without inventing an empty history', async () => {
  let calls = 0;
  const feed = createCommitFeed(async () => { calls++; throw new Error('offline'); });
  await assert.rejects(feed());
  await assert.rejects(feed());
  assert.equal(calls, 1);
});
test('accepts genuinely empty results and rejects incomplete results', async () => {
  const empty = createCommitFeed(async () => ({ ok: true, json: async () => ({ items: [] }) }));
  assert.deepEqual((await empty()).commits, []);
  const incomplete = createCommitFeed(async () => ({ ok: true, json: async () => ({ items: [], incomplete_results: true }) }));
  await assert.rejects(incomplete());
});
