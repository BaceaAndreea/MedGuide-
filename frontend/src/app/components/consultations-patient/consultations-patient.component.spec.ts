import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsPatientComponent } from './consultations-patient.component';

describe('ConsultationsPatientComponent', () => {
  let component: ConsultationsPatientComponent;
  let fixture: ComponentFixture<ConsultationsPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsPatientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationsPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
