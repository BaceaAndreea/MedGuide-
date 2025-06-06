package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import javax.print.Doc;
import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "appointment_date", nullable = false)
    private Date appointmentDate;

    @Basic
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Consultation consultation;

    @Column(name = "reason", nullable = false, length = 50)
    private String reason;



    public Appointment() {
    }

    public Appointment(Date appointmentDate, String status, Patient patient, Doctor doctor, Consultation consultation, String reason) {
        this.appointmentDate = appointmentDate;
        this.status = status;
        this.patient = patient;
        this.doctor = doctor;
        this.consultation = consultation;
        this.reason = reason;

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Appointment that = (Appointment) o;
        if (appointmentId == null || that.appointmentId == null) return false;
        return appointmentId.equals(that.appointmentId) && Objects.equals(appointmentDate, that.appointmentDate) && Objects.equals(status, that.status) && Objects.equals(patient, that.patient) && Objects.equals(doctor, that.doctor) && Objects.equals(consultation, that.consultation);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.getAppointmentId()); // Folosește doar ID-ul pentru hash
    }


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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Consultation getConsultation() {
        return consultation;
    }
    public void setConsultation(Consultation consultation) {
        this.consultation = consultation;
    }

    public void assignPatientToAppointment(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null");
        }
        this.patient = patient;
    }

    public void removePatientFromAppointment(Patient patient) {
        if (patient == null || !patient.equals(this.patient)) {
            throw new IllegalArgumentException("Patient is not associated with this appointment");
        }
        this.patient = null;
        System.out.println("Patient has been removed from the appointment.");
    }

    public void removeDoctorFromAppointment(Doctor doctor) {
        if (doctor == null || !doctor.equals(this.doctor)) {
            throw new IllegalArgumentException("Doctor is not associated with this appointment");
        }
        this.doctor = null;
        System.out.println("Doctor has been removed from the appointment.");
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "appointmentId=" + appointmentId +
                ", appointmentDate=" + appointmentDate +
                ", status='" + status + '\'' + '}';
    }


}
