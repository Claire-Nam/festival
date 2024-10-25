document.addEventListener("DOMContentLoaded", function () {
  // 검색 버튼 선택
  const search = document.querySelector(".searchBtn");
  const inputElem = document.querySelector(".searchInput");
  const tableBody = document.querySelector("tbody"); // tbody 요소를 DOMContentLoaded 이벤트 내부에서 선택

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

  const key = '48797574726e62723131317355744744';
  const start_index = 1;
  let end_index = 10;

  function fetchData(start_index, end_index) {
    let reqUrl = `http://openAPI.seoul.go.kr:8088/${key}/json/ListPublicReservationCulture/${start_index}/${end_index}`;
    
    $.ajax({
      url: reqUrl,
      method: "GET",
      success: function(res) {
        console.log("연결 성공", res);
        // 데이터가 있으면 renderData 함수 호출
        renderData(res.ListPublicReservationCulture.row);
      },
      error: function(err) {
        console.log("연결 실패", err.status);
      }
    });
  }

  function renderData(data) {
    data.forEach((item) => {
      // 날짜와 시간 정보가 함께 있을 경우, 날짜 부분만 추출 (yyyy-mm-dd)
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
      </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", tableRow);
    });
  }

  function getMoreInfo() {
    const loadMoreInfo = document.querySelector("#loadMore");

    loadMoreInfo.addEventListener("click", function() {
      loadMoreInfo.disabled = true;

      end_index += 10; // 인덱스를 10씩 증가시킵니다.
      fetchData(start_index, end_index);
      loadMoreInfo.disabled = false;
    });
  }

  getMoreInfo(); // getMoreInfo 함수 호출

  // 처음 데이터 로드
  fetchData(start_index, end_index);
});
