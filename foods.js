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

// 음식 api 데이터 연결해서 뿌리기
const reqUrl =
  "https://api.odcloud.kr/api/15111398/v1/uddi:65f027c0-2c92-411b-b9f5-cb7382fde662";
const serviceKey =
  "yQQSwbgJd1XztqRzDuOXA60QuXMUeCxfz3laS5T76FCYr9%2BzxmpWrlQVndXAux4Yb8bdsBcyPkOsgdPodGzzTQ%3D%3D";
let page = 1;
let perPage = 30;

$(document).ready(function () {
  // swiper 초기화
  const swiper = new Swiper(".swiper-container", {
    slidesPerView: "auto", // 화면에 보이는 카드 수
    spaceBetween: 20, // 카드 간 간격
    loop: true,
    centeredSlides: false,
    navigation: {
      nextEl: ".swiper-btn-next",
      prevEl: ".swiper-btn-prev",
    },
    centeredSlides: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        spaceBetween: 15, // 작은 화면에서 카드 간격 조정
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 20, // 큰 화면에서 카드 간격 조정
      },
    },
  });

  fetchData(page, perPage);
});

function fetchData(page, perPage, callback) {
  let queryString = `?serviceKey=${serviceKey}&page=${page}&perPage=${perPage}`;

  // api 데이터 요청
  $.ajax({
    url: reqUrl + queryString,
    method: "GET",
    dataType: "json",
    contentType: "application/json",
    success: function (res) {
      console.log("연결 성공", res);
      renderCards(res);
      renderTable(res);

      const categories = new Set();
      res.data.forEach((item) => {
        categories.add(item.카테고리3);
      });

      populateDropdown(Array.from(categories)); // 드롭다운에 카테고리 추가

      const isLastPage = res.data.length < perPage; // 더 이상 가져올 데이터가 없으면 마지막 페이지로 처리
      callback(isLastPage);
    },
    error: function (err) {
      console.log("연결 실패", err);
      callback(false);
    },
  });
}

function renderCards(data) {
  const cardWrapper = document.querySelector(".swiper-wrapper");

  data.data.forEach((item) => {
    const cardsContent = `
        <div class="swiper-slide">
        <div class="card text-dark bg-light mb-3">
      <img src="${
        item.리명칭 ? item.리명칭 : "이미지 없음"
      }" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${item.시설명}</h5>
        <p class="card-addr">${item.도로명주소}</p>
        <button class='btn-detail-info' data-item='${JSON.stringify(
          item
        )}'>정보 더 보기</button>
        </div>
      </div>
    </div>`;

    cardWrapper.insertAdjacentHTML("beforeend", cardsContent);
  });

  // 이벤트 위임 방식으로 클릭 핸들러 등록
  $(".swiper-wrapper").on("click", ".btn-detail-info", function () {
    // data-item 속성에서 저장된 JSON 문자열을 파싱하여 객체로 변환
    const itemData = JSON.parse($(this).attr("data-item"));
    handleInfo(itemData); // itemData를 handleInfo에 전달
  });
}

function handleInfo(item) {
  // 기존의 모달 오버레이와 모달이 존재하면 먼저 삭제
  const existingModal = document.querySelector(".custom-modal");
  const existingOverlay = document.querySelector(".modal-overlay");

  if (existingModal) existingModal.remove();
  if (existingOverlay) existingOverlay.remove();

  // 새로운 모달과 오버레이 생성
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");

  const modal = document.createElement("div");
  modal.classList.add("custom-modal");

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <h3 class="modal-title">식당 이름: ${item.시설명}</h3>
      <p class="foods-category">
        <span>카테고리: ${item.카테고리2}</span>
        <span>(${item.카테고리3})</span>
      </p>
      <p class="modal-tel">전화번호: ${
        item.전화번호 ? item.전화번호.trim() : "정보 없음"
      }</p>
      <p class="modal-addr">주소: ${item.도로명주소}</p>
      <p class="open">운영시간: ${
        item["평일 운영시간"] ? item["평일 운영시간"].trim() : "정보 없음"
      }</p>
      <p class="modal-park">주차: ${
        item["무료주차 가능여부"]
          ? item["무료주차 가능여부"].trim()
          : "정보 없음"
      }</p>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  document.body.appendChild(modal);

  // 모달 보이기
  modalOverlay.style.display = "block";
  modal.style.display = "block";

  // 모달 닫기 버튼 이벤트 처리
  modal.querySelector(".close-btn").addEventListener("click", function () {
    closeModal(modal, modalOverlay);
  });

  // 오버레이 클릭 시 모달 닫기
  modalOverlay.addEventListener("click", function () {
    closeModal(modal, modalOverlay);
  });
}
function closeModal(modal, modalOverlay) {
  // 이미 모달이 닫힌 상태에서는 처리하지 않음
  if (!modal || !modalOverlay) return;

  // 모달과 오버레이를 숨기고 DOM에서 제거
  modal.style.display = "none";
  modalOverlay.style.display = "none";

  // 모달과 오버레이를 DOM에서 제거
  modal.remove();
  modalOverlay.remove();
}

// 드롭다운 메뉴 열고 닫기
function dropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");
}

// 드롭다운 메뉴 항목 클릭 시 선택
function showMenu(value) {
  let dropbtnContent = document.querySelector(".dropBtn_content");
  dropbtnContent.innerText = value;
}

// 드롭다운 클릭 이벤트 핸들러
document.querySelector(".dropBtn_click").addEventListener("click", dropdown);

// 페이지 외부 클릭 시 드롭다운 닫기
window.onclick = function (e) {
  if (!e.target.matches(".dropBtn_click")) {
    var dropdowns = document.querySelectorAll(".dropdown-content");
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("show");
    });
  }
};

// 식당 정보 호출
function renderTable(data) {
  const tableBody = document.querySelector("#resTable tbody");

  data.data.forEach((item) => {
    const tableRow = `
      <tr>
        <td class="name">${item.시설명}</td>
        <td class="foodCategory">${item.카테고리3}(${item.카테고리2})</td>
        <td class="addr">${item.도로명주소}</td>
        <td class="tel">${item.전화번호 ? item.전화번호 : "정보 없음"}</td>
        <td class="park"> ${
          item["무료주차 가능여부"]
            ? item["무료주차 가능여부"].trim()
            : "정보 없음"
        }</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", tableRow);
  });
}

// 정보 더 가져오기
function getMoreInfo() {
  const loadMoreInfo = document.querySelector("#loadMore");

  loadMoreInfo.addEventListener("click", function () {
    // "더보기" 버튼을 잠시 비활성화 (중복 클릭 방지)
    loadMoreInfo.disabled = true;

    // 페이지 증가 후 데이터 요청
    page++;
    fetchData(page, perPage, function (isLastPage) {
      // 데이터 로드가 끝난 후 "더보기" 버튼 다시 활성화
      loadMoreInfo.disabled = false;

      // 마지막 페이지라면 버튼 숨기기 또는 비활성화
      if (isLastPage) {
        loadMoreInfo.style.display = "none"; // 또는 loadMoreInfo.disabled = true;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  getMoreInfo();
});

function populateDropdown(categories) {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.innerHTML = ""; // 기존 드롭다운 내용 비우기

  // 카테고리 리스트 동적 생성
  categories.forEach((category) => {
    const categoryElement = document.createElement("div");
    categoryElement.classList.add("category");
    categoryElement.innerText = category;
    categoryElement.onclick = function () {
      showMenu(category); // 카테고리 선택 시 처리
      filterTable(category); // 테이블 필터링 적용
    };
    dropdownContent.appendChild(categoryElement);
  });

  // "전체" 항목 추가
  const allElement = document.createElement("div");
  allElement.classList.add("category");
  allElement.innerText = "전체";
  allElement.onclick = function () {
    showMenu("전체");
    filterTable("전체"); // "전체" 선택 시 필터링 해제
  };
  dropdownContent.appendChild(allElement);
}

function filterTable(selectedCategory) {
  // console.log("선택된 카테고리: ", selectedCategory); // 카테고리 값 확인

  const rows = document.querySelectorAll("#resTable tbody tr");

  rows.forEach((row) => {
    const categoryCell = row.querySelector(".foodCategory");
    if (categoryCell) {
      const categoryText = categoryCell.innerText.split("(")[0].trim(); // 카테고리 추출
      console.log("테이블의 카테고리: ", categoryText); // 테이블 카테고리 값 확인

      // 선택된 카테고리와 테이블 카테고리 비교
      if (selectedCategory === "전체" || categoryText === selectedCategory) {
        row.style.display = ""; // 일치하면 보이기
      } else {
        row.style.display = "none"; // 일치하지 않으면 숨기기
      }
    }
  });
}
