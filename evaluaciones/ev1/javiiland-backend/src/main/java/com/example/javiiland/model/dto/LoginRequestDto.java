package com.example.javiiland.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
 
    @NotBlank
    private String username;
 
    @NotBlank
    private String password;
}
 