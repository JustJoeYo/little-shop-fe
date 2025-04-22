export function show(elements) {
  elements.forEach((element) => {
    if (element) element.classList.remove("hidden");
  });
}

export function hide(elements) {
  elements.forEach((element) => {
    if (element) element.classList.add("hidden");
  });
}

export function removeActiveNavClass() {
  const merchantsNavButton = document.querySelector("#merchants-nav");
  const itemsNavButton = document.querySelector("#items-nav");
  const dashboardNavButton = document.querySelector("#dashboard-nav");

  merchantsNavButton.classList.remove("active-nav");
  itemsNavButton.classList.remove("active-nav");
  dashboardNavButton.classList.remove("active-nav");
}
