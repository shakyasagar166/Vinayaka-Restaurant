package com.vinayaka.restaurant.model;

public enum OrderStatus {
    PENDING,       // Newly placed by customer from dining table
    PREPARING,     // Kitchen has accepted and is preparing food
    SERVED,        // Food delivered to table
    COMPLETED,     // Bill settled / table cleared
    CANCELLED      // Cancelled
}
