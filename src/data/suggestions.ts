export type Difficulty = "쉬움" | "보통" | "어려움";

export type Category = "성장" | "이벤트 & 재미" | "보상 & 리텐션" | "꾸미기";

export interface Suggestion {
  no: number;
  emoji: string;
  title: string;
  category: Category;
  tagline: string;
  description: string;
  examples: string[];
  fun: string;
  difficulty: Difficulty;
  stars: number; // 재미 지수 1~5
  phase: number; // 추천 개발 단계 1~4
}

export const CATEGORIES: Array<{ name: Category; emoji: string }> = [
  { name: "성장", emoji: "📈" },
  { name: "이벤트 & 재미", emoji: "🎲" },
  { name: "보상 & 리텐션", emoji: "🎁" },
  { name: "꾸미기", emoji: "🎨" },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    no: 1,
    emoji: "👆",
    title: "클릭 강화 (Click Power)",
    category: "성장",
    tagline: "누르는 손맛을 점점 더 강하게",
    description:
      "지금은 언제나 +1인 클릭에 '클릭 파워' 업그레이드를 추가합니다. 클릭당 획득 코인이 늘어나 초반부터 끝까지 탭이 계속 의미를 갖게 됩니다. 자동 생산과 경쟁 구도를 만들어 '클릭할까, 방치할까' 전략 선택의 재미도 생깁니다.",
    examples: [
      "클릭 파워 +1 → 비용 25코인",
      "비용 증가율: 구매마다 ×1.6",
      "최대 레벨: 무제한",
    ],
    fun: "자동 생산에 밀려 무용지물이 되기 쉬운 클릭 버튼이 끝까지 살아남습니다.",
    difficulty: "쉬움",
    stars: 3,
    phase: 1,
  },
  {
    no: 2,
    emoji: "🏭",
    title: "자동 생산 시설 다양화",
    category: "성장",
    tagline: "한 종류뿐인 자동 생산을 부대 단위로",
    description:
      "'자동 +1/s' 하나뿐인 구조를 여러 단계의 시설로 확장합니다. 광부 → 공장 → 마법사처럼 생산량이 점점 큰 시설을 순서대로 해금하는 방식입니다. 화면이 리스트로 늘어나며, 현재 자산에 가장 효율적인 시설을 고르는 재미가 생깁니다.",
    examples: [
      "광부 2/s — 50코인",
      "공장 20/s — 400코인",
      "마법사 150/s — 5,000코인",
      "시설마다 비용 ×1.5씩 상승",
    ],
    fun: "구매 목표가 계속 갱신되어 '다음 시설까지 얼마 남았지?'를 반복하게 됩니다.",
    difficulty: "쉬움",
    stars: 4,
    phase: 1,
  },
  {
    no: 3,
    emoji: "♻️",
    title: "프레스티지 (환생)",
    category: "성장",
    tagline: "다시 처음부터? 아니, 영구히 강해지는 새 시작",
    description:
      "진행도를 리셋하는 대신 '영혼석'을 얻는 시스템입니다. 영혼석은 초기화해도 사라지지 않으며, 개수에 비례해 전체 생산량에 영구 보너스를 줍니다. 수백 시간을 버티게 만드는 방치형 게임의 심장부와 같은 존재입니다.",
    examples: [
      "지금까지 벌어들인 '누적 코인' 기준으로 환산",
      "영혼석 1개당 전체 생산 +2%",
      "수식 추천: 영혼석 = √(누적코인 ÷ 1,000)",
    ],
    fun: "리셋 버튼이 '벌칙'에서 '또 하나의 성장 경로'로 바뀝니다.",
    difficulty: "보통",
    stars: 5,
    phase: 3,
  },
  {
    no: 4,
    emoji: "🪙",
    title: "황금 코인 이벤트",
    category: "이벤트 & 재미",
    tagline: "가끔 나타나는 두근거림",
    description:
      "화면 위에 30~90초 간격으로 번쩍이는 황금 코인이 나타납니다. 제한 시간 안에 클릭하면 현재 코인의 일정 비율처럼 큰 보상을 주고, 놓치면 사라집니다. 가만히 방치해도 눈이 심심하지 않게 해주는 이벤트입니다.",
    examples: [
      "등장 간격: 30~90초 랜덤",
      "보상: 현재 코인의 15%",
      "또는 30초간 전체 생산 5배",
      "클릭 제한 시간: 10초",
    ],
    fun: "방치 중에도 화면을 계속 바라보게 만드는 긴장감.",
    difficulty: "쉬움",
    stars: 5,
    phase: 2,
  },
  {
    no: 5,
    emoji: "🏆",
    title: "업적 시스템",
    category: "보상 & 리텐션",
    tagline: "숫자 놀이에 이야기를 입히다",
    description:
      "특정 조건을 달성하면 팝업과 함께 해금되는 업적 목록입니다. 단순한 숫자 놀이에 이름과 목표를 부여해 플레이어가 스스로 다음 목표를 세우게 만듭니다. 일부 업적은 소액의 영구 보너스를 주도록 설계하면 더 좋습니다.",
    examples: [
      "클릭 100회 달성",
      "코인 10,000 보유",
      "시설 20개 구매",
      "황금 코인 5회 클릭",
      "누적 플레이 1시간",
    ],
    fun: "달성 팝업 하나하나가 작은 도파민이 됩니다.",
    difficulty: "보통",
    stars: 4,
    phase: 2,
  },
  {
    no: 6,
    emoji: "🌙",
    title: "오프라인 보상",
    category: "보상 & 리텐션",
    tagline: "자고 일어나면 쌓여 있는 코인",
    description:
      "게임을 끈 시간에도 자동 생산량의 일정 비율을 적립해 줍니다. 복귀하면 '자리를 비운 동안 X코인을 벌었습니다' 정산 화면이 떠서, 다시 접속할 명분을 만들어 줍니다.",
    examples: [
      "적립률: 자동 생산량의 50%",
      "적립 상한: 최대 8시간",
      "업그레이드로 적립률·상한 확장 가능",
    ],
    fun: "다음 접속이 기대되는, 복귀 동기 만들기의 정석.",
    difficulty: "쉬움",
    stars: 4,
    phase: 2,
  },
  {
    no: 7,
    emoji: "📅",
    title: "일일 보너스 & 연속 출석",
    category: "보상 & 리텐션",
    tagline: "매일 열어보게 되는 작은 선물",
    description:
      "하루 1회 받을 수 있는 출석 보상을 추가합니다. 연속 출석일이 길어질수록 보상이 커져 끊기 아까운 마음이 들게 합니다. 7일 단위로 사이클을 돌리면 접속 습관이 자연스럽게 형성됩니다.",
    examples: [
      "1일차: 100코인",
      "3일차: 400코인 + 2배 부스트 30초",
      "7일차: 2,000코인 + 영구 보너스",
      "하루 놓치면 1일차부터 재시작",
    ],
    fun: "무료 보상에 스며든 접속 습관화 장치.",
    difficulty: "쉬움",
    stars: 3,
    phase: 4,
  },
  {
    no: 8,
    emoji: "⚡",
    title: "임시 부스트 아이템",
    category: "이벤트 & 재미",
    tagline: "순간 폭발의 쾌감",
    description:
      "코인을 소비해 일정 시간 동안 생산량이나 클릭력을 배수로 끌어올리는 소모품입니다. 황금 코인, 출석 보상과 연계하면 보상의 씨앗으로도 활용할 수 있습니다.",
    examples: [
      "2배 생산 60초 — 500코인",
      "클릭 5배 30초 — 1,000코인",
      "활성화 중 남은 시간 UI 표시",
    ],
    fun: "타이밍을 고르는 전략과 숫자가 폭발하는 쾌감.",
    difficulty: "쉬움",
    stars: 4,
    phase: 4,
  },
  {
    no: 9,
    emoji: "🎰",
    title: "뽑기 (가챠)",
    category: "이벤트 & 재미",
    tagline: "한 방의 스릴",
    description:
      "고정 코인을 내고 랜덤 등급의 보상을 받는 뽑기입니다. 기대값은 살짝 낮게 잡되 잭팟의 존재만으로 도박적인 스릴을 즐기게 합니다. 현금 과금 없이 게임 내 재화로만 돌아가게 하는 것이 핵심입니다.",
    examples: [
      "1회 시도: 300코인",
      "꽝·소액 50% / 중액 30% / 대박 15% / 잭팟 5%",
      "잭팟: 현재 코인의 2배",
    ],
    fun: "동전을 넣는 순간의 기대감은 어떤 시스템도 대신하지 못합니다.",
    difficulty: "보통",
    stars: 4,
    phase: 4,
  },
  {
    no: 10,
    emoji: "🎨",
    title: "스킨 & 테마 꾸미기",
    category: "꾸미기",
    tagline: "내 방치형 게임은 남다르게",
    description:
      "코인과 버튼의 스킨, 배경 테마, 클릭 이펙트 등을 코인으로 구매하는 꾸미기 요소입니다. 수치 성장이 멈춘 뒤에도 소비할 목표를 만들어 주며, 코인이 남아도는 후반부의 출구 역할을 합니다.",
    examples: [
      "우주 테마 — 5,000코인",
      "황금 코인 스킨 — 10,000코인",
      "클릭 파티클 이펙트 — 2,500코인",
    ],
    fun: "성장 수치가 아닌 '개성'으로 성취를 드러냅니다.",
    difficulty: "보통",
    stars: 3,
    phase: 4,
  },
];

export const PHASES: Array<{
  phase: number;
  label: string;
  color: string;
  border: string;
  title: string;
  reason: string;
  items: string[];
}> = [
  {
    phase: 1,
    label: "1단계 · 지금 바로",
    color: "text-amber-300",
    border: "border-amber-400/40",
    title: "핵심 루프 살찌우기",
    reason:
      "구현이 가장 쉬우면서도 게임의 뼈대를 바로 강화합니다. 클릭과 자동 생산이 모두 살아 있으면 이후 모든 시스템이 그 위에 쌓입니다.",
    items: ["① 클릭 강화", "② 시설 다양화"],
  },
  {
    phase: 2,
    label: "2단계 · 다음 주",
    color: "text-sky-300",
    border: "border-sky-400/40",
    title: "일상의 재미와 복귀 동기",
    reason:
      "접속할 때마다 '할 일'이 생깁니다. 황금 코인은 즉각적인 재미, 오프라인 보상과 업적은 다시 들어올 이유를 만듭니다.",
    items: ["④ 황금 코인", "⑤ 업적", "⑥ 오프라인 보상"],
  },
  {
    phase: 3,
    label: "3단계 · 그다음",
    color: "text-violet-300",
    border: "border-violet-400/40",
    title: "장기 플레이의 뼈대",
    reason:
      "콘텐츠가 어느 정도 갖춰진 뒤 프레스티지를 얹습니다. 리셋의 아쉬움이 영구 보너스로 전환되면서 게임 수명이 수십 배로 늘어납니다.",
    items: ["③ 프레스티지"],
  },
  {
    phase: 4,
    label: "4단계 · 여유 있을 때",
    color: "text-pink-300",
    border: "border-pink-400/40",
    title: "맛있는 사이드 디시",
    reason:
      "핵심 시스템이 완성된 뒤 곁들입니다. 출석·부스트·뽑기는 반복 플레이에 양념을, 스킨은 코인이 남아도는 후반의 소비처가 됩니다.",
    items: ["⑦ 일일 보너스", "⑧ 부스트", "⑨ 뽑기", "⑩ 스킨"],
  },
];

export const BONUS_IDEAS = [
  {
    emoji: "📊",
    title: "통계 화면",
    desc: "총 클릭 수 · 누적 코인 · 플레이 시간을 보여주는 대시보드",
  },
  {
    emoji: "🕳️",
    title: "두더지 잡기 미니게임",
    desc: "하루 1회 플레이 가능한 짧은 이벤트로 코인 벌기",
  },
  {
    emoji: "🔊",
    title: "효과음 & 햅틱",
    desc: "클릭·구매 순간의 피드백으로 손맛을 두 배로",
  },
];
