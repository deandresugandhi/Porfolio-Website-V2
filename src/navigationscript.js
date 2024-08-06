document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobilemenu");
    const navBlock = document.querySelector(".navblock");
    const nav = document.querySelector("nav");

    if (hamburger && mobileMenu && navBlock && nav) {
        navBlock.addEventListener("click", menuClicked);
    } else {
        console.error('One or more elements not found');
    }

    function menuClicked() {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        navBlock.classList.toggle("active");
        nav.classList.toggle("active");
    }
});