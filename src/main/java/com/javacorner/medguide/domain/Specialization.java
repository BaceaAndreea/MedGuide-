package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "specializations")
public class Specialization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "specialization_id", nullable = false)
    private Long specializationId;

    @Basic
    @Column(name = "description", nullable = false, length = 100)
    private String description;

    @OneToMany(mappedBy = "specialization", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private Set<Doctor> doctors = new HashSet<>();

    public Specialization() {
    }

    public Specialization(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Specialization that = (Specialization) o;
        if (specializationId == null || that.specializationId == null) return false;
        return specializationId.equals(that.specializationId) && Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(specializationId, description);
    }

    public Long getSpecializationId() {
        return specializationId;
    }

    public void setSpecializationId(Long specializationId) {
        this.specializationId = specializationId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Doctor> getDoctors() {
        return doctors;
    }

    public void setDoctors(Set<Doctor> doctors) {
        this.doctors = doctors;
    }

    @Override
    public String toString() {
        return "Specialization{" +
                "specializationId=" + specializationId +
                ", description='" + description + '\'' +
                '}';
    }
}
