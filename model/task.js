const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  companyId:{
    type: mongoose.ObjectId,
    required: true
  },
  assigneeId:{
    type: mongoose.ObjectId,
    required: true
  },
  assignedToId:{
    type:mongoose.ObjectId,
    require: true
  },
  assignedToName:{
    type: String,
    required: true
  },
  assigneeName:{
    type: String,
    required: true
  },
  taskTitle:{
    type: String,
    required:true
  },
  taskDesc:{
    type:String,
    required:true
  },
  dateOfAssignment:{
    type: Date,
    required: true
  },
  deadLine:{
    type: Date,
    required: true
  },
  dateOfCompletion:{
    type: Date
  },
  completed:{
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model('tasks', taskSchema)