package com.vendorbridge.model;

import com.vendorbridge.model.enums.ProcurementState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rfq_id", referencedColumnName = "id")
    private Rfq rfq;

    @ManyToOne
    @JoinColumn(name = "vendor_id", referencedColumnName = "id")
    private Vendor vendor;

    private Double price;
    
    private Integer deliveryTimeline; // in days
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private ProcurementState status;
    
    @Column(columnDefinition = "TEXT")
    private String remarks; // Manager approval/rejection remarks
}
