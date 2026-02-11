declare module "mongoose" {
  const mongoose: any;
  export default mongoose;

  export type ObjectId = any;
  export type Document = any;
  export type Model<T = any> = any;
  export type Schema<T = any> = any;
  export type Query<T = any> = any;
  export type FilterQuery<T = any> = any;
  export type PaginateOptions = any;
  export type PaginateModel<T = any> = any;
  export type PipelineStage = any;

  export const Schema: any;
  export const Types: any;
  export function model<T = any>(...args: any[]): Model<T>;

  export namespace Types {
    type ObjectId = any;
  }
}
