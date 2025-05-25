package com.javacorner.medguide.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class AppointmentDTO {
    private Long appointmentId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private Date appointmentDate;;
    private String status;
    private DoctorDTO doctor;
    private PatientDTO patient;
    private String reason;

    private String radiographyImagePath;
    private String aiAnalysisResult;


    public String getReason() {return reason;}

    public void setReason(String reason) {this.reason = reason;}

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Date getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(Date appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public PatientDTO getPatient() {
        return patient;
    }

    public void setPatient(PatientDTO patient) {
        this.patient = patient;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public DoctorDTO getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorDTO doctor) {
        this.doctor = doctor;
    }
    public String getRadiographyImagePath() {
        return radiographyImagePath;
    }

    public void setRadiographyImagePath(String radiographyImagePath) {
        this.radiographyImagePath = radiographyImagePath;
    }

    public String getAiAnalysisResult() {
        return aiAnalysisResult;
    }

    public void setAiAnalysisResult(String aiAnalysisResult) {
        this.aiAnalysisResult = aiAnalysisResult;
    }
}
