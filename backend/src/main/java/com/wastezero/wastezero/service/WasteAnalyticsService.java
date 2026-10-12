
package com.wastezero.wastezero.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.repository.WasteRecordRepository;

@Service
public class WasteAnalyticsService {

    private final WasteRecordRepository wasteRecordRepository;

    public WasteAnalyticsService(WasteRecordRepository wasteRecordRepository) {
        this.wasteRecordRepository = wasteRecordRepository;
    }

    public BigDecimal getTotalWasteValue() {
        return wasteRecordRepository.calculateTotalWasteValue();
    }

    public Long getTotalWastedQuantity() {
        return wasteRecordRepository.calculateTotalWastedQuantity();
    }

    public Long getWasteRecordsCount() {
        return wasteRecordRepository.countWasteRecords();
    }

    public BigDecimal getAverageWasteValue() {
        return wasteRecordRepository.calculateAverageWasteValue();
    }

    public List<Object[]> getWasteRecordsByReason() {
        return wasteRecordRepository.countWasteRecordsByReason();
    }

    public List<Object[]> getWasteValueByReason() {
        return wasteRecordRepository.calculateWasteValueByReason();
    }
}
