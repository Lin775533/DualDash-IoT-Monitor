const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
const bodyParser = require('body-parser');
const awsIoTService = require('./services/aws-iot');
const awsSNSService = require('./services/aws-sns');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from public directory

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB Atlas');
});

// MongoDB Schema
const SensorDataSchema = new mongoose.Schema({
    temperature: Number,
    light: Number,
    accel_x: Number,
    accel_y: Number,
    accel_z: Number,
    alert: Boolean,
    timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', SensorDataSchema);

// Threshold values
const THRESHOLDS = {
    temperature: { min: 20, max: 30 }, // Celsius
    light: { min: 100, max: 1000 },    // Lux
    movement: 2.0                      // g (acceleration threshold)
};

// Check if sensor values exceed thresholds
async function checkThresholds(data) {
    const alerts = [];
    
    if (data.temperature < THRESHOLDS.temperature.min) {
        alerts.push(`Temperature too low: ${data.temperature}°C`);
    } else if (data.temperature > THRESHOLDS.temperature.max) {
        alerts.push(`Temperature too high: ${data.temperature}°C`);
    }

    if (data.light < THRESHOLDS.light.min) {
        alerts.push(`Light level too low: ${data.light} lux`);
    } else if (data.light > THRESHOLDS.light.max) {
        alerts.push(`Light level too high: ${data.light} lux`);
    }

    const movement = Math.sqrt(
        Math.pow(data.accel_x, 2) + 
        Math.pow(data.accel_y, 2) + 
        Math.pow(data.accel_z, 2)
    );

    if (movement > THRESHOLDS.movement) {
        alerts.push(`Significant movement detected: ${movement.toFixed(2)}g`);
    }

    if (alerts.length > 0) {
        // Send alert via SNS
        const message = `Smart Environment Monitor Alerts:\n${alerts.join('\n')}`;
        try {
            await awsSNSService.sendNotification(message, 'Environmental Alert');
            console.log('Alert notification sent');
        } catch (error) {
            console.error('Error sending SNS notification:', error);
        }
    }

    return alerts.length > 0;
}

// MQTT Client
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('envmonitor/data');
});

mqttClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        
        // Check thresholds and set alert status
        data.alert = await checkThresholds(data);
        
        // Save to MongoDB
        const sensorData = new SensorData(data);
        await sensorData.save();
        console.log('Saved sensor data:', data);

        // Forward to AWS IoT Core
        try {
            await awsIoTService.publishMessage('envmonitor/data', {
                ...data,
                timestamp: new Date().toISOString()
            });
            console.log('Data forwarded to AWS IoT Core');
        } catch (error) {
            console.error('Error publishing to AWS IoT:', error);
        }
    } catch (error) {
        console.error('Error processing sensor data:', error);
    }
});

// REST API Routes

// Root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Get latest sensor data
app.get('/api/data/latest', async (req, res) => {
    try {
        const data = await SensorData.findOne().sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// Get sensor data for a specific time range
app.get('/api/data/range', async (req, res) => {
    try {
        const { start, end } = req.query;
        const data = await SensorData.find({
            timestamp: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        }).sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// Get all alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await SensorData.find({ alert: true })
            .sort({ timestamp: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching alerts' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await SensorData.aggregate([
            {
                $group: {
                    _id: null,
                    avgTemp: { $avg: '$temperature' },
                    maxTemp: { $max: '$temperature' },
                    minTemp: { $min: '$temperature' },
                    avgLight: { $avg: '$light' },
                    alertCount: {
                        $sum: { $cond: ['$alert', 1, 0] }
                    }
                }
            }
        ]);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error calculating statistics' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
