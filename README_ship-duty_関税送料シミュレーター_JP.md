# ShipDuty Calculator — 越境EC向け関税・送料シミュレーター

> **何を:** Shopifyストアの商品ページに国別の概算関税・送料を表示し、越境EC購入時の不安を解消するアプリ
> **誰に:** Global-e未導入のShopifyストアオーナー、越境ECバイヤー
> **技術:** Remix · TypeScript · Prisma · SQLite · Polaris React · Shopify App Bridge · Theme App Extension

**ソースコード:** [GitHub](https://github.com/mer-prog/ship-duty)

---

## このプロジェクトで証明できるスキル

| スキル | 実装内容 |
|--------|----------|
| Shopify Embedded App開発 | App Bridge + Polaris UIによる管理画面、OAuth認証、Webhookハンドリング |
| Theme App Extension | Liquid + Vanilla JS + CSSによる商品ページ埋め込みウィジェット |
| フルスタックAPI設計 | Remixルートベースの計算API（CORS対応、バリデーション、エラーハンドリング） |
| データベース設計・ORM | Prismaスキーマ設計（4モデル、複合ユニーク制約）、マイグレーション管理、シードデータ |
| 国際化（i18n） | React Context + JSON辞書による日英切り替え（ネストキー対応） |
| ビジネスロジック分離 | サーバーサイドサービス層による関税計算・送料計算の分離設計 |
| レスポンシブUI | Polaris Reactコンポーネント活用、テーマ拡張のCSS設計 |

---

## 技術スタック

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| フレームワーク | Remix ^2.16.1 | SSR・ルーティング・API |
| 言語 | TypeScript ^5.2.2 (strict mode) | 型安全な開発 |
| ORM | Prisma ^6.2.1 | DBスキーマ管理・クエリ |
| データベース | SQLite | 軽量・ポータブルなデータ保存 |
| UIライブラリ | Polaris React ^12.0.0 | Shopify管理画面デザイン準拠 |
| Shopify統合 | @shopify/shopify-app-remix ^4.1.0 | 認証・セッション管理 |
| Shopify統合 | @shopify/app-bridge-react ^4.1.6 | 埋め込みアプリ基盤 |
| セッション管理 | @shopify/shopify-app-session-storage-prisma ^8.0.0 | Prismaベースセッション保存 |
| ビルドツール | Vite ^6.2.2 | HMR・バンドル |
| フロントエンド | React ^18.2.0 | 管理画面UI |
| テーマ拡張 | Vanilla JS + CSS + Liquid | 商品ページウィジェット |
| リンター | ESLint ^8.42.0 + Prettier ^3.2.4 | コード品質維持 |

---

## アーキテクチャ概要

```
┌──────────────────────────────────────────────────────────────────┐
│                     Shopifyストアフロント                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Theme App Extension（商品ページ）                 │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐    │  │
│  │  │ duty-calculator  │  │  duty-calculator.js (IIFE)   │    │  │
│  │  │    .liquid       │──│  国選択 → API呼出 → 結果表示  │    │  │
│  │  └─────────────────┘  └──────────┬───────────────────┘    │  │
│  └──────────────────────────────────┼────────────────────────┘  │
└─────────────────────────────────────┼────────────────────────────┘
                                      │ POST /api/calculate
                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Remix サーバー（埋め込みアプリ）                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ app._index   │  │ app.rates    │  │ api.calculate      │     │
│  │ 設定画面     │  │ 料金テーブル │  │ 計算APIエンドポイント│     │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘     │
│         │                 │                     │                │
│         ▼                 ▼                     ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  サービス層                              │    │
│  │  duty-calculator.server.ts  │  shipping-rates.server.ts │    │
│  └─────────────────────────────┴───────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Prisma ORM + SQLite                        │    │
│  │  Session │ DutyRate │ ShippingRate │ WidgetSettings     │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 主要機能

### 1. 関税・送料計算ウィジェット（Theme App Extension）
商品ページに埋め込まれるウィジェット。購入者が配送先の国を選択すると、関税・送料の概算を即座に表示する。

- **国選択ドロップダウン:** 10カ国対応（US, GB, DE, FR, AU, CA, KR, CN, SG, TW）
- **計算結果表示:** 商品価格 + 推定関税 + 推定送料 = 推定合計
- **通貨フォーマット:** `Intl.NumberFormat`による各通貨の適切な表示
- **免責表示:** カスタマイズ可能な免責文言
- **実装:** Liquid + Vanilla JS（IIFE）+ CSS、Reactに依存しない軽量設計

### 2. 設定ダッシュボード（管理画面）
ストアオーナーがウィジェットの動作を制御する管理画面。

- **ウィジェット有効/無効切替:** アクティブ/非アクティブのバッジ表示
- **発送元国設定:** 11カ国から選択（JP含む）
- **デフォルト通貨設定:** 10通貨から選択（JPY, USD, EUR, GBP, AUD, CAD, KRW, CNY, SGD, TWD）
- **実装:** Polaris Reactコンポーネント、Remixアクションによるフォーム処理

### 3. 料金テーブル管理（管理画面）
国別の関税率と送料を管理するCRUD画面。

- **関税率管理:** 国コード × カテゴリ別の税率設定（IndexTable + モーダル）
- **送料管理:** 国コード × 重量帯別の送料設定
- **インライン削除:** 各レコードの削除ボタン
- **実装:** Polaris IndexTable、Modal、Banner、Remixの複数インテント対応アクション

### 4. 計算API
テーマ拡張からの計算リクエストを処理するRESTエンドポイント。

- **バリデーション:** 必須フィールドチェック、数値検証、ウィジェット有効状態確認
- **フォールバック:** カテゴリ別税率が未設定の場合、"general"カテゴリに自動フォールバック
- **CORS対応:** 全オリジンからのPOSTリクエストを許可
- **エラーハンドリング:** 400/403/405/500のHTTPステータスコード別応答

### 5. 国際化（i18n）
管理画面の日英切替機能。

- **React Contextベース:** I18nProviderによるロケール管理
- **ネストキー対応:** ドット区切りのキー（例: `settings.title`）で翻訳文字列にアクセス
- **言語切替UI:** EN/JAトグルボタン（全画面に表示）
- **デフォルト言語:** 日本語（ja）

### 6. Webhook処理
- **app/uninstalled:** アプリアンインストール時に全セッションデータを削除
- **app/scopes_update:** APIスコープ変更時にセッションのスコープを更新

---

## APIエンドポイント

### POST `/api/calculate`

関税・送料の概算計算を実行する。

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| shop | string | はい | ショップドメイン |
| countryCode | string | はい | 配送先国コード（ISO 3166-1 alpha-2） |
| productPrice | number | はい | 商品価格（0以上） |
| weight | number | いいえ | 重量（グラム、デフォルト: 500） |
| category | string | いいえ | 商品カテゴリ（デフォルト: "general"） |

**レスポンス（200）:**

```json
{
  "productPrice": 100.00,
  "duty": {
    "rate": 0.05,
    "amount": 5.00
  },
  "shipping": {
    "rate": 15.00,
    "currency": "USD",
    "weightBand": "0g - 500g"
  },
  "totalEstimate": 120.00,
  "currency": "JPY",
  "disclaimer": "This is an estimate only..."
}
```

**エラーレスポンス:**

| ステータス | 条件 |
|------------|------|
| 400 | 必須フィールド未指定、productPriceが数値でない・負の値 |
| 403 | 対象ショップのウィジェットが無効 |
| 405 | POST以外のHTTPメソッド |
| 500 | サーバー内部エラー |

---

## データベース設計

### ER図

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Session    │     │    DutyRate       │     │   ShippingRate     │
├──────────────┤     ├──────────────────┤     ├────────────────────┤
│ id       PK  │     │ id           PK  │     │ id             PK  │
│ shop         │     │ shop             │     │ shop               │
│ state        │     │ countryCode      │     │ countryCode        │
│ isOnline     │     │ category         │     │ minWeight (g)      │
│ scope        │     │ rate (Float)     │     │ maxWeight (g)      │
│ expires      │     │                  │     │ rate (Float)       │
│ accessToken  │     │ UQ: shop +       │     │ currency           │
│ userId       │     │   countryCode +  │     │                    │
│ firstName    │     │   category       │     │ UQ: shop +         │
│ lastName     │     └──────────────────┘     │   countryCode +    │
│ email        │                               │   minWeight +      │
│ accountOwner │     ┌──────────────────┐     │   maxWeight        │
│ locale       │     │ WidgetSettings   │     └────────────────────┘
│ collaborator │     ├──────────────────┤
│ emailVerified│     │ id           PK  │
│ refreshToken │     │ shop        UQ   │
│ refreshToken │     │ isActive         │
│   Expires    │     │ originCountry    │
└──────────────┘     │ defaultCurrency  │
                     └──────────────────┘
```

### 計算ロジック

```
関税額 = 商品価格 × 関税率（国・カテゴリ別）
  └─ カテゴリ別税率が未登録の場合 → "general"カテゴリにフォールバック
  └─ "general"も未登録の場合 → 税率0%

送料 = 重量帯テーブル参照（国コード × 重量範囲）
  └─ 該当する重量帯が未登録の場合 → 送料0

合計推定額 = 商品価格 + 関税額 + 送料（小数点2桁で丸め）
```

---

## シードデータ

主要10カ国のデフォルトデータを投入（対象ショップ: `ryo-dev-plus.myshopify.com`）。

### 関税率（カテゴリ: general）

| 国コード | 国名 | 税率 |
|----------|------|------|
| US | アメリカ | 5% |
| GB | イギリス | 4% |
| DE | ドイツ | 4% |
| FR | フランス | 4% |
| AU | オーストラリア | 5% |
| CA | カナダ | 5% |
| KR | 韓国 | 8% |
| CN | 中国 | 10% |
| SG | シンガポール | 0% |
| TW | 台湾 | 6% |

### 送料（3重量帯、USD）

| 国コード | 0〜500g | 501〜1000g | 1001〜2000g |
|----------|---------|-----------|------------|
| US | $15 | $22 | $35 |
| GB | $18 | $26 | $40 |
| DE | $18 | $26 | $40 |
| FR | $18 | $26 | $40 |
| AU | $20 | $30 | $45 |
| CA | $16 | $24 | $38 |
| KR | $12 | $18 | $28 |
| CN | $10 | $16 | $25 |
| SG | $12 | $18 | $28 |
| TW | $10 | $16 | $25 |

---

## 画面仕様

### 1. ランディングページ（`/`）
ショップドメイン入力画面。ログインフォームからOAuth認証フローへ遷移。i18nによる日英切替対応。

### 2. ログインページ（`/auth/login`）
Shopifyショップドメインの入力とバリデーション。MissingShop/InvalidShopのエラーメッセージ表示。

### 3. 設定ダッシュボード（`/app`）
ウィジェットの有効/無効切替、発送元国選択、デフォルト通貨選択。Polarisレイアウト（Page + Layout + Card構成）。

### 4. 料金テーブル管理（`/app/rates`）
関税率テーブルと送料テーブルの2セクション構成。各テーブルにレコード追加モーダル、削除ボタン付き。空状態時はBannerで案内表示。

### 5. 商品ページウィジェット（Theme App Extension）
配送先国選択 → 計算ボタン → 結果表示（商品価格・関税・送料・合計）。エラー表示、免責文言。テーマエディタからタイトル・ボタンテキスト・免責文言をカスタマイズ可能。

---

## プロジェクト構成

```
ship-duty/
├── app/
│   ├── routes/
│   │   ├── app.tsx                          # アプリレイアウト（i18n・ナビ）    48行
│   │   ├── app._index.tsx                   # 設定ダッシュボード              155行
│   │   ├── app.rates.tsx                    # 料金テーブル管理                405行
│   │   ├── api.calculate.tsx                # 計算APIエンドポイント            85行
│   │   ├── auth.$.tsx                       # OAuth認証ルーター                 9行
│   │   ├── auth.login/
│   │   │   ├── route.tsx                    # ログインフォーム                  89行
│   │   │   └── error.server.tsx             # ログインエラーハンドラ            17行
│   │   ├── _index/
│   │   │   ├── route.tsx                    # ランディングページ               67行
│   │   │   └── styles.module.css            # ランディングスタイル             74行
│   │   ├── webhooks.app.uninstalled.tsx     # アンインストールWebhook          18行
│   │   └── webhooks.app.scopes_update.tsx   # スコープ更新Webhook              22行
│   ├── services/
│   │   ├── duty-calculator.server.ts        # 関税計算ロジック                 44行
│   │   └── shipping-rates.server.ts         # 送料計算ロジック                 33行
│   ├── components/
│   │   ├── LanguageToggle.tsx               # 言語切替ボタン                   30行
│   │   └── AppNavMenu.tsx                   # ナビゲーションメニュー           17行
│   ├── i18n/
│   │   ├── context.tsx                      # i18nプロバイダ・フック            72行
│   │   ├── en.json                          # 英語翻訳辞書                     75行
│   │   └── ja.json                          # 日本語翻訳辞書                   75行
│   ├── root.tsx                             # HTMLドキュメントルート           31行
│   ├── entry.server.tsx                     # サーバーエントリポイント         60行
│   ├── routes.ts                            # ルート設定                        4行
│   ├── globals.d.ts                         # 型宣言                            2行
│   ├── shopify.server.ts                    # Shopifyアプリ設定                36行
│   └── db.server.ts                         # Prismaシングルトン               16行
├── extensions/
│   └── ship-duty-widget/
│       ├── shopify.extension.toml           # 拡張設定                         41行
│       ├── blocks/
│       │   └── duty-calculator.liquid       # Liquidテンプレート               89行
│       └── assets/
│           ├── duty-calculator.js           # フロントエンドロジック           95行
│           └── duty-calculator.css          # ウィジェットスタイル            105行
├── prisma/
│   ├── schema.prisma                        # DBスキーマ定義                   65行
│   ├── seed.ts                              # シードデータ                    121行
│   └── migrations/                          # マイグレーション履歴
│       ├── 20240530213853_.../              # Sessionテーブル作成
│       └── 20260314120422_.../              # Duty/Shipping/Widgetテーブル作成
├── package.json                             # 依存関係定義                     83行
├── tsconfig.json                            # TypeScript設定                   21行
├── vite.config.ts                           # Vite/Remix設定                   74行
├── .eslintrc.cjs                            # ESLint設定                       14行
├── .graphqlrc.ts                            # GraphQLコード生成設定            45行
└── shopify.app.toml                         # Shopify CLI設定                  43行
```

---

## セットアップ

### 前提条件
- Node.js >=20.19 <22 または >=22.12
- Shopify CLIインストール済み
- Shopify Partnerアカウント + 開発ストア

### 手順

```bash
# リポジトリクローン
git clone https://github.com/mer-prog/ship-duty.git
cd ship-duty

# 依存パッケージインストール
npm install

# DB初期化
npx prisma generate
npx prisma migrate deploy

# シードデータ投入
npx prisma db seed

# 開発サーバー起動
npm run dev
```

### 環境変数

| 変数 | 説明 | 必須 |
|------|------|------|
| SHOPIFY_API_KEY | Shopify APIキー | はい |
| SHOPIFY_API_SECRET | Shopify APIシークレット | はい |
| SHOPIFY_APP_URL | アプリURL | はい |
| SCOPES | APIスコープ（カンマ区切り、例: `read_products`） | はい |
| PORT | サーバーポート（デフォルト: 3000） | いいえ |
| SHOP_CUSTOM_DOMAIN | カスタムショップドメイン | いいえ |

---

## 設計判断の根拠

| 判断 | 根拠 |
|------|------|
| SQLiteを採用 | Shopifyアプリテンプレート標準。単一ファイルDBで開発・デプロイが容易。外部DB不要でコスト削減 |
| Theme App ExtensionにVanilla JSを使用 | Reactバンドルを避け、ストアフロントのパフォーマンスへの影響を最小化。テーマとの競合を防止 |
| 重量帯ベースの送料設計 | 固定送料より現実的な料金体系。3段階の重量帯で実用的な精度を確保 |
| カテゴリフォールバック機構 | カテゴリ別税率が未設定でもgeneral税率で計算を継続。ストアオーナーの設定負荷を軽減 |
| Prisma複合ユニーク制約 | ショップ × 国 × カテゴリの組み合わせでデータの一意性を保証。upsert操作を安全に実行 |
| React Contextベースi18n | 外部i18nライブラリへの依存を避け、軽量な日英切替を実現。Shopify Polaris AppProviderとの互換性確保 |
| CORS全オリジン許可 | テーマ拡張からのクロスオリジンAPI呼出に対応。Shopifyストアフロントのドメインは動的に変化するため |
| APIバージョン2024-10 | Shopifyの安定版APIバージョンを使用。長期サポート対象 |

---

## 運用コスト

| サービス | プラン | 月額 |
|----------|--------|------|
| Shopify Partner | 開発ストア（無料） | ¥0 |
| SQLite | ファイルベースDB | ¥0 |
| Shopify App Hosting | Shopifyインフラ | ¥0 |
| 合計 | — | **¥0** |

---

## 作者

[@mer-prog](https://github.com/mer-prog)
