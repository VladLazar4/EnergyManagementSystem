package org.example.user.controllers;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
//@EnableTransactionManagement
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow all paths
                .allowedOrigins("http://localhost:3000") // Adjust to your frontend's origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*"); // Allow all headers
    }

//    @Bean
//    public ModelMapper modelMapperBean() {
//        return new ModelMapper();
//    }
//
//    @Bean
//    public WebClient webClient() {
//        return WebClient.builder().baseUrl(System.getenv("REACT_APP_DEVICE_API_URL")).build();
//    }
}
