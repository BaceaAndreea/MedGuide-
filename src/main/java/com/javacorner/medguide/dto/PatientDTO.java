package com.javacorner.medguide.dto;

import java.util.ArrayList;
import java.util.List;

public class PatientDTO {
    private Long patientId;
    private String firstName;
    private String lastName;
    private UserDTO user;
    private List<String> medicalHistory = new ArrayList<>();
    private List<String> allergies = new ArrayList<>();

    public List<String> getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(List<String> medicalHistory) {
        this.medicalHistory = (medicalHistory != null) ? medicalHistory : new ArrayList<>();
    }

    public List<String> getAllergies() {
        return allergies;
    }

    public void setAllergies(List<String> allergies) {
        this.allergies = (allergies != null) ? allergies : new ArrayList<>();
    }



    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
