package com.vendorbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationRequest {
    private Long rfqId;
    private Double price;
    private Integer deliveryTimeline;
    private String notes;
}
