import { Request, Response } from "express";
import { getDb } from "./db";
import { lostItems } from "../drizzle/schema";
import { eq, lt, gt, and } from "drizzle-orm";
import { sdk } from "./_core/sdk";

/**
 * 분실물 자동 만료 처리 핸들러
 * 30일 이상 경과한 active 상태의 분실물을 expired로 변경
 */
export async function handleExpireItems(req: Request, res: Response) {
  try {
    // Cron 요청 인증
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    // 30일 이전의 분실물 찾기 (active 상태만)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const expiredItems = await db
      .select()
      .from(lostItems)
      .where(
        and(
          eq(lostItems.status, "active"),
          lt(lostItems.reportedAt, thirtyDaysAgo)
        )
      );

    // 만료된 분실물 업데이트
    let updatedCount = 0;
    for (const item of expiredItems) {
      await db
        .update(lostItems)
        .set({
          status: "expired",
          updatedAt: new Date(),
        })
        .where(eq(lostItems.id, item.id));
      updatedCount++;
    }

    console.log(`[Expire Items] Updated ${updatedCount} items to expired status`);

    res.json({
      ok: true,
      updatedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Expire Items] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        url: req.url,
        taskUid: (req as any).user?.taskUid,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 분실 다발 구역 통계 생성 핸들러
 * 건물별 분실물 현황을 집계하여 위험도 평가
 */
export async function handleGenerateStatistics(req: Request, res: Response) {
  try {
    // Cron 요청 인증
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    // 최근 30일 분실물 조회
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const recentItems = await db
      .select()
      .from(lostItems)
      .where(
        and(
          eq(lostItems.type, "lost"),
          gt(lostItems.reportedAt, thirtyDaysAgo)
        )
      );

    // 건물별 집계
    const buildingStats = new Map<string, { count: number; category: Map<string, number> }>();
    
    for (const item of recentItems) {
      const building = item.building || "미분류";
      if (!buildingStats.has(building)) {
        buildingStats.set(building, { count: 0, category: new Map() });
      }
      
      const stats = buildingStats.get(building)!;
      stats.count++;
      
      const categoryCount = stats.category.get(item.category) || 0;
      stats.category.set(item.category, categoryCount + 1);
    }

    // 위험도 평가 (분실물 수에 따라)
    const riskAreas = Array.from(buildingStats.entries())
      .map(([building, stats]) => {
        let riskLevel: "low" | "medium" | "high";
        if (stats.count >= 10) riskLevel = "high";
        else if (stats.count >= 5) riskLevel = "medium";
        else riskLevel = "low";

        return {
          building,
          count: stats.count,
          riskLevel,
          topCategories: Array.from(stats.category.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat, count]) => ({ category: cat, count })),
        };
      })
      .sort((a, b) => b.count - a.count);

    console.log(`[Statistics] Generated stats for ${riskAreas.length} buildings`);

    res.json({
      ok: true,
      riskAreas,
      totalItems: recentItems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Statistics] Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        url: req.url,
        taskUid: (req as any).user?.taskUid,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
