
export interface Consultation {
  consultationId: number;
  diagnosis: string;
  appointmentId: number;
  appointmentDate: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  hospitalAddress: string;
}
