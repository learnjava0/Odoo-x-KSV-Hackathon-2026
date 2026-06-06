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
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user = userRepository.save(user);

        // If a vendor signs up, create the corresponding vendor entity
        if (request.getRole() == Role.VENDOR) {
            Vendor vendor = new Vendor();
            vendor.setUser(user);
            vendor.setName(request.getName());
            vendor.setCategory(request.getCategory());
            vendor.setGstNumber(request.getGstNumber());
            vendor.setContactDetails(request.getContactDetails());
            vendor.setStatus(VendorStatus.PENDING);
            vendorRepository.save(vendor);
        }

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}
