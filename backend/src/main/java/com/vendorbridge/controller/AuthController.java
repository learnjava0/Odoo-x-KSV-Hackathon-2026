package com.vendorbridge.controller;

import com.vendorbridge.dto.AuthRequest;
import com.vendorbridge.dto.AuthResponse;
import com.vendorbridge.dto.SignupRequest;
import com.vendorbridge.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerSystemUser(@RequestBody SignupRequest registrationPayload) {
        return ResponseEntity.ok(authService.registerSystemUser(registrationPayload));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateSystemUser(@RequestBody AuthRequest authenticationPayload) {
        return ResponseEntity.ok(authService.authenticateSystemUser(authenticationPayload));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        // Mock email trigger for password reset
        return ResponseEntity.ok("If an account exists, a password reset link has been sent to " + email);
    }
}
