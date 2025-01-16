package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.ConsultationDTO;

import java.util.List;

public interface ConsultationService {
    Consultation loadConsultationById(Long consultationId);

    ConsultationDTO createConsultation(ConsultationDTO consultationDTO);

    Consultation updateConsultation(ConsultationDTO consultationDTO);

    List<ConsultationDTO> fetchAllConsultations();

    void deleteConsultationById(Long consultationId);


}
