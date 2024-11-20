#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "Jimmy&Tim";
const char* password = "1234567890";

// MQTT Configuration
const char* mqtt_server = "test.mosquitto.org";  // More reliable public MQTT broker
const int mqtt_port = 1883;
const char* mqtt_client_id = ("ESP8266_Monitor_" + String(random(0xffff), HEX)).c_str();  // Random client ID
const char* mqtt_topic_data = "envmonitor/data";
const char* mqtt_topic_alert = "envmonitor/alert";
const char* mqtt_topic_control = "envmonitor/control";

// Pin Definitions
const int SDA_PIN = 4;         // GPIO4  - Fixed for I2C
const int SCL_PIN = 5;         // GPIO5  - Fixed for I2C
const int PHOTO_PIN = A0;      // Analog input for photoresistor
const int BUZZER_PIN = 15;     // GPIO15 (D8) - Changed to raw GPIO number

// LED Bar Graph pins
const int LED_PINS[] = {
    16,     // GPIO16 (D0) - LED1
    0,      // GPIO0  (D3) - LED2
    2,      // GPIO2  (D4) - LED3
    14,     // GPIO14 (D5) - LED4
    12,     // GPIO12 (D6) - LED5
    13,     // GPIO13 (D7) - LED6
};
const int NUM_LEDS = 6;  // Using 6 LEDs

// Thresholds and Constants
float LIGHT_THRESHOLD = 70.0;    // Light threshold in percentage
float TEMP_THRESHOLD = 30.0;     // Temperature threshold in Celsius
float MOVE_THRESHOLD = 2.0;      // Movement threshold in g
const unsigned long DISPLAY_INTERVAL = 500;   // Display update interval in ms
const unsigned long ALERT_INTERVAL = 1000;    // Alert sound interval in ms
const unsigned long MQTT_INTERVAL = 2000;     // MQTT publish interval in ms
const unsigned long DEBOUNCE_DELAY = 2000;  // 2 second debounce

// I2C Devices
LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_MPU6050 mpu;

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient mqtt(espClient);

// Global variables
float temperature = 0;
int lightLevel = 0;
float accelX = 0, accelY = 0, accelZ = 0;
bool alert = false;
bool alertState = false;
unsigned long lastAlertToggle = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastMqttPublish = 0;
unsigned long lastDebounceTime = 0;  // For debouncing alerts

void setup_wifi() {
    delay(10);
    Serial.println("\nConnecting to WiFi...");
    lcd.clear();
    lcd.print("WiFi connecting");
    
    WiFi.mode(WIFI_STA);  // Set station mode
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        lcd.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected");
        Serial.println("IP address: " + WiFi.localIP().toString());
        
        lcd.clear();
        lcd.print("WiFi connected");
        lcd.setCursor(0, 1);
        lcd.print(WiFi.localIP().toString());
    } else {
        Serial.println("\nWiFi connection failed!");
        lcd.clear();
        lcd.print("WiFi failed!");
    }
    delay(2000);
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.println(message);
    
    // Parse JSON command
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
        // Handle threshold updates
        if (doc.containsKey("temp_threshold")) {
            float new_temp = doc["temp_threshold"];
            if (new_temp > 0 && new_temp < 100) {
                temperature = new_temp;
                Serial.printf("Temperature threshold updated to: %.1f\n", temperature);
            }
        }
        
        if (doc.containsKey("light_threshold")) {
            float new_light = doc["light_threshold"];
            if (new_light > 0 && new_light < 100) {
                LIGHT_THRESHOLD = new_light;
                Serial.printf("Light threshold updated to: %.1f%%\n", LIGHT_THRESHOLD);
            }
        }
    }
}

void setup_mqtt() {
    // Generate random client ID
    String clientId = mqtt_client_id;
    
    mqtt.setServer(mqtt_server, mqtt_port);
    mqtt.setCallback(mqtt_callback);
    
    Serial.println("Setting up MQTT...");
    lcd.clear();
    lcd.print("MQTT Setup...");
}

void reconnect_mqtt() {
    int attempts = 0;
    while (!mqtt.connected() && attempts < 3) {
        Serial.print("Attempting MQTT connection...");
        lcd.clear();
        lcd.print("MQTT connecting");
        
        // Generate random client ID
        String clientId = mqtt_client_id;
        
        if (mqtt.connect(clientId.c_str())) {
            Serial.println("connected");
            lcd.clear();
            lcd.print("MQTT connected");
            mqtt.subscribe(mqtt_topic_control);
            delay(1000);  // Show MQTT connected message briefly
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqtt.state());
            Serial.println(" retry in 5 seconds");
            lcd.clear();
            lcd.print("MQTT failed!");
            lcd.setCursor(0, 1);
            lcd.print("RC: " + String(mqtt.state()));
            delay(5000);
        }
        attempts++;
    }
}

void publish_data() {
    if (!mqtt.connected()) {
        return;
    }

    if (millis() - lastMqttPublish >= MQTT_INTERVAL) {
        lastMqttPublish = millis();
        
        // Create JSON document
        StaticJsonDocument<200> doc;
        doc["temperature"] = temperature;
        doc["light"] = lightLevel;
        doc["accel_x"] = accelX;
        doc["accel_y"] = accelY;
        doc["accel_z"] = accelZ;
        doc["alert"] = alert;
        
        char buffer[200];
        serializeJson(doc, buffer);
        
        Serial.print("Publishing data: ");  // Added debug message
        Serial.println(buffer);             // Added debug message
        
        // Print debug info
        Serial.println("Publishing: " + String(buffer));
        
        // Publish to MQTT
        if (mqtt.publish(mqtt_topic_data, buffer)) {
            Serial.println("Publish success");
        } else {
            Serial.println("Publish failed");
        }
        
        if (alert) {
            mqtt.publish(mqtt_topic_alert, "1");
        }
    }
}

void setup() {
    Serial.begin(115200);
    delay(2000);
    Serial.println("\nESP8266 Environmental Monitor");
    
    // Initialize I2C
    Wire.begin(SDA_PIN, SCL_PIN);
    
    // Initialize LCD
    lcd.init();
    lcd.backlight();
    lcd.print("Initializing...");
    
    // Initialize MPU6050
    Serial.println("Initializing MPU6050...");
    if (!mpu.begin()) {
        Serial.println("Could not find a valid MPU6050 sensor, check wiring!");
        lcd.clear();
        lcd.print("MPU6050 Failed!");
        while (1);
    }
    
    // Configure MPU6050
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    
    // Initialize pins
    pinMode(BUZZER_PIN, OUTPUT);
    for (int i = 0; i < NUM_LEDS; i++) {
        pinMode(LED_PINS[i], OUTPUT);
    }
    
    // Test components
    testComponents();
    
    // Setup WiFi and MQTT
    setup_wifi();
    setup_mqtt();
    
    lcd.clear();
    lcd.print("System Ready!");
    Serial.println("Setup complete!");
}

void testComponents() {
    Serial.println("\nTesting components:");
    
    // Test buzzer
    Serial.println("Testing buzzer...");
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(BUZZER_PIN, LOW);
    
    // Test LEDs one by one
    Serial.println("Testing LEDs...");
    for (int i = 0; i < NUM_LEDS; i++) {
        digitalWrite(LED_PINS[i], HIGH);
        Serial.printf("LED%d ON\n", i+1);
        delay(300);
        digitalWrite(LED_PINS[i], LOW);
        yield();
    }
}

void updateLEDBar(int value, int maxValue) {
    Serial.printf("\nUpdating LED bar - Light value: %d/%d\n", value, maxValue);
    
    // Calculate how many LEDs should be lit
    int numLEDs = map(value, 0, maxValue, 0, NUM_LEDS);
    Serial.printf("LEDs to light: %d\n", numLEDs);
    
    // Update each LED with debug output
    for (int i = 0; i < NUM_LEDS; i++) {
        bool state = i < numLEDs;
        digitalWrite(LED_PINS[i], state);
        Serial.printf("LED%d (GPIO%d): %s\n", i+1, LED_PINS[i], state ? "ON" : "OFF");
        yield();
    }
}

void handleAlerts() {
    static bool lastAlert = false;
    bool newAlert = false;
    static unsigned long lastMovementAlert = 0;
    static unsigned long lastChangeTime = 0;
    
    // Debug print current values and thresholds
    Serial.println("\n--- Sensor Values ---");
    Serial.printf("Temperature: %.1f°C (Threshold: %.1f°C)\n", temperature, TEMP_THRESHOLD);
    Serial.printf("Light Level: %d (Threshold: %.1f%%)\n", lightLevel, LIGHT_THRESHOLD);
    Serial.printf("Acceleration: X=%.2f Y=%.2f Z=%.2f\n", accelX, accelY, accelZ);
    
    // Temperature check (alert on high temperature)
    if (temperature > TEMP_THRESHOLD) {
        Serial.println("Temperature Alert!");
        newAlert = true;
    }
    
    // Light level check (only alert in very dark conditions)
    float lightPercent = (lightLevel / 1023.0) * 100;
    if (lightPercent > LIGHT_THRESHOLD) {  // Using consistent percentage threshold
        Serial.println("Light Level Alert!");
        Serial.print("Light Level: ");
        Serial.print(lightPercent);
        Serial.println("%");
        newAlert = true;
    }
    
    // Movement check (only significant movements)
    float baselineG = 9.81;  // Earth's gravity
    float currentG = sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ);
    float gDifference = abs(currentG - baselineG);
    
    if (gDifference > MOVE_THRESHOLD) {
        if (millis() - lastMovementAlert > 5000) {  // Only alert every 5 seconds
            Serial.println("Movement Alert!");
            newAlert = true;
            lastMovementAlert = millis();
        }
    }
    
    // Update alert state with debouncing
    if (newAlert != alert) {
        if (millis() - lastChangeTime > 2000) {  // 2 second debounce
            alert = newAlert;
            lastChangeTime = millis();
            
            // Handle buzzer state change
            if (alert) {
                digitalWrite(BUZZER_PIN, HIGH);
                alertState = true;
                lastAlertToggle = millis();
                Serial.println("Alert started!");
            } else {
                digitalWrite(BUZZER_PIN, LOW);
                alertState = false;
                Serial.println("Alert stopped!");
            }
        }
    }
    
    // Handle buzzer toggling when alert is active
    if (alert) {
        if (millis() - lastAlertToggle >= ALERT_INTERVAL) {
            lastAlertToggle = millis();
            alertState = !alertState;
            digitalWrite(BUZZER_PIN, alertState);
        }
    }
    
    lastAlert = alert;
}

void readSensors() {
    // Read MPU6050
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    temperature = temp.temperature;
    accelX = a.acceleration.x;
    accelY = a.acceleration.y;
    accelZ = a.acceleration.z;
    
    // Read light level
    lightLevel = analogRead(PHOTO_PIN);
    
    // Debug output
    Serial.printf("Temp: %.2f°C, Light: %d, Accel: X=%.2f Y=%.2f Z=%.2f\n",
                 temperature, lightLevel, accelX, accelY, accelZ);
    
    // Update LED bar based on light level
    updateLEDBar(lightLevel, 1024);
}

void updateDisplay() {
    unsigned long currentMillis = millis();
    if (currentMillis - lastDisplayUpdate >= DISPLAY_INTERVAL) {
        lastDisplayUpdate = currentMillis;
        
        // First line: Temperature and Light
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("T:");
        lcd.print(temperature, 1);
        lcd.print("C L:");
        lcd.print(map(lightLevel, 0, 1024, 0, 100));
        lcd.print("%");
        
        // Second line: Acceleration and Alert
        lcd.setCursor(0, 1);
        lcd.print("X:");
        lcd.print(accelX, 1);
        lcd.print(" ");
        lcd.print(alert ? "ALERT!" : "Normal");
    }
}

void printDebug() {
    // Print debug info every second
    static unsigned long lastDebugTime = 0;
    if (millis() - lastDebugTime >= 1000) {
        lastDebugTime = millis();
        
        Serial.println("\nSensor Readings:");
        Serial.printf("Temperature: %.1f°C\n", temperature);
        Serial.printf("Light Level: %d (%d%%)\n", 
                     lightLevel, 
                     map(lightLevel, 0, 1024, 0, 100));
        Serial.printf("Acceleration (g): X=%.2f Y=%.2f Z=%.2f\n", 
                     accelX, accelY, accelZ);
        Serial.printf("Alert Status: %s\n", 
                     alert ? "ACTIVE" : "Normal");
    }
}

void loop() {
    // Print WiFi status
    Serial.printf("WiFi status: %d\n", WiFi.status());
    
    // Maintain WiFi and MQTT connections
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected, reconnecting...");
        setup_wifi();
    }
    
    if (!mqtt.connected()) {
        Serial.println("MQTT disconnected, reconnecting...");
        reconnect_mqtt();
    }
    mqtt.loop();
    
    // Your existing functionality
    readSensors();      // Read all sensor values
    handleAlerts();     // Check and handle alerts
    updateDisplay();    // Update LCD display
    printDebug();      // Print debug information
    
    // Publish data to MQTT
    publish_data();
    
    yield();           // Prevent watchdog timer reset
    delay(50);         // Small delay for stability
}