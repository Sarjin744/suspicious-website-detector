const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    url: String,
    create_date: String,
    update_date: String,
    country: String,
    analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Website', websiteSchema);
