package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.StockMovement;
import com.wastezero.wastezero.repository.StockMovementRepository;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    public StockMovementService(StockMovementRepository stockMovementRepository) {
        this.stockMovementRepository = stockMovementRepository;
    }

    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAll();
    }

    public StockMovement getMovementById(Long id) {
        return stockMovementRepository.findById(id).orElse(null);
    }

    public StockMovement saveMovement(StockMovement movement) {
        return stockMovementRepository.save(movement);
    }

    public void deleteMovement(Long id) {
        stockMovementRepository.deleteById(id);
    }
}