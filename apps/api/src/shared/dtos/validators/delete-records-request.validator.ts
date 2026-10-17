import { Injectable } from '@nestjs/common';
import {
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

type DeleteRecordsRequestShape = {
  id: number | null;
  ids: number[];
};

@Injectable()
@ValidatorConstraint({ name: 'DeleteRecordsRequest', async: false })
export class DeleteRecordsRequestConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const request = args.object as DeleteRecordsRequestShape;
    const hasId = Number.isInteger(request.id);
    const hasIds = request.ids.length > 0;

    return hasId !== hasIds;
  }
}
