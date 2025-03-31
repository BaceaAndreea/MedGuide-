package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Role;

public interface RoleService {

    Role createRole(String roleName);

    Role findByName(String name);
}
