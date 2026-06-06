package com.vendorbridge.service;

import com.vendorbridge.dto.RfqRequest;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.model.User;
import com.vendorbridge.model.enums.ProcurementState;
import com.vendorbridge.repository.RfqRepository;
import com.vendorbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RfqService {

    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final ProcurementStateMachine stateMachine;

    public Rfq publishProcurementRFQ(RfqRequest rfqCreationRequest) {
        // Enforce strict binding of the RFQ to the authenticated Procurement Officer.
        // This ensures an unbreakable audit trail so we always know who initiated the spend.
        String procurementOfficerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User procurementOfficer = userRepository.findByEmail(procurementOfficerEmail)
                .orElseThrow(() -> new RuntimeException("Procurement officer context lost"));

        Rfq procurementRFQ = new Rfq();
        procurementRFQ.setTitle(rfqCreationRequest.getTitle());
        procurementRFQ.setProductDetails(rfqCreationRequest.getProductDetails());
        procurementRFQ.setQuantity(rfqCreationRequest.getQuantity());
        procurementRFQ.setDeadline(rfqCreationRequest.getDeadline());
        
        // RFQs inherently start as PUBLISHED so vendors can immediately begin submitting quotations.
        // Paused/Draft states can be introduced later if strict internal gating is required before vendor visibility.
        procurementRFQ.setStatus(ProcurementState.PUBLISHED);
        procurementRFQ.setCreatedBy(procurementOfficer);

        Rfq saved = rfqRepository.save(procurementRFQ);
        
        stateMachine.transitionState(null, ProcurementState.DRAFT, procurementOfficer, "RFQ", saved.getId().toString(), "Created RFQ", "RFQ_CREATED");
        stateMachine.transitionState(ProcurementState.DRAFT, ProcurementState.PUBLISHED, procurementOfficer, "RFQ", saved.getId().toString(), "Published RFQ", "RFQ_PUBLISHED");
        
        return saved;
    }

    public List<Rfq> fetchAllProcurementRFQs() {
        // Broad fetch for visibility. In a strict multi-tenant or siloed procurement environment,
        // this should be restricted to RFQs created by the user's specific department.
        return rfqRepository.findAll();
    }
    
    public Rfq fetchRFQDetails(Long id) {
        return rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Procurement RFQ not found in registry"));
    }
}
