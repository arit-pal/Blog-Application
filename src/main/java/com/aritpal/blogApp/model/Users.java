package com.aritpal.blogApp.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    @Column(name = "username", unique = true, nullable = false, length = 255)
    private String userName;
    @Column(name = "password", nullable = false, length = 255)
    private String password;
    @Column(name = "roles", nullable = false, length = 255)
    private String roles;
}
