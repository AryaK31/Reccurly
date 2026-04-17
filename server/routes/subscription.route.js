// import { Router } from "express";
// import {
//   cancelSubscription,
//   createSubscription,
//   deleteSubscription,
//   getSubscription,
//   getSubscriptions,
//   getUpcomingRenewals,
//   getUserSubscriptions,
//   updateSubscription,
// } from "../controllers/subscription.controller.js";
// import authorize from "../middlewares/auth.middleware.js";

// const subscriptionRouter = Router();

// subscriptionRouter.use(authorize);

// // GET authenticated user's subscriptions
// subscriptionRouter.get("/me/upcoming-renewals", getUpcomingRenewals);
// subscriptionRouter.get("/me", getSubscriptions);

// // GET upcoming renewals of a user
// subscriptionRouter.get("/upcoming-renewals", getUpcomingRenewals);

// // GET all subscriptions of a user
// subscriptionRouter.get("/user/:id", getUserSubscriptions);

// // GET subscription by id
// subscriptionRouter.get("/:id", getSubscription);

// // GET authenticated user's subscriptions
// subscriptionRouter.get("/", getSubscriptions);

// // POST create subscription
// subscriptionRouter.post("/", createSubscription);

// // PUT update subscription by id
// subscriptionRouter.put("/:id", updateSubscription);

// // DELETE delete subscription by id
// subscriptionRouter.delete("/:id", deleteSubscription);

// // PUT cancel subscription of a user
// subscriptionRouter.put("/:id/cancel", cancelSubscription);

// export default subscriptionRouter;




import { Router } from "express";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscription,
  getSubscriptions,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.use(authorize);

subscriptionRouter.get("/me", getSubscriptions);
subscriptionRouter.get("/me/upcoming-renewals", getUpcomingRenewals);

subscriptionRouter.get("/upcoming", getUpcomingRenewals);
subscriptionRouter.get("/upcoming-renewals", getUpcomingRenewals);

subscriptionRouter.get("/user/:id", getUserSubscriptions);

subscriptionRouter.get("/:id", getSubscription);
subscriptionRouter.get("/", getSubscriptions);
subscriptionRouter.post("/", createSubscription);
subscriptionRouter.put("/:id", updateSubscription);
subscriptionRouter.delete("/:id", deleteSubscription);

subscriptionRouter.patch("/:id/cancel", cancelSubscription);
subscriptionRouter.put("/:id/cancel", cancelSubscription);

export default subscriptionRouter;
