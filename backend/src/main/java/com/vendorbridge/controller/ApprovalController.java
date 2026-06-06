package com.vendorbridge.controller;

import com.vendorbridge.dto.ApprovalRequest;
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
    public ResponseEntity<Invoice> initiateProcurementApproval(@PathVariable Long quotationId, @RequestBody ApprovalRequest approvalDecisionRequest) {
        Invoice vendorInvoice = approvalService.initiateProcurementApproval(quotationId, approvalDecisionRequest);
        return vendorInvoice != null ? ResponseEntity.ok(vendorInvoice) : ResponseEntity.noContent().build();
    }
}
