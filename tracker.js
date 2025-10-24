/*
 * tracker.js - 自建網站分析追蹤程式碼
 * * 假設：您後端 API 端點為 POST /collect
 */

(function () {
    // ----------------------------------------------------
    // 【設定區】請替換為您的後端 API 網址
    // ----------------------------------------------------
    const API_ENDPOINT = 'YOUR_ANALYTICS_API_ENDPOINT'; 
    // 例如：'https://api.yourdomain.com/collect'; 
    
    // 儲存頁面載入時間，用於計算停留時間
    const pageLoadTime = Date.now(); 

    // ----------------------------------------------------
    // 【工具函數】產生 UUID/訪客 ID
    // ----------------------------------------------------
    function generateUUID() {
        // ... (保持 UUID 產生器不變)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ----------------------------------------------------
    // 【核心邏輯】發送數據到後端
    // ----------------------------------------------------
    function sendData(payload) {
        // 我們盡量使用 navigator.sendBeacon 來確保在用戶關閉頁面時也能發送離開事件
        const dataBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        
        if (navigator.sendBeacon) {
            // sendBeacon 適用於離開頁面時的少量數據傳輸
            navigator.sendBeacon(API_ENDPOINT, dataBlob);
        } else {
            // 作為備用方案，使用 fetch
            fetch(API_ENDPOINT, {
                method: 'POST',
                keepalive: true, 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: dataBlob
            })
            // .catch(error => console.error('發送追蹤資料失敗:', error)); // 開發除錯
        }
    }
    
    // ----------------------------------------------------
    // 【數據收集】頁面瀏覽 (Page View) - 進入事件
    // ----------------------------------------------------
    function collectPageView() {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = generateUUID();
            localStorage.setItem('visitorId', visitorId);
        }

        const data = {
            event_type: 'page_view', // 追蹤事件類型
            timestamp: new Date().toISOString(), // 進入時間
            visitor_id: visitorId,
            
            page_url: window.location.href, // 造訪甚麼網站 (URL)
            referrer: document.referrer, // 來源網站
            
            // 裝置資訊
            screen_width: window.screen.width,
            viewport_width: document.documentElement.clientWidth,
        };

        sendData(data);
    }
    
    // ----------------------------------------------------
    // 【數據收集】點擊事件 (Click Event) - 點擊次數追蹤
    // ----------------------------------------------------
    function setupClickListener() {
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // 簡單檢查點擊的目標是否為一個有意義的元素（例如按鈕或連結）
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('[data-track]')) {
                const clickData = {
                    event_type: 'click_event', // 追蹤點擊事件
                    timestamp: new Date().toISOString(),
                    visitor_id: localStorage.getItem('visitorId') || 'unknown',
                    
                    page_url: window.location.href,
                    // 記錄點擊元素的屬性
                    target_tag: target.tagName,
                    target_id: target.id || null,
                    target_class: target.className || null,
                    target_text: target.textContent.substring(0, 50).trim(), // 擷取前50字
                };
                sendData(clickData);
            }
        });
    }

    // ----------------------------------------------------
    // 【數據收集】頁面離開 (Page Unload) - 計算停留時間
    // ----------------------------------------------------
    function collectPageUnload() {
        const timeSpent = Date.now() - pageLoadTime; // 停留時間 (毫秒)

        const data = {
            event_type: 'page_unload', // 離開事件
            timestamp: new Date().toISOString(),
            visitor_id: localStorage.getItem('visitorId') || 'unknown',
            
            page_url: window.location.href,
            time_spent_ms: timeSpent, // 停留時間 (毫秒)
        };
        
        // 使用 addEventListener('beforeunload') 確保在用戶關閉視窗時觸發
        window.addEventListener('beforeunload', function() {
            sendData(data);
        });
    }


    // 初始化所有追蹤
    collectPageView();
    setupClickListener();
    collectPageUnload();

})();