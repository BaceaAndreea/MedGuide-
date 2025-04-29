package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.RoleDao;
import com.javacorner.medguide.dao.UserDao;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.service.EmailService;
import com.javacorner.medguide.service.UserService;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional //every method is a transactional method
public class UserServiceImpl implements UserService {

    private UserDao userDao;
    private RoleDao roleDao;
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

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

    @Override
    public void sendTemporaryPassword(String email) {
        User user = loadUserByEmail(email);
        if (user != null) {
            String temporaryPassword = generateRandomPassword(8);
            String encodedPassword = passwordEncoder.encode(temporaryPassword);
            user.setPassword(encodedPassword);
            user.setPasswordTemporary(true);
            userDao.save(user);

            try {
                // Trimite email cu parola temporară
                emailService.sendEmail(
                        email,
                        "Parolă temporară MedGuide",
                        "Parola ta temporară este: " + temporaryPassword +
                                "\nTe rugăm să te autentifici cu această parolă și să o schimbi imediat."
                );
            } catch (Exception e) {
                System.err.println("Error sending email: " + e.getMessage());
                // Log the error but don't throw an exception to allow the process to continue
            }

            // Pentru testare, afișează și în consolă
            System.out.println("Temporary password for " + email + ": " + temporaryPassword);
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int index = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }

    @Override
    public boolean changePassword(String email, String oldPassword, String newPassword) {
        User user = loadUserByEmail(email);
        if (user != null) {
            // Verifică dacă parola veche este corectă
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                // Setează noua parolă criptată și resetează flag-ul de parolă temporară
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setPasswordTemporary(false);
                userDao.save(user);
                return true;
            }
        }
        return false;
    }




}
