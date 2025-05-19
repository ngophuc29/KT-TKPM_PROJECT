
package com.gearvn.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExceptionController implements ErrorController {

    @GetMapping("/error")
    public ResponseEntity<String> accessDenied() {
        return ResponseEntity.status(403).body("Access Denied");
    }
}
