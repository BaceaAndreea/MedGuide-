package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImplementation implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImplementation.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            // In development, just log the email instead of sending it
            logger.info("Email would be sent to: " + to);
            logger.info("Subject: " + subject);
            logger.info("Content: " + text);

            // Comment this out during development to avoid actual sending
            // mailSender.send(message);

            // Log success
            logger.info("Email successfully logged (not sent in development mode)");
        } catch (Exception e) {
            logger.error("Error in email service: " + e.getMessage(), e);
            // Don't rethrow the exception, so the password reset can still work
        }
    }
}
