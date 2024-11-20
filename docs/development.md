# Development Guide

This guide provides detailed instructions for setting up and developing the Smart Environment Monitor project.

## Development Environment Setup

### 1. Hardware Requirements
- ESP8266 NodeMCU
- DHT11 Temperature & Humidity Sensor
- Light Dependent Resistor (LDR)
- MPU6050 Accelerometer
- LED
- Buzzer
- Breadboard and jumper wires

### 2. Software Requirements
- Node.js v14+ and npm
- MongoDB v4.4+
- Arduino IDE
- Git

### 3. IDE Setup
1. **Arduino IDE**
   - Install ESP8266 board support
   - Required libraries:
     - `PubSubClient` for MQTT
     - `DHT sensor library`
     - `Adafruit MPU6050`
     - `ArduinoJson`

2. **VS Code** (recommended)
   - Extensions:
     - ESLint
     - Prettier
     - MongoDB for VS Code
     - REST Client

## Project Setup

### 1. Clone and Install
```bash
# Clone repository
git clone https://github.com/[your-username]/SmartEnvironmentMonitor.git
cd SmartEnvironmentMonitor

# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install
```

### 2. Configuration
1. Server Configuration
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/envmonitor
   MQTT_BROKER=mqtt://test.mosquitto.org
   ```

2. Device Configuration
   - Open `device/config.h`
   - Update WiFi credentials
   - Update MQTT broker details

### 3. Database Setup
1. Start MongoDB
2. Create database and collections:
   ```javascript
   use envmonitor
   db.createCollection('readings')
   db.createCollection('alerts')
   ```

## API Documentation

### Sensor Data Endpoints

#### GET /api/data/latest
Get latest sensor readings
```json
{
  "temperature": 25.4,
  "humidity": 65,
  "light": 80,
  "movement": 0.5
}
```

#### GET /api/data/range
Get historical data within time range
```
GET /api/data/range?start=2023-01-01&end=2023-01-02
```

#### GET /api/alerts
Get alert history
```json
[
  {
    "type": "temperature",
    "value": 32,
    "threshold": 30,
    "timestamp": "2023-01-01T12:00:00Z"
  }
]
```

### MQTT Topics

#### Publishing
- `envmonitor/data`: Sensor readings
- `envmonitor/alerts`: Alert messages
- `envmonitor/device/status`: Device status

#### Subscribing
- `envmonitor/device/config`: Configuration updates
- `envmonitor/device/command`: Device commands

## Testing

### Unit Tests
```bash
cd server
npm test
```

### Integration Tests
```bash
cd server
npm run test:integration
```

### Hardware Testing
1. LED Test
   ```cpp
   void testLED() {
     digitalWrite(LED_PIN, HIGH);
     delay(1000);
     digitalWrite(LED_PIN, LOW);
   }
   ```

2. Sensor Test
   ```cpp
   void testSensors() {
     float temp = dht.readTemperature();
     float humidity = dht.readHumidity();
     // Print values to Serial Monitor
   }
   ```

## Deployment

### Server Deployment
1. Build the application:
   ```bash
   cd server
   npm run build
   ```

2. Start with PM2:
   ```bash
   pm2 start dist/app.js --name "envmonitor"
   ```

### Device Deployment
1. Set production configuration in `config.h`
2. Upload firmware through Arduino IDE
3. Monitor through Serial port for successful connection

## Troubleshooting

### Common Issues

1. **MQTT Connection Failed**
   - Check broker address
   - Verify network connectivity
   - Check credentials

2. **Sensor Reading Errors**
   - Verify wiring connections
   - Check power supply
   - Validate sensor libraries

3. **Database Connection Issues**
   - Check MongoDB service
   - Verify connection string
   - Check network access

### Debug Mode
Enable debug logging:
```javascript
// Server
DEBUG=envmonitor:* npm start

// Device
#define DEBUG_MODE 1
```

## Contributing Guidelines

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Follow Angular commit message convention

### Pull Request Process
1. Create feature branch
2. Update documentation
3. Add tests
4. Create PR with description

### Review Process
1. Code review by maintainers
2. Pass all tests
3. Update based on feedback
4. Merge when approved
