# ShipDuty Calculator — 関税・送料シミュレーター

## プロジェクト概要

Upworkポートフォリオ用のShopify Embedded App + Theme App Extension。
商品ページに国別の概算関税・送料を表示するウィジェット。越境EC購入時の不安を解消。

**ターゲット:** 越境EC全般（Global-e未導入ストア）
**Dev Store:** ryo-dev-plus（Shopify Plus Dev Store）

## 技術スタック

- Remix（Shopify App Template）
- TypeScript
- Prisma + SQLite
- Polaris React
- GraphQL Admin API
- Shopify App Bridge
- Theme App Extension（商品ページウィジェット）

## 必要なAPIスコープ

read_products

## ディレクトリ構成

ship-duty/
├── CLAUDE.md
├── app/
│   ├── routes/
│   │   ├── app._index.tsx           # 設定ダッシュボード
│   │   ├── app.rates.tsx            # 国別送料テーブル管理
│   │   └── api.calculate.tsx        # 計算API（Theme Extensionから呼ばれる）
│   ├── services/
│   │   ├── duty-calculator.server.ts  # 関税計算ロジック
│   │   └── shipping-rates.server.ts   # 送料計算ロジック
│   ├── components/
│   │   ├── RatesTable.tsx            # 送料テーブル編集UI
│   │   └── CountrySelector.tsx       # 国選択
│   └── shopify.server.ts
├── extensions/
│   └── ship-duty-widget/             # Theme App Extension
│       ├── blocks/
│       │   └── duty-calculator.liquid  # 商品ページブロック
│       ├── assets/
│       │   ├── duty-calculator.js      # フロントエンドロジック
│       │   └── duty-calculator.css
│       └── shopify.extension.toml
├── prisma/
│   └── schema.prisma
├── shopify.app.toml
└── package.json

## 画面構成

### 管理画面（app._index.tsx）
- ウィジェットの有効/無効切り替え
- 基本設定（デフォルト発送元国、デフォルト通貨）

### 送料テーブル（app.rates.tsx）
- 国別の送料設定（国コード、重量帯、送料）
- 関税率の設定（国コード、カテゴリ、税率%）

### 商品ページウィジェット（Theme App Extension）
- 国選択ドロップダウン
- 「計算する」ボタン -> 概算表示（商品価格 + 推定関税 + 推定送料 = 合計）
- 免責表示

## 計算ロジック

関税 = productPrice × dutyRate（国・カテゴリ別）
送料 = 重量帯ベースの送料テーブル参照

## Prismaスキーマ（追加分）

model DutyRate {
  id            String   @id @default(cuid())
  shop          String
  countryCode   String
  category      String   @default("general")
  rate          Float    // 0.05 = 5%
  @@unique([shop, countryCode, category])
}

model ShippingRate {
  id            String   @id @default(cuid())
  shop          String
  countryCode   String
  minWeight     Int
  maxWeight     Int
  rate          Float
  currency      String   @default("USD")
  @@unique([shop, countryCode, minWeight, maxWeight])
}

model WidgetSettings {
  id              String   @id @default(cuid())
  shop            String   @unique
  isActive        Boolean  @default(true)
  originCountry   String   @default("JP")
  defaultCurrency String   @default("JPY")
}

## 初期データ（seed）

主要10カ国のデフォルト関税率・送料をseedで投入:
US, GB, DE, FR, AU, CA, KR, CN, SG, TW

## コーディング規約

- TypeScript strict mode
- Polaris Reactコンポーネント使用
- Theme App ExtensionはVanilla JS + CSS
- Conventional Commits形式

## MVPスコープ

含む:
- Theme App Extension（商品ページウィジェット）
- 国選択 -> 関税・送料の概算表示
- 管理画面で送料テーブル編集
- 免責事項の表示
- seed data（10カ国）

含まない（来週以降）:
- HSコード自動判定
- リアルタイム為替レート
- CSVインポート/エクスポート

## コスト

完全無料

## 開発コマンド

shopify app dev
shopify app deploy
