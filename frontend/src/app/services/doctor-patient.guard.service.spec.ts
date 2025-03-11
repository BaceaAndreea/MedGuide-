import { TestBed } from '@angular/core/testing';

import { DoctorPatientGuardService } from './doctor-patient.guard.service';

describe('DoctorPatientGuardService', () => {
  let service: DoctorPatientGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorPatientGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
