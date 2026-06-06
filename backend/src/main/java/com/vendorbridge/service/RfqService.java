package com.vendorbridge.service;

import com.vendorbridge.dto.RfqRequest;
import com.vendorbridge.model.Rfq;
import com.vendorbridge.model.User;
import com.vendorbridge.model.enums.RfqStatus;
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

    public Rfq createRfq(RfqRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Rfq rfq = new Rfq();
        rfq.setTitle(request.getTitle());
        rfq.setProductDetails(request.getProductDetails());
        rfq.setQuantity(request.getQuantity());
        rfq.setDeadline(request.getDeadline());
        rfq.setStatus(RfqStatus.ACTIVE);
        rfq.setCreatedBy(user); // Map the Procurement Officer who created it

        return rfqRepository.save(rfq);
    }

    public List<Rfq> getAllRfqs() {
        return rfqRepository.findAll();
    }
    
    public Rfq getRfqById(Long id) {
        return rfqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFQ not found"));
    }
}
