package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "consultations")
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consultation_id", nullable = false)
    private Long consultationId;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false) // Consultația poate fi legată de o programare
    private Appointment appointment;

    @Column(name = "diagnosis", length = 255)
    private String diagnosis;


    public Consultation() {}

    public Consultation( String diagnosis) {
        this.diagnosis = diagnosis;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Consultation that = (Consultation) o;
        return consultationId.equals(that.consultationId) && Objects.equals(appointment, that.appointment) && Objects.equals(diagnosis, that.diagnosis);
    }

//    @Override
//    public int hashCode() {
//        return Objects.hash(consultationId, appointment, diagnosis);
//    }
    @Override
    public int hashCode() {
        return Objects.hash(this.getConsultationId());
    }

    public Long getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(Long consultationId) {
        this.consultationId = consultationId;
    }


    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }


    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
        // Actualizează istoricul medical al pacientului asociat
        if (this.appointment != null && this.appointment.getPatient() != null) {
            this.appointment.getPatient().addToMedicalHistory(diagnosis);
        }
    }

    @Override
    public String toString() {
        return "Consultation{" +
                "consultationId=" + consultationId +
                ", diagnosis='" + diagnosis + '\'' +
                '}';
    }
}
