package com.vendorbridge.service;

import com.vendorbridge.dto.QuotationRequest;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.QuotationStatus;
import com.vendorbridge.repository.QuotationRepository;
import com.vendorbridge.repository.RfqRepository;
import com.vendorbridge.repository.UserRepository;
import com.vendorbridge.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public List<Quotation> getQuotationsForRfq(Long rfqId) {
        // Comparison logic: fetch quotations sorted by price ascending (lowest price first)
        return quotationRepository.findByRfqIdOrderByPriceAsc(rfqId);
    }

    public Quotation submitQuotation(QuotationRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found for user"));

        Rfq rfq = rfqRepository.findById(request.getRfqId())
                .orElseThrow(() -> new RuntimeException("RFQ not found"));

        Quotation quotation = new Quotation();
        quotation.setRfq(rfq);
        quotation.setVendor(vendor);
        quotation.setPrice(request.getPrice());
        quotation.setDeliveryTimeline(request.getDeliveryTimeline());
        quotation.setNotes(request.getNotes());
        quotation.setStatus(QuotationStatus.SUBMITTED);

        return quotationRepository.save(quotation);
    }
}
