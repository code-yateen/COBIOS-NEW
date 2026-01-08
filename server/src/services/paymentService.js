const Payment = require("../models/Payment");
const User = require("../models/User");
const Membership = require("../models/Membership");
const { daysBetween, calculateMembershipExpiry } = require("../utils/helpers");

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
    const expiryDate = calculateMembershipExpiry(
      membership.duration,
      membership.durationType,
      new Date()
    );

    const updatedMember = await User.findByIdAndUpdate(
      memberId,
      {
        membershipId,
        membershipExpiry: expiryDate,
      },
      { new: true }
    ).select("-password");

    // Return payment with expiry date info
    const paymentObj = payment.toObject();
    return {
      ...paymentObj,
      membershipExpiry: expiryDate,
      membershipExpiryFormatted: expiryDate.toISOString(),
    };
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

