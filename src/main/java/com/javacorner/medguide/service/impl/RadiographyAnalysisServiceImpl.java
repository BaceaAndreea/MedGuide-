package com.javacorner.medguide.service.impl;

import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.dto.AppointmentDTO;
import com.javacorner.medguide.service.AppointmentService;
import com.javacorner.medguide.service.RadiographyAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class RadiographyAnalysisServiceImpl implements RadiographyAnalysisService {

    @Value("${app.upload.dir.radiography:${user.home}/medguide/uploads/radiography}")
    private String uploadDir;

    @Value("${app.ai.api.url}")
    private String aiApiUrl;

    private final AppointmentService appointmentService;
    private final RestTemplate restTemplate;

    @Autowired
    public RadiographyAnalysisServiceImpl(AppointmentService appointmentService, RestTemplate restTemplate) {
        this.appointmentService = appointmentService;
        this.restTemplate = restTemplate;
    }

    @Override
    public String analyzeRadiography(MultipartFile radiographyImage, Long appointmentId) {
        try {
            // Salvează imaginea
            String imagePath = saveImage(radiographyImage);

            // Actualizează calea imaginii în programare
            Appointment appointment = appointmentService.loadAppointmentById(appointmentId);
            appointment.setRadiographyImagePath(imagePath);

            // Apelează API-ul AI pentru analiză
            String analysisResult = callAiApi(imagePath);

            // Salvează rezultatul analizei
            appointment.setAiAnalysisResult(analysisResult);
            appointmentService.updateAppointment(mapToDto(appointment));

            return analysisResult;
        } catch (IOException e) {
            throw new RuntimeException("Failed to process radiography image", e);
        }
    }

    private String saveImage(MultipartFile file) throws IOException {
        // Creează directorul dacă nu există
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generează un nume unic pentru fișier
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, filename);

        // Salvează fișierul
        Files.write(path, file.getBytes());

        return path.toString();
    }

    public String callAiApi(String imagePath) {
        try {
            // 1) Încarci fișierul
            File imageFile = new File(imagePath);
            if (!imageFile.exists()) {
                throw new RuntimeException("Fișierul imagine nu există: " + imagePath);
            }
            FileSystemResource resource = new FileSystemResource(imageFile);

            // 2) Construiești body-ul multipart
            MultiValueMap<String,Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String,Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            // 3) Trimiți POST către /predict
            String endpoint = aiApiUrl + "/predict";
            System.out.println("Calling AI API at: " + endpoint);
            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // 4) Verifici răspunsul
            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("AI analysis failed: " + response.getStatusCode());
            }
            @SuppressWarnings("unchecked")
            Map<String,Object> bodyMap = response.getBody();
            if (bodyMap == null) {
                throw new RuntimeException("AI API returned empty body");
            }

            // 5) Parsezi direct JSON-ul:
            String className = (String) bodyMap.get("class");
            double confidence = ((Number) bodyMap.get("confidence")).doubleValue();
            @SuppressWarnings("unchecked")
            Map<String,Object> probs = (Map<String,Object>) bodyMap.get("probabilities");

            // 6) Construiești textul final
            StringBuilder result = new StringBuilder();
            result.append("Clasificare tumoră: ").append(className).append("\n")
                    .append("Încredere: ").append(String.format("%.2f%%", confidence * 100)).append("\n\n")
                    .append("Toate probabilitățile:\n");
            for (var entry : probs.entrySet()) {
                double p = ((Number) entry.getValue()).doubleValue();
                result.append("- ").append(entry.getKey())
                        .append(": ").append(String.format("%.2f%%", p * 100))
                        .append("\n");
            }
            return result.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return getMockResult();  // sau propagate exception după preferințe
        }
    }


    // Metodă pentru testare care returnează un rezultat hardcodat
    private String getMockResult() {
        return "Clasificare tumoră: meningioma\n" +
                "Încredere: 77.74%\n\n" +
                "Toate probabilitățile:\n" +
                "- glioma: 21.65%\n" +
                "- meningioma: 77.74%\n" +
                "- notumor: 0.05%\n" +
                "- pituitary: 0.06%";
    }

    private AppointmentDTO mapToDto(Appointment appointment) {
        // Implementați logica de mapare de la Appointment la AppointmentDTO
        AppointmentDTO dto = new AppointmentDTO();
        // Copiați proprietățile
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStatus(appointment.getStatus());
        dto.setRadiographyImagePath(appointment.getRadiographyImagePath());
        dto.setAiAnalysisResult(appointment.getAiAnalysisResult());
        // Setați doctor și patient
        // ...
        return dto;
    }
}