package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {
}