package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Hospital;
import com.javacorner.medguide.dto.HospitalDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class HospitalMappper {
    public HospitalDTO fromHospital(Hospital hospital) {
        HospitalDTO hospitalDTO = new HospitalDTO();
        BeanUtils.copyProperties(hospital, hospitalDTO);
        return hospitalDTO;
    }

    public Hospital fromHospitalDTO(HospitalDTO hospitalDTO) {
        Hospital hospital = new Hospital();
        BeanUtils.copyProperties(hospitalDTO, hospital);
        return hospital;
    }
}
