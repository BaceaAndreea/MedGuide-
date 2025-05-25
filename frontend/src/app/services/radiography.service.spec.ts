import { TestBed } from '@angular/core/testing';

import { RadiographyService } from './radiography.service';

describe('RadiographyService', () => {
  let service: RadiographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadiographyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
