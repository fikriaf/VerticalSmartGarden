# ESP8266 Smart Garden Code

Code Arduino untuk ESP8266 NodeMCU yang terintegrasi dengan frontend React.

## Hardware Requirements

- ESP8266 NodeMCU
- DHT22 Temperature & Humidity Sensor
- Capacitive Soil Moisture Sensor
- LCD 16x2 I2C Display
- 5V Relay Module
- Water Pump
- Jumper Wires

## Pin Configuration (NodeMCU)

| Component | NodeMCU Pin | GPIO | Description |
|-----------|-------------|------|-------------|
| DHT22 Data | D7 | GPIO13 | Temperature & Humidity Sensor |
| Soil Moisture | A0 | ADC0 | Analog soil moisture (0-1023) |
| Relay/Pump | D6 | GPIO12 | Pump control (Active LOW) |
| LCD SDA | D2 | GPIO4 | I2C Data |
| LCD SCL | D1 | GPIO5 | I2C Clock |

## Wiring Diagram

### DHT22
- VCC → 3.3V
- GND → GND
- DATA → D7 (GPIO13)

### Soil Moisture Sensor
- VCC → 3.3V
- GND → GND
- AOUT → A0 (Analog)

### Relay Module
- VCC → 5V (VIN)
- GND → GND
- IN → D6 (GPIO12)

### LCD 16x2 I2C
- VCC → 5V (VIN)
- GND → GND
- SDA → D2 (GPIO4)
- SCL → D1 (GPIO5)

## Important Notes for ESP8266

### ADC Limitation
ESP8266 hanya memiliki **1 pin analog (A0)** dengan range **0-1023** (10-bit ADC).
- Voltage range: 0-1V (gunakan voltage divider jika sensor output 3.3V/5V)
- Jika perlu lebih banyak analog input, gunakan multiplexer atau ESP32

### Memory Limitation
ESP8266 memiliki RAM terbatas (~80KB). Code ini sudah dioptimasi untuk:
- Menggunakan `StaticJsonDocument` dengan ukuran fixed
- Minimal string operations
- Efficient sensor reading

## Required Libraries

Install via Arduino IDE Library Manager:

1. **ESP8266WiFi** (included with ESP8266 board)
2. **ESP8266WebServer** (included with ESP8266 board)
3. **DHT sensor library** by Adafruit
4. **Adafruit Unified Sensor** by Adafruit
5. **ArduinoJson** by Benoit Blanchon (v6.x)
6. **LiquidCrystal I2C** by Frank de Brabander

## Configuration

### 1. WiFi Settings

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

**Important**: ESP8266 hanya support WiFi 2.4GHz, tidak support 5GHz!

### 2. LCD I2C Address

```cpp
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Change 0x27 if needed
```

Common addresses: `0x27`, `0x3F`

Untuk scan I2C address, gunakan I2C Scanner sketch.

### 3. Soil Moisture Calibration

ESP8266 ADC range: 0-1023

```cpp
const int wetValue = 300;   // Your wet reading
const int dryValue = 800;   // Your dry reading
```

**Cara kalibrasi:**
1. Celupkan sensor ke air, catat nilai di Serial Monitor
2. Keringkan sensor di udara, catat nilai
3. Update `wetValue` dan `dryValue`

## Upload Instructions

### 1. Install ESP8266 Board Support

1. Open Arduino IDE
2. Go to File → Preferences
3. Add to Additional Board Manager URLs:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
4. Go to Tools → Board → Boards Manager
5. Search "esp8266" and install "esp8266 by ESP8266 Community"

### 2. Board Settings

- Board: "NodeMCU 1.0 (ESP-12E Module)"
- Upload Speed: 115200 (untuk upload)
- Serial Monitor: 9600 baud (untuk monitoring)
- CPU Frequency: 80 MHz
- Flash Size: "4MB (FS:2MB OTA:~1019KB)"
- Flash Mode: DIO
- Flash Frequency: 40MHz

### 3. Upload

1. Connect NodeMCU via USB
2. Select correct COM Port
3. Click Upload
4. Wait for "Done uploading"

## API Endpoints

### GET /api/sensors

Returns:
```json
{
  "temperature": 28.5,
  "humidity": 65,
  "soilMoisture": 512,
  "pumpStatus": true
}
```

Note: `soilMoisture` dikembalikan dalam range 0-1023 untuk kompatibilitas dengan frontend.

### POST /api/pump

Request:
```json
{
  "status": true
}
```

Response:
```json
{
  "success": true,
  "pumpStatus": true
}
```

## Testing

### 1. Serial Monitor

Open Serial Monitor (9600 baud):
```
Connecting to WiFi...
WiFi Connected!
IP Address: 192.168.1.100
HTTP server started
===============================
Temperature: 28.5 °C
Humidity: 65 %
Soil Raw: 512 | Soil Percent: 45 %
Pump Status: OFF
```

### 2. Test API

Browser:
```
http://192.168.1.100/api/sensors
```

### 3. Connect Frontend

Masukkan di React app settings:
```
http://192.168.1.100
```

## Auto Control Logic

- **Pump ON**: Temperature > 30°C AND Soil < 40%
- **Pump OFF**: Soil > 60%
- Manual control override auto mode

## Troubleshooting

### WiFi Not Connecting
- ✅ Pastikan WiFi 2.4GHz (bukan 5GHz)
- ✅ Check SSID dan password
- ✅ Dekatkan ESP8266 ke router
- ✅ Restart ESP8266

### LCD Blank/Not Working
- ✅ Check I2C address (0x27 atau 0x3F)
- ✅ Verify SDA/SCL wiring
- ✅ Adjust contrast potentiometer
- ✅ Test dengan I2C Scanner

### DHT22 Returns NaN
- ✅ Check wiring
- ✅ Add 10kΩ pull-up resistor (DATA to VCC)
- ✅ Wait 2 seconds after power-on
- ✅ Try different GPIO pin

### Soil Sensor Always 0% or 100%
- ✅ Recalibrate wetValue/dryValue
- ✅ Check A0 connection
- ✅ Ensure sensor gets 3.3V power
- ✅ Test sensor with multimeter

### CORS Errors
- ✅ Code sudah include CORS headers
- ✅ Check frontend URL setting
- ✅ Disable browser CORS extension
- ✅ Check firewall

### ESP8266 Crashes/Resets
- ✅ Power supply insufficient (use 5V 1A minimum)
- ✅ Reduce Serial.print() frequency
- ✅ Add delay in loop
- ✅ Check for memory leaks

## Power Requirements

- ESP8266: 5V via USB or VIN (max 500mA)
- DHT22: 3.3V (2.5mA)
- LCD: 5V (20-80mA with backlight)
- Relay: 5V (15-20mA)
- **Water Pump**: External power supply (NOT from ESP8266!)

**Warning**: 
- Total current dari ESP8266 3.3V pin: max 12mA
- Gunakan external 5V power supply untuk LCD dan relay
- JANGAN power pump dari ESP8266!

## Voltage Divider for Soil Sensor

Jika soil sensor output 5V, gunakan voltage divider:

```
Sensor AOUT → R1 (10kΩ) → A0 → R2 (10kΩ) → GND
```

Formula: Vout = Vin × (R2 / (R1 + R2))

## Safety Notes

1. ⚠️ ESP8266 pin max 3.3V - jangan hubungkan ke 5V!
2. ⚠️ Gunakan level shifter untuk device 5V
3. ⚠️ Isolasi elektronik dari air
4. ⚠️ Gunakan waterproof enclosure
5. ⚠️ External power untuk pump dengan relay
6. ⚠️ Add fuse protection

## Performance Tips

1. Reduce Serial.print() untuk stabilitas
2. Increase delay jika ESP8266 sering restart
3. Gunakan static IP untuk koneksi lebih cepat
4. Disable WiFi sleep mode untuk response lebih cepat:
   ```cpp
   WiFi.setSleepMode(WIFI_NONE_SLEEP);
   ```

## License

MIT License
