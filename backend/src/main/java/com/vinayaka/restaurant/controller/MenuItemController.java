package com.vinayaka.restaurant.controller;

import com.vinayaka.restaurant.dto.AvailabilityToggleRequest;
import com.vinayaka.restaurant.dto.MenuItemRequest;
import com.vinayaka.restaurant.model.MenuItem;
import com.vinayaka.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    // Public for customers - returns dishes available today
    @GetMapping
    public ResponseEntity<List<MenuItem>> getAvailableMenu() {
        return ResponseEntity.ok(menuItemService.getAvailableMenuItems());
    }

    // For Staff / Admin - returns all dishes including currently out of stock items
    @GetMapping("/all")
    public ResponseEntity<List<MenuItem>> getAllMenuForAdmin() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }

    // Public categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(menuItemService.getAllCategories());
    }

    // Public get single item
    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(menuItemService.getMenuItemById(id));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Admin: Create new dish
    @PostMapping
    public ResponseEntity<?> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        try {
            MenuItem created = menuItemService.createMenuItem(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Admin: Update dish
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        try {
            MenuItem updated = menuItemService.updateMenuItem(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Staff/Admin: Toggle "Aaj kya kya hai" (Today's Availability)
    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> toggleAvailability(
            @PathVariable Long id,
            @RequestBody AvailabilityToggleRequest request) {
        try {
            MenuItem updated = menuItemService.toggleAvailability(id, request.isAvailableToday());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Admin: Delete dish
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        try {
            menuItemService.deleteMenuItem(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Menu item deleted successfully");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
