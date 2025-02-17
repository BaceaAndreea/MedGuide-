package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.dto.HospitalDTO;
import com.javacorner.medguide.dto.SpecializationDTO;
import com.javacorner.medguide.dto.UserDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class DoctorMapper {

    public DoctorDTO fromDoctor(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setDoctorId(doctor.getDoctorId());
        dto.setFirstName(doctor.getFirstName());
        dto.setLastName(doctor.getLastName());
        dto.setBirthDate(doctor.getBirthDate());

        // Adaugă datele despre spital
        if (doctor.getHospital() != null) {
            HospitalDTO hospitalDTO = new HospitalDTO();
            hospitalDTO.setHospitalId(doctor.getHospital().getHospitalId());
            hospitalDTO.setName(doctor.getHospital().getName());
            hospitalDTO.setAddress(doctor.getHospital().getAddress());
            hospitalDTO.setCity(doctor.getHospital().getCity());
            dto.setHospital(hospitalDTO);
        }

        // Adaugă datele despre specializare
        if (doctor.getSpecialization() != null) {
            SpecializationDTO specializationDTO = new SpecializationDTO();
            specializationDTO.setSpecializationId(doctor.getSpecialization().getSpecializationId());
            specializationDTO.setDescription(doctor.getSpecialization().getDescription());
            dto.setSpecialization(specializationDTO);
        }

        if (doctor.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setEmail(doctor.getUser().getEmail());
            userDTO.setPassword(doctor.getUser().getPassword());
            dto.setUser(userDTO);
        }

        return dto;
    }




    //use this for example when we post from the front end application
    public Doctor fromDoctorDTO(DoctorDTO doctorDTO) {
        Doctor doctor = new Doctor();
        BeanUtils.copyProperties(doctorDTO, doctor);
        return doctor;
    }
}
