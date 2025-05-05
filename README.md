# 錡利科技管理系統

工業型過濾網生產和買賣企業的 ERP 系統。

## 功能模塊

系統包含以下主要功能模塊：

- **儀錶板**：顯示關鍵營運數據，包括訂購單和採購單狀態統計及趨勢圖表
- **訂購單管理**：管理銷售訂單，追蹤處理狀態與出貨進度
- **採購單管理**：管理原材料採購，追蹤採購進度與驗收情形
- **經銷商管理**：維護客戶資料，供訂購單使用
- **物料商管理**：維護供應商資料，供採購單使用
- **成品管理**：管理工業過濾網成品資訊與庫存狀態
- **物料管理**：管理工業過濾網原材料資訊與庫存狀態

## 技術架構

- 前端：React + Next.js + Tailwind CSS
- 類型系統：TypeScript
- 圖表：Chart.js + React-ChartJS-2
- 圖標：React Icons
- 數據存儲：Supabase

## 數據持久化

本系統使用 Supabase 作為後端服務，提供以下功能：

- 關聯式數據庫（PostgreSQL）
- 文件存儲（Storage）
- 用戶認證（Auth）
- 實時訂閱（Realtime）

### Supabase 設置

在使用本系統前，需要完成 Supabase 的設置：

1. 註冊 [Supabase](https://supabase.com/) 帳戶並創建新專案
2. 獲取專案 URL 和匿名密鑰
3. 在專案根目錄創建 `.env.local` 文件，並添加以下內容：

```
NEXT_PUBLIC_SUPABASE_URL=你的專案URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密鑰
```

4. 按照 `docs/supabase-setup-guide.md` 中的指南設置數據庫表格

## 開發與運行

### 安裝依賴

```bash
npm install
```

### 開發環境運行

```bash
npm run dev
```

### 構建生產版本

```bash
npm run build
```

### 運行生產版本

```bash
npm start
```

## 訂製開發

此專案可根據企業需求進行訂製擴展，包括但不限於：

- 添加用戶驗證和權限管理
- 添加報表和分析功能
- 擴展庫存管理和生產排程功能
- 整合第三方服務如金流或運輸模塊

## 聯絡方式

錡利科技 - [您的聯絡資訊] 