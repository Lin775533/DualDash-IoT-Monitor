const awsIoT = require('aws-iot-device-sdk');
const path = require('path');
const config = require('./config/aws-config');
const fs = require('fs');

// Verify certificates exist
const certsPath = path.join(__dirname, 'certs');
const certFiles = {
    key: path.join(certsPath, 'Monitor.private.key'),
    cert: path.join(certsPath, 'Monitor.cert.pem'),
    ca: path.join(certsPath, 'root-CA.crt')
};

// Check if certificates exist
Object.entries(certFiles).forEach(([type, filepath]) => {
    if (!fs.existsSync(filepath)) {
        console.error(`ERROR: ${type} file not found at ${filepath}`);
        process.exit(1);
    } else {
        console.log(`✓ Found ${type} file`);
    }
});

console.log('AWS IoT Endpoint:', config.iot.endpoint);

// Create device with debug options
const device = awsIoT.device({
    keyPath: certFiles.key,
    certPath: certFiles.cert,
    caPath: certFiles.ca,
    clientId: `testClient_${Math.random().toString(16).substring(2, 8)}`,
    host: config.iot.endpoint,
    debug: true  // Enable debugging
});

// Connection status flag
let isConnected = false;

// Set up connection handler
device.on('connect', () => {
    console.log('✓ Successfully connected to AWS IoT Core!');
    isConnected = true;
    
    // Subscribe to our topic
    device.subscribe('envmonitor/data', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('✓ Subscribed to envmonitor/data');
            // Send a test message after successful subscription
            sendTestMessage();
        }
    });
});

// Handle errors
device.on('error', (error) => {
    console.error('Connection error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    isConnected = false;
});

// Handle reconnect
device.on('reconnect', () => {
    console.log('Attempting to reconnect...');
});

// Handle incoming messages
device.on('message', (topic, payload) => {
    console.log('Received message:');
    console.log('Topic:', topic);
    console.log('Message:', payload.toString());
});

// Handle close
device.on('close', () => {
    console.log('Connection closed');
    isConnected = false;
});

// Handle offline
device.on('offline', () => {
    console.log('Device went offline');
    isConnected = false;
});

// Function to send a test message
function sendTestMessage() {
    const testMessage = {
        deviceId: 'TestDevice001',
        temperature: 25.5,
        light: 500,
        movement: true,
        timestamp: new Date().toISOString()
    };

    console.log('Sending test message...');
    device.publish('envmonitor/data', JSON.stringify(testMessage), (error) => {
        if (error) {
            console.error('Failed to publish:', error);
        } else {
            console.log('✓ Test message published successfully!');
        }
    });
}

// Keep the script running and show connection status
setInterval(() => {
    console.log(`Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    if (isConnected) {
        sendTestMessage();
    }
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Closing connection...');
    device.end(true, () => {
        console.log('Connection closed cleanly');
        process.exit();
    });
});
