package com.vendorbridge.service;

import com.vendorbridge.dto.DashboardStats;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final QuotationRepository quotationRepository;
    private final RfqRepository rfqRepository;
    private final VendorRepository vendorRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardStats compileProcurementDashboardMetrics() {
        return DashboardStats.builder()
                .pendingApprovals(quotationRepository.countByStatus(ProcurementState.UNDER_REVIEW))
                .activeRfqs(rfqRepository.countByStatus(ProcurementState.PUBLISHED))
                .totalVendors(vendorRepository.count())
                .totalSpent(invoiceRepository.sumTotalSpent())
                .recentPurchaseOrders(purchaseOrderRepository.findTop5ByOrderByCreatedAtDesc())
                .recentInvoices(invoiceRepository.findTop5ByOrderByIdDesc())
                .recentActivities(activityLogRepository.findTop10ByOrderByTimestampDesc())
                .build();
    }
}
