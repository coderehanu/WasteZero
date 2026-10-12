
package com.wastezero.wastezero.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.service.WasteAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class WasteAnalyticsController {

    private final WasteAnalyticsService wasteAnalyticsService;

    public WasteAnalyticsController(WasteAnalyticsService wasteAnalyticsService) {
        this.wasteAnalyticsService = wasteAnalyticsService;
    }

    @GetMapping("/total-waste-value")
    public BigDecimal getTotalWasteValue() {
        return wasteAnalyticsService.getTotalWasteValue();
    }

    @GetMapping("/total-wasted-quantity")
    public Long getTotalWastedQuantity() {
        return wasteAnalyticsService.getTotalWastedQuantity();
    }

    @GetMapping("/waste-records-count")
    public Long getWasteRecordsCount() {
        return wasteAnalyticsService.getWasteRecordsCount();
    }

    @GetMapping("/average-waste-value")
    public BigDecimal getAverageWasteValue() {
        return wasteAnalyticsService.getAverageWasteValue();
    }

    @GetMapping("/waste-records-by-reason")
    public List<Object[]> getWasteRecordsByReason() {
        return wasteAnalyticsService.getWasteRecordsByReason();
    }

    @GetMapping("/waste-value-by-reason")
    public List<Object[]> getWasteValueByReason() {
        return wasteAnalyticsService.getWasteValueByReason();
    }
}
