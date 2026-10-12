package com.wastezero.wastezero.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.Batch;
import com.wastezero.wastezero.entity.RiskScore;
import com.wastezero.wastezero.repository.BatchRepository;
import com.wastezero.wastezero.repository.RiskScoreRepository;

@Service
public class RiskScoreService {

    private final RiskScoreRepository riskScoreRepository;
    private final BatchRepository batchRepository;

    public RiskScoreService(
            RiskScoreRepository riskScoreRepository,
            BatchRepository batchRepository) {
        this.riskScoreRepository = riskScoreRepository;
        this.batchRepository = batchRepository;
    }

    public List<RiskScore> getAllRiskScores() {
        return riskScoreRepository.findAll();
    }

    public RiskScore saveRiskScore(RiskScore riskScore) {
        return riskScoreRepository.save(riskScore);
    }

    public List<RiskScore> calculateAllRisks() {
        List<Batch> allBatches = batchRepository.findAll();
        List<RiskScore> results = new java.util.ArrayList<>();
        for (Batch batch : allBatches) {
            RiskScore score = calculateRisk(batch.getId());
            if (score != null) {
                results.add(score);
            }
        }
        return results;
    }

    public RiskScore calculateRisk(Long batchId) {

        Batch batch = batchRepository.findById(batchId).orElse(null);

        if (batch == null) {
            return null;
        }

        long daysToExpiry = ChronoUnit.DAYS.between(
                LocalDate.now(),
                batch.getExpiryDate()
        );

        double expiryScore;

        if (daysToExpiry <= 7) {
            expiryScore = 100;
        } else if (daysToExpiry <= 15) {
            expiryScore = 80;
        } else if (daysToExpiry <= 30) {
            expiryScore = 60;
        } else if (daysToExpiry <= 60) {
            expiryScore = 40;
        } else {
            expiryScore = 20;
        }

        double stockScore;

        if (batch.getQuantity() >= 1000) {
            stockScore = 100;
        } else if (batch.getQuantity() >= 500) {
            stockScore = 75;
        } else if (batch.getQuantity() >= 200) {
            stockScore = 50;
        } else {
            stockScore = 25;
        }

        double demandScore = 50;

        double movementScore = 50;

        double riskScore =
                (expiryScore * 0.40)
                + (demandScore * 0.25)
                + (stockScore * 0.20)
                + (movementScore * 0.15);

        String riskLevel;

        if (riskScore >= 80) {
            riskLevel = "CRITICAL";
        } else if (riskScore >= 60) {
            riskLevel = "HIGH";
        } else if (riskScore >= 40) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        RiskScore result = new RiskScore();

        result.setBatchId(batchId);
        result.setExpiryScore(expiryScore);
        result.setDemandScore(demandScore);
        result.setStockScore(stockScore);
        result.setMovementScore(movementScore);
        result.setRiskScore(riskScore);
        result.setRiskLevel(riskLevel);

        return riskScoreRepository.save(result);
    }
}