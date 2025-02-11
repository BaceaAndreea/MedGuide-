import {User} from './user.model';
import {Specialization} from './specialization.model';
import {Hospital} from './hospital.model';

export interface Doctor {
  doctorId : number;
  firstName : string;
  lastName : string;
  birthDate : Date;
  user : User;
  specialization : Specialization;
  hospital : Hospital;
}
