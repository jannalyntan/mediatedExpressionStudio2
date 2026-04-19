/* ----------------------------------- */
/* Top Btn----------------------------- */
/* ----------------------------------- */

document.getElementById("designValuesBtn").addEventListener("click", () => {
  document
    .getElementById("designValuesCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("uiBtn").addEventListener("click", () => {
  document.getElementById("uiCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("designProcessBtn").addEventListener("click", () => {
  document
    .getElementById("designProcessCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("timelineBtn").addEventListener("click", () => {
  document.getElementById("timelineCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("proudBtn").addEventListener("click", () => {
  document.getElementById("proudCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("challengingBtn").addEventListener("click", () => {
  document
    .getElementById("challengingCon")
    .scrollIntoView({ behavior: "smooth" });
});

/* ----------------------------------- */
/* bottom Btn----------------------------- */
/* ----------------------------------- */

document.getElementById("designValuesBtn1").addEventListener("click", () => {
  document
    .getElementById("designValuesCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("uiBtn1").addEventListener("click", () => {
  document.getElementById("uiCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("designProcessBtn1").addEventListener("click", () => {
  document
    .getElementById("designProcessCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("timelineBtn1").addEventListener("click", () => {
  document.getElementById("timelineCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("proudBtn1").addEventListener("click", () => {
  document.getElementById("proudCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("challengingBtn1").addEventListener("click", () => {
  document
    .getElementById("challengingCon")
    .scrollIntoView({ behavior: "smooth" });
});

/* ----------------------------------- */
/* Back to Top----------------------------- */
/* ----------------------------------- */
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

/* ----------------------------------- */
/* UI Design----------------------------- */
/* ----------------------------------- */

document.getElementById("infoDesignBtn").addEventListener("click", () => {
  document
    .getElementById("infoDesignCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("mapping").addEventListener("click", () => {
  document.getElementById("mappingCon").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("characterisation").addEventListener("click", () => {
  document
    .getElementById("characterisationCon")
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementById("feedBtn").addEventListener("click", () => {
  document.getElementById("feedCon").scrollIntoView({ behavior: "smooth" });
});
