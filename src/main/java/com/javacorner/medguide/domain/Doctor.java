package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;
    @Basic
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    @Basic
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    @Basic
    @Column(name = "birthdate", nullable = false, length = 50)
    private LocalDate birthDate;

    @Column(name = "image_url", nullable = true)
    private String imageUrl;

    @OneToOne (cascade = CascadeType.REMOVE)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "specialization_id", referencedColumnName = "specialization_id", nullable = false)
    private Specialization specialization;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    private Set<Appointment> appointments = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id", referencedColumnName = "hospital_id", nullable = false)
    private Hospital hospital;

    public Doctor() { //nonargument constructor
    }

    public Doctor(String firstName, String lastName, LocalDate birthDate, User user, Specialization specialization, Hospital hospital, String imageUrl) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.user = user;
        this.specialization = specialization;
        this.hospital = hospital;
        this.imageUrl = imageUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Doctor doctor = (Doctor) o;
        if (doctorId == null || doctor.doctorId == null) return false;
        return doctorId.equals(doctor.doctorId) && Objects.equals(firstName, doctor.firstName) && Objects.equals(lastName, doctor.lastName) && Objects.equals(birthDate, doctor.birthDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(doctorId, firstName, lastName, birthDate);
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }

    public Set<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(Set<Appointment> appointments) {
        this.appointments = appointments;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public void newAppointment(Appointment appointment) {
        this.appointments.add(appointment);
        appointment.getDoctor();
    }

    public void removeAppointment(Appointment appointment) {
        appointments.remove(appointment);
        appointment.getDoctor();
    }

    public double getAverageRating() {
        long ratingCount = 0;
        double ratingSum = 0;

        for (Appointment appointment : appointments) {
            if (appointment.getConsultation() != null &&
                    appointment.getConsultation().getRating() != null) {
                ratingSum += appointment.getConsultation().getRating();
                ratingCount++;
            }
        }

        return ratingCount > 0 ? ratingSum / ratingCount : 0;
    }
    public int getReviewCount() {
        int count = 0;

        for (Appointment appointment : appointments) {
            if (appointment.getConsultation() != null &&
                    appointment.getConsultation().getRating() != null) {
                count++;
            }
        }

        return count;
    }

    public int getRatingCount(int ratingValue) {
        if (ratingValue < 1 || ratingValue > 10) {
            throw new IllegalArgumentException("Rating value must be between 1 and 10");
        }

        int count = 0;

        for (Appointment appointment : appointments) {
            if (appointment.getConsultation() != null &&
                    appointment.getConsultation().getRating() != null &&
                    appointment.getConsultation().getRating() == ratingValue) {
                count++;
            }
        }

        return count;
    }


    @Override
    public String toString() {
        return "Doctor{" +
                "doctorId=" + doctorId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", birthDate=" + birthDate +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
