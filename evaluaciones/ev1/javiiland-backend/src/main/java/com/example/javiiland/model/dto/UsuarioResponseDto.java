package com.example.javiiland.model.dto;

import com.example.javiiland.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
}
 