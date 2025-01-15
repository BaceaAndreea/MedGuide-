package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.PatientDao;
import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.domain.Patient;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.PatientDTO;
import com.javacorner.medguide.mapper.PatientMapper;
import com.javacorner.medguide.service.PatientService;
import com.javacorner.medguide.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private PatientDao patientDao;
    private PatientMapper patientMapper;
    private UserService userService;

    public PatientServiceImpl(PatientDao patientDao, PatientMapper patientMapper, UserService userService) {
        this.patientDao = patientDao;
        this.patientMapper = patientMapper;
        this.userService = userService;
    }

    @Override
    public Patient loadPatientById(Long patientId) {
        return patientDao.findById(patientId).orElseThrow(() -> new EntityNotFoundException("Patient with ID " + patientId + " not found"));
    }

    @Override
    public Page<PatientDTO> loadPatientsByName(String name, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Patient> patientPage = patientDao.findPatientsByByName(name, pageRequest);
        return new PageImpl<>(patientPage.getContent().stream().map(patient -> patientMapper.fromPatient(patient)).collect(Collectors.toList()), pageRequest, patientPage.getTotalElements());
    }

    @Override
    public PatientDTO loadPatientByEmail(String email) {
        return patientMapper.fromPatient(patientDao.findPatientByEmail(email));
    }

    @Override
    public PatientDTO createPatient(PatientDTO patientDTO) {
        User user = userService.createUser(patientDTO.getUser().getEmail(), patientDTO.getUser().getPassword());
        userService.assignRoleToUser(user.getEmail(), "Patient");
        Patient patient =  patientMapper.fromPatientDTO(patientDTO);
        patient.setUser(user);
        Patient savedPatient = patientDao.save(patient);
        return patientMapper.fromPatient(savedPatient);

    }

    @Override
    public PatientDTO updatePatient(PatientDTO patientDTO) {
        Patient lodadedPatient = loadPatientById(patientDTO.getPatientId());
        Patient patient = patientMapper.fromPatientDTO(patientDTO);
        patient.setUser(lodadedPatient.getUser());
        patient.setAppointments(lodadedPatient.getAppointments());
        Patient updatedPatient = patientDao.save(patient);
        return patientMapper.fromPatient(updatedPatient);
    }

    //we did an iteration over the appointments of each patient's, and over each of the iterations, we deleted the patient from the appointment
    //example: if we need to delete a patient, we must delete the subscription of that patient from all the appointments that they're subscribed to
    @Override
    public void removePatient(Long patientId) {
        Patient patient = loadPatientById(patientId);
        Iterator<Appointment> appointmentIterator = patient.getAppointments().iterator();
        if(appointmentIterator.hasNext()) {
            Appointment appointment = appointmentIterator.next();
            appointment.removePatientFromAppointment(patient);
        }
        patientDao.deleteById(patientId);
    }
}
