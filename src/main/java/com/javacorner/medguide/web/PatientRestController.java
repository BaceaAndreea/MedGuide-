package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.dto.PatientDTO;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.PatientService;
import com.javacorner.medguide.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin("*")
public class PatientRestController {
    private PatientService patientService;
    private UserService userService;
    private AppointmentService appointmentService;

    public PatientRestController(PatientService patientService, UserService userService, AppointmentService appointmentService) {
        this.patientService = patientService;
        this.userService = userService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public Page<PatientDTO> searchPatients(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                           @RequestParam(name = "page", defaultValue = "0") int page,
                                           @RequestParam(name = "size", defaultValue = "5") int size){
        return patientService.loadPatientsByName(keyword, page, size);
    }

    @DeleteMapping("/{patientId}")
    public void deletePatient(@PathVariable Long patientId){
        patientService.removePatient(patientId);
    }

    @GetMapping("/all")
    public List<PatientDTO> findAllPatients(){
        return patientService.fetchPatients();
    }

    @PostMapping
    public PatientDTO savePatient(@RequestBody PatientDTO patientDTO){
        User user = userService.loadUserByEmail(patientDTO.getUser().getEmail());
        if(user != null) throw new RuntimeException("User already exists");
        return patientService.createPatient(patientDTO);
    }

    @PutMapping("/{patientId}")
    public PatientDTO updatePatient(@RequestBody PatientDTO patientDTO, @PathVariable Long patientId){
        patientDTO.setPatientId(patientId);
        return patientService.updatePatient(patientDTO);
    }

    @GetMapping("/{patientId}/appointments")
    public Page<AppointmentDTO> appointmentsByPatientId(@PathVariable Long patientId,
                                                        @RequestParam(name="page", defaultValue = "0") int page,
                                                        @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchAppointmentsForPatient(patientId, page, size);
    }


    @GetMapping("/{patientId}/other-appointments")
    public Page<AppointmentDTO> noAppointmentByPatientId(@PathVariable Long patientId,
                                                        @RequestParam(name="page", defaultValue = "0") int page,
                                                        @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchNoAppointmentsForPatient(patientId, page, size);
    }

    @GetMapping("/get")
    public PatientDTO loadPatientByEmail(@RequestParam(name = "email", defaultValue = "") String email){
        return patientService.loadPatientByEmail(email);
    }


}
