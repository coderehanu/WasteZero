package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.Recommendation;
import com.wastezero.wastezero.service.RecommendationService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<Recommendation> getAllRecommendations() {
        return recommendationService.getAllRecommendations();
    }

    @PostMapping("/generate/{batchId}")
    public Recommendation generateRecommendation(
            @PathVariable Long batchId,
            @RequestParam String riskLevel) {

        return recommendationService.generateRecommendation(
                batchId,
                riskLevel
        );
    }
}