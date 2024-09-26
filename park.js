document.addEventListener("DOMContentLoaded", function () {
  // 검색 버튼 선택
  const search = document.querySelector(".searchBtn");

  // 검색 버튼 이벤트 리스너 추가
  search.addEventListener("click", function (e) {
    e.preventDefault();

    const inputElem = document.querySelector(".searchInput");

    // 검색 입력 필드가 있는지 확인
    if (!inputElem) {
      console.error("검색 입력 필드를 찾을 수 없습니다.");
      return;
    }

    // 입력된 값이 비어있는지 확인
    const inputValue = inputElem.value.trim();
    if (inputValue === "") {
      alert("검색어를 입력해주세요");
    } else {
      // 검색어가 있으면 해당 URL로 이동
      window.location.href = `.search?q=${encodeURIComponent(inputValue)}`;
      inputElem.value = ""; // 입력 필드 초기화
    }
  });
});

// 주차장 api 가져오기
const reqUrl =
  "https://api.odcloud.kr/api/15050093/v1/uddi:d19c8e21-4445-43fe-b2a6-865dff832e08";
const serviceKey =
  "yQQSwbgJd1XztqRzDuOXA60QuXMUeCxfz3laS5T76FCYr9%2BzxmpWrlQVndXAux4Yb8bdsBcyPkOsgdPodGzzTQ%3D%3D";
let page = 1;
let perPage = 10;

function fetchParkData(page, perPage) {
  let queryString = `?serviceKey=${serviceKey}&page=${page}&perPage=${perPage}`;

  // 데이터 요청
  $.ajax({
    url: reqUrl + queryString,
    method: "GET",
    dataType: "json",
    contentType: "application/json",
    success: function (res) {
      console.log("연결 성공", res);
      renderParkList(res);
    },
    error: function (err) {
      console.log("연결 실패", err);
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 지도 생성
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 6,
  };
  const map = new kakao.maps.Map(container, options);

  // 지도 컨트롤 추가
  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  // 현재 위치 정보를 기반으로 마커와 인포윈도우 생성
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const locPosition = new kakao.maps.LatLng(lat, lon);
      const message = '<div style="padding:5px;">현재 내 위치</div>';

      displayMarker(locPosition, message, "red");
    });
  } else {
    const locPosition = new kakao.maps.LatLng(33.450701, 126.570667);
    const message = "현재 위치를 확인할 수 없습니다.";

    displayMarker(locPosition, message);
  }

  // 마커와 인포윈도우 표시 함수
  function displayMarker(locPosition, message) {
    const marker = new kakao.maps.Marker({
      map: map,
      position: locPosition,
    });

    const iwContent = message;
    const iwRemoveable = true;

    const infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable,
    });

    infowindow.open(map, marker);
    map.setCenter(locPosition);
  }

  // 지도가 완전히 로드된 후 레이아웃 재설정
  setTimeout(function () {
    map.relayout(); // 지도가 부모 요소의 크기에 맞게 재배치
  }, 0);

  fetchParkData(page, perPage);
});

// 공영 주차장 목록 렌더링
function renderParkList(data) {
  const tableBody = document.querySelector("#parkTable");

  data.data.forEach((item) => {
    const tableRow = `
    <tr>
        <td class="name">${item.주차장명}</td>
        <td class="working">${item.운영요일}</td>
        <td class="addr">${
          item.주차장도로명주소 ? item.주차장도로명주소 : "정보 없음"
        }</td>
        <td class="tel">${item.연락처 ? item.연락처 : "정보 없음"}</td>
        <td class="parkfee">${item.요금정보}</td>
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
    fetchParkData(page, perPage, function (isLastPage) {
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
