document.addEventListener("DOMContentLoaded", function () {
    const search = document.querySelector(".searchBtn");
    const inputElem = document.querySelector(".searchInput");
    const tableBody = document.querySelector("tbody");
    const cultureInput = document.getElementById("cultureInput");
    const cultureBtn = document.getElementById("cultureBtn");
  
    if (!inputElem) {
      console.error("검색 입력 필드를 찾을 수 없습니다.");
      return;
    }
  
    function performSearch() {
      const inputValue = inputElem.value.trim();
      if (inputValue === "") {
        alert("검색어를 입력해주세요");
      } else {
        window.location.href = `search?q=${encodeURIComponent(inputValue)}`;
        inputElem.value = "";
      }
    }
  
    search.addEventListener("click", function (e) {
      e.preventDefault();
      performSearch();
    });
  
    inputElem.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  
    const key = '48797574726e62723131317355744744';
    const start_index = 1;
    let end_index = 1000;
    let fullData = []; // 전체 데이터를 저장할 전역 변수
    let filteredData = []; // 필터링된 데이터를 저장할 변수
    let currentIndex = 0; // 현재 렌더링된 데이터의 인덱스
  
    // 동적으로 "더보기" 버튼 생성
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.textContent = "더보기";
    loadMoreBtn.style.display = "none"; // 초기에는 숨김 처리
    document.querySelector(".cultureSearch").appendChild(loadMoreBtn);
  
    function fetchCardData() {
      let reqUrl = `http://openAPI.seoul.go.kr:8088/${key}/json/ListPublicReservationCulture/${start_index}/80`;
      
      $.ajax({
        url: reqUrl,
        method: "GET",
        success: function(res) {
          if (res.ListPublicReservationCulture && res.ListPublicReservationCulture.row) {
            console.log("카드 데이터 연결 성공", res);
            renderCards(res.ListPublicReservationCulture.row);
            initSwiper(); 
          } else {
            console.error("API 응답에 데이터가 없습니다.");
          }
        },
        error: function(err) {
          console.error("카드 데이터 연결 실패", err.status);
        }
      });
    }
  
    function renderCards(data) {
      const cardWrapper = document.querySelector(".swiper-wrapper");
  
      data.forEach((item) => {
        const cardsContent = `
          <div class="swiper-slide">
            <div class="card text-dark bg-light mb-3">
              <img src="${item.IMGURL ? item.IMGURL : "이미지 없음"}" class="card-img-top" alt="...">
              <div class="card-body">
                <h5 class="card-title">${item.SVCNM}</h5>
                <p class="card-desc">대상: ${item.USETGTINFO}</p>
                <p class="card-place">장소: ${item.PLACENM}</p>
              </div>
            </div>
          </div>`;
        cardWrapper.insertAdjacentHTML("beforeend", cardsContent);
      });
    }
  
    function initSwiper() {
      new Swiper(".swiper-container", {
        slidesPerView: "auto",
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: ".swiper-btn-next",
          prevEl: ".swiper-btn-prev",
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: true,
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        },
      });
    }
  
    function fetchFullData() {
      let reqUrl = `http://openAPI.seoul.go.kr:8088/${key}/json/ListPublicReservationCulture/${start_index}/${end_index}`;
      
      $.ajax({
        url: reqUrl,
        method: "GET",
        success: function(res) {
          if (res.ListPublicReservationCulture && res.ListPublicReservationCulture.row) {
            console.log("전체 데이터 로드 성공", res);
            fullData = res.ListPublicReservationCulture.row;
            filteredData = fullData; // 초기에는 전체 데이터를 필터링된 데이터로 설정
            renderInitialData(); // 처음 10개 데이터 렌더링
          } else {
            console.error("API 응답에 데이터가 없습니다.");
          }
        },
        error: function(err) {
          console.error("전체 데이터 로드 실패", err.status);
        }
      });
    }
  
    function renderInitialData() {
      currentIndex = 0;
      tableBody.innerHTML = ""; // 테이블 초기화
      const initialData = filteredData.slice(0, 10);
      renderData(initialData);
      currentIndex += initialData.length;
      toggleLoadMoreButton();
    }
  
    function filterData() {
      const inputValue = cultureInput.value.trim().toLowerCase();
      console.log(`입력값: ${inputValue}`);
  
      if (inputValue === "") {
        alert("검색어를 입력해 주세요.");
        return;
      }
  
      filteredData = fullData.filter((item) => {
        return item.SVCNM && item.SVCNM.toLowerCase().includes(inputValue);
      });
  
      console.log(`필터링된 데이터 개수: ${filteredData.length}`);
      renderInitialData();
    }
  
    function renderData(data) {
      data.forEach((item) => {
        const formatDate = (dateString) => dateString ? dateString.split(" ")[0] : "이벤트 종료";
  
        const tableRow = `
        <tr>
          <td class="name">${item.SVCNM ? item.SVCNM : "이벤트 종료"}</td>
          <td class="place">${item.PLACENM ? item.PLACENM : "이벤트 종료"}</td>
          <td class="payment">${item.PAYATNM ? item.PAYATNM : "이벤트 종료"}</td>
          <td class="startSvc">${item.SVCOPNBGNDT ? formatDate(item.SVCOPNBGNDT) : "이벤트 종료"}</td>
          <td class="startApply">${item.RCPTBGNDT ? formatDate(item.RCPTBGNDT) : "이벤트 종료"}</td>
          <td class="tel">${item.TELNO ? item.TELNO : "이벤트 종료"}</td>
          <td class="cancel">${item.REVSTDDAYNM ? item.REVSTDDAYNM : "이벤트 종료"}</td>
          <td class="url">${item.SVCURL ? `<a href="${item.SVCURL}" target="_blank">링크</a>` : "이벤트 종료"}</td>
        </tr>`;
        tableBody.insertAdjacentHTML("beforeend", tableRow);
      });
      console.log("데이터가 테이블에 렌더링되었습니다.");
    }
  
    function loadMoreData() {
      const nextData = filteredData.slice(currentIndex, currentIndex + 10);
      renderData(nextData);
      currentIndex += nextData.length;
      toggleLoadMoreButton();
    }
  
    function toggleLoadMoreButton() {
      if (currentIndex >= filteredData.length) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "block";
      }
    }
  
    cultureBtn.addEventListener("click", function () {
      console.log("문화 행사 검색 버튼 클릭됨");
      filterData();
    });
  
    cultureInput.addEventListener("keydown", function (e) {
      console.log(`키 입력 감지됨: ${e.key}`);
      if (e.key === "Enter") {
        e.preventDefault();
        console.log("Enter 키 눌림");
        filterData();
      }
    });
  
    loadMoreBtn.addEventListener("click", function () {
      console.log("더보기 버튼 클릭됨");
      loadMoreData();
    });
  
    fetchFullData();
  });
  