package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.RoleDao;
import com.javacorner.medguide.dao.UserDao;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.service.UserService;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional //every method is a transactional method
public class UserServiceImpl implements UserService {

    private UserDao userDao;
    private RoleDao roleDao;
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserDao userDao, RoleDao roleDao, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.roleDao = roleDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User loadUserByEmail(String email) {
        return userDao.findByEmail(email);
    }

    @Override
    public User createUser(String email, String password) {
        String encodedPassword = passwordEncoder.encode(password);
        return userDao.save(new User(email, encodedPassword));
    }

    @Override
    public void assignRoleToUser(String email, String roleName) {
        User user = loadUserByEmail(email);
        Role role = roleDao.findByName(roleName);
        user.assignRoleToUser(role);
    }
    // we don't need to do any saving for the user, as the method are transactional method.
    //so after every transaction, we do a commit to the transaction in the database





}
