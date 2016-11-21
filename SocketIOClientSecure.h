/*
	socket.io-arduino-client: a Socket.IO client for the Arduino

	Based on the Kevin Rohling WebSocketClient

	Copyright 2013 Bill Roy

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
*/
#include "Arduino.h"
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include "SPI.h"

// Length of static data buffers
#define DATA_BUFFER_LEN 120
#define SID_LEN 24

//Using the https protocol
class SocketIOClientSecure {
	public:
		typedef void (*DataArrivedDelegate)(SocketIOClientSecure client, char *data);
		//Connect to the socket server over https
		bool connect(IPAddress ip, uint16_t port = 443) ;
		bool connect(const char* name, uint16_t port = 443) ;

        bool connected();
        void disconnect();
		void monitor();
		//Callback method
		void setDataArrivedDelegate(DataArrivedDelegate dataArrivedDelegate);
		//Send data to socket server
		void send(char *data);
	private:
		WiFiClientSecure client;
		DataArrivedDelegate dataArrivedDelegate;
		char *dataptr;
		char databuffer[DATA_BUFFER_LEN];
		char sid[SID_LEN];
		char *hostname;

		void sendHandshake(IPAddress ip);
        void sendHandshake(const char* name);
      
        bool readHandshake();
		bool waitForInput(void);
		uint16_t port;

		void readLine();
		void findColon(char which);
		void terminateCommand(void);
		void eatHeader(void);
};
