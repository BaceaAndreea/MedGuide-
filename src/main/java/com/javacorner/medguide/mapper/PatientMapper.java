package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Patient;
import com.javacorner.medguide.dto.PatientDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class PatientMapper {

    public PatientDTO fromPatient(Patient patient) {
        PatientDTO patientDTO = new PatientDTO();
        BeanUtils.copyProperties(patient, patientDTO);
        return patientDTO;
    }

    public Patient fromPatientDTO(PatientDTO patientDTO) {
        Patient patient = new Patient();
        BeanUtils.copyProperties(patientDTO, patient);
        return patient;

    }
}
