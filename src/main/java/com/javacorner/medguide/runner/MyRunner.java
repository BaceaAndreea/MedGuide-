package com.javacorner.medguide.runner;

import com.javacorner.medguide.domain.Appointment;
import com.javacorner.medguide.domain.Hospital;
import com.javacorner.medguide.domain.Role;
import com.javacorner.medguide.domain.Specialization;
import com.javacorner.medguide.dto.*;
import com.javacorner.medguide.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

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
        createHospitals();
        createSpecializations();
        createDoctors();
        createPatients();
        createAppointments();   // Limite: 15 finalizate, 7 anulate, 18 programate
        createConsultations();  // Doar pentru cele 15 finalizate
    }

    private void createRoles() {
        Arrays.asList("Admin", "Doctor", "Patient").forEach(roleName -> {
            if (roleService.findByName(roleName) == null) {
                roleService.createRole(roleName);
            }
        });
    }

    private void createAdmin() {
        if (userService.loadUserByEmail("admin@gmail.com") == null) {
            userService.createUser("admin@gmail.com", "parola1234");
            userService.assignRoleToUser("admin@gmail.com", "admin");
        }
    }

    private void createHospitals() {
        // Lista cu spitale reale din Cluj-Napoca
        List<HospitalDTO> hospitals = new ArrayList<>();

        HospitalDTO hospital1 = new HospitalDTO();
        hospital1.setName("Spitalul Regina Maria");
        hospital1.setAddress("Strada General Traian Moșoiu nr. 22");
        hospital1.setCity("Cluj-Napoca");
        hospital1.setImageUrl("/assets/images/hospitals/hospital1.png");
        hospitals.add(hospital1);

        HospitalDTO hospital2 = new HospitalDTO();
        hospital2.setName("Spitalul Clinic Municipal");
        hospital2.setAddress("Strada Tăbăcarilor nr. 11");
        hospital2.setCity("Cluj-Napoca");
        hospital2.setImageUrl("/assets/images/hospitals/hospital2.png");
        hospitals.add(hospital2);

        HospitalDTO hospital3 = new HospitalDTO();
        hospital3.setName("Spitalul Clinic de Recuperare");
        hospital3.setAddress("Strada Viilor nr. 46-50");
        hospital3.setCity("Cluj-Napoca");
        hospital3.setImageUrl("/assets/images/hospitals/hospital3.png");
        hospitals.add(hospital3);

        HospitalDTO hospital4 = new HospitalDTO();
        hospital4.setName("Spitalul Clinic de Boli Infecțioase");
        hospital4.setAddress("Strada Iuliu Moldovan nr. 23");
        hospital4.setCity("Cluj-Napoca");
        hospital4.setImageUrl("/assets/images/hospitals/hospital4.png");
        hospitals.add(hospital4);

        HospitalDTO hospital5 = new HospitalDTO();
        hospital5.setName("Spitalul Clinic de Urgență pentru Copii");
        hospital5.setAddress("Strada Moților nr. 68");
        hospital5.setCity("Cluj-Napoca");
        hospital5.setImageUrl("/assets/images/hospitals/hospital5.png");
        hospitals.add(hospital5);

        HospitalDTO hospital6 = new HospitalDTO();
        hospital6.setName("Spitalul Clinic Județean de Urgență");
        hospital6.setAddress("Strada Clinicilor nr. 3-5");
        hospital6.setCity("Cluj-Napoca");
        hospital6.setImageUrl("/assets/images/hospitals/hospital6.png");
        hospitals.add(hospital6);

        HospitalDTO hospital7 = new HospitalDTO();
        hospital7.setName("Institutul Clinic de Urologie și Transplant Renal");
        hospital7.setAddress("Strada Clinicilor nr. 4-6");
        hospital7.setCity("Cluj-Napoca");
        hospital7.setImageUrl("/assets/images/hospitals/hospital7.png");
        hospitals.add(hospital7);

        HospitalDTO hospital8 = new HospitalDTO();
        hospital8.setName("Institutul Inimii „Nicolae Stăncioiu");
        hospital8.setAddress("Calea Moților nr. 19-21");
        hospital8.setCity("Cluj-Napoca");
        hospital8.setImageUrl("/assets/images/hospitals/hospital8.png");
        hospitals.add(hospital8);

        // Salvăm toate spitalele în baza de date
        for (HospitalDTO hospital : hospitals) {
            hospitalService.createHospital(hospital);
        }
    }

    private void createSpecializations() {
        // Lista de specializări medicale reale
        String[] specializations = {
                "Cardiologie", "Pediatrie", "Radiologie", "Dermatologie", "Neurologie", "Oftalmologie",
                "Ginecologie", "Oncologie", "Endocrinologie", "Ortopedie", "Reumatologie"
        };

        for (String specialization : specializations) {
            SpecializationDTO specializationDTO = new SpecializationDTO();
            specializationDTO.setDescription(specialization);
            specializationService.createSpecialization(specializationDTO);
        }
    }

    private void createDoctors() {
        // Lista tuturor doctorilor
        String[] doctorNames = {
                "Curta Dan Nicolae", "Cutus Ruxandra", "Diana Mihaela", "Cruciat Gheorghe",
                "Csipak Gabriela", "Damian Laura Otilia", "Dicu Razvan Cosmin", "Constantin Doru Mihai",
                "Dinga Magdalena", "Dirzu Dan Sebastian", "Dobrescu Alina", "Don Liana",
                "Dorca Virgil", "Deac Camelia", "Dindelegan George", "Turdean Maria", "Brudasca Ioana",
                "Brumboiu Ioan", "Budurea Claudia", "Septimiu Ioan", "Iubu Roxana Olivia",
                "Marcu Cristian Tiberiu", "Tripon Raluca", "Bogdan Mihaela Carmen", "Lupse Mihaela Sorina",
                "Muresan Simona Elena", "Binder Astrid", "Amza Gheorghe", "Diculescu Manuela",
                "Florea Lia Mira", "Marginean Codruța", "Neagos Otilia-Elena", "Onaca Emil",
                "Sorina-Livia Pop", "Ionut Diana Daniela", "Chicinas Dan-Valentin", "Atanasoaie Alina",
                "Cismaru Cristina Mihaela", "Horvath Melinda Milena", "Petric Augusta Elena",
                "Irinel Popescu", "Victor Sebastian Costache", "Adrian Streinu-Cercel",
                "Adrian Saftoiu", "Irina M. Cazacu", "Bogdan Silviu Ungureanu"
        };

        // Împărțim doctorii aleatoriu pe specializări
        Random random = new Random();
        int doctorCount = 1;

        for (String fullName : doctorNames) {
            String[] nameParts = fullName.split(" ", 2); // Împărțim în nume și prenume (poate avea mai multe prenume)
            String lastName = nameParts[0];
            String firstName = nameParts.length > 1 ? nameParts[1] : ""; // În caz că avem doar un nume

            DoctorDTO doctorDTO = new DoctorDTO();
            doctorDTO.setLastName(lastName);
            doctorDTO.setFirstName(firstName);
            doctorDTO.setBirthDate(LocalDate.of(1970 + random.nextInt(20), 1 + random.nextInt(12), 1 + random.nextInt(28)));
            doctorDTO.setImageUrl("/assets/images/doctors/doctor" + doctorCount + ".png");

            // ADAUGĂ ORELE DE LUCRU ALEATORII
            // Ora de început: între 7:00 și 10:00
            int startHour = 7 + random.nextInt(4); // 7, 8, 9, sau 10
            LocalTime startTime = LocalTime.of(startHour, 0);

            // Durata programului: între 6 și 8 ore
            int workDuration = 6 + random.nextInt(3); // 6, 7, sau 8 ore
            LocalTime endTime = startTime.plusHours(workDuration);

            // Setăm orele de lucru
            doctorDTO.setWorkStartTime(startTime);
            doctorDTO.setWorkEndTime(endTime);

            // Asignăm o specializare aleatorie (1-11, pentru că ai 11 specializări)
            long specializationId = random.nextInt(11) + 1;
            SpecializationDTO specializationDTO = new SpecializationDTO();
            specializationDTO.setSpecializationId(specializationId);
            doctorDTO.setSpecialization(specializationDTO);

            // Asignăm un spital aleatoriu (1-8)
            long hospitalId = random.nextInt(8) + 1;
            HospitalDTO hospitalDTO = new HospitalDTO();
            hospitalDTO.setHospitalId(hospitalId);
            doctorDTO.setHospital(hospitalDTO);

            // Setăm email-ul pe baza numelui și prenumelui
            String emailFirstName = firstName.toLowerCase().replaceAll("\\s+", ".");
            String emailLastName = lastName.toLowerCase().replaceAll("\\s+", ".");
            String email = emailFirstName + "." + emailLastName + "@gmail.com";

            UserDTO userDTO = new UserDTO();
            userDTO.setEmail(email);
            userDTO.setPassword("parola1234");
            doctorDTO.setUser(userDTO);

            doctorService.createDoctor(doctorDTO);
            doctorCount++;
        }
    }

    private void createPatients() {
        // Lista de pacienți cu nume reale, inclusiv Bacea Andreea
        Object[][] patients = {
                {"Bacea", "Andreea", "andreea.bacea@gmail.com"},
                {"Horea", "Stefan", "horea.stefan@gmail.com"},
                {"Moldovan", "Claudia", "claudia.moldovan@gmail.com"},
                {"Gajdos", "Radu", "radu.gajdos@gmail.com"},
                {"Lupean", "Timea", "timea.lupean@gmail.com"},
                {"Teodorescu", "Andra", "andra.teodorescu@gmail.com"},
                {"Filip", "Alisia", "alisia.filip@gmail.com"}
        };

        for (Object[] patientData : patients) {
            PatientDTO patientDTO = new PatientDTO();
            patientDTO.setLastName((String) patientData[0]);
            patientDTO.setFirstName((String) patientData[1]);

            UserDTO userDTO = new UserDTO();
            userDTO.setEmail((String) patientData[2]);
            userDTO.setPassword("parola1234");
            patientDTO.setUser(userDTO);

            patientService.createPatient(patientDTO);
        }
    }

    // NOUĂ METODĂ: Adăugăm 5 ratinguri inițiale pentru fiecare doctor
    private void createInitialRatings() {
        List<DoctorDTO> doctors = doctorService.fetchDoctors();
        List<PatientDTO> patients = patientService.fetchPatients();
        Random random = new Random();

        // Comentarii pentru review
        String[] positiveComments = {
                "Doctor excelent, foarte profesionist și atent la detalii.",
                "Am primit un tratament eficient, simptomele s-au ameliorat rapid.",
                "Medic foarte bine pregătit, explică clar diagnosticul și opțiunile de tratament.",
                "Consultație amănunțită, medic empatic și dedicat pacienților.",
                "Cel mai bun medic la care am fost vreodată, recomand cu încredere.",
                "M-a tratat cu respect și a explicat clar fiecare pas al tratamentului.",
                "Este un profesionist desăvârșit, a diagnosticat corect din prima.",
                "O experiență foarte plăcută, doctorul a fost atent și amabil."
        };

        String[] averageComments = {
                "Consultație bună, dar timpul de așteptare a fost destul de lung.",
                "Doctor competent, dar puțin cam grăbit în timpul consultației.",
                "Tratamentul a fost parțial eficient, am revenit pentru ajustări.",
                "Servicii medicale decente, dar recepția a fost dezorganizată.",
                "Doctor OK, dar nu a fost foarte comunicativ.",
                "Experiență satisfăcătoare, dar nimic ieșit din comun."
        };

        String[] negativeComments = {
                "Consultație superficială, simptomele nu au fost luate în serios.",
                "Timp de așteptare exagerat de lung, programările nu sunt respectate.",
                "Tratamentul prescris nu a avut efect, am avut nevoie de o a doua opinie.",
                "Nu a fost deloc atent la problemele mele, a părut distras.",
                "Mi-a prescris medicamente care mi-au provocat reacții adverse."
        };

        // Simptome posibile pentru consultații
        String[] symptoms = {
                "Febră, dureri de cap și oboseală",
                "Tuse persistentă și dificultăți de respirație",
                "Dureri abdominale și greață",
                "Dureri articulare și inflamație",
                "Amețeli și probleme de echilibru",
                "Dureri toracice și palpitații",
                "Probleme de vedere și dureri oculare"
        };

        // Diagnostice posibile
        String[] diagnoses = {
                "Infecție virală a căilor respiratorii superioare",
                "Hipertensiune arterială",
                "Artrită reumatoidă",
                "Migrenă cronică",
                "Dermatită atopică",
                "Gastrită acută",
                "Glaucom"
        };

        // Recomandări posibile
        String[] recommendations = {
                "Odihnă adecvată și hidratare",
                "Dietă echilibrată și scădere în greutate",
                "Exerciții fizice regulate adaptate condiției",
                "Evitarea stresului și practici de relaxare",
                "Monitorizarea tensiunii arteriale la domiciliu"
        };

        // Prescripții posibile
        String[] prescriptions = {
                "Paracetamol 500mg, 1 comprimat la 8 ore, 5 zile",
                "Ibuprofen 400mg, 1 comprimat la 12 ore, 7 zile",
                "Amoxicilină 500mg, 1 capsulă la 8 ore, 7 zile",
                "Omeprazol 20mg, 1 capsulă dimineața, 14 zile",
                "Metformin 500mg, 1 comprimat de două ori pe zi, 30 zile"
        };

        // Pentru fiecare doctor, creăm 5 ratinguri inițiale
        for (DoctorDTO doctor : doctors) {
            for (int i = 0; i < 5; i++) {
                // Creăm o programare virtuală finalizată în trecut
                AppointmentDTO virtualAppointment = new AppointmentDTO();
                virtualAppointment.setDoctor(doctor);

                // Alegem un pacient aleator
                PatientDTO patient = patients.get(random.nextInt(patients.size()));
                virtualAppointment.setPatient(patient);

                // Data în trecut (între 12 luni în urmă și 2 luni în urmă)
                int daysAgo = 60 + random.nextInt(305); // 60-365 zile în trecut
                LocalDate appointmentDate = LocalDate.now().minusDays(daysAgo);
                virtualAppointment.setAppointmentDate(Date.from(appointmentDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));

                // Status finalizat
                virtualAppointment.setStatus("Finalizată");

                // Motiv
                String[] reasons = {
                        "Consult de rutină",
                        "Dureri acute",
                        "Control periodic",
                        "Rezultate analize",
                        "Consultație post-operatorie"
                };
                virtualAppointment.setReason(reasons[random.nextInt(reasons.length)]);

                // Salvăm programarea
                AppointmentDTO savedAppointment = appointmentService.createAppointment(virtualAppointment);

                // Creăm consultația cu review pentru această programare
                ConsultationDTO consultationDTO = new ConsultationDTO();

                // Completăm datele consultației
                consultationDTO.setSymptoms(symptoms[random.nextInt(symptoms.length)]);
                consultationDTO.setDiagnosis(diagnoses[random.nextInt(diagnoses.length)]);

                // Adăugăm 1-3 recomandări aleatorii
                StringBuilder recommendationsText = new StringBuilder();
                int recommendationCount = 1 + random.nextInt(3);
                List<Integer> usedRecommendations = new ArrayList<>();

                for (int j = 0; j < recommendationCount; j++) {
                    int index;
                    do {
                        index = random.nextInt(recommendations.length);
                    } while (usedRecommendations.contains(index));

                    usedRecommendations.add(index);
                    recommendationsText.append(j + 1).append(". ").append(recommendations[index]).append("\n");
                }
                consultationDTO.setRecommendations(recommendationsText.toString().trim());

                // Adăugăm 0-2 prescripții aleatorii
                StringBuilder prescriptionsText = new StringBuilder();
                int prescriptionCount = random.nextInt(3);
                List<Integer> usedPrescriptions = new ArrayList<>();

                for (int j = 0; j < prescriptionCount; j++) {
                    int index;
                    do {
                        index = random.nextInt(prescriptions.length);
                    } while (usedPrescriptions.contains(index));

                    usedPrescriptions.add(index);
                    prescriptionsText.append(j + 1).append(". ").append(prescriptions[index]).append("\n");
                }

                if (prescriptionCount > 0) {
                    consultationDTO.setPrescriptions(prescriptionsText.toString().trim());
                } else {
                    consultationDTO.setPrescriptions("Fără prescripții medicamentoase.");
                }

                // Setăm ID-urile necesare
                consultationDTO.setAppointmentId(savedAppointment.getAppointmentId());
                consultationDTO.setPatientId(savedAppointment.getPatient().getPatientId());
                consultationDTO.setDoctorId(savedAppointment.getDoctor().getDoctorId());

                // Rating între 1 și 10
                int rating = 1 + random.nextInt(10);
                consultationDTO.setRating(rating);

                // Alegem un comentariu în funcție de rating
                String comment;
                if (rating >= 8) {
                    comment = positiveComments[random.nextInt(positiveComments.length)];
                } else if (rating >= 5) {
                    comment = averageComments[random.nextInt(averageComments.length)];
                } else {
                    comment = negativeComments[random.nextInt(negativeComments.length)];
                }
                consultationDTO.setReviewComment(comment);

                // Data review-ului - la 1-3 zile după consultație
                int daysToAdd = 1 + random.nextInt(3);
                LocalDateTime reviewDateTime = appointmentDate
                        .plusDays(daysToAdd)
                        .atTime(8 + random.nextInt(12), random.nextInt(60));

                consultationDTO.setReviewDate(reviewDateTime);

                // Salvăm consultația
                consultationService.createConsultation(consultationDTO);
            }
        }
    }

    private void createAppointments() {
        // Pregătim lista de doctori și pacienți
        List<DoctorDTO> doctors = doctorService.fetchDoctors();
        List<PatientDTO> patients = patientService.fetchPatients();

        // Date pentru programări - pentru ultimele 6 luni și următoarele 3 luni
        LocalDate today = LocalDate.now();
        Random random = new Random();

        // Creăm un ArrayList pentru toate cele 35 de programări pe care le vom amesteca la final
        List<AppointmentDTO> allAppointments = new ArrayList<>();

        // 1. Creăm 14 programări FINALIZATE
        for (int i = 0; i < 14; i++) {
            AppointmentDTO appointmentDTO = new AppointmentDTO();

            // Alegem un doctor aleator
            DoctorDTO doctor = doctors.get(random.nextInt(doctors.size()));
            appointmentDTO.setDoctor(doctor);

            // Alegem un pacient aleator
            PatientDTO patient = patients.get(random.nextInt(patients.size()));
            appointmentDTO.setPatient(patient);

            // Data în trecut (între 6 luni în urmă și ieri)
            int daysAgo = 1 + random.nextInt(180); // 1-180 zile în trecut
            LocalDate appointmentDate = today.minusDays(daysAgo);
            appointmentDTO.setAppointmentDate(Date.from(appointmentDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));

            // Status finalizat
            appointmentDTO.setStatus("Finalizată");

            // Motive posibile pentru programare
            String[] reasons = {
                    "Consult de rutină",
                    "Dureri acute",
                    "Control periodic",
                    "Rezultate analize",
                    "Consultație post-operatorie"
            };
            appointmentDTO.setReason(reasons[random.nextInt(reasons.length)]);

            // Adăugăm în lista generală
            allAppointments.add(appointmentDTO);
        }

        // 2. Creăm 8 programări ANULATE
        for (int i = 0; i < 8; i++) {
            AppointmentDTO appointmentDTO = new AppointmentDTO();

            // Alegem un doctor aleator
            DoctorDTO doctor = doctors.get(random.nextInt(doctors.size()));
            appointmentDTO.setDoctor(doctor);

            // Alegem un pacient aleator
            PatientDTO patient = patients.get(random.nextInt(patients.size()));
            appointmentDTO.setPatient(patient);

            // Alegem o dată în trecut (pentru programări anulate)
            int daysAgo = 1 + random.nextInt(180); // 1-180 zile în trecut
            LocalDate appointmentDate = today.minusDays(daysAgo);
            appointmentDTO.setAppointmentDate(Date.from(appointmentDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));

            // Status anulat
            appointmentDTO.setStatus("Anulată");

            // Motive posibile pentru programare
            String[] reasons = {
                    "Consult de rutină",
                    "Evaluare simptome noi",
                    "Monitorizare tratament",
                    "A doua opinie medicală"
            };
            appointmentDTO.setReason(reasons[random.nextInt(reasons.length)]);

            // Adăugăm în lista generală
            allAppointments.add(appointmentDTO);
        }

        // 3. Creăm 13 programări în viitor (PROGRAMATE)
        for (int i = 0; i < 13; i++) {
            AppointmentDTO appointmentDTO = new AppointmentDTO();

            // Alegem un doctor aleator
            DoctorDTO doctor = doctors.get(random.nextInt(doctors.size()));
            appointmentDTO.setDoctor(doctor);

            // Alegem un pacient aleator
            PatientDTO patient = patients.get(random.nextInt(patients.size()));
            appointmentDTO.setPatient(patient);

            // Alegem o dată în viitor (între mâine și 3 luni în viitor)
            int daysInFuture = 1 + random.nextInt(90); // 1-90 zile în viitor
            LocalDate appointmentDate = today.plusDays(daysInFuture);
            appointmentDTO.setAppointmentDate(Date.from(appointmentDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));

            // Toate programările viitoare au status "Programată"
            appointmentDTO.setStatus("Programată");

            // Motive posibile pentru programare
            String[] reasons = {
                    "Consult de rutină",
                    "Control periodic",
                    "Evaluare simptome noi",
                    "Monitorizare tratament",
                    "A doua opinie medicală"
            };
            appointmentDTO.setReason(reasons[random.nextInt(reasons.length)]);

            // Adăugăm în lista generală
            allAppointments.add(appointmentDTO);
        }

        // 4. AMESTECĂM aleatoriu toate programările pentru a nu fi grupate după status
        Collections.shuffle(allAppointments);

        // 5. Salvăm toate programările în baza de date (acum în ordine aleatorie)
        for (AppointmentDTO appointment : allAppointments) {
            appointmentService.createAppointment(appointment);
        }
    }

    private void createConsultations() {
        // Obținem toate programările finalizate
        List<AppointmentDTO> allAppointments = appointmentService.fetchAllAppointments();
        List<AppointmentDTO> finishedAppointments = new ArrayList<>();

        for (AppointmentDTO appointment : allAppointments) {
            if ("Finalizată".equals(appointment.getStatus())) {
                finishedAppointments.add(appointment);
            }
        }

        Random random = new Random();

        // Simptome posibile
        String[] symptoms = {
                "Febră, dureri de cap și oboseală",
                "Tuse persistentă și dificultăți de respirație",
                "Dureri abdominale și greață",
                "Dureri articulare și inflamație",
                "Amețeli și probleme de echilibru",
                "Dureri toracice și palpitații",
                "Probleme de vedere și dureri oculare"
        };

        // Diagnostice posibile
        String[] diagnoses = {
                "Infecție virală a căilor respiratorii superioare",
                "Hipertensiune arterială",
                "Artrită reumatoidă",
                "Migrenă cronică",
                "Dermatită atopică",
                "Gastrită acută",
                "Glaucom"
        };

        // Recomandări posibile
        String[] recommendations = {
                "Odihnă adecvată și hidratare",
                "Dietă echilibrată și scădere în greutate",
                "Exerciții fizice regulate adaptate condiției",
                "Evitarea stresului și practici de relaxare",
                "Monitorizarea tensiunii arteriale la domiciliu"
        };

        // Prescripții posibile
        String[] prescriptions = {
                "Paracetamol 500mg, 1 comprimat la 8 ore, 5 zile",
                "Ibuprofen 400mg, 1 comprimat la 12 ore, 7 zile",
                "Amoxicilină 500mg, 1 capsulă la 8 ore, 7 zile",
                "Omeprazol 20mg, 1 capsulă dimineața, 14 zile",
                "Metformin 500mg, 1 comprimat de două ori pe zi, 30 zile"
        };

        // Comentarii pentru review
        String[] positiveComments = {
                "Doctor excelent, foarte profesionist și atent la detalii.",
                "Am primit un tratament eficient, simptomele s-au ameliorat rapid.",
                "Medic foarte bine pregătit, explică clar diagnosticul și opțiunile de tratament.",
                "Consultație amănunțită, medic empatic și dedicat pacienților.",
                "Cel mai bun medic la care am fost vreodată, recomand cu încredere.",
                "M-a tratat cu respect și a explicat clar fiecare pas al tratamentului.",
                "Este un profesionist desăvârșit, a diagnosticat corect din prima.",
                "O experiență foarte plăcută, doctorul a fost atent și amabil."
        };

        String[] averageComments = {
                "Consultație bună, dar timpul de așteptare a fost destul de lung.",
                "Doctor competent, dar puțin cam grăbit în timpul consultației.",
                "Tratamentul a fost parțial eficient, am revenit pentru ajustări.",
                "Servicii medicale decente, dar recepția a fost dezorganizată.",
                "Doctor OK, dar nu a fost foarte comunicativ.",
                "Experiență satisfăcătoare, dar nimic ieșit din comun."
        };

        String[] negativeComments = {
                "Consultație superficială, simptomele nu au fost luate în serios.",
                "Timp de așteptare exagerat de lung, programările nu sunt respectate.",
                "Tratamentul prescris nu a avut efect, am avut nevoie de o a doua opinie.",
                "Nu a fost deloc atent la problemele mele, a părut distras.",
                "Mi-a prescris medicamente care mi-au provocat reacții adverse."
        };

        // Creăm consultații pentru programările finalizate
        for (AppointmentDTO appointment : finishedAppointments) {
            ConsultationDTO consultationDTO = new ConsultationDTO();

            // Completăm datele consultației
            consultationDTO.setSymptoms(symptoms[random.nextInt(symptoms.length)]);
            consultationDTO.setDiagnosis(diagnoses[random.nextInt(diagnoses.length)]);

            // Adăugăm 1-3 recomandări aleatorii
            StringBuilder recommendationsText = new StringBuilder();
            int recommendationCount = 1 + random.nextInt(3);
            List<Integer> usedRecommendations = new ArrayList<>();

            for (int i = 0; i < recommendationCount; i++) {
                int index;
                do {
                    index = random.nextInt(recommendations.length);
                } while (usedRecommendations.contains(index));

                usedRecommendations.add(index);
                recommendationsText.append(i + 1).append(". ").append(recommendations[index]).append("\n");
            }
            consultationDTO.setRecommendations(recommendationsText.toString().trim());

            // Adăugăm 0-2 prescripții aleatorii
            StringBuilder prescriptionsText = new StringBuilder();
            int prescriptionCount = random.nextInt(3);
            List<Integer> usedPrescriptions = new ArrayList<>();

            for (int i = 0; i < prescriptionCount; i++) {
                int index;
                do {
                    index = random.nextInt(prescriptions.length);
                } while (usedPrescriptions.contains(index));

                usedPrescriptions.add(index);
                prescriptionsText.append(i + 1).append(". ").append(prescriptions[index]).append("\n");
            }

            if (prescriptionCount > 0) {
                consultationDTO.setPrescriptions(prescriptionsText.toString().trim());
            } else {
                consultationDTO.setPrescriptions("Fără prescripții medicamentoase.");
            }

            // Setăm ID-urile necesare
            consultationDTO.setAppointmentId(appointment.getAppointmentId());
            consultationDTO.setPatientId(appointment.getPatient().getPatientId());
            consultationDTO.setDoctorId(appointment.getDoctor().getDoctorId());

            // Rating între 1 și 10
            int rating = 1 + random.nextInt(5);
            consultationDTO.setRating(rating);

            // Alegem un comentariu în funcție de rating
            String comment;
            if (rating >= 8) {
                comment = positiveComments[random.nextInt(positiveComments.length)];
            } else if (rating >= 5) {
                comment = averageComments[random.nextInt(averageComments.length)];
            } else {
                comment = negativeComments[random.nextInt(negativeComments.length)];
            }
            consultationDTO.setReviewComment(comment);

            // Data review-ului - la 1-3 zile după consultație
            Appointment appt = appointmentService.loadAppointmentById(consultationDTO.getAppointmentId());
            LocalDate appointmentDate = appt.getAppointmentDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

            int daysToAdd = 1 + random.nextInt(3);
            LocalDateTime reviewDateTime = appointmentDate
                    .plusDays(daysToAdd)
                    .atTime(8 + random.nextInt(12), random.nextInt(60));

            consultationDTO.setReviewDate(reviewDateTime);

            // Salvăm consultația
            consultationService.createConsultation(consultationDTO);
        }
    }
}