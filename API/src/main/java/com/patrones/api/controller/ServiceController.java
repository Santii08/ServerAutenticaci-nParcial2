package com.patrones.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ServiceController {

    @GetMapping("/service/data")
    public String getServiceData() {
        return "Datos protegidos para microservicios (Client Credentials)";
    }
}
