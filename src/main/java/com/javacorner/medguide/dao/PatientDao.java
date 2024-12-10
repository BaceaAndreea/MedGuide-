package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PatientDao extends JpaRepository<Patient, Long> {

    @Query(value = "select p from Patient  as p where p.firstName like %:name% or p.lastName like %:name%")
    List<Patient> findPatientsByByName(@Param("name") String name);

    @Query(value = "select p from Patient as p where p.user.email =:email")
    Patient findPatientByEmail(@Param("email") String email);

}
