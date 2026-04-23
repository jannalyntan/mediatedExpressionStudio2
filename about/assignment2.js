//-----------------------------------
//Button-----------------------------
//-----------------------------------
document.querySelectorAll("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .getElementById(btn.dataset.target)
      .scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".links").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.open(btn.dataset.url);
  });
});

//-----------------------------------
//Back To Top------------------------
//-----------------------------------

document.getElementById("backTopBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const backToTopBtn = document.getElementById("backToTopBtn");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  const isAtBottom = scrollY + windowHeight >= documentHeight - 10; // allow small buffer

  if (scrollY > 300 && !isAtBottom) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

//-----------------------------------
//Coloured Titles--------------------
//-----------------------------------

// This was done to add more character to the website. Since I wanted it to be more playful,
// I used the colours from the css to add some personality to the website.

// This was a way I found out to get the information from my css and html
const root = getComputedStyle(document.documentElement);

// Using the variable colours I created in css, adding trim as I found out that there might be errors if I don't.
const colours = [
  root.getPropertyValue("--red").trim(),
  root.getPropertyValue("--blue").trim(),
  root.getPropertyValue("--yellow").trim(),
  root.getPropertyValue("--yellow-dark").trim(),
  root.getPropertyValue("--orange").trim(),
];

// using this to get the word from the html and split it putting a span inside it to have each letter be a different
function rainbowText(elementId) {
  const el = document.getElementById(elementId);
  const text = el.innerText;

  el.innerHTML = text
    .split("")
    .map(
      (letter) =>
        `<span style="color: ${colours[Math.floor(Math.random() * colours.length)]}">${letter}</span>`,
    )
    .join("");
}

rainbowText("headertitle");
rainbowText("conceptualResponse");
rainbowText("technicalApproach");
rainbowText("drag&DropSystem");
rainbowText("soundSystem");
rainbowText("feedbackSystem");
rainbowText("controlPanel");
rainbowText("peerUserTesting");
rainbowText("reflection");

