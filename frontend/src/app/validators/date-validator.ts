import {AbstractControl, ValidatorFn} from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const currentDate = new Date();


    currentDate.setHours(0, 0, 0, 0);


    if (selectedDate < currentDate) {
      return { 'pastDate': true };
    }

    return null;
  };
}
