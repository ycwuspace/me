async function trackVisitor() {
  const startTime = Date.now();
  let clickCount = 0;

  // 取得訪客 IP 與地區
  const ipInfo = await fetch("https://ipapi.co/json/").then(r => r.json());

  // 記錄點擊次數
  document.addEventListener("click", () => clickCount++);

  // 當使用者離開頁面時，上傳追蹤資料
  window.addEventListener("beforeunload", async () => {
    const stay = ((Date.now() - startTime) / 1000).toFixed(1);
    await fetch("https://script.google.com/macros/s/AKfycbxu7tnEbl97DhZO3T79UKnsb6WCF2k2FEFl6ObMizyxaq1mR3J2-tLgXurrs5lbD-Vv/exec", {
      method: "POST",
      body: JSON.stringify({
        ip: ipInfo.ip,
        region: ipInfo.country_name,
        page: window.location.pathname,
        stay: stay,
        clicks: clickCount
      })
    });
  });
}

trackVisitor();
