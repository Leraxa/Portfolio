"use strict";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function githubLink(url, className, text) {
  const link = element("a", className, text);
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") throw new Error("Invalid GitHub URL");
  link.href = parsed.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

async function loadProfile() {
  const status = document.querySelector("#profile-status");
  try {
    const response = await fetch("/data/profile.json");
    if (!response.ok) throw new Error("Profile unavailable");
    const data = await response.json();
    const projects = data.projects.map(project => {
      const card = element("article", "project-card");
      const visual = element("div", "project-visual visual-" + project.visual);
      visual.setAttribute("aria-hidden", "true");
      if (project.visual === "life") {
        const grid = element("div", "life-pattern");
        const alive = new Set([9,18,24,25,26,36,37,44,45]);
        for (let i = 0; i < 64; i++) grid.append(element("span", alive.has(i) ? "alive" : ""));
        visual.append(grid);
      } else if (project.visual === "quotes") {
        visual.append(element("span", "quote-before", '"'), element("span", "quote-arrow", "→"), element("span", "quote-after", "„“"));
      } else {
        const window = element("div", "mini-window");
        window.append(element("div", "mini-dots", "● ● ●"), element("strong", "", "A little logic."), element("em", "", "A lot of imagination."));
        const blocks = element("div", "mini-blocks");
        for (let i = 0; i < 3; i++) blocks.append(element("span"));
        window.append(blocks);
        visual.append(window);
      }
      const body = element("div", "project-body");
      body.append(element("div", "eyebrow", project.category));
      const heading = element("h3");
      heading.append(githubLink(project.url, "", project.title + " ↗"));
      body.append(heading, element("p", "", project.description));
      const tags = element("div", "project-tags");
      project.tags.forEach(tag => tags.append(element("span", "", tag)));
      body.append(tags);
      card.append(visual, body);
      return card;
    });
    const facts = data.facts.map(fact => {
      const card = element("article", "fact-card");
      const symbol = element("span", "fact-symbol", fact.symbol);
      symbol.setAttribute("aria-hidden", "true");
      card.append(symbol, element("div", "eyebrow", fact.label), element("h3", "", fact.value), element("p", "", fact.detail));
      return card;
    });
    document.querySelector("#project-grid").replaceChildren(...projects);
    document.querySelector("#fact-grid").replaceChildren(...facts);
    status.hidden = true;
  } catch {
    status.textContent = "Projects couldn't be loaded. You can still explore them on GitHub.";
  }
}

async function loadCommits() {
  const status = document.querySelector("#commit-status");
  const retry = document.querySelector("#retry-commits");
  retry.hidden = true;
  status.textContent = "Loading commit history…";
  try {
    const response = await fetch("/api/github/commits", { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Commits unavailable");
    const data = await response.json();
    const rows = data.commits.map(commit => {
      const row = element("li", "commit-row");
      const dot = element("span", "commit-dot");
      dot.setAttribute("aria-hidden", "true");
      const detail = element("div", "commit-detail");
      detail.append(githubLink(commit.url, "commit-message", commit.message));
      detail.append(element("span", "commit-repo", commit.repository));
      const meta = element("div", "commit-meta");
      const date = element("time", "", new Date(commit.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
      date.dateTime = commit.date;
      meta.append(date, element("code", "", commit.sha.slice(0, 7)));
      row.append(dot, detail, meta);
      return row;
    });
    document.querySelector("#commit-list").replaceChildren(...rows);
    status.textContent = data.stale ? "GitHub is unavailable. Showing the last saved update." : rows.length ? "" : "No public commits found for this profile.";
    retry.hidden = !data.stale;
    document.querySelector("#commit-updated").textContent = "Last checked " + new Date(data.fetchedAt).toLocaleString("en-GB") + " · Public search results, not a complete contribution history.";
  } catch {
    status.textContent = "GitHub couldn't be reached. Try again, or open the profile above.";
    retry.hidden = false;
  }
}

document.querySelector("#retry-commits").addEventListener("click", loadCommits);
loadProfile();
loadCommits();
