package com.javacorner.medguide.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

//using the swagger documentation, we can view all of, the parameters that we need for every request,
//all the return types, as well as the methods exposed by the application.
//we can also testany api

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MedGuide API")
                        .version("1.0")
                        .description("API documentation for MedGuide application"));
    }
}
