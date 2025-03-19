package com.javacorner.medguide.security;

import com.javacorner.medguide.filter.JWTAuthenticationFilter;
import com.javacorner.medguide.filter.JWTAuthorizationFilter;
import com.javacorner.medguide.helper.JWTHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    //since I have just one implementattion, this will be autowired
    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTHelper jwtHelper;

    //I will use the stateless authentication, such that the logged-in user's information
    //will persist in a token, and hence I will not be creating a session in the back end, but rather, all
    //the information about the logged-in user, as well as their role, will be inside a token that is sent to
    // the frontend application. The stateless authentication id the opposite of the statefull athentication
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Dezactivare CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))// Stateless session
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login").permitAll() // Permite accesul la autentificare
                        .requestMatchers("/refresh-token/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll() // Endpointuri publice
                        .requestMatchers("/api/private/**").authenticated() // Endpointuri protejate
                        .requestMatchers("/users**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/patients").permitAll()
                        .anyRequest().authenticated() // Orice alt request trebuie autentificat
                )
                .addFilter(new JWTAuthenticationFilter(authenticationManager(http.getSharedObject(AuthenticationConfiguration.class)), jwtHelper))
                .addFilterBefore(new JWTAuthorizationFilter(jwtHelper), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Acceptă orice origine (NU recomandat pentru producție)
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList("Access-Control-Allow-Origin", "Access-Control-Allow-Headers",  "Access-Control-Request-Method", "Access-Control-Request-Headers", "Origin", "Cache-Control", "Content-Type", "Authorization"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
