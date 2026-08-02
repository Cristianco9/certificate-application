// Import the Router class from Express
import { Router } from "express";

// Import the Services Routes for handle services related-routes
import countryRouter from "./countryRouter.js";
import academicLevelRouter from "./academicLevelRouter.js";
import genderRouter from "./genderRouter.js";
import roleRouter from "./roleRouter.js";

// Function to set up API routes
const routerApi = (app) => {

  // Create a new Router instance
  const router = Router();

  // Use the router instance for the '/app/v1' path
  app.use('/app/v1', router);

  // Catalog of the sub-routes
  router.use('/academic-levels', academicLevelRouter);
  router.use('/genders', genderRouter);
  router.use('/roles', roleRouter);
  router.use('/countries', countryRouter);
}

// Export the routerApi function for use in other parts of the application
export default routerApi;
