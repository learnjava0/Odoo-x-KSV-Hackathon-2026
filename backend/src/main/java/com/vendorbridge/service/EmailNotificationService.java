package com.vendorbridge.service;

import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    public void sendInvoiceEmail(Long invoiceId, String vendorEmail, byte[] pdfAttachment) {
        // Mock email trigger logic
        System.out.println("==================================================");
        System.out.println("MOCK EMAIL NOTIFICATION TRIGGERED");
        System.out.println("To: " + vendorEmail);
        System.out.println("Subject: VendorBridge - Your Invoice #" + invoiceId + " has been generated");
        System.out.println("Attachment: invoice_" + invoiceId + ".pdf (" + pdfAttachment.length + " bytes)");
        System.out.println("Body: Hello, please find attached your approved Purchase Order and Invoice. Thank you for partnering with VendorBridge.");
        System.out.println("==================================================");
    }
}
