package com.javacorner.medguide.web;


import com.javacorner.medguide.dto.HospitalDTO;
import com.javacorner.medguide.service.HospitalService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hospitals")
@CrossOrigin("*")
public class HospitalRestController {
    private HospitalService hospitalService;

    public HospitalRestController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/search/name")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public Page<HospitalDTO> searchHospitalsByName(@RequestParam(name = "name", defaultValue = "") String name,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "5") int size) {
        return hospitalService.findHospitalByName(name, page, size);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public List<HospitalDTO> findAllHospitals() {
        return hospitalService.fetchHospitals();
    }

    @GetMapping("/search/city")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public Page<HospitalDTO> searchHospitalsByCity(@RequestParam(name = "city", defaultValue = "") String city,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "5") int size) {
        return hospitalService.findHospitalByCity(city, page, size);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public HospitalDTO createHospital(@RequestBody HospitalDTO hospitalDTO) {
        return hospitalService.createHospital(hospitalDTO);
    }

    @PutMapping("/{hospitalId}")
    @PreAuthorize("hasAuthority('Admin')")
    public HospitalDTO updateHospital(@PathVariable Long hospitalId,
                                      @RequestBody HospitalDTO hospitalDTO) {
        hospitalDTO.setHospitalId(hospitalId);
        return hospitalService.updateHospital(hospitalDTO);
    }

    @DeleteMapping("/{hospitalId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void deleteHospital(@PathVariable Long hospitalId) {
        hospitalService.removeHospital(hospitalId);
    }

    // Endpoint nou pentru încărcarea imaginilor spitalelor
    @PostMapping("/{hospitalId}/image")
    @PreAuthorize("hasAuthority('Admin')")
    public ResponseEntity<Map<String, String>> uploadHospitalImage(
            @PathVariable Long hospitalId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = hospitalService.saveHospitalImage(hospitalId, file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    // Endpoint nou pentru spitalele recomandate pentru pagina Home
    @GetMapping("/featured")
    public ResponseEntity<List<HospitalDTO>> getFeaturedHospitals() {
        List<HospitalDTO> featuredHospitals = hospitalService.findFeaturedHospitals();
        return ResponseEntity.ok(featuredHospitals);
    }

}
