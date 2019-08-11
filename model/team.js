const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  team: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  teamDesc: {
    type: String,
    required: true
  },
  companyId: {
    type:  mongoose.ObjectId,
    required: true,
  }
})

module.exports = mongoose.model('Team', teamSchema)