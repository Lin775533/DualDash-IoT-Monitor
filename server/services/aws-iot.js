const awsIoT = require('aws-iot-device-sdk');
const config = require('../config/aws-config');
const path = require('path');

class AWSIoTService {
    constructor() {
        const certsPath = path.join(__dirname, '..', 'certs');
        this.device = awsIoT.device({
            keyPath: path.join(certsPath, 'Monitor.private.key'),
            certPath: path.join(certsPath, 'Monitor.cert.pem'),
            caPath: path.join(certsPath, 'root-CA.crt'),
            clientId: config.iot.clientId,
            host: config.iot.endpoint
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.device.on('connect', () => {
            console.log('Connected to AWS IoT Core');
            this.device.subscribe('envmonitor/data');
            this.device.subscribe('envmonitor/alerts');
        });

        this.device.on('message', (topic, payload) => {
            console.log('Received message:', topic, payload.toString());
            // Handle different topics
            switch(topic) {
                case 'envmonitor/data':
                    this.handleSensorData(JSON.parse(payload.toString()));
                    break;
                case 'envmonitor/alerts':
                    this.handleAlert(JSON.parse(payload.toString()));
                    break;
            }
        });

        this.device.on('error', (error) => {
            console.error('AWS IoT Error:', error);
        });
    }

    handleSensorData(data) {
        // Store data in MongoDB and check thresholds
        // This will be implemented when we update the main app
    }

    handleAlert(alert) {
        // Trigger SNS notification
        // This will be implemented when we update the main app
    }

    publishMessage(topic, message) {
        return new Promise((resolve, reject) => {
            this.device.publish(topic, JSON.stringify(message), (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = new AWSIoTService();
