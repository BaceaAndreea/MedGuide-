package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Basic
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Basic
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @ElementCollection
    @CollectionTable(name = "patient_medical_history", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "medical_history")
    private List<String> medicalHistory;

    @ElementCollection
    @CollectionTable(name = "patient_allergies", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "allergy")
    private List<String> allergies;
    //Un formular simplu în care utilizatorul (medicul sau pacientul) introduce alergiile.

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Appointment> appointments = new HashSet<>();

    @OneToOne (cascade = CascadeType.REMOVE) //daca stergem un pacient acesta va fi automat sters din lista de user
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    public Patient() {
    }

    public Patient(String firstName, String lastName, List<String> medicalHistory, List<String> allergies, User user) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.medicalHistory = medicalHistory;
        this.allergies = allergies;
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Patient patient = (Patient) o;
        return patientId.equals(patient.patientId) && Objects.equals(firstName, patient.firstName) && Objects.equals(lastName, patient.lastName) && Objects.equals(medicalHistory, patient.medicalHistory) && Objects.equals(allergies, patient.allergies);
    }

    @Override
    public int hashCode() {
        return Objects.hash(patientId, firstName, lastName, medicalHistory, allergies);
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

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Set<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(Set<Appointment> appointments) {
        this.appointments = appointments;
    }

    public List<String> getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(List<String> medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public List<String> getAllergies() {
        return allergies;
    }

    public void setAllergies(List<String> allergies) {
        this.allergies = allergies;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Metodă pentru adăugarea unei intrări în istoricul medical
    public void addToMedicalHistory(String diagnosis) {
        this.medicalHistory.add(diagnosis);
    }



    @Override
    public String toString() {
        return "Patient{" +
                "patientId=" + patientId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", medicalHistory=" + medicalHistory +
                ", allergies=" + allergies +
                '}';
    }
}
