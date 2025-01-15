package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;

public interface ConsultationService {
    Consultation loadConsultationById(Long consultationId);

    ConsultationDTO createConsultation(ConsultationDTO consultationDTO);

    Consultation updateConsultation(ConsultationDTO consultationDTO);

    void deleteConsultationById(Long consultationId);


}
