package com.vinayaka.restaurant.service;

import com.vinayaka.restaurant.dto.MenuItemRequest;
import com.vinayaka.restaurant.model.MenuItem;
import com.vinayaka.restaurant.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByIsAvailableTodayTrueOrderByIdAsc();
    }

    public List<String> getAllCategories() {
        return menuItemRepository.findDistinctCategories();
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
    }

    public MenuItem createMenuItem(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        mapRequestToEntity(request, item);
        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = getMenuItemById(id);
        mapRequestToEntity(request, item);
        return menuItemRepository.save(item);
    }

    public MenuItem toggleAvailability(Long id, boolean availableToday) {
        MenuItem item = getMenuItemById(id);
        item.setAvailableToday(availableToday);
        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(Long id) {
        MenuItem item = getMenuItemById(id);
        menuItemRepository.delete(item);
    }

    private void mapRequestToEntity(MenuItemRequest request, MenuItem item) {
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setVeg(request.isVeg());
        item.setAvailableToday(request.isAvailableToday());
        item.setChefSpecial(request.isChefSpecial());
        item.setImageUrl(request.getImageUrl());
        item.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
    }
}
