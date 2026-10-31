# 兔兔 Tracker · Tutu Tracker

高齡兔子（與小動物）的每日觀察記錄 Web App。侘寂風格 UI、多兔切換（最多 5 隻）、今日首圖、週日期條、狀態標籤、自訂題目與可編輯日記標題。**每位使用者登入後擁有獨立的兔子檔案與日誌**（Supabase 或本機 mock 模式）。

---

## 功能

- 登入／註冊（Supabase Email+密碼；可選 Magic Link）
- 未設定後端時：**開發 mock 模式**（本機 mock 帳號 + `localStorage`）
- 今日、填寫記錄、日曆、兔兔檔案（與原型 HTML 相同 UX）
- 食慾／便便／活動／體重／牙齒／痛楚與備註

## 本機開發

```bash
cp .env.example .env
npm install
npm run dev
```

瀏覽器開啟終端機顯示的網址（通常 `http://localhost:5173`）。

### Mock 模式（預設）

`.env` 中 **不填** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 即可。畫面會顯示「開發模式」提示；在「註冊」建立任意電郵與至少 6 字密碼，資料只存在**目前瀏覽器**。

### Supabase 正式後端

1. 在 [Supabase](https://supabase.com) 建立專案。
2. SQL Editor 執行 [`supabase/schema.sql`](./supabase/schema.sql)。
3. Authentication → Providers 啟用 Email（若要 Magic Link 一併設定）。
4. 將 **Project URL** 與 **anon public key** 填入 `.env`：

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. 重新 `npm run dev`，註冊新帳號即可雲端同步。

## 建置

```bash
npm run build
npm run preview
```

## 部署

### Vercel（建議）

1. 匯入此 GitHub repo。
2. Framework Preset：**Vite**；Build：`npm run build`；Output：`dist`。
3. 設定環境變數 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（可選）。
4. 根目錄已有 [`vercel.json`](./vercel.json) 支援 SPA 路由。

### GitHub Pages

1. 在 repo Settings → Pages 選擇 GitHub Actions 或手動部署 `dist`。
2. 若 repo 名為 `tutu-tracker`，建置前設定：

```bash
VITE_BASE_PATH=/tutu-tracker/ npm run build
```

3. 將 `dist` 內容推送到 `gh-pages` 分支或使用 Actions workflow。

## 專案結構

| 路徑 | 說明 |
|------|------|
| `src/styles/app.css` | 侘寂 UI（源自原型 draft） |
| `src/context/` | Auth、Tracker 狀態 |
| `src/lib/dataService.ts` | Supabase / mock 資料層 |
| `supabase/schema.sql` | 資料表與 RLS |

## 授權

MIT（可依需求調整）

---

## English (brief)

**Tutu Tracker** is a multi-user daily care log for elderly rabbits (wabi-sabi UI). Stack: **Vite + React + TypeScript**, **Supabase Auth & Postgres** (optional). Without Supabase env vars, the app runs in **mock mode** (local accounts + `localStorage`). See `.env.example`, `npm run dev`, deploy to **Vercel** or **GitHub Pages** with `VITE_BASE_PATH` when needed.
