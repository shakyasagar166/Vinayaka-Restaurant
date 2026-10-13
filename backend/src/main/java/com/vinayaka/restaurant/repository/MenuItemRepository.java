package com.vinayaka.restaurant.repository;

import com.vinayaka.restaurant.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByIsAvailableTodayTrueOrderByIdAsc();

    List<MenuItem> findByCategoryOrderByIdAsc(String category);

    List<MenuItem> findByCategoryAndIsAvailableTodayTrueOrderByIdAsc(String category);

    @Query("SELECT DISTINCT m.category FROM MenuItem m ORDER BY m.category ASC")
    List<String> findDistinctCategories();

    List<MenuItem> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
