package com.javacorner.medguide.web;


import com.javacorner.medguide.dto.HospitalDTO;
import com.javacorner.medguide.service.HospitalService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
public class HospitalRestController {
    private HospitalService hospitalService;

    public HospitalRestController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/search/name")
    public Page<HospitalDTO> searchHospitalsByName(@RequestParam(name = "name", defaultValue = "") String name,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "5") int size) {
        return hospitalService.findHospitalByName(name, page, size);
    }

    @GetMapping
    public List<HospitalDTO> findAllHospitals() {
        return hospitalService.fetchHospitals();
    }

    @GetMapping("/search/city")
    public Page<HospitalDTO> searchHospitalsByCity(@RequestParam(name = "city", defaultValue = "") String city,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "5") int size) {
        return hospitalService.findHospitalByCity(city, page, size);
    }

    @PostMapping
    public HospitalDTO createHospital(@RequestBody HospitalDTO hospitalDTO) {
        return hospitalService.createHospital(hospitalDTO);
    }

    @PutMapping("/{hospitalId}")
    public HospitalDTO updateHospital(@PathVariable Long hospitalId,
                                      @RequestBody HospitalDTO hospitalDTO) {
        hospitalDTO.setHospitalId(hospitalId);
        return hospitalService.updateHospital(hospitalDTO);
    }

    @DeleteMapping("/{hospitalId}")
    public void deleteHospital(@PathVariable Long hospitalId) {
        hospitalService.removeHospital(hospitalId);
    }

}
