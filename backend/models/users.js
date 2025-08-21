const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { 
    type: String,
    validate: {
      validator: function(v) {
        // Must start with +254 followed by 9 digits
        return /^\+254\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Format must be +254XXXXXXXXX`
    },
    required: [true, 'User phone number required']
  },
  avatar: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
