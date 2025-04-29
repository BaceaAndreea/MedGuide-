package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.dao.ConsultationDao;
import com.javacorner.medguide.dao.DoctorDao;
import com.javacorner.medguide.dao.HospitalDao;
import com.javacorner.medguide.dao.SpecializationDao;
import com.javacorner.medguide.domain.*;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import com.javacorner.medguide.mapper.ConsultationMapper;
import com.javacorner.medguide.mapper.DoctorMapper;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.DoctorService;
import com.javacorner.medguide.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Iterator;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
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
    @Value("${app.upload.dir:${user.home}/medguide/uploads/images/doctors}")
    private String uploadDir;
    private ConsultationDao consultationDao;
    private ConsultationMapper consultationMapper;

    public DoctorServiceImpl(DoctorDao doctorDao, DoctorMapper doctorMapper, UserService userService, AppointmentService appointmentService, HospitalDao hospitalDao, SpecializationDao specializationDao,
                             ConsultationDao consultationDao, ConsultationMapper consultationMapper) {
        this.doctorDao = doctorDao;
        this.doctorMapper = doctorMapper;
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.hospitalDao = hospitalDao;
        this.specializationDao = specializationDao;
        this.consultationDao = consultationDao;
        this.consultationMapper = consultationMapper;
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

    @Override
    public DoctorDTO updateDoctor(DoctorDTO doctorDTO) {
        Doctor loadedDoctor = loadDoctorById(doctorDTO.getDoctorId()); // Încărcăm doctorul existent

        loadedDoctor.setFirstName(doctorDTO.getFirstName());
        loadedDoctor.setLastName(doctorDTO.getLastName());
        loadedDoctor.setBirthDate(doctorDTO.getBirthDate());

        // Actualizăm imageUrl doar dacă a fost furnizat unul nou
        if (doctorDTO.getImageUrl() != null && !doctorDTO.getImageUrl().isEmpty()) {
            loadedDoctor.setImageUrl(doctorDTO.getImageUrl());
        }

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

    @Override
    public List<DoctorDTO> findDoctorsBySpecialization(Long specializationId) {
        Specialization specialization = specializationDao.findById(specializationId)
                .orElseThrow(() -> new EntityNotFoundException("Specialization not found"));

        List<Doctor> doctors = doctorDao.findBySpecialization(specialization);
        return doctors.stream()
                .map(doctorMapper::fromDoctor)
                .collect(Collectors.toList());
    }

    @Override
    public String saveDoctorImage(Long doctorId, MultipartFile file) throws IOException {
        Doctor doctor = loadDoctorById(doctorId);

        // Creează directorul de încărcare dacă nu există
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generează un nume de fișier unic
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        // Salvează fișierul
        Files.write(filePath, file.getBytes());

        // Construiește URL-ul pentru accesarea imaginii
        String imageUrl = "/assets/images/doctors/" + fileName;

        // Actualizează doctorul cu noul URL
        doctor.setImageUrl(imageUrl);
        doctorDao.save(doctor);

        return imageUrl;
    }

    @Override
    public List<DoctorDTO> findFeaturedDoctors() {
        // Aici poți implementa logica pentru a returna doctori recomandați
        // De exemplu, poți returna cei mai recent adăugați doctori sau cei mai populari
        PageRequest pageRequest = PageRequest.of(0, 20);

        // Adăugăm URL-uri implicite pentru imagini dacă nu există
        List<Doctor> featuredDoctors = doctorDao.findAll(pageRequest).getContent();

        return featuredDoctors.stream()
                .map(doctor -> {
                    DoctorDTO dto = doctorMapper.fromDoctor(doctor);
                    if (dto.getImageUrl() == null || dto.getImageUrl().isEmpty()) {
                        // Asigură-te că toți doctorii au o imagine implicită bazată pe specializare
                        String specialization = doctor.getSpecialization().getDescription().toLowerCase();
                        if (specialization.contains("cardio")) {
                            dto.setImageUrl("/assets/images/doctors/cardiologist.jpg");
                        } else if (specialization.contains("neuro")) {
                            dto.setImageUrl("/assets/images/doctors/neurologist.jpg");
                        } else if (specialization.contains("pedia")) {
                            dto.setImageUrl("/assets/images/doctors/pediatrician.jpg");
                        } else {
                            // Imagine implicită bazată pe ID pentru diversitate
                            int imageIndex = (doctor.getDoctorId().intValue() % 5) + 1;
                            dto.setImageUrl("/assets/images/doctors/doctor-" + imageIndex + ".jpg");
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public double getDoctorAverageRating(Long doctorId) {
        Double averageRating = consultationDao.findAverageRatingByDoctorId(doctorId);
        return averageRating != null ? averageRating : 0.0;
    }

    @Override
    public int getDoctorTotalReviews(Long doctorId) {
        Integer count = consultationDao.countRatingsByDoctorId(doctorId);
        return count != null ? count : 0;
    }

    @Override
    public int getDoctorRatingCount(Long doctorId, int ratingValue) {
        if (ratingValue < 1 || ratingValue > 10) {
            throw new IllegalArgumentException("Rating value must be between 1 and 10");
        }
        Integer count = consultationDao.countRatingsByDoctorIdAndRating(doctorId, ratingValue);
        return count != null ? count : 0;
    }

    @Override
    public List<ConsultationDTO> getDoctorRatings(Long doctorId) {
        return consultationDao.findConsultationsWithRatingsByDoctorId(doctorId)
                .stream()
                .map(consultationMapper::fromConsultation)
                .collect(Collectors.toList());
    }

}
