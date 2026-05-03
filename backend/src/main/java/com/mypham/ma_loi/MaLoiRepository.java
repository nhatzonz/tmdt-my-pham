package com.mypham.ma_loi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaLoiRepository extends JpaRepository<MaLoi, Long> {

    List<MaLoi> findByTrangThaiOrderByIdDesc(MaLoi.TrangThai trangThai);

    List<MaLoi> findByThietBiIdAndTrangThai(Long thietBiId, MaLoi.TrangThai trangThai);

    long countByThietBiId(Long thietBiId);

    long countByTrangThai(MaLoi.TrangThai trangThai);

    @Query("""
            SELECT COUNT(m) FROM MaLoi m
            WHERE m.thietBiId = :thietBiId
              AND m.trangThai = com.mypham.ma_loi.MaLoi.TrangThai.ACTIVE
            """)
    long countActiveByThietBiId(@Param("thietBiId") Long thietBiId);

    @Query("""
            SELECT m.thietBiId, COUNT(m) FROM MaLoi m
            WHERE m.trangThai = com.mypham.ma_loi.MaLoi.TrangThai.ACTIVE
            GROUP BY m.thietBiId
            """)
    List<Object[]> countActiveGroupByThietBiId();

    Optional<MaLoi> findByThietBiIdAndMaLoiIgnoreCase(Long thietBiId, String maLoi);

    @Query(value = """
            SELECT * FROM ma_loi m
            WHERE m.trang_thai = 'ACTIVE'
              AND (
                  LOWER(m.ma_loi)  LIKE LOWER('%' || :q || '%')
               OR LOWER(m.ten_loi) LIKE LOWER('%' || :q || '%')
               OR LOWER(translate(regexp_replace(normalize(m.ten_loi, NFD), '[\\u0300-\\u036f]', '', 'g'), 'đĐ', 'dD'))
                    LIKE LOWER('%' || :qNorm || '%')
              )
            ORDER BY
                CASE
                    WHEN LOWER(m.ma_loi) = LOWER(:q) THEN 0
                    WHEN LOWER(m.ma_loi) LIKE LOWER(:q || '%') THEN 1
                    WHEN LOWER(m.ten_loi) LIKE LOWER(:q || '%') THEN 2
                    ELSE 3
                END,
                m.id DESC
            """, nativeQuery = true)
    List<MaLoi> searchActive(@Param("q") String q, @Param("qNorm") String qNorm);
}
