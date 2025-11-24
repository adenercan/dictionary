const bodyElement = document.body;
const themeToggle = document.querySelector("#theme-toggle");
const selectedFont = document.querySelector(".selected-font");
const fontMenu = document.querySelector("#font-menu");

themeToggle.addEventListener("change", changeTheme);
selectedFont.addEventListener("click", openMenu);

function changeTheme(){
    bodyElement.classList.toggle("dark-theme");
}

function openMenu(){
    fontMenu.classList.toggle("hidden");
}