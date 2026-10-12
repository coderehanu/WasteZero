package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
}