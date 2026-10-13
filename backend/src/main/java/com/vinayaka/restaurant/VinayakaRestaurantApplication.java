package com.vinayaka.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VinayakaRestaurantApplication {

    public static void main(String[] args) {
        SpringApplication.run(VinayakaRestaurantApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🌟 Vinayaka Restaurant (Rooftop & Lounge) Backend Started Successfully! 🌟");
        System.out.println("API running at: http://localhost:8080/api");
        System.out.println("==================================================================");
    }
}
