package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.SpecializationDao;
import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.SpecializationDTO;
import com.javacorner.medguide.mapper.SpecializationMapper;
import com.javacorner.medguide.service.SpecializationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecializationServiceImpl implements SpecializationService {
    private final SpecializationDao specializationDao;
    private final SpecializationMapper specializationMapper;

    public SpecializationServiceImpl(SpecializationDao specializationDao, SpecializationMapper specializationMapper) {
        this.specializationDao = specializationDao;
        this.specializationMapper = specializationMapper;
    }

    @Override
    public Specialization loadSpecializationById(Long specializationId) {
        return specializationDao.findById(specializationId)
                .orElseThrow(() -> new EntityNotFoundException("Specialization with ID " + specializationId + " not found"));
    }

    @Override
    public SpecializationDTO loadSpecializationByDescription(String description) {
        Specialization specialization = specializationDao.findByDescription(description);
        if (specialization == null) {
            throw new EntityNotFoundException("Specialization with description " + description + " not found");
        }
        return specializationMapper.fromSpecialization(specialization);
    }


    @Override
    public SpecializationDTO createSpecialization(SpecializationDTO specializationDTO) {
        Specialization specialization = specializationMapper.fromSpecializationDTO(specializationDTO);
        Specialization savedSpecialization = specializationDao.save(specialization);
        return specializationMapper.fromSpecialization(savedSpecialization);
    }

    @Override
    public Page<SpecializationDTO> findSpecializationByDesciption(String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Specialization> specializationPage = specializationDao.findSpecializationByDescription(keyword,pageRequest);
        return new PageImpl<>(specializationPage.getContent().stream().map(specialization -> specializationMapper.fromSpecialization(specialization)).collect(Collectors.toList()), pageRequest, specializationPage.getTotalElements());

    }

    @Override
    public Specialization updateSpecialization(SpecializationDTO specializationDTO) {
        Specialization existingSpecialization = specializationDao.findById(specializationDTO.getSpecializationId())
                .orElseThrow(() -> new EntityNotFoundException("Specialization with ID " + specializationDTO.getSpecializationId() + " not found"));

        existingSpecialization.setDescription(specializationDTO.getDescription());
        return specializationDao.save(existingSpecialization);
    }

    @Override
    public List<SpecializationDTO> fetchAllSpecializations() {
        return specializationDao.findAll().stream().map(specialization -> specializationMapper.fromSpecialization(specialization)).collect(Collectors.toList());
    }

    @Override
    public void deleteSpecializationById(Long specializationId) {
        Specialization specialization = specializationDao.findById(specializationId)
                .orElseThrow(() -> new EntityNotFoundException("Specialization with ID " + specializationId + " not found"));
        specializationDao.delete(specialization);
    }
}
