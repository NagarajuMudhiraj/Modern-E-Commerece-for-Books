package com.fortofknowledge.controller;

import com.fortofknowledge.entity.Book;
import com.fortofknowledge.entity.Order;
import com.fortofknowledge.entity.User;
import com.fortofknowledge.repository.BookRepository;
import com.fortofknowledge.repository.OrderRepository;
import com.fortofknowledge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    BookRepository bookRepository;

    @Autowired
    OrderRepository orderRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalOrders", orderRepository.count());

        List<Order> allOrders = orderRepository.findAll();
        double revenue = allOrders.stream().mapToDouble(Order::getTotalAmount).sum();
        stats.put("revenue", revenue);

        // Advanced Metrics
        double aov = allOrders.isEmpty() ? 0 : revenue / allOrders.size();
        stats.put("aov", aov);

        // MRR (last 30 days)
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        double mrr = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(thirtyDaysAgo))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        stats.put("mrr", mrr);

        // Category Distribution
        Map<String, Long> categoryDist = bookRepository.findAll().stream()
                .filter(b -> b.getCategory() != null)
                .collect(Collectors.groupingBy(b -> b.getCategory().getName(), Collectors.counting()));

        List<Map<String, Object>> categoryData = new ArrayList<>();
        categoryDist.forEach((name, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", name);
            item.put("value", count);
            categoryData.add(item);
        });
        stats.put("categoryData", categoryData);

        // Low stock books (threshold 10)
        stats.put("lowStock", bookRepository.findByStockLessThan(10));

        // Sales by day (last 7 days)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        Map<String, Double> salesMap = allOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getCreatedAt().format(formatter),
                        Collectors.summingDouble(Order::getTotalAmount)));

        List<Map<String, Object>> salesByDay = new ArrayList<>();
        salesMap.forEach((date, amount) -> {
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("date", date);
            dayStat.put("amount", amount);
            salesByDay.add(dayStat);
        });
        stats.put("salesByDay", salesByDay);

        return stats;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole());
            map.put("phone", user.getPhone());
            map.put("created_at", user.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return response;
    }

    @PutMapping("/users/{id}/role")
    public Map<String, String> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(request.get("role"));
        userRepository.save(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User role updated successfully");
        return response;
    }
}
