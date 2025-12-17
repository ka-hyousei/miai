export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

export const GENDER_OPTIONS = [
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
  { value: 'OTHER', label: 'その他' },
]

export const VISA_TYPE_OPTIONS = [
  { value: 'PERMANENT_RESIDENT', label: '永住' },
  { value: 'WORK_VISA', label: '就労ビザ' },
  { value: 'SPOUSE_VISA', label: '配偶者ビザ' },
  { value: 'STUDENT_VISA', label: '留学' },
  { value: 'DEPENDENT_VISA', label: '家族滞在' },
  { value: 'DESIGNATED_ACTIVITIES', label: '特定活動' },
  { value: 'OTHER', label: 'その他' },
  { value: 'PRIVATE', label: '非公開' },
]

export const JAPANESE_LEVEL_OPTIONS = [
  { value: 'NATIVE', label: 'ネイティブ' },
  { value: 'N1', label: 'JLPT N1' },
  { value: 'N2', label: 'JLPT N2' },
  { value: 'N3', label: 'JLPT N3' },
  { value: 'N4', label: 'JLPT N4' },
  { value: 'N5', label: 'JLPT N5' },
  { value: 'BEGINNER', label: '初心者' },
]

export const FUTURE_PLAN_OPTIONS = [
  { value: 'STAY_LONG_TERM', label: '長期滞在予定' },
  { value: 'RETURN_HOME', label: '帰国予定' },
  { value: 'UNDECIDED', label: '未定' },
  { value: 'PRIVATE', label: '非公開' },
]

export const VISA_INFO_DISCLAIMER = 'これらの情報は双方の生活計画を理解するためのものであり、いかなる在留資格に対する価値判断を意味するものではありません。'

export const CONTACT_VISIBILITY_OPTIONS = [
  { value: 'EVERYONE', label: '全員に公開' },
  { value: 'PREMIUM_ONLY', label: '有料会員のみ' },
  { value: 'MATCHED_ONLY', label: 'マッチした相手のみ' },
]

export const NATIONALITY_OPTIONS = [
  // 東アジア
  { value: '日本', label: '日本' },
  { value: '中国大陆', label: '中国大陆' },
  { value: '中国香港', label: '中国香港' },
  { value: '中国澳门', label: '中国澳门' },
  { value: '中国台湾', label: '中国台湾' },
  { value: '韓国', label: '韓国' },
  { value: 'モンゴル', label: 'モンゴル' },
  // 東南アジア
  { value: 'ベトナム', label: 'ベトナム' },
  { value: 'フィリピン', label: 'フィリピン' },
  { value: 'タイ', label: 'タイ' },
  { value: 'インドネシア', label: 'インドネシア' },
  { value: 'シンガポール', label: 'シンガポール' },
  { value: 'マレーシア', label: 'マレーシア' },
  { value: 'ミャンマー', label: 'ミャンマー' },
  { value: 'カンボジア', label: 'カンボジア' },
  { value: 'ラオス', label: 'ラオス' },
  { value: 'ブルネイ', label: 'ブルネイ' },
  { value: '東ティモール', label: '東ティモール' },
  // 南アジア
  { value: 'インド', label: 'インド' },
  { value: 'パキスタン', label: 'パキスタン' },
  { value: 'バングラデシュ', label: 'バングラデシュ' },
  { value: 'ネパール', label: 'ネパール' },
  { value: 'スリランカ', label: 'スリランカ' },
  { value: 'ブータン', label: 'ブータン' },
  { value: 'モルディブ', label: 'モルディブ' },
  // 中央アジア
  { value: 'カザフスタン', label: 'カザフスタン' },
  { value: 'ウズベキスタン', label: 'ウズベキスタン' },
  { value: 'キルギス', label: 'キルギス' },
  { value: 'タジキスタン', label: 'タジキスタン' },
  { value: 'トルクメニスタン', label: 'トルクメニスタン' },
  // 西アジア・中東
  { value: 'トルコ', label: 'トルコ' },
  { value: 'イラン', label: 'イラン' },
  { value: 'イラク', label: 'イラク' },
  { value: 'シリア', label: 'シリア' },
  { value: 'レバノン', label: 'レバノン' },
  { value: 'ヨルダン', label: 'ヨルダン' },
  { value: 'イスラエル', label: 'イスラエル' },
  { value: 'パレスチナ', label: 'パレスチナ' },
  { value: 'サウジアラビア', label: 'サウジアラビア' },
  { value: 'アラブ首長国連邦', label: 'アラブ首長国連邦' },
  { value: 'カタール', label: 'カタール' },
  { value: 'クウェート', label: 'クウェート' },
  { value: 'バーレーン', label: 'バーレーン' },
  { value: 'オマーン', label: 'オマーン' },
  { value: 'イエメン', label: 'イエメン' },
  { value: 'アフガニスタン', label: 'アフガニスタン' },
  // コーカサス
  { value: 'アゼルバイジャン', label: 'アゼルバイジャン' },
  { value: 'アルメニア', label: 'アルメニア' },
  { value: 'ジョージア', label: 'ジョージア' },
  // 西ヨーロッパ
  { value: 'イギリス', label: 'イギリス' },
  { value: 'フランス', label: 'フランス' },
  { value: 'ドイツ', label: 'ドイツ' },
  { value: 'オランダ', label: 'オランダ' },
  { value: 'ベルギー', label: 'ベルギー' },
  { value: 'ルクセンブルク', label: 'ルクセンブルク' },
  { value: 'スイス', label: 'スイス' },
  { value: 'オーストリア', label: 'オーストリア' },
  { value: 'アイルランド', label: 'アイルランド' },
  // 南ヨーロッパ
  { value: 'イタリア', label: 'イタリア' },
  { value: 'スペイン', label: 'スペイン' },
  { value: 'ポルトガル', label: 'ポルトガル' },
  { value: 'ギリシャ', label: 'ギリシャ' },
  { value: 'マルタ', label: 'マルタ' },
  { value: 'キプロス', label: 'キプロス' },
  { value: 'アンドラ', label: 'アンドラ' },
  { value: 'モナコ', label: 'モナコ' },
  { value: 'サンマリノ', label: 'サンマリノ' },
  { value: 'バチカン', label: 'バチカン' },
  // 北ヨーロッパ
  { value: 'スウェーデン', label: 'スウェーデン' },
  { value: 'ノルウェー', label: 'ノルウェー' },
  { value: 'デンマーク', label: 'デンマーク' },
  { value: 'フィンランド', label: 'フィンランド' },
  { value: 'アイスランド', label: 'アイスランド' },
  // 東ヨーロッパ
  { value: 'ロシア', label: 'ロシア' },
  { value: 'ウクライナ', label: 'ウクライナ' },
  { value: 'ベラルーシ', label: 'ベラルーシ' },
  { value: 'ポーランド', label: 'ポーランド' },
  { value: 'チェコ', label: 'チェコ' },
  { value: 'スロバキア', label: 'スロバキア' },
  { value: 'ハンガリー', label: 'ハンガリー' },
  { value: 'ルーマニア', label: 'ルーマニア' },
  { value: 'ブルガリア', label: 'ブルガリア' },
  { value: 'モルドバ', label: 'モルドバ' },
  // バルト三国
  { value: 'リトアニア', label: 'リトアニア' },
  { value: 'ラトビア', label: 'ラトビア' },
  { value: 'エストニア', label: 'エストニア' },
  // バルカン半島
  { value: 'セルビア', label: 'セルビア' },
  { value: 'クロアチア', label: 'クロアチア' },
  { value: 'スロベニア', label: 'スロベニア' },
  { value: 'ボスニア・ヘルツェゴビナ', label: 'ボスニア・ヘルツェゴビナ' },
  { value: 'モンテネグロ', label: 'モンテネグロ' },
  { value: '北マケドニア', label: '北マケドニア' },
  { value: 'アルバニア', label: 'アルバニア' },
  { value: 'コソボ', label: 'コソボ' },
  // オセアニア
  { value: 'オーストラリア', label: 'オーストラリア' },
  { value: 'ニュージーランド', label: 'ニュージーランド' },
  // 北米
  { value: 'アメリカ', label: 'アメリカ' },
  { value: 'カナダ', label: 'カナダ' },
  // 中南米
  { value: 'ブラジル', label: 'ブラジル' },
  { value: 'メキシコ', label: 'メキシコ' },
  { value: 'アルゼンチン', label: 'アルゼンチン' },
  { value: 'ペルー', label: 'ペルー' },
  // アフリカ
  { value: '南アフリカ', label: '南アフリカ' },
  { value: 'エジプト', label: 'エジプト' },
  // その他
  { value: 'その他', label: 'その他' },
]
