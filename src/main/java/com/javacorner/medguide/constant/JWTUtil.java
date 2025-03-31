package com.javacorner.medguide.constant;

public class JWTUtil {

    //10 min
    public static final long EXPIRE_ACCESS_TOKEN = 100*60*1000;
    public static final long EXPIRE_REFRESH_TOKEN = 120*60*1000;
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTH_HEADER = "Authorization";

    public static final String ISSUER = "MedGuide";

    public static final String SECRET = "myPrivateSecret";



}
