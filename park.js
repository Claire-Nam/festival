document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 6,
  };
  const map = new kakao.maps.Map(container, options);

  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  let userLocation = null;
  const allParkData = [];
  let page = 1; // 전역 변수 선언
  let perPage = 10;
  let loadedDataCount = 0; // 이미 로드된 데이터의 수

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      userLocation = new kakao.maps.LatLng(lat, lon);
      
      // First display the marker with initial message
      const initialMessage = `
        <div style="padding:5px;">
          <div>현재위치</div>
        </div>`;
      
      const marker = new kakao.maps.Marker({
        map: map,
        position: userLocation
      });
  
      const infowindow = new kakao.maps.InfoWindow({
        content: initialMessage,
        removable: true
      });
  
      infowindow.open(map, marker);
      map.setCenter(userLocation);
      
      // Then get the address and update the infowindow
      const geocoder = new kakao.maps.services.Geocoder();
      
      console.log("Attempting to get address for:", lat, lon); // Debug log
      
      geocoder.coord2RegionCode(lon, lat, function(result, status) {
        console.log("Geocoder status:", status); // Debug log
        console.log("Geocoder result:", result); // Debug log
        
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].address_name;
          console.log("Found address:", address); // Debug log
          
          const updatedMessage = `
            <div style="padding:5px; align:center;">
              ${address}
            </div>`;
          
          infowindow.setContent(updatedMessage);
          console.log("InfoWindow content updated"); // Debug log
        } else {
          console.log("Geocoder failed with status:", status); // Debug log
        }
      });
  
      fetchAndMergeData();
    });
  } else {
    const locPosition = new kakao.maps.LatLng(33.450701, 126.570667);
    const message = "현재 위치를 확인할 수 없습니다.";
    userLocation = locPosition;

    displayMarker(locPosition, message);
    fetchAndMergeData();
  }

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

  const reqUrl =
    "https://api.odcloud.kr/api/15050093/v1/uddi:d19c8e21-4445-43fe-b2a6-865dff832e08";
  const serviceKey =
    "yQQSwbgJd1XztqRzDuOXA60QuXMUeCxfz3laS5T76FCYr9%2BzxmpWrlQVndXAux4Yb8bdsBcyPkOsgdPodGzzTQ%3D%3D";

  function fetchParkData(page, perPage) {
    const queryString = `?serviceKey=${serviceKey}&page=${page}&perPage=${perPage}`;

    return $.ajax({
      url: reqUrl + queryString,
      method: "GET",
      dataType: "json",
      contentType: "application/json",
    });
  }

  const KEY = '48797574726e62723131317355744744';

  function fetchSoeoulPark(page, perPage) {
    const startIndex = (page - 1) * perPage + 1;
    const endIndex = page * perPage;
    const requestUrl = `http://openapi.seoul.go.kr:8088/${KEY}/json/GetParkInfo/${startIndex}/${endIndex}`;

    return $.ajax({
      url: requestUrl,
      method: "GET",
      dataType: "json",
      contentType: "application/json",
    });
  }

  function fetchAndMergeData() {
    $.when(fetchParkData(page, perPage), fetchSoeoulPark(page, perPage))
      .then((parkRes, seoulRes) => {
        const parkData = parkRes[0].data.map((item) => ({
          주차장명: item.주차장명,
          운영요일: item.운영요일,
          주차장도로명주소: item.주차장도로명주소,
          연락처: item.연락처,
          요금정보: item.요금정보,
          위도: item.위도,
          경도: item.경도,
        }));

        const seoulParkData = seoulRes[0].GetParkInfo.row.map((item) => ({
          주차장명: item.PKLT_NM,
          운영요일: item.OPERATING_DAY,
          주차장도로명주소: "서울특별시 " + item.ADDR,
          연락처: item.TELNO,
          요금정보: item.CHGD_FREE_NM,
          위도: item.LAT,
          경도: item.LOT,
        }));

        const combinedData = [...parkData, ...seoulParkData];
        mergeData(combinedData);

        // 초기 10개 데이터 렌더링
        renderInitialData();
      })
      .catch((err) => {
        console.log("데이터 로드 중 오류 발생", err);
      });
  }

  function mergeData(newData) {
    newData.forEach((newItem) => {
      const duplicate = allParkData.some(
        (item) =>
          item.주차장명 === newItem.주차장명 &&
          item.위도 === newItem.위도 &&
          item.경도 === newItem.경도
      );
      if (!duplicate) {
        allParkData.push(newItem);
      }
    });
  }

  function renderInitialData() {
    // 초기 10개 데이터 렌더링
    const initialData = allParkData.slice(0, 10);
    loadedDataCount = initialData.length;
    renderParkList(initialData);
  }

  function renderParkList(data) {
    const tableBody = document.querySelector("#parkTable");
    if (loadedDataCount === 0) {
      // 테이블 헤더 추가 (최초 렌더링 시)
      tableBody.innerHTML = `
        <tr>
          <th>주차장명</th>
          <th>운영요일</th>
          <th>주소</th>
          <th>연락처</th>
          <th>요금 정보</th>
        </tr>
      `;
    }

    data.forEach((item) => {
      const tableRow = `
        <tr>
            <td class="name">${item.주차장명}</td>
            <td class="working">${item.운영요일 || "평일+토요일+공휴일"}</td>
            <td class="addr">${item.주차장도로명주소 || "정보 없음"}</td>
            <td class="tel">${item.연락처 || "정보 없음"}</td>
            <td class="parkfee">${item.요금정보 || "정보 없음"}</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", tableRow); // 기존 데이터 아래에 추가
    });
  }

  function getMoreInfo() {
    const loadMoreInfo = document.querySelector("#loadMore");

    if (loadMoreInfo) {
      loadMoreInfo.addEventListener("click", function () {
        loadMoreInfo.disabled = true;
        page++; // 전역 변수 page를 증가시켜 다음 페이지를 요청

        $.when(fetchParkData(page, perPage), fetchSoeoulPark(page, perPage))
          .then((parkRes, seoulRes) => {
            const parkData = parkRes[0].data.map((item) => ({
              주차장명: item.주차장명,
              운영요일: item.운영요일,
              주차장도로명주소: item.주차장도로명주소,
              연락처: item.연락처,
              요금정보: item.요금정보,
              위도: item.위도,
              경도: item.경도,
            }));

            const seoulParkData = seoulRes[0].GetParkInfo.row.map((item) => ({
              주차장명: item.PKLT_NM,
              운영요일: item.OPERATING_DAY,
              주차장도로명주소: "서울특별시 " + item.ADDR,
              연락처: item.TELNO,
              요금정보: item.CHGD_FREE_NM,
              위도: item.LAT,
              경도: item.LOT,
            }));

            const combinedData = [...parkData, ...seoulParkData];
            mergeData(combinedData);

            const nextData = allParkData.slice(loadedDataCount, loadedDataCount + 10);
            loadedDataCount += nextData.length;

            renderParkList(nextData);
            loadMoreInfo.disabled = false;
          })
          .catch((err) => {
            console.log("데이터 로드 중 오류 발생", err);
            loadMoreInfo.disabled = false;
          });
      });
    } else {
      console.log("더보기 버튼을 찾을 수 없습니다.");
    }
  }

  getMoreInfo();
});
