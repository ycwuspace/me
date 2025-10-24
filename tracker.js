async function trackVisitor() {
  // 1️⃣ 收集資料
  const page = window.location.pathname;
  const stay = Math.round(performance.now() / 1000);
  const clicks = window.clickCount || 0;

  // 2️⃣ 取得 IP 與地區
  let ip = "unknown", country = "unknown";
  try {
    const res = await fetch("https://ipwhois.app/json/");
    const data = await res.json();
    ip = data.ip;
    country = data.country;
  } catch (e) {
    console.warn("無法取得 IP 資訊");
  }

  // 3️⃣ 傳送到 Google 表單（請改成你的 entry 編號）
  const formURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSe74h_bb1_CkcIsbGYReZxatgt_AmzYtJKB1MDob3qU9MeSsA/formResponse";

  const formData = new FormData();
  formData.append("entry.2120091794", ip);       // IP
  formData.append("entry.1733846290", country);  // 國家
  formData.append("entry.1801766488", page);     // 造訪時間
  formData.append("entry.871618283", stay);     // 離開時間
  formData.append("entry.1146234557", clicks);   //停留時間
  formData.append("entry.951955834", clicks);   // 點擊次數
  formData.append("entry.730942369", clicks);   // 頁面路徑

  await fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });

  console.log("✅ 已上傳資料到 Google 表單");
}

// 4️⃣ 記錄點擊數
window.clickCount = 0;
document.addEventListener("click", () => window.clickCount++);

// 5️⃣ 在離開頁面時上傳資料
window.addEventListener("beforeunload", trackVisitor);
