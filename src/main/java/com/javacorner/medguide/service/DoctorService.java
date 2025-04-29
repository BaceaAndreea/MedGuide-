package com.javacorner.medguide.service;

import com.javacorner.medguide.domain.Doctor;
import com.javacorner.medguide.dto.ConsultationDTO;
import com.javacorner.medguide.dto.DoctorDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DoctorService {
    Doctor loadDoctorById(Long doctorId);

    Page<DoctorDTO> findDoctorsByName(String name, int page, int size);

    DoctorDTO loadDoctorByEmail(String email);

    DoctorDTO createDoctor(DoctorDTO doctorDTO);

    DoctorDTO updateDoctor(DoctorDTO doctorDTO);

    List<DoctorDTO> fetchDoctors();

    void removeDoctor(Long doctorId);

    public List<DoctorDTO> findDoctorsBySpecialization(Long specializationId);

    String saveDoctorImage(Long doctorId, MultipartFile file) throws IOException;

    List<DoctorDTO> findFeaturedDoctors();

    double getDoctorAverageRating(Long doctorId);
    int getDoctorTotalReviews(Long doctorId);
    int getDoctorRatingCount(Long doctorId, int ratingValue);
    List<ConsultationDTO> getDoctorRatings(Long doctorId);

}
