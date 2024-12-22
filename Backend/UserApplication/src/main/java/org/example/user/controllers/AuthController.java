package org.example.user.controllers;

import org.example.user.configurations.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/validateToken")
    public ResponseEntity<Boolean> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            System.out.println(token);

            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body(false);
            }

            boolean isValid = jwtUtil.validateToken(token);
            System.out.println("Token validity: " + isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            System.err.println("Error validating token: " + e.getMessage());
            return ResponseEntity.status(500).body(false);
        }
    }
}
