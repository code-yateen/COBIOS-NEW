const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
} = require("../validators/userValidator");

router.use(auth);
router.use(roleGuard("admin"));

router.get("/", userController.getAllUsers);
router.get("/:id", userIdValidator, validate, userController.getUserById);
router.post("/", createUserValidator, validate, userController.createUser);
router.put("/:id", userIdValidator, updateUserValidator, validate, userController.updateUser);
router.delete("/:id", userIdValidator, validate, userController.deleteUser);
router.patch("/:id/status", userIdValidator, validate, userController.toggleUserStatus);

module.exports = router;

