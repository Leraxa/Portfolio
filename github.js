const CACHE_MS = 15 * 60 * 1000;
const RETRY_MS = 60 * 1000;

function createCommitFeed(fetchImpl = fetch, now = Date.now) {
  let cache;
  let pending;
  let retryAt = 0;

  async function refresh() {
    const response = await fetchImpl(
      'https://api.github.com/search/commits?q=author%3ALeraxa&sort=committer-date&order=desc&per_page=6',
      {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Leraxa-Portfolio' },
        signal: AbortSignal.timeout(8000)
      }
    );
    if (!response.ok) throw new Error('GitHub returned ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data.items) || data.incomplete_results) throw new Error('Incomplete GitHub response');
    const commits = data.items.map(item => ({
      sha: item.sha,
      message: item.commit.message.split('\n')[0],
      repository: item.repository.full_name,
      date: item.commit.committer.date,
      url: item.html_url
    }));
    cache = { commits, fetchedAt: new Date(now()).toISOString() };
    retryAt = 0;
    return { ...cache, stale: false };
  }

  return async function getCommits() {
    if (cache && now() - Date.parse(cache.fetchedAt) < CACHE_MS) return { ...cache, stale: false };
    if (now() < retryAt) {
      if (cache) return { ...cache, stale: true };
      throw new Error('GitHub temporarily unavailable');
    }
    if (!pending) {
      pending = refresh().catch(error => {
        retryAt = now() + RETRY_MS;
        if (cache) return { ...cache, stale: true };
        throw error;
      }).finally(() => { pending = undefined; });
    }
    return pending;
  };
}

module.exports = { createCommitFeed };
