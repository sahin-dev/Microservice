import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  dependsOn: boolean;
  dependsOn: any;
  assigneeId: boolean;
  assigneeId: any;
}