package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.RiskScore;
import com.wastezero.wastezero.service.RiskScoreService;

@RestController
@RequestMapping("/api/risk-scores")
public class RiskScoreController {

    private final RiskScoreService riskScoreService;

    public RiskScoreController(RiskScoreService riskScoreService) {
        this.riskScoreService = riskScoreService;
    }

    @GetMapping
    public List<RiskScore> getAllRiskScores() {
        return riskScoreService.getAllRiskScores();
    }

    @PostMapping
    public RiskScore createRiskScore(@RequestBody RiskScore riskScore) {
        return riskScoreService.saveRiskScore(riskScore);
    }

    @PostMapping("/calculate/{batchId}")
    public RiskScore calculateRisk(@PathVariable Long batchId) {
        return riskScoreService.calculateRisk(batchId);
    }

    @PostMapping("/calculate-all")
    public List<RiskScore> calculateAllRisks() {
        return riskScoreService.calculateAllRisks();
    }
}