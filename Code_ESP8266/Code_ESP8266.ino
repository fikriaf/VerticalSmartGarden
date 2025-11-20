#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"

// WiFi Configuration
const char* ssid = "Infinix NOTE 50X 5G";
const char* password = "fikriaf27";

// Pin Configuration (ESP8266 NodeMCU)
#define DHTPIN 13        // GPIO13 (D7 on NodeMCU)
#define DHTTYPE DHT22
#define SOIL_PIN A0      // Analog pin (only one on ESP8266)
#define PUMP_PIN 12      // GPIO12 (D6 on NodeMCU)
#define SDA_PIN 4        // GPIO4 (D2 on NodeMCU)
#define SCL_PIN 5        // GPIO5 (D1 on NodeMCU)

// Sensor Objects
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);  // I2C address 0x27, 16 columns, 2 rows
ESP8266WebServer server(80);

// Calibration Values (ESP8266 ADC: 0-1023)
const int wetValue = 230;   // Calibration: maximum wet
const int dryValue = 685;   // Calibration: maximum dry

// Global Variables
float temperature = 0;
float humidity = 0;
int soilPercent = 0;
bool pumpStatus = false;
bool manualMode = false;

// Timing variables for LCD update only
unsigned long lastLCDUpdate = 0;
const unsigned long lcdInterval = 500;  // Update LCD every 0.5 second

void setup() {
  delay(2000); // Wait for serial to stabilize
  Serial.begin(9600);
  delay(500);
  Serial.println();
  Serial.println();
  Serial.println("=================================");
  Serial.println("ESP8266 Smart Garden Starting...");
  Serial.println("=================================");
  
  // Initialize I2C for LCD
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Smart Garden");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  
  // Initialize DHT22
  dht.begin();
  
  // Initialize Pump Pin
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Relay OFF at start (active HIGH)
  
  // Connect to WiFi
  Serial.println("Connecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    Serial.println("WiFi Connection Failed!");
    Serial.print("Status: ");
    Serial.println(WiFi.status());
    Serial.println("Possible reasons:");
    Serial.println("1. Wrong SSID/Password");
    Serial.println("2. WiFi is 5GHz (ESP8266 only supports 2.4GHz)");
    Serial.println("3. Signal too weak");
    Serial.println("4. Router security settings");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Check Serial");
  }
  
  // Setup API Endpoints
  server.on("/api/sensors", HTTP_GET, handleGetSensors);
  server.on("/api/pump", HTTP_POST, handlePumpControl);
  server.on("/api/pump", HTTP_OPTIONS, handleCORS);
  server.onNotFound(handleNotFound);
  
  server.begin();
  Serial.println("HTTP server started");
  
  lcd.clear();
}

void loop() {
  // Handle web requests immediately (no delay for instant response)
  if (WiFi.status() == WL_CONNECTED) {
    server.handleClient();
  }
  
  // Read Sensors continuously (no delay - maximum speed)
  readSensors();
  
  // Auto Control (if not in manual mode)
  if (!manualMode) {
    autoControlPump();
  }
  
  // Update LCD Display periodically to avoid flicker
  unsigned long currentMillis = millis();
  if (currentMillis - lastLCDUpdate >= lcdInterval) {
    lastLCDUpdate = currentMillis;
    updateLCD();
  }
  
  // ZERO delay - loop runs at maximum speed for instant response
}

void readSensors() {
  // Read DHT22
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    temperature = temp;
    humidity = hum;
  }
  
  // Read Soil Moisture (ESP8266 ADC: 0-1023)
  int soilValue = analogRead(SOIL_PIN);
  soilPercent = map(soilValue, dryValue, wetValue, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);
  
  // Debug output
  Serial.println("===============================");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("Soil Raw: "); Serial.print(soilValue);
  Serial.print(" | Soil Percent: "); Serial.print(soilPercent); Serial.println(" %");
  Serial.print("Pump Status: "); Serial.println(pumpStatus ? "ON" : "OFF");
}

void autoControlPump() {
  // Auto control based on temperature and soil moisture
  if (temperature > 25 && soilPercent < 40) {
    setPumpStatus(true);
    Serial.println("Auto: Soil dry! Pump ON");
  } else if (soilPercent > 60) {
    setPumpStatus(false);
    Serial.println("Auto: Soil moist. Pump OFF");
  }
}

void setPumpStatus(bool status) {
  pumpStatus = status;
  digitalWrite(PUMP_PIN, status ? HIGH : LOW); // Relay active HIGH
}

void updateLCD() {
  lcd.clear();
  
  // Line 1: Temperature and Humidity
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperature, 1);
  lcd.print("C H:");
  lcd.print(humidity, 0);
  lcd.print("%");
  
  // Line 2: Soil Moisture and Pump Status
  lcd.setCursor(0, 1);
  lcd.print("Soil:");
  lcd.print(soilPercent);
  lcd.print("% ");
  lcd.print(pumpStatus ? "ON" : "OFF");
}

// API Handler: Get Sensor Data
void handleGetSensors() {
  StaticJsonDocument<200> doc;
  
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = (soilPercent * 1023) / 100; // Convert to raw value (0-1023)
  doc["pumpStatus"] = pumpStatus;
  
  String response;
  serializeJson(doc, response);
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", response);
}

// API Handler: Control Pump
void handlePumpControl() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    StaticJsonDocument<200> doc;
    
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }
    
    if (doc.containsKey("status")) {
      bool status = doc["status"];
      manualMode = true;
      setPumpStatus(status);
      
      Serial.print("Manual Control: Pump ");
      Serial.println(status ? "ON" : "OFF");
      
      StaticJsonDocument<100> response;
      response["success"] = true;
      response["pumpStatus"] = pumpStatus;
      
      String responseStr;
      serializeJson(response, responseStr);
      
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "application/json", responseStr);
    } else {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "application/json", "{\"error\":\"Missing status field\"}");
    }
  } else {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "application/json", "{\"error\":\"No body\"}");
  }
}

// Handle CORS Preflight
void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

// Handle 404
void handleNotFound() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(404, "application/json", "{\"error\":\"Not Found\"}");
}
