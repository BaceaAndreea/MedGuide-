package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.SpecializationDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class SpecializationMapper {

    public SpecializationDTO fromSpecialization(Specialization specialization) {
        SpecializationDTO specializationDTO = new SpecializationDTO();
        BeanUtils.copyProperties(specialization, specializationDTO);
        return specializationDTO;
    }

    public Specialization fromSpecializationDTO(SpecializationDTO specializationDTO) {
        Specialization specialization = new Specialization();
        BeanUtils.copyProperties(specializationDTO, specialization);
        return specialization;
    }
}
