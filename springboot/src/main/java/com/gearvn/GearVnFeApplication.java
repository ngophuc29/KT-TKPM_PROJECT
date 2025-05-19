package com.gearvn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootApplication
public class GearVnFeApplication {

	public static void main(String[] args) {
		SpringApplication.run(GearVnFeApplication.class, args);
	}
	
	 
	
//	 @Bean
//	    public ObjectMapper objectMapper() {
//	        return new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//	    }
	

}
