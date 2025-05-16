
package com.gearvn.service;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gearvn.entities.Account;
import com.gearvn.entities.InvalidatedToken;
import com.gearvn.entities.Role;
import com.gearvn.repository.InvalidatedTokenRepository;
import com.gearvn.repository.UserRepository;
import com.gearvn.request.AuthenticationRequest;
import com.gearvn.request.IntrospectRequest;
import com.gearvn.request.IntrospectResponse;
import com.gearvn.request.LogoutRequest;
import com.gearvn.request.RefreshRequest;
import com.gearvn.response.AuthenticationResponse;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;



//@RestController
//@RequestMapping("/api/auth")

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PUBLIC, makeFinal = true)
public class AuthenticationService {
	@Autowired
	private final UserRepository userService;
	
	private final InvalidatedTokenRepository invalidatedTokenRepository;
	
	@NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;
    
	@NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;
	
	@NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;
	
	public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
    	var token = request.getToken();
    	
    	boolean isvalid = true;
    	try {
    		verifyToken(token, false);
		} catch (Exception e) {
			isvalid = false;
		}
    	
    	
    	
		return IntrospectResponse.builder()
                .valid(isvalid).build();
				
	}
    
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
    	var user = userService.findByUsername(request.getUsername())
    			.orElseThrow(() -> new RuntimeException("User not found"));
    	
    	if (!user.isEnabled()) {
    		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản chưa được kích hoạt.");
    	}
    	PasswordEncoder passwordEncoder= new BCryptPasswordEncoder(10);
    	
    	boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
		if (!authenticated) {
			throw new RuntimeException("Incorrect password");
		}
		var token = generateToken(user);
		
//    	return passwordEncoder.matches(request.getPassword(), user.getPassword());
		return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

	private String generateToken(Account account) {
		JWSHeader header = new JWSHeader(JWSAlgorithm.HS512 );
		
		JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(account.getUsername())
                .issuer("gearvn.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                		Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                		))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(account))
                .build();
                
		Payload payload = new Payload(jwtClaimsSet.toJSONObject());
		JWSObject jwsObject = new JWSObject(header, payload);
		try {
			jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
			return jwsObject.serialize();
		} catch (JOSEException e) {
			// TODO Auto-generated catch block
			log.error("Error create token", e);
			throw new RuntimeException( e);
		}
	}
    
	private String buildScope(Account account) {
		StringJoiner stringJoiner = new StringJoiner(" ");
		if (!(account.getRole() == null)) {
			stringJoiner.add(account.getRole().toString());
		}
		return stringJoiner.toString();
	}
	
	public void logout(LogoutRequest request) throws ParseException, JOSEException {
		// TODO Auto-generated method stub
		try {
			var signToken = verifyToken(request.getToken(),false);
			String jit = signToken.getJWTClaimsSet().getJWTID();
			Date expirationTime = signToken.getJWTClaimsSet().getExpirationTime();
			
			InvalidatedToken invalidatedToken = InvalidatedToken.builder().id(jit).expiryTime(expirationTime).build();
			
			invalidatedTokenRepository.save(invalidatedToken);
		} catch (RuntimeException e) {
			// TODO: handle exception
			log.info("Token already expired");
		}
		
		
		
	}
	
	private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
		JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
    	
    	SignedJWT signedJWT = SignedJWT.parse(token);
    	
    	Date expirationTime =(isRefresh)
    			? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli()) 
    			: signedJWT.getJWTClaimsSet().getExpirationTime();
    	
    	var verified = signedJWT.verify(verifier);
    	
    	if(!(verified && expirationTime.after(new Date())))
    		throw new RuntimeException("Invalid token");
    	
		if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
			throw new RuntimeException("Token is invalidated");
		}
		return signedJWT;
	}
	
	
	public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
		// TODO Auto-generated method stub
		var signJWT = verifyToken(request.getToken(),true);
		
		var jit = signJWT.getJWTClaimsSet().getJWTID();
		
		var expirationTime = signJWT.getJWTClaimsSet().getExpirationTime();
		
		InvalidatedToken invalidatedToken = InvalidatedToken.builder().id(jit).expiryTime(expirationTime).build();
		
		invalidatedTokenRepository.save(invalidatedToken);
		
		var username= signJWT.getJWTClaimsSet().getSubject();
		
		var user = userService.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
		var token = generateToken(user);
		

		return AuthenticationResponse.builder().token(token).authenticated(true).build();
	}
	
//    @PostMapping("/register")
//    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
//        var user = Account.builder()
//                .firstName(request.getFirstName())
//                .lastName(request.getLastName())
//                .email(request.getEmail())
//                .password(passwordEncoder.encode(request.getPassword()))
//                .role(Role.USER)
//                .build();
//        userService.save(user);
//        var jwtToken = jwtService.generateToken(user);
//        return ResponseEntity.ok(AuthenticationResponse.builder()
//                .token(jwtToken)
//                .build());
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
//        var user = userService.findByEmail(request.getEmail()).orElseThrow(null);
//        var jwtToken = jwtService.generateToken(user);
//        return ResponseEntity.ok(AuthenticationResponse.builder()
//                .token(jwtToken)
//                .build());
//    }
//
//    
//    @PostMapping("/register")
//   	public ResponseEntity<String>registerCustomer(
//   			@RequestBody Account customer
//   			){
//   		
//   		ResponseEntity<String>response= null;
//   		try {
//   			Account saveCus= userService.save(customer);
//   			
//   			if(saveCus.getId()>0) {
//   				response=ResponseEntity.status(HttpStatus.CREATED)
//   						.body("Customer is created successfully for customer ");
//   			}
//   		} catch (Exception e) {
//   			response=ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An exception occurred from server!!"+ e);
//   		}
//   		return response;
//   		 
//   	}
//    
//   
//
//    @PostMapping("/logout")
//    public ResponseEntity<String> logout(HttpServletRequest request) {
//        var token = request.getHeader("Authorization");
//        jwtService.invalidate(token);
//        return ResponseEntity.ok("Logout successfully");
//    }
    
    
    
    
}
