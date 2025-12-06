import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform GET request', fakeAsync(async () => {
    const mockData = { message: 'test' };

    const promise = service.get<typeof mockData>('/test');

    const req = httpMock.expectOne('http://localhost:8000/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    tick();

    const result = await promise;
    expect(result).toEqual(mockData);
  }));

  it('should perform POST request', fakeAsync(async () => {
    const mockBody = { data: 'test' };
    const mockResponse = { id: '1', success: true };

    const promise = service.post<typeof mockResponse>('/test', mockBody);

    const req = httpMock.expectOne('http://localhost:8000/api/test');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);
    req.flush(mockResponse);

    tick();

    const result = await promise;
    expect(result).toEqual(mockResponse);
  }));

  it('should handle GET error', fakeAsync(async () => {
    let errorCaught = false;
    const promise = service.get('/test');

    const req = httpMock.expectOne('http://localhost:8000/api/test');
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    tick();

    try {
      await promise;
    } catch (error: any) {
      errorCaught = true;
      expect(error.message).toContain('Error 500');
    }

    expect(errorCaught).toBe(true);
  }));

  it('should handle POST error', fakeAsync(async () => {
    let errorCaught = false;
    const promise = service.post('/test', {});

    const req = httpMock.expectOne('http://localhost:8000/api/test');
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    tick();

    try {
      await promise;
    } catch (error: any) {
      errorCaught = true;
      expect(error.message).toContain('Error 404');
    }

    expect(errorCaught).toBe(true);
  }));
});
