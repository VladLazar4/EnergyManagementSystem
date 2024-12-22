# Use Azul Zulu's Maven JDK 21 for the build stage
FROM azul/zulu-openjdk:21 as build
RUN apt-get update && apt-get install -y maven
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Use Azul Zulu's JRE 21 for the final image
FROM azul/zulu-openjdk:21-jre
WORKDIR /app
COPY --from=build /app/target/chat-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-jar", "app.jar"]
