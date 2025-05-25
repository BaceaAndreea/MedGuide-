import {Doctor} from './doctor.model';
import {Patient} from './patient.model';

export interface Appointment{
  appointmentId : number;
  appointmentDate : string;
  doctor : Doctor;
  patient : Patient;
  reason: string;
  status: string;

}
