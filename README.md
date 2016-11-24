# SocketIO Esp8266 Client,

## an esp client for connecting and messaging with Socket.io servers over https.

This implementation is heavily based on [Bill Roy][1] and [washo4evr][2] you should check out their work of you have the time. the major difference is that this library is implemented using HTTPS instead of HTTP because it's 2016 :stuck_out_tongue:

***

## There are 2 examples included in this repository
* arduino_client
* socket_io_server

_The socket_io server is a node implementation. to run the server cd into the repository and run the following commands_
```bash
npm install       \\Install the dependencies
node index         \\Start the server
```


### Note

This library is not complete here are a list of features which still need to be implemented/fixed over the next few weeks.

* Socket times out after about 60 seconds.
* Send data from the Esp to the server.

### Installation instructions

Clone this repository into your Arduino Sketchbook directory under libraries, then restart the Arduino IDE so that it notices the new library.  Now, under File\Examples you should see SocketIOClientSecure.  

### How To Use This Library

```c++
IPAddress server(104, 198, 98, 11); 
const int httpPort = 8081; 
SocketIOClientSecure socketIOClient; 
... 
... 
... 
void setup() { 	
	Serial.begin(115200); 	
	...
	...
	//Connect to the server	 	
	if (!socketIOClient.connect(server, httpPort)) Serial.println(F("Not connected.")); 	
	if (socketIOClient.connected()) 	
	{ 	
		//Send message to server
		//socketIOClient.send(" Connected !!!!"); 	
	}else{ 		
		Serial.println("Connection Error"); 		
		while (1); 	
	} 	
	delay(1000); 
}  
void loop(){  	
	if (socketIOClient.monitor()){ 		
		Serial.println("RID"); 		
		Serial.println(RID); 		
		if (RID == "atime" && Rname == "time"){ 			
			Serial.print("Time is "); 			
			Serial.println(Rcontent); 		
		} 	
	}else if(!socketIOClient.connected()) { 		
		Serial.println("I ran"); 		
		socketIOClient.connect(server, httpPort); 	
	}  
}

```

[1]: https://github.com/billroy/socket.io-arduino-client
[2]: https://github.com/washo4evr/Socket.io-v1.x-Library
