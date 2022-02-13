const http = require('http')
const express = require('express')
const yup = require('yup')
const mongoose = require('mongoose');
const { Schema } = mongoose;
const hostName = 'home_mongo'


mongoose.connect(`mongodb://${hostName}:27017/fm_mongoose`)
.catch(error => {console.log(error), process.exit(0)});

const chema = yup.string().email().required()


const tasksSchema = new Schema({
  description: {type: String, required:[true, 'must be'], validate: {
    validator: (v) => /[A-Z][a-z\s!]{5,200}/.test(v)
  }},
  idDone: {type: Boolean, default: false},
  dateAt: { type: Date, default: Date.now },
  author: {
    name: {type: String, required: true},
    email: {type: String, required: true, validate: {
      validator: (v) => chema.isValid(v)
    }},
    age: {type: Number, default: null, validate: {
      validator: (v) => v<0?0:v
    }}  
  }  
}, {versionKey: false,
   timestamps: true    
})

const commentSchema = new Schema({
  title: {type: String, required:true},
  task: {type: Schema.Types.ObjectId, ref: 'Task'}
}, {
  versionKey: false
})

const Task = mongoose.model('Task', tasksSchema);
const Comment = mongoose.model('Comment', commentSchema);



const PORT = process.env.PORT || 8080
console.log(PORT);
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

app.patch('/:taskId', async (req, res, next) => {
  try {
    const {params: {taskId}, body}  = req
   const updateTask = await Task.findOneAndUpdate({_id:taskId}, body, {new: true})
   res.send(updateTask)
  } catch (error) {
    next(error)
  }
})

app.delete('/:taskId', async (req, res, next) => {
  try {
     const {params: {taskId}} = req
    const deleteTask = await Task.findOneAndRemove({_id:taskId})
    if(deleteTask) {
     return res.send(deleteTask)
    }
    res.sendStatus(404)
  } catch (error) {
    next(error)
  }
})

app.post('/:taskId/comments', async (req, res, next) => {
  try {
     const {params: {taskId}, body} = req
    const comment = await Comment.create({...body, task:taskId})
  res.status(200).send(comment)
  } catch (error) {
    next(error)
  }
})


// app.get('/comments', async (req, res, next) => {
//   try {
//       const allComment = await Comment.find()
//   res.status(200).send(allComment)
//   } catch (error) {
//     next(error)
//   }
// })
 
app.get('/comments', async (req, res, next) => {
  try {
      Comment.find().populate('task').exec((err, comments) => {
       if(err) {
         throw new Error('some went wrong')
       }
       res.send(comments)
      })
  
  } catch (error) {
    next(error)
  }
})


const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`Server is run on ${PORT}`);
})