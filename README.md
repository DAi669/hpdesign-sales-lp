# 合同会社DRAI 営業LP

個人店向けHP制作サービスの公式営業LP。

## 公開URL（予定）
`https://dai669.github.io/hpdesign-sales-lp/`

## ファイル構成
```
sales-lp/
├── index.html          # 9セクションのメインLP
├── style.css           # スタイル
├── script.js           # 動的演出・モーダル・フィルタ
├── thanks.html         # 問合せ送信後のリダイレクト先
├── robots.txt          # 公開LPなので Allow:/
├── images/templates/   # 6テンプレのスクショ
└── README.md
```

## デプロイ
```powershell
cd D:\.company\hpdesign\scripts
.\deploy-sales-lp.ps1
```

## 運用前に必要な設定
1. **Formspree ID 設定**: index.html の `{FORMSPREE_ID}` を実IDに置換
   - https://formspree.io でアカウント作成 → 通知先に h.dais0127@gmail.com → Form ID取得
2. **法人住所**: index.html の `{法人住所}` を実住所に置換（特電法準拠）
3. **OGP画像**: `images/ogp.png` を1200x630で別途用意

## テンプレスクショ更新
```bash
cd D:\.company\hpdesign\scripts
python capture-template-screenshots.py
```

## v2 拡張予定
- 受注後に MATTARI/105Cafe 店主から掲載許諾を取得 → 「Real Cases」セクションに実名掲載
- Salon・整骨院などの追加業種テンプレが完成し次第、Showcase に追加
- 配信転換率データが蓄積したら数字バッジ更新（実績件数の表示切替）
