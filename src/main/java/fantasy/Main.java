package fantasy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Spring boot entry point: Launches tomcat server, scanning @code's to apply configuration from application.properties
// Handles port, MySQL connection, Jackson defaults, Tomcat server
@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
