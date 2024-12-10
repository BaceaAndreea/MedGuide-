package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalDao extends JpaRepository<Hospital, Long> {
    Hospital findByName(String name);
}
