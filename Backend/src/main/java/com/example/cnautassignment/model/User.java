package com.example.cnautassignment.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    private String username;

    @Min(value = 1, message = "Age must be positive")
    private int age;

    private List<String> friends = new ArrayList<>();
    private List<String> hobbies = new ArrayList<>();

    private double popularityScore;
}
