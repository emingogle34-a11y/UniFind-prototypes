# UniFind 프로젝트 TODO

## 🔴 핵심 기능 (필수)

- [x] 백엔드 풀스택 업그레이드 (DB, Express)
- [x] 분실물 데이터 모델 설계
- [x] 익명 채팅 데이터 모델
- [x] tRPC 라우터 구현
- [x] 분실물 아이콘 → 실제 사진으로 변경 (UI)
- [x] 사진 업로드 UI 구현 (RegisterScreen)
- [x] AI 이미지 인식 기능 (카테고리 자동 분류)
- [x] 익명 채팅 UI 구현 (ChatScreen)
- [x] 분실물 상태 업데이트 UI (찾았어요/못 찾음/보관 기간 만료)
- [x] 검색 필터 강화 (건물별 필터)

## 🟡 UX 개선 (높은 우선순위)

- [x] 등록 흐름 간소화 (3단계 - RegisterScreen)
- [x] 지도 기반 위치 입력 (캠퍼스 지도 모달 구현, 건물별 선택)
- [x] 푸시 알림 시스템 (Web Push API, NotificationsSettingScreen 구현)
- [x] 다크 모드 상태 영속성 (LocalStorage)
- [x] 시스템 테마 감지

## 🟢 차별화 포인트 (추후 확장)

- [x] 캠퍼스 분실물 센터 연동 - LostAndFoundCenterScreen 구현
- [x] 포인트 사용처 명확화 - PointsScreen 업데이트
- [x] 커뮤니티 신뢰도 시스템 - TrustScoreScreen 구현
- [x] 정기 분실 다발 구역 통계 - StatisticsScreen 구현

## 🔧 기술 (백그라운드)

- [x] 개선된 로그인 화면 (가운데 로고, 그라데이션, 애니메이션)
- [x] 다국어 지원 (영어, 한국어) - LanguageContext 구현
- [x] 데이터 시각화 대시보드 (건물별, 시간대, 카테고리, 위험도)
- [x] 분실물 자동 만료 처리 (30일 - 백엔드 Heartbeat 업데이트) - scheduled-handlers 구현

## ✅ 완료된 항목

- [x] 기본 UI 레이아웃 구현
- [x] 스플래시 화면
- [x] 인증 시스템 (대학교 인증)
- [x] 홈 화면 (포인트 카드, 빠른 액션, AI 히어로 배너)
- [x] 긴급 분실물 및 최근 등록 항목 표시
- [x] 하단 탭바 네비게이션
- [x] 마이페이지
- [x] 홍보 팝업
- [x] 다크 모드 구현
- [x] 백엔드 풀스택 업그레이드 (데이터베이스, Express 서버)
- [x] 핵심 기능 테스트 작성 및 통과
- [x] 사진 업로드 + AI 인식 기능 (RegisterScreen)
- [x] 익명 채팅 시스템 (ChatScreen)
- [x] 분실물 상태 업데이트 기능 (ItemDetailScreen)
- [x] 검색 필터 강화 (SearchScreen)
- [x] 홍보 패냐 아이콘 일러스트로 변경
- [x] 게시물 데이터 15개 추가 (기존 8개 → 15개)
- [x] 배경 없는 투명 일러스트 아이콘 4개 생성
- [x] 긴급분실물에 실제 사진 추가 (지갑, 에어팟, 열쇠, 백팩)

## 🎨 Toss 스타일 고급 UI 시스템

- [x] BottomSheet 컴포넌트 (스프링 애니메이션)
- [x] Modal 컴포넌트 (스케일 애니메이션)
- [x] Toast 컴포넌트 (슬라이드 애니메이션)
- [x] TossButton 컴포넌트 (터치 피드백)
- [x] TossCard 컴포넌트 (호버 효과, 그라데이션)
- [x] Badge 컴포넌트 (다양한 색상 variant)
- [x] LoadingSpinner 컴포넌트 (회전 애니메이션)
- [x] EmptyState 컴포넌트
- [x] 개선된 로그인 화면 (그라데이션, 애니메이션, 카드)
- [x] 개선된 홈 화면 (헤더, 통계, 바텀시트, FAB)
- [x] 홈화면 아이콘 호버/탭 애니메이션
- [x] 통계 아이콘 렌더링 버그 수정 (emoji 대신 Lucide BarChart3 사용)
