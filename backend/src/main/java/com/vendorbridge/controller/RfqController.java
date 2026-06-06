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
    public ResponseEntity<Rfq> publishProcurementRFQ(@RequestBody RfqRequest rfqCreationRequest) {
        return ResponseEntity.ok(rfqService.publishProcurementRFQ(rfqCreationRequest));
    }

    @GetMapping
    public ResponseEntity<List<Rfq>> fetchAllProcurementRFQs() {
        return ResponseEntity.ok(rfqService.fetchAllProcurementRFQs());
    }

    @GetMapping("/{id}/quotations")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'MANAGER')")
    public ResponseEntity<List<Quotation>> fetchVendorQuotationsForRFQ(@PathVariable Long id) {
        // Vendors should not see competitor pricing before submitting.
        // Only show comparison data to Procurement Officers and above.
        // The service layer sorts this by lowest price to eliminate bias.
        return ResponseEntity.ok(quotationService.fetchVendorQuotationsForRFQ(id));
    }

    @GetMapping("/{id}/compare")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'MANAGER')")
    public ResponseEntity<?> compareQuotations(@PathVariable Long id, @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(quotationService.compareQuotations(id, sortBy));
    }
}
