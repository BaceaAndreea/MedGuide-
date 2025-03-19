package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.dto.PatientDTO;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.ConsultationService;
import com.javacorner.medguide.service.PatientService;
import com.javacorner.medguide.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin("*")
public class PatientRestController {
    private PatientService patientService;
    private UserService userService;
    private AppointmentService appointmentService;
    private ConsultationService consultationService;

    public PatientRestController(PatientService patientService, UserService userService, AppointmentService appointmentService, ConsultationService consultationService) {
        this.patientService = patientService;
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.consultationService = consultationService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('Admin')")
    public Page<PatientDTO> searchPatients(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                           @RequestParam(name = "page", defaultValue = "0") int page,
                                           @RequestParam(name = "size", defaultValue = "5") int size){
        return patientService.loadPatientsByName(keyword, page, size);
    }

    @Transactional
    @DeleteMapping("/{patientId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void deletePatient(@PathVariable Long patientId){
        patientService.removePatient(patientId);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Doctor', 'Patient')")
    public List<PatientDTO> findAllPatients(){
        return patientService.fetchPatients();
    }

    @PostMapping
    @PreAuthorize("permitAll()")
    public PatientDTO savePatient(@RequestBody PatientDTO patientDTO){
        User user = userService.loadUserByEmail(patientDTO.getUser().getEmail());
        if(user != null) throw new RuntimeException("User already exists");
        return patientService.createPatient(patientDTO);
    }

    @PutMapping("/{patientId}")
    @PreAuthorize("hasAuthority('Patient')")
    public PatientDTO updatePatient(@RequestBody PatientDTO patientDTO, @PathVariable Long patientId){
        patientDTO.setPatientId(patientId);
        return patientService.updatePatient(patientDTO);
    }

    @GetMapping("/{patientId}/appointments")
    @PreAuthorize("hasAnyAuthority('Admin', 'Patient')")
    public Page<AppointmentDTO> appointmentsByPatientId(@PathVariable Long patientId,
                                                        @RequestParam(name="page", defaultValue = "0") int page,
                                                        @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchAppointmentsForPatient(patientId, page, size);
    }


    @GetMapping("/{patientId}/other-appointments")
    @PreAuthorize("hasAuthority('Patient')")
    public Page<AppointmentDTO> noAppointmentByPatientId(@PathVariable Long patientId,
                                                        @RequestParam(name="page", defaultValue = "0") int page,
                                                        @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchNoAppointmentsForPatient(patientId, page, size);
    }

    @GetMapping("/find")
    @PreAuthorize("hasAuthority('Patient')")
    public PatientDTO loadPatientByEmail(@RequestParam(name = "email", defaultValue = "") String email){
        return patientService.loadPatientByEmail(email);
    }

    @GetMapping("/{patientId}/consultations")
    @PreAuthorize("hasAnyAuthority('Admin', 'Patient')")
    public Page<ConsultationDTO> findConsultationsByPatientId(@PathVariable Long patientId,
                                                             @RequestParam(name="page", defaultValue = "0") int page,
                                                             @RequestParam(name="size", defaultValue = "5") int size){
        return consultationService.findConsultationsByPatientId(patientId, page, size);
    }


}
