package com.vinayaka.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderCreateRequest {

    @NotBlank(message = "Table number is required")
    private String tableNumber;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerPhone;

    private String specialInstructions;

    @NotEmpty(message = "Cart cannot be empty. Please select at least one item.")
    @Valid
    private List<OrderItemRequest> items;

    public OrderCreateRequest() {}

    public OrderCreateRequest(String tableNumber, String customerName, String customerPhone, String specialInstructions, List<OrderItemRequest> items) {
        this.tableNumber = tableNumber;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.specialInstructions = specialInstructions;
        this.items = items;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
