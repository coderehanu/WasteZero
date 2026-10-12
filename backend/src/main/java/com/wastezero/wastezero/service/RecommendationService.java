package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.Recommendation;
import com.wastezero.wastezero.repository.RecommendationRepository;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    public RecommendationService(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }

    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    public Recommendation saveRecommendation(Recommendation recommendation) {
        return recommendationRepository.save(recommendation);
    }

    public Recommendation generateRecommendation(
            Long batchId,
            String riskLevel) {

        Recommendation recommendation = new Recommendation();

        recommendation.setBatchId(batchId);
        recommendation.setRiskLevel(riskLevel);
        recommendation.setStatus("PENDING");

        if ("CRITICAL".equalsIgnoreCase(riskLevel)) {

            recommendation.setRecommendationType("CLEARANCE");
            recommendation.setRecommendationMessage(
                    "Launch immediate clearance offer and priority dispatch for this batch.");

        } else if ("HIGH".equalsIgnoreCase(riskLevel)) {

            recommendation.setRecommendationType("SPECIAL_OFFER");
            recommendation.setRecommendationMessage(
                    "Create a special offer or discount campaign to accelerate stock movement.");

        } else if ("MEDIUM".equalsIgnoreCase(riskLevel)) {

            recommendation.setRecommendationType("PRIORITY_DISPATCH");
            recommendation.setRecommendationMessage(
                    "Prioritize this batch for dispatch before newer stock.");

        } else {

            recommendation.setRecommendationType("MONITOR");
            recommendation.setRecommendationMessage(
                    "Continue monitoring stock movement and expiry status.");
        }

        return recommendationRepository.save(recommendation);
    }
}