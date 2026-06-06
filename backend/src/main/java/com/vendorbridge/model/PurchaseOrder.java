package com.vendorbridge.model;

import com.vendorbridge.model.enums.PoStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "rfq_id", referencedColumnName = "id")
    private Rfq rfq;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private PoStatus status = PoStatus.ISSUED;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(unique = true)
    private String poNumber;
}
