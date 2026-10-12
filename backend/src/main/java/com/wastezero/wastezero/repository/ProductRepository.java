package com.wastezero.wastezero.repository;

import com.wastezero.wastezero.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}