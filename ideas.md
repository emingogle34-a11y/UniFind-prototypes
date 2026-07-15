# UniFind 디자인 아이디어

## 앱 개요
대학교 캠퍼스 분실물 통합 서비스. 토스/당근 스타일의 편리한 UI, 에브리타임 스타일 대학교 인증, AI 사진 분류, 채팅, 포인트 제도.

---

<response>
<idea>
**Design Movement**: Neo-Minimal Korean Fintech (토스 계열)

**Core Principles**:
- 극도의 여백 활용 — 콘텐츠가 숨 쉴 공간을 확보
- 타이포그래피 중심 계층 구조 — 크기와 굵기로 정보 위계 표현
- 기능적 색상 — 파란색 계열 포인트, 나머지는 무채색
- 카드 기반 정보 구조 — 분실물 아이템을 명확한 카드로 표현

**Color Philosophy**:
- Primary: #3182F6 (토스 블루) — 신뢰, 안정, 행동 유도
- Background: #F9FAFB (아주 연한 회색) — 눈의 피로 감소
- Surface: #FFFFFF — 카드, 모달
- Text: #191F28 (거의 검정) / #8B95A1 (보조 텍스트)
- Accent: #FF6B35 (당근 오렌지) — 긴급/중요 분실물 표시

**Layout Paradigm**:
- 모바일 우선 단일 컬럼 레이아웃 (최대 390px 모바일 프레임)
- 하단 탭 네비게이션 (토스 스타일)
- 상단 검색바 고정
- 스크롤 시 헤더 축소 애니메이션

**Signature Elements**:
- 분실물 카드: 좌측 AI 분류 아이콘 + 우측 정보 (토스 거래내역 스타일)
- 포인트 뱃지: 동전 아이콘 + 숫자 (당근 매너온도 참고)
- 대학교 인증 배지: 에브리타임 스타일 학교 로고 + 인증 체크

**Interaction Philosophy**:
- 탭 전환 시 슬라이드 애니메이션
- 버튼 클릭 시 미세한 스케일 다운 (0.97)
- 카드 호버/터치 시 그림자 강조
- 스켈레톤 로딩 UI

**Animation**:
- 페이지 진입: fade-in + translateY(8px → 0)
- 카드 목록: stagger 0.05s 간격 순차 등장
- 버튼: spring 물리 기반 클릭 피드백
- 포인트 증가: 숫자 카운트업 애니메이션

**Typography System**:
- Heading: Pretendard Bold/ExtraBold (한국어 최적화)
- Body: Pretendard Regular/Medium
- Caption: Pretendard Light, #8B95A1
- 크기 체계: 28/22/18/16/14/12px
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement**: Warm Community (당근마켓 계열)

**Core Principles**:
- 따뜻한 색감 — 커뮤니티 감성 강조
- 사람 중심 — 프로필, 대화, 연결을 전면에
- 직관적 탐색 — 지도 + 리스트 듀얼 뷰
- 신뢰 구축 — 인증 배지, 후기, 포인트 가시화

**Color Philosophy**:
- Primary: #FF6F0F (당근 오렌지) — 에너지, 친근함
- Background: #FAFAFA
- Surface: #FFFFFF
- Text: #212124 / #868B94
- Accent: #4A90D9 (파랑) — 링크, 인증 표시

**Layout Paradigm**:
- 피드 스타일 리스트 (당근 중고거래 스타일)
- 상단 위치/학교 선택 드롭다운
- 플로팅 등록 버튼 (우하단)
- 탭바: 홈/검색/등록/채팅/마이

**Signature Elements**:
- 분실물 카드: 썸네일 이미지 + 제목 + 위치 + 시간
- 매너포인트 게이지 (당근 매너온도 변형)
- 채팅 미리보기 리스트

**Interaction Philosophy**:
- 스와이프로 북마크
- 당겨서 새로고침
- 채팅방 슬라이드 진입

**Animation**:
- 리스트 아이템 좌→우 슬라이드 인
- 플로팅 버튼 펄스 애니메이션
- 채팅 버블 팝업 효과

**Typography System**:
- Heading: Pretendard SemiBold
- Body: Pretendard Regular
- 크기: 24/18/16/14/12px
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement**: Campus Identity (에브리타임 + 토스 퓨전)

**Core Principles**:
- 캠퍼스 아이덴티티 강조 — 학교 색상, 건물 이미지
- 신뢰와 인증 — 학교 인증 시스템 전면 배치
- 정보 밀도 최적화 — 많은 분실물 정보를 효율적으로 표시
- 게임화 요소 — 포인트, 레벨, 뱃지로 참여 유도

**Color Philosophy**:
- Primary: #4361EE (대학교 느낌의 인디고)
- Background: #F0F2FF (연한 인디고 배경)
- Surface: #FFFFFF
- Text: #1A1A2E / #6B7280
- Accent: #F72585 (핑크) — 긴급 분실물

**Layout Paradigm**:
- 상단 학교 배너 + 인증 상태
- 카테고리 탭 필터 (지갑/전자기기/의류 등)
- 그리드 + 리스트 전환 뷰
- 사이드 드로어 메뉴

**Signature Elements**:
- 학교 인증 배지 (에브리타임 스타일)
- AI 분류 태그 (색상 코딩)
- 포인트 레벨 시스템

**Interaction Philosophy**:
- 카테고리 필터 슬라이드
- AI 분석 로딩 애니메이션
- 포인트 획득 시 축하 효과

**Animation**:
- 인증 완료 시 confetti 효과
- AI 분석 중 스캔 라인 애니메이션
- 포인트 획득 팝업

**Typography System**:
- Heading: Pretendard ExtraBold
- Body: Pretendard Regular
- 크기: 26/20/16/14/12px
</idea>
<probability>0.06</probability>
</response>

---

## 선택된 디자인: **Neo-Minimal Korean Fintech** (첫 번째 접근법)

토스의 극도로 깔끔한 미니멀리즘에 당근의 따뜻한 커뮤니티 감성을 결합. 
- 메인 컬러: #3182F6 (토스 블루)
- 포인트 컬러: #FF6B35 (당근 오렌지)  
- 배경: #F9FAFB
- 모바일 프레임 중심 레이아웃
- Pretendard 폰트
