package com.vendorbridge.dto;

import com.vendorbridge.model.ActivityLog;
import com.vendorbridge.model.Invoice;
import com.vendorbridge.model.PurchaseOrder;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardStats {
    private long pendingApprovals;
    private long activeRfqs;
    private long totalVendors;
    private double totalSpent;
    private List<PurchaseOrder> recentPurchaseOrders;
    private List<Invoice> recentInvoices;
    private List<ActivityLog> recentActivities;
}
