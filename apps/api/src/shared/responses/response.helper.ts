import { type ClassConstructor, plainToInstance } from 'class-transformer';

export function toResponseDto<T>(dtoClass: ClassConstructor<T>, data: unknown[]): T[];
export function toResponseDto<T>(dtoClass: ClassConstructor<T>, data: unknown): T;
export function toResponseDto<T>(dtoClass: ClassConstructor<T>, data: unknown): T | T[] {
  return plainToInstance(dtoClass, data, { excludeExtraneousValues: true });
}
