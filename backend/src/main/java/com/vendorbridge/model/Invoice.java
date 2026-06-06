package com.vendorbridge.model;

import com.vendorbridge.model.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String invoiceNumber;

    @OneToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    private Double taxAmount;
    private Double totalAmount;
    
    private Double cgstAmount;
    private Double sgstAmount;
    private Double igstAmount;
    private String taxType;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    private LocalDateTime createdAt = LocalDateTime.now();
}
