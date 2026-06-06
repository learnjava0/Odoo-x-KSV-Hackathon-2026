package com.vendorbridge.model;

import com.vendorbridge.model.enums.VendorStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    
    @Column(unique = true)
    private String gstNumber;
    
    private String contactDetails;

    @Enumerated(EnumType.STRING)
    private VendorStatus status = VendorStatus.PENDING;

    private Double rating;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
