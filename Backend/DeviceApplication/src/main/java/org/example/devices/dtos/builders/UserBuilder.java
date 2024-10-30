package org.example.devices.dtos.builders;


import org.example.devices.dtos.UserDTO;
import org.example.devices.entities.User;

public class UserBuilder {
    private UserBuilder(){

    }

    public static UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getPassword(), user.getName(), user.getRole());
    }


    public static User toEntity(UserDTO userDTO) {
        return new User(userDTO.getId(), userDTO.getUsername(), userDTO.getPassword(), userDTO.getName(), userDTO.getRole());
    }
}
