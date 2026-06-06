package com.vendorbridge.model;

import com.vendorbridge.model.enums.ProcurementState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rfqs")
public class Rfq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String productDetails;
    
    private Integer quantity;
    
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private ProcurementState status;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id", referencedColumnName = "id")
    private User createdBy;

    private String attachmentName;

    @ManyToMany
    @JoinTable(
        name = "rfq_assigned_vendors",
        joinColumns = @JoinColumn(name = "rfq_id"),
        inverseJoinColumns = @JoinColumn(name = "vendor_id")
    )
    private List<Vendor> assignedVendors;
}
