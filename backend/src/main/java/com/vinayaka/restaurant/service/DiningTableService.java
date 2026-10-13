package com.vinayaka.restaurant.service;

import com.vinayaka.restaurant.model.DiningTable;
import com.vinayaka.restaurant.repository.DiningTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiningTableService {

    @Autowired
    private DiningTableRepository diningTableRepository;

    public List<DiningTable> getAllTables() {
        return diningTableRepository.findAll();
    }

    public List<DiningTable> getActiveTables() {
        return diningTableRepository.findByActiveTrueOrderByTableNumberAsc();
    }

    public Optional<DiningTable> getTableByNumber(String tableNumber) {
        return diningTableRepository.findByTableNumber(tableNumber);
    }

    public DiningTable createTable(DiningTable table) {
        if (diningTableRepository.findByTableNumber(table.getTableNumber()).isPresent()) {
            throw new RuntimeException("Table number already exists: " + table.getTableNumber());
        }
        if (table.getQrCodeIdentifier() == null || table.getQrCodeIdentifier().isEmpty()) {
            table.setQrCodeIdentifier("table-" + table.getTableNumber().toLowerCase().replace(" ", "-"));
        }
        return diningTableRepository.save(table);
    }

    public DiningTable updateTable(Long id, DiningTable details) {
        DiningTable table = diningTableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));

        table.setTableNumber(details.getTableNumber());
        table.setSection(details.getSection());
        table.setSeatingCapacity(details.getSeatingCapacity());
        table.setActive(details.isActive());
        return diningTableRepository.save(table);
    }

    public void deleteTable(Long id) {
        diningTableRepository.deleteById(id);
    }
}
