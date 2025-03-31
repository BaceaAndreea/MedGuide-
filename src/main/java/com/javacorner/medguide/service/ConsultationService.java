package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ConsultationService {
    Consultation loadConsultationById(Long consultationId);

    ConsultationDTO createConsultation(ConsultationDTO consultationDTO);

    Consultation updateConsultation(ConsultationDTO consultationDTO);

    List<ConsultationDTO> fetchAllConsultations();

    void deleteConsultationById(Long consultationId);

    Page<ConsultationDTO> findConsultationsByPatientId(Long patientId, int page, int size);

    Page<ConsultationDTO> findConsultationsByDoctorId(Long doctorId, int page, int size);

}
