import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }], default: [] })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: [] })
  tags: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Create indexes for better query performance
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ members: 1 });
ProjectSchema.index({ status: 1 });