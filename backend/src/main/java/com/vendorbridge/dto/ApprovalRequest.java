package com.vendorbridge.dto;

import lombok.Data;

@Data
public class ApprovalRequest {
    private boolean purchaseOrderApproved;
    private String approvalRemark;
}
