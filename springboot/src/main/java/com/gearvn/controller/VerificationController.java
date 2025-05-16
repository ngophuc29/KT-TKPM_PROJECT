package com.gearvn.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gearvn.entities.Account;
import com.gearvn.entities.SecureToken;
import com.gearvn.repository.SecureTokenRepository;
import com.gearvn.repository.UserRepository;
import com.gearvn.service.UserService;

import java.time.LocalDateTime;

@RestController
public class VerificationController {

    @Autowired
    private SecureTokenRepository tokenRepository;

    @Autowired
    private UserService accountService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/register/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam("token") String token) {
        SecureToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null || verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        Account account = userRepository.getOne(verificationToken.getAccount().getId());
        
		if (account == null) {
			return ResponseEntity.badRequest().body("Invalid account");
		}
		
        account.setEnabled(true);
        tokenRepository.delete(verificationToken);
        return ResponseEntity.ok("Account verified successfully");
    }
}