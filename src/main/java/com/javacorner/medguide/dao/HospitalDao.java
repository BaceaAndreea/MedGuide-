package com.javacorner.medguide.dao;

import com.javacorner.medguide.domain.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HospitalDao extends JpaRepository<Hospital, Long> {
    @Query(value = "select h from Hospital as h where h.name like %:name%")
    Page<Hospital> findHospitalByName(@Param("name") String name, Pageable pageable);

    @Query(value = "select h from Hospital as h where h.city like %:city%")
    Page<Hospital> findHospitalByCity(@Param("city") String city, Pageable pageable);


    @Query(value = "select h from Hospital as h where h.address like %:address%")
    Page<Hospital> findHospitalByAddress(@Param("address") String address, Pageable pageable);
}
