package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.domain.Specialization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorDao extends JpaRepository<Doctor, Long> {
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.hospital LEFT JOIN FETCH d.specialization WHERE d.firstName LIKE %:name% OR d.lastName LIKE %:name%")
    Page<Doctor> findDoctorsByByName(@Param("name") String name, Pageable pageable);

    @Query(value = "select d from Doctor  as d where d.user.email=:email")
    Doctor findDoctorByEmail(@Param("email") String email);

    @Query("SELECT d FROM Doctor d WHERE d.hospital.hospitalId = :hospitalId")
    List<Doctor> findByHospitalId(@Param("hospitalId") Long hospitalId);

    List<Doctor> findBySpecialization(Specialization specialization);


}
