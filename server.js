require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const moment = require('moment-timezone');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const path = require('path');
const dataController = require('./controllers/dataController');
const ipServer = process.env.IPCLIENT +  process.env.PORT_CLIENT
const Data = require('./models/Data');
const cron = require('node-cron');
const { generatePDF} = require('./utils/triggerPDFCreater');

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Serve images
const currentDirectory = process.cwd();
const imagePath = process.env.PATH_IMAGE.replace(/\\\\/g, '/');
const imagePathZip = process.env.PATH_IMAGE_ZIP.replace(/\\\\/g, '/');
const imageDirectory = path.join(imagePath);
const imageDirectoryZip = path.join(imagePathZip);
const uploadFolderPath = path.join(currentDirectory, 'upload/default');
app.use('/images', express.static(imageDirectory));
app.use('/zip', express.static(imageDirectoryZip));
app.use('/default', express.static(uploadFolderPath));


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
const dataCountVehicle = async () => {
  try {
    const data = await dataController.getCountData(1)
    io.sockets.emit('vehicleData', data); // Gửi dữ liệu đến tất cả các kết nối
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
const sendVehicleData = () => {
  dataCountVehicle();
};
const dataInterval = setInterval(sendVehicleData, 5000);
// Socket
const server = http.createServer(app);
const io = socketIo(server, { 
    cors :true,
    origin:[`${ipServer}`]
 });

io.on('connection', (socket) => {
  console.log('Client connected');
  sendVehicleData();
});
io.on('disconnect', () => {
  console.log('Client disconnected');
  clearInterval(dataInterval);
});

cron.schedule('0 8,20 * * *', async () => {
  const currentHour = new Date().getHours();
  if (currentHour == 20){
    try {
      var result = await generatePDF(1);
      if(result == "sent") console.log('PDF generated and email sent successfully!');
      else console.log(result.message)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  else{
    try {
      var result = await generatePDF(2);
      if(result == "sent") console.log('PDF generated and email sent successfully!');
      else console.log(result.message)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
})
// Start server
const port = process.env.PORT_SERVER || 3500;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("version 0.1")
});

