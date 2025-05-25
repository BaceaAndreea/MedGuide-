package com.javacorner.medguide.web;


import com.javacorner.medguide.service.RadiographyAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/radiography")
@CrossOrigin("*")
public class RadiographyRestController {

    private final RadiographyAnalysisService radiographyAnalysisService;

    @Autowired
    public RadiographyRestController(RadiographyAnalysisService radiographyAnalysisService) {
        this.radiographyAnalysisService = radiographyAnalysisService;
    }

    @PostMapping("/analyze/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('Doctor')")
    public ResponseEntity<String> analyzeRadiography(
            @RequestParam("image") MultipartFile image,
            @PathVariable Long appointmentId) {
        String result = radiographyAnalysisService.analyzeRadiography(image, appointmentId);
        return ResponseEntity.ok(result);
    }
}