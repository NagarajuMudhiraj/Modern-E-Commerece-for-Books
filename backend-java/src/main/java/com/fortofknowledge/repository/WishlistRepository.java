package com.fortofknowledge.repository;

import com.fortofknowledge.entity.User;
import com.fortofknowledge.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);

    Optional<WishlistItem> findByUserAndBookId(User user, Long bookId);

    void deleteByUserAndBookId(User user, Long bookId);
}
