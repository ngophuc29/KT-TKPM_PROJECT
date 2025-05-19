package com.gearvn.mailing;

import org.springframework.web.util.UriComponentsBuilder;

import com.gearvn.entities.Account;



public class AccountVeritificationEmailContext extends AbstractEmailContext {
	private String token;

	@Override
	public <T> void init(T context) {
		Account account = (Account) context;
		put("firstName", account.getFirstName());
		setTo(account.getEmail());
		setSubject("Account Verification");
		setFrom("no-reply@kttpro.com");		
	}
	
	public void setToken(String token) {
		this.token = token;
		put("token", token);
	}
	
	public void buildVerificationUrl( final String baseUrl, final String token  ) {
		final String url= UriComponentsBuilder.fromHttpUrl(baseUrl).
				path("/register/verify").queryParam("token", token).toUriString();
		put("verificationURL", url);
	}
}
