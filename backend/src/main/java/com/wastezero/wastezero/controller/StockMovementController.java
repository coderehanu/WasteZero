package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.StockMovement;
import com.wastezero.wastezero.service.StockMovementService;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public List<StockMovement> getAllMovements() {
        return stockMovementService.getAllMovements();
    }

    @GetMapping("/{id}")
    public StockMovement getMovementById(@PathVariable Long id) {
        return stockMovementService.getMovementById(id);
    }

    @PostMapping
    public StockMovement createMovement(@RequestBody StockMovement movement) {
        return stockMovementService.saveMovement(movement);
    }

    @DeleteMapping("/{id}")
    public String deleteMovement(@PathVariable Long id) {
        stockMovementService.deleteMovement(id);
        return "Stock movement deleted successfully";
    }
}