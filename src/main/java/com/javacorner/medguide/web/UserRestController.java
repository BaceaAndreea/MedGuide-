package com.javacorner.medguide.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.helper.JWTHelper;
import com.javacorner.medguide.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.stream.Collectors;

import static com.javacorner.medguide.constant.JWTUtil.AUTH_HEADER;
import static com.javacorner.medguide.constant.JWTUtil.SECRET;

@RestController
@CrossOrigin("*")
public class UserRestController {
    private UserService userService;
    private JWTHelper jwtHelper;
    public UserRestController(UserService userService, JWTHelper jwtHelper) {
        this.userService = userService;
        this.jwtHelper = jwtHelper;
    }

    @GetMapping("/users")
    @PreAuthorize("permitAll()")
    public boolean checkIfEmailExists(@RequestParam(name = "email", defaultValue = "") String email) {
        return userService.loadUserByEmail(email) != null;
    }

    @GetMapping("/refresh-token")
    public void generateNewAccessToken(HttpServletRequest request , HttpServletResponse response) throws IOException {
        System.out.println("Authorization Header: " + request.getHeader(AUTH_HEADER));
        String jwtRefreshToken =  jwtHelper.extractTokenFromHeaderIfExists(request.getHeader(AUTH_HEADER));
        if(jwtRefreshToken != null) {
            Algorithm algorithm = Algorithm.HMAC256(SECRET);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(jwtRefreshToken);
            String email = decodedJWT.getSubject();
            User user = userService.loadUserByEmail(email);
            String jwtAccessToken = jwtHelper.generateAccessToken(user.getEmail(), user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            response.setContentType("application/json");
            new ObjectMapper().writeValue(response.getOutputStream(), jwtHelper.getTokensMap(jwtAccessToken, jwtRefreshToken));
        } else {
            throw new RuntimeException("Refresh token required");
        }
    }
}
