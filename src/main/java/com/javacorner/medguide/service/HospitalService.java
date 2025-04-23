package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Hospital;
import com.javacorner.medguide.dto.HospitalDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface HospitalService {
    Hospital loadHospitalById(Long hospitalId);

    Page<HospitalDTO> findHospitalByName(String hospitalName, int page, int size);

    Page<HospitalDTO> findHospitalByCity(String city, int page, int size);

    Page<HospitalDTO> findHospitalByAddress(String address, int page, int size);

    HospitalDTO createHospital(HospitalDTO hospitalDTO);

    HospitalDTO updateHospital(HospitalDTO hospitalDTO);

    List<HospitalDTO> fetchHospitals();

    void removeHospital(Long hospitalId);

    String saveHospitalImage(Long hospitalId, MultipartFile file) throws IOException;

    List<HospitalDTO> findFeaturedHospitals();



}
