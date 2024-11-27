package org.example.measurement.controllers;

import org.json.JSONObject;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotification(UUID deviceId, UUID ownerId, Float measurementValue) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("deviceId", deviceId);
        notification.put("ownerId", ownerId);
        notification.put("value", measurementValue);
        messagingTemplate.convertAndSend("/topic/alerts", notification);
    }
}