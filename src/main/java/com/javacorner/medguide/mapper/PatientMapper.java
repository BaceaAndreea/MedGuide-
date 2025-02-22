package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Patient;
import com.javacorner.medguide.dto.PatientDTO;
import com.javacorner.medguide.dto.UserDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class PatientMapper {

    public PatientDTO fromPatient(Patient patient) {
        PatientDTO patientDTO = new PatientDTO();
        BeanUtils.copyProperties(patient, patientDTO);

        if (patient.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setEmail(patient.getUser().getEmail());
            userDTO.setPassword(patient.getUser().getPassword());
            patientDTO.setUser(userDTO);  // Setăm user-ul corect
        }

        return patientDTO; // Mutăm return-ul la final
    }


    public Patient fromPatientDTO(PatientDTO patientDTO) {
        Patient patient = new Patient();
        BeanUtils.copyProperties(patientDTO, patient);
        return patient;

    }
}
