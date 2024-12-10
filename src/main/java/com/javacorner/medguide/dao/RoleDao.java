package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleDao extends JpaRepository<Role, Long> {
    Role findByName(String name);
}


