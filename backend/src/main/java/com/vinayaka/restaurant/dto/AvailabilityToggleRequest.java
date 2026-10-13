package com.vinayaka.restaurant.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AvailabilityToggleRequest {

    @JsonProperty("isAvailableToday")
    @JsonAlias({"availableToday", "inStock"})
    private boolean availableToday = true;

    public AvailabilityToggleRequest() {}

    public AvailabilityToggleRequest(boolean availableToday) {
        this.availableToday = availableToday;
    }

    public boolean isAvailableToday() {
        return availableToday;
    }

    public void setAvailableToday(boolean availableToday) {
        this.availableToday = availableToday;
    }

    public void setIsAvailableToday(boolean isAvailableToday) {
        this.availableToday = isAvailableToday;
    }
}
