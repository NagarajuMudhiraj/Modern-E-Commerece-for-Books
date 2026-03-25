package com.fortofknowledge.repository;

import com.fortofknowledge.entity.CartItem;
import com.fortofknowledge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndBookId(User user, Long bookId);

    void deleteByUser(User user);
}
