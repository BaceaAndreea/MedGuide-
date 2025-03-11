package com.javacorner.medguide.helper;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.javacorner.medguide.constant.JWTUtil.*;

@Component
public class JWTHelper {

    Algorithm algorithm = Algorithm.HMAC256(SECRET);

    //access token validity 10 min, 20 min
    public String generateAccessToken(String email, List<String> roles) {
        return JWT.create()
                .withSubject(email)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRE_ACCESS_TOKEN))
                .withIssuer(ISSUER)
                .withClaim("roles", roles)
                .sign(algorithm);
    }

    //generate the refresh token = when the access token is expired, we use a new token, has longer validity with a greater expiration date,
    //such as an hour or a day. the user can use it just when the access token is expired
    public String generateRefreshToken(String email) {
        return JWT.create()
                .withSubject(email)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRE_REFRESH_TOKEN))
                .withIssuer(ISSUER)
                .sign(algorithm);
    }

    //method that will help to extract the token from the header if it exists. This method will be used when the user access a
    //token in order to get a certain resource, as this token will be sent in the header of the request
    //Bearer is the prefix that the frontend sends before the token
    //bearer indicate that is an authetications token
    public String extractTokenFromHeaderIfExists(String authorizationHeader){
        if(authorizationHeader != null && authorizationHeader.startsWith(BEARER_PREFIX)){
            return authorizationHeader.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    //to get a map of the access of the refresh tokens because when the user logs in , we will need to send them access and
    //the refresh tokens, and we need to put those tokens in a map.
    public Map<String, String> getTokensMap(String jwtAccessToken, String jwtRefreshToken){
        Map<String, String> idTokens = new HashMap<>();
        idTokens.put("accessToken", jwtAccessToken);
        idTokens.put("refreshToken", jwtRefreshToken);
        return idTokens;
    }


}
