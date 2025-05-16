package com.gearvn.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@Entity
@NoArgsConstructor
@Table(name = "account")
public class Account extends Auditable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(updatable = false, nullable = false, unique = true)
	private Integer id;

	private String firstName;

	private String lastName;

	@Column(name = "username", nullable = false, unique = true)
	private String username;

	@Column(name = "email", nullable = false, unique = true)
	private String email;

	private String password;
	
	private boolean enabled;
	
	private String phone;
	

	@Enumerated(EnumType.STRING)
	private Role role;
	
	@OneToOne(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	 @PrimaryKeyJoinColumn
    private SecureToken secureToken;
	
//    @Override
//    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return List.of(new SimpleGrantedAuthority(role.name()));
//    }

	  

	 
	
	 
}
