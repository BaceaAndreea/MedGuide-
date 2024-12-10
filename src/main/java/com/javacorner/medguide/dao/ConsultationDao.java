package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsultationDao extends JpaRepository<Consultation, Long> {

    @Query(value = "select c from Consultation as c where c.appointment.patient.patientId =: patientId")
    List<Consultation>findConsultationsByPatientId(@Param("patientId") Long patientId);

    @Query(value = "select c from Consultation as c where c.appointment.doctor.doctorId =: doctorId")
    List<Consultation>findConsultationsByDoctorId(@Param("doctorId") Long doctorId);

}
