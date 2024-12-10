package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<User, Long> {

    User findByEmail(String email);
}
