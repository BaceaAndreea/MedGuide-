import {User} from './user.model';

export interface Patient {
  patientId : number;
  firstName : string;
  lastName : string;
  medicalHistory: string[];
  allergies: string[];
  user : User;
}
