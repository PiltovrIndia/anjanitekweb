import { object, string } from "yup"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = object({
  collegeId: string(),
  username: string(),
  requestStatus: string(),
  requestType: string()
});
