package com.vendorbridge.repository;

import com.vendorbridge.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    // Crucial for the business logic requirement: sorting by price ascending
    List<Quotation> findByRfqIdOrderByPriceAsc(Long rfqId);

    List<Quotation> findByStatusOrderByIdDesc(com.vendorbridge.model.enums.ProcurementState status);
    
    long countByStatus(com.vendorbridge.model.enums.ProcurementState status);
}
