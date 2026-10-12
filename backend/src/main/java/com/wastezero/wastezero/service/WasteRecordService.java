
package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.WasteRecord;
import com.wastezero.wastezero.repository.WasteRecordRepository;

@Service
public class WasteRecordService {

    private final WasteRecordRepository wasteRecordRepository;

    public WasteRecordService(WasteRecordRepository wasteRecordRepository) {
        this.wasteRecordRepository = wasteRecordRepository;
    }

    public List<WasteRecord> getAllWasteRecords() {
        return wasteRecordRepository.findAll();
    }

    public WasteRecord getWasteRecordById(Long id) {
        return wasteRecordRepository.findById(id).orElse(null);
    }

    public WasteRecord saveWasteRecord(WasteRecord wasteRecord) {
        return wasteRecordRepository.save(wasteRecord);
    }

    public void deleteWasteRecord(Long id) {
        wasteRecordRepository.deleteById(id);
    }
}
