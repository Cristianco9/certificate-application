document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".card-wrapper");
  const prevButton = document.querySelector(".prev-btn");
  const nextButton = document.querySelector(".next-btn");

  const scrollAmount = 300;

  nextButton.addEventListener("click", () => {
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  prevButton.addEventListener("click", () => {
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
});
