package com.example.cnautassignment.service;

import com.example.cnautassignment.model.User;
import com.example.cnautassignment.repository.UserRepository;
import com.example.cnautassignment.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // ✅ for logging
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j // ✅ Lombok annotation for logger
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        log.info("Fetching all users from database");
        List<User> users = userRepository.findAll();
        for (User u : users) {
            u.setPopularityScore(computePopularity(u, users));
        }
        log.debug("Fetched {} users successfully", users.size());
        return users;
    }

    public User createUser(User user) {
        log.info("Creating new user: {}", user.getUsername());
        User saved = userRepository.save(user);
        log.debug("User created with ID: {}", saved.getId());
        return saved;
    }

    public User updateUserDetails(String id, User updated) {
        log.info("Updating user details for ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found: {}", id);
                    return new NotFoundException("User not found: " + id);
                });

        user.setUsername(updated.getUsername());
        user.setAge(updated.getAge());
        user.setHobbies(updated.getHobbies());

        user.setPopularityScore(computePopularity(user, userRepository.findAll()));
        User saved = userRepository.save(user);
        log.debug("User updated successfully: {}", saved.getId());
        return saved;
    }

    public void deleteUser(String id) {
        log.info("Attempting to delete user ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found for deletion: {}", id);
                    return new NotFoundException("User not found: " + id);
                });
        if (!user.getFriends().isEmpty()) {
            log.warn("User {} still has friends linked — deletion blocked", id);
            throw new IllegalStateException("Cannot delete user while still linked to friends. Unlink first.");
        }
        userRepository.deleteById(id);
        log.info("User {} deleted successfully", id);
    }

    public User linkFriend(String userId, String friendId) {
        log.info("Linking user {} with friend {}", userId, friendId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));

        if (!user.getFriends().contains(friendId))
            user.getFriends().add(friendId);
        if (!friend.getFriends().contains(userId))
            friend.getFriends().add(userId);

        List<User> allUsers = userRepository.findAll();
        user.setPopularityScore(computePopularity(user, allUsers));
        friend.setPopularityScore(computePopularity(friend, allUsers));

        userRepository.save(friend);
        User saved = userRepository.save(user);

        log.debug("Linked {} <-> {} successfully", userId, friendId);
        return saved;
    }

    public User unlinkFriend(String userId, String friendId) {
        log.info("Unlinking friendship between {} and {}", userId, friendId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));

        user.getFriends().remove(friendId);
        friend.getFriends().remove(userId);

        userRepository.save(friend);
        User saved = userRepository.save(user);

        log.debug("Unlinked {} and {} successfully", userId, friendId);
        return saved;
    }

    public User addHobby(String userId, String hobby) {
        log.info("Adding hobby '{}' to user {}", hobby, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        if (!user.getHobbies().contains(hobby)) {
            user.getHobbies().add(hobby);
        } else {
            log.debug("Hobby '{}' already exists for user {}", hobby, userId);
        }

        List<User> allUsers = userRepository.findAll();
        user.setPopularityScore(computePopularity(user, allUsers));
        userRepository.save(user);

        for (String friendId : user.getFriends()) {
            User friend = userRepository.findById(friendId)
                    .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));
            friend.setPopularityScore(computePopularity(friend, allUsers));
            userRepository.save(friend);
        }

        log.debug("Hobby '{}' added successfully for user {}", hobby, userId);
        return user;
    }

    private int computePopularity(User user, List<User> allUsers) {
        int uniqueFriends = user.getFriends() != null ? user.getFriends().size() : 0;
        double sharedHobbies = 0;

        if (user.getFriends() != null) {
            for (String friendId : user.getFriends()) {
                User friend = allUsers.stream()
                        .filter(u -> u.getId().equals(friendId))
                        .findFirst()
                        .orElse(null);
                if (friend != null && friend.getHobbies() != null) {
                    Set<String> common = new HashSet<>(
                            user.getHobbies() != null ? user.getHobbies() : Collections.emptyList());
                    common.retainAll(friend.getHobbies());
                    sharedHobbies += common.size();
                }
            }
        }

        int popularity = (int) Math.round(uniqueFriends + 0.5 * sharedHobbies);
        int finalScore = (uniqueFriends == 0 && sharedHobbies == 0) ? 0 : Math.max(0, popularity);

        log.trace("Computed popularity for user {}: {}", user.getUsername(), finalScore);
        return finalScore;
    }

    public Map<String, Object> getGraphData() {
        log.info("Generating graph data for users");
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Set<String> edgeSet = new HashSet<>();

        for (User user : users) {
            double popularity = computePopularity(user, users);

            nodes.add(Map.of(
                    "id", user.getId(),
                    "name", user.getUsername(),
                    "age", user.getAge(),
                    "popularityScore", popularity,
                    "hobbies", user.getHobbies()));

            for (String friendId : user.getFriends()) {
                String edgeKey = user.getId().compareTo(friendId) < 0
                        ? user.getId() + "-" + friendId
                        : friendId + "-" + user.getId();

                if (!edgeSet.contains(edgeKey)) {
                    edges.add(Map.of("source", user.getId(), "target", friendId));
                    edgeSet.add(edgeKey);
                }
            }
        }

        log.debug("Graph generated: {} nodes, {} edges", nodes.size(), edges.size());
        return Map.of("nodes", nodes, "edges", edges);
    }

    public User getUserById(String id) {
        log.info("Fetching user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found: {}", id);
                    return new NotFoundException("User not found: " + id);
                });
    }
}
