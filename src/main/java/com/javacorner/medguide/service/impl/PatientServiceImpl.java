package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.AppointmentDao;
import com.javacorner.medguide.dao.ConsultationDao;
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

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private PatientDao patientDao;
    private PatientMapper patientMapper;
    private UserService userService;
    private ConsultationDao consultationDao;
    private AppointmentDao appointmentDao;

    public PatientServiceImpl(PatientDao patientDao, PatientMapper patientMapper, UserService userService, ConsultationDao consultationDao, AppointmentDao appointmentDao) {
        this.patientDao = patientDao;
        this.patientMapper = patientMapper;
        this.userService = userService;
        this.consultationDao = consultationDao;
        this.appointmentDao = appointmentDao;
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
        Patient loadedPatient = loadPatientById(patientDTO.getPatientId());

        loadedPatient.setFirstName(patientDTO.getFirstName());
        loadedPatient.setLastName(patientDTO.getLastName());

        loadedPatient.getMedicalHistory().clear(); // Ștergem valorile vechi
        loadedPatient.getMedicalHistory().addAll(patientDTO.getMedicalHistory()); // Adăugăm noile valori


        loadedPatient.getAllergies().clear(); // Ștergem valorile vechi
        loadedPatient.getAllergies().addAll(patientDTO.getAllergies()); // Adăugăm noile valori

        Patient updatedPatient = patientDao.save(loadedPatient);

        return patientMapper.fromPatient(updatedPatient);
    }


    @Override
    public List<PatientDTO> fetchPatients() {
        return patientDao.findAll().stream().map(patient -> patientMapper.fromPatient(patient)).collect(Collectors.toList());
    }

    //we did an iteration over the appointments of each patient's, and over each of the iterations, we deleted the patient from the appointment
    //example: if we need to delete a patient, we must delete the subscription of that patient from all the appointments that they're subscribed to
    @Override
    @Transactional
    public void removePatient(Long patientId) {
        Patient patient = loadPatientById(patientId);

        // Șterge toate programările pacientului (Consultation se șterge automat)
        // Consultation se șterge automat din cauza cascadei
        appointmentDao.deleteAll(new ArrayList<>(patient.getAppointments()));

        // Șterge pacientul
        patientDao.deleteById(patientId);
    }

}
