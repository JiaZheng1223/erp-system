# AWS Amplify 部署指南

本文檔說明如何使用 AWS Amplify 部署錡利科技管理系統。

## 準備工作

1. AWS 帳戶
2. 域名（可選，但建議有）
3. 安裝以下軟體：
   - Git
   - Node.js 18 或更高版本
   - npm 或 yarn

## 部署步驟

### 1. 設置 AWS Amplify

1. 登入 AWS 控制台
2. 進入 AWS Amplify 服務
3. 點擊「新建應用」>「從 Git 倉庫託管」
4. 選擇您的代碼倉庫（GitHub、BitBucket 或 AWS CodeCommit）
5. 授權 AWS Amplify 訪問您的代碼倉庫

### 2. 配置構建設定

在 AWS Amplify 控制台中，配置以下構建設定：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 3. 設置環境變數

在 AWS Amplify 控制台中，添加以下環境變數：

- `NEXT_PUBLIC_SUPABASE_URL`：您的 Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：您的 Supabase 匿名密鑰

### 4. 配置自定義域名（可選）

如果您想使用自定義域名：

1. 在 AWS Amplify 控制台中，進入「域名管理」
2. 點擊「添加域名」
3. 輸入您的域名
4. 按照指示配置 DNS 記錄

### 5. 部署應用

1. 提交您的代碼到 Git 倉庫
2. AWS Amplify 將自動檢測變更並開始部署
3. 您可以在 AWS Amplify 控制台中監控部署進度

## 更新應用

當需要更新應用時，只需：

1. 提交您的代碼變更到 Git 倉庫
2. AWS Amplify 將自動檢測變更並重新部署

## 生產環境優化

### 1. 安全性加固

- 啟用 AWS WAF 保護您的應用
- 使用 AWS Shield 防護 DDoS 攻擊
- 定期更新依賴套件

### 2. 備份設置

建立定期備份計劃，備份以下內容：

- Supabase 資料庫
- 環境變數配置
- 應用程式代碼

### 3. 監控配置

設置監控工具以便及時發現問題：

- 使用 AWS CloudWatch 監控應用性能
- 設置日誌聚合
- 配置警報通知

## 故障排除

### 部署失敗

檢查 AWS Amplify 構建日誌以找出錯誤原因：

1. 在 AWS Amplify 控制台中查看構建日誌
2. 檢查環境變數是否正確設置
3. 確認構建命令是否正確

### 無法訪問應用

1. 檢查 AWS Amplify 部署狀態
2. 確認域名配置是否正確
3. 檢查 SSL 證書是否有效

## 擴展配置

隨著業務增長，您可能需要擴展系統。考慮以下選項：

1. 使用 AWS CloudFront 進行內容分發
2. 配置 AWS Route 53 進行 DNS 管理
3. 使用 AWS Certificate Manager 管理 SSL 證書

## 聯絡支持

如遇到任何部署問題，請聯繫：

- AWS 支持：https://aws.amazon.com/support/
- 技術支持郵箱：[聯絡方式]
- 系統管理員：[聯絡方式] 