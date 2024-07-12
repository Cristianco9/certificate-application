// Import the Router class from Express
import { Router } from "express";
// Import the studentsRouter for handling student-related routes
import { studentsRouter } from "./studentsRouter";

// Function to set up API routes
const routerApi = (app) => {

  // Create a new Router instance
  const router = Router();

  // Use the router instance for the '/api/v1' path
  app.use('api/v1', router);

  // Use the studentsRouter for handling '/students' routes under '/api/v1'
  router.use('students', studentsRouter);
}

// Export the routerApi function for use in other parts of the application
export default routerApi;
