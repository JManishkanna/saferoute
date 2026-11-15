package com.saferoute.report;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reports")
public class Report {
    @Id private String id;
    private String title;
    private String description;
    private String category;
    private String severity;
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
    private String address;
    private String reportedBy;
    private String status = "PENDING";
    private int verificationCount = 0;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { category = v; }
    public String getSeverity() { return severity; }
    public void setSeverity(String v) { severity = v; }
    public GeoJsonPoint getLocation() { return location; }
    public void setLocation(GeoJsonPoint v) { location = v; }
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
