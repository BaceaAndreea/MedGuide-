package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;


public interface AppointmentDao extends JpaRepository<Appointment, Long> {

    Page<Appointment> findAppointmentsByStatusContains(String keyword, Pageable pageable);

    @Query(value = "SELECT * FROM appointments AS a WHERE a.appointment_id IN (SELECT c.appointment_id FROM consultations AS c) AND a.patient_id = :patientId", nativeQuery = true)
    Page<Appointment>getAppointmentsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(value = "select * from appointments as a where a.appointment_id not in (SELECT c.appointment_id FROM consultations AS c) AND a.patient_id = :patientId", nativeQuery = true)
    Page<Appointment>getNoAppointmentsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(value = " select a from Appointment as a where a.doctor.doctorId=:doctorId")
    Page<Appointment> getAppointmentsByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);

}
