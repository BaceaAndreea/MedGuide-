package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.AppointmentDao;
import com.javacorner.medguide.dao.DoctorDao;
import com.javacorner.medguide.dao.PatientDao;
import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.domain.Patient;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.mapper.AppointmentMapper;
import com.javacorner.medguide.service.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private AppointmentDao appointmentDao;
    private AppointmentMapper appointmentMapper;
    private DoctorDao doctorDao;
    private PatientDao patientDao;

    @Autowired
    public AppointmentServiceImpl(AppointmentDao appointmentDao, AppointmentMapper appointmentMapper, DoctorDao doctorDao, PatientDao patientDao) {
        this.appointmentDao = appointmentDao;
        this.appointmentMapper = appointmentMapper;
        this.doctorDao = doctorDao;
        this.patientDao = patientDao;
    }


    @Override
    public Appointment loadAppointmentById(Long appointmentId) {
        return appointmentDao.findById(appointmentId).orElseThrow(() -> new EntityNotFoundException("Appointment with ID" + appointmentId + "not found!"));
    }

    @Override
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentMapper.fromAppointmentDTO(appointmentDTO);
        Doctor doctor = doctorDao.findById(appointmentDTO.getDoctor().getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor with ID " + appointmentDTO.getDoctor().getDoctorId() + " not found!"));
        appointment.setDoctor(doctor);
        // Dacă e necesar, validează pacientul (presupunând că ai și entitatea Patient)
        if (appointmentDTO.getPatient() != null && appointmentDTO.getPatient().getPatientId() != null) {
            Patient patient = patientDao.findById(appointmentDTO.getPatient().getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient with ID " + appointmentDTO.getPatient().getPatientId() + " not found!"));
            appointment.setPatient(patient);
        }
        // Setează datele și statusul
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setStatus(appointmentDTO.getStatus());
        Appointment savedAppointment = appointmentDao.save(appointment);
        return appointmentMapper.fromAppointment(savedAppointment);

    }

    @Override
    public AppointmentDTO updateAppointment(AppointmentDTO appointmentDTO) {
        Appointment loadedAppointment = loadAppointmentById(appointmentDTO.getAppointmentId());
        Doctor doctor = null;
        if (appointmentDTO.getDoctor() != null && appointmentDTO.getDoctor().getDoctorId() != null) {
            doctor = doctorDao.findById(appointmentDTO.getDoctor().getDoctorId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor with ID " + appointmentDTO.getDoctor().getDoctorId() + " not found!"));
        }

        if (appointmentDTO.getPatient() != null && appointmentDTO.getPatient().getPatientId() != null) {
            Patient patient = patientDao.findById(appointmentDTO.getPatient().getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient with ID " + appointmentDTO.getPatient().getPatientId() + " not found!"));
            loadedAppointment.setPatient(patient);
        }
        loadedAppointment.setDoctor(doctor);
        loadedAppointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        loadedAppointment.setStatus(appointmentDTO.getStatus());

        Appointment updatedAppointment = appointmentDao.save(loadedAppointment);
        return appointmentMapper.fromAppointment(updatedAppointment);

    }

    @Override
    public Page<AppointmentDTO> findAppointmentsByStatus(String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Appointment> appointmentPage = appointmentDao.findAppointmentsByStatusContains(keyword, pageRequest);
        return new PageImpl<>(appointmentPage.getContent().stream().map(appointment -> appointmentMapper.fromAppointment(appointment)).collect(Collectors.toList()), pageRequest, appointmentPage.getTotalElements());
    }


    //asta este o metoda transactional si de aia avem nevoie de Anotatie
    @Override
    public void assignPatientToAppointment(Long appointmentId, Long patientId) {
        Patient patient = patientDao.findById(patientId).orElseThrow(() -> new EntityNotFoundException("Patient with ID" + patientId + "not found!"));
        Appointment appointment = loadAppointmentById(appointmentId);
        appointment.assignPatientToAppointment(patient);

    }

    @Override
    public Page<AppointmentDTO> fetchAppointmentsForPatient(Long patientId, int page, int size) {
       PageRequest pageRequest = PageRequest.of(page, size);
       Page<Appointment> patientAppointmentPage =appointmentDao.getAppointmentsByPatientId(patientId, pageRequest);
       return new PageImpl<>(patientAppointmentPage.getContent().stream().map(appointment -> appointmentMapper.fromAppointment(appointment)).collect(Collectors.toList()), pageRequest, patientAppointmentPage.getTotalElements());

    }

    @Override
    public Page<AppointmentDTO> fetchNoAppointmentsForPatient(Long patientId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Appointment> patientNoAppointmentPage =appointmentDao.getNoAppointmentsByPatientId(patientId, pageRequest);
        return new PageImpl<>(patientNoAppointmentPage.getContent().stream().map(appointment -> appointmentMapper.fromAppointment(appointment)).collect(Collectors.toList()), pageRequest, patientNoAppointmentPage.getTotalElements());
    }

    @Override
    public void removeAppointment(Long appointmentId) {
        appointmentDao.deleteById(appointmentId);

    }

    @Override
    public List<AppointmentDTO> fetchAllAppointments() {
        return appointmentDao.findAll().stream().map(appointment -> appointmentMapper.fromAppointment(appointment)).collect(Collectors.toList());
    }

    @Override
    public Page<AppointmentDTO> fetchAppointmentsForDoctor(Long doctorId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Appointment> doctorAppointmentPage =appointmentDao.getAppointmentsByDoctorId(doctorId, pageRequest);
        return new PageImpl<>(doctorAppointmentPage.getContent().stream().map(appointment -> appointmentMapper.fromAppointment(appointment)).collect(Collectors.toList()), pageRequest, doctorAppointmentPage.getTotalElements());
    }
}
