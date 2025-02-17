import {Doctor} from './doctor.model';
import {Patient} from './patient.model';

export interface Appointment{
  appointmentId : number;
  appointmentDate : Date;
  status: string;
  doctor : Doctor;
  patient : Patient;
}
