document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".section");
    const toggle = document.getElementById("themeToggle");
    const body = document.body;

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const sectionId = item.getAttribute("data-section");
            sections.forEach(section => {
                section.classList.toggle("active", section.id === sectionId);
            });
        });
    });

    toggle.addEventListener("change", () => {
        body.classList.toggle("light");
        body.classList.toggle("dark");
    });
});
const updateDate = new Date(document.lastModified);
document.getElementById("update-date").textContent = updateDate.toLocaleDateString("en-EN", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    document.querySelectorAll(".gallery img").forEach(img => {
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightbox.classList.remove("hidden");
        });
    });

    lightbox.addEventListener("click", () => {
        lightbox.classList.add("hidden");
        lightboxImg.src = "";
    });
});
