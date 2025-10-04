package com.patrones.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/user/profile")
    public String getUserProfile() {
        return "Perfil protegido de usuario final (Refresh Token)";
    }
}
