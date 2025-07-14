#include<Wire.h>
const int MPU2=0x69,MPU1=0x68;
float AcX1,AcY1,AcZ1;
float AcX2,AcY2,AcZ2
//-------------------------------------------------\setup loop\------------------------------------------------------------ 
 void setup(){ 
      Wire.begin(); 
      Wire.beginTransmission(MPU1);
      Wire.write(0x6B);// PWR_MGMT_1 register 
      Wire.write(0x00); // set to zero (wakes up the MPU-6050)
      Wire.endTransmission(true);
      Wire.begin(); 
      Wire.beginTransmission(MPU2);
      Wire.write(0x6B);// PWR_MGMT_1 register 
      Wire.write(0x00); // set to zero (wakes up the MPU-6050)
      Wire.endTransmission(true);
      Serial.begin(1000000); 
     } 
    
//---------------------------------------------------\void loop\------------------------------------------------------------
 void loop(){
      Wire.beginTransmission(MPU1); 
      Wire.write(0x3B); // starting with register 0x3B (ACCEL_XOUT_H) 
      Wire.endTransmission(false);
      Wire.requestFrom(MPU1, 6, true);
      AcX1 = (Wire.read() << 8 | Wire.read()) / 16384.0;
      AcY1 = (Wire.read() << 8 | Wire.read()) / 16384.0;
      AcZ1 = (Wire.read() << 8 | Wire.read()) / 16384.0 ; 
      Wire.beginTransmission(MPU2); 
      Wire.write(0x3B); // starting with register 0x3B (ACCEL_XOUT_H) 
      Wire.endTransmission(false);
      Wire.requestFrom(MPU2, 6, true); // request a total of 6 registers 
      AcX2 = (Wire.read() << 8 | Wire.read()) / 16384.0;
      AcY2 = (Wire.read() << 8 | Wire.read()) / 16384.0;
      AcZ2 = (Wire.read() << 8 | Wire.read()) / 16384.0 ;
      Serial.print(float(AcX1));
      Serial.print(";"); 
      Serial.print(float(AcY1));
      Serial.print(";");
      Serial.print(float(AcZ1));
      Serial.print(";");
      Serial.print(float(AcX2));
      Serial.print(";");
      Serial.print(float(AcY2));
      Serial.print(";");
      Serial.print(float(AcZ2)); 
      Serial.println();
      delay(10);
    }
 
//----------------------------------------------\user defined functions\--------------------------------------------------