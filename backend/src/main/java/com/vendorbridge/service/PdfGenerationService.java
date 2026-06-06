package com.vendorbridge.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.vendorbridge.model.Invoice;
import com.vendorbridge.util.EnglishNumberToWords;
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
            Paragraph title = new Paragraph("TAX INVOICE", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber()));
            document.add(new Paragraph("PO Number: " + invoice.getPurchaseOrder().getPoNumber()));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("--- BUYER DETAILS ---", new Font(Font.HELVETICA, 12, Font.BOLD)));
            document.add(new Paragraph("Buyer State/Organization placeholder")); // Hooked into OrganizationProfile in future iterations
            document.add(new Paragraph(" "));

            document.add(new Paragraph("--- VENDOR DETAILS ---", new Font(Font.HELVETICA, 12, Font.BOLD)));
            // Hooked to Vendor profile
            document.add(new Paragraph(" "));

            document.add(new Paragraph("--- TAX & TOTALS ---", new Font(Font.HELVETICA, 12, Font.BOLD)));
            document.add(new Paragraph("Base Amount: $" + invoice.getPurchaseOrder().getTotalAmount()));
            
            if ("IGST".equals(invoice.getTaxType())) {
                document.add(new Paragraph("IGST (18%): $" + invoice.getIgstAmount()));
            } else {
                document.add(new Paragraph("CGST (9%): $" + invoice.getCgstAmount()));
                document.add(new Paragraph("SGST (9%): $" + invoice.getSgstAmount()));
            }
            
            document.add(new Paragraph("Grand Total: $" + invoice.getTotalAmount()));
            document.add(new Paragraph("Amount in Words: Rupees " + EnglishNumberToWords.convert(invoice.getTotalAmount().longValue()) + " Only"));
            document.add(new Paragraph(" "));
            
            document.add(new Paragraph("Payment Terms: Net 30 Days (Per Quotation)"));

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | java.io.IOException e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}
