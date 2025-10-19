package com.example.cnautassignment.service;

import com.example.cnautassignment.model.User;
import com.example.cnautassignment.repository.UserRepository;
import com.example.cnautassignment.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            u.setPopularityScore(computePopularity(u, users));
        }
        return users;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUserDetails(String id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));

        user.setUsername(updated.getUsername());
        user.setAge(updated.getAge());
        user.setHobbies(updated.getHobbies());

        user.setPopularityScore(computePopularity(user, userRepository.findAll()));
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
        if (!user.getFriends().isEmpty()) {
            throw new IllegalStateException("Cannot delete user while still linked to friends. Unlink first.");
        }
        userRepository.deleteById(id);
    }

    public User linkFriend(String userId, String friendId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));

        if (!user.getFriends().contains(friendId)) {
            user.getFriends().add(friendId);
        }
        if (!friend.getFriends().contains(userId)) {
            friend.getFriends().add(userId);
        }

        // Recompute popularity dynamically
        List<User> allUsers = userRepository.findAll();
        user.setPopularityScore(computePopularity(user, allUsers));
        friend.setPopularityScore(computePopularity(friend, allUsers));

        userRepository.save(friend);
        return userRepository.save(user);
    }

    public User unlinkFriend(String userId, String friendId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));

        user.getFriends().remove(friendId);
        friend.getFriends().remove(userId);

        userRepository.save(friend);
        return userRepository.save(user);
    }

    public User addHobby(String userId, String hobby) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        // Add hobby if not already present
        if (!user.getHobbies().contains(hobby)) {
            user.getHobbies().add(hobby);
        }

        // Fetch all users for popularity calculation
        List<User> allUsers = userRepository.findAll();

        // Recompute popularity for this user
        user.setPopularityScore(computePopularity(user, allUsers));
        userRepository.save(user);

        // Recompute popularity for each friend of this user
        for (String friendId : user.getFriends()) {
            User friend = userRepository.findById(friendId)
                    .orElseThrow(() -> new NotFoundException("Friend not found: " + friendId));
            friend.setPopularityScore(computePopularity(friend, allUsers));
            userRepository.save(friend);
        }

        return user;
    }

    // Compute dynamic popularity score for a user
    private int computePopularity(User user, List<User> allUsers) {
        int uniqueFriends = user.getFriends() != null ? user.getFriends().size() : 0;

        // Count total shared hobbies with friends
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

        // Popularity = uniqueFriends + 0.5 * sharedHobbies, ensure >= 0
        int popularity = (int) Math.round(uniqueFriends + 0.5 * sharedHobbies);
        if (uniqueFriends == 0 && sharedHobbies == 0) {
            return 0;
        }
        return Math.max(0, popularity);
    }

    // Graph data with dynamic popularity and no duplicate edges
    public Map<String, Object> getGraphData() {
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
                // Prevent duplicate edges
                String edgeKey = user.getId().compareTo(friendId) < 0 ? user.getId() + "-" + friendId
                        : friendId + "-" + user.getId();

                if (!edgeSet.contains(edgeKey)) {
                    edges.add(Map.of(
                            "source", user.getId(),
                            "target", friendId));
                    edgeSet.add(edgeKey);
                }
            }
        }

        return Map.of("nodes", nodes, "edges", edges);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

}
