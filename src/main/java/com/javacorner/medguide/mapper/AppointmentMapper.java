package com.javacorner.medguide.mapper;

import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.dto.AppointmentDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AppointmentMapper {

    private DoctorMapper doctorMapper;
    private PatientMapper patientMapper;


    @Autowired
    public AppointmentMapper(DoctorMapper doctorMapper, PatientMapper patientMapper) {
        this.doctorMapper = doctorMapper;
        this.patientMapper = patientMapper;
    }

    public AppointmentDTO fromAppointment(Appointment appointment) {
        AppointmentDTO appointmentDTO = new AppointmentDTO();
        BeanUtils.copyProperties(appointment, appointmentDTO);
        appointmentDTO.setDoctor(doctorMapper.fromDoctor(appointment.getDoctor()));
        // Mapăm pacientul doar dacă nu este null
        if (appointment.getPatient() != null) {
            appointmentDTO.setPatient(patientMapper.fromPatient(appointment.getPatient()));
        }
        return appointmentDTO;
    }

    public Appointment fromAppointmentDTO(AppointmentDTO appointmentDTO) {
        Appointment appointment = new Appointment();
        BeanUtils.copyProperties(appointmentDTO, appointment);
        return appointment;
    }
}
