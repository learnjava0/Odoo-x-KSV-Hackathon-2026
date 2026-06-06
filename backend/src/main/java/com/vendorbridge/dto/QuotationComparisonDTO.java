package com.vendorbridge.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuotationComparisonDTO {
    private Long quotationId;
    private String vendorName;
    private Double unitPrice;
    private Integer deliveryTimeline;
    private String vendorRating;
    private Double totalQuotationValueWithTaxes;
    private String notes;
    private boolean isRecommended;
    private Double pricePerformanceScore;
}
