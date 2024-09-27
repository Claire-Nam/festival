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
const reqUrl = "https://www.eshare.go.kr/eshare-openapi/rsrc/list/010000/";
const serviceKey = "d41d8cd98f003204a9800998ecf8427e";
let pageNo = 1;
let numOfRows = 20;

$(document).ready(function () {
  // swiper 초기화
  const swiper = new Swiper(".swiper-container", {
    slidesPerView: "auto", // 화면에 보이는 카드 수
    spaceBetween: 20, // 카드 간 간격
    loop: true,
    navigation: {
      nextEl: ".swiper-btn-next",
      prevEl: ".swiper-btn-prev",
    },
    centeredSlides: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
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

  fetchData(pageNo, numOfRows);
});

function fetchData(pageNo, numOfRows, callback) {
  let queryString = `${serviceKey}`;

  // api 데이터 요청
  $.ajax({
    url: reqUrl + queryString,
    method: "GET",
    dataType: "json",
    contentType: "application/json",
    headers: {
      requestBody: {
        pageNo: pageNo || 1,
        numOfRows: numOfRows || 20,
        updBgngYmd: "20100101",
        updEndYmd: "20241231",
      },
    },
    success: function (res) {
      console.log("연결 성공", res);
      renderCards(res);
      renderTable(res);

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
      <img src="${item.imgFileUrlAddr}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${item.rsrcNm}</h5>
        <p class="card-addr">${item.addr}</p>
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
  // 모달 배경을 어둡게 하기 위한 오버레이 생성
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");

  const modal = document.createElement("div");
  modal.classList.add("custom-modal");

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <img src="${item.imgFileUrlAddr} />
      <h3 class="modal-title">숙소 이름: ${item.rsrcNm}</h3>
      <p class="modal-addr">주소: ${item.addr}${item.daddr}</p>
      <p class="open">예약 URL: ${item.instUrlAddr}</p>
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
  modal.style.display = "none";
  modalOverlay.style.display = "none";
  document.body.removeChild(modal);
  document.body.removeChild(modalOverlay);
}

// 식당 정보 호출
function renderTable(data) {
  const tableBody = document.querySelector("#resTable tbody");

  data.data.forEach((item) => {
    const tableRow = `
      <tr>
        <td class="name">${item.rsrcNm}</td>
        <td class="addr">${item.addr}+' '+${item.daddr}</td>
        <td class="reservation"><a href="${item.instUrlAddr}">예약하기</a></td>
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
    fetchData(pageNo, numOfRows, function (isLastPage) {
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
