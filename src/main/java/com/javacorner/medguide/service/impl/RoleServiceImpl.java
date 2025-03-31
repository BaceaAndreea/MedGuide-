package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.RoleDao;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.service.RoleService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {
    private RoleDao roleDao;

    public RoleServiceImpl(RoleDao roleDao) {
        this.roleDao = roleDao;
    }


    @Override
    public Role createRole(String roleName) {
        return roleDao.save(new Role(roleName));
    }

    @Override
    public Role findByName(String name) {
        return roleDao.findByName(name);
    }
}
