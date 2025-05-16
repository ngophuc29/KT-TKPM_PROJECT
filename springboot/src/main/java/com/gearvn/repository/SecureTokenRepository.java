package com.gearvn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gearvn.entities.SecureToken;

@Repository
public interface SecureTokenRepository extends JpaRepository<SecureToken, Long> {
	SecureToken findByToken(String token);
	
	Long removeByToken(String token);
}
