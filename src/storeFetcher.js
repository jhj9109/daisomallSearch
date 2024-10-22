// storeFetcher.js: 매장 정보 요청 및 DOM 처리 로직

const PORT = 3000;
const baseUrl = `http://localhost:${PORT}`;

// 매장 데이터 가져오는 함수
async function fetchStoresByLocation(userData) {
  const { latitude, longitude } = userData.position.coords;
  const path = "/api/ms/msg/selPkupStr"; // CORS 정책을 위반하지 않도록 프록시 서버 주소로 변경
  const payload = {
    curLitd: longitude,
    curLttd: latitude,
    currentPage: 1,
    geolocationAgrYn: "Y",
    keyword: "",
    mbMngNo: "MB102024100643552242",
    pageSize: 100,
    srchYn: "N",
  };

  try {
    const storeResponse = await fetch(baseUrl + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const storeResult = await storeResponse.json();
    if (storeResult.success && Array.isArray(storeResult.data)) {
      // 매장 리스트를 DOM에 표시
      return { ok: true, userData: { ...userData, stores: storeResult.data }};
    } else {
      console.error("매장 데이터를 가져오지 못했습니다.");
      return { ok: false };
    }
  } catch (error) {
    console.error("요청 중 오류 발생:", error);
  }
}

// 각 매장에 대한 재고 정보를 요청하는 함수
async function fetchStoreStocks(userData) {
  const path = "/api/pd/pdh/selStrPkupStck";
  const { stores } = userData;

  const stockRequests = stores.map((store) => ({
    pdNo: userData.searchItem, // 매장 객체에서 상품 번호
    // pdNo: `${솔루엠_충전기_어댑터_25W_블랙_pdNo}`, // 매장 객체에서 상품 번호
    strCd: store.strCd, // 매장 객체에서 매장 코드
  }));

  console.log(stockRequests);

  try {
    const stockResponse = await fetch(baseUrl + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockRequests),
    });

    const stockResult = await stockResponse.json();

    console.log(stockResult);

    if (stockResult.success && Array.isArray(stockResult.data)) {
      // 재고 정보 표시 처리
      return { ok: true, userData: { ...userData, stocks: stockResult.data }};
    } else {
      console.error("재고 정보를 가져오지 못했습니다.");
      return { ok: false };
    }
  } catch (error) {
    console.error("재고 요청 중 오류 발생:", error);
  }
}

async function fetchStoresByKeyword(userData) {
  const path = "/api/ms/msg/selPkupStr";
  const { keyword } = userData;
  const payload = {
    "curLitd": null, // 126.8644301,
    "curLttd": null, // 37.4979213,
    "currentPage": null, // 1,
    "geolocationAgrYn": null, // "Y",
    "keyword": keyword,
    "mbMngNo": null, // "MB102024100643552242",
    "pageSize": null, // 100,
    "srchYn": null, // "Y"
  }

  try {
    const storeResponse = await fetch(baseUrl + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const storeResult = await storeResponse.json();
    if (storeResult.success && Array.isArray(storeResult.data)) {
      // 매장 리스트를 DOM에 표시
      return { ok: true, userData: { ...userData, stores: storeResult.data }};
    } else {
      console.error("매장 데이터를 가져오지 못했습니다.");
      return { ok: false };
    }
  } catch (error) {
    console.error("요청 중 오류 발생:", error);
  }
}
export { fetchStoresByLocation, fetchStoreStocks, fetchStoresByKeyword };
