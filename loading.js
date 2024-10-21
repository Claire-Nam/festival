window.onload = function () {
  const progressBar = document.querySelector(".progress");
  const startButton = document.getElementById("open");

  let width = 0;
  const interval = setInterval(() => {
    width += 2; // 진행률을 2씩 증가
    progressBar.style.width = width + "%";
    if (width >= 100) {
      clearInterval(interval);
      startButton.style.display = "block";
    }
  }, 300); // 5초 동안 프로그래스 바가 100%까지 차오름

  startButton.addEventListener("click", function () {
    // 모든 기존 요소 숨기기
    document.querySelector(".loadingImg").style.display = "none";
    document.querySelector(".loading").style.display = "none";
    startButton.style.display = "none";

    // open.gif를 화면 전체에 채우기
    const openImage = document.createElement("img");
    openImage.src = "./assets/open.gif";
    openImage.style.position = "fixed";
    openImage.style.top = "0";
    openImage.style.left = "0";
    openImage.style.width = "100vw";
    openImage.style.height = "100vh";
    openImage.style.objectFit = "cover"; // 전체 화면을 가득 채우기 위해 설정
    document.body.appendChild(openImage);

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000); // open.gif가 3초간 재생된 후 메인 페이지로 이동
  });
};
