const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  studentId: { type: String, required: true },
  faculty: { type: String, required: true },
  phoneNo: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)*sliit\.lk$/, 'Please fill a valid university email address']
  },
  password: { type: String, required: true, minlength: 8 },
  idPhotoUrl: { type: String, default: '' }, // We can store local file path or AWS S3 link
  role: { 
    type: String, 
    enum: ['Student', 'Seller', 'Faculty', 'Admin'], 
    default: 'Student' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'blocked', 'inactive'], 
    default: 'pending' // Defaults to pending so Admins must approve new students
  },
  isEmailVerified: { type: Boolean, default: false }, // Updated by OTP engine
  otpSecret: { type: String }, // Temporary storage for OTP hashed/encrypted verification
  otpExpiresAt: { type: Date }
}, { timestamps: true });

// Avoid returning password strings back to JSON calls
UserSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj.password;
    delete obj.otpSecret;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
