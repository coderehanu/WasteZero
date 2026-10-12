package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.Batch;
import com.wastezero.wastezero.repository.BatchRepository;

@Service
public class BatchService {

    private final BatchRepository batchRepository;

    public BatchService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public Batch getBatchById(Long id) {
        return batchRepository.findById(id).orElse(null);
    }

    public Batch saveBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    public Batch updateBatch(Long id, Batch updatedBatch) {
        Batch existingBatch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Batch not found with ID: " + id));

        existingBatch.setProductId(updatedBatch.getProductId());
        existingBatch.setWarehouseId(updatedBatch.getWarehouseId());
        existingBatch.setBatchNumber(updatedBatch.getBatchNumber());
        existingBatch.setQuantity(updatedBatch.getQuantity());
        existingBatch.setReceivedDate(updatedBatch.getReceivedDate());
        existingBatch.setExpiryDate(updatedBatch.getExpiryDate());

        return batchRepository.save(existingBatch);
    }

    public void deleteBatch(Long id) {
        batchRepository.deleteById(id);
    }
}