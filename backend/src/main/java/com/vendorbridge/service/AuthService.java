package com.vendorbridge.service;

import com.vendorbridge.dto.AuthRequest;
import com.vendorbridge.dto.AuthResponse;
import com.vendorbridge.dto.SignupRequest;
import com.vendorbridge.model.User;
import com.vendorbridge.model.Vendor;
import com.vendorbridge.model.enums.Role;
import com.vendorbridge.model.enums.VendorStatus;
import com.vendorbridge.repository.UserRepository;
import com.vendorbridge.repository.VendorRepository;
import com.vendorbridge.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerSystemUser(SignupRequest registrationPayload) {
        if (userRepository.findByEmail(registrationPayload.getEmail()).isPresent()) {
            throw new RuntimeException("Email already active in procurement registry");
        }

        User registeredUser = new User();
        registeredUser.setEmail(registrationPayload.getEmail());
        registeredUser.setPassword(passwordEncoder.encode(registrationPayload.getPassword()));
        registeredUser.setRole(registrationPayload.getRole());
        registeredUser = userRepository.save(registeredUser);

        // Procurement Compliance: A vendor role must inherently generate a strict vendor profile
        // linked to the core identity to prevent orphaned users participating in RFQs.
        if (registrationPayload.getRole() == Role.VENDOR) {
            Vendor registeredVendorProfile = new Vendor();
            registeredVendorProfile.setUser(registeredUser);
            registeredVendorProfile.setName(registrationPayload.getName());
            registeredVendorProfile.setCategory(registrationPayload.getCategory());
            registeredVendorProfile.setGstNumber(registrationPayload.getGstNumber());
            registeredVendorProfile.setContactDetails(registrationPayload.getContactDetails());
            
            // Vendors must be manually vetted by procurement officers before they can bid.
            // This is non-negotiable for supply chain security.
            registeredVendorProfile.setStatus(VendorStatus.PENDING);
            vendorRepository.save(registeredVendorProfile);
        }

        String jwtToken = jwtService.generateToken(registeredUser);
        return new AuthResponse(jwtToken, registeredUser.getEmail(), registeredUser.getRole());
    }

    public AuthResponse authenticateSystemUser(AuthRequest authenticationPayload) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationPayload.getEmail(),
                        authenticationPayload.getPassword()
                )
        );

        User registeredUser = userRepository.findByEmail(authenticationPayload.getEmail())
                .orElseThrow(() -> new RuntimeException("Procurement identity mismatch"));

        String jwtToken = jwtService.generateToken(registeredUser);
        return new AuthResponse(jwtToken, registeredUser.getEmail(), registeredUser.getRole());
    }
}
