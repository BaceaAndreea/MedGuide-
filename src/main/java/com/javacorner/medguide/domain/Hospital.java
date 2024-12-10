package com.javacorner.medguide.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "hospitals")
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Basic
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Basic
    @Column(name = "address", nullable = false, length = 150)
    private String address;

    @Basic
    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Doctor> doctors = new HashSet<>(); // Relație Unu-la-Multe

    public Hospital() {
    }

    public Hospital(String name, String address, String city) {
        this.name = name;
        this.address = address;
        this.city = city;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Hospital hospital = (Hospital) o;
        return hospitalId.equals(hospital.hospitalId) && Objects.equals(name, hospital.name) && Objects.equals(address, hospital.address) && Objects.equals(city, hospital.city);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hospitalId, name, address, city);
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Set<Doctor> getDoctors() {
        return doctors;
    }

    public void setDoctors(Set<Doctor> doctors) {
        this.doctors = doctors;
    }

    @Override
    public String toString() {
        return "Hospital{" +
                "hospitalId=" + hospitalId +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                '}';
    }
}

