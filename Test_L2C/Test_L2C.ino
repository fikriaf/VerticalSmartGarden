// I2C Scanner untuk ESP8266 - Test berbagai pin
// Upload ini untuk scan I2C address LCD

#include <Wire.h>

// Test berbagai kombinasi pin
// Uncomment salah satu kombinasi di bawah:

// Kombinasi 1: D1=SCL, D2=SDA (Standard NodeMCU)
// #define SDA_PIN 4   // D2
// #define SCL_PIN 5   // D1

// Kombinasi 2: D3=SCL, D4=SDA
// #define SDA_PIN 2   // D4
// #define SCL_PIN 0   // D3

// Kombinasi 3: D5=SCL, D6=SDA
#define SDA_PIN 12  // D6
#define SCL_PIN 14  // D5

// Kombinasi 4: D7=SCL, D8=SDA
// #define SDA_PIN 15  // D8
// #define SCL_PIN 13  // D7

void setup() {
  delay(2000);
  Serial.begin(9600);
  delay(500);
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("I2C Scanner for ESP8266");
  Serial.println("========================================");
  Serial.print("Testing SDA=GPIO");
  Serial.print(SDA_PIN);
  Serial.print(" SCL=GPIO");
  Serial.println(SCL_PIN);
  Serial.println("========================================");
  Serial.println();
  
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("I2C initialized");
  Serial.println("Scanning...");
  Serial.println();
}

void loop() {
  byte error, address;
  int nDevices = 0;

  Serial.println("Scanning I2C bus...");

  for(address = 1; address < 127; address++ ) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print(">>> I2C device FOUND at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.print(address, HEX);
      Serial.println(" !");
      
      // Show common device types
      if (address == 0x27 || address == 0x3F) {
        Serial.println("    (Likely LCD 16x2 I2C)");
      }
      
      nDevices++;
    }
    else if (error == 4) {
      Serial.print("Unknown error at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.println(address, HEX);
    }    
  }
  
  Serial.println();
  if (nDevices == 0) {
    Serial.println(">>> No I2C devices found!");
    Serial.println(">>> Check wiring:");
    Serial.print("    - LCD SDA to GPIO");
    Serial.print(SDA_PIN);
    Serial.print(" (D");
    printDPin(SDA_PIN);
    Serial.println(")");
    Serial.print("    - LCD SCL to GPIO");
    Serial.print(SCL_PIN);
    Serial.print(" (D");
    printDPin(SCL_PIN);
    Serial.println(")");
    Serial.println("    - LCD VCC to 5V");
    Serial.println("    - LCD GND to GND");
    Serial.println();
    Serial.println(">>> Try different pin combination:");
    Serial.println("    Edit code and uncomment other pin combination");
  }
  else {
    Serial.print(">>> Found ");
    Serial.print(nDevices);
    Serial.println(" device(s)");
    Serial.println();
    Serial.println(">>> Update Code_ESP8266.ino with:");
    Serial.print("    #define SDA_PIN ");
    Serial.println(SDA_PIN);
    Serial.print("    #define SCL_PIN ");
    Serial.println(SCL_PIN);
    Serial.println("    LiquidCrystal_I2C lcd(0x__ , 16, 2);");
    Serial.println("    (Replace 0x__ with address found above)");
  }
  
  Serial.println("========================================");
  Serial.println("Scanning again in 5 seconds...");
  Serial.println();
  
  delay(5000);
}

void printDPin(int gpio) {
  // Convert GPIO to D pin label
  switch(gpio) {
    case 16: Serial.print("0"); break;
    case 5:  Serial.print("1"); break;
    case 4:  Serial.print("2"); break;
    case 0:  Serial.print("3"); break;
    case 2:  Serial.print("4"); break;
    case 14: Serial.print("5"); break;
    case 12: Serial.print("6"); break;
    case 13: Serial.print("7"); break;
    case 15: Serial.print("8"); break;
    default: Serial.print("?"); break;
  }
}
