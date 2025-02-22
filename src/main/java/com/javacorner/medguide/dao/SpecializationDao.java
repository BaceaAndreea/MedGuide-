package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Specialization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface SpecializationDao extends JpaRepository<Specialization, Long> {

    Specialization findByDescription(String description);

    @Query("SELECT s FROM Specialization s WHERE LOWER(s.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    Page<Specialization> findSpecializationByDescription(@Param("description") String description, Pageable pageable);
}