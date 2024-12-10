package com.javacorner.medguide;

import com.javacorner.medguide.dao.*;
import com.javacorner.medguide.domain.User;
import com.javacorner.medguide.utility.OperationUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MedGuideApplication  implements CommandLineRunner {
    @Autowired
    private UserDao userDao;
    @Autowired
    private AppointmentDao appointmentDao;
    @Autowired
    private DoctorDao doctorDao;
    @Autowired
    private HospitalDao hospitalDao;
    @Autowired
    private SpecializationDao specializationDao;
    @Autowired
    private PatientDao patientDao;
    @Autowired
    private ConsultationDao consultationDao;
    @Autowired
    private RoleDao roleDao;


    public static void main(String[] args) {
        SpringApplication.run(MedGuideApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        //OperationUtility.usersOperation(userDao);
        //OperationUtility.rolesOperation(roleDao);
        //OperationUtility.assignRolesToUser(userDao, roleDao);
        //OperationUtility.hospitalOperation(hospitalDao);
        //OperationUtility.specializationOperation(specializationDao);
        //OperationUtility.doctorOperations(userDao, doctorDao, roleDao, specializationDao, hospitalDao);
        //OperationUtility.patientOperation(userDao,patientDao,roleDao);
        //OperationUtility.appointmentOperation(appointmentDao,patientDao,doctorDao,consultationDao);
        //OperationUtility.consultationOperation(consultationDao,appointmentDao);
    }
}
