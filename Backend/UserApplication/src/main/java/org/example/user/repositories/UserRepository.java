package org.example.user.repositories;

import org.example.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    List<User> findByName(String name);
    Optional<User> findById(UUID id);
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndPassword(@Param("username") String username, @Param("password") String password);
}
