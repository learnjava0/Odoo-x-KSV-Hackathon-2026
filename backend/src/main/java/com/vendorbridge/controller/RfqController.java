package com.vendorbridge.controller;

import com.vendorbridge.dto.RfqRequest;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.service.QuotationService;
import com.vendorbridge.service.RfqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqService rfqService;
    private final QuotationService quotationService;

    @PostMapping
    @PreAuthorize("hasRole('PROCUREMENT_OFFICER')")
    public ResponseEntity<Rfq> createRfq(@RequestBody RfqRequest request) {
        return ResponseEntity.ok(rfqService.createRfq(request));
    }

    @GetMapping
    public ResponseEntity<List<Rfq>> getAllRfqs() {
        return ResponseEntity.ok(rfqService.getAllRfqs());
    }

    @GetMapping("/{id}/quotations")
    public ResponseEntity<List<Quotation>> getQuotationsForRfq(@PathVariable Long id) {
        // Returns the quotations sorted by price as requested
        return ResponseEntity.ok(quotationService.getQuotationsForRfq(id));
    }
}
