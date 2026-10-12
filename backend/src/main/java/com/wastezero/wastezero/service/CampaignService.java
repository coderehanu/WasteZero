package com.wastezero.wastezero.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wastezero.wastezero.entity.Campaign;
import com.wastezero.wastezero.repository.CampaignRepository;
import com.wastezero.wastezero.repository.BatchRepository;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final BatchRepository batchRepository;

    public CampaignService(
            CampaignRepository campaignRepository,
            BatchRepository batchRepository) {
        this.campaignRepository = campaignRepository;
        this.batchRepository = batchRepository;
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));
    }

    @Transactional
    public Campaign saveCampaign(Campaign campaign) {
        if (campaign.getBatchId() == null ||
                !batchRepository.existsById(campaign.getBatchId())) {
            throw new IllegalArgumentException("A valid batch ID is required.");
        }

        if (campaign.getCampaignName() == null ||
                campaign.getCampaignName().isBlank()) {
            throw new IllegalArgumentException("Campaign name is required.");
        }

        if (campaign.getCampaignType() == null ||
                campaign.getCampaignType().isBlank()) {
            throw new IllegalArgumentException("Campaign type is required.");
        }

        if (campaign.getStartDate() == null ||
                campaign.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }

        if (campaign.getEndDate().isBefore(campaign.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        Double discount = campaign.getDiscountPercentage();

        if (discount != null && (discount < 0 || discount > 100)) {
            throw new IllegalArgumentException(
                    "Discount percentage must be between 0 and 100.");
        }

        if (campaign.getStatus() == null || campaign.getStatus().isBlank()) {
            campaign.setStatus("DRAFT");
        }

        return campaignRepository.save(campaign);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        if (!campaignRepository.existsById(id)) {
            throw new RuntimeException("Campaign not found: " + id);
        }

        campaignRepository.deleteById(id);
    }
}