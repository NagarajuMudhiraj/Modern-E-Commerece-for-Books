package com.fortofknowledge.controller;

import com.fortofknowledge.dto.OrderDto.OrderRequest;
import com.fortofknowledge.entity.Order;
import com.fortofknowledge.entity.OrderItem;
import com.fortofknowledge.entity.User;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.OrderRepository;
import com.fortofknowledge.repository.UserRepository;
import com.fortofknowledge.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookRepository bookRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername()).get();
    }

    @PostMapping
    @Transactional
    public Order placeOrder(@RequestBody OrderRequest request) {
        User user = getCurrentUser();
        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(request.getPaymentMethod());

        // Handle Points Redemption
        double discount = 0.0;
        if (request.getPointsUsed() != null && request.getPointsUsed() > 0) {
            if (user.getPoints() < request.getPointsUsed()) {
                throw new RuntimeException("Insufficient reward points");
            }
            // 10 points = 1 Rupee/Unit
            discount = request.getPointsUsed() / 10.0;
            user.setPoints(user.getPoints() - request.getPointsUsed());
            order.setPointsUsed(request.getPointsUsed());
            order.setDiscountAmount(discount);
        }

        order.setTotalAmount(request.getTotalAmount());

        List<OrderItem> items = request.getItems().stream().map(i -> {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            com.fortofknowledge.entity.Book book = bookRepository.findById(i.getBookId()).get();

            // Decrement stock
            if (book.getStock() < i.getQuantity()) {
                throw new RuntimeException("Insufficient stock for book: " + book.getTitle());
            }
            book.setStock(book.getStock() - i.getQuantity());
            bookRepository.save(book);

            item.setBook(book);
            item.setQuantity(i.getQuantity());
            item.setPrice(i.getPrice());
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);
        orderRepository.save(order);

        // Award points (10% of PAID amount)
        int pointsGained = (int) (order.getTotalAmount() * 0.1);
        user.setPoints((user.getPoints() == null ? 0 : user.getPoints()) + pointsGained);
        userRepository.save(user);

        cartItemRepository.deleteByUser(user);
        return order;
    }

    @GetMapping
    public List<Order> getOrders() {
        User user = getCurrentUser();
        if ("ADMIN".equals(user.getRole())) {
            return orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(request.get("status"));
        return orderRepository.save(order);
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public Order cancelOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        User user = getCurrentUser();

        // Verify ownership or admin role
        if (!order.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }

        // Verify status
        if (!"Ordered".equals(order.getStatus()) && !"Packed".equals(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled in its current state: " + order.getStatus());
        }

        // Restore stock
        for (com.fortofknowledge.entity.OrderItem item : order.getItems()) {
            com.fortofknowledge.entity.Book book = item.getBook();
            book.setStock(book.getStock() + item.getQuantity());
            bookRepository.save(book);
        }

        order.setStatus("Cancelled");
        return orderRepository.save(order);
    }
}
