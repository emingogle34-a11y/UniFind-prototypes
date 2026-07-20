// UniFind - 캠퍼스 분실물 통합 서비스
// 데이터 타입 및 목 데이터

export type ItemCategory =
  | "지갑/카드"
  | "블루투스 기기"
  | "휴대폰/태블릿"
  | "가방"
  | "의류"
  | "열쇠"
  | "우산"
  | "기타";

export type ItemStatus = "분실" | "습득" | "완료";

export interface LostItem {
  id: string;
  type: "lost" | "found";
  category: ItemCategory;
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  authorName: string;
  authorUniversity: string;
  authorAvatar?: string;
  points: number;
  status: ItemStatus;
  aiConfidence?: number;
  views: number;
  chatCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatRoom {
  id: string;
  itemId: string;
  itemTitle: string;
  otherUser: string;
  otherUniversity: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  avatar?: string;
}

export interface PointHistory {
  id: string;
  type: "earn" | "spend";
  amount: number;
  reason: string;
  date: string;
}

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  "지갑/카드": "💳",
  "블루투스 기기": "🎧",
  "휴대폰/태블릿": "📱",
  "가방": "🎒",
  "의류": "👕",
  "열쇠": "🔑",
  "우산": "☂️",
  "기타": "📦",
};

export const CATEGORY_COLORS: Record<ItemCategory, string> = {
  "지갑/카드": "bg-amber-100 text-amber-700",
  "블루투스 기기": "bg-indigo-100 text-indigo-700",
  "휴대폰/태블릿": "bg-blue-100 text-blue-700",
  "가방": "bg-purple-100 text-purple-700",
  "의류": "bg-pink-100 text-pink-700",
  "열쇠": "bg-yellow-100 text-yellow-700",
  "우산": "bg-cyan-100 text-cyan-700",
  "기타": "bg-gray-100 text-gray-600",
};

export const MOCK_ITEMS: LostItem[] = [
  {
    id: "1",
    type: "lost",
    category: "지갑/카드",
    title: "갈색 반지갑 분실했어요",
    description: "중앙도서관 3층 열람실에서 분실했습니다. 갈색 가죽 반지갑이고 학생증이 들어있어요. 꼭 찾고 싶습니다.",
    location: "중앙도서관 3층",
    date: "2시간 전",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/item-wallet-brown-HX66KbGHVpG84eJqMZA6Ty.webp",
    authorName: "김민준",
    authorUniversity: "명지대학교",
    points: 500,
    status: "분실",
    aiConfidence: 97,
    views: 142,
    chatCount: 3,
  },
  {
    id: "2",
    type: "found",
    category: "블루투스 기기",
    title: "에어팟 프로 습득했습니다",
    description: "공학관 B동 1층 복도에서 에어팟 프로 케이스를 발견했습니다. 분실하신 분 연락 주세요.",
    location: "공학관 B동 1층",
    date: "4시간 전",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/item-airpods-white-UmAyxaV279qD2xaZqJtMq2.webp",
    authorName: "이서연",
    authorUniversity: "연세대학교",
    points: 0,
    status: "습득",
    aiConfidence: 99,
    views: 89,
    chatCount: 7,
  },
  {
    id: "3",
    type: "lost",
    category: "열쇠",
    title: "기숙사 열쇠 잃어버렸어요",
    description: "생활관 식당 근처에서 열쇠 뭉치를 분실했습니다. 자동차 키도 같이 있어요.",
    location: "생활관 식당",
    date: "1일 전",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/item-keys-CfVbdNec35eWuPXvekRA3M.webp",
    authorName: "박지호",
    authorUniversity: "명지대학교",
    points: 300,
    status: "분실",
    aiConfidence: 94,
    views: 67,
    chatCount: 1,
  },
  {
    id: "4",
    type: "found",
    category: "가방",
    title: "검정 백팩 습득",
    description: "학생회관 카페 앞에 놓여있던 검정 백팩입니다. 노트북이 들어있어요.",
    location: "학생회관 카페",
    date: "1일 전",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/item-backpack-black-SoaBrnAeomXGbTFArLaX2y.webp",
    authorName: "최수아",
    authorUniversity: "명지대학교",
    points: 0,
    status: "습득",
    aiConfidence: 96,
    views: 203,
    chatCount: 12,
  },
  {
    id: "5",
    type: "lost",
    category: "블루투스 기기",
    title: "갤럭시 버즈 분실",
    description: "체육관 샤워실에서 갤럭시 버즈 2 프로를 분실했습니다. 케이스 색상은 화이트입니다.",
    location: "체육관",
    date: "2일 전",
    authorName: "정하은",
    authorUniversity: "연세대학교",
    points: 200,
    status: "분실",
    aiConfidence: 91,
    views: 45,
    chatCount: 0,
  },
  {
    id: "6",
    type: "found",
    category: "의류",
    title: "회색 후드티 습득했습니다",
    description: "강의동 304호 강의실에 두고 간 회색 후드티입니다. 학교 로고가 있어요.",
    location: "강의동 304호",
    date: "3일 전",
    authorName: "윤도현",
    authorUniversity: "명지대학교",
    points: 0,
    status: "습득",
    aiConfidence: 88,
    views: 34,
    chatCount: 2,
  },
  {
    id: "7",
    type: "lost",
    category: "휴대폰/태블릿",
    title: "아이패드 분실 (긴급)",
    description: "경영관 세미나실에서 아이패드 프로 12.9인치를 분실했습니다. 케이스는 네이비 색상이고 애플펜슬도 같이 있었어요.",
    location: "경영관 세미나실",
    date: "30분 전",
    authorName: "강민서",
    authorUniversity: "고려대학교",
    points: 1000,
    status: "분실",
    aiConfidence: 98,
    views: 312,
    chatCount: 8,
  },
  {
    id: "8",
    type: "found",
    category: "지갑/카드",
    title: "학생증 습득",
    description: "학교 정문 앞 버스 정류장에서 학생증을 발견했습니다.",
    location: "정문 버스 정류장",
    date: "5시간 전",
    authorName: "임채원",
    authorUniversity: "명지대학교",
    points: 0,
    status: "습득",
    aiConfidence: 99,
    views: 156,
    chatCount: 4,
  },
  {
    id: "9",
    type: "lost",
    category: "우산",
    title: "검은색 우산 분실",
    description: "중앙도서관 입구에서 검은색 우산을 분실했습니다. 손잡이가 나무로 되어있어요.",
    location: "중앙도서관 입구",
    date: "3시간 전",
    authorName: "정유진",
    authorUniversity: "명지대학교",
    points: 100,
    status: "분실",
    aiConfidence: 85,
    views: 23,
    chatCount: 0,
  },
  {
    id: "10",
    type: "found",
    category: "휴대폰/태블릿",
    title: "아이폰 14 습득",
    description: "학생회관 2층 화장실에서 아이폰 14를 발견했습니다. 케이스는 투명합니다.",
    location: "학생회관 2층",
    date: "1시간 전",
    authorName: "김준호",
    authorUniversity: "서울대학교",
    points: 0,
    status: "습득",
    aiConfidence: 96,
    views: 78,
    chatCount: 5,
  },
  {
    id: "11",
    type: "lost",
    category: "가방",
    title: "빨간 크로스백 분실 (긴급)",
    description: "공학관 1층 카페에서 빨간 크로스백을 분실했습니다. 중요한 서류가 들어있어요.",
    location: "공학관 1층 카페",
    date: "30분 전",
    authorName: "박수진",
    authorUniversity: "성균관대학교",
    points: 800,
    status: "분실",
    aiConfidence: 92,
    views: 145,
    chatCount: 6,
  },
  {
    id: "12",
    type: "found",
    category: "의류",
    title: "파란색 스포츠 점퍼 습득",
    description: "체육관 탈의실에서 파란색 스포츠 점퍼를 발견했습니다.",
    location: "체육관 탈의실",
    date: "2시간 전",
    authorName: "이준영",
    authorUniversity: "명지대학교",
    points: 0,
    status: "습득",
    aiConfidence: 87,
    views: 41,
    chatCount: 1,
  },
  {
    id: "13",
    type: "lost",
    category: "열쇠",
    title: "자동차 키 분실",
    description: "학교 주차장 근처에서 자동차 키를 분실했습니다. 검은색 키 고리가 달려있어요.",
    location: "학교 주차장",
    date: "4시간 전",
    authorName: "최영호",
    authorUniversity: "명지대학교",
    points: 400,
    status: "분실",
    aiConfidence: 89,
    views: 56,
    chatCount: 2,
  },
  {
    id: "14",
    type: "found",
    category: "기타",
    title: "노트북 파우치 습득",
    description: "강의동 복도에서 회색 노트북 파우치를 발견했습니다. 내용물은 비어있어요.",
    location: "강의동 복도",
    date: "6시간 전",
    authorName: "송민지",
    authorUniversity: "명지대학교",
    points: 0,
    status: "습득",
    aiConfidence: 90,
    views: 32,
    chatCount: 0,
  },
  {
    id: "15",
    type: "lost",
    category: "지갑/카드",
    title: "신용카드 분실 (긴급)",
    description: "카페테리아에서 신용카드를 분실했습니다. 즉시 카드를 정지했지만 찾으면 연락 주세요.",
    location: "카페테리아",
    date: "1시간 전",
    authorName: "김하늘",
    authorUniversity: "명지대학교",
    points: 600,
    status: "분실",
    aiConfidence: 95,
    views: 89,
    chatCount: 3,
  },
];

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: "c1",
    itemId: "1",
    itemTitle: "갈색 반지갑 분실했어요",
    otherUser: "이서연",
    otherUniversity: "명지대학교",
    lastMessage: "혹시 중앙도서관 분실물 보관함에 맡겨져 있을 수도 있어요!",
    lastTime: "방금",
    unread: 2,
  },
  {
    id: "c2",
    itemId: "4",
    itemTitle: "검정 백팩 습득",
    otherUser: "최수아",
    otherUniversity: "명지대학교",
    lastMessage: "네, 맞아요! 지금 바로 가도 될까요?",
    lastTime: "10분 전",
    unread: 0,
  },
  {
    id: "c3",
    itemId: "7",
    itemTitle: "아이패드 분실 (긴급)",
    otherUser: "강민서",
    otherUniversity: "명지대학교",
    lastMessage: "경영관 세미나실 담당 조교에게 문의해보세요",
    lastTime: "1시간 전",
    unread: 1,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", senderId: "other", text: "안녕하세요! 혹시 지갑 색상이 어떻게 되나요?", timestamp: "오후 2:30", isMe: false },
  { id: "m2", senderId: "me", text: "갈색 가죽 반지갑이고 안에 학생증이랑 카드 몇 장 있어요", timestamp: "오후 2:31", isMe: true },
  { id: "m3", senderId: "other", text: "혹시 중앙도서관 분실물 보관함에 맡겨져 있을 수도 있어요!", timestamp: "오후 2:32", isMe: false },
  { id: "m4", senderId: "me", text: "정말요? 지금 바로 가볼게요 감사합니다!", timestamp: "오후 2:33", isMe: true },
];

export const MOCK_POINT_HISTORY: PointHistory[] = [
  { id: "p1", type: "earn", amount: 100, reason: "분실물 등록", date: "오늘" },
  { id: "p2", type: "earn", amount: 300, reason: "물건 전달 보상 (수령 확인)", date: "어제" },
  { id: "p3", type: "earn", amount: 50, reason: "출석 보너스", date: "2일 전" },
  { id: "p4", type: "spend", amount: -200, reason: "긴급 알림 발송", date: "3일 전" },
  { id: "p5", type: "earn", amount: 500, reason: "분실물 찾아주기 완료", date: "1주 전" },
  { id: "p6", type: "earn", amount: 100, reason: "첫 인증 보너스", date: "2주 전" },
];

export const UNIVERSITIES = [
  "서울대학교",
  "연세대학교",
  "고려대학교",
  "성균관대학교",
  "한양대학교",
  "중앙대학교",
  "경희대학교",
  "이화여자대학교",
  "서강대학교",
  "명지대학교",
];

export const UNIFIND_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663567112870/bUFAa6fENchaSkWfKu7FJr/unifind-logo_b7511f92.png";
