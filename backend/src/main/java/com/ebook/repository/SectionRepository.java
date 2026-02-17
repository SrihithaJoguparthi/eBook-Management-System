package com.ebook.repository;

import com.ebook.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByEbookId(Long ebookId);
    List<Section> findByEbookIdOrderBySectionOrderAsc(Long ebookId);
}