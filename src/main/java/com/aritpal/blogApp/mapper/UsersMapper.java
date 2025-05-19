package com.aritpal.blogApp.mapper;

import com.aritpal.blogApp.dto.UsersDto;
import com.aritpal.blogApp.model.Users;

public class UsersMapper {

    public static UsersDto toDto(Users users) {
        return new UsersDto(users.getUserId(), users.getUserName(), users.getPassword(), users.getRoles());
    }

    public static Users toEntity(UsersDto usersDto) {
        return new Users(usersDto.userId(), usersDto.userName(), usersDto.password(), usersDto.roles());
    }

}
