package com.vendorbridge.controller;

import com.vendorbridge.model.Invoice;
import com.vendorbridge.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping("/{quotationId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Invoice> approveQuotation(@PathVariable Long quotationId) {
        return ResponseEntity.ok(approvalService.approveQuotation(quotationId));
    }
}
