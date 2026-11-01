# 兔兔 Tracker · Tutu Tracker

高齡兔子（與小動物）的每日觀察記錄 Web App（侘寂風格 UI）。**目前對外展示與 GitHub Pages 上線的是單檔 HTML Demo**（[`site/index.html`](./site/index.html)），含登入、首頁預覽、多語系、字級、多兔切換與完整 Tracker 畫面。

舊版 **Vite + React + TypeScript** 原始碼仍保留在 [`src/`](./src/)（可選 Supabase 後端），供日後接回正式後端；**Pages 不再建置 React**。

---

## 開啟 HTML Demo（本機）

在 repo 根目錄用任意靜態伺服器提供 `site/` 資料夾（不要用 `file://` 開啟，Google Identity Services 與部分行為需要 HTTP origin）：

```bash
# 任選其一
npx --yes serve site -l 8080
python3 -m http.server 8080 --directory site
```

瀏覽器開啟 `http://localhost:8080/`。

### Demo 登入與資料

- **一般註冊／登入**：飼主姓名、帳號、電郵、密碼（示範用，無真實伺服器）。
- **Google**：未設定 Client ID 時為**離線示範帳戶選擇器**；若要真實 OAuth，在 `site/index.html` 底部將 `const GOOGLE_CLIENT_ID = '';` 改為你的網頁 Client ID，並在 Google Cloud Console 將授權 JavaScript 來源設為你使用的 origin（例如 `http://localhost:8080`）。
- **忘記密碼（Demo）**：會產生暫時密碼並**直接顯示在畫面上**（僅示範，非正式寄信流程）。
- 所有帳號與兔子資料存在**本機 `localStorage`**，清除瀏覽器資料即會消失。

### 語言與字級（「更多」設定）

| 語言 | `zh-Hant`（預設）、`en`、`ja` |
| 字級 | `sm` / `md` / `lg`（以 `rem` 縮放整體 UI） |

---

## GitHub Pages 部署

合併到 **`main`** 後，[`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) 會將 **`site/`** 目錄原樣發佈到 Pages（無 Node 建置步驟）。

1. GitHub **Settings → Pages** → **Source** 選 **GitHub Actions**（勿用手動 `gh-pages` 分支）。
2. 部署完成後：**https://kath5846-art.github.io/tutu-tracker/**

若要更新線上 Demo，修改 [`site/index.html`](./site/index.html) 並合併至 `main` 即可。

---

## React 版（選用，本機開發）

```bash
cp .env.example .env
npm install
npm run dev
```

未填 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 時為 mock 模式。Supabase 設定見 [`supabase/schema.sql`](./supabase/schema.sql) 與 `.env.example`。

建置（非 Pages 路徑）：`npm run build` · `npm run preview`

### Vercel

Framework：**Vite** · Build：`npm run build` · Output：`dist` · 環境變數見 `.env.example`。

---

## 專案結構

| 路徑 | 說明 |
|------|------|
| `site/index.html` | **目前對外 Demo**（Pages 發佈來源） |
| `src/` | React 版 UI 與 Supabase/mock 資料層 |
| `supabase/schema.sql` | 正式後端 schema（選用） |

## 授權

MIT

---

## English (brief)

**Tutu Tracker** is a wabi-sabi daily care log for elderly rabbits. **Production demo:** single-file [`site/index.html`](./site/index.html) (localStorage demo auth; optional real Google via `GOOGLE_CLIENT_ID`). **GitHub Pages** deploys the `site/` folder on push to `main` (Source: GitHub Actions). Languages: zh-Hant, en, ja; font sizes sm/md/lg. Legacy **Vite + React** code remains under `src/` for optional Supabase development.
