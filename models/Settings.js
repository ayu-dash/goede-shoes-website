const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    bankAccounts: [
      {
        bankName: String,
        accountNumber: String,
        accountHolder: String,
      },
    ],
    shippingRatePerKm: {
      type: Number,
      default: 10000,
    },
    midtransConfig: {
      serverKey: { type: String, default: "" },
      clientKey: { type: String, default: "" },
      isProduction: { type: Boolean, default: false },
      isActive: { type: Boolean, default: false },
    },
    storeInfo: {
      name: {
        type: String,
        default: "Goede Shoes",
      },
      address: String,
      openTime: String,
      closeTime: String,
      phone: String,
      email: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    aboutText: {
      type: String,
      default: "GOEDE SHOES adalah jasa perawatan sepatu premium yang berfokus pada kualitas dan detail. Kami melayani berbagai jenis sepatu dengan teknik yang tepat dan bahan berkualitas tinggi."
    }
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
