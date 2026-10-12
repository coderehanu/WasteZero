package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.WarehouseTransfer;
import com.wastezero.wastezero.repository.WarehouseTransferRepository;

@Service
public class WarehouseTransferService {

    private final WarehouseTransferRepository warehouseTransferRepository;

    public WarehouseTransferService(WarehouseTransferRepository warehouseTransferRepository) {
        this.warehouseTransferRepository = warehouseTransferRepository;
    }

    public List<WarehouseTransfer> getAllTransfers() {
        return warehouseTransferRepository.findAll();
    }

    public WarehouseTransfer getTransferById(Long id) {
        return warehouseTransferRepository.findById(id).orElse(null);
    }

    public WarehouseTransfer saveTransfer(WarehouseTransfer transfer) {
        return warehouseTransferRepository.save(transfer);
    }

    public WarehouseTransfer updateTransferStatus(Long id, String status) {
        WarehouseTransfer transfer = warehouseTransferRepository.findById(id).orElse(null);
        if (transfer != null) {
            transfer.setStatus(status);
            return warehouseTransferRepository.save(transfer);
        }
        return null;
    }

    public void deleteTransfer(Long id) {
        warehouseTransferRepository.deleteById(id);
    }
}