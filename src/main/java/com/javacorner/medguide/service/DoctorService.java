package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.dto.DoctorDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface DoctorService {
    Doctor loadDoctorById(Long doctorId);

    Page<DoctorDTO> findDoctorsByName(String name, int page, int size);

    DoctorDTO loadDoctorByEmail(String email);

    DoctorDTO createDoctor(DoctorDTO doctorDTO);

    DoctorDTO updateDoctor(DoctorDTO doctorDTO);

    List<DoctorDTO> fetchDoctors();

    void removeDoctor(Long doctorId);

    public List<DoctorDTO> findDoctorsBySpecialization(Long specializationId);

}
