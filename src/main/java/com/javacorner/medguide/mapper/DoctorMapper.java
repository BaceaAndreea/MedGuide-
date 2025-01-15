package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.dto.DoctorDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class DoctorMapper {

    //instead of sending the instructor entity to the front end application, we will use this method to send the dto instead of the entity
    public DoctorDTO fromDoctor(Doctor doctor) {
        DoctorDTO doctorDTO = new DoctorDTO();
        BeanUtils.copyProperties(doctor, doctorDTO); //copy all properties from source to the target
        return doctorDTO;
    }

    //use this for example when we post from the front end application
    public Doctor fromDoctorDTO(DoctorDTO doctorDTO) {
        Doctor doctor = new Doctor();
        BeanUtils.copyProperties(doctorDTO, doctor);
        return doctor;
    }
}
