import mongoose, { Document } from 'mongoose';

export type MessageKind = 'CONTACT' | 'NEWSLETTER';

export interface IMessage extends Document {
  kind: MessageKind;
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  handled: boolean;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    kind: { type: String, enum: ['CONTACT', 'NEWSLETTER'], required: true },
    name: { type: String, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
    subject: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 3000 },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One newsletter row per address; contact messages are unlimited.
messageSchema.index({ email: 1, kind: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
