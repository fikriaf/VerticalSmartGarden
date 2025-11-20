// Test sederhana untuk ESP8266
// Upload ini dulu untuk memastikan ESP8266 berfungsi

void setup() {
  delay(2000); // Wait 2 seconds
  Serial.begin(9600);
  delay(500);
  
  Serial.println();
  Serial.println();
  Serial.println("========================================");
  Serial.println("ESP8266 Test - Simple Blink");
  Serial.println("========================================");
  Serial.println();
  
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("LED_BUILTIN initialized");
  Serial.println("Starting blink loop...");
}

void loop() {
  digitalWrite(LED_BUILTIN, LOW);  // LED ON (active LOW)
  Serial.println("LED ON");
  delay(1000);
  
  digitalWrite(LED_BUILTIN, HIGH); // LED OFF
  Serial.println("LED OFF");
  delay(1000);
}
