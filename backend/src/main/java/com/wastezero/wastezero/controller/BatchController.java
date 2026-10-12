package com.wastezero.wastezero.controller;

import com.wastezero.wastezero.entity.Batch;
import com.wastezero.wastezero.service.BatchService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@CrossOrigin(origins = "http://localhost:5174")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping
    public ResponseEntity<List<Batch>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @PostMapping
    public ResponseEntity<Batch> createBatch(@RequestBody Batch batch) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(batchService.saveBatch(batch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Batch> updateBatch(
            @PathVariable Long id,
            @RequestBody Batch batch) {

        return ResponseEntity.ok(batchService.updateBatch(id, batch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }
}