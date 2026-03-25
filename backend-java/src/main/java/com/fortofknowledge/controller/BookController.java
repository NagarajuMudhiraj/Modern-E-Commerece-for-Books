package com.fortofknowledge.controller;

import com.fortofknowledge.entity.Book;
import com.fortofknowledge.entity.Category;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    BookRepository bookRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/books/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookRepository.findById(id).orElseThrow();
    }

    @GetMapping("/books/{id}/recommendations")
    public List<Book> getRecommendations(@PathVariable Long id) {
        Book book = bookRepository.findById(id).orElseThrow();
        if (book.getCategory() == null) {
            return java.util.Collections.emptyList();
        }
        return bookRepository.findTop5ByCategoryIdAndIdNot(book.getCategory().getId(), id);
    }

    @GetMapping("/books/search")
    public List<Book> searchBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "id") String sortBy) {

        List<Book> books = bookRepository.findAll();

        return books.stream()
                .filter(b -> query == null || b.getTitle().toLowerCase().contains(query.toLowerCase())
                        || (b.getAuthor() != null
                                && b.getAuthor().getName().toLowerCase().contains(query.toLowerCase()))
                        || (b.getDescription() != null
                                && b.getDescription().toLowerCase().contains(query.toLowerCase()))
                        || (b.getTopics() != null && b.getTopics().toLowerCase().contains(query.toLowerCase())))
                .filter(b -> categoryId == null
                        || (b.getCategory() != null && b.getCategory().getId().equals(categoryId)))
                .filter(b -> minPrice == null || b.getPrice() >= minPrice)
                .filter(b -> maxPrice == null || b.getPrice() <= maxPrice)
                .sorted((a, b1) -> {
                    if ("priceAsc".equals(sortBy))
                        return Double.compare(a.getPrice(), b1.getPrice());
                    if ("priceDesc".equals(sortBy))
                        return Double.compare(b1.getPrice(), a.getPrice());
                    if ("title".equals(sortBy))
                        return a.getTitle().compareToIgnoreCase(b1.getTitle());
                    return b1.getId().compareTo(a.getId()); // Default: Newest
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/books")
    @PreAuthorize("hasRole('ADMIN')")
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Book updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Book book = bookRepository.findById(id).orElseThrow();
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setPrice(bookDetails.getPrice());
        book.setStock(bookDetails.getStock());
        book.setDescription(bookDetails.getDescription());
        book.setImageUrl(bookDetails.getImageUrl());
        book.setCategory(bookDetails.getCategory());
        return bookRepository.save(book);
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }
}
