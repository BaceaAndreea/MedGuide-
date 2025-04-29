import {Patient} from './patient.model';
import {Doctor} from './doctor.model';

export class LoggedUser{
  constructor(public username : string,
              public roles : string[],
              private _token : string,
              public _expiration : Date,
              public patient : Patient | undefined,
              public doctor : Doctor | undefined,
              public passwordTemporary: boolean = false) {
  }

  get token(){
    if(!this._expiration || new Date() > this._expiration){
      return null
    }
    return this._token;
  }
}
