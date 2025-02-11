package com.javacorner.medguide.web;

import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.service.AppointmentService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointments")
//here we insert the host, * to permit all other resources to consumm this API
@CrossOrigin("*")
public class AppointmentRestController {
    private AppointmentService appointmentService;

    public AppointmentRestController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public Page<AppointmentDTO> searchAppointments(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                                   @RequestParam(name = "page", defaultValue = "0") int page,
                                                   @RequestParam(name = "size", defaultValue = "5") int size) {
        return appointmentService.findAppointmentsByStatus(keyword, page, size);
    }

    @DeleteMapping("/{appointmentId}")
    public void deleteAppointment(@PathVariable Long appointmentId) {
        appointmentService.removeAppointment(appointmentId);
    }

    //de aici in jos nu merge
    @PostMapping
    public AppointmentDTO saveAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        return appointmentService.createAppointment(appointmentDTO);
    }

    @PutMapping("/{appointmentId}")
    public AppointmentDTO updateAppointment(@RequestBody AppointmentDTO appointmentDTO, @PathVariable Long appointmentId) {
        appointmentDTO.setAppointmentId(appointmentId);
        return appointmentService.updateAppointment(appointmentDTO);
    }

    @PostMapping("/{appointmentId}/enroll/patients/{patientId}")
    public void enrollPatientInAppointment(@PathVariable Long appointmentId, @PathVariable Long patientId) {
        appointmentService.assignPatientToAppointment(appointmentId, patientId);
    }

}
