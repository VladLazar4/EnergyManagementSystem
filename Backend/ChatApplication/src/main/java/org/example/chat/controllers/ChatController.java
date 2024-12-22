package org.example.chat.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.chat.dtos.ChatDTO;
import org.example.chat.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@CrossOrigin
@RequestMapping("/chat")
@Tag(name = "Chat Controller", description = "API for managing chat")
public class ChatController {
    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping()
    public void getAllChats() {
        System.out.println("All chats");
    }

    @Operation(summary = "Get chats")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chats found"),
            @ApiResponse(responseCode = "404", description = "Chats not found for given adminId")
    })
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<ChatDTO>> findOpenCharts(@PathVariable("adminId") UUID adminId) {
        List<ChatDTO> dtos = chatService.findOpenChats(adminId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @Operation(summary = "Get chats")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chats found"),
            @ApiResponse(responseCode = "404", description = "Chats not found for given clientId")
    })
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ChatDTO>> findOpenChartsClient(@PathVariable("clientId") UUID clientId) {
        List<ChatDTO> dtos = chatService.findOpenChatsClient(clientId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @PostMapping("/newChat")
    public UUID createChat(@RequestBody ChatDTO chatDTO) {
        UUID id = chatService.createChat(chatDTO);
        return id;
    }
}

