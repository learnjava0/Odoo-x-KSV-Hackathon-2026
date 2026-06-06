package com.vendorbridge.repository;

import com.vendorbridge.model.Rfq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, Long> {
}
