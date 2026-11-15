package com.saferoute.admin;

import com.saferoute.report.Report;
import com.saferoute.report.ReportRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final ReportRepository reports;
    public AdminController(ReportRepository reports) { this.reports = reports; }

    @GetMapping("/reports/pending")
    public List<Report> pending() { return reports.findByStatusOrderByCreatedAtDesc("PENDING"); }

    @PatchMapping("/reports/{id}/verify")
    public Report verify(@PathVariable String id) { return update(id, "VERIFIED"); }

    @PatchMapping("/reports/{id}/reject")
    public Report reject(@PathVariable String id) { return update(id, "REJECTED"); }

    @PatchMapping("/reports/{id}/resolve")
    public Report resolve(@PathVariable String id) { return update(id, "RESOLVED"); }

    private Report update(String id, String status) {
        UUID reportId;
        try { reportId = UUID.fromString(id); }
        catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        Report r = reports.findById(reportId).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        r.setStatus(status);
        return reports.save(r);
    }

    @GetMapping("/analytics")
    public Map<String, Long> analytics() {
        List<Report> all = reports.findAll();
        return Map.of("total", (long)all.size(),
            "pending", all.stream().filter(r -> "PENDING".equals(r.getStatus())).count(),
            "verified", all.stream().filter(r -> "VERIFIED".equals(r.getStatus())).count(),
            "resolved", all.stream().filter(r -> "RESOLVED".equals(r.getStatus())).count());
    }
}
