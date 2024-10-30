package org.example.user.dtos.builders;


import org.example.user.dtos.UserDTO;
import org.example.user.entities.User;

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
