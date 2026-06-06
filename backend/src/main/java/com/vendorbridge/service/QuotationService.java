package com.vendorbridge.service;

import com.vendorbridge.model.Quotation;
import com.vendorbridge.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;

    public List<Quotation> getQuotationsForRfq(Long rfqId) {
        // Comparison logic: fetch quotations sorted by price ascending (lowest price first)
        return quotationRepository.findByRfqIdOrderByPriceAsc(rfqId);
    }
}
