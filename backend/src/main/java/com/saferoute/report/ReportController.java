package com.saferoute.report;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportRepository reports;
    public ReportController(ReportRepository reports) { this.reports = reports; }

    public record CreateReportRequest(@NotBlank @Size(max=120) String title,
        @NotBlank @Size(max=2000) String description,
        @NotBlank String category, @NotBlank String severity,
        @DecimalMin("-90.0") @DecimalMax("90.0") double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") double longitude,
        @Size(max=200) String address) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Report create(@Valid @RequestBody CreateReportRequest req, Authentication auth) {
        if (!List.of("POTHOLE","FLOODING","WATERLOGGING","ROAD_DAMAGE","OPEN_MANHOLE","STREETLIGHT","SIGNAL","BLOCKAGE","FALLEN_TREE","STRAY_CATTLE","ROADWORK","OTHER").contains(req.category()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category");
        if (!List.of("LOW","MEDIUM","HIGH","CRITICAL").contains(req.severity()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid severity");
        Report r = new Report();
        r.setTitle(req.title().trim()); r.setDescription(req.description().trim());
        r.setCategory(req.category()); r.setSeverity(req.severity());
        r.setLocation(new GeoJsonPoint(req.longitude(), req.latitude()));
        r.setAddress(req.address()); r.setReportedBy(auth.getName());
        return reports.save(r);
    }

    @GetMapping
    public List<Report> list(@RequestParam(defaultValue="0") int page,
                             @RequestParam(defaultValue="50") int size) {
        return reports.findAll(PageRequest.of(Math.max(page,0), Math.min(Math.max(size,1),100),
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt"))).getContent();
    }

    @GetMapping("/{id}")
    public Report get(@PathVariable String id) {
        return reports.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
    }

    @GetMapping("/nearby")
    public List<Report> nearby(@RequestParam double latitude, @RequestParam double longitude,
                               @RequestParam(defaultValue="5000") double radiusMeters) {
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 ||
            radiusMeters < 1 || radiusMeters > 50000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid coordinates or radius");
        return reports.findNearby(longitude, latitude, radiusMeters);
    }
}
