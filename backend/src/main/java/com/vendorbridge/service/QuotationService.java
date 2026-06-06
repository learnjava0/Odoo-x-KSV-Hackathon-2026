package com.vendorbridge.service;

import com.vendorbridge.dto.QuotationComparisonDTO;
import com.vendorbridge.dto.QuotationRequest;
import com.vendorbridge.model.Quotation;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.repository.QuotationRepository;
import com.vendorbridge.repository.RfqRepository;
import com.vendorbridge.repository.UserRepository;
import com.vendorbridge.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProcurementStateMachine stateMachine;

    public List<Quotation> fetchVendorQuotationsForRFQ(Long rfqId) {
        return quotationRepository.findByRfqIdOrderByPriceAsc(rfqId);
    }

    public List<QuotationComparisonDTO> compareQuotations(Long rfqId, String sortBy) {
        List<Quotation> quotations = quotationRepository.findByRfqIdOrderByPriceAsc(rfqId);
        
        List<QuotationComparisonDTO> dtos = quotations.stream().map(q -> {
            double taxRate = 0.18; // standard assumed IGST for now
            double totalWithTaxes = q.getPrice() * (1 + taxRate);
            double rating = q.getVendor().getRating() != null ? q.getVendor().getRating() : 0.0;
            String ratingStr = q.getVendor().getRating() != null ? String.valueOf(rating) : "New Vendor";
            
            double score = rating > 0 ? rating / q.getPrice() : 0;

            return QuotationComparisonDTO.builder()
                    .quotationId(q.getId())
                    .vendorName(q.getVendor().getName())
                    .unitPrice(q.getPrice())
                    .deliveryTimeline(q.getDeliveryTimeline())
                    .vendorRating(ratingStr)
                    .totalQuotationValueWithTaxes(totalWithTaxes)
                    .notes(q.getNotes())
                    .pricePerformanceScore(score)
                    .isRecommended(false)
                    .build();
        }).collect(Collectors.toList());

        // Find best score for recommendation badge
        dtos.stream().max(Comparator.comparing(QuotationComparisonDTO::getPricePerformanceScore))
                .ifPresent(best -> best.setRecommended(true));

        // Note: A pure lowest-price sort is insufficient for procurement decisions because it ignores 
        // the vendor's historical reliability and the urgency of delivery, potentially costing more in the long run.
        switch (sortBy != null ? sortBy.toLowerCase() : "") {
            case "price":
                dtos.sort(Comparator.comparing(QuotationComparisonDTO::getUnitPrice));
                break;
            case "deliverytime":
                dtos.sort(Comparator.comparing(QuotationComparisonDTO::getDeliveryTimeline));
                break;
            case "rating":
                dtos.sort(Comparator.comparing(QuotationComparisonDTO::getVendorRating).reversed());
                break;
            case "score":
            default:
                dtos.sort(Comparator.comparing(QuotationComparisonDTO::getPricePerformanceScore).reversed());
                break;
        }

        return dtos;
    }

    public Quotation submitVendorQuotation(QuotationRequest quotationSubmissionRequest) {
        String vendorEmailAddress = SecurityContextHolder.getContext().getAuthentication().getName();
        User authenticatedVendorUser = userRepository.findByEmail(vendorEmailAddress)
                .orElseThrow(() -> new RuntimeException("Vendor authentication context invalid"));
                
        Vendor registeredVendorProfile = vendorRepository.findByUserId(authenticatedVendorUser.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile missing"));

        Rfq targetProcurementRFQ = rfqRepository.findById(quotationSubmissionRequest.getRfqId())
                .orElseThrow(() -> new RuntimeException("Target RFQ no longer exists"));

        Quotation vendorQuotation = new Quotation();
        vendorQuotation.setRfq(targetProcurementRFQ);
        vendorQuotation.setVendor(registeredVendorProfile);
        vendorQuotation.setPrice(quotationSubmissionRequest.getPrice());
        vendorQuotation.setDeliveryTimeline(quotationSubmissionRequest.getDeliveryTimeline());
        vendorQuotation.setNotes(quotationSubmissionRequest.getNotes());
        vendorQuotation.setStatus(ProcurementState.UNDER_REVIEW);

        Quotation saved = quotationRepository.save(vendorQuotation);
        
        stateMachine.transitionState(targetProcurementRFQ.getStatus(), ProcurementState.UNDER_REVIEW, authenticatedVendorUser, "QUOTATION", saved.getId().toString(), "Vendor submitted quotation", "QUOTATION_SUBMITTED");
        targetProcurementRFQ.setStatus(ProcurementState.UNDER_REVIEW);
        rfqRepository.save(targetProcurementRFQ);
        
        return saved;
    }
}
