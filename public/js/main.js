"use strict";

const gallery = document.querySelector("#gallery");
const filters = document.querySelector("#filters");
const message = document.querySelector("#gallery-message");
const count = document.querySelector("#work-count");
const dialog = document.querySelector("#lightbox");
const fullImage = document.querySelector("#lightbox-image");
const themeToggle = document.querySelector(".theme-toggle");
let visibleArtworks = [];
let activeIndex = 0;

function applyTheme(light) {
  document.body.classList.toggle("light", light);
  themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  themeToggle.title = themeToggle.getAttribute("aria-label");
}
try { applyTheme(localStorage.getItem("portfolio-theme") === "light"); } catch {}
themeToggle.addEventListener("click", () => {
  const light = !document.body.classList.contains("light");
  applyTheme(light);
  try { localStorage.setItem("portfolio-theme", light ? "light" : "dark"); } catch {}
});

function showArtwork(index) {
  activeIndex = (index + visibleArtworks.length) % visibleArtworks.length;
  const artwork = visibleArtworks[activeIndex];
  fullImage.src = artwork.image;
  fullImage.alt = artwork.title;
  document.querySelector("#lightbox-title").textContent = artwork.title + " / " + artwork.category;
  document.querySelector("#lightbox-position").textContent = (activeIndex + 1) + " / " + visibleArtworks.length;
  if (!dialog.open) {
    dialog.showModal();
    document.body.classList.add("modal-open");
  }
}

function renderArtworks(artworks) {
  visibleArtworks = artworks;
  gallery.replaceChildren();
  const fragment = document.createDocumentFragment();
  artworks.forEach((artwork, index) => {
    const card = document.createElement("article");
    card.className = "art-card";
    const button = document.createElement("button");
    button.className = "art-button";
    button.setAttribute("aria-label", "View " + artwork.title);
    const img = document.createElement("img");
    img.src = artwork.image;
    img.alt = artwork.title;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    const arrow = document.createElement("span");
    arrow.className = "image-arrow";
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    button.append(img, arrow);
    button.addEventListener("click", () => showArtwork(index));
    const caption = document.createElement("div");
    caption.className = "art-caption";
    const title = document.createElement("h3");
    title.textContent = artwork.title;
    const category = document.createElement("span");
    category.textContent = artwork.category;
    caption.append(title, category);
    card.append(button, caption);
    fragment.append(card);
  });
  gallery.append(fragment);
  count.textContent = String(artworks.length).padStart(2, "0") + " works";
}

document.querySelector("#close-lightbox").addEventListener("click", () => dialog.close());
document.querySelector("#previous-artwork").addEventListener("click", () => showArtwork(activeIndex - 1));
document.querySelector("#next-artwork").addEventListener("click", () => showArtwork(activeIndex + 1));
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  fullImage.removeAttribute("src");
});
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showArtwork(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
  }
});

async function loadPortfolio() {
  try {
    const response = await fetch("/data/portfolio.json");
    if (!response.ok) throw new Error("Portfolio request failed: " + response.status);
    const { artworks } = await response.json();
    const categories = ["All work", ...new Set(artworks.map(artwork => artwork.category))];
    categories.forEach((category, index) => {
      const button = document.createElement("button");
      button.className = "filter";
      button.textContent = category;
      button.setAttribute("aria-pressed", String(index === 0));
      button.addEventListener("click", () => {
        for (const filter of filters.children) filter.setAttribute("aria-pressed", String(filter === button));
        renderArtworks(index === 0 ? artworks : artworks.filter(artwork => artwork.category === category));
      });
      filters.append(button);
    });
    renderArtworks(artworks);
    message.hidden = true;
  } catch (error) {
    message.textContent = "The collection could not be loaded. Please refresh to try again.";
    console.error(error);
  }
}
loadPortfolio();
