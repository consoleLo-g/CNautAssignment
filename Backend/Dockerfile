# Stage 1: Build
FROM maven:3.9.2-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven config files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Copy source code
COPY src ./src

RUN chmod +x mvnw

# Build the project (skip tests for faster build)
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy jar from previous stage
COPY --from=build /app/target/CNautAssignment-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java","-jar","app.jar"]
