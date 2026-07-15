import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, TrendingUp, MapPin, Package } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

// 건물별 분실물 통계
const buildingData = [
  { name: "중앙도서관", lost: 45, found: 12 },
  { name: "공학관", lost: 38, found: 15 },
  { name: "학생회관", lost: 32, found: 18 },
  { name: "생활관", lost: 28, found: 22 },
  { name: "경영관", lost: 25, found: 10 },
  { name: "법학관", lost: 18, found: 8 },
];

// 시간대별 분실 추이
const timeSeriesData = [
  { time: "08:00", count: 5 },
  { time: "10:00", count: 12 },
  { time: "12:00", count: 18 },
  { time: "14:00", count: 22 },
  { time: "16:00", count: 28 },
  { time: "18:00", count: 35 },
  { time: "20:00", count: 32 },
  { time: "22:00", count: 15 },
];

// 카테고리별 분실물
const categoryData = [
  { name: "지갑/카드", value: 145, color: "#3B82F6" },
  { name: "전자기기", value: 98, color: "#8B5CF6" },
  { name: "가방", value: 87, color: "#EC4899" },
  { name: "의류", value: 76, color: "#F59E0B" },
  { name: "열쇠", value: 54, color: "#10B981" },
  { name: "기타", value: 40, color: "#6B7280" },
];

// 캠퍼스 구역별 분실 위험도 (히트맵 데이터)
const campusHeatmapData = [
  { building: "중앙도서관", zone: "1층", incidents: 15, risk: "높음" },
  { building: "중앙도서관", zone: "3층", incidents: 18, risk: "높음" },
  { building: "중앙도서관", zone: "5층", incidents: 12, risk: "중간" },
  { building: "공학관", zone: "B동", incidents: 14, risk: "높음" },
  { building: "공학관", zone: "A동", incidents: 10, risk: "중간" },
  { building: "학생회관", zone: "카페", incidents: 16, risk: "높음" },
  { building: "학생회관", zone: "식당", incidents: 12, risk: "중간" },
  { building: "생활관", zone: "식당", incidents: 14, risk: "높음" },
  { building: "경영관", zone: "세미나실", incidents: 8, risk: "낮음" },
];

// 요일별 분실 패턴
const weekdayData = [
  { day: "월", count: 32 },
  { day: "화", count: 28 },
  { day: "수", count: 35 },
  { day: "목", count: 42 },
  { day: "금", count: 48 },
  { day: "토", count: 25 },
  { day: "일", count: 18 },
];

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#6B7280"];

export default function StatisticsScreen() {
  const { setScreen, isDarkMode } = useApp();

  const textColor = isDarkMode ? "var(--foreground)" : "var(--foreground)";
  const gridColor = isDarkMode ? "var(--border)" : "var(--border)";
  const bgColor = isDarkMode ? "var(--card)" : "var(--card)";

  return (
    <div className="bg-background text-foreground transition-colors duration-300" style={{ minHeight: "100dvh", paddingBottom: "80px" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background transition-colors duration-300">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <button
            onClick={() => setScreen("home")}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">캠퍼스 분실물 통계</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="text-xs font-medium opacity-70">이번 달 분실</div>
            <div className="text-2xl font-bold mt-1">460</div>
            <div className="text-xs text-green-500 mt-1">↑ 12%</div>
          </div>
          <div className={`p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
            <div className="text-xs font-medium opacity-70">해결율</div>
            <div className="text-2xl font-bold mt-1">68%</div>
            <div className="text-xs text-green-500 mt-1">↑ 5%</div>
          </div>
          <div className={`p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-pink-900/30 border border-pink-800' : 'bg-pink-50 border border-pink-200'}`}>
            <div className="text-xs font-medium opacity-70">위험 구역</div>
            <div className="text-2xl font-bold mt-1">5곳</div>
            <div className="text-xs text-orange-500 mt-1">⚠️ 주의</div>
          </div>
        </div>

        {/* 건물별 분실물 현황 */}
        <div className="rounded-xl border border-border bg-card p-4 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-blue-500" />
            <h2 className="font-bold text-base">건물별 분실물 현황</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buildingData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} style={{ fontSize: "12px" }} />
              <YAxis stroke={textColor} style={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: bgColor, border: `1px solid ${gridColor}`, borderRadius: "8px", color: textColor }}
              />
              <Legend />
              <Bar dataKey="lost" fill="#3B82F6" name="분실" radius={[8, 8, 0, 0]} />
              <Bar dataKey="found" fill="#10B981" name="습득" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 시간대별 분실 추이 */}
        <div className="rounded-xl border border-border bg-card p-4 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-purple-500" />
            <h2 className="font-bold text-base">시간대별 분실 추이</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" stroke={textColor} style={{ fontSize: "12px" }} />
              <YAxis stroke={textColor} style={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: bgColor, border: `1px solid ${gridColor}`, borderRadius: "8px", color: textColor }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", r: 4 }}
                activeDot={{ r: 6 }}
                name="분실 건수"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 요일별 분실 패턴 */}
        <div className="rounded-xl border border-border bg-card p-4 transition-colors">
          <h2 className="font-bold text-base mb-4">요일별 분실 패턴</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" stroke={textColor} style={{ fontSize: "12px" }} />
              <YAxis stroke={textColor} style={{ fontSize: "12px" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: bgColor, border: `1px solid ${gridColor}`, borderRadius: "8px", color: textColor }}
              />
              <Bar dataKey="count" fill="#F59E0B" name="분실 건수" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 분실물 */}
        <div className="rounded-xl border border-border bg-card p-4 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-pink-500" />
            <h2 className="font-bold text-base">카테고리별 분실물</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: bgColor, border: `1px solid ${gridColor}`, borderRadius: "8px", color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 위험 구역 현황 */}
        <div className="rounded-xl border border-border bg-card p-4 transition-colors">
          <h2 className="font-bold text-base mb-4">⚠️ 분실 다발 구역</h2>
          <div className="space-y-2">
            {campusHeatmapData
              .sort((a, b) => b.incidents - a.incidents)
              .slice(0, 8)
              .map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-muted p-3 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{item.building} - {item.zone}</div>
                    <div className="text-xs opacity-70">이번 달 분실: {item.incidents}건</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.risk === "높음" 
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : item.risk === "중간"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    {item.risk}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 팁 */}
        <div className={`p-4 rounded-xl transition-colors ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className="font-bold text-sm mb-2">💡 팁</h3>
          <ul className="text-sm space-y-1 opacity-80">
            <li>• 목요일-금요일에 분실이 가장 많습니다</li>
            <li>• 오후 4시-6시가 분실 피크 시간대입니다</li>
            <li>• 중앙도서관과 공학관이 분실 다발 지역입니다</li>
            <li>• 지갑/카드 분실이 전체의 32%를 차지합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
