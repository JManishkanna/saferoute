package com.saferoute.report;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "reports", indexes = {
    @Index(name = "idx_reports_created_at", columnList = "created_at"),
    @Index(name = "idx_reports_status_created", columnList = "status, created_at")
})
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String title;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false, length = 40)
    private String category;
    @Column(nullable = false, length = 20)
    private String severity;
    @Column(nullable = false)
    private double latitude;
    @Column(nullable = false)
    private double longitude;
    @Column(length = 200)
    private String address;
    @Column(name = "reported_by", nullable = false, length = 36)
    private String reportedBy;
    @Column(nullable = false, length = 20)
    private String status = "PENDING";
    @Column(name = "verification_count", nullable = false)
    private int verificationCount = 0;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }

    public String getId() { return id == null ? null : id.toString(); }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { category = v; }
    public String getSeverity() { return severity; }
    public void setSeverity(String v) { severity = v; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double v) { latitude = v; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double v) { longitude = v; }
    // Keep the existing frontend GeoJSON response shape during the database migration.
    public Map<String, Object> getLocation() {
        return Map.of("type", "Point", "coordinates", List.of(longitude, latitude));
    }
    public String getAddress() { return address; }
    public void setAddress(String v) { address = v; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String v) { reportedBy = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public int getVerificationCount() { return verificationCount; }
    public void setVerificationCount(int v) { verificationCount = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
