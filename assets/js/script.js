const bodyElement = document.body;
const themeToggle = document.querySelector("#theme-toggle");
const selectedFont = document.querySelector(".selected-font");
const fontMenu = document.querySelector("#font-menu");
const fontOptions = document.querySelectorAll(".font-menu li");
const currentFont = document.querySelector("#current-font");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const resultContainer = document.querySelector("#result-container");
const errorMsg = document.querySelector("#error-msg");
const searchBox = document.querySelector(".search-box");

document.addEventListener("DOMContentLoaded", loadPreferences);

themeToggle.addEventListener("change", changeTheme);
selectedFont.addEventListener("click", openMenu);

function changeTheme() {
    bodyElement.classList.toggle("dark-theme");
    const isDark = bodyElement.classList.contains("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

function openMenu() {
    fontMenu.classList.toggle("hidden");
}

fontOptions.forEach((option) => {
    option.addEventListener("click", changeFont);
})

function changeFont(e) {
    const fontName = e.target.textContent;
    currentFont.textContent = fontName;

    const newFontFamily = e.target.style.fontFamily || window.getComputedStyle(e.target).fontFamily;
    document.body.style.setProperty("--current-font", newFontFamily);

    localStorage.setItem("fontName", fontName);
    localStorage.setItem("fontFamily", newFontFamily);

    fontMenu.classList.add("hidden"); 
}

searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const word = searchInput.value.trim();

    if (!word) {
        displayEmptySearchError(true);
        return;
    }

    displayEmptySearchError(false);
    getWord(word);
})


function displayEmptySearchError(show) {
    if (show) {
        errorMsg.style.display = "block";
        searchBox.classList.add("error-border");
        resultContainer.innerHTML = "";
    } else {
        errorMsg.style.display = "none";
        searchBox.classList.remove("error-border");
    }
}

function displayApiError(data) {
    resultContainer.innerHTML ="";
    resultContainer.innerHTML = `
    <div class="no-result">
        <h1>:(</h1>
        <h3>No Definitions Found</h3>
        <p>Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p>
    </div>
    `;
}

async function getWord(word) {
    resultContainer.innerHTML = "";

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        if (!response.ok) {
            const errorData = await response.json();
            displayApiError(errorData);
            return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            renderWord(data);
        } else {
            displayApiError(data);
        }
    } catch (error) {
        displayApiError({ title: "Network Error", message: "Could not reach the dictionary service." });
    }
}

function renderWord(data) {
    const wordData = data[0];

    localStorage.setItem("lastWord", wordData.word);

    const phonetic = wordData.phonetic || wordData.phonetics.find(p => p.text)?.text || "";

    const audioObj = wordData.phonetics.find(p => p.audio && p.audio !== "");
    const audioUrl = audioObj ? audioObj.audio : null;

    const meaningsHTML = wordData.meanings.map(meaning => {

    const definitionsList = meaning.definitions.map(def => {
        const example = def.example
            ? `<p class="example">"${def.example}"</p>`
            : "";
        return `<li>${def.definition} ${example}</li>`;
    }).join("");

    const synonymHTML = meaning.synonyms && meaning.synonyms.length > 0
        ? `<div class="synonyms"><h4>Synonyms</h4><p>${meaning.synonyms.join(', ')}</p></div>`
        : "";

    return `
        <div class="meaning-block">
            <div class="part-of-speech">
                <h3>${meaning.partOfSpeech}</h3>
                <div class="line"></div>
            </div>
            <div class="definitions">
                <h4>Meaning</h4>
                <ul>${definitionsList}</ul> 
            </div>
            ${synonymHTML}
        </div>
    `;
}).join("");

const sourceLinkText = wordData.sourceUrls[0] || "";
const sourceLinkHTML = sourceLinkText ? `
    <div class="divider-bottom"></div>
    <section class="source">
        <p>Source</p>
        <a href="${sourceLinkText}" target="_blank">
            ${sourceLinkText}
            <img src="assets/img/external-link.svg" alt="new window">
        </a>
    </section>
` : '';

resultContainer.innerHTML = `
    <div class="word-header">
        <div class="word-text">
            <h1>${wordData.word}</h1>
            <p class="phonetic">${phonetic}</p>
        </div>
        <button class="play-btn" aria-label="Play audio">
        </button>
    </div>
    ${meaningsHTML}
    ${sourceLinkHTML}
`;

const newPlayButton = resultContainer.querySelector(".play-btn");

if (audioUrl) {
    newPlayButton.onclick = () => {
        new Audio(audioUrl).play();
    };
}
}

function loadPreferences(){
const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
    bodyElement.classList.add("dark-theme");
    themeToggle.checked = true;
}

const savedFontName = localStorage.getItem("fontName");
const savedFontFamily = localStorage.getItem("fontFamily");

if(savedFontName && savedFontFamily){
    currentFont.textContent = savedFontName;
    document.body.style.setProperty("--current-font", savedFontFamily);
}

const lastWord = localStorage.getItem("lastWord");
if(lastWord){
    searchInput.value = lastWord;
    getWord(lastWord);
}
}