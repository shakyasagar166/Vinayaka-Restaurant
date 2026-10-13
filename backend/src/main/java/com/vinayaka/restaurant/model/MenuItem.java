package com.vinayaka.restaurant.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 60)
    private String category; // e.g. "Rooftop Starters", "Main Course", "Tandoor & Grills", "Mocktails & Lounge", "Breads & Rice", "Desserts"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private boolean isVeg = true;

    // Vinayaka staff can toggle if this item is available today or sold out!
    @Column(nullable = false)
    private boolean isAvailableToday = true;

    private boolean isChefSpecial = false;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    private int preparationTimeMinutes = 15;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public MenuItem() {}

    public MenuItem(String name, String description, String category, BigDecimal price, boolean isVeg, boolean isAvailableToday, boolean isChefSpecial, String imageUrl, int preparationTimeMinutes) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.isVeg = isVeg;
        this.isAvailableToday = isAvailableToday;
        this.isChefSpecial = isChefSpecial;
        this.imageUrl = imageUrl;
        this.preparationTimeMinutes = preparationTimeMinutes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isVeg() {
        return isVeg;
    }

    public void setVeg(boolean isVeg) {
        this.isVeg = isVeg;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isAvailableToday")
    public boolean isAvailableToday() {
        return isAvailableToday;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("availableToday")
    public boolean getAvailableToday() {
        return isAvailableToday;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isAvailableToday")
    @com.fasterxml.jackson.annotation.JsonAlias({"availableToday", "inStock"})
    public void setAvailableToday(boolean availableToday) {
        this.isAvailableToday = availableToday;
    }

    public boolean isChefSpecial() {
        return isChefSpecial;
    }

    public void setChefSpecial(boolean chefSpecial) {
        this.isChefSpecial = chefSpecial;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public void setPreparationTimeMinutes(int preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
