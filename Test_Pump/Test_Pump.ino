// Test Pump Control - ESP8266
// Upload ini untuk test pompa manual

#define PUMP_PIN 12  // GPIO12 (D6 on NodeMCU)

void setup() {
  delay(2000);
  Serial.begin(9600);
  delay(500);
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("ESP8266 Pump Test");
  Serial.println("========================================");
  
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Relay OFF (active HIGH)
  
  Serial.println("Pump initialized (OFF)");
  Serial.println("Relay is ACTIVE HIGH:");
  Serial.println("  - HIGH = Pump ON");
  Serial.println("  - LOW = Pump OFF");
  Serial.println();
  Serial.println("Starting test cycle...");
  Serial.println("========================================");
}

void loop() {
  // Test cycle: ON 3 seconds, OFF 3 seconds
  
  Serial.println();
  Serial.println(">>> PUMP ON (Relay HIGH)");
  digitalWrite(PUMP_PIN, HIGH);  // Pump ON
  delay(3000);
  
  Serial.println(">>> PUMP OFF (Relay LOW)");
  digitalWrite(PUMP_PIN, LOW); // Pump OFF
  delay(3000);
}
