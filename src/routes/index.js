// Import the Router class from Express
import { Router } from "express";
// Function to set up API routes
const routerApi = (app) => {

  // Create a new Router instance
  const router = Router();

  // Use the router instance for the '/app/v1' path
  app.use('/app/v1', router);
}

// Export the routerApi function for use in other parts of the application
export default routerApi;
