package com.gearvn.service;

import java.util.Map;

import com.gearvn.mailing.AbstractEmailContext;

import jakarta.mail.MessagingException;

public interface EmailService {
	void sendMail(final AbstractEmailContext email) throws MessagingException;
	String buildEmailContent(Map<String, Object> context);
}
