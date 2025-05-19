package com.gearvn.serviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gearvn.entities.Account;
import com.gearvn.entities.Role;
import com.gearvn.entities.SecureToken;
import com.gearvn.mailing.AccountVeritificationEmailContext;
import com.gearvn.repository.UserRepository;
import com.gearvn.response.UserResponse;
import com.gearvn.service.EmailService;
import com.gearvn.service.SecureTokenService;
import com.gearvn.service.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
	@Value("${site.url}")
	private String baseUrl;

	@Autowired
	UserRepository repository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private SecureTokenService tokenService;

	@Autowired
	private EmailService emailService;

	@Override
	public Optional<Account> findByEmail(String email) {
		return repository.findByEmail(email);
	}

	
	public List<Account> getAllUsers() {
        return repository.findAll();
    }
	
	
	@Override
	public Boolean existsByEmail(String email) {
		return repository.existsByEmail(email);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// TODO Auto-generated method stub

		Optional<Account> customer = repository.findByUsername(username);

		String password = null;

		List<GrantedAuthority> authorities = null;

		if (customer.isEmpty()) {
			throw new UsernameNotFoundException("K tim thay customer " + username);
		}

		username = customer.get().getUsername();
		password = customer.get().getPassword();

		authorities = new ArrayList<>();

		authorities.add(new SimpleGrantedAuthority(customer.get().getRole().toString()));

		return new User(username, password, authorities);
	}

	@Override
	public Optional<Account> findByUsername(String username) {

		return repository.findByUsername(username);
	}

	@Override
	public Account registerCustomer(Account account) {
		return repository.save(account);
	}

	@Override
	public Account save(Account account) {
		passwordEncoder = new BCryptPasswordEncoder(10);
		account.setPassword(passwordEncoder.encode(account.getPassword()));
		account.setRole(Role.USER);
		account.setEnabled(false);
		return repository.save(account);
	}

	@Override
	public Optional<Account> findByFirstNameAndLastName(String firstName, String lastName) {
		// TODO Auto-generated method stub
		return repository.findByFirstNameAndLastName(firstName, lastName);
	}

	@Override
	public void sendRegistrationConfirmationEmail(Account account) {
		// TODO Auto-generated method stub
		SecureToken token = tokenService.createSecureToken();

		if (account.getId() == null) {
			System.out.println(account.getId());
			System.out.println("Token: " + token.getToken());
			return;
		}

		token.setAccount(account);

		tokenService.save(token);
		AccountVeritificationEmailContext emailContext = new AccountVeritificationEmailContext();
		emailContext.init(account);
		emailContext.setToken(token.getToken());
		emailContext.buildVerificationUrl(baseUrl, token.getToken());
		try {
			emailService.sendMail(emailContext);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

//	@Override
//	public UserResponse getMyInfo() {
//        var context = SecurityContextHolder.getContext();
//        String name = context.getAuthentication().getName();
//
//        User user = repository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//        return userMapper.toUserResponse(user);
//    }

	public Account getMyInfo() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		Account account = repository.findByUsername(currentPrincipalName)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		return Account.builder().firstName(account.getFirstName()).lastName(account.getLastName())
				.username(account.getUsername()).email(account.getEmail()).phone(account.getPhone()).build();
	}
}
