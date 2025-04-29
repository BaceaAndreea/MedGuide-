package com.javacorner.medguide.web;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.ChangePasswordDTO;
import com.javacorner.medguide.dto.ForgotPasswordDTO;
import com.javacorner.medguide.helper.JWTHelper;
import com.javacorner.medguide.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
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
            String jwtAccessToken = jwtHelper.generateAccessToken(user.getEmail(), user.getRoles().stream().map(Role::getName).collect(Collectors.toList()), user.getPasswordTemporary());
            response.setContentType("application/json");
            new ObjectMapper().writeValue(response.getOutputStream(), jwtHelper.getTokensMap(jwtAccessToken, jwtRefreshToken));
        } else {
            throw new RuntimeException("Refresh token required");
        }
    }

    @PostMapping("/auth/send-temporary-password")
    public ResponseEntity<?> sendTemporaryPassword(@RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        try {
            userService.sendTemporaryPassword(forgotPasswordDTO.getEmail());
            // Din motive de securitate, răspundem cu succes indiferent dacă email-ul există
            return ResponseEntity.ok().body(Map.of("message", "If your email is registered, you will receive a temporary password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred. Please try again later."));
        }
    }

    @PostMapping("/auth/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            boolean success = userService.changePassword(
                    changePasswordDTO.getEmail(),
                    changePasswordDTO.getOldPassword(),
                    changePasswordDTO.getNewPassword()
            );

            if (success) {
                return ResponseEntity.ok().body(Map.of("message", "Password has been changed successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Current password is incorrect."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred. Please try again later."));
        }
    }
}
