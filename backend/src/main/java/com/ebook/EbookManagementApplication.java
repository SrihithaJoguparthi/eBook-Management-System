package com.ebook;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ebook.model.Role;
import com.ebook.model.User;
import com.ebook.repository.UserRepository;

@SpringBootApplication
public class EbookManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(EbookManagementApplication.class, args);
    }

    @Bean
    public CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@ebook.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                System.out.println("✅ Default admin created — Username: admin | Password: admin123");
            } else {
                System.out.println("ℹ️ Admin user already exists — skipping creation.");
            }
        };
    }
}
