package com.gearvn.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gearvn.entities.Account;
import com.gearvn.entities.Role;
import com.gearvn.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
	
	PasswordEncoder passwordEncoder;
	
	@Bean
	ApplicationRunner applicationRunner(UserRepository userRepository) {
		return args -> {
			if(userRepository.findByUsername("admin").isEmpty()) {
				Account account = Account.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ADMIN)
                        .enabled(true)
                        .build();
				
				userRepository.save(account);
				log.warn("Admin account created with username: admin and password: admin. Please change password after login");
			}
		};
	}

}

