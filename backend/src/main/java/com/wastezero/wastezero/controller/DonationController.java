package com.wastezero.wastezero.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wastezero.wastezero.entity.Donation;
import com.wastezero.wastezero.service.DonationService;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @GetMapping
    public List<Donation> getAllDonations() {
        return donationService.getAllDonations();
    }

    @GetMapping("/{id}")
    public Donation getDonationById(@PathVariable Long id) {
        return donationService.getDonationById(id);
    }

    @PostMapping
    public Donation createDonation(@RequestBody Donation donation) {
        return donationService.saveDonation(donation);
    }

    @DeleteMapping("/{id}")
    public String deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return "Donation deleted successfully";
    }
}