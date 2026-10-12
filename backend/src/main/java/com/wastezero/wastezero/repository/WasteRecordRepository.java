
package com.wastezero.wastezero.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.wastezero.wastezero.entity.WasteRecord;

public interface WasteRecordRepository extends JpaRepository<WasteRecord, Long> {

    @Query("SELECT COALESCE(SUM(w.totalValue), 0) FROM WasteRecord w")
    BigDecimal calculateTotalWasteValue();

    @Query("SELECT COALESCE(SUM(w.quantityWasted), 0) FROM WasteRecord w")
    Long calculateTotalWastedQuantity();

    @Query("SELECT COUNT(w) FROM WasteRecord w")
    Long countWasteRecords();

    @Query("SELECT COALESCE(AVG(w.totalValue), 0) FROM WasteRecord w")
    BigDecimal calculateAverageWasteValue();

    @Query("SELECT w.wasteReason, COUNT(w) FROM WasteRecord w GROUP BY w.wasteReason")
    List<Object[]> countWasteRecordsByReason();

    @Query("SELECT w.wasteReason, COALESCE(SUM(w.totalValue), 0) FROM WasteRecord w GROUP BY w.wasteReason")
    List<Object[]> calculateWasteValueByReason();
}
