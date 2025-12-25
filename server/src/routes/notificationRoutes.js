const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const { param } = require("express-validator");

const notificationIdValidator = [
  param("id").isMongoId().withMessage("Invalid notification ID format"),
];

router.use(auth);

router.get("/", notificationController.getNotifications);
router.get("/unread", notificationController.getUnreadNotifications);
router.patch("/:id/read", notificationIdValidator, validate, notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationIdValidator, validate, notificationController.deleteNotification);
router.post("/", roleGuard("admin"), notificationController.createNotification);

module.exports = router;

