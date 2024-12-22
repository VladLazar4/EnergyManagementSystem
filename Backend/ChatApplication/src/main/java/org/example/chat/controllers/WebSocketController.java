package org.example.chat.controllers;

import org.example.chat.entities.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/topic/chat")
    public void receiveMessage(Message message) {
        System.out.println("Received message: " + message.toString());

        sendMessage(message);
    }

    public void sendMessage(Message message) {
        String destination = "/topic/chat/" + message.getReceiverId();
        messagingTemplate.convertAndSend(destination, message);
        System.out.println("Message sent to: " + message.getReceiverId());
    }

    @MessageMapping("/topic/typing")
    public void receiveTypingNotification(Message message) {
        System.out.println(message.getSenderId() + " is typing...");

        sendTypingNotification(message);
    }

    public void sendTypingNotification(Message message) {
        String destination = "/topic/typing/" + message.getReceiverId();
        messagingTemplate.convertAndSend(destination, message);
        System.out.println("Typing notification sent to: " + message.getReceiverId());
        System.out.println(message.toString());
    }

    @MessageMapping("/topic/seen")
    public void receiveSeenNotification(Message message) {
        System.out.println(message.getSenderId() + " has seen the message.");

        sendSeenNotification(message);
    }

    public void sendSeenNotification(Message message) {
        String destination = "/topic/seen/" + message.getReceiverId();
        messagingTemplate.convertAndSend(destination, message);
        System.out.println("Seen notification sent to: " + message.getReceiverId());
    }
}