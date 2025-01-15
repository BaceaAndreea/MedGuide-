package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Patient;
import com.javacorner.medguide.dto.PatientDTO;
import org.springframework.data.domain.Page;

public interface PatientService {

    Patient loadPatientById(Long patientId);

    Page<PatientDTO> loadPatientsByName(String name, int page, int size);

    PatientDTO loadPatientByEmail(String email);

    PatientDTO createPatient(PatientDTO patientDTO);

    PatientDTO updatePatient(PatientDTO patientDTO);

    void removePatient(Long patientId);
}
