package com.javacorner.medguide.web;

import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.service.ConsultationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@CrossOrigin("*")
public class ConsultationRestController {

    private ConsultationService consultationService;

    public ConsultationRestController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor')")
    public List<ConsultationDTO> listAllConsultations() {
        return consultationService.fetchAllConsultations();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor')")
    public ConsultationDTO saveConsultation(@RequestBody ConsultationDTO consultationDTO) {
        return consultationService.createConsultation(consultationDTO);
    }

    @DeleteMapping("/consultationId")
    @PreAuthorize("hasAuthority('Admin')")
    public void deleteConsultation (@PathVariable Long consultationId) {
        consultationService.deleteConsultationById(consultationId);
    }

    @PutMapping("/appointmentId")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public ConsultationDTO updateConsultation(@RequestBody ConsultationDTO consultationDTO, @PathVariable Long consultationId) {
        consultationDTO.setConsultationId(consultationId);
        return consultationService.createConsultation(consultationDTO);
    }


}
