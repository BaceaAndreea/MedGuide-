package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class ConsultationMapper {

    public ConsultationDTO fromConsultation(Consultation consultation) {
        ConsultationDTO consultationDTO = new ConsultationDTO();
        BeanUtils.copyProperties(consultation, consultationDTO);
        return consultationDTO;
    }

    public Consultation fromConsultationDTO(ConsultationDTO consultationDTO) {
        Consultation consultation = new Consultation();
        BeanUtils.copyProperties(consultationDTO, consultation);
        // Appointment must be set separately in the service layer based on appointmentId
        return consultation;
    }
}
