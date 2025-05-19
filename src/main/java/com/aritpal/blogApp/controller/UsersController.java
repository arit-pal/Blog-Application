package com.aritpal.blogApp.controller;

import com.aritpal.blogApp.dto.UsersDto;
import com.aritpal.blogApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UsersController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    public boolean createUser(@RequestBody UsersDto usersDto) {
        userService.createUser(usersDto);
        return true;
    }

}
