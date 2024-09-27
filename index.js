document.addEventListener("DOMContentLoaded", function () {
  // 검색 버튼 선택
  const search = document.querySelector(".searchBtn");
  const inputElem = document.querySelector(".searchInput");

  // 입력 필드가 있는지 확인
  if (!inputElem) {
    console.error("검색 입력 필드를 찾을 수 없습니다.");
    return;
  }

  // 검색 함수
  function performSearch() {
    const inputValue = inputElem.value.trim();
    if (inputValue === "") {
      alert("검색어를 입력해주세요");
    } else {
      // 검색어가 있으면 해당 URL로 이동
      window.location.href = `search?q=${encodeURIComponent(inputValue)}`;
      inputElem.value = ""; // 입력 필드 초기화
    }
  }

  // 검색 버튼 이벤트 리스너 추가
  search.addEventListener("click", function (e) {
    e.preventDefault();
    performSearch();
  });

  // 입력 필드에서 'keydown' 이벤트 리스너 추가
  inputElem.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const monthElem = document.getElementById("month");

  function getMonth() {
    const date = new Date();
    const month = date.getMonth() + 1;
    monthElem.innerHTML = `${month}월의 축제`;
  }

  getMonth();
  handleSearch();
});

// api 연결
const reqURL = "http://api.kcisa.kr/openapi/service/rest/meta4/getKCPG0504";
const serviceKey = "75744c9b-835a-4616-8958-c51c737685b5";
let pageNo = 1;
const numOfRows = 50;

// API 데이터를 받아서 Swiper 슬라이드를 생성하는 함수
function renderSlide(item) {
  const swiperWrapper = document.querySelector(".swiper-wrapper");

  // 새 슬라이드 요소 생성
  const slide = document.createElement("div");
  slide.classList.add("swiper-slide");

  // 슬라이드 내부 콘텐츠 설정 (이미지와 텍스트)
  slide.innerHTML = `
    <div>
      <img src="${item.referenceIdentifier}" alt="${item.title}">
      <p class="body-title">${item.title}</p>
    </div>
  `;

  // 슬라이드를 Swiper Wrapper에 추가
  swiperWrapper.appendChild(slide);
}

$(document).ready(function () {
  const swiper = new Swiper("#coverflow-swiper", {
    slidesPerView: "auto", // 슬라이드 크기를 자동으로 설정
    spaceBetween: 30, // 카드 간 간격
    loop: true, // 루프 설정
    centeredSlides: true, // 중앙 정렬
    effect: "coverflow", // 커버플로우 효과
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
    autoplay: {
      delay: 3000, // 3초 간격으로 자동 슬라이드
      disableOnInteraction: false, // 상호작용 후에도 자동 슬라이드 유지
    },
  });

  // API 데이터를 로드하고 슬라이드 생성
  fetchData(pageNo, numOfRows, function () {
    swiper.update(); // 슬라이드 업데이트
  });
});

// API 데이터를 받아오는 함수
function fetchData(pageNo, numOfRows, callback) {
  const querySelector = `?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&&_type=json`;
  $.ajax({
    url: reqURL + querySelector,
    method: "GET",
    success: function (data) {
      // API 데이터를 기반으로 슬라이드 생성
      data.body.items.item.forEach((item) => {
        renderSlide(item); // 각 항목에 대해 슬라이드 생성
      });

      // 데이터 로드 후 콜백 함수 호출 (Swiper 업데이트)
      if (typeof callback === "function") {
        callback();
      }
    },
    error: function (err) {
      console.error("데이터 로드 실패", err);
    },
  });
}
