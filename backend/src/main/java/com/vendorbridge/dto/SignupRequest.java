package com.vendorbridge.dto;

import com.vendorbridge.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String email;
    private String password;
    private Role role;
    
    // Vendor specific fields (optional if role != VENDOR)
    private String name;
    private String category;
    private String gstNumber;
    private String contactDetails;
}
