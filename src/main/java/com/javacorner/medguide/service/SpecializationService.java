package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.SpecializationDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SpecializationService {
    Specialization loadSpecializationById(Long specializationId);

    SpecializationDTO loadSpecializationByDescription(String description);

    SpecializationDTO createSpecialization(SpecializationDTO specializationDTO);

    Page<SpecializationDTO> findSpecializationByDesciption (String keyword, int page, int size);

    Specialization updateSpecialization(SpecializationDTO specializationDTO);

    List<SpecializationDTO> fetchAllSpecializations();

    void deleteSpecializationById(Long specializationId);

}
