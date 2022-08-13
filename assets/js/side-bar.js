// docs/assets/js/side-bar.mjs
function main() {
  const sideBar = document.getElementById("side-bar");
  const toggleButton = document.getElementById("side-bar-toggle-btn");
  const closeButton = document.getElementById("side-bar-close-btn");
  if (!toggleButton || !sideBar || !closeButton) {
    return;
  }
  toggleButton.addEventListener("click", () => {
    sideBar.classList.toggle("open");
  });
  closeButton.addEventListener("click", () => {
    sideBar.classList.remove("open");
  });
}
main();
