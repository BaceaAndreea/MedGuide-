package com.javacorner.medguide.web;

import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.service.ConsultationService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@CrossOrigin("*")
public class ConsultationrestController {

    private ConsultationService consultationService;

    public ConsultationrestController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @GetMapping("/all")
    public List<ConsultationDTO> listAllConsultations() {
        return consultationService.fetchAllConsultations();
    }

    @PostMapping
    public ConsultationDTO saveConsultation(@RequestBody ConsultationDTO consultationDTO) {
        return consultationService.createConsultation(consultationDTO);
    }

    @DeleteMapping("/consultationId")
    public void deleteConsultation (@PathVariable Long consultationId) {
        consultationService.deleteConsultationById(consultationId);
    }

    @PutMapping("/appointmentId")
    public ConsultationDTO updateConsultation(@RequestBody ConsultationDTO consultationDTO, @PathVariable Long consultationId) {
        consultationDTO.setConsultationId(consultationId);
        return consultationService.createConsultation(consultationDTO);
    }

}
