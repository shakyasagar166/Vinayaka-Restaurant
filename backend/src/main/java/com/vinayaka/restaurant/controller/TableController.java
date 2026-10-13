package com.vinayaka.restaurant.controller;

import com.vinayaka.restaurant.model.DiningTable;
import com.vinayaka.restaurant.service.DiningTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private DiningTableService diningTableService;

    // Public: List active tables for customer table selector fallback
    @GetMapping("/active")
    public ResponseEntity<List<DiningTable>> getActiveTables() {
        return ResponseEntity.ok(diningTableService.getActiveTables());
    }

    // Staff/Admin: List all tables
    @GetMapping
    public ResponseEntity<List<DiningTable>> getAllTables() {
        return ResponseEntity.ok(diningTableService.getAllTables());
    }

    // Admin: Add new table
    @PostMapping
    public ResponseEntity<?> createTable(@RequestBody DiningTable table) {
        try {
            DiningTable created = diningTableService.createTable(table);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Admin: Update table
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTable(@PathVariable Long id, @RequestBody DiningTable table) {
        try {
            DiningTable updated = diningTableService.updateTable(id, table);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Admin: Delete table
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable Long id) {
        try {
            diningTableService.deleteTable(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Table deleted successfully");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
