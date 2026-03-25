package com.fortofknowledge;

import com.fortofknowledge.entity.Author;
import com.fortofknowledge.entity.Book;
import com.fortofknowledge.entity.Category;
import com.fortofknowledge.repository.AuthorRepository;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.CategoryRepository;
import com.fortofknowledge.repository.CartItemRepository;
import com.fortofknowledge.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

        private final BookRepository bookRepository;
        private final CategoryRepository categoryRepository;
        private final AuthorRepository authorRepository;
        private final CartItemRepository cartItemRepository;
        private final OrderRepository orderRepository;
        private final com.fortofknowledge.repository.UserRepository userRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        public DataInitializer(BookRepository bookRepository,
                        CategoryRepository categoryRepository,
                        AuthorRepository authorRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        com.fortofknowledge.repository.UserRepository userRepository,
                        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
                this.bookRepository = bookRepository;
                this.categoryRepository = categoryRepository;
                this.authorRepository = authorRepository;
                this.cartItemRepository = cartItemRepository;
                this.orderRepository = orderRepository;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                System.out.println("Force refreshing library with authors and preview snippets...");

                cartItemRepository.deleteAllInBatch();
                orderRepository.deleteAllInBatch();
                bookRepository.deleteAllInBatch();
                authorRepository.deleteAllInBatch();
                categoryRepository.deleteAllInBatch();

                seedData();
        }

        private void seedData() {
                // Seed Admin if not exists
                if (!userRepository.findByEmail("admin@fortofknowledge.com").isPresent()) {
                        com.fortofknowledge.entity.User admin = new com.fortofknowledge.entity.User();
                        admin.setName("Admin User");
                        admin.setEmail("admin@fortofknowledge.com");
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        admin.setRole("ADMIN");
                        userRepository.save(admin);
                }

                Category fiction = getOrCreateCategory("Fiction");
                Category sciFi = getOrCreateCategory("Sci-Fi");
                Category fantasy = getOrCreateCategory("Fantasy");
                Category mystery = getOrCreateCategory("Mystery");
                Category business = getOrCreateCategory("Business");
                Category sanathanaDharmam = getOrCreateCategory("Sanathana Dharmam");

                // Authors
                Author fitszgerald = getOrCreateAuthor("F. Scott Fitzgerald",
                                "Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novels depicting the flamboyance and excess of the Jazz Age.",
                                "https://upload.wikimedia.org/wikipedia/commons/5/5c/F_Scott_Fitzgerald_1921.jpg");
                Author harperLee = getOrCreateAuthor("Harper Lee",
                                "Nelle Harper Lee was an American novelist best known for her 1960 novel To Kill a Mockingbird.",
                                "https://upload.wikimedia.org/wikipedia/commons/5/5f/Harper_Lee_circa_1960.jpg");
                Author orwell = getOrCreateAuthor("George Orwell",
                                "Eric Arthur Blair, better known by his pen name George Orwell, was an English novelist, essayist, journalist and critic.",
                                "https://upload.wikimedia.org/wikipedia/commons/7/7e/George_Orwell_press_photo.jpg");
                Author herbert = getOrCreateAuthor("Frank Herbert",
                                "Franklin Patrick Herbert Jr. was an American science fiction novelist and short story writer, best known for the novel Dune and its five sequels.",
                                "https://upload.wikimedia.org/wikipedia/commons/d/de/Frank_Herbert_portrait.jpg");
                Author tolkien = getOrCreateAuthor("J.R.R. Tolkien",
                                "John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic.",
                                "https://upload.wikimedia.org/wikipedia/commons/d/d4/J._R._R._Tolkien%2C_ca._1925.jpg");
                Author rowling = getOrCreateAuthor("J.K. Rowling",
                                "Joanne Rowling, better known by her pen name J. K. Rowling, is a British author and philanthropist.",
                                "https://upload.wikimedia.org/wikipedia/commons/5/5d/J._K._Rowling_2010.jpg");
                Author doyle = getOrCreateAuthor("Arthur Conan Doyle",
                                "Sir Arthur Ignatius Conan Doyle was a British writer and physician.",
                                "https://upload.wikimedia.org/wikipedia/commons/b/bb/Conan_doyle.jpg");
                Author christie = getOrCreateAuthor("Agatha Christie",
                                "Dame Agatha Mary Clarissa Christie, Lady Mallowan, was an English writer known for her 66 detective novels.",
                                "https://upload.wikimedia.org/wikipedia/commons/c/cf/Agatha_Christie.JPG");
                Author ries = getOrCreateAuthor("Eric Ries",
                                "Eric Ries is an American entrepreneur, blogger, and author of The Lean Startup.",
                                "https://upload.wikimedia.org/wikipedia/commons/1/11/Eric_Ries_Offscreen_Engagement.jpg");
                Author thiel = getOrCreateAuthor("Peter Thiel",
                                "Peter Andreas Thiel is a German-American billionaire entrepreneur and venture capitalist.",
                                "https://upload.wikimedia.org/wikipedia/commons/1/15/Peter_Thiel_by_Gage_Skidmore.jpg");

                Author vyasa = getOrCreateAuthor("Sage Vyasa",
                                "Badarayana, also known as Veda Vyas, is a revered figure in Hinduism, credited as the traditional author of the Mahabharata, the Puranas, and the Vedas.",
                                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Vyasa_teaching_Mahabharata_to_Ganesha.jpg/800px-Vyasa_teaching_Mahabharata_to_Ganesha.jpg");
                Author valmiki = getOrCreateAuthor("Sage Valmiki",
                                "Valmiki is celebrated as the harbinger-poet in Sanskrit literature and the author of the epic Ramayana.",
                                "https://upload.wikimedia.org/wikipedia/commons/2/23/Saint_Valmiki.jpg");
                Author adiShankara = getOrCreateAuthor("Adi Shankara",
                                "Adi Shankaracharya was an 8th-century Indian philosopher and theologian who consolidated the doctrine of Advaita Vedanta.",
                                "https://upload.wikimedia.org/wikipedia/commons/7/77/Shankaracharya.jpg");

                List<Book> books = Arrays.asList(
                                new Book(null, "The Great Gatsby", fitszgerald, 999.00, 15,
                                                "A story of wealth, love, and the American Dream in the 1920s.",
                                                "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
                                                "https://www.gutenberg.org/files/64317/64317-h/64317-h.htm", fiction,
                                                "Wealth, Love, 1920s", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
                                                                "https://picsum.photos/seed/gatsby1/600/800",
                                                                "https://picsum.photos/seed/gatsby2/600/800")),
                                new Book(null, "To Kill a Mockingbird", harperLee, 1199.00, 10,
                                                "A classic novel about racial injustice and the loss of innocence.",
                                                "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg", null,
                                                fiction,
                                                "Injustice, Innocence, Drama", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
                                                                "https://picsum.photos/seed/mockingbird1/600/800",
                                                                "https://picsum.photos/seed/mockingbird2/600/800")),
                                new Book(null, "1984", orwell, 899.00, 20,
                                                "A dystopian masterpiece about surveillance and totalitarianism.",
                                                "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
                                                "https://archive.org/details/george-orwell-1984", sciFi,
                                                "Dystopia, Surveillance, Politics", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
                                                                "https://picsum.photos/seed/1984a/600/800",
                                                                "https://picsum.photos/seed/1984b/600/800")),
                                new Book(null, "Dune", herbert, 1499.00, 8,
                                                "The epic story of desert planet Arrakis and the struggle for control.",
                                                "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg", null,
                                                sciFi,
                                                "Sci-Fi, Epic, Desert", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
                                                                "https://picsum.photos/seed/dune1/600/800",
                                                                "https://picsum.photos/seed/dune2/600/800")),
                                new Book(null, "The Hobbit", tolkien, 1299.00, 12,
                                                "Bilbo Baggins' unexpected journey to reclaim the Lonely Mountain.",
                                                "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg", null,
                                                fantasy,
                                                "Adventure, Fantasy, Journey", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
                                                                "https://picsum.photos/seed/hobbit1/600/800",
                                                                "https://picsum.photos/seed/hobbit2/600/800")),
                                new Book(null, "Harry Potter and the Sorcerer's Stone", rowling, 1599.00, 25,
                                                "The boy who lived begins his magical education at Hogwarts.",
                                                "https://covers.openlibrary.org/b/isbn/9780590353403-L.jpg", null,
                                                fantasy,
                                                "Magic, Fantasy, School", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780590353403-L.jpg",
                                                                "https://picsum.photos/seed/hp1/600/800",
                                                                "https://picsum.photos/seed/hp2/600/800")),
                                new Book(null, "The Adventures of Sherlock Holmes", doyle, 849.00, 18,
                                                "Twelve classic detective stories featuring the brilliant Sherlock Holmes.",
                                                "https://covers.openlibrary.org/b/isbn/9781853260339-L.jpg",
                                                "https://www.gutenberg.org/files/1661/1661-h/1661-h.htm", mystery,
                                                "Mystery, Detective, Crime", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9781853260339-L.jpg",
                                                                "https://picsum.photos/seed/sherlock1/600/800",
                                                                "https://picsum.photos/seed/sherlock2/600/800")),
                                new Book(null, "And Then There Were None", christie, 1099.00, 14,
                                                "Ten strangers are lured to an island where they are killed one by one.",
                                                "https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg", null,
                                                mystery,
                                                "Mystery, Suspense, Island", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg",
                                                                "https://picsum.photos/seed/christie1/600/800",
                                                                "https://picsum.photos/seed/christie2/600/800")),
                                new Book(null, "The Lean Startup", ries, 1799.00, 10,
                                                "How today's entrepreneurs use continuous innovation to create successful businesses.",
                                                "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg", null,
                                                business,
                                                "Business, Innovation, Startups", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
                                                                "https://picsum.photos/seed/startup1/600/800",
                                                                "https://picsum.photos/seed/startup2/600/800")),
                                new Book(null, "Zero to One", thiel, 1999.00, 7,
                                                "Notes on startups, or how to build the future.",
                                                "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg", null,
                                                business,
                                                "Business, Startups, Future", Arrays.asList(
                                                                "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
                                                                "https://picsum.photos/seed/zero1/600/800",
                                                                "https://picsum.photos/seed/zero2/600/800")),
                                new Book(null, "Bhagavad Gita", vyasa, 499.00, 100,
                                                "The sacred 700-verse Sanskrit scripture that is part of the Hindu epic Mahabharata.",
                                                "/images/gita.png", null,
                                                sanathanaDharmam,
                                                "Philosophy, Spirituality, Gita", Arrays.asList(
                                                                "/images/gita.png",
                                                                "https://images.unsplash.com/photo-1621509376993-490352520336?q=80&w=800&auto=format&fit=crop")),
                                new Book(null, "Ramayana", valmiki, 799.00, 50,
                                                "The ancient Indian epic which narrates the struggle of the divine prince Rama to rescue his wife Sita.",
                                                "/images/ramayana.png", null,
                                                sanathanaDharmam,
                                                "Epic, Prince Rama, Dharma", Arrays.asList(
                                                                "/images/ramayana.png",
                                                                "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?k=80&w=800&auto=format&fit=crop")),
                                new Book(null, "Mahabharata", vyasa, 1299.00, 30,
                                                "One of the two major Sanskrit epics of ancient India, a narrative of the Kurukshetra War.",
                                                "/images/mahabharata.png", null,
                                                sanathanaDharmam,
                                                "Epic, Kurukshetra, Pandavas", Arrays.asList(
                                                                "/images/mahabharata.png",
                                                                "https://images.unsplash.com/photo-1614088034032-9cb770857500?q=80&w=800&auto=format&fit=crop")),
                                new Book(null, "Vivekachudamani", adiShankara, 399.00, 40,
                                                "The Crest-Jewel of Discrimination, a famous Sanskrit work of Advaita Vedanta.",
                                                "/images/vivekachudamani.png", null,
                                                sanathanaDharmam,
                                                "Advaita, Philosophy, Vedanta", Arrays.asList(
                                                                "/images/vivekachudamani.png",
                                                                "https://images.unsplash.com/photo-1626266061368-46a831006a64?q=80&w=800&auto=format&fit=crop")));

                bookRepository.saveAll(books);
                System.out.println("Library successfully refreshed with real covers and authors!");
        }

        private Category getOrCreateCategory(String name) {
                return categoryRepository.findByName(name)
                                .orElseGet(() -> {
                                        Category newCat = new Category(null, name);
                                        return categoryRepository.save(newCat);
                                });
        }

        private Author getOrCreateAuthor(String name, String bio, String img) {
                return authorRepository.findByName(name)
                                .orElseGet(() -> {
                                        Author newAuthor = new Author(null, name, bio, img);
                                        return authorRepository.save(newAuthor);
                                });
        }
}
