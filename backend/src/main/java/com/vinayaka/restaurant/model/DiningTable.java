package com.vinayaka.restaurant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dining_tables")
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String tableNumber; // e.g., "Rooftop-01", "Table-5", "Lounge-VIP"

    @Column(nullable = false, length = 60)
    private String section; // "Rooftop Open Air", "Luxury Lounge", "AC Family Dining"

    private int seatingCapacity = 4;

    private boolean active = true;

    @Column(length = 100)
    private String qrCodeIdentifier;

    private LocalDateTime createdAt = LocalDateTime.now();

    public DiningTable() {}

    public DiningTable(String tableNumber, String section, int seatingCapacity, String qrCodeIdentifier) {
        this.tableNumber = tableNumber;
        this.section = section;
        this.seatingCapacity = seatingCapacity;
        this.qrCodeIdentifier = qrCodeIdentifier;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public int getSeatingCapacity() {
        return seatingCapacity;
    }

    public void setSeatingCapacity(int seatingCapacity) {
        this.seatingCapacity = seatingCapacity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getQrCodeIdentifier() {
        return qrCodeIdentifier;
    }

    public void setQrCodeIdentifier(String qrCodeIdentifier) {
        this.qrCodeIdentifier = qrCodeIdentifier;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
