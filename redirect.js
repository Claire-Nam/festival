document.addEventListener("DOMContentLoaded", function () {
  // 새로고침을 감지하는 함수
  function redirectToLoadingPage() {
    // 새로고침 전의 URL이 이미 저장되어 있지 않으면 현재 URL 저장
    if (!sessionStorage.getItem("originalUrl")) {
      sessionStorage.setItem("originalUrl", window.location.href);
    }
    window.location.href = "loading.html";
  }

  // F5 키 또는 Ctrl + R 입력 감지
  window.addEventListener("keydown", function (event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
      event.preventDefault(); // 기본 새로고침 동작을 막음
      redirectToLoadingPage();
    }
  });

  // 브라우저 새로고침 버튼 클릭 감지
  window.addEventListener("beforeunload", function () {
    if (!sessionStorage.getItem("originalUrl")) {
      sessionStorage.setItem("originalUrl", window.location.href);
    }
  });

  // 페이지가 최초 로드 시, 새로고침이 아닌 경우 loading.html로 리다이렉트하지 않음
  if (!sessionStorage.getItem("loaded")) {
    sessionStorage.setItem("loaded", true);
    const currentUrl = window.location.href;
    sessionStorage.setItem("redirectUrl", currentUrl);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const originalUrl = sessionStorage.getItem("originalUrl");

  // 로딩 페이지에서 실행될 때
  if (window.location.pathname.endsWith("loading.html")) {
    if (originalUrl && !originalUrl.includes("index.html")) {
      // 새로고침 전의 URL로 2.2초 후에 이동, index.html은 건너뜀
      setTimeout(() => {
        window.location.href = originalUrl;
      }, 2200);
    } else {
      // 만약 originalUrl이 없거나 index.html이라면 index.html로 이동하지 않음
      sessionStorage.removeItem("originalUrl");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2200);
    }
  }
});


