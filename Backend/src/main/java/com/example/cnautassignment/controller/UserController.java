package com.example.cnautassignment.controller;

import com.example.cnautassignment.model.User;
import com.example.cnautassignment.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
// @CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        user.setId(null);
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/users/{id}/details")
    public ResponseEntity<User> updateUserDetails(@PathVariable String id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUserDetails(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/link")
    public ResponseEntity<User> linkUser(@PathVariable String id, @RequestParam String friendId) {
        return ResponseEntity.ok(userService.linkFriend(id, friendId));
    }

    @DeleteMapping("/users/{id}/unlink")
    public ResponseEntity<User> unlinkUser(@PathVariable String id, @RequestParam String friendId) {
        return ResponseEntity.ok(userService.unlinkFriend(id, friendId));
    }

    @GetMapping("/graph")
    public ResponseEntity<Map<String, Object>> getGraph() {
        return ResponseEntity.ok(userService.getGraphData());
    }

    @GetMapping("/hobbies")
    public List<String> getHobbies() {
        return userService.getAllUsers().stream()
                .flatMap(u -> u.getHobbies().stream())
                .distinct()
                .toList();
    }

    @PatchMapping("/users/{id}/hobbies")
    public ResponseEntity<User> addHobby(@PathVariable String id, @RequestBody Map<String, String> request) {
        String hobby = request.get("hobby");
        User updatedUser = userService.addHobby(id, hobby);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

}
