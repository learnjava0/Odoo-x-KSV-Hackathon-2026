package com.vendorbridge.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfWriter;
import com.vendorbridge.model.Invoice;
import com.vendorbridge.util.EnglishNumberToWords;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class PdfGenerationService {

    private String formatCurrency(Double value) {
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("en", "IN"));
        nf.setMaximumFractionDigits(0);
        nf.setMinimumFractionDigits(0);
        return "Rs " + nf.format(value == null ? 0 : value);
    }

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

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(80);

            PdfPCell labelCell;
            PdfPCell valueCell;

            labelCell = new PdfPCell(new Paragraph("Base Amount:"));
            labelCell.setBorder(PdfPCell.NO_BORDER);
            valueCell = new PdfPCell(new Paragraph(formatCurrency(invoice.getPurchaseOrder().getTotalAmount())));
            valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            valueCell.setBorder(PdfPCell.NO_BORDER);
            table.addCell(labelCell);
            table.addCell(valueCell);

            if ("IGST".equals(invoice.getTaxType())) {
                labelCell = new PdfPCell(new Paragraph("IGST (18%):"));
                labelCell.setBorder(PdfPCell.NO_BORDER);
                valueCell = new PdfPCell(new Paragraph(formatCurrency(invoice.getIgstAmount())));
                valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                valueCell.setBorder(PdfPCell.NO_BORDER);
                table.addCell(labelCell);
                table.addCell(valueCell);
            } else {
                labelCell = new PdfPCell(new Paragraph("CGST (9%):"));
                labelCell.setBorder(PdfPCell.NO_BORDER);
                valueCell = new PdfPCell(new Paragraph(formatCurrency(invoice.getCgstAmount())));
                valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                valueCell.setBorder(PdfPCell.NO_BORDER);
                table.addCell(labelCell);
                table.addCell(valueCell);

                labelCell = new PdfPCell(new Paragraph("SGST (9%):"));
                labelCell.setBorder(PdfPCell.NO_BORDER);
                valueCell = new PdfPCell(new Paragraph(formatCurrency(invoice.getSgstAmount())));
                valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                valueCell.setBorder(PdfPCell.NO_BORDER);
                table.addCell(labelCell);
                table.addCell(valueCell);
            }

            labelCell = new PdfPCell(new Paragraph("Grand Total:"));
            labelCell.setBorder(PdfPCell.NO_BORDER);
            valueCell = new PdfPCell(new Paragraph(formatCurrency(invoice.getTotalAmount())));
            valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            valueCell.setBorder(PdfPCell.NO_BORDER);
            table.addCell(labelCell);
            table.addCell(valueCell);

            document.add(table);

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
