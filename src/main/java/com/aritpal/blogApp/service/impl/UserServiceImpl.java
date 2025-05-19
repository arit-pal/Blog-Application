package com.aritpal.blogApp.service.impl;

import com.aritpal.blogApp.dto.UsersDto;
import com.aritpal.blogApp.mapper.UsersMapper;
import com.aritpal.blogApp.model.Users;
import com.aritpal.blogApp.repository.UsersRepo;
import com.aritpal.blogApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    public PasswordEncoder passwordEncoder;
    @Autowired
    UsersRepo usersRepo;

    @Override
    public UsersDto createUser(UsersDto usersDto) {
        Users users = UsersMapper.toEntity(usersDto);
        users.setPassword(passwordEncoder.encode(users.getPassword()));
        usersRepo.save(users);
        return UsersMapper.toDto(users);
    }
}
