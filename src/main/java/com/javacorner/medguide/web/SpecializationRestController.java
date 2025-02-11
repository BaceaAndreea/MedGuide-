package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.SpecializationDTO;
import com.javacorner.medguide.mapper.SpecializationMapper;
import com.javacorner.medguide.service.SpecializationService;
import org.springframework.data.domain.Page;
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
    public Page<SpecializationDTO> searchSpecializations(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                                         @RequestParam(name = "page", defaultValue = "0") int page,
                                                         @RequestParam(name = "size", defaultValue = "5") int size) {
        return specializationService.findSpecializationByDesciption(keyword, page, size);
    }

    @GetMapping
    public List<SpecializationDTO> findAllSpecializations() {
        return specializationService.fetchAllSpecializations();
    }

    @GetMapping("/{specializationId}")
    public Specialization getSpecializationById(@PathVariable Long specializationId) {
        return specializationService.loadSpecializationById(specializationId);
    }

    // Create a new specialization
    @PostMapping
    public SpecializationDTO createSpecialization(@RequestBody SpecializationDTO specializationDTO) {
        return specializationService.createSpecialization(specializationDTO);
    }

    // Delete a specialization by ID
    @DeleteMapping("/{specializationId}")
    public void deleteSpecialization(@PathVariable Long specializationId) {
        specializationService.deleteSpecializationById(specializationId);
    }

    @PutMapping("/{specializationId}")
    public SpecializationDTO updateSpecialization(@PathVariable Long specializationId,
                                                  @RequestBody SpecializationDTO specializationDTO) {
        specializationDTO.setSpecializationId(specializationId);
        Specialization updatedSpecialization = specializationService.updateSpecialization(specializationDTO);
        return specializationMapper.fromSpecialization(updatedSpecialization);
    }


}

