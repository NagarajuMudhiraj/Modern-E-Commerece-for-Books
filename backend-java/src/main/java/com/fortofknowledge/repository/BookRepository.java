package com.fortofknowledge.repository;

import com.fortofknowledge.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStockLessThan(int threshold);

    List<Book> findTop5ByCategoryIdAndIdNot(Long categoryId, Long bookId);

    List<Book> findByAuthorId(Long authorId);
}
