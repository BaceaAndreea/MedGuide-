package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;
import org.springframework.stereotype.Service;

@Service
public class ConsultationMapper {

    public ConsultationDTO fromConsultation(Consultation consultation) {
        ConsultationDTO consultationDTO = new ConsultationDTO();
        consultationDTO.setConsultationId(consultation.getConsultationId());
        consultationDTO.setDiagnosis(consultation.getDiagnosis());
        consultationDTO.setSymptoms(consultation.getSymptoms());
        consultationDTO.setRecommendations(consultation.getRecommendations());
        consultationDTO.setPrescriptions(consultation.getPrescriptions());
        consultationDTO.setRating(consultation.getRating());
        consultationDTO.setReviewComment(consultation.getReviewComment());
        consultationDTO.setReviewDate(consultation.getReviewDate());


        if (consultation.getAppointment() != null) {
            consultationDTO.setAppointmentId(consultation.getAppointment().getAppointmentId());
            consultationDTO.setAppointmentDate(consultation.getAppointment().getAppointmentDate().toString());

            if (consultation.getAppointment().getPatient() != null) {
                consultationDTO.setPatientId(consultation.getAppointment().getPatient().getPatientId());
            }

            if (consultation.getAppointment().getDoctor() != null) {
                consultationDTO.setDoctorId(consultation.getAppointment().getDoctor().getDoctorId());
                consultationDTO.setDoctorFirstName(consultation.getAppointment().getDoctor().getFirstName());
                consultationDTO.setDoctorLastName(consultation.getAppointment().getDoctor().getLastName());

                if (consultation.getAppointment().getDoctor().getHospital() != null) {
                    consultationDTO.setHospitalName(consultation.getAppointment().getDoctor().getHospital().getName());
                    consultationDTO.setHospitalAddress(consultation.getAppointment().getDoctor().getHospital().getAddress());
                }
            }
            // Adăugăm informații despre pacient
            if (consultation.getAppointment().getPatient() != null) {
                consultationDTO.setPatientId(consultation.getAppointment().getPatient().getPatientId());
                consultationDTO.setPatientFirstName(consultation.getAppointment().getPatient().getFirstName());
                consultationDTO.setPatientLastName(consultation.getAppointment().getPatient().getLastName());
            }
        }

        return consultationDTO;
    }

    public Consultation fromConsultationDTO(ConsultationDTO consultationDTO) {
        Consultation consultation = new Consultation();
        consultation.setConsultationId(consultationDTO.getConsultationId());
        consultation.setDiagnosis(consultationDTO.getDiagnosis());
        consultation.setSymptoms(consultationDTO.getSymptoms());
        consultation.setPrescriptions(consultationDTO.getPrescriptions());
        consultation.setRecommendations(consultationDTO.getRecommendations());
        consultation.setRating(consultationDTO.getRating());
        consultation.setReviewComment(consultationDTO.getReviewComment());
        consultation.setReviewDate(consultationDTO.getReviewDate());
        // Appointment va fi setat separat în service
        return consultation;
    }
}
