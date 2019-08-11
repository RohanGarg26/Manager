const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  compDesc: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    indexes: {
      unique: true
    }
  },
  password: {
    type: String,
    require: true,
    indexes: {
      unique: true
    }
  }
})

module.exports = mongoose.model('Companies', companySchema)