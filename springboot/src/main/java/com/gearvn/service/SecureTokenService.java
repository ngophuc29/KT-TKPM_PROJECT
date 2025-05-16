package com.gearvn.service;

import com.gearvn.entities.SecureToken;
public interface SecureTokenService {

	SecureToken createSecureToken();
	
	void saveSecureToken(SecureToken token);
	
	SecureToken findByToken(String token);
	
	void removeToken(SecureToken token);
	
	SecureToken save(SecureToken entity);
}
