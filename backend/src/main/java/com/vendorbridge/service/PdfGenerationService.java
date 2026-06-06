package com.vendorbridge.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.vendorbridge.model.Invoice;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfGenerationService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("VendorBridge Invoice", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("PO Number: " + invoice.getPurchaseOrder().getPoNumber()));
            
            // Tax and Total
            document.add(new Paragraph("Base Amount: $" + invoice.getPurchaseOrder().getTotalAmount()));
            document.add(new Paragraph("Tax Amount (18% GST): $" + invoice.getTaxAmount()));
            document.add(new Paragraph("Total Amount (Incl. Tax): $" + invoice.getTotalAmount()));
            document.add(new Paragraph("Status: " + invoice.getStatus().name()));

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | java.io.IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}
