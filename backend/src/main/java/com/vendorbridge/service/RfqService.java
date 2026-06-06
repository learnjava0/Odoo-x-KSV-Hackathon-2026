package com.vendorbridge.service;

import com.vendorbridge.dto.RfqRequest;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.repository.RfqRepository;
import com.vendorbridge.repository.UserRepository;
import com.vendorbridge.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RfqService {

    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProcurementStateMachine stateMachine;

    public Rfq publishProcurementRFQ(RfqRequest rfqCreationRequest) {
        String procurementOfficerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User procurementOfficer = userRepository.findByEmail(procurementOfficerEmail)
                .orElseThrow(() -> new RuntimeException("Procurement officer context lost"));

        Rfq procurementRFQ = new Rfq();
        procurementRFQ.setTitle(rfqCreationRequest.getTitle());
        procurementRFQ.setProductDetails(rfqCreationRequest.getProductDetails());
        procurementRFQ.setQuantity(rfqCreationRequest.getQuantity());
        procurementRFQ.setDeadline(rfqCreationRequest.getDeadline());
        procurementRFQ.setAttachmentName(rfqCreationRequest.getAttachmentName());
        procurementRFQ.setStatus(ProcurementState.PUBLISHED);
        procurementRFQ.setCreatedBy(procurementOfficer);

        if (rfqCreationRequest.getAssignedVendorIds() != null && !rfqCreationRequest.getAssignedVendorIds().isEmpty()) {
            List<Vendor> vendors = vendorRepository.findAllById(rfqCreationRequest.getAssignedVendorIds());
            procurementRFQ.setAssignedVendors(vendors);
        }

        Rfq saved = rfqRepository.save(procurementRFQ);

        stateMachine.transitionState(null, ProcurementState.DRAFT, procurementOfficer, "RFQ", saved.getId().toString(), "Created RFQ", "RFQ_CREATED");
        stateMachine.transitionState(ProcurementState.DRAFT, ProcurementState.PUBLISHED, procurementOfficer, "RFQ", saved.getId().toString(), "Published RFQ", "RFQ_PUBLISHED");

        return saved;
    }

    public List<Rfq> fetchAllProcurementRFQs() {
        return rfqRepository.findAll();
    }

    public Rfq fetchRFQDetails(Long id) {
        return rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procurement RFQ not found in registry"));
    }
}
