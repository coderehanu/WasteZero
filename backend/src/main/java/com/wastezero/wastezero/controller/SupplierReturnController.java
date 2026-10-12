package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.SupplierReturn;
import com.wastezero.wastezero.service.SupplierReturnService;

@RestController
@RequestMapping("/api/supplier-returns")
public class SupplierReturnController {

    private final SupplierReturnService supplierReturnService;

    public SupplierReturnController(
            SupplierReturnService supplierReturnService) {
        this.supplierReturnService = supplierReturnService;
    }

    @GetMapping
    public List<SupplierReturn> getAllReturns() {
        return supplierReturnService.getAllReturns();
    }

    @GetMapping("/{id}")
    public SupplierReturn getReturnById(@PathVariable Long id) {
        return supplierReturnService.getReturnById(id);
    }

    @PostMapping
    public SupplierReturn createReturn(
            @RequestBody SupplierReturn supplierReturn) {
        return supplierReturnService.saveReturn(supplierReturn);
    }

    @DeleteMapping("/{id}")
    public String deleteReturn(@PathVariable Long id) {
        supplierReturnService.deleteReturn(id);
        return "Supplier return deleted successfully";
    }
}