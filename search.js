// search.js - 段落搜尋 + 點擊確認滾動定位 + 高亮顯示

async function siteSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return alert("請輸入關鍵字");

  // 搜尋畫面上的段落元素（<p>、<div>、<li>）
  const blocks = Array.from(document.querySelectorAll("p, div, li"));
  const results = [];

  blocks.forEach((el) => {
    const text = el.innerText.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    if (lower.includes(query)) {
      const idx = lower.indexOf(query);
      const snippet = text.slice(Math.max(0, idx - 40), idx + 80);
      const page = el.closest(".page")?.id || "page1";  // 找出所在頁面
      results.push({
        title: document.title,
        snippet: snippet.replace(/\s+/g, " "),
        element: el,
        page: page
      });
    }
  });

  // 去重 + 限制 10 筆
  const uniqueResults = [];
  const seen = new Set();
  for (const r of results) {
    const key = r.snippet.slice(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(r);
    }
    if (uniqueResults.length >= 10) break;
  }

  showPopup(uniqueResults, query);
}

function showPopup(results, query) {
  const old = document.getElementById("searchPopup");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "searchPopup";
  overlay.style = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999;
  `;

  const box = document.createElement("div");
  box.style = `
    background: #fff;
    color: #000;
    padding: 25px 35px;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    position: relative;
    animation: popupFade 0.7s ease-out;
    font-family: "Noto Sans TC", sans-serif;
    line-height: 1.6;
  `;

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "✖";
  closeBtn.style = `
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    font-size: 20px;
    color: #555;
  `;
  closeBtn.onclick = () => overlay.remove();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.remove();
  });

  let html = `<h3 style="margin-top:0;margin-bottom:15px;">🔍 搜尋結果：「${query}」</h3>`;

  if (results.length === 0) {
    html += `<p>找不到與「${query}」相關的內容。</p>`;
  } else {
    html += `<ul style="padding-left: 15px; margin: 0;">`;
    results.forEach((r, i) => {
      html += `
        <li style="margin-bottom:15px; border-bottom:1px solid #ddd; padding-bottom:10px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="flex:1;">
            <div style="font-weight:bold; color:#1a73e8;">${r.title}</div>
            <div style="margin-top:5px; color:#333; font-size:14px; word-wrap:break-word;">
              ${highlightKeyword(r.snippet, query)}...
            </div>
          </div>
          <button data-index="${i}" class="confirm-btn" style="
            background: linear-gradient(90deg, #00aaff, #0072ff);
            color: #fff;
            border: none;
            border-radius: 999px;
            padding: 8px 18px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0, 114, 255, 0.3);
          ">確認</button>
        </li>`;
    });
    html += `</ul>`;
  }

  box.innerHTML = html;
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // 🔹 點擊「確認」按鈕滾動到目標段落
  overlay.querySelectorAll(".confirm-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(btn.dataset.index);
      const target = results[idx].element;
      if (!target) return;

      overlay.remove(); // 關閉彈窗

      const announcements = Array.from(document.querySelectorAll(".announcement"));
      if (announcements.length > 0) {
        // 有分頁（index.html）
        const index = announcements.indexOf(target.closest(".announcement"));
        const perPage = 5;
        const totalPages = Math.ceil(announcements.length / perPage);
        const targetPage = Math.floor(index / perPage) + 1;

        const pageInfo = document.getElementById("pageInfo");
        const dots = document.querySelectorAll(".dot");

        window.currentPage = targetPage;
        announcements.forEach((item, i) => {
          item.style.display = (i >= (targetPage - 1) * perPage && i < targetPage * perPage) ? "flex" : "none";
        });

        if (pageInfo) pageInfo.textContent = `第 ${targetPage} / ${totalPages} 頁`;
        dots.forEach(dot => dot.classList.toggle("active", Number(dot.dataset.page) === targetPage));

        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.classList.add("search-highlight");
          setTimeout(() => target.classList.remove("search-highlight"), 1500);
        }, 100);

      } else {
        // 無分頁（about.html 等其他頁面）
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("search-highlight");
        setTimeout(() => target.classList.remove("search-highlight"), 1500);
      }
    });
  });

  // 🔹 動畫 + 高亮樣式
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes popupFade {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    mark {
      background: #15c2b4;
      color: #000;
      font-weight: bold;
      border-radius: 3px;
      padding: 0 2px;
    }
    .search-highlight {
      animation: flashHighlight 1s ease-in-out 2;
    }
    @keyframes flashHighlight {
      0%, 100% { background: transparent; }
      25%, 75% { background: #c2154f; }
      50% { background: transparent; }
    }
    .confirm-btn:hover {
      transform: translateY(-2px);
      background: linear-gradient(90deg, #0096ff, #0059ff);
      box-shadow: 0 6px 15px rgba(0, 114, 255, 0.4);
    }
  `;
  document.head.appendChild(style);
}

function highlightKeyword(text, keyword) {
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
