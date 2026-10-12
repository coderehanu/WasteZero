package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.Campaign;
import com.wastezero.wastezero.service.CampaignService;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignService.getAllCampaigns();
    }

    @GetMapping("/{id}")
    public Campaign getCampaignById(@PathVariable Long id) {
        return campaignService.getCampaignById(id);
    }

    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign) {
        return campaignService.saveCampaign(campaign);
    }

    @PutMapping("/{id}")
    public Campaign updateCampaign(
            @PathVariable Long id,
            @RequestBody Campaign campaign) {
        Campaign existing = campaignService.getCampaignById(id);

        existing.setBatchId(campaign.getBatchId());
        existing.setCampaignName(campaign.getCampaignName());
        existing.setCampaignType(campaign.getCampaignType());
        existing.setDiscountPercentage(campaign.getDiscountPercentage());
        existing.setStartDate(campaign.getStartDate());
        existing.setEndDate(campaign.getEndDate());
        existing.setStatus(campaign.getStatus());

        return campaignService.saveCampaign(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return "Campaign deleted successfully";
    }
}