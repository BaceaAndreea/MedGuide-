package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.ConsultationService;
import com.javacorner.medguide.service.DoctorService;
import com.javacorner.medguide.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doctors")
@CrossOrigin("*")
public class DoctorRestController {
    private DoctorService doctorService;
    private UserService userService;
    private AppointmentService appointmentService;
    private ConsultationService consultationService;

    public DoctorRestController(DoctorService doctorService, UserService userService, AppointmentService appointmentService, ConsultationService consultationService) {
        this.doctorService = doctorService;
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.consultationService = consultationService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('Admin')")
    public Page<DoctorDTO> searchDoctor(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                        @RequestParam(name = "page", defaultValue = "0") int page,
                                        @RequestParam(name = "size", defaultValue = "5") int size){
        return doctorService.findDoctorsByName(keyword, page, size);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public List<DoctorDTO> findAllDoctors(){
        return doctorService.fetchDoctors();
    }

    @DeleteMapping("/{doctorId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void deleteDoctor(@PathVariable Long doctorId){
        doctorService.removeDoctor(doctorId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('Admin')")
    public DoctorDTO saveDoctor(@RequestBody DoctorDTO doctorDTO){
        User user = userService.loadUserByEmail(doctorDTO.getUser().getEmail());
        if (user != null) throw new RuntimeException("Email already in use");
        return doctorService.createDoctor(doctorDTO);
    }

    @PutMapping("/{doctorId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor')")
    public DoctorDTO updateDoctor(@RequestBody DoctorDTO doctorDTO, @PathVariable Long doctorId){
        doctorDTO.setDoctorId(doctorId);

        return doctorService.updateDoctor(doctorDTO);
    }

    //this API will enable us to load, or to fetch a specific doctor using the doctorId
    @GetMapping("/{doctorId}/appointments")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor')")
    public Page<AppointmentDTO> appointmentsByDoctorId(@PathVariable Long doctorId,
                                                       @RequestParam(name="page", defaultValue = "0") int page,
                                                       @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchAppointmentsForDoctor(doctorId, page, size);
    }

    @GetMapping("/find")
    @PreAuthorize("hasAuthority('Doctor')")
    public DoctorDTO findDoctorByEmail(@RequestParam(name = "email", defaultValue = "") String email){
        return doctorService.loadDoctorByEmail(email);
    }

    @GetMapping("/{doctorId}/consultations")
    @PreAuthorize("hasAnyAuthority('Doctor', 'Admin', 'Patient')")
    public Page<ConsultationDTO> findConsultationsByDoctorId(@PathVariable Long doctorId,
                                                        @RequestParam(name="page", defaultValue = "0") int page,
                                                        @RequestParam(name="size", defaultValue = "5") int size){
        return consultationService.findConsultationsByDoctorId(doctorId, page, size);
    }

    @GetMapping("/specialization/{specializationId}")
    public List<DoctorDTO> findDoctorsBySpecialization(@PathVariable Long specializationId) {
        return doctorService.findDoctorsBySpecialization(specializationId);
    }

    @PostMapping("/{doctorId}/image")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor') ")
    public ResponseEntity<Map<String, String>> uploadDoctorImage(
            @PathVariable Long doctorId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = doctorService.saveDoctorImage(doctorId, file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    // Endpoint nou pentru doctorii recomandați pentru pagina Home
    @GetMapping("/featured")
    public ResponseEntity<List<DoctorDTO>> getFeaturedDoctors() {
        List<DoctorDTO> featuredDoctors = doctorService.findFeaturedDoctors();
        return ResponseEntity.ok(featuredDoctors);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/{doctorId}/ratings/summary")
    public ResponseEntity<Map<String, Object>> getDoctorRatingSummary(@PathVariable Long doctorId) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRating", doctorService.getDoctorAverageRating(doctorId));
        summary.put("totalReviews", doctorService.getDoctorTotalReviews(doctorId));

        Map<Integer, Integer> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 10; i++) {
            ratingCounts.put(i, doctorService.getDoctorRatingCount(doctorId, i));
        }
        summary.put("ratingCounts", ratingCounts);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{doctorId}/ratings")
    public ResponseEntity<List<ConsultationDTO>> getDoctorRatings(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorRatings(doctorId));
    }



}
