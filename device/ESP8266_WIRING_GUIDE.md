# ESP8266 Wiring Guide for Smart Environment Monitor

## Component List
1. ESP8266 NodeMCU Board
2. MPU6050 Module
3. I2C LCD1602 Display
4. Photoresistor
5. LED Bar Graph (10 LEDs)
6. Buzzer
7. Resistors:
   - 1x 10kΩ (for photoresistor)
   - 10x 220Ω (for LED bar graph)
   - 1x 1kΩ (for buzzer)

## Pin Connections

### 1. MPU6050 Module
```
MPU6050 → ESP8266
VCC     → 3.3V
GND     → GND
SCL     → D1 (GPIO5)
SDA     → D2 (GPIO4)
```

### 2. I2C LCD1602
```
LCD1602 → ESP8266
VCC     → 5V (Vin pin on NodeMCU)
GND     → GND
SDA     → D2 (GPIO4)
SCL     → D1 (GPIO5)
```

### 3. Photoresistor Circuit
```
Photoresistor → ESP8266
1. Connect one leg of photoresistor to 3.3V
2. Connect other leg to:
   - A0 (Analog Input)
   - 10kΩ resistor to GND (voltage divider)
```

### 4. LED Bar Graph (10 LEDs)
```
LED Bar Graph → ESP8266 (each through 220Ω resistor)
LED1    → D0  (GPIO16)
LED2    → D3  (GPIO0)
LED3    → D4  (GPIO2)
LED4    → D5  (GPIO14)
LED5    → D6  (GPIO12)
LED6    → D7  (GPIO13)
LED7    → D8  (GPIO15)
LED8    → D9  (GPIO3)
LED9    → D10 (GPIO1)
LED10   → SD3 (GPIO10)

Common Cathode → GND
```

### 5. Buzzer
```
Buzzer  → ESP8266
Positive → SD2 (GPIO9) through 1kΩ resistor
Negative → GND
```

## Important Notes

### Power Supply
1. NodeMCU can be powered via:
   - USB port (5V)
   - Vin pin (5V)
   - 3.3V pin (not recommended for full setup)

### ESP8266 Specific Considerations
1. The analog input (A0) can only read 0-1V by default
   - The voltage divider with photoresistor is designed for this range
2. GPIO pins are 3.3V logic level
   - The LED bar graph and buzzer still work fine with 3.3V
3. Some GPIO pins have special functions:
   - GPIO16 (D0): Can wake up from deep sleep
   - GPIO15 (D8): Boot mode selection
   - GPIO0 (D3): Boot mode selection
   - GPIO2 (D4): Boot mode selection

### I2C Configuration
1. I2C is shared between MPU6050 and LCD1602
2. Pull-up resistors are usually included on NodeMCU board
3. Default I2C pins are:
   - SDA: GPIO4 (D2)
   - SCL: GPIO5 (D1)

## Troubleshooting Tips

### WiFi Connection Issues
1. Check WiFi credentials in code
2. Verify WiFi signal strength
3. Monitor Serial output for connection status

### Sensor Reading Issues
1. MPU6050 not responding:
   - Check I2C address (usually 0x68)
   - Verify 3.3V power connection
   - Check I2C connections

2. LCD not displaying:
   - Verify I2C address (usually 0x27)
   - Check contrast adjustment
   - Ensure 5V power connection

3. Incorrect light readings:
   - Check voltage divider connections
   - Verify A0 connection
   - Test in different light conditions

4. LED Bar Graph issues:
   - Check individual LED connections
   - Verify resistor values
   - Test each LED pin individually

## Required Libraries
```cpp
#include <ESP8266WiFi.h>      // Built-in
#include <PubSubClient.h>      // Install via Library Manager
#include <Wire.h>              // Built-in
#include <MPU6050.h>          // Install via Library Manager
#include <LiquidCrystal_I2C.h> // Install via Library Manager
#include <ArduinoJson.h>       // Install via Library Manager
```

## First-Time Setup
1. Install required libraries in Arduino IDE
2. Set WiFi credentials in code
3. Configure MQTT broker address
4. Select correct board in Arduino IDE:
   - Board: "NodeMCU 1.0 (ESP-12E Module)"
   - Upload Speed: "115200"
   - CPU Frequency: "80 MHz"
   - Flash Size: "4M (1M SPIFFS)"
5. Upload code and monitor via Serial for debugging

## Power Consumption Notes
- Full setup draws approximately 150-200mA
- USB power is sufficient
- Can be powered by 5V power bank for portable use
- Sleep mode available but not implemented in current code
