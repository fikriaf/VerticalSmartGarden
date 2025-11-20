# Library Installation Guide

## Required Libraries for ESP8266

### 1. ESP8266 Board Support
Already installed if you can select NodeMCU board.

### 2. DHT Sensor Library
- Open Arduino IDE
- Go to: Sketch → Include Library → Manage Libraries
- Search: **DHT sensor library**
- Install: **DHT sensor library by Adafruit**
- Also install: **Adafruit Unified Sensor**

### 3. ArduinoJson
- Search: **ArduinoJson**
- Install: **ArduinoJson by Benoit Blanchon** (version 6.x)

### 4. LiquidCrystal I2C (ESP8266 Compatible)
**WARNING**: Library "LiquidCrystal I2C" by Frank de Brabander tidak kompatibel dengan ESP8266!

**Gunakan salah satu library ini:**

#### Option A: LiquidCrystal_I2C by Marco Schwartz (Recommended)
- Search: **LiquidCrystal I2C**
- Install: **LiquidCrystal I2C by Marco Schwartz**
- Compatible dengan ESP8266

#### Option B: Manual Install
Download dari: https://github.com/johnrickman/LiquidCrystal_I2C
1. Download ZIP
2. Sketch → Include Library → Add .ZIP Library
3. Select downloaded ZIP

## Verify Installation

After installing all libraries, restart Arduino IDE and check:
- Sketch → Include Library → Should see all libraries listed

## If LCD Library Still Has Issues

Use this alternative code without external LCD library:

```cpp
// Add at top of Code_ESP8266.ino
#include <LiquidCrystal_I2C.h>

// If error, comment out LCD code and use Serial only:
// Comment out all lcd.xxx() lines
// System will work without LCD, data shown in Serial Monitor only
```

## Test Each Library

### Test DHT22:
```cpp
#include "DHT.h"
#define DHTPIN 13
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  Serial.println(t);
  delay(2000);
}
```

### Test I2C Scanner (without LCD library):
```cpp
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin(4, 5); // SDA, SCL
  Serial.println("I2C Scanner");
}

void loop() {
  for(byte i = 1; i < 127; i++) {
    Wire.beginTransmission(i);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found: 0x");
      Serial.println(i, HEX);
    }
  }
  delay(5000);
}
```
