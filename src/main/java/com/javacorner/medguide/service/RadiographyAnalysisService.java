package com.javacorner.medguide.service;
import org.springframework.web.multipart.MultipartFile;

public interface RadiographyAnalysisService {
    String analyzeRadiography(MultipartFile radiographyImage, Long appointmentId);
}
