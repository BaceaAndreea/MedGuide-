package com.javacorner.medguide.filter;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.javacorner.medguide.helper.JWTHelper;
import com.javacorner.medguide.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.stream.Collectors;

public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private AuthenticationManager authenticationManager;
    private JWTHelper jwtHelper;
    private UserService userService;

    public JWTAuthenticationFilter(AuthenticationManager authenticationManager, JWTHelper jwtHelper, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtHelper = jwtHelper;
        this.userService = userService;

    }


    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String email = request.getParameter("username");
        String password = request.getParameter("password");
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password);
        return authenticationManager.authenticate(authenticationToken);

    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = (User) authResult.getPrincipal();
        com.javacorner.medguide.domain.User appUser = userService.loadUserByEmail(user.getUsername());
        String jwtAccessToken = jwtHelper.generateAccessToken(user.getUsername(), user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()), appUser.getPasswordTemporary());
        String jwtRefreshToken = jwtHelper.generateRefreshToken(user.getUsername());
        response.setContentType("application/json");
        new ObjectMapper().writeValue(response.getOutputStream(), jwtHelper.getTokensMap(jwtAccessToken, jwtRefreshToken));

    }
}
