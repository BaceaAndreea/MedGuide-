package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.Consultation;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.mapper.ConsultationMapper;
import com.javacorner.medguide.service.ConsultationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@CrossOrigin("*")
public class ConsultationRestController {

    private ConsultationService consultationService;
    private ConsultationMapper consultationMapper;

    public ConsultationRestController(ConsultationService consultationService, ConsultationMapper consultationMapper) {
        this.consultationService = consultationService;
        this.consultationMapper = consultationMapper;
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
    @GetMapping("/{consultationId}")
    @PreAuthorize("hasAnyAuthority('Patient','Doctor','Admin')")
    public ResponseEntity<ConsultationDTO> getById(@PathVariable Long consultationId) {
        Consultation consultation = consultationService.loadConsultationById(consultationId);
        ConsultationDTO dto = consultationMapper.fromConsultation(consultation);
        return ResponseEntity.ok(dto);
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

    @PostMapping("/{consultationId}/rating")
    @PreAuthorize("hasAuthority('Patient')")
    public ResponseEntity<ConsultationDTO> addRating(
            @PathVariable Long consultationId,
            @RequestBody ConsultationDTO ratingDTO) {

        Consultation consultation = consultationService.loadConsultationById(consultationId);

        if (consultation.isReviewed()) {
            return ResponseEntity.badRequest().body(null);
        }

        consultation.addReview(ratingDTO.getRating(), ratingDTO.getReviewComment());
        Consultation updatedConsultation = consultationService.updateConsultationEntity(consultation);
        return ResponseEntity.ok(consultationMapper.fromConsultation(updatedConsultation));
    }

    @GetMapping("/{consultationId}/has-rating")
    public ResponseEntity<Boolean> hasRating(@PathVariable Long consultationId) {
        Consultation consultation = consultationService.loadConsultationById(consultationId);
        return ResponseEntity.ok(consultation.isReviewed());
    }


}
