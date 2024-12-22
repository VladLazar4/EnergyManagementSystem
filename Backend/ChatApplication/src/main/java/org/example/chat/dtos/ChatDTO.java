package org.example.chat.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
public class ChatDTO extends RepresentationModel<ChatDTO> {
    @JsonProperty("id")
    private UUID id;
    @JsonProperty("adminId")
    private UUID adminId;
    @JsonProperty("clientId")
    private UUID clientId;

    public ChatDTO(){

    }
    public ChatDTO(UUID id, UUID adminId, UUID clientId) {
        this.id = id;
        this.adminId = adminId;
        this.clientId = clientId;
    }


}
