package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorDao extends JpaRepository<Doctor, Long> {
    @Query(value = "select d from Doctor  as d where d.firstName like %:name% or d.lastName like %:name%")
    List<Doctor> findDoctorsByByName(@Param("name") String name);

    @Query(value = "select d from Doctor  as d where d.user.email=:email")
    Doctor findDoctorByEmail(@Param("email") String email);



}
