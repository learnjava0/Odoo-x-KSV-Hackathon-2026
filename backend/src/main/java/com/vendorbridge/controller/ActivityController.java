package com.vendorbridge.controller;

import com.vendorbridge.model.ActivityLog;
import com.vendorbridge.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityLogRepository activityLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<List<ActivityLog>> getRecentActivities() {
        return ResponseEntity.ok(activityLogRepository.findTop10ByOrderByTimestampDesc());
    }
}
