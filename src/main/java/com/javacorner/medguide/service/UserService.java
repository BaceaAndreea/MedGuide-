package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.User;

public interface UserService {
    User loadUserByEmail(String email);

    User createUser(String email, String password);

    void assignRoleToUser(String email, String roleName);

    void sendTemporaryPassword(String email);

    boolean changePassword(String email, String oldPassword, String newPassword);
}
