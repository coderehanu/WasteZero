package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.SupplierReturn;
import com.wastezero.wastezero.repository.SupplierReturnRepository;

@Service
public class SupplierReturnService {

    private final SupplierReturnRepository supplierReturnRepository;

    public SupplierReturnService(
            SupplierReturnRepository supplierReturnRepository) {
        this.supplierReturnRepository = supplierReturnRepository;
    }

    public List<SupplierReturn> getAllReturns() {
        return supplierReturnRepository.findAll();
    }

    public SupplierReturn getReturnById(Long id) {
        return supplierReturnRepository.findById(id).orElse(null);
    }

    public SupplierReturn saveReturn(SupplierReturn supplierReturn) {
        return supplierReturnRepository.save(supplierReturn);
    }

    public void deleteReturn(Long id) {
        supplierReturnRepository.deleteById(id);
    }
}