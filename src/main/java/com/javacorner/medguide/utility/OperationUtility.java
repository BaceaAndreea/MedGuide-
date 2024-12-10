package com.javacorner.medguide.utility;

import com.javacorner.medguide.dao.*;
import com.javacorner.medguide.domain.*;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class OperationUtility {
    //merge tot
    public static void usersOperation(UserDao userDao) {
        createUsers(userDao);
        updateUser(userDao);
        deleteUser(userDao);
        fetchUser(userDao);
    }


    private static void createUsers(UserDao userDao) {
        User user1 = new User("user1@gmail.com", "pass1");
        userDao.save(user1);
        User user2 = new User("user2@gmail.com", "pass2");
        userDao.save(user2);
        User user3 = new User("user3@gmail.com", "pass3");
        userDao.save(user3);
        User user4 = new User("user4@gmail.com", "pass4");
        userDao.save(user4);
    }


    private static void updateUser(UserDao userDao) {
        User user = userDao.findById(2L).orElseThrow(()-> new EntityNotFoundException("User with id 2 not found"));
        user.setEmail("newEmail@gmail.com");
        userDao.save(user);
    }


    private static void deleteUser(UserDao userDao) {
        User user = userDao.findById(11L).orElseThrow(()-> new EntityNotFoundException("User with id 2 not found"));
        userDao.delete(user);
    }


    private static void fetchUser(UserDao userDao) {
        userDao.findAll().forEach(user -> System.out.println(user.toString()));
    }

    //merge tot bine
    public static void rolesOperation(RoleDao roleDao) {
        createRoles(roleDao);
        updateRole(roleDao);
        deleteRole(roleDao);
        fetchRole(roleDao);

    }

    private static void createRoles(RoleDao roleDao) {
        Role role1 = new Role("Admin");
        roleDao.save(role1);
        Role role2 = new Role("Doctor");
        roleDao.save(role2);
        Role role3 = new Role("Patient");
        roleDao.save(role3);
    }

    private static void updateRole(RoleDao roleDao) {
        Role role = roleDao.findById(4L).orElseThrow(() -> new EntityNotFoundException("Role not found"));
        role.setRoleId(1L);
        roleDao.save(role);
    }

    private static void deleteRole(RoleDao roleDao) {
        roleDao.deleteById(4L);

    }

    private static void fetchRole(RoleDao roleDao) {
        roleDao.findAll().forEach(role -> System.out.println(role.getName()));
    }


    public static void clearTable(UserDao userDao) {
        userDao.deleteAll();
        System.out.println("All records from the table have been deleted.");
    }

    public static void assignRolesToUser(UserDao userDao, RoleDao roleDao) {
//        // Șterge toate înregistrările din tabelul de utilizatori
//        clearTable(userDao);
        Role role = roleDao.findByName("Admin");
        if(role == null) throw new EntityNotFoundException("Role not found");
        List<User> users = userDao.findAll();
        users.forEach(user -> {
            user.assignRoleToUser(role);
            userDao.save(user);
        });
    }
    public static void hospitalOperation(HospitalDao hospitalDao) {
        createHospital(hospitalDao);
        updateHospital(hospitalDao);
        removeHospital(hospitalDao);
        fetchHospital(hospitalDao);
    }

    private static void createHospital(HospitalDao hospitalDao) {
        Hospital hospital1 = new Hospital("Spitalul de urgenta", "Strada Unirii 234", "Bucuresti");
        hospitalDao.save(hospital1);
        Hospital hospital2 = new Hospital("Spitalul militar", "Strada Republicii nr 456", "Sibiu");
        hospitalDao.save(hospital2);
    }

    private static void updateHospital(HospitalDao hospitalDao) {
        Hospital hospital = hospitalDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Hospital not found"));
        hospital.setName("Spitalul de Urgenta");
        hospital.setAddress("Strada Unirii nr 234");
        hospitalDao.save(hospital);
    }

    private static void removeHospital(HospitalDao hospitalDao) {
        hospitalDao.deleteById(2L);
    }

    private static void fetchHospital(HospitalDao hospitalDao) {
        hospitalDao.findAll().forEach(hospital -> System.out.println(hospital.toString()));
    }

    public static void specializationOperation(SpecializationDao specializationDao) {
        createSpecialization(specializationDao);
        updateSpecialization(specializationDao);
        removeSpecialization(specializationDao);
        fetchSpecialization(specializationDao);
    }

    private static void createSpecialization(SpecializationDao specializationDao) {
        Specialization specialization1 = new Specialization("cardiologie");
        specializationDao.save(specialization1);
        Specialization specialization2 = new Specialization("Neurologie");
        specializationDao.save(specialization2);
    }

    private static void updateSpecialization(SpecializationDao specializationDao) {
        Specialization specialization = specializationDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Specialization not found"));
        specialization.setDescription("Cardiologie");
        specializationDao.save(specialization);
    }

    private static void removeSpecialization(SpecializationDao specializationDao) {
        specializationDao.deleteById(2L);
    }

    private static void fetchSpecialization(SpecializationDao specializationDao) {
        specializationDao.findAll().forEach(specialization -> System.out.println(specialization.toString()));
    }



    public static void doctorOperations(UserDao userDao, DoctorDao doctorDao, RoleDao roleDao, SpecializationDao specializationDao, HospitalDao hospitalDao) {
        createDoctors(userDao,doctorDao,roleDao, specializationDao, hospitalDao);
        updateDoctor(doctorDao);
        removeDoctor(doctorDao);
        fetchDoctor(doctorDao);
    }


    private static void createDoctors(UserDao userDao, DoctorDao doctorDao, RoleDao roleDao, SpecializationDao specializationDao, HospitalDao hospitalDao ) {
        Role role = roleDao.findByName("Doctor");
        if(role == null) throw new EntityNotFoundException("Role not found");

        User user1 = new User("doctorUser1@gmail.com", "pass1");
        userDao.save(user1);
        user1.assignRoleToUser(role);
        Long specializationId = 1L;
        Long hospitalId = 1L;
        // Găsirea entităților Specialization și Hospital utilizând ID-urile lor
        Specialization specialization = specializationDao.getReferenceById(specializationId);
        Hospital hospital = hospitalDao.getReferenceById(hospitalId);
        LocalDate birthDate1 = LocalDate.of(1980, 1, 15);
        Doctor doctor1 = new Doctor("doctor1FN", "doctor1LN", birthDate1, user1,specialization, hospital ) ;
        doctorDao.save(doctor1);

        User user2 = new User("doctorUser2@gmail.com", "pass2");
        userDao.save(user2);
        user2.assignRoleToUser(role);
        LocalDate birthDate2 = LocalDate.of(1999, 3, 16);
        Long specializationId2 = 3L;
        Long hospitalId2 = 1L;
        // Găsirea entităților Specialization și Hospital utilizând ID-urile lor
        Specialization specialization2 = specializationDao.getReferenceById(specializationId2);
        Hospital hospital2 = hospitalDao.getReferenceById(hospitalId2);
        Doctor doctor2 = new Doctor("doctor2FN", "doctor2LN", birthDate2, user2, specialization2, hospital2) ;
        doctorDao.save(doctor2);

    }

    private static void updateDoctor(DoctorDao doctorDao) {
        Doctor doctor = doctorDao.findById(2L).orElseThrow(()-> new EntityNotFoundException("Doctor not found"));
        doctor.setFirstName("Un nou doctor");
        doctorDao.save(doctor);

    }

    private static void removeDoctor(DoctorDao doctorDao) {
        doctorDao.deleteById(2L);
    }

    private static void fetchDoctor(DoctorDao doctorDao) {
        doctorDao.findAll().forEach(doctor -> System.out.println(doctor.toString()));
    }

    public static void patientOperation(UserDao userDao, PatientDao patientDao, RoleDao roleDao) {
        createPatient(userDao,patientDao,roleDao);
        updatePatient(patientDao);
        removePatient(patientDao);
        fetchPatient(patientDao);
    }

    private static void createPatient(UserDao userDao, PatientDao patientDao, RoleDao roleDao) {
        Role role = roleDao.findByName("Patient");
        if(role == null) throw new EntityNotFoundException("Role not found");

        User user1 = new User("patientUser1@gmail.com", "pass1");
        userDao.save(user1);
        user1.assignRoleToUser(role);
        // Crearea listelor pentru medicalHistory și allergies
        List<String> medicalHistory1 = new ArrayList<>();
        medicalHistory1.add("Diabet");
        List<String> allergies1 = new ArrayList<>();
        allergies1.add("Alune");
        Patient patient1 = new Patient("patient1FN", "patient1LN",medicalHistory1,allergies1, user1);
        patientDao.save(patient1);

        User user2 = new User("patientUser2@gmail.com", "pass2");
        userDao.save(user2);
        user2.assignRoleToUser(role);
        // Crearea listelor pentru medicalHistory și allergies
        List<String> medicalHistory2 = new ArrayList<>();
        medicalHistory2.add("Leziuni cerebrale");
        List<String> allergies2 = new ArrayList<>();
        allergies2.add("Algocalmin");
        Patient patient2 = new Patient("patient2FN", "patient2LN",medicalHistory2, allergies2, user2);
        patientDao.save(patient2);
    }

    private static void updatePatient(PatientDao patientDao) {
        Patient patient = patientDao.findById(2L).orElseThrow(()-> new EntityNotFoundException("Patient not found"));
        patient.setFirstName("updatedPatientFN");
        patient.setLastName("updatedPatientLN");
        patientDao.save(patient);
    }

    private static void removePatient(PatientDao patientDao) {
        patientDao.deleteById(1L);
    }


    private static void fetchPatient(PatientDao patientDao) {
        patientDao.findAll().forEach(patient -> System.out.println(patient.toString()));
    }


    public static void appointmentOperation(AppointmentDao appointmentDao, PatientDao patientDao, DoctorDao doctorDao, ConsultationDao consultationDao) {
        createAppointment(appointmentDao, patientDao, doctorDao, consultationDao);
        updateAppointment(appointmentDao);
        removeAppointment(appointmentDao);
        fetchAppointments(appointmentDao);
    }

    private static void createAppointment(AppointmentDao appointmentDao, PatientDao patientDao, DoctorDao doctorDao, ConsultationDao consultationDao) {

        Patient patient = patientDao.findById(2L).orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        Doctor doctor = doctorDao.findById(3L).orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Appointment appointment1 = new Appointment(new Date(), "Scheduled", patient, doctor, null);
        appointmentDao.save(appointment1);

        Patient patient2 = patientDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        Doctor doctor2 = doctorDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        Appointment appointment2 = new Appointment(new Date(), "Scheduled", patient2, doctor2, null); // Fără consultație asociată
        appointmentDao.save(appointment2);
    }

    private static void updateAppointment(AppointmentDao appointmentDao) {
        Appointment appointment = appointmentDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        appointment.setStatus("Completed");
        appointmentDao.save(appointment);
    }

    private static void removeAppointment(AppointmentDao appointmentDao) {
        appointmentDao.deleteById(2L);
    }

    private static void fetchAppointments(AppointmentDao appointmentDao) {
        appointmentDao.findAll().forEach(appointment -> System.out.println(appointment.toString()));
    }

    public static void consultationOperation(ConsultationDao consultationDao, AppointmentDao appointmentDao) {
        createConsultation(consultationDao, appointmentDao);
        updateConsultation(consultationDao);
        removeConsultation(consultationDao);
        fetchConsultations(consultationDao);
    }

    private static void createConsultation(ConsultationDao consultationDao, AppointmentDao appointmentDao) {
        Appointment appointment = appointmentDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        Consultation consultation = new Consultation("Flu Diagnosis", appointment);
        consultationDao.save(consultation);

        Appointment appointment2 = appointmentDao.findById(2L).orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        Consultation consultation2 = new Consultation("Gripa", appointment2);
        consultationDao.save(consultation2);
    }

    private static void updateConsultation(ConsultationDao consultationDao) {
        Consultation consultation = consultationDao.findById(1L).orElseThrow(() -> new EntityNotFoundException("Consultation not found"));
        consultation.setDiagnosis("Updated Diagnosis: Pneunomie");
        consultationDao.save(consultation);
    }

    private static void removeConsultation(ConsultationDao consultationDao) {
        consultationDao.deleteById(2L);
    }

    private static void fetchConsultations(ConsultationDao consultationDao) {
        consultationDao.findAll().forEach(consultation -> System.out.println(consultation.toString()));
    }














}
