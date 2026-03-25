package com.fortofknowledge.dto;

import java.util.List;

public class OrderDto {
    public static class CartRequest {
        private Long bookId;
        private Integer quantity;

        public CartRequest() {
        }

        public Long getBookId() {
            return bookId;
        }

        public void setBookId(Long bookId) {
            this.bookId = bookId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class OrderRequest {
        private Double totalAmount;
        private String paymentMethod;
        private Integer pointsUsed = 0;
        private List<OrderItemRequest> items;

        public OrderRequest() {
        }

        public Double getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public Integer getPointsUsed() {
            return pointsUsed;
        }

        public void setPointsUsed(Integer pointsUsed) {
            this.pointsUsed = pointsUsed;
        }

        public List<OrderItemRequest> getItems() {
            return items;
        }

        public void setItems(List<OrderItemRequest> items) {
            this.items = items;
        }
    }

    public static class OrderItemRequest {
        private Long bookId;
        private Integer quantity;
        private Double price;

        public OrderItemRequest() {
        }

        public Long getBookId() {
            return bookId;
        }

        public void setBookId(Long bookId) {
            this.bookId = bookId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }
    }
}
