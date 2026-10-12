
package com.wastezero.wastezero.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.wastezero.wastezero.entity.WastePreventionSaving;

public interface WastePreventionSavingRepository
        extends JpaRepository<WastePreventionSaving, Long> {

    @Query("SELECT COALESCE(SUM(w.valueSaved), 0) FROM WastePreventionSaving w")
    BigDecimal calculateTotalValueSaved();

    @Query("SELECT COALESCE(SUM(w.quantitySaved), 0) FROM WastePreventionSaving w")
    Long calculateTotalQuantitySaved();

    @Query("SELECT COUNT(w) FROM WastePreventionSaving w")
    Long countSavingsRecords();

    @Query("SELECT COALESCE(AVG(w.valueSaved), 0) FROM WastePreventionSaving w")
    BigDecimal calculateAverageValueSaved();

    @Query("SELECT w.preventionAction, COALESCE(SUM(w.valueSaved), 0) "
            + "FROM WastePreventionSaving w GROUP BY w.preventionAction")
    List<Object[]> calculateValueSavedByAction();

    @Query("SELECT w.preventionAction, COALESCE(SUM(w.quantitySaved), 0) "
            + "FROM WastePreventionSaving w GROUP BY w.preventionAction")
    List<Object[]> calculateQuantitySavedByAction();
}
