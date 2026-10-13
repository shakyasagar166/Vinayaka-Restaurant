package com.vinayaka.restaurant.dto;

import com.vinayaka.restaurant.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus status;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
