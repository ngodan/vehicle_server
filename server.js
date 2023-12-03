require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const path = require('path');
const dataController = require('./controllers/dataController');
const Data = require('./models/Data');

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Serve images
const imagePath = process.env.PATH_IMAGE.replace(/\\\\/g, '/');
const imageDirectory = path.join(imagePath);
app.use('/images', express.static(imageDirectory));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', async () => {
  console.log('Connected to MongoDB');
  const dataChangeStream = Data.watch();

  dataChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert' || change.operationType === 'update') {
        const changedDocument = await Data.findOne({ _id: change.documentKey._id });

        if (!changedDocument) {
          console.log('Document not found');
          return;
        }

        const changed = { document: changedDocument, operationType: change.operationType };
        const result = await dataController.getDataStream(changed, null);
        console.log(result)
        io.emit('dataUpdate', result);
      } else {
        console.log('Unsupported operation type:', change.operationType);
      }
    } catch (error) {
      console.error('Error in emitData:', error);
    }
  });

  dataChangeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Socket
const server = http.createServer(app);
const io = socketIo(server, { 
    cors :true,
    origin:['http://10.0.2.15:80']
 });

io.on('connection', (socket) => {
  console.log('Client connected');
});

// Start server
const port = process.env.PORT_SERVER || 8800;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
