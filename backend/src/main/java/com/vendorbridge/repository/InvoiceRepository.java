package com.vendorbridge.repository;

import com.vendorbridge.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findTop5ByOrderByIdDesc();
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i")
    Double sumTotalSpent();
}
