package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface AppointmentDao extends JpaRepository<Appointment, Long> {

    Page<Appointment> findAppointmentsByAppointmentDateContains(Date appointmentDate, Pageable pageable);



    @Query(value = "SELECT * FROM appointments AS a WHERE a.appointment_id IN (SELECT c.appointment_id FROM consultations AS c) AND a.patient_id = :patientId", nativeQuery = true)
    List<Appointment>getAppointmentsByPatientId(@Param("patientId") Long patientId);

}
