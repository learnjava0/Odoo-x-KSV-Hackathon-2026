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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rfqs")
@RequiredArgsConstructor
public class RfqController {

    private final RfqService rfqService;
    private final QuotationService quotationService;

    private static final Path UPLOAD_DIR = Paths.get("uploads");

    @PostMapping
    @PreAuthorize("hasRole('PROCUREMENT_OFFICER')")
    public ResponseEntity<Rfq> publishProcurementRFQ(@RequestBody RfqRequest rfqCreationRequest) {
        return ResponseEntity.ok(rfqService.publishProcurementRFQ(rfqCreationRequest));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('PROCUREMENT_OFFICER')")
    public ResponseEntity<String> uploadAttachment(@RequestParam("file") MultipartFile file) throws IOException {
        Files.createDirectories(UPLOAD_DIR);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), UPLOAD_DIR.resolve(filename));
        return ResponseEntity.ok(filename);
    }

    @GetMapping
    public ResponseEntity<List<Rfq>> fetchAllProcurementRFQs() {
        return ResponseEntity.ok(rfqService.fetchAllProcurementRFQs());
    }

    @GetMapping("/{id}/quotations")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'MANAGER')")
    public ResponseEntity<List<Quotation>> fetchVendorQuotationsForRFQ(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.fetchVendorQuotationsForRFQ(id));
    }

    @GetMapping("/{id}/compare")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'MANAGER')")
    public ResponseEntity<?> compareQuotations(@PathVariable Long id, @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(quotationService.compareQuotations(id, sortBy));
    }
}
