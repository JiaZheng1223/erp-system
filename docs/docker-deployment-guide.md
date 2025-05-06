# Docker 部署指南

本文檔說明如何使用 Docker 和雲服務器部署錡利科技管理系統。

## 準備工作

1. 一台雲服務器（建議配置：2 核心 CPU，4GB 記憶體，50GB 硬碟）
2. 域名（可選，但建議有）
3. 安裝以下軟體：
   - Docker
   - Docker Compose
   - Git

## 部署步驟

### 1. 克隆代碼倉庫

```bash
git clone <您的代碼倉庫地址>
cd erp-system
```

### 2. 設置環境變數

複製環境變數範例文件並填入您的 Supabase 設定：

```bash
cp .env.local.example .env.local
# 編輯 .env.local 文件，填入 Supabase URL 和匿名密鑰
```

### 3. 設置 Nginx（如果需要 HTTPS）

如果您想使用自定義域名和 HTTPS，需要準備 SSL 證書：

```bash
# 建立證書目錄
mkdir -p nginx/certificates

# 使用 Let's Encrypt 獲取證書
# 將證書和密鑰放入 nginx/certificates 目錄
# 證書文件命名為 fullchain.pem
# 密鑰文件命名為 privkey.pem
```

編輯 `nginx/conf/default.conf` 文件，將 `server_name` 更改為您的實際域名。

### 4. 構建和啟動 Docker 容器

```bash
# 構建並啟動所有服務
docker-compose up -d --build

# 只構建和啟動應用，不包括 Nginx（如果您不需要 HTTPS）
docker-compose up -d --build erp-app
```

### 5. 檢查應用狀態

```bash
# 檢查容器狀態
docker-compose ps

# 查看應用日誌
docker-compose logs -f erp-app
```

## 更新應用

當需要更新應用時，請執行以下步驟：

```bash
# 拉取最新代碼
git pull

# 重新構建和啟動容器
docker-compose up -d --build
```

## 生產環境優化

### 1. 安全性加固

- 啟用防火牆，只開放必要的端口（如 80、443）
- 設定 fail2ban 防止暴力攻擊
- 定期更新系統和 Docker

### 2. 備份設置

建立定期備份計劃，備份以下內容：

- Supabase 資料庫
- 環境變數文件
- SSL 證書

### 3. 監控配置

設置監控工具以便及時發現問題：

- 使用 Prometheus + Grafana 監控容器和主機
- 設置日誌聚合（如 ELK Stack）
- 配置警報通知

## 故障排除

### 容器無法啟動

檢查日誌以找出錯誤原因：

```bash
docker-compose logs erp-app
```

### 無法訪問應用

1. 檢查容器是否正在運行：`docker-compose ps`
2. 檢查防火牆設置，確保端口已開放
3. 檢查 Nginx 配置是否正確

### SSL 憑證問題

如果遇到 SSL 憑證錯誤，請檢查：

1. 證書是否放在正確位置
2. 證書是否過期
3. Nginx 配置中的證書路徑是否正確

## 擴展配置

隨著業務增長，您可能需要擴展系統。考慮以下選項：

1. 垂直擴展：增加服務器資源（CPU、記憶體）
2. 水平擴展：部署多個應用實例並使用負載平衡器

## 聯絡支持

如遇到任何部署問題，請聯繫：

- 技術支持郵箱：[聯絡方式]
- 系統管理員：[聯絡方式] 