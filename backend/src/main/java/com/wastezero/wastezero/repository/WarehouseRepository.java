package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
}