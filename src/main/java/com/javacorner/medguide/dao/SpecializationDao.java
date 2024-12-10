package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SpecializationDao extends JpaRepository<Specialization, Long> {

    Specialization findByDescription(String description);

}
