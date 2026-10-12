
package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.WasteRecord;
import com.wastezero.wastezero.service.WasteRecordService;

@RestController
@RequestMapping("/api/waste-records")
public class WasteRecordController {

    private final WasteRecordService wasteRecordService;

    public WasteRecordController(WasteRecordService wasteRecordService) {
        this.wasteRecordService = wasteRecordService;
    }

    @GetMapping
    public List<WasteRecord> getAllWasteRecords() {
        return wasteRecordService.getAllWasteRecords();
    }

    @GetMapping("/{id}")
    public WasteRecord getWasteRecordById(@PathVariable Long id) {
        return wasteRecordService.getWasteRecordById(id);
    }

    @PostMapping
    public WasteRecord createWasteRecord(@RequestBody WasteRecord wasteRecord) {
        return wasteRecordService.saveWasteRecord(wasteRecord);
    }

    @DeleteMapping("/{id}")
    public String deleteWasteRecord(@PathVariable Long id) {
        wasteRecordService.deleteWasteRecord(id);
        return "Waste record deleted successfully";
    }
}
