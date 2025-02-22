package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;


public interface AppointmentDao extends JpaRepository<Appointment, Long> {

    Page<Appointment> findAppointmentsByStatusContains(String keyword, Pageable pageable);

    @Query(value = " select a from Appointment as a where a.patient.patientId=:patientId")
    Page<Appointment> getAppointmentsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(value = "SELECT * FROM appointments AS a WHERE NOT EXISTS (SELECT 1 FROM consultations AS c WHERE c.appointment_id = a.appointment_id) AND a.patient_id = :patientId", nativeQuery = true)
    Page<Appointment> getNoAppointmentsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(value = " select a from Appointment as a where a.doctor.doctorId=:doctorId")
    Page<Appointment> getAppointmentsByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);


    @Modifying
    @Query("DELETE FROM Appointment a WHERE a.doctor.doctorId = :doctorId")
    void deleteByDoctorId(@Param("doctorId") Long doctorId);

}
