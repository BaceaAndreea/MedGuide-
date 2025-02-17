package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.DoctorDao;
import com.javacorner.medguide.dao.HospitalDao;
import com.javacorner.medguide.dao.SpecializationDao;
import com.javacorner.medguide.domain.*;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.mapper.DoctorMapper;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.DoctorService;
import com.javacorner.medguide.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private DoctorDao doctorDao;
    private DoctorMapper doctorMapper;
    private UserService userService;
    private AppointmentService appointmentService;
    private HospitalDao hospitalDao;
    private SpecializationDao specializationDao;

    public DoctorServiceImpl(DoctorDao doctorDao, DoctorMapper doctorMapper, UserService userService, AppointmentService appointmentService, HospitalDao hospitalDao, SpecializationDao specializationDao) {
        this.doctorDao = doctorDao;
        this.doctorMapper = doctorMapper;
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.hospitalDao = hospitalDao;
        this.specializationDao = specializationDao;
    }

    @Override
    public Doctor loadDoctorById(Long doctorId) {
        return doctorDao.findById(doctorId).orElseThrow(() -> new EntityNotFoundException("Doctor with ID " + doctorId+ " not found"));
    }

    @Override
    public Page<DoctorDTO> findDoctorsByName(String name, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Doctor> doctorPage = doctorDao.findDoctorsByByName(name, pageRequest);
        return new PageImpl<>(doctorPage.getContent().stream().map(doctor -> doctorMapper.fromDoctor(doctor)).collect(Collectors.toList()), pageRequest, doctorPage.getTotalElements());
    }

    @Override
    public DoctorDTO loadDoctorByEmail(String email) {
        return doctorMapper.fromDoctor(doctorDao.findDoctorByEmail(email));
    }

    @Override
    public DoctorDTO createDoctor(DoctorDTO doctorDTO) {
        User user = userService.createUser(doctorDTO.getUser().getEmail(), doctorDTO.getUser().getPassword());
        userService.assignRoleToUser(user.getEmail(), "Doctor");
        Doctor doctor = doctorMapper.fromDoctorDTO(doctorDTO);
        // Setează relațiile Hospital și Specialization
        Hospital hospital = hospitalDao.findById(doctorDTO.getHospital().getHospitalId())
                .orElseThrow(() -> new EntityNotFoundException("Hospital not found with ID: " + doctorDTO.getHospital().getHospitalId()));
        doctor.setHospital(hospital);

        Specialization specialization = specializationDao.findById(doctorDTO.getSpecialization().getSpecializationId())
                .orElseThrow(() -> new EntityNotFoundException("Specialization not found with ID: " + doctorDTO.getSpecialization().getSpecializationId()));
        doctor.setSpecialization(specialization);
        doctor.setUser(user);
        Doctor savedDoctor = doctorDao.save(doctor);
        return doctorMapper.fromDoctor(savedDoctor);
    }

    //i don't want to lose the information in an appoiment or user when i update a doctor
    @Override
    public DoctorDTO updateDoctor(DoctorDTO doctorDTO) {
        Doctor loadedDoctor = loadDoctorById(doctorDTO.getDoctorId()); // Încărcăm doctorul existent

        loadedDoctor.setFirstName(doctorDTO.getFirstName());
        loadedDoctor.setLastName(doctorDTO.getLastName());
        loadedDoctor.setBirthDate(doctorDTO.getBirthDate());

        // Setăm doar ID-ul pentru hospital și specialization, fără să pierdem datele existente
        if (doctorDTO.getHospital() != null) {
            Hospital hospital = hospitalDao.findById(doctorDTO.getHospital().getHospitalId())
                    .orElseThrow(() -> new EntityNotFoundException("Hospital not found"));
            loadedDoctor.setHospital(hospital);
        }

        if (doctorDTO.getSpecialization() != null) {
            Specialization specialization = specializationDao.findById(doctorDTO.getSpecialization().getSpecializationId())
                    .orElseThrow(() -> new EntityNotFoundException("Specialization not found"));
            loadedDoctor.setSpecialization(specialization);
        }

        // NU modificăm user-ul și programările existente
        loadedDoctor.setUser(loadedDoctor.getUser());
        loadedDoctor.setAppointments(loadedDoctor.getAppointments());

        // Salvăm doctorul actualizat
        Doctor updatedDoctor = doctorDao.save(loadedDoctor);
        return doctorMapper.fromDoctor(updatedDoctor);
    }


    @Override
    public List<DoctorDTO> fetchDoctors() {
        return doctorDao.findAll().stream().map(doctor -> doctorMapper.fromDoctor(doctor)).collect(Collectors.toList());
    }

    @Override
    public void removeDoctor(Long doctorId) {
        Doctor doctor = loadDoctorById(doctorId);
        Iterator<Appointment> appointmentIterator = doctor.getAppointments().iterator();
        if(appointmentIterator.hasNext()) {
            Appointment appointment = appointmentIterator.next();
            appointment.removeDoctorFromAppointment(doctor);
        }
        doctorDao.deleteById(doctorId);
    }

}
