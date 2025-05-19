package com.gearvn.serviceimpl;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.gearvn.mailing.AbstractEmailContext;
import com.gearvn.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {
	@Autowired
	private JavaMailSender mailSender;
	
	@Autowired
	private TemplateEngine templateEngine;

	
	public void sendMail(AbstractEmailContext email) throws MessagingException {
		// TODO Auto-generated method stub
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message,
			MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
			StandardCharsets.UTF_8.name());
		Context context = new Context();
		context.setVariables(email.getContext());
		  String emailContent = buildEmailContent(email.getContext());
		
		helper.setTo(email.getTo());
		helper.setText(emailContent, true);
		helper.setSubject(email.getSubject());
		helper.setFrom(email.getFrom());
		mailSender.send(message);
		
		
	}
	
	@Override
	public String buildEmailContent(Map<String, Object> context) {
		String firstName = context.getOrDefault("firstName", "User") == null ? 
		        "User" : context.get("firstName").toString();
		    String verificationURL = context.getOrDefault("verificationURL", "#") == null ? 
		        "#" : context.get("verificationURL").toString();

	        return "<html><body>" +
	                "<h1>Hello, " + firstName + "!</h1>" +
	                "<p>Thank you for registering with us. Please verify your email by clicking the link below:</p>" +
	                "<a href='" + verificationURL + "'>Verify Email</a>" +
	                "<p>If you did not register, please ignore this email.</p>" +
	                "</body></html>";
	}
	
}
