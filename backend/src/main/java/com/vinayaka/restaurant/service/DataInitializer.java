package com.vinayaka.restaurant.service;

import com.vinayaka.restaurant.model.DiningTable;
import com.vinayaka.restaurant.model.MenuItem;
import com.vinayaka.restaurant.model.Role;
import com.vinayaka.restaurant.model.User;
import com.vinayaka.restaurant.repository.DiningTableRepository;
import com.vinayaka.restaurant.repository.MenuItemRepository;
import com.vinayaka.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedTables();
        seedMenuItems();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("vinayaka@123"),
                    "Vinayaka Manager",
                    Role.ADMIN
            );
            User staff = new User(
                    "staff",
                    passwordEncoder.encode("vinayaka@123"),
                    "Captain Raj",
                    Role.STAFF
            );
            userRepository.saveAll(Arrays.asList(admin, staff));
            System.out.println("✅ Default Admin & Staff accounts initialized (admin / vinayaka@123)");
        }
    }

    private void seedTables() {
        if (diningTableRepository.count() == 0) {
            List<DiningTable> tables = Arrays.asList(
                    new DiningTable("Rooftop-01", "Rooftop Open Air", 4, "vr-rooftop-01"),
                    new DiningTable("Rooftop-02", "Rooftop Open Air", 4, "vr-rooftop-02"),
                    new DiningTable("Rooftop-03", "Rooftop Open Air", 6, "vr-rooftop-03"),
                    new DiningTable("Rooftop-04", "Rooftop Sky Deck", 2, "vr-rooftop-04"),
                    new DiningTable("Rooftop-05", "Rooftop Sky Deck", 4, "vr-rooftop-05"),

                    new DiningTable("Lounge-01", "Luxury Lounge", 6, "vr-lounge-01"),
                    new DiningTable("Lounge-VIP-02", "VIP Lounge", 8, "vr-lounge-vip-02"),
                    new DiningTable("Lounge-03", "Luxury Lounge", 4, "vr-lounge-03"),

                    new DiningTable("Table-01", "AC Family Dining", 4, "vr-table-01"),
                    new DiningTable("Table-02", "AC Family Dining", 4, "vr-table-02"),
                    new DiningTable("Table-03", "AC Family Dining", 6, "vr-table-03"),
                    new DiningTable("Table-04", "AC Family Dining", 8, "vr-table-04")
            );
            diningTableRepository.saveAll(tables);
            System.out.println("✅ Dining tables seeded for Rooftop, Lounge and AC Dining sections");
        }
    }

    private void seedMenuItems() {
        if (menuItemRepository.count() < 5) {
            List<MenuItem> items = Arrays.asList(
                    // Rooftop Starters
                    new MenuItem(
                            "Paneer Angara Tikka",
                            "Cottage cheese cubes marinated in fiery red spices, smoked to perfection in tandoor.",
                            "Rooftop Starters",
                            new BigDecimal("320.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
                            15
                    ),
                    new MenuItem(
                            "Crispy Chilli Baby Corn",
                            "Golden fried tender baby corn tossed with bell peppers, garlic & spicy oriental sauce.",
                            "Rooftop Starters",
                            new BigDecimal("260.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
                            12
                    ),
                    new MenuItem(
                            "Chicken Afghani Tikka",
                            "Succulent chicken chunks marinated in cashew cream, cheese, cardamom and slow-grilled.",
                            "Rooftop Starters",
                            new BigDecimal("380.00"),
                            false, true, true,
                            "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
                            18
                    ),
                    new MenuItem(
                            "Tandoori Soya Chaap",
                            "Protein-rich soya chaap soaked in traditional tandoori spices and mint glaze.",
                            "Rooftop Starters",
                            new BigDecimal("280.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
                            15
                    ),
                    new MenuItem(
                            "Peri Peri Loaded Fries",
                            "Crispy potato fries dusted with tangy peri-peri seasoning and drizzled with cheese sauce.",
                            "Rooftop Starters",
                            new BigDecimal("210.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
                            10
                    ),

                    // Main Course
                    new MenuItem(
                            "Vinayaka Special Dal Makhani",
                            "Black lentils slow cooked overnight on charcoal with butter, rich cream and aromatic spices.",
                            "Main Course",
                            new BigDecimal("290.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
                            15
                    ),
                    new MenuItem(
                            "Paneer Lababdar",
                            "Soft cottage cheese cooked in a rich, velvety tomato-onion-cashew gravy with grated paneer.",
                            "Main Course",
                            new BigDecimal("340.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
                            20
                    ),
                    new MenuItem(
                            "Butter Chicken Masala",
                            "Clay oven roasted chicken steeped in a silky makhani gravy with fenugreek butter glaze.",
                            "Main Course",
                            new BigDecimal("420.00"),
                            false, true, true,
                            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
                            20
                    ),
                    new MenuItem(
                            "Kadhai Murgh",
                            "Tender bone-in chicken simmered in freshly ground roasted coriander & red chilli spice blend.",
                            "Main Course",
                            new BigDecimal("390.00"),
                            false, true, false,
                            "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
                            18
                    ),
                    new MenuItem(
                            "Kadhai Paneer Handi",
                            "Paneer cubes cooked with crunchy bell peppers, onions and crushed whole coriander seeds.",
                            "Main Course",
                            new BigDecimal("330.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
                            15
                    ),

                    // Breads & Rice
                    new MenuItem(
                            "Butter Naan",
                            "Refined flour bread baked in tandoor and brushed with fresh dairy butter.",
                            "Breads & Rice",
                            new BigDecimal("60.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
                            8
                    ),
                    new MenuItem(
                            "Garlic Chur Chur Naan",
                            "Crispy layered tandoori naan stuffed with garlic and herbs, crushed with butter.",
                            "Breads & Rice",
                            new BigDecimal("90.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
                            10
                    ),
                    new MenuItem(
                            "Hyderabadi Dum Biryani (Veg)",
                            "Fragrant long grain basmati rice layered with vegetables, saffron and fried onions. Served with raita.",
                            "Breads & Rice",
                            new BigDecimal("290.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
                            18
                    ),
                    new MenuItem(
                            "Chicken Dum Biryani (Lounge Special)",
                            "Slow-cooked marinated chicken layered with aromatic rice, mint, rose water and saffron.",
                            "Breads & Rice",
                            new BigDecimal("380.00"),
                            false, true, true,
                            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
                            20
                    ),

                    // Rooftop Mocktails & Lounge
                    new MenuItem(
                            "Blue Ocean Curacao Mocktail",
                            "Refreshing blend of blue curacao, fresh lime, mint leaves and chilled fizzy sprite.",
                            "Rooftop Mocktails",
                            new BigDecimal("180.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
                            5
                    ),
                    new MenuItem(
                            "Vinayaka Rooftop Sunset Punch",
                            "Layered orange, cranberry and passionfruit nectar garnished with fresh rosemary & citrus wheel.",
                            "Rooftop Mocktails",
                            new BigDecimal("220.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
                            6
                    ),
                    new MenuItem(
                            "Virgin Mojito (Classic Mint)",
                            "Muddled fresh mint, lime wedges, simple cane syrup topped with sparkling soda and crushed ice.",
                            "Rooftop Mocktails",
                            new BigDecimal("160.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=80",
                            5
                    ),
                    new MenuItem(
                            "Nutella Hazelnut Thick Shake",
                            "Rich creamy shake blended with real Nutella, vanilla bean gelato and roasted hazelnuts.",
                            "Rooftop Mocktails",
                            new BigDecimal("240.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
                            8
                    ),

                    // Desserts
                    new MenuItem(
                            "Sizzling Brownie with Vanilla Gelato",
                            "Warm chocolate walnut brownie served on a hot sizzler plate with melted chocolate fudge sauce.",
                            "Desserts",
                            new BigDecimal("250.00"),
                            true, true, true,
                            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
                            10
                    ),
                    new MenuItem(
                            "Gulab Jamun with Shahi Rabdi",
                            "Soft hot mawa dumplings dipped in saffron syrup served over thick chilled kesar rabdi.",
                            "Desserts",
                            new BigDecimal("190.00"),
                            true, true, false,
                            "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
                            7
                    )
            );
            menuItemRepository.saveAll(items);
            System.out.println("✅ Vinayaka Restaurant Rooftop & Lounge menu seeded successfully!");
        }
    }
}
