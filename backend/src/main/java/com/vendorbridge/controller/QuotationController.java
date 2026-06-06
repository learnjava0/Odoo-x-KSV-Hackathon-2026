package com.vendorbridge.controller;

import com.vendorbridge.dto.QuotationRequest;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.service.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @PostMapping("/submit/{rfqId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Quotation> submitVendorQuotation(@PathVariable Long rfqId, @RequestBody QuotationRequest quotationSubmissionRequest) {
        quotationSubmissionRequest.setRfqId(rfqId);
        return ResponseEntity.ok(quotationService.submitVendorQuotation(quotationSubmissionRequest));
    }
}
