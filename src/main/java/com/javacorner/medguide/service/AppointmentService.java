package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.dto.AppointmentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    Appointment loadAppointmentById(Long appointmentId);

    AppointmentDTO createAppointment(AppointmentDTO appointmentDTO);

    AppointmentDTO updateAppointment(AppointmentDTO appointmentDTO);

    Page<AppointmentDTO> findAppointmentsByStatus (String keyword, int page, int size);

    void assignPatientToAppointment(Long appointmentId, Long patientId);

    Page<AppointmentDTO> fetchAppointmentsForPatient(Long patientId, int page, int size);

    Page<AppointmentDTO> fetchNoAppointmentsForPatient(Long patientId, int page, int size);

    void removeAppointment(Long appointmentId);

    List<AppointmentDTO> fetchAllAppointments();

    //aflam toate programrile dupa id ul de la doctor
    Page<AppointmentDTO> fetchAppointmentsForDoctor(Long doctorId, int page, int size);

    List<String> getAvailableTimeSlots(Long doctorId, LocalDate date);

}
