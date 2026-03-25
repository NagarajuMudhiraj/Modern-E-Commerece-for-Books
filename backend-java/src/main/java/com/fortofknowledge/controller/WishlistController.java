package com.fortofknowledge.controller;

import com.fortofknowledge.entity.Book;
import com.fortofknowledge.entity.User;
import com.fortofknowledge.entity.WishlistItem;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.UserRepository;
import com.fortofknowledge.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    WishlistRepository wishlistRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookRepository bookRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).get();
        }
        return null;
    }

    @GetMapping
    public List<WishlistItem> getWishlist() {
        return wishlistRepository.findByUser(getCurrentUser());
    }

    @PostMapping("/{bookId}")
    public WishlistItem addToWishlist(@PathVariable Long bookId) {
        User user = getCurrentUser();
        if (wishlistRepository.findByUserAndBookId(user, bookId).isPresent()) {
            throw new RuntimeException("Book already in wishlist");
        }

        Book book = bookRepository.findById(bookId).orElseThrow();
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setBook(book);
        return wishlistRepository.save(item);
    }

    @DeleteMapping("/{bookId}")
    @Transactional
    public Map<String, String> removeFromWishlist(@PathVariable Long bookId) {
        User user = getCurrentUser();
        wishlistRepository.deleteByUserAndBookId(user, bookId);
        return Map.of("message", "Removed from wishlist");
    }

    @GetMapping("/check/{bookId}")
    public Map<String, Boolean> checkWishlist(@PathVariable Long bookId) {
        User user = getCurrentUser();
        boolean exists = wishlistRepository.findByUserAndBookId(user, bookId).isPresent();
        return Map.of("inWishlist", exists);
    }

    @GetMapping("/public/{userId}")
    public List<WishlistItem> getPublicWishlist(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return wishlistRepository.findByUser(user);
    }
}
