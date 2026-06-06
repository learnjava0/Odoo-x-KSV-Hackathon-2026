package com.vendorbridge.controller;

import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.VendorStatus;
import com.vendorbridge.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorRepository vendorRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROCUREMENT_OFFICER')")
    public ResponseEntity<List<Vendor>> getAllVendors(@RequestParam(required = false) String q) {
        List<Vendor> vendors = vendorRepository.findAll();
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(vendors);
        }

        String query = q.toLowerCase(Locale.ROOT);
        return ResponseEntity.ok(vendors.stream()
                .filter(vendor -> contains(vendor.getName(), query)
                        || contains(vendor.getCategory(), query)
                        || contains(vendor.getContactDetails(), query))
                .toList());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return vendorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> updateVendorStatus(@PathVariable Long id, @RequestParam String status) {
        return vendorRepository.findById(id).map(vendor -> {
            vendor.setStatus(VendorStatus.valueOf(status.toUpperCase(Locale.ROOT)));
            return ResponseEntity.ok(vendorRepository.save(vendor));
        }).orElse(ResponseEntity.notFound().build());
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }
}
