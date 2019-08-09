const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  team: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  teamDesc: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model('Team', teamSchema)