import {
  fetchStoresByLocation,
  fetchStoreStocks,
  fetchStoresByKeyword,
} from "./storeFetcher.js";

// 1. 품번
const itemInput = document.getElementById("item-input");
const searchItem = document.getElementById("search-item");

// 탭 및 콘텐츠 요소 가져오기
const nearbyTab = document.getElementById("nearby-tab");
const keywordTab = document.getElementById("keyword-tab");

const nearbyContent = document.getElementById("nearby-content");
const keywordContent = document.getElementById("keyword-content");

const locationInfo = document.getElementById("location-info");

const storeList = document.getElementById("store-list");

const keywordInput = document.getElementById("keyword-input");

const myInfo = {
  lcInfoGetSeCd: "PC",
  mbEid: "pow3434",
  mbMngNo: "MB102024100643552242",
};

let userData = {
  searchItem: null,
  position: null,
  stores: null,
  stocks: null,
  keyword: null,
};

const ACTION_POSITION = "position";
const ACTION_KEYWORD = "keyword";
const ACTION_POSITION_OR_KEYWORD = ACTION_POSITION + ACTION_KEYWORD;

const ACTION_STORES = "stores";
const ACTION_SEARCH_ITEM = "searchItem";
const ACTION_WILL_STOCKS_UPDATE = "willStocksUpdate";
const ACTION_STOCKS = "stocks";

// 1. 초기화 함수 (모든 이벤트 설정 및 초기 실행 로직 포함)
function initialize() {
  console.log("initialize");
  setupTabEvents();
  console.log("setupTabEvents");
  requestGeolocation();
  console.log("requestGeolocation");
  setupItemSearch();
  console.log("setupItemSearch");
  setupKeywordSearch();
  console.log("setupKeywordSearch");
}

// 2. 탭 전환 설정 함수
function setupTabEvents() {
  nearbyTab.addEventListener("click", () => switchTab("nearby"));
  keywordTab.addEventListener("click", () => switchTab("keyword"));
  switchTab("nearby"); // 기본 모드 설정
}

// 3. 탭 전환 처리 함수
function switchTab(mode) {
  if (mode === "nearby") {
    showElement(nearbyContent);
    hideElement(keywordContent);
    setActiveTab(nearbyTab, keywordTab);
  } else {
    showElement(keywordContent);
    hideElement(nearbyContent);
    setActiveTab(keywordTab, nearbyTab);
  }
}

// 4. 탭 활성화 시각적 처리 함수
function setActiveTab(activeTab, inactiveTab) {
  activeTab.classList.add("active");
  inactiveTab.classList.remove("active");
}

// 5. 요소 보이기/숨기기 유틸 함수
function showElement(element) {
  element.classList.remove("hidden");
}
function hideElement(element) {
  element.classList.add("hidden");
}

// 6. 지오로케이션 요청 및 처리 함수
function requestGeolocation() {
  // console.log(navigator)
  // console.log(navigator.geolocation)
  if (navigator.geolocation) {
    locationInfo.textContent = "위치 정보를 가져오는 중...";
    navigator.geolocation.getCurrentPosition(
      (position) => handleGeolocationSuccess(position),
      () => handleGeolocationError()
    );
  } else {
    console.log("브라우저가 위치 정보 지원하지 않음");
    locationInfo.textContent =
      "이 브라우저에서는 위치 정보를 지원하지 않습니다.";
  }
}

// 7. 지오로케이션 성공 처리 함수
async function handleGeolocationSuccess(position) {
  console.log("handleGeolocationSuccess");
  userData = { ...userData, position: position };
  await handleUserDataUpdated(ACTION_POSITION);
}

// 8. 지오로케이션 오류 처리 함수
function handleGeolocationError() {
  console.log("handleGeolocationError");
  locationInfo.textContent = "위치 정보를 받을 수 없습니다.";
}

// 9. 키워드 검색 입력 이벤트 설정 함수
function setupKeywordSearch() {
  keywordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); //1055897
      const keywordValue = keywordInput.value.trim();
      if (!keywordValue) return;
      userData = { ...userData, keyword: keywordValue };
      keywordInput.value = "";
      handleUserDataUpdated(ACTION_KEYWORD);
    }
  });
}

// 10. 검색 결과 표시 함수
function displayStoreList(results) {
  storeList.innerHTML = ""; // 기존 결과 초기화
  results.forEach((result) => {
    const li = document.createElement("li");
    li.textContent = result;
    storeList.appendChild(li);
  });
}

// 11. 검색 결과 초기화 함수
function clearStoreList() {
  storeList.innerHTML = "";
}

// 12. 품번 검색 설정 함수
function setupItemSearch() {
  itemInput.addEventListener("keypress", (event) => {
    // Enter 키의 키 코드는 13입니다.
    if (event.key === "Enter") {
      event.preventDefault(); //1055897
      const searchItemValue = itemInput.value.trim();
      if (!searchItemValue) return;
      userData = { ...userData, searchItem: searchItemValue };
      itemInput.value = "";
      handleUserDataUpdated(ACTION_SEARCH_ITEM);
    }
  });
}

async function handleUserDataUpdated(action) {
  let result;
  switch (action) {
    case ACTION_POSITION:
      const { latitude, longitude } = userData.position.coords;
      locationInfo.textContent = `현재 위치: 위도 ${latitude}, 경도 ${longitude}`;

    case ACTION_KEYWORD:
      if (action === ACTION_KEYWORD) {
        const { keyword } = userData;
        console.log(`keyword: ${keyword}`);
      }

    case ACTION_POSITION_OR_KEYWORD:
      if (action === ACTION_POSITION) {
        result = await fetchStoresByLocation(userData);
      } else if (action === ACTION_KEYWORD) {
        result = await fetchStoresByKeyword(userData);
      } else {
        alert("알 수 없는 액션입니다.");
      }
      if (!result.ok) break;
      console.log(`fetchStoresByLocation success`);
      userData = result.userData;

    case ACTION_STORES:
      displayStores(userData.stores);
      if (!userData.searchItem) break;
    
    case ACTION_SEARCH_ITEM:
      displaySearchItem(userData.searchItem);
      if (!userData.stores) break;
    
  case ACTION_WILL_STOCKS_UPDATE:
      result = await fetchStoreStocks(userData);
      if (!result.ok) break;
      console.log(`fetchStoreStocks success`);
      userData = result.userData;
    
    case ACTION_STOCKS:
      displayStoreStocks(userData.searchItem, userData.stocks);
      break;
    default:
      alert("알 수 없는 액션입니다.");
  }
}

function displaySearchItem(searchItemValue) {
  searchItem.textContent = `품번: ${searchItemValue}`;
}

// 매장 데이터를 DOM에 표시하는 함수
function displayStores(stores) {
  storeList.innerHTML = ""; // 기존 내용을 초기화

  stores.forEach((store) => {
    storeList.appendChild(createStoreBox(store));
  });
}

function createStoreBox(store) {
  const storeBox = document.createElement("div");
  storeBox.classList.add("store-box");
  storeBox.setAttribute("data-strCd", store.strCd); // 매장 코드 속성 추가

  storeBox.innerHTML = `
              <p>
                <strong>
                  <a 
                    href="https://map.naver.com/p/search/다이소 ${store.strNm}"
                    target="_blank"
                    class="store-link"
                  >
                    ${store.strNm}
                  </a>
                </strong>
              </p>
              <p>
                <a 
                  href="https://map.naver.com/p/search/다이소 ${store.strAddr}"
                  target="_blank"
                  class="store-link"
                >
                  ${store.strAddr}
                </a>
              </p>
          `;

  return storeBox;
}

// 재고 정보를 DOM에 표시하는 함수
function displayStoreStocks(searchItemValue, stockData) {
  stockData.forEach((stock) => {
    // 매장 박스를 찾아서 재고 정보 추가
    const storeBox = document.querySelector(
      `.store-box[data-strCd="${stock.strCd}"]`
    );
    console.log(storeBox);
    if (!storeBox) return;

    const stckP = storeBox.querySelector(
      `.stck-p[data-item="${searchItemValue}"]`
    );

    if (stckP) {
      console.log(stckP);
      stckP.textContent = `${searchItemValue} 재고: ${stock.stck}`;
    } else {
      const stckP = document.createElement("p");
      stckP.classList.add("stck-p");
      stckP.setAttribute("data-item", searchItemValue);
      stckP.textContent = `${searchItemValue} 재고: ${stock.stck}`;
      console.log(stckP);
      storeBox.appendChild(stckP);
    }
  });
}

// 초기화 함수 호출
initialize();
