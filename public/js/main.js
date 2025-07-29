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
