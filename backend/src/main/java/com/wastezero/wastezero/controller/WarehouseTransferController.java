package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.WarehouseTransfer;
import com.wastezero.wastezero.service.WarehouseTransferService;

@RestController
@RequestMapping("/api/warehouse-transfers")
public class WarehouseTransferController {

    private final WarehouseTransferService warehouseTransferService;

    public WarehouseTransferController(WarehouseTransferService warehouseTransferService) {
        this.warehouseTransferService = warehouseTransferService;
    }

    @GetMapping
    public List<WarehouseTransfer> getAllTransfers() {
        return warehouseTransferService.getAllTransfers();
    }

    @GetMapping("/{id}")
    public WarehouseTransfer getTransferById(@PathVariable Long id) {
        return warehouseTransferService.getTransferById(id);
    }

    @PostMapping
    public WarehouseTransfer createTransfer(@RequestBody WarehouseTransfer transfer) {
        return warehouseTransferService.saveTransfer(transfer);
    }

    @PutMapping("/{id}/status")
    public WarehouseTransfer updateTransferStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return warehouseTransferService.updateTransferStatus(id, status);
    }

    @PutMapping("/{id}")
    public WarehouseTransfer updateTransfer(
            @PathVariable Long id,
            @RequestBody WarehouseTransfer transfer) {
        transfer.setId(id);
        return warehouseTransferService.saveTransfer(transfer);
    }

    @DeleteMapping("/{id}")
    public String deleteTransfer(@PathVariable Long id) {
        warehouseTransferService.deleteTransfer(id);
        return "Warehouse transfer deleted successfully";
    }
}