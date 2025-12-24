const USER_ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  MEMBER: "member",
};

const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "Cash",
  "Online",
  "UPI",
  "Bank Transfer",
];

const NOTIFICATION_TYPES = {
  MEMBERSHIP: "membership",
  PAYMENT: "payment",
  PLAN: "plan",
  FEEDBACK: "feedback",
  ACHIEVEMENT: "achievement",
  ADMIN: "admin",
  SYSTEM: "system",
};

const NOTIFICATION_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const FEEDBACK_CATEGORIES = {
  TRAINER: "trainer",
  FACILITY: "facility",
  SERVICE: "service",
  GENERAL: "general",
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TYPES = [
  "Breakfast",
  "Mid-Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
  "Post-Workout",
];

module.exports = {
  USER_ROLES,
  MEMBERSHIP_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  FEEDBACK_CATEGORIES,
  WEEK_DAYS,
  MEAL_TYPES,
};

