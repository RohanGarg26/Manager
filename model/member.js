const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    indexes: {
      unique: true
    }
  },
  imageUrl: {
    type: String
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDesc: {
    type: String,
    required: true
  },
  team: {
    type: String
  },
  companyId: {
    type: mongoose.ObjectId,
    required: true
  },
  teamId: {
    type: mongoose.ObjectId,
    required: true
  },
  teamHead: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    indexes: {
      unique: true
    }
  }
})

module.exports = mongoose.model('Member', memberSchema)