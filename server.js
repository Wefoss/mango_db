const http = require('http')
const express = require('express')
const yup = require('yup')
const mongoose = require('mongoose');
const { async } = require('regenerator-runtime');
const { Schema } = mongoose;


mongoose.connect('mongodb://localhost:27017/fm_mongoose').catch(error => console.log(error));

const tasksSchema = new Schema({
  description: {type: String, required:[true, 'must be']},
  idDone: {type: Boolean, default: false},
  dateAt: { type: Date, default: Date.now },
  author: {
    name: {type: String, required: true},
    email: {type: String, required: true, validate: {
      validator: () => yup.string().email()
    }},
    age: {type: Number, default: null, validate: {
      validator: (v) => v>0?v:0
    }}
  }
})

const Task = mongoose.model('Task', tasksSchema);



const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.post('/', async (req, res ,next) => {
  try { 
      const {body} = req
    const newTask = await Task.create(body)
    res.status(200).send(newTask)
  } catch (error) {
     next(error)
  }
})

app.get('/', async (req, res ,next) => {
  try {
      const tasks = await Task.find()
      res.send(tasks)
  } catch (error) {
    next(error)
  }
})

const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`Server is run on ${PORT}`);
})