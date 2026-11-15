package com.saferoute.report;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByStatusOrderByCreatedAtDesc(String status);

    // Haversine distance in metres; no PostGIS extension is required.
    @Query(value = """
        SELECT * FROM reports r
        WHERE 6371000 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(r.latitude - :latitude) / 2), 2) +
            COS(RADIANS(:latitude)) * COS(RADIANS(r.latitude)) *
            POWER(SIN(RADIANS(r.longitude - :longitude) / 2), 2)
        )) <= :radiusMeters
        ORDER BY 6371000 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(r.latitude - :latitude) / 2), 2) +
            COS(RADIANS(:latitude)) * COS(RADIANS(r.latitude)) *
            POWER(SIN(RADIANS(r.longitude - :longitude) / 2), 2)
        ))
        """, nativeQuery = true)
    List<Report> findNearby(@Param("longitude") double longitude,
                            @Param("latitude") double latitude,
                            @Param("radiusMeters") double radiusMeters);
}
