//package com.gearvn.configs;
//
//import java.util.ArrayList;
//import java.util.Collection;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.cglib.core.CollectionUtils;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.crypto.password.PasswordEncoder;
// 
//import com.gearvn.entities.Account;
//import com.gearvn.repository.UserRepository;
//
//public class UserNamePasswordAuthenticationProvider implements AuthenticationProvider{
//
//	@Autowired
//	UserRepository customerRepository;
//	
//	   @Autowired
//		private PasswordEncoder passwordEncoder;
//	   
//	@Override
//	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
//		// TODO Auto-generated method stub
//		String username=authentication.getName();
//		String password=authentication.getCredentials().toString();
//		List<Account> customers=customerRepository.findByUsername(username);
//		
//		if(customers==null) {
//			throw new BadCredentialsException("No customer register with this username "+username);
//		}
//		else {
//			if(passwordEncoder.matches(password, customers.get(0).getPassword())) {
//				List<GrantedAuthority>authorities=new ArrayList<>();
//				authorities.add(new SimpleGrantedAuthority(customers.get(0).getRole().toString()));
//				return new UsernamePasswordAuthenticationToken(username,password,authorities);
//			}
//			else {
//				throw new BadCredentialsException("Invalid password or username "+username);
//			}
//		}
//		 
//	}
//
//	@Override
//	public boolean supports(Class<?> authentication) {
//		// TODO Auto-generated method stub
//		return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));
//	}
//
//}
