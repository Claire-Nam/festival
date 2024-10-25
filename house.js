document.addEventListener("DOMContentLoaded", function () {
  const search = document.querySelector(".searchBtn");
  const inputElem = document.querySelector(".searchInput");
  const tableBody = document.querySelector("tbody");

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
  let end_index = 10;

  function fetchCardData() {
    let reqUrl = `http://openAPI.seoul.go.kr:8088/${key}/json/ListPublicReservationCulture/${start_index}/80`;
    
    $.ajax({
      url: reqUrl,
      method: "GET",
      success: function(res) {
        console.log("카드 데이터 연결 성공", res);
        renderCards(res.ListPublicReservationCulture.row);
        initSwiper(); 
      },
      error: function(err) {
        console.log("카드 데이터 연결 실패", err.status);
      }
    });
  }

  // 테이블 데이터 가져오기
  function fetchTableData(start_index, end_index) {
    let reqUrl = `http://openAPI.seoul.go.kr:8088/${key}/json/ListPublicReservationCulture/${start_index}/${end_index}`;
    
    $.ajax({
      url: reqUrl,
      method: "GET",
      success: function(res) {
        console.log("테이블 데이터 연결 성공", res);
        renderData(res.ListPublicReservationCulture.row);
      },
      error: function(err) {
        console.log("테이블 데이터 연결 실패", err.status);
      }
    });
  }

  function renderData(data) {
    data.forEach((item) => {
      const formatDate = (dateString) => dateString ? dateString.split(" ")[0] : "이벤트 종료";

      const tableRow = `
      <tr>
        <td class="name">${item.SVCNM ? item.SVCNM : "이벤트 종료"}</td>
        <td class="status">${item.STATNM ? item.STATNM : "이벤트 종료"}</td>
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

  function getMoreInfo() {
    const loadMoreInfo = document.querySelector("#loadMore");

    loadMoreInfo.addEventListener("click", function() {
      loadMoreInfo.disabled = true;

      end_index += 10;
      fetchTableData(start_index, end_index);
      loadMoreInfo.disabled = false;
    });
  }

  
  fetchCardData(); 
  fetchTableData(start_index, end_index); 
  getMoreInfo(); 
});
