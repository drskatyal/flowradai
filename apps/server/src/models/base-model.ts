import { Document, Schema } from "mongoose";

export interface IBaseModel extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;

  hardDelete(): Promise<void>;
  delete(): Promise<void>;
}
//TODO: Schema inheritance is not working properly, needs to find a better way
const baseSchema = new Schema<IBaseModel>(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: Record<string, any>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Middleware to handle soft deletion
baseSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

baseSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

// Method for hard deletion
baseSchema.methods.hardDelete = async function () {
  await this.remove();
};

// Method for soft deletion
baseSchema.methods.delete = async function () {
  this.isDeleted = true;
  await this.save();
};

export default baseSchema;
