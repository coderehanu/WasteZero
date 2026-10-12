
package com.wastezero.wastezero.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.WastePreventionSaving;
import com.wastezero.wastezero.service.WastePreventionSavingService;

@RestController
@RequestMapping("/api/waste-prevention-savings")
public class WastePreventionSavingController {

    private final WastePreventionSavingService service;

    public WastePreventionSavingController(
            WastePreventionSavingService service) {
        this.service = service;
    }

    @GetMapping
    public List<WastePreventionSaving> getAllSavings() {
        return service.getAllSavings();
    }

    @GetMapping("/{id}")
    public WastePreventionSaving getSavingById(
            @PathVariable Long id) {
        return service.getSavingById(id);
    }

    @PostMapping
    public WastePreventionSaving createSaving(
            @RequestBody WastePreventionSaving saving) {
        return service.createSaving(saving);
    }

    @PutMapping("/{id}")
    public WastePreventionSaving updateSaving(
            @PathVariable Long id,
            @RequestBody WastePreventionSaving saving) {
        return service.updateSaving(id, saving);
    }

    @DeleteMapping("/{id}")
    public String deleteSaving(@PathVariable Long id) {
        service.deleteSaving(id);
        return "Waste prevention saving deleted successfully";
    }

    @GetMapping("/total-value-saved")
    public BigDecimal getTotalValueSaved() {
        return service.getTotalValueSaved();
    }

    @GetMapping("/total-quantity-saved")
    public Long getTotalQuantitySaved() {
        return service.getTotalQuantitySaved();
    }

    @GetMapping("/records-count")
    public Long getSavingsRecordsCount() {
        return service.getSavingsRecordsCount();
    }

    @GetMapping("/average-value-saved")
    public BigDecimal getAverageValueSaved() {
        return service.getAverageValueSaved();
    }

    @GetMapping("/value-saved-by-action")
    public List<Object[]> getValueSavedByAction() {
        return service.getValueSavedByAction();
    }

    @GetMapping("/quantity-saved-by-action")
    public List<Object[]> getQuantitySavedByAction() {
        return service.getQuantitySavedByAction();
    }
}
