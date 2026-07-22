import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";

type AdminSection = "dashboard" | "users" | "items" | "reports" | "audit";

const sections: { id: AdminSection; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "대시보드", Icon: LayoutDashboard },
  { id: "users", label: "사용자 관리", Icon: Users },
  { id: "items", label: "게시물 관리", Icon: ClipboardList },
  { id: "reports", label: "신고 관리", Icon: AlertTriangle },
  { id: "audit", label: "감사 로그", Icon: FileClock },
];

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

function AdminModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[24px] border border-border bg-card shadow-2xl sm:rounded-[20px]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button aria-label="닫기" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
            <X size={19} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ title, description, onCancel, onConfirm, loading }: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <AdminModal title={title} onClose={onCancel}>
      <div className="flex gap-3 rounded-xl bg-destructive/8 p-4 text-sm leading-6 text-foreground">
        <AlertTriangle className="mt-0.5 shrink-0 text-destructive" size={20} />
        <p>{description}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">취소</button>
        <button disabled={loading} onClick={onConfirm} className="h-10 rounded-lg bg-destructive px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "처리 중" : "확인"}
        </button>
      </div>
    </AdminModal>
  );
}

function Pagination({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>총 {total.toLocaleString()}건</span>
      <div className="flex items-center gap-2">
        <button aria-label="이전 페이지" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-30">
          <ChevronLeft size={17} />
        </button>
        <span className="min-w-16 text-center font-semibold text-foreground">{page} / {totalPages}</span>
        <button aria-label="다음 페이지" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-30">
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

export default function AdminScreen() {
  const { isAdmin, isAuthLoading } = useApp();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [userQuery, setUserQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [itemPage, setItemPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const utils = trpc.useUtils();

  const dashboard = trpc.admin.dashboard.useQuery(undefined, { enabled: isAdmin && section === "dashboard" });
  const usersQuery = trpc.admin.users.useQuery({ query: userQuery || undefined, page: userPage, pageSize: 20 }, { enabled: isAdmin && section === "users" });
  const itemsQuery = trpc.admin.items.useQuery({ query: itemQuery || undefined, page: itemPage, pageSize: 20 }, { enabled: isAdmin && section === "items" });
  const reportsQuery = trpc.admin.reports.useQuery({ page: reportPage, pageSize: 20 }, { enabled: isAdmin && section === "reports" });
  const auditQuery = trpc.admin.auditLogs.useQuery({ limit: 100 }, { enabled: isAdmin && section === "audit" });

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("사용자 정보가 수정되었습니다.");
      setSelectedUser(null);
      utils.admin.users.invalidate();
      utils.admin.auditLogs.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const updateItem = trpc.admin.updateItem.useMutation({
    onSuccess: () => {
      toast.success("게시물이 수정되었습니다.");
      setSelectedItem(null);
      utils.admin.items.invalidate();
      utils.admin.auditLogs.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const deleteItem = trpc.admin.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("게시물과 연결된 채팅 데이터가 삭제되었습니다.");
      setDeleteTarget(null);
      utils.admin.items.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const updateReport = trpc.admin.updateReport.useMutation({
    onSuccess: () => {
      toast.success("신고 상태가 변경되었습니다.");
      utils.admin.reports.invalidate();
      utils.admin.auditLogs.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      sessionStorage.removeItem("unifind-admin-session-hint");
      window.location.replace("/");
    },
  });

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) window.location.replace("/");
  }, [isAdmin, isAuthLoading]);

  if (isAuthLoading) {
    return <div className="flex min-h-dvh items-center justify-center bg-background text-sm font-semibold text-muted-foreground">관리자 세션 확인 중...</div>;
  }
  if (!isAdmin) {
    return <div className="flex min-h-dvh items-center justify-center bg-background text-sm font-semibold text-muted-foreground">이동 중...</div>;
  }

  const stats = dashboard.data;
  const statCards = [
    { label: "전체 사용자", value: stats?.users ?? 0, Icon: Users },
    { label: "전체 게시물", value: stats?.items ?? 0, Icon: ClipboardList },
    { label: "채팅방", value: stats?.chatRooms ?? 0, Icon: Activity },
    { label: "대기 신고", value: stats?.reports ?? 0, Icon: AlertTriangle },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden min-h-dvh border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck size={21} /></div>
            <div><p className="font-bold">UniFind Admin</p><p className="text-xs text-muted-foreground">운영 콘솔</p></div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sections.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setSection(id)} className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${section === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <button onClick={() => window.location.assign("/?admin-preview=1")} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"><BarChart3 size={17} />앱 화면 점검</button>
          <button onClick={() => logout.mutate()} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-destructive hover:bg-destructive/10"><LogOut size={17} />관리자 로그아웃</button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div><h1 className="text-lg font-bold">{sections.find(item => item.id === section)?.label}</h1><p className="hidden text-xs text-muted-foreground sm:block">실제 서버 데이터 기준</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.assign("/?admin-preview=1")} className="h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">앱 점검</button>
            <button aria-label="로그아웃" onClick={() => logout.mutate()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"><LogOut size={17} /></button>
          </div>
        </header>

        <div className="overflow-x-auto border-b border-border bg-card px-3 py-2 lg:hidden">
          <div className="flex min-w-max gap-1">
            {sections.map(({ id, label, Icon }) => <button key={id} onClick={() => setSection(id)} className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold ${section === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Icon size={15} />{label}</button>)}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {section === "dashboard" && (
            <div className="space-y-6">
              <div><h2 className="text-2xl font-bold">운영 현황</h2><p className="mt-1 text-sm text-muted-foreground">가입자, 게시물, 채팅과 신고를 한눈에 확인합니다.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-muted-foreground">{label}</p><Icon size={19} className="text-primary" /></div><p className="mt-5 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p></div>)}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-bold">보안 상태</h3><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p className="rounded-xl bg-muted p-4"><span className="block text-xs text-muted-foreground">권한 검증</span><strong className="mt-1 block">서버 adminProcedure</strong></p><p className="rounded-xl bg-muted p-4"><span className="block text-xs text-muted-foreground">관리자 세션</span><strong className="mt-1 block">8시간 만료</strong></p><p className="rounded-xl bg-muted p-4"><span className="block text-xs text-muted-foreground">감사 추적</span><strong className="mt-1 block">활성화</strong></p></div></div>
            </div>
          )}

          {section === "users" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">사용자 목록</h2><p className="text-xs text-muted-foreground">권한과 계정 상태를 관리합니다.</p></div><div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background px-3"><Search size={16} className="text-muted-foreground" /><input value={userQuery} onChange={event => { setUserQuery(event.target.value); setUserPage(1); }} placeholder="이름, 닉네임, 이메일 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/70 text-xs text-muted-foreground"><tr><th className="px-4 py-3">사용자</th><th className="px-4 py-3">권한</th><th className="px-4 py-3">포인트</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">최근 로그인</th><th className="px-4 py-3 text-right">관리</th></tr></thead><tbody>{usersQuery.data?.rows.map(user => <tr key={user.id} className="border-t border-border hover:bg-muted/35"><td className="px-4 py-3"><p className="font-semibold">{user.nickname || user.name || "이름 없음"}</p><p className="text-xs text-muted-foreground">{user.email || user.openId}</p></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{user.role}</span></td><td className="px-4 py-3 tabular-nums">{user.points.toLocaleString()}P</td><td className="px-4 py-3">{user.suspendedAt ? <span className="text-destructive">정지</span> : <span className="text-emerald-600">정상</span>}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastSignedIn)}</td><td className="px-4 py-3 text-right"><button onClick={() => setSelectedUser({ ...user, suspended: Boolean(user.suspendedAt) })} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">수정</button></td></tr>)}</tbody></table></div>
              {!usersQuery.isLoading && !usersQuery.data?.rows.length && <p className="p-10 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>}
              <Pagination page={userPage} total={usersQuery.data?.total ?? 0} pageSize={20} onPage={setUserPage} />
            </div>
          )}

          {section === "items" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">게시물 목록</h2><p className="text-xs text-muted-foreground">내용 수정, 숨김, 삭제를 처리합니다.</p></div><div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-background px-3"><Search size={16} className="text-muted-foreground" /><input value={itemQuery} onChange={event => { setItemQuery(event.target.value); setItemPage(1); }} placeholder="제목, 설명, 장소 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-muted/70 text-xs text-muted-foreground"><tr><th className="px-4 py-3">게시물</th><th className="px-4 py-3">유형</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">노출</th><th className="px-4 py-3">작성자</th><th className="px-4 py-3">등록일</th><th className="px-4 py-3 text-right">관리</th></tr></thead><tbody>{itemsQuery.data?.rows.map(row => <tr key={row.item.id} className="border-t border-border hover:bg-muted/35"><td className="max-w-[320px] px-4 py-3"><p className="truncate font-semibold">{row.item.title}</p><p className="truncate text-xs text-muted-foreground">{row.item.location}</p></td><td className="px-4 py-3">{row.item.type === "lost" ? "분실" : "습득"}</td><td className="px-4 py-3">{row.item.status}</td><td className="px-4 py-3">{row.item.isHidden ? <span className="text-destructive">숨김</span> : <span className="text-emerald-600">공개</span>}</td><td className="px-4 py-3 text-muted-foreground">{row.ownerName || row.ownerEmail || `#${row.item.userId}`}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(row.item.createdAt)}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => setSelectedItem({ ...row.item })} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">수정</button><button aria-label="게시물 삭제" onClick={() => setDeleteTarget(row.item)} className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
              {!itemsQuery.isLoading && !itemsQuery.data?.rows.length && <p className="p-10 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>}
              <Pagination page={itemPage} total={itemsQuery.data?.total ?? 0} pageSize={20} onPage={setItemPage} />
            </div>
          )}

          {section === "reports" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border p-4"><h2 className="font-bold">신고 목록</h2><p className="text-xs text-muted-foreground">신고 검토 상태를 기록합니다.</p></div><div className="divide-y divide-border">{reportsQuery.data?.rows.map(report => <div key={report.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">{report.targetType} #{report.targetId}</span><span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span></div><p className="mt-2 font-semibold">{report.reason}</p><p className="mt-1 text-sm text-muted-foreground">{report.details || "상세 내용 없음"}</p></div><select value={report.status} onChange={event => updateReport.mutate({ id: report.id, status: event.target.value as any })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold"><option value="pending">대기</option><option value="reviewing">검토 중</option><option value="resolved">처리 완료</option><option value="dismissed">기각</option></select></div>)}</div>{!reportsQuery.isLoading && !reportsQuery.data?.rows.length && <p className="p-10 text-center text-sm text-muted-foreground">접수된 신고가 없습니다.</p>}<Pagination page={reportPage} total={reportsQuery.data?.total ?? 0} pageSize={20} onPage={setReportPage} /></div>
          )}

          {section === "audit" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border p-4"><h2 className="font-bold">관리자 감사 로그</h2><p className="text-xs text-muted-foreground">로그인과 데이터 변경 이력을 확인합니다.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/70 text-xs text-muted-foreground"><tr><th className="px-4 py-3">시간</th><th className="px-4 py-3">관리자</th><th className="px-4 py-3">작업</th><th className="px-4 py-3">대상</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">상세</th></tr></thead><tbody>{auditQuery.data?.map(log => <tr key={log.id} className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td><td className="px-4 py-3">#{log.adminUserId}</td><td className="px-4 py-3 font-semibold">{log.action}</td><td className="px-4 py-3">{log.targetType} {log.targetId}</td><td className="px-4 py-3 text-muted-foreground">{log.ipAddress || "-"}</td><td className="max-w-[320px] truncate px-4 py-3 text-xs text-muted-foreground">{log.metadata || "-"}</td></tr>)}</tbody></table></div></div>
          )}
        </div>
      </main>

      {selectedUser && <AdminModal title="사용자 수정" onClose={() => setSelectedUser(null)}><div className="space-y-4"><div className="rounded-xl bg-muted p-4"><p className="font-semibold">{selectedUser.nickname || selectedUser.name || "이름 없음"}</p><p className="mt-1 text-xs text-muted-foreground">{selectedUser.email || selectedUser.openId}</p></div><label className="block text-sm font-semibold">권한<select value={selectedUser.role} onChange={event => setSelectedUser({ ...selectedUser, role: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"><option value="user">일반 사용자</option><option value="admin">관리자</option></select></label><label className="flex items-center justify-between rounded-xl border border-border p-4"><span><strong className="block text-sm">계정 정지</strong><small className="text-muted-foreground">로그인과 API 사용을 차단합니다.</small></span><input type="checkbox" checked={selectedUser.suspended} onChange={event => setSelectedUser({ ...selectedUser, suspended: event.target.checked })} className="h-5 w-5 accent-primary" /></label>{selectedUser.suspended && <label className="block text-sm font-semibold">정지 사유<input value={selectedUser.suspensionReason || ""} onChange={event => setSelectedUser({ ...selectedUser, suspensionReason: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" /></label>}<button onClick={() => updateUser.mutate({ id: selectedUser.id, role: selectedUser.role, suspended: selectedUser.suspended, suspensionReason: selectedUser.suspensionReason || undefined })} disabled={updateUser.isPending} className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">저장</button></div></AdminModal>}

      {selectedItem && <AdminModal title="게시물 수정" onClose={() => setSelectedItem(null)}><div className="space-y-4"><label className="block text-sm font-semibold">제목<input value={selectedItem.title} onChange={event => setSelectedItem({ ...selectedItem, title: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" /></label><label className="block text-sm font-semibold">상세 설명<textarea value={selectedItem.description || ""} onChange={event => setSelectedItem({ ...selectedItem, description: event.target.value })} rows={5} className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">상태<select value={selectedItem.status} onChange={event => setSelectedItem({ ...selectedItem, status: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"><option value="active">진행 중</option><option value="resolved">해결</option><option value="expired">만료</option></select></label><label className="block text-sm font-semibold">카테고리<input value={selectedItem.category} onChange={event => setSelectedItem({ ...selectedItem, category: event.target.value })} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" /></label></div><label className="flex items-center justify-between rounded-xl border border-border p-4"><span><strong className="block text-sm">게시물 숨김</strong><small className="text-muted-foreground">일반 목록에서 즉시 제외합니다.</small></span><input type="checkbox" checked={selectedItem.isHidden} onChange={event => setSelectedItem({ ...selectedItem, isHidden: event.target.checked })} className="h-5 w-5 accent-primary" /></label><label className="block text-sm font-semibold">관리 메모<textarea value={selectedItem.moderationNote || ""} onChange={event => setSelectedItem({ ...selectedItem, moderationNote: event.target.value })} rows={3} className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3" /></label><button onClick={() => updateItem.mutate({ id: selectedItem.id, title: selectedItem.title, description: selectedItem.description || null, category: selectedItem.category, status: selectedItem.status, isHidden: selectedItem.isHidden, moderationNote: selectedItem.moderationNote || null })} disabled={updateItem.isPending} className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">저장</button></div></AdminModal>}

      {deleteTarget && <ConfirmDialog title="게시물을 삭제할까요?" description="게시물과 연결된 채팅 메시지까지 영구 삭제됩니다. 되돌릴 수 없으며 감사 로그에 기록됩니다." onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteItem.mutate({ id: deleteTarget.id })} loading={deleteItem.isPending} />}
    </div>
  );
}
