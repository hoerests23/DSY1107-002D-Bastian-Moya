package com.example.javiiland.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false, unique = true, length = 50)
   private String username;

   /**
    * Se guarda siempre con hash (BCrypt), nunca en texto plano.
    */
   @Column(nullable = false)
   private String password;

   @Column(nullable = false, unique = true)
   private String email;

   @Column(name = "nombre_completo")
   private String nombre;

   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   @Builder.Default
   private Role role = Role.USER;

   @Column(name = "creado_en", updatable = false)
   private LocalDateTime creadoEn;

   @PrePersist
   protected void onCreate() {
      this.creadoEn = LocalDateTime.now();
   }

}
