package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
}