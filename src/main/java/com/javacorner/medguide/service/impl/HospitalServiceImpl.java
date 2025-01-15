package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.HospitalDao;
import com.javacorner.medguide.domain.Hospital;
import com.javacorner.medguide.dto.HospitalDTO;
import com.javacorner.medguide.mapper.HospitalMappper;
import com.javacorner.medguide.service.HospitalService;
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
public class HospitalServiceImpl implements HospitalService {
    private HospitalDao hospitalDao;
    private HospitalMappper hospitalMappper;

    public HospitalServiceImpl(HospitalDao hospitalDao, HospitalMappper hospitalMappper) {
        this.hospitalDao = hospitalDao;
        this.hospitalMappper = hospitalMappper;
    }

    @Override
    public Hospital loadHospitalById(Long hospitalId) {
        return hospitalDao.findById(hospitalId)
                .orElseThrow(() -> new EntityNotFoundException("Hospital with ID " + hospitalId + " not found"));
    }

    @Override
    public Page<HospitalDTO> findHospitalByName(String hospitalName, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Hospital> hospitalPage =  hospitalDao.findHospitalByName(hospitalName,pageRequest);
        return new PageImpl<>(hospitalPage.getContent().stream().map(hospital -> hospitalMappper.fromHospital(hospital)).collect(Collectors.toList()), pageRequest, hospitalPage.getTotalElements());
    }

    @Override
    public Page<HospitalDTO> findHospitalByCity(String city, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Hospital> hospitalPage = hospitalDao.findHospitalByCity(city,pageRequest);
        return new PageImpl<>(hospitalPage.getContent().stream().map(hospital -> hospitalMappper.fromHospital(hospital)).collect(Collectors.toList()), pageRequest, hospitalPage.getTotalElements());
    }

    @Override
    public Page<HospitalDTO> findHospitalByAddress(String address, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Hospital> hospitalPage = hospitalDao.findHospitalByAddress(address,pageRequest);
        return new PageImpl<>(hospitalPage.getContent().stream().map(hospital -> hospitalMappper.fromHospital(hospital)).collect(Collectors.toList()), pageRequest, hospitalPage.getTotalElements());
    }

    @Override
    public HospitalDTO createHospital(HospitalDTO hospitalDTO) {
        Hospital hospital = hospitalMappper.fromHospitalDTO(hospitalDTO);
        Hospital savedHospital = hospitalDao.save(hospital);
        return hospitalMappper.fromHospital(savedHospital);
    }

    @Override
    public HospitalDTO updateHospital(HospitalDTO hospitalDTO) {
        Hospital existingHospital = hospitalDao.findById(hospitalDTO.getHospitalId())
                .orElseThrow(() -> new EntityNotFoundException("Hospital with ID " + hospitalDTO.getHospitalId() + " not found"));

        existingHospital.setName(hospitalDTO.getName());
        existingHospital.setAddress(hospitalDTO.getAddress());
        existingHospital.setCity(hospitalDTO.getCity());

        Hospital updatedHospital = hospitalDao.save(existingHospital);
        return hospitalMappper.fromHospital(updatedHospital);
    }

    @Override
    public List<HospitalDTO> fetchHospitals() {
        return hospitalDao.findAll().stream().map(hospital -> hospitalMappper.fromHospital(hospital)).collect(Collectors.toList());
    }

    @Override
    public void removeHospital(Long hospitalId) {
        Hospital hospital = hospitalDao.findById(hospitalId)
                .orElseThrow(() -> new EntityNotFoundException("Hospital with ID " + hospitalId + " not found"));
        hospitalDao.delete(hospital);
    }
}
