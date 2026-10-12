
package com.wastezero.wastezero.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "waste_prevention_savings")
public class WastePreventionSaving {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "quantity_saved", nullable = false)
    private Integer quantitySaved;

    @Column(name = "value_saved", nullable = false, precision = 12, scale = 2)
    private BigDecimal valueSaved;

    @Column(name = "prevention_action", nullable = false)
    private String preventionAction;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    public WastePreventionSaving() {
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

    public Integer getQuantitySaved() {
        return quantitySaved;
    }

    public void setQuantitySaved(Integer quantitySaved) {
        this.quantitySaved = quantitySaved;
    }

    public BigDecimal getValueSaved() {
        return valueSaved;
    }

    public void setValueSaved(BigDecimal valueSaved) {
        this.valueSaved = valueSaved;
    }

    public String getPreventionAction() {
        return preventionAction;
    }

    public void setPreventionAction(String preventionAction) {
        this.preventionAction = preventionAction;
    }

    public LocalDate getRecordedDate() {
        return recordedDate;
    }

    public void setRecordedDate(LocalDate recordedDate) {
        this.recordedDate = recordedDate;
    }
}
