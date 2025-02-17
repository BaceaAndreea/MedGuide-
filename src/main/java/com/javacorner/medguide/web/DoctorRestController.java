package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.DoctorService;
import com.javacorner.medguide.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@CrossOrigin("*")
public class DoctorRestController {
    private DoctorService doctorService;
    private UserService userService;
    private AppointmentService appointmentService;

    public DoctorRestController(DoctorService doctorService, UserService userService, AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.userService = userService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public Page<DoctorDTO> searchDoctor(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                        @RequestParam(name = "page", defaultValue = "0") int page,
                                        @RequestParam(name = "size", defaultValue = "5") int size){
        return doctorService.findDoctorsByName(keyword, page, size);
    }

    @GetMapping("/all")
    public List<DoctorDTO> findAllDoctors(){
        return doctorService.fetchDoctors();
    }

    @DeleteMapping("/{doctorId}")
    public void deleteDoctor(@PathVariable Long doctorId){
        doctorService.removeDoctor(doctorId);
    }

    @PostMapping
    public DoctorDTO saveDoctor(@RequestBody DoctorDTO doctorDTO){
        User user = userService.loadUserByEmail(doctorDTO.getUser().getEmail());
        if (user != null) throw new RuntimeException("Email already in use");
        return doctorService.createDoctor(doctorDTO);
    }

    @PutMapping("/{doctorId}")
    public DoctorDTO updateDoctor(@RequestBody DoctorDTO doctorDTO, @PathVariable Long doctorId){
        doctorDTO.setDoctorId(doctorId);
        return doctorService.updateDoctor(doctorDTO);
    }

    //this API will enable us to load, or to fetch a specific doctor using the doctorId
    @GetMapping("/{doctorId}/appointments")
    public Page<AppointmentDTO> appointmentsByDoctorId(@PathVariable Long doctorId,
                                                       @RequestParam(name="page", defaultValue = "0") int page,
                                                       @RequestParam(name="size", defaultValue = "5") int size){
        return appointmentService.fetchAppointmentsForDoctor(doctorId, page, size);
    }

    @GetMapping("/find")
    public DoctorDTO findDoctorByEmail(@RequestParam(name = "email", defaultValue = "") String email){
        return doctorService.loadDoctorByEmail(email);
    }


}
