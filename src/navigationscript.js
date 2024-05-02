const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobilemenu");
const navBlock = document.querySelector(".navblock");
const nav = document.querySelector("nav");
const body = document.body;

navBlock.addEventListener("click", menuClicked);

function menuClicked() {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    navBlock.classList.toggle("active");
    nav.classList.toggle("active");
}