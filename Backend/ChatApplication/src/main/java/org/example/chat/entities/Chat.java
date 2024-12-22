package org.example.chat.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "adminId", nullable = false)
    private UUID adminId;

    @Column(name = "clientId", nullable = false)
    private UUID clientId;

    public Chat (){

    }

    public Chat(UUID id, UUID adminId, UUID clientId) {
        this.id = id;
        this.adminId = adminId;
        this.clientId = clientId;
    }
}
