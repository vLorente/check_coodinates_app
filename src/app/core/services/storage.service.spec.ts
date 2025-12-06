import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and load data', () => {
    const testData = { id: '1', name: 'Test' };

    service.save('test', testData);
    const loaded = service.load<typeof testData>('test');

    expect(loaded).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const result = service.load('non-existent');
    expect(result).toBeNull();
  });

  it('should remove data', () => {
    const testData = { value: 'test' };

    service.save('test', testData);
    expect(service.has('test')).toBe(true);

    service.remove('test');
    expect(service.has('test')).toBe(false);
  });

  it('should clear all prefixed data', () => {
    service.save('key1', { data: '1' });
    service.save('key2', { data: '2' });

    expect(service.has('key1')).toBe(true);
    expect(service.has('key2')).toBe(true);

    service.clear();

    expect(service.has('key1')).toBe(false);
    expect(service.has('key2')).toBe(false);
  });

  it('should check if key exists', () => {
    expect(service.has('test')).toBe(false);

    service.save('test', { data: 'value' });

    expect(service.has('test')).toBe(true);
  });

  it('should handle complex objects', () => {
    const complexData = {
      id: '1',
      nested: {
        array: [1, 2, 3],
        obj: { key: 'value' }
      },
      date: new Date().toISOString()
    };

    service.save('complex', complexData);
    const loaded = service.load<typeof complexData>('complex');

    expect(loaded).toEqual(complexData);
  });
});
