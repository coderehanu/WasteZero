package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {
}