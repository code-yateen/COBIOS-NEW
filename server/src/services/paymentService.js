const Payment = require("../models/Payment");
const User = require("../models/User");
const Membership = require("../models/Membership");
const { daysBetween } = require("../utils/helpers");

class PaymentService {
  async processPayment(paymentData) {
    const { memberId, membershipId, amount, paymentMethod } = paymentData;

    // Verify membership exists
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      throw new Error("Membership plan not found");
    }

    // Verify member exists
    const member = await User.findById(memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Create payment record
    const payment = await Payment.create({
      memberId,
      membershipId,
      amount,
      paymentMethod,
      status: "completed",
    });

    // Update member's membership and expiry
    const expiryDate = new Date();
    if (membership.durationType === "days") {
      expiryDate.setDate(expiryDate.getDate() + membership.duration);
    } else if (membership.durationType === "months") {
      expiryDate.setMonth(expiryDate.getMonth() + membership.duration);
    } else if (membership.durationType === "years") {
      expiryDate.setFullYear(expiryDate.getFullYear() + membership.duration);
    }

    await User.findByIdAndUpdate(memberId, {
      membershipId,
      membershipExpiry: expiryDate,
    });

    return payment;
  }

  async getPaymentStats() {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments: await Payment.countDocuments({ status: "pending" }),
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }
}

module.exports = new PaymentService();

