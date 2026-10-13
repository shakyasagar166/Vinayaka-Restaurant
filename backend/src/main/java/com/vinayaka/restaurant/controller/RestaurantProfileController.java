package com.vinayaka.restaurant.controller;

import com.vinayaka.restaurant.model.RestaurantProfile;
import com.vinayaka.restaurant.repository.RestaurantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurant")
@CrossOrigin(origins = "*")
public class RestaurantProfileController {

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @GetMapping("/profile")
    public ResponseEntity<RestaurantProfile> getProfile() {
        RestaurantProfile profile = profileRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    RestaurantProfile defaultProfile = new RestaurantProfile(
                            "Garam Masala Family Restaurant",
                            "असली स्वाद, शुद्ध मसाले और पारिवारिक माहौल",
                            "Sagar Shakya",
                            "Restaurant Owner & Host",
                            "गरम मसाला फैमिली रेस्टोरेंट में आपका हार्दिक स्वागत है! हम अपने ग्राहकों को शुद्ध, ताज़ा और लाजवाब स्वाद परोसने के लिए प्रतिबद्ध हैं। हमारे यहाँ विशेष तंदूरी रोटियाँ, स्वादिष्ट पनीर व दाल हांडी, क्रिस्पी चिली पोटैटो, और देसी चाउमीन खास अंदाज़ में तैयार की जाती हैं।",
                            "+91 98765 43210",
                            "Garam Masala Restaurant, Near Main Market",
                            "11:00 AM - 11:30 PM (Daily)",
                            "/images/restaurant-interior.webp"
                    );
                    return profileRepository.save(defaultProfile);
                });
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<RestaurantProfile> updateProfile(@RequestBody RestaurantProfile incoming) {
        RestaurantProfile profile = profileRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> new RestaurantProfile());

        if (incoming.getRestaurantName() != null && !incoming.getRestaurantName().trim().isEmpty()) {
            profile.setRestaurantName(incoming.getRestaurantName());
        }
        profile.setTagline(incoming.getTagline());
        profile.setOwnerName(incoming.getOwnerName());
        profile.setOwnerTitle(incoming.getOwnerTitle());
        profile.setAboutStory(incoming.getAboutStory());
        profile.setContactPhone(incoming.getContactPhone());
        profile.setAddress(incoming.getAddress());
        profile.setOpeningHours(incoming.getOpeningHours());
        if (incoming.getBannerImage() != null) {
            profile.setBannerImage(incoming.getBannerImage());
        }
        if (incoming.getGalleryImages() != null) {
            profile.setGalleryImages(incoming.getGalleryImages());
        }

        RestaurantProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }
}
