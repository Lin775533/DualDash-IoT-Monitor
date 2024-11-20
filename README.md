# Smart Environment Monitor

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D4.4-green)](https://www.mongodb.com/)
[![ESP8266](https://img.shields.io/badge/ESP8266-NodeMCU-blue)](https://www.espressif.com/)
[![AWS IoT Core](https://img.shields.io/badge/AWS-IoT%20Core-orange)](https://aws.amazon.com/iot-core/)
[![AWS SNS](https://img.shields.io/badge/AWS-SNS-green)](https://aws.amazon.com/sns/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)

> A professional IoT solution for real-time environmental monitoring, featuring multi-sensor data collection, instant alerts, and comprehensive data visualization through a modern web dashboard.

### Cloud Infrastructure
```mermaid
graph LR
    subgraph AWS Cloud
        IC[IoT Core] --> Lambda[Lambda Functions]
        Lambda --> DDB[(DynamoDB)]
        Lambda --> SNS[SNS]
        SNS --> Email[Email Alerts]
        SNS --> SMS[SMS Alerts]
        DDB --> API[API Gateway]
        API --> WEB[Web Dashboard]
    end
    ESP[ESP8266] -->|MQTT| IC
    WEB -->|REST| API
```

<div align="center">
  <img src="docs/images/dashboard.jpg" alt="Dashboard Preview" width="600">
</div>

## 📑 Table of Contents
- [Overview](#-overview)
- [Application Scenarios](#-application-scenarios)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technical Implementation](#-technical-implementation)
- [Getting Started](#-getting-started)
- [AWS Integration](#-aws-integration)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🔍 Overview

Smart Environment Monitor is an enterprise-grade IoT system that combines hardware sensors, cloud connectivity, and data analytics to provide comprehensive environmental monitoring. The system utilizes ESP8266 microcontrollers and various sensors to capture real-time environmental data, process it through a robust backend infrastructure, and present actionable insights through an intuitive web interface.

### Key Capabilities
- Real-time environmental data monitoring
- Instant alert notifications
- Historical data analysis
- Cloud-based data storage
- Mobile-responsive dashboard

## 🎯 Application Scenarios

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/images/greenhouse.png" width="120" alt="Smart Agriculture"/><br/>
        <b>Smart Agriculture</b><br/>
        Optimize crop growth with automated climate control
      </td>
      <td align="center">
        <img src="docs/images/warehouse.png" width="120" alt="Industrial"/><br/>
        <b>Industrial</b><br/>
        Monitor inventory conditions & security
      </td>
      <td align="center">
        <img src="docs/images/datacenter.png" width="120" alt="Data Centers"/><br/>
        <b>Data Centers</b><br/>
        Protect IT equipment & optimize power
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="docs/images/laboratory.png" width="120" alt="Laboratory"/><br/>
        <b>Laboratory</b><br/>
        Maintain precise research conditions
      </td>
      <td align="center">
        <img src="docs/images/office.png" width="120" alt="Smart Buildings"/><br/>
        <b>Smart Buildings</b><br/>
        Enhance comfort & energy efficiency
      </td>
      <td align="center">
        <img src="docs/images/logistics.png" width="120" alt="Cold Chain"/><br/>
        <b>Cold Chain</b><br/>
        Track conditions during transport
      </td>
    </tr>
  </table>
</div>

### Key Benefits
- 🌡️ 24/7 Environmental Monitoring
- ⚡ Real-time Alerts & Response
- 📊 Data Analytics & Reporting
- 🔐 Compliance & Documentation
- ⚙️ Automation & Integration

## ⭐ Features

- **Multi-Sensor Integration**
  - Temperature & Humidity (DHT11)
  - Ambient Light (LDR)
  - Motion Detection (MPU6050)
  - Visual & Audio Alerts

- **Advanced Data Processing**
  - Real-time data analysis
  - Customizable alert thresholds
  - Historical trend analysis
  - Data export capabilities

- **Robust Architecture**
  - MQTT-based communication
  - REST API endpoints
  - MongoDB data storage
  - AWS IoT Core integration

- **Security & Reliability**
  - SSL/TLS encryption
  - Automated data backup
  - Error handling & recovery
  - Comprehensive logging

## 🏗 System Architecture

### Core Components

```mermaid
graph LR
    subgraph Hardware
        LDR[LDR Sensor] -->|Light Data| ESP[ESP8266]
        MPU[MPU6050] -->|Movement Data| ESP
        ESP -->|Display| LCD[LCD Display]
    end

    subgraph Local Processing
        ESP -->|Process & Format| MQTT[MQTT Client]
        ESP -->|Check| TH[Thresholds]
    end

    subgraph Cloud Services
        MQTT -->|Publish| NODE[Node.js Server]
        NODE -->|Store Data| DB[(MongoDB)]
        NODE -->|Process| ALERT[Alert System]
        ALERT -->|Notifications| NOTIFY[Email/SMS]
    end

    subgraph Data Visualization
        DB <-->|Query| API[REST API]
        API -->|Read Data| VDASH[Visualization Dashboard]
        VDASH -->|View Data| USER1[User]
    end

    subgraph Threshold Control
        TDASH[Threshold Dashboard] -->|Update| TH
        USER2[User] -->|Adjust Thresholds| TDASH
    end

    style ESP fill:#f9f,stroke:#333,stroke-width:2px
    style DB fill:#bbf,stroke:#333,stroke-width:2px
    style VDASH fill:#bfb,stroke:#333,stroke-width:2px
    style TDASH fill:#fbf,stroke:#333,stroke-width:2px
```

### Data Flow
1. **Data Collection** → Sensors gather environmental data
2. **Local Processing** → ESP8266 processes and validates data
3. **Cloud Transmission** → Data sent to cloud via MQTT
4. **Storage & Analysis** → Server processes and stores data
5. **Visualization** → Data displayed on web dashboard

## 🛠 Technical Implementation

### Hardware Configuration
| Component | Connection | Purpose |
|-----------|------------|----------|
| DHT11 | GPIO4 (D2) | Temperature & Humidity |
| LDR | ADC (A0) | Light Level |
| MPU6050 | I2C (D1/D2) | Movement Detection |
| LED | GPIO12 (D6) | Visual Alerts |
| Buzzer | GPIO14 (D5) | Audio Alerts |

### Software Stack
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML5, JavaScript, Chart.js
- **IoT**: MQTT, AWS IoT Core
- **DevOps**: Docker, PM2

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 14.0.0
- MongoDB ≥ 4.4
- Arduino IDE with ESP8266 support
- AWS Account (optional)

### Quick Start
1. Clone the repository
2. Configure environment variables
3. Install dependencies
4. Deploy hardware components
5. Start the application

Detailed setup instructions available in our [Development Guide](docs/development.md).

## AWS Integration

### AWS Services Used
- **AWS IoT Core**: For secure MQTT communication
- **AWS SNS**: For alert notifications
- **AWS DynamoDB** (Optional): For data storage

### Setup Instructions

1. **AWS IoT Core Setup**
   - Create a Thing in AWS IoT Core
   - Download certificates (cert.pem, private.key, public.key)
   - Place certificates in `certs/` directory
   - Rename certificates to match config:
     - `Monitor.cert.pem`
     - `Monitor.private.key`
     - `Monitor.public.key`
     - `root-CA.crt`

2. **AWS SNS Setup**
   - Create an SNS topic
   - Create a subscription (email, SMS, etc.)
   - Note down the Topic ARN

3. **Configuration**
   - Copy `config/aws-config.template.js` to `config/aws-config.js`
   - Update with your AWS details:
     ```javascript
     {
         region: 'YOUR_AWS_REGION',
         iot: {
             endpoint: 'YOUR_IOT_ENDPOINT',
             // other IoT settings...
         },
         sns: {
             topicArn: 'YOUR_SNS_TOPIC_ARN',
             accessKeyId: 'YOUR_ACCESS_KEY_ID',
             secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
         }
     }
     ```

4. **IAM Setup**
   - Create an IAM policy for IoT Core access
   - Attach policy to your certificates
   - Required permissions:
     - `iot:Connect`
     - `iot:Publish`
     - `iot:Subscribe`
     - `iot:Receive`

### Security Notes
- Never commit AWS credentials to GitHub
- Keep certificates secure
- Use environment variables for sensitive data
- Follow AWS security best practices

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- MQTT Broker: test.mosquitto.org
- Chart.js for data visualization
- Bootstrap for UI components
- ESP8266 Community

## Technical Skills Demonstrated
1. **IoT Development**
   - Sensor integration and calibration
   - Real-time data acquisition
   - MQTT protocol implementation
   - Embedded systems programming

2. **Full-Stack Development**
   - RESTful API design
   - Frontend development with React
   - Backend development with Node.js
   - Database design and management

3. **Data Analysis**
   - Real-time data processing
   - Data visualization

## System Architecture

### Hardware Components
- ESP8266 NodeMCU
- DHT11 Temperature & Humidity Sensor
- Light Dependent Resistor (LDR)
- MPU6050 Accelerometer
- LED for visual alerts
- Buzzer for audio alerts

### Software Components
1. **Device Layer**
   ```
   ESP8266 Firmware
   ├── Sensor Readings
   │   ├── Temperature & Humidity (DHT11)
   │   ├── Light Level (LDR)
   │   └── Movement (MPU6050)
   ├── Alert System
   │   ├── LED Control
   │   └── Buzzer Control
   └── MQTT Client
       └── Data Publishing
   ```

2. **Server Layer**
   ```
   Node.js Server
   ├── MQTT Broker
   │   ├── Topic: envmonitor/data
   │   └── Topic: envmonitor/alerts
   ├── MongoDB Database
   │   ├── Sensor Readings Collection
   │   └── Alerts Collection
   └── REST API
       ├── /api/data/latest
       ├── /api/data/range
       ├── /api/alerts
       └── /api/stats
   ```

3. **Client Layer**
   ```
   Web Dashboard
   ├── Real-time Display
   │   ├── Current Sensor Values
   │   └── Active Alerts
   ├── Historical Data
   │   ├── Temperature Chart
   │   ├── Light Level Chart
   │   └── Movement Chart
   └── Statistics Panel
       └── Min/Max/Avg Values
```

### Data Flow
```mermaid
graph TD
    A[ESP8266] -->|MQTT| B[Node.js Server]
    B -->|Store| C[(MongoDB)]
    B -->|REST API| D[Web Dashboard]
    D -->|Display| E[Charts & Stats]
```

### Alert System
```javascript
// Device-side (ESP8266)
if (sensorValue > threshold) {
    triggerLocalAlert();  // LED + Buzzer
    publishAlert();       // MQTT Alert
}

// Server-side
mqtt.on('alert', (message) => {
    io.emit('alert', message);  // WebSocket to dashboard
});

// Dashboard-side
socket.on('alert', (message) => {
    showNotification(message);
});
```
