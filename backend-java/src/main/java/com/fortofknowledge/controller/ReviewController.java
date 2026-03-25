package com.fortofknowledge.controller;

import com.fortofknowledge.dto.ReviewRequest;
import com.fortofknowledge.entity.Book;
import com.fortofknowledge.entity.Review;
import com.fortofknowledge.entity.User;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.ReviewRepository;
import com.fortofknowledge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    ReviewRepository reviewRepository;

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

    @GetMapping("/book/{bookId}")
    public List<Review> getReviewsByBook(@PathVariable Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @PostMapping
    public Review addReview(@RequestBody ReviewRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Review review = new Review();
        review.setUser(user);
        review.setBook(book);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return reviewRepository.save(review);
    }

    @GetMapping("/stats/{bookId}")
    public java.util.Map<String, Object> getReviewStats(@PathVariable Long bookId) {
        List<Review> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        long count = reviews.size();

        java.util.Map<Integer, Long> distribution = reviews.stream()
                .collect(java.util.stream.Collectors.groupingBy(Review::getRating,
                        java.util.stream.Collectors.counting()));

        // Ensure all stars 1-5 are present
        for (int i = 1; i <= 5; i++) {
            distribution.putIfAbsent(i, 0L);
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("average", average);
        stats.put("totalReviews", count);
        stats.put("distribution", distribution);

        return stats;
    }
}
