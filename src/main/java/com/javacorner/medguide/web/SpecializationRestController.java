package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.SpecializationDTO;
import com.javacorner.medguide.mapper.SpecializationMapper;
import com.javacorner.medguide.service.SpecializationService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specializations")
@CrossOrigin("*")
public class SpecializationRestController {

    private SpecializationService specializationService;
    private SpecializationMapper specializationMapper;

    public SpecializationRestController(SpecializationService specializationService, SpecializationMapper specializationMapper) {
        this.specializationService = specializationService;
        this.specializationMapper = specializationMapper;
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public Page<SpecializationDTO> searchSpecializations(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                                         @RequestParam(name = "page", defaultValue = "0") int page,
                                                         @RequestParam(name = "size", defaultValue = "5") int size) {
        return specializationService.findSpecializationByDesciption(keyword, page, size);
    }

    @GetMapping("/all")
    public List<SpecializationDTO> findAllSpecializations() {
        return specializationService.fetchAllSpecializations();
    }

    @GetMapping("/{specializationId}")
    @PreAuthorize("hasAuthority('Admin')")
    public Specialization getSpecializationById(@PathVariable Long specializationId) {
        return specializationService.loadSpecializationById(specializationId);
    }

    // Create a new specialization
    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public SpecializationDTO createSpecialization(@RequestBody SpecializationDTO specializationDTO) {
        return specializationService.createSpecialization(specializationDTO);
    }

    // Delete a specialization by ID
    @DeleteMapping("/{specializationId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void deleteSpecialization(@PathVariable Long specializationId) {
        specializationService.deleteSpecializationById(specializationId);
    }

    @PutMapping("/{specializationId}")
    @PreAuthorize("hasAuthority('Admin')")
    public SpecializationDTO updateSpecialization(@PathVariable Long specializationId,
                                                  @RequestBody SpecializationDTO specializationDTO) {
        specializationDTO.setSpecializationId(specializationId);
        Specialization updatedSpecialization = specializationService.updateSpecialization(specializationDTO);
        return specializationMapper.fromSpecialization(updatedSpecialization);
    }


}

