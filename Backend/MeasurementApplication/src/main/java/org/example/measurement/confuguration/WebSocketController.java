package org.example.measurement.confuguration;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotification(UUID deviceId, Float measurementValue) {
        String notification = "Device: " + deviceId + " exceeded the limit! Value: " + measurementValue;
        messagingTemplate.convertAndSend("/topic/alerts", notification);
    }
}