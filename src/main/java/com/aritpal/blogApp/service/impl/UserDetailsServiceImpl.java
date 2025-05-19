package com.aritpal.blogApp.service.impl;

import com.aritpal.blogApp.model.Users;
import com.aritpal.blogApp.repository.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsersRepo usersRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<Users> userOptional = usersRepo.findByUserName(username);

        Users user = userOptional.orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        Collection<GrantedAuthority> authorities = Arrays.stream(user.getRoles().split(",")).map(role -> role.trim()) // Remove leading/trailing whitespace
                .filter(role -> !role.isEmpty()).map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role).map(SimpleGrantedAuthority::new) // Create the SimpleGrantedAuthority object
                .collect(Collectors.toList());

        return new User(user.getUserName(), user.getPassword(), true, true, true, true, authorities);
    }
}
