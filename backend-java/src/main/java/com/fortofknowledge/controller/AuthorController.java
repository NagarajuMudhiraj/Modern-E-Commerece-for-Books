package com.fortofknowledge.controller;

import com.fortofknowledge.entity.Author;
import com.fortofknowledge.entity.Book;
import com.fortofknowledge.repository.AuthorRepository;
import com.fortofknowledge.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "*")
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private BookRepository bookRepository;

    @GetMapping
    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    @GetMapping("/{id}")
    public Author getAuthorById(@PathVariable Long id) {
        return authorRepository.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/bibliography")
    public List<Book> getAuthorBibliography(@PathVariable Long id) {
        return bookRepository.findByAuthorId(id);
    }
}
