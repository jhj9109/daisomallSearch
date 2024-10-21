// proxy.js
require('dotenv').config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const urls = {
  baseUrl: "https://www.daisomall.co.kr",
  selPkupStr: "https://www.daisomall.co.kr/api/ms/msg/selPkupStr",
  selStrPkupStck: "https://www.daisomall.co.kr/api/pd/pdh/selStrPkupStck",
};

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// CORS 설정: 모든 도메인에 대해 접근 허용
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // 필요에 따라 특정 도메인으로 변경 가능
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// OPTIONS 요청 처리
app.options("/api/*", (req, res) => {
  res.sendStatus(200);
});


app.post("/api/*", async (req, res) => {
  const url = urls.baseUrl + req.originalUrl;
  try {
    const response = await axios.post(url, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
