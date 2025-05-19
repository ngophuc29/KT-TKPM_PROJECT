package com.gearvn.serviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.keygen.BytesKeyGenerator;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.stereotype.Service;

import com.gearvn.entities.SecureToken;
import com.gearvn.repository.SecureTokenRepository;
import com.gearvn.service.SecureTokenService;

import java.time.LocalDateTime;

import org.apache.commons.codec.binary.Base64;
@Service
public class SecureTokenServiceImpl implements SecureTokenService {
	
	private static final BytesKeyGenerator DEFAULT_TOKEN_GENERATOR = KeyGenerators.secureRandom(12);
	
	@Value("2800")
	private int tokenValidityInSecond;
	
	@Autowired
	SecureTokenRepository secureTokenRepository;
	
	@Override
	public SecureToken createSecureToken() {
		
		String tokenValue = new String(Base64.encodeBase64URLSafe(DEFAULT_TOKEN_GENERATOR.generateKey()));
		SecureToken secureToken = new SecureToken();
		secureToken.setToken(tokenValue);
		secureToken.setExpiryDate(LocalDateTime.now().plusSeconds(tokenValidityInSecond));
		return secureToken;
	}

	@Override
	public void saveSecureToken(SecureToken token) {
		secureTokenRepository.save(token);
	}

	@Override
	public SecureToken findByToken(String token) {
		return secureTokenRepository.findByToken(token);
	}

	@Override
	public void removeToken(SecureToken token) {
		secureTokenRepository.delete(token);
	}

	@Override
	public SecureToken save(SecureToken entity) {
		// TODO Auto-generated method stub
		return  secureTokenRepository.save(entity);
	}

}
