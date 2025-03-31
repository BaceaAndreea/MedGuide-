package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.AppointmentDao;
import com.javacorner.medguide.dao.ConsultationDao;
import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.mapper.ConsultationMapper;
import com.javacorner.medguide.service.ConsultationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultationServiceImpl implements ConsultationService {

    private ConsultationDao consultationDao;
    private ConsultationMapper consultationMapper;
    private AppointmentDao appointmentDao;


    public ConsultationServiceImpl(ConsultationDao consultationDao, ConsultationMapper consultationMapper, AppointmentDao appointmentDao) {
        this.consultationDao = consultationDao;
        this.consultationMapper = consultationMapper;
        this.appointmentDao = appointmentDao;
    }


    @Override
    public Consultation loadConsultationById(Long consultationId) {
        return consultationDao.findById(consultationId)
                .orElseThrow(() -> new EntityNotFoundException("Consultation with ID " + consultationId + " not found"));
    }

    @Override
    public ConsultationDTO createConsultation(ConsultationDTO consultationDTO) {
        // Găsește programarea asociată folosind ID-ul din DTO
        Appointment appointment = appointmentDao.findById(consultationDTO.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + consultationDTO.getAppointmentId()));
        Consultation consultation = consultationMapper.fromConsultationDTO(consultationDTO);
        consultation.setAppointment(appointment);
        Consultation savedConsultation = consultationDao.save(consultation);
        return consultationMapper.fromConsultation(savedConsultation);
    }

    @Override
    public Consultation updateConsultation(ConsultationDTO consultationDTO) {
        Consultation existingConsultation = consultationDao.findById(consultationDTO.getConsultationId()).orElseThrow(() -> new EntityNotFoundException("Consultation with ID " + consultationDTO.getConsultationId() + " not found"));

        existingConsultation.setDiagnosis(consultationDTO.getDiagnosis());
        Consultation updatedConsultation = consultationDao.save(existingConsultation);
        return updatedConsultation;
    }

    @Override
    public List<ConsultationDTO> fetchAllConsultations() {
        return consultationDao.findAll().stream().map(consultation -> consultationMapper.fromConsultation(consultation)).collect(Collectors.toList());
    }

    @Override
    public void deleteConsultationById(Long consultationId) {
        Consultation consultation = consultationDao.findById(consultationId)
                .orElseThrow(() -> new EntityNotFoundException("Consultation with ID " + consultationId + " not found"));
        consultationDao.delete(consultation);
    }

    @Override
    public Page<ConsultationDTO> findConsultationsByPatientId(Long patientId, int page, int size) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Consultation> patientConsultationsPage = consultationDao.findConsultationsByPatientId(patientId, pageRequest);
        return new PageImpl<>(
                patientConsultationsPage.getContent().stream()
                        .map(consultationMapper::fromConsultation)
                        .collect(Collectors.toList()),
                pageRequest,
                patientConsultationsPage.getTotalElements()
        );
    }

    @Override
    public Page<ConsultationDTO> findConsultationsByDoctorId(Long doctorId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Consultation> doctorConsultationsPage = consultationDao.findConsultationsByDoctorId(doctorId, pageRequest);
        return new PageImpl<>(
                doctorConsultationsPage.getContent().stream()
                        .map(consultationMapper::fromConsultation)
                        .collect(Collectors.toList()),
                pageRequest,
                doctorConsultationsPage.getTotalElements()
        );
    }



}
