async function trackVisitor() {
  const startTime = Date.now();
  let clickCount = 0;

  // ✅ 使用 AllOrigins 代理來抓 ipapi.co
  let ipInfo = {};
  try {
    const res = await fetch(
      "https://api.allorigins.win/get?url=" + encodeURIComponent("https://ipapi.co/json/")
    );
    const data = await res.json();
    ipInfo = JSON.parse(data.contents);
  } catch (err) {
    console.error("取得 IP 資訊失敗：", err);
  }

  // ✅ 記錄點擊次數
  document.addEventListener("click", () => clickCount++);

  // ✅ 當使用者離開頁面時，上傳追蹤資料
  window.addEventListener("beforeunload", async () => {
    const stay = ((Date.now() - startTime) / 1000).toFixed(1);

    try {
      const response = await fetch("YOUR_SCRIPT_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: ipInfo.ip || "未知",
          region: ipInfo.country_name || "未知",
          page: window.location.pathname,
          stay: stay,
          clicks: clickCount,
        }),
      });

      // ✅ 成功時在 console 顯示
      const text = await response.text();
      console.log("Tracker 已上傳資料:", text);

      // ✅ 選擇性：在頁面上顯示提示訊息
      const el = document.createElement("div");
      el.textContent = "Tracker 已上傳資料 ✔";
      el.style.position = "fixed";
      el.style.bottom = "10px";
      el.style.right = "10px";
      el.style.padding = "5px 10px";
      el.style.backgroundColor = "#4caf50";
      el.style.color = "#fff";
      el.style.borderRadius = "5px";
      el.style.fontSize = "12px";
      el.style.zIndex = "9999";
      document.body.appendChild(el);

      setTimeout(() => el.remove(), 3000);
    } catch (err) {
      console.error("Tracker 上傳失敗:", err);
    }
  });
}

trackVisitor();
