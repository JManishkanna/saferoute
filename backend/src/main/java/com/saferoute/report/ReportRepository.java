package com.saferoute.report;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByStatusOrderByCreatedAtDesc(String status);

    @Query("{ 'location': { '$near': { '$geometry': { 'type': 'Point', 'coordinates': [?0, ?1] }, '$maxDistance': ?2 } } }")
    List<Report> findNearby(double longitude, double latitude, double radiusMeters);
}
