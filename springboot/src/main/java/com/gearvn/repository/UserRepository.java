package com.gearvn.repository;

 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gearvn.entities.Account;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<Account, Integer> {
    // find by email
    Optional<Account> findByEmail(String email);
    

    // exist email
    boolean existsByEmail(String email);
    
    Optional<Account> findByUsername(String username);
	
	 Optional<Account> findByFirstNameAndLastName(String firstName, String lastName);
	
}
