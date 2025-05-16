package com.gearvn.controller;

 

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.gearvn.entities.Account;
import com.gearvn.request.AuthenticationRequest;
import com.gearvn.request.IntrospectRequest;
import com.gearvn.request.IntrospectResponse;
import com.gearvn.request.LogoutRequest;
import com.gearvn.request.RefreshRequest;
import com.gearvn.request.RegisterRequest;
import com.gearvn.response.AuthenticationResponse;
import com.gearvn.service.AuthenticationService;
import com.gearvn.serviceimpl.UserServiceImpl;
import com.nimbusds.jose.JOSEException;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
	
	@Autowired
    private AuthenticationService service;

    @Autowired
    private UserServiceImpl userServiceImpl;
    
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
       
    	var result = service.authenticate(request);
        
		return ResponseEntity.status(HttpStatus.OK).body(result);
    }
    
    @PostMapping("/introspect")
    public ResponseEntity<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request) 
            throws ParseException, JOSEException {
        var result = service.introspect(request);
         
		return ResponseEntity.status(HttpStatus.OK).body(result);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody RefreshRequest request) throws ParseException, JOSEException  {
       
    	var result = service.refreshToken(request);
        
		return ResponseEntity.status(HttpStatus.OK).body(result);
    }
    
    
//    @RequestMapping(value = "/login", method = RequestMethod.GET)
//    public String loginPage() {
//        return "public/Login";
//    }

    @PostMapping("/register")
	public ResponseEntity<String>registerCustomer(@RequestBody RegisterRequest request){
		
		ResponseEntity<String>response= null;
		try {
			if (userServiceImpl.existsByEmail(request.getEmail() )) {
				response = ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists!!");
				return response;
			}
//			if (userServiceImpl.existsByUsername(customer.getUsername())) {
//				response = ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists!!");
//				return response;
//			}
			Account customer = new Account();
			customer.setEmail(request.getEmail());
			customer.setPassword(request.getPassword());
			customer.setFirstName(request.getFirstName());
			customer.setLastName(request.getLastName());
			customer.setUsername(request.getUsername());
			Account saveCus= userServiceImpl.save(customer);
			
			if(saveCus.getId()>0) {
				response=ResponseEntity.status(HttpStatus.CREATED)
						.body("Customer is created successfully for customer ");
				System.out.println(saveCus.getId());
				userServiceImpl.sendRegistrationConfirmationEmail(saveCus);
			}
		} catch (Exception e) {
			response=ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An exception occurred from server!!"+ e);
		}
		return response; 
	}
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) 
            throws ParseException, JOSEException {
    	
         service.logout(request);
         
		return ResponseEntity.ok().build();
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    //
//  @GetMapping("/register")
//  public String openRegister() {
//      return "public/SignUp";
//  }

//  @PostMapping("/register")
//  public ResponseEntity<ResponseEntity<AuthenticationResponse>> register(@RequestBody RegisterRequest request) {
//      Account account = userServiceImpl.findByEmail(request.getEmail()).orElse(null);
//      if (account != null) {
//          return ResponseEntity.badRequest().build();
//      }
//      return ResponseEntity.ok(service.register(request));
//  }
//
//  @PostMapping("/login")
//  public ResponseEntity<ResponseEntity<AuthenticationResponse>> login(@RequestBody AuthenticationRequest authenticationRequest) {
//      return ResponseEntity.ok(service.authenticate(authenticationRequest));
//  }
}
