package org.example.measurement.confuguration;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    @MessageMapping("/send/message")
    @SendTo("/topic/public")
    public String handleMessage(String message) {
        System.out.println(message);
        return message;
    }
}