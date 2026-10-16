package com.vinayaka.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class VinayakaRestaurantApplication {

    @PostConstruct
    public void init() {
        // Set standard Indian Standard Time (IST) across the entire application and database sessions
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(VinayakaRestaurantApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🌟 Vinayaka Restaurant (Rooftop & Lounge) Backend Started Successfully! 🌟");
        System.out.println("API running at: http://localhost:8080/api (Timezone: Asia/Kolkata IST)");
        System.out.println("==================================================================");
    }
}
