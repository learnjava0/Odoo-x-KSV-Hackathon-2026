package com.vendorbridge.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventId;
    private String eventType;
    
    private Long actorId;
    private String actorName;
    private String actorRole;
    
    private String entityType;
    private String entityId;
    
    private String previousState;
    private String newState;
    
    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDateTime timestamp = LocalDateTime.now();
}
