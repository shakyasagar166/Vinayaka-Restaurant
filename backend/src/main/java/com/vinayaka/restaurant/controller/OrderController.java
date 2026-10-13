package com.vinayaka.restaurant.controller;

import com.vinayaka.restaurant.dto.OrderCreateRequest;
import com.vinayaka.restaurant.dto.StatusUpdateRequest;
import com.vinayaka.restaurant.model.Order;
import com.vinayaka.restaurant.model.OrderStatus;
import com.vinayaka.restaurant.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // PUBLIC: Place Dine-In order directly from table QR code scan (NO LOGIN REQUIRED)
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // PUBLIC: Track order status for customer on their mobile
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<?> trackOrder(@PathVariable String orderNumber) {
        try {
            Order order = orderService.trackOrder(orderNumber);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // STAFF / ADMIN: View all orders (Live Kitchen Dashboard)
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String table) {
        if (table != null && !table.trim().isEmpty()) {
            return ResponseEntity.ok(orderService.getOrdersByTable(table.trim()));
        }
        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // STAFF / ADMIN: Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // STAFF / ADMIN: Update status (PENDING -> PREPARING -> SERVED -> COMPLETED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        try {
            Order updated = orderService.updateOrderStatus(id, request.getStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
