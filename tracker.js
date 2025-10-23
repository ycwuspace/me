async function trackVisitor() {
  console.log("🔍 Tracker 啟動中...");

  const startTime = Date.now();
  let clickCount = 0;
  let ipInfo = {};

  try {
    const res = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://ipapi.co/json/"));
    ipInfo = await res.json();
    console.log("🌐 IP 資訊抓取成功：", ipInfo);
  } catch (err) {
    console.error("❌ 取得 IP 資訊失敗：", err);
  }

  document.addEventListener("click", () => {
    clickCount++;
    console.log(`🖱️ 點擊次數：${clickCount}`);
  });

  window.addEventListener("beforeunload", async () => {
    const stay = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`📤 準備上傳追蹤資料 (停留 ${stay} 秒)`);

    try {
      const response = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: ipInfo.ip || "未知",
          region: ipInfo.country_name || "未知",
          page: window.location.pathname,
          stay,
          clicks: clickCount,
        }),
      });

      const result = await response.json();
      console.log("✅ Tracker 上傳成功：", result.json);
    } catch (err) {
      console.error("🚫 Tracker 上傳失敗：", err);
    }
  });
}

trackVisitor();
