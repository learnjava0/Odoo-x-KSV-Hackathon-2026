package com.vendorbridge.service;

import com.vendorbridge.model.Invoice;
import com.vendorbridge.model.PurchaseOrder;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.model.enums.InvoiceStatus;
import com.vendorbridge.model.enums.PoStatus;
import com.vendorbridge.model.enums.QuotationStatus;
import com.vendorbridge.repository.InvoiceRepository;
import com.vendorbridge.repository.PurchaseOrderRepository;
import com.vendorbridge.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PdfGenerationService pdfGenerationService;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public Invoice approveQuotation(Long quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        // 1. Update Quotation Status
        quotation.setStatus(QuotationStatus.APPROVED);
        quotationRepository.save(quotation);

        // 2. Generate Purchase Order
        PurchaseOrder po = new PurchaseOrder();
        po.setRfq(quotation.getRfq());
        po.setTotalAmount(quotation.getPrice());
        po.setStatus(PoStatus.ISSUED);
        po.setPoNumber("PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        po = purchaseOrderRepository.save(po);

        // 3. Generate Invoice & Calculate 18% GST Tax
        Invoice invoice = new Invoice();
        invoice.setPurchaseOrder(po);
        
        double taxAmount = quotation.getPrice() * 0.18;
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(quotation.getPrice() + taxAmount);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice = invoiceRepository.save(invoice);

        // 4. Generate PDF and Trigger Mock Email
        byte[] pdf = pdfGenerationService.generateInvoicePdf(invoice);
        
        String vendorEmail = "vendor@example.com";
        if (quotation.getVendor() != null && quotation.getVendor().getUser() != null) {
            vendorEmail = quotation.getVendor().getUser().getEmail();
        }
                
        emailNotificationService.sendInvoiceEmail(invoice.getId(), vendorEmail, pdf);

        return invoice;
    }
}
