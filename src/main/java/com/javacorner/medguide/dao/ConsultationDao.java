package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsultationDao extends JpaRepository<Consultation, Long> {

    @Query(value = "select c from Consultation as c where c.appointment.patient.patientId =: patientId")
    Page<Consultation> findConsultationsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(value = "select c from Consultation as c where c.appointment.doctor.doctorId =: doctorId")
    Page<Consultation> findConsultationsByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);

    Consultation findConsultationByDiagnosis(String diagnosis);

}
