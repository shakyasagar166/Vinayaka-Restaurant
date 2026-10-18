package com.vinayaka.restaurant.service;

import com.vinayaka.restaurant.dto.OrderCreateRequest;
import com.vinayaka.restaurant.dto.OrderItemRequest;
import com.vinayaka.restaurant.model.MenuItem;
import com.vinayaka.restaurant.model.Order;
import com.vinayaka.restaurant.model.OrderItem;
import com.vinayaka.restaurant.model.OrderStatus;
import com.vinayaka.restaurant.repository.MenuItemRepository;
import com.vinayaka.restaurant.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private static final AtomicLong orderCounter = new AtomicLong(System.currentTimeMillis() % 100000);

    @Transactional
    public Order createOrder(OrderCreateRequest request) {
        String uniqueSuffix = String.format("%04d", (orderCounter.incrementAndGet() % 9000) + 1000);
        String orderNumber = "VR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" + uniqueSuffix;

        Order order = new Order(
                orderNumber,
                request.getTableNumber(),
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getSpecialInstructions()
        );
        if (request.getOrderType() != null && !request.getOrderType().trim().isEmpty()) {
            order.setOrderType(request.getOrderType().trim());
        } else {
            order.setOrderType("DINE_IN");
        }

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = null;
            if (itemReq.getMenuItemId() != null) {
                menuItem = menuItemRepository.findById(itemReq.getMenuItemId()).orElse(null);
            }
            if (menuItem == null && itemReq.getItemName() != null && !itemReq.getItemName().trim().isEmpty()) {
                menuItem = menuItemRepository.findFirstByNameIgnoreCase(itemReq.getItemName().trim()).orElse(null);
            }

            Long finalItemId = (menuItem != null) ? menuItem.getId() : (itemReq.getMenuItemId() != null ? itemReq.getMenuItemId() : 0L);
            String finalName = (menuItem != null) ? menuItem.getName() : (itemReq.getItemName() != null && !itemReq.getItemName().trim().isEmpty() ? itemReq.getItemName() : "Dining Dish");
            BigDecimal finalPrice = (menuItem != null) ? menuItem.getPrice() : (itemReq.getPrice() != null ? itemReq.getPrice() : new BigDecimal("250.00"));
            int qty = Math.max(1, itemReq.getQuantity());

            OrderItem orderItem = new OrderItem(
                    order,
                    finalItemId,
                    finalName,
                    finalPrice,
                    qty,
                    itemReq.getNotes()
            );

            grandTotal = grandTotal.add(orderItem.getSubtotal());
            order.addItem(orderItem);
        }

        order.setSubtotal(grandTotal);
        order.setTotalAmount(grandTotal);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByTable(String tableNumber) {
        return orderRepository.findByTableNumberOrderByCreatedAtDesc(tableNumber);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public Order trackOrder(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with order number: " + orderNumber));
    }

    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return;
        String clean = identifier.trim();
        Order order = null;
        try {
            Long id = Long.parseLong(clean);
            order = orderRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (order == null) {
            order = orderRepository.findByOrderNumber(clean).orElse(null);
        }

        if (order != null) {
            orderRepository.delete(order);
        }
    }

    @Transactional
    public void deleteOrder(Long id) {
        if (id == null) return;
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            orderRepository.delete(order);
        }
    }

    @Transactional
    public int deleteCancelledOrders() {
        List<Order> cancelled = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.CANCELLED);
        int count = cancelled.size();
        if (count > 0) {
            orderRepository.deleteAll(cancelled);
        }
        return count;
    }

    public Map<String, Object> getDashboardStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long totalOrdersToday = orderRepository.countOrdersSince(startOfToday);
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long preparingOrders = orderRepository.countByStatus(OrderStatus.PREPARING);
        long servedOrders = orderRepository.countByStatus(OrderStatus.SERVED);
        long completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
        Double totalRevenueToday = orderRepository.sumRevenueSince(startOfToday);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrdersToday", totalOrdersToday);
        stats.put("pendingOrders", pendingOrders);
        stats.put("preparingOrders", preparingOrders);
        stats.put("servedOrders", servedOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("totalRevenueToday", totalRevenueToday != null ? totalRevenueToday : 0.0);

        return stats;
    }
}
