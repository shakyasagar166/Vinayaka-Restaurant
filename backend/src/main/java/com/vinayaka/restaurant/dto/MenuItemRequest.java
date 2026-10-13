package com.vinayaka.restaurant.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class MenuItemRequest {

    @NotBlank(message = "Dish name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private boolean isVeg = true;

    @JsonProperty("isAvailableToday")
    @JsonAlias({"availableToday", "inStock"})
    private boolean isAvailableToday = true;

    private boolean isChefSpecial = false;

    private String imageUrl;

    private int preparationTimeMinutes = 15;

    public MenuItemRequest() {}

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

    public void setVeg(boolean veg) {
        isVeg = veg;
    }

    public boolean isAvailableToday() {
        return isAvailableToday;
    }

    public void setAvailableToday(boolean availableToday) {
        isAvailableToday = availableToday;
    }

    public void setIsAvailableToday(boolean isAvailableToday) {
        this.isAvailableToday = isAvailableToday;
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
}
