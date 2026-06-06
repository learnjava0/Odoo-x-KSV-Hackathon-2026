package com.vendorbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfqRequest {
    private String title;
    private String productDetails;
    private Integer quantity;
    private LocalDate deadline;
    private List<Long> assignedVendorIds;
    private String attachmentName;
}
