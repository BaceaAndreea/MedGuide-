package com.javacorner.medguide.runner;

import com.javacorner.medguide.domain.Hospital;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.*;
import com.javacorner.medguide.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Component
public class MyRunner implements CommandLineRunner {
    @Autowired
    private RoleService roleService;
    @Autowired
    private UserService userService;
    @Autowired
    private HospitalService hospitalService;
    @Autowired
    private SpecializationService specializationService;
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private PatientService patientService;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private ConsultationService consultationService;

    @Override
    public void run(String... args) throws Exception {
        createRoles();
        createAdmin();
        createHospital();
        createSpecialization();
        createDoctor();
        createPatient();
        createAppointment();
        createConsultation();

    }

    private void createRoles() {
        Arrays.asList("Admin", "Doctor", "Patient").forEach(role -> roleService.createRole(role));
    }

    private void createAdmin() {
        userService.createUser("admin@gmail.com", "parola1234");
        userService.assignRoleToUser("admin@gmail.com", "admin");
    }

    private void createHospital() {
        // Creează câteva spitale pentru testare
        for (int i = 1; i <= 3; i++) {
            HospitalDTO hospitalDTO = new HospitalDTO();
            hospitalDTO.setName("Hospital " + i);
            hospitalDTO.setAddress(String.format("Street %d %s", i, i));
            hospitalDTO.setCity("City " + i);
            hospitalService.createHospital(hospitalDTO);
        }
    }

    private void createSpecialization() {
        // Creează câteva specializări folosind DTO-uri pentru testare
        Arrays.asList("Cardiology", "Pediatrics", "Dermatology", "Neurology")
                .forEach(specializationName -> {
                    SpecializationDTO specializationDTO = new SpecializationDTO();
                    specializationDTO.setDescription(specializationName);

                    // Apelează metoda din service pentru a salva specializarea
                    specializationService.createSpecialization(specializationDTO);
                });
    }

    private void createDoctor() {
        // Obține spitale și specializări folosind DTO-uri
        List<HospitalDTO> hospitals = hospitalService.fetchHospitals();
        List<SpecializationDTO> specializations = specializationService.fetchAllSpecializations();

        for (int i = 1; i < 3; i++) {
            DoctorDTO doctorDTO = new DoctorDTO();
            doctorDTO.setFirstName("Doctor" + i + "FN");
            doctorDTO.setLastName("Doctor" + i + "LN");
            doctorDTO.setBirthDate(LocalDate.now());
            HospitalDTO hospitalDTO = new HospitalDTO();
            hospitalDTO.setHospitalId(1L+i);
            doctorDTO.setHospital(hospitalDTO);
            SpecializationDTO specializationDTO = new SpecializationDTO();
            specializationDTO.setSpecializationId(1L+i);
            doctorDTO.setSpecialization(specializationDTO);
            UserDTO userDTO = new UserDTO();
            userDTO.setEmail("doctor" + i + "@gmail.com");
            userDTO.setPassword("parola1234");
            doctorDTO.setUser(userDTO);

            doctorService.createDoctor(doctorDTO);
        }
    }

    private void createPatient() {
        for (int i = 1; i <= 3; i++) {
            PatientDTO patientDTO = new PatientDTO();
            patientDTO.setFirstName("Patient " + i +  "FN");
            patientDTO.setLastName("Patient " + i + "LN");
            // Creăm un utilizator asociat pacientului
            UserDTO userDTO = new UserDTO();
            userDTO.setEmail("patient" + i + "@gmail.com");
            userDTO.setPassword("parola1234");
            patientDTO.setUser(userDTO);

            // Apelează serviciul pentru a salva pacientul
            patientService.createPatient(patientDTO);

        }
    }

    private void createAppointment() {
        for (int i = 0; i < 2; i++) {
            AppointmentDTO appointmentDTO = new AppointmentDTO();
            appointmentDTO.setStatus("Appointment" + i);
            LocalDate localDate = LocalDate.of(2025, 1, i + 1);
            appointmentDTO.setAppointmentDate(Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
            DoctorDTO doctorDTO = new DoctorDTO();
            doctorDTO.setDoctorId(1L + i );
            appointmentDTO.setDoctor(doctorDTO);
            PatientDTO patientDTO = new PatientDTO();
            patientDTO.setPatientId(1L + i);
            appointmentDTO.setPatient(patientDTO);
            appointmentService.createAppointment(appointmentDTO);

        }
    }

    private void createConsultation() {
        List<AppointmentDTO> appointments = appointmentService.fetchAllAppointments();

        for (AppointmentDTO appointment : appointments) {
            if (appointment.getPatient() == null || appointment.getDoctor() == null) {
                System.out.println("Skipping consultation creation for appointment ID " + appointment.getAppointmentId() + " because doctor or patient is null");
                continue;
            }

            ConsultationDTO consultationDTO = new ConsultationDTO();
            consultationDTO.setDiagnosis("Diagnosis for appointment " + appointment.getAppointmentId());
            consultationDTO.setAppointmentId(appointment.getAppointmentId());
            consultationDTO.setPatientId(appointment.getPatient().getPatientId());
            consultationDTO.setDoctorId(appointment.getDoctor().getDoctorId());

            System.out.println("Creating consultation for appointment ID " + appointment.getAppointmentId() +
                    " with doctor ID " + appointment.getDoctor().getDoctorId() +
                    " and patient ID " + appointment.getPatient().getPatientId());

            consultationService.createConsultation(consultationDTO);
        }
    }


}
