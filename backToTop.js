document.addEventListener("DOMContentLoaded", () => {
  const backToTopBtn = document.getElementById("backToTopBtn");

  // 捲動時顯示或隱藏按鈕
  window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // 點擊後平滑回到頂端
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
