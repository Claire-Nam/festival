document.addEventListener("DOMContentLoaded", function () {
  // 지도 생성 및 추가
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 1,
  };
  const map = new kakao.maps.Map(container, options);

  // 마커 이미지 변경
  const imgSrc = './assets/location.png',
    imgSize = new kakao.maps.Size(42, 48),
    imgOption = { offset: new kakao.maps.Point(21, 48) };

  let markerImg = new kakao.maps.MarkerImage(imgSrc, imgSize, imgOption);
  let userLocation = null;
  const allParkData = [];
  let loadedDataCount = 0;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      userLocation = new kakao.maps.LatLng(lat, lon);

      const markerPosition = userLocation;

      const marker = new kakao.maps.Marker({
        map: map,
        position: markerPosition,
        image: markerImg,
      });

      // 인포윈도우 생성
      const initialMessage = `
        <div style="padding:5px;">
          <div>현재위치</div>
        </div>`;

      const infowindow = new kakao.maps.InfoWindow({
        content: initialMessage,
        removable: true,
      });

      infowindow.open(map, marker);
      map.setCenter(userLocation);

      // 가져온 위치의 경,위도 값을 주소로 변환
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.coord2RegionCode(lon, lat, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].address_name;

          const updatedMessage = `
            <div class="infowindow">
              ${address}
            </div>`;

          infowindow.setContent(updatedMessage);
        } else {
          console.log("Geocoder failed with status:", status);
        }
      });

      fetchAndMergeData();
      gpsBtn(); 
    });
  } else {
    const locPosition = new kakao.maps.LatLng(33.450701, 126.570667);
    const message = "현재 위치를 확인할 수 없습니다.";
    userLocation = locPosition;

    displayMarker(locPosition, message);
    fetchAndMergeData();
    gpsBtn(); 
  }

  // gps 버튼 함수
  function gpsBtn() {
    const gpsButton = document.createElement("button");
    gpsButton.innerHTML = '<img src="./assets/target.png" width="30" height="30">';
    gpsButton.style.position = "absolute";
    gpsButton.style.left = "15px";
    gpsButton.style.bottom = "20px";
    gpsButton.style.zIndex = "10";
    gpsButton.style.background = "none";
    gpsButton.style.border = "none";
    gpsButton.style.cursor = "pointer";

    gpsButton.addEventListener("click", function () {
      if (userLocation) {
        map.setCenter(userLocation); // 지도 중심을 현재 위치로 이동
        map.setLevel(3); // 줌 레벨 조정 (선택 사항)
      } else {
        alert("현재 위치를 사용할 수 없습니다.");
      }
    });

    container.appendChild(gpsButton); // 지도 컨테이너에 버튼 추가
  }

  function displayMarker(locPosition, message) {
    const marker = new kakao.maps.Marker({
      map: map,
      position: locPosition,
    });

    const infowindow = new kakao.maps.InfoWindow({
      content: message,
      removable: true,
    });

    infowindow.open(map, marker);
    map.setCenter(locPosition);
  }

  // API 데이터 연결 및 렌더링
  const reqUrl = "https://api.odcloud.kr/api/15050093/v1/uddi:d19c8e21-4445-43fe-b2a6-865dff832e08";
  const serviceKey = "yQQSwbgJd1XztqRzDuOXA60QuXMUeCxfz3laS5T76FCYr9%2BzxmpWrlQVndXAux4Yb8bdsBcyPkOsgdPodGzzTQ%3D%3D";
  const KEY = '48797574726e62723131317355744744';
  let page = 1;
  let perPage = 10;

  function fetchParkData(page, perPage) {
    const queryString = `?serviceKey=${serviceKey}&page=${page}&perPage=${perPage}`;
    return fetch(reqUrl + queryString).then(response => response.json());
  }

  function fetchSeoulPark(page, perPage) {
    const startIndex = (page - 1) * perPage + 1;
    const endIndex = page * perPage;
    const requestUrl = `http://openapi.seoul.go.kr:8088/${KEY}/json/GetParkInfo/${startIndex}/${endIndex}`;
    return fetch(requestUrl).then(response => response.json());
  }

  function fetchAndMergeData() {
    Promise.all([fetchParkData(page, perPage), fetchSeoulPark(page, perPage)])
      .then(([parkRes, seoulRes]) => {
        const parkData = parkRes.data.map((item) => ({
          주차장명: item.주차장명,
          운영요일: item.운영요일,
          주차장도로명주소: item.주차장도로명주소,
          연락처: item.연락처,
          요금정보: item.요금정보,
          위도: item.위도,
          경도: item.경도,
        }));

        const seoulParkData = seoulRes.GetParkInfo.row.map((item) => ({
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
    const initialData = allParkData.slice(0, 10);
    loadedDataCount = initialData.length;
    renderParkList(initialData);
  }

  function renderParkList(data) {
    const tableBody = document.querySelector("#parkTable");
    if (loadedDataCount === 0) {
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
      tableBody.insertAdjacentHTML("beforeend", tableRow);
    });
  }

  function getMoreInfo() {
    const loadMoreInfo = document.querySelector("#loadMore");

    if (loadMoreInfo) {
      loadMoreInfo.addEventListener("click", function () {
        loadMoreInfo.disabled = true;
        page++;

        Promise.all([fetchParkData(page, perPage), fetchSeoulPark(page, perPage)])
          .then(([parkRes, seoulRes]) => {
            const parkData = parkRes.data.map((item) => ({
              주차장명: item.주차장명,
              운영요일: item.운영요일,
              주차장도로명주소: item.주차장도로명주소,
              연락처: item.연락처,
              요금정보: item.요금정보,
              위도: item.위도,
              경도: item.경도,
            }));

            const seoulParkData = seoulRes.GetParkInfo.row.map((item) => ({
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
