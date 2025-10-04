package com.example.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/public/hello")
    public String hello() {
        return "🚀 API funcionando correctamente desde Docker";
    }
}
