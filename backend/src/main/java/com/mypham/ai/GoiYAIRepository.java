package com.mypham.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface GoiYAIRepository extends JpaRepository<GoiYAI, Long> {

    /** Tìm impression mới nhất cho cặp user×sp (để mark click trên impression đó). */
    @Query("""
            SELECT g FROM GoiYAI g
            WHERE g.sanPhamId = :sanPhamId
              AND ((:userId IS NULL AND g.nguoiDungId IS NULL)
                   OR g.nguoiDungId = :userId)
            ORDER BY g.id DESC
            """)
    List<GoiYAI> findRecentImpression(
            @Param("userId") Long userId,
            @Param("sanPhamId") Long sanPhamId);

    /**
     * CTR theo ngày trong N ngày gần nhất.
     * Trả {ngay, impressions, clicks}.
     */
    @Query(value = """
            SELECT TO_CHAR(DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh'), 'YYYY-MM-DD') AS ngay,
                   COUNT(*) AS impressions,
                   SUM(CASE WHEN da_click THEN 1 ELSE 0 END) AS clicks
            FROM goi_y_ai
            WHERE created_at >= :from
            GROUP BY ngay
            ORDER BY ngay
            """, nativeQuery = true)
    List<Object[]> ctrByDay(@Param("from") Instant from);

    /** Tổng impressions trong khoảng. */
    @Query("SELECT COUNT(g) FROM GoiYAI g WHERE g.createdAt >= :from")
    long countImpressionsSince(@Param("from") Instant from);

    /** Tổng clicks trong khoảng. */
    @Query("SELECT COUNT(g) FROM GoiYAI g WHERE g.createdAt >= :from AND g.daClick = true")
    long countClicksSince(@Param("from") Instant from);
}
