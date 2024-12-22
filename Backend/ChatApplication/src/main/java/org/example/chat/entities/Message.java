package org.example.chat.entities;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;
import java.util.UUID;

@Getter
@Setter
public class Message {
    private UUID senderId;
    private UUID receiverId;
    private String senderUser;
    private String receiverUser;
    private String content;

    @Override
    public String toString() {
        return "Message{" +
                "senderId=" + senderId +
                ", receiverId=" + receiverId +
                ", content='" + content + '\'' +
                '}';
    }
}
