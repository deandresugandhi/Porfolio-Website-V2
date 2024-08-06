document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobilemenu");
    const navBlock = document.querySelector(".navblock");
    const nav = document.querySelector("nav");
    const menuLinks = document.querySelectorAll(".mobilemenu a");

    if (hamburger && mobileMenu && navBlock && nav) {
        navBlock.addEventListener("click", menuClicked);
        menuLinks.forEach(link => {
            link.addEventListener("click", closeMenuOnClick);
        });
    } else {
        console.error('One or more elements not found');
    }

    function menuClicked() {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        navBlock.classList.toggle("active");
        nav.classList.toggle("active");
    }

    function closeMenuOnClick() {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        navBlock.classList.remove("active");
        nav.classList.remove("active");
    }
});