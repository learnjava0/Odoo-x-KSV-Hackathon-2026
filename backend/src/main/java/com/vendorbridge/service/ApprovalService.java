package com.vendorbridge.service;

import com.vendorbridge.dto.ApprovalRequest;
import com.vendorbridge.model.Invoice;
import com.vendorbridge.model.OrganizationProfile;
import com.vendorbridge.model.PurchaseOrder;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.InvoiceStatus;
import com.vendorbridge.model.enums.PoStatus;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.repository.InvoiceRepository;
import com.vendorbridge.repository.OrganizationProfileRepository;
import com.vendorbridge.repository.PurchaseOrderRepository;
import com.vendorbridge.repository.QuotationRepository;
import com.vendorbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PdfGenerationService pdfGenerationService;
    private final EmailNotificationService emailNotificationService;
    private final UserRepository userRepository;
    private final OrganizationProfileRepository organizationProfileRepository;
    private final ProcurementStateMachine stateMachine;

    @Transactional
    public Invoice initiateProcurementApproval(Long quotationId, ApprovalRequest approvalDecisionRequest) {
        String approvingManagerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User managerProfile = userRepository.findByEmail(approvingManagerEmail).orElse(null);

        Quotation vendorQuotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Vendor quotation not found"));

        vendorQuotation.setRemarks(approvalDecisionRequest.getApprovalRemark());

        if (!approvalDecisionRequest.isPurchaseOrderApproved()) {
            stateMachine.transitionState(vendorQuotation.getStatus(), ProcurementState.PENDING_APPROVAL, managerProfile, "QUOTATION", vendorQuotation.getId().toString(), "Manager review started", "APPROVAL_REVIEW_STARTED");
            stateMachine.transitionState(ProcurementState.PENDING_APPROVAL, ProcurementState.REJECTED, managerProfile, "QUOTATION", vendorQuotation.getId().toString(), approvalDecisionRequest.getApprovalRemark(), "APPROVAL_REJECTED");
            vendorQuotation.setStatus(ProcurementState.REJECTED);
            quotationRepository.save(vendorQuotation);
            return null;
        }

        stateMachine.transitionState(vendorQuotation.getStatus(), ProcurementState.PENDING_APPROVAL, managerProfile, "QUOTATION", vendorQuotation.getId().toString(), "Manager review started", "APPROVAL_REVIEW_STARTED");
        stateMachine.transitionState(ProcurementState.PENDING_APPROVAL, ProcurementState.APPROVED, managerProfile, "QUOTATION", vendorQuotation.getId().toString(), approvalDecisionRequest.getApprovalRemark(), "APPROVAL_GRANTED");
        vendorQuotation.setStatus(ProcurementState.APPROVED);
        quotationRepository.save(vendorQuotation);

        // PO Number Format: VB-PO-{YEAR}-{4-digit-seq}
        String poNumber = "VB-PO-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 10000));
        
        PurchaseOrder generatedPurchaseOrder = new PurchaseOrder();
        generatedPurchaseOrder.setRfq(vendorQuotation.getRfq());
        generatedPurchaseOrder.setTotalAmount(vendorQuotation.getPrice());
        generatedPurchaseOrder.setStatus(PoStatus.ISSUED);
        generatedPurchaseOrder.setPoNumber(poNumber);
        generatedPurchaseOrder = purchaseOrderRepository.save(generatedPurchaseOrder);
        
        stateMachine.transitionState(ProcurementState.APPROVED, ProcurementState.APPROVED, managerProfile, "PO", generatedPurchaseOrder.getId().toString(), "PO Generated", "PO_GENERATED");

        Invoice vendorInvoice = new Invoice();
        vendorInvoice.setPurchaseOrder(generatedPurchaseOrder);
        
        String invoiceNumber = "VB-INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 10000));
        vendorInvoice.setInvoiceNumber(invoiceNumber);
        
        Vendor vendor = vendorQuotation.getVendor();
        OrganizationProfile org = organizationProfileRepository.findAll().stream().findFirst().orElse(null);
        
        if (org != null && vendor != null && vendor.getState() != null && vendor.getState().equalsIgnoreCase(org.getState())) {
            double cgst = vendorQuotation.getPrice() * 0.09;
            double sgst = vendorQuotation.getPrice() * 0.09;
            vendorInvoice.setTaxType("CGST_SGST");
            vendorInvoice.setCgstAmount(cgst);
            vendorInvoice.setSgstAmount(sgst);
            vendorInvoice.setTaxAmount(cgst + sgst);
        } else {
            double igst = vendorQuotation.getPrice() * 0.18;
            vendorInvoice.setTaxType("IGST");
            vendorInvoice.setIgstAmount(igst);
            vendorInvoice.setTaxAmount(igst);
        }
        
        vendorInvoice.setTotalAmount(vendorQuotation.getPrice() + vendorInvoice.getTaxAmount());
        vendorInvoice.setStatus(InvoiceStatus.UNPAID);
        vendorInvoice = invoiceRepository.save(vendorInvoice);

        byte[] invoicePdfDocument = pdfGenerationService.generateInvoicePdf(vendorInvoice);
        
        String vendorEmail = "vendor@example.com";
        if (vendorQuotation.getVendor() != null && vendorQuotation.getVendor().getUser() != null) {
            vendorEmail = vendorQuotation.getVendor().getUser().getEmail();
        }
                
        emailNotificationService.sendInvoiceEmail(vendorInvoice.getId(), vendorEmail, invoicePdfDocument);
        stateMachine.transitionState(ProcurementState.APPROVED, ProcurementState.APPROVED, managerProfile, "INVOICE", vendorInvoice.getId().toString(), "Invoice PDF Generated and Emailed", "INVOICE_SENT");

        return vendorInvoice;
    }
}
