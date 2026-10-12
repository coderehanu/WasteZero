package com.wastezero.wastezero.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wastezero.wastezero.entity.Alert;
import com.wastezero.wastezero.repository.AlertRepository;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }
}