package org.example.chat.dtos.builders;


import org.example.chat.dtos.ChatDTO;

public class ChatBuilder {
    private ChatBuilder(){

    }

    public static ChatDTO toChatDTO(org.example.chat.entities.Chat chat){
        return new ChatDTO(chat.getId(), chat.getAdminId(), chat.getClientId());
    }

    public static org.example.chat.entities.Chat toEntity(ChatDTO chatDTO){
        return new org.example.chat.entities.Chat(chatDTO.getId(), chatDTO.getAdminId(), chatDTO.getClientId());
    }
}
