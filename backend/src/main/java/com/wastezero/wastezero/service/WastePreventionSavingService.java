
package com.wastezero.wastezero.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.WastePreventionSaving;
import com.wastezero.wastezero.repository.WastePreventionSavingRepository;

@Service
public class WastePreventionSavingService {

    private final WastePreventionSavingRepository repository;

    public WastePreventionSavingService(
            WastePreventionSavingRepository repository) {
        this.repository = repository;
    }

    public List<WastePreventionSaving> getAllSavings() {
        return repository.findAll();
    }

    public WastePreventionSaving getSavingById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Waste prevention saving not found: " + id));
    }

    public WastePreventionSaving createSaving(
            WastePreventionSaving saving) {
        return repository.save(saving);
    }

    public WastePreventionSaving updateSaving(
            Long id, WastePreventionSaving saving) {
        WastePreventionSaving existing = getSavingById(id);

        existing.setBatchId(saving.getBatchId());
        existing.setQuantitySaved(saving.getQuantitySaved());
        existing.setValueSaved(saving.getValueSaved());
        existing.setPreventionAction(saving.getPreventionAction());
        existing.setRecordedDate(saving.getRecordedDate());

        return repository.save(existing);
    }

    public void deleteSaving(Long id) {
        WastePreventionSaving existing = getSavingById(id);
        repository.delete(existing);
    }

    public BigDecimal getTotalValueSaved() {
        return repository.calculateTotalValueSaved();
    }

    public Long getTotalQuantitySaved() {
        return repository.calculateTotalQuantitySaved();
    }

    public Long getSavingsRecordsCount() {
        return repository.countSavingsRecords();
    }

    public BigDecimal getAverageValueSaved() {
        return repository.calculateAverageValueSaved();
    }

    public List<Object[]> getValueSavedByAction() {
        return repository.calculateValueSavedByAction();
    }

    public List<Object[]> getQuantitySavedByAction() {
        return repository.calculateQuantitySavedByAction();
    }
}
