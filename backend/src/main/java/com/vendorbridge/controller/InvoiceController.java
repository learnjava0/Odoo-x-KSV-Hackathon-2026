package com.vendorbridge.controller;

import com.vendorbridge.model.Invoice;
import com.vendorbridge.repository.InvoiceRepository;
import com.vendorbridge.service.PdfGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/procurement/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final PdfGenerationService pdfGenerationService;

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<byte[]> downloadVendorInvoiceDocument(@PathVariable Long id) {
        Invoice vendorInvoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor invoice missing from registry"));

        byte[] invoicePdfDocument = pdfGenerationService.generateInvoicePdf(vendorInvoice);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(invoicePdfDocument);
    }

    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasAnyRole('PROCUREMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<String> dispatchInvoiceToVendor(@PathVariable Long id) {
        Invoice vendorInvoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor invoice missing from registry"));
        // Trigger mock email service directly
        System.out.println("Invoice #" + id + " manually triggered for email delivery to vendor.");
        return ResponseEntity.ok("Email successfully dispatched to the registered vendor.");
    }
}
