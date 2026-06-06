package com.vendorbridge.config;

import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.Role;
import com.vendorbridge.model.enums.VendorStatus;
import com.vendorbridge.repository.UserRepository;
import com.vendorbridge.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding initial database...");

            User admin = new User();
            admin.setEmail("admin@vendorbridge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User manager = new User();
            manager.setEmail("manager@vendorbridge.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(Role.MANAGER);
            userRepository.save(manager);
            
            User procurement = new User();
            procurement.setEmail("procurement@vendorbridge.com");
            procurement.setPassword(passwordEncoder.encode("procurement123"));
            procurement.setRole(Role.PROCUREMENT_OFFICER);
            userRepository.save(procurement);

            User vendorUser = new User();
            vendorUser.setEmail("vendor@vendorbridge.com");
            vendorUser.setPassword(passwordEncoder.encode("vendor123"));
            vendorUser.setRole(Role.VENDOR);
            vendorUser = userRepository.save(vendorUser);

            Vendor vendor = new Vendor();
            vendor.setUser(vendorUser);
            vendor.setName("Demo Supplies");
            vendor.setCategory("Office Supplies");
            vendor.setGstNumber("24ABCDE1234F1Z5");
            vendor.setContactDetails("vendor@vendorbridge.com");
            vendor.setState("Gujarat");
            vendor.setStatus(VendorStatus.APPROVED);
            vendor.setRating(4.5);
            vendorRepository.save(vendor);

            System.out.println("Default Admin, Manager, Procurement Officer, and Vendor created.");
        }
    }
}
