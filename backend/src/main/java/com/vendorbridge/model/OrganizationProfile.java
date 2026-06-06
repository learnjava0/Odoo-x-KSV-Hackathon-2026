package com.vendorbridge.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "organization_profiles")
public class OrganizationProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String gstNumber;
    private String address;
    private String state;
}
