package com.fortofknowledge.controller;

import com.fortofknowledge.dto.CartItemDto;
import com.fortofknowledge.dto.OrderDto.CartRequest;
import com.fortofknowledge.entity.CartItem;
import com.fortofknowledge.entity.User;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.CartItemRepository;
import com.fortofknowledge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookRepository bookRepository;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername()).get();
    }

    @GetMapping
    public List<CartItemDto> getCart() {
        return cartItemRepository.findByUser(getCurrentUser()).stream()
                .map(item -> new CartItemDto(
                        item.getId(),
                        item.getBook().getId(),
                        item.getBook().getTitle(),
                        item.getBook().getPrice(),
                        item.getBook().getImageUrl(),
                        item.getQuantity(),
                        item.getBook().getStock()))
                .toList();
    }

    @PostMapping
    public void addToCart(@RequestBody CartRequest request) {
        User user = getCurrentUser();
        cartItemRepository.findByUserAndBookId(user, request.getBookId())
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity() + request.getQuantity());
                            cartItemRepository.save(item);
                        },
                        () -> {
                            CartItem item = new CartItem();
                            item.setUser(user);
                            item.setBook(bookRepository.findById(request.getBookId()).get());
                            item.setQuantity(request.getQuantity());
                            cartItemRepository.save(item);
                        });
    }

    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartItemRepository.deleteById(id);
    }
}
