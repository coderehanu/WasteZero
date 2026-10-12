package com.wastezero.wastezero.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_scores")
public class RiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "expiry_score", nullable = false)
    private Double expiryScore;

    @Column(name = "demand_score", nullable = false)
    private Double demandScore;

    @Column(name = "stock_score", nullable = false)
    private Double stockScore;

    @Column(name = "movement_score", nullable = false)
    private Double movementScore;

    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel;

    public RiskScore() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public Double getExpiryScore() {
        return expiryScore;
    }

    public void setExpiryScore(Double expiryScore) {
        this.expiryScore = expiryScore;
    }

    public Double getDemandScore() {
        return demandScore;
    }

    public void setDemandScore(Double demandScore) {
        this.demandScore = demandScore;
    }

    public Double getStockScore() {
        return stockScore;
    }

    public void setStockScore(Double stockScore) {
        this.stockScore = stockScore;
    }

    public Double getMovementScore() {
        return movementScore;
    }

    public void setMovementScore(Double movementScore) {
        this.movementScore = movementScore;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}