package com.javacorner.medguide.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Permite toate endpoint-urile
                        .allowedOrigins("http://localhost:4200") // Originea frontend-ului Angular
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Metodele permise
                        .allowedHeaders("*") // Permite toate headerele
                        .allowCredentials(true); // Permite cookie-uri dacă sunt folosite
            }
        };
    }
}
