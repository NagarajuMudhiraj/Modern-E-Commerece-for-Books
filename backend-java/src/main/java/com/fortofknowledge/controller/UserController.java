package com.fortofknowledge.controller;

import com.fortofknowledge.entity.User;
import com.fortofknowledge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/avatars/";

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername()).get();
    }

    @PostMapping("/profile-picture")
    public User uploadProfilePicture(@RequestParam("file") MultipartFile file) throws IOException {
        User user = getCurrentUser();

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String avatarUrl = "/api/uploads/avatars/" + fileName;
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    @GetMapping("/me")
    public User getMe() {
        return getCurrentUser();
    }
}
