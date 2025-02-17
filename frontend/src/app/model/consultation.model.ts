import {Appointment} from './appointment.model';

export interface Consultation {
  consultationId : number;
  diagnosis : string;
  appointment : Appointment;
}
